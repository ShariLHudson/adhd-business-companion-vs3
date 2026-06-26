"use client";

import { COMPANION_LIVING_BORDER_CLASS } from "@/lib/companionWorkspaceStandard";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import {
  evaluateLivingBorder,
  visibleBorderRenderClasses,
  type LivingBorderInput,
  type LivingBorderVerdict,
} from "@/lib/livingBorder";
import { placeForWorkspace } from "@/lib/roomCompositionRule";

type Props = {
  /** Homestead place — preferred */
  placeId?: CompanionPlaceId;
  /** Legacy room slug */
  room?: "clear-my-mind" | "default";
  workspaceId?: string;
  borderInput?: Omit<LivingBorderInput, "placeId" | "workspaceId">;
  /** Pre-resolved verdict from SceneRenderer */
  verdict?: LivingBorderVerdict;
};

const LEGACY_ROOM_TO_PLACE: Record<string, CompanionPlaceId> = {
  "clear-my-mind": "window-seat",
  default: "living-room",
};

/**
 * Living Border™ — life at the edges; center stays calm for the guest.
 */
export function LivingBorderFrame({
  placeId,
  room = "default",
  workspaceId,
  borderInput,
  verdict: verdictOverride,
}: Props) {
  const resolvedPlaceId =
    placeId ??
    (workspaceId ? placeForWorkspace(workspaceId) : LEGACY_ROOM_TO_PLACE[room]);

  const verdict =
    verdictOverride ??
    evaluateLivingBorder({
      placeId: resolvedPlaceId,
      workspaceId,
      ...borderInput,
    });

  const renderClasses = visibleBorderRenderClasses(verdict);

  return (
    <div
      className={`${COMPANION_LIVING_BORDER_CLASS} companion-living-border--${resolvedPlaceId}${verdict.mustNotDistract ? " companion-living-border--subtle" : ""}`}
      aria-hidden="true"
      {...verdict.dataAttributes}
    >
      {renderClasses.map((className) => (
        <div key={className} className={className} />
      ))}
    </div>
  );
}
