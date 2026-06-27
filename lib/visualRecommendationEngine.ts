/**
 * P0.20 — Visual Recommendation Engine
 * Napkin-style visual structure recommendations inside Visual Thinking.
 */

import type { FrictionlessPendingAction } from "./frictionlessActionLayer";
import {
  isExplicitVisualThinkingRequest,
  shouldBlockVisualThinking,
} from "./visualThinkingOverreach";
import {
  detectExplicitVisualView,
  isVisualConversionRequest,
  studioModeForViewId,
  type VisualThinkingViewId,
  visualThinkingViewTitle,
} from "./visualThinkingStudio";
import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";
import { shouldSuppressVisualRecommendation } from "./visualThinkingGuards";
import { isViewIdAvailable, resolveUnavailableVisualTypeReply } from "./visualTypeAvailability";

export type VisualRecommendationContext = {
  lastAssistantText?: string;
  priorAssistantText?: string;
  activeTopic?: string;
  selectedText?: string;
};

export type VisualRecommendationIntent = "immediate" | "recommend" | "none";

export type VisualRecommendationItem = {
  key: string;
  visualType: VisualThinkingViewId;
  label: string;
  reason: string;
};

export type VisualRecommendationResult = {
  recommendations: VisualRecommendationItem[];
  sourceText: string;
  category: string;
};

export type VisualRecommendationPendingAction = FrictionlessPendingAction & {
  type: "visual_recommendation";
  target: "visual-focus";
  sourceText: string;
  recommendations: VisualRecommendationItem[];
};

