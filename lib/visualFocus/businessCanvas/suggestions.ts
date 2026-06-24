import { getAvatars, getProjects, getTemplates } from "@/lib/companionStore";
import { getUserStrategies } from "@/lib/userStrategies";
import type { BusinessCanvasSectionId } from "./types";
import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "./guidance";

/** Companion suggestions — ecosystem-aware when data exists, examples otherwise. */
export function companionSuggestionsForSection(
  sectionId: BusinessCanvasSectionId,
): string[] {
  const guidance = BUSINESS_CANVAS_SECTION_GUIDANCE[sectionId];
  const fromEcosystem = ecosystemSuggestions(sectionId);
  if (fromEcosystem.length > 0) {
    return [...fromEcosystem, ...guidance.examples.slice(0, 2)].slice(0, 6);
  }
  return guidance.examples.slice(0, 5);
}

function ecosystemSuggestions(sectionId: BusinessCanvasSectionId): string[] {
  switch (sectionId) {
    case "customer-segments": {
      const avatars = getAvatars();
      const names = avatars.map((a) => a.name).filter(Boolean);
      const tags = avatars
        .map((a) => a.tagline)
        .filter((t): t is string => Boolean(t?.trim()));
      return [...names, ...tags].slice(0, 5);
    }
    case "value-proposition": {
      return getAvatars()
        .flatMap((a) => [a.painPoints, a.goals, a.solution, a.tagline])
        .filter((t): t is string => Boolean(t?.trim()))
        .slice(0, 5);
    }
    case "channels": {
      const strategies = getUserStrategies()
        .map((s) => s.title)
        .filter((t) => /market|content|social|email|visibility/i.test(t));
      if (strategies.length > 0) return strategies.slice(0, 4);
      return [];
    }
    case "customer-relationships": {
      const templates = getTemplates()
        .map((t) => t.category)
        .filter((c) => /email|newsletter|membership|coaching/i.test(c));
      return [...new Set(templates)].slice(0, 4);
    }
    case "revenue-streams": {
      return getTemplates()
        .map((t) => t.title)
        .filter((t) => /course|coaching|membership|offer|program/i.test(t))
        .slice(0, 5);
    }
    case "key-activities": {
      return getProjects()
        .filter((p) => p.status !== "completed")
        .map((p) => p.nextAction ?? p.name)
        .filter(Boolean)
        .slice(0, 5) as string[];
    }
    case "key-resources": {
      const resources: string[] = [];
      if (getAvatars().length > 0) resources.push("Client avatar research");
      if (getTemplates().length > 0) resources.push("Content library");
      if (getUserStrategies().length > 0) resources.push("Saved strategies");
      return resources;
    }
    case "key-partners":
      return [];
    case "cost-structure":
      return [];
    default:
      return [];
  }
}
