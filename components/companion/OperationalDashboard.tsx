"use client";

// Founder Ecosystem — Phase 6 Operational Dashboard.
//
// Self-contained, derived-from-events dashboard: top priorities per advisor,
// risks, opportunities, and live project progress, with one-tap Done / Skip
// that persists across sessions (founderActivityTracker → localStorage).
// Standalone — give it events + a founderId and it computes everything.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { FounderEvent } from "@/lib/ecosystem/events";
import { eventStore } from "@/lib/ecosystem/eventStore";
import { getFounderIntelligence } from "@/lib/ecosystem/intelligence";
import { ADVISORS, buildBoardSummary } from "@/lib/ecosystem/board";
import {
  buildExecutionPlan,
  stepsByAdvisor,
  founderActivityTracker,
  type ExecutionStep,
  type StepStatus,
} from "@/lib/ecosystem/ops";
import { getFounderDashboardData } from "@/lib/ecosystem/dashboardSelectors";
import { ActionDashboardPanel } from "@/components/companion/ActionDashboardPanel";

const LEVEL_COLOR: Record<string, string> = {
  high: "bg-[#a85c4a]/15 text-[#a85c4a]",
  medium: "bg-[#c08a3e]/15 text-[#9a6a1e]",
  low: "bg-[#1e4f4f]/10 text-[#1e4f4f]",
};

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function OperationalDashboard({
  events,
  founderId = "founder-001",
}: {
  events?: FounderEvent[];
  founderId?: string;
}) {
  const evts = useMemo(
    () => events ?? eventStore.query({ founderId }),
    [events, founderId],
  );

  const { intel, plan, summary, dashboard } = useMemo(() => {
    const intel = getFounderIntelligence(evts, founderId);
    const plan = buildExecutionPlan(intel, evts);
    return {
      intel,
      plan,
      summary: buildBoardSummary(intel),
      dashboard: getFounderDashboardData(evts, founderId),
    };
  }, [evts, founderId]);

  // Status state, seeded from the persistent tracker.
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  useEffect(() => {
    const records = founderActivityTracker.syncPlan(plan);
    setStatuses(Object.fromEntries(records.map((r) => [r.id, r.status])));
  }, [plan]);

  function update(id: string, status: StepStatus) {
    founderActivityTracker.setStatus(id, status);
    setStatuses((s) => ({ ...s, [id]: status }));
  }

  const grouped = stepsByAdvisor(plan);
  const stalledIds = new Set(
    intel.risks
      .filter((r) => r.type === "project-stalled")
      .flatMap((r) => r.relatedProjectIds),
  );
  const alerts = intel.risks.filter(
    (r) => r.severity === "high" || r.type === "task-overdue",
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <header>
        <h2 className="text-2xl font-semibold text-[#1f1c19]">Founder Board</h2>
        <p className="mt-1 text-sm text-[#6b635a]">
          Most active advisor:{" "}
          <span className="font-semibold text-[#1e4f4f]">
            {summary.mostActiveAdvisor
              ? ADVISORS[summary.mostActiveAdvisor].name
              : "—"}
          </span>
        </p>
      </header>

      {/* Alerts strip — high-priority / overdue */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border-2 border-[#a85c4a]/40 bg-[#a85c4a]/[0.06] p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-[#a85c4a]">
            ⚠ Needs attention
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {alerts.map((r) => (
              <li key={r.id} className="text-sm text-[#2d2926]">
                <span className="font-semibold">{r.label}</span> — {r.suggestedAction}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top priorities per advisor */}
        <Panel title="Top priorities by advisor">
          <div className="flex flex-col gap-3">
            {Object.entries(grouped).map(([advisor, steps]) => (
              <div key={advisor}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
                  {ADVISORS[advisor as keyof typeof ADVISORS].name}
                </p>
                <div className="mt-1 flex flex-col gap-1.5">
                  {steps.map((s: ExecutionStep) => {
                    const st = statuses[s.id] ?? "pending";
                    return (
                      <div
                        key={s.id}
                        className={`rounded-xl border border-[#e4ddd2] bg-white px-3 py-2 ${
                          st !== "pending" ? "opacity-60" : ""
                        }`}
                      >
                        <p className="text-sm text-[#1f1c19]">
                          {st === "done" ? "✓ " : st === "skipped" ? "↷ " : ""}
                          {s.action}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_COLOR[s.effort]}`}
                          >
                            {s.effort} effort
                          </span>
                          {s.context.projectTitle && (
                            <span className="text-xs text-[#9a8f82]">
                              {s.context.projectTitle}
                            </span>
                          )}
                          {st === "pending" && (
                            <span className="ml-auto flex gap-1">
                              <button
                                type="button"
                                onClick={() => update(s.id, "done")}
                                className="rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
                              >
                                Done
                              </button>
                              <button
                                type="button"
                                onClick={() => update(s.id, "skipped")}
                                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#9a8f82] hover:bg-[#1e4f4f]/10"
                              >
                                Skip
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {plan.length === 0 && (
              <p className="text-sm text-[#9a8f82]">
                No advisor actions right now — you&apos;re clear.
              </p>
            )}
          </div>
        </Panel>

        {/* Project progress */}
        <Panel title="Active projects">
          <div className="flex flex-col gap-3">
            {dashboard.activeProjects.map((p) => {
              const pct = Math.round((p.progressEstimate ?? 0) * 100);
              const stalled = stalledIds.has(p.projectId);
              return (
                <div key={p.projectId}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1f1c19]">
                      {p.name}
                    </span>
                    {stalled ? (
                      <span className="rounded-full bg-[#a85c4a]/15 px-2 py-0.5 text-xs font-semibold text-[#a85c4a]">
                        Stalled
                      </span>
                    ) : (
                      <span className="text-xs text-[#9a8f82]">{pct}%</span>
                    )}
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#1e4f4f]/10">
                    <div
                      className={`h-full rounded-full ${stalled ? "bg-[#a85c4a]" : "bg-[#1e4f4f]"}`}
                      style={{ width: `${stalled ? 100 : pct}%` }}
                    />
                  </div>
                  {p.nextAction && (
                    <p className="mt-1 text-xs text-[#6b635a]">Next: {p.nextAction}</p>
                  )}
                </div>
              );
            })}
            {dashboard.activeProjects.length === 0 && (
              <p className="text-sm text-[#9a8f82]">No active projects.</p>
            )}
          </div>
        </Panel>

        {/* Risks */}
        <Panel title="Risks (productivity & wellness)">
          {intel.risks.length === 0 ? (
            <p className="text-sm text-[#9a8f82]">Nothing flagged. 🌿</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {intel.risks.map((r) => (
                <li key={r.id} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_COLOR[r.severity]}`}
                  >
                    {r.severity}
                  </span>
                  <span className="text-sm text-[#2d2926]">{r.label}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Opportunities */}
        <Panel title="Opportunities (CEO & marketing)">
          {summary.topOpportunities.length === 0 ? (
            <p className="text-sm text-[#9a8f82]">None captured yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary.topOpportunities.map((o) => (
                <li key={o.id} className="text-sm text-[#2d2926]">
                  💡 {o.text}{" "}
                  <span className="text-xs text-[#9a8f82]">({o.status})</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <ActionDashboardPanel events={evts} founderId={founderId} />
    </div>
  );
}
