/**
 * Live shell → place mapping for Estate Room Awareness.
 * Used so section/page always beats stale session visual_room.
 */

import { estatePresenceRoomForSection } from "@/lib/estate/estatePresence/registry";
import { resolvePlaceId } from "@/lib/estate/placeIdAliases";
import { toCanonicalRecognitionRoomId } from "@/lib/sparkRecognitionEngine/recognitionIds";

/** Sections that are tools/panels — not estate places. Never keep stale visual here. */
const NON_PLACE_SECTIONS = new Set([
  "settings",
  "profile",
  "business-profile",
  "focus",
  "focus-timer",
  "breathe",
  "spin-wheel",
  "game",
  "quick-recharge",
  "energy",
  "time-block",
  "activities",
  "guided-exercises",
  "today",
  "plan-my-day",
  "visual-focus",
  "google-workspace",
  "email-generator",
  "snippets",
  "content-types",
  "templates-library",
  "saved-work",
  "my-work",
  "client-avatars",
  "playbook",
  "progress",
  "grow",
  "growth",
  "growth-capture",
  "user-memory",
  "life-experience",
  "my-journey",
  "confidence-vault",
  "welcome-room",
  "the-gallery",
  "grow-spark-cards",
  "grow-guilds",
  "grow-daily-discoveries",
  "grow-business-history",
  "chamber-project-entry",
]);

/** Growth / workspace sections → canonical place ids. */
const SECTION_PLACE: Readonly<Record<string, string>> = {
  "evidence-bank": "evidence-vault",
  "wins-this-week": "gardens",
  "growth-reports": "celebration-room",
  "growth-portfolio": "portfolio",
  "growth-library": "library",
  "growth-greenhouse": "greenhouse",
  "growth-journal": "journal",
  "chamber-of-momentum": "momentum-institute",
  "content-generator": "creative-studio",
  "brain-dump": "clear-my-mind",
  "decision-compass": "decision-compass",
  projects: "goals-projects",
  "plan-my-day": "momentum-builder",
  "focus-audio": "peaceful-places",
  stables: "stables",
  "grow-observatory": "observatory",
  "momentum-builder": "momentum-builder",
  "grow-momentum-builders": "momentum-builder",
  "how-do-i": "library",
  "momentum-institute": "momentum-institute",
};

function normalizePlace(id: string | null | undefined): string | null {
  if (!id?.trim()) return null;
  return resolvePlaceId(id.trim());
}

/**
 * True when the active section is a tool/panel, not an estate place.
 * Stale visual_room must not authorize already-here on these screens.
 */
export function isNonPlaceShellSection(section: string | null | undefined): boolean {
  if (!section?.trim()) return false;
  return NON_PLACE_SECTIONS.has(section.trim());
}

/**
 * Resolve the place the live shell is showing from placeId and/or section.
 * Returns null when the section is unknown / non-place (caller must not keep stale visual).
 */
export function resolvePlaceFromShell(input: {
  placeId?: string | null;
  section?: string | null;
}): string | null {
  const fromPlace = normalizePlace(input.placeId);
  if (fromPlace) return fromPlace;

  const section = input.section?.trim();
  if (!section) return null;

  const fromRecognition = toCanonicalRecognitionRoomId(section);
  if (fromRecognition) return fromRecognition;

  if (section === "home") {
    return "welcome-home";
  }

  if (SECTION_PLACE[section]) {
    return normalizePlace(SECTION_PLACE[section]);
  }

  const fromPresence = estatePresenceRoomForSection(section);
  if (fromPresence) return normalizePlace(fromPresence);

  if (isNonPlaceShellSection(section)) {
    return null;
  }

  return null;
}
