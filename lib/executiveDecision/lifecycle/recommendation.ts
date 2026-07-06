import type { DecisionRecommendation, ExecutiveDecision, FounderGuidance } from "../types";
import { compareOptions } from "./optionComparison";

function plainEnglishFromGuidance(g: FounderGuidance): string[] {
  return [
    `What happened? ${g.whatHappened}`,
    `Why should I care? ${g.whyCare}`,
    `What are my options? ${g.options.join(" · ")}`,
    `Which option do you recommend? ${g.recommendation}`,
    `Why? ${g.why}`,
    `What happens if I do nothing? ${g.ifNothing}`,
    `What should we prepare? ${g.prepare.join(" · ")}`,
    `What would you do if this were Visual Spark Studios? ${g.visualSparkStudios}`,
  ];
}

export function recommendOption(decision: ExecutiveDecision): DecisionRecommendation | null {
  if (decision.recommendation) return decision.recommendation;
  if (decision.options.length === 0) return null;

  const comparison = compareOptions(decision);
  const top = comparison.options[0];
  const guidance = buildFounderGuidance(decision, top.id);

  return {
    decisionId: decision.id,
    recommendedOptionId: top.id,
    headline: `Recommend: ${top.label}`,
    why: top.summary,
    whatHappensIfNothing: "Status quo continues — opportunity may pass or problem may persist.",
    whatToPrepare: ["Implementation draft", "Approval checklist", "Decision Vault entry"],
    visualSparkStudiosPerspective: guidance.visualSparkStudios,
    plainEnglishSummary: plainEnglishFromGuidance(guidance),
    confidence: top.confidence,
    recommendedAt: new Date().toISOString(),
  };
}

export function buildFounderGuidance(decision: ExecutiveDecision, recommendedOptionId?: string): FounderGuidance {
  const rec = decision.recommendation ?? recommendOption(decision);
  const recommended = decision.options.find((o) => o.id === (recommendedOptionId ?? rec?.recommendedOptionId));

  return {
    whatHappened: decision.opportunity,
    whyCare: decision.whyItMatters,
    options: decision.options.map((o) => `${o.label}: ${o.summary}`),
    recommendation: recommended?.label ?? "No recommendation yet.",
    why: rec?.why ?? recommended?.summary ?? "",
    ifNothing: rec?.whatHappensIfNothing ?? "Nothing changes until you decide.",
    prepare: rec?.whatToPrepare ?? ["Draft plan only — nothing executes without approval."],
    visualSparkStudios:
      rec?.visualSparkStudiosPerspective ??
      "I would protect trust first, then scale what already works.",
  };
}
