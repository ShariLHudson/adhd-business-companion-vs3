/**
 * Task breakdown — phases with a tiny first action per phase.
 */

import type { TaskBreakdown, TaskPhase } from "./types";

function labelFromMessage(message: string): string {
  const match = message.match(
    /\b(?:plan|build|launch|create|write|design)\s+(?:my |a |the )?([^.!?\n]{4,60})/i,
  );
  return match?.[1]?.trim() ?? "this project";
}

export function breakdownLargeTask(message: string): TaskBreakdown {
  const projectLabel = labelFromMessage(message);
  const lower = message.toLowerCase();

  let phases: TaskPhase[];

  if (/\b(launch|go live)\b/i.test(lower)) {
    phases = [
      {
        id: "clarify",
        label: "Clarify the offer",
        tinyFirstAction: "Write who it's for in one sentence.",
      },
      {
        id: "message",
        label: "Shape the message",
        tinyFirstAction: "Draft three bullet outcomes — not full copy.",
      },
      {
        id: "assets",
        label: "Minimum assets",
        tinyFirstAction: "List the one page or email you truly need first.",
      },
      {
        id: "sequence",
        label: "Sequence the week",
        tinyFirstAction: "Pick the single task for tomorrow morning.",
      },
    ];
  } else if (/\b(campaign|marketing)\b/i.test(lower)) {
    phases = [
      {
        id: "audience",
        label: "Audience snapshot",
        tinyFirstAction: "Name one person this campaign is really for.",
      },
      {
        id: "message",
        label: "Core message",
        tinyFirstAction: "Finish: 'After this, they will…'",
      },
      {
        id: "channel",
        label: "One channel",
        tinyFirstAction: "Choose where you'll show up first — just one.",
      },
    ];
  } else {
    phases = [
      {
        id: "frame",
        label: "Frame the outcome",
        tinyFirstAction: "Write what 'done enough for now' looks like.",
      },
      {
        id: "first",
        label: "First visible step",
        tinyFirstAction: "Do the smallest piece someone else could see.",
      },
      {
        id: "park",
        label: "Park the rest",
        tinyFirstAction: "List other ideas in a 'later' note — not today.",
      },
    ];
  }

  return {
    projectLabel,
    phases,
    startWith: phases[0].tinyFirstAction,
  };
}
