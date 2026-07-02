/**
 * Spark Knowledge Relationship Engine™
 * Related · Prerequisite · Advanced · Recommended Next · Learning Paths
 */

import type { KnowledgeCardDefinition, SuggestedLearningPathDefinition } from "@/lib/sparkMomentumInstitute/types";
import { getCatalogIndex, getKnowledgeCardById, loadInstituteCatalog } from "../catalog/provider";
import type {
  KnowledgeRelationshipKind,
  ResolvedKnowledgeRelationship,
  ResolvedLearningPathStep,
} from "./types";

export type RelationshipEngineContext = {
  /** Knowledge Card ids the member has completed */
  completedKnowledgeCardIds?: string[];
};

function sortByStrength<T extends { strength?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.strength ?? 0.5) - (a.strength ?? 0.5));
}

function prerequisitesMet(
  cardId: string,
  completed: Set<string>,
): { met: boolean; missing: string[] } {
  const card = getKnowledgeCardById(cardId);
  if (!card) return { met: false, missing: [] };

  const index = getCatalogIndex();
  const incoming = index.relationshipsToCard.get(cardId) ?? [];
  const prereqEdges = incoming.filter((r) => r.kind === "prerequisite");

  const directPrereqs = card.prerequisiteKnowledgeCardIds ?? [];
  const allPrereqIds = new Set([
    ...prereqEdges.map((e) => e.fromKnowledgeCardId),
    ...directPrereqs,
  ]);

  const missing = [...allPrereqIds].filter((id) => !completed.has(id));
  return { met: missing.length === 0, missing };
}

function resolveOutgoingEdges(
  cardId: string,
  kind: KnowledgeRelationshipKind,
  ctx: RelationshipEngineContext,
): ResolvedKnowledgeRelationship[] {
  const index = getCatalogIndex();
  const completed = new Set(ctx.completedKnowledgeCardIds ?? []);
  const outgoing = index.relationshipsFromCard.get(cardId) ?? [];
  const ofKind = sortByStrength(outgoing.filter((r) => r.kind === kind));

  return ofKind
    .map((relationship) => {
      const targetCard = index.byKnowledgeCardId.get(
        relationship.toKnowledgeCardId,
      );
      if (!targetCard) return null;

      const access = prerequisitesMet(targetCard.id, completed);
      return {
        relationship,
        targetCard,
        kind,
        accessible: access.met,
        blockedByPrerequisiteIds: access.met ? undefined : access.missing,
      };
    })
    .filter((r) => r !== null) as ResolvedKnowledgeRelationship[];
}

function resolvePrerequisiteEdges(
  cardId: string,
): ResolvedKnowledgeRelationship[] {
  const index = getCatalogIndex();
  const card = getKnowledgeCardById(cardId);
  if (!card) return [];

  const incoming = index.relationshipsToCard.get(cardId) ?? [];
  const prereqEdges = incoming.filter((r) => r.kind === "prerequisite");
  const directIds = card.prerequisiteKnowledgeCardIds ?? [];

  const seen = new Set<string>();
  const results: ResolvedKnowledgeRelationship[] = [];

  for (const relationship of sortByStrength(prereqEdges)) {
    const targetCard = index.byKnowledgeCardId.get(
      relationship.fromKnowledgeCardId,
    );
    if (!targetCard || seen.has(targetCard.id)) continue;
    seen.add(targetCard.id);
    results.push({
      relationship,
      targetCard,
      kind: "prerequisite",
      accessible: true,
    });
  }

  for (const prereqId of directIds) {
    if (seen.has(prereqId)) continue;
    const targetCard = index.byKnowledgeCardId.get(prereqId);
    if (!targetCard) continue;
    seen.add(prereqId);
    results.push({
      relationship: {
        id: `direct-prereq-${prereqId}-${cardId}`,
        fromKnowledgeCardId: prereqId,
        toKnowledgeCardId: cardId,
        kind: "prerequisite",
      },
      targetCard,
      kind: "prerequisite",
      accessible: true,
    });
  }

  return results;
}

