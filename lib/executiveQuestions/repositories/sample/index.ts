import {
  DEFAULT_RECOMMENDED_QUESTION_IDS,
  SAMPLE_QUESTION_RELATIONSHIPS,
  getSampleAnswerForQuestion,
} from "../../sample";
import { EXECUTIVE_QUESTION_CATALOG, getCatalogQuestion } from "../../catalog";
import type { ExecutiveQuestionDefinition, ExecutiveQuestionRelationship } from "../../types";

export const executiveSampleRepository = {
  listQuestions: (): ExecutiveQuestionDefinition[] => [...EXECUTIVE_QUESTION_CATALOG],
  getQuestion: (id: string) => getCatalogQuestion(id),
  listRelationships: (): ExecutiveQuestionRelationship[] => [...SAMPLE_QUESTION_RELATIONSHIPS],
  getRecommendedQuestionIds: () => [...DEFAULT_RECOMMENDED_QUESTION_IDS],
  getSampleAnswer: (question: ExecutiveQuestionDefinition) =>
    getSampleAnswerForQuestion(question.id, question.sampleAnswerId),
};

export type ExecutiveSampleRepository = typeof executiveSampleRepository;
