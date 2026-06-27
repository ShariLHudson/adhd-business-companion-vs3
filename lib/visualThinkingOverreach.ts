/**
 * P0.20.2 — Visual Thinking Overreach Fix
 * Visual Thinking only when the user wants to SEE something — not ADHD friction.
 */

import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";
import { shouldSuppressVisualRecommendation } from "./visualThinkingGuards";
import {
  detectExplicitVisualView,
  isVisualConversionRequest,
  type VisualThinkingViewId,
} from "./visualThinkingStudio";

const VISUAL_EXECUTE_RE =
  /\b(?:create|build|make|design|draft|generate|open|start|help me (?:create|make|build|draft|open)|map out)\b/i;

/** Explicit visualization intent — allow Visual Thinking activation. */
const VISUAL_THINKING_ALLOW_RE =
  /\b(?:(?:create|build|make|open|start|help me (?:create|make|build|open))\s+(?:a |an |my )?(?:mind\s*maps?|flowcharts?|flow\s*charts?|decision\s*trees?|process\s*(?:flows?|maps?)|hierarchy(?:\s*trees?|\s*maps?)?|funnel\s*maps?|concept\s*maps?|diagrams?|visual\s*maps?)|(?:visuali[sz]e|map)\s+(?:this|it|that|out)|turn\s+(?:this|it|that)\s+into\s+(?:a |an )?(?:flowchart|mind\s*map|hierarchy|process\s*flow|decision\s*tree)|show\s+(?:me\s+)?this\s+visually|show\s+(?:me\s+)?visually|(?:create|build|make)\s+(?:a |an )?(?:hierarchy|process\s*map|funnel\s*map|concept\s*map))\b/i;

const CHOOSE_VISUAL_RE =
  /\b(?:help me choose|which visual|what visual|recommend a visual|pick a visual|not sure which (?:one|visual)|visual structure)\b/i;

const PROCRASTINATION_BLOCK_RE =
  /\b(?:keep(?:s)?\s+putting\s+(?:this|it|off)|keep(?:s)?\s+avoiding|know what to do but (?:can'?t|won'?t)\s+start|can'?t get (?:myself )?to do it|can'?t get started|keep(?:s)?\s+procrastinat\w*|putting (?:it|this) off|avoid(?:ing)?\s+(?:this|it|follow[- ]?up)|won'?t do it|know what to do but i won'?t)\b/i;

const OVERWHELM_BLOCK_RE =
  /\b(?:i'?m\s+overwhelm(?:ed)?|feels?\s+overwhelm(?:ed)?|too much to do|don'?t know where to start|everything feels urgent|not sure where to start|too many things|can'?t prioritize|don'?t know where to begin)\b/i;

