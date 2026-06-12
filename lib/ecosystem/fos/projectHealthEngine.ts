// Founder Ecosystem — Phase 8 Project Health Engine.
// Rates every project healthy / needs-attention / at-risk / stalled from its
// progress, risks, recency and recent activity (velocity). Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type { FounderMemory } from "../memory/memoryTypes";
import type { ProjectHealth, ProjectHealthRating } from "./fosTypes";
import { clamp, DAY, inWin } from "./fosUtil";

const STALL_DAYS = 14;
const STALE_DAYS = 5;

export function computeProjectHealth(
  memory: FounderMemory,
  intel: FounderIntelligence,
  events: FounderEvent[],
  now: Date = new Date(),
): ProjectHealth[] {
  const win = { start: now.getTime() - 7 * DAY, end: now.getTime() };

  return memory.projects.map((p) => {
    const done = p.tasks.filter((t) => t.done).length;
    const total = p.tasks.length;
    const progress = total > 0 ? done / total : null;
    const riskCount = intel.risks.filter((r) => r.relatedProjectIds.includes(p.projectId)).length;
    const velocity = events.filter(
      (e) => e.refs?.projectId === p.projectId && inWin(e.ts, win),
    ).length;
    const daysSinceActivity = p.lastActivity
      ? Math.floor((now.getTime() - new Date(p.lastActivity).getTime()) / DAY)
      : null;

    const complete = total > 0 && done === total;
    const reasons: string[] = [];
    let rating: ProjectHealthRating;
    let status: ProjectHealth["status"];

    if (complete) {
      rating = "healthy";
      status = "complete";
      reasons.push("all tasks done");
    } else if (daysSinceActivity !== null && daysSinceActivity > STALL_DAYS) {
      rating = "stalled";
      status = "stalled";
      reasons.push(`no activity in ${daysSinceActivity} days`);
    } else if (riskCount > 0) {
      rating = "at-risk";
      status = "active";
      reasons.push(`${riskCount} open risk${riskCount > 1 ? "s" : ""}`);
    } else if (
      progress !== null &&
      progress < 0.5 &&
      daysSinceActivity !== null &&
      daysSinceActivity > STALE_DAYS
    ) {
      rating = "needs-attention";
      status = "active";
      reasons.push("low progress and going quiet");
    } else {
      rating = "healthy";
      status = "active";
      reasons.push(velocity > 0 ? "active recently" : "on track");
    }

    let healthScore = 70;
    healthScore -= riskCount * 15;
    if (rating === "stalled") healthScore -= 20;
    if (progress !== null) healthScore += progress * 20;
    healthScore += Math.min(velocity, 5) * 3;

    return {
      projectId: p.projectId,
      name: p.name,
      rating,
      healthScore: clamp(Math.round(healthScore)),
      progress,
      riskCount,
      velocity,
      lastActivity: p.lastActivity,
      daysSinceActivity,
      status,
      reasons,
    };
  });
}
