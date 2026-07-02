/**
 * Personal Learning Ecosystem™ — connection destinations for every experience.
 * References only — never duplicate content.
 */

import type { LearningExperienceTypeId } from "@/lib/sparkMomentumInstitute/types";
import type { PersonalLearningEcosystemDestination } from "@/lib/sparkCompetencyFramework/types";
import { PERSONAL_LEARNING_ECOSYSTEM_DESTINATIONS } from "@/lib/sparkCompetencyFramework/types";
import { loadInstituteCatalog } from "./catalog/provider";

/** Default ecosystem links per experience type */
export const DEFAULT_ECOSYSTEM_LINKS: Record<
  LearningExperienceTypeId,
  PersonalLearningEcosystemDestination[]
> = {
  business_mastery_minute: [
    "institute_cabinet",
    "journal",
    "make_it_mine",
    "growth_profile",
  ],
  guided_lesson: [
    "institute_cabinet",
    "journal",
    "make_it_mine",
    "growth_profile",
  ],
  deep_lesson: [
    "institute_cabinet",
    "journal",
    "make_it_mine",
    "evidence_vault",
    "growth_profile",
    "portfolio",
  ],
  deep_workshop: [
    "institute_cabinet",
    "journal",
    "make_it_mine",
    "evidence_vault",
    "growth_profile",
    "portfolio",
  ],
  strategy_collection: [
    "institute_cabinet",
    "make_it_mine",
    "portfolio",
    "growth_profile",
  ],
  thinking_gym: ["journal", "growth_profile"],
  business_lab: [
    "make_it_mine",
    "portfolio",
    "evidence_vault",
    "growth_profile",
  ],
  simulation: ["journal", "make_it_mine", "growth_profile"],
  apprenticeship: [
    "institute_cabinet",
    "journal",
    "make_it_mine",
    "evidence_vault",
    "growth_profile",
    "portfolio",
  ],
  reflection: ["journal", "institute_cabinet", "growth_profile"],
  challenge: [
    "make_it_mine",
    "evidence_vault",
    "growth_profile",
    "portfolio",
  ],
  coaching_session: [
    "make_it_mine",
    "portfolio",
    "evidence_vault",
    "growth_profile",
  ],
  apply_to_my_business: [
    "make_it_mine",
    "portfolio",
    "evidence_vault",
    "growth_profile",
  ],
};

export function ecosystemDestinationsForExperience(
  experienceType: LearningExperienceTypeId,
): PersonalLearningEcosystemDestination[] {
  const catalog = loadInstituteCatalog();
  return (
    catalog.ecosystemLinks?.[experienceType] ??
    DEFAULT_ECOSYSTEM_LINKS[experienceType] ??
    [...PERSONAL_LEARNING_ECOSYSTEM_DESTINATIONS]
  );
}

export function experienceSupportsDestination(
  experienceType: LearningExperienceTypeId,
  destination: PersonalLearningEcosystemDestination,
): boolean {
  return ecosystemDestinationsForExperience(experienceType).includes(
    destination,
  );
}

/** Growth Profile updates automatically — no permission */
export function isAutomaticEcosystemDestination(
  destination: PersonalLearningEcosystemDestination,
): boolean {
  return destination === "growth_profile";
}

/** Evidence requires real outcome + permission */
export function isPermissionGatedEcosystemDestination(
  destination: PersonalLearningEcosystemDestination,
): boolean {
  return destination === "evidence_vault";
}
