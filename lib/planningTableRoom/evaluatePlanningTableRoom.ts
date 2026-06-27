import {
  borderMotionForTimeProfile,
  cssVarsForTimeProfile,
  PLANNING_TABLE_LAYOUT,
  PLANNING_TABLE_MEMORY_TRIGGERS,
  resolvePlanningTimeProfile,
} from "./layout";
import { PLANNING_TABLE_ADHD_FORBIDDEN } from "./rules";
import type { PlanningTableInput, PlanningTableVerdict } from "./types";
import {
  PLANNING_TABLE_EMOTIONAL_PROMISE,
  PLANNING_TABLE_FEATURE_OBJECT_ID,
  PLANNING_TABLE_PLACE_ID,
  PLANNING_TABLE_ROOM_WHISPERS,
  PLANNING_TABLE_SIGNATURE_OBJECT_ID,
  PLANNING_TABLE_SUBTITLE,
  PLANNING_TABLE_TITLE,
} from "./types";

function stableWhisper(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PLANNING_TABLE_ROOM_WHISPERS[
    Math.abs(hash) % PLANNING_TABLE_ROOM_WHISPERS.length
  ]!;
}

/**
 * Plan My Day — evaluate the Kitchen Planning Nook before render.
 */
export function evaluatePlanningTableRoom(
  input: PlanningTableInput = {},
): PlanningTableVerdict {
  const now = input.now ?? new Date();
  const timeProfile = resolvePlanningTimeProfile(input);
  const dayKey = now.toISOString().slice(0, 10);

  return {
    placeId: PLANNING_TABLE_PLACE_ID,
    title: PLANNING_TABLE_TITLE,
    subtitle: PLANNING_TABLE_SUBTITLE,
    emotionalPromise: PLANNING_TABLE_EMOTIONAL_PROMISE,
    roomWhisper: stableWhisper(`${dayKey}:${input.chapter ?? "plan"}`),
    timeProfile,
    signatureObjectId: PLANNING_TABLE_SIGNATURE_OBJECT_ID,
    sharisPresenceState: "beside-you",
    layout: PLANNING_TABLE_LAYOUT,
    borderMotion: borderMotionForTimeProfile(timeProfile),
    memoryTriggerHints: PLANNING_TABLE_MEMORY_TRIGGERS,
    adhdForbidden: PLANNING_TABLE_ADHD_FORBIDDEN,
    cssVars: cssVarsForTimeProfile(timeProfile),
    dataAttributes: {
      "data-planning-table-room": "1",
      "data-plan-my-day": PLANNING_TABLE_FEATURE_OBJECT_ID,
      "data-planning-time-profile": timeProfile,
      "data-emotional-promise": PLANNING_TABLE_EMOTIONAL_PROMISE,
    },
  };
}

export function planningTableHintForChat(verdict: PlanningTableVerdict): string {
  return [
    "PLANNING TABLE — Kitchen Planning Nook:",
    verdict.emotionalPromise,
    verdict.roomWhisper,
    `Presence: ${verdict.sharisPresenceState} — prepared space, never watched.`,
    `Time profile: ${verdict.timeProfile}. Signature: Planning Notebook.`,
    "No dashboards, timers, or productivity pressure. Clarity before organization.",
  ].join("\n");
}
