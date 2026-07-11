// Founder Ecosystem — Phase 13 Overwhelm Pattern Engine.
// Learns what tends to trigger overwhelm — large task lists, unclear
// priorities, multiple deadlines, too many open decisions — with frequency,
// severity and supportive recovery methods (tools, never therapy). Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import type { Level, OverwhelmPatterns, OverwhelmTrigger } from "./companionTypes";

const severityFromFrequency = (n: number): Level => (n >= 5 ? "high" : n >= 2 ? "medium" : "low");

const DAY = 86_400_000;

export function detectOverwhelmPatterns(
  events: FounderEvent[],
  founderId: ID,
  intelOverride?: FounderIntelligence,
): OverwhelmPatterns {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = intelOverride ?? getFounderIntelligence(mine, founderId);
  const triggers: OverwhelmTrigger[] = [];

  // Large task lists: days where many items were captured at once.
  const capturesByDay = new Map<string, number>();
  for (const e of mine.filter((e) => e.type === "note.captured")) {
    const day = e.ts.slice(0, 10);
    capturesByDay.set(day, (capturesByDay.get(day) ?? 0) + 1);
  }
  const bigListDays = [...capturesByDay.values()].filter((n) => n >= 4).length;
  if (bigListDays > 0)
    triggers.push({
      trigger: "Large task lists captured at once",
      frequency: bigListDays,
      severity: severityFromFrequency(bigListDays),
      recoveryMethods: ["Clear My Mind to offload", "Pick one next step", "Spin the Wheel to choose"],
    });

  // Explicit overwhelm pain points.
  const overwhelmHits = mine.filter(
    (e) => e.type === "painpoint.observed" && /overwhelm|too much|drowning|everything at once/i.test(String(e.data?.text ?? "")),
  ).length +
    intel.patterns.filter((p) => p.type === "low-energy-checkins").length;
  if (overwhelmHits > 0)
    triggers.push({
      trigger: "Feeling there's too much at once",
      frequency: overwhelmHits,
      severity: severityFromFrequency(overwhelmHits),
      recoveryMethods: ["Breathe", "Clear My Mind", "One small next step"],
    });

  // Unclear priorities: repeated "too much to do" without a chosen focus.
  const unclear = mine.filter(
    (e) => e.type === "chat.coaching" && /too much to do|don'?t know where to start|so much|priorit/i.test(String(e.data?.text ?? e.userMessage ?? "")),
  ).length;
  if (unclear > 0)
    triggers.push({
      trigger: "Unclear priorities",
      frequency: unclear,
      severity: severityFromFrequency(unclear),
      recoveryMethods: ["Name today's one most important thing", "Time Block the top item"],
    });

  // Multiple deadlines: time blocks clustered into a single day.
  const blocksByDay = new Map<string, number>();
  for (const e of mine.filter((e) => e.type === "timeblock.created")) {
    const day = e.ts.slice(0, 10);
    blocksByDay.set(day, (blocksByDay.get(day) ?? 0) + 1);
  }
  const packedDays = [...blocksByDay.values()].filter((n) => n >= 4).length;
  if (packedDays > 0)
    triggers.push({
      trigger: "Multiple deadlines / a packed day",
      frequency: packedDays,
      severity: severityFromFrequency(packedDays),
      recoveryMethods: ["Protect one focus block", "Move a block to tomorrow"],
    });

  // Too many open decisions.
  const openDecisions =
    mine.filter((e) => e.type === "decision.created").length -
    mine.filter((e) => e.type === "decision.updated").length;
  if (openDecisions > 2)
    triggers.push({
      trigger: "Too many open decisions",
      frequency: openDecisions,
      severity: severityFromFrequency(openDecisions),
      recoveryMethods: ["Decide the smallest one first", "Pick Then Learn"],
    });

  return { triggers: triggers.sort((a, b) => b.frequency - a.frequency) };
}

/** Convenience: only the high-severity triggers, for alerting. */
export function highSeverityTriggers(p: OverwhelmPatterns): OverwhelmTrigger[] {
  return p.triggers.filter((t) => t.severity === "high");
}

export const RECENT_WINDOW_DAYS = 30;
export const recentCutoffIso = (now = new Date()) =>
  new Date(now.getTime() - RECENT_WINDOW_DAYS * DAY).toISOString();
