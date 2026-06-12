"use client";

import { useCallback, useEffect, useState } from "react";

import type { FounderUserHealthInputs } from "@/lib/ecosystem/userHealthEngine";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { DASHBOARD, DashboardSection, MetricCard } from "./ecosystemDashboardUi";

type UserHealthIntelligenceSectionProps = {
  accessToken: string;
  refreshToken?: number;
};

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function UserHealthIntelligenceSection({
  accessToken,
  refreshToken = 0,
}: UserHealthIntelligenceSectionProps) {
  const [data, setData] = useState<FounderUserHealthInputs | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ecosystem/user-health", {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
      });
      if (!res.ok) throw new Error("Failed");
      setData((await res.json()) as FounderUserHealthInputs);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  const metrics = data?.dashboardMetrics;

  return (
    <DashboardSection
      id="user-health-intelligence"
      title="User Health Intelligence"
      subtitle="Engagement & retention — anonymous users only, no conversation text"
    >
      {loading ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Loading user health…</p>
      ) : !data ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          User health data unavailable. Activity syncs from the companion app.
        </p>
      ) : (
        <>
          <div className="mb-4 grid gap-3 grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Active users" value={metrics?.activeUsers ?? 0} hint="< 7 days inactive" />
            <MetricCard label="Inactive 7 days" value={metrics?.inactive7Days ?? 0} />
            <MetricCard label="Inactive 14 days" value={metrics?.inactive14Days ?? 0} />
            <MetricCard label="Inactive 30 days" value={metrics?.inactive30Days ?? 0} />
            <MetricCard label="Recovered users" value={metrics?.recoveredUsers ?? 0} hint="Returned after 14+ days" />
            <MetricCard label="Cancelled users" value={metrics?.cancelledUsers ?? 0} />
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3">
              <p className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                Health distribution
              </p>
              <ul className={`mt-2 space-y-1 text-xs ${DASHBOARD.body}`}>
                {(
                  Object.entries(data.healthDistribution) as [string, number][]
                ).map(([status, count]) => (
                  <li key={status} className="flex justify-between gap-2">
                    <span className="capitalize">{statusLabel(status)}</span>
                    <span className={`font-semibold ${DASHBOARD.heading}`}>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3">
              <p className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                Retention trend
              </p>
              <p className={`mt-2 text-sm font-medium capitalize ${DASHBOARD.body}`}>
                {data.retentionTrend}
              </p>
              <p className={`mt-1 text-xs ${DASHBOARD.muted}`}>
                Week-over-week active user comparison
              </p>
            </div>
          </div>

          {data.topAtRiskUsers.length > 0 ? (
            <div>
              <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                Top at-risk users
              </p>
              <ul className="space-y-2">
                {data.topAtRiskUsers.map((u) => (
                  <li
                    key={u.userRef}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#faf8f5] px-3 py-2 text-xs"
                  >
                    <span className={DASHBOARD.body}>{u.userRef}</span>
                    <span className={`capitalize ${DASHBOARD.muted}`}>
                      {statusLabel(u.healthStatus)} · {u.daysSinceLastActivity}d inactive
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              No at-risk users flagged yet. Health scores update as companion activity syncs.
            </p>
          )}

          <p className={`mt-3 text-[10px] ${DASHBOARD.muted}`}>
            Anonymous user refs only · no names, emails, or conversation content
          </p>
        </>
      )}
    </DashboardSection>
  );
}
