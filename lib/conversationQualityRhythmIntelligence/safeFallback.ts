/**
 * Safe plain-language fallbacks — never generic coaching (package 208).
 */

import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import { containsGenericConversationTemplate } from "@/lib/shariNaturalConversation/genericTemplateBan";

const FALLBACKS = [
  "I don't think I have enough yet to ask the right question. What feels murkiest in this decision right now?",
  "Let me stay close to what you said. What feels like the bigger concern in what you just shared?",
  "I may be getting ahead of you. What would help most to untangle first?",
] as const;

const BANNED =
  /\b(?:what else wants to be said|what possibilities have you considered|what matters most|that seems important|that seems like an important part of this|that sounds difficult|let'?s stay with|what part feels most useful)\b/i;

export function isBannedFallbackPhrase(text: string): boolean {
  return BANNED.test(text) || containsGenericConversationTemplate(text);
}

export function buildSafeFallback(
  userText: string,
  seed: number,
  primaryTopic?: string | null,
): string {
  const topic = primaryTopic?.trim() || "";
  const lower = `${userText} ${topic}`.toLowerCase();

  if (topic && /\bhir|market|sales|assistant|bookkeep/i.test(topic)) {
    if (/\b(?:afraid|fear|wrong|wasting|money|cost)\b/.test(lower)) {
      return `You're still deciding about ${topic}, and the worry about cost or choosing poorly is front and center. Which part of that worry feels loudest right now?`;
    }
    return buildNaturalTopicReturn({ topic, mode: "continue" });
  }

  if (
    /\b(?:hire|hiring)\b/.test(lower) &&
    /\bmarketing\b/.test(lower)
  ) {
    return "You are trying to decide whether bringing in marketing help would be worth the investment right now. What is making you consider it at this point?";
  }
  if (
    /\b(?:hire|hiring|sales|outreach)\b/.test(lower) ||
    (/\b(?:afraid|wrong person|wasting money)\b/.test(lower) &&
      /\b(?:hire|hiring|person|money)\b/.test(lower))
  ) {
    return "You are weighing whether to hire help or keep carrying the work yourself, and the risk of a wrong hire is real. What feels hardest to trust in that choice?";
  }
  if (
    /\b(?:hire|hiring|outsourc|myself|cost)\b/.test(lower) &&
    /\b(?:or|versus|vs|or not)\b/.test(lower)
  ) {
    return "You are weighing the cost of hiring someone against doing the work yourself. Which side feels harder to judge?";
  }
  if (/overwhelm|too much|too many|everything|swirl|where to start/i.test(lower)) {
    return "You have more on your plate than feels manageable, and starting is the hard part. What feels like the heaviest thing sitting in front of you?";
  }
  if (/\b(?:explain|program|offer)\b/.test(lower)) {
    return "You are stuck on how to explain your program clearly. What part of the explanation feels hardest to get right?";
  }
  if (/\bclient\b/.test(lower)) {
    return "You are unsure whether to bring something up with your client. What feels most at risk if you say it — or if you stay quiet?";
  }
  if (topic) {
    return buildNaturalTopicReturn({ topic, mode: "continue" });
  }
  return FALLBACKS[Math.abs(seed) % FALLBACKS.length]!;
}
