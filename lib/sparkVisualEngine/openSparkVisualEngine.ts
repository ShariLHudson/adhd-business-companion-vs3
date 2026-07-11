/**
 * Spark Visual Engine — shared open contract (#184).
 * Callable from any experience; rooms only supply context/data.
 */

import type { VisualThinkingViewId } from "@/lib/visualThinkingStudio";
import type { SparkVisualEngineViewId } from "./sparkVisualEngineStandard";
import { SPARK_VISUAL_ENGINE_VIEWS } from "./sparkVisualEngineStandard";

export type SparkVisualEngineContextSource =
  | "clear-my-mind"
  | "projects"
  | "journal"
  | "decision-compass"
  | "creative-studio"
  | "destination-gallery"
  | "evidence-vault"
  | "conversation"
  | "other";

export type SparkVisualEngineOpenRequest = {
  /** Preferred canonical view; defaults to mind-map. */
  viewId?: SparkVisualEngineViewId;
  /** Studio view override when already resolved. */
  studioViewId?: VisualThinkingViewId;
  /** Where the request originated — framing only, never permission. */
  source: SparkVisualEngineContextSource;
  /** Optional seed text / capture for the map. */
  seedText?: string;
  /** Optional title for the map. */
  title?: string;
};

export function resolveStudioViewForEngineOpen(
  request: SparkVisualEngineOpenRequest,
): VisualThinkingViewId {
  if (request.studioViewId) return request.studioViewId;
  if (request.viewId) {
    const match = SPARK_VISUAL_ENGINE_VIEWS.find((v) => v.id === request.viewId);
    if (match) return match.studioViewId;
  }
  switch (request.source) {
    case "clear-my-mind":
      return "brain-dump-map";
    case "projects":
      return "project-map";
    case "decision-compass":
      return "decision-tree";
    case "journal":
      return "mind-map";
    default:
      return "mind-map";
  }
}

export const VISUALIZE_THIS_LABEL = "Visualize This" as const;
