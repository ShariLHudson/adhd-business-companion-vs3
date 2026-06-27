/**
 * P0.20 — Visual Thinking Studio
 * View library, recommendation engine, Path A/B routing, and content conversion.
 */

import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";
import type { VisualFocusMode } from "./visualFocus/types";
import { studioCardTitleForMode } from "./visualFocus/studioCards";
import {
  buildVisualRecommendationReply,
  recommendVisualStructures as engineRecommendVisualStructures,
  shouldOfferVisualRecommendation,
} from "./visualRecommendationEngine";

export type VisualThinkingViewCategory =
  | "brainstorming"
  | "decision_making"
  | "planning"
  | "systems"
  | "business"
  | "organization"
  | "adhd_tools";

export type VisualThinkingViewId =
  | "mind-map"
  | "concept-map"
  | "idea-cluster-map"
  | "decision-tree"
  | "pros-cons-map"
  | "comparison-map"
  | "project-map"
  | "timeline"
  | "roadmap"
  | "process-flow"
  | "workflow-map"
  | "sop-map"
  | "funnel-map"
  | "customer-journey-map"
  | "business-ecosystem-map"
  | "hierarchy-tree"
  | "category-tree"
  | "content-structure-map"
  | "brain-dump-map"
  | "priority-matrix"
  | "overwhelm-map"
  | "focus-map";

export type VisualThinkingViewDef = {
  id: VisualThinkingViewId;
  title: string;
  category: VisualThinkingViewCategory;
  mode: VisualFocusMode;
  aliases: RegExp[];
};

