/**
 * Retrieve relevant gold standards — structure only, never verbatim scripts.
 */

import { listGoldStandardConversations } from "./catalog";
import type {
  GscConversationalMove,
  GscRetrievalInput,
  GscRetrievalResult,
  GoldStandardConversation,
} from "./types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4);
}

function scoreConversation(
  entry: GoldStandardConversation,
  input: GscRetrievalInput,
): { score: number; matchedTags: string[] } {
  let score = 0;
  const matchedTags: string[] = [];
  const blob = [
    input.userText,
    input.topicAnchor ?? "",
    ...(input.knownConcerns ?? []),
    ...(input.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const tokens = new Set(tokenize(blob));
  const topic = (input.topicAnchor ?? "").toLowerCase();

  if (topic && entry.topicAnchor.toLowerCase().includes(topic.slice(0, 24))) {
    score += 4;
  }
  if (topic && topic.includes(entry.topicAnchor.toLowerCase().slice(0, 16))) {
    score += 3;
  }

  for (const tag of entry.runtimeTags) {
    if (blob.includes(tag.replace(/_/g, " ")) || blob.includes(tag)) {
      score += 2;
      matchedTags.push(tag);
    }
    // soft keyword bridge
    if (tag === "hiring" && /\bhir(?:e|ing)\b/.test(blob)) {
      score += 2;
      matchedTags.push(tag);
    }
    if (tag === "marketing" && /\bmarketing\b/.test(blob)) {
      score += 2;
      matchedTags.push(tag);
    }
    if (tag === "sales" && /\bsales?\b/.test(blob)) {
      score += 2;
      matchedTags.push(tag);
    }
    if (tag === "repair" && input.clarificationOrRepair) {
      score += 5;
      matchedTags.push(tag);
    }
    if (tag === "correction" && input.clarificationOrRepair) {
      score += 3;
      matchedTags.push(tag);
    }
    if (
      tag === "no_hidden_meaning" &&
      (input.rejectedInterpretations?.length ?? 0) > 0
    ) {
      score += 4;
      matchedTags.push(tag);
    }
  }

  for (const t of tokenize(entry.topicAnchor)) {
    if (tokens.has(t)) score += 1;
  }

  if (input.clarificationOrRepair && entry.category === "repairs") {
    score += 4;
  }

  // Keyword-only matching is capped — prefer topic + tags
  return { score, matchedTags: [...new Set(matchedTags)] };
}

function firstGroundedAssistantMove(
  entry: GoldStandardConversation,
): GscConversationalMove | null {
  const turn = entry.turns.find(
    (t) => t.role === "assistant" && t.move && t.move !== "other",
  );
  return turn?.move ?? null;
}

function lengthGuidance(
  input: GscRetrievalInput,
): GscRetrievalResult["responseLengthGuidance"] {
  if (input.clarificationOrRepair) return "medium";
  if (input.userText.trim().length < 40) return "brief";
  if ((input.knownConcerns?.length ?? 0) >= 2) return "expanded";
  return "medium";
}

/**
 * Top relevant examples + structural guidance (never full script copy).
 */
export function retrieveGoldStandardGuidance(
  input: GscRetrievalInput,
): GscRetrievalResult {
  const scored = listGoldStandardConversations()
    .map((conversation) => {
      const { score, matchedTags } = scoreConversation(conversation, input);
      return { conversation, score, matchedTags };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);

  const hits = scored.slice(0, 3);
  const top = hits[0]?.conversation;

  const blockedFailurePatterns = [
    ...new Set(hits.flatMap((h) => h.conversation.blockedAlternatives.map((b) => b.text))),
  ].slice(0, 12);

  const suggestedMove = top ? firstGroundedAssistantMove(top) : null;

  const structureHints: string[] = [];
  if (suggestedMove) {
    structureHints.push(`preferred_move:${suggestedMove}`);
  }
  if (top?.topicAnchor) {
    structureHints.push(`keep_topic:${top.topicAnchor}`);
  }
  if (input.clarificationOrRepair) {
    structureHints.push("own_confusion_then_return_to_topic");
  }
  structureHints.push("one_question_max", "non_directive", "no_verbatim_copy");

  const maxScore = hits[0]?.score ?? 0;
  const confidence = Math.min(1, maxScore / 12);

  let likelyNextQuestionType: string | null = null;
  if (suggestedMove === "clarify_why_now") likelyNextQuestionType = "why_now";
  else if (suggestedMove === "clarify_desired_outcome") {
    likelyNextQuestionType = "desired_outcome";
  } else if (suggestedMove === "identify_concern") {
    likelyNextQuestionType = "concern";
  } else if (suggestedMove === "repair_misunderstanding") {
    likelyNextQuestionType = "grounded_return";
  } else if (suggestedMove === "accept_correction") {
    likelyNextQuestionType = "grounded_return";
  }

  return {
    hits,
    suggestedMove,
    blockedFailurePatterns,
    likelyNextQuestionType,
    responseLengthGuidance: lengthGuidance(input),
    confidence,
    structureHints,
  };
}
