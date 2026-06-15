import type { RecognitionMoment } from "./types";
import type { ShariImageStateInput } from "@/lib/shariImageState";

/** Merge recognition moment into Organic Shari Presence input. */
export function recognitionToShariPresence(
  moment: RecognitionMoment | null | undefined,
  base: ShariImageStateInput,
): ShariImageStateInput {
  if (!moment) return base;

  if (moment.type === "birthday") {
    return { ...base, personalCelebration: "birthday" };
  }

  if (moment.type === "membership_anniversary") {
    return { ...base, milestoneCelebration: "app_anniversary" };
  }

  if (
    moment.type === "anniversary" ||
    moment.type === "business_milestone" ||
    moment.type === "project_milestone" ||
    moment.type === "conversation_milestone" ||
    moment.type === "vacation_countdown" ||
    moment.type === "custom_event"
  ) {
    return { ...base, milestoneCelebration: "milestone" };
  }

  return base;
}
