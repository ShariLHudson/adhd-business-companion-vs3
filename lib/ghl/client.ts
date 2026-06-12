// Server-only GoHighLevel API client (Private Integration Token).

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export type GhlClientConfig = {
  token: string;
  locationId: string;
  payingTag?: string;
  trialTag?: string;
};

export function ghlClientConfigFromEnv(): GhlClientConfig | null {
  const token =
    process.env.GHL_API_TOKEN?.trim() ||
    process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim() ||
    "";
  const locationId = process.env.GHL_LOCATION_ID?.trim() || "";
  if (!token || !locationId) return null;
  return {
    token,
    locationId,
    payingTag: process.env.GHL_PAYING_TAG?.trim() || "paying",
    trialTag: process.env.GHL_TRIAL_TAG?.trim() || "trial",
  };
}

export function ghlApiConfigured(): boolean {
  return ghlClientConfigFromEnv() !== null;
}

type GhlJson = Record<string, unknown>;

export async function ghlRequest<T = GhlJson>(
  config: GhlClientConfig,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${GHL_BASE}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${config.token}`);
  headers.set("Version", GHL_VERSION);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GHL ${res.status}: ${text.slice(0, 240) || res.statusText}`);
  }
  return (await res.json()) as T;
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function periodStartIso(period: "7d" | "30d" | "90d"): string {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function searchContactCount(
  config: GhlClientConfig,
  filters: GhlJson[] = [],
): Promise<number> {
  const body = {
    locationId: config.locationId,
    page: 1,
    pageLimit: 1,
    filters,
  };
  const data = await ghlRequest<GhlJson>(config, "/contacts/search", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return (
    readNumber(data.total) ||
    readNumber(data.count) ||
    readNumber((data.meta as GhlJson | undefined)?.total) ||
    (Array.isArray(data.contacts) ? data.contacts.length : 0)
  );
}

async function searchContactsByTag(
  config: GhlClientConfig,
  tag: string,
): Promise<number> {
  return searchContactCount(config, [
    {
      field: "tags",
      operator: "contains",
      value: tag,
    },
  ]);
}

type OpportunityRow = {
  status?: string;
  monetaryValue?: number;
  dateAdded?: string;
};

async function fetchOpportunities(
  config: GhlClientConfig,
): Promise<OpportunityRow[]> {
  const params = new URLSearchParams({
    location_id: config.locationId,
    limit: "100",
  });
  const data = await ghlRequest<GhlJson>(
    config,
    `/opportunities/search?${params.toString()}`,
  );
  const list =
    (Array.isArray(data.opportunities) && data.opportunities) ||
    (Array.isArray(data.data) && data.data) ||
    [];
  return list as OpportunityRow[];
}

export type GhlFetchedMetrics = {
  totalContacts: number;
  newContacts: number;
  openOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  pipelineValue: number;
  conversionRate: number;
  payingSubscribers: number;
  trialSubscribers: number;
};

export async function fetchGhlMetrics(
  config: GhlClientConfig,
  period: "7d" | "30d" | "90d" = "30d",
): Promise<GhlFetchedMetrics> {
  const since = periodStartIso(period);
  const [totalContacts, newContacts, payingSubscribers, trialSubscribers, opportunities] =
    await Promise.all([
      searchContactCount(config),
      searchContactCount(config, [
        {
          field: "dateAdded",
          operator: "range",
          value: { gte: since },
        },
      ]),
      searchContactsByTag(config, config.payingTag ?? "paying"),
      searchContactsByTag(config, config.trialTag ?? "trial"),
      fetchOpportunities(config),
    ]);

  let openOpportunities = 0;
  let wonOpportunities = 0;
  let lostOpportunities = 0;
  let pipelineValue = 0;

  for (const row of opportunities) {
    const status = String(row.status ?? "open").toLowerCase();
    const value = readNumber(row.monetaryValue);
    if (status.includes("won") || status === "closed_won") {
      wonOpportunities += 1;
    } else if (status.includes("lost") || status === "closed_lost") {
      lostOpportunities += 1;
    } else {
      openOpportunities += 1;
      pipelineValue += value;
    }
  }

  const closed = wonOpportunities + lostOpportunities;
  const conversionRate =
    closed > 0 ? Math.round((wonOpportunities / closed) * 100) : 0;

  return {
    totalContacts,
    newContacts,
    openOpportunities,
    wonOpportunities,
    lostOpportunities,
    pipelineValue,
    conversionRate,
    payingSubscribers,
    trialSubscribers,
  };
}
