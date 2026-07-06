import type { ExecutiveQuestionRelationship } from "../types";
import { executiveSampleRepository } from "../repositories/sample";

export function listQuestionRelationships(): ExecutiveQuestionRelationship[] {
  return executiveSampleRepository.listRelationships();
}

export function relationshipsForQuestion(questionId: string): ExecutiveQuestionRelationship[] {
  return listQuestionRelationships().filter((r) => r.questionId === questionId);
}

export function relationshipsForRef(
  relatedKind: ExecutiveQuestionRelationship["relatedKind"],
  relatedId: string,
): ExecutiveQuestionRelationship[] {
  return listQuestionRelationships().filter(
    (r) => r.relatedKind === relatedKind && r.relatedId === relatedId,
  );
}
