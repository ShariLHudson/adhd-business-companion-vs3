/**
 * Executive Office presentation helpers for My Business Estate.
 * Presentation/navigation only — does not write storage or change save logic.
 */
import {
  BUSINESS_ESTATE_SECTIONS,
  getApprovedFieldValue,
  getBusinessEstateEnvelope,
  getBusinessEstateSectionStatus,
  type BusinessEstateSectionId,
  type SectionStatus,
} from "@/lib/profile/businessEstateProfile";
import { buildApprovedBusinessSnapshot } from "@/lib/profile/businessSnapshot";

/** Estate-themed action for entering a Business Area. */
export type BusinessAreaAction = "Enter" | "Open" | "Review" | "Update";

export type BusinessAreaPresentation = {
  sectionId: BusinessEstateSectionId;
  /** Department / office name shown on the overview */
  areaName: string;
  /** Existing section title (editor + accessibility) */
  sectionTitle: string;
  /** One short purpose line */
  placeBlurb: string;
  /**
   * Existing Estate artwork crop for door identity.
   * Future: replace with dedicated area plates via coverImagePath.
   */
  coverImageUrl: string;
  /** Reserved path once dedicated artwork ships (may equal cover today) */
  dedicatedArtworkPath?: string | null;
};

export type ExecutiveSnapshotFact = {
  label: string;
  value: string;
};

export type ExecutiveBusinessStatus =
  | "awaiting-foundation"
  | "taking-shape"
  | "needs-review"
  | "well-tended";

/**
 * Per-area visual mapping — existing backgrounds only.
 * No AI generation in this phase.
 */
export const BUSINESS_AREA_PRESENTATION: readonly BusinessAreaPresentation[] = [
  {
    sectionId: "identity",
    areaName: "Identity Office",
    sectionTitle: "Business Identity",
    placeBlurb: "Who your business is, and why it exists.",
    coverImageUrl: "/backgrounds/founder-office-background.png",
    dedicatedArtworkPath: "/backgrounds/business-identity-office-background.png",
  },
  {
    sectionId: "offers",
    areaName: "Offer Suite",
    sectionTitle: "What I Offer",
    placeBlurb: "What you create and deliver.",
    coverImageUrl: "/backgrounds/gallery-background.png",
    dedicatedArtworkPath: "/backgrounds/offer-suite-background.png",
  },
  {
    sectionId: "brand",
    areaName: "Brand Studio",
    sectionTitle: "Brand and Message",
    placeBlurb: "How you sound and show up.",
    coverImageUrl: "/backgrounds/art-studio-background.png",
    dedicatedArtworkPath: "/backgrounds/brand-studio-background.png",
  },
  {
    sectionId: "direction",
    areaName: "Strategy Desk",
    sectionTitle: "Business Direction",
    placeBlurb: "Where attention belongs next.",
    coverImageUrl: "/backgrounds/creative-studio-background.png",
    dedicatedArtworkPath: "/backgrounds/strategy-desk-background.png",
  },
  {
    sectionId: "work-style",
    areaName: "Working Style Study",
    sectionTitle: "How I Work Best",
    placeBlurb: "Rhythms that help Spark support you.",
    coverImageUrl: "/backgrounds/study-hall-background.png",
    dedicatedArtworkPath: "/backgrounds/working-style-study-background.png",
  },
  {
    sectionId: "tools",
    areaName: "Systems Desk",
    sectionTitle: "Business Tools and Systems",
    placeBlurb: "Tools that keep the work moving.",
    coverImageUrl: "/backgrounds/shari-office-background.png",
    dedicatedArtworkPath: "/backgrounds/systems-desk-background.png",
  },
] as const;

const STATUS_LABELS: Record<SectionStatus, string> = {
  "not-started": "Quiet",
  started: "In progress",
  "ready-to-review": "Ready to review",
  updated: "Tended",
};

const EXECUTIVE_STATUS_LABEL: Record<ExecutiveBusinessStatus, string> = {
  "awaiting-foundation": "Ready to begin",
  "taking-shape": "Taking shape",
  "needs-review": "Ready for review",
  "well-tended": "Well tended",
};

export function businessAreaActionForStatus(
  status: SectionStatus,
): BusinessAreaAction {
  switch (status) {
    case "not-started":
      return "Enter";
    case "ready-to-review":
      return "Review";
    case "updated":
      return "Update";
    case "started":
    default:
      return "Open";
  }
}

export function businessAreaStatusLabel(status: SectionStatus): string {
  return STATUS_LABELS[status];
}

