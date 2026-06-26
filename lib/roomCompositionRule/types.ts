/**
 * Room Composition Rule™ — design around the conversation.
 * @see docs/companion-homestead/ROOM_COMPOSITION_RULE.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";

export const EDGE_ZONES = ["left", "right", "top", "bottom"] as const;
export type EdgeZone = (typeof EDGE_ZONES)[number];

export const COMPOSITION_ZONES = ["center", ...EDGE_ZONES] as const;
export type CompositionZone = (typeof COMPOSITION_ZONES)[number];

export type SignatureFeatureSpec = {
  id: string;
  label: string;
  /** Edge zone where the hero must stay visible */
  visibleZone: EdgeZone;
  description: string;
};

export type RoomCompositionEntry = {
  placeId: CompanionPlaceId;
  name: string;
  signatureFeature: SignatureFeatureSpec;
  /** Environmental details allowed per edge — life frames the work */
  edgeLife: Record<EdgeZone, readonly string[]>;
  /** Never place behind the Protected Conversation Zone™ */
  centerForbidden: readonly string[];
  /** Good motion locations — never behind text */
  motionZones: readonly EdgeZone[];
  /** Background crop bias so signature feature stays visible */
  backgroundObjectPosition: string;
  /** Frosted panel opacity when workspace is open */
  panelFrostedOpacity: number;
};

export type RoomCompositionInput = {
  placeId?: CompanionPlaceId;
  workspaceId?: string;
  /** Mobile expands protected zone — center rarely visible */
  mobile?: boolean;
};

export type RoomCompositionVerdict = {
  placeId: CompanionPlaceId;
  principle: typeof ROOM_COMPOSITION_PRINCIPLE;
  protectedConversationZone: {
    reserved: true;
    maxWidth: string;
    centerForbidden: readonly string[];
  };
  livingFrame: {
    enabled: true;
    description: string;
  };
  signatureFeature: SignatureFeatureSpec;
  edgeLife: Record<EdgeZone, readonly string[]>;
  motionZones: readonly EdgeZone[];
  backgroundObjectPosition: string;
  panelFrostedOpacity: number;
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

export const ROOM_COMPOSITION_PRINCIPLE =
  "Design the room for the space that remains visible — not the space that will be covered." as const;
