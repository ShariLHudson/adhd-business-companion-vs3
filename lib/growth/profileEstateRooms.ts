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

const MENU_ACTION_TO_ROOM: Partial<
  Record<EstateMenuActionId, ProfileEstateRoomId>
> = {
  "estate-profile": "my-estate",
  "growth-profile": "growth-profile",
  "progress-timeline": "growth-profile",
  "evidence-vault": "evidence-vault",
  portfolio: "portfolio",
};

const SECTION_TO_ROOM: Partial<Record<AppSection, ProfileEstateRoomId>> = {
  "evidence-bank": "evidence-vault",
  "growth-journal": "journal",
  "growth-portfolio": "portfolio",
};

export function profileEstateRoomForMenuAction(
  actionId: EstateMenuActionId,
): ProfileEstateRoomId | null {
  return MENU_ACTION_TO_ROOM[actionId] ?? null;
}

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
