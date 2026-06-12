// Founder Ecosystem — Phase 8 Priority Engine.
// Scores and ranks what deserves attention right now from project health,
// risks, goal alignment, momentum and capacity. Returns a ranked list, each
// with a recommended action and the reasons behind the score. Pure.

import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type { FounderMemory } from "../memory/memoryTypes";
import { nextActionForProject } from "./nextActionEngine";
import type {
  CapacityState,
  PriorityItem,
  ProjectHealth,
} from "./fosTypes";
import { clamp } from "./fosUtil";

const tokens = (s: string) =>
  new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
const overlaps = (a: string, b: string) => {
  const A = tokens(a);
  for (const t of tokens(b)) if (A.has(t)) return true;
  return false;
};

export function computePriorities(
  memory: FounderMemory,
  health: ProjectHealth[],
  intel: FounderIntelligence,
  capacity: CapacityState,
  topGoal: string | null,
): PriorityItem[] {
  const healthById = new Map(health.map((h) => [h.projectId, h]));

  const scored = memory.projects.map((p) => {
    const h = healthById.get(p.projectId);
    const reasons: string[] = [];
    let score = 50;

    const riskCount = h?.riskCount ?? 0;
    if (riskCount > 0) {
      score += riskCount * 12;
      reasons.push(`${riskCount} open risk${riskCount > 1 ? "s" : ""}`);
    }
    if (h?.rating === "stalled") {
      score += 10;
      reasons.push("stalled — needs a push");
    }
    if (h?.progress !== null && h?.progress !== undefined && h.progress < 0.5) {
      score += 8;
      reasons.push("under halfway");
    }
    if (h && h.progress !== null && h.progress >= 1) {
      score -= 25;
      reasons.push("already complete");
    }
    if (topGoal && overlaps(p.name, topGoal)) {
      score += 12;
      reasons.push(`aligned with top goal`);
    }
    if (h && h.velocity > 0) {
      score += Math.min(h.velocity, 4) * 2;
      reasons.push("has momentum");
    }
    // Low capacity → favour the project with the smallest concrete next step
    // (open task) over big stalled ones, to protect against overload.
    if (capacity.level === "low" && p.nextStep) {
      score += 6;
      reasons.push("small next step fits low capacity");
    }

    return {
      projectId: p.projectId,
      name: p.name,
      score: clamp(Math.round(score)),
      rank: 0,
      recommendedAction: nextActionForProject(p, h, intel).action,
      reasons,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item, i) => ({ ...item, rank: i + 1 }));
}
