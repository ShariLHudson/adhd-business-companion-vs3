/**
 * Estate Arrival Experience™ — room identity, motto, Shari greeting, ambience.
 *
 * @deprecated **Arrival authority (Phase B):** Title/motto plaques and timed arrival sequences
 * conflict with canonical `arrivalBehavior` (threshold · ambient-crossfade · presence-only).
 * Retained for current UI — replace with canon-driven arrival in a later phase.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import { getEstateRoomById } from "./estateRoomRegistry";
import { resolveCanonicalPlaceAmbience } from "./estatePlaceMedia";
import type {
  EstateArrivalAmbienceProfile,
  EstateArrivalExperienceConfig,
} from "./estateArrivalExperienceTypes";
import {
  BEDROOM_WINDOW_AMBIENCE_MP3,
  BRIGHT_STUDIO_AMBIENCE_MP3,
  COFFEE_HOUSE_AMBIENCE_MP3,
  EAST_TERRACE_AMBIENCE_MP3,
  EVENING_HEARTH_AMBIENCE_MP3,
  GAZEBO_JOURNAL_AMBIENCE_MP3,
  GREENHOUSE_BIRDS_AMBIENCE_MP3,
  HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
  OCEAN_CONSERVATORY_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";

export type {
  EstateArrivalAmbienceProfile,
  EstateArrivalExperienceConfig,
} from "./estateArrivalExperienceTypes";

/** Timing — arrival sequence (ms). */
export const ESTATE_ARRIVAL_VEIL_MS = 520;
export const ESTATE_ARRIVAL_NAME_FADE_MS = 920;
export const ESTATE_ARRIVAL_MOTTO_FADE_MS = 720;
export const ESTATE_ARRIVAL_HOLD_MS = 2000;
export const ESTATE_ARRIVAL_TITLE_FADE_OUT_MS = 780;

export const ESTATE_ARRIVAL_TOTAL_MS =
  ESTATE_ARRIVAL_VEIL_MS +
  ESTATE_ARRIVAL_NAME_FADE_MS +
  ESTATE_ARRIVAL_HOLD_MS +
  ESTATE_ARRIVAL_TITLE_FADE_OUT_MS;

