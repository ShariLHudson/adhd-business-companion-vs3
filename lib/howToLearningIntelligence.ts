/**
 * P0.20.5 — Learn vs Create boundary
 * "How do I create a diagram?" is Learn — not Create or Visual Thinking.
 */

const HOW_TO_OPENER_RE =
  /\b(?:how do i|how can i|how would i|how should i|show me how to|teach me how to|help me understand how to)\b/i;

const HOW_TO_PASSIVE_RE =
  /\b(?:how (?:are|is|were|was) .+ (?:created|made|built|used)|how do(?:es)? .+ work|how (?:are|is) .+ used)\b/i;

const VISUAL_CONCEPT_RE =
  /\b(?:mind\s*maps?|flowcharts?|flow\s*charts?|decision\s*trees?|diagrams?|hierarch(?:y|ies)|funnel\s*maps?|concept\s*maps?|visual\s*maps?|process\s*flows?)\b/i;

/** User wants to learn the process — not execute create/open/build now. */
export function isHowToLearningQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (HOW_TO_OPENER_RE.test(t)) return true;
  if (HOW_TO_PASSIVE_RE.test(t)) return true;
  if (/\bhow are .+ used\b/i.test(t)) return true;
  return false;
}

export function isHowToLearningAboutVisualConcept(text: string): boolean {
  return isHowToLearningQuestion(text) && VISUAL_CONCEPT_RE.test(text);
}

export function howToLearningHintForChat(): string {
  return [
    "HOW-TO LEARNING (P0.20.5):",
    "how do I / how can I / show me how to / teach me how to → teach the process in chat.",
    "Offer learning path menu when helpful (example, apply, deep dive).",
    "FORBIDDEN: Visual Thinking open, Create open, planned-feature not built yet messages.",
    "Distinguish from action requests: Create a diagram, Make a flowchart, Open a mind map.",
  ].join("\n");
}
