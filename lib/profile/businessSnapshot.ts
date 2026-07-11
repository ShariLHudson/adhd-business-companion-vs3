import { getApprovedFieldValue } from "@/lib/profile/businessEstateProfile";

const EMPTY_SNAPSHOT =
  "Your Business Estate is ready to grow one section at a time. Start with the area that feels easiest.";

/** Snapshot from approved My Business Estate fields only — never raw chat imports. */
export function buildApprovedBusinessSnapshot(): string {
  const businessName = getApprovedFieldValue("identity.businessName");
  const roleTitle = getApprovedFieldValue("identity.roleTitle");
  const shortDescription = getApprovedFieldValue("identity.shortDescription");
  const mainOffer = getApprovedFieldValue("offers.mainOffer");
  const currentPriority = getApprovedFieldValue("direction.currentPriority");
  const nextMilestone = getApprovedFieldValue("direction.nextMilestone");

  const lines: string[] = [];

  if (businessName) {
    lines.push(businessName);
  }

  const whatYouDo = shortDescription || roleTitle;
  if (whatYouDo) {
    lines.push(whatYouDo);
  }

  if (mainOffer) {
    lines.push(`Primary offer: ${mainOffer}`);
  }

  if (currentPriority) {
    lines.push(`Current priority: ${currentPriority}`);
  }

  if (nextMilestone) {
    lines.push(`Next milestone: ${nextMilestone}`);
  }

  if (lines.length === 0) return EMPTY_SNAPSHOT;
  return lines.join("\n");
}

export function businessSnapshotIsEmpty(): boolean {
  return buildApprovedBusinessSnapshot() === EMPTY_SNAPSHOT;
}
