/**
 * Estate Intelligence Architecture™ — world model types.
 * Capability-first routing: Intent → Capability → Expert → Experience → Tool.
 *
 * @see docs/estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateExperienceId } from "@/lib/estateExperiences/types";
import type { EstateIntentCategory } from "./intentCategories";

export type EstateEnvironmentChoice = {
  environmentId: string;
  environmentName: string;
  purpose: string;
  spaceId: string;
  score: number;
};

/** Research depth — Spark chooses level automatically. */
export type EstateResearchLevel = 1 | 2 | 3 | 4;

export type EstateCapabilityCategory =
  | "research"
  | "create"
  | "momentum"
  | "focus"
  | "restore"
  | "journal"
  | "learn"
  | "grow"
  | "business"
  | "play"
  | "explore";

export type EstateCapability = {
  id: string;
  name: string;
  category: EstateCapabilityCategory;
  triggers: readonly string[];
  experienceId: EstateExperienceId;
  spaceId: string;
  toolId?: AppSection | string;
  expertIds: readonly string[];
  researchLevel?: EstateResearchLevel;
  /** High-confidence routes navigate immediately — no permission ask. */
  immediateNavigate?: boolean;
};

export type EstateExpert = {
  id: string;
  name: string;
  /** Capability categories this expert advises on */
  categories: readonly EstateCapabilityCategory[];
  specialties: readonly string[];
  triggers: readonly string[];
};

export type EstateIntelligenceConfidence = "high" | "medium" | "low";

/** Full routing decision — internal Spark world model output. */
export type EstateIntelligenceRoute = {
  userText: string;
  /** Intent-first layer — member goal, not room name */
  intentCategory?: EstateIntentCategory;
  environmentId?: string;
  environmentName?: string;
  alternativeEnvironments?: readonly EstateEnvironmentChoice[];
  capabilityId: string;
  capabilityName: string;
  category: EstateCapabilityCategory;
  expertIds: readonly string[];
  expertNames: readonly string[];
  experienceId: EstateExperienceId;
  experienceName: string;
  spaceId: string;
  toolId?: AppSection | string;
  researchLevel?: EstateResearchLevel;
  confidence: EstateIntelligenceConfidence;
  /** Navigate + open tool without permission ask */
  immediateNavigate: boolean;
  /** Answer in conversation only (e.g. research level 1) */
  answerInConversation: boolean;
  arrivalLine?: string;
  followUpLine?: string;
  nextExperienceSuggestions: readonly string[];
  matchScore: number;
  matchReasons: readonly string[];
};

export type ImmediateResearchOpenPayload = {
  userText: string;
  capabilityId: string;
  researchLevel: EstateResearchLevel;
  estatePlaceId: string;
  section: AppSection;
  expertIds: readonly string[];
  followUpLine: string;
};