export function getBusinessAreaPresentation(
  sectionId: BusinessEstateSectionId,
): BusinessAreaPresentation {
  return (
    BUSINESS_AREA_PRESENTATION.find((area) => area.sectionId === sectionId) ??
    BUSINESS_AREA_PRESENTATION[0]!
  );
}

/** Briefing facts from approved fields only — never invents counts. */
export function buildExecutiveSnapshotFacts(): ExecutiveSnapshotFact[] {
  const facts: ExecutiveSnapshotFact[] = [];
  const businessName = getApprovedFieldValue("identity.businessName");
  const roleTitle = getApprovedFieldValue("identity.roleTitle");
  const shortDescription = getApprovedFieldValue("identity.shortDescription");
  const currentPriority = getApprovedFieldValue("direction.currentPriority");

  if (businessName) facts.push({ label: "Business", value: businessName });
  const focus = currentPriority || shortDescription || roleTitle;
  if (focus) facts.push({ label: "Current focus", value: focus });

  const status = getExecutiveBusinessStatus();
  facts.push({
    label: "Profile status",
    value: EXECUTIVE_STATUS_LABEL[status],
  });

  const reviewAreas = BUSINESS_ESTATE_SECTIONS.filter(
    (section) => getBusinessEstateSectionStatus(section.id) === "ready-to-review",
  ).map((section) => getBusinessAreaPresentation(section.id).areaName);
  if (reviewAreas.length > 0) {
    facts.push({
      label: "Areas ready for review",
      value: reviewAreas.join(", "),
    });
  }

  const lastUpdated = getLatestSectionUpdatedAt();
  if (lastUpdated) {
    facts.push({ label: "Last updated", value: lastUpdated });
  }

  return facts;
}

function getLatestSectionUpdatedAt(): string | null {
  const envelope = getBusinessEstateEnvelope();
  const dates = Object.values(envelope.sectionUpdatedAt ?? {}).filter(Boolean);
  if (dates.length === 0) return null;
  const latest = dates
    .map((d) => new Date(d!).getTime())
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => b - a)[0];
  if (latest == null) return null;
  try {
    return new Date(latest).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function getExecutiveBusinessStatus(): ExecutiveBusinessStatus {
  const statuses = BUSINESS_ESTATE_SECTIONS.map((section) =>
    getBusinessEstateSectionStatus(section.id),
  );
  if (statuses.every((s) => s === "not-started")) return "awaiting-foundation";
  if (statuses.some((s) => s === "ready-to-review")) return "needs-review";
  if (statuses.every((s) => s === "updated")) return "well-tended";
  return "taking-shape";
}

export function executiveBusinessStatusLabel(
  status: ExecutiveBusinessStatus = getExecutiveBusinessStatus(),
): string {
  return EXECUTIVE_STATUS_LABEL[status];
}

/**
 * One useful next step — presentation only.
 * Uses existing section status helpers; never invents business facts.
 */
export function buildShariNote(): string {
  const statuses = BUSINESS_ESTATE_SECTIONS.map((section) => ({
    id: section.id,
    status: getBusinessEstateSectionStatus(section.id),
    area: getBusinessAreaPresentation(section.id),
  }));

  const needsReview = statuses.find((s) => s.status === "ready-to-review");
  if (needsReview) {
    return `A quiet Review in the ${needsReview.area.areaName} will keep what we use accurate.`;
  }

  if (statuses.every((s) => s.status === "not-started")) {
    return `Begin in the Identity Office when you’re ready — or Enter whichever door feels lightest.`;
  }

  const offers = statuses.find((s) => s.id === "offers");
  if (offers && offers.status === "not-started") {
    return `Clarifying your Offer Suite will help me give you stronger marketing and sales guidance.`;
  }

  if (statuses.every((s) => s.status === "updated")) {
    return `Your office is well tended. Update an area when something real shifts.`;
  }

  const quiet = statuses.find((s) => s.status === "not-started");
  if (quiet) {
    return `Enter the ${quiet.area.areaName} when you want — one calm door is enough.`;
  }

  const inProgress = statuses.find((s) => s.status === "started");
  if (inProgress) {
    return `Open the ${inProgress.area.areaName} to continue where you left off.`;
  }

  return `One door at a time is enough in this office.`;
}

/** Fallback narrative when structured facts are empty — same approved snapshot source. */
export function executiveSnapshotNarrative(): string {
  return buildApprovedBusinessSnapshot();
}
