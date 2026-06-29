import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";
import {
  BEDROOM_WINDOW_AMBIENCE_MP3,
  BRIGHT_STUDIO_AMBIENCE_MP3,
  EAST_TERRACE_AMBIENCE_MP3,
  EVENING_HEARTH_AMBIENCE_MP3,
  HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";
import { BEDROOM_WINDOW_IMAGE } from "./bedroomWindowPeacefulPlace";
import { BRIGHT_STUDIO_IMAGE } from "./brightStudioPeacefulPlace";
import { EAST_TERRACE_IMAGE } from "./eastTerracePeacefulPlace";
import { EVENING_HEARTH_IMAGE } from "./eveningHearthPeacefulPlace";
import { gardenBannerMenuFor } from "./gardenBannerMenu";
import { PEACEFUL_PLACES_PATHWAY_BG } from "./pathway";
import type { EstateSignId } from "./signpostLayout";
import { SUMMER_STORM_COVERED_DECK_BG } from "./summerStormCoveredDeck";

/** Luxury invitation card — full-bleed image, copy, soft hover preview. */
export type GardenDestinationCard = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageObjectPosition?: string;
  /** Internal art brief for future bespoke photography. */
  imagePrompt?: string;
  hoverAmbienceUrl?: string;
};

const MUSIC_ROOM_IMAGE =
  "/backgrounds/peaceful-places/music-room-peaceful-places.png" as const;
const PLAN_MY_DAY_IMAGE = "/backgrounds/plan-my-day-background.webp" as const;
const GALLERY_IMAGE = "/backgrounds/gallery-background.webp" as const;
const LIFE_EXPERIENCE_IMAGE = "/backgrounds/life-experience-room.webp" as const;
const FOCUS_PLANNING_IMAGE =
  "/backgrounds/focus-my-brain-games-background.webp" as const;
const WOODLAND_IMAGE = "/backgrounds/peaceful-places/woodland-pathway.png" as const;
const MOONLIT_SHORE_IMAGE = "/backgrounds/evening/night-bg.png" as const;
const GAZEBO_IMAGE = "/backgrounds/evening/living-room-at-twilight-bg.png" as const;
const WILDFLOWER_MEADOW_IMAGE =
  "/backgrounds/momentum-games/momentum-mental-vacation.png" as const;

