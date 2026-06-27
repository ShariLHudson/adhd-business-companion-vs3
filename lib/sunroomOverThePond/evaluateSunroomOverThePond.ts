import {
  borderMotionForSunroomProfile,
  cssVarsForSunroomProfile,
  resolveSunroomTimeProfile,
  SUNROOM_LAYOUT,
  SUNROOM_SENSORY_MEMORY,
} from "./layout";
import { SUNROOM_COGNITIVE_FORBIDDEN } from "./rules";
import type { SunroomInput, SunroomVerdict } from "./types";
import {
  SUNROOM_EMOTIONAL_PROMISE,
  SUNROOM_FEATURE_OBJECT_ID,
  SUNROOM_PLACE_ID,
  SUNROOM_ROOM_WHISPERS,
  SUNROOM_SIGNATURE_OBJECT_ID,
  SUNROOM_SUBTITLE,
  SUNROOM_TITLE,
} from "./types";

function stableWhisper(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return SUNROOM_ROOM_WHISPERS[Math.abs(hash) % SUNROOM_ROOM_WHISPERS.length]!;
}

/**
 * Focus My Brain — evaluate the Sunroom Over The Pond before render.
 */
export function evaluateSunroomOverThePond(
  input: SunroomInput = {},
): SunroomVerdict {
  const now = input.now ?? new Date();
  const timeProfile = resolveSunroomTimeProfile(input);
  const dayKey = now.toISOString().slice(0, 10);

  return {
    placeId: SUNROOM_PLACE_ID,
    title: SUNROOM_TITLE,
    subtitle: SUNROOM_SUBTITLE,
    emotionalPromise: SUNROOM_EMOTIONAL_PROMISE,
    roomWhisper: stableWhisper(`${dayKey}:${input.focusCategory ?? "focus"}`),
    timeProfile,
    signatureObjectId: SUNROOM_SIGNATURE_OBJECT_ID,
    sharisPresenceState: "nearby",
    layout: SUNROOM_LAYOUT,
    borderMotion: borderMotionForSunroomProfile(timeProfile),
    sensoryMemoryHints: SUNROOM_SENSORY_MEMORY,
    cognitiveForbidden: SUNROOM_COGNITIVE_FORBIDDEN,
    cssVars: cssVarsForSunroomProfile(timeProfile),
    dataAttributes: {
      "data-sunroom-over-pond": "1",
      "data-homestead-place": SUNROOM_PLACE_ID,
      "data-focus-my-brain": SUNROOM_FEATURE_OBJECT_ID,
      "data-sharis-presence": "nearby",
      "data-sunroom-time-profile": timeProfile,
      "data-emotional-promise": SUNROOM_EMOTIONAL_PROMISE,
    },
  };
}

export function sunroomHintForChat(verdict: SunroomVerdict): string {
  return [
    "SUNROOM OVER THE POND — Focus My Brain:",
    verdict.emotionalPromise,
    verdict.roomWhisper,
    `Presence: ${verdict.sharisPresenceState} — evidence of life, never supervising.`,
    `Time profile: ${verdict.timeProfile}. Signature: Pond Anchor.`,
    "Pond remains emotional center. Water sound continuous, never urgent.",
    "Workspace embedded in sunroom — never blocks the pond entirely.",
  ].join("\n");
}
