/**
 * Presence Mode™ — Enjoy the Estate™
 *
 * Permission to exist in the place without prompts. The Estate welcomes
 * presence; it never demands attention.
 *
 * @see docs/estate/ (Living place — restoration, not a feature panel)
 */

export type JustBeHereSession = {
  roomId: string;
  enteredAt: number;
};

/** Member-facing label — Presence Mode entry in UI. */
export const ENJOY_ESTATE_LABEL = "Enjoy the Estate";
export const ENJOY_ESTATE_MENU_ICON = "🌿";

export const JUST_BE_HERE_ENTER_MS = 2000;
/** After enter completes — hide pointer until member moves again. */
export const ENJOY_ESTATE_CURSOR_HIDE_MS = 4500;
/** Slim chrome fades to flame-only after idle. */
export const JUST_BE_HERE_CONTROLS_IDLE_MS = 4500;
export const JUST_BE_HERE_FULLSCREEN_CONTROLS_IDLE_MS = 3500;
export const ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS = 3500;

/** Shown when Enjoy the Estate chrome fades in browser fullscreen. */
export const ESTATE_CHROME_IDLE_HINT_FULLSCREEN =
  "Move or tap — menu returns";

export const PRESENCE_MODE_ACK_LINES = [
  "Of course.",
  "Absolutely.",
  "Then let's just be here.",
] as const;

export const PRESENCE_MODE_SUGGESTION_OVERWHELMED =
  "We can work through this together — or we can simply sit here for a few minutes. Whatever feels right.";

export const PRESENCE_MODE_SUGGESTION_RACING_MIND =
  "Would you like to enjoy the Estate for a while before we continue?";

const PRESENCE_MODE_SUGGESTION_OFFER_RE =
  /\b(?:simply sit here for a few minutes|enjoy the Estate for a while)\b/i;

const PRESENCE_MODE_REQUEST_RE =
  /\b(?:just (?:be|sit|stay) here|just being here|enjoy the (?:estate|view|room)|hide everything|hide chat|don'?t want to think|take a break|quiet time|no prompts?|nothing on screen|clear the screen|be alone with (?:the|this) (?:room|view|place)|i just want to sit here)\b/i;

const PRESENCE_MODE_REQUEST_PHRASES: readonly RegExp[] = [
  /\bjust be here\b/i,
  /\b(?:want|like|need|can we) to (?:just )?be here\b/i,
  /\b(?:happy )?just being here\b/i,
  /\bjust (?:sit|stay) here\b/i,
  /\b(?:let'?s|can we) just enjoy the view\b/i,
  /\bcan we just be here\b/i,
  /\bhide everything\b/i,
  /\bhide chat\b/i,
  /\benjoy the room\b/i,
  /\bi don'?t want to think right now\b/i,
  /\b(?:let'?s|i need to) take a break\b/i,
  /\benjoy the estate\b/i,
  /\b(?:want|need) (?:some )?quiet time\b/i,
  /\bjust (?:want|need) to (?:sit|rest|breathe)\b/i,
];

const PRESENCE_MODE_ACCEPTANCE_RE =
  /\b(?:yes|yeah|yep|sure|okay|ok|please|that sounds (?:good|nice|right)|let'?s do that|sit here|enjoy the estate|be here|the estate)\b/i;

/** Natural-language request to enter Presence Mode. */
export function isPresenceModeRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (PRESENCE_MODE_REQUEST_RE.test(t)) return true;
  return PRESENCE_MODE_REQUEST_PHRASES.some((pattern) => pattern.test(t));
}

/** @deprecated use isPresenceModeRequest */
export const isJustBeHereLabel = isPresenceModeRequest;

export function isPresenceModeSuggestionOffer(
  lastAssistantText?: string | null,
): boolean {
  const last = lastAssistantText?.trim() ?? "";
  if (!last) return false;
  return PRESENCE_MODE_SUGGESTION_OFFER_RE.test(last);
}

/** Member accepted a rare Presence Mode suggestion. */
export function isPresenceModeAcceptance(
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  const user = userText.trim();
  if (!user || !isPresenceModeSuggestionOffer(lastAssistantText)) return false;
  if (isPresenceModeRequest(user)) return true;
  return PRESENCE_MODE_ACCEPTANCE_RE.test(user);
}

export function shouldSuggestPresenceModeForDistress(userText: string): {
  suggest: boolean;
  line: string | null;
} {
  const t = userText.trim();
  if (!t) return { suggest: false, line: null };
  if (/\b(?:overwhelm|overwhelmed)\b/i.test(t)) {
    return { suggest: true, line: PRESENCE_MODE_SUGGESTION_OVERWHELMED };
  }
  if (
    /\b(?:brain won'?t stop|won'?t stop thinking|mind won'?t (?:stop|quiet|shut up)|thoughts won'?t stop|racing thoughts)\b/i.test(
      t,
    )
  ) {
    return { suggest: true, line: PRESENCE_MODE_SUGGESTION_RACING_MIND };
  }
  return { suggest: false, line: null };
}

export function pickPresenceModeAckLine(userText: string): string {
  const seed = userText.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PRESENCE_MODE_ACK_LINES[seed % PRESENCE_MODE_ACK_LINES.length]!;
}

export function resolvePresenceModeRoomId(input: {
  directRoomId?: string | null;
  memoryRoomId?: string | null;
  presenceRoomId?: string | null;
  fallbackRoomId?: string | null;
}): string {
  return (
    input.directRoomId ??
    input.presenceRoomId ??
    (input.memoryRoomId && input.memoryRoomId !== "welcome-home"
      ? input.memoryRoomId
      : null) ??
    input.fallbackRoomId ??
    "welcome-home"
  );
}

export const JUST_BE_HERE_RESUME_LINES = [
  "I hope that quiet time was helpful.",
  "Sometimes it's nice just to be here.",
  "I'm glad you had a moment to breathe.",
] as const;

export function pickJustBeHereResumeLine(roomId: string): string {
  const seed = roomId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return JUST_BE_HERE_RESUME_LINES[seed % JUST_BE_HERE_RESUME_LINES.length]!;
}

/** Resume copy after long presence — off by default; flame return stays silent. */
export function shouldOfferJustBeHereResumeMessage(
  messageCount: number,
  hadUserMessagesBeforeEnter: boolean,
): boolean {
  return false;
}
