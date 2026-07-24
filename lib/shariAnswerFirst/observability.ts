/**
 * Internal answer-first telemetry — never expose to members.
 */

export type ShariAnswerFirstEvent =
  | "decision"
  | "answer_generated"
  | "substance_validation"
  | "automatic_repair"
  | "route_suppressed"
  | "route_executed"
  | "capability_offered"
  | "capability_accepted"
  | "context_retained"
  | "follow_up_answered"
  | "handoff_created";

export function trackShariAnswerFirstEvent(
  event: ShariAnswerFirstEvent,
  detail?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (process.env.NODE_ENV === "production") return;
  try {
    // eslint-disable-next-line no-console
    console.debug("[shari-answer-first]", event, detail ?? {});
  } catch {
    /* ignore */
  }
}
