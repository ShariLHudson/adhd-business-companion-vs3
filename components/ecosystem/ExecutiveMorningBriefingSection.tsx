"use client";

import { useCallback, useEffect, useState } from "react";

import type { ExecutiveMorningBriefing } from "@/lib/ecosystem/executiveMorningBriefing";
import { formatUsd } from "@/lib/ecosystem/revenueIntelligenceEngine";
import type { BusinessEcosystemPeriod } from "@/lib/ecosystem/businessEcosystemDashboard";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ActionChip, DASHBOARD, DashboardSection } from "./ecosystemDashboardUi";

type ExecutiveMorningBriefingSectionProps = {
  accessToken: string;
  period: BusinessEcosystemPeriod;
  refreshToken?: number;
};

function BriefingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className={DASHBOARD.muted}>{label}</span>
      <span className={`text-right font-medium ${DASHBOARD.body}`}>{value}</span>
    </div>
  );
}

export function ExecutiveMorningBriefingSection({
  accessToken,
  period,
  refreshToken = 0,
}: ExecutiveMorningBriefingSectionProps) {
  const [briefing, setBriefing] = useState<ExecutiveMorningBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) {
      setBriefing(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/ecosystem/briefing?period=${period}`, {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
      });
      if (res.ok) {
        setBriefing((await res.json()) as ExecutiveMorningBriefing);
      } else {
        setBriefing(null);
      }
    } catch {
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, period]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  function scrollTo(anchor: string) {
    document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <DashboardSection
      id="morning-briefing"
      title="Executive Morning Briefing"
      subtitle="What matters today — read in under 60 seconds"
      accent="gold"
    >
      {loading && !briefing ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Loading your briefing…</p>
      ) : briefing ? (
        <div className="space-y-4">
          <p className={`text-sm font-medium ${DASHBOARD.body}`}>{briefing.headline}</p>
          <p className={`text-[10px] ${DASHBOARD.muted}`}>
            ~{briefing.readSecondsEstimate}s read · Updated{" "}
            {new Date(briefing.generatedAt).toLocaleTimeString()}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-xl border border-[#ebe4d9] ${DASHBOARD.goldBg} p-3`}>
              <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                1 · Business snapshot
              </p>
              <div className="space-y-1">
                <BriefingRow label="Revenue" value={formatUsd(briefing.businessSnapshot.revenue)} />
                <BriefingRow label="MRR" value={formatUsd(briefing.businessSnapshot.mrr)} />
                <BriefingRow label="Active users" value={String(briefing.businessSnapshot.activeUsers)} />
                <BriefingRow label="At risk" value={String(briefing.businessSnapshot.atRiskUsers)} />
                <BriefingRow label="New users" value={String(briefing.businessSnapshot.newUsers)} />
                <BriefingRow label="Cancelled" value={String(briefing.businessSnapshot.cancelledUsers)} />
              </div>
            </div>

            <div className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3">
              <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                2 · User intelligence
              </p>
              <div className="space-y-1">
                <BriefingRow label="Top struggle" value={briefing.userIntelligence.topStruggle} />
                <BriefingRow label="Top question" value={briefing.userIntelligence.topQuestion} />
                <BriefingRow label="Top emotion" value={briefing.userIntelligence.topEmotion} />
                <BriefingRow label="Trending" value={briefing.userIntelligence.trendingTopic} />
              </div>
            </div>

            <div className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3">
              <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                3 · Product intelligence
              </p>
              <div className="space-y-1">
                <BriefingRow label="Most used" value={briefing.productIntelligence.mostUsedFeature} />
                <BriefingRow label="Least used" value={briefing.productIntelligence.leastUsedFeature} />
                <BriefingRow label="Most requested" value={briefing.productIntelligence.mostRequestedFeature} />
                <BriefingRow label="Most confusing" value={briefing.productIntelligence.mostConfusingFeature} />
              </div>
            </div>

            <div className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3">
              <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                4 · Content intelligence
              </p>
              <div className="space-y-1">
                <BriefingRow label="Top opportunity" value={briefing.contentIntelligence.topContentOpportunity} />
                <BriefingRow label="Blog" value={briefing.contentIntelligence.recommendedBlog} />
                <BriefingRow label="Newsletter" value={briefing.contentIntelligence.recommendedNewsletter} />
                <BriefingRow label="Workshop" value={briefing.contentIntelligence.recommendedWorkshop} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border border-[#e8d48a] ${DASHBOARD.goldBg} p-3`}>
            <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
              5 · Founder focus
            </p>
            <div className="space-y-1">
              <BriefingRow label="Biggest opportunity" value={briefing.founderFocus.biggestOpportunity} />
              <BriefingRow label="Biggest risk" value={briefing.founderFocus.biggestRisk} />
              <BriefingRow label="Recommended action" value={briefing.founderFocus.recommendedAction} />
              <BriefingRow label="Expected impact" value={briefing.founderFocus.expectedImpact} />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {briefing.quickActions.map((action) => (
              <ActionChip
                key={action.id}
                label={action.label}
                variant="gold"
                onClick={() => scrollTo(action.anchor)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          Add your dashboard access token to load the morning briefing.
        </p>
      )}
    </DashboardSection>
  );
}