const SALES_AVOIDANCE_BLOCK_RE =
  /\b(?:putting off (?:my )?sales|avoid(?:ing)? sales|hate outreach|don'?t want to follow[- ]?up|avoid follow[- ]?up|avoid(?:ing)? (?:sales|outreach|calling)|why do i avoid sales)\b/i;

const EMOTIONAL_FRICTION_BLOCK_RE =
  /\b(?:i'?m\s+(?:anxious|nervous|scared|worried|afraid)|feeling anxious|panic(?:king)?|need motivation|can'?t motivate)\b/i;

const ACTIVATION_BLOCK_RE =
  /\b(?:activation difficulty|can'?t start|stuck getting started|hard to start|won'?t start)\b/i;

const SELF_UNDERSTANDING_BLOCK_RE =
  /\b(?:why do i avoid|why do i keep|why can'?t i)\b/i;

const DECISION_COMPASS_NOT_VISUAL_RE =
  /\b(?:should i|which option|which one should|stuck between|torn between|can'?t decide|help me decide|pros and cons|compare (?:these |the )?options)\b/i;

/** Positive goal phrases where a visual recommendation menu is appropriate. */
const VISUAL_GOAL_RULES: {
  test: RegExp;
  recommended: VisualThinkingViewId[];
  other: VisualThinkingViewId[];
}[] = [
  {
    test: /\b(?:launch(?:ing)?\s+(?:a\s+)?course|course\s+launch|program\s+launch|membership\s+launch)\b/i,
    recommended: ["hierarchy-tree", "project-map", "timeline"],
    other: ["mind-map", "funnel-map", "process-flow"],
  },
  {
    test: /\b(?:write(?:ing)?\s+(?:a\s+)?book|book\s+(?:about|on|outline|structure)|workbook|guide)\b/i,
    recommended: ["hierarchy-tree", "mind-map", "customer-journey-map"],
    other: ["timeline", "content-structure-map", "project-map"],
  },
  {
    test: /\b(?:sales\s+funnel|funnel\s+build|build\s+(?:a\s+)?funnel)\b/i,
    recommended: ["funnel-map", "process-flow"],
    other: ["customer-journey-map", "project-map", "timeline"],
  },
  {
    test: /\b(?:website|landing page|site\s+map)\b/i,
    recommended: ["content-structure-map", "hierarchy-tree"],
    other: ["project-map", "mind-map", "process-flow"],
  },
  {
    test: /\b(?:sop|standard operating|workflow design|design (?:a |an )?workflow)\b/i,
    recommended: ["sop-map", "workflow-map"],
    other: ["process-flow", "hierarchy-tree", "project-map"],
  },
  {
    test: /\b(?:business\s+model|how (?:my )?business works|business ecosystem)\b/i,
    recommended: ["business-ecosystem-map", "customer-journey-map"],
    other: ["funnel-map", "customer-journey-map", "project-map"],
  },
  {
    test: /\b(?:organize my ideas|structure my ideas|plan (?:a |an |my )?(?:course|launch|project))\b/i,
    recommended: ["mind-map", "project-map"],
    other: ["process-flow", "timeline", "funnel-map"],
  },
];

export function isExplicitVisualThinkingRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (shouldSuppressVisualThinkingForLearn(t)) return false;
  if (isVisualConversionRequest(t)) return true;
  if (VISUAL_THINKING_ALLOW_RE.test(t)) return true;
  const view = detectExplicitVisualView(t);
  if (!view) return false;
  return VISUAL_EXECUTE_RE.test(t) || /\bhelp me\b/i.test(t);
}

export function isVisualThinkingAllowListRequest(text: string): boolean {
  return isExplicitVisualThinkingRequest(text);
}

export function shouldBlockVisualThinking(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isVisualThinkingAllowListRequest(t)) return false;
  return shouldSuppressVisualRecommendation(t);
}

export function matchVisualGoalRecommendation(text: string): {
  recommended: VisualThinkingViewId[];
  other: VisualThinkingViewId[];
} | null {
  const t = text.trim();
  if (!t || shouldBlockVisualThinking(t)) return null;
  for (const rule of VISUAL_GOAL_RULES) {
    if (rule.test.test(t)) {
      return { recommended: rule.recommended, other: rule.other };
    }
  }
  return null;
}

const PATH_B_RECOMMEND_RE =
  /\b(?:turn (?:this|it) into something visual|help me (?:organize|see) (?:this )?(?:more )?(?:clearly|visually)|organize this visually|see this more clearly|have a bunch of ideas|messy thoughts?|brain\s*dump|what(?:'s| is) the best visual way|best way to (?:show|visualize)|something visual|show this (?:more )?clearly)\b/i;

/** Path B menu — explicit choose-visual or matched planning goals. */
export function shouldOfferVisualThinkingRecommendation(text: string): boolean {
  const t = text.trim();
  if (!t || shouldBlockVisualThinking(t)) return false;
  if (isKnowledgeQuestion(t)) return false;
  if (DECISION_COMPASS_NOT_VISUAL_RE.test(t) && !isExplicitVisualThinkingRequest(t)) {
    return false;
  }
  if (isExplicitVisualThinkingRequest(t) || isVisualConversionRequest(t)) {
    return false;
  }
  if (CHOOSE_VISUAL_RE.test(t) || PATH_B_RECOMMEND_RE.test(t)) return true;
  return matchVisualGoalRecommendation(t) !== null;
}

export function visualThinkingOverreachHintForChat(): string {
  return [
    "VISUAL THINKING OVERREACH FIX (P0.20.2):",
    "Visual Thinking ONLY when the user wants to SEE something (mind map, flowchart, diagram, visualize this).",
    "NEVER offer Visual Thinking for procrastination, avoidance, overwhelm, sales resistance, anxiety, or activation difficulty.",
    "Those routes: Strategy Intelligence, Focus, Plan My Day, Organize, Emotional Regulation, Decision Compass, Learn.",
    "Decision comparisons (should I, which option) → Decision Compass unless user explicitly asks to visualize.",
  ].join("\n");
}
