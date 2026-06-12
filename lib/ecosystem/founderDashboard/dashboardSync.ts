// Founder Ecosystem — Phase 7 external data sync.
// Pluggable connectors that fill the EXTERNAL KPIs (revenue, leads, conversion,
// engagement) the event stream can't produce. Same adapter pattern as the
// event/action sinks: a default no-op, a sample provider for demos, and a GHL
// connector that delegates the actual network call to a host-injected fetcher
// — so NO credentials or HTTP live in this pure library.

import type { Kpi, TimePeriod } from "./dashboardTypes";
import type { FounderDashboard } from "./dashboardTypes";

export type ExternalKpiValue = {
  key: string; // matches Kpi.key, e.g. "revenue"
  value: number;
  previous?: number;
  target?: number;
};

export interface DashboardSyncConnector {
  readonly id: string;
  fetchKpis(period: TimePeriod, now?: Date): Promise<ExternalKpiValue[]>;
}

/** Default: no external data. External KPIs stay as "needs sync" placeholders. */
export class NullSyncConnector implements DashboardSyncConnector {
  readonly id = "null";
  async fetchKpis(): Promise<ExternalKpiValue[]> {
    return [];
  }
}

/** Demo data so the dashboard looks alive without a real integration. */
export class SampleSyncConnector implements DashboardSyncConnector {
  readonly id = "sample";
  async fetchKpis(period: TimePeriod): Promise<ExternalKpiValue[]> {
    const scale = period === "today" ? 1 : period === "7d" ? 5 : period === "30d" ? 20 : 60;
    return [
      { key: "revenue", value: 250 * scale, previous: 200 * scale, target: 300 * scale },
      { key: "leads", value: 8 * scale, previous: 6 * scale, target: 10 * scale },
      { key: "conversion", value: 12, previous: 10, target: 15 },
      { key: "engagement", value: 40 * scale, previous: 35 * scale },
    ];
  }
}

/**
 * GoHighLevel connector. The host app injects a `fetcher` that performs the
 * authenticated request (its API key lives in the app's server env — never
 * here) and returns raw rows; this connector only maps them to KPI values.
 */
export type GhlFetcher = (
  period: TimePeriod,
  now?: Date,
) => Promise<Partial<Record<string, number>>[]>;

export class GhlSyncConnector implements DashboardSyncConnector {
  readonly id = "ghl";
  constructor(private fetcher: GhlFetcher) {}
  async fetchKpis(period: TimePeriod, now?: Date): Promise<ExternalKpiValue[]> {
    const rows = await this.fetcher(period, now);
    const r = rows[0] ?? {};
    const out: ExternalKpiValue[] = [];
    const push = (key: string, prevKey?: string) => {
      if (typeof r[key] === "number")
        out.push({ key, value: r[key]!, previous: prevKey ? r[prevKey] : undefined });
    };
    push("revenue", "revenuePrev");
    push("leads", "leadsPrev");
    push("conversion", "conversionPrev");
    push("engagement", "engagementPrev");
    return out;
  }
}

function statusFor(value: number, target: number | null): Kpi["status"] {
  if (target === null) return "unknown";
  if (value >= target) return "good";
  if (value >= target * 0.7) return "watch";
  return "behind";
}

/** Merge fetched external values into a dashboard's KPI list (immutable). */
export function mergeExternalKpis(
  dashboard: FounderDashboard,
  values: ExternalKpiValue[],
): FounderDashboard {
  const byKey = new Map(values.map((v) => [v.key, v]));
  const kpis = dashboard.kpis.map((k): Kpi => {
    const v = byKey.get(k.key);
    if (!v || k.origin !== "external") return k;
    const previous = v.previous ?? null;
    const delta = previous === null ? null : v.value - previous;
    const target = v.target ?? null;
    return {
      ...k,
      value: v.value,
      previous,
      delta,
      trend: delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down",
      target,
      status: statusFor(v.value, target),
    };
  });
  return { ...dashboard, kpis };
}

/** Convenience: fetch from a connector and merge in one call. */
export async function syncDashboard(
  dashboard: FounderDashboard,
  connector: DashboardSyncConnector,
  now?: Date,
): Promise<FounderDashboard> {
  const values = await connector.fetchKpis(dashboard.period, now);
  return mergeExternalKpis(dashboard, values);
}

/** Default singleton used when the host hasn't wired a real connector. */
export const defaultSyncConnector: DashboardSyncConnector = new NullSyncConnector();