const VIEW_DEFS: VisualThinkingViewDef[] = [
  {
    id: "mind-map",
    title: "Mind Map",
    category: "brainstorming",
    mode: "mind-map",
    aliases: [/\bmind\s*maps?\b/i, /\bvisual\s*maps?\b/i, /\bdiagrams?\b/i],
  },
  {
    id: "concept-map",
    title: "Concept Map",
    category: "brainstorming",
    mode: "mind-map",
    aliases: [/\bconcept\s*maps?\b/i],
  },
  {
    id: "idea-cluster-map",
    title: "Idea Cluster Map",
    category: "brainstorming",
    mode: "visual-kanban",
    aliases: [/\bidea\s*cluster(?:\s*map)?s?\b/i, /\bcluster\s*map\b/i],
  },
  {
    id: "decision-tree",
    title: "Decision Tree",
    category: "decision_making",
    mode: "decision-tree",
    aliases: [/\bdecision\s*trees?\b/i, /\bdecision\s*maps?\b/i],
  },
  {
    id: "pros-cons-map",
    title: "Pros/Cons Map",
    category: "decision_making",
    mode: "decision-tree",
    aliases: [/\bpros?\s*(?:and|&)\s*cons?\s*maps?\b/i, /\bpros?\s*cons?\s*map\b/i],
  },
  {
    id: "comparison-map",
    title: "Comparison Map",
    category: "decision_making",
    mode: "visual-kanban",
    aliases: [/\bcomparison\s*maps?\b/i, /\bcompare\s*options?\s*(?:map|visually)\b/i],
  },
  {
    id: "project-map",
    title: "Project Map",
    category: "planning",
    mode: "project-map",
    aliases: [/\bproject\s*maps?\b/i],
  },
  {
    id: "timeline",
    title: "Timeline",
    category: "planning",
    mode: "project-map",
    aliases: [/\btimelines?\b/i],
  },
  {
    id: "roadmap",
    title: "Roadmap",
    category: "planning",
    mode: "project-map",
    aliases: [/\broadmaps?\b/i],
  },
  {
    id: "process-flow",
    title: "Process Flow",
    category: "systems",
    mode: "decision-tree",
    aliases: [
      /\bprocess\s*flows?\b/i,
      /\bflowcharts?\b/i,
      /\bflow\s*charts?\b/i,
      /\bflow\s*maps?\b/i,
    ],
  },
  {
    id: "workflow-map",
    title: "Workflow Map",
    category: "systems",
    mode: "decision-tree",
    aliases: [/\bworkflow\s*maps?\b/i],
  },
  {
    id: "sop-map",
    title: "SOP Map",
    category: "systems",
    mode: "decision-tree",
    aliases: [/\bsop\s*maps?\b/i, /\bstandard\s+operating\s+procedure\s*map\b/i],
  },
  {
    id: "funnel-map",
    title: "Funnel Map",
    category: "business",
    mode: "strategy-map",
    aliases: [
      /\bfunnel\s*maps?\b/i,
      /\bsales\s*funnels?\s*map\b/i,
      /\bstrategy\s*maps?\b/i,
    ],
  },
  {
    id: "customer-journey-map",
    title: "Customer Journey Map",
    category: "business",
    mode: "relationship-map",
    aliases: [
      /\bcustomer\s*journey\s*maps?\b/i,
      /\bjourney\s*maps?\b/i,
      /\brelationship\s*maps?\b/i,
    ],
  },
  {
    id: "business-ecosystem-map",
    title: "Business Ecosystem Map",
    category: "business",
    mode: "business-canvas",
    aliases: [
      /\bbusiness\s*ecosystem\s*maps?\b/i,
      /\becosystem\s*maps?\b/i,
    ],
  },
  {
    id: "hierarchy-tree",
    title: "Hierarchy Tree",
    category: "organization",
    mode: "project-map",
    aliases: [
      /\bhierarchy\s*(?:trees?|maps?)\b/i,
      /\bhierarchy\s*map\b/i,
      /\bhierarch(?:y|ical)\s*(?:chart|structure)\b/i,
      /\b(?:create|build|make)\s+(?:a |an )?hierarchy\b/i,
    ],
  },
  {
    id: "category-tree",
    title: "Category Tree",
    category: "organization",
    mode: "mind-map",
    aliases: [/\bcategory\s*trees?\b/i, /\bcategor(?:y|ies)\s*map\b/i],
  },
  {
    id: "content-structure-map",
    title: "Content Structure Map",
    category: "organization",
    mode: "project-map",
    aliases: [/\bcontent\s*structure\s*maps?\b/i],
  },
  {
    id: "brain-dump-map",
    title: "Brain Dump Map",
    category: "adhd_tools",
    mode: "mind-map",
    aliases: [/\bbrain\s*dump\s*maps?\b/i],
  },
  {
    id: "priority-matrix",
    title: "Priority Matrix",
    category: "adhd_tools",
    mode: "visual-kanban",
    aliases: [/\bpriority\s*matri(?:x|ces)\b/i, /\beisenhower\s*matri(?:x|ces)\b/i],
  },
  {
    id: "overwhelm-map",
    title: "Overwhelm Map",
    category: "adhd_tools",
    mode: "visual-kanban",
    aliases: [/\boverwhelm\s*maps?\b/i],
  },
  {
    id: "focus-map",
    title: "Focus Map",
    category: "adhd_tools",
    mode: "visual-kanban",
    aliases: [/\bfocus\s*maps?\b/i],
  },
];

const VIEW_BY_ID = new Map<VisualThinkingViewId, VisualThinkingViewDef>();
for (const def of VIEW_DEFS) {
  if (!VIEW_BY_ID.has(def.id)) VIEW_BY_ID.set(def.id, def);
}

export const VISUAL_THINKING_VIEW_LIBRARY: VisualThinkingViewDef[] = [
  ...VIEW_BY_ID.values(),
];

export function getVisualThinkingView(
  id: VisualThinkingViewId,
): VisualThinkingViewDef | undefined {
  return VIEW_BY_ID.get(id);
}

export function visualThinkingViewTitle(id: VisualThinkingViewId): string {
  return getVisualThinkingView(id)?.title ?? id;
}

const EXECUTE_RE =
  /\b(?:create|build|make|design|draft|generate|open|start|map out|help me (?:create|make|build|draft|open))\b/i;

const NEED_RE =
  /\b(?:i need(?: a| to)?|want to|have to|need to|help me|i want)\b/i;

