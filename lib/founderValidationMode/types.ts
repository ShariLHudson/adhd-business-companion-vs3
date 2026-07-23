/**
 * Founder Validation Mode — platform certification journeys only.
 * Never auto-CERTIFIED. Members never see this surface.
 */

import type { CertificationJourneyId } from "@/lib/createCertification";
import type {
  CertificationStatus,
  TestResultStatus,
} from "@/lib/createCertification/types";
import type { EmotionalQualityRow } from "@/lib/createCertification/emotionalQuality";

export const FOUNDER_VALIDATION_EVIDENCE_ROOT =
  "docs/create-experience/evidence" as const;

export const FOUNDER_VALIDATION_STORAGE_KEY =
  "spark-founder-validation-v1" as const;

export type JourneyVerdict = "pass" | "fail" | "blocked" | "not_run";

export type ScreenshotReference = {
  id: string;
  /** Path under evidence root, URL, or local filename note */
  reference: string;
  caption: string;
  addedAt: string;
};

export type JourneyRunRecord = {
  id: string;
  journeyId: CertificationJourneyId;
  startedAt: string;
  finishedAt: string | null;
  authenticated: boolean;
  environment: "local" | "preview" | "production" | "other";
  browserVerdict: JourneyVerdict;
  emotionalVerdict: JourneyVerdict;
  notes: string;
  screenshots: ScreenshotReference[];
  emotionalChecklist: EmotionalQualityRow[];
  /** Criteria checklist founder confirmed before/during run */
  criteriaChecked: Record<string, boolean>;
};

export type FounderStatusApproval = {
  id: string;
  journeyId: CertificationJourneyId;
  approvedAt: string;
  approvedBy: string;
  /** Exact statement founder typed/confirmed */
  confirmationPhrase: string;
  fromCertification: CertificationStatus;
  toCertification: CertificationStatus;
  fromBrowser: TestResultStatus;
  toBrowser: TestResultStatus;
  fromEmotional: TestResultStatus;
  toEmotional: TestResultStatus;
};

/**
 * Overlay applied to living dashboard after evidence + approval rules.
 * certification never becomes CERTIFIED without a matching approval.
 */
export type JourneyStatusOverlay = {
  journeyId: CertificationJourneyId;
  browser: TestResultStatus;
  emotional: TestResultStatus;
  certification: CertificationStatus;
  notes: string;
  lastRunId: string | null;
  evidenceRelativePath: string | null;
  updatedAt: string;
};

export type FounderValidationStore = {
  version: 1;
  runs: JourneyRunRecord[];
  overlays: JourneyStatusOverlay[];
  approvals: FounderStatusApproval[];
  activeJourneyId: CertificationJourneyId | null;
  updatedAt: string;
};

export type JourneySuccessCriterion = {
  id: string;
  label: string;
};
