import type { SparkContentRecord } from "./types";
import { SPARK_MASTER_RECOMMENDED_TAGS } from "./categoryTaxonomy";

export type SparkRecordValidationIssue = {
  field: string;
  message: string;
  severity: "error" | "warning";
};

const SPARK_ID_PATTERN = /^SPARK-[A-Z0-9-]+$/;

/** Master standard quality tests (curiosity, story, connection, simplicity, spark). */
function runMasterQualityTests(
  record: SparkContentRecord,
): SparkRecordValidationIssue[] {
  const issues: SparkRecordValidationIssue[] = [];

  if (record.short_teaser.trim().length < 20) {
    issues.push({
      field: "short_teaser",
      message: "Curiosity test: teaser may be too short to open the card.",
      severity: "warning",
    });
  }

  if (record.story.trim().length < 80) {
    issues.push({
      field: "story",
      message: "Story test: add more conversational detail (who, what, why).",
      severity: "warning",
    });
  }

  if (!record.spark_application.includes("?")) {
    issues.push({
      field: "spark_application",
      message: "Connection test: end with a reflection question.",
      severity: "warning",
    });
  }

  const storyWords = record.story.split(/\s+/).length;
  if (storyWords > 180) {
    issues.push({
      field: "story",
      message: "Simplicity test: story may be long for a daily Spark (~180 words max).",
      severity: "warning",
    });
  }

  if (record.impact.trim().length < 40) {
    issues.push({
      field: "impact",
      message: "Spark test: impact should create meaning or inspiration.",
      severity: "warning",
    });
  }

  const knownTags = new Set(
    SPARK_MASTER_RECOMMENDED_TAGS.map((t) => t.toLowerCase()),
  );
  const hasKnownTag = record.tags.some((t) => knownTags.has(t.toLowerCase()));
  if (!hasKnownTag && record.tags.length > 0) {
    issues.push({
      field: "tags",
      message: `Consider master-standard tags: ${SPARK_MASTER_RECOMMENDED_TAGS.slice(0, 5).join(", ")}…`,
      severity: "warning",
    });
  }

  return issues;
}

/**
 * Validate a Spark library record per
 * SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md and admin protocol.
 */
export function validateSparkRecord(
  record: SparkContentRecord,
): SparkRecordValidationIssue[] {
  const issues: SparkRecordValidationIssue[] = [];

  if (!SPARK_ID_PATTERN.test(record.spark_id)) {
    issues.push({
      field: "spark_id",
      message: "Must start with SPARK- (e.g. SPARK-INV-001).",
      severity: "error",
    });
  }

  if (!record.title?.trim()) {
    issues.push({ field: "title", message: "Title is required.", severity: "error" });
  }

  if (!record.category?.trim()) {
    issues.push({
      field: "category",
      message: "Category is required.",
      severity: "error",
    });
  }

  if (!record.audience?.length) {
    issues.push({
      field: "audience",
      message: "At least one audience is required.",
      severity: "error",
    });
  }

  if (!record.short_teaser?.trim()) {
    issues.push({
      field: "short_teaser",
      message: "Short teaser is required.",
      severity: "error",
    });
  } else if (record.short_teaser.length > 220) {
    issues.push({
      field: "short_teaser",
      message: "Teaser should stay under ~220 characters for the card.",
      severity: "warning",
    });
  }

  if (!record.story?.trim() || record.story.length < 40) {
    issues.push({
      field: "story",
      message: "Story must explain what happened (min ~40 chars).",
      severity: "error",
    });
  }

  if (!record.impact?.trim() || record.impact.length < 30) {
    issues.push({
      field: "impact",
      message: "Impact must explain why it matters (min ~30 chars).",
      severity: "error",
    });
  }

  if (!record.spark_application?.trim()) {
    issues.push({
      field: "spark_application",
      message: "Spark application question is required.",
      severity: "error",
    });
  } else if (!record.spark_application.includes("?")) {
    issues.push({
      field: "spark_application",
      message: "Application should be a reflection question (include ?).",
      severity: "warning",
    });
  }

  if (!record.tags?.length) {
    issues.push({
      field: "tags",
      message: "Add at least one personalization tag.",
      severity: "warning",
    });
  }

  if (!record.runtime_category) {
    issues.push({
      field: "runtime_category",
      message: "Set runtime_category for selection engine routing.",
      severity: "error",
    });
  }

  if (record.status === "active" && !record.subcategory?.trim()) {
    issues.push({
      field: "subcategory",
      message: "Active Sparks should include a subcategory for library organization.",
      severity: "warning",
    });
  }

  issues.push(...runMasterQualityTests(record));

  return issues;
}

export function validateSparkRecords(records: SparkContentRecord[]): {
  errors: SparkRecordValidationIssue[];
  warnings: SparkRecordValidationIssue[];
} {
  const errors: SparkRecordValidationIssue[] = [];
  const warnings: SparkRecordValidationIssue[] = [];

  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.spark_id)) {
      errors.push({
        field: "spark_id",
        message: `Duplicate spark_id: ${record.spark_id}`,
        severity: "error",
      });
    }
    seen.add(record.spark_id);

    for (const issue of validateSparkRecord(record)) {
      if (issue.severity === "error") errors.push(issue);
      else warnings.push(issue);
    }
  }

  return { errors, warnings };
}
