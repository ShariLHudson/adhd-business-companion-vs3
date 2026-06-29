/**
 * Next step simplifier — one tiny action, not a lecture.
 */

import type { EffortEstimate, TinyNextStep } from "./types";
import { estimateEffort } from "./effortEstimate";

export function simplifyNextStep(input: {
  message: string;
  objectiveSummary?: string;
  openLoopLabel?: string;
  primarySignal: string;
}): TinyNextStep {
  const lower = input.message.toLowerCase();

  if (input.primarySignal === "overwhelm") {
    return {
      action: "Name one thing that would make today 10% lighter.",
      effort: estimateEffort("reflect", 3),
      whyStartHere: "Relief comes before planning — one honest label is enough.",
    };
  }

  if (input.primarySignal === "decision_fatigue") {
    return {
      action: "Pick the option you'd choose if you had to decide in two minutes.",
      effort: estimateEffort("decide", 2),
      whyStartHere: "A temporary choice unlocks motion — you can adjust later.",
    };
  }

  if (/\b(email|newsletter|write)\b/i.test(lower)) {
    return {
      action: "Open a blank doc and write the subject line only.",
      effort: estimateEffort("write", 5),
      whyStartHere: "Starting beats organizing — the subject line is the door.",
    };
  }

  if (/\b(marketing|campaign|launch)\b/i.test(lower)) {
    return {
      action: "Write one sentence: who this is for and what changes for them.",
      effort: estimateEffort("plan", 5),
      whyStartHere: "Clarity before tactics — one sentence is enough to begin.",
    };
  }

  if (input.openLoopLabel) {
    return {
      action: `Spend five minutes on: ${input.openLoopLabel}`,
      effort: estimateEffort("task", 5),
      whyStartHere: "One open loop closed — not the whole list.",
    };
  }

  if (input.objectiveSummary) {
    return {
      action: `Take the smallest visible step toward: ${input.objectiveSummary.slice(0, 60)}`,
      effort: estimateEffort("task", 5),
      whyStartHere: "Motion creates clarity — tiny beats perfect.",
    };
  }

  return {
    action: "Choose one thing on your mind and spend five minutes on it.",
    effort: estimateEffort("task", 5),
    whyStartHere: "Starting is the skill — not having the full plan.",
  };
}
