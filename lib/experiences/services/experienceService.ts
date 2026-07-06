import type {
  ExperienceCatalogEntry,
  ExperienceContext,
  ExperienceOutcome,
  ExperienceView,
  ExecutiveExperienceId,
} from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { EXPERIENCE_DEFINITIONS, EXPERIENCE_FRAMEWORK_PRINCIPLE } from "../sample";
import { experienceSampleRepository } from "../repositories/sample";
import { composeExperienceContext } from "../contexts";
import { detectExperienceIntent, resolveExperienceId } from "../routing/intentDetection";
import { routeExperience, routeExperienceFromPhrase } from "../routing/experienceRouter";

export function listExperiences(): ExperienceCatalogEntry[] {
  return Object.values(EXPERIENCE_DEFINITIONS).map((seed) => ({
    id: seed.id,
    name: seed.name,
    purpose: seed.purpose,
    emotionalTone: seed.emotionalTone,
    primaryOutcome: seed.primaryOutcome,
  }));
}

export function composeExperience(context: ExperienceContext = {}): ExperienceView {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  const experienceId =
    context.experienceId ?? resolveExperienceId(context.intent);
  const { experience, composed } = composeExperienceContext({
    ...context,
    missionId,
    experienceId,
    state: context.state ?? "active",
  });

  const outcome: ExperienceOutcome = {
    id: `outcome-${experience.id}`,
    label: experience.primaryOutcome,
    achieved: experience.recommendations.some((r) => r.tier === "primary"),
  };

  return {
    product: "founder",
    missionId,
    generatedAt: new Date().toISOString(),
    principle: EXPERIENCE_FRAMEWORK_PRINCIPLE,
    experience,
    outcome,
    composed,
  };
}

export class ExperienceService {
  compose(context: ExperienceContext = {}) {
    return composeExperience(context);
  }

  route(phrase: string, missionId?: MissionId) {
    return routeExperienceFromPhrase(phrase, missionId);
  }

  detectIntent(phrase: string) {
    return detectExperienceIntent(phrase);
  }

  list() {
    return listExperiences();
  }

  sampleRepository() {
    return experienceSampleRepository;
  }
}

export const experienceService = new ExperienceService();

export { routeExperience, routeExperienceFromPhrase, detectExperienceIntent };
