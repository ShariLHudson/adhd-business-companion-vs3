// Founder Ecosystem — Phase 16 Digital Twin helpers. Pure.

import type { FounderEvent } from "../events";
import { eventText } from "../intelligence/signals";
import type { Confidence, Scored } from "./digitalTwinTypes";

export { eventText };
export const hourOf = (ts: string) => new Date(ts).getUTCHours();
export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Confidence from how much evidence supports a signal. */
export function confidenceFromEvidence(n: number): Confidence {
  if (n >= 6) return "high";
  if (n >= 3) return "medium";
  return "low";
}

export function scoreTexts(
  texts: string[],
  res: Record<string, RegExp>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of Object.keys(res)) out[k] = 0;
  for (const t of texts) for (const k of Object.keys(res)) if (t && res[k].test(t)) out[k] += 1;
  return out;
}

/** Turn a score map into sorted, scored traits above a threshold. */
export function scoredTraits<T extends string>(
  scores: Record<string, number>,
  min = 1,
): Scored<T>[] {
  return Object.entries(scores)
    .filter(([, v]) => v >= min)
    .sort((a, b) => b[1] - a[1])
    .map(([value, score]) => ({
      value: value as T,
      score,
      confidence: confidenceFromEvidence(score),
    }));
}

export function chatTexts(events: FounderEvent[]): string[] {
  return events
    .filter((e) => e.type === "chat.coaching" || e.type === "note.captured")
    .map(eventText)
    .filter(Boolean);
}

export const countType = (events: FounderEvent[], type: FounderEvent["type"]) =>
  events.filter((e) => e.type === type).length;

/** Average gap in days between matched created/resolved pairs (by ref id). */
export function avgResolutionDays(
  events: FounderEvent[],
  createdType: FounderEvent["type"],
  resolvedType: FounderEvent["type"],
  idKey: "decisionId" | "taskId",
): number | null {
  const created = new Map<string, number>();
  for (const e of events)
    if (e.type === createdType && e.refs?.[idKey])
      created.set(e.refs[idKey]!, new Date(e.ts).getTime());
  const gaps: number[] = [];
  for (const e of events)
    if (e.type === resolvedType && e.refs?.[idKey] && created.has(e.refs[idKey]!))
      gaps.push((new Date(e.ts).getTime() - created.get(e.refs[idKey]!)!) / 86_400_000);
  if (!gaps.length) return null;
  return gaps.reduce((a, b) => a + b, 0) / gaps.length;
}
