import type { CompanionPresenceSurface } from "@/lib/companionPresence/types";
import { SHARI_GALLERY_SUBDIR } from "@/lib/shariPhotoManifest";

export type CompanionPresenceSceneTag =
  | "welcome"
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "celebration"
  | "recovery"
  | "gentle"
  | "teaching"
  | "business"
  | "creative"
  | "planning"
  | "winddown"
  | "family";

export type CompanionPresenceTimeOfDay =
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export type CompanionPresenceLibraryEntry = {
  id: string;
  label: string;
  relativePath: string;
  surfaces?: CompanionPresenceSurface[];
  tags: CompanionPresenceSceneTag[];
  timeOfDay?: CompanionPresenceTimeOfDay[];
  /** Primary welcome hero — landscape room scenes. */
  welcomeHero?: boolean;
};

function scene(
  file: string,
  label: string,
  tags: CompanionPresenceSceneTag[],
  extra?: Partial<CompanionPresenceLibraryEntry>,
): CompanionPresenceLibraryEntry {
  const id = file.replace(/\.(png|jpe?g|webp)$/i, "");
  return {
    id,
    label,
    relativePath: `${SHARI_GALLERY_SUBDIR}/${file}`,
    tags,
    ...extra,
  };
}

/**
 * Approved Companion Presence™ library — add files here only; no code changes elsewhere.
 */
export const COMPANION_PRESENCE_SCENE_CATALOG: CompanionPresenceLibraryEntry[] = [
  scene("shari-i-am-here-2.png", "I Am Here", ["welcome", "gentle", "morning", "afternoon"], {
    surfaces: ["chat-welcome"],
    timeOfDay: ["morning", "afternoon", "evening"],
    welcomeHero: true,
  }),
  scene("shari-coffee-cup.png", "Coffee Together", ["welcome", "morning", "gentle"], {
    surfaces: ["chat-welcome"],
    timeOfDay: ["morning", "afternoon"],
    welcomeHero: true,
  }),
  scene("shari-evening-winddown.png", "Evening Wind-Down", ["evening", "winddown", "gentle", "recovery"], {
    surfaces: ["chat-welcome"],
    timeOfDay: ["evening", "night"],
    welcomeHero: true,
  }),
  scene("shari-friendly-deskshot.png", "At the Desk", ["business", "planning", "morning", "afternoon"], {
    surfaces: ["chat-welcome"],
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-sitting-at-desk.png", "Working Together", ["business", "planning", "teaching"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-sitting.png", "Sitting With You", ["gentle", "welcome", "recovery"], {
    timeOfDay: ["morning", "afternoon", "evening"],
  }),
  scene("shari-hand-on-heart.png", "Hand on Heart", ["recovery", "gentle", "celebration"], {
    timeOfDay: ["morning", "afternoon", "evening", "night"],
  }),
  scene("shari-open-arms.png", "Open Arms", ["welcome", "celebration", "gentle"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-reaching-out (1).png", "Reaching Out", ["welcome", "gentle", "recovery"], {
    timeOfDay: ["morning", "afternoon", "evening"],
  }),
  scene("shari-warm-headshot.png", "Warm Headshot", ["welcome", "gentle", "morning"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-headshot.png", "Headshot", ["welcome", "business"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-thinking.png", "Thinking", ["planning", "business", "creative"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-whiteboard.png", "At the Whiteboard", ["teaching", "business", "creative"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-celebrating-fireworks.png", "Celebrating", ["celebration"], {
    timeOfDay: ["evening", "night"],
  }),
  scene("shari-clapping.png", "Clapping", ["celebration"], {
    timeOfDay: ["afternoon", "evening"],
  }),
  scene("shari-thumbs-up-casual.png", "Thumbs Up", ["celebration", "gentle"], {
    timeOfDay: ["afternoon"],
  }),
  scene("shari-standing-pointing.png", "Pointing", ["teaching", "business"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-standing-arms-crossed.png", "Listening", ["business", "planning"], {
    timeOfDay: ["afternoon"],
  }),
  scene("shari-standing-arms-down.png", "Standing", ["welcome", "gentle"], {
    timeOfDay: ["morning", "afternoon"],
  }),
  scene("shari-standing-hair-up.png", "Ready", ["business", "creative", "morning"], {
    timeOfDay: ["morning"],
  }),
  scene("shari-standng-casual.png", "Casual", ["gentle", "welcome"], {
    timeOfDay: ["afternoon", "evening"],
  }),
  scene("shari-phone.png", "On the Phone", ["business", "afternoon"], {
    timeOfDay: ["afternoon"],
  }),
  scene("shari-desk-frustrated.png", "Hard Moment", ["recovery", "gentle"], {
    timeOfDay: ["afternoon", "evening"],
  }),
  scene("shari-ovewhelemed.png", "Overwhelmed", ["recovery", "gentle"], {
    timeOfDay: ["afternoon", "evening", "night"],
  }),
  scene("shari-doubtful.png", "Uncertain", ["recovery", "gentle"], {
    timeOfDay: ["afternoon", "evening"],
  }),
  scene("shari-confused.png", "Confused", ["recovery", "gentle"], {
    timeOfDay: ["afternoon"],
  }),
  scene("shari-fear-of-visibility.png", "Visibility", ["recovery", "gentle", "creative"], {
    timeOfDay: ["afternoon", "evening"],
  }),
];

export const COMPANION_PRESENCE_WELCOME_IMAGE_ID = "shari-i-am-here-2";

export function companionPresenceEntryById(
  id: string,
): CompanionPresenceLibraryEntry | undefined {
  return COMPANION_PRESENCE_SCENE_CATALOG.find((entry) => entry.id === id);
}
