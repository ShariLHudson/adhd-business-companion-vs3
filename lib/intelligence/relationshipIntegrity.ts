/**
 * Relationship Integrity Rule™ (Prompt 141)
 *
 * Everything Knows What It Belongs To — but edges are never invented
 * from similar titles or fuzzy name match alone.
 *
 * @see docs/platform/141_UNIFIED_BUSINESS_INTELLIGENCE_AND_RELATIONSHIP_ENGINE_REPORT.md
 * @see .cursor/rules/relationship-integrity.mdc
 */

/** Allowed provenance for durable relationship edges. */
export type RelationshipEdgeSource =
  | "creation_flow_lineage"
  | "explicit_user_link"
  | "shared_work_project_context"
  | "user_confirmed";

export const RELATIONSHIP_EDGE_SOURCES: readonly RelationshipEdgeSource[] = [
  "creation_flow_lineage",
  "explicit_user_link",
  "shared_work_project_context",
  "user_confirmed",
] as const;

/**
 * Match reasons from findRelatedWork that may only suggest —
 * never auto-create a graph edge.
 */
export const SUGGESTION_ONLY_MATCH_REASONS = [
  "similar_title_or_intent",
  "same_work_type",
  "related_blueprint",
] as const;

export type SuggestionOnlyMatchReason =
  (typeof SUGGESTION_ONLY_MATCH_REASONS)[number];

/** Match reasons backed by explicit context (safe to surface as related). */
export const TRUSTED_MATCH_REASONS = [
  "hinted_work_id",
  "matching_cartography_node",
  "related_project",
  "related_conversation",
  "matching_chamber_or_board",
] as const;

export type TrustedMatchReason = (typeof TRUSTED_MATCH_REASONS)[number];

export function isRelationshipEdgeSource(
  value: unknown,
): value is RelationshipEdgeSource {
  return (
    typeof value === "string" &&
    (RELATIONSHIP_EDGE_SOURCES as readonly string[]).includes(value)
  );
}

/** Durable edges require one of the four trusted sources. */
export function canCreateRelationshipEdge(
  source: RelationshipEdgeSource | null | undefined,
): boolean {
  return isRelationshipEdgeSource(source);
}

export function isSuggestionOnlyMatchReason(reason: string): boolean {
  return (SUGGESTION_ONLY_MATCH_REASONS as readonly string[]).includes(reason);
}

export function isTrustedMatchReason(reason: string): boolean {
  return (TRUSTED_MATCH_REASONS as readonly string[]).includes(reason);
}

/**
 * A hit may be used for edge creation only when it has at least one
 * trusted reason and is not relying solely on suggestion-only signals.
 */
export function mayAutoLinkFromMatchReasons(
  matchReasons: readonly string[],
): boolean {
  if (matchReasons.length === 0) return false;
  const hasTrusted = matchReasons.some(isTrustedMatchReason);
  const onlySuggestions = matchReasons.every(isSuggestionOnlyMatchReason);
  return hasTrusted && !onlySuggestions;
}

/**
 * When ambiguous (suggestion-only overlap), require member confirmation
 * before creating an edge. Never invent from titles alone.
 */
export function relationshipLinkDecision(
  matchReasons: readonly string[],
): "auto_link_ok" | "needs_user_confirmation" | "do_not_link" {
  if (mayAutoLinkFromMatchReasons(matchReasons)) return "auto_link_ok";
  if (matchReasons.some(isSuggestionOnlyMatchReason)) {
    return "needs_user_confirmation";
  }
  if (matchReasons.some(isTrustedMatchReason)) return "auto_link_ok";
  return "do_not_link";
}
