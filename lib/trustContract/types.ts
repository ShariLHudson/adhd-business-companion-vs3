/**
 * 067 — Trust Contract Standard
 */

export const TRUST_CONTRACT_STANDARD_ID = "067" as const;

export const TRUST_CONTRACT_RULES = [
  "never_claim_invisible_work",
  "never_reference_missing_ui",
  "never_promise_save_without_persist",
  "never_promise_resume_without_resume",
  "never_expose_implementation_language",
  "never_silently_lose_user_messages",
  "never_allow_dead_recovery_buttons",
  "never_reask_known_information",
  "honest_recovery_when_impossible",
] as const;

export type TrustContractRuleId = (typeof TRUST_CONTRACT_RULES)[number];

export type PromiseKind =
  | "created"
  | "opened"
  | "saved"
  | "remembered"
  | "continue"
  | "organized"
  | "added"
  | "updated"
  | "ui_mechanics";

export type PromiseEvidence = {
  workspaceVerified?: boolean;
  eventRecordBound?: boolean;
  persistSucceeded?: boolean;
  resumeAvailable?: boolean;
  factsOrganized?: boolean;
  memoryConfirmed?: boolean;
};

export type PromiseAuditFinding = {
  kind: PromiseKind;
  claimSnippet: string;
  alwaysTrue: boolean;
  canFail: boolean;
  memberExperienceIfFail: string;
  sayInstead: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "fixed" | "accepted_risk";
};
