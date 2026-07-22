/**
 * Spec 129 / Prompt 144 — map current app section → Welcome Home destination for active highlight.
 */

import type { WelcomeHomeNavDestinationId } from "./welcomeHomeNavigationStructure";
import {
  WELCOME_HOME_NAV_CATEGORIES,
  resolveWelcomeHomeDestinationAlias,
} from "./welcomeHomeNavigationStructure";

const SECTION_TO_DESTINATION: Record<string, WelcomeHomeNavDestinationId> = {
  create: "create",
  "content-generator": "create",
  projects: "projects",
  "destination-gallery": "destination-gallery",
  "cartographers-studio": "cartographers-studio",
  "plan-my-day": "adapt-plan-my-day",
  "adapt-plan-my-day": "adapt-plan-my-day",
  calendar: "calendar",
  "reminders-rhythms": "reminders-rhythms",
  reminders: "reminders-rhythms",
  rhythms: "reminders-rhythms",
  "brain-dump": "clear-my-mind",
  "parking-lot": "parking-lot",
  "talk-it-out": "talk-it-out",
  breathe: "breathe",
  "spin-wheel": "spin-the-wheel",
  "peaceful-places": "peaceful-places",
  "focus-audio": "focus-audio",
  journal: "journal",
  "growth-journal": "journal",
  "evidence-vault": "evidence-vault",
  "evidence-bank": "evidence-vault",
  "growth-portfolio": "hall-of-accomplishments",
  "chamber-of-momentum": "chamber-of-momentum",
  boardroom: "boardroom",
  playbook: "strategy-library",
  "strategy-library": "strategy-library",
  soundscapes: "soundscapes",
};

export function welcomeHomeDestinationForSection(
  section: string | null | undefined,
): WelcomeHomeNavDestinationId | null {
  if (!section) return null;
  return SECTION_TO_DESTINATION[section] ?? null;
}

function destinationMatches(
  destinationId: WelcomeHomeNavDestinationId,
  candidateId: string,
): boolean {
  if (candidateId === destinationId) return true;
  const canonical = resolveWelcomeHomeDestinationAlias(
    candidateId as WelcomeHomeNavDestinationId,
  );
  if (canonical === destinationId) return true;
  return false;
}

export function welcomeHomeCategoryForDestination(
  destinationId: WelcomeHomeNavDestinationId | null | undefined,
): string | null {
  if (!destinationId) return null;
  const resolved = resolveWelcomeHomeDestinationAlias(destinationId);
  for (const category of WELCOME_HOME_NAV_CATEGORIES) {
    for (const dest of category.destinations) {
      if (destinationMatches(resolved, dest.id) || destinationMatches(destinationId, dest.id)) {
        return category.id;
      }
      if (
        dest.dropdownChildren?.some(
          (child) =>
            destinationMatches(resolved, child.id) ||
            destinationMatches(destinationId, child.id),
        )
      ) {
        return category.id;
      }
    }
  }
  return null;
}
