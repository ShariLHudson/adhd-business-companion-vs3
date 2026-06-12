// Founder Ecosystem — Phase 4 Win Engine.
// Captures positive momentum from completion events. Every win is explainable
// (carries the event it came from).

import type { FounderEvent } from "../events";
import type { FounderWin, Level, WinType } from "./intelligenceTypes";

const WIN_MAP: Partial<
  Record<FounderEvent["type"], { type: WinType; impact: Level }>
> = {
  "task.completed": { type: "task-completed", impact: "medium" },
  "project.completed": { type: "project-milestone", impact: "high" },
  "focus.completed": { type: "focus-completed", impact: "low" },
  "document.exported": { type: "document-finished", impact: "high" },
  "timeblock.completed": { type: "timeblock-completed", impact: "medium" },
};

export function detectWins(events: FounderEvent[]): FounderWin[] {
  const wins: FounderWin[] = [];
  for (const e of events) {
    const mapped = WIN_MAP[e.type];
    if (!mapped) continue;
    wins.push({
      id: `win-${e.id}`,
      type: mapped.type,
      date: e.ts,
      projectId: e.refs?.projectId,
      impact: mapped.impact,
      sourceEventIds: [e.id],
    });
  }
  return wins.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
}
