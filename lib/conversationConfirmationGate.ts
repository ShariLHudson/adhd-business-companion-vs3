/**
 * Confirmation gate — when Spark asks a direct question, processing must stop.
 * Question asked = user owns the next turn.
 */

import {
  extractRoomPhraseFromNavigation,
  messageNamesExactEstateRoom,
} from "@/lib/estate/estateRoomAliasRegistry";
import type { FrictionlessPendingAction } from "./frictionlessActionLayer";
import type { WorkspaceOffer } from "./workspaceMode";
import { isBareGenericAcceptance } from "./pendingAcceptanceAuthority";

/** Assistant lines that require waiting for member answer — no thinking, no follow-up LLM. */
const CONFIRMATION_QUESTION_PATTERNS: readonly RegExp[] = [
  /\bwant me to open\b/i,
  /\bwould you like me to take you\b/i,
  /\bwould you like me to\b/i,
  /\bwould you like to add it to\b/i,
  /\bwould you like to preserve it\b/i,
  /\bwould you like to save it\b/i,
  /\bwould you like to place it\b/i,
  /\bwhere would you like this to rest\b/i,
  /\bshould i open\b/i,
  /\bshall i open\b/i,
  /\bdo you want to continue\b/i,
  /\bwould that help\b/i,
  /\bwant me to take you\b/i,
  /\bopen it\?\s*$/i,
  // Free-form build/create/draft/make invitations (F1/B1) — the assistant
  // offers to make something ("Want to build one?", "Should we create it
  // together?"). These previously armed nothing, so the confirming "yes"
  // arrived unowned.
  /\bwant (?:me )?to (?:build|create|draft|make|write|put together|set up)\b/i,
  /\bwould you like (?:me )?to (?:build|create|draft|make|write|put together)\b/i,
  /\bshould (?:i|we) (?:build|create|draft|make|write|put together|set up)\b/i,
  /\bshall (?:i|we)\b/i,
];

export type AwaitingConfirmationKind =
  | "room"
  | "tool"
  | "workspace"
  | "estate"
  | "general";

export type PendingEstateConfirmation = {
  type: "openRoom";
  targetSection: string;
  targetEntryId?: string;
  label: string;
  sourceIntent: string;
  offeredAtTurn: number;
};

export type AwaitingUserConfirmationState = {
  active: boolean;
  kind: AwaitingConfirmationKind;
  assistantPrompt: string;
  offeredAtTurn: number;
  frictionlessPending?: FrictionlessPendingAction | null;
  workspaceOffer?: WorkspaceOffer | null;
  estatePending?: PendingEstateConfirmation | null;
};

export function messageAsksUserConfirmation(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.includes("?")) return false;
  return CONFIRMATION_QUESTION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function shouldStopAfterAssistantOffer(assistantContent: string): boolean {
  return messageAsksUserConfirmation(assistantContent);
}

/**
 * Decide whether a free-form assistant reply should arm a first-class pending
 * question on the ownership spine (F1/B1). True only for a genuine
 * confirmation/build/create/offer invitation, and never when a structured
 * offer (menu, strategy, visual, estate) already armed a pending this turn.
 * This is a pure decision — it stores no state and adds no parallel tracker;
 * the caller seeds the existing awaiting-confirmation + spine ownership.
 */
export function shouldArmPendingQuestion(
  assistantReply: string,
  opts?: { alreadyArmed?: boolean },
): boolean {
  if (opts?.alreadyArmed) return false;
  return messageAsksUserConfirmation(assistantReply);
}

export function createAwaitingConfirmationState(input: {
  assistantPrompt: string;
  offeredAtTurn: number;
  kind?: AwaitingConfirmationKind;
  frictionlessPending?: FrictionlessPendingAction | null;
  workspaceOffer?: WorkspaceOffer | null;
  estatePending?: PendingEstateConfirmation | null;
}): AwaitingUserConfirmationState {
  return {
    active: true,
    kind: input.kind ?? "general",
    assistantPrompt: input.assistantPrompt,
    offeredAtTurn: input.offeredAtTurn,
    frictionlessPending: input.frictionlessPending ?? null,
    workspaceOffer: input.workspaceOffer ?? null,
    estatePending: input.estatePending ?? null,
  };
}

const DECLINE_RE =
  /^(?:no|nope|nah|not now|not yet|stay(?:\s+here)?|something else|keep talking|later)\b/i;

const ACCEPT_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|open it|take me there|go ahead|do it|sounds good|that works|that would be great|let'?s do (?:it|that)|please do)\b/i;

export function isConfirmationAcceptance(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return ACCEPT_RE.test(t);
}

/**
 * Bounded continuation / selection short answers that bind to an ACTIVE
 * awaiting-reply owner (B2): "go", "continue", "next", "that one", "the first
 * one", "option two", etc. These are `$`-anchored short answers, so a longer
 * navigation sentence ("go to the boardroom", "continue working on the deck")
 * does NOT match.
 */
