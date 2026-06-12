// Founder Ecosystem — Phase 8 internal helpers (windowing + counting). Pure.

import type { FounderEvent } from "../events";

export const DAY = 86_400_000;
export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export type Window = { start: number; end: number };

export const rollingWindow = (now: Date, days: number): { cur: Window; prev: Window } => {
  const end = now.getTime();
  const span = days * DAY;
  return {
    cur: { start: end - span, end },
    prev: { start: end - 2 * span, end: end - span },
  };
};

export const inWin = (ts: string, w: Window) => {
  const t = new Date(ts).getTime();
  return t > w.start && t <= w.end;
};

export const countIn = (events: FounderEvent[], type: FounderEvent["type"], w: Window) =>
  events.filter((e) => e.type === type && inWin(e.ts, w)).length;

export const distinctProjectsIn = (
  events: FounderEvent[],
  types: FounderEvent["type"][],
  w: Window,
) => {
  const set = new Set<string>();
  for (const e of events)
    if (types.includes(e.type) && inWin(e.ts, w) && e.refs?.projectId)
      set.add(e.refs.projectId);
  return set.size;
};

export const num = (v: unknown) => (typeof v === "number" ? v : undefined);
