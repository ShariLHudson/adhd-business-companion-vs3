/**
 * P0.20.1 — Learn vs Visual Action boundary
 */

import { isHowToLearningQuestion } from "./howToLearningIntelligence";
import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import {
  detectVisualTypeInText,
  isVisualCreateIntent,
} from "./visualTypeAvailability";

const VISUAL_CONCEPT_RE =
  /\b(?:mind\s*maps?|flowcharts?|flow\s*charts?|decision\s*trees?|diagrams?|hierarch(?:y|ies)|funnel\s*maps?|concept\s*maps?|visual\s*maps?|process\s*flows?)\b/i;

const LEARN_ABOUT_VISUAL_RE =
  /\b(?:what is|what are|how is|how are|how does|how do|when is|when are|when should|why is|why are|explain|tell me about|define|examples of|teach me about|help me understand)\b/i;

/** User is asking to learn about a visual concept — not to create one. */
export function isLearnAboutVisualType(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isHowToLearningQuestion(t) && VISUAL_CONCEPT_RE.test(t)) return true;
  if (isVisualCreateIntent(t)) return false;
  if (!VISUAL_CONCEPT_RE.test(t)) return false;
  return isKnowledgeQuestion(t) || LEARN_ABOUT_VISUAL_RE.test(t);
}

export function shouldSuppressVisualThinkingForLearn(text: string): boolean {
  if (isHowToLearningQuestion(text)) return true;
  return isLearnAboutVisualType(text) || (isKnowledgeQuestion(text) && VISUAL_CONCEPT_RE.test(text));
}

export function visualLearnBoundaryHintForChat(): string {
  return [
    "LEARN VS VISUAL ACTION (P0.20.1 / P0.20.5):",
    "what is / how is it used / how do I create / show me how to → Learn only. Never open Visual Thinking.",
    "Create/open/map/visualize requests → Visual Thinking only for available types.",
  ].join("\n");
}
