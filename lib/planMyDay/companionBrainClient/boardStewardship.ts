/**
 * Board stewardship copy — the companion holds; it never hides.
 * Presentation only — curation logic stays in curateLivingBoard.
 */

import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import type { RealitySignal } from "@/lib/companionJudgmentClient/types";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { countHeldByCompanion } from "./curateLivingBoard";

export type BoardCurationDiff = {
  newlyHeld: number;
  released: number;
  heldTotal: number;
  visibleTotal: number;
};

function activeHeldIds(items: PlanDayItem[]): Set<string> {
  return new Set(
    items
      .filter((i) => !i.done && i.column === "parked")
      .map((i) => i.id),
  );
}

export function diffBoardCuration(
  before: PlanDayItem[],
  after: PlanDayItem[],
): BoardCurationDiff {
  const beforeHeld = activeHeldIds(before);
  const afterHeld = activeHeldIds(after);

  let newlyHeld = 0;
  for (const id of afterHeld) {
    if (!beforeHeld.has(id)) newlyHeld += 1;
  }

  let released = 0;
  for (const id of beforeHeld) {
    if (!afterHeld.has(id)) released += 1;
  }

  const heldTotal = countHeldByCompanion(after);
  const visibleTotal = after.filter(
    (i) => !i.done && i.column !== "done" && i.column !== "parked",
  ).length;

  return { newlyHeld, released, heldTotal, visibleTotal };
}

export function holdingTransparencyLine(diff: BoardCurationDiff): string | null {
  if (diff.heldTotal <= 0) return null;
  if (diff.newlyHeld > 0) {
    const n = diff.newlyHeld;
    return `I tucked away ${n} item${n === 1 ? "" : "s"} to protect today's energy.`;
  }
  return `I'm holding ${diff.heldTotal} thing${diff.heldTotal === 1 ? "" : "s"} for another time — still here whenever you're ready.`;
}

export type StewardshipMessageInput = {
  diff: BoardCurationDiff;
  judgment: CompanionJudgmentResult;
  signal?: RealitySignal | null;
  meaningfulShift?: boolean;
};

/**
 * Acknowledge re-shaping after Live Reality™ changes — never guilt, never surprise.
 */
export function formatBoardStewardshipMessage(
  input: StewardshipMessageInput,
): string | null {
  const { diff, judgment, signal, meaningfulShift } = input;
  const realityChange =
    signal?.source === "todays-reality" || signal?.kind === "day-state";
  const heavierDay =
    judgment.dayMode === "survival" ||
    judgment.dayMode === "recovery" ||
    judgment.dayMode === "health";

  if (diff.newlyHeld > 0 && (realityChange || meaningfulShift || heavierDay)) {
    if (realityChange && heavierDay) {
      return (
        "You told me today feels heavier than it did earlier.\n\n" +
        "I trimmed today's focus so it feels more manageable.\n\n" +
        "The rest is safely waiting whenever you're ready."
      );
    }
    if (realityChange) {
      return (
        "Given how today has changed, I reshaped what deserves your attention.\n\n" +
        "Anything I tucked away is still here — I'm carrying it, not removing it."
      );
    }
    return "I tucked a few things away to give you more breathing room today.";
  }

  if (diff.released > 0 && diff.newlyHeld === 0) {
    const n = diff.released;
    if (n === 1) {
      return (
        "You've got a little more capacity now.\n\n" +
        "I brought one more thing back because I think you can handle it."
      );
    }
    return (
      "You've got a little more capacity now.\n\n" +
      `I brought ${n} things back onto today's board — gently, not all at once.`
    );
  }

  if (
    meaningfulShift &&
    realityChange &&
    diff.heldTotal > 0 &&
    diff.newlyHeld === 0
  ) {
    return (
      "I adjusted today's plan to match where you actually are.\n\n" +
      "Nothing was deleted — I'm still holding what doesn't need your energy right now."
    );
  }

  if (meaningfulShift && realityChange) {
    return "Given how today has changed, I think this is the better path.";
  }

  return null;
}

export function heldItemsLongTermLine(heldTotal: number): string | null {
  if (heldTotal <= 0) return null;
  return "I'm still holding these whenever the time feels right.";
}
