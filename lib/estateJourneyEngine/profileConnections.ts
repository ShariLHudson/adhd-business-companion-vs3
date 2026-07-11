/**
 * Estate Journey Engine — profile connection touches (Growth, Cabinet, Journal…).
 */

import { getJourneyEngineState, patchJourneyEngine } from "./journeyStore";
import type { EstateProfileConnectionKind, EstateProfileTouch } from "./types";

const MAX_PROFILE_TOUCHES = 32;

export function touchJourneyProfileConnection(input: {
  kind: EstateProfileConnectionKind;
  refId?: string;
  label?: string;
}): void {
  patchJourneyEngine((journey) => {
    const touch: EstateProfileTouch = {
      kind: input.kind,
      refId: input.refId,
      label: input.label,
      at: new Date().toISOString(),
    };
    return {
      ...journey,
      profileTouches: [touch, ...journey.profileTouches].slice(
        0,
        MAX_PROFILE_TOUCHES,
      ),
    };
  });
}

export function recentProfileTouches(
  kind?: EstateProfileConnectionKind,
  limit = 5,
): EstateProfileTouch[] {
  const journey = getJourneyEngineState();
  const touches = kind ?
    journey.profileTouches.filter((t) => t.kind === kind)
  : journey.profileTouches;
  return touches.slice(0, limit);
}
