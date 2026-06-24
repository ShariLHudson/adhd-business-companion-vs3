/**
 * Visual Thinking™ lifecycle learning — anonymous metadata on map actions.
 * Map deletion removes user-facing data; learning events persist for Founder Intelligence™.
 */

import { emitCompanionSignal } from "@/lib/intelligence-layer/signalBus";
import { frameworkIdForMap } from "./pipeline";
import type { VisualFocusMap } from "../types";

export type VisualThinkingLifecycleAction =
  | "map_renamed"
  | "map_duplicated"
  | "map_archived"
  | "map_unarchived"
  | "map_deleted"
  | "map_version_saved"
  | "map_version_restored";

const EMITTER = "visual_thinking_lifecycle";

export function captureVisualThinkingLifecycleEvent(
  map: VisualFocusMap,
  action: VisualThinkingLifecycleAction,
  meta?: Record<string, string | number | boolean>,
): void {
  emitCompanionSignal({
    domain: "workspace",
    category: "tool_used",
    action: "observed",
    source: `visual_thinking:lifecycle:${action}`,
    emitter: EMITTER,
    meta: {
      map_id: map.id,
      framework: frameworkIdForMap(map),
      lifecycle_action: action,
      lifecycle_status: map.lifecycleStatus ?? "active",
      ...meta,
    },
  });
}
