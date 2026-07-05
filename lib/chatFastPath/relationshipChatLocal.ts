/**
 * Terminal local path for RELATIONSHIP_CHAT — honors primary classifier owner.
 * No API, no estate kernel, no frictionless secondary responders.
 */

import type { PrimaryTurnDecision } from "@/lib/conversation/primaryTurnClassifier";
import { isRelationshipConversation } from "@/lib/intentAwareConversation/routingGate";
import { isSimpleSocialGreeting, simpleSocialGreetingReply } from "./simpleSocial";

const HOPE_GOOD_DAY_RE =
  /\b(?:hope you(?:'re| are) having a (?:good|great|wonderful|nice|beautiful) day|hope your day is (?:good|great|wonderful|going well))\b/i;

const THANKS_RE = /^(?:thanks|thank you)[\s!.,?]*$/i;

const HOW_ARE_YOU_RE =
  /\bhow(?:'re| are) you(?: doing| today| this morning| this afternoon)?\b/i;

const NOT_MUCH_RE = /\bnot much\b/i;

const WARM_RELATIONSHIP_REPLIES = [
  "That's really kind — thank you. I'm glad we're talking.",
  "I appreciate that. What's on your mind today?",
  "Thank you — that means a lot. How are you doing?",
] as const;

function stablePick(seed: string, options: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length]!;
}

/** Primary classifier assigned RELATIONSHIP_CHAT — complete locally, no downstream handlers. */
export function shouldCompleteRelationshipChatLocally(
  decision: PrimaryTurnDecision,
  userText: string,
): boolean {
  if (decision.type !== "RELATIONSHIP_CHAT") return false;
  if (decision.confidence !== "high") return false;
  return isRelationshipConversation(userText);
}

export function relationshipConversationLocalReply(userText: string): string {
  const trimmed = userText.trim();
  if (isSimpleSocialGreeting(trimmed)) {
    return simpleSocialGreetingReply(trimmed);
  }
  if (HOPE_GOOD_DAY_RE.test(trimmed)) {
    return "That's really kind — thank you. I hope today treats you gently too.";
  }
  if (THANKS_RE.test(trimmed)) {
    return "You're welcome. I'm glad to be here with you.";
  }
  if (HOW_ARE_YOU_RE.test(trimmed)) {
    if (NOT_MUCH_RE.test(trimmed)) {
      return "Not much can be a nice kind of quiet. I'm good — thanks for asking. What's on your mind?";
    }
    return "I'm doing well — thank you for asking. How are you really doing today?";
  }
  if (NOT_MUCH_RE.test(trimmed)) {
    return "That's okay. Sometimes a quiet day is exactly what we need.";
  }
  const day = new Date().toISOString().slice(0, 10);
  return stablePick(
    `${day}:${trimmed.toLowerCase()}`,
    WARM_RELATIONSHIP_REPLIES,
  );
}
