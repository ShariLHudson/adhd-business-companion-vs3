"use client";

import type { ReactNode } from "react";

import type { FounderAnalyticsReport } from "@/lib/founderWorkspace/analytics";
import type { FounderDailyBriefing } from "@/lib/founderWorkspace/briefing";
import type { BusinessHealthReport } from "@/lib/founderWorkspace/businessHealth/types";
import { HEALTH_LABELS } from "@/lib/founderWorkspace/businessHealth/types";
import type { ExperimentMetricsReport } from "@/lib/founderWorkspace/experimentMetrics";
import type { ProductIntelligenceReport } from "@/lib/founderWorkspace/productIntelligence/types";
import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";

import type { FounderActionCenterHandlers } from "./FounderActionCenter";
import { FounderActionCenter } from "./FounderActionCenter";
import { FounderRecognitionPanel } from "./FounderRecognitionPanel";
import { FounderCognitiveLoadPanel } from "./FounderCognitiveLoadPanel";
import { FounderActivationPanel } from "./FounderActivationPanel";
import { FounderLoopPanel } from "./FounderLoopPanel";
import { FounderDayDesignerPanel } from "./FounderDayDesignerPanel";
import { FounderRelationshipPanel } from "./FounderRelationshipPanel";
import { FounderOpportunityPanel } from "./FounderOpportunityPanel";
import { FounderAdaptiveCompanionPanel } from "./FounderAdaptiveCompanionPanel";
import { FounderUserHealthPanel } from "./FounderUserHealthPanel";
import { FounderDecisionPanel } from "./FounderDecisionPanel";
import { FounderRecoveryPanel } from "./FounderRecoveryPanel";
import { FounderMomentumPanel } from "./FounderMomentumPanel";
import { FounderFutureShariPanel } from "./FounderFutureShariPanel";
import { FounderEnvironmentPanel } from "./FounderEnvironmentPanel";
import { FounderBusinessOSPanel } from "./FounderBusinessOSPanel";
import { FounderChiefOfStaffPanel } from "./FounderChiefOfStaffPanel";
import { FounderMorningBriefingPanel } from "./FounderMorningBriefingPanel";
import { FounderEcosystemHubPanel } from "./FounderEcosystemHubPanel";
import { FounderPredictiveSupportPanel } from "./FounderPredictiveSupportPanel";
import { FounderIntelligencePanels } from "./FounderIntelligencePanels";
import type { FounderRecommendedTask } from "@/lib/founderWorkspace/actionCenter";

type FounderDashboardProps = {
  briefing: FounderDailyBriefing;
  businessHealth: BusinessHealthReport;
  productIntelligence: ProductIntelligenceReport;
  analytics: FounderAnalyticsReport;
  experimentMetrics: ExperimentMetricsReport;
  recentNotes: FounderWorkspaceItem[];
  recommendedTask: FounderRecommendedTask;
  actionHandlers: FounderActionCenterHandlers;
  onNavigate: (
    target: "project" | "issue" | "dev_experiment" | "note",
    opts?: { issueFilter?: "retest"; projectId?: string },
  ) => void;
};

function healthColor(level: string): string {
  if (level === "at_risk") return "text-[#a85c4a]";
  if (level === "needs_attention") return "text-[#7a5c00]";
  return "text-[#1e4f4f]";
}

