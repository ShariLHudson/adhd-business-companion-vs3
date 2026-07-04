/**
 * Estate Coaching Architecture™ — experiences as prescriptions, not destinations.
 *
 * @see docs/estate/ESTATE_COACHING_ARCHITECTURE.md
 */

import type { AppSection } from "@/lib/companionUi";

/** What kind of help the member needs — not which room. */
export type EstateCoachingSituation =
  | "focus"
  | "overwhelmed"
  | "creative_block"
  | "stress"
  | "decision"
  | "business_growth"
  | "motivation";

export type EstateCoachingGoalKind =
  | "sop"
  | "email"
  | "document"
  | "project"
  | "general";

export type EstateCoachingGoal = {
  kind: EstateCoachingGoalKind;
  label: string;
  artifactType?: string;
};

/** One human recommendation mapped to an internal Estate experience. */
export type EstateCoachingPrescription = {
  id: string;
  /** Member-facing — never a feature name */
  humanLabel: string;
  detail?: string;
  spaceId: string;
  section?: AppSection;
  /** Open tool after arrival when member chose this path */
  openSection?: AppSection;
  /** When true, navigate only — stay in conversation */
  stayInConversation?: boolean;
};

export type EstateCoachingMenu = {
  situation: EstateCoachingSituation;
  intro: string;
  prescriptions: readonly EstateCoachingPrescription[];
  goal?: EstateCoachingGoal;
  sequenceHint?: string;
};

export type ImmediateEstateCoachingOpenPayload = {
  userText: string;
  situation: EstateCoachingSituation;
  prescriptionId: string;
  humanLabel: string;
  estatePlaceId: string;
  section?: AppSection;
  openSection?: AppSection;
  followUpLine: string;
  goal?: EstateCoachingGoal;
};
