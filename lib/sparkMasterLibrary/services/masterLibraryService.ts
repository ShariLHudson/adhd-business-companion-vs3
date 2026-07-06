import {
  ALL_MASTER_LIBRARY_ITEMS,
  MASTER_LIBRARY_CATEGORIES,
  MASTER_LIBRARY_HEADLINE,
  MASTER_LIBRARY_SUMMARY,
} from "../sample/libraryData";
import type { MasterLibraryView } from "../types";

export function composeMasterLibraryView(): MasterLibraryView {
  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    headline: MASTER_LIBRARY_HEADLINE,
    summary: MASTER_LIBRARY_SUMMARY,
    categories: MASTER_LIBRARY_CATEGORIES.map((category) => ({
      ...category,
      items: [...category.items],
    })),
    totalItems: ALL_MASTER_LIBRARY_ITEMS.length,
  };
}
