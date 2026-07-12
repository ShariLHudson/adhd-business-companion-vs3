/**
 * Project Homes™ — Estate-inspired project places (prototype types).
 * Layers on top of existing Projects — does not replace companion-projects storage.
 */

export type ProjectHomeRoomId =
  | "writing-room"
  | "art-studio"
  | "strategy-conference"
  | "study-hall"
  | "estate-library"
  | "gallery"
  | "music-room"
  | "kitchen"
  | "sunroom"
  | "boardroom";

export type ProjectHomeStatus =
  | "dreaming"
  | "in-motion"
  | "resting"
  | "nearly-ready";

/**
 * Artwork resolution for a Project Home.
 * Today: existing Estate room plates only.
 * Later: custom, seasonal, overlays, avatars, AI-generated (not implemented).
 */
export type ProjectHomeArtworkSource =
  | "estate-room"
  | "placeholder"
  | "custom"
  | "ai-generated";

export type ProjectHomeArtwork = {
  /** Currently displayed background URL */
  backgroundUrl: string;
  source: ProjectHomeArtworkSource;
  /**
   * True when using temporary artwork that should be replaced
   * (e.g. Strategy Conference Room until a dedicated plate exists).
   */
  isPlaceholder?: boolean;
  /** Internal note for designers — never shown as system error copy */
  placeholderNote?: string;
  /** Future: path once dedicated artwork ships */
  dedicatedArtworkPath?: string | null;
};

/**
 * Future personalization hooks — structured now, unused in this refinement.
 * Do not implement custom styling, overlays, seasons, avatars, or AI art yet.
 */
export type ProjectHomePersonalizationHooks = {
  customRoomStylingId?: string | null;
  decorativeOverlayIds?: string[];
  seasonalAppearanceId?: string | null;
  projectAvatarId?: string | null;
  /** Reserved — AI artwork generation is out of scope for this phase */
  aiArtworkRequestId?: string | null;
};

export type ProjectHomeRecord = {
  id: string;
  name: string;
  purpose: string;
  /** Room where this project lives inside the Estate */
  projectHomeId: ProjectHomeRoomId;
  status: ProjectHomeStatus;
  currentFocus: string;
  lastWorkedAt: string;
  nextSuggestedStep: string;
  /** Prototype-only atmosphere copy */
  atmosphereNote?: string;
  /** Optional override artwork — falls back to room catalog */
  artworkOverride?: ProjectHomeArtwork | null;
  /** Future hooks only — not rendered yet */
  personalization?: ProjectHomePersonalizationHooks;
};

export type ProjectHomeView =
  | "gallery"
  | "create-purpose"
  | "create-home"
  | "detail";

export type ProjectHomeRoomDefinition = {
  id: ProjectHomeRoomId;
  name: string;
  /** Canonical Estate place id when one exists */
  placeId: string;
  /** Short explanation of what belongs in this Project Home */
  description: string;
  /** Warm recommend-when copy for Shari's natural suggestion */
  recommendVoice: string;
  recommendWhen: string[];
  /** Default artwork (existing plates only in this phase) */
  artwork: ProjectHomeArtwork;
};

export type ProjectHomeRecommendation = {
  roomId: ProjectHomeRoomId;
  /** Natural Shari-style recommendation paragraph */
  reason: string;
};

/** Navigation shortcut only — does not duplicate project data */
export type ConnectedPlaceShortcut = {
  id: string;
  label: string;
  blurb: string;
  /** Estate destination hint for a future router — unused in prototype */
  destinationHint: string;
};
