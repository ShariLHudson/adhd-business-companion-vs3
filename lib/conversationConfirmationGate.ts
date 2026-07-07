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
