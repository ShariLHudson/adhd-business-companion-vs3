// Founder Ecosystem — Phase 16 Momentum Model (digital twin).
// What behaviors create progress for THIS founder — morning work, focus audio,
// project work, brainstorming, collaboration, research. Observational only.

import type { FounderEvent } from "../events";
import type { BehaviorDriver, MomentumModel } from "./digitalTwinTypes";
import { clamp, countType, hourOf } from "./digitalTwinUtil";

export function buildMomentumModel(events: FounderEvent[]): MomentumModel {
  const drivers: BehaviorDriver[] = [];
  const add = (factor: string, evidence: number, mult: number) => {
    if (evidence > 0) drivers.push({ factor, evidence, weight: clamp(evidence * mult) });
  };

  const completions = events.filter(
    (e) => e.type === "task.completed" || e.type === "focus.completed",
  );
  const morning = completions.filter((e) => hourOf(e.ts) < 12).length;
  add("Morning work", morning, 16);
  add("Focus sessions", countType(events, "focus.completed"), 18);
  add("Focus Audio", events.filter((e) => e.refs?.workspace === "focus-audio").length, 12);
  add("Time blocks", countType(events, "timeblock.created"), 14);
  add("Project work", events.filter((e) => e.type === "task.completed" && e.refs?.projectId).length, 12);
  add("Brainstorming / capture", countType(events, "note.captured"), 6);
  add("Research", countType(events, "research.completed"), 10);
  add("Coaching conversations", countType(events, "chat.coaching"), 4);

  drivers.sort((a, b) => b.weight - a.weight);
  const top = drivers[0];
  const observation = top
    ? `You tend to gain momentum from ${top.factor.toLowerCase()}.`
    : "Not enough activity yet to see what builds your momentum.";

  return { drivers, observation };
}
