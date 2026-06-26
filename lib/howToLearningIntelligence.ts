/**
 * P0.20.5 — Learn vs Create boundary
 * "How do I create a diagram?" is Learn — not Create or Visual Thinking.
 * App navigation how-tos ("How do I find games?") are NOT learn — companion-first.
 */

const HOW_TO_OPENER_RE =
  /\b(?:how do i|how can i|how would i|how should i|show me how to|teach me how to|help me understand how to)\b/i;

const HOW_TO_PASSIVE_RE =
  /\b(?:how (?:are|is|were|was) .+ (?:created|made|built|used)|how do(?:es)? .+ work|how (?:are|is) .+ used)\b/i;

const VISUAL_CONCEPT_RE =
  /\b(?:mind\s*maps?|flowcharts?|flow\s*charts?|decision\s*trees?|diagrams?|hierarch(?:y|ies)|funnel\s*maps?|concept\s*maps?|visual\s*maps?|process\s*flows?)\b/i;

const APP_NAV_HOW_TO_RE =
  /\b(?:how (?:do|can) i|how to)\s+(?:find|open|change|access|use|get to|go to|navigate)\b/i;

const APP_FEATURE_HINT_RE =
  /\b(?:app|settings|games?|focus|templates?|strateg(?:y|ies)|sidebar|color|clear my mind|block out|momentum|spin the wheel|snippet|sop)\b/i;

const ARTIFACT_LEARN_RE =
  /\b(?:marketing plan|sales funnel|funnel|business plan|email sequence|lead magnet|landing page|sales page|proposal|checklist|workflow)\b/i;

/** App UI navigation — companion explains before opening; not abstract learn. */
function isLikelyAppNavigationHowTo(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (APP_NAV_HOW_TO_RE.test(t)) return true;
  if (/\bwhere (?:is|are|do i find|can i find)\b/i.test(t)) return true;
  if (/\bchange the colors?\b/i.test(t)) return true;
  if (/\bhow do i use clear my mind\b/i.test(t)) return true;
  if (
    /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|write|use)\s+(?:a |an |my )?(?:sop|snippet)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(?:how (?:do|can) i|how to)\s+(?:create|make|use|find)\b/i.test(t) &&
    APP_FEATURE_HINT_RE.test(t) &&
    !ARTIFACT_LEARN_RE.test(t)
  ) {
    return true;
  }
  return false;
}

/** User wants to learn the process — not execute create/open/build now. */
export function isHowToLearningQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isLikelyAppNavigationHowTo(t)) return false;
  if (HOW_TO_PASSIVE_RE.test(t)) return true;
  if (/\bhow are .+ used\b/i.test(t)) return true;
  if (!HOW_TO_OPENER_RE.test(t)) return false;
  if (VISUAL_CONCEPT_RE.test(t)) return true;
  if (ARTIFACT_LEARN_RE.test(t)) return true;
  if (/\b(?:sales funnel|diagram|process|concept|strategy)\b/i.test(t)) return true;
  return !APP_FEATURE_HINT_RE.test(t);
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
    "Distinguish from app navigation: How do I find games?, How do I use Clear My Mind?, How do I create an SOP in the app?",
  ].join("\n");
}
