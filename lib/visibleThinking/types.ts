/**
 * Visible Thinking — relationship-first wait copy.
 */

import type { EmotionalState } from "../companionEmotions";
import type { SpecializedIntelligenceId } from "../companionConstitution/specializedIntelligence/registry";

export type VisibleThinkingKind =
  | "general"
  | "relationship"
  | "memory"
  | "planning"
  | "business"
  | "decision"
  | "creative"
  | "research"
  | "environment"
  | "workspace"
  | "multiple"
  | "gentle";

export type VisibleThinkingTier = "early" | "mid" | "late" | "extended";

export type VisibleThinkingContext = {
  kind: VisibleThinkingKind;
  /** Softer copy for overwhelm, grief, anxiety, discouragement. */
  gentle?: boolean;
  /** Workspace will open beside chat — allows "beside us" copy. */
  workspaceBeside?: boolean;
  /** Companion is preparing or opening a workspace. */
  preparingWorkspace?: boolean;
  activeIntelligences?: readonly SpecializedIntelligenceId[];
  emotionalState?: EmotionalState;
  /** Stable rotation seed per turn. */
  seed?: number;
};

export type EvaluateVisibleThinkingInput = {
  context: VisibleThinkingContext;
  elapsedMs: number;
  usedMessages?: ReadonlySet<string>;
};
