import { studioCardTitleForMode } from "../studioCards";
import type { VisualFocusMode } from "../types";
import type {
  VisualThinkingFrameworkId,
  VisualThinkingFrameworkMeta,
} from "./types";

const CURRENT_MODES: VisualFocusMode[] = [
  "mind-map",
  "decision-tree",
  "strategy-map",
  "relationship-map",
  "project-map",
  "process-map",
  "journey-map",
  "timeline-map",
  "opportunity-map",
  "system-map",
  "priority-map",
  "visual-kanban",
  "business-canvas",
];

function modeFramework(mode: VisualFocusMode): VisualThinkingFrameworkMeta {
  return {
    id: mode,
    userLabel: studioCardTitleForMode(mode),
    predefinedStructure: mode === "business-canvas",
    maturity: "production",
    canonicalModules: [
      "lib/visualFocus/",
      mode === "business-canvas" ? "lib/visualFocus/businessCanvas/" : "",
    ].filter(Boolean),
  };
}

/** Future surfaces — register now; implement without rewriting the pipeline. */
export const FUTURE_VISUAL_THINKING_FRAMEWORKS: VisualThinkingFrameworkMeta[] = [
  {
    id: "living-canvas",
    userLabel: "Living Canvas",
    predefinedStructure: false,
    maturity: "future",
    canonicalModules: ["lib/visualFocus/companionIntelligence/"],
  },
  {
    id: "what-if-analysis",
    userLabel: "What-If Analysis",
    predefinedStructure: false,
    maturity: "partial",
    canonicalModules: [
      "lib/visualFocus/businessCanvas/changeExploration.ts",
      "lib/visualFocus/generateMap.ts",
    ],
  },
  {
    id: "business-simulation",
    userLabel: "Business Simulations",
    predefinedStructure: false,
    maturity: "future",
    canonicalModules: ["lib/visualFocus/companionIntelligence/"],
  },
  {
    id: "opportunity-mapping",
    userLabel: "Opportunity Mapping",
    predefinedStructure: false,
    maturity: "future",
    canonicalModules: ["lib/opportunity-intelligence/"],
  },
  {
    id: "board-intelligence",
    userLabel: "Board of Directors Intelligence",
    predefinedStructure: false,
    maturity: "partial",
    canonicalModules: ["lib/companionIntelligence.ts", "lib/ecosystem/board/"],
  },
  {
    id: "founder-intelligence",
    userLabel: "Founder Intelligence",
    predefinedStructure: false,
    maturity: "partial",
    canonicalModules: ["lib/founderIntelligence.ts", "lib/ecosystem/"],
  },
  {
    id: "predictive-business-guidance",
    userLabel: "Predictive Business Guidance",
    predefinedStructure: false,
    maturity: "future",
    canonicalModules: ["lib/predictive-support/"],
  },
];

export const VISUAL_THINKING_FRAMEWORK_REGISTRY: VisualThinkingFrameworkMeta[] = [
  ...CURRENT_MODES.map(modeFramework),
  ...FUTURE_VISUAL_THINKING_FRAMEWORKS,
];

export function frameworkMetaForId(
  id: VisualThinkingFrameworkId,
): VisualThinkingFrameworkMeta | undefined {
  return VISUAL_THINKING_FRAMEWORK_REGISTRY.find((f) => f.id === id);
}

export function frameworkRequiresPredefinedStructure(
  id: VisualThinkingFrameworkId,
): boolean {
  return frameworkMetaForId(id)?.predefinedStructure ?? false;
}

export function isFutureVisualThinkingFramework(
  id: VisualThinkingFrameworkId,
): boolean {
  return frameworkMetaForId(id)?.maturity === "future";
}
