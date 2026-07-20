/**
 * 062 — Required completion report structure.
 */

import type { CertificationStatus } from "./types";

export type CompletionReport = {
  governingStandard: string;
  implementationSpecification: string | null;
  capability: string;
  status: CertificationStatus;
  filesCreated: string[];
  filesModified: string[];
  filesRemoved: string[];
  existingArchitectureReused: string[];
  canonicalSourceOfTruth: string;
  newRuntimeServices: string[];
  unitTests: string;
  integrationTests: string;
  authenticatedBrowserTests: string;
  knownLimitations: string[];
  unresolvedDefects: string[];
  certification: CertificationStatus;
  exactNextRecommendedStep: string;
};

export function formatCompletionReport(report: CompletionReport): string {
  return [
    `Governing Standard: ${report.governingStandard}`,
    `Implementation Specification: ${report.implementationSpecification ?? "(none)"}`,
    `Capability: ${report.capability}`,
    `Status: ${report.status}`,
    "",
    `Files Created: ${report.filesCreated.join(", ") || "(none)"}`,
    `Files Modified: ${report.filesModified.join(", ") || "(none)"}`,
    `Files Removed: ${report.filesRemoved.join(", ") || "(none)"}`,
    "",
    `Existing Architecture Reused: ${report.existingArchitectureReused.join(", ") || "(none)"}`,
    `Canonical Source of Truth: ${report.canonicalSourceOfTruth}`,
    `New Runtime Services: ${report.newRuntimeServices.join(", ") || "(none)"}`,
    "",
    `Unit Tests: ${report.unitTests}`,
    `Integration Tests: ${report.integrationTests}`,
    `Authenticated Browser Tests: ${report.authenticatedBrowserTests}`,
    "",
    `Known Limitations: ${report.knownLimitations.join("; ") || "(none)"}`,
    `Unresolved Defects: ${report.unresolvedDefects.join("; ") || "(none)"}`,
    "",
    `Certification: ${report.certification}`,
    `Exact Next Recommended Step: ${report.exactNextRecommendedStep}`,
  ].join("\n");
}
