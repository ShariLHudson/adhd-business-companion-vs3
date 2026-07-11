/**
 * Answer Assembler — architecture for composed executive answers.
 * Sample data only. Future: SPARK, FLAME, and FIRE enrich evidence here.
 */
import type {
  ComposedExecutiveAnswer,
  ExecutiveAnswer,
  ExecutiveContext,
  ExecutiveQuestionDefinition,
  ExecutiveQuestionId,
} from "../types";
import { buildExecutiveQuestion } from "./questionBuilder";
import { executiveSampleRepository } from "../repositories/sample";
import { relationshipsForQuestion } from "../relationships/questionRelationships";

function placeholderAnswer(
  question: ExecutiveQuestionDefinition,
): ExecutiveAnswer {
  return {
    questionId: question.id,
    summary: {
      headline: "Evidence assembly pending",
      narrative: `Architecture ready for ${question.title}. Connect SPARK, FLAME, and FIRE when live intelligence is available.`,
    },
    evidence: [],
    supportingResearch: [],
    relatedMissions: [],
    relatedDecisions: [],
    recommendedActions: question.nextActionHints.map((hint, index) => ({
      id: `placeholder-action-${index}`,
      label: hint,
      summary: hint,
      priority: question.priority.level,
    })),
    confidence: {
      level: "exploratory",
      score: 40,
      rationale: "Sample answer not yet defined for this question.",
    },
    priority: question.priority,
    openQuestions: [question.purpose],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: relationshipsForQuestion(question.id).map((rel) => ({
      id: rel.id,
      kind: rel.relatedKind,
      title: rel.relatedKind.replace(/-/g, " "),
      summary: rel.summary,
      refId: rel.relatedId,
    })),
  };
}

export function composeExecutiveAnswer(
  questionId: ExecutiveQuestionId,
  _context: ExecutiveContext = {},
): ComposedExecutiveAnswer | null {
  const definition = executiveSampleRepository.getQuestion(questionId);
  if (!definition) return null;

  const question = buildExecutiveQuestion(definition);
  const sample =
    executiveSampleRepository.getSampleAnswer(definition) ??
    placeholderAnswer(definition);

  return {
    question,
    answer: sample,
  };
}
