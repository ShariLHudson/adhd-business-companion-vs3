import type { EstateCollectionCaptureValues } from "@/lib/estate/collectionFramework/types";
import {
  DISCOVERY_FILE_OPTIONAL_SECTIONS,
  type DiscoverySectionDef,
} from "./discoveryFileSections";

/**
 * Spark quietly recognizes meaningful threads in the story.
 * Never interrupts — only surfaces gentle Add suggestions.
 */
export function detectDiscoverySectionSuggestions(
  story: string,
  expandedSectionIds: ReadonlySet<string>,
  values: EstateCollectionCaptureValues,
): DiscoverySectionDef[] {
  const text = story.trim();
  if (text.length < 24) return [];

  return DISCOVERY_FILE_OPTIONAL_SECTIONS.filter((section) => {
    if (expandedSectionIds.has(section.id)) return false;
    const current = values[section.fieldId]?.trim() ?? "";
    if (current.length > 0) return false;
    return section.suggestWhen.test(text);
  });
}