const VISUAL_RECOMMEND_INTENT_RE =
  /\b(?:turn (?:this|it) into something visual|help me (?:organize|see) (?:this )?(?:more )?(?:clearly|visually)|organize this visually|see this more clearly|have a bunch of ideas|messy thoughts?|brain\s*dump|what(?:'s| is) the best visual way|best way to (?:show|visualize)|help me choose (?:a )?visual|not sure which (?:visual|map|one to use)|something visual|show this (?:more )?clearly)\b/i;

const CHOOSE_VISUAL_RE =
  /\b(?:help me choose|which visual|what visual|recommend a visual|pick a visual|not sure which (?:one|visual)|visual structure)\b/i;

type RecommendationRule = {
  id: string;
  test: RegExp;
  picks: { visualType: VisualThinkingViewId; label?: string; reason: string }[];
};

const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: "book",
    test: /\b(?:write(?:ing)?\s+(?:a\s+)?book|book\s+(?:about|on|outline|structure)|workbook|guide)\b/i,
    picks: [
      {
        visualType: "hierarchy-tree",
        reason: "best for chapters and sections",
      },
      {
        visualType: "mind-map",
        reason: "best for brainstorming stories and lessons",
      },
      {
        visualType: "customer-journey-map",
        label: "Reader Journey Map",
        reason: "best for showing how the reader changes",
      },
    ],
  },
  {
    id: "course",
    test: /\b(?:launch(?:ing)?\s+(?:a\s+)?course|course\s+launch|program\s+launch|membership\s+launch|create\s+(?:a\s+)?(?:course|program|membership))\b/i,
    picks: [
      {
        visualType: "hierarchy-tree",
        reason: "best for modules and lesson order",
      },
      {
        visualType: "project-map",
        reason: "best for launch workstreams and milestones",
      },
      {
        visualType: "timeline",
        reason: "best for pacing and release timing",
      },
    ],
  },
  {
    id: "funnel",
    test: /\b(?:sales\s+funnel|funnel\s+build|build\s+(?:a\s+)?funnel|launch\s+(?:a\s+)?(?:product|offer)|need\s+(?:a\s+)?sales\s+funnel)\b/i,
    picks: [
      {
        visualType: "funnel-map",
        reason: "shows the path from lead to sale",
      },
      {
        visualType: "process-flow",
        label: "Process Flow",
        reason: "shows each step in order",
      },
      {
        visualType: "timeline",
        reason: "shows when each part happens",
      },
    ],
  },
  {
    id: "sop",
    test: /\b(?:sop|standard operating|workflow design|design (?:a |an )?workflow|automation|client journey steps)\b/i,
    picks: [
      {
        visualType: "process-flow",
        label: "Flowchart",
        reason: "best for step-by-step flow",
      },
      {
        visualType: "workflow-map",
        label: "Process Flow",
        reason: "best for ordered stages",
      },
      {
        visualType: "sop-map",
        label: "Checklist Map",
        reason: "best for repeatable tasks",
      },
    ],
  },
  {
    id: "decision",
    test: /\b(?:should i|which option|which one should|stuck between|torn between|can'?t decide|help me decide|pros and cons|compare (?:these |the )?options)\b/i,
    picks: [
      {
        visualType: "decision-tree",
        reason: "best for if/then branches",
      },
      {
        visualType: "comparison-map",
        reason: "best for comparing options side by side",
      },
      {
        visualType: "pros-cons-map",
        label: "Pros / Cons Map",
        reason: "best for tradeoffs",
      },
    ],
  },
  {
    id: "messy_ideas",
    test: /\b(?:brain\s*dump|bunch of ideas|messy thoughts?|scattered ideas|organize (?:my )?ideas|help me organize (?:my )?ideas|structure my ideas)\b/i,
    picks: [
      {
        visualType: "mind-map",
        reason: "best for capturing ideas freely",
      },
      {
        visualType: "priority-matrix",
        reason: "best for choosing what matters",
      },
      {
        visualType: "project-map",
        reason: "best for turning ideas into a plan",
      },
    ],
  },
  {
    id: "business",
    test: /\b(?:business\s+model|business\s+ecosystem|my\s+offer|audience\s+map|how (?:my )?business works)\b/i,
    picks: [
      {
        visualType: "business-ecosystem-map",
        reason: "best for how the business fits together",
      },
      {
        visualType: "concept-map",
        reason: "best for relationships between ideas",
      },
      {
        visualType: "funnel-map",
        reason: "best for offer and buyer flow",
      },
    ],
  },
  {
    id: "plan",
    test: /\b(?:organize this plan|need to organize this plan|big project|launch plan|project plan)\b/i,
    picks: [
      {
        visualType: "project-map",
        reason: "best for goals and workstreams",
      },
      {
        visualType: "timeline",
        reason: "best for sequencing milestones",
      },
      {
        visualType: "mind-map",
        reason: "best for brainstorming pieces",
      },
    ],
  },
  {
    id: "choose_visual",
    test: VISUAL_RECOMMEND_INTENT_RE,
    picks: [
      {
        visualType: "mind-map",
        reason: "best for brainstorming ideas",
      },
      {
        visualType: "decision-tree",
        reason: "best for comparing paths",
      },
    ],
  },
];

function resolveSourceText(
  userText: string,
  context?: VisualRecommendationContext,
): string {
  const trimmed = userText.trim();
  return (
    context?.selectedText?.trim() ||
    context?.lastAssistantText?.trim() ||
    context?.priorAssistantText?.trim() ||
    context?.activeTopic?.trim() ||
    trimmed
  );
}

function matchRule(
  text: string,
  options?: { allowDecision?: boolean },
): RecommendationRule | null {
  const t = text.trim();
  if (!t) return null;
  for (const rule of RECOMMENDATION_RULES) {
    if (rule.id === "decision" && !options?.allowDecision) continue;
    if (rule.test.test(t)) return rule;
  }
  return null;
}

function hasVisualChooseIntent(text: string): boolean {
  return VISUAL_RECOMMEND_INTENT_RE.test(text) || CHOOSE_VISUAL_RE.test(text);
}

function wantsVisualRecommendation(text: string): boolean {
  const t = text.trim();
  if (!t || shouldSuppressVisualRecommendation(t)) return false;
  if (hasVisualChooseIntent(t)) return true;
  return matchRule(t) !== null;
}

function isSpecificVisualConversion(text: string): boolean {
  if (!isVisualConversionRequest(text)) return false;
  if (/\binto something visual\b/i.test(text)) return false;
  return true;
}

export function detectVisualRecommendationIntent(
  userText: string,
  _context?: VisualRecommendationContext,
): VisualRecommendationIntent {
  const t = userText.trim();
  if (!t) return "none";

  if (/\bturn (?:this|it) into something visual\b/i.test(t)) {
    return "recommend";
  }

  if (shouldSuppressVisualThinkingForLearn(t)) return "none";

  if (shouldSuppressVisualRecommendation(t)) return "none";

  if (shouldBlockVisualThinking(t)) return "none";

  if (resolveUnavailableVisualTypeReply(t)) return "none";

  if (wantsVisualRecommendation(t) && !isExplicitVisualThinkingRequest(t)) {
    return "recommend";
  }

  if (isExplicitVisualThinkingRequest(t) || isSpecificVisualConversion(t)) {
    return "immediate";
  }

  return "none";
}

function buildRecommendationItems(
  picks: RecommendationRule["picks"],
): VisualRecommendationItem[] {
  const seen = new Set<VisualThinkingViewId>();
  const items: VisualRecommendationItem[] = [];

  for (const pick of picks) {
    if (!isViewIdAvailable(pick.visualType)) continue;
    if (seen.has(pick.visualType) && !pick.label) continue;
    seen.add(pick.visualType);
    items.push({
      key: String(items.length + 1),
      visualType: pick.visualType,
      label: pick.label ?? visualThinkingViewTitle(pick.visualType),
      reason: pick.reason,
    });
    if (items.length >= 3) break;
  }

  return items;
}

export function recommendVisualStructures(
  input: string | { userText: string; context?: VisualRecommendationContext },
): VisualRecommendationResult {
  const userText = typeof input === "string" ? input : input.userText;
  const context = typeof input === "string" ? undefined : input.context;
  const t = userText.trim();
  const rule =
    matchRule(t) ??
    (hasVisualChooseIntent(t) ? matchRule(t, { allowDecision: true }) : null);
  if (!rule) {
    return {
      recommendations: [],
      sourceText: resolveSourceText(t, context),
      category: "none",
    };
  }

  return {
    recommendations: buildRecommendationItems(rule.picks),
    sourceText: resolveSourceText(t, context),
    category: rule.id,
  };
}

export function buildVisualRecommendationReply(
  result: VisualRecommendationResult,
): string {
  const lines = result.recommendations.map(
    (item) => `${item.key}. ${item.label} — ${item.reason}`,
  );

  return [
    "I can visualize this a few ways.",
    "",
    "Recommended:",
    ...lines,
    "",
    "Which one would help most?",
  ].join("\n");
}

export function visualRecommendationPendingFromReply(input: {
  userText: string;
  context?: VisualRecommendationContext;
  offeredAtTurn: number;
}): VisualRecommendationPendingAction {
  const result = recommendVisualStructures({
    userText: input.userText,
    context: input.context,
  });

  return {
    type: "visual_recommendation",
    target: "visual-focus",
    context: "visual-recommendation",
    sourceText: result.sourceText,
    recommendations: result.recommendations,
    initialPrompt: result.sourceText,
    offeredAtTurn: input.offeredAtTurn,
    offerSummary: "Choose a visual structure",
    menuOffer: {
      recommended: result.recommendations.map((r) => r.visualType),
      other: [],
      numberedOptions: result.recommendations.map((item) => ({
        number: item.key,
        viewId: item.visualType,
        label: item.label,
      })),
      menuBlock: buildVisualRecommendationReply(result),
    },
  };
}

export function isVisualRecommendationOfferMessage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    /\bI can visualize this a few ways\b/i.test(t) &&
    /\bWhich one would help most\?\b/i.test(t)
  );
}

