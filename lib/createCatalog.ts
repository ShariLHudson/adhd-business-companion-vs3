// Create catalog — categorized business assets for living Create workspaces (066).

import { sortByDropdownLabel, sortDropdownLabels } from "./dropdownSort";
import {
  allCatalogItems,
  catalogIntentTypeRules,
  CREATE_CATALOG,
  type CreateCatalogCategory,
  type CreateCatalogItem,
} from "./createCatalogData";

export type { CreateCatalogCategory, CreateCatalogItem } from "./createCatalogData";
export { allCatalogItems, catalogIntentTypeRules, CREATE_CATALOG } from "./createCatalogData";

/** Lightweight visual-structure check — avoids importing visualStructureRouting (circular). */
function isVisualStructureCatalogSkip(text: string): boolean {
  return /\b(?:(?:create|build|make|open|start|help me (?:create|make|build|open))\s+(?:a |an |my )?(?:mind\s*maps?|flowcharts?|flow\s*charts?|decision\s*trees?|process\s*(?:flows?|maps?)|hierarchy(?:\s*trees?|\s*maps?)?|funnel\s*maps?|concept\s*maps?|diagrams?|visual\s*maps?)|visuali[sz]e|map (?:this|it|out))\b/i.test(
    text,
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** User-facing catalog — categories and types in alphabetical order. */
export function sortedCreateCatalog(): CreateCatalogCategory[] {
  return sortByDropdownLabel(CREATE_CATALOG, (c) => c.label).map((cat) => ({
    ...cat,
    items: sortByDropdownLabel(cat.items, (i) => i.label),
  }));
}

export function catalogCategory(id: string) {
  return CREATE_CATALOG.find((c) => c.id === id);
}

/** Dropdown label for step 2, e.g. "Content Types". */
export function catalogTypesPickerLabel(categoryId: string): string {
  const cat = catalogCategory(categoryId);
  return cat ? `${cat.label} Types` : "Types";
}

/** All items in a category for the type dropdown (alphabetical). */
export function dropdownItemsInCategory(categoryId: string): CreateCatalogItem[] {
  const cat = catalogCategory(categoryId);
  if (!cat) return [];
  return sortByDropdownLabel(cat.items, (i) => i.label);
}

/** Labels for content-type pickers (excludes routed tools). */
export function createCatalogTypeLabels(): string[] {
  return sortDropdownLabels(
    allCatalogItems()
      .filter((i) => !i.route)
      .map((i) => i.label),
  );
}

export function findCatalogItem(label: string): CreateCatalogItem | undefined {
  const t = label.trim().toLowerCase();
  return allCatalogItems().find((i) => i.label.toLowerCase() === t);
}

/** Longer / more specific terms outrank later short social-post keywords. */
function catalogMatchScore(term: string, index: number): number {
  const specificity = term.trim().length;
  // Prefer plan/calendar/series families over bare social/post/facebook terms.
  const familyBonus = /\b(plan|calendar|campaign|series|sequence|program|handbook|guide|project)\b/i.test(
    term,
  )
    ? 40
    : /\b(post|caption|facebook|instagram|social media)\b/i.test(term)
      ? -25
      : 0;
  // Mild preference for earlier meaningful structure terms over trailing channel words.
  return specificity * 2 + familyBonus - Math.floor(index / 8);
}

/** Match user text to a catalog create type or routed section. */
export function matchCatalogFromText(text: string): {
  type?: string;
  route?: import("./companionUi").AppSection;
} | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (isVisualStructureCatalogSkip(t)) return null;

  let best: { score: number; item: CreateCatalogItem } | null = null;

  for (const item of allCatalogItems()) {
    const terms = [item.label.toLowerCase(), ...(item.matchTerms ?? [])];
    for (const term of terms) {
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
      const match = re.exec(t);
      if (!match) continue;
      const score = catalogMatchScore(term, match.index);
      if (!best || score > best.score) best = { score, item };
    }
  }

  if (!best) return null;
  if (best.item.route) return { route: best.item.route };
  return { type: best.item.label };
}
