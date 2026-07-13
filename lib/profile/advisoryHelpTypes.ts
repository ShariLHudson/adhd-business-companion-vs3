/**
 * Chamber vs Board assistance — two separate systems.
 * Chamber = specialists (chamberMemberRegistry).
 * Board = strategic council (advisory/boardMembers).
 * Never interchangeable. Never a shared member registry.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { AdvisoryMemberId } from "@/lib/advisory/types";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";

export type AdvisorySourceType = "business_estate" | "people_i_help";

/** Top-level assistance menu — not interchangeable destinations */
export type AdvisoryHelpMode =
  | "chamber_specialist"
  | "board_discussion"
  | "shari_recommend";

export type ShariAssistancePath =
  | "continue_with_shari"
  | "ask_chamber_specialist"
  | "take_to_board"
  | "research_with_shari";

export type AdvisoryReturnDestination = {
  areaId: string;
  stageId?: string;
  avatarId?: string;
};

export type AdvisoryContext = {
  sourceType: AdvisorySourceType;
  areaId: string;
  stageId?: string;
  avatarId?: string;
  fieldId?: string;
  userQuestion?: string;
  approvedContext: Record<string, unknown>;
  draftContext?: Record<string, unknown>;
  returnDestination: AdvisoryReturnDestination;
};

/** Chamber-only specialist suggestion (never Board IDs) */
export type ChamberSpecialistRecommendation = {
  primary: ChamberMemberId;
  optionalSecond?: ChamberMemberId;
  rationale: string;
};

/** Shari chooses a destination system — never auto-launches */
export type ShariPathRecommendation = {
  path: ShariAssistancePath;
  rationale: string;
  /** Only when path is ask_chamber_specialist */
  chamberHint?: ChamberSpecialistRecommendation;
};

export type AdvisorySuggestedChange = {
  path: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
  sourceLabel: string;
};

export type SavedAdvisoryAdvice = {
  id: string;
  createdAt: string;
  context: AdvisoryContext;
  mode: AdvisoryHelpMode;
  /** Chamber specialist IDs only */
  chamberMemberIds: ChamberMemberId[];
  /** Board member IDs only — never Chamber */
  boardMemberIds: AdvisoryMemberId[];
  summary: string;
  suggestedChanges: AdvisorySuggestedChange[];
  profileUpdatesApproved: false;
};

export const ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE = false as const;
export const ADVISORY_HELP_MAY_AUTO_OPEN_CHAMBER_HOME = false as const;
export const ADVISORY_HELP_MAY_AUTO_NAVIGATE_BOARDROOM = false as const;
export const ADVISORY_HELP_MAY_AUTO_LAUNCH_PATH = false as const;

export const ADVISORY_ADVICE_STORAGE_KEY =
  "companion-advisory-advice-notes-v1";
export const ADVISORY_CONTEXT_SESSION_KEY =
  "companion-advisory-context-v1";
export const ADVISORY_PROMPT_SESSION_KEY =
  "companion-advisory-prompt-v1";

export const ADVISORY_INVITE_CHAMBER_EVENT =
  "companion-advisory-invite-chamber";

export type AdvisoryInviteChamberDetail = {
  memberIds: ChamberMemberId[];
  context: AdvisoryContext;
};

/** Chamber: one specialist, optional second — not a Board */
export const MAX_CHAMBER_SPECIALISTS_PER_SESSION = 2;

export type AdvisoryAreaId =
  | BusinessEstateSectionId
  | "people-i-help";

export const ASSISTANCE_ACTION_LABEL = "Need Another Perspective?" as const;
export const CHAMBER_PATH_LABEL = "Ask a Chamber Specialist" as const;
export const BOARD_PATH_LABEL = "Take This to the Board" as const;
export const SHARI_PATH_LABEL = "Let Shari Recommend" as const;
