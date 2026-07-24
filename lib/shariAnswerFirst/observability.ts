/**
 * Internal answer-first telemetry — never expose to members.
 */

export type ShariAnswerFirstEvent =
  | "decision"
  | "cognitive_decision"
  | "professional_role_selected"
  | "relevant_context_retrieved"
  | "known_context_guard"
  | "wisdom_plan_created"
  | "response_composition_created"
  | "practical_value_element_selected"
  | "answer_generated"
  | "substance_validation"
  | "conversation_excellence"
  | "delight_threshold_failed"
  | "baseline_threshold_failed"
  | "general_ai_baseline_failed"
  | "personalized_advantage_detected"
  | "generic_response_risk_detected"
  | "repair_attempted"
  | "repair_succeeded"
  | "repair_exhausted"
  | "automatic_repair"
  | "route_suppressed"
  | "route_executed"
  | "capability_offered"
  | "capability_accepted"
  | "context_retained"
  | "follow_up_answered"
  | "thread_binder_used"
  | "thread_hydrated"
  | "thread_cleared"
  | "thread_store_rejected"
  | "thread_reset_for_new_conversation"
  | "stale_thread_rejected"
  | "turn_authority"
  | "competing_owner_suppressed"
  | "user_correction_applied"
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
