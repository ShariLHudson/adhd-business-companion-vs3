/** Executive Experience Framework — experiences, not tools. */

import type { MissionId } from "@/lib/founder/missions/types";

export type ExecutiveExperienceId =
  | "build_something"
  | "think_with_me"
  | "help_me_decide"
  | "research_for_me"
  | "launch_something"
  | "review_my_company"
  | "teach_me"
  | "quiet_work";

export type ExperienceState =
  | "arrival"
  | "orienting"
  | "active"
  | "preparing"
  | "complete"
  | "continue";

export type ExperienceIntent = {
  phrase?: string;
  experienceId?: ExecutiveExperienceId;
  confidence: "high" | "medium" | "low";
};

export type ExperienceFlow = {
  arrival: string;
  orientation: string;
  primaryAction: string;
  canWait: string[];
  founderPrepares: string[];
};

export type ExperienceOutcome = {
  id: string;
  label: string;
  achieved: boolean;
};

export type ExperienceRecommendation = {
  id: string;
  title: string;
  summary: string;
  tier: "primary" | "supporting";
};

export type ExecutiveExperience = {
  id: ExecutiveExperienceId;
  name: string;
  purpose: string;
  emotionalTone: string;
  primaryOutcome: string;
  whyAmIHere: string;
  goal: string;
  nextStep: string;
  canWait: string[];
  founderPrepares: string[];
  flow: ExperienceFlow;
  recommendations: ExperienceRecommendation[];
  composedFrom: string[];
  state: ExperienceState;
};

export type ExperienceContext = {
  missionId?: MissionId;
  experienceId?: ExecutiveExperienceId;
  state?: ExperienceState;
  intent?: ExperienceIntent;
};

export type ExperienceView = {
  product: "founder";
  missionId: MissionId;
  generatedAt: string;
  principle: string;
  experience: ExecutiveExperience;
  outcome: ExperienceOutcome;
  composed: Record<string, unknown>;
};

export type ExperienceCatalogEntry = Pick<
  ExecutiveExperience,
  "id" | "name" | "purpose" | "emotionalTone" | "primaryOutcome"
>;
