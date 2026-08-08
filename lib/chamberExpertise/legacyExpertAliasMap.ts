/**
 * Legacy Expert Alias Map — Phase A.
 *
 * Maps existing, still-live expert identifiers to canonical Chamber
 * prefixes (see chamberExpertRegistry.ts). This does NOT delete or modify
 * the legacy registries — both keep running unchanged:
 *
 * - Phase 33: lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts
 *   (SPARK_ESTATE_EXPERT_TEAM_MEMBERS — 6 members)
 * - Estate Brain: lib/estateBrain/expertRegistry.ts
 *   (ESTATE_EXPERTS — 15 experts)
 *
 * Purpose: let resolveChamberExpertActivation.ts treat an already-computed
 * legacy expert ID (e.g. from EstateIntelligenceRoute.expertIds) as one
 * additional corroborating signal, without either legacy system needing to
 * know the canonical registry exists yet. See
 * docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md §1.3 and §7 Phase A/E.
 */

import type { ChamberExpertId } from "./types";

/** Phase 33 team member IDs -> canonical Chamber prefix. */
export const PHASE_33_TO_CANONICAL: Readonly<Record<string, ChamberExpertId>> = {
  momentum: "MOM",
  marketing: "MKT",
  content: "CNT",
  project: "PM",
  research: "RES",
  data: "DATA",
};

/**
 * Estate Brain expert IDs -> canonical Chamber prefix.
 *
 * Some Estate Brain experts are role-shaped (e.g. "copywriter") rather than
 * domain-shaped; each maps to the single closest canonical Chamber member.
 * `financial-educator` is registered in Estate Brain but never referenced
 * by any capability's expertIds today (see architecture doc §1.2) — mapped
 * here anyway so the alias table stays complete if that changes.
 */
export const ESTATE_BRAIN_TO_CANONICAL: Readonly<Record<string, ChamberExpertId>> = {
  copywriter: "CNT",
  "research-analyst": "RES",
  "marketing-expert": "MKT",
  "business-strategist": "STR",
  "sales-expert": "SALES",
  "instructional-designer": "LEARN",
  "project-manager": "PM",
  "adhd-coach": "MOM",
  "executive-coach": "LEAD",
  "writing-coach": "CNT",
  "technology-expert": "AI",
  "productivity-specialist": "MOM",
  "graphic-design-advisor": "CRE",
  "financial-educator": "FIN",
  "career-advisor": "STR",
};

/** Resolve any known legacy expert identifier to its canonical Chamber prefix. */
export function resolveLegacyExpertId(legacyId: string): ChamberExpertId | null {
  const normalized = legacyId.trim().toLowerCase();
  return (
    PHASE_33_TO_CANONICAL[normalized] ??
    ESTATE_BRAIN_TO_CANONICAL[normalized] ??
    null
  );
}

/** Resolve a list of legacy expert IDs (e.g. EstateIntelligenceRoute.expertIds) to canonical prefixes, de-duplicated. */
export function resolveLegacyExpertIds(
  legacyIds: readonly string[] | null | undefined,
): ChamberExpertId[] {
  if (!legacyIds || legacyIds.length === 0) return [];
  const resolved = new Set<ChamberExpertId>();
  for (const id of legacyIds) {
    const canonical = resolveLegacyExpertId(id);
    if (canonical) resolved.add(canonical);
  }
  return [...resolved];
}
