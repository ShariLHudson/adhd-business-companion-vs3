/**
 * Business Brain catalog index — O(1) lookups at scale.
 */

import type { BusinessBrainCatalog, BusinessBrainCatalogIndex } from "../types";

export function buildBusinessBrainIndex(
  catalog: BusinessBrainCatalog,
): BusinessBrainCatalogIndex {
  const byDepartmentId = new Map(
    catalog.departments.map((d) => [d.id, d]),
  );
  const byDrawerId = new Map(catalog.drawers.map((d) => [d.id, d]));
  const byTopicId = new Map(catalog.curriculumTopics.map((t) => [t.id, t]));
  const byKnowledgeCardId = new Map(
    catalog.knowledgeCards.map((k) => [k.id, k]),
  );
  const byCompetencyId = new Map(
    catalog.competencies.map((c) => [c.id, c]),
  );
  const bySourceId = new Map(
    catalog.knowledgeCouncil.knowledgeSources.map((s) => [s.id, s]),
  );
  const bySchoolId = new Map(
    catalog.knowledgeCouncil.schoolsOfThought.map((s) => [s.id, s]),
  );
  const byDisciplineId = new Map(
    catalog.knowledgeCouncil.researchDisciplines.map((d) => [d.id, d]),
  );

  const topicsByDepartmentId = new Map<string, string[]>();
  for (const topic of catalog.curriculumTopics) {
    const list = topicsByDepartmentId.get(topic.departmentId) ?? [];
    list.push(topic.id);
    topicsByDepartmentId.set(topic.departmentId, list);
  }

  const cardsByDrawerId = new Map<string, string[]>();
  for (const card of catalog.knowledgeCards) {
    const list = cardsByDrawerId.get(card.drawerId) ?? [];
    list.push(card.id);
    cardsByDrawerId.set(card.drawerId, list);
  }

  return {
    version: catalog.version,
    byDepartmentId,
    byDrawerId,
    byTopicId,
    byKnowledgeCardId,
    byCompetencyId,
    bySourceId,
    bySchoolId,
    byDisciplineId,
    topicsByDepartmentId,
    cardsByDrawerId,
  };
}
