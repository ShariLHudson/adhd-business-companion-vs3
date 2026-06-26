import type { CompanionLibraryMeta } from "./types";

/**
 * Master catalog — all 24 Companion Universe™ libraries.
 * Maturity tracks what is production-ready vs foundation vs planned.
 */
export const COMPANION_LIBRARY_CATALOG: CompanionLibraryMeta[] = [
  { id: "place", name: "Companion Place Library™", maturity: "foundation", module: "companionUniverse/libraries/placeLibrary", description: "20 homestead places — governed by docs/companion-homestead/MASTER_PROPERTY_BLUEPRINT.md" },
  { id: "needs", name: "Companion Needs Intelligence™", maturity: "foundation", module: "companionNeedsIntelligence", description: "What the ADHD entrepreneur needs before any room is prepared" },
  { id: "image", name: "Companion Image Library™", maturity: "foundation", module: "companionPresenceLibrary + safeCompositionRegistry", description: "Approved photographs with safe zones" },
  { id: "scene", name: "Scene Library™", maturity: "foundation", module: "companionHospitalityPrototype/scenePresets", description: "Full scene presets — Iowa morning, snow day, birthday" },
  { id: "scene-integrity", name: "Scene Integrity Library™", maturity: "foundation", module: "companionHospitalityPrototype/sceneIntegrityEngine", description: "Rules preventing impossible combinations" },
  { id: "hospitality", name: "Hospitality Library™", maturity: "foundation", module: "companionUniverse/libraries/hospitalityLibrary", description: "Everything Shari can prepare" },
  { id: "motion", name: "Living Motion Library™", maturity: "foundation", module: "companionUniverse/libraries/motionLibrary", description: "Natural movement — never obvious loops" },
  { id: "ambient-sound", name: "Ambient Sound Library™", maturity: "foundation", module: "companionHospitalityPrototype/ambientAudio", description: "Birds, rain, fireplace — accessibility-aware" },
  { id: "lighting", name: "Lighting Library™", maturity: "foundation", module: "companionHospitalityPrototype/types", description: "Morning through night, rain, snow, recovery" },
  { id: "seasonal", name: "Seasonal Library™", maturity: "foundation", module: "welcomeLivingRoom/atmosphere + dailyDiscovery", description: "Seasons, holidays, launches, vacations" },
  { id: "discovery", name: "Discovery Library™", maturity: "foundation", module: "companionEnvironmentIntelligence/dailyDiscovery", description: "Daily surprises — never pushy" },
  { id: "greeting", name: "Greeting Library™", maturity: "production", module: "welcomePresenceIntelligence/greetingLibrary", description: "Context-aware greetings and invites" },
  { id: "conversation", name: "Companion Conversation Library™", maturity: "foundation", module: "companionUniverse/libraries/conversationLibrary", description: "Cadence per place" },
  { id: "object", name: "Object Library™", maturity: "foundation", module: "companionEnvironmentIntelligence/resolveRoom", description: "Visible room objects with placement" },
  { id: "book", name: "Book Library™", maturity: "foundation", module: "companionEnvironmentIntelligence/bookLibrary", description: "Books as quiet conversation" },
  { id: "artwork", name: "Artwork Library™", maturity: "planned", module: "companionUniverse/libraries/artworkLibrary", description: "Meaningful wall art rotation" },
  { id: "humor", name: "Companion Humor Library™", maturity: "planned", module: "companionUniverse/libraries/humorLibrary", description: "Tiny delight moments" },
  { id: "shari-stories", name: "Shari Stories™ Library", maturity: "planned", module: "companionUniverse/libraries/shariStoriesLibrary", description: "Stories as objects and discovery" },
  { id: "emotional-promise", name: "Emotional Promise Library™", maturity: "foundation", module: "companionUniverse/libraries/placeLibrary", description: "Promise per place — inherited by every feature" },
  { id: "signature-object", name: "Signature Object Library™", maturity: "foundation", module: "companionUniverse/libraries/signatureObjectLibrary", description: "One iconic anchor per place" },
  { id: "companion-object", name: "Companion Object Library™", maturity: "foundation", module: "companionUniverse/libraries/objectLibrary", description: "Signature Objects™ per feature — replaces emoji iconography" },
  { id: "personality", name: "Shari Personality Library™", maturity: "foundation", module: "companionUniverse/libraries/personalityLibrary", description: "Trait expressions in environment — governed by docs/EXPERIENCE_OF_SHARI.md" },
  { id: "ngmtm", name: "Nobody Gave Me the Manual™ Library", maturity: "planned", module: "companionUniverse/libraries/ngmtmLibrary", description: "Honest ADHD moments — governed by docs/THE_HONEST_SHARI.md" },
  { id: "delight", name: "Delight Library™", maturity: "planned", module: "companionUniverse/libraries/delightLibrary", description: "Things users simply notice" },
  { id: "memory", name: "Companion Memory Library™", maturity: "foundation", module: "recognition/recognitionStore", description: "The home remembers" },
  { id: "constitution", name: "Companion Hospitality Constitution™", maturity: "foundation", module: "companionUniverse/constitution", description: "Principles every library must meet" },
  { id: "hospitality-profile", name: "Companion Hospitality Profile™", maturity: "foundation", module: "companionUniverse/libraries/hospitalityProfileLibrary", description: "What Shari remembers — not a user profile" },
  { id: "traditions", name: "Home Traditions Library™", maturity: "foundation", module: "companionUniverse/libraries/traditionsLibrary", description: "Layer 4 — the home's calendar" },
  { id: "layout", name: "Companion Layout System™", maturity: "foundation", module: "companionUniverse/companionLayoutSystem", description: "House Map, Toolbelt, four layers, room immersion" },
  { id: "presence", name: "Companion Presence Engine™", maturity: "foundation", module: "companionUniverse/companionPresenceEngine", description: "When Shari stays, steps back, or leaves evidence" },
];

export function libraryById(id: CompanionLibraryMeta["id"]): CompanionLibraryMeta {
  return COMPANION_LIBRARY_CATALOG.find((lib) => lib.id === id)!;
}
