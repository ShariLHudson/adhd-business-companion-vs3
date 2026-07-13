/**
 * Presentation labels for Business Estate room chrome.
 * Does not change storage or section status derivation.
 */
import type { SectionStatus } from "@/lib/profile/businessEstateProfile";

export function businessEstateRoomStatusLabel(status: SectionStatus): string {
  switch (status) {
    case "not-started":
      return "Ready to Begin";
    case "started":
      return "In Progress";
    case "ready-to-review":
      return "Needs Review";
    case "updated":
      return "Complete";
    default:
      return "Ready to Begin";
  }
}

export function businessEstateRoomStatusTone(
  status: SectionStatus,
): "quiet" | "progress" | "review" | "complete" {
  switch (status) {
    case "started":
      return "progress";
    case "ready-to-review":
      return "review";
    case "updated":
      return "complete";
    case "not-started":
    default:
      return "quiet";
  }
}
