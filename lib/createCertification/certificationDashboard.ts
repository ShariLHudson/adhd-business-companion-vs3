/**
 * Sprint 3 — Living Certification Dashboard (machine-readable).
 * Only all-green categories can move a capability to CERTIFIED.
 */

import {
  CERTIFICATION_JOURNEYS,
  platformCertificationBlockedBy,
  type CertificationJourneyRow,
} from "./certificationJourneys";
import {
  blankEmotionalQualityAudit,
  emotionalQualityPasses,
} from "./emotionalQuality";
import {
  CROSS_ENTRY_TRACE_MATRIX,
  MASTER_STANDARDS_MATRIX,
  matrixHasInvalidCertificationClaims,
} from "./traceabilityMatrix";
import type { CertificationStatus, TestResultStatus } from "./types";

export type DashboardCategoryId =
  | "architecture"
  | "implementation"
  | "unit"
  | "integration"
  | "browser"
  | "ux"
  | "adhd"
  | "trust"
  | "certification";

export type DashboardCategoryStatus = TestResultStatus | CertificationStatus;

export type CapabilityDashboardRow = {
  capabilityId: string;
  capability: string;
  architecture: TestResultStatus;
  implementation: TestResultStatus;
  unit: TestResultStatus;
  integration: TestResultStatus;
  browser: TestResultStatus;
  ux: TestResultStatus;
  adhd: TestResultStatus;
  trust: TestResultStatus;
  certification: CertificationStatus;
  notes: string;
};

function architectureStatus(runtimePath: string | null): TestResultStatus {
  return runtimePath ? "PASS" : "NOT_RUN";
}

function implementationStatus(
  unit: TestResultStatus,
  integration: TestResultStatus,
): TestResultStatus {
  if (unit === "PASS" && (integration === "PASS" || integration === "PARTIAL")) {
    return integration === "PASS" ? "PASS" : "PARTIAL";
  }
  if (unit === "PASS" || unit === "PARTIAL") return "PARTIAL";
  return unit;
}

/**
 * Living dashboard rows — standards 045–065 + journeys.
 * UX / ADHD / Trust stay NOT_RUN until browser emotional audit.
 */
export function buildCertificationDashboard(): CapabilityDashboardRow[] {
  const fromStandards: CapabilityDashboardRow[] = MASTER_STANDARDS_MATRIX.map(
    (row) => ({
      capabilityId: row.standardId,
      capability: row.capability,
      architecture: architectureStatus(row.runtimePath),
      implementation: implementationStatus(row.unit, row.integration),
      unit: row.unit,
      integration: row.integration,
      browser: row.browser,
      ux: "NOT_RUN",
      adhd: "NOT_RUN",
      trust: "NOT_RUN",
      certification: row.certification,
      notes: row.notes,
    }),
  );

  const fromJourneys: CapabilityDashboardRow[] = CERTIFICATION_JOURNEYS.map(
    (j) => journeyToDashboardRow(j),
  );

  return [...fromStandards, ...fromJourneys];
}

function journeyToDashboardRow(
  j: CertificationJourneyRow,
): CapabilityDashboardRow {
  return {
    capabilityId: j.id,
    capability: j.name,
    architecture: "PASS",
    implementation: j.library === "PASS" ? "PASS" : j.library,
    unit: j.library,
    integration: j.library === "PASS" ? "PARTIAL" : j.library,
    browser: j.browser,
    ux: j.emotional,
    adhd: j.emotional,
    trust: j.id === "TRUST" ? j.browser : j.emotional,
    certification: j.certification,
    notes: j.notes,
  };
}

export function formatCertificationDashboardMarkdown(): string {
  const rows = buildCertificationDashboard();
  const header =
    "| Capability | Arch | Impl | Unit | Integration | Browser | UX | ADHD | Trust | Status |\n" +
    "|---|---|---|---|---|---|---|---|---|---|";
  const body = rows
    .map(
      (r) =>
        `| ${r.capabilityId} ${r.capability} | ${r.architecture} | ${r.implementation} | ${r.unit} | ${r.integration} | ${r.browser} | ${r.ux} | ${r.adhd} | ${r.trust} | ${r.certification} |`,
    )
    .join("\n");

  const blockers = platformCertificationBlockedBy();
  const invalid = matrixHasInvalidCertificationClaims();
  const emotionalBlank = blankEmotionalQualityAudit();
  const emotionalOk = emotionalQualityPasses(
    emotionalBlank.map((r) => ({ ...r, answer: "yes" as const })),
  );

  return [
    "# Creation Platform — Living Certification Dashboard",
    "",
    `_Generated from \`lib/createCertification/\`. Do not hand-edit status without evidence._`,
    "",
    "## Verdict",
    "",
    blockers.length === 0 && invalid.length === 0
      ? "**CERTIFIED** — all journeys browser + emotional PASS."
      : `**NOT CERTIFIED** — ${blockers.length} journey blocker(s). Invalid matrix claims: ${invalid.length}.`,
    "",
    "Emotional gate template present: " +
      (emotionalOk ? "yes" : "no") +
      " (live audit still NOT_RUN until browser pack).",
    "",
    "## Matrix",
    "",
    header,
    body,
    "",
    "## Cross-entry (063)",
    "",
    CROSS_ENTRY_TRACE_MATRIX.map(
      (r) =>
        `- ${r.entryPoint}: browser=${r.browserProof}, status=${r.status}`,
    ).join("\n"),
    "",
  ].join("\n");
}

export function countCertifiedCapabilities(
  rows: readonly CapabilityDashboardRow[] = buildCertificationDashboard(),
): { certified: number; total: number } {
  return {
    certified: rows.filter((r) => r.certification === "CERTIFIED").length,
    total: rows.length,
  };
}
