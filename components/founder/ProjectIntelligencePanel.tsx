"use client";

import type { ProjectIntelligence } from "@/lib/founderWorkspace/intelligence";
import { linkTargetLabel } from "@/lib/founderWorkspace/intelligence/projectRelationships";

function healthClass(health: ProjectIntelligence["health"]): string {
  switch (health) {
    case "healthy":
      return "bg-[#1e4f4f]/12 text-[#1e4f4f]";
    case "needs_attention":
      return "bg-[#e8c547]/25 text-[#7a5c00]";
    case "at_risk":
      return "bg-[#e0795a]/20 text-[#a85c4a]";
    case "stalled":
      return "bg-[#6b635a]/15 text-[#6b635a]";
  }
}

export function ProjectIntelligencePanel({
  intelligence,
}: {
  intelligence: ProjectIntelligence;
}) {
  return (
    <div className="mt-3 rounded-lg border border-[#ebe4d9] bg-[#faf8f4] p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${healthClass(intelligence.health)}`}
        >
          {intelligence.healthLabel}
        </span>
        <span className="text-[#6b635a]">
          {intelligence.completionScore}% complete
        </span>
        <span className="text-[#6b635a]">
          Momentum {intelligence.momentum.score}
        </span>
      </div>

      <p className="mt-2 font-medium text-[#1e4f4f]">
        Next step: {intelligence.nextStep}
      </p>

      {intelligence.blockers.length > 0 ? (
        <p className="mt-1 text-[#a85c4a]">
          Risk: {intelligence.blockers[0]}
        </p>
      ) : intelligence.risks[0] ? (
        <p className="mt-1 text-[#7a5c00]">Watch: {intelligence.risks[0]}</p>
      ) : null}

      {intelligence.topOpportunity ? (
        <p className="mt-1 text-[#2d2926]">
          Opportunity: {intelligence.topOpportunity.idea} (
          {intelligence.topOpportunity.potentialImpact} impact)
        </p>
      ) : null}

      {intelligence.openIssues.length > 0 ? (
        <p className="mt-1 text-[#6b635a]">
          {intelligence.openIssues.length} open issue
          {intelligence.openIssues.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {intelligence.relationships.length > 0 ? (
        <p className="mt-1 text-[#6b635a]">
          Linked:{" "}
          {intelligence.relationships
            .slice(0, 3)
            .map((l) => `${linkTargetLabel(l.targetKind)}: ${l.label}`)
            .join(" · ")}
        </p>
      ) : null}

      <p className="mt-2 text-[11px] text-[#6b635a]">
        {intelligence.recentActivity[0]}
      </p>
    </div>
  );
}
