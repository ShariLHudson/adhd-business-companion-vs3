/**
 * Strategy Chamber — shared strategic work record and stage model.
 * Source of truth for strategic reasoning; execution lives elsewhere.
 */

export type StrategyThinkingStage =
  | "understand_current_state"
  | "choose_direction"
  | "explore_options"
  | "evaluate_decision"
  | "handoff_direction";

export type StrategyWorkStatus =
  | "not_started"
  | "understanding"
  | "exploring"
  | "evaluating"
  | "direction_chosen"
  | "testing"
  | "handed_off"
  | "under_review"
  | "paused"
  | "completed"
  | "archived";

export type StrategyEntryReason =
  | "need_direction"
  | "important_decision"
  | "rethink_current_direction"
  | "new_opportunity"
  | "problem_not_improving"
  | "major_commitment"
  | "review_existing_strategy"
  | "referred_from_other_destination"
  | "unsure";

export type StrategyFamilyId =
  | "business_direction"
  | "customer_and_market"
  | "offers_and_innovation"
  | "money_and_resources"
  | "people_and_leadership"
  | "personal_direction";

export type StrategyConnectionEntityType =
  | "chamber_conversation"
  | "board_session"
  | "talk_it_out_session"
  | "creation"
  | "project"
  | "execution_plan"
  | "calendar_event"
  | "plan_my_day_item"
  | "rhythm"
  | "reminder"
  | "journal_entry"
  | "evidence_item"
  | "business_estate_record"
  | "person_profile"
  | "spark_card"
  | "achievement"
  | "celebration"
  | "decision_record"
  | "catalog_strategy"
  | "user_strategy";

export type StrategyConnectionType =
  | "consulted"
  | "briefed"
  | "handed_off"
  | "derived_from"
  | "supports"
  | "tests"
  | "schedules"
  | "reflects"
  | "evidences"
  | "updates";

export type StrategyOption = {
  id: string;
  title: string;
  whyItMayFit?: string;
  benefits?: string[];
  tradeoffs?: string[];
  whatWouldNeedToBeTrue?: string[];
  smallTest?: string;
};

export type StrategyWorkItem = {
  id: string;
  userId?: string;
  title: string;
  plainLanguageSummary: string;
  status: StrategyWorkStatus;
  entryReason: StrategyEntryReason;
  strategyFamily?: StrategyFamilyId | null;
  strategyType?: string | null;
  currentStage: StrategyThinkingStage;
  /** Central strategic question — not the same as current situation. */
  decisionStatement?: string;
  /** Present-tense situation context — never auto-copied from the question. */
  currentReality?: string;
  knownFacts?: string[];
  observations?: string[];
  assumptions?: string[];
  unknowns?: string[];
  constraints?: string[];
  strengths?: string[];
  opportunities?: string[];
  desiredDirection?: string;
  optionsConsidered?: StrategyOption[];
  decisionCriteria?: string[];
  tradeoffs?: string[];
  risks?: string[];
  secondOrderEffects?: string[];
  chosenDirection?: string;
  notChosen?: string[];
  decisionRationale?: string;
  experiments?: string[];
  successSignals?: string[];
  guardrails?: string[];
  confidenceLevel?: "low" | "medium" | "high";
  reviewDate?: string | null;
  recommendedNextDestination?: string | null;
  sourceContext?: string;
  sourceDestination?: string;
  createdBy?: "member" | "companion" | "migration";
  /** Active guided question shown to the member */
  activeQuestion?: string;
  /** Latest Shari reflection shown above the question */
  shariReflection?: string;
  /** Conversational answers after the opening question (member language) */
  memberStatements?: string[];
  /** Draft text in the response field — preserved across remounts */
  draftResponse?: string;
  /** Member confirmed the generated Decision Record */
  decisionRecordConfirmed?: boolean;
  /** Options were offered in conversation (not typed into a blank field) */
  optionsOffered?: boolean;
  version: number;
  /** Link to legacy catalog / user strategy when applicable */
  linkedCatalogStrategyId?: string | null;
  linkedUserStrategyId?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type StrategyConnection = {
  id: string;
  strategyWorkItemId: string;
  connectedEntityType: StrategyConnectionEntityType;
  connectedEntityId: string;
  connectionType: StrategyConnectionType;
  relationshipSummary: string;
  syncDirection: "to_destination" | "from_destination" | "bidirectional";
  /** Never apply destination updates without explicit approval */
  memberApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StrategyDecisionRecordView = {
  whatYouWereDeciding: string;
  whatIsHappeningNow: string;
  directionYouChose: string;
  whyThisDirectionFits: string;
  whatYouAreNotChoosing: string;
  assumptionsToTest: string[];
  risksToWatch: string[];
  howYouWillKnowItIsWorking: string[];
  whenToReview: string;
  nextHelpfulStep: string;
};

export type ContinueJourneyDestinationId =
  | "talk_it_out"
  | "chamber_member"
  | "board"
  | "create"
  | "project"
  | "execution_manager"
  | "calendar"
  | "plan_my_day"
  | "rhythm"
  | "reminder"
  | "journal"
  | "evidence_vault"
  | "business_estate"
  | "celebration";

export type ContinueJourneyOption = {
  destinationId: ContinueJourneyDestinationId;
  title: string;
  benefit: string;
  actionLabel: string;
};

export type ContinueYourJourneyModel = {
  recommended: ContinueJourneyOption | null;
  secondary: ContinueJourneyOption[];
  showSeeMore: boolean;
};
