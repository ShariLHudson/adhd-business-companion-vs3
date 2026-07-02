import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import { WELCOME_HOME_SHARI_QUESTION } from "./content";

const TIME_OF_DAY_HEADLINE = /^good\s+(morning|afternoon|evening)/i;

/** Welcome line inside the frosted panel — no separate “Good morning” dashboard heading. */
export function resolveWelcomeHomeChatPrompt(
  arrival: ArrivalIntelligence | null,
): string {
  if (!arrival) return WELCOME_HOME_SHARI_QUESTION;

  if (arrival.greetingBody?.trim()) {
    return arrival.greetingBody.trim();
  }

  if (arrival.inviteQuestion?.trim()) {
    return arrival.inviteQuestion.trim();
  }

  const headline = arrival.greetingHeadline?.trim() ?? "";
  if (headline && !TIME_OF_DAY_HEADLINE.test(headline)) {
    return headline;
  }

  if (arrival.openingMessage?.trim()) {
    const opening = arrival.openingMessage.trim();
    if (!TIME_OF_DAY_HEADLINE.test(opening)) return opening;
  }

  return WELCOME_HOME_SHARI_QUESTION;
}
