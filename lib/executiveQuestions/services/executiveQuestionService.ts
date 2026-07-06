import type {
  ExecutiveCategory,
  ExecutiveContext,
  ExecutiveQuestion,
  ExecutiveQuestionFilter,
  ExecutiveQuestionId,
  ExecutiveQuestionRelationship,
} from "../types";
import { composeExecutiveAnswer } from "../builders/answerAssembler";
import { buildExecutiveQuestions } from "../builders/questionBuilder";
import { filterExecutiveQuestions } from "../filters/executiveFilters";
import { compareExecutivePriority } from "../priorities/executivePriorities";
import { listCatalogByCategory } from "../catalog";
import { executiveSampleRepository } from "../repositories/sample";
import { listQuestionRelationships } from "../relationships/questionRelationships";

export class ExecutiveQuestionService {
  listQuestions(filter?: ExecutiveQuestionFilter): ExecutiveQuestion[] {
    const all = executiveSampleRepository.listQuestions();
    const filtered = filter ? filterExecutiveQuestions(all, filter) : all;
    return buildExecutiveQuestions(filtered);
  }

  getQuestion(id: ExecutiveQuestionId): ExecutiveQuestion | null {
    const definition = executiveSampleRepository.getQuestion(id);
    return definition ? buildExecutiveQuestions([definition])[0] : null;
  }

  getQuestionsByCategory(category: ExecutiveCategory): ExecutiveQuestion[] {
    return buildExecutiveQuestions(listCatalogByCategory(category));
  }

  composeExecutiveAnswer(questionId: ExecutiveQuestionId, context?: ExecutiveContext) {
    return composeExecutiveAnswer(questionId, context);
  }

  listRecommendedQuestions(context?: ExecutiveContext): ExecutiveQuestion[] {
    const ids = executiveSampleRepository.getRecommendedQuestionIds();
    const questions = ids
      .map((id) => this.getQuestion(id))
      .filter((q): q is ExecutiveQuestion => q !== null);

    if (context?.missionId) {
      const missionAligned = this.listQuestions({ missionId: context.missionId });
      const merged = [...questions];
      for (const q of missionAligned.slice(0, 2)) {
        if (!merged.some((m) => m.id === q.id)) merged.push(q);
      }
      return merged.sort((a, b) => compareExecutivePriority(a.priority, b.priority));
    }

    return questions.sort((a, b) => compareExecutivePriority(a.priority, b.priority));
  }

  listQuestionRelationships(): ExecutiveQuestionRelationship[] {
    return listQuestionRelationships();
  }
}

export const executiveQuestionService = new ExecutiveQuestionService();

export function listQuestions(filter?: ExecutiveQuestionFilter) {
  return executiveQuestionService.listQuestions(filter);
}

export function getQuestion(id: ExecutiveQuestionId) {
  return executiveQuestionService.getQuestion(id);
}
