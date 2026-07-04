/**
 * Routing gate — "Is this person simply talking to me, or asking me to help them DO something?"
 * @see docs/estate/INTENT_AWARE_CONVERSATION_FRAMEWORK.md
 */

import { evaluateImpliedNeed } from "./impliedNeed";

/** Friendly / relational — never launch workspaces */
export const RELATIONSHIP_CONVERSATION_PATTERNS: readonly RegExp[] = [
  /^(?:hi|hello|hey|good morning|good afternoon|good evening)[\s!.,?]*$/i,
  /^(?:thanks|thank you)[\s!.,?]*$/i,
  /\b(?:how are you|how(?:'ve| have) you been)\b/i,
  /\b(?:hope you(?:'re| are) having a (?:good|great|wonderful|nice|beautiful) day)\b/i,
  /\b(?:hope your day is (?:good|great|wonderful|going well))\b/i,
  /\b(?:thank you|thanks(?: so much)?)(?: for (?:your help|everything|being here))?\b/i,
  /\b(?:i appreciate (?:your help|you|everything you've done))\b/i,
  /\b(?:you(?:'re| are) doing a great job|great job(?:,)? spark)\b/i,
  /\b(?:that(?:'s| is) (?:funny|kind of you|sweet|nice of you))\b/i,
  /\b(?:i'?m glad we(?:'re| are) working together)\b/i,
  /\b(?:nice to (?:see|talk to|chat with) you)\b/i,
  /\b(?:good to (?:see|hear from) you)\b/i,
];

/** Explicit celebration — high confidence only */
export const CELEBRATION_HIGH_CONFIDENCE_PATTERNS: readonly RegExp[] = [
  /\b(?:want to celebrate|need to celebrate|let'?s celebrate|something to celebrate)\b/i,
  /\b(?:celebrat(?:e|ion|ing)(?:\s+(?:this|that|it|my|our|a)))\b/i,
  /\b(?:accomplish(?:ment|ed)|achievement|milestone|promotion|anniversary|birthday)\b/i,
  /\b(?:big win|huge win|major win|small win|i did it|we did it)\b/i,
  /\b(?:finally (?:shipped|launched|finished|completed)|shipped the|launched (?:the|my|it)|went well)\b/i,
  /\b(?:finished my (?:book|course|project|launch)|completed my (?:book|course|project|goal))\b/i,
  /\b(?:share a win|record (?:this|a) win|plant (?:this|a) (?:win|celebration))\b/i,
  /\b(?:commemorate|honor this (?:moment|win|achievement)|mark this (?:moment|milestone))\b/i,
  /\b(?:something good happened|proud of (?:myself|what|how)|worth celebrating)\b/i,
];

/** Positive sentiment that is NOT celebration intent */
const POSITIVE_SENTIMENT_ONLY_RE =
  /\b(?:good day|great day|wonderful day|nice day|beautiful day|hope you(?:'re| are)|you(?:'re| are) (?:kind|sweet|great|amazing|wonderful)|doing a great job)\b/i;

/** Member wants Spark to help them act — create, navigate, save, solve, etc. */
const MEMBER_ACTION_INTENT_RE =
  /\b(?:help me|i need (?:to|you to)|i want to|let'?s|can you help|could you help|please (?:help|create|write|build|research|plan|organize|celebrate|journal|save|record))\b/i;

const MEMBER_TASK_RE =
  /\b(?:write (?:a|an|my)|create (?:a|an|my)|build (?:a|an|my)|draft (?:a|an|my)|research|plan my|organize my|fix this|solve this|take me to|go to|open (?:the )?|visit (?:the )?)\b/i;

const MEMBER_SHARE_MOMENT_RE =
  /\b(?:i (?:finished|completed|launched|published|shipped|built|solved|handled|overcame|figured out)|today i|just (?:finished|completed|launched|shipped|did))\b/i;

export function isRelationshipConversation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.length > 120) return false;
  return RELATIONSHIP_CONVERSATION_PATTERNS.some((re) => re.test(t));
}

export function hasHighConfidenceCelebrationIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isRelationshipConversation(t)) return false;
  if (isPositiveSentimentWithoutCelebration(t)) return false;
  return CELEBRATION_HIGH_CONFIDENCE_PATTERNS.some((re) => re.test(t));
}

export function isPositiveSentimentWithoutCelebration(text: string): boolean {
  const t = text.trim();
  if (!POSITIVE_SENTIMENT_ONLY_RE.test(t)) return false;
  if (CELEBRATION_HIGH_CONFIDENCE_PATTERNS.some((re) => re.test(t))) return false;
  if (MEMBER_SHARE_MOMENT_RE.test(t)) return false;
  return true;
}

/**
 * Internal routing question: is the member asking Spark to help them DO something?
 * If no — remain in conversation.
 */
export function memberIsAskingToDoSomething(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isRelationshipConversation(t)) return false;
  if (isPositiveSentimentWithoutCelebration(t)) return false;
  if (MEMBER_ACTION_INTENT_RE.test(t)) return true;
  if (MEMBER_TASK_RE.test(t)) return true;
  if (MEMBER_SHARE_MOMENT_RE.test(t)) return true;
  if (hasHighConfidenceCelebrationIntent(t)) return true;
  if (evaluateImpliedNeed(t)) return true;
  return false;
}

export function routingGateHintForChat(text: string): string | null {
  if (isRelationshipConversation(text)) {
    return [
      "RELATIONSHIP CONVERSATION (mandatory):",
      "Member is being friendly — NOT asking for a workspace.",
      "Respond warmly and naturally. NO routing. NO Celebration Garden. NO collection offers.",
      "Example tone: thank them, reflect warmth, one gentle 'what would you like to work on?' if natural.",
    ].join("\n");
  }
  const impliedNeed = evaluateImpliedNeed(text);
  if (impliedNeed) {
    return impliedNeed.responseHint;
  }
  if (!memberIsAskingToDoSomething(text)) {
    return [
      "ROUTING GATE (mandatory):",
      "Member is not asking Spark to DO something — stay in conversation.",
      "Do not offer workspaces, Estate places, or celebration unless they clearly share an accomplishment.",
      "Positive sentiment is not celebration intent.",
    ].join("\n");
  }
  if (/\b(?:celebrat|win|proud|accomplish|milestone)\b/i.test(text) && !hasHighConfidenceCelebrationIntent(text)) {
    return [
      "CELEBRATION CONFIDENCE (mandatory):",
      "Celebration language is too weak — do NOT offer Celebration Garden.",
      "Remain in conversation unless they explicitly want to celebrate, record, or commemorate something.",
    ].join("\n");
  }
  return null;
}
