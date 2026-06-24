/**
 * Knowledge Intelligence™ (P0.10) — concept questions, not user reflection.
 * Answer first; skip relationship, observation, wisdom, and transformation layers.
 */

import { isRegistryArtifactExecution } from "./artifactRegistry";
import { isAppHowToQuestion } from "./appFeatureKnowledge";
import { learningPathMenuHintForChat } from "./learningPathMenu";

const USER_FOCUSED_UNDERSTAND_RE =
  /\b(?:why do i|what patterns|patterns have you noticed|how have i changed|how have i grown|why am i stuck|what have you noticed|what do you notice about me|how do i usually|what'?s my pattern|help me understand (?:my|why i|how i)|my biggest strength|what am i good at)\b/i;

/** Triggers for educational / definitional questions about concepts. */
export const KNOWLEDGE_QUESTION_RE =
  /\b(?:what is|what are|what does|what do|how does|how do|how is|how are|when is|when are|when should|why is|why are|explain|tell me about|define|examples of|difference between|compared to|compare|walk me through|teach me (?:what|about|how)|learn (?:what|about|how))\b/i;

const LAYERS_SKIPPED_ON_LEARN = [
  "relationshipIntelligencePriority",
  "relationshipLeadParagraph",
  "observationEngine",
  "wisdomIntelligence",
  "transformationIntelligence",
  "ecosystemIntelligence",
  "phaseTrustMoments",
] as const;

/** Rough tokens not sent on the learn fast path (prompt budget estimate). */
const ESTIMATED_TOKENS_PER_LAYER = 400;

export function isKnowledgeQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isAppHowToQuestion(t)) return false;
  if (isRegistryArtifactExecution(t)) return false;
  if (USER_FOCUSED_UNDERSTAND_RE.test(t)) return false;
  if (/\bhelp me decide\b/i.test(t)) return false;
  return KNOWLEDGE_QUESTION_RE.test(t);
}

export function extractKnowledgeTopic(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /\bwhat(?:'s| is| are)\s+(?:a |an |the )?(.+?)(?:[.?!]|$)/i,
    /\bwhat does\s+(.+?)\s+mean\b/i,
    /\bexplain\s+(.+?)(?:[.?!]|$)/i,
    /\btell me about\s+(.+?)(?:[.?!]|$)/i,
    /\bdefine\s+(.+?)(?:[.?!]|$)/i,
    /\bdifference between\s+(.+?)(?:[.?!]|$)/i,
    /\bhow do(?:es)?\s+(.+?)\s+work\b/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const topic = m?.[1]?.trim();
    if (topic && topic.length >= 3 && topic.length <= 100) {
      return topic.replace(/\s+and how\b.*$/i, "").trim();
    }
  }
  return null;
}

export function knowledgeIntelligenceHintForChat(userText: string): string {
  const topic = extractKnowledgeTopic(userText);
  return [
    "KNOWLEDGE INTELLIGENCE™ (P0.10 — answer first, learning paths):",
    topic ? `Concept: ${topic}.` : "User asks about a concept — NOT about themselves.",
    learningPathMenuHintForChat(topic),
    "FORBIDDEN openers: I've noticed…, It sounds like…, You seem to…, You're looking to…, This suggests…, This pattern indicates…",
    "No relationship observations, no ADHD pattern analysis, no user-history reflection.",
  ].join("\n");
}

export type LearnFastPathMetrics = {
  learnFastPath: true;
  layersSkipped: readonly string[];
  estimatedPromptTokensSaved: number;
};

export function measureLearnFastPath(): LearnFastPathMetrics {
  return {
    learnFastPath: true,
    layersSkipped: LAYERS_SKIPPED_ON_LEARN,
    estimatedPromptTokensSaved:
      LAYERS_SKIPPED_ON_LEARN.length * ESTIMATED_TOKENS_PER_LAYER,
  };
}
