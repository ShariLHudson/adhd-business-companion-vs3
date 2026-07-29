/**
 * Specialist follow-up continuity for GENERAL Companion chat.
 *
 * When cf8b6f86's expertise resolver silently selects a Chamber member for a
 * general-chat turn, that member should keep supplying substance across clearly
 * RELATED follow-ups — without the user re-stating context and without entering
 * the Chamber room. This is a light, in-memory "silent ownership" decision; it
 * does not navigate, persist, or touch the full Chamber lock.
 *
 * Silent ownership is RELEASED when the user:
 *   - changes topic (the follow-up is not clearly dependent on the prior answer),
 *   - explicitly names / is already in a Chamber or Board member (hasActiveOrNamedMember),
 *   - resolves to a DIFFERENT specialist this turn (switch, not release),
 *   - makes a Create request (or Create rejection), or
 *   - enters another owned workflow.
 *
 * Conservative by design: it retains only on a positive continuation signal and
 * otherwise releases to normal Shari chat.
 */

import type { ChamberMemberId } from "./chamberMemberRegistry";
import { isExplicitCreationRequest } from "@/lib/messageClassification";
import { isCreateRejection } from "@/lib/createIntentVocabulary";

/** A clearly new, standalone request that cancels specialist continuity. */
const STANDALONE_NEW_RE =
  /\b(?:i want to|i need to|i'?m trying to|let'?s (?:switch|talk about)|new (?:question|topic)|change of subject|different (?:question|topic|thing)|on another (?:note|topic))\b/i;

/** Dependent continuation markers — the turn leans on the prior answer. */
const CONTINUATION_RE =
  /^(?:and|also|so|but|ok(?:ay)?|well|hmm)\b|\b(?:what about|how about|what if|what else|and then|from there|in that case|for (?:that|this)|based on that|either way)\b|\bhow (?:do|would|should|can|long|much) (?:i|it|that|this|we|they)\b|^(?:why|which one|which of|and why)\b|\b(?:can|could) you (?:elaborate|explain|clarify|expand|give me|show me|walk me)\b|\btell me more\b|\bgo deeper\b|\bmore detail|\bexpand on\b|\bwalk me through\b|\b(?:give me|show me|any|some|a few|more)\b[^.?!]{0,24}\bexamples?\b|\bconcrete examples?\b/i;

/** Short pronoun-led elaboration ("that / she / it …"). */
const PRONOUN_LED_RE =
  /^(?:it|that|this|those|these|she|he|they|them|her|him|its|their)\b/i;

/** True when a null-resolver turn is a clearly RELATED follow-up (retain the member). */
export function isRelatedSpecialistFollowUp(text: string): boolean {
  const t = (text ?? "").trim();
  if (!t) return false;
  if (STANDALONE_NEW_RE.test(t)) return false;
  if (CONTINUATION_RE.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 12 && PRONOUN_LED_RE.test(t)) return true;
  return false;
}

export type SpecialistTurnDecision = {
  /** Member whose hint should be injected this turn (or null for general Shari). */
  memberId: ChamberMemberId | null;
  /** Member to retain as silent owner for the next turn (or null to release). */
  retain: ChamberMemberId | null;
};

/**
 * Decide the effective specialist member for the current general-chat turn and
 * what to retain for the next turn.
 */
export function resolveSpecialistTurnMember(input: {
  userText: string;
  /** Resolver result for THIS turn (from selectGeneralChatExpertiseMember). */
  resolvedMemberId: ChamberMemberId | null;
  /** Silently retained member from the prior turn. */
  retainedMemberId: ChamberMemberId | null;
  /** A Chamber/Board member is already active or explicitly named this turn. */
  hasActiveOrNamedMember: boolean;
  /** The turn belongs to another owned workflow (e.g. a parked-Create detour). */
  enteredOtherWorkflow: boolean;
}): SpecialistTurnDecision {
  const t = (input.userText ?? "").trim();

  // Hard release: an explicit/active member owns the turn, or another workflow does.
  if (input.hasActiveOrNamedMember || input.enteredOtherWorkflow) {
    return { memberId: null, retain: null };
  }
  // Create requests / rejections are owned elsewhere — release silent ownership.
  if (isExplicitCreationRequest(t) || isCreateRejection(t)) {
    return { memberId: null, retain: null };
  }
  // A specialist resolved this turn — use it (a fresh pick or a switch).
  if (input.resolvedMemberId) {
    return { memberId: input.resolvedMemberId, retain: input.resolvedMemberId };
  }
  // No specialist this turn: keep the retained member only for a related follow-up.
  if (input.retainedMemberId && isRelatedSpecialistFollowUp(t)) {
    return { memberId: input.retainedMemberId, retain: input.retainedMemberId };
  }
  // Topic change / unrelated / general → release.
  return { memberId: null, retain: null };
}
