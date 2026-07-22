/**
 * Spark Estate — top navigation and profile menu.
 *
 * Welcome Home (room menu) = where to go (five categories; Estate last).
 * SH profile menu = My Spark Estate + Experience Controls + Settings.
 * Experience Controls open as an overlay — never navigate away.
 *
 * @see lib/estate/welcomeHomeNavigationStructure.ts
 */

import {
  ESTATE_MENU_DROPDOWN_ENTRIES,
  ESTATE_MENU_DROPDOWN_ITEMS,
  type EstateMenuActionId,
  type EstateMenuDropdownGroup,
} from "@/lib/estateMenu";
import { getPlaceById } from "@/lib/estate/manifest/estatePlaceMasterManifest";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  PEACEFUL_PLACES_MUSIC_TRACKS,
} from "@/lib/soundscapes/experienceSoundscapesMenu";
import {
  getWanderableManifestPlaces,
  resolveWanderRoomDisplayName,
  validateWanderPick,
  type EstateWanderPick,
} from "@/lib/estate/manifest/estateWanderMode";
import {
  WELCOME_HOME_MY_STORY_DESTINATION_IDS,
  WELCOME_HOME_NAV_CATEGORIES,
  welcomeHomeFlattenCategoryDestinations,
} from "@/lib/estate/welcomeHomeNavigationStructure";

export const SPARK_ESTATE_TOP_NAVIGATION_PRINCIPLE =
  "Only two permanent top-right controls — Welcome Home navigation and User Profile — no additional standalone navigation buttons.";

export const SPARK_ESTATE_TOP_NAVIGATION_GOAL =
  "Welcome Home: Where do I want to go? Initials: How should the platform look, sound, or behave — plus profile and settings.";

export const SPARK_ESTATE_TOP_NAVIGATION_CONTROLS = [
  {
    id: "room",
    label: "Welcome Home",
    purpose: "Global estate navigation between major areas",
    question: "Where do I want to go?",
  },
  {
    id: "profile",
    label: "User Initials",
    purpose: "Profile, Experience Controls, settings, and account",
    question: "How do I want the platform to look, sound, or behave?",
  },
] as const;

/** Experience Controls live under SH — documented here for the profile overlay. */
export const SPARK_ESTATE_EXPERIENCE_CONTROL_ITEMS = [
  { id: "conversation-visibility", label: "Show or Hide Conversation" },
  { id: "estate-sounds", label: "Estate Sounds" },
  { id: "shari-voice", label: "Shari Voice" },
  { id: "volume", label: "Volume" },
  { id: "estate-background", label: "Estate Background" },
  { id: "fullscreen", label: "Full Screen" },
  { id: "text-size", label: "Text Size" },
  { id: "reduce-motion", label: "Reduce Motion" },
  { id: "notifications", label: "Notifications" },
] as const;

/** @deprecated Experience Controls removed from Welcome Home. */
export const SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS = [] as const;

/** @deprecated Wander lives under Spark Estate category — no separate nav strip. */
export const SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS = [] as const;

export const SPARK_ESTATE_ROOM_MENU_MY_DAY_WORK_ITEMS =
  WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day")!.destinations;

export const SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS =
  WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-work")!.destinations;

/** Create submenu removed — no third-level flyouts. */
export const SPARK_ESTATE_ROOM_MENU_CREATE_SUBMENU_ITEMS = [] as const;

const REFLECT_FLAT = welcomeHomeFlattenCategoryDestinations("take-a-moment");

export const SPARK_ESTATE_ROOM_MENU_FOCUS_ITEMS = REFLECT_FLAT.filter((d) =>
  ["clear-my-mind", "parking-lot", "breathe", "spin-the-wheel"].includes(d.id),
);

/** Journal / Evidence / Hall — under Reflect → Browse more (139). */
export const SPARK_ESTATE_ROOM_MENU_MY_STORY_ITEMS = REFLECT_FLAT.filter((d) =>
  (WELCOME_HOME_MY_STORY_DESTINATION_IDS as readonly string[]).includes(d.id),
);

export const SPARK_ESTATE_ROOM_MENU_KNOWLEDGE_ITEMS =
  WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "get-advice")!.destinations;

export const SPARK_ESTATE_ROOM_MENU_SECTIONS = [
  ...WELCOME_HOME_NAV_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
] as const;

export const SPARK_ESTATE_ROOM_MENU_SPARK_ESTATE_ITEMS =
  WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "spark-estate")!.destinations;

export const SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS = REFLECT_FLAT.filter((d) =>
  ["peaceful-places", "soundscapes"].includes(d.id),
);

export const SPARK_ESTATE_PROFILE_MENU_ITEMS: readonly {
  id: EstateMenuActionId | "conversations" | "my-spark-estate";
  label: string;
}[] = [
  { id: "conversations", label: "Conversations" },
  { id: "my-spark-estate", label: "My Spark Estate" },
  { id: "experience-controls", label: "Experience Controls" },
  { id: "settings", label: "Settings" },
  { id: "log-out", label: "Sign Out" },
];

