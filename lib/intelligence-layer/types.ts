/**
 * Companion Intelligence™ — master profile architecture.
 * Signals (raw observations) stay separate from intelligence conclusions.
 */

// ---- Traits ----------------------------------------------------------------

export type TraitScore = {
  trait: string;
  /** 0–100 tendency strength */
  score: number;
  /** 0–1 how much evidence supports this */
  confidence: number;
  observations: number;
  lastUpdated: string;
};

export type TraitMap = Record<string, TraitScore>;

// ---- 1. Human Intelligence -----------------------------------------------

export type ExecutiveFunctionTrait =
  | "starter"
  | "finisher"
  | "overplanner"
  | "avoider"
  | "perfectionist"
  | "fast_decision_maker"
  | "slow_decision_maker"
  | "strong_prioritizer"
  | "weak_prioritizer";

export type EmotionalTrait =
  | "often_overwhelmed"
  | "often_frustrated"
  | "often_discouraged"
  | "often_excited"
  | "often_motivated"
  | "confidence_rising"
  | "confidence_dipping"
  | "burnout_risk";

export type EnergyTrait =
  | "morning_creator"
  | "afternoon_strategist"
  | "evening_thinker"
  | "hyperfocus_tendency"
  | "low_energy_mornings"
  | "recovery_sensitive";

export type LearningTrait =
  | "visual_learner"
  | "auditory_learner"
  | "kinesthetic_learner"
  | "example_driven"
  | "step_by_step_preference";

export type HumanIntelligence = {
  executiveFunction: TraitMap;
  emotional: TraitMap;
  energy: TraitMap;
  learning: TraitMap;
};

// ---- 2. Relationship Intelligence ----------------------------------------

export type CommunicationStyleTrait =
  | "prefers_direct"
  | "prefers_detailed"
  | "prefers_short"
  | "action_oriented"
  | "encouragement_oriented"
  | "strategy_oriented"
  | "accountability_oriented";

export type TrustTrait =
  | "responds_to_suggestions"
  | "ignores_generic_suggestions"
  | "momentum_from_interventions"
  | "disengages_from_nagging";

export type SupportStyleTrait =
  | "brainstorming"
  | "accountability"
  | "coaching"
  | "problem_solving"
  | "encouragement"
  | "strategic_planning";

export type RelationshipIntelligence = {
  communicationStyle: TraitMap;
  trust: TraitMap;
  supportStyle: TraitMap;
};

// ---- 3. Business Intelligence --------------------------------------------

export type BusinessIdentityTrait =
  | "coach"
  | "consultant"
  | "author"
  | "speaker"
  | "service_provider"
  | "creator"
  | "entrepreneur";

export type BusinessStageTrait =
  | "idea_stage"
  | "building_stage"
  | "launch_stage"
  | "growth_stage"
  | "scaling_stage";

export type VisibilityTrait =
  | "consistent_creator"
  | "inconsistent_creator"
  | "marketing_active"
  | "audience_growth_focus";

export type RevenueActivityTrait =
  | "offer_builder"
  | "lead_generation_active"
  | "sales_activity"
  | "client_acquisition_focus";

export type BusinessIntelligence = {
  identity: TraitMap;
  stage: TraitMap;
  visibility: TraitMap;
  revenueActivity: TraitMap;
};

// ---- 4. ADHD Intelligence ------------------------------------------------

export type ResistanceTrait =
  | "large_projects"
  | "unclear_tasks"
  | "perfectionism"
  | "fear_of_judgment"
  | "overwhelm";

export type MomentumTrait =
  | "small_wins"
  | "voice_conversations"
  | "brain_dumps"
  | "accountability"
  | "smaller_pieces";

export type RecoveryTrait =
  | "rest"
  | "brain_dump"
  | "walking"
  | "music"
  | "conversation"
  | "project_planning";

export type AdhdIntelligence = {
  resistance: TraitMap;
  momentum: TraitMap;
  recovery: TraitMap;
};

// ---- 5. Companion Intelligence (derived — consume only) ------------------

export type CompanionPersonalization = {
  /** Single voice — one companion, not multiple agents */
  tone: "warm" | "direct" | "calm" | "encouraging";
  responseLength: "short" | "balanced" | "detailed";
  primarySupportMode: SupportStyleTrait | null;
  accountabilityLevel: "low" | "medium" | "high";
  /** Invisible hints for prompt assembly — never shown as separate personalities */
  coachingHints: string[];
  /** Patterns worth acknowledging gently */
  ownerManualSummary: string[];
  generatedAt: string;
};

export type CompanionIntelligenceSlice = {
  personalization: CompanionPersonalization;
  /** Read-only snapshot of what informed personalization */
  topHumanTraits: string[];
  topAdhdMomentum: string[];
  topBusinessFocus: string[];
};

// ---- Master profile --------------------------------------------------------

export type IntelligenceProfile = {
  version: 1;
  userId: string;
  createdAt: string;
  updatedAt: string;
  signalCount: number;
  human: HumanIntelligence;
  relationship: RelationshipIntelligence;
  business: BusinessIntelligence;
  adhd: AdhdIntelligence;
  /** Companion slice is recomputed on read — not persisted as source of truth */
};

export type IntelligenceProfileStore = {
  profile: IntelligenceProfile;
  lastEvolvedAt: string | null;
};

// ---- Signals (raw — separate from conclusions) -----------------------------

export type IntelligenceSignalDomain =
  | "conversation"
  | "workspace"
  | "project"
  | "creation"
  | "emotional"
  | "energy"
  | "business"
  | "action"
  | "trust";

export type IntelligenceSignalValence = "positive" | "neutral" | "negative";

export type IntelligenceSignal = {
  id: string;
  at: string;
  date: string;
  domain: IntelligenceSignalDomain;
  /** Flexible category key — mapped to traits during evolution */
  category: string;
  source: string;
  valence?: IntelligenceSignalValence;
  meta?: Record<string, string | number | boolean>;
};

export type IntelligenceSignalStore = {
  signals: IntelligenceSignal[];
};

export const INTELLIGENCE_PROFILE_UPDATED = "companion-intelligence-profile-updated";
