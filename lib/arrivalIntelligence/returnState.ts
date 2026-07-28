/**
 * MA-05 Phase 2 — canonical return / absence classification for Welcome Home.
 *
 * ONE shared threshold policy so arrival intelligence, the Voice Bible greeting
 * category, and the Welcome Home choice classifier can never disagree about "how
 * long is an absence." Pure policy — no storage, no second resolver, no parallel
 * return-state store. The three previously-conflicting inline thresholds
 * (3 / 14 / 42 days) are replaced by the two constants below.
 *
 * Thresholds are days since the resident's prior MEANINGFUL arrival:
 *  - RETURN_AFTER_ABSENCE_DAYS: gentle re-entry language becomes appropriate.
 *  - LONG_ABSENCE_DAYS: emphasize that nothing must be caught up.
 *
 * Values are taken from the strongest existing in-code authority. 14 is the
 * arrival-intelligence long-absence gate that already drives the "gentle_return"
 * greeting strategy; 3 is the Welcome Home "absence" copy gate. The former third
 * value (42, used only by the largely-orphaned Voice Bible greeting category) is
 * folded into LONG_ABSENCE_DAYS so every consumer agrees — this also removes a
 * real prior conflict where arrival switched to gentle_return at 14 while the
 * greeting category stayed "ordinary" until 42.
 */

export const RETURN_AFTER_ABSENCE_DAYS = 3;
export const LONG_ABSENCE_DAYS = 14;

export type CanonicalReturnState =
  | "first_ever_arrival"
  | "same_day_return"
  | "ordinary_return"
  | "return_after_absence"
  | "long_absence_return";

/** True when the gap warrants long-absence (no-backlog) language. */
export function isLongAbsence(
  daysSinceLastArrival: number | null | undefined,
): boolean {
  return daysSinceLastArrival != null && daysSinceLastArrival >= LONG_ABSENCE_DAYS;
}

/** True when the gap warrants gentle re-entry (absence) language. */
export function isReturnAfterAbsence(
  daysSinceLastArrival: number | null | undefined,
): boolean {
  return (
    daysSinceLastArrival != null &&
    daysSinceLastArrival >= RETURN_AFTER_ABSENCE_DAYS
  );
}

/**
 * The single canonical return-state classification. `isFirstEver` and
 * `sameLocalDay` are computed by the caller from the strongest available signals
 * (server-backed first-login evidence + the local calendar date); this function
 * owns only the day-gap thresholds. `first_ever` and `same_day` take precedence
 * over any day gap, so a same-day route revisit / remount can never be reclassified
 * as an absence. A missing (null) day gap resolves to `ordinary_return`, never to
 * `first_ever_arrival` — first-ever must be asserted explicitly by the caller.
 */
export function classifyReturnState(input: {
  isFirstEver: boolean;
  sameLocalDay: boolean;
  daysSinceLastArrival: number | null | undefined;
}): CanonicalReturnState {
  if (input.isFirstEver) return "first_ever_arrival";
  if (input.sameLocalDay) return "same_day_return";
  if (isLongAbsence(input.daysSinceLastArrival)) return "long_absence_return";
  if (isReturnAfterAbsence(input.daysSinceLastArrival)) {
    return "return_after_absence";
  }
  return "ordinary_return";
}
