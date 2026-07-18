/**
 * Package 209 — Human Conversation Validator (required quality gate).
 */

import {
  containsGenericConversationTemplate,
  failsHumanLanguageTest,
  responseCentersOnRejectedBackground,
} from "@/lib/shariNaturalConversation";
import { containsUnsupportedHiddenMeaning } from "@/lib/reflectiveConversationIntelligence/noHiddenMeaning";
import { matchBlockedPhrases } from "./blockedPhraseRegistry";
import type {
  HumanConversationFailureCode,
  HumanConversationValidationResult,
  HcvValidateInput,
  ValidationFinding,
} from "./types";

const CRITICAL: ReadonlySet<HumanConversationFailureCode> = new Set([
  "HCV_TOPIC_DRIFT",
  "HCV_BACKGROUND_REPLACED_TOPIC",
  "HCV_TOPIC_ANCHOR_MISSING",
  "HCV_USER_CORRECTION_IGNORED",
  "HCV_REJECTED_INTERPRETATION_REUSED",
  "HCV_TEMPLATE_SHELL_DETECTED",
  "HCV_HIDDEN_MEANING_INVENTED",
  "HCV_UNSUPPORTED_INTERPRETATION",
  "HCV_MALFORMED_TOPIC_PHRASE",
  "HCV_FAILED_REPAIR_CONTINUITY",
  "HCV_LATEST_TURN_IGNORED",
  "HCV_ROLE_MISMATCH",
  "HCV_AI_LIKE_LANGUAGE",
  "HCV_EMPTY_ACKNOWLEDGEMENT",
  "HCV_USER_MEANING_REPLACED",
]);

const MALFORMED_TOPIC =
  /\b(?:designing|building|creating)\s+(?:new\s+)?(?:adhd\s+)?(?:business\s+)?platform\s+need\b|\bstay with [a-z]+(?: [a-z]+){3,}\s+need\b|\bworking through something around\b/i;

const DESIGN_AS_SUBJECT =
  /\b(?:what part of designing|stay with design|designing (?:the |your )?(?:platform|app)|platform design is the question)\b/i;

const AI_LIKE =
  /\b(?:great question|let'?s dive in|here'?s a breakdown|as an ai|in conclusion|leverage|synerg|optimize your|i understand your concern)\b/i;

const CLINICAL =
  /\b(?:dysregulation|attachment wound|cognitive distortion|executive dysfunction pattern)\b/i;

const CORPORATE =
  /\b(?:circle back|actionable insights|best practices|key takeaways|align on)\b/i;

const PRESCRIPTIVE =
  /\b(?:you should|you need to|you must|you have to)\b.*\b(?:hire|decide|launch|quit)\b/i;

function push(
  findings: ValidationFinding[],
  codes: HumanConversationFailureCode[],
  dimension: string,
  code: HumanConversationFailureCode,
  detail: string,
): void {
  const critical = CRITICAL.has(code);
  findings.push({ dimension, code, detail, critical });
  codes.push(code);
}

function draftMentionsTopic(text: string, topic: string): boolean {
  const parts = topic
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  if (parts.length === 0) return false;
  const d = text.toLowerCase();
  const hits = parts.filter((w) => d.includes(w));
  return (
    hits.length >= Math.min(2, parts.length) ||
    hits.some((w) => /hir|market|sales|client|program|project|cost|member/.test(w))
  );
}

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function recentAssistantTexts(messages: HcvValidateInput["messages"]): string[] {
  return messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .slice(-4);
}

