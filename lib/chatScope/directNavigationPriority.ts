/**
 * Direct navigation arbiter — outranks sticky Board / Create / destination scopes.
 * Uses the Estate command router + hard-nav helpers (no second destination list).
 *
 * Content answers inside Create / Board must never match — only explicit nav verbs.
 */

import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveEstatePlaceIdFromUserText } from "@/lib/estate/estateRoomAliasRegistry";
import { isHardNavigationCommand } from "@/lib/hardNavigationCommands";

const WELCOME_HOME_RE =
  /^(?:(?:please\s+)?(?:go|take me|bring me|return|head)\s+(?:back\s+)?(?:to\s+)?(?:the\s+)?(?:estate|welcome home|home)|(?:open|show(?:\s+me)?)\s+(?:the\s+)?(?:estate|welcome home)|welcome home)$/i;

/** Explicit navigation verbs — required before Estate place resolution. */
const EXPLICIT_NAV_VERB_RE =
  /\b(?:go to|take me to|bring me to|head to|head over to|take me over to|take me|bring me|open|show me|visit|return to|(?:want|need|wanna)\s+to\s+go\s+to|i want to go to|let(?:'s| us) (?:go to|visit|head to)|(?:can|could|shall) we (?:go|head|visit|take)\b)/i;

/**
 * True when this utterance is an explicit place / workspace navigation command
 * that must win over awaiting-answer locks from other scopes.
 */
export function isDirectNavigationPriorityTurn(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;

  const normalized = t.replace(/[.!?]+$/, "").trim();
  if (WELCOME_HOME_RE.test(normalized)) return true;

  if (isHardNavigationCommand(t)) return true;

  // Never treat workflow content as navigation without an explicit verb.
  if (!EXPLICIT_NAV_VERB_RE.test(t)) return false;

  const direct = detectDirectCommand(t);
  if (direct?.executeImmediately) return true;

  // Canonical alias registry — covers polite / indirect phrasing with a nav verb.
  return Boolean(resolveEstatePlaceIdFromUserText(t));
}

/** Soft transition line — navigation should still execute immediately. */
export function directNavigationTransitionLine(placeLabel?: string | null): string {
  const label = (placeLabel ?? "").trim();
  if (!label) return "Let's go.";
  return `Let's go to the ${label}.`;
}
