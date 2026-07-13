/**
 * Companion awareness — Shari reads Daily Context before responding.
 * May adjust timing, wording, suggestion frequency, interruption level.
 * Must NOT automatically change user schedules.
 * Do not narrate context when it would not improve the reply.
 */

import type { CompanionAwarenessAdvice, DailyContext } from "./types";

export function companionSuggestionFrequency(
  ctx: DailyContext,
): CompanionAwarenessAdvice["suggestionFrequency"] {
  if (
    ctx.interruptibility === "do_not_disturb" ||
    ctx.loads.optionalPromptPressure === "high" ||
    ctx.dayCondition === "overwhelmed" ||
    ctx.dayCondition === "quiet" ||
    ctx.energy === "low"
  ) {
    return "minimal";
  }
  if (
    ctx.interruptibility === "cautious" ||
    ctx.dayCondition === "focus" ||
    ctx.loads.optionalPromptPressure === "moderate"
  ) {
    return "reduced";
  }
  return "normal";
}

export function collectCompanionAwarenessSignals(ctx: DailyContext): string[] {
  const signals: string[] = [];
  if (ctx.activeFocusSession) signals.push("focus session active");
  if (ctx.quietHoursActive) signals.push("quiet hours");
  if (ctx.dayCondition === "overwhelmed") signals.push("overwhelmed day");
  if (ctx.dayCondition === "low_energy" || ctx.energy === "low") {
    signals.push("low energy");
  }
  if (ctx.dayCondition === "quiet") signals.push("quiet day");
  if (ctx.dayCondition === "focus") signals.push("focus day");
  if (ctx.dayCondition === "meeting_heavy" || ctx.loads.meetingLoad === "heavy") {
    signals.push("unusually busy day");
  }
  if (ctx.dayCondition === "personal") signals.push("personal-responsibility day");
  if (ctx.dayCondition === "unexpected") signals.push("unexpected change");
  if (ctx.loads.reminderDueCount >= 3) signals.push("many reminders due");
  if (ctx.loads.rhythmDueCount >= 3) signals.push("many rhythms due");
  if (ctx.loads.optionalPromptPressure === "high") {
    signals.push("high optional prompt pressure");
  }
  return signals;
}

/**
 * Build companion prompt guidance from today's shared context.
 * Presentation / pacing only — never instructs schedule mutation.
 * Returns an empty promptBlock when context would not meaningfully help.
 */
export function buildCompanionAwarenessAdvice(
  ctx: DailyContext,
): CompanionAwarenessAdvice {
  const signals = collectCompanionAwarenessSignals(ctx);
  const suggestionFrequency = companionSuggestionFrequency(ctx);
  const interruptionLevel = ctx.interruptibility;

  const meaningful =
    signals.length > 0 ||
    interruptionLevel !== "open" ||
    suggestionFrequency !== "normal";

  if (!meaningful) {
    return {
      promptBlock: "",
      signals,
      interruptionLevel,
      suggestionFrequency,
      mayChangeSchedules: false,
    };
  }

  const lines: string[] = [
    "DAILY CONTEXT AWARENESS (shared today-state — presentation only):",
    `Interruptibility: ${interruptionLevel}. Suggestion frequency: ${suggestionFrequency}.`,
    "Honor today's situation in timing, wording, and how often you suggest — without narrating the context every turn.",
    "Do NOT change reminders, rhythms, or schedules. Do NOT activate profiles or create rhythms.",
    "Critical reminders stay available; optional prompts may wait.",
  ];

  if (signals.length > 0) {
    lines.push(`Signals: ${signals.join("; ")}.`);
  }

  if (ctx.activeFocusSession || ctx.dayCondition === "focus") {
    lines.push(
      "You're protecting focus time — keep optional interruptions quiet; shorter replies when helpful.",
    );
  }
  if (ctx.quietHoursActive) {
    lines.push("Quiet hours are active — defer optional check-ins.");
  }
  if (ctx.dayCondition === "quiet") {
    lines.push(
      "Quiet day — suppress optional companion prompts; preserve user-created critical reminders.",
    );
  }
  if (ctx.energy === "low" || ctx.dayCondition === "low_energy") {
    lines.push(
      "Today already looks full or low-energy — keep this to one manageable next step.",
    );
  }
  if (ctx.dayCondition === "overwhelmed") {
    lines.push("Overwhelm — reduce choices; presence before planning.");
  }
  if (ctx.dayCondition === "meeting_heavy" || ctx.loads.meetingLoad === "heavy") {
    lines.push(
      "Meeting-heavy — reduce deep-work prompts; preserve meeting preparation when relevant.",
    );
  }
  if (ctx.loads.reminderDueCount >= 3) {
    lines.push("Several reminders are due — acknowledge load; do not add more.");
  }

  return {
    promptBlock: lines.join("\n"),
    signals,
    interruptionLevel,
    suggestionFrequency,
    mayChangeSchedules: false,
  };
}

export function formatDailyContextCompanionBlock(ctx: DailyContext): string {
  return buildCompanionAwarenessAdvice(ctx).promptBlock;
}