export const SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS: readonly {
  id: EstateMenuActionId;
  label: string;
}[] = [
  { id: "my-business-estate", label: "My Business Estate" },
  { id: "my-profile", label: "My Profile" },
];

export const SPARK_ESTATE_PROFILE_MENU_CONVERSATION_ITEMS: readonly {
  id: EstateMenuActionId;
  label: string;
}[] = [
  { id: "start-new-conversation", label: "New Chat" },
  { id: "start-new-day-conversation", label: "New Day Chat" },
];

export const SPARK_ESTATE_ROOM_MENU_PEACEFUL_PLACE_MUSIC_ITEMS: readonly {
  id: string;
  label: string;
}[] = PEACEFUL_PLACES_MUSIC_TRACKS.map((track) => ({
  id: track.id,
  label: track.title,
}));

export const SPARK_ESTATE_ROOM_MENU_AMBIENT_SOUNDSCAPE_ITEMS: readonly {
  id: string;
  label: string;
}[] = EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.map((track) => ({
  id: track.id,
  label: track.title,
}));

export const SPARK_ESTATE_NAVIGATION_SEPARATION_RULE =
  "Welcome Home moves between major areas. Local destination navigation moves within a place. SH Experience Controls change appearance, sound, accessibility, or conversation visibility. Do not mix these three purposes.";

export const SPARK_ESTATE_WANDER_MANIFEST_RULE =
  "Choose one manifest place record — load official name, image, route, and metadata together. Never mix names, images, or routes from separate sources.";

export const SPARK_ESTATE_ROOM_MENU_EXCLUSIONS =
  "Experience Controls are not listed under Welcome Home. No third-level flyouts. Peaceful Places and Soundscapes open dedicated experiences.";

export function assessRoomButtonManifestAlignment(roomId: string): {
  roomId: string;
  displayName: string;
  manifestAligned: boolean;
  hasManifestRecord: boolean;
  issues: string[];
} {
  const displayName = resolveWanderRoomDisplayName(roomId);
  const place = getPlaceById(roomId);
  const issues: string[] = [];

  if (!place) {
    issues.push("no manifest record for room");
  } else {
    if (!place.official_name?.trim()) {
      issues.push("manifest missing official_name");
    }
    if (place.official_name && place.official_name !== displayName) {
      issues.push("display name diverges from manifest official_name");
    }
  }

  return {
    roomId,
    displayName,
    manifestAligned: issues.length === 0,
    hasManifestRecord: Boolean(place),
    issues,
  };
}

