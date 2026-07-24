/**
 * Phase 5 — Strategy Synthesis Engine entry.
 * Advises the shared Strategy engine; does not override readiness, confirmation, or stages.
 */

import type { StrategyWorkItem } from "../../types";
import { shouldPreferStabilizeOrTest } from "../frameworks/capacityFit";
import { getDomainIntelligence } from "../domainIntelligence";
import { extractDomainContributions } from "./extractContributions";
import {
  contributionsOfType,
  dedupeLines,
  mergeDomainContributions,
} from "./mergeContributions";
import { detectSynthesisConflicts } from "./resolveConflicts";
import { selectStrategyDomains } from "./selectDomains";
import { synthesizeOptionPatternCandidates } from "./synthesizeOptionCandidates";
import { synthesizeSuggestedNextQuestion } from "./synthesizeNextQuestion";
import {
  synthesizeExperimentHint,
  synthesizeIntegratedRiskSummaries,
  synthesizeMemberFacingRecommendation,
} from "./synthesizeRecommendation";
import { synthesizeStrategicQuestion } from "./synthesizeStrategicQuestion";
import type { StrategySynthesisResult } from "./types";

function itemText(item: StrategyWorkItem, lastAnswer?: string): string {
  return [
    item.decisionStatement,
    item.currentReality,
    item.desiredDirection,
    ...(item.constraints ?? []),
    ...(item.memberStatements ?? []),
    lastAnswer,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Synthesize cross-domain intelligence for one Strategy Work Item turn.
 */
export function synthesizeStrategyDomains(
  item: StrategyWorkItem,
  opts?: { lastAnswer?: string },
): StrategySynthesisResult {
  const text = itemText(item, opts?.lastAnswer);
  const selection = selectStrategyDomains(item, opts);

  if (selection.needsClarification) {
    return {
      selection,
      strategicQuestion:
        "What feels like the most important decision to get clear on first?",
      suggestedNextQuestion:
        "What feels like the most important decision to get clear on first?",
      relevantEvidencePrompts: [],
      assumptionsToSurface: [],
      constraintsToRespect: [],
      contributions: [],
      confidence: "low",
      memberFacingRecommendation: synthesizeMemberFacingRecommendation({
        primaryId: selection.primaryDomainId,
        confidence: "low",
        conflicts: [],
      }),
      synthesisSummary: "Low-confidence diffuse ask — clarify before loading domains.",
    };
  }

  // Partial/unavailable secondary: do not invent knowledge
  const secondaryId =
    selection.secondaryStatus === "unavailable"
      ? undefined
      : selection.secondaryDomainId;

  const primary = extractDomainContributions(
    selection.primaryDomainId,
    "primary",
    text,
  );
  const secondary =
    secondaryId && selection.secondaryStatus !== "unavailable"
      ? extractDomainContributions(secondaryId, "secondary", text)
      : [];

  // Partial packs still contribute registry-level StrategyTypeContract knowledge only
  const contributions = mergeDomainContributions(primary, secondary);
  const conflicts = detectSynthesisConflicts(
    selection.primaryDomainId,
    secondaryId,
    text,
  );

  const underlyingHints = contributionsOfType(contributions, "question", 3);
  const strategicQuestion = synthesizeStrategicQuestion({
    primaryId: selection.primaryDomainId,
    secondaryId,
    surfaceStatement: item.decisionStatement || "",
    conflicts,
    underlyingHints,
  });

  const suggestedNextQuestion = synthesizeSuggestedNextQuestion({
    primaryId: selection.primaryDomainId,
    secondaryId,
    conflicts,
    needsClarification: selection.needsClarification,
    surfaceStatement: item.decisionStatement || "",
  });

  const capacityTight = shouldPreferStabilizeOrTest(item);
  const optionPatternCandidates = synthesizeOptionPatternCandidates({
    primaryId: selection.primaryDomainId,
    secondaryId,
    text,
    contributions,
    capacityTight,
  });

  const evidence = dedupeLines(
    contributionsOfType(contributions, "evidence", 4),
    3,
  );
  const assumptions = dedupeLines(
    contributionsOfType(contributions, "assumption", 4),
    3,
  );
  const constraints = dedupeLines(
    [
      ...contributionsOfType(contributions, "constraint", 3),
      ...contributionsOfType(contributions, "capacity", 3),
    ],
    4,
  );
  const tradeoffs = dedupeLines(
    contributionsOfType(contributions, "tradeoff", 5),
    4,
  );
  const riskLines = contributionsOfType(contributions, "risk", 4);
  const integratedRiskSummaries = synthesizeIntegratedRiskSummaries({
    primaryId: selection.primaryDomainId,
    secondaryId,
    riskLines,
  });

  const primaryDomain = getDomainIntelligence(selection.primaryDomainId);
  const confidence =
    conflicts.some((c) => c.materiality === "high" && c.preferClarify)
      ? "moderate"
      : selection.confidence;

  const memberFacingRecommendation = synthesizeMemberFacingRecommendation({
    primaryId: selection.primaryDomainId,
    secondaryId,
    conflicts,
    confidence,
    strategicQuestion,
  });

  const experimentHint = synthesizeExperimentHint({
    primaryId: selection.primaryDomainId,
    secondaryId,
    conflicts,
  });

  const synthesisSummary = secondaryId
    ? `Integrated ${selection.primaryDomainId} with supporting ${secondaryId}${
        selection.secondaryStatus === "partial" ? " (partial pack)" : ""
      }: ${conflicts[0]?.resolution || selection.secondaryReason || "merged"}`
    : `Primary ${selection.primaryDomainId} only`;

  return {
    selection: {
      ...selection,
      secondaryDomainId: secondaryId,
      confidence,
    },
    strategicQuestion,
    suggestedNextQuestion,
    relevantEvidencePrompts: evidence,
    assumptionsToSurface: assumptions,
    constraintsToRespect: constraints,
    optionPatternCandidates,
    tradeoffs,
    integratedRiskSummaries,
    experimentHint,
    memberFacingRecommendation,
    conflictNotes: conflicts.length ? conflicts : undefined,
    contributions,
    confidence,
    synthesisSummary,
    recommendedDestination: primaryDomain?.handoffDestinations?.[0],
  };
}
