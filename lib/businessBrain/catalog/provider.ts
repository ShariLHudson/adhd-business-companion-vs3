/**
 * Business Brain™ catalog provider — data-driven load target.
 */

import type { BusinessBrainCatalog } from "../types";
import type { KnowledgeSource } from "../types";
import { filterSourcesEligibleForTeaching } from "../sourceIntegrity/validators";
import { buildBusinessBrainCatalog } from "./buildCatalog";
import { buildBusinessBrainIndex } from "./catalogIndex";
import type { BusinessBrainCatalogIndex } from "../types";

export type BusinessBrainProvider = {
  load(): BusinessBrainCatalog;
  reload?(): BusinessBrainCatalog;
};

let activeProvider: BusinessBrainProvider = {
  load: buildBusinessBrainCatalog,
};

let indexCache: BusinessBrainCatalogIndex | null = null;
let indexVersion: string | null = null;

export function setBusinessBrainProvider(provider: BusinessBrainProvider): void {
  activeProvider = provider;
  indexCache = null;
  indexVersion = null;
}

export function resetBusinessBrainProvider(): void {
  activeProvider = { load: buildBusinessBrainCatalog };
  indexCache = null;
  indexVersion = null;
}

export function loadBusinessBrainCatalog(): BusinessBrainCatalog {
  return activeProvider.load();
}

export function getBusinessBrainIndex(): BusinessBrainCatalogIndex {
  const catalog = loadBusinessBrainCatalog();
  if (!indexCache || indexVersion !== catalog.version) {
    indexCache = buildBusinessBrainIndex(catalog);
    indexVersion = catalog.version;
  }
  return indexCache;
}

export function getKnowledgeCouncil() {
  return loadBusinessBrainCatalog().knowledgeCouncil;
}

export function getBrainDepartment(departmentId: string) {
  return getBusinessBrainIndex().byDepartmentId.get(departmentId) ?? null;
}

export function getBrainKnowledgeCard(cardId: string) {
  return getBusinessBrainIndex().byKnowledgeCardId.get(cardId) ?? null;
}

export function listSchoolsForDepartment(departmentId: string) {
  const dept = getBrainDepartment(departmentId);
  if (!dept) return [];
  const index = getBusinessBrainIndex();
  return dept.schoolOfThoughtIds
    .map((id) => index.bySchoolId.get(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);
}

export function listSourcesForDepartment(departmentId: string) {
  const dept = getBrainDepartment(departmentId);
  if (!dept) return [];
  const index = getBusinessBrainIndex();
  return dept.knowledgeSourceIds
    .map((id) => index.bySourceId.get(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);
}

/** Only verified sources — safe for final lesson attribution */
export function listTeachingSourcesForDepartment(
  departmentId: string,
): KnowledgeSource[] {
  return filterSourcesEligibleForTeaching(listSourcesForDepartment(departmentId));
}

/** Synthesis context for coaching / Make It Mine — internal ids only */
export function departmentSynthesisContext(departmentId: string) {
  const dept = getBrainDepartment(departmentId);
  if (!dept) return null;
  return {
    departmentId: dept.id,
    name: dept.name,
    purpose: dept.purpose,
    schoolSlugs: listSchoolsForDepartment(departmentId).map((s) => s.slug),
    sourceSlugs: listSourcesForDepartment(departmentId).map((s) => s.slug),
    disciplineSlugs: dept.researchDisciplineIds
      .map((id) => getBusinessBrainIndex().byDisciplineId.get(id)?.slug)
      .filter((s): s is string => !!s),
    competencyIds: dept.coreCompetencyIds,
    topicCount: dept.topicIds.length,
    drawerCount: dept.drawerIds.length,
  };
}
