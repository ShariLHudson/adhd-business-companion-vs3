/**
 * My Business Estate redesign — presentation types (compatibility layer).
 * Does not replace companion-business-profile-v1 storage.
 */

import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";

/** Internal section progress (compatibility with existing estate fields). */
export type EstateSectionInternalState =
  | "not-started"
  | "in-progress"
  | "ready-to-review"
  | "complete";

/**
 * Room-level user-facing status language (encouraging, no failure tone).
 * Internal id `not-personalized` maps to "Ready to Begin".
 */
export type EstateRoomFacingStatus =
  | "not-personalized"
  | "getting-started"
  | "useful-foundation"
  | "growing"
  | "well-defined"
  | "ready-to-review";

export type EstateGroupId = "understand" | "guide" | "keep-moving";

export type EstateBrowseEntryKind = "room" | "area" | "coming-soon";

export type EstateBrowseEntry = {
  id: string;
  kind: EstateBrowseEntryKind;
  /** Maps to existing BusinessEstateSectionId when kind is room */
  sectionId?: BusinessEstateSectionId;
  name: string;
  purpose: string;
  /** When false, show Coming Later — no dead button */
  available: boolean;
  comingLaterLabel?: string;
  /** Compact Coming Soon teaser items (names only — not built) */
  comingSoonItems?: readonly string[];
};

export type EstateBrowseGroup = {
  id: EstateGroupId;
  title: string;
  description: string;
  entries: readonly EstateBrowseEntry[];
};

export type EstateRecommendationId =
  | "business-basics"
  | "people-i-help-overview"
  | "main-offer"
  | "support-preferences"
  | "return-plan"
  | "what-would-make-spark-useful"
  | "values"
  | "goals"
  | "brand-voice"
  | "current-business-season";

export type EstateRecommendation = {
  id: EstateRecommendationId;
  title: string;
  subtitle: string;
  detail: string;
  meta: string;
  primaryLabel: string;
  /** Where to navigate when primary is pressed */
  target:
    | { kind: "business-basics" }
    | { kind: "people-i-help" }
    | { kind: "room"; sectionId: BusinessEstateSectionId }
    | { kind: "coming-later" };
};

export type IdentitySectionId =
  | "business-basics"
  | "business-story"
  | "purpose"
  | "mission"
  | "vision"
  | "values"
  | "guiding-principles"
  | "boundaries"
  | "definition-of-success";

export type IdentitySectionDefinition = {
  id: IdentitySectionId;
  title: string;
  benefit: string;
  /** Fully wired in this pass */
  implemented: boolean;
  recommended?: boolean;
};
