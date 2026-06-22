/**
 * Sprint 2B-B PR 2 — Stable Intervention Registry v1.
 * Learning identity is bucket-based; UI slugs and copy may change via legacyAliases.
 */

export type InterventionBucket =
  | "breathing"
  | "clear_mind"
  | "brain_dump"
  | "reset"
  | "momentum_prompt"
  | "workspace_open"
  | "create"
  | "plan_my_day"
  | "future_shari_offer"
  | "generic_tip";

export type InterventionClass =
  | "suggestion"
  | "intervention"
  | "coaching"
  | "workspace_route"
  | "checkin";

/** Existing relationship.trust trait paths only — no new traits in PR 2. */
export type TrustTraitPath =
  | "relationship.trust.responds_to_suggestions"
  | "relationship.trust.ignores_generic_suggestions"
  | "relationship.trust.momentum_from_interventions"
  | "relationship.trust.disengages_from_nagging";

export type InterventionRegistryEntry = {
  bucket: InterventionBucket;
  class: InterventionClass;
  legacyAliases: readonly string[];
  trustTraitPaths: readonly TrustTraitPath[];
  deprecated?: boolean;
};

const TRUST_RESPONDS = "relationship.trust.responds_to_suggestions" as const;
const TRUST_IGNORES_GENERIC = "relationship.trust.ignores_generic_suggestions" as const;
const TRUST_MOMENTUM = "relationship.trust.momentum_from_interventions" as const;
const TRUST_NAGGING = "relationship.trust.disengages_from_nagging" as const;

const INTERVENTION_REGISTRY: readonly InterventionRegistryEntry[] = [
  {
    bucket: "breathing",
    class: "intervention",
    legacyAliases: ["breathe", "breathing", "breathing-exercise", "breathing_exercise"],
    trustTraitPaths: [TRUST_MOMENTUM, TRUST_RESPONDS],
  },
  {
    bucket: "clear_mind",
    class: "intervention",
    legacyAliases: ["clear-mind", "clear_mind", "clear-my-mind", "clear_my_mind"],
    trustTraitPaths: [TRUST_MOMENTUM, TRUST_RESPONDS],
  },
  {
    bucket: "brain_dump",
    class: "intervention",
    legacyAliases: ["brain-dump", "brain_dump", "feature.brain_dump_used"],
    trustTraitPaths: [TRUST_MOMENTUM, TRUST_RESPONDS],
  },
  {
    bucket: "reset",
    class: "intervention",
    legacyAliases: [
      "loop_offer",
      "activation_offer",
      "safe_for_today",
      "breathe-and-reset",
    ],
    trustTraitPaths: [TRUST_MOMENTUM, TRUST_RESPONDS],
  },
  {
    bucket: "momentum_prompt",
    class: "suggestion",
    legacyAliases: [
      "momentum_offer",
      "get-unstuck",
      "get_unstuck",
      "momentum_prompt",
    ],
    trustTraitPaths: [TRUST_RESPONDS],
  },
  {
    bucket: "workspace_open",
    class: "workspace_route",
    legacyAliases: [
      "workspace_open",
      "workspace.offer_accept",
      "workspace_offer_accept",
      "open_workspace",
    ],
    trustTraitPaths: [TRUST_RESPONDS],
  },
  {
    bucket: "create",
    class: "workspace_route",
    legacyAliases: ["create", "create_workspace", "content_generator"],
    trustTraitPaths: [TRUST_RESPONDS, TRUST_MOMENTUM],
  },
  {
    bucket: "plan_my_day",
    class: "workspace_route",
    legacyAliases: [
      "plan_my_day",
      "plan-my-day",
      "day_designer",
      "day-designer",
      "suggestion:plan-my-day",
      "suggestion:plan_my_day",
    ],
    trustTraitPaths: [TRUST_RESPONDS],
  },
  {
    bucket: "future_shari_offer",
    class: "suggestion",
    legacyAliases: ["future_shari_offer", "future-shari-offer", "future_shari"],
    trustTraitPaths: [TRUST_RESPONDS],
  },
  {
    bucket: "generic_tip",
    class: "suggestion",
    legacyAliases: [
      "generic_tip",
      "generic-tip",
      "suggestion:generic-tip",
      "suggestion:generic_tip",
      "focus-session",
      "focus_session",
      "spin-wheel",
      "spin_wheel",
      "tool_suggestion",
    ],
    trustTraitPaths: [TRUST_RESPONDS, TRUST_IGNORES_GENERIC, TRUST_NAGGING],
  },
] as const;

const BUCKET_SET = new Set<string>(INTERVENTION_REGISTRY.map((e) => e.bucket));

const ALIAS_TO_BUCKET = new Map<string, InterventionBucket>();

for (const entry of INTERVENTION_REGISTRY) {
  ALIAS_TO_BUCKET.set(normalizeOfferKey(entry.bucket), entry.bucket);
  for (const alias of entry.legacyAliases) {
    ALIAS_TO_BUCKET.set(normalizeOfferKey(alias), entry.bucket);
  }
}

function normalizeOfferKey(input: string): string {
  return input.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function listInterventionBuckets(): InterventionBucket[] {
  return INTERVENTION_REGISTRY.map((e) => e.bucket);
}

export function getInterventionRegistry(): readonly InterventionRegistryEntry[] {
  return INTERVENTION_REGISTRY;
}

export function lookupInterventionEntry(
  bucket: InterventionBucket,
): InterventionRegistryEntry | null {
  return INTERVENTION_REGISTRY.find((e) => e.bucket === bucket) ?? null;
}

export function isRegisteredInterventionBucket(
  bucket: string,
): bucket is InterventionBucket {
  return BUCKET_SET.has(bucket);
}

/**
 * Resolve a UI slug, offer id, or alias to a stable intervention bucket.
 * Returns null for unknown input — never throws.
 */
export function resolveOfferBucket(input: string | null | undefined): InterventionBucket | null {
  if (input == null) return null;
  const normalized = normalizeOfferKey(input);
  if (!normalized) return null;
  return ALIAS_TO_BUCKET.get(normalized) ?? null;
}
