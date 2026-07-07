import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import {
  isCenterForbidden,
  motionAllowedInZone,
  shariPlacementAllowed,
} from "./rules";
import { placeForWorkspace } from "./mapWorkspaceToRoom";
import { roomCompositionForPlace } from "./roomCatalog";
import type {
  CompositionZone,
  EdgeZone,
  RoomCompositionInput,
  RoomCompositionVerdict,
} from "./types";
import { ROOM_COMPOSITION_PRINCIPLE } from "./types";

export const LIVING_FRAME_CLASS = "companion-living-frame";

/**
 * Room Composition Rule — compose every room around the conversation.
 */
export function evaluateRoomComposition(
  input: RoomCompositionInput = {},
): RoomCompositionVerdict {
  const placeId: CompanionPlaceId =
    input.placeId ?? placeForWorkspace(input.workspaceId);
  const room = roomCompositionForPlace(placeId);
  const mobile = input.mobile ?? false;

  const isConservatory =
    input.workspaceId === "clear-my-mind" ||
    input.workspaceId === "clear-my-mind-thoughts";

  const centerMaxWidth = isConservatory
    ? mobile
      ? "min(100%, 30rem)"
      : "clamp(25rem, 90vw, 30rem)"
    : mobile
      ? "100%"
      : "36rem";
  const mobileProtectedExpand = isConservatory
    ? mobile
      ? "0.72"
      : "0.42"
    : mobile
      ? "0.88"
      : "0.58";

  const cssVars: Record<string, string> = {
    "--scene-image-position": room.backgroundObjectPosition,
    "--scene-panel-frosted-opacity": String(room.panelFrostedOpacity),
    "--scene-center-max-width": centerMaxWidth,
    "--room-protected-zone-expand": mobileProtectedExpand,
    "--room-signature-zone": room.signatureFeature.visibleZone,
  };

  return {
    placeId,
    principle: ROOM_COMPOSITION_PRINCIPLE,
    protectedConversationZone: {
      reserved: true,
      maxWidth: centerMaxWidth,
      centerForbidden: room.centerForbidden,
    },
    livingFrame: {
      enabled: true,
      description:
        "Life happens around the edges — the user is framed by the Homestead.",
    },
    signatureFeature: room.signatureFeature,
    edgeLife: room.edgeLife,
    motionZones: room.motionZones,
    backgroundObjectPosition: room.backgroundObjectPosition,
    panelFrostedOpacity: room.panelFrostedOpacity,
    cssVars,
    dataAttributes: {
      "data-room-composition": placeId,
      "data-living-frame": "1",
      "data-signature-zone": room.signatureFeature.visibleZone,
      "data-protected-zone": "conversation",
    },
  };
}

export function validateEnvironmentalPlacement(
  elementId: string,
  zone: CompositionZone,
): { allowed: boolean; reason?: string } {
  if (zone === "center" && isCenterForbidden(elementId)) {
    return {
      allowed: false,
      reason: `${elementId} must not sit behind the Protected Conversation Zone`,
    };
  }
  if (!motionAllowedInZone(zone)) {
    return {
      allowed: false,
      reason: "Movement must not occur behind readable text",
    };
  }
  return { allowed: true };
}

export function validateShariPlacement(zone: EdgeZone): boolean {
  return shariPlacementAllowed(zone);
}

export function roomCompositionHintForChat(
  verdict: RoomCompositionVerdict,
): string {
  return [
    "ROOM COMPOSITION RULE — design around the conversation:",
    verdict.principle,
    `Place: ${verdict.placeId}. Signature: ${verdict.signatureFeature.label} (${verdict.signatureFeature.visibleZone} edge).`,
    "Never place hero features, Shari, or primary motion behind the center panel.",
    "Environmental storytelling: edges and corners only — especially on mobile.",
  ].join("\n");
}
