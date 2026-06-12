// Founder Ecosystem — Phase 4 Recommendation Engine.
// Generates next-action suggestions from patterns, risks, momentum, and memory.
// HARD RULE: every recommendation carries a `reason` and `sourceEventIds` —
// it must be explainable and traceable to real events.

import type { FounderEvent, ID } from "../events";
import type {
  FounderInsight,
  FounderPattern,
  FounderRecommendation,
  FounderRisk,
  FounderWin,
  FounderMemory,
} from "./intelligenceTypes";
import { projectMentionEvents } from "./memory";

export type RecommendationContext = {
  patterns: FounderPattern[];
  risks: FounderRisk[];
  wins: FounderWin[];
  insights: FounderInsight[];
  memory: FounderMemory;
};

export function generateRecommendations(
  events: FounderEvent[],
  ctx: RecommendationContext,
): FounderRecommendation[] {
  const out: FounderRecommendation[] = [];

  // 1) Mentioned a project repeatedly but never scheduled time for it.
  const scheduledProjects = new Set(
    events
      .filter((e) => e.type === "timeblock.created" && e.refs?.projectId)
      .map((e) => e.refs!.projectId!),
  );
  for (const proj of ctx.memory.frequentProjects) {
    if (proj.mentions < 3 || scheduledProjects.has(proj.key)) continue;
    const evidence = projectMentionEvents(events, proj.key as ID);
    out.push({
      id: `rec-schedule-${proj.key}`,
      text: `You've come back to ${proj.label} ${proj.mentions} times but haven't scheduled time to work on it — want to block 60 minutes?`,
      reason: `${proj.label} was referenced ${proj.mentions} times with no time block created for it.`,
      confidence: proj.mentions >= 5 ? "high" : "medium",
      relatedObjectIds: [proj.key],
      sourceEventIds: evidence.map((e) => e.id).slice(0, 12),
    });
  }

  // 2) Schedule demanding work in the founder's best window.
  const timing = ctx.insights.find((i) => i.id === "ins-focus-timing");
  if (timing) {
    const window = timing.text.replace(/^Your focus sessions land best in /, "").replace(/\.$/, "");
    out.push({
      id: "rec-best-window",
      text: `Your focus lands best in ${window} — that's a good time to schedule outreach or deep work.`,
      reason: "Most of your completed focus sessions cluster in that part of the day.",
      confidence: "medium",
      relatedObjectIds: [],
      sourceEventIds: timing.sourceEventIds,
    });
  }

  // 3) Ride the project with the most momentum (recent wins).
  const winsByProject = new Map<ID, FounderWin[]>();
  for (const w of ctx.wins) {
    if (!w.projectId) continue;
    const list = winsByProject.get(w.projectId) ?? [];
    list.push(w);
    winsByProject.set(w.projectId, list);
  }
  const topProject = [...winsByProject.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )[0];
  if (topProject && topProject[1].length >= 2) {
    const [pid, pwins] = topProject;
    const title =
      (events.find(
        (e) => e.type === "project.created" && e.refs?.projectId === pid,
      )?.data?.title as string | undefined) ?? "one project";
    out.push({
      id: `rec-momentum-${pid}`,
      text: `The ${title} project has the most momentum right now — keep the next move on it.`,
      reason: `It accounts for ${pwins.length} of your recent wins.`,
      confidence: pwins.length >= 4 ? "high" : "medium",
      relatedObjectIds: [pid],
      sourceEventIds: pwins.flatMap((w) => w.sourceEventIds),
    });
  }

  // 4) Surface the single highest-severity risk as an actionable nudge.
  const topRisk = ctx.risks
    .slice()
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  if (topRisk) {
    out.push({
      id: `rec-risk-${topRisk.id}`,
      text: topRisk.suggestedAction,
      reason: topRisk.label,
      confidence: topRisk.severity === "high" ? "high" : "medium",
      relatedObjectIds: topRisk.relatedProjectIds,
      sourceEventIds: topRisk.sourceEventIds,
    });
  }

  return out;
}

function severityRank(s: "low" | "medium" | "high"): number {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}
