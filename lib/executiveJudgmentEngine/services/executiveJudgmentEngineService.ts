import { judgmentSampleRepository } from "../repositories/sample";
import type {
  ExecutiveJudgmentBootstrap,
  ExecutiveJudgmentView,
  JudgmentDetailView,
  RecommendationPyramid,
} from "../types";

export function getExecutiveJudgmentBootstrap(): ExecutiveJudgmentBootstrap {
  const sorted = [...judgmentSampleRepository.recommendations()].sort(
    (a, b) => b.compositeScore - a.compositeScore,
  );
  const primary = sorted[0]!;
  return {
    principle: judgmentSampleRepository.principle(),
    todaysQuestion: judgmentSampleRepository.todaysQuestion(),
    recommendationCount: sorted.length,
    notNowCount: judgmentSampleRepository.notNow().length,
    primaryHeadline: primary.headline,
  };
}

export function composeRecommendationPyramid(): RecommendationPyramid {
  const sorted = [...judgmentSampleRepository.recommendations()].sort(
    (a, b) => b.compositeScore - a.compositeScore,
  );
  return {
    primary: sorted[0]!,
    supporting: sorted.slice(1, 3),
    canWait: sorted.slice(3, 6),
  };
}

export function composeExecutiveJudgmentView(): ExecutiveJudgmentView {
  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    principle: judgmentSampleRepository.principle(),
    todaysQuestion: judgmentSampleRepository.todaysQuestion(),
    pyramid: composeRecommendationPyramid(),
    whyNot: judgmentSampleRepository.whyNot(),
    notNowLibrary: judgmentSampleRepository.notNow(),
    learningLoop: judgmentSampleRepository.learningLoop(),
  };
}

export function composeJudgmentDetail(recommendationId: string): JudgmentDetailView | null {
  const recommendation = judgmentSampleRepository.getRecommendation(recommendationId);
  if (!recommendation) return null;
  return {
    product: "founder",
    recommendation,
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveJudgmentEngineService {
  view() {
    return composeExecutiveJudgmentView();
  }

  detail(recommendationId: string) {
    return composeJudgmentDetail(recommendationId);
  }

  bootstrap() {
    return getExecutiveJudgmentBootstrap();
  }

  sampleRepository() {
    return judgmentSampleRepository;
  }
}

export const executiveJudgmentEngineService = new ExecutiveJudgmentEngineService();
