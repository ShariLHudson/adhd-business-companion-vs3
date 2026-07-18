/**
 * Package 191 — Grounded Acknowledgement & Context Rule.
 * Every acknowledgement must clearly connect to the user's subject.
 * Runs after CI delivery, before CQRI.
 */

import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import {
  isClarificationRequest,
  isIllegalTopicLabel,
  isStopWordTopic,
} from "@/lib/topicContinuityAnchorIntelligence";

export type GroundedAckFailureCode =
  | "GENERIC_ACKNOWLEDGEMENT"
  | "MISSING_TOPIC_REFERENCE"
  | "VAGUE_PRONOUN"
  | "EMPTY_EMPATHY"
  | "USER_WORDING_ECHO"
  | "UNRELATED_NEXT_QUESTION";

export type GroundedAckResult = {
  text: string;
  passed: boolean;
  failures: GroundedAckFailureCode[];
  usedFallback: boolean;
  regenerated: boolean;
};

/** Empty empathy / filler — blocked unless concrete topic follows in same turn. */
const GENERIC_ACK_LINES =
  /^(?:that seems important\.?|that sounds difficult\.?|that sounds hard\.?|i understand\.?|i'?m with you\.?|i am with you\.?|that makes sense\.?|i hear you\.?|that seems like an important part of this\.?|that seems like a big part of this\.?|i can understand that\.?|i'?m still with you\.?)$/i;