export function validateHumanConversation(
  input: HcvValidateInput,
): HumanConversationValidationResult {
  const findings: ValidationFinding[] = [];
  const codes: HumanConversationFailureCode[] = [];
  const text = input.draftText.trim();
  const userText = input.userText.trim();
  const topic = input.topicAnchor?.trim() || "";
  const scores = {
    topicFidelity: 20,
    naturalLanguage: 15,
    specificity: 10,
    continuity: 15,
    shariVoice: 15,
    questionQuality: 10,
    rhythmVariety: 5,
    interpretation: 5,
    clarity: 5,
  };

  if (!text) {
    push(findings, codes, "clarity", "HCV_INCOMPLETE_SENTENCE", "empty draft");
    scores.clarity = 0;
  }

  // —— 1 Topic fidelity ——
  if (MALFORMED_TOPIC.test(text) || /\bplatform need\b/i.test(text)) {
    push(
      findings,
      codes,
      "topic",
      "HCV_MALFORMED_TOPIC_PHRASE",
      "malformed topic phrase",
    );
    scores.topicFidelity -= 10;
    scores.clarity -= 3;
  }

  if (
    topic &&
    /\bhir|market/i.test(topic) &&
    DESIGN_AS_SUBJECT.test(text) &&
    !/\b(?:market|hir|discover|membership|background)\b/i.test(text)
  ) {
    push(
      findings,
      codes,
      "topic",
      "HCV_BACKGROUND_REPLACED_TOPIC",
      "design/platform replaced hire topic",
    );
    scores.topicFidelity -= 12;
  }

  if (
    responseCentersOnRejectedBackground({
      responseText: text,
      activeTopic: topic,
      rejectedSubjects: input.rejectedInterpretations,
    })
  ) {
    push(
      findings,
      codes,
      "topic",
      "HCV_TOPIC_DRIFT",
      "centers on rejected background",
    );
    scores.topicFidelity -= 10;
  }

  if (
    topic &&
    text.length > 40 &&
    !draftMentionsTopic(text, topic) &&
    !input.repairActive &&
    /\b(?:bookkeeper|client relationship|program)\b/i.test(text)
  ) {
    push(findings, codes, "topic", "HCV_TOPIC_DRIFT", "unrelated subject");
    scores.topicFidelity -= 8;
  }

  if (
    (input.repairActive || (input.userCorrections?.length ?? 0) > 0) &&
    topic &&
    !draftMentionsTopic(text, topic) &&
    !/\b(?:right|correct|misread|looking at the wrong)\b/i.test(text)
  ) {
    push(
      findings,
      codes,
      "topic",
      "HCV_USER_CORRECTION_IGNORED",
      "correction without topic return",
    );
    scores.topicFidelity -= 10;
  }

  for (const rejected of (input.rejectedInterpretations ?? []).slice(-3)) {
    const stem = rejected.toLowerCase().slice(0, 28);
    if (stem.length > 16 && text.toLowerCase().includes(stem.slice(0, 20))) {
      push(
        findings,
        codes,
        "topic",
        "HCV_REJECTED_INTERPRETATION_REUSED",
        "rejected interpretation reused",
      );
      scores.topicFidelity -= 8;
      scores.interpretation -= 3;
    }
  }

  // —— 2 Natural language / templates ——
  const blocked = matchBlockedPhrases(text);
  if (blocked.some((b) => b.severity === "critical") || containsGenericConversationTemplate(text)) {
    push(
      findings,
      codes,
      "natural",
      "HCV_TEMPLATE_SHELL_DETECTED",
      blocked[0]?.id ?? "generic template",
    );
    scores.naturalLanguage -= 10;
    scores.shariVoice -= 6;
  }
  if (failsHumanLanguageTest(text) || AI_LIKE.test(text)) {
    push(findings, codes, "natural", "HCV_AI_LIKE_LANGUAGE", "fails human language test");
    scores.naturalLanguage -= 8;
  }
  if (/\bwhat this is really about|deeper fear|unspoken\b/i.test(text)) {
    push(
      findings,
      codes,
      "natural",
      "HCV_ABSTRACT_COACHING_LANGUAGE",
      "abstract coaching",
    );
    scores.naturalLanguage -= 5;
  }

  // —— 3 Specificity ——
  if (
    /^(?:that seems important|i hear you|i understand|that makes sense)\.?$/i.test(
      text,
    )
  ) {
    push(findings, codes, "specificity", "HCV_EMPTY_ACKNOWLEDGEMENT", "empty ack");
    scores.specificity -= 8;
  }
  if (
    text.length > 20 &&
    topic &&
    !draftMentionsTopic(text, topic) &&
    !/\b(?:you|that|this)\b/i.test(userText)
  ) {
    // soft
    scores.specificity -= 2;
  }
  if (
    /^(?:that seems important\.?\s*)?what part feels hardest\??$/i.test(text)
  ) {
    push(
      findings,
      codes,
      "specificity",
      "HCV_COPYABLE_ANYWHERE_RESPONSE",
      "generic anywhere response",
    );
    scores.specificity = 0;
  }
  if (
    topic &&
    text.length > 50 &&
    !draftMentionsTopic(text, topic) &&
    !/\b(?:cost|role|result|member|discover|market|hir)\b/i.test(text)
  ) {
    push(
      findings,
      codes,
      "specificity",
      "HCV_MISSING_TOPIC_REFERENCE",
      "missing topic reference",
    );
    scores.specificity -= 5;
  }

  // —— 4 Continuity ——
  if (
    userText.endsWith("?") &&
    !/\?/.test(text) &&
    text.length < 40 &&
    /^(?:that seems|i hear|take your)/i.test(text)
  ) {
    push(
      findings,
      codes,
      "continuity",
      "HCV_LATEST_TURN_IGNORED",
      "ignored direct question",
    );
    scores.continuity -= 10;
  }
  if (
    input.repairActive &&
    MALFORMED_TOPIC.test(text)
  ) {
    push(
      findings,
      codes,
      "continuity",
      "HCV_FAILED_REPAIR_CONTINUITY",
      "incoherent repair",
    );
    scores.continuity -= 10;
  }

  // —— 5 Shari voice ——
  if (CLINICAL.test(text)) {
    push(findings, codes, "voice", "HCV_CLINICAL_TONE", "clinical tone");
    scores.shariVoice -= 8;
  }
  if (CORPORATE.test(text)) {
    push(findings, codes, "voice", "HCV_CORPORATE_TONE", "corporate tone");
    scores.shariVoice -= 8;
  }
  if (PRESCRIPTIVE.test(text) && input.conversationMode === "reflective_thinking") {
    push(findings, codes, "voice", "HCV_PRESCRIPTIVE_TONE", "prescriptive in reflective");
    scores.shariVoice -= 6;
  }
  if (blocked.length > 0) {
    push(findings, codes, "voice", "HCV_SCRIPTED_TONE", "scripted shell");
    scores.shariVoice -= 4;
  }

  // —— 6 Question quality ——
  const qCount = countQuestions(text);
  if (qCount >= 3) {
    push(findings, codes, "question", "HCV_STACKED_QUESTIONS", "3+ questions");
    scores.questionQuality -= 8;
  }
  if (/\bwhat matters most\b|\btell me more\b/i.test(text)) {
    push(findings, codes, "question", "HCV_GENERIC_QUESTION", "generic question");
    scores.questionQuality -= 6;
  }
  if (/\bare you (?:afraid|scared|avoiding)\b/i.test(text) && !/\bafraid|scared|avoid/i.test(userText)) {
    push(
      findings,
      codes,
      "question",
      "HCV_UNSUPPORTED_EMOTIONAL_QUESTION",
      "emotional presumption",
    );
    scores.questionQuality -= 6;
    scores.interpretation -= 2;
  }

  const recent = recentAssistantTexts(input.messages);
  const lastQ = text.match(/[^.!?]*\?/)?.[0]?.trim().toLowerCase() ?? "";
  if (
    lastQ.length > 24 &&
    recent.some((r) => r.toLowerCase().includes(lastQ.slice(0, 28)))
  ) {
    push(findings, codes, "question", "HCV_REPEATED_QUESTION", "repeated question");
    scores.questionQuality -= 5;
    scores.rhythmVariety -= 2;
  }

  // —— 7 Rhythm ——
  const lastThreeQs = recent.slice(-3).filter((r) => r.includes("?")).length;
  if (lastThreeQs >= 3 && qCount >= 1 && !input.repairActive) {
    push(
      findings,
      codes,
      "rhythm",
      "HCV_QUESTION_EVERY_TURN",
      "question every recent turn",
    );
    scores.rhythmVariety -= 3;
  }

  // —— 8 Repetition ——
  const opening = text.slice(0, 40).toLowerCase();
  if (
    opening.length > 16 &&
    recent.filter((r) => r.toLowerCase().startsWith(opening.slice(0, 20))).length >=
      2
  ) {
    push(findings, codes, "rhythm", "HCV_REPEATED_OPENING", "repeated opening");
    scores.rhythmVariety -= 2;
  }

  // —— 9 Hidden meaning ——
  if (containsUnsupportedHiddenMeaning(text)) {
    push(
      findings,
      codes,
      "interpretation",
      "HCV_HIDDEN_MEANING_INVENTED",
      "hidden meaning invented",
    );
    scores.interpretation = 0;
  }
  if (
    /\bnothing underneath|nothing to do with/i.test(userText) &&
    /\bunderneath|deeper|really about\b/i.test(text)
  ) {
    push(
      findings,
      codes,
      "interpretation",
      "HCV_USER_MEANING_REPLACED",
      "continued hidden meaning after denial",
    );
    scores.interpretation = 0;
    scores.topicFidelity -= 5;
  }

  // —— 10 Clarity ——
  if (text.length > 900) {
    push(findings, codes, "clarity", "HCV_EXCESSIVE_LENGTH", "too long");
    scores.clarity -= 3;
  }
  if (text.length > 280 && !/[.!?]/.test(text.slice(0, 200))) {
    push(findings, codes, "clarity", "HCV_DENSE_PARAGRAPH", "dense paragraph");
    scores.clarity -= 2;
  }

  // Clamp scores
  for (const k of Object.keys(scores) as (keyof typeof scores)[]) {
    scores[k] = Math.max(0, scores[k]);
  }

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const uniqueCodes = [...new Set(codes)];
  const criticalFailure = findings.some((f) => f.critical);
  const passed =
    !criticalFailure &&
    overallScore >= 90 &&
    scores.topicFidelity >= 18 &&
    scores.continuity >= 13 &&
    scores.shariVoice >= 13;

  const regenerationInstructions = buildRegenInstructions(input, uniqueCodes);
  const safeFallbackRequired = criticalFailure || uniqueCodes.length >= 3;

  return {
    passed,
    overallScore,
    criticalFailure,
    failureCodes: uniqueCodes,
    findings,
    regenerationInstructions,
    safeFallbackRequired,
    dimensionScores: scores,
  };
}

function buildRegenInstructions(
  input: HcvValidateInput,
  codes: HumanConversationFailureCode[],
): string[] {
  const topic = input.topicAnchor?.trim() || "the user's stated decision";
  const out: string[] = [
    `Stay with ${topic}.`,
    "Treat platform/product design only as background unless the user changed topics.",
    "Use plain conversational language.",
    'Do not use "Let\'s stay with" or "What part feels most useful."',
    "Make one grounded observation.",
    "Ask at most one natural question.",
  ];
  if (codes.includes("HCV_USER_CORRECTION_IGNORED") || input.repairActive) {
    out.unshift("Acknowledge the user's correction briefly.");
  }
  if (codes.includes("HCV_HIDDEN_MEANING_INVENTED")) {
    out.push("Do not invent deeper meaning or hidden fears.");
  }
  if (input.currentFocus) {
    out.push(`Current focus: ${input.currentFocus}.`);
  }
  return out;
}

export { CRITICAL as HCV_CRITICAL_FAILURES };
