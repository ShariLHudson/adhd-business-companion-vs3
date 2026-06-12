// Pending numbered suggestions — resolve before field content or generic confirmation.

import {
  extractNumberedOptions,
  parseOptionSelection,
  type WorkspaceSession,
} from "./workspaceSop";

export function hasPendingSuggestions(
  session: WorkspaceSession | null | undefined,
): boolean {
  return (session?.suggestedOptions?.length ?? 0) > 0;
}

/** How many numbered options are active (session + last assistant message). */
export function getEffectiveSuggestionCount(
  session: WorkspaceSession | null | undefined,
  lastAssistantText = "",
): number {
  const fromSession = session?.suggestedOptions?.length ?? 0;
  const fromText = extractNumberedOptions(lastAssistantText).length;
  return Math.max(fromSession, fromText);
}

export function getEffectiveSuggestions(
  session: WorkspaceSession | null | undefined,
  lastAssistantText = "",
): string[] {
  if (session?.suggestedOptions?.length) {
    return session.suggestedOptions;
  }
  return extractNumberedOptions(lastAssistantText);
}

export type SuggestionSelection = {
  index: number;
  value: string;
  options: string[];
};

/** True when the message picks a numbered suggestion (never field content). */
export function isSuggestionSelection(
  userText: string,
  session: WorkspaceSession | null | undefined,
  lastAssistantText = "",
): boolean {
  return tryResolveSuggestionSelection(userText, session, lastAssistantText) !== null;
}

export function tryResolveSuggestionSelection(
  userText: string,
  session: WorkspaceSession | null | undefined,
  lastAssistantText = "",
): SuggestionSelection | null {
  const options = getEffectiveSuggestions(session, lastAssistantText);
  if (options.length < 1) return null;

  const idx = parseOptionSelection(userText, options.length);
  if (idx === null) return null;

  const value = options[idx]?.trim();
  if (!value) return null;

  return { index: idx, value, options };
}
