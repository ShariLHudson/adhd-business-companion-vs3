/**
 * Phase 4 — Domain Intelligence Registry.
 * Strategy Chamber loads the relevant domain from what the member is deciding.
 * Same judgment engine; different knowledge contribution per domain.
 *
 * Build order (canonical milestone sequence):
 * Pricing → Growth → Offer → Customer/Market → Capacity/Focus →
 * Hiring/Delegation → Partnership → Pivot/Rethink → Personal Direction →
 * Business Direction / 90-Day Strategy
 */

import type { StrategyFamilyId } from "../../types";
import {
  getStrategyType,
  listStrategyTypes,
  matchStrategyTypesFromText,
  resolvePrimaryStrategyType,
} from "../registry";
import type {
  DomainProblemDistinction,
  StrategyTypeContract,
  StrategyTypeId,
} from "../types";

/** Full Phase 4 domain build order — all modules that plug into the engine. */
export const DOMAIN_INTELLIGENCE_BUILD_ORDER: readonly StrategyTypeId[] = [
  "pricing",
  "growth",
  "offer",
  "market_customer",
  "capacity_focus",
  "hiring_delegation",
  "partnership",
  "pivot_rethink",
  "personal_direction",
  "business_direction",
  "ninety_day",
] as const;

/** @deprecated Prefer DOMAIN_INTELLIGENCE_BUILD_ORDER — kept for callers expecting “signature nine”. */
export const DOMAIN_INTELLIGENCE_IDS = DOMAIN_INTELLIGENCE_BUILD_ORDER;

export function isDomainIntelligenceId(
  id: StrategyTypeId | string | null | undefined,
): boolean {
  return Boolean(
    id && (DOMAIN_INTELLIGENCE_BUILD_ORDER as readonly string[]).includes(id),
  );
}

export function listDomainIntelligenceModules(): StrategyTypeContract[] {
  return DOMAIN_INTELLIGENCE_BUILD_ORDER.map((id) => getStrategyType(id)).filter(
    (t): t is StrategyTypeContract => Boolean(t),
  );
}

export function getDomainIntelligence(
  id: StrategyTypeId | string | null | undefined,
): StrategyTypeContract | null {
  return getStrategyType(id);
}

/** Auto-load domain from decision language. */
export function resolveDomainForDecision(
  text: string,
): StrategyTypeContract | null {
  return resolvePrimaryStrategyType(text);
}

export function matchDomainsForDecision(
  text: string,
): Array<{ domain: StrategyTypeContract; score: number }> {
  return matchStrategyTypesFromText(text).map(({ type, score }) => ({
    domain: type,
    score,
  }));
}

export function familyForStrategyTypeId(
  id: StrategyTypeId | null | undefined,
): StrategyFamilyId {
  if (id === "pricing") return "money_and_resources";
  if (id === "hiring_delegation" || id === "partnership") {
    return "people_and_leadership";
  }
  if (id === "growth" || id === "market_customer") return "customer_and_market";
  if (id === "offer") return "offers_and_innovation";
  if (id === "capacity_focus" || id === "personal_direction") {
    return "personal_direction";
  }
  return "business_direction";
}

/**
 * Match a problem distinction inside an active domain from member text / reality.
 */
export function matchProblemDistinction(
  domain: StrategyTypeContract | null | undefined,
  text: string,
): DomainProblemDistinction | null {
  if (!domain?.problemDistinctions?.length) return null;
  const t = text.trim().toLowerCase();
  if (!t) return null;
  let best: { dist: DomainProblemDistinction; hits: number } | null = null;
  for (const dist of domain.problemDistinctions) {
    let hits = 0;
    for (const signal of dist.whenToSuspect) {
      const needle = signal.trim().toLowerCase();
      if (needle && t.includes(needle)) hits += 1;
    }
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { dist, hits };
    }
  }
  return best?.dist ?? null;
}

/** Heuristic: does this domain treat expansion as non-default? */
export function domainPrefersRestraint(
  domain: StrategyTypeContract | null | undefined,
): boolean {
  if (!domain) return false;
  return domain.guidingPrinciples.some((p) =>
    /do not (default|grow|pivot)|last resort|doing less|don'?t grow/i.test(p),
  );
}

/** All registered strategy types (domain + shells) — for audits. */
export function listAllStrategyDomainContracts(): StrategyTypeContract[] {
  return listStrategyTypes();
}
