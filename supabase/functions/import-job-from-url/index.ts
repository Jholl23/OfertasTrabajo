import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type ImportRequest = {
  url?: string;
};

type NormalizedJobOffer = {
  external_offer_id: string | null;
  company: string | null;
  job_title: string | null;
  job_functions: string | null;
  description: string | null;
  salary_raw: string | null;
  date_found: string | null;
  closing_date: string | null;
  url: string;
  source_site: string | null;
  offer_status: "new";
  import_confidence: number;
};

type ExtractionContext = {
  title: string | null;
  meta: Record<string, string>;
  openGraph: Record<string, string>;
  jsonLd: unknown[];
  visibleText: string;
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

const textDecoder = new TextDecoder();

const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").replace(/[\u0000-\u001F\u007F]/g, " ").trim();

const stripHtml = (html: string): string =>
  normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  );

const parseTitle = (html: string): string | null => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  const normalized = normalizeWhitespace(stripHtml(match[1]));
  return normalized.length > 0 ? normalized : null;
};

const parseMetaTags = (html: string): Record<string, string> => {
  const metaMap: Record<string, string> = {};
  const metaRegex = /<meta\s+[^>]*>/gi;

  for (const tag of html.match(metaRegex) ?? []) {
    const attrs = [...tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(["'])(.*?)\2/g)];
    if (attrs.length === 0) continue;

    const attributes = attrs.reduce<Record<string, string>>((acc, attr) => {
      acc[attr[1].toLowerCase()] = normalizeWhitespace(attr[3]);
      return acc;
    }, {});

    const key = attributes.name ?? attributes.property ?? attributes["http-equiv"];
    const content = attributes.content;

    if (!key || !content) continue;
    metaMap[key.toLowerCase()] = content;
  }

  return metaMap;
};

const parseJsonLd = (html: string): unknown[] => {
  const results: unknown[] = [];
  const regex = /<script[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(regex)) {
    const raw = normalizeWhitespace(match[2]);
    if (!raw) continue;

    try {
      results.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return results;
};

const parseIsoDate = (value: string | null): string | null => {
  if (!value) return null;

  const isoLike = value.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoLike) return isoLike[0];

  const maybeDate = new Date(value);
  if (Number.isNaN(maybeDate.getTime())) return null;

  return maybeDate.toISOString().slice(0, 10);
};

const getDomain = (url: URL): string => {
  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
};

const pickFirst = (...candidates: Array<string | null | undefined>): string | null => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeWhitespace(candidate);
    if (normalized) return normalized;
  }

  return null;
};

const collectJsonLdObjects = (jsonLdEntries: unknown[]): Record<string, unknown>[] => {
  const stack = [...jsonLdEntries];
  const objects: Record<string, unknown>[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    if (typeof current === "object") {
      const object = current as Record<string, unknown>;
      objects.push(object);

      const graph = object["@graph"];
      if (Array.isArray(graph)) stack.push(...graph);
    }
  }

  return objects;
};

const findJsonLdJobPosting = (jsonLdEntries: unknown[]): Record<string, unknown> | null => {
  const objects = collectJsonLdObjects(jsonLdEntries);

  for (const object of objects) {
    const type = object["@type"];
    const types = Array.isArray(type) ? type : [type];
    const isJobPosting = types.some((entry) =>
      typeof entry === "string" && entry.toLowerCase() === "jobposting"
    );

    if (isJobPosting) return object;
  }

  return null;
};

const inferSalary = (context: ExtractionContext, jobPosting: Record<string, unknown> | null): string | null => {
  const fromJsonLd = typeof jobPosting?.baseSalary === "string" ? jobPosting.baseSalary : null;
  if (fromJsonLd) return normalizeWhitespace(fromJsonLd);

  const metaSalary = pickFirst(
    context.meta["job:salary"],
    context.meta["salary"],
    context.meta["twitter:data1"]
  );
  if (metaSalary) return metaSalary;

  const salaryRegex = /(?:\$|€|£|USD|EUR|GBP)\s?\d[\d,.]*(?:\s?[-–to]{1,3}\s?(?:\$|€|£)?\s?\d[\d,.]*)?/i;
  const textMatch = context.visibleText.match(salaryRegex);
  return textMatch ? normalizeWhitespace(textMatch[0]) : null;
};

const inferJobFunctions = (
  context: ExtractionContext,
  jobPosting: Record<string, unknown> | null
): string | null => {
  const fromMeta = pickFirst(context.meta["job:function"], context.meta["job:category"]);
  if (fromMeta) return fromMeta;

  const employmentType = jobPosting?.employmentType;
  if (typeof employmentType === "string") return normalizeWhitespace(employmentType);
  if (Array.isArray(employmentType)) {
    return normalizeWhitespace(
      employmentType.filter((item) => typeof item === "string").join(", ")
    );
  }

  return null;
};

const inferDescription = (
  context: ExtractionContext,
  jobPosting: Record<string, unknown> | null
): string | null => {
  const fromSources = pickFirst(
    typeof jobPosting?.description === "string" ? stripHtml(jobPosting.description) : null,
    context.meta.description,
    context.meta["og:description"],
    context.meta["twitter:description"]
  );

  if (fromSources) return fromSources;

  if (!context.visibleText) return null;
  return context.visibleText.slice(0, 800);
};

const inferCompany = (
  context: ExtractionContext,
  jobPosting: Record<string, unknown> | null
): string | null => {
  const hiringOrganization = jobPosting?.hiringOrganization;
  if (hiringOrganization && typeof hiringOrganization === "object") {
    const name = (hiringOrganization as Record<string, unknown>).name;
    if (typeof name === "string") return normalizeWhitespace(name);
  }

  return pickFirst(
    context.meta["og:site_name"],
    context.meta["company"],
    context.meta["author"]
  );
};

const inferExternalOfferId = (url: URL, jobPosting: Record<string, unknown> | null): string | null => {
  const identifier = jobPosting?.identifier;
  if (identifier && typeof identifier === "object") {
    const value = (identifier as Record<string, unknown>).value;
    if (typeof value === "string") return normalizeWhitespace(value);
  }

  const idFromQuery = url.searchParams.get("jk") ?? url.searchParams.get("jobId") ?? url.searchParams.get("id");
  if (idFromQuery) return normalizeWhitespace(idFromQuery);

  const slug = url.pathname.split("/").filter(Boolean).pop();
  if (slug && slug.length >= 6) return normalizeWhitespace(slug);

  return null;
};

const buildExtractionContext = (html: string): ExtractionContext => {
  const title = parseTitle(html);
  const meta = parseMetaTags(html);
  const openGraph = Object.fromEntries(
    Object.entries(meta).filter(([key]) => key.startsWith("og:"))
  );
  const jsonLd = parseJsonLd(html);
  const visibleText = stripHtml(html).slice(0, 4000);

  return {
    title,
    meta,
    openGraph,
    jsonLd,
    visibleText,
  };
};

const inferConfidence = (offer: NormalizedJobOffer): number => {
  const weightedFields: Array<[keyof NormalizedJobOffer, number]> = [
    ["job_title", 0.2],
    ["company", 0.15],
    ["description", 0.15],
    ["salary_raw", 0.1],
    ["external_offer_id", 0.1],
    ["date_found", 0.1],
    ["closing_date", 0.1],
    ["job_functions", 0.1],
  ];

  const score = weightedFields.reduce((sum, [field, weight]) => {
    return offer[field] ? sum + weight : sum;
  }, 0);

  return Number(Math.max(0.1, Math.min(0.99, score + 0.05)).toFixed(2));
};

const normalizeOffer = (inputUrl: string, context: ExtractionContext): NormalizedJobOffer => {
  const parsedUrl = new URL(inputUrl);
  const sourceSite = getDomain(parsedUrl);
  const jobPosting = findJsonLdJobPosting(context.jsonLd);

  const titleFromJsonLd =
    jobPosting && typeof jobPosting.title === "string" ? jobPosting.title : null;

  const dateFound = parseIsoDate(
    pickFirst(
      typeof jobPosting?.datePosted === "string" ? jobPosting.datePosted : null,
      context.meta["article:published_time"],
      context.meta["date"]
    )
  );

  const closingDate = parseIsoDate(
    pickFirst(
      typeof jobPosting?.validThrough === "string" ? jobPosting.validThrough : null,
      context.meta["job:expiration_date"],
      context.meta["expires"]
    )
  );

  const normalized: NormalizedJobOffer = {
    external_offer_id: inferExternalOfferId(parsedUrl, jobPosting),
    company: inferCompany(context, jobPosting),
    job_title: pickFirst(
      titleFromJsonLd,
      context.meta["og:title"],
      context.meta["twitter:title"],
      context.title
    ),
    job_functions: inferJobFunctions(context, jobPosting),
    description: inferDescription(context, jobPosting),
    salary_raw: inferSalary(context, jobPosting),
    date_found: dateFound,
    closing_date: closingDate,
    url: parsedUrl.toString(),
    source_site: sourceSite,
    offer_status: "new",
    import_confidence: 0,
  };

  normalized.import_confidence = inferConfidence(normalized);

  return normalized;
};

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      { status: 405, headers: jsonHeaders }
    );
  }

  let payload: ImportRequest;
  try {
    payload = (await req.json()) as ImportRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      { status: 400, headers: jsonHeaders }
    );
  }

  const url = payload.url ? normalizeWhitespace(payload.url) : "";
  if (!url) {
    return new Response(
      JSON.stringify({ error: "Missing required field: url" }),
      { status: 400, headers: jsonHeaders }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid URL" }),
      { status: 400, headers: jsonHeaders }
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return new Response(
      JSON.stringify({ error: "Only HTTP(S) URLs are supported" }),
      { status: 400, headers: jsonHeaders }
    );
  }

  try {
    const upstream = await fetch(parsedUrl.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": "supabase-edge-function-import-job-from-url/1.0",
      },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch URL (status ${upstream.status})`,
        }),
        { status: 502, headers: jsonHeaders }
      );
    }

    const html = textDecoder.decode(await upstream.arrayBuffer());
    const context = buildExtractionContext(html);
    const normalized = normalizeOffer(parsedUrl.toString(), context);

    return new Response(
      JSON.stringify({
        data: normalized,
        requires_review: true,
        note:
          "This function only extracts and normalizes fields. Frontend review is required before persisting.",
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error during import",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
