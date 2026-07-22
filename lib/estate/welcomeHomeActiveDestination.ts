/**
 * Spec 129 — map current app section → Welcome Home destination for active highlight.
 */

import type { WelcomeHomeNavDestinationId } from "./welcomeHomeNavigationStructure";
import { WELCOME_HOME_NAV_CATEGORIES } from "./welcomeHomeNavigationStructure";

const SECTION_TO_DESTINATION: Record<string, WelcomeHomeNavDestinationId> = {
  create: "create",
  projects: "projects",
  "destination-gallery": "destination-gallery",
  "cartographers-studio": "cartographers-studio",
  "plan-my-day": "adapt-plan-my-day",
  calendar: "calendar",
  "brain-dump": "clear-my-mind",
  "parking-lot": "parking-lot",
  "talk-it-out": "talk-it-out",
  breathe: "breathe",
  "spin-wheel": "spin-the-wheel",
  "peaceful-places": "peaceful-places",
  journal: "journal",
  "growth-journal": "journal",
  "evidence-vault": "evidence-vault",
  "growth-portfolio": "hall-of-accomplishments",
  "chamber-of-momentum": "chamber-of-momentum",
  boardroom: "boardroom",
  playbook: "strategy-library",
  "strategy-library": "strategy-library",
};

export function welcomeHomeDestinationForSection(
  section: string | null | undefined,
): WelcomeHomeNavDestinationId | null {
  if (!section) return null;
  return SECTION_TO_DESTINATION[section] ?? null;
}

export function welcomeHomeCategoryForDestination(
  destinationId: WelcomeHomeNavDestinationId | null | undefined,
): string | null {
  if (!destinationId) return null;
  for (const category of WELCOME_HOME_NAV_CATEGORIES) {
    if (category.destinations.some((d) => d.id === destinationId)) {
      return category.id;
    }
  }
  return null;
}
