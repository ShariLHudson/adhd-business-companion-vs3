/**
 * Estate Arrival Experience — room identity, motto, Shari greeting, ambience.
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

const CHAMBER_ARRIVAL = {
  title: "Chamber of Momentum",
  motto: "Let's find what will help you move forward today.",
  shariGreeting: "What would help you move forward today?",
  invitationAfterArrival: true,
} as const;

const ARRIVAL_BY_ROOM: Record<string, Omit<EstateArrivalExperienceConfig, "roomId">> = {
  "chamber-of-momentum": {
    ...CHAMBER_ARRIVAL,
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.14,
      character: "soft library ambience, page turns, quiet footsteps",
    },
  },
  "focus-studio": {
    title: "Visual Thinking Studio",
    motto: "See information in the clearest way for you.",
    shariGreeting:
      "Welcome to Visual Thinking Studio — tell me what you'd like to understand, research, or create, and we can begin.",
    invitationAfterArrival: false,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "soft studio hush, pencil on paper",
    },
  },
  "cartographers-studio": {
    title: "Visual Thinking Studio",
    motto: "See information in the clearest way for you.",
    shariGreeting:
      "Welcome to Visual Thinking Studio — tell me what you'd like to understand, research, or create, and we can begin.",
    invitationAfterArrival: false,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "soft studio hush, pencil on paper",
    },
  },
  "momentum-institute": {
    ...CHAMBER_ARRIVAL,
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.14,
      character: "soft library ambience, page turns, quiet footsteps",
    },
  },
  library: {
    title: "The Library",
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
    title: "Creative Studio",
    motto: "Where Ideas Become Reality.",
    shariGreeting: "What would you like to create together?",
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.12,
      character: "soft instrumental music, pencil sounds, paper",
    },
  },
  conservatory: {
    title: "The Conservatory",
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
    title: "Clear My Mind",
    motto:
      "This is a place to get everything out of your head. Nothing needs to be organized yet.",
    shariGreeting:
      "Add thoughts, tasks, reminders, and worries exactly as they come to you. We can sort later.",
    invitationAfterArrival: false,
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.13,
      character: "birds, water, wind",
    },
  },
  "plan-my-day": {
    title: "Plan My Day",
    motto:
      "Today is not about doing everything. It is about choosing what matters most.",
    shariGreeting:
      "We can build today's plan, or adapt the one you already have, based on your time, energy, and motivation.",
    invitationAfterArrival: false,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "soft morning desk calm",
    },
  },
  "business-estate": {
    title: "Business Estate",
    motto:
      "Spark can help you immediately. Everything here is optional.",
    shariGreeting:
      "Each detail you add helps me support your business more personally. Start with whatever feels useful right now.",
    invitationAfterArrival: false,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "quiet business study",
    },
  },
  "my-business-estate": {
    title: "Business Estate",
    motto:
      "Spark can help you immediately. Everything here is optional.",
    shariGreeting:
      "Each detail you add helps me support your business more personally. Start with whatever feels useful right now.",
    invitationAfterArrival: false,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "quiet business study",
    },
  },
  "coffee-house": {
    title: "Coffee House",
    motto: "Great Conversations Change Businesses.",
    shariGreeting: "Pull up a chair — what's worth talking through?",
    ambience: {
      src: COFFEE_HOUSE_AMBIENCE_MP3,
      volume: 0.15,
      character: "espresso, quiet conversations, cups",
    },
  },
  "apple-orchard": {
    title: "Apple Orchard",
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
    title: "Greenhouse",
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
    title: "Observatory",
    motto: "Discover. Explore. Understand.",
    shariGreeting: "What would you like to understand better?",
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.11,
      character: "quiet study hush, distant night air",
    },
  },
  "grow-observatory": {
    title: "Observatory",
    motto: "Discover. Explore. Understand.",
    shariGreeting: "What would you like to understand better?",
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.11,
      character: "quiet study hush",
    },
  },
  stables: {
    title: "The Stables",
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
    title: "Music Room",
    motto: "Find Your Rhythm.",
    shariGreeting: "What kind of sound would help you think?",
    ambience: {
      src: MUSIC_LOFT_AMBIENCE_MP3,
      volume: 0.14,
      character: "gentle piano",
    },
  },
  "decision-compass": {
    title: "Decision Compass",
    motto: "Clear Decisions Begin With Clear Thinking.",
    shariGreeting: "What's the choice sitting in front of you?",
    ambience: {
      src: BEDROOM_WINDOW_AMBIENCE_MP3,
      volume: 0.1,
      character: "calm rain, still air",
    },
  },
  "peaceful-places": {
    title: "Peaceful Places",
    motto: "Restoration Without Leaving Spark.",
    shariGreeting: "What kind of calm would help most right now?",
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.12,
      character: "garden hush, gentle breeze",
    },
  },
  "momentum-builder": {
    ...CHAMBER_ARRIVAL,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "morning studio calm",
    },
  },
  "goals-projects": {
    ...CHAMBER_ARRIVAL,
    ambience: {
      src: BRIGHT_STUDIO_AMBIENCE_MP3,
      volume: 0.1,
      character: "focused planning studio",
    },
  },
  journal: {
    title: "Journal",
    motto: "Your Story, Privately Held.",
    shariGreeting: "What's worth capturing while it's fresh?",
    ambience: {
      src: GAZEBO_JOURNAL_AMBIENCE_MP3,
      volume: 0.1,
      character: "gazebo fountain, garden hush",
    },
  },
  "growth-journal": {
    title: "Journal",
    motto: "Your Story, Privately Held.",
    shariGreeting: "What's worth capturing while it's fresh?",
    ambience: {
      src: GAZEBO_JOURNAL_AMBIENCE_MP3,
      volume: 0.1,
      character: "gazebo fountain, garden hush",
    },
  },
  "growth-profile": {
    title: "Growth Profile",
    motto: "Capabilities earned through learning and return.",
    shariGreeting: "How are you growing as an entrepreneur?",
    ambience: {
      src: GREENHOUSE_BIRDS_AMBIENCE_MP3,
      volume: 0.07,
      character: "soft greenhouse hush, birdsong",
    },
  },
  "my-estate": {
    title: "My Estate",
    motto: "Your place in the Spark Estate.",
    shariGreeting: "What would you like to tend to in your estate today?",
    ambience: {
      src: EAST_TERRACE_AMBIENCE_MP3,
      volume: 0.1,
      character: "estate garden hush, distant birds",
    },
  },
  "evidence-vault": {
    title: "Evidence Vault",
    motto:
      "A private place to keep meaningful discoveries about yourself, your work, and the difference you make.",
    shariGreeting:
      "Your key opens a quiet place for discoveries you do not want to forget. When you are ready, we can begin.",
    invitationAfterArrival: false,
    ambience: {
      src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
      volume: 0.1,
      character: "quiet archive hush, soft wood creaks",
    },
  },
  portfolio: {
    title: "Hall of Accomplishments",
    motto: "Look what you've accomplished.",
    shariGreeting: "What milestone would you like to celebrate together?",
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
