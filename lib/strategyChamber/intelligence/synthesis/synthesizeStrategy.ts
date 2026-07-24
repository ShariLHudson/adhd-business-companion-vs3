/**
 * Phase 5 — Strategy Synthesis Engine entry.
 * Combines primary + optional secondary domain into one coherent package.
 * Shared Strategy engine remains final authority for options, readiness, confirmation.
 */

import type { StrategyWorkItem } from "../../types";
import { shouldPreferStabilizeOrTest } from "../frameworks/capacityFit";
import { getDomainIntelligence } from "../domainIntelligence";
import { extractDomainContributions } from "./extractContributions";
import {
  contributionsOfType,
  mergeDomainContributions,
} from "./mergeContributions";
import { detectSynthesisConflicts } from "./resolveConflicts";
import { selectStrategyDomains } from "./selectDomains";
import { synthesizeOptionPatternCandidates } from "./synthesizeOptionCandidates";
import { synthesizeStrategicQuestion } from "./synthesizeStrategicQuestion";
import type { StrategySynthesisResult } from "./types";

function itemText(item: StrategyWorkItem, lastAnswer?: string): string {
  return [
    item.decisionStatement,
    item.currentReality,
    item.desiredDirection,
    ...(item.memberStatements ?? []),
    lastAnswer,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Synthesize cross-domain intelligence for one Strategy Work Item turn.
 * Does not write storage. Does not bypass readiness or confirmation.
 */
export function synthesizeStrategyDomains(
  item: StrategyWorkItem,
  opts?: { lastAnswer?: string },
): StrategySynthesisResult {
  const text = itemText(item, opts?.lastAnswer);
  const selection = selectStrategyDomains(item, opts);
  const primary = extractDomainContributions(selection.primaryDomainId, "primary");
  const secondary = selection.secondaryDomainId
    ? extractDomainContributions(selection.secondaryDomainId, "secondary")
    : [];
  const contributions = mergeDomainContributions(primary, secondary);
  const conflicts = detectSynthesisConflicts(
    selection.primaryDomainId,
    selection.secondaryDomainId,
    text,
  );

  const underlyingHints = contributionsOfType(contributions, "question", 3);
  const strategicQuestion = synthesizeStrategicQuestion({
    primaryId: selection.primaryDomainId,
    secondaryId: selection.secondaryDomainId,
    surfaceStatement: item.decisionStatement || "",
    conflicts,
    underlyingHints,
  });

  const capacityTight = shouldPreferStabilizeOrTest(item);
  const optionPatternCandidates = synthesizeOptionPatternCandidates({
    primaryId: selection.primaryDomainId,
    secondaryId: selection.secondaryDomainId,
    text,
    contributions,
    capacityTight,
  });

  const evidence = contributionsOfType(contributions, "evidence", 4);
  const assumptions = contributionsOfType(contributions, "assumption", 4);
  const constraints = [
    ...contributionsOfType(contributions, "constraint", 3),
    ...contributionsOfType(contributions, "capacity", 3),
  ].slice(0, 5);
  const tradeoffs = contributionsOfType(contributions, "tradeoff", 4);

  const primaryDomain = getDomainIntelligence(selection.primaryDomainId);
  const secondaryDomain = selection.secondaryDomainId
    ? getDomainIntelligence(selection.secondaryDomainId)
    : null;

  const synthesisSummary = selection.secondaryDomainId
    ? `Primary ${selection.primaryDomainId} with supporting ${selection.secondaryDomainId}: ${
        conflicts[0]?.resolution || selection.secondaryReason || "merged contributions"
      }`
    : `Primary ${selection.primaryDomainId} only`;

  return {
    selection,
    strategicQuestion,
    relevantEvidencePrompts: evidence,
    assumptionsToSurface: assumptions,
    constraintsToRespect: constraints,
    optionPatternCandidates,
    tradeoffs,
    conflictNotes: conflicts.length ? conflicts : undefined,
    contributions,
    confidence: selection.confidence,
    synthesisSummary,
    recommendedDestination:
      primaryDomain?.handoffDestinations?.[0] ||
      secondaryDomain?.handoffDestinations?.[0],
  };
}
