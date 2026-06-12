// Founder Ecosystem — Phase 16 Overwhelm Model (digital twin).
// What consistently causes slowdown for THIS founder — too many projects, email
// overload, decision fatigue, large task lists, context switching. Observational
// only; never a clinical claim.

import type { FounderEvent } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type { BehaviorDriver, OverwhelmModel } from "./digitalTwinTypes";
import { clamp, countType } from "./digitalTwinUtil";

export function buildOverwhelmModel(
  events: FounderEvent[],
  intel: FounderIntelligence,
): OverwhelmModel {
  const triggers: BehaviorDriver[] = [];
  const add = (factor: string, evidence: number, mult: number) => {
    if (evidence > 0) triggers.push({ factor, evidence, weight: clamp(evidence * mult) });
  };

  const projects = new Set(
    events.filter((e) => e.type === "project.created").map((e) => e.refs?.projectId),
  ).size;
  if (projects > 3) add("Too many projects", projects - 3, 18);

  const email = events.filter(
    (e) => /email|inbox/i.test(String(e.data?.text ?? "")) &&
      (e.type === "note.captured" || e.type === "painpoint.observed" || e.type === "chat.coaching"),
  ).length;
  add("Email overload", email, 12);

  const openDecisions = countType(events, "decision.created") - countType(events, "decision.updated");
  if (openDecisions > 1) add("Decision fatigue", openDecisions - 1, 14);

  // Large task lists: days with many captures.
  const byDay = new Map<string, number>();
  for (const e of events.filter((e) => e.type === "note.captured"))
    byDay.set(e.ts.slice(0, 10), (byDay.get(e.ts.slice(0, 10)) ?? 0) + 1);
  add("Large task lists", [...byDay.values()].filter((n) => n >= 4).length, 16);

  add(
    "Context switching",
    intel.patterns.filter((p) => p.type === "project-switching").length,
    24,
  );
  add(
    "Avoided / overwhelming tasks",
    intel.patterns.filter((p) => p.type === "procrastination-language" || p.type === "low-energy-checkins").length,
    12,
  );

  triggers.sort((a, b) => b.weight - a.weight);
  const top = triggers[0];
  const observation = top
    ? `It appears ${top.factor.toLowerCase()} tends to slow you down.`
    : "No consistent slowdown pattern has emerged yet.";

  return { triggers, observation };
}
