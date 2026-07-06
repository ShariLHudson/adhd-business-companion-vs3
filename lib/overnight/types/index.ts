/** Overnight Executive Cycle™ — orchestration types (no UI, no schedulers). */

export type OvernightPhaseId =
  | "collect"
  | "normalize"
  | "observe"
  | "reason"
  | "recommend"
  | "prioritize"
  | "prepare";

export type OvernightSignalSource =
  | "research"
  | "companion"
  | "founder"
  | "postcraft"
  | "gohighlevel"
  | "analytics"
  | "mission"
  | "decision-vault"
  | "customer-feedback"
  | "ai-news"
  | "technology"
  | "competitors";

export type OvernightProductAudience =
  | "founder"
  | "companion"
  | "postcraft"
  | "team-hub"
  | "members"
  | "ecosystem";

export type OvernightRecommendationKind =
  | "product"
  | "feature"
  | "workshop"
  | "course"
  | "newsletter"
  | "marketing"
  | "automation"
  | "business-improvement"
  | "research"
  | "executive-decision";

export type OvernightPriorityDimensions = {
  /** 0–100 */
  priority: number;
  urgency: number;
  confidence: number;
  strategicValue: number;
  customerValue: number;
  founderValue: number;
  revenuePotential: number;
  missionAlignment: number;
};

export type CollectedSignal = {
  id: string;
  source: OvernightSignalSource;
  title: string;
  summary: string;
  refId?: string;
  missionIds: string[];
  collectedAt: string;
};

export type NormalizedSignal = CollectedSignal & {
  category: string;
  dedupeKey: string;
  relationshipIds: string[];
  sparkReady: boolean;
};

export type OvernightObservation = {
  id: string;
  kind: "pattern" | "relationship" | "change" | "theme" | "problem" | "opportunity" | "risk";
  title: string;
  summary: string;
  signalIds: string[];
  confidence: number;
};

export type OvernightReasoningItem = {
  id: string;
  observationId: string;
  matters: boolean;
  affectsMission: boolean;
  audiences: OvernightProductAudience[];
  rationale: string;
  missionIds: string[];
};

export type OvernightRecommendation = {
  id: string;
  kind: OvernightRecommendationKind;
  title: string;
  summary: string;
  missionIds: string[];
  reasoningId: string;
  suggestedAction?: string;
};

export type PrioritizedItem = OvernightRecommendation & {
  dimensions: OvernightPriorityDimensions;
  compositeScore: number;
};

export type QuestionSummary = {
  id: string;
  question: string;
  category: string;
  priority: number;
  missionId?: string;
};

export type MissionSummary = {
  missionId: string;
  title: string;
  status: string;
  headline: string;
  progressNote: string;
  isRecommended: boolean;
};

export type OpportunitySummary = {
  id: string;
  title: string;
  headline: string;
  missionIds: string[];
  compositeScore: number;
};

export type RiskSummary = {
  id: string;
  title: string;
  headline: string;
  severity: "low" | "medium" | "high";
  missionIds: string[];
};

export type ResearchSummary = {
  id: string;
  title: string;
  headline: string;
  itemsReviewed: number;
  worthReading: boolean;
};

export type MarketingSummary = {
  id: string;
  title: string;
  headline: string;
  channel?: string;
};

export type ProductSummary = {
  id: string;
  title: string;
  headline: string;
  missionIds: string[];
};

export type AutomationSummary = {
  id: string;
  title: string;
  headline: string;
  hoursSavedEstimate?: string;
};

export type ExecutiveBrief = {
  id: string;
  date: string;
  greeting: string;
  narrative: string[];
  highlights: string[];
  missionFocus: string;
  recommendedMissionId: string;
  recommendedFirstAction: string;
  calmClose: string;
};

export type MorningSummary = {
  date: string;
  whileYouWereAway: string[];
  stats: {
    researchItemsReviewed: number;
    recurringStrugglesIdentified: number;
    opportunitiesDeserveAttention: number;
    decisionsWaiting: number;
    workshopIdeasEmerging: number;
  };
};

export type PreparedOffice = {
  date: string;
  brief: ExecutiveBrief;
  morning: MorningSummary;
  missionFocus: MissionSummary;
  todaysQuestions: QuestionSummary[];
  opportunities: OpportunitySummary[];
  risks: RiskSummary[];
  research: ResearchSummary[];
  marketing: MarketingSummary[];
  products: ProductSummary[];
  automations: AutomationSummary[];
  recommendations: PrioritizedItem[];
  recommendedMission: MissionSummary;
  recommendedFirstAction: string;
};

export type OvernightPhaseResult<T> = {
  phase: OvernightPhaseId;
  completedAt: string;
  payload: T;
};

export type CollectPhasePayload = {
  signals: CollectedSignal[];
  sourceCounts: Record<OvernightSignalSource, number>;
};

export type NormalizePhasePayload = {
  signals: NormalizedSignal[];
  duplicatesRemoved: number;
};

export type ObservePhasePayload = {
  observations: OvernightObservation[];
  patternCount: number;
  themeCount: number;
};

export type ReasonPhasePayload = {
  items: OvernightReasoningItem[];
  founderRelevant: number;
};

export type RecommendPhasePayload = {
  recommendations: OvernightRecommendation[];
};

export type PrioritizePhasePayload = {
  items: PrioritizedItem[];
};

export type PreparePhasePayload = PreparedOffice;

export type OvernightCycleRun = {
  id: string;
  date: string;
  startedAt: string;
  completedAt: string;
  phases: OvernightPhaseId[];
  preparedOffice: PreparedOffice;
};

export type OvernightCycleHistoryRecord = {
  id: string;
  date: string;
  signalsProcessed: number;
  researchProcessed: number;
  questionsPrepared: number;
  recommendations: number;
  missionUpdates: number;
  opportunitiesDiscovered: number;
  risksDiscovered: number;
  briefGenerated: boolean;
  cycleId: string;
};

export type OvernightCycleFilter = {
  date?: string;
  missionId?: string;
};
