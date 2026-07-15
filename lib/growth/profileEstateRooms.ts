import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import {
  ESTATE_PROFILE_ROOM_BG,
  EVIDENCE_VAULT_ROOM_BG,
  GROWTH_ROOM_BG,
  PORTFOLIO_ROOM_BG,
} from "@/lib/growth/growthRoom";

/** Personal estate rooms — full-bleed scene + center chat only. */
export const PROFILE_ESTATE_ROOM_IDS = [
  "my-estate",
  "growth-profile",
  "evidence-vault",
  "journal",
  "portfolio",
] as const;

export type ProfileEstateRoomId = (typeof PROFILE_ESTATE_ROOM_IDS)[number];

/** Canonical room plates for profile estate rooms — growth uses greenhouse. */
export function profileEstateRoomBackgroundImage(
  roomId: ProfileEstateRoomId,
): string {
  switch (roomId) {
    case "my-estate":
      return ESTATE_PROFILE_ROOM_BG;
    case "growth-profile":
      return GROWTH_ROOM_BG;
    case "evidence-vault":
      return EVIDENCE_VAULT_ROOM_BG;
    case "journal":
      return ESTATE_ROOM_BG.gazeboJournal;
    case "portfolio":
      return PORTFOLIO_ROOM_BG;
    default: {
      const _exhaustive: never = roomId;
      return _exhaustive;
    }
  }
}

/** Homestead scene id for full-bleed preload — growth profile shares greenhouse. */
export function profileEstateHomesteadRoomId(
  roomId: ProfileEstateRoomId,
): string {
  return roomId === "growth-profile" ? "greenhouse" : roomId;
}

const PROFILE_ROOM_ID_SET = new Set<string>(PROFILE_ESTATE_ROOM_IDS);

export function isProfileEstateRoomId(
  roomId: string | null | undefined,
): roomId is ProfileEstateRoomId {
  return roomId != null && PROFILE_ROOM_ID_SET.has(roomId);
}

/**
 * Menu actions that open immersive estate rooms (not My Spark Estate overlays).
 * my-profile / estate-profile / my-business-estate are overlay destinations — not here.
 */
export const PROFILE_ESTATE_MENU_ACTION_IDS = [
  "growth-profile",
  "progress-timeline",
  "evidence-vault",
  "portfolio",
] as const satisfies readonly EstateMenuActionId[];

export type ProfileEstateMenuActionId =
  (typeof PROFILE_ESTATE_MENU_ACTION_IDS)[number];

/** Estate menu actions handled in the shell switch (after memory + profile routes). */
export type EstateMenuShellActionId = Exclude<
  EstateMenuActionId,
  | ProfileEstateMenuActionId
  | "memory-library"
  | "journal"
  | "people-i-help"
  | "replay-welcome"
  | "experience-controls"
  | "my-profile"
  | "estate-profile"
  | "my-business-estate"
>;

const MENU_ACTION_TO_ROOM: Record<
  ProfileEstateMenuActionId,
  ProfileEstateRoomId
> = {
  "growth-profile": "growth-profile",
  "progress-timeline": "growth-profile",
  "evidence-vault": "evidence-vault",
  portfolio: "portfolio",
};

export function isProfileEstateMenuAction(
  actionId: EstateMenuActionId,
): actionId is ProfileEstateMenuActionId {
  switch (actionId) {
    case "growth-profile":
    case "progress-timeline":
    case "evidence-vault":
    case "portfolio":
      return true;
    default:
      return false;
  }
}

export function profileEstateRoomForMenuAction(
  actionId: ProfileEstateMenuActionId,
): ProfileEstateRoomId {
  return MENU_ACTION_TO_ROOM[actionId];
}

const SECTION_TO_ROOM: Partial<Record<AppSection, ProfileEstateRoomId>> = {
  "evidence-bank": "evidence-vault",
  "growth-journal": "journal",
  "growth-portfolio": "portfolio",
};

export function profileEstateRoomForSection(
  section: AppSection,
): ProfileEstateRoomId | null {
  return SECTION_TO_ROOM[section] ?? null;
}

export function profileEstateSectionForRoom(
  roomId: ProfileEstateRoomId,
): AppSection {
  switch (roomId) {
    case "my-estate":
    case "growth-profile":
      return "home";
    case "evidence-vault":
      return "evidence-bank";
    case "journal":
      return "growth-journal";
    case "portfolio":
      return "growth-portfolio";
    default: {
      const _exhaustive: never = roomId;
      return _exhaustive;
    }
  }
}