function DashboardSection({
  title,
  subtitle,
  children,
  onViewAll,
  viewAllLabel = "View all →",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onViewAll?: () => void;
  viewAllLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[#6b635a]">{subtitle}</p>
          ) : null}
        </div>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-xs font-medium text-[#1e4f4f] hover:underline"
          >
            {viewAllLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-3 text-sm text-[#2d2926]">{children}</div>
    </section>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-[#6b635a]">{children}</p>;
}

export function FounderDashboard({
  briefing,
  businessHealth,
  productIntelligence,
  analytics,
  experimentMetrics,
  recentNotes,
  recommendedTask,
  actionHandlers,
  onNavigate,
}: FounderDashboardProps) {
  const alertCount = analytics.alerts.length + experimentMetrics.alerts.length;
  const sortedNotes = [...recentNotes]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-[#e0795a]/30 bg-gradient-to-r from-[#e0795a]/10 to-white p-4">
        <p className="text-[11px] font-bold uppercase text-[#c9684d]">
          Today&apos;s Focus
        </p>
        <p className="mt-1 text-base font-semibold text-[#1f1c19]">
          {briefing.todaysFocus.title}
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          {briefing.todaysFocus.reason}
        </p>
      </section>

      <FounderMorningBriefingPanel />

      <FounderEcosystemHubPanel />

      <FounderActionCenter task={recommendedTask} handlers={actionHandlers} />

      {briefing.canWait.length > 0 ? (
        <section className="rounded-xl border border-[#d4cdc3] bg-[#faf8f5] p-4">
          <p className="text-[11px] font-bold uppercase text-[#6b635a]">
            Can Wait
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[#6b635a]">
            {briefing.canWait.slice(0, 4).map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardSection
          title="Open Issues"
          subtitle={`${briefing.stats.openIssueCount} open · ${briefing.stats.criticalIssueCount} critical/high`}
          onViewAll={() => onNavigate("issue")}
        >
          {briefing.openIssues.length === 0 ? (
            <EmptyHint>Nothing broken right now.</EmptyHint>
          ) : (
            <ul className="space-y-2">
              {briefing.openIssues.slice(0, 4).map((issue) => (
                <li key={issue.id} className="flex items-baseline gap-2">
                  <span className="rounded bg-[#ebe4d9] px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                    {issue.severity}
                  </span>
                  <span>{issue.title}</span>
                </li>
              ))}
            </ul>
          )}
          {briefing.stats.retestCount > 0 ? (
            <button
              type="button"
              onClick={() => onNavigate("issue", { issueFilter: "retest" })}
              className="mt-2 text-xs font-medium text-[#1e4f4f] hover:underline"
            >
              {briefing.stats.retestCount} in retest →
            </button>
          ) : null}
        </DashboardSection>

        <DashboardSection
          title="Projects Needing Attention"
          subtitle={`${briefing.stats.projectsNeedingAttentionCount} flagged`}
          onViewAll={() => onNavigate("project")}
        >
          {briefing.projectsNeedingAttention.length === 0 ? (
            <EmptyHint>Projects look on track.</EmptyHint>
          ) : (
            <ul className="space-y-2">
              {briefing.projectsNeedingAttention.slice(0, 4).map((p) => (
                <li key={p.projectId}>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate("project", { projectId: p.projectId })
                    }
                    className="font-medium text-[#1e4f4f] hover:underline"
                  >
                    {p.title}
                  </button>
                  <p className="text-xs text-[#6b635a]">{p.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

        <DashboardSection
          title="Active Experiments"
          subtitle={`${briefing.stats.activeExperimentCount} in progress`}
          onViewAll={() => onNavigate("dev_experiment")}
        >
          {briefing.activeExperiments.length === 0 ? (
            <EmptyHint>No experiments running.</EmptyHint>
          ) : (
            <ul className="space-y-1">
              {briefing.activeExperiments.slice(0, 4).map((e) => (
                <li key={e.id}>{e.title}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-[#6b635a]">
            {experimentMetrics.aggregate.successRate}% success ·{" "}
            {experimentMetrics.aggregate.inProgress} running
          </p>
        </DashboardSection>

        <DashboardSection
          title="Recent Notes"
          onViewAll={() => onNavigate("note")}
        >
          {sortedNotes.length === 0 ? (
            <EmptyHint>No notes yet.</EmptyHint>
          ) : (
            <ul className="space-y-1">
              {sortedNotes.map((note) => (
                <li key={note.id}>
                  <span className="font-medium">{note.title}</span>
                  <span className="ml-2 text-xs text-[#6b635a]">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardSection title="Business Health">
          <p className={`font-semibold ${healthColor(businessHealth.overall)}`}>
            {HEALTH_LABELS[businessHealth.overall]}
          </p>
          <p className="mt-1 text-xs text-[#6b635a]">
            {businessHealth.overallHeadline}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-[#6b635a]">
            <li>Users: {businessHealth.user.headline}</li>
            <li>Product: {businessHealth.product.headline}</li>
            <li>Engagement: {businessHealth.engagement.headline}</li>
            <li>Revenue: {businessHealth.revenue.headline}</li>
          </ul>
        </DashboardSection>

        <DashboardSection title="Product Intelligence">
          {productIntelligence.topFrustrations[0] ? (
            <p className="text-sm">
              <span className="text-[#6b635a]">Top friction: </span>
              {productIntelligence.topFrustrations[0].text.slice(0, 100)}
            </p>
          ) : (
            <EmptyHint>No friction signals yet.</EmptyHint>
          )}
          {productIntelligence.opportunities[0] ? (
            <p className="mt-2 text-xs text-[#6b635a]">
              Opportunity: {productIntelligence.opportunities[0].title}
            </p>
          ) : null}
          {productIntelligence.quickWins[0] ? (
            <p className="mt-1 text-xs text-[#1e4f4f]">
              Quick win: {productIntelligence.quickWins[0].title}
            </p>
          ) : null}
        </DashboardSection>

        <DashboardSection
          title="Ecosystem & Analytics"
          subtitle={`${analytics.summary.focusMinutes} focus min · ${analytics.summary.apiCalls} API calls`}
        >
          <ul className="space-y-1 text-xs text-[#6b635a]">
            <li>
              Projects {analytics.summary.completionRate}% complete ·{" "}
              {analytics.summary.experimentsSuccessful} experiments won
            </li>
            {analytics.workspaceUsage.slice(0, 3).map((w) => (
              <li key={w.label}>
                {w.label}: {w.value} opens
              </li>
            ))}
          </ul>
        </DashboardSection>

        <DashboardSection title="Experiment Metrics">
          <ul className="space-y-1 text-xs text-[#6b635a]">
            <li>
              {experimentMetrics.aggregate.total} total ·{" "}
              {experimentMetrics.aggregate.avgCompletionRate}% avg completion
            </li>
            <li>
              {experimentMetrics.aggregate.totalApiTokens.toLocaleString()}{" "}
              tokens · ~$
              {experimentMetrics.aggregate.totalEstimatedCostUsd.toFixed(2)}{" "}
              est.
            </li>
            {experimentMetrics.bottlenecks[0] ? (
              <li className="text-[#7a5c00]">
                Bottleneck: {experimentMetrics.bottlenecks[0]}
              </li>
            ) : null}
          </ul>
        </DashboardSection>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardSection title="System Status">
          <p className="text-xs text-[#6b635a]">
            {businessHealth.system.headline}
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
            <li>
              OpenAI:{" "}
              <span className={healthColor(businessHealth.metrics.system.openAiStatus)}>
                {HEALTH_LABELS[businessHealth.metrics.system.openAiStatus]}
              </span>
            </li>
            <li>
              Claude:{" "}
              <span className={healthColor(businessHealth.metrics.system.claudeStatus)}>
                {HEALTH_LABELS[businessHealth.metrics.system.claudeStatus]}
              </span>
            </li>
            <li>
              Google:{" "}
              <span
                className={healthColor(
                  businessHealth.metrics.system.googleIntegration,
                )}
              >
                {HEALTH_LABELS[businessHealth.metrics.system.googleIntegration]}
              </span>
            </li>
            <li>
              Errors: {businessHealth.metrics.system.errorLogCount}
            </li>
          </ul>
        </DashboardSection>

        <DashboardSection title="Recent Activity">
          {analytics.recentActivity.length === 0 ? (
            <EmptyHint>No recent activity.</EmptyHint>
          ) : (
            <ul className="space-y-1 text-xs text-[#6b635a]">
              {analytics.recentActivity.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <span className="text-[#2d2926]">{item.title}</span>
                  {item.detail ? ` — ${item.detail}` : ""}
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>

      {alertCount > 0 ? (
        <section className="rounded-lg border border-[#a85c4a]/25 bg-[#a85c4a]/8 px-4 py-3 text-sm">
          <span className="font-semibold text-[#a85c4a]">
            {alertCount} alert{alertCount === 1 ? "" : "s"}
          </span>
          <span className="text-[#2d2926]">
            {" "}
            — {[...analytics.alerts, ...experimentMetrics.alerts]
              .slice(0, 2)
              .map((a) => a.message)
              .join(" · ")}
          </span>
        </section>
      ) : null}

      <FounderIntelligencePanels>
        <FounderRecognitionPanel />
        <FounderCognitiveLoadPanel />
        <FounderActivationPanel />
        <FounderLoopPanel />
        <FounderDayDesignerPanel />
        <FounderRelationshipPanel />
        <FounderOpportunityPanel />
        <FounderAdaptiveCompanionPanel />
        <FounderUserHealthPanel />
        <FounderDecisionPanel />
        <FounderRecoveryPanel />
        <FounderMomentumPanel />
        <FounderFutureShariPanel />
        <FounderEnvironmentPanel />
        <FounderBusinessOSPanel />
        <FounderChiefOfStaffPanel />
        <FounderPredictiveSupportPanel />
      </FounderIntelligencePanels>
    </div>
  );
}
