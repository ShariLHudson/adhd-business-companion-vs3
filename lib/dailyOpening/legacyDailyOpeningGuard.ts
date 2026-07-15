/**
 * Legacy Daily Opening Guard — detect retired plain-text Welcome Home openings.
 * Safety net only. Primary architecture is TodaysWelcomeCard.
 */

export const TODAYS_WELCOME_CARD_VERSION = "todays-welcome-card-v1" as const;

const LEGACY_MARKERS = [
  "help me restart",
  "check my day",
  "what would help most today",
  "i also have a new discovery waiting",
  "new discovery waiting whenever you would like to learn more about spark",
] as const;

export type ChatLikeMessage = {
  role: string;
  content: string;
};

/** True when content matches the retired plain-text daily opening. */
export function isLegacyDailyOpeningCopy(content: string | null | undefined): boolean {
  const text = (content ?? "").trim().toLowerCase();
  if (!text) return false;

  const hitCount = LEGACY_MARKERS.filter((marker) => text.includes(marker)).length;
  if (hitCount >= 2) return true;

  // Exact/near-exact single-line legacy prompts
  if (
    text === "what would help most today?" ||
    text === "help me restart" ||
    text === "check my day"
  ) {
    return true;
  }

  // Multi-line option block: prompt + at least two retired choices
  const hasPrompt = text.includes("what would help most today");
  const hasRestart = text.includes("help me restart");
  const hasCheckDay = text.includes("check my day");
  const hasClearMind = text.includes("clear my mind");
  if (hasPrompt && (hasRestart || hasCheckDay) && hasClearMind) return true;
  if (hasRestart && hasCheckDay && hasClearMind) return true;

  return false;
}

/** Strip retired daily-opening assistant messages from a thread (keep real chat). */
export function filterLegacyDailyOpeningMessages<T extends ChatLikeMessage>(
  messages: readonly T[],
): T[] {
  return messages.filter((message) => {
    if (message.role !== "assistant" && message.role !== "system") return true;
    return !isLegacyDailyOpeningCopy(message.content);
  });
}

/** True when a greeting/welcome line should not be shown as plain chat. */
export function isSupersededWelcomeHomeGreeting(
  content: string | null | undefined,
): boolean {
  const text = (content ?? "").trim().toLowerCase();
  if (!text) return false;
  if (isLegacyDailyOpeningCopy(text)) return true;
  // Soft legacy greetings that end with the retired prompt
  if (
    text.includes("what would help most today") &&
    !text.includes("choose what would help most, and i'll take you there")
  ) {
    return true;
  }
  return false;
}
