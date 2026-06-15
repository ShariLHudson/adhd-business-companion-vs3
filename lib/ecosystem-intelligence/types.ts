/** Ecosystem Intelligence Hub — one Companion, coordinated signals. */

export type EcosystemHealth = "healthy" | "watch" | "needs_support" | "strained";

export type UserEcosystemState = {
  health: EcosystemHealth;
  summary: string;
  cognitiveLoadLevel: string | null;
  activationState: string | null;
  recoveryLevel: string | null;
  userHealthStatus: string | null;
};

export type FounderEcosystemState = {
  health: EcosystemHealth;
  summary: string;
  businessHealth: string | null;
  chiefAssessment: string | null;
  topRisk: string | null;
  topOpportunity: string | null;
};

export type IntelligenceLayer =
  | "recognition"
  | "cognitive_load"
  | "activation"
  | "loop"
  | "day_designer"
  | "opportunity"
  | "adaptive_companion"
  | "user_health"
  | "momentum"
  | "recovery"
  | "decision"
  | "future_shari"
  | "environment"
  | "relationship"
  | "business_os"
  | "chief_of_staff"
  | "predictive_support";

export type EcosystemPriority =
  | "safety_support"
  | "recovery_support"
  | "cognitive_load_support"
  | "activation_support"
  | "recognition_celebration"
  | "loop_support"
  | "user_health_support"
  | "relationship_support"
  | "decision_support"
  | "environment_support"
  | "future_shari_support"
  | "momentum_acknowledgment"
  | "day_planning"
  | "adaptive_guidance"
  | "predictive_support"
  | "opportunity_explore"
  | "business_sort"
  | "chief_of_staff"
  | "calm_presence";

export type EcosystemSurface =
  | "companion_chat"
  | "recognition_card"
  | "activation_offer"
  | "loop_offer"
  | "relationship_offer"
  | "decision_offer"
  | "environment_offer"
  | "future_shari_offer"
  | "momentum_offer"
  | "opportunity_offer"
  | "business_os_sort"
  | "chief_of_staff_offer"
  | "day_designer"
  | "predictive_support_offer"
  | "founder_dashboard"
  | "none";

export type EcosystemSuppression =
  | "activation_offer"
  | "loop_offer"
  | "relationship_offer"
  | "decision_offer"
  | "environment_offer"
  | "future_shari_offer"
  | "momentum_offer"
  | "opportunity_offer"
  | "business_os_sort"
  | "chief_of_staff"
  | "day_designer"
  | "predictive_support_offer"
  | "productivity_nudges"
  | "business_nudges"
  | "founder_growth_nudges";

export type LayerSignal = {
  layer: IntelligenceLayer;
  priority: EcosystemPriority;
  weight: number;
  label: string;
  reason: string;
  surface: EcosystemSurface;
};

export type EcosystemSnapshot = {
  userState: UserEcosystemState;
  founderState: FounderEcosystemState;
  topSignal: EcosystemPriority;
  activeIntelligenceLayers: IntelligenceLayer[];
  recommendedSurface: EcosystemSurface;
  priorityReason: string;
  suppressions: EcosystemSuppression[];
  suggestedTone: string;
  avoidGuidance: string[];
  createdAt: string;
};

export type EcosystemInput = {
  now?: Date;
  text?: string;
  emotionalState?: string;
  recognitionActive?: boolean;
  userRequestedAction?: boolean;
  activationOfferActive?: boolean;
  loopOfferActive?: boolean;
  dayDesignerActive?: boolean;
  dayPlanActive?: boolean;
};

export type FounderEcosystemReport = {
  generatedAt: string;
  sampleSize: number;
  healthDistribution: { health: EcosystemHealth; label: string; count: number }[];
  topPriorities: { priority: EcosystemPriority; label: string; count: number }[];
  commonSuppressions: { suppression: string; count: number }[];
  topUserNeeds: string[];
  topFounderRisks: string[];
  topFounderOpportunities: string[];
  recommendedSystemImprovement: string;
  notes: string;
};
