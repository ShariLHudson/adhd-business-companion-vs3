/**
 * Companion Intelligence — Visual Thinking pipeline types.
 *
 * Visual workspaces are intelligence surfaces, not standalone file tools.
 * Stack: Intelligence → Framework → Visual Output → Insights → Learning → Future Intelligence
 */

import type { VisualFocusMode } from "../types";

/** Ordered stages every visual intelligence surface must support. */
export type VisualThinkingPipelineStage =
  | "understand"
  | "clarify"
  | "structure"
  | "visualize"
  | "insights"
  | "recommendations"
  | "learn"
  | "feed_founder";

export const VISUAL_THINKING_PIPELINE_ORDER: VisualThinkingPipelineStage[] = [
  "understand",
  "clarify",
  "structure",
  "visualize",
  "insights",
  "recommendations",
  "learn",
  "feed_founder",
];

/** Current studio modes plus future intelligence surfaces. */
export type VisualThinkingFrameworkId =
  | VisualFocusMode
  | "living-canvas"
  | "what-if-analysis"
  | "business-simulation"
  | "opportunity-mapping"
  | "board-intelligence"
  | "founder-intelligence"
  | "predictive-business-guidance";

export type VisualThinkingFrameworkMaturity = "production" | "partial" | "future";

export type VisualThinkingFrameworkMeta = {
  id: VisualThinkingFrameworkId;
  userLabel: string;
  /**
   * When true, the framework imposes required sections (Business Canvas is the
   * primary exception). Otherwise structure emerges from the user's situation.
   */
  predefinedStructure: boolean;
  maturity: VisualThinkingFrameworkMaturity;
  canonicalModules: string[];
};

export type VisualThinkingLearningEvent = {
  id: string;
  at: string;
  mapId: string;
  frameworkId: VisualThinkingFrameworkId;
  stage: VisualThinkingPipelineStage;
  /** No user text — counts and enums only. */
  meta?: Record<string, string | number | boolean>;
};

export type VisualThinkingSessionCapture = {
  mapId: string;
  frameworkId: VisualThinkingFrameworkId;
  stage: VisualThinkingPipelineStage;
  meta?: Record<string, string | number | boolean>;
};

/** Canonical rule — import in tests and architecture reviews. */
export const VISUAL_THINKING_INTELLIGENCE_RULE = [
  "Visual Thinking tools are intelligence surfaces, not standalone tools.",
  "Start with understanding; clarify when needed.",
  "Build structure from the user's situation unless the framework requires predefined sections.",
  "Generate visual output, insights, and recommendations.",
  "Capture learning signals and feed Founder Intelligence for future recommendations.",
] as const;
