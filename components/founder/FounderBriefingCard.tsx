"use client";

import { useState } from "react";

import type {
  BriefingSuggestedAction,
  FounderDailyBriefing,
} from "@/lib/founderWorkspace/briefing";
import { issueSeverityLabel } from "@/lib/founderWorkspace/tracking";
import type { FounderTrackingSection } from "@/lib/founderWorkspace/tracking";

type FounderNavTarget = FounderTrackingSection | "project";

type FounderBriefingCardProps = {
  briefing: FounderDailyBriefing;
  onNavigate: (target: FounderNavTarget, itemId?: string) => void;
  onSuggestedAction: (action: BriefingSuggestedAction) => void;
};

function actionButtonLabel(action: BriefingSuggestedAction): string {
  if (action.navigateTo === "issue" && action.issueId) return "Open issue";
  if (action.navigateTo === "retest") return "View retest issues";
  if (action.navigateTo === "project") return "Open project";
  return "Take action";
}

export function FounderBriefingCard({
  briefing,
  onNavigate,
  onSuggestedAction,
}: FounderBriefingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { stats } = briefing;

  return (
    <section
      className="mb-4 rounded-xl border border-[#1e4f4f]/25 bg-gradient-to-br from-[#1e4f4f]/8 to-white p-4 shadow-sm"
      aria-label="Daily founder briefing"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
            Daily briefing
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-[#1f1c19]">
            {briefing.greeting}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium text-[#6b635a] hover:bg-white"
        >
          {expanded ? "Less" : "More"}
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase text-[#6b635a]">
            Today&apos;s focus
          </p>
          <p className="mt-1 font-semibold text-[#1f1c19]">
            {briefing.todaysFocus.title}
          </p>
          <p className="mt-1 text-xs text-[#6b635a]">
            {briefing.todaysFocus.reason}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-white/80 p-2.5">
            <p className="text-[11px] text-[#6b635a]">Open issues</p>
            <p className="font-semibold text-[#1f1c19]">
              {stats.openIssueCount}
              {stats.criticalIssueCount > 0 ? (
                <span className="ml-1 text-xs font-medium text-[#c9684d]">
                  ({stats.criticalIssueCount} critical)
                </span>
              ) : null}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 p-2.5">
            <p className="text-[11px] text-[#6b635a]">Projects</p>
            <p className="font-semibold text-[#1f1c19]">
              {stats.projectsNeedingAttentionCount} need attention
            </p>
          </div>
          {stats.retestCount > 0 ? (
            <div className="rounded-lg bg-white/80 p-2.5">
              <p className="text-[11px] text-[#6b635a]">Retest</p>
              <p className="font-semibold text-[#1f1c19]">
                {stats.retestCount} waiting
              </p>
            </div>
          ) : null}
          {stats.activeExperimentCount > 0 ? (
            <div className="rounded-lg bg-white/80 p-2.5">
              <p className="text-[11px] text-[#6b635a]">Testing</p>
              <p className="font-semibold text-[#1f1c19]">
                {stats.activeExperimentCount} experiment
                {stats.activeExperimentCount === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d4cdc3] bg-white/90 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase text-[#6b635a]">
            Suggested action
          </p>
          <p className="text-sm font-medium text-[#1f1c19]">
            {briefing.suggestedAction.label}
          </p>
        </div>
        {briefing.suggestedAction.navigateTo ? (
          <button
            type="button"
            onClick={() => {
              const action = briefing.suggestedAction;
              onSuggestedAction(action);
              onNavigate(
                action.navigateTo!,
                action.issueId ?? action.projectId,
              );
            }}
            className="shrink-0 rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163c3c]"
          >
            {actionButtonLabel(briefing.suggestedAction)}
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-3 space-y-3 border-t border-[#ebe4d9] pt-3 text-sm">
          {briefing.openIssues.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase text-[#6b635a]">
                Open issues
              </p>
              <ul className="mt-1 space-y-1">
                {briefing.openIssues.map((issue) => (
                  <li key={issue.id} className="flex items-center gap-2">
                    <span className="text-[#2d2926]">{issue.title}</span>
                    <span className="text-[11px] text-[#6b635a]">
                      ({issueSeverityLabel(issue.severity)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {briefing.projectsNeedingAttention.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase text-[#6b635a]">
                Projects needing attention
              </p>
              <ul className="mt-1 space-y-1 text-[#2d2926]">
                {briefing.projectsNeedingAttention.map((p) => (
                  <li key={p.projectId}>
                    <span className="font-medium">{p.title}</span>
                    <span className="text-[#6b635a]"> — {p.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {briefing.activeExperiments.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase text-[#6b635a]">
                Active experiments
              </p>
              <ul className="mt-1 list-disc pl-4 text-[#2d2926]">
                {briefing.activeExperiments.map((e) => (
                  <li key={e.id}>{e.title}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {briefing.opportunities.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase text-[#6b635a]">
                Opportunities
              </p>
              <ul className="mt-1 list-disc pl-4 text-[#2d2926]">
                {briefing.opportunities.map((o, i) => (
                  <li key={`${o.idea}-${i}`}>{o.idea}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {briefing.canWait.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase text-[#6b635a]">
                Can wait today
              </p>
              <ul className="mt-1 list-disc pl-4 text-[#6b635a]">
                {briefing.canWait.map((item, i) => (
                  <li key={`${item}-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
