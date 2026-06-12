"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BUSINESS_ECOSYSTEM_DASHBOARD_TITLE,
  type BusinessEcosystemDashboardPayload,
  type BusinessEcosystemPeriod,
} from "@/lib/ecosystem/businessEcosystemDashboard";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ContentDraftsPanel } from "./ContentDraftsPanel";
import { ContentQueueSection } from "./ContentQueueSection";
import { CrossSystemIntelligenceHubSection } from "./CrossSystemIntelligenceHubSection";
import { ExecutiveMorningBriefingSection } from "./ExecutiveMorningBriefingSection";
import { FounderAiAdvisorSection } from "./FounderAiAdvisorSection";
import { PostCraftLivePublishingSection } from "./PostCraftLivePublishingSection";
import { PostCraftSyncQueueSection } from "./PostCraftSyncQueueSection";
import type { FounderCostIntelligence } from "@/lib/ecosystem/costIntelligenceEngine";
import { formatUsd } from "@/lib/ecosystem/costIntelligenceEngine";
import type { FounderRevenueIntelligence } from "@/lib/ecosystem/revenueIntelligenceEngine";
import type { FounderUserHealthInputs } from "@/lib/ecosystem/userHealthEngine";
import {
  ActionChip,
  copyText,
  DASHBOARD,
  DashboardSection,
  MetricCard,
} from "./ecosystemDashboardUi";
import { GoogleWorkspaceAutomationSection } from "./GoogleWorkspaceAutomationSection";
import { LiveContentOpportunitiesSection } from "./LiveContentOpportunitiesSection";

const SESSION_KEY = "ecosystem-dashboard-access";

type BusinessEcosystemDashboardProps = {
  accessToken?: string;
};

