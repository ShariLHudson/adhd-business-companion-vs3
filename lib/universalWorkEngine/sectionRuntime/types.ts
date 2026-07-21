/**
 * Universal section runtime — shared Create / Projects section ownership.
 */

export type WorkSectionStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "reopened"
  | "skipped";

export type WorkSection = {
  id: string;
  title: string;
  order: number;
  content: string;
  status: WorkSectionStatus;
  optional?: boolean;
};

export type AssembledSectionProvenance = {
  sectionId: string;
  title: string;
  content: string;
  status: WorkSectionStatus;
  versionCompletedAt?: string | null;
};

export type AssembledWorkOutput = {
  workId: string;
  workType: string;
  title: string;
  body: string;
  assembledAt: string;
  stale: boolean;
  sections: readonly AssembledSectionProvenance[];
};

export type AssembleWorkValidation = {
  ok: boolean;
  missingRequiredSectionIds: readonly string[];
  message: string | null;
};
