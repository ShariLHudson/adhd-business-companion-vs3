import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { LivingTimelineContext, LivingVisitKind } from "./types";
import {
  getLivingChangeHistory,
  minutesSinceLivingRoomDeparture,
} from "./livingChangeHistory";

export function resolveLivingTimeline(input: {
  now?: Date;
  hoursSinceLastVisit?: number | null;
  visitKindHint?: LivingVisitKind;
  returnFromRoom?: CompanionPlaceId | null;
}): LivingTimelineContext {
  const now = input.now ?? new Date();
  const minutesAway = minutesSinceLivingRoomDeparture(now);
  const history = getLivingChangeHistory();
  const elapsedMs =
    input.hoursSinceLastVisit != null
      ? input.hoursSinceLastVisit * 60 * 60 * 1000
      : null;

  let visitKind: LivingVisitKind = input.visitKindHint ?? "arrival";
  if (
    minutesAway != null &&
    minutesAway < 240 &&
    history.lastRoomDepartureAt != null
  ) {
    visitKind = "room_return";
  } else if (
    visitKind !== "room_return" &&
    elapsedMs != null &&
    elapsedMs < 30 * 60 * 1000
  ) {
    visitKind = "quiet_refresh";
  }

  const notes: string[] = [];
  if (visitKind === "room_return" && history.lastRoomSnapshot) {
    if (minutesAway != null && minutesAway >= 20) {
      notes.push("fire-burned-lower");
    }
    if (minutesAway != null && minutesAway >= 8) {
      notes.push("steam-faded");
    }
    if (history.lastRoomSnapshot.kinsey !== "hidden") {
      notes.push("kinsey-may-have-moved");
    }
  }

  if (elapsedMs != null && elapsedMs >= 6 * 60 * 60 * 1000) {
    notes.push("sun-shifted");
  }

  return {
    visitKind,
    elapsedSinceLastPresenceMs: elapsedMs,
    minutesAwayFromLivingRoom: minutesAway,
    returnFromRoom: input.returnFromRoom ?? null,
    notes,
  };
}