export function getRelatedKnowledgeCards(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): ResolvedKnowledgeRelationship[] {
  return resolveOutgoingEdges(knowledgeCardId, "related", ctx);
}

export function getPrerequisiteKnowledgeCards(
  knowledgeCardId: string,
): ResolvedKnowledgeRelationship[] {
  return resolvePrerequisiteEdges(knowledgeCardId);
}

export function getAdvancedKnowledgeCards(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): ResolvedKnowledgeRelationship[] {
  return resolveOutgoingEdges(knowledgeCardId, "advanced", ctx);
}

export function getRecommendedNextKnowledgeCards(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): ResolvedKnowledgeRelationship[] {
  return resolveOutgoingEdges(knowledgeCardId, "recommended_next", ctx);
}

export function getAllKnowledgeRelationships(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): Record<KnowledgeRelationshipKind, ResolvedKnowledgeRelationship[]> {
  return {
    related: getRelatedKnowledgeCards(knowledgeCardId, ctx),
    prerequisite: getPrerequisiteKnowledgeCards(knowledgeCardId),
    advanced: getAdvancedKnowledgeCards(knowledgeCardId, ctx),
    recommended_next: getRecommendedNextKnowledgeCards(knowledgeCardId, ctx),
  };
}

export function canAccessKnowledgeCard(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): { accessible: boolean; blockedByPrerequisiteIds: string[] } {
  const completed = new Set(ctx.completedKnowledgeCardIds ?? []);
  const access = prerequisitesMet(knowledgeCardId, completed);
  return {
    accessible: access.met,
    blockedByPrerequisiteIds: access.missing,
  };
}

export function sparkSuggestedNextCards(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): KnowledgeCardDefinition[] {
  const recommended = getRecommendedNextKnowledgeCards(knowledgeCardId, ctx);
  const accessible = recommended.filter((r) => r.accessible);
  if (accessible.length > 0) {
    return accessible.map((r) => r.targetCard);
  }

  const related = getRelatedKnowledgeCards(knowledgeCardId, ctx).filter(
    (r) => r.accessible,
  );
  return related.slice(0, 3).map((r) => r.targetCard);
}

export function resolveLearningPath(
  path: SuggestedLearningPathDefinition,
  ctx: RelationshipEngineContext = {},
): ResolvedLearningPathStep[] {
  const index = getCatalogIndex();
  const completed = new Set(ctx.completedKnowledgeCardIds ?? []);

  return path.knowledgeCardIds
    .map((cardId, stepIndex) => {
      const knowledgeCard = index.byKnowledgeCardId.get(cardId);
      if (!knowledgeCard) return null;

      const access = prerequisitesMet(cardId, completed);
      return {
        path,
        knowledgeCard,
        stepIndex,
        completed: completed.has(cardId),
        accessible: access.met,
        blockedByPrerequisiteIds: access.met ? undefined : access.missing,
      };
    })
    .filter((s) => s !== null) as ResolvedLearningPathStep[];
}

export function listLearningPathsForCard(
  knowledgeCardId: string,
): SuggestedLearningPathDefinition[] {
  const index = getCatalogIndex();
  const pathIds = index.learningPathsByCardId.get(knowledgeCardId) ?? [];
  const full = loadInstituteCatalog();
  return (full.learningPaths ?? []).filter((p) => pathIds.includes(p.id));
}

export function sparkSuggestedLearningPath(
  knowledgeCardId: string,
  ctx: RelationshipEngineContext = {},
): ResolvedLearningPathStep[] | null {
  const paths = listLearningPathsForCard(knowledgeCardId);
  if (paths.length === 0) return null;

  const sorted = [...paths].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = sorted[0]!;
  const steps = resolveLearningPath(primary, ctx);
  const currentIdx = steps.findIndex((s) => s.knowledgeCard.id === knowledgeCardId);
  if (currentIdx < 0) return steps;

  return steps.slice(currentIdx);
}