export function verifySparkEstateTopNavigationAndProfileMenu(): {
  controlCount: number;
  profileMenuAligned: boolean;
  roomExperienceItems: number;
  roomNavigationItems: number;
  roomMyDayWorkItems: number;
  roomMyWorkStudioItems: number;
  roomFocusItems: number;
  roomMyStoryItems: number;
  roomKnowledgeItems: number;
  roomExperiencesItems: number;
  excludesLibraryAndCartography: boolean;
  peacefulPlacesStayInExperiences: boolean;
  welcomeHomeHasFiveCategories: boolean;
  experienceControlsNotInWelcomeHome: boolean;
  wanderManifestRuleReady: boolean;
  separationRuleReady: boolean;
} {
  const topLevelLabels = ESTATE_MENU_DROPDOWN_ENTRIES.map((entry) => entry.label);
  const expectedTopLabels = SPARK_ESTATE_PROFILE_MENU_ITEMS.map((item) => item.label);

  const conversationsGroup = ESTATE_MENU_DROPDOWN_ENTRIES.find(
    (entry): entry is EstateMenuDropdownGroup =>
      entry.kind === "group" && entry.id === "conversations",
  );
  const estateGroup = ESTATE_MENU_DROPDOWN_ENTRIES.find(
    (entry): entry is EstateMenuDropdownGroup =>
      entry.kind === "group" && entry.id === "my-spark-estate",
  );
  const conversationChildren = conversationsGroup?.children ?? [];
  const estateChildren = estateGroup?.children ?? [];

  const profileMenuAligned =
    ESTATE_MENU_DROPDOWN_ENTRIES.length === SPARK_ESTATE_PROFILE_MENU_ITEMS.length &&
    SPARK_ESTATE_PROFILE_MENU_ITEMS.every(
      (item, index) => ESTATE_MENU_DROPDOWN_ENTRIES[index]?.label === item.label,
    ) &&
    topLevelLabels.every((label) => expectedTopLabels.includes(label)) &&
    conversationChildren.length === SPARK_ESTATE_PROFILE_MENU_CONVERSATION_ITEMS.length &&
    SPARK_ESTATE_PROFILE_MENU_CONVERSATION_ITEMS.every(
      (item, index) =>
        conversationChildren[index]?.id === item.id &&
        conversationChildren[index]?.label === item.label,
    ) &&
    estateChildren.length === SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS.length &&
    SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS.every(
      (item, index) =>
        estateChildren[index]?.id === item.id &&
        estateChildren[index]?.label === item.label,
    ) &&
    ESTATE_MENU_DROPDOWN_ITEMS.some((item) => item.id === "experience-controls") &&
    !ESTATE_MENU_DROPDOWN_ITEMS.some(
      (item) =>
        item.id === "growth-profile" ||
        item.id === "evidence-vault" ||
        item.id === "portfolio" ||
        item.id === "journal",
    );

  const navigationIds = SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.map((item) => item.id);
  const experiencesIds = SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS.map((item) => item.id);
  const workStudioIds = SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map(
    (item) => item.id,
  );
  const focusIds = SPARK_ESTATE_ROOM_MENU_FOCUS_ITEMS.map((item) => item.id);

  const wanderPlace = getWanderableManifestPlaces()[0];
  const samplePick: EstateWanderPick | null = wanderPlace
    ? {
        place: wanderPlace,
        legacyPlaceId: wanderPlace.legacy_place_id,
        manifestPlaceId: wanderPlace.place_id,
      }
    : null;

  return {
    controlCount: SPARK_ESTATE_TOP_NAVIGATION_CONTROLS.length,
    profileMenuAligned,
    roomExperienceItems: SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS.length,
    roomNavigationItems: SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.length,
    roomMyDayWorkItems: SPARK_ESTATE_ROOM_MENU_MY_DAY_WORK_ITEMS.length,
    roomMyWorkStudioItems: SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.length,
    roomFocusItems: SPARK_ESTATE_ROOM_MENU_FOCUS_ITEMS.length,
    roomMyStoryItems: SPARK_ESTATE_ROOM_MENU_MY_STORY_ITEMS.length,
    roomKnowledgeItems: SPARK_ESTATE_ROOM_MENU_KNOWLEDGE_ITEMS.length,
    roomExperiencesItems: SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS.length,
    excludesLibraryAndCartography:
      !navigationIds.includes("library" as never) &&
      !SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.some(
        (item) =>
          item.label.toLowerCase().includes("library") ||
          item.label.toLowerCase().includes("cartograph"),
      ) &&
      workStudioIds.includes("cartographers-studio"),
    peacefulPlacesStayInExperiences:
      experiencesIds.includes("peaceful-places") &&
      experiencesIds.includes("soundscapes") &&
      !experiencesIds.includes("breathe" as never) &&
      focusIds.includes("breathe"),
    welcomeHomeHasFiveCategories: WELCOME_HOME_NAV_CATEGORIES.length === 5,
    experienceControlsNotInWelcomeHome: !WELCOME_HOME_NAV_CATEGORIES.some((c) =>
      /experience controls/i.test(c.label),
    ),
    wanderManifestRuleReady: samplePick ? validateWanderPick(samplePick) : false,
    separationRuleReady: Boolean(SPARK_ESTATE_NAVIGATION_SEPARATION_RULE),
  };
}

export function formatSparkEstateTopNavigationReport(
  verification: ReturnType<
    typeof verifySparkEstateTopNavigationAndProfileMenu
  > = verifySparkEstateTopNavigationAndProfileMenu(),
): string {
  const lines: string[] = [
    `Spark Estate top navigation: ${verification.profileMenuAligned ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_TOP_NAVIGATION_PRINCIPLE,
    SPARK_ESTATE_TOP_NAVIGATION_GOAL,
    "",
    "Top-right controls:",
  ];

  for (const control of SPARK_ESTATE_TOP_NAVIGATION_CONTROLS) {
    lines.push(`  ${control.label} — ${control.purpose}`);
  }

  lines.push("", "Welcome Home categories:");
  for (const category of WELCOME_HOME_NAV_CATEGORIES) {
    lines.push(`  ${category.label}`);
    for (const dest of category.destinations) {
      lines.push(`    • ${dest.label}`);
    }
  }
  lines.push("", "Experience Controls (SH overlay):");
  for (const item of SPARK_ESTATE_EXPERIENCE_CONTROL_ITEMS) {
    lines.push(`  • ${item.label}`);
  }

  lines.push("", "Profile menu:");
  for (const item of SPARK_ESTATE_PROFILE_MENU_ITEMS) {
    lines.push(`  • ${item.label}`);
  }

  lines.push("", SPARK_ESTATE_NAVIGATION_SEPARATION_RULE);
  lines.push("", "Integration checks:");
  lines.push(`  Controls: ${verification.controlCount}`);
  lines.push(`  Profile menu: ${verification.profileMenuAligned ? "pass" : "fail"}`);
  lines.push(
    `  Five categories (Estate last): ${verification.welcomeHomeHasFiveCategories ? "pass" : "fail"}`,
  );
  lines.push(
    `  EC off Welcome Home: ${verification.experienceControlsNotInWelcomeHome ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