const CHOOSE_VISUAL_RE =
  /\b(?:help me choose|which visual|what visual|recommend a visual|pick a visual|not sure which (?:one|visual)|visual structure)\b/i;

const LEARN_ABOUT_RE =
  /\b(?:what is|what are|how does|how do|how is|how are|when is|when are|when should|why is|why are|explain|tell me about|teach me about|help me understand|define)\b/i;

const CONVERSION_RE =
  /\b(?:turn (?:this|it|that) into|convert (?:this|it|that) (?:to|into)|make (?:this|it|that) (?:a|an)|visuali[sz]e (?:this|it|that)|map (?:this|it|that) (?:as|into|out))\b/i;

/** Business strategy documents belong in Create — not Visual Thinking. */
const BUSINESS_STRATEGY_DOC_RE =
  /\b(?:marketing|sales|business|launch|content|growth)\s+strateg(?:y|ies)(?:\s+document)?\b/i;

const BUSINESS_STRATEGY_CREATE_RE =
  /\b(?:help me (?:create|write|draft|build)|(?:create|write|draft|build) (?:a |an |my )?)(?:marketing|sales|business|launch|content|growth) strateg(?:y|ies)\b/i;

export function shouldRouteBusinessStrategyToCreate(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (BUSINESS_STRATEGY_CREATE_RE.test(t)) return true;
  return (
    BUSINESS_STRATEGY_DOC_RE.test(t) &&
    /\b(?:create|write|draft|build|document|plan)\b/i.test(t)
  );
}

export function detectExplicitVisualView(text: string): VisualThinkingViewDef | null {
  const t = text.trim();
  if (!t || shouldRouteBusinessStrategyToCreate(t)) return null;
  for (const def of VIEW_DEFS) {
    for (const re of def.aliases) {
      if (re.test(t)) return def;
    }
  }
  return null;
}

export function isExplicitVisualStructureRequest(text: string): boolean {
  const t = text.trim();
  if (!t || shouldRouteBusinessStrategyToCreate(t)) return false;
  if (shouldSuppressVisualThinkingForLearn(t)) return false;
  const view = detectExplicitVisualView(t);
  if (!view) return false;
  if (EXECUTE_RE.test(t)) return true;
  if (NEED_RE.test(t)) return true;
  if (/\bhelp me\b/i.test(t)) return true;
  return isBareVisualRequest(t, view);
}

function isBareVisualRequest(text: string, view: VisualThinkingViewDef): boolean {
  const t = text.trim().toLowerCase().replace(/[?.!]+$/g, "");
  if (!t || t.length > 56) return false;
  if (/^\s*what (?:is|are)\b/i.test(t)) return false;
  for (const re of view.aliases) {
    if (!re.test(t)) continue;
    const remainder = t.replace(re, "").replace(/\s+/g, " ").trim();
    if (!remainder || /^(?:please|a|an|the|my)$/.test(remainder)) return true;
  }
  return false;
}

export function isVisualConversionRequest(text: string): boolean {
  const t = text.trim();
  if (!t || shouldRouteBusinessStrategyToCreate(t)) return false;
  if (/\binto something visual\b/i.test(t)) return false;
  return CONVERSION_RE.test(t);
}

export function detectConversionTargetView(text: string): VisualThinkingViewDef | null {
  const t = text.trim();
  if (!isVisualConversionRequest(t)) return null;
  const explicit = detectExplicitVisualView(t);
  if (explicit) return explicit;
  if (/\b(?:hierarch(?:y|ical)|outline|structure)\b/i.test(t)) {
    return getVisualThinkingView("hierarchy-tree") ?? null;
  }
  if (/\b(?:flow|process|steps?)\b/i.test(t)) {
    return getVisualThinkingView("process-flow") ?? null;
  }
  if (/\b(?:mind\s*map|brain\s*dump|ideas?)\b/i.test(t)) {
    return getVisualThinkingView("mind-map") ?? null;
  }
  if (/\b(?:timeline|roadmap|plan)\b/i.test(t)) {
    return getVisualThinkingView("project-map") ?? null;
  }
  if (/\b(?:funnel|journey)\b/i.test(t)) {
    return getVisualThinkingView("funnel-map") ?? null;
  }
  return getVisualThinkingView("mind-map") ?? null;
}

