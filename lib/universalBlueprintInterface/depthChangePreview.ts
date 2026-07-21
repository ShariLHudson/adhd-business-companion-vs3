/**
 * Preview depth changes before confirm — same Work ID, no content wipe.
 */

import {
  getWorkBlueprintState,
  requireBlueprint,
  resolveActiveSections,
  type BlueprintDepthMode,
} from "@/lib/universalWorkEngine";
import type { DepthChangePreview } from "./types";

function visibleTitlesForDepth(
  workId: string,
  depthMode: BlueprintDepthMode,
): string[] {
  const state = getWorkBlueprintState(workId);
  if (!state) throw new Error("I couldn’t find that work to change depth.");
  const bp = requireBlueprint(state.blueprintId, state.blueprintVersion);
  const { visibleSectionIds } = resolveActiveSections(
    bp.sections,
    state,
    depthMode,
  );
  const byId = new Map(bp.sections.map((s) => [s.id, s.title]));
  return visibleSectionIds.map((id) => byId.get(id) ?? id);
}

/**
 * Show what will change before confirming a depth change.
 * Changing depth never mints a new Work ID or erases entered content.
 */
export function previewDepthChange(
  workId: string,
  to: BlueprintDepthMode,
): DepthChangePreview {
  const state = getWorkBlueprintState(workId);
  if (!state) throw new Error("I couldn’t find that work to change depth.");

  const fromTitles = new Set(visibleTitlesForDepth(workId, state.depthMode));
  const toTitles = visibleTitlesForDepth(workId, to);
  const sectionsAdded = toTitles.filter((t) => !fromTitles.has(t));
  const sectionsUnchanged = toTitles.filter((t) => fromTitles.has(t));

  return {
    workId: state.workId,
    from: state.depthMode,
    to,
    sectionsAdded,
    sectionsUnchanged,
    hiddenSystemRemainHidden: true,
    preservesWorkId: true,
    erasesUserContent: false,
  };
}
