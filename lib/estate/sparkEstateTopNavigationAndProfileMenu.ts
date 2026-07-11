/**
 * Spark Estate — top navigation and profile menu correction.
 * Two permanent top-right controls: Room Navigation + User Profile/Settings.
 *
 * @see docs/protocols/SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md
 */

import {
  ESTATE_MENU_DROPDOWN_ENTRIES,
  ESTATE_MENU_DROPDOWN_ITEMS,
  type EstateMenuActionId,
  type EstateMenuDropdownGroup,
} from "@/lib/estateMenu";
import { getPlaceById } from "@/lib/estate/manifest/estatePlaceMasterManifest";
import {
  getWanderableManifestPlaces,
  resolveWanderRoomDisplayName,
  validateWanderPick,
  type EstateWanderPick,
} from "@/lib/estate/manifest/estateWanderMode";

export const SPARK_ESTATE_TOP_NAVIGATION_PRINCIPLE =
  "Only two permanent top-right controls — Room Navigation and User Profile — no additional standalone navigation buttons.";

export const SPARK_ESTATE_TOP_NAVIGATION_GOAL =
  "Room Button: Where am I and where can I go? Initials Button: Who am I and what are my settings?";

export const SPARK_ESTATE_TOP_NAVIGATION_CONTROLS = [
  {
    id: "room",
    label: "Current Room",
    purpose: "Estate navigation and room experience settings",
    question: "Where am I? Where can I go?",
  },
  {
    id: "profile",
    label: "User Initials",
    purpose: "Profile, settings, conversations, and account",
    question: "Who am I? What are my settings?",
  },
] as const;

export const SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS = [
  { id: "chat", label: "Chat on / Chat off" },
  { id: "sound", label: "Sound on / Sound off" },
  { id: "fullscreen", label: "Full screen on / Full screen off" },
  { id: "change-background", label: "Change background" },
  { id: "return-to-estate", label: "Return to Estate", target: "welcome-home" },
] as const;

export const SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS = [
  { id: "chamber-of-momentum", label: "Chamber of Momentum" },
  { id: "evidence-vault", label: "Evidence Vault" },
  { id: "hall-of-accomplishments", label: "Hall of Accomplishments" },
  { id: "journal", label: "Journal Gazebo" },
  { id: "cartographers-studio", label: "Cartographer's Studio™" },
] as const;

export const SPARK_ESTATE_ROOM_MENU_SECTIONS = [
  { id: "experience-controls", label: "Experience Controls" },
  { id: "estate-navigation", label: "Estate Navigation" },
  { id: "experiences", label: "Experiences" },
] as const;

export const SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS = [
  { id: "breathe", label: "Breathe", capability: "breathe" as const },
  { id: "soundscapes", label: "Soundscapes" },
  {
    id: "explore-spark",
    label: "Explore Spark",
    note: "Future replacement for Wander — manifest-driven place exploration",
    manifestDriven: true,
  },
] as const;

/** Visible profile-menu top-level rows (Profile is a nested group). */
export const SPARK_ESTATE_PROFILE_MENU_ITEMS: readonly {
  id: EstateMenuActionId | "conversations" | "profile";
  label: string;
}[] = [
  { id: "conversations", label: "Conversations" },
  { id: "settings", label: "Settings" },
  { id: "profile", label: "Profile" },
  { id: "log-out", label: "Logout" },
];

/** Clickable leaf actions under Profile. */
export const SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS: readonly {
  id: EstateMenuActionId;
  label: string;
}[] = [
  { id: "my-profile", label: "My Business Estate" },
  { id: "people-i-help", label: "People I Help" },
];

/** Clickable leaf actions under Conversations. */
export const SPARK_ESTATE_PROFILE_MENU_CONVERSATION_ITEMS: readonly {
  id: EstateMenuActionId;
  label: string;
}[] = [
  { id: "start-new-conversation", label: "New Chat" },
  { id: "start-new-day-conversation", label: "New Day Chat" },
];

export const SPARK_ESTATE_NAVIGATION_SEPARATION_RULE =
  "Room button adjusts the environment and estate navigation. Initials button manages the member and account. Do not combine these menus.";

export const SPARK_ESTATE_WANDER_MANIFEST_RULE =
  "Choose one manifest place record — load official name, image, route, and metadata together. Never mix names, images, or routes from separate sources.";

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
    if (!place.primary_image?.trim()) {
      issues.push("manifest missing primary_image");
    }
    if (!place.route?.trim()) {
      issues.push("manifest missing route");
    }
    const official = place.display_name ?? place.official_name;
    if (
      official &&
      !displayName.includes(official.replace(/\u2122/g, "")) &&
      !official.includes(displayName.replace(/\u2122/g, ""))
    ) {
      issues.push("display name may not match manifest official name");
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
  roomExperiencesItems: number;
  wanderManifestRuleReady: boolean;
  separationRuleReady: boolean;
} {
  const topLevelLabels = ESTATE_MENU_DROPDOWN_ENTRIES.map((entry) => entry.label);
  const expectedTopLabels = SPARK_ESTATE_PROFILE_MENU_ITEMS.map((item) => item.label);
  const conversationsGroup = ESTATE_MENU_DROPDOWN_ENTRIES.find(
    (entry): entry is EstateMenuDropdownGroup =>
      entry.kind === "group" && entry.id === "conversations",
  );
  const profileGroup = ESTATE_MENU_DROPDOWN_ENTRIES.find(
    (entry): entry is EstateMenuDropdownGroup =>
      entry.kind === "group" && entry.id === "profile",
  );
  const conversationChildren = conversationsGroup?.children ?? [];
  const profileChildren = profileGroup?.children ?? [];
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
    profileChildren.length === SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS.length &&
    SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS.every(
      (item, index) =>
        profileChildren[index]?.id === item.id &&
        profileChildren[index]?.label === item.label,
    ) &&
    !ESTATE_MENU_DROPDOWN_ITEMS.some(
      (item) =>
        item.id === "growth-profile" ||
        item.id === "estate-profile" ||
        item.id === "evidence-vault" ||
        item.id === "portfolio" ||
        item.id === "journal",
    );

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
    roomExperiencesItems: SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS.length,
    wanderManifestRuleReady: samplePick ? validateWanderPick(samplePick) : false,
    separationRuleReady: Boolean(SPARK_ESTATE_NAVIGATION_SEPARATION_RULE),
  };
}

export function formatSparkEstateTopNavigationReport(
  verification: ReturnType<typeof verifySparkEstateTopNavigationAndProfileMenu> = verifySparkEstateTopNavigationAndProfileMenu(),
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

  lines.push("", "Room menu — experience controls:");
  for (const item of SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS) {
    lines.push(`  • ${item.label}`);
  }

  lines.push("", "Room menu — estate navigation:");
  for (const item of SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS) {
    lines.push(`  • ${item.label}`);
  }

  lines.push("", "Room menu — experiences:");
  for (const item of SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS) {
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
  lines.push(`  Wander manifest rule: ${verification.wanderManifestRuleReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