const DECISION_COMPASS_RE =
  /\b(?:should i|compare (?:these |the )?options|evaluate (?:my )?choices|pros and cons|which (?:one|option) should|can'?t decide|help me decide|stuck between|torn between)\b/i;

export function needsVisualStructureRecommendation(text: string): boolean {
  return shouldOfferVisualRecommendation(text);
}

export type VisualStructureRecommendation = {
  recommended: VisualThinkingViewId[];
  other: VisualThinkingViewId[];
  reason: string;
};

export function recommendVisualStructures(
  text: string,
): VisualStructureRecommendation {
  const result = engineRecommendVisualStructures(text);
  return {
    recommended: result.recommendations.map((r) => r.visualType),
    other: [],
    reason: result.sourceText,
  };
}

export type VisualThinkingMenuOffer = {
  recommended: VisualThinkingViewId[];
  other: VisualThinkingViewId[];
  numberedOptions: { number: string; viewId: VisualThinkingViewId; label: string }[];
  menuBlock: string;
};

export function buildVisualThinkingMenuOffer(
  text: string,
): VisualThinkingMenuOffer {
  const result = engineRecommendVisualStructures(text);
  const numberedOptions = result.recommendations.map((item) => ({
    number: item.key,
    viewId: item.visualType,
    label: item.label,
  }));

  const menuBlock = buildVisualRecommendationReply(result);

  return {
    recommended: result.recommendations.map((r) => r.visualType),
    other: [],
    numberedOptions,
    menuBlock,
  };
}

export function buildPathAVisualOfferReply(text: string): string {
  return buildVisualRecommendationReply(engineRecommendVisualStructures(text));
}

export function immediateVisualOpenAck(view: VisualThinkingViewDef): string {
  return `Opening **${view.title}** in Visual Thinking.`;
}

export function visualThinkingMenuAck(viewId: VisualThinkingViewId): string {
  const title = visualThinkingViewTitle(viewId);
  return `Opening **${title}** in Visual Thinking.`;
}

export function visualThinkingStudioHintForChat(): string {
  return [
    "VISUAL THINKING STUDIO (P0.20):",
    "Visual structures always route to Visual Thinking — never Create, Documents, or Strategies.",
    "Path A (user unsure): recommend 2–3 structures + numbered menu; wait for selection.",
    "Path B (user names a structure): open Visual Thinking immediately — no extra questions.",
    "Content conversion (turn this into…): reuse chat content; open Visual Thinking with the target structure.",
    "Decision comparisons (should I, pros/cons) → Decision Compass unless user asked for a visual map.",
    `Available views: ${VISUAL_THINKING_VIEW_LIBRARY.map((v) => v.title).join(", ")}.`,
  ].join("\n");
}

export function mapMenuSelectionToViewId(
  userText: string,
  offer: VisualThinkingMenuOffer,
): VisualThinkingViewId | null {
  const t = userText.trim();
  if (!t) return null;

  const num = t.match(/^(\d+)\.?$/);
  if (num) {
    const pick = offer.numberedOptions.find((o) => o.number === num[1]);
    return pick?.viewId ?? null;
  }

  const lower = t.toLowerCase();
  for (const opt of offer.numberedOptions) {
    if (lower === opt.label.toLowerCase()) return opt.viewId;
    if (lower.includes(opt.label.toLowerCase())) return opt.viewId;
  }

  const explicit = detectExplicitVisualView(t);
  return explicit?.id ?? null;
}

export function studioModeForViewId(viewId: VisualThinkingViewId): VisualFocusMode {
  return getVisualThinkingView(viewId)?.mode ?? "mind-map";
}

export function studioTitleForMode(mode: VisualFocusMode): string {
  return studioCardTitleForMode(mode);
}