export function BusinessEcosystemDashboard({
  accessToken,
}: BusinessEcosystemDashboardProps) {
  const [period, setPeriod] = useState<BusinessEcosystemPeriod>("30d");
  const [data, setData] = useState<BusinessEcosystemDashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [postCraftCopied, setPostCraftCopied] = useState(false);
  const [queueRefresh, setQueueRefresh] = useState(0);
  const [syncRefresh, setSyncRefresh] = useState(0);
  const [publishingRefresh, setPublishingRefresh] = useState(0);
  const [userHealth, setUserHealth] = useState<FounderUserHealthInputs | null>(null);
  const [revenueIntel, setRevenueIntel] = useState<FounderRevenueIntelligence | null>(null);
  const [costIntel, setCostIntel] = useState<FounderCostIntelligence | null>(null);
  const [googleRefresh, setGoogleRefresh] = useState(0);

  const resolveToken = useCallback(() => {
    if (accessToken) return accessToken;
    if (typeof window === "undefined") return "";
    return (
      sessionStorage.getItem(SESSION_KEY) ??
      sessionStorage.getItem("ghl-dashboard-access") ??
      ""
    );
  }, [accessToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = resolveToken();
    if (token && typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, token);
    }

    try {
      const res = await fetch(`/api/ecosystem/dashboard?period=${period}`, {
        headers: token ? { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: token } : {},
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      setData((await res.json()) as BusinessEcosystemDashboardPayload);

      if (token) {
        const headers = { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: token };
        const [healthRes, revenueRes, costRes] = await Promise.all([
          fetch("/api/ecosystem/user-health", { headers }),
          fetch(`/api/ecosystem/revenue?period=${period}`, { headers }),
          fetch(`/api/ecosystem/cost?period=${period}`, { headers }),
        ]);
        if (healthRes.ok) {
          setUserHealth((await healthRes.json()) as FounderUserHealthInputs);
        } else {
          setUserHealth(null);
        }
        if (revenueRes.ok) {
          setRevenueIntel((await revenueRes.json()) as FounderRevenueIntelligence);
        } else {
          setRevenueIntel(null);
        }
        if (costRes.ok) {
          setCostIntel((await costRes.json()) as FounderCostIntelligence);
        } else {
          setCostIntel(null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load dashboard.");
      setData(null);
      setUserHealth(null);
      setRevenueIntel(null);
      setCostIntel(null);
    } finally {
      setLoading(false);
    }
  }, [period, resolveToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const userSignals = useMemo(() => {
    if (!data) return [];
    return data.productSignals.filter(
      (s) => s.kind === "struggle" || s.kind === "question" || s.kind === "feedback",
    );
  }, [data]);

  const productIntelSignals = useMemo(() => {
    if (!data) return [];
    return data.productSignals.filter((s) => s.kind === "feature_request");
  }, [data]);

  async function copyFullPostCraftExport() {
    if (!data?.postCraftExport) return;
    const ok = await copyText(JSON.stringify(data.postCraftExport, null, 2));
    if (ok) {
      setPostCraftCopied(true);
      window.setTimeout(() => setPostCraftCopied(false), 2000);
    }
  }

  if (loading && !data) {
    return (
      <div className={`min-h-screen ${DASHBOARD.bg} p-3 sm:p-4`}>
        <p className={`text-sm ${DASHBOARD.muted}`}>
          Loading {BUSINESS_ECOSYSTEM_DASHBOARD_TITLE}…
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`min-h-screen ${DASHBOARD.bg} p-3 sm:p-4`}>
        <div className="rounded-2xl border border-[#e0795a]/40 bg-white p-4 text-sm text-[#a85c4a]">
          {error}
          <p className={`mt-2 text-xs ${DASHBOARD.muted}`}>
            Add{" "}
            <code className="rounded bg-[#f3ede4] px-1">?access=YOUR_TOKEN</code> to
            your GHL embed URL.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const biz = data.business;
  const live = data.integration.ecosystemSignalsConfigured;

  return (
    <div className={`min-h-screen ${DASHBOARD.bg} p-3 sm:p-4`}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <header className={`${DASHBOARD.card} p-4`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${DASHBOARD.gold}`}>
                Spark Studio Companions
              </p>
              <h1 className={`text-lg font-semibold sm:text-xl ${DASHBOARD.heading}`}>
                {data.dashboardName}
              </h1>
              <p className={`mt-1 text-xs ${DASHBOARD.muted}`}>
                Aggregated intelligence only · Updated{" "}
                {new Date(data.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["7d", "30d", "90d"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-medium ${
                    period === p
                      ? "bg-[#1e4f4f] text-white"
                      : "border border-[#d4cdc3] bg-white text-[#2d2926]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <ActionChip label="Refresh" onClick={() => void load()} />
            </div>
          </div>
        </header>

        <ExecutiveMorningBriefingSection
          accessToken={resolveToken()}
          period={period}
          refreshToken={queueRefresh + syncRefresh}
        />

        <DashboardSection
          id="business-snapshot"
          title="Business Snapshot"
          subtitle="GHL business metrics + user health engagement"
        >
          {biz ? (
            <div className="mb-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Contacts" value={biz.totalContacts} />
              <MetricCard label={`New (${biz.period})`} value={biz.newContacts} />
              <MetricCard label="Pipeline" value={biz.openOpportunities} />
              <MetricCard label="Win rate" value={`${biz.conversionRate}%`} />
            </div>
          ) : (
            <div className={`mb-4 rounded-xl border border-dashed ${DASHBOARD.goldBorder} ${DASHBOARD.goldBg} p-4 text-sm ${DASHBOARD.muted}`}>
              Connect <code className="text-xs">GHL_API_TOKEN</code> and{" "}
              <code className="text-xs">GHL_LOCATION_ID</code> for live business
              metrics.
            </div>
          )}

          <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
            User health
          </p>
          {userHealth ? (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Active users"
                value={userHealth.dashboardMetrics.activeUsers}
                hint="< 7 days inactive"
              />
              <MetricCard
                label="Inactive 7 days"
                value={userHealth.dashboardMetrics.inactive7Days}
              />
              <MetricCard
                label="Inactive 14 days"
                value={userHealth.dashboardMetrics.inactive14Days}
              />
              <MetricCard
                label="Inactive 30 days"
                value={userHealth.dashboardMetrics.inactive30Days}
              />
              <MetricCard
                label="Recovered users"
                value={userHealth.dashboardMetrics.recoveredUsers}
              />
              <MetricCard
                label="At risk"
                value={userHealth.dashboardMetrics.atRiskUsers}
              />
              <MetricCard
                label="Critical"
                value={userHealth.dashboardMetrics.criticalUsers}
              />
              <MetricCard
                label="Retention trend"
                value={userHealth.retentionTrend}
              />
            </div>
          ) : (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              User health populates as companion activity syncs (anonymous signals only).
            </p>
          )}
          <p className={`mt-2 text-[10px] ${DASHBOARD.muted}`}>
            Scores 90–100 healthy · 70–89 needs attention · 40–69 at risk · 0–39 critical
          </p>

          <p className={`mb-2 mt-5 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
            Revenue intelligence
          </p>
          {revenueIntel ? (
            <>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Revenue this month"
                  value={formatUsd(revenueIntel.dashboardMetrics.revenueThisMonth)}
                />
                <MetricCard
                  label="MRR"
                  value={formatUsd(revenueIntel.dashboardMetrics.mrr)}
                />
                <MetricCard
                  label="Revenue growth"
                  value={`${revenueIntel.dashboardMetrics.revenueGrowthPercent}%`}
                />
                <MetricCard
                  label="Conversion rate"
                  value={`${revenueIntel.dashboardMetrics.conversionRate}%`}
                />
                <MetricCard
                  label="Churn rate"
                  value={`${revenueIntel.dashboardMetrics.churnRate}%`}
                />
                <MetricCard
                  label="ARPU"
                  value={formatUsd(revenueIntel.dashboardMetrics.averageRevenuePerUser)}
                />
                <MetricCard
                  label="LTV"
                  value={formatUsd(revenueIntel.dashboardMetrics.lifetimeValue)}
                />
                <MetricCard
                  label="Revenue health"
                  value={revenueIntel.revenueHealth}
                />
              </div>
              <div className={`mt-3 rounded-xl border border-[#e8e2d8] bg-white/60 p-3`}>
                <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                  6-month trend
                </p>
                <ul className="space-y-1">
                  {revenueIntel.revenueTrend.map((point) => (
                    <li
                      key={point.monthKey}
                      className="flex justify-between text-xs text-[#2d2926]"
                    >
                      <span>{point.monthKey}</span>
                      <span>
                        {formatUsd(point.monthlyRevenue)} rev · {formatUsd(point.mrr)} MRR
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              Revenue metrics populate from payment events (Stripe, PayPal, GHL) and subscriber signals.
            </p>
          )}

          <p className={`mb-2 mt-5 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
            Cost intelligence
          </p>
          {costIntel ? (
            <>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Total monthly costs"
                  value={formatUsd(costIntel.dashboardMetrics.totalMonthlyCosts)}
                />
                <MetricCard
                  label="Biggest cost"
                  value={costIntel.dashboardMetrics.biggestCostLabel}
                  hint={formatUsd(costIntel.dashboardMetrics.biggestCostAmount)}
                />
                <MetricCard
                  label="Fastest growing"
                  value={
                    costIntel.dashboardMetrics.fastestGrowingCostLabel ?? "—"
                  }
                  hint={
                    costIntel.dashboardMetrics.fastestGrowingCost
                      ? `+${costIntel.dashboardMetrics.fastestGrowingCostPercent}%`
                      : undefined
                  }
                />
                <MetricCard
                  label="Profit estimate"
                  value={formatUsd(costIntel.dashboardMetrics.profitEstimate)}
                />
                <MetricCard
                  label="Cost growth"
                  value={`${costIntel.costGrowthPercent}%`}
                />
                <MetricCard
                  label="Cost per user"
                  value={formatUsd(costIntel.costPerUser)}
                />
                <MetricCard
                  label="Gross margin"
                  value={`${costIntel.grossMarginPercent}%`}
                />
                <MetricCard
                  label="Net margin"
                  value={`${costIntel.netMarginPercent}%`}
                />
              </div>
              <div className={`mt-3 rounded-xl border border-[#e8e2d8] bg-white/60 p-3`}>
                <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                  Cost breakdown
                </p>
                <ul className="space-y-1">
                  {costIntel.categoryBreakdown
                    .filter((c) => c.amount > 0)
                    .map((row) => (
                      <li
                        key={row.category}
                        className="flex justify-between text-xs text-[#2d2926]"
                      >
                        <span>{row.label}</span>
                        <span>
                          {formatUsd(row.amount)} · {row.sharePercent}%
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          ) : (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              Log monthly SaaS costs per vendor or set ECOSYSTEM_COST_* env estimates.
            </p>
          )}
        </DashboardSection>

        <CrossSystemIntelligenceHubSection
          accessToken={resolveToken()}
          period={period}
          refreshToken={syncRefresh}
        />

        <DashboardSection
          id="user-intelligence"
          title="User Intelligence"
          subtitle={live ? "Categorized struggle & question counts" : "Waiting for signal sync"}
        >
          {userSignals.length === 0 ? (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              No user signals yet. Companion chat populates aggregated counts only.
            </p>
          ) : (
            <ul className="space-y-2">
              {userSignals.map((s) => (
                <li
                  key={`${s.kind}-${s.label}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-[#faf8f5] px-3 py-2 text-sm"
                >
                  <span className={DASHBOARD.body}>{s.label}</span>
                  <span className={`text-xs font-semibold ${DASHBOARD.heading}`}>
                    {s.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={`mt-2 text-[10px] ${DASHBOARD.muted}`}>
            No conversation text · counts only
          </p>
        </DashboardSection>

        <FounderAiAdvisorSection
          accessToken={resolveToken()}
          period={period}
        />

        <DashboardSection
          id="product-intelligence"
          title="Product Intelligence"
          subtitle="Feature requests & product friction (aggregated)"
        >
          {productIntelSignals.length === 0 ? (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              No feature-request signals yet. Top user themes inform product priorities
              alongside the content queue.
            </p>
          ) : (
            <ul className="space-y-2">
              {productIntelSignals.map((s) => (
                <li
                  key={s.label}
                  className="flex justify-between gap-2 rounded-lg bg-[#faf8f5] px-3 py-2 text-sm"
                >
                  <span>{s.label}</span>
                  <span className={`font-semibold ${DASHBOARD.heading}`}>{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

        <LiveContentOpportunitiesSection
          accessToken={resolveToken()}
          opportunities={data.contentOpportunities}
          hasLiveSignals={live}
          onQueueChange={() => setQueueRefresh((n) => n + 1)}
          onGoogleAssetCreated={() => setGoogleRefresh((n) => n + 1)}
        />

        <GoogleWorkspaceAutomationSection
          accessToken={resolveToken()}
          refreshToken={googleRefresh}
        />

        <DashboardSection
          id="postcraft-export"
          title="PostCraft Export"
          subtitle="Full opportunity bundle — titles, angles, signals"
          accent="gold"
        >
          {data.postCraftExport ? (
            <div className="flex flex-wrap items-center gap-2">
              <ActionChip
                label={postCraftCopied ? "Copied!" : "Copy full PostCraft JSON"}
                variant="teal"
                onClick={() => void copyFullPostCraftExport()}
              />
              <p className={`text-xs ${DASHBOARD.muted}`}>
                {data.postCraftExport.opportunities.length} opportunities · no generated
                copy
              </p>
            </div>
          ) : (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              Export appears when live signals are available.
            </p>
          )}
        </DashboardSection>

        <ContentQueueSection refreshToken={queueRefresh} />

        <ContentDraftsPanel
          accessToken={resolveToken()}
          opportunities={data.contentOpportunities}
          onDraftsChange={() => {
            setSyncRefresh((n) => n + 1);
            setPublishingRefresh((n) => n + 1);
          }}
        />

        <PostCraftSyncQueueSection
          accessToken={resolveToken()}
          refreshToken={syncRefresh}
        />

        <PostCraftLivePublishingSection
          accessToken={resolveToken()}
          refreshToken={syncRefresh + publishingRefresh}
        />

        <DashboardSection id="system-status" title="System Status">
          <ul className={`grid gap-2 text-xs sm:grid-cols-2 ${DASHBOARD.muted}`}>
            <li className="flex justify-between rounded-lg bg-[#faf8f5] px-3 py-2">
              <span>GHL API</span>
              <span className={data.integration.ghlConfigured ? "text-[#1e4f4f]" : ""}>
                {data.integration.ghlConfigured ? "Connected" : "Not configured"}
              </span>
            </li>
            <li className="flex justify-between rounded-lg bg-[#faf8f5] px-3 py-2">
              <span>Founder DB</span>
              <span
                className={data.integration.founderDbConfigured ? "text-[#1e4f4f]" : ""}
              >
                {data.integration.founderDbConfigured ? "Connected" : "Optional"}
              </span>
            </li>
            <li className="flex justify-between rounded-lg bg-[#faf8f5] px-3 py-2">
              <span>Ecosystem signals</span>
              <span className={live ? "text-[#1e4f4f]" : ""}>
                {live ? "Live" : "Waiting"}
              </span>
            </li>
            <li className="flex justify-between rounded-lg bg-[#faf8f5] px-3 py-2">
              <span>Embed security</span>
              <span className="text-[#1e4f4f]">Token required</span>
            </li>
          </ul>
          {data.integration.errors.length > 0 ? (
            <div className="mt-3 rounded-xl border border-[#e8d48a] bg-[#fff9e8] p-3 text-xs text-[#7a5c00]">
              {data.integration.errors.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          ) : null}
        </DashboardSection>
      </div>
    </div>
  );
}
