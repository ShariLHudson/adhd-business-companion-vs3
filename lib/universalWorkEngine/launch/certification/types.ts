/**
 * 104 — Anywhere-Origin certification result types (machine-readable).
 */

export type CertificationLevelId =
  | "L1_architecture"
  | "L2_automated"
  | "L3_experience"
  | "L4_adhd"
  | "L5_domain"
  | "L6_production";

export type CertificationLevelStatus =
  | "pass"
  | "fail"
  | "partial"
  | "not_run";

export type AnywhereOriginCertVerdict =
  | "WORK TYPE PRODUCTION CERTIFIED"
  | "WORK TYPE CONDITIONALLY CERTIFIED"
  | "WORK TYPE NOT CERTIFIED";

export type CertCheckResult = {
  id: string;
  passed: boolean;
  detail: string;
  blocker?: boolean;
};

export type OriginMatrixCell = {
  origin: string;
  blueprintId: string;
  passed: boolean;
  workId: string | null;
  checks: readonly CertCheckResult[];
};

export type CoreScenarioResult = {
  origin: string;
  passed: boolean;
  workId: string | null;
  stepsPassed: number;
  stepsTotal: number;
  checks: readonly CertCheckResult[];
};

export type AnywhereOriginCertificationResult = {
  schemaVersion: "104.1";
  workTypeId: "event_plan";
  commitUnderTest: string;
  environment: string;
  generatedAt: string;
  testCommand: string;
  levels: Record<
    CertificationLevelId,
    { status: CertificationLevelStatus; notes: string }
  >;
  originMatrix: readonly OriginMatrixCell[];
  blueprintMatrix: readonly OriginMatrixCell[];
  coreScenarios: readonly CoreScenarioResult[];
  identityChecks: readonly CertCheckResult[];
  integrityChecks: readonly CertCheckResult[];
  securityChecks: readonly CertCheckResult[];
  adhdChecks: readonly CertCheckResult[];
  performanceChecks: readonly CertCheckResult[];
  releaseBlockers: readonly string[];
  conditions: readonly {
    condition: string;
    owner: string;
    followUp: string;
  }[];
  totals: {
    checksPassed: number;
    checksFailed: number;
    originsCovered: number;
    blueprintsCovered: number;
  };
  verdict: AnywhereOriginCertVerdict;
};
