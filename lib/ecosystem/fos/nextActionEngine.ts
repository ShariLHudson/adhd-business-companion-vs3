// Founder Ecosystem — Phase 8 Next Action Engine.
// Every project always has a single, concrete next action. Derived from the
// memory project (open task / next step), its risks, and recent focus activity.
// Pure.

import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type { FounderMemory, ProjectMemory } from "../memory/memoryTypes";
import type { ProjectHealth, NextAction } from "./fosTypes";

/** The next best action for one project — never empty. */
export function nextActionForProject(
  project: ProjectMemory,
  health: ProjectHealth | undefined,
  intel: FounderIntelligence,
): NextAction {
  // 1) An open task with a concrete next step.
  if (project.nextStep) {
    return {
      projectId: project.projectId,
      type: "finish-task",
      action: `Finish: ${project.nextStep}`,
      rationale: "It's the open task closest to done on this project.",
    };
  }

  // 2) An open risk → address it with the intelligence layer's suggestion.
  const risk = intel.risks.find((r) => r.relatedProjectIds.includes(project.projectId));
  if (risk) {
    return {
      projectId: project.projectId,
      type: "address-risk",
      action: risk.suggestedAction,
      rationale: risk.label,
    };
  }

  // 3) Stalled → get it moving with a focus session.
  if (health && (health.rating === "stalled" || health.velocity === 0)) {
    return {
      projectId: project.projectId,
      type: "schedule-focus",
      action: `Schedule a focus session on ${project.name}`,
      rationale: "It's gone quiet — a short block restarts momentum.",
    };
  }

  // 4) Otherwise keep it warm.
  return {
    projectId: project.projectId,
    type: "review",
    action: `Review ${project.name} and pick the next step`,
    rationale: "No open task captured yet.",
  };
}

export function nextActionsForAll(
  memory: FounderMemory,
  health: ProjectHealth[],
  intel: FounderIntelligence,
): NextAction[] {
  const healthById = new Map(health.map((h) => [h.projectId, h]));
  return memory.projects.map((p) =>
    nextActionForProject(p, healthById.get(p.projectId), intel),
  );
}
