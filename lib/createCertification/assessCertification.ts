/**
 * 062 — Certification cannot be claimed without required evidence.
 */

import type {
  CertificationDecision,
  CertificationEvidence,
  CertificationStatus,
  DefectSeverity,
} from "./types";

/** Critical / high defects always block CERTIFIED. */
export function severityBlocksCertification(
  severity: DefectSeverity,
): boolean {
  return severity === "critical" || severity === "high";
}

/**
 * Decide certification from evidence.
 * Only CERTIFIED when all hard gates pass.
 */
export function assessCertification(
  evidence: CertificationEvidence,
): CertificationDecision {
  const blockers: string[] = [];

  if (!evidence.governingStandard.trim()) {
    blockers.push("Governing standard is missing.");
  }
  if (!evidence.unitPass) {
    blockers.push("Unit tests have not passed.");
  }
  if (!evidence.integrationPass) {
    blockers.push("Integration tests have not passed.");
  }
  if (!evidence.browserPass) {
    blockers.push("Authenticated browser validation is missing or failed.");
  }
  if (!evidence.accessibilityPass) {
    blockers.push("Accessibility validation is missing or failed.");
  }
  if (!evidence.typecheckPass) {
    blockers.push("Typecheck has not passed.");
  }
  if (evidence.criticalDefects > 0) {
    blockers.push(
      `${evidence.criticalDefects} critical defect(s) remain — certification forbidden.`,
    );
  }
  if (evidence.highDefects > 0) {
    blockers.push(
      `${evidence.highDefects} high-severity defect(s) remain — certification forbidden.`,
    );
  }
  if (!evidence.knownLimitationsDocumented) {
    blockers.push("Known limitations are not documented.");
  }
  if (!evidence.traceabilityComplete) {
    blockers.push("Traceability matrix is incomplete.");
  }

  if (blockers.length === 0) {
    return { status: "CERTIFIED", allowed: true, blockers: [] };
  }

  // Conditional only when browser is the sole soft gap and no critical/high defects
  const onlyBrowserGap =
    blockers.length === 1 &&
    blockers[0]!.includes("browser") &&
    evidence.criticalDefects === 0 &&
    evidence.highDefects === 0 &&
    evidence.unitPass &&
    evidence.integrationPass;

  if (onlyBrowserGap) {
    return {
      status: "CONDITIONALLY_CERTIFIED",
      allowed: false,
      blockers: [
        ...blockers,
        "May be CONDITIONALLY_CERTIFIED only with owner + remediation plan — not production complete.",
      ],
    };
  }

  let status: CertificationStatus = "NOT_CERTIFIED";
  if (evidence.criticalDefects > 0 || evidence.highDefects > 0) {
    status = "BLOCKED";
  } else if (
    evidence.unitPass ||
    evidence.integrationPass ||
    Boolean(evidence.implementationSpec)
  ) {
    status = "TESTING";
  }

  return { status, allowed: false, blockers };
}

/** Machine rule: CERTIFIED requires assessCertification.allowed === true. */
export function canMarkCertified(evidence: CertificationEvidence): boolean {
  return assessCertification(evidence).allowed;
}
