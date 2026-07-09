/**
 * Recognition lifecycle transitions.
 * Stages may be skipped. Hall induction is never automatic.
 */

import type { RecognitionLifecycleStatus } from "./types";

/** Allowed forward transitions. Empty array = terminal / no auto-advance. */
const ALLOWED: Record<
  RecognitionLifecycleStatus,
  readonly RecognitionLifecycleStatus[]
> = {
  captured: [
    "preserved",
    "recognized",
    "celebrated_quiet",
    "celebrated_festive",
    "chronicled",
    "hall_candidate",
    "archived",
  ],
  preserved: [
    "recognized",
    "celebrated_quiet",
    "celebrated_festive",
    "chronicled",
    "hall_candidate",
    "archived",
  ],
  recognized: [
    "celebrated_quiet",
    "celebrated_festive",
    "chronicled",
    "hall_candidate",
    "archived",
  ],
  celebrated_quiet: [
    "chronicled",
    "hall_candidate",
    "celebrated_festive",
    "archived",
  ],
  celebrated_festive: ["chronicled", "hall_candidate", "archived"],
  chronicled: ["hall_candidate", "archived"],
  hall_candidate: ["hall_exhibit", "archived", "preserved"],
  /** Only reachable via explicit member induction — not listed as auto target. */
  hall_exhibit: ["archived"],
  archived: [],
};

export function canTransitionLifecycle(
  from: RecognitionLifecycleStatus,
  to: RecognitionLifecycleStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

/**
 * Hall exhibit requires explicit member confirmation.
 * Engine helpers must never call this without userConfirmedHall === true.
 */
export function canInductIntoHall(input: {
  current: RecognitionLifecycleStatus;
  userConfirmedHall: boolean;
}): boolean {
  if (!input.userConfirmedHall) return false;
  return (
    input.current === "hall_candidate" ||
    canTransitionLifecycle(input.current, "hall_candidate")
  );
}

export function assertNeverAutoInduct(
  next: RecognitionLifecycleStatus,
  userConfirmedHall: boolean,
): void {
  if (next === "hall_exhibit" && !userConfirmedHall) {
    throw new Error(
      "Hall induction requires explicit member confirmation (userConfirmedHall).",
    );
  }
}
