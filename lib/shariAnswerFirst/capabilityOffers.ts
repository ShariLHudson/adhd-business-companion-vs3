/**
 * At most one primary capability offer after a direct answer.
 */

import type { ShariCapabilityOfferKind, ShariResponseDecision } from "./types";

const OFFER_LINES: Record<Exclude<ShariCapabilityOfferKind, "none">, string> = {
  create_from_answer:
    "I can turn what we just covered into a polished draft in Create when you want.",
  turn_into_checklist:
    "I can turn this into a personalized checklist once you know a few specifics.",
  turn_into_project:
    "I can turn these steps into a launch project when you are ready.",
  research_current:
    "If you want current recommendations with sources, I can research that next.",
  show_visually:
    "I can also show this as a simple visual when that would help.",
  build_strategy:
    "We can build your plan together one section at a time when you are ready.",
  continue_in_chat:
    "Tell me a little more about your situation and I can tailor this further.",
};

export function capabilityOfferLine(
  decision: ShariResponseDecision,
): string | null {
  if (!decision.directAnswerRequired) return null;
  if (decision.optionalCapabilityOffer === "none") return null;
  return OFFER_LINES[decision.optionalCapabilityOffer] ?? null;
}

export function appendRestrainedCapabilityOffer(
  answer: string,
  decision: ShariResponseDecision,
): string {
  const offer = capabilityOfferLine(decision);
  if (!offer) return answer;
  // Avoid stacking offers if the model already offered something
  if (
    /\b(?:i can (?:turn|help|build|create|research)|would you like|want me to)\b/i.test(
      answer.slice(-400),
    )
  ) {
    return answer;
  }
  return `${answer.trim()}\n\n${offer}`;
}

export function countPrimaryCapabilityOffersInText(text: string): number {
  const patterns = [
    /\bresearch (?:this|that|it)\b/i,
    /\bcreate (?:this|that|it)\b/i,
    /\bturn (?:this|it) into a project\b/i,
    /\bshow (?:this|it) visually\b/i,
    /\bask the chamber\b/i,
    /\badd to strateg/i,
  ];
  return patterns.reduce((n, re) => (re.test(text) ? n + 1 : n), 0);
}
