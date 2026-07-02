/**
 * Momentum Institute™ catalog — data provider interface.
 * Catalog content loads from CMS, JSON, or API — never hard-coded in engine logic.
 */

import type { MomentumInstituteCatalog } from "@/lib/sparkMomentumInstitute/types";
import { SPARK_COMPETENCY_FRAMEWORK_V1 } from "@/lib/sparkCompetencyFramework/competencyFrameworkV1";
import { buildCatalogIndex } from "../knowledgeArchitecture/catalogIndex";
import type { InstituteCatalogIndex } from "../knowledgeArchitecture/types";

export type InstituteCatalogProvider = {
  load(): MomentumInstituteCatalog;
  reload?(): MomentumInstituteCatalog;
};

export const EMPTY_INSTITUTE_CATALOG: MomentumInstituteCatalog = {
  institute: {
    id: "momentum-institute",
    slug: "momentum-institute",
    title: "Momentum Institute™",
    subtitle: "Entrepreneur Development Center",
    tagline:
      "Spark teaches timeless business principles. Shari helps you apply them.",
    pillarIds: [],
    departmentIds: [],
    version: "1.0.0",
  },
  competencyFramework: SPARK_COMPETENCY_FRAMEWORK_V1,
  pillars: SPARK_COMPETENCY_FRAMEWORK_V1.pillars,
  perspectives: SPARK_COMPETENCY_FRAMEWORK_V1.perspectives,
  departments: [],
  drawers: [],
  topics: [],
  knowledgeCards: [],
  experiences: [],
  competencies: [],
  relationships: [],
  learningPaths: [],
  makeItMineTemplates: [],
  returnClosings: [],
  evidenceOpportunityTemplates: [],
};

let activeProvider: InstituteCatalogProvider = {
  load: () => EMPTY_INSTITUTE_CATALOG,
};

let catalogIndexCache: InstituteCatalogIndex | null = null;
let catalogIndexVersion: string | null = null;

function invalidateCatalogIndex(): void {
  catalogIndexCache = null;
  catalogIndexVersion = null;
}

export function setInstituteCatalogProvider(
  provider: InstituteCatalogProvider,
): void {
  activeProvider = provider;
  invalidateCatalogIndex();
}

export function resetInstituteCatalogProvider(): void {
  activeProvider = { load: () => EMPTY_INSTITUTE_CATALOG };
  invalidateCatalogIndex();
}

export function loadInstituteCatalog(): MomentumInstituteCatalog {
  return activeProvider.load();
}

/** O(1) indexed catalog — rebuilt when provider or version changes */
export function getCatalogIndex(): InstituteCatalogIndex {
  const catalog = loadInstituteCatalog();
  if (
    !catalogIndexCache ||
    catalogIndexVersion !== catalog.institute.version
  ) {
    catalogIndexCache = buildCatalogIndex(catalog);
    catalogIndexVersion = catalog.institute.version;
  }
  return catalogIndexCache;
}

export function getInstituteDefinition() {
  return loadInstituteCatalog().institute;
}

export function getDepartmentById(id: string) {
  return loadInstituteCatalog().departments.find((d) => d.id === id) ?? null;
}

export function getDrawerById(id: string) {
  return loadInstituteCatalog().drawers.find((d) => d.id === id) ?? null;
}

export function getTopicById(id: string) {
  return loadInstituteCatalog().topics.find((t) => t.id === id) ?? null;
}

export function getKnowledgeCardById(id: string) {
  return loadInstituteCatalog().knowledgeCards.find((k) => k.id === id) ?? null;
}

export function getExperienceDefinitionById(id: string) {
  return loadInstituteCatalog().experiences.find((e) => e.id === id) ?? null;
}

export function getCompetencyById(id: string) {
  return loadInstituteCatalog().competencies.find((c) => c.id === id) ?? null;
}

export function listDepartments() {
  return [...loadInstituteCatalog().departments].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function listDrawersForDepartment(departmentId: string) {
  return loadInstituteCatalog()
    .drawers.filter((d) => d.departmentId === departmentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listTopicsForDrawer(drawerId: string) {
  return loadInstituteCatalog()
    .topics.filter((t) => t.drawerId === drawerId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listKnowledgeCardsForTopic(topicId: string) {
  return loadInstituteCatalog().knowledgeCards.filter(
    (k) => k.topicId === topicId,
  );
}

export function listKnowledgeCardsForDrawer(drawerId: string) {
  const index = getCatalogIndex();
  const ids = index.cardsByDrawerId.get(drawerId) ?? [];
  return ids
    .map((id) => getKnowledgeCardById(id))
    .filter((card): card is NonNullable<typeof card> => card != null);
}

export function listExperiencesForKnowledgeCard(knowledgeCardId: string) {
  return loadInstituteCatalog().experiences.filter(
    (e) => e.knowledgeCardId === knowledgeCardId,
  );
}

export function listPillars() {
  return [...loadInstituteCatalog().pillars].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function listDepartmentsForPillar(pillarId: string) {
  return loadInstituteCatalog()
    .departments.filter((d) => d.pillarId === pillarId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPerspectiveById(id: string) {
  return loadInstituteCatalog().perspectives.find((p) => p.id === id) ?? null;
}
