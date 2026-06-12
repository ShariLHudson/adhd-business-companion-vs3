"use client";

import type {
  ProjectIntelligence,
  ProjectIntelligenceDashboard,
  ProjectIssue,
  ProjectOpportunity,
} from "@/lib/founderWorkspace/intelligence";

function MiniList({
  title,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#d4cdc3] bg-white/80 p-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        {title}
      </h3>
      {isEmpty ? (
        <p className="mt-2 text-xs italic text-[#6b635a]">{empty}</p>
      ) : (
        <div className="mt-2 space-y-1.5 text-sm text-[#2d2926]">{children}</div>
      )}
    </div>
  );
}

export function ProjectIntelligenceDashboardCards({
  dashboard,
  analyses,
  onSelectProject,
}: {
  dashboard: ProjectIntelligenceDashboard;
  analyses: ProjectIntelligence[];
  onSelectProject: (projectId: string) => void;
}) {
  if (analyses.length === 0) return null;

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <MiniList
        title="Projects Needing Attention"
        empty="None right now."
        isEmpty={dashboard.needingAttention.length === 0}
      >
        {dashboard.needingAttention.slice(0, 4).map((a) => (
          <button
            key={a.project.id}
            type="button"
            onClick={() => onSelectProject(a.project.id)}
            className="block w-full text-left hover:text-[#1e4f4f]"
          >
            {a.project.title}{" "}
            <span className="text-[11px] text-[#a85c4a]">({a.healthLabel})</span>
          </button>
        ))}
      </MiniList>

      <MiniList
        title="Stalled Projects"
        empty="Nothing stalled."
        isEmpty={dashboard.stalled.length === 0}
      >
        {dashboard.stalled.slice(0, 4).map((a) => (
          <button
            key={a.project.id}
            type="button"
            onClick={() => onSelectProject(a.project.id)}
            className="block w-full text-left hover:text-[#1e4f4f]"
          >
            {a.project.title}
          </button>
        ))}
      </MiniList>

      <MiniList
        title="High Momentum"
        empty="Build momentum on a project."
        isEmpty={dashboard.highMomentum.length === 0}
      >
        {dashboard.highMomentum.slice(0, 4).map((a) => (
          <button
            key={a.project.id}
            type="button"
            onClick={() => onSelectProject(a.project.id)}
            className="block w-full text-left hover:text-[#1e4f4f]"
          >
            {a.project.title}{" "}
            <span className="text-[11px] text-[#1e4f4f]">
              ({a.momentum.score})
            </span>
          </button>
        ))}
      </MiniList>

      <MiniList
        title="Opportunities"
        empty="No open opportunities."
        isEmpty={dashboard.opportunities.length === 0}
      >
        {dashboard.opportunities.slice(0, 4).map((o: ProjectOpportunity) => (
          <p key={o.id} className="text-xs leading-snug">
            {o.idea}{" "}
            <span className="text-[#6b635a]">({o.potentialImpact})</span>
          </p>
        ))}
      </MiniList>

      <MiniList
        title="Open Issues"
        empty="No open issues."
        isEmpty={dashboard.openIssues.length === 0}
      >
        {dashboard.openIssues.slice(0, 4).map((issue: ProjectIssue) => (
          <p key={issue.id} className="text-xs leading-snug">
            {issue.problem}{" "}
            <span className="text-[#a85c4a]">({issue.severity})</span>
          </p>
        ))}
      </MiniList>
    </div>
  );
}
