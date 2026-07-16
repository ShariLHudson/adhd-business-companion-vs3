/**
 * Overview progress for available Business Estate rooms — calm ADHD scan strip.
 * Reads existing estate + People I Help stores; does not duplicate data.
 */
import { getAvatars } from "@/lib/companionStore";
import {
  getBusinessEstateEnvelope,
  getBusinessEstateSectionStatus,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import { isQuickStartSatisfied } from "@/lib/profile/guidedStageCompletion";
import {
  getRoomFacingStatus,
  roomFacingStatusLabel,
} from "./status";
import type { EstateRoomFacingStatus } from "./types";

export type EstateOverviewRoomId =
  | BusinessEstateSectionId
  | "people-i-help";

export type EstateOverviewRoomRow = {
  id: EstateOverviewRoomId;
  name: string;
  benefit: string;
  status: EstateRoomFacingStatus | "coming-later";
  statusLabel: string;
  /** 0–100 for colored indicator */
  progressPercent: number;
  timeEstimate: string;
  lastUpdatedLabel: string;
  sectionId?: BusinessEstateSectionId;
  kind: "room" | "people-i-help";
};

const ROOM_META: Record<
  BusinessEstateSectionId,
  { name: string; benefit: string; timeEstimate: string }
> = {
  identity: {
    name: "Identity Office",
    benefit: "Helps Shari speak accurately about what your business is and stands for.",
    timeEstimate: "About 3 minutes · 3 short questions",
  },
  offers: {
    name: "Offer Suite",
    benefit: "Keeps guidance tied to what you actually offer and the results it creates.",
    timeEstimate: "About 5 minutes",
  },
  brand: {
    name: "Brand Studio",
    benefit: "Shapes how Spark writes and sounds like your business.",
    timeEstimate: "About 5 minutes",
  },
  direction: {
    name: "Strategy Desk",
    benefit: "Gives Shari your current priorities so suggestions stay relevant.",
    timeEstimate: "About 5 minutes",
  },
  "work-style": {
    name: "Working Style Study",
    benefit: "Teaches Shari how you focus, decide, and recover — so support fits you.",
    timeEstimate: "About 5 minutes",
  },
  tools: {
    name: "Systems Desk",
    benefit: "Remembers the tools and systems that keep your work moving.",
    timeEstimate: "About 4 minutes",
  },
};

function formatRelativeUpdated(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "Never";
  const diffMs = Date.now() - ms;
  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs < dayMs) return "Today";
  if (diffMs < 2 * dayMs) return "Yesterday";
  const days = Math.floor(diffMs / dayMs);
  if (days < 14) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 18) return `${months} month${months === 1 ? "" : "s"} ago`;
  return "A while ago";
}

function progressFromFacing(facing: EstateRoomFacingStatus): number {
  switch (facing) {
    case "not-personalized":
      return 0;
    case "getting-started":
      return 25;
    case "growing":
      return 50;
    case "useful-foundation":
      return 75;
    case "ready-to-review":
      return 70;
    case "well-defined":
      return 100;
    default:
      return 0;
  }
}

export function getPeopleIHelpFacingStatus(): EstateRoomFacingStatus {
  const avatars = getAvatars();
  if (avatars.length === 0) return "not-personalized";
  const primary = avatars.find((a) => a.isPrimary) ?? avatars[0];
  const hasBasics =
    Boolean(primary?.who?.trim()) ||
    Boolean(primary?.painPoints?.trim()) ||
    Boolean(primary?.goals?.trim());
  if (!hasBasics) return "getting-started";
  const hasDepth =
    Boolean(primary?.motivations?.trim()) ||
    Boolean(primary?.objections?.trim()) ||
    Boolean(primary?.research);
  if (hasDepth) return "well-defined";
  return "useful-foundation";
}

function getPeopleIHelpUpdatedAt(): string | null {
  const avatars = getAvatars();
  if (avatars.length === 0) return null;
  const times = avatars
    .map((a) => a.updatedAt || a.createdAt)
    .map((d) => new Date(d).getTime())
    .filter((n) => !Number.isNaN(n));
  if (times.length === 0) return null;
  return new Date(Math.max(...times)).toISOString();
}

/** Available rooms shown in the overview progress strip (order is intentional). */
export function listEstateOverviewRooms(): EstateOverviewRoomRow[] {
  const envelope = getBusinessEstateEnvelope();
  const sectionOrder: BusinessEstateSectionId[] = [
    "identity",
    "offers",
    "brand",
    "direction",
    "work-style",
    "tools",
  ];

  const peopleFacing = getPeopleIHelpFacingStatus();
  const peopleRow: EstateOverviewRoomRow = {
    id: "people-i-help",
    name: "People I Help",
    benefit:
      "Helps Spark speak to the right people with the right problems and language.",
    status: peopleFacing,
    statusLabel: roomFacingStatusLabel(peopleFacing),
    progressPercent: progressFromFacing(peopleFacing),
    timeEstimate: "About 5 minutes · Quick Understanding first",
    lastUpdatedLabel: formatRelativeUpdated(getPeopleIHelpUpdatedAt()),
    kind: "people-i-help",
  };

  const roomRows: EstateOverviewRoomRow[] = sectionOrder.map((sectionId) => {
    const meta = ROOM_META[sectionId];
    const facing = getRoomFacingStatus(sectionId);
    const status = getBusinessEstateSectionStatus(sectionId);
    let progressPercent = progressFromFacing(facing);
    if (sectionId === "identity" && isQuickStartSatisfied("identity")) {
      progressPercent = Math.max(progressPercent, 60);
    }
    if (status === "updated") progressPercent = 100;

    return {
      id: sectionId,
      name: meta.name,
      benefit: meta.benefit,
      status: facing,
      statusLabel: roomFacingStatusLabel(facing),
      progressPercent,
      timeEstimate: meta.timeEstimate,
      lastUpdatedLabel: formatRelativeUpdated(
        envelope.sectionUpdatedAt[sectionId],
      ),
      sectionId,
      kind: "room",
    };
  });

  // Understand group visual order: Identity → People I Help → Offer → Brand, then Guide rooms
  return [
    roomRows[0]!, // identity
    peopleRow,
    roomRows[1]!, // offers
    roomRows[2]!, // brand
    roomRows[3]!, // direction
    roomRows[4]!, // work-style
    roomRows[5]!, // tools
  ];
}

export function estateRoomTimeEstimate(
  sectionId: BusinessEstateSectionId | "people-i-help",
): string {
  if (sectionId === "people-i-help") {
    return "About 5 minutes · Quick Understanding first";
  }
  return ROOM_META[sectionId].timeEstimate;
}

export function estateRoomBenefit(
  sectionId: BusinessEstateSectionId | "people-i-help",
): string {
  if (sectionId === "people-i-help") {
    return "Helps Spark speak to the right people with the right problems and language.";
  }
  return ROOM_META[sectionId].benefit;
}

export { formatRelativeUpdated };
