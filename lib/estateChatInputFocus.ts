/**
 * Estate chat input focus — centralized auto-focus with document-edit guardrails.
 *
 * Spark should feel ready to listen: focus the conversation input whenever the
 * app is ready for member input, without stealing focus from journals, emails,
 * SOPs, or other document editors.
 */

import type { RefObject } from "react";

export const ESTATE_CHAT_INPUT_FOCUS_DELAY_MS = 175;
export const ESTATE_CHAT_INPUT_FOCUS_DELAY_NAV_MS = 200;
export const ESTATE_CHAT_INPUT_FOCUS_DELAY_STARTUP_MS = 250;

export const ESTATE_CHAT_INPUT_ATTR = "data-estate-chat-input";
export const ESTATE_DOCUMENT_EDITOR_ATTR = "data-estate-document-editor";

export type EstateChatInputFocusOptions = {
  /** Delay before focusing (default 175ms). */
  delayMs?: number;
  preventScroll?: boolean;
  /** Scroll input into view before focus (e.g. after long thread). */
  scrollIntoView?: boolean;
  /** Focus even when another field is active (use sparingly). */
  force?: boolean;
  /** Place caret at end of existing text (preserves value). */
  placeCursorAtEnd?: boolean;
};

export function isEstateChatInputElement(
  el: Element | null | undefined,
): boolean {
  return el?.getAttribute(ESTATE_CHAT_INPUT_ATTR) === "true";
}

/**
 * True when the member is actively editing a non-chat document or modal field.
 */
export function isUserEditingEstateDocument(
  chatInputEl: HTMLTextAreaElement | null | undefined,
): boolean {
  const active = document.activeElement as HTMLElement | null;
  if (!active) return false;
  if (active === chatInputEl || isEstateChatInputElement(active)) return false;

  if (
    active.isContentEditable ||
    active.getAttribute("contenteditable") === "true"
  ) {
    return true;
  }

  const tag = active.tagName;
  if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") {
    return true;
  }

  if (active.closest(`[${ESTATE_DOCUMENT_EDITOR_ATTR}="true"]`)) {
    return true;
  }

  if (active.closest('[role="dialog"]')) {
    return true;
  }

  return false;
}

export function canAutoFocusEstateChatInput(
  chatInputEl: HTMLTextAreaElement | null | undefined,
  opts?: { force?: boolean },
): boolean {
  if (!chatInputEl || chatInputEl.disabled) return false;
  if (opts?.force) return true;
  return !isUserEditingEstateDocument(chatInputEl);
}

function placeCaretAtEnd(el: HTMLTextAreaElement) {
  const len = el.value.length;
  try {
    el.setSelectionRange(len, len);
  } catch {
    // Some browsers reject selection on hidden/disabled transitions.
  }
}

/**
 * Schedule chat input focus. Returns cancel function for debounced calls.
 */
export function scheduleEstateChatInputFocus(
  inputRef: RefObject<HTMLTextAreaElement | null>,
  opts?: EstateChatInputFocusOptions,
): () => void {
  const delayMs = opts?.delayMs ?? ESTATE_CHAT_INPUT_FOCUS_DELAY_MS;

  const timerId = window.setTimeout(() => {
    const el = inputRef.current;
    if (!el || !canAutoFocusEstateChatInput(el, { force: opts?.force })) {
      return;
    }

    if (opts?.scrollIntoView) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    el.focus({ preventScroll: opts?.preventScroll ?? true });

    if (opts?.placeCursorAtEnd !== false) {
      placeCaretAtEnd(el);
    }
  }, delayMs);

  return () => window.clearTimeout(timerId);
}

/**
 * Type-to-talk: printable key should land in chat when no other field is active.
 */
export function shouldRoutePrintableKeyToChatInput(
  event: KeyboardEvent,
  chatInputEl: HTMLTextAreaElement | null | undefined,
): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  if (event.key.length !== 1) return false;
  if (isUserEditingEstateDocument(chatInputEl)) return false;
  return true;
}
