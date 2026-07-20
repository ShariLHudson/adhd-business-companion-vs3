import type {
  ProjectHomeArtwork,
  ProjectHomeRecommendation,
  ProjectHomeRecord,
  ProjectHomeRoomDefinition,
  ProjectHomeRoomId,
} from "./types";

/**
 * Permanent Projects room plate (gallery / arrive).
 * Individual Project Homes still keep their own room artwork when opened.
 */
export const PROJECT_HOMES_ROOM_BACKGROUND =
  "/backgrounds/project-room.png" as const;

/**
 * Project Homes available for projects.
 * Artwork paths point at existing `public/backgrounds/` plates only.
 * Strategy Conference Room uses an isolated placeholder until dedicated art ships.
 */
export const PROJECT_HOME_ROOMS: readonly ProjectHomeRoomDefinition[] = [
  {
    id: "writing-room",
    name: "Writing Room",
    placeId: "writing-room",
    description:
      "Books, newsletters, blogs, courses, scripts, and long-form writing.",
    recommendVoice:
      "it focuses on long-form writing and content creation",
    recommendWhen: [
      "write",
      "draft",
      "book",
      "chapter",
      "blog",
      "newsletter",
      "copy",
      "script",
      "course",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/writing-room-background.png",
      source: "estate-room",
    },
  },
  {
    id: "art-studio",
    name: "Art Studio",
    placeId: "art-studio",
    description:
      "Creative products, journals, design, branding, crafts, visual ideas.",
    recommendVoice:
      "it is made for creative products, design, and visual ideas",
    recommendWhen: [
      "art",
      "design",
      "image",
      "logo",
      "visual",
      "brand",
      "mood",
      "graphic",
      "craft",
      "journal",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/art-studio-background.png",
      source: "estate-room",
    },
  },
  {
    id: "social-studio",
    name: "Social Studio",
    /** Aligns with Create Studio — Social Post lives under creative-studio in the Estate Registry */
    placeId: "creative-studio",
    description:
      "Content calendars, posts, campaigns, captions, and social presence.",
    recommendVoice:
      "it is a calm studio for content calendars, posts, and social campaigns",
    recommendWhen: [
      "social media",
      "social post",
      "content calendar",
      "instagram",
      "facebook",
      "linkedin",
      "tiktok",
      "twitter",
      "threads",
      "reel",
      "carousel",
      "caption",
      "hashtag",
      "campaign",
      "social",
    ],
    artwork: {
      // Reuses Create Studio plate (creative-studio → art-studio-background.png in estatePlaceMedia)
      backgroundUrl: "/backgrounds/art-studio-background.png",
      source: "placeholder",
      isPlaceholder: true,
      placeholderNote:
        "Reuses Create Studio / Art Studio plate until dedicated Social Studio artwork exists",
      dedicatedArtworkPath: "/backgrounds/social-studio-background.png",
    },
  },
  {
    id: "strategy-conference",
    name: "Strategy Conference Room",
    placeId: "strategy-studio",
    description:
      "Business planning, launches, systems, strategic initiatives, growth.",
    recommendVoice:
      "it supports business planning, launches, and strategic growth",
    recommendWhen: [
      "strategy",
      "offer",
      "roadmap",
      "position",
      "plan",
      "pricing",
      "business model",
      "launch",
      "systems",
      "growth",
    ],
    artwork: {
      // PLACEHOLDER — isolated for later replacement with dedicated Strategy Conference artwork
      backgroundUrl: "/backgrounds/creative-studio-background.png",
      source: "placeholder",
      isPlaceholder: true,
      placeholderNote:
        "Temporary creative-studio plate until strategy-conference artwork exists",
      dedicatedArtworkPath: "/backgrounds/strategy-conference-room-background.png",
    },
  },
  {
    id: "study-hall",
    name: "Study Hall",
    placeId: "study-hall",
    description:
      "Learning, certifications, research, note-taking, skill development.",
    recommendVoice:
      "it is a calm place for learning, research, and skill development",
    recommendWhen: [
      "learn",
      "study",
      "research",
      "certification",
      "workshop",
      "curriculum",
      "skill",
      "notes",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/study-hall-background.png",
      source: "estate-room",
    },
  },
  {
    id: "estate-library",
    name: "Estate Library",
    placeId: "library",
    description:
      "Reference material, documentation, knowledge collections.",
    recommendVoice:
      "it holds reference material, documentation, and lasting knowledge",
    recommendWhen: [
      "library",
      "knowledge",
      "archive",
      "reference",
      "resource",
      "documentation",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/room-library-estate-background.png",
      source: "estate-room",
    },
  },
  {
    id: "gallery",
    name: "Gallery",
    placeId: "gallery-of-firsts",
    description: "Presentations, portfolios, showcases, finished work.",
    recommendVoice:
      "it is where finished work, portfolios, and showcases belong",
    recommendWhen: [
      "gallery",
      "portfolio",
      "showcase",
      "exhibit",
      "presentation",
      "launch collection",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/gallery-background.png",
      source: "estate-room",
    },
  },
  {
    id: "music-room",
    name: "Music Room",
    placeId: "music-room",
    description: "Podcasts, music, audio production, voice projects.",
    recommendVoice:
      "it is made for podcasts, music, and audio production",
    recommendWhen: [
      "music",
      "podcast",
      "audio",
      "voice",
      "sound",
      "song",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/music-room-background.png",
      source: "estate-room",
    },
  },
  {
    id: "kitchen",
    name: "Kitchen",
    placeId: "estate-kitchen",
    description: "Recipes, meal planning, food businesses.",
    recommendVoice:
      "it fits recipes, meal planning, and food-centered work",
    recommendWhen: [
      "recipe",
      "food",
      "kitchen",
      "cook",
      "meal",
      "hospitality menu",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/kitchen-background.png",
      source: "estate-room",
    },
  },
  {
    id: "sunroom",
    name: "Sunroom",
    placeId: "sunroom",
    description: "Health, wellness, habits, personal growth.",
    recommendVoice:
      "it supports health, wellness, habits, and personal growth",
    recommendWhen: [
      "health",
      "wellness",
      "habit",
      "gentle",
      "restore",
      "growth",
      "soft",
      "begin",
      "ease",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/sunroom-background.png",
      source: "estate-room",
    },
  },
  {
    id: "boardroom",
    name: "Boardroom",
    placeId: "round-table",
    description:
      "Major decisions, executive initiatives, complex planning.",
    recommendVoice:
      "it is where major decisions and complex planning can settle",
    recommendWhen: [
      "decide",
      "decision",
      "board",
      "council",
      "trade-off",
      "stakeholder",
      "executive",
    ],
    artwork: {
      backgroundUrl: "/backgrounds/round-table-boardroom-background.png",
      source: "estate-room",
    },
  },
] as const;