export function resolveVisualRecommendationSelection(
  userText: string,
  pending: VisualRecommendationPendingAction,
): { viewId: VisualThinkingViewId; mode: ReturnType<typeof studioModeForViewId> } | null {
  const t = userText.trim();
  if (!t) return null;

  const num = t.match(/^(\d+)\.?$/);
  if (num) {
    const pick = pending.recommendations.find((r) => r.key === num[1]);
    if (pick) {
      return { viewId: pick.visualType, mode: studioModeForViewId(pick.visualType) };
    }
  }

  const lower = t.toLowerCase();
  for (const item of pending.recommendations) {
    if (lower === item.label.toLowerCase()) {
      return { viewId: item.visualType, mode: studioModeForViewId(item.visualType) };
    }
    if (lower.includes(item.label.toLowerCase())) {
      return { viewId: item.visualType, mode: studioModeForViewId(item.visualType) };
    }
  }

  const aliases: [RegExp, VisualThinkingViewId][] = [
    [/\b(?:mind\s*maps?)\b/i, "mind-map"],
    [/\b(?:flowcharts?|flow\s*charts?)\b/i, "process-flow"],
    [/\b(?:decision\s*trees?)\b/i, "decision-tree"],
    [/\b(?:hierarch(?:y|ies)|hierarchy\s*trees?)\b/i, "hierarchy-tree"],
    [/\b(?:funnel\s*maps?)\b/i, "funnel-map"],
    [/\b(?:priority\s*matrix)\b/i, "priority-matrix"],
    [/\b(?:concept\s*maps?)\b/i, "concept-map"],
    [/\b(?:project\s*maps?)\b/i, "project-map"],
    [/\b(?:process\s*flows?)\b/i, "process-flow"],
    [/\b(?:timelines?)\b/i, "timeline"],
  ];
  for (const [re, viewId] of aliases) {
    if (re.test(lower)) {
      return { viewId, mode: studioModeForViewId(viewId) };
    }
  }

  const explicit = detectExplicitVisualView(t);
  if (explicit) {
    return { viewId: explicit.id, mode: studioModeForViewId(explicit.id) };
  }

  return null;
}

export function shouldOfferVisualRecommendation(userText: string): boolean {
  if (shouldSuppressVisualRecommendation(userText)) return false;
  if (detectVisualRecommendationIntent(userText) !== "recommend") return false;
  return recommendVisualStructures(userText).recommendations.length > 0;
}

export function visualRecommendationEngineHintForChat(): string {
  return [
    "VISUAL RECOMMENDATION ENGINE (P0.20):",
    "Path A (user names a structure): open Visual Thinking immediately.",
    "Path B (user needs help choosing): recommend 2–3 structures with short reasons; wait for 1/2/3 or name.",
    "Reply style: I can visualize this a few ways. Recommended: 1. X — reason … Which one would help most?",
    "Never recommend visuals for procrastination, overwhelm, anxiety, or sales avoidance unless user explicitly asks to visualize.",
    "Selecting an option must open Visual Thinking AND create the structure from prior chat content.",
  ].join("\n");
}