const GENERIC_ACK_PHRASE =
  /\b(?:that seems important|that sounds difficult|that sounds hard|that seems like an important part of this|that seems like a big part of this|i am with you|i'?m with you|i can understand that|i hear you\.?\s*$|that makes sense\.?\s*$)\b/i;

const EMPTY_EMPATHY_OPEN =
  /^(?:i understand|i can understand|i hear you|that makes sense|i'?m with you|i am with you)\b/i;

const VAGUE_OPEN =
  /^(?:that|this|it|something)\b(?!\s+(?:hiring|marketing|decision|cost|program|client|work|overload|timing))/i;

const VAGUE_PART_OF_THIS = /\b(?:part of this|part of that)\b/i;

const BANNED_NEXT_Q =
  /\b(?:what else wants to be said|what feels unfinished|what possibilities have you considered|what do you need that you may not be getting|what matters most(?:\s+here)?\??)\b/i;

function tokenizeMeaningful(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !isStopWordTopic(w));
}

/** Extract lightweight topic cues from the user turn for grounding checks. */
export function extractTopicCues(userText: string): string[] {
  const lower = userText.toLowerCase();
  const cues: string[] = [];
  if (/\bhir(?:e|ing)\b/.test(lower)) cues.push("hire", "hiring");
  if (/\bmarketing\b/.test(lower)) cues.push("marketing");
  if (/\b(?:cost|budget|expensive|investment|afford)\b/.test(lower)) {
    cues.push("cost", "investment");
  }
  // Multi-priority / avoidance before generic "client" (e.g. "client projects")
  if (
    /\b(?:project|projects|task|tasks)\b/.test(lower) &&
    /\b(?:avoid|avoiding|putting off|too many|three|several|multiple)\b/.test(
      lower,
    )
  ) {
    cues.push("projects", "avoiding", "heaviest", "start");
  }
  if (/\b(?:overwhelm|too many|too much|where to start)\b/.test(lower)) {
    cues.push("overload", "start");
  }
  if (/\b(?:program|offer|explain)\b/.test(lower)) {
    cues.push("program", "explain");
  }
  // Client conversation hesitation — not "client projects"
  if (
    /\bclient\b/.test(lower) &&
    /\b(?:bring (?:this|it) up|tell|conversation|say|talk to)\b/.test(lower)
  ) {
    cues.push("client");
  } else if (
    /\bclient\b/.test(lower) &&
    !/\b(?:project|projects)\b/.test(lower)
  ) {
    cues.push("client");
  }
  if (/\b(?:decid|whether|or not|should i)\b/.test(lower)) {
    cues.push("decide", "decision");
  }
  // Package 193 — never pull cues from clarification / stop-word turns
  if (!isClarificationRequest(userText)) {
    const tokens = tokenizeMeaningful(userText).slice(0, 8);
    for (const t of tokens) {
      if (!cues.includes(t) && !isStopWordTopic(t)) cues.push(t);
    }
  }
  return cues;
}

export function isGenericAcknowledgement(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (GENERIC_ACK_LINES.test(t)) return true;
  // Short draft dominated by empty empathy with no concrete noun phrase
  if (t.length < 48 && GENERIC_ACK_PHRASE.test(t) && !/\b(?:hir|market|cost|program|client|overload|start|decid)\w*/i.test(t)) {
    return true;
  }
  return false;
}

export function hasVaguePronounOpen(text: string): boolean {
  const t = text.trim();
  if (VAGUE_PART_OF_THIS.test(t) && !/\b(?:hir|market|decision|cost|program|client)\w*/i.test(t)) {
    return true;
  }
  // "That/This/It …" opening without a concrete noun in the first clause
  if (VAGUE_OPEN.test(t)) {
    const firstClause = t.split(/[.!?]/)[0] ?? t;
    const hasConcrete =
      /\b(?:hir(?:e|ing)|marketing|decision|cost|budget|program|client|overload|timing|investment|work)\b/i.test(
        firstClause,
      );
    if (!hasConcrete) return true;
  }
  return false;
}

export function isEmptyEmpathy(text: string): boolean {
  const t = text.trim();
  if (!EMPTY_EMPATHY_OPEN.test(t)) return false;
  // Allowed only when a concrete reference follows in the same response
  const after = t.replace(EMPTY_EMPATHY_OPEN, "").trim();
  if (after.length < 24) return true;
  return !/\b(?:hir|market|cost|program|client|overload|decid|budget|work)\w*/i.test(
    after,
  );
}

const TOPIC_SYNONYMS: Record<string, string[]> = {
  projects: ["project", "projects", "work", "plate"],
  avoiding: ["avoid", "avoiding", "putting off", "stuck"],
  heaviest: ["heaviest", "heavy", "urgent", "begin", "start"],
  start: ["start", "begin", "starting"],
  hire: ["hire", "hiring", "help"],
  hiring: ["hire", "hiring"],
  marketing: ["marketing", "market"],
  client: ["client", "conversation"],
  overload: ["overload", "overwhelm", "plate", "manageable"],
  program: ["program", "offer", "explain"],
  explain: ["explain", "explanation"],
  decide: ["decide", "decision", "choice", "weighing"],
  decision: ["decide", "decision", "choice"],
};

export function hasTopicReference(
  text: string,
  userText: string,
): boolean {
  const cues = extractTopicCues(userText);
  const draft = text.toLowerCase();
  if (cues.length === 0) {
    const userWords = tokenizeMeaningful(userText);
    return userWords.some((w) => draft.includes(w));
  }
  for (const c of cues) {
    const variants = TOPIC_SYNONYMS[c] ?? [c];
    if (variants.some((v) => draft.includes(v))) return true;
    if (draft.includes(c.toLowerCase())) return true;
  }
  return false;
}

/** Near-verbatim echo of the user (recognition, not repetition). */
export function isUserWordingEcho(userText: string, text: string): boolean {
  const u = userText.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const a = text.trim().toLowerCase().replace(/[^\w\s]/g, "");
  if (u.length < 12 || a.length < 12) return false;
  // "You …" + nearly the same words
  if (/^you (?:do not|don't|are trying|are not sure)/i.test(text.trim())) {
    const core = u
      .replace(/^(?:i |if i |i'm |i am )/, "")
      .slice(0, 48);
    if (core.length > 16 && a.includes(core.slice(0, 28))) return true;
  }
  // High token overlap on short statements
  const uw = new Set(tokenizeMeaningful(userText));
  const aw = tokenizeMeaningful(text);
  if (uw.size === 0 || aw.length === 0) return false;
  const overlap = aw.filter((w) => uw.has(w)).length;
  return overlap / Math.max(uw.size, 1) >= 0.85 && aw.length <= uw.size + 2;
}

export function hasUnrelatedNextQuestion(text: string): boolean {
  return BANNED_NEXT_Q.test(text);
}

/** Could this sentence fit an unrelated conversation unchanged? */
export function isCopyableAnywhere(text: string): boolean {
  const t = text.trim();
  if (GENERIC_ACK_LINES.test(t)) return true;
  if (t.length < 40 && !/\b(?:hir|market|cost|program|client|overload|decid)\w*/i.test(t)) {
    if (/^(?:that|this|it)\b/i.test(t)) return true;
  }
  return false;
}

/** Short yes/no/thanks turns — do not force topic re-naming. */
function isMinimalUserTurn(userText: string): boolean {
  const t = userText.trim().toLowerCase();
  if (t.length <= 2) return true;
  if (
    /^(?:yes|no|ok|okay|sure|thanks|thank you|yep|nope|mm+|uh-huh|right|exactly|true|go on|continue)\.?$/i.test(
      t,
    )
  ) {
    return true;
  }
  return tokenizeMeaningful(userText).length === 0 && t.length < 24;
}

/** Package 192 — correction turns name the topic in the draft, not the user line. */
function isDirectCorrectionTurn(userText: string): boolean {
  return /\b(?:nothing underneath|that(?:'s| is) not what i mean|you(?:'re| are) reading (?:it|this|me) wrong|i already told you|it(?:'s| is) just what i said)\b/i.test(
    userText.trim(),
  );
}

function isCorrectionRepairDraft(text: string): boolean {
  return /\b(?:you(?:'re| are) right|read more into|let(?:'s| us) stay with)\b/i.test(
    text,
  );
}

export function certifyGroundedAcknowledgement(input: {
  text: string;
  userText: string;
}): { passed: boolean; failures: GroundedAckFailureCode[] } {
  const failures: GroundedAckFailureCode[] = [];
  const text = input.text.trim();
  const userText = input.userText.trim();
  const minimalUser = isMinimalUserTurn(userText);
  const correctionTurn = isDirectCorrectionTurn(userText);
  const correctionDraft = isCorrectionRepairDraft(text);

  if (isGenericAcknowledgement(text) || isCopyableAnywhere(text)) {
    failures.push("GENERIC_ACKNOWLEDGEMENT");
  }
  if (isEmptyEmpathy(text)) {
    failures.push("EMPTY_EMPATHY");
  }
  if (hasVaguePronounOpen(text) && !(correctionTurn && correctionDraft)) {
    failures.push("VAGUE_PRONOUN");
  }
  // Topic reference required on substantive user turns (package 191 first-response rule)
  // Package 192/193 — correction & clarification drafts carry the topic from the anchor.
  if (
    !minimalUser &&
    !(correctionTurn && correctionDraft) &&
    !isClarificationRequest(userText) &&
    !hasTopicReference(text, userText)
  ) {
    failures.push("MISSING_TOPIC_REFERENCE");
  }
  if (
    correctionTurn &&
    /^(?:take your time\.?|i am with you\.?|what else wants to be said\??)$/i.test(
      text,
    )
  ) {
    failures.push("GENERIC_ACKNOWLEDGEMENT");
  }
  if (isUserWordingEcho(userText, text)) {
    failures.push("USER_WORDING_ECHO");
  }
  if (hasUnrelatedNextQuestion(text)) {
    failures.push("UNRELATED_NEXT_QUESTION");
  }

  return { passed: failures.length === 0, failures };
}

/**
 * Build a plain grounded fallback from the user's subject.
 * Prefer question-only when acknowledgement would be weak.
 */
export function buildGroundedFallback(
  userText: string,
  seed = 0,
  primaryTopic?: string | null,
): string {
  const anchored =
    primaryTopic?.trim() && !isIllegalTopicLabel(primaryTopic)
      ? primaryTopic.trim()
      : null;
  const lower = `${userText} ${anchored ?? ""}`.toLowerCase();

  if (anchored && isClarificationRequest(userText)) {
    return `I did not explain that clearly. You are deciding whether ${anchored} makes sense. What is making you consider it now?`;
  }

  if (
    /\bhir(?:e|ing)\b/.test(lower) &&
    /\bmarketing\b/.test(lower)
  ) {
    const options = [
      "You are trying to decide whether bringing in marketing help would be worth the investment right now. What is making you consider it at this point?",
      "You are weighing the cost of hiring someone against doing the marketing yourself. Which side feels harder to judge?",
      "Deciding whether to hire marketing help is a significant step. What would you hope a marketing person would take off your plate?",
    ];
    return options[Math.abs(seed) % options.length]!;
  }

  if (/\bhir(?:e|ing)\b/.test(lower)) {
    return "You are trying to decide whether hiring help is the right move. What is making the decision feel pressing now?";
  }

  if (
    /\b(?:project|projects|task|tasks)\b/.test(lower) &&
    /\b(?:avoid|avoiding|putting off|three|several|multiple)\b/.test(lower)
  ) {
    return "You have a few projects waiting, and none of them feel easy to begin. Which one feels heaviest when you picture starting?";
  }

  if (
    /\b(?:too many|too much|overwhelm|where to start)\b/.test(lower)
  ) {
    return "You have more on your plate than feels manageable, and starting is the hard part. What feels like the heaviest thing sitting in front of you?";
  }

  if (/\b(?:explain|program|offer)\b/.test(lower)) {
    return "You are stuck on how to explain your program clearly. What part of the explanation feels hardest to get right?";
  }

  if (
    /\bclient\b/.test(lower) &&
    (/\b(?:bring (?:this|it) up|conversation|tell|say|talk)\b/.test(lower) ||
      !/\b(?:project|projects)\b/.test(lower))
  ) {
    return "You are unsure whether to bring something up with your client. What feels most at risk if you say it — or if you stay quiet?";
  }

  if (/\b(?:decid|whether|or not|should i)\b/.test(lower)) {
    return "You are sitting with a real decision and do not want to rush it. What part of the choice feels murkiest right now?";
  }

  if (anchored) {
    return buildNaturalTopicReturn({ topic: anchored, mode: "continue" });
  }

  const cues = extractTopicCues(userText).filter((c) => !isStopWordTopic(c));
  if (cues.length > 0 && !isIllegalTopicLabel(cues[0]!)) {
    return buildNaturalTopicReturn({ topic: cues[0]!, mode: "continue" });
  }

  return "What feels most important to untangle in what you just shared?";
}

/**
 * Validate and, if needed, replace with a grounded fallback.
 * Call after CI, before CQRI.
 */
export function applyGroundedAcknowledgement(input: {
  draftText: string;
  userText: string;
  seed?: number;
  /** Package 193 — active Topic Anchor primary topic */
  primaryTopic?: string | null;
}): GroundedAckResult {
  // Clarification + illegal "around does" drafts always regenerate against anchor
  if (
    /\bsomething around does\b/i.test(input.draftText) ||
    (isClarificationRequest(input.userText) &&
      isIllegalTopicLabel(
        input.draftText.split(/\s+/).slice(-3).join(" "),
      ))
  ) {
    const fallback = buildGroundedFallback(
      input.userText,
      input.seed ?? input.draftText.length + input.userText.length,
      input.primaryTopic,
    );
    return {
      text: fallback,
      passed: true,
      failures: ["MISSING_TOPIC_REFERENCE"],
      usedFallback: true,
      regenerated: true,
    };
  }

  const first = certifyGroundedAcknowledgement({
    text: input.draftText,
    userText: input.userText,
  });
  if (first.passed) {
    return {
      text: input.draftText.trim(),
      passed: true,
      failures: [],
      usedFallback: false,
      regenerated: false,
    };
  }

  const fallback = buildGroundedFallback(
    input.userText,
    input.seed ?? input.draftText.length + input.userText.length,
    input.primaryTopic,
  );
  const second = certifyGroundedAcknowledgement({
    text: fallback,
    userText: input.userText,
  });

  return {
    text: fallback,
    passed: second.passed,
    failures: first.failures,
    usedFallback: true,
    regenerated: true,
  };
}
