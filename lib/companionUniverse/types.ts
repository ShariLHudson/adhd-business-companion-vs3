/**
 * Companion Universe — shared types across all homestead libraries.
 */

export type CompanionPlaceId =
  | "living-room"
  | "window-seat"
  | "kitchen-table"
  | "planning-table"
  | "business-office"
  | "creative-studio"
  | "workshop"
  | "focus-studio"
  | "sunroom-over-pond"
  | "reading-nook"
  | "garden"
  | "garden-path"
  | "greenhouse"
  | "back-deck"
  | "fire-circle"
  | "library"
  | "front-porch"
  | "barn"
  | "outlook-point"
  | "adventure-room"
  | "future-wings";

export type CompanionLibraryId =
  | "place"
  | "image"
  | "scene"
  | "scene-integrity"
  | "hospitality"
  | "motion"
  | "ambient-sound"
  | "lighting"
  | "seasonal"
  | "discovery"
  | "shari-voice-bible"
  | "emotional-experience-blueprint"
  | "presence-intelligence"
  | "wisdom-of-restraint"
  | "character-of-shari"
  | "sharis-life-moments"
  | "sharis-everyday-life"
  | "greeting"
  | "conversation"
  | "object"
  | "book"
  | "artwork"
  | "humor"
  | "shari-stories"
  | "emotional-promise"
  | "signature-object"
  | "companion-object"
  | "companion-objects-design-system"
  | "signature-companion-objects"
  | "quiet-moments"
  | "memory-triggers"
  | "companion-relationship"
  | "honor-their-intent"
  | "carry-forward"
  | "companion-constitution"
  | "conversation-intelligence"
  | "companion-intelligence"
  | "environment-intelligence"
  | "scene-render-contract"
  | "room-composition-rule"
  | "living-border"
  | "sharis-presence"
  | "planning-table-room"
  | "sunroom-over-pond"
  | "focus-landscape"
  | "personality"
  | "ngmtm"
  | "delight"
  | "memory"
  | "constitution"
  | "hospitality-profile"
  | "traditions"
  | "layout"
  | "presence"
  | "needs";

export type LibraryMaturity = "production" | "foundation" | "planned";

export type CompanionLibraryMeta = {
  id: CompanionLibraryId;
  name: string;
  maturity: LibraryMaturity;
  module: string;
  description: string;
};

export type HospitalityStyle =
  | "warm-host"
  | "quiet-listener"
  | "gentle-guide"
  | "minimal-focus"
  | "creative-partner"
  | "thoughtful-companion"
  | "reflective-friend"
  | "celebratory"
  | "recovery";

export type ShariPresenceLevel =
  | "full"
  | "nearby"
  | "ambient"
  | "minimal"
  | "absent";

export type ConversationCadence =
  | "warm-host"
  | "quiet-listener"
  | "gentle-guide"
  | "minimal"
  | "creative-partner"
  | "thoughtful-companion"
  | "reflective-friend";

export type CompanionPlace = {
  id: CompanionPlaceId;
  name: string;
  purpose: string;
  emotionalPromise: string;
  hospitalityStyle: HospitalityStyle;
  lightingProfile: string;
  signatureObjectId: string;
  soundProfile: string;
  motionProfile: string;
  conversationCadence: ConversationCadence;
  transitionAnimation: string;
  shariPresenceLevel: ShariPresenceLevel;
  userLeavesFeeling: string;
  /** Production-ready places can be entered today. */
  available: boolean;
};

export type PersonalityTrait =
  | "warm"
  | "creative"
  | "funny"
  | "curious"
  | "colorful"
  | "imaginative"
  | "hospitable"
  | "hopeful"
  | "encouraging"
  | "playful"
  | "authentic";

export type ConstitutionPrincipleId =
  | "room-is-prepared"
  | "never-decorated"
  | "delight-without-distraction"
  | "warmth-before-productivity"
  | "restraint-before-clutter"
  | "life-before-animation"
  | "discovery-before-novelty"
  | "hospitality-before-technology"
  | "relationship-before-workflow";

export type ConstitutionCheck = {
  principleId: ConstitutionPrincipleId;
  passed: boolean;
  reason?: string;
};

export type UniverseOrchestrationInput = {
  placeId?: CompanionPlaceId;
  /** When true, navigation chose the room — Needs Intelligence informs hospitality only. */
  placeLocked?: boolean;
  now?: Date;
  /** Director's Studio / prototype controls — resolved through Scene Integrity. */
  directorControls?: import("@/lib/companionHospitalityPrototype").DirectorSceneState;
  /** When true, use production arrival path instead of director controls. */
  useProductionPath?: boolean;
  /** Optional hospitality profile — what Shari remembers, not who the guest is. */
  hospitalityProfile?: import("./libraries/hospitalityProfileLibrary").CompanionHospitalityProfile;
  /** Activity modifiers for Companion Presence Engine. */
  presenceModifiers?: import("./companionPresenceEngine").PresenceActivityModifier[];
  /** Current context for Companion Needs Intelligence — earliest orchestration step. */
  needsContext?: import("@/lib/companionNeedsIntelligence").CompanionNeedsInput;
  userSeed?: string;
};

export type UniverseOrchestrationResult = {
  place: CompanionPlace;
  constitution: ConstitutionCheck[];
  constitutionPassed: boolean;
  hospitalityPrinciple: import("./hospitalityPrinciple").HospitalityPrincipleEvaluation;
  hospitalityPrinciplePassed: boolean;
  layers: import("./resolveHospitalityLayers").HospitalityLayers;
  librariesUsed: CompanionLibraryId[];
  /** Resolved scene when director controls or prototype path is used. */
  resolvedScene?: import("@/lib/companionHospitalityPrototype").ResolvedHospitalityScene;
  /** Production living room when useProductionPath is set. */
  livingRoom?: import("@/lib/companionEnvironmentIntelligence").LivingCompanionRoom;
  greeting?: string;
  invite?: string;
  atmosphere?: string;
  /** Companion Presence Engine — should Shari stay or step back? */
  presence: import("./companionPresenceEngine").ResolvedCompanionPresence;
  /** Companion Needs Intelligence — what they need before the room is prepared. */
  needs: import("@/lib/companionNeedsIntelligence").CompanionNeedsIntelligence | null;
};
