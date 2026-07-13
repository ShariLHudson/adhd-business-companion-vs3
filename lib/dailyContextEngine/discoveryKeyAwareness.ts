/**
 * Discovery Key awareness hooks — Phase 3 only.
 * Do NOT build Discovery Key UI or the Discovery Key system here.
 * Keys remain optional and must respect Daily Context + Load Manager.
 */

import type { DailyContext, DiscoveryKeyAwarenessDecision } from "./types";

/**
 * Whether an optional Discovery Key may surface right now.
 * Critical reminders are unrelated — this only gates optional discovery.
 */
export function evaluateDiscoveryKeyAwareness(
  ctx: DailyContext,
): DiscoveryKeyAwarenessDecision {
  const reasons: string[] = [];

  if (ctx.activeFocusSession) {
    reasons.push("focus mode / active focus session");
  }
  if (ctx.quietHoursActive) {
    reasons.push("quiet hours");
  }
  if (ctx.energy === "low" || ctx.dayCondition === "low_energy") {
    reasons.push("low energy");
  }
  if (ctx.dayCondition === "overwhelmed") {
    reasons.push("overwhelm");
  }
  if (ctx.dayCondition === "quiet") {
    reasons.push("quiet day");
  }
  if (ctx.dayCondition === "focus") {
    reasons.push("focus day condition");
  }
  if (!ctx.optionalPromptAllowance) {
    reasons.push("optional prompt allowance closed");
  }
  if (ctx.interruptibility === "do_not_disturb") {
    reasons.push("do not disturb interruptibility");
  }
  if (ctx.loads.optionalPromptPressure === "high") {
    reasons.push("load manager — high optional prompt pressure");
  }
  if (
    ctx.loads.reminderDueCount > 0 &&
    (ctx.loads.reminderDueCount >= 2 || ctx.loads.rhythmDueCount >= 2)
  ) {
    reasons.push("active work / due deliverable load");
  }
  if (ctx.companionAvailability === "deferred") {
    reasons.push("companion availability deferred");
  }

  const suppress = reasons.length > 0;
  return {
    allow: !suppress,
    suppress,
    reasons,
    optional: true,
  };
}

export function shouldSuppressDiscoveryKey(ctx: DailyContext): boolean {
  return evaluateDiscoveryKeyAwareness(ctx).suppress;
}
