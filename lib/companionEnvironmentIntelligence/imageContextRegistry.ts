import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type { CompanionPresenceTimeOfDay } from "@/lib/companionPresenceLibrary/sceneCatalog";
import { COMPANION_PRESENCE_SCENE_CATALOG } from "@/lib/companionPresenceLibrary/sceneCatalog";

export type ImageEmotionalTone =
  | "warm"
  | "gentle"
  | "celebratory"
  | "recovery"
  | "business"
  | "creative"
  | "winddown";

export type ImageContextEntry = {
  id: string;
  filePath: string;
  timeOfDay: CompanionPresenceTimeOfDay[];
  seasons: WelcomeSeason[];
  emotionalTone: ImageEmotionalTone[];
  useCases: string[];
  avoidCases: string[];
  compositionNotes: string;
  cropNotes: string;
  /** Hero cannot support overlays truthfully — use fallbackImageId instead. */
  compositionInvalid?: boolean;
  fallbackImageId?: string;
};

const WELCOME_CONTEXT: ImageContextEntry[] = [
  {
    id: "welcome-home-background",
    filePath: "backgrounds/welcome-home-background.png",
    timeOfDay: ["morning", "afternoon", "evening", "night"],
    seasons: ["spring", "summer", "autumn", "winter", "holiday"],
    emotionalTone: ["warm", "gentle"],
    useCases: ["first welcome", "quiet presence", "gentle day", "home opening", "estate arrival"],
    avoidCases: ["business focus", "celebration fireworks"],
    compositionNotes:
      "Spark Estate foyer — conservatory center, reception right; dolly toward the heart of the estate.",
    cropNotes: "object-position ~50% 42%; keep conservatory and welcome signage readable.",
  },
  {
    id: "shari-i-am-here-2",
    filePath: "shari-i-am-here-2.png",
    timeOfDay: ["morning", "afternoon"],
    seasons: ["spring", "summer", "autumn", "winter", "holiday"],
    emotionalTone: ["warm", "gentle"],
    useCases: ["first welcome", "quiet presence", "gentle day"],
    avoidCases: ["business focus", "celebration fireworks"],
    compositionNotes: "Landscape room scene — open right side for greeting and chat.",
    cropNotes: "object-position ~14% center; keep Shari left, room right.",
  },
  {
    id: "shari-i-am-here",
    filePath: "shari-i-am-here.png",
    timeOfDay: ["morning", "afternoon"],
    seasons: ["spring", "summer", "autumn", "winter", "holiday"],
    emotionalTone: ["warm", "gentle"],
    useCases: ["living room welcome", "room scene", "quiet presence"],
    avoidCases: ["coffee close-up", "desk-only crops"],
    compositionNotes: "Full living room — Shari left, room and window visible.",
    cropNotes: "object-fit contain, left anchor; room must read as space not portrait.",
  },
  {
    id: "shari-coffee-cup",
    filePath: "shari-coffee-cup.png",
    timeOfDay: ["morning", "afternoon"],
    seasons: ["autumn", "winter", "holiday"],
    emotionalTone: ["warm", "gentle"],
    useCases: ["morning hospitality", "coffee waiting"],
    avoidCases: ["late night wind-down"],
    compositionNotes: "Coffee-forward warmth — pairs with steam motion.",
    cropNotes: "Center-left; leave lower center clear for chat input.",
  },
  {
    id: "shari-evening-winddown",
    filePath: "shari-evening-winddown.png",
    timeOfDay: ["evening", "night"],
    seasons: ["autumn", "winter"],
    emotionalTone: ["gentle", "winddown", "recovery"],
    useCases: ["evening", "recovery", "low energy"],
    avoidCases: ["morning energy", "celebration"],
    compositionNotes: "Lamplight and softness — evening Iowa sky.",
    cropNotes: "Warm lamp side visible; chat sits bottom center.",
  },
];

function inferTones(tags: string[]): ImageEmotionalTone[] {
  const tones: ImageEmotionalTone[] = [];
  if (tags.includes("gentle") || tags.includes("recovery")) tones.push("gentle");
  if (tags.includes("welcome")) tones.push("warm");
  if (tags.includes("celebration")) tones.push("celebratory");
  if (tags.includes("business")) tones.push("business");
  if (tags.includes("creative")) tones.push("creative");
  if (tags.includes("winddown") || tags.includes("evening")) tones.push("winddown");
  return tones.length > 0 ? tones : ["warm"];
}

function inferSeasons(tags: string[]): WelcomeSeason[] {
  if (tags.includes("celebration")) return ["holiday", "summer", "autumn"];
  if (tags.includes("recovery")) return ["autumn", "winter", "spring"];
  return ["spring", "summer", "autumn", "winter", "holiday"];
}

/** Image Context Registry — honest selection metadata for approved scenes. */
export const IMAGE_CONTEXT_REGISTRY: ImageContextEntry[] =
  COMPANION_PRESENCE_SCENE_CATALOG.map((entry) => {
    const rich = WELCOME_CONTEXT.find((item) => item.id === entry.id);
    if (rich) return rich;
    return {
      id: entry.id,
      filePath: entry.relativePath.split("/").pop() ?? entry.id,
      timeOfDay: entry.timeOfDay ?? ["morning", "afternoon", "evening"],
      seasons: inferSeasons(entry.tags),
      emotionalTone: inferTones(entry.tags),
      useCases: entry.tags.slice(0, 3),
      avoidCases: [],
      compositionNotes: entry.label,
      cropNotes: "Default gallery crop — Shari still, room breathes in overlays.",
    };
  });

export function imageContextById(id: string): ImageContextEntry | undefined {
  return IMAGE_CONTEXT_REGISTRY.find((entry) => entry.id === id);
}
