/**
 * Map existing SectionStatus → redesign room-facing labels.
 */
import {
  getBusinessEstateSectionStatus,
  type BusinessEstateSectionId,
  type SectionStatus,
} from "@/lib/profile/businessEstateProfile";
import { isQuickStartSatisfied } from "@/lib/profile/guidedStageCompletion";
import type {
  EstateRoomFacingStatus,
  EstateSectionInternalState,
} from "./types";

export function toInternalSectionState(
  status: SectionStatus,
): EstateSectionInternalState {
  switch (status) {
    case "not-started":
      return "not-started";
    case "started":
      return "in-progress";
    case "ready-to-review":
      return "ready-to-review";
    case "updated":
      return "complete";
    default:
      return "not-started";
  }
}

export function roomFacingStatusLabel(status: EstateRoomFacingStatus): string {
  switch (status) {
    case "not-personalized":
      return "Not Personalized";
    case "getting-started":
      return "Getting Started";
    case "useful-foundation":
      return "Useful Foundation";
    case "growing":
      return "Growing";
    case "well-defined":
      return "Well Defined";
    case "ready-to-review":
      return "Ready to Review";
    default:
      return "Not Personalized";
  }
}

/**
 * Room-level status for compact entries — Identity uses Quick Start for foundation.
 */
export function getRoomFacingStatus(
  sectionId: BusinessEstateSectionId,
): EstateRoomFacingStatus {
  const status = getBusinessEstateSectionStatus(sectionId);
  if (status === "ready-to-review") return "ready-to-review";
  if (status === "not-started") return "not-personalized";

  if (sectionId === "identity") {
    if (isQuickStartSatisfied("identity")) {
      return status === "updated" ? "well-defined" : "useful-foundation";
    }
    return "getting-started";
  }

  if (status === "updated") return "well-defined";
  if (status === "started") return "growing";
  return "getting-started";
}

export function roomPrimaryActionLabel(
  sectionId: BusinessEstateSectionId,
  facing: EstateRoomFacingStatus,
): string {
  const areaName =
    sectionId === "identity"
      ? "Identity Office"
      : sectionId === "offers"
        ? "Offer Suite"
        : sectionId === "brand"
          ? "Brand Studio"
          : sectionId === "direction"
            ? "Strategy Desk"
            : sectionId === "work-style"
              ? "Working Style Study"
              : "Systems Desk";

  if (facing === "not-personalized") return `Enter ${areaName}`;
  if (facing === "ready-to-review") return `Review ${areaName}`;
  if (facing === "getting-started") {
    return sectionId === "identity"
      ? "Continue Business Basics"
      : `Continue ${areaName}`;
  }
  return `Enter ${areaName}`;
}