export const GARDEN_DESTINATION_CARDS: Record<string, GardenDestinationCard> = {
  "first-step-finder": {
    id: "first-step-finder",
    title: "First Step Finder",
    description: "Find the next small step when everything feels overwhelming.",
    imageUrl: CLEAR_MY_MIND_CONSERVATORY_BG,
    imageObjectPosition: "center 42%",
    imagePrompt:
      "Warm greenhouse writing table, open leather notebook, fountain pen, morning sunlight, surrounding plants.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  "priority-sort": {
    id: "priority-sort",
    title: "Priority Sort",
    description: "Separate what feels urgent from what truly matters.",
    imageUrl: PLAN_MY_DAY_IMAGE,
    imageObjectPosition: "center 38%",
    imagePrompt:
      "Reclaimed wood table with three linen trays labeled Now, Next, Later; greenhouse morning light.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  "break-it-down": {
    id: "break-it-down",
    title: "Break It Down",
    description: "Turn a large project into manageable pieces.",
    imageUrl: FOCUS_PLANNING_IMAGE,
    imageObjectPosition: "center 40%",
    imagePrompt:
      "Handcrafted planning board with sticky notes, sketches, project cards, gentle afternoon greenhouse light.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  "music-room": {
    id: "music-room",
    title: "Music Room",
    description: "Choose soundscapes that help you focus deeply.",
    imageUrl: MUSIC_ROOM_IMAGE,
    imageObjectPosition: "center center",
    imagePrompt:
      "Cozy listening room with vintage speakers, comfortable chair, vinyl records, headphones, warm ambient light.",
    hoverAmbienceUrl: MUSIC_LOFT_AMBIENCE_MP3,
  },
  "pause-reset": {
    id: "pause-reset",
    title: "Pause & Reset",
    description: "Take a quiet breath before moving forward.",
    imageUrl: GAZEBO_IMAGE,
    imageObjectPosition: "center 55%",
    imagePrompt:
      "English garden gazebo, linen curtains, climbing roses, lavender, hydrangeas, tea table, soft afternoon sun.",
    hoverAmbienceUrl: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  },
  "breathing-room": {
    id: "breathing-room",
    title: "Breathing Room",
    description: "Slow your breathing and calm your nervous system.",
    imageUrl: LIFE_EXPERIENCE_IMAGE,
    imageObjectPosition: "center 45%",
    imagePrompt:
      "Peaceful wooden deck overlooking a quiet meadow with flowing grasses and morning mist.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  "quiet-moment": {
    id: "quiet-moment",
    title: "Quiet Moment",
    description: "Sit quietly for a few peaceful minutes.",
    imageUrl: SUMMER_STORM_COVERED_DECK_BG,
    imageObjectPosition: "center 50%",
    imagePrompt:
      "Shaded garden bench beneath flowering trees beside a small bubbling fountain.",
    hoverAmbienceUrl: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  },
  "nature-escape": {
    id: "nature-escape",
    title: "Nature Escape",
    description: "Step outside and refill your energy.",
    imageUrl: WILDFLOWER_MEADOW_IMAGE,
    imageObjectPosition: "center center",
    imagePrompt:
      "Sunny wildflower meadow with butterflies, tall grasses, gentle rolling hills.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  "sunshine-break": {
    id: "sunshine-break",
    title: "Sunshine Break",
    description: "Recharge with light, warmth and fresh air.",
    imageUrl: EAST_TERRACE_IMAGE,
    imageObjectPosition: "center 42%",
    imagePrompt:
      "Bright cottage terrace with comfortable seating, flowering pots, warm sunshine.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  "energy-reset": {
    id: "energy-reset",
    title: "Energy Reset",
    description: "Restore your energy before returning to your day.",
    imageUrl: BRIGHT_STUDIO_IMAGE,
    imageObjectPosition: "center 48%",
    imagePrompt:
      "Botanical garden path leading toward sunlight with fresh flowers and gentle movement.",
    hoverAmbienceUrl: BRIGHT_STUDIO_AMBIENCE_MP3,
  },
  "bedroom-window": {
    id: "bedroom-window",
    title: "Bedroom Window",
    description: "Slow the day down and prepare for rest.",
    imageUrl: BEDROOM_WINDOW_IMAGE,
    imageObjectPosition: "center center",
    imagePrompt: "Cozy bedroom window scene at dusk.",
    hoverAmbienceUrl: BEDROOM_WINDOW_AMBIENCE_MP3,
  },
  "evening-hearth": {
    id: "evening-hearth",
    title: "Evening Hearth",
    description: "End your day beside the fire.",
    imageUrl: EVENING_HEARTH_IMAGE,
    imageObjectPosition: "center center",
    imagePrompt: "Warm fireplace with comfortable chairs and glowing lamps.",
    hoverAmbienceUrl: EVENING_HEARTH_AMBIENCE_MP3,
  },
  "woodland-path": {
    id: "woodland-path",
    title: "Woodland Path",
    description: "Leave the day's worries behind.",
    imageUrl: WOODLAND_IMAGE,
    imageObjectPosition: "center 55%",
    imagePrompt: "Peaceful forest trail through tall trees with golden evening light.",
    hoverAmbienceUrl: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  },
  "moonlit-shore": {
    id: "moonlit-shore",
    title: "Moonlit Shore",
    description: "Finish the day in peaceful stillness.",
    imageUrl: MOONLIT_SHORE_IMAGE,
    imageObjectPosition: "center 60%",
    imagePrompt: "Quiet beach beneath moonlight with gentle waves.",
    hoverAmbienceUrl: BEDROOM_WINDOW_AMBIENCE_MP3,
  },
  saved: {
    id: "saved",
    title: "My Peaceful Places",
    description: "Return to the places that bring you peace.",
    imageUrl: GALLERY_IMAGE,
    imageObjectPosition: "center 35%",
    imagePrompt: "Memory wall with photographs of saved peaceful places.",
    hoverAmbienceUrl: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  },
  add: {
    id: "add",
    title: "Add a New Place",
    description: "Save a place that helps you feel grounded.",
    imageUrl: PEACEFUL_PLACES_PATHWAY_BG,
    imageObjectPosition: "center 45%",
    imagePrompt:
      "Open leather travel journal beside a camera and pressed flowers overlooking a landscape.",
    hoverAmbienceUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  manage: {
    id: "manage",
    title: "Manage My Places",
    description: "Organize and revisit your personal sanctuary collection.",
    imageUrl: GALLERY_IMAGE,
    imageObjectPosition: "72% 42%",
    imagePrompt:
      "Elegant oak cabinet with labeled keepsake boxes, journals, and framed photographs.",
    hoverAmbienceUrl: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  },
} as const;

export function gardenDestinationCardFor(
  menuItemId: string,
): GardenDestinationCard | null {
  return GARDEN_DESTINATION_CARDS[menuItemId] ?? null;
}

export function gardenDestinationCardsForSign(
  signId: EstateSignId,
): GardenDestinationCard[] {
  return gardenBannerMenuFor(signId).flatMap((item) => {
    const card = gardenDestinationCardFor(item.id);
    if (!card) return [];
    return [
      {
        ...card,
        title: item.label,
      },
    ];
  });
}
