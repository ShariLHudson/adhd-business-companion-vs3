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

const HOW_ABOUT_YOU_RE = /\b(?:how about you|what about you|and you)\b/i;

const NOT_MUCH_RE = /\bnot much\b/i;

const CASUAL_CHECK_IN_RE =
  /^(?:not much|nothing much|same old|same here|(?:pretty )?(?:good|fine|okay|ok|alright)|doing (?:good|well|okay|fine))(?:[\s!.,?-]+(?:how about you|how are you|and you|what about you|yourself))?[\s!.,?]*$/i;

/** Soft life updates — presence only, no workflow. */
const CASUAL_UPDATE_RE =
  /\b(?:appointment|meeting|call|interview|session)\b.{0,40}\b(?:went (?:well|great|okay|fine|better)|went better|turned out well)\b|\b(?:went (?:well|great|okay|fine))\b.{0,40}\b(?:appointment|meeting|call|interview|session)\b/i;

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

/** Messages we can answer warmly without API — casual greetings and reciprocal check-ins. */
export function isRelationshipLocalCandidate(userText: string): boolean {
  const trimmed = userText.trim();
  if (!trimmed || trimmed.length > 120) return false;
  if (isSimpleSocialGreeting(trimmed)) return true;
  if (HOPE_GOOD_DAY_RE.test(trimmed)) return true;
  if (THANKS_RE.test(trimmed)) return true;
  if (HOW_ARE_YOU_RE.test(trimmed)) return true;
  if (HOW_ABOUT_YOU_RE.test(trimmed)) return true;
  if (CASUAL_CHECK_IN_RE.test(trimmed)) return true;
  if (CASUAL_UPDATE_RE.test(trimmed)) return true;
  if (isRelationshipConversation(trimmed)) return true;
  return false;
}

/** Warm acknowledgment for soft updates — no menu, no forced question, no workflow. */
export function casualUpdateLocalReply(userText: string): string | null {
  const trimmed = userText.trim();
  if (!trimmed || !CASUAL_UPDATE_RE.test(trimmed)) return null;
  return "I'm really glad it went well. That kind of day can leave a little more room to breathe.";
}

/** Complete relationship small-talk locally — no API, no generic fallback. */
export function shouldCompleteRelationshipChatLocally(
  decision: PrimaryTurnDecision,
  userText: string,
): boolean {
  if (!isRelationshipLocalCandidate(userText)) return false;
  if (
    decision.confidence === "high" &&
    decision.type !== "RELATIONSHIP_CHAT"
  ) {
    return false;
  }
  return true;
}

export function relationshipConversationLocalReply(userText: string): string {
  const trimmed = userText.trim();
  const casualUpdate = casualUpdateLocalReply(trimmed);
  if (casualUpdate) return casualUpdate;
  if (isSimpleSocialGreeting(trimmed)) {
    return simpleSocialGreetingReply(trimmed);
  }
  if (HOPE_GOOD_DAY_RE.test(trimmed)) {
    return "That's really kind — thank you. I hope today treats you gently too.";
  }
  if (THANKS_RE.test(trimmed)) {
    return "You're welcome. I'm glad to be here with you.";
  }
  if (HOW_ARE_YOU_RE.test(trimmed) || HOW_ABOUT_YOU_RE.test(trimmed)) {
    if (NOT_MUCH_RE.test(trimmed)) {
      return "Not much can be a nice kind of quiet. I'm good — thanks for asking. What's on your mind?";
    }
    return "I'm doing well — thank you for asking. How are you really doing today?";
  }
  if (CASUAL_CHECK_IN_RE.test(trimmed)) {
    if (NOT_MUCH_RE.test(trimmed) || /^(?:nothing much|same old|same here)/i.test(trimmed)) {
      return "Not much can be a nice kind of quiet. I'm good — thanks for asking. What's on your mind?";
    }
    return "I'm doing well — thank you for asking. What's going on for you today?";
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
