import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { cssVarsForFocusSpace, subtitleForSpace } from "./layout";
import { resolveFocusTransition } from "./transitions";
import {
  FOCUS_LANDSCAPE_CONNECTIONS,
  focusLandscapeSpace,
} from "./spaceCatalog";
import { spaceForFocusWorkspace } from "./toolRouting";
import type { FocusLandscapeInput, FocusLandscapeVerdict } from "./types";
import {
  FOCUS_LANDSCAPE_INSIGHT,
  FOCUS_LANDSCAPE_PRINCIPLE,
} from "./types";

const LANDSCAPE_WHISPERS = [
  "Movement through land — never a menu.",
  "The center is yours. Life stays at the edges.",
  "Each space is a state of mind, not a screen.",
  "Walk forward. The landscape shifts with you.",
] as const;

function stableWhisper(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return LANDSCAPE_WHISPERS[Math.abs(hash) % LANDSCAPE_WHISPERS.length]!;
}

/**
 * Focus Landscape™ — resolve which cognitive space the guest occupies.
 */
export function evaluateFocusLandscape(
  input: FocusLandscapeInput = {},
): FocusLandscapeVerdict {
  const now = input.now ?? new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const spaceId = spaceForFocusWorkspace({
    workspaceId: input.workspaceId,
    focusCategoryId: input.focusCategoryId,
    toolId: input.toolId,
  });
  const space = focusLandscapeSpace(spaceId);
  const transition = resolveFocusTransition({ to: spaceId });

  return {
    spaceId,
    space,
    placeId: space.placeId,
    title: "Focus My Brain™",
    subtitle: subtitleForSpace(spaceId),
    landscapeWhisper: stableWhisper(`${dayKey}:${spaceId}:${input.toolId ?? "hub"}`),
    transition,
    connectedSpaces: FOCUS_LANDSCAPE_CONNECTIONS[spaceId] ?? [],
    toolId: input.toolId ?? null,
    cssVars: cssVarsForFocusSpace(spaceId),
    dataAttributes: {
      "data-focus-landscape": "1",
      "data-focus-landscape-space": spaceId,
      "data-focus-my-brain": "1",
      "data-focus-transition": transition,
      "data-emotional-purpose": space.emotionalPurpose,
    },
  };
}

export function placeIdForFocusWorkspace(
  input: FocusLandscapeInput,
): CompanionPlaceId {
  return evaluateFocusLandscape(input).placeId;
}

export function focusLandscapeHintForChat(verdict: FocusLandscapeVerdict): string {
  return [
    "FOCUS LANDSCAPE™ — cognitive countryside:",
    FOCUS_LANDSCAPE_PRINCIPLE,
    FOCUS_LANDSCAPE_INSIGHT,
    `Space: ${verdict.space.name} (${verdict.spaceId}).`,
    verdict.space.emotionalPurpose,
    `Transition: ${verdict.transition} — never modal or load screen.`,
    `Connected: ${verdict.connectedSpaces.join(", ")}.`,
    "Global: environment first, edge motion only, Shari nearby not central.",
  ].join("\n");
}
