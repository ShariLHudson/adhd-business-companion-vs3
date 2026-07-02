/**
 * Source integrity rules and validators.
 */

import type { KnowledgeSource } from "../types";
import type {
  KnowledgeCardContentLayers,
  KnowledgeContentClaim,
  SourceIntegrityChecklistAnswers,
  SourceIntegrityChecklistResult,
  SourceIntegrityValidationIssue,
  SourceIntegrityValidationResult,
} from "./types";
import { SOURCE_INTEGRITY_CHECKLIST } from "./types";

/** Only verified sources may support final published lessons */
export function isSourceEligibleForTeaching(source: KnowledgeSource): boolean {
  return (
    source.verificationStatus === "verified" &&
    source.sourceType !== "curatorial_placeholder"
  );
}

export function filterSourcesEligibleForTeaching(
  sources: KnowledgeSource[],
): KnowledgeSource[] {
  return sources.filter(isSourceEligibleForTeaching);
}

export function rejectUnverifiedForTeaching(
  sources: KnowledgeSource[],
): KnowledgeSource[] {
  return sources.filter((s) => s.verificationStatus === "unverified_candidate");
}

export function checklistPassed(
  answers: SourceIntegrityChecklistAnswers,
): boolean {
  return SOURCE_INTEGRITY_CHECKLIST.every((item) => answers[item.id] === true);
}

export function evaluateSourceIntegrityChecklist(input: {
  lessonId: string;
  knowledgeCardId: string;
  experienceId?: string;
  answers: SourceIntegrityChecklistAnswers;
  reviewerNotes?: string;
}): SourceIntegrityChecklistResult {
  const passed = checklistPassed(input.answers);
  return {
    id: `sic-${input.lessonId}-${Date.now()}`,
    lessonId: input.lessonId,
    knowledgeCardId: input.knowledgeCardId,
    experienceId: input.experienceId,
    checkedAt: new Date().toISOString(),
    answers: input.answers,
    passed,
    reviewerNotes: input.reviewerNotes,
  };
}

function issue(
  code: string,
  message: string,
  extra?: { claimId?: string; sourceId?: string },
): SourceIntegrityValidationIssue {
  return { code, message, ...extra };
}

/** Spark synthesis must never be presented as a direct quote or unsourced fact */
export function validateContentClaim(
  claim: KnowledgeContentClaim,
  sourcesById: Map<string, KnowledgeSource>,
): SourceIntegrityValidationIssue[] {
  const issues: SourceIntegrityValidationIssue[] = [];

  if (claim.kind === "spark_synthesis" && claim.isQuote) {
    issues.push(
      issue(
        "synthesis_as_quote",
        "Spark synthesis cannot be presented as a direct quote.",
        { claimId: claim.id },
      ),
    );
  }

  if (claim.kind === "spark_synthesis" && (claim.sourceIds?.length ?? 0) > 0) {
    issues.push(
      issue(
        "synthesis_with_direct_attribution",
        "Spark synthesis must not carry direct source attribution as if quoted.",
        { claimId: claim.id },
      ),
    );
  }

  if (claim.kind === "fact") {
    if (!claim.sourceIds?.length) {
      issues.push(
        issue(
          "fact_unsourced",
          "Factual claims must reference at least one source.",
          { claimId: claim.id },
        ),
      );
    } else {
      for (const sourceId of claim.sourceIds) {
        const source = sourcesById.get(sourceId);
        if (!source) {
          issues.push(
            issue("source_missing", "Referenced source does not exist.", {
              claimId: claim.id,
              sourceId,
            }),
          );
          continue;
        }
        if (!isSourceEligibleForTeaching(source)) {
          issues.push(
            issue(
              "source_not_verified",
              `Source "${source.sourceTitle}" is ${source.verificationStatus} and cannot support final lessons until reviewed.`,
              { claimId: claim.id, sourceId },
            ),
          );
        }
      }
    }
  }

  if (claim.isQuote) {
    if (!claim.quoteExact) {
      issues.push(
        issue(
          "quote_not_marked_exact",
          "Quotes must be marked as exact or paraphrased separately.",
          { claimId: claim.id },
        ),
      );
    }
    if (claim.kind === "spark_synthesis" || claim.kind === "opinion") {
      issues.push(
        issue(
          "quote_wrong_layer",
          "Only facts or examples may carry direct quotes from sources.",
          { claimId: claim.id },
        ),
      );
    }
  }

  if (claim.isSpeculative && !claim.limitationNotes?.trim()) {
    issues.push(
      issue(
        "speculative_without_limitation",
        "Speculative claims must include limitation notes.",
        { claimId: claim.id },
      ),
    );
  }

  return issues;
}

export function validateKnowledgeCardContentLayers(
  layers: KnowledgeCardContentLayers,
  sources: KnowledgeSource[],
): SourceIntegrityValidationResult {
  const sourcesById = new Map(sources.map((s) => [s.id, s]));
  const allClaims: KnowledgeContentClaim[] = [
    ...layers.facts,
    ...layers.principles,
    ...layers.sparkSynthesis,
    ...layers.recommendations,
    ...layers.examples,
    ...layers.opinions,
  ];

  const issues = allClaims.flatMap((c) =>
    validateContentClaim(c, sourcesById),
  );

  return { valid: issues.length === 0, issues };
}

export function canPublishLesson(input: {
  contentLayers: KnowledgeCardContentLayers;
  sources: KnowledgeSource[];
  checklistAnswers: SourceIntegrityChecklistAnswers;
}): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!checklistPassed(input.checklistAnswers)) {
    reasons.push("Source Integrity Checklist not fully passed.");
  }

  const validation = validateKnowledgeCardContentLayers(
    input.contentLayers,
    input.sources,
  );
  if (!validation.valid) {
    reasons.push(
      ...validation.issues.map((i) => `${i.code}: ${i.message}`),
    );
  }

  return { allowed: reasons.length === 0, reasons };
}

/** Teaching rule — never attribute synthesis to a source */
export const SOURCE_INTEGRITY_RULES = {
  noInventedSources: true,
  unverifiedCannotTeachFinalLessons: true,
  synthesisNeverAsQuote: true,
  factsRequireVerifiedSource: true,
} as const;
