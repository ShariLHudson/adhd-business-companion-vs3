// Founder Ecosystem — Phase 12 Morning Briefing for the Command Center.
// Composes the Phase 8 briefing engine + open decisions from memory.

import type { FounderEvent, ID } from "../events";
import { morningBriefing } from "../fos/briefingEngine";
import type { FounderOperatingState } from "../fos/fosTypes";
import { buildFounderMemory } from "../memory/founderMemoryEngine";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type { CommandCenterBriefing } from "./commandCenterTypes";

export function generateMorningBriefing(
  state: FounderOperatingState,
  events: FounderEvent[],
  founderId: ID,
  intel?: FounderIntelligence,
  now: Date = new Date(),
): CommandCenterBriefing {
  const briefing = morningBriefing(state, now);
  const memory = buildFounderMemory(
    events.filter((e) => e.founderId === founderId),
    founderId,
    intel,
  );

  const openDecisions = memory.decisions
    .filter((d) => !/decided|done|complete/i.test(d.status))
    .slice(0, 5)
    .map((d) => {
      const projectId = d.relatedProjectIds[0];
      const project = projectId
        ? memory.projects.find((p) => p.projectId === projectId)
        : undefined;
      return {
        decision: d.decision,
        status: d.status,
        project: project?.name,
      };
    });

  return {
    headline: briefing.headline,
    mostImportantGoal: briefing.topGoal,
    projectsNeedingAttention: briefing.projectsNeedingAttention.map((p) => ({
      name: p.name,
      reason: p.reason,
    })),
    risks: briefing.risks,
    opportunities: briefing.opportunities,
    openDecisions,
    recommendedAction: briefing.recommendedNextAction,
  };
}
