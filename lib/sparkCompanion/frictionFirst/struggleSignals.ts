import type { FocusSituation, FrictionDomain } from "./types";

const FOCUS_STRUGGLE_RE =
  /\b(?:can'?t focus|cannot focus|can'?t stay focused|trouble (?:staying )?focused|hard to focus|lose focus|losing focus|can'?t concentrate|trouble concentrat|stay focused|stay on task|can'?t stay on task|distracted|getting distracted|keep getting distracted)\b/i;

const RESISTANCE_RE =
  /\b(?:don'?t want to (?:do|start|work)|can'?t make myself|avoid(?:ing)?|rather be doing|it'?s boring|too boring|afraid i'?ll fail|won'?t do it well|keep putting off)\b/i;

const WANT_PROGRESS_RE =
  /\b(?:want to focus|need to focus|trying to focus|have to (?:do|finish|work)|need to get (?:this|something) done|make progress|should be working)\b/i;

const WRITING_STRUGGLE_RE =
  /\b(?:can'?t write|stuck writing|keep rewriting|writer'?s block|blank page)\b/i;

const DECISION_STRUGGLE_RE =
  /\b(?:can'?t decide|decision fatigue|stuck between|torn between|going in circles|don'?t know which)\b/i;

const RESEARCH_STRUGGLE_RE =
  /\b(?:don'?t know enough|overresearch|analysis paralysis|can'?t stop researching)\b/i;

const PLANNING_STRUGGLE_RE =
  /\b(?:can'?t plan|planning feels|too much to plan|overplan)\b/i;

const LEARNING_STRUGGLE_RE =
  /\b(?:can'?t learn|learning feels hard|too much to learn)\b/i;

const BUSINESS_STRUGGLE_RE =
  /\b(?:building (?:my )?business|grow(?:ing)? (?:my )?business|business feels|overwhelm(?:ed)? (?:trying to|building))\b/i;

const GENERAL_STUCK_RE =
  /\b(?:i'?m stuck|feel(?:ing)? stuck|can'?t get started|keep procrastinat|no motivation|not motivated|can'?t finish|can'?t seem to finish|everything feels (?:hard|too much)|so much to do)\b/i;

const EXCLUDE_RE =
  /^\s*(?:what is|what are|how does|how do|explain|describe|define|tell me about|can you explain)\b/i;

const EXPLICIT_TASK_CREATE_RE =
  /\b(?:help me (?:write|create|draft|build)|write a|create a|draft a)\b/i;

export function detectFocusSituation(text: string): FocusSituation {
  const t = text.trim();
  if (RESISTANCE_RE.test(t) && !WANT_PROGRESS_RE.test(t)) {
    return "resistance_not_want";
  }
  if (FOCUS_STRUGGLE_RE.test(t) || WANT_PROGRESS_RE.test(t)) {
    return "want_focus_cant";
  }
  return "unknown";
}

export function detectFrictionDomain(text: string): FrictionDomain {
  const t = text.trim();
  if (FOCUS_STRUGGLE_RE.test(t) || WANT_PROGRESS_RE.test(t)) return "focus";
  if (WRITING_STRUGGLE_RE.test(t)) return "writing";
  if (DECISION_STRUGGLE_RE.test(t)) return "decision";
  if (RESEARCH_STRUGGLE_RE.test(t)) return "research";
  if (PLANNING_STRUGGLE_RE.test(t)) return "planning";
  if (LEARNING_STRUGGLE_RE.test(t)) return "learning";
  if (BUSINESS_STRUGGLE_RE.test(t)) return "business";
  return "general";
}

/**
 * True when member expresses difficulty — Friction First applies before solutions.
 */
export function isFrictionFirstTurn(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (EXCLUDE_RE.test(t)) return false;
  if (EXPLICIT_TASK_CREATE_RE.test(t)) return false;

  return (
    FOCUS_STRUGGLE_RE.test(t) ||
    GENERAL_STUCK_RE.test(t) ||
    RESISTANCE_RE.test(t) ||
    WRITING_STRUGGLE_RE.test(t) ||
    DECISION_STRUGGLE_RE.test(t) ||
    RESEARCH_STRUGGLE_RE.test(t) ||
    PLANNING_STRUGGLE_RE.test(t) ||
    LEARNING_STRUGGLE_RE.test(t) ||
    BUSINESS_STRUGGLE_RE.test(t)
  );
}

export const FRICTION_FIRST_MENU_MARKER =
  /which of these feels closest|what is making this difficult|what'?s getting in the way/i;

export function isFrictionFirstMenuOffer(text: string): boolean {
  return FRICTION_FIRST_MENU_MARKER.test(text);
}
