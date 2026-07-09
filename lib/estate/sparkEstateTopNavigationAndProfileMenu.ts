/**
 * Spark Estate™ — top navigation and profile menu correction.
 * Two permanent top-right controls: Room Navigation + User Profile/Settings.
 *
 * @see docs/protocols/SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md
 */

import {
  ESTATE_MENU_DROPDOWN_ITEMS,
  type EstateMenuActionId,
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
  { id: "return-to-room", label: "Return to room" },
] as const;

export const SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS = [
  { id: "back-to-estate", label: "Back to Estate", target: "welcome-home" },
  { id: "wander", label: "Wander", manifestDriven: true },
] as const;

export const SPARK_ESTATE_PROFILE_MENU_ITEMS: readonly {
  id: EstateMenuActionId;
  label: string;
}[] = [
  { id: "my-profile", label: "Profile" },
  { id: "settings", label: "Settings" },
  { id: "memory-library", label: "Conversations" },
  { id: "growth-profile", label: "Personalization" },
  { id: "estate-profile", label: "Account" },
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
      !displayName.includes(official.replace(/™/g, "")) &&
      !official.includes(displayName.replace(/™/g, ""))
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
  wanderManifestRuleReady: boolean;
  separationRuleReady: boolean;
} {
  const profileLabels = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.label);
  const expectedLabels = SPARK_ESTATE_PROFILE_MENU_ITEMS.map((item) => item.label);
  const profileMenuAligned =
    ESTATE_MENU_DROPDOWN_ITEMS.length === SPARK_ESTATE_PROFILE_MENU_ITEMS.length &&
    SPARK_ESTATE_PROFILE_MENU_ITEMS.every(
      (item, index) =>
        ESTATE_MENU_DROPDOWN_ITEMS[index]?.id === item.id &&
        ESTATE_MENU_DROPDOWN_ITEMS[index]?.label === item.label,
    ) &&
    profileLabels.every((label) => expectedLabels.includes(label));

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
    wanderManifestRuleReady: samplePick ? validateWanderPick(samplePick) : false,
    separationRuleReady: Boolean(SPARK_ESTATE_NAVIGATION_SEPARATION_RULE),
  };
}

export function formatSparkEstateTopNavigationReport(
  verification: ReturnType<typeof verifySparkEstateTopNavigationAndProfileMenu> = verifySparkEstateTopNavigationAndProfileMenu(),
): string {
  const lines: string[] = [
    `Spark Estate™ top navigation: ${verification.profileMenuAligned ? "ALIGNED" : "GAPS"}`,
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
