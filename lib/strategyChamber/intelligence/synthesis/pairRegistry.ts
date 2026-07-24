/**
 * Valid primary→secondary Strategy domain pairs.
 * Incomplete domain packs are marked partial/unavailable — never invent knowledge.
 */

import type { StrategyTypeId } from "../types";
import type { StrategyDomainPairRule } from "./types";

export const STRATEGY_DOMAIN_PAIR_RULES: StrategyDomainPairRule[] = [
  {
    primaryDomainId: "pricing",
    secondaryDomainId: "growth",
    status: "active",
    useWhen: ["Price decision mixed with demand or conversion"],
    avoidWhen: ["Pure new-member price change with clear evidence"],
    contributionPriorities: ["question", "assumption", "option", "risk", "experiment"],
    commonConflicts: ["Raise price vs weak demand"],
    mergeGuidance: ["Diagnose demand quality before a broad raise"],
    version: "1",
  },
  {
    primaryDomainId: "pricing",
    secondaryDomainId: "capacity_focus",
    status: "active",
    useWhen: ["Price and delivery burden are mixed"],
    avoidWhen: ["Price-only ask with stable delivery"],
    contributionPriorities: ["capacity", "constraint", "option", "risk", "experiment"],
    commonConflicts: ["Raise vs reduce scope"],
    mergeGuidance: ["Compare price, scope, and both"],
    version: "1",
  },
  {
    primaryDomainId: "growth",
    secondaryDomainId: "capacity_focus",
    status: "active",
    useWhen: ["Growth desire with overload or delivery strain"],
    avoidWhen: ["Clear acquisition gap with spare capacity"],
    contributionPriorities: ["capacity", "constraint", "option", "risk", "experiment"],
    commonConflicts: ["Expand vs stabilize"],
    mergeGuidance: ["Stabilize or stage before volume"],
    version: "1",
  },
  {
    primaryDomainId: "growth",
    secondaryDomainId: "market_customer",
    status: "partial",
    useWhen: ["Activity without qualified demand or fit"],
    avoidWhen: ["Clear retention or capacity constraint"],
    contributionPriorities: ["question", "evidence", "assumption", "experiment"],
    commonConflicts: ["More reach vs better fit"],
    mergeGuidance: ["Distinguish attention from qualified demand"],
    version: "1",
  },
  {
    primaryDomainId: "growth",
    secondaryDomainId: "pricing",
    status: "active",
    useWhen: ["Volume present but revenue weak"],
    avoidWhen: ["Pure awareness problem with spare capacity"],
    contributionPriorities: ["question", "option", "tradeoff", "experiment"],
    commonConflicts: ["More customers vs value per customer"],
    mergeGuidance: ["Do not default to more customers"],
    version: "1",
  },
  {
    primaryDomainId: "offer",
    secondaryDomainId: "market_customer",
    status: "partial",
    useWhen: ["Offer idea without clear audience"],
    avoidWhen: ["Audience already confirmed"],
    contributionPriorities: ["question", "evidence", "experiment", "assumption"],
    commonConflicts: ["Build offer vs clarify who"],
    mergeGuidance: ["Validate audience before full offer build"],
    version: "1",
  },
  {
    primaryDomainId: "offer",
    secondaryDomainId: "capacity_focus",
    status: "partial",
    useWhen: ["New offer would add delivery load"],
    avoidWhen: ["Lightweight offer with spare capacity"],
    contributionPriorities: ["capacity", "constraint", "option"],
    commonConflicts: ["Launch vs focus"],
    mergeGuidance: ["Maintenance burden of new offers"],
    version: "1",
  },
  {
    primaryDomainId: "hiring_delegation",
    secondaryDomainId: "capacity_focus",
    status: "partial",
    useWhen: ["Hire request driven by overload"],
    avoidWhen: ["Clear specialized skill gap only"],
    contributionPriorities: ["capacity", "constraint", "option", "experiment"],
    commonConflicts: ["Hire vs simplify"],
    mergeGuidance: ["Identify work that does not require the founder"],
    version: "1",
  },
  {
    primaryDomainId: "hiring_delegation",
    secondaryDomainId: "growth",
    status: "partial",
    useWhen: ["Hire framed as required for growth"],
    avoidWhen: ["Hire unrelated to growth"],
    contributionPriorities: ["question", "constraint", "experiment", "option"],
    commonConflicts: ["Hire assumed necessary"],
    mergeGuidance: ["Hiring only if it removes the growth constraint"],
    version: "1",
  },
  {
    primaryDomainId: "partnership",
    secondaryDomainId: "business_direction",
    status: "partial",
    useWhen: ["Partnership may redirect the business"],
    avoidWhen: ["Small reversible co-marketing test"],
    contributionPriorities: ["question", "risk", "constraint", "experiment"],
    commonConflicts: ["Partnership vs focus"],
    mergeGuidance: ["Direction fit before commitment"],
    version: "1",
  },
  {
    primaryDomainId: "pivot_rethink",
    secondaryDomainId: "market_customer",
    status: "partial",
    useWhen: ["Pivot may be an audience or market issue"],
    avoidWhen: ["Clear product failure with strong market evidence"],
    contributionPriorities: ["question", "evidence", "assumption", "experiment"],
    commonConflicts: ["Full pivot vs refine audience"],
    mergeGuidance: ["Market evidence before irreversible pivot"],
    version: "1",
  },
  {
    primaryDomainId: "personal_direction",
    secondaryDomainId: "capacity_focus",
    status: "partial",
    useWhen: ["Life/work direction mixed with overload"],
    avoidWhen: ["Pure values decision with stable capacity"],
    contributionPriorities: ["capacity", "constraint", "question"],
    commonConflicts: ["Ambition vs energy"],
    mergeGuidance: ["Protect capacity while clarifying direction"],
    version: "1",
  },
];

export function getPairRule(
  primaryId: StrategyTypeId,
  secondaryId: StrategyTypeId,
): StrategyDomainPairRule | null {
  return (
    STRATEGY_DOMAIN_PAIR_RULES.find(
      (r) =>
        r.primaryDomainId === primaryId && r.secondaryDomainId === secondaryId,
    ) ?? null
  );
}

export function isPairAllowed(
  primaryId: StrategyTypeId,
  secondaryId: StrategyTypeId,
): boolean {
  const rule = getPairRule(primaryId, secondaryId);
  return Boolean(rule && rule.status !== "unavailable");
}
