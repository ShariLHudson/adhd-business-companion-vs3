// Founder Ecosystem — Phase 13 Momentum Pattern Engine.
// Learns what increases and decreases the founder's momentum from the event
// stream: focus sessions, time blocks, morning work, the project with the most
// pull (positive) vs. too many projects, email overload, task switching,
// decision overload (negative). Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import type { MomentumDriver, MomentumPatterns } from "./companionTypes";
import { hourOf } from "./companionUtil";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function detectMomentumPatterns(
  events: FounderEvent[],
  founderId: ID,
  intelOverride?: FounderIntelligence,
): MomentumPatterns {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = intelOverride ?? getFounderIntelligence(mine, founderId);

  const count = (t: FounderEvent["type"]) => mine.filter((e) => e.type === t).length;

  // ---- Positive drivers -------------------------------------------------
  const positive: MomentumDriver[] = [];
  const addPos = (factor: string, evidence: number, mult: number) => {
    if (evidence > 0) positive.push({ factor, direction: "positive", weight: clamp(evidence * mult), evidence });
  };
  addPos("Focus sessions", count("focus.completed"), 20);
  addPos("Time blocks", count("timeblock.created"), 15);
  addPos("Completing tasks", count("task.completed"), 18);

  // Morning work.
  const completions = mine.filter(
    (e) => e.type === "task.completed" || e.type === "focus.completed",
  );
  const morning = completions.filter((e) => hourOf(e.ts) < 12).length;
  addPos("Morning work", morning, 14);

  // Best project — most positive activity.
  const projActivity = new Map<ID, number>();
  for (const e of mine) {
    if (
      (e.type === "focus.completed" ||
        e.type === "task.completed" ||
        e.type === "document.created") &&
      e.refs?.projectId
    )
      projActivity.set(e.refs.projectId, (projActivity.get(e.refs.projectId) ?? 0) + 1);
  }
  let bestProject: MomentumPatterns["bestProject"] = null;
  if (projActivity.size) {
    const [id, ev] = [...projActivity.entries()].sort((a, b) => b[1] - a[1])[0];
    const label =
      (mine.find((e) => e.type === "project.created" && e.refs?.projectId === id)?.data
        ?.title as string) ?? "your top project";
    bestProject = { id, label };
    addPos(`Working on ${label}`, ev, 12);
  }

  // ---- Negative drivers -------------------------------------------------
  const negative: MomentumDriver[] = [];
  const addNeg = (factor: string, evidence: number, mult: number) => {
    if (evidence > 0) negative.push({ factor, direction: "negative", weight: clamp(evidence * mult), evidence });
  };

  const activeProjects = new Set(
    mine.filter((e) => e.type === "project.created").map((e) => e.refs?.projectId),
  ).size;
  if (activeProjects > 3) addNeg("Too many active projects", activeProjects - 3, 20);

  const emailOverload = mine.filter(
    (e) =>
      /email|inbox/i.test(String(e.data?.text ?? "")) &&
      (e.type === "note.captured" || e.type === "painpoint.observed" || e.type === "chat.coaching"),
  ).length;
  addNeg("Email overload", emailOverload, 12);

  const switching = intel.patterns.filter((p) => p.type === "project-switching").length;
  addNeg("Task switching", switching, 30);

  const openDecisions =
    count("decision.created") - count("decision.updated");
  if (openDecisions > 1) addNeg("Decision overload", openDecisions - 1, 16);

  const procrastination = intel.patterns.filter((p) => p.type === "procrastination-language").length;
  addNeg("Avoided tasks piling up", procrastination, 14);

  // ---- Best time of day -------------------------------------------------
  const buckets = { morning: 0, afternoon: 0, evening: 0 };
  for (const e of completions) {
    const h = hourOf(e.ts);
    if (h < 12) buckets.morning += 1;
    else if (h < 17) buckets.afternoon += 1;
    else buckets.evening += 1;
  }
  const bestTimeOfDay =
    completions.length === 0
      ? null
      : (Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0] as string);

  return {
    positive: positive.sort((a, b) => b.weight - a.weight),
    negative: negative.sort((a, b) => b.weight - a.weight),
    bestTimeOfDay,
    bestProject,
  };
}
