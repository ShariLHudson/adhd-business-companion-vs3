/**
 * 062 / 063 — Implementation certification + traceability types.
 */

export type TestResultStatus =
  | "PASS"
  | "FAIL"
  | "PARTIAL"
  | "NOT_RUN"
  | "NOT_APPLICABLE";

export type CertificationStatus =
  | "NOT_STARTED"
  | "IN_IMPLEMENTATION"
  | "TESTING"
  | "BLOCKED"
  | "NOT_CERTIFIED"
  | "CONDITIONALLY_CERTIFIED"
  | "CERTIFIED"
  | "DEPRECATED";

export type DefectSeverity = "critical" | "high" | "medium" | "low";

export type StandardMatrixRow = {
  standardId: string;
  capability: string;
  governingDoc: string;
  implementationSpec: string | null;
  runtimePath: string | null;
  unit: TestResultStatus;
  integration: TestResultStatus;
  browser: TestResultStatus;
  accessibility: TestResultStatus;
  regression: TestResultStatus;
  certification: CertificationStatus;
  owner: string | null;
  notes: string;
};

export type RequirementTraceRow = {
  requirementId: string;
  standardId: string;
  requirement: string;
  implementationFile: string | null;
  runtimeFunction: string | null;
  testFile: string | null;
  testCase: string | null;
  evidence: string | null;
  status: TestResultStatus;
  gap: string | null;
};

export type CrossEntryTraceRow = {
  journey: string;
  entryPoint: string;
  canonicalRecord: TestResultStatus;
  workspace: TestResultStatus;
  contextPreserved: TestResultStatus;
  noDuplicate: TestResultStatus;
  resume: TestResultStatus;
  browserProof: TestResultStatus;
  status: CertificationStatus;
};

export type CertificationEvidence = {
  governingStandard: string;
  implementationSpec: string | null;
  unitPass: boolean;
  integrationPass: boolean;
  browserPass: boolean;
  accessibilityPass: boolean;
  typecheckPass: boolean;
  criticalDefects: number;
  highDefects: number;
  knownLimitationsDocumented: boolean;
  traceabilityComplete: boolean;
};

export type CertificationDecision = {
  status: CertificationStatus;
  allowed: boolean;
  blockers: string[];
};
