/**
 * Indexed catalog — fast lookups for large-scale knowledge graphs.
 * Rebuilt when catalog provider reloads.
 */

import type { MomentumInstituteCatalog } from "@/lib/sparkMomentumInstitute/types";
import type {
  InstituteCatalogIndex,
  KnowledgeRelationshipDefinition,
} from "./types";

function indexRelationships(
  catalog: MomentumInstituteCatalog,
): {
  from: Map<string, KnowledgeRelationshipDefinition[]>;
  to: Map<string, KnowledgeRelationshipDefinition[]>;
} {
  const from = new Map<string, KnowledgeRelationshipDefinition[]>();
  const to = new Map<string, KnowledgeRelationshipDefinition[]>();

  const edges =
    catalog.relationships ??
    deriveRelationshipsFromCardMetadata(catalog.knowledgeCards);

  for (const rel of edges) {
    const fromList = from.get(rel.fromKnowledgeCardId) ?? [];
    fromList.push(rel);
    from.set(rel.fromKnowledgeCardId, fromList);

    const toList = to.get(rel.toKnowledgeCardId) ?? [];
    toList.push(rel);
    to.set(rel.toKnowledgeCardId, toList);
  }

  return { from, to };
}

function deriveRelationshipsFromCardMetadata(
  cards: MomentumInstituteCatalog["knowledgeCards"],
): KnowledgeRelationshipDefinition[] {
  const edges: KnowledgeRelationshipDefinition[] = [];

  for (const card of cards) {
    for (const toId of card.relatedKnowledgeCardIds ?? []) {
      edges.push({
        id: `rel-${card.id}-related-${toId}`,
        fromKnowledgeCardId: card.id,
        toKnowledgeCardId: toId,
        kind: "related",
      });
    }
    for (const prereqId of card.prerequisiteKnowledgeCardIds ?? []) {
      edges.push({
        id: `rel-${prereqId}-prereq-for-${card.id}`,
        fromKnowledgeCardId: prereqId,
        toKnowledgeCardId: card.id,
        kind: "prerequisite",
      });
    }
    for (const toId of card.advancedKnowledgeCardIds ?? []) {
      edges.push({
        id: `rel-${card.id}-advanced-${toId}`,
        fromKnowledgeCardId: card.id,
        toKnowledgeCardId: toId,
        kind: "advanced",
      });
    }
    for (const toId of card.suggestedNextKnowledgeCardIds ?? []) {
      edges.push({
        id: `rel-${card.id}-next-${toId}`,
        fromKnowledgeCardId: card.id,
        toKnowledgeCardId: toId,
        kind: "recommended_next",
      });
    }
  }

  return edges;
}

function indexLearningPaths(
  catalog: MomentumInstituteCatalog,
): Map<string, string[]> {
  const byCard = new Map<string, string[]>();
  for (const path of catalog.learningPaths ?? []) {
    for (const cardId of path.knowledgeCardIds) {
      const list = byCard.get(cardId) ?? [];
      if (!list.includes(path.id)) list.push(path.id);
      byCard.set(cardId, list);
    }
  }
  return byCard;
}

export function buildCatalogIndex(
  catalog: MomentumInstituteCatalog,
): InstituteCatalogIndex {
  const byKnowledgeCardId = new Map<string, (typeof catalog.knowledgeCards)[0]>();
  const byKnowledgeCardSlug = new Map<string, (typeof catalog.knowledgeCards)[0]>();
  const cardsByDrawerId = new Map<string, string[]>();
  const cardsByDepartmentId = new Map<string, string[]>();
  const cardsByPillarId = new Map<string, string[]>();

  for (const card of catalog.knowledgeCards) {
    byKnowledgeCardId.set(card.id, card);
    byKnowledgeCardSlug.set(card.slug, card);

    const drawerList = cardsByDrawerId.get(card.drawerId) ?? [];
    drawerList.push(card.id);
    cardsByDrawerId.set(card.drawerId, drawerList);

    const deptList = cardsByDepartmentId.get(card.departmentId) ?? [];
    if (!deptList.includes(card.id)) deptList.push(card.id);
    cardsByDepartmentId.set(card.departmentId, deptList);

    const drawer = catalog.drawers.find((d) => d.id === card.drawerId);
    if (drawer) {
      const pillarList = cardsByPillarId.get(drawer.pillarId) ?? [];
      if (!pillarList.includes(card.id)) pillarList.push(card.id);
      cardsByPillarId.set(drawer.pillarId, pillarList);
    }
  }

  const byDrawerId = new Map(catalog.drawers.map((d) => [d.id, d]));
  const byDepartmentId = new Map(catalog.departments.map((d) => [d.id, d]));
  const byTopicId = new Map(catalog.topics.map((t) => [t.id, t]));
  const byExperienceId = new Map(catalog.experiences.map((e) => [e.id, e]));
  const byCompetencyId = new Map(catalog.competencies.map((c) => [c.id, c]));

  const experiencesByCardId = new Map<string, string[]>();
  for (const exp of catalog.experiences) {
    const list = experiencesByCardId.get(exp.knowledgeCardId) ?? [];
    list.push(exp.id);
    experiencesByCardId.set(exp.knowledgeCardId, list);
  }

  const { from: relationshipsFromCard, to: relationshipsToCard } =
    indexRelationships(catalog);

  return {
    version: catalog.institute.version,
    instituteId: catalog.institute.id,
    byKnowledgeCardId,
    byKnowledgeCardSlug,
    byDrawerId,
    byDepartmentId,
    byTopicId,
    byExperienceId,
    byCompetencyId,
    cardsByDrawerId,
    cardsByDepartmentId,
    cardsByPillarId,
    experiencesByCardId,
    relationshipsFromCard,
    relationshipsToCard,
    learningPathsByCardId: indexLearningPaths(catalog),
  };
}

export function catalogScaleFromIndex(index: InstituteCatalogIndex): {
  departments: number;
  drawers: number;
  topics: number;
  knowledgeCards: number;
  experiences: number;
  competencies: number;
  relationships: number;
  learningPaths: number;
} {
  let relationships = 0;
  for (const list of index.relationshipsFromCard.values()) {
    relationships += list.length;
  }

  return {
    departments: index.byDepartmentId.size,
    drawers: index.byDrawerId.size,
    topics: index.byTopicId.size,
    knowledgeCards: index.byKnowledgeCardId.size,
    experiences: index.byExperienceId.size,
    competencies: index.byCompetencyId.size,
    relationships,
    learningPaths: index.learningPathsByCardId.size,
  };
}
