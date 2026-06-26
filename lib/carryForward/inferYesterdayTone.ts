import type { DayState } from "@/lib/companionStore";
import { isDayStateFromToday } from "@/lib/dayReality";
import type { YesterdayCloseTone } from "./types";

/**
 * Infer how yesterday closed — emotional tone only, never task inventory.
 */
export function inferYesterdayCloseTone(input: {
  now?: Date;
  dayState?: DayState | null;
  projectRecentlyCompleted?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
}): YesterdayCloseTone {
  if (input.recoveryGentle || input.lowEnergy) {
    return "ended_overwhelmed";
  }
  if (input.projectRecentlyCompleted) {
    return "ended_with_win";
  }

  const day = input.dayState;
  if (day?.setAt && !isDayStateFromToday(day)) {
    if (day.overwhelm === "high") return "ended_overwhelmed";
    if (day.vibe === "struggling" || day.vibe === "rough-day") {
      return "ended_overwhelmed";
    }
    if (day.vibe === "mixed-bag") return "ended_frustration";
    if (day.vibe === "feeling-good" || day.vibe === "doing-okay") {
      return "ended_well";
    }
    if (
      day.energy === "low" ||
      day.motivationLevel === "dragging" ||
      day.motivationLevel === "not-happening"
    ) {
      return "ended_unfinished";
    }
    return "ended_quiet";
  }

  return "ended_quiet";
}
