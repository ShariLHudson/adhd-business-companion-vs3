/**
 * Estate Rooms™ Framework (T-017).
 * Philosophy and design standards for every Spark Estate room.
 * V1 runtime catalog: lib/companionHomestead/homesteadRoomRegistry.ts
 *
 * @see docs/ESTATE_ROOMS_FRAMEWORK.md
 * @see docs/SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md (Spec 108 — conversation integration)
 * @see docs/SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md (Spec 109 — workspace surface)
 */

import type {
  EntrepreneurialCapability,
  EntrepreneurialCapabilityDomain,
} from "@/lib/sparkTransformationConstitution/types";

/** The Estate Principle™ — gate before any room ships */
export const ESTATE_PRINCIPLE_QUESTIONS = [
  "Why does this room exist?",
  "How does this environment improve the member's thinking?",
  "What transformation happens here?",
] as const;

/** Environmental Psychology™ — dimensions the room intentionally influences */
export type EnvironmentalPsychologyDimension =
  | "attention"
  | "emotion"
  | "energy"
  | "creativity"
  | "reflection"
  | "decision_making"
  | "confidence"
  | "focus"
  | "curiosity";

export const ENVIRONMENTAL_PSYCHOLOGY_DIMENSIONS: readonly EnvironmentalPsychologyDimension[] =
  [
    "attention",
    "emotion",
    "energy",
    "creativity",
    "reflection",
    "decision_making",
    "confidence",
    "focus",
    "curiosity",
  ] as const;

/** Primary estate experiences — one room, one purpose */
export type EstatePrimaryRoom =
  | "clear_my_mind"
  | "focus"
  | "grow"
  | "create"
  | "gallery"
  | "observatory"
  | "guild_hall"
  | "community_commons";

export const ESTATE_PRIMARY_ROOMS: readonly EstatePrimaryRoom[] = [
  "clear_my_mind",
  "focus",
  "grow",
  "create",
  "gallery",
  "observatory",
  "guild_hall",
  "community_commons",
] as const;

export const ESTATE_PRIMARY_ROOM_LABELS: Record<EstatePrimaryRoom, string> = {
  clear_my_mind: "Clear My Mind",
  focus: "Focus",
  grow: "Grow",
  create: "Create",
  gallery: "Gallery",
  observatory: "Observatory",
  guild_hall: "Guild Hall",
  community_commons: "Community Commons",
};

/** Dominant emotional tone — never mix competing emotions per room */
export type EstateRoomEmotionalTone =
  | "relief"
  | "concentration"
  | "possibility"
  | "creative_confidence"
  | "pride"
  | "wonder"
  | "belonging"
  | "mastery";

export const ESTATE_ROOM_EMOTIONAL_TONES: Record<
  EstatePrimaryRoom,
  EstateRoomEmotionalTone
> = {
  clear_my_mind: "relief",
  focus: "concentration",
  grow: "possibility",
  create: "creative_confidence",
  gallery: "pride",
  observatory: "wonder",
  guild_hall: "mastery",
  community_commons: "belonging",
};

/** Architectural identity — shared estate design language */
export type ArchitecturalIdentityMaterial =
  | "natural_materials"
  | "stone"
  | "wood"
  | "glass"
  | "books"
  | "plants"
  | "fire"
  | "water"
  | "natural_light"
  | "craftsmanship"
  | "timeless_architecture";

export const ARCHITECTURAL_IDENTITY_MATERIALS: readonly ArchitecturalIdentityMaterial[] =
  [
    "natural_materials",
    "stone",
    "wood",
    "glass",
    "books",
    "plants",
    "fire",
    "water",
    "natural_light",
    "craftsmanship",
    "timeless_architecture",
  ] as const;

export type ArchitecturalIdentityAvoid =
  | "futuristic_sci_fi"
  | "corporate_office"
  | "cartoon_styling";

export const ARCHITECTURAL_IDENTITY_AVOID: readonly ArchitecturalIdentityAvoid[] =
  ["futuristic_sci_fi", "corporate_office", "cartoon_styling"] as const;

/** Living spaces — inhabited, never staged */
export type LivingSpaceDetail =
  | "open_books"
  | "fresh_coffee"
  | "handwritten_notes"
  | "chair_turned"
  | "soft_lantern_light"
  | "gentle_movement";

export const LIVING_SPACE_DETAILS: readonly LivingSpaceDetail[] = [
  "open_books",
  "fresh_coffee",
  "handwritten_notes",
  "chair_turned",
  "soft_lantern_light",
  "gentle_movement",
] as const;

export type EstateSeason = "spring" | "summer" | "autumn" | "winter";

export const ESTATE_SEASONS: readonly EstateSeason[] = [
  "spring",
  "summer",
  "autumn",
  "winter",
] as const;

export type EstateTimeOfDay =
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export const ESTATE_TIME_OF_DAY: readonly EstateTimeOfDay[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
] as const;

export const ESTATE_TIME_OF_DAY_FEELING: Record<EstateTimeOfDay, string> = {
  morning: "Golden light",
  afternoon: "Bright productivity",
  evening: "Warm lamps",
  night: "Quiet reflections",
};

/** Ambient sound — supports room purpose, never distracts */
export type EstateAmbientSound =
  | "fireplace"
  | "birds"
  | "wind"
  | "water"
  | "pages_turning"
  | "soft_rain"
  | "room_hush";

export const ESTATE_AMBIENT_SOUNDS: readonly EstateAmbientSound[] = [
  "fireplace",
  "birds",
  "wind",
  "water",
  "pages_turning",
  "soft_rain",
  "room_hush",
] as const;

/** Cognitive load — every room answers immediately */
export const ESTATE_ROOM_ORIENTATION_QUESTIONS = [
  "Why am I here?",
  "What happens here?",
  "What should I do first?",
] as const;

/** Success Standard — observable member thoughts */
export type EstateRoomSuccessSignal =
  | "want_to_spend_time_here"
  | "place_helps_me_think"
  | "feels_peaceful"
  | "feels_familiar"
  | "feels_like_mine";

export const ESTATE_ROOM_SUCCESS_SIGNALS: readonly EstateRoomSuccessSignal[] = [
  "want_to_spend_time_here",
  "place_helps_me_think",
  "feels_peaceful",
  "feels_familiar",
  "feels_like_mine",
] as const;

/** Estate Room spec template — required before implementation */
export type SparkEstateRoomSpec = {
  primaryPurpose: EstatePrimaryRoom;
  emotionalGoal: EstateRoomEmotionalTone;
  capabilitySupported: EntrepreneurialCapability;
  capabilityDomain?: EntrepreneurialCapabilityDomain;
  environmentalPsychology: readonly EnvironmentalPsychologyDimension[];
  timeOfDayChanges: readonly EstateTimeOfDay[];
  seasonalChanges: readonly EstateSeason[];
  personalizationOpportunities: string[];
  connectedRooms: EstatePrimaryRoom[];
  businessAssetIntegration?: string;
  executiveFunctionStrategy: string;
  ambientSoundDesign: readonly EstateAmbientSound[];
  livingSpaceDetails?: readonly LivingSpaceDetail[];
  /** Estate Principle™ — must be answerable */
  estatePrincipleAnswers: {
    whyExists: string;
    howImprovesThinking: string;
    whatTransformation: string;
  };
};
