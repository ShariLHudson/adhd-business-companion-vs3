/**
 * Research Library — conversational research + reusable collections.
 */

import type { UniversalResearchStatus } from "@/lib/universalRequestOutcome";

/** Extends universal statuses with Research Library session honesty states. */
export type ResearchLibraryStatus =
  | UniversalResearchStatus
  | "current_research_in_progress"
  | "mixed_sources_used"
  | "connected_sources_used";

export type ResearchMode =
  | "open_exploration"
  | "focused_question"
  | "comparison"
  | "current_information"
  | "source_based"
  | "research_with_outcome"
  | "selected_context_research";

export type ResearchConversationTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  findingIdsAdded?: string[];
};

export type ResearchFindingRecord = {
  id: string;
  title: string;
  content: string;
  kind:
    | "fact"
    | "theme"
    | "example"
    | "option"
    | "recommendation"
    | "risk"
    | "caution"
    | "question"
    | "implication";
  sourceTitle: string;
  sourceType:
    | "stable_knowledge"
    | "estate"
    | "user"
    | "public"
    | "official"
    | "connected"
    | "unknown";
  publisher: string | null;
  retrievalDate: string;
  publicationDate: string | null;
  confidence: "high" | "medium" | "low";
  freshness: "current" | "stable" | "unknown";
  verificationStatus: "verified" | "partially_verified" | "unverified";
  important?: boolean;
};

export type ResearchCollectionRecord = {
  id: string;
  title: string;
  topic: string;
  purpose: string;
  intendedOutcome: string | null;
  sourceExperience: string | null;
  sourceEntityId: string | null;
  sourceSelectionIds: string[];
  researchSessionIds: string[];
  summary: string;
  findings: ResearchFindingRecord[];
  facts: string[];
  themes: string[];
  examples: string[];
  options: string[];
  comparisons: string[];
  recommendations: string[];
  implications: string[];
  risks: string[];
  cautions: string[];
  questions: string[];
  conflicts: string[];
  uncertainties: string[];
  gaps: string[];
  sourceReferences: string[];
  sourceTypes: string[];
  retrievalDates: string[];
  freshness: "current" | "stable" | "mixed" | "unknown";
  confidence: "high" | "medium" | "low";
  verificationStatus: "verified" | "partially_verified" | "unverified";
  userNotes: string[];
  userQuestions: string[];
  userHighlights: string[];
  approvedFindingIds: string[];
  excludedFindingIds: string[];
  savedFindingIds: string[];
  status: "active" | "saved" | "archived";
  currentResearchStatus: ResearchLibraryStatus;
  failureState: string | null;
  retryState: string | null;
  inferredPossibleUses: string[];
  selectedUse: string | null;
  linkedCreationPackageIds: string[];
  linkedProjectIds: string[];
  linkedVisualWorkspaceIds: string[];
  linkedStrategyIds: string[];
  linkedEstateRecordIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ResearchSession = {
  id: string;
  title: string;
  primaryTopic: string;
  currentQuestion: string;
  purpose: string;
  intendedOutcome: string | null;
  sourceExperience: string | null;
  sourceEntityId: string | null;
  sourceSelectionIds: string[];
  conversationId: string;
  conversationTurns: ResearchConversationTurn[];
  currentResearchCollectionId: string | null;
  researchMode: ResearchMode;
  currentStatus:
    | "idle"
    | "conversing"
    | "researching"
    | "awaiting_use"
    | "building_outcome"
    | "complete";
  currentInformationRequired: boolean;
  liveResearchAvailable: boolean;
  currentResearchStatus: ResearchLibraryStatus;
  knownUserContext: string | null;
  relevantEstateContext: string | null;
  activeQuestionIds: string[];
  resolvedQuestionIds: string[];
  unresolvedQuestionIds: string[];
  lastUsefulSummary: string | null;
  nextSuggestedInquiry: string | null;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
};

export type ContextualResearchRequest = {
  id: string;
  sourceExperience: string;
  sourceEntityId: string | null;
  sourceSelectionIds: string[];
  selectedText: string;
  selectedObjectSummaries: string[];
  surroundingContext: string | null;
  researchTopic: string;
  researchQuestion: string;
  purpose: string;
  likelyIntendedOutcome: string | null;
  currentInformationRequired: boolean;
  sourcePreferences: string[];
  returnContext: string | null;
  createdAt: string;
};

export type ResearchUseOption = {
  id: string;
  label: string;
  description: string;
  outcomeType: string;
  destination:
    | "create"
    | "projects"
    | "visual_thinking"
    | "strategic_planning"
    | "business_estate"
    | "research"
    | "stay";
  reason: string;
  confidence: number;
  primary: boolean;
  requiresClarification: boolean;
};

export type ResearchOutcomeArtifact = {
  id: string;
  kind:
    | "list"
    | "document"
    | "form"
    | "guide"
    | "comparison"
    | "checklist"
    | "summary"
    | "strategy_proposal"
    | "project_proposal"
    | "creation_package";
  title: string;
  content: string;
  sections: Array<{ title: string; body: string }>;
  researchCollectionId: string;
  destinationHint: ResearchUseOption["destination"];
  createdAt: string;
};

export const RESEARCH_LIBRARY_TITLE = "Research Library";
export const RESEARCH_LIBRARY_SUPPORTING =
  "Explore a question, gather useful information, and decide what you want to do with what you discover.";
export const RESEARCH_LIBRARY_OPENING_PROMPT =
  "What would you like to explore, understand, or investigate?";
export const RESEARCH_LIBRARY_INPUT_PLACEHOLDER =
  "Ask anything you want to understand…";
