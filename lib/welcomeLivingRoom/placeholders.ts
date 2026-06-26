export const WELCOME_LISTENING_PLACEHOLDER = "I'm listening...";

export const WELCOME_FOCUSED_PLACEHOLDERS = [
  "Take your time...",
  "Whenever you're ready.",
] as const;

export function resolveWelcomeChatPlaceholder(input: {
  focused: boolean;
  focusedVariant?: number;
  listeningFallback?: string;
}): string {
  if (!input.focused) {
    return input.listeningFallback?.trim() || WELCOME_LISTENING_PLACEHOLDER;
  }
  const index =
    Math.abs(input.focusedVariant ?? 0) % WELCOME_FOCUSED_PLACEHOLDERS.length;
  return WELCOME_FOCUSED_PLACEHOLDERS[index]!;
}
