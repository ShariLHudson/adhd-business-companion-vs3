/**
 * 057 — Active Work card (member-facing).
 * Project Homes / IDs stay internal.
 */

export type ActiveWorkSourceKind =
  | "creation_workspace"
  | "member_project";

export type ActiveWorkCardModel = {
  id: string;
  name: string;
  creationType: string;
  statusLabel: string;
  phaseLabel: string;
  currentFocus: string;
  /** 0–100 when known; null when qualitative only */
  progressPercent: number | null;
  nextRecommendedStep: string;
  lastWorkedAt: string;
  waitingItems: string[];
  sourceKind: ActiveWorkSourceKind;
  /** Internal — never shown */
  eventRecordId: string | null;
  projectHomeRecordId: string | null;
  companionProjectId: string | null;
};
