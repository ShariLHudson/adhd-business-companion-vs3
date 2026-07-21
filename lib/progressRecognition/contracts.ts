/**
 * 101 — Distinct entity contracts.
 * Do not merge Win, Accomplishment, and Evidence into one generic purpose.
 */

export type ProgressSourceType =
  | "work"
  | "section"
  | "project"
  | "task"
  | "milestone"
  | "goal"
  | "blueprint"
  | "decision"
  | "conversation";

export type WinSignificance = "small" | "meaningful" | "significant";

export type WinRecord = {
  winId: string;
  title: string;
  description?: string;
  significance: WinSignificance;
  sourceType: ProgressSourceType;
  sourceId: string;
  projectId?: string;
  goalIds?: string[];
  workId?: string;
  occurredAt: string;
  createdAt: string;
  /** Soft-removed recognition — source Work stays intact. */
  removedAt?: string | null;
};

export type AccomplishmentRecord = {
  accomplishmentId: string;
  title: string;
  description?: string;
  category?: string;
  sourceType: ProgressSourceType;
  sourceId: string;
  projectId?: string;
  blueprintId?: string;
  workId?: string;
  goalIds?: string[];
  peopleIds?: string[];
  deliverableLinks?: string[];
  whyItMattered?: string;
  occurredAt: string;
  createdAt: string;
  removedAt?: string | null;
};

/** Discovery/lesson only — never a trophy for completion alone. */
export type EvidenceRecognitionRecord = {
  evidenceId: string;
  discovery?: string;
  problemSolved?: string;
  cause?: string;
  whatWorked?: string;
  whatDidNotWork?: string;
  whoHelped?: string[];
  pattern?: string;
  futureGuidance?: string;
  sourceType?: ProgressSourceType;
  sourceId?: string;
  createdAt: string;
};

export type CelebrationDestination = "in-place" | "garden" | "hall";

export type CelebrationRecord = {
  celebrationId: string;
  recognitionType: "win" | "accomplishment";
  recognitionId: string;
  destination: CelebrationDestination;
  soundId?: string | null;
  celebratedAt: string;
  /** Exact return path to source work. */
  returnPath?: {
    workId?: string;
    sectionId?: string;
    projectId?: string;
    placeId?: string;
  };
};

export type RecognitionCandidateKind =
  | "win"
  | "accomplishment"
  | "evidence";

export type RecognitionCandidate = {
  candidateId: string;
  kind: RecognitionCandidateKind;
  title: string;
  explanation: string;
  sourceType: ProgressSourceType;
  sourceId: string;
  workId?: string;
  projectId?: string;
  blueprintId?: string;
  significanceScore: number;
  factors: readonly string[];
  detectedAt: string;
};

export type ProgressRelationshipTarget =
  | "business-pulse-event"
  | "win"
  | "accomplishment"
  | "evidence-record"
  | "celebration";
