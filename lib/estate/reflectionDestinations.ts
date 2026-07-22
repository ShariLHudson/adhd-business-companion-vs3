/**
 * Reflection Destinations Registry — single source of truth for the
 * Reflection menu: Journal, Evidence Vault, Hall of Accomplishments.
 *
 * Clear My Mind is intentionally excluded. It keeps its own approved
 * location under Focus / Today (`welcomeHomeNavigationStructure.ts` →
 * category id `"take-a-moment"`) — it is immediate thought capture and
 * mental unloading, not reflective review.
 *
 * @see docs/navigation/SPARK_ESTATE_REFLECTION_NAVIGATION_ROUTING_FIX.md
 * @see lib/estate/welcomeHomeNavigationStructure.ts — member-facing Reflection menu
 * @see lib/estate/directEstateVisit.ts — DEDICATED_ESTATE_ROOM_PANEL_SECTIONS
 */

import type { AppSection } from "@/lib/companionUi";

export type ReflectionDestinationId =
  | "journal"
  | "evidence-vault"
  | "hall-of-accomplishments";

export type ReflectionDestination = {
  id: ReflectionDestinationId;
  name: string;
  /**
   * Stable deep-link identifier for future URL-based navigation. Spark Estate
   * navigates by AppSection today (see `section`), not literal Next.js
   * routes — this id is reserved for when/if reflection destinations gain
   * their own addressable URLs.
   */
  route: string;
  /** Estate section this destination opens — drives the CompanionPageClient opener. */
  section: AppSection;
  componentKey: string;
  description: string;
  isActive: true;
};

/**
 * Canonical Reflection registry. Do not add Clear My Mind here — see module
 * doc comment. Do not create duplicate entries; each destination owns exactly
 * one canonical route/section/component.
 */
export const REFLECTION_DESTINATIONS: readonly ReflectionDestination[] = [
  {
    id: "journal",
    name: "Journal",
    route: "/reflection/journal",
    section: "growth-journal",
    componentKey: "journal",
    description: "Write, reflect, and return to saved journal entries.",
    isActive: true,
  },
  {
    id: "evidence-vault",
    name: "Evidence Vault",
    route: "/reflection/evidence-vault",
    section: "evidence-bank",
    componentKey: "evidence-vault",
    description: "Keep proof of progress, strengths, learning, and growth.",
    isActive: true,
  },
  {
    id: "hall-of-accomplishments",
    name: "Hall of Accomplishments",
    route: "/reflection/hall-of-achievements",
    section: "growth-portfolio",
    componentKey: "hall-of-accomplishments",
    description: "Recognize accomplishments, milestones, and completed work.",
    isActive: true,
  },
] as const;

export const REFLECTION_DESTINATION_IDS: readonly ReflectionDestinationId[] =
  REFLECTION_DESTINATIONS.map((d) => d.id);

export function isReflectionDestinationId(
  id: string,
): id is ReflectionDestinationId {
  return (REFLECTION_DESTINATION_IDS as readonly string[]).includes(id);
}

export function getReflectionDestination(
  id: string,
): ReflectionDestination | undefined {
  return REFLECTION_DESTINATIONS.find((d) => d.id === id);
}

export function reflectionDestinationForSection(
  section: AppSection,
): ReflectionDestination | undefined {
  return REFLECTION_DESTINATIONS.find((d) => d.section === section);
}

/**
 * True when the registry stays clean of Clear My Mind — asserted by
 * `reflectionDestinations.test.ts` so this can never silently regress.
 */
export const CLEAR_MY_MIND_EXCLUDED_FROM_REFLECTION: boolean =
  REFLECTION_DESTINATIONS.every(
    (d) => (d.id as string) !== "clear-my-mind" && d.section !== "brain-dump",
  );
