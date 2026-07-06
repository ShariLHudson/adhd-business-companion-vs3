import type { ExecutiveBriefItemCore, ExecutiveLearning } from "../types";
import { buildExecutiveLearning } from "../explanations/explanationBuilder";

export function attachLearningLayers(item: ExecutiveBriefItemCore): ExecutiveLearning {
  if (item.learning) return item.learning;
  return buildExecutiveLearning({
    title: item.title,
    simple: item.simpleExplanation,
    detail: item.businessExplanation,
    why: item.whyItMatters,
    sparkUse: item.howItAffectsSpark,
    problem: item.explanation.whatHappened,
  });
}

export function learningSectionsForItem(item: ExecutiveBriefItemCore): ExecutiveLearning {
  return attachLearningLayers(item);
}
