/**
 * Signature Companion Objects — three coordinated visual forms.
 * @see docs/companion-homestead/SIGNATURE_COMPANION_OBJECTS.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { CompanionObjectAnimation } from "@/lib/companionObjectsDesignSystem/types";

/** Level 1 — nav menus, tabs, search. Level 2 — cards, workspaces. Level 3 — in-room scenes. */
export const SIGNATURE_OBJECT_FORMS = [
  "navigation",
  "feature",
  "environmental",
] as const;

export type SignatureObjectForm = (typeof SIGNATURE_OBJECT_FORMS)[number];

/** Pixel targets per form — all three must read as the same object. */
export const SIGNATURE_FORM_SIZE_PX: Record<
  SignatureObjectForm,
  { min: number; max: number; cssToken: string }
> = {
  navigation: { min: 24, max: 32, cssToken: "sm" },
  feature: { min: 64, max: 120, cssToken: "card" },
  environmental: { min: 128, max: 256, cssToken: "hero" },
};

export const SIGNATURE_ROOM_ZONES = [
  "living-room",
  "clear-my-mind",
  "planning-table",
  "sunroom-over-pond",
  "reading-nook",
  "creative-studio",
  "business",
  "kitchen",
  "nature",
  "kinsey",
] as const;

export type SignatureRoomZone = (typeof SIGNATURE_ROOM_ZONES)[number];

export type SignatureRoomMeta = {
  id: SignatureRoomZone;
  name: string;
  placeId: CompanionPlaceId;
  /** Workspace registry id when this zone is also a top-level feature. */
  workspaceId?: string;
};

export const SIGNATURE_ROOM_META: readonly SignatureRoomMeta[] = [
  { id: "living-room", name: "Living Room", placeId: "living-room" },
  {
    id: "clear-my-mind",
    name: "Clear My Mind",
    placeId: "window-seat",
    workspaceId: "clear-my-mind",
  },
  {
    id: "planning-table",
    name: "Planning Table",
    placeId: "planning-table",
    workspaceId: "plan-my-day",
  },
  {
    id: "sunroom-over-pond",
    name: "Sunroom Over The Pond",
    placeId: "sunroom-over-pond",
    workspaceId: "focus-hub",
  },
  { id: "reading-nook", name: "Reading Nook", placeId: "reading-nook" },
  { id: "creative-studio", name: "Creative Studio", placeId: "creative-studio" },
  {
    id: "business",
    name: "Business",
    placeId: "business-office",
    workspaceId: "business",
  },
  { id: "kitchen", name: "Kitchen", placeId: "kitchen-table" },
  { id: "nature", name: "Nature", placeId: "garden" },
  { id: "kinsey", name: "Kinsey", placeId: "living-room" },
];

export type SignatureCompanionObject = {
  /** Stable signature id — sig-planning-notebook */
  id: string;
  /** Display name — Planning Notebook */
  name: string;
  room: SignatureRoomZone;
  emotionalPurpose: string;
  /** Master catalog object — shared across all three forms */
  catalogObjectId: string;
  /** Feature/nav registry when this object is also a workspace identity */
  featureObjectId?: string;
  animation?: CompanionObjectAnimation;
  /** Primary signature for this room or workspace */
  isPrimary?: boolean;
};
