/**
 * Momentum Institute™ — Curriculum Registry.
 *
 * Central index of every authored asset. Grows one card at a time.
 * Scan `docs/momentum-institute/curriculum/` with `npm run curriculum:scan` after adding files.
 */

import type {
  CurriculumAssetKind,
  CurriculumCardStatus,
  CurriculumKnowledgeCardDocument,
  CurriculumRegistry,
  CurriculumRegistryEntry,
  CurriculumRegistryStats,
} from "./types";

/** Empty scaffold — entries added as Shari authors content. */
export const EMPTY_CURRICULUM_REGISTRY: CurriculumRegistry = {
  version: "1.0.0",
  updated_at: new Date().toISOString().slice(0, 10),
  knowledge_cards: [],
  business_mastery_minutes: [],
  apprenticeships: [],
  business_labs: [],
  simulations: [],
  challenges: [],
  worksheets: [],
};

let activeRegistry: CurriculumRegistry = { ...EMPTY_CURRICULUM_REGISTRY };
const loadedDocuments = new Map<string, CurriculumKnowledgeCardDocument>();

export function setCurriculumRegistry(registry: CurriculumRegistry): void {
  activeRegistry = {
    ...registry,
    knowledge_cards: [...registry.knowledge_cards],
    business_mastery_minutes: [...registry.business_mastery_minutes],
    apprenticeships: [...registry.apprenticeships],
    business_labs: [...registry.business_labs],
    simulations: [...registry.simulations],
    challenges: [...registry.challenges],
    worksheets: [...registry.worksheets],
  };
  loadedDocuments.clear();
}

export function resetCurriculumRegistry(): void {
  activeRegistry = { ...EMPTY_CURRICULUM_REGISTRY };
  loadedDocuments.clear();
}

export function getCurriculumRegistry(): CurriculumRegistry {
  return activeRegistry;
}

export function registerCurriculumKnowledgeCard(
  document: CurriculumKnowledgeCardDocument,
): void {
  loadedDocuments.set(document.metadata.id, document);
  const entry: CurriculumRegistryEntry = {
    kind: "knowledge-card",
    id: document.metadata.id,
    path: document.sourcePath,
    department: document.metadata.department,
    drawer: document.metadata.drawer,
    status: document.metadata.status,
  };
  const without = activeRegistry.knowledge_cards.filter(
    (e) => e.id !== entry.id,
  );
  activeRegistry = {
    ...activeRegistry,
    knowledge_cards: [...without, entry],
  };
}

export function getCurriculumKnowledgeCardDocument(
  id: string,
): CurriculumKnowledgeCardDocument | null {
  return loadedDocuments.get(id) ?? null;
}

export function listCurriculumRegistryEntries(
  kind?: CurriculumAssetKind,
  opts?: { status?: CurriculumCardStatus; department?: string },
): CurriculumRegistryEntry[] {
  const kinds: CurriculumAssetKind[] =
    kind ? [kind] : (
      [
        "knowledge-card",
        "business-mastery-minute",
        "apprenticeship",
        "business-lab",
        "simulation",
        "challenge",
        "worksheet",
      ]
    );

  let entries: CurriculumRegistryEntry[] = [];
  for (const k of kinds) {
    entries = entries.concat(listEntriesForKind(k));
  }

  if (opts?.status) {
    entries = entries.filter((e) => e.status === opts.status);
  }
  if (opts?.department) {
    const dept = opts.department.toLowerCase();
    entries = entries.filter(
      (e) => e.department?.toLowerCase() === dept,
    );
  }

  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

function listEntriesForKind(kind: CurriculumAssetKind): CurriculumRegistryEntry[] {
  switch (kind) {
    case "knowledge-card":
      return activeRegistry.knowledge_cards;
    case "business-mastery-minute":
      return activeRegistry.business_mastery_minutes;
    case "apprenticeship":
      return activeRegistry.apprenticeships;
    case "business-lab":
      return activeRegistry.business_labs;
    case "simulation":
      return activeRegistry.simulations;
    case "challenge":
      return activeRegistry.challenges;
    case "worksheet":
      return activeRegistry.worksheets;
    default:
      return [];
  }
}

export function listPublishedKnowledgeCardIds(): string[] {
  return activeRegistry.knowledge_cards
    .filter((e) => e.status === "published")
    .map((e) => e.id);
}

export function computeCurriculumRegistryStats(
  registry: CurriculumRegistry = activeRegistry,
): CurriculumRegistryStats {
  const all = [
    ...registry.knowledge_cards,
    ...registry.business_mastery_minutes,
    ...registry.apprenticeships,
    ...registry.business_labs,
    ...registry.simulations,
    ...registry.challenges,
    ...registry.worksheets,
  ];

  const byDepartment: Record<string, number> = {};
  for (const entry of all) {
    const dept = entry.department ?? "general";
    byDepartment[dept] = (byDepartment[dept] ?? 0) + 1;
  }

  return {
    total: all.length,
    published: all.filter((e) => e.status === "published").length,
    draft: all.filter((e) => e.status === "draft").length,
    byDepartment,
  };
}

export function curriculumRegistryToJson(
  registry: CurriculumRegistry = activeRegistry,
): string {
  return JSON.stringify(registry, null, 2);
}
