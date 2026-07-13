/**
 * Which Business Estate / People I Help fields may offer "Research This".
 * Outside research helps market/customer/offer questions — not personal reflection.
 */

import { getFieldHelpEntry } from "@/lib/profile/fieldHelpRegistry";

/** Personal reflection — research would invent rather than illuminate. */
const RESEARCH_EXCLUDED_PATHS = new Set([
  "identity.coreValues",
  "identity.mission",
  "identity.whatInspiredYou",
  "identity.whyBusinessMatters",
  "identity.whatHelpsYouContinue",
  "identity.hopedImpact",
  "work-style.decisionStyle",
  "work-style.restartHelpers",
  "work-style.overwhelmTriggers",
  "work-style.returnSupportTone",
  "work-style.returnOfferPreferences",
  "work-style.preferredTimeOfDay",
  "work-style.collaborationPreference",
]);

/** Strong research fits even when the field-help registry is incomplete. */
const RESEARCH_INCLUDED_PATHS = new Set([
  "identity.businessStage",
  "identity.shortDescription",
  "offers.mainOffer",
  "offers.products",
  "offers.services",
  "offers.problemsSolved",
  "offers.outcomesCreated",
  "offers.futureOffers",
  "brand.tone",
  "brand.tagline",
  "brand.messaging",
  "direction.currentPriority",
  "direction.successLooksLike",
  "direction.nextFocus",
]);

/** People I Help avatar fields where outside research can help. */
const PEOPLE_RESEARCH_SUPPORTED = new Set([
  "painPoints",
  "goals",
  "motivations",
  "triggers",
  "objections",
  "currentBehavior",
  "contentPrefs",
  "behaviorTraits",
]);

const PEOPLE_RESEARCH_EXCLUDED = new Set([
  "who",
  "name",
  "tagline",
  "solution",
]);

function peopleFieldSupportsResearch(fieldKey: string): boolean {
  if (PEOPLE_RESEARCH_EXCLUDED.has(fieldKey)) return false;
  return PEOPLE_RESEARCH_SUPPORTED.has(fieldKey);
}

/**
 * True when Research This should appear for this field path
 * (e.g. offers.problemsSolved or people field key).
 */
export function businessEstateFieldSupportsResearch(
  fieldPathOrKey: string,
): boolean {
  const path = fieldPathOrKey.trim();
  if (!path) return false;

  if (path.startsWith("people-i-help.") || !path.includes(".")) {
    const key = path.includes(".") ? path.slice(path.indexOf(".") + 1) : path;
    return peopleFieldSupportsResearch(key);
  }

  if (RESEARCH_EXCLUDED_PATHS.has(path)) return false;
  if (RESEARCH_INCLUDED_PATHS.has(path)) return true;

  if (path.startsWith("work-style.")) return false;

  const entry = getFieldHelpEntry(path);
  if (entry) {
    return entry.availableActions.includes("research_with_shari");
  }

  // Offers / brand / direction / tools — research often helps
  if (
    path.startsWith("offers.") ||
    path.startsWith("brand.") ||
    path.startsWith("direction.") ||
    path.startsWith("tools.")
  ) {
    return true;
  }

  return false;
}
