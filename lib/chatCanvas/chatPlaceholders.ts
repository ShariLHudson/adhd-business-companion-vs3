export const CHAT_INPUT_PLACEHOLDERS = [
  "What's on your mind?",
  "Say whatever's true.",
  "What would help most right now?",
  "No rush. I'm here.",
  "Or tell me what you need today…",
] as const;

/** Stable inviting placeholder — rotates gently by day, not every keystroke. */
export function pickChatPlaceholder(now: Date = new Date()): string {
  const dayIndex = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  );
  return CHAT_INPUT_PLACEHOLDERS[dayIndex % CHAT_INPUT_PLACEHOLDERS.length]!;
}
