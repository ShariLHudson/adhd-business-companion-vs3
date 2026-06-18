"use client";

import { useMemo, type ReactNode } from "react";
import type { FounderEvent } from "@/lib/ecosystem/events";
import { eventStore } from "@/lib/ecosystem/eventStore";
import { buildCommandCenterState } from "@/lib/ecosystem/commandCenter/commandCenterEngine";
import type { FounderAction } from "@/lib/ecosystem/actions/actionTypes";
import { NextActionPanel } from "./NextActionPanel";
import { FounderBoardPanel } from "./FounderBoardPanel";
import { LearningDashboardPanel } from "./LearningDashboardPanel";
import { NetworkDashboardPanel } from "./NetworkDashboardPanel";

function Panel({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-[#d4cdc3] bg-white/90 shadow-sm"
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#6b635a] marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
      </summary>
      <div className="border-t border-[#e4ddd2] px-4 pb-4 pt-2">{children}</div>
    </details>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#1e4f4f]/[0.05] px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-[#6b635a]">{label}</p>
      <p className="text-sm font-semibold capitalize text-[#1f1c19]">{value}</p>
    </div>
  );
}

export function FounderCommandCenter({
  events,
  founderId = "founder-001",
  title = "Founder Workspace",
  subtitle = "What matters · What's stuck · What's next",
  showAdminSections = false,
  onWorkOnNext,
  onResume,
  onOpenSection,
}: {
  events?: FounderEvent[];
  founderId?: string;
  title?: string;
  subtitle?: string;
  /** Learning & network panels — founder/admin workspace only. */
  showAdminSections?: boolean;
  onWorkOnNext?: (action: FounderAction | null) => void;
  onResume?: () => void;
  onOpenSection?: (section: string) => void;
}) {
  const evts = useMemo(
    () => events ?? eventStore.query({ founderId }),
    [events, founderId],
  );

  const cc = useMemo(
    () => buildCommandCenterState(evts, founderId),
    [evts, founderId],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 py-5 sm:px-4">
      <header>
        <h1 className="text-2xl font-semibold text-[#1f1c19]">{title}</h1>
        <p className="mt-1 text-sm text-[#6b635a]">{subtitle}</p>
      </header>

      <NextActionPanel
        nextAction={cc.nextAction}
        onWork={() => onWorkOnNext?.(cc.nextAction.action)}
      />

      <Panel title="Today" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cc.today.focus ? <Stat label="Focus" value={cc.today.focus} /> : null}
          {cc.today.topPriority ? (
            <Stat label="Top priority" value={cc.today.topPriority} />
          ) : null}
          {cc.today.currentProject ? (
            <Stat label="Project" value={cc.today.currentProject} />
          ) : null}
          <Stat label="Stage" value={cc.today.stageLabel} />
          <Stat label="Capacity" value={cc.today.capacityLevel} />
          <Stat label="Momentum" value={cc.today.momentumDirection} />
        </div>
      </Panel>

      <Panel title="Morning briefing" defaultOpen={false}>
        <p className="text-sm font-medium text-[#1f1c19]">{cc.briefing.headline}</p>
        {cc.briefing.mostImportantGoal ? (
          <p className="mt-2 text-sm text-[#6b635a]">
            Goal: {cc.briefing.mostImportantGoal}
          </p>
        ) : null}
        {cc.briefing.projectsNeedingAttention.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#6b635a]">
            {cc.briefing.projectsNeedingAttention.map((p) => (
              <li key={p.name}>
                {p.name} — {p.reason}
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <Panel title="Current work" defaultOpen={false}>
        <ul className="flex flex-col gap-1 text-sm text-[#2d2926]">
          {cc.currentWork.project ? <li>Project: {cc.currentWork.project}</li> : null}
          {cc.currentWork.document ? <li>Document: {cc.currentWork.document}</li> : null}
          {cc.currentWork.timeBlock ? <li>Time block: {cc.currentWork.timeBlock}</li> : null}
          {cc.currentWork.focusSession ? (
            <li>Focus: {cc.currentWork.focusSession}</li>
          ) : null}
          {cc.currentWork.openWorkspace ? (
            <li>Open: {cc.currentWork.openWorkspace}</li>
          ) : null}
        </ul>
        {cc.currentWork.canResume && onResume ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResume}
              className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Resume
            </button>
          </div>
        ) : null}
      </Panel>

      <FounderBoardPanel board={cc.advisorBoard} />

      {cc.projects.length > 0 ? (
        <Panel title="Projects needing attention" defaultOpen={false}>
          <ul className="flex flex-col gap-2">
            {cc.projects.map((p) => (
              <li
                key={p.projectId}
                className="rounded-xl border border-[#e4ddd2] px-3 py-2 text-sm"
              >
                <span className="font-semibold text-[#1f1c19]">{p.name}</span>
                <span className="ml-2 text-xs text-[#a85c4a]">{p.status}</span>
                {p.nextAction ? (
                  <p className="mt-1 text-xs text-[#6b635a]">Next: {p.nextAction}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {cc.opportunities.length > 0 ? (
        <Panel title="Opportunities" defaultOpen={false}>
          <ul className="flex flex-col gap-1.5 text-sm text-[#2d2926]">
            {cc.opportunities.map((o) => (
              <li key={o.id}>💡 {o.text}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {cc.decisions.length > 0 ? (
        <Panel title="Open decisions" defaultOpen={false}>
          <ul className="flex flex-col gap-2 text-sm">
            {cc.decisions.map((d) => (
              <li key={d.id} className="rounded-xl border border-[#e4ddd2] px-3 py-2">
                <p className="font-medium text-[#1f1c19]">{d.decision}</p>
                <p className="text-xs text-[#6b635a]">
                  {d.status}
                  {d.project ? ` · ${d.project}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Momentum" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Wins this week" value={String(cc.momentum.winsThisWeek)} />
          <Stat
            label="Tasks done"
            value={String(cc.momentum.tasksCompleted)}
          />
          <Stat label="Focus sessions" value={String(cc.momentum.focusSessions)} />
          <Stat label="Trend" value={cc.momentum.trendDirection} />
        </div>
      </Panel>

      <Panel title="Capacity" defaultOpen={false}>
        <p className="text-sm text-[#2d2926]">{cc.capacity.recommendationText}</p>
        <p className="mt-2 text-xs text-[#6b635a]">
          Load: {cc.capacity.attentionLoad} · {cc.capacity.commitmentLoad} commitments
        </p>
      </Panel>

      {showAdminSections ? (
        <>
          <Panel title="Learning & optimization" defaultOpen={false}>
            <LearningDashboardPanel events={evts} founderId={founderId} />
          </Panel>

          <Panel title="Network intelligence" defaultOpen={false}>
            <NetworkDashboardPanel events={evts} founderId={founderId} />
          </Panel>
        </>
      ) : null}
    </div>
  );
}
