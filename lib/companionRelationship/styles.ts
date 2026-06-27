import type {
  CompanionRelationshipRhythm,
  CompanionRelationshipStyleMeta,
} from "./types";

const QUIET_RHYTHM: CompanionRelationshipRhythm = {
  greetingLength: "brief",
  askReconnectionQuestion: false,
  environmentalStorytelling: "minimal",
  memoryTriggerVisitModulo: 8,
  everydayLifeVisitModulo: 4,
  personalStories: "rare",
  speedToWork: "immediate",
  checkInFrequency: "low",
  conversationLinger: "short",
  prioritizeWorkRouting: true,
  preferLivingRoomLinger: false,
};

const BALANCED_RHYTHM: CompanionRelationshipRhythm = {
  greetingLength: "warm",
  askReconnectionQuestion: true,
  environmentalStorytelling: "occasional",
  memoryTriggerVisitModulo: 4,
  everydayLifeVisitModulo: 2,
  personalStories: "occasional",
  speedToWork: "fast",
  checkInFrequency: "normal",
  conversationLinger: "medium",
  prioritizeWorkRouting: false,
  preferLivingRoomLinger: false,
};

const FRONT_PORCH_RHYTHM: CompanionRelationshipRhythm = {
  greetingLength: "rich",
  askReconnectionQuestion: true,
  environmentalStorytelling: "frequent",
  memoryTriggerVisitModulo: 3,
  everydayLifeVisitModulo: 1,
  personalStories: "frequent",
  speedToWork: "gentle",
  checkInFrequency: "normal",
  conversationLinger: "long",
  prioritizeWorkRouting: false,
  preferLivingRoomLinger: true,
};

export const COMPANION_RELATIONSHIP_STYLES_CATALOG: CompanionRelationshipStyleMeta[] = [
  {
    id: "quiet-companion",
    label: "Quiet Companion",
    emoji: "🌿",
    tagline: "I usually know what I want to work on.",
    description:
      "Brief welcome, direct routing, minimal observations, rare personal stories.",
    rhythm: QUIET_RHYTHM,
  },
  {
    id: "balanced-companion",
    label: "Balanced Companion",
    emoji: "☕",
    tagline: "I enjoy a little conversation, then let's get to work.",
    description:
      "Warm greeting, occasional Memory Triggers, fast transition when work is requested.",
    rhythm: BALANCED_RHYTHM,
  },
  {
    id: "front-porch-companion",
    label: "Front Porch Companion",
    emoji: "🏡",
    tagline: "I enjoy spending a little time together before we begin.",
    description:
      "Richer storytelling, more relationship moments, seasonal life — never overwhelming.",
    rhythm: FRONT_PORCH_RHYTHM,
  },
];

export function rhythmForStyle(
  style: CompanionRelationshipStyleMeta["id"],
): CompanionRelationshipRhythm {
  const meta = COMPANION_RELATIONSHIP_STYLES_CATALOG.find((s) => s.id === style);
  return meta?.rhythm ?? BALANCED_RHYTHM;
}

export function styleMetaById(
  style: CompanionRelationshipStyleMeta["id"],
): CompanionRelationshipStyleMeta {
  return (
    COMPANION_RELATIONSHIP_STYLES_CATALOG.find((s) => s.id === style) ??
    COMPANION_RELATIONSHIP_STYLES_CATALOG[1]!
  );
}
