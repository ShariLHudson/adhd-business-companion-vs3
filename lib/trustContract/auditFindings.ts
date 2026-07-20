/**
 * Sprint 4 — Trust Contract audit findings (living record).
 */

import type { PromiseAuditFinding } from "./types";

/** Violations found and disposition during Sprint 4. */
export const TRUST_CONTRACT_AUDIT_FINDINGS: readonly PromiseAuditFinding[] = [
  {
    kind: "saved",
    claimSnippet: "Got it — I saved that with your other thoughts.",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Believes thought is in Clear My Mind; later cannot find it.",
    sayInstead:
      "I heard that. It isn't saved in Clear My Mind yet — want me to capture it there?",
    severity: "critical",
    status: "fixed",
  },
  {
    kind: "ui_mechanics",
    claimSnippet: "edit sections on the right / beside your conversation",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Looks for a right-hand chat|workspace split that may not exist (066).",
    sayInstead: "edit the sections here / work together in the workspace",
    severity: "high",
    status: "fixed",
  },
  {
    kind: "opened",
    claimSnippet: "I've opened a new SOP / email / …",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Hears success before workspace is verified open.",
    sayInstead: "Let's shape your SOP… (claim open only after verify)",
    severity: "high",
    status: "fixed",
  },
  {
    kind: "created",
    claimSnippet: "I've created your workshop.",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Believes Event Record exists when only preferred copy fired.",
    sayInstead: "Let's work on your workshop together.",
    severity: "high",
    status: "fixed",
  },
  {
    kind: "organized",
    claimSnippet: "I've organized everything we've discussed in your workspace.",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Expects full organization when only foundation facts exist.",
    sayInstead:
      "I've gathered what we've discussed so far in your workspace.",
    severity: "medium",
    status: "fixed",
  },
  {
    kind: "continue",
    claimSnippet: "We can continue wherever you left off.",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Expects resume when no topic/focus/session exists.",
    sayInstead: "I'm glad you're here. What would help most right now?",
    severity: "medium",
    status: "fixed",
  },
  {
    kind: "opened",
    claimSnippet: "I've opened your Event Creation Workspace…",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail:
      "Claim fires from guide copy even if UI bind races.",
    sayInstead: "Verified open via appendVerifiedWorkspaceMessage / evidence",
    severity: "medium",
    status: "accepted_risk",
  },
  {
    kind: "remembered",
    claimSnippet: "I remember you often move forward…",
    alwaysTrue: false,
    canFail: true,
    memberExperienceIfFail: "Feels surveilled or misremembered.",
    sayInstead: "Permissioned memory + soft observation only",
    severity: "medium",
    status: "open",
  },
] as const;

export function listOpenTrustViolations(): PromiseAuditFinding[] {
  return TRUST_CONTRACT_AUDIT_FINDINGS.filter((f) => f.status === "open");
}

/**
 * Trust Contract is satisfied only when no open findings remain.
 * Accepted risks still require browser proof before CERTIFIED.
 */
export function trustContractSatisfied(): boolean {
  return listOpenTrustViolations().length === 0;
}
