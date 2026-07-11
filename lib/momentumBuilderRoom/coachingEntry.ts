/**
 * Momentum Builder — coaching arrival copy (never definitions or lessons).
 * @see docs/MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md
 */

export const MOMENTUM_BUILDER_ARRIVAL_GLAD = "I'm glad you're here.";

export const MOMENTUM_BUILDER_ARRIVAL_LEAD = "Let's make today a little easier.";

/** One question at a time — rotated quietly; never shown as a numbered menu. */
export const MOMENTUM_BUILDER_OPENING_QUESTIONS = [
  "What's making today difficult?",
  "What feels hardest right now?",
  "What's keeping you from getting started?",
  "What would feel like a win today?",
  "Where are you feeling stuck?",
] as const;

export type MomentumBuilderArrival = {
  glad: string;
  lead: string;
  question: string;
};

export function pickMomentumBuilderOpeningQuestion(
  now: Date = new Date(),
): string {
  const questions = MOMENTUM_BUILDER_OPENING_QUESTIONS;
  const index =
    (now.getDate() + now.getMonth() * 31 + now.getHours()) % questions.length;
  return questions[index] ?? questions[0];
}

export function resolveMomentumBuilderArrival(
  now: Date = new Date(),
): MomentumBuilderArrival {
  return {
    glad: MOMENTUM_BUILDER_ARRIVAL_GLAD,
    lead: MOMENTUM_BUILDER_ARRIVAL_LEAD,
    question: pickMomentumBuilderOpeningQuestion(now),
  };
}

/** @deprecated Use resolveMomentumBuilderArrival — no room title in member copy */
export function resolveMomentumBuilderArrivalGreeting(now?: Date): string {
  const arrival = resolveMomentumBuilderArrival(now);
  return [arrival.glad, arrival.lead, arrival.question].join("\n\n");
}
