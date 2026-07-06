import type {
  ExecutiveEcosystemConnection,
  ExecutiveExplanation,
  ExecutiveLearning,
  ExecutiveRecommendedActionKind,
} from "../types";
import { ensureShortSentences, stripExecutiveJargon } from "./readabilityHelpers";

export type ExplanationInput = {
  title: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  actionKind: ExecutiveRecommendedActionKind;
  connections: ExecutiveEcosystemConnection[];
  sparkEffect: string;
  businessEffect: string;
};

export function buildExecutiveExplanation(input: ExplanationInput): ExecutiveExplanation {
  return {
    whatHappened: ensureShortSentences(stripExecutiveJargon(input.whatHappened)),
    whyShouldICare: ensureShortSentences(
      stripExecutiveJargon(
        `${input.whyItMatters} For the business: ${input.businessEffect}. For Spark: ${input.sparkEffect}.`,
      ),
    ),
    whatShouldWeDo: ensureShortSentences(stripExecutiveJargon(input.recommendedAction)),
    connections: input.connections,
    actionKind: input.actionKind,
  };
}

export function buildExecutiveLearning(input: {
  title: string;
  simple: string;
  detail: string;
  why: string;
  sparkUse: string;
  problem: string;
}): ExecutiveLearning {
  return {
    explainSimply: stripExecutiveJargon(input.simple),
    explainInDetail: stripExecutiveJargon(input.detail),
    teachWhyItMatters: stripExecutiveJargon(input.why),
    howSparkCouldUseThis: stripExecutiveJargon(input.sparkUse),
    whatProblemDoesThisSolve: stripExecutiveJargon(input.problem),
  };
}

export function labelForActionKind(kind: ExecutiveRecommendedActionKind): string {
  const labels: Record<ExecutiveRecommendedActionKind, string> = {
    "keep-watching": "Keep watching",
    "research-further": "Research further",
    "build-later": "Build later",
    "add-to-roadmap": "Add to roadmap",
    "discuss-strategy-center": "Discuss in Strategy Center",
    "create-workshop": "Create a workshop",
    "write-content": "Write content",
    ignore: "Ignore for now",
    "build-now": "Build now",
  };
  return labels[kind];
}