const ROOM_BY_ID = new Map(PROJECT_HOME_ROOMS.map((r) => [r.id, r]));

export function getProjectHomeRoom(
  id: ProjectHomeRoomId,
): ProjectHomeRoomDefinition {
  return ROOM_BY_ID.get(id) ?? PROJECT_HOME_ROOMS[0]!;
}

export function listProjectHomeRooms(): ProjectHomeRoomDefinition[] {
  return [...PROJECT_HOME_ROOMS];
}

/** Resolve display artwork — record override, else room default. */
export function resolveProjectHomeArtwork(
  project: Pick<ProjectHomeRecord, "projectHomeId" | "artworkOverride">,
): ProjectHomeArtwork {
  if (project.artworkOverride?.backgroundUrl) {
    return project.artworkOverride;
  }
  return getProjectHomeRoom(project.projectHomeId).artwork;
}

export function getProjectHomeBackgroundUrl(
  project: Pick<ProjectHomeRecord, "projectHomeId" | "artworkOverride">,
): string {
  return resolveProjectHomeArtwork(project).backgroundUrl;
}

/** Recommend a Project Home from the member's purpose statement. */
export function recommendProjectHome(
  purpose: string,
): ProjectHomeRecommendation {
  const text = purpose.trim().toLowerCase();
  if (!text) {
    const room = getProjectHomeRoom("sunroom");
    return {
      roomId: "sunroom",
      reason: `I think the ${room.name} would be a wonderful Project Home for this project because ${room.recommendVoice}.`,
    };
  }

  let best: ProjectHomeRoomDefinition = PROJECT_HOME_ROOMS[0]!;
  let bestScore = 0;

  for (const room of PROJECT_HOME_ROOMS) {
    let score = 0;
    for (const keyword of room.recommendWhen) {
      if (text.includes(keyword)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = room;
    }
  }

  if (bestScore === 0) {
    const room = getProjectHomeRoom("study-hall");
    return {
      roomId: "study-hall",
      reason: `I think the ${room.name} would be a wonderful Project Home for this project because ${room.recommendVoice}.`,
    };
  }

  return {
    roomId: best.id,
    reason: `I think the ${best.name} would be a wonderful Project Home for this project because ${best.recommendVoice}.`,
  };
}
