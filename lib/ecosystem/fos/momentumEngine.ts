// Founder Ecosystem — Phase 8 Momentum Engine.
// Are things moving? Compares this week's completions/wins/focus to last week's
// and returns a score, the raw trend delta, and a direction. Pure.

import type { FounderEvent, ID } from "../events";
import type { MomentumDirection, MomentumState } from "./fosTypes";
import { clamp, countIn, distinctProjectsIn, rollingWindow } from "./fosUtil";
import type { Window } from "./fosUtil";

const rawMomentum = (events: FounderEvent[], w: Window) => {
  const tasks = countIn(events, "task.completed", w);
  const wins =
    tasks +
    countIn(events, "project.completed", w) +
    countIn(events, "document.exported", w);
  const focus = countIn(events, "focus.completed", w);
  const blocks = countIn(events, "timeblock.completed", w);
  const advanced = distinctProjectsIn(
    events,
    ["task.completed", "focus.completed", "document.created", "document.exported"],
    w,
  );
  const raw = tasks * 3 + advanced * 4 + wins * 2 + focus * 3 + blocks * 2;
  return { raw, tasks, wins, focus, blocks, advanced };
};

export function computeMomentum(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
  days = 7,
): MomentumState {
  const mine = events.filter((e) => e.founderId === founderId);
  const { cur, prev } = rollingWindow(now, days);
  const c = rawMomentum(mine, cur);
  const p = rawMomentum(mine, prev);

  const trend = c.raw - p.raw;
  const direction: MomentumDirection =
    trend > 1 ? "rising" : trend < -1 ? "falling" : "steady";

  return {
    score: clamp(c.raw * 4),
    trend,
    direction,
    tasksCompleted: c.tasks,
    projectsAdvanced: c.advanced,
    wins: c.wins,
    focusSessions: c.focus,
    timeBlocksCompleted: c.blocks,
  };
}