const ARRIVAL_BY_ROOM: Record<string, Omit<EstateArrivalExperienceConfig, "roomId">> = {
  "momentum-institute": {
    title: "Momentum Institute™",
    motto: "Developing Better Entrepreneurs.",
    shariGreeting:
      "What would you like to do while we're here?",
    invitationAfterArrival: true,
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.14,
      character: "soft library ambience, page turns, quiet footsteps",
    },
  },
  library: {
    title: "The Library™",
    motto: "Quiet reading and story — wisdom on the shelves.",
    shariGreeting: "What would you like to read or explore?",
    invitationAfterArrival: true,
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.12,
      character: "soft library hush, page turns",
    },
  },
  "creative-studio": {
    title: "Creative Studio™",
    motto: "Where Ideas Become Reality.",
    shariGreeting: "What would you like to create together?",
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.12,
      character: "soft instrumental music, pencil sounds, paper",
    },
  },
  conservatory: {
    title: "The Conservatory™",
    motto: "A peaceful place to breathe, think, and regain clarity.",
    shariGreeting:
      "We can simply enjoy the space, or if you'd like, I can help you with one of these.",
    invitationAfterArrival: true,
    ambience: {
      src: OCEAN_CONSERVATORY_AMBIENCE_MP3,
      volume: 0.11,
      character: "indoor aquarium, gentle water hush, living tank",
    },
  },
  "clear-my-mind": {
    title: "The Conservatory™",
    motto: "A peaceful place to breathe, think, and regain clarity.",
    shariGreeting:
      "We can simply enjoy the space, or if you'd like, I can help you with one of these.",
    invitationAfterArrival: true,
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.13,
      character: "birds, water, wind",
    },
  },
  "coffee-house": {
    title: "Coffee House™",
    motto: "Great Conversations Change Businesses.",
    shariGreeting: "Pull up a chair — what's worth talking through?",
    ambience: {
      src: COFFEE_HOUSE_AMBIENCE_MP3,
      volume: 0.15,
      character: "espresso, quiet conversations, cups",
    },
  },
  "apple-orchard": {
    title: "Apple Orchard™",
    motto: "Growth Happens One Season at a Time.",
    shariGreeting: "Let's slow down for a moment.",
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.12,
      character: "leaves, birds, bees",
    },
  },
  "reading-nook": {
    title: "Reading Nook",
    motto: "Unhurried thought, one page at a time.",
    shariGreeting: "We can settle in here as long as you like.",
    ambience: {
      src: EVENING_HEARTH_AMBIENCE_MP3,
      volume: 0.12,
      character: "fireplace crackle, page turns, soft house wind",
    },
  },
  greenhouse: {
    title: "Greenhouse™",
    motto: "Every thriving business began as a tiny seed of an idea.",
    shariGreeting: "Welcome.",
    invitationAfterArrival: true,
    ambience: {
      src: GREENHOUSE_BIRDS_AMBIENCE_MP3,
      volume: 0.07,
      character: "soft greenhouse hush, birdsong",
    },
  },
  observatory: {
    title: "Observatory™",
    motto: "Discover. Explore. Understand.",
    shariGreeting: "What would you like to understand better?",
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.11,
      character: "quiet study hush, distant night air",
    },
  },
  "grow-observatory": {
    title: "Observatory™",
    motto: "Discover. Explore. Understand.",
    shariGreeting: "What would you like to understand better?",
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.11,
      character: "quiet study hush",
    },
  },
  stables: {
    title: "The Stables™",
    motto: "Confidence Is Built Through Practice.",
    shariGreeting:
      "What would you like to do while we're here?",
    invitationAfterArrival: true,
    ambience: {
      src: EVENING_HEARTH_AMBIENCE_MP3,
      volume: 0.1,
      character: "horses, soft breeze, leather creaks",
    },
  },
  "music-room": {
    title: "Music Room™",
    motto: "Find Your Rhythm.",
    shariGreeting: "What kind of sound would help you think?",
    ambience: {
      src: MUSIC_LOFT_AMBIENCE_MP3,
      volume: 0.14,
      character: "gentle piano",
    },
  },
  "decision-compass": {
    title: "Decision Compass™",
    motto: "Clear Decisions Begin With Clear Thinking.",
    shariGreeting: "What's the choice sitting in front of you?",
    ambience: {
      src: BEDROOM_WINDOW_AMBIENCE_MP3,
      volume: 0.1,
      character: "calm rain, still air",
    },
  },
  "peaceful-places": {
    title: "Peaceful Places™",
    motto: "Restoration Without Leaving Spark.",
    shariGreeting: "What kind of calm would help most right now?",
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.12,
      character: "garden hush, gentle breeze",
    },
  },
  "momentum-builder": {
    title: "Momentum Builder™",
    motto: "One Honest Next Step.",
    shariGreeting:
      "What would you like to do while we're here?",
    invitationAfterArrival: true,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "morning studio calm",
    },
  },
  journal: {
    title: "Journal™",
    motto: "Your Story, Privately Held.",
    shariGreeting: "What's worth capturing while it's fresh?",
    ambience: {
      src: GAZEBO_JOURNAL_AMBIENCE_MP3,
      volume: 0.1,
      character: "gazebo fountain, garden hush",
    },
  },
  "growth-journal": {
    title: "Journal™",
    motto: "Your Story, Privately Held.",
    shariGreeting: "What's worth capturing while it's fresh?",
    ambience: {
      src: GAZEBO_JOURNAL_AMBIENCE_MP3,
      volume: 0.1,
      character: "gazebo fountain, garden hush",
    },
  },
  "growth-profile": {
    title: "Growth Profile™",
    motto: "Capabilities earned through learning and return.",
    shariGreeting: "How are you growing as an entrepreneur?",
    ambience: {
      src: GREENHOUSE_BIRDS_AMBIENCE_MP3,
      volume: 0.07,
      character: "soft greenhouse hush, birdsong",
    },
  },
  "my-estate": {
    title: "My Estate™",
    motto: "Your place in the Spark Estate.",
    shariGreeting: "What would you like to tend to in your estate today?",
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.1,
      character: "estate garden hush, distant birds",
    },
  },
  "evidence-vault": {
    title: "Evidence Vault™",
    motto: "Your story deserves to be remembered.",
    shariGreeting: "Tell me about something good — I'll help you keep it.",
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.1,
      character: "quiet archive hush, soft wood creaks",
    },
  },
  portfolio: {
    title: "Portfolio™",
    motto: "What you've built, thoughtfully kept.",
    shariGreeting: "What would you like to review together?",
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "creative studio calm",
    },
  },
};

const SKIP_ARRIVAL_ROOM_IDS = new Set(["welcome-home", "home"]);

function applyCanonicalAmbience(
  config: EstateArrivalExperienceConfig,
): EstateArrivalExperienceConfig {
  const mediaAmbience = resolveCanonicalPlaceAmbience(config.roomId);
  if (!mediaAmbience) return config;
  return { ...config, ambience: mediaAmbience };
}

export function shouldPlayEstateArrival(roomId: string): boolean {
  return !SKIP_ARRIVAL_ROOM_IDS.has(roomId);
}

/** Resolve arrival copy + ambience for a registry room id or estate entry id. */
export function resolveEstateArrivalExperience(
  roomId: string,
): EstateArrivalExperienceConfig | null {
  if (!shouldPlayEstateArrival(roomId)) return null;

  const direct = ARRIVAL_BY_ROOM[roomId];
  if (direct) {
    return applyCanonicalAmbience({ roomId, ...direct });
  }

  const room = getEstateRoomById(roomId);
  if (!room) return null;

  const alias = room.estateRegistryId
    ? ARRIVAL_BY_ROOM[room.estateRegistryId]
    : undefined;
  if (alias) {
    return applyCanonicalAmbience({
      roomId,
      ...alias,
      title: room.trademark ?? alias.title,
    });
  }

  return applyCanonicalAmbience({
    roomId,
    title: room.trademark ?? room.name,
    motto: room.purpose.split("—")[0]?.trim() ?? room.purpose,
    shariGreeting:
      "What would you like to do while we're here?",
    invitationAfterArrival: true,
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.1,
      character: "estate garden hush",
    },
  });
}

export function estateArrivalShariGreeting(roomId: string): string | null {
  return resolveEstateArrivalExperience(roomId)?.shariGreeting ?? null;
}
