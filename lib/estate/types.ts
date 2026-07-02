/**
 * Estate Room Registry™ — master types for every Spark Estate™ place.
 *
 * @see docs/ESTATE_ROOM_REGISTRY.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";

/** How the place fits the Estate emotionally and functionally. */
export type EstateRoomType =
  | "welcome"
  | "learning"
  | "creation"
  | "research"
  | "reflection"
  | "restoration"
  | "planning"
  | "play"
  | "nature"
  | "profile"
  | "archive"
  | "future";

export type EstateRoomStatus =
  | "live"
  | "planned"
  | "partial"
  | "image-ready-needs-asset"
  | "future";

export type EstateRoomDefinition = {
  /** Stable registry id — snake-case */
  id: string;
  /** Display name (may include ™ in name field) */
  name: string;
  trademark?: string;
  /** Primary app route when the room is visitable */
  route: AppSection | null;
  /** Additional sections that open inside this room */
  routes?: readonly AppSection[];
  /** Global Estate menu action when opened via ⋯ menu */
  menuActionId?: EstateMenuActionId;
  /** Overlay id when opened as modal (not full section) */
  overlayId?: string;
  /**
   * Canonical background in public/backgrounds — null when asset not yet committed.
   * Use intendedBackgroundImage for the known filename to connect later.
   */
  backgroundImage: string | null;
  /** Known asset path from room art specs — connect when file lands in public/backgrounds */
  intendedBackgroundImage?: string | null;
  /** Links to lib/estateIntelligence estate registry id when registered */
  estateRegistryId?: string;
  /** Links to homestead room id when applicable */
  homesteadRoomId?: string;
  roomType: EstateRoomType;
  purpose: string;
  emotionalFeeling: string;
  whatMembersDo: string;
  whatShariDoes: string;
  whenToRecommend: readonly string[];
  relatedRoomIds: readonly string[];
  /** Member phrases that mean "take me here" */
  navigationPhrases: readonly string[];
  /** Example Estate Intelligence routing intents (documentation + matchers) */
  estateIntelligenceExamples: readonly string[];
  status: EstateRoomStatus;
};