const ACTIVE_QUESTION_BINDING_RE =
  /^(?:go|go for it|continue|keep going|next|that one|this one|(?:the )?(?:first|second) one|option (?:one|two|1|2)|number (?:one|two|1|2))[.!]?$/i;

/**
 * Acceptance vocabulary for an ACTIVE awaiting-reply owner only (B2). Extends
 * base confirmation acceptance (yes / sure / okay / go ahead …) with the
 * bounded continuation / selection tokens above.
 *
 * MUST be consulted only where an awaiting-reply owner is already confirmed —
 * i.e. inside the ownership-guarded `confirmation_acceptance` resolver branch.
 * It is deliberately NOT wired into the shared `isConfirmationAcceptance`,
 * because that predicate is also read by unguarded navigation / task-lock /
 * frictionless consumers, where widening would become a global "short reply
 * means yes" rule and let unrelated systems capture these tokens.
 */
export function isActiveQuestionAcceptance(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isConfirmationAcceptance(t)) return true;
  return ACTIVE_QUESTION_BINDING_RE.test(t);
}

export function isConfirmationDecline(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return DECLINE_RE.test(t);
}

/** Decline only — not "no, take me to the music room". */
export function isPureConfirmationDecline(text: string): boolean {
  if (!isConfirmationDecline(text)) return false;
  if (messageNamesExactEstateRoom(text)) return false;
  if (extractRoomPhraseFromNavigation(text)) return false;
  return true;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Armed-owner acceptance predicate (MA-04, Phase 2a)
 *
 * The single authority-related check for one narrow question: "does this reply
 * look like a short acceptance of the already-armed owner?" It is a pure
 * boolean — it cannot arm, resume, route, or decide ownership. See
 * docs/architecture/CANONICAL_OWNERSHIP_AUTHORITY.md and
 * docs/architecture/MA01_MA04_OWNERSHIP_GATE_DESIGN.md.
 *
 * Vocabulary is REUSED, not duplicated: the base is the canonical whole-message
 * `isBareGenericAcceptance` (pendingAcceptanceAuthority) plus a small supplement
 * for matrix tokens that base misses ("do it", "absolutely", the "yes please"
 * politeness combo). Both sources are whole-message anchored, so any reply that
 * carries a cancellation / topic-switch / clarification / emotional clause
 * ("sure, cancel that", "yes, but pricing", "okay, I'm overwhelmed", "sounds
 * good to me generally") fails by construction. This predicate does NOT change
 * the behavior of `isBareGenericAcceptance`, `isConfirmationAcceptance`, or
 * `isActiveQuestionAcceptance`; broader consolidation is MA-11.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Minimal descriptor of an armed owner. Accepts the spine ownership status
 * (`"awaiting_user"`), the legacy awaiting-confirmation `active` flag, or a bare
 * boolean. Anything falsy / non-awaiting = no owner armed.
 */
export type ArmedOwnerSignal =
  | boolean
  | { active?: boolean | null; status?: string | null }
  | null
  | undefined;

function isArmedOwnerActive(armed: ArmedOwnerSignal): boolean {
  if (armed === true) return true;
  if (!armed || typeof armed !== "object") return false;
  if (typeof armed.status === "string") return armed.status === "awaiting_user";
  return armed.active === true;
}

/** Normalize for acceptance matching — case, curly apostrophes, whitespace, trailing punctuation. */
function normalizeAcceptanceText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?…]+$/g, "")
    .trim()
    .toLowerCase();
}

/** Matrix tokens the canonical base regex does not cover; whole-message anchored. */
const SHORT_ACCEPTANCE_SUPPLEMENT_RE =
  /^(?:do it|absolutely|(?:yes|okay|ok|sure)\s+please)$/i;

/**
 * PURE text check: is the whole reply a bare short acceptance? Reuses the
 * canonical `isBareGenericAcceptance` vocabulary + the supplement above. No
 * owner context; cannot arm/resume/decide anything.
 */
export function isBareShortAcceptanceText(text: string): boolean {
  const t = normalizeAcceptanceText(text);
  if (!t) return false;
  return isBareGenericAcceptance(t) || SHORT_ACCEPTANCE_SUPPLEMENT_RE.test(t);
}

/**
 * Owner-aware wrapper — the single authority-related predicate for the ARMED
 * OWNER acceptance question (MA-04). True only when (a) an owner is armed
 * (`awaiting_user` / `active`) AND (b) the reply is a bare short acceptance.
 * Generic agreement with NO armed owner is never an acceptance here.
 */
export function isShortAcceptanceOfArmedOwner(
  text: string,
  armed: ArmedOwnerSignal,
): boolean {
  if (!isArmedOwnerActive(armed)) return false;
  return isBareShortAcceptanceText(text);
}
