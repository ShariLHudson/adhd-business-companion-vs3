/**
 * Explicit founder approval required before certification status changes.
 * Never auto-CERTIFIED.
 */

import type { CertificationJourneyId } from "@/lib/createCertification";
import type {
  CertificationStatus,
  TestResultStatus,
} from "@/lib/createCertification/types";
import type { FounderStatusApproval, JourneyStatusOverlay } from "./types";

export const CERTIFY_CONFIRMATION_PHRASE = "I APPROVE CERTIFIED" as const;
export const STATUS_CHANGE_CONFIRMATION_PHRASE =
  "I APPROVE STATUS CHANGE" as const;

export type ProposedStatusChange = {
  journeyId: CertificationJourneyId;
  toBrowser: TestResultStatus;
  toEmotional: TestResultStatus;
  toCertification: CertificationStatus;
};

export type ApprovalGateResult = {
  allowed: boolean;
  blockers: string[];
};

/**
 * Hard rule: CERTIFIED is never automatic and never inferred from Pass alone.
 */
export function canApproveStatusChange(
  proposed: ProposedStatusChange,
  confirmationPhrase: string,
): ApprovalGateResult {
  const blockers: string[] = [];
  const phrase = confirmationPhrase.trim();

  if (proposed.toCertification === "CERTIFIED") {
    if (phrase !== CERTIFY_CONFIRMATION_PHRASE) {
      blockers.push(
        `To set CERTIFIED, type exactly: ${CERTIFY_CONFIRMATION_PHRASE}`,
      );
    }
    if (proposed.toBrowser !== "PASS") {
      blockers.push("Browser must be PASS before CERTIFIED.");
    }
    if (proposed.toEmotional !== "PASS") {
      blockers.push("Emotional audit must be PASS before CERTIFIED.");
    }
  } else if (phrase !== STATUS_CHANGE_CONFIRMATION_PHRASE) {
    blockers.push(
      `To change status, type exactly: ${STATUS_CHANGE_CONFIRMATION_PHRASE}`,
    );
  }

  return { allowed: blockers.length === 0, blockers };
}

/** Recording a run must never itself set CERTIFIED. */
export function certificationAfterRunRecord(
  browserVerdict: "pass" | "fail" | "blocked" | "not_run",
  emotionalVerdict: "pass" | "fail" | "blocked" | "not_run",
  prior: CertificationStatus,
): CertificationStatus {
  if (prior === "CERTIFIED") {
    if (browserVerdict === "fail" || emotionalVerdict === "fail") {
      return "TESTING";
    }
    return prior;
  }
  if (browserVerdict === "fail" || emotionalVerdict === "fail") {
    return "BLOCKED";
  }
  if (browserVerdict === "pass") {
    return "TESTING";
  }
  return prior === "NOT_STARTED" ? "TESTING" : prior;
}

export function browserStatusFromVerdict(
  v: "pass" | "fail" | "blocked" | "not_run",
): TestResultStatus {
  if (v === "pass") return "PASS";
  if (v === "fail") return "FAIL";
  if (v === "blocked") return "PARTIAL";
  return "NOT_RUN";
}

export function buildApprovalRecord(input: {
  journeyId: CertificationJourneyId;
  approvedBy: string;
  confirmationPhrase: string;
  from: JourneyStatusOverlay;
  to: ProposedStatusChange;
}): FounderStatusApproval {
  return {
    id: `approval-${Date.now()}`,
    journeyId: input.journeyId,
    approvedAt: new Date().toISOString(),
    approvedBy: input.approvedBy.trim() || "founder",
    confirmationPhrase: input.confirmationPhrase.trim(),
    fromCertification: input.from.certification,
    toCertification: input.to.toCertification,
    fromBrowser: input.from.browser,
    toBrowser: input.to.toBrowser,
    fromEmotional: input.from.emotional,
    toEmotional: input.to.toEmotional,
  };
}
