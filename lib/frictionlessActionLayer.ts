/**
 * Frictionless Companion Action Layer (P0.9)
 * Chat is the front door — act, ask one question, or open the right tool.
 * Runs before relationship reflection.
 *
 * **Phase C — adapter:** Estate navigation branches should call `goToPlace` via
 * `resolveEstatePlace` — not legacy section routing alone.
 *
 * @see lib/estate/resolveEstatePlace.ts
 */

import {
  buildCanonResponseHint,
  tryCanonLocalReply,
} from "@/lib/canonContext";
import { detectAudioRequest } from "./audioSuggestions";
import {
  executeGuardedEnvironmentalAudioPlay,
  resolveGuardedEnvironmentalAudioRequest,
  shouldBlockAutoPlayForAudioQuery,
  stopGuardedEnvironmentalAudio,
} from "./estate/audioPlaybackGuard";
import {
  isConfirmationAcceptance,
  isPureConfirmationDecline,
} from "./conversationConfirmationGate";
import { shouldSuppressEnvironmentNeedDuringDistress } from "./conversation/emotionalDistressRouting";
import {
  inferMeaningTopicFromAssistant,
  inferMeaningTopicFromFrictionlessPending,
} from "./conversation/mostRecentMeaningWins";
import {
  isConversationPriorityEngineEnabled,
  resolveConversationPriority,
} from "./conversationIntelligence/orchestrator";
import {
  formatEmotionalFirstOpening,
  planEmotionalFirstResponse,
} from "./conversation/emotionalFirstResponseSequence";
import {
  buildDifficultClientCallOpeningReply,
  isDifficultClientCallRequest,
} from "./conversation/shariCompanionEngine";
import {
  adhdEmotionalFrictionHintForChat,
  buildAdhdEmotionalFrictionReply,
  isAdhdEmotionalFrictionTurn,
} from "./adhdEmotionalFrictionIntelligence";
import {
  buildAttentionWanderReply,
  buildFrictionFirstOpeningReply,
  clearFrictionFirstSession,
  createFrictionFirstSession,
  evaluateFrictionFirst,
  frictionFirstHintForChat,
  isAttentionWanderSignal,
  isFrictionFirstMenuOffer,
  isFrictionFirstSessionExpired,
  isFrictionFirstTurn,
  loadFrictionFirstSession,
  resolveFrictionBarrierChoice,
  saveFrictionFirstSession,
} from "./sparkCompanion/frictionFirst";
import {
  buildCanonicalEmotionalLocalReply,
  emotionalFirstActionSecondHintForChat,
  evaluateEmotionalFirstActionSecond,
} from "./sparkCompanion/emotionalFirstActionSecond";
import {
  evaluateSparkDecisionEngine,
  mapDecisionToRuntimeAction,
} from "./sparkCompanion";
import type { SparkRuntimeAction } from "./sparkCompanion";
import { isSelfUnderstandingIntent } from "./relationshipIntelligenceBoundaries";
import type { ToolSuggestion } from "./companionToolSuggestions";
import type { AppSection } from "./companionUi";
import {
  isRegistryArtifactExecution,
  type RegistryArtifactKind,
} from "./artifactRegistry";
import {
  resolveImmediateCreateAction,
  resolveImmediateCreateProjectAction,
  resolveImmediateMomentumAction,
  isMomentumForwardIntent,
  isProjectCreationIntent,
  buildRegistryArtifactOfferLine,
  type ImmediateCreateOpenPayload,
  type ImmediateCreateProjectOpenPayload,
  type ImmediateMomentumOpenPayload,
} from "./createExperience/createExperienceRouting";
import {
  formatEstateIntelligenceHint,
  resolveEstateIntelligenceImmediateAction,
} from "./estateBrain/routeEstateIntelligence";
import type { ImmediateResearchOpenPayload } from "./estateBrain/intelligenceTypes";
import type { ImmediateEstateCoachingOpenPayload } from "./estateBrain/estateCoachingTypes";
import {
  buildCoachingOpenPayload,
  cacheCoachingMenu,
  estateCoachingHint,
  formatEstateCoachingMenu,
  isEstateCoachingMenuMessage,
  loadCachedCoachingMenu,
  parseEstateCoachingChoice,
  resolveEstateCoachingContinuation,
  resolveEstateCoachingMenu,
  shouldCoachBeforeNavigate,
} from "./estateBrain/estateCoaching";
import type { EstateCoachingMenu } from "./estateBrain/estateCoachingTypes";
import type { DiscoverySession } from "./estateBrain/discoveryTypes";
import {
  clearDiscoverySession,
  discoveryHint,
  formatDiscoveryQuestion,
  loadDiscoverySession,
  resolveDiscoveryTurn,
  saveDiscoverySession,
  shouldEnterDiscoveryMode,
} from "./estateBrain/discoveryMode";
import {
  syncUniversalCreationHandoffToSession,
} from "./conversationSession";
import {
  resolveCompanionTurn,
  updateCompanionContextFromDecision,
  updateCompanionContextFromEstateRuntime,
  writeCompanionConversationState,
} from "./companionConversationContext";
import {
  clearUniversalCreationSession,
  detectUniversalDocumentType,
  formatUniversalCreationQuestion,
  formatUniversalCreationTurnReply,
  isUniversalCreationMessage,
  loadUniversalCreationSession,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
  shouldEnterUniversalCreation,
  universalCreationHint,
} from "./universalCreation";
import type { UniversalCreationSession } from "./universalCreation";
import {
  createFastPathRecoveryLine,
  isSimpleCreateRequest,
  logCreateFastPath,
} from "./universalCreation/createFastPath";
import { isCreateFlowAssistantContext } from "./universalCreation/createFlowContext";
import {
  estateGuideHint,
  formatEstateGuideReply,
  isEstateGuideQuestion,
  isEstateOrientationQuestion,
  isEstateRoomStoryQuestion,
  resolveEstateGuideTurn,
  shariKnowledgeHintForChat,
} from "./sparkKnowledge";
import { isSubstantiveConversationHelpRequest } from "./estate/substantiveConversationHelp";
import {
  buildEmailAutomationHelpReply,
  isEmailAutomationOrInboxHelpRequest,
} from "./estate/emailAutomationHelp";
import {
  acceptRestorationStory,
  buildRestorationOffer,
  buildStoryPick,
  evaluateRestorationOpportunity,
  formatInlineStoryReply,
  formatRestorationOfferReply,
  isRestorationAcceptance,
  isRestorationDecline,
  isRestorationOfferMessage,
  isRestorationReturnReady,
  recordRestorationDeclined,
  recordRestorationOffer,
  resolveRestorationReturn,
  loadRestorationStore,
  setPendingReturn,
} from "./estateRestoration";
import {
  buildEnergyRestorationOffer,
  evaluateSparkRestoration,
  formatEnergyRestorationReply,
  formatInlineEnergyStory,
} from "./sparkRestorationIntelligence";
import {
  inferCreateItemTypeFromText,
  logCreatePendingAction,
} from "./createPendingAction";
import { isDecisionCompassOfferSignal } from "./decisionCompassRouting";
import {
  detectArtifactRequest,
  resolveIntentRouting,
  type IntentRoutingDecision,
} from "./intentRoutingIntelligence";
import { shouldSuppressRelationshipIntelligenceForUserText } from "./relationshipIntelligenceBoundaries";
import {
  containsVisualStructurePhrase,
  resolveVisualStructureRoute,
  resolveVisualStructureWorkspaceOffer,
} from "./visualStructureRouting";
import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";
import {
  buildOverwhelmTodayOffers,
  detectOverwhelmTodayRoute,
} from "./overwhelmTodayRouting";
import {
  buildStrategyOfferPendingFromRecommendation,
  isStrategyIntelligenceOfferMessage,
  shouldSkipStrategyOfferForUserText,
} from "./strategyOfferContinuation";
import { recommendStrategyFromUserText } from "./strategyIntelligence";
import {
  resolveUnavailableVisualTypeReply,
} from "./visualTypeAvailability";
import { clearVisualRecommendationPending } from "./visualThinkingContinuation";
import { isVisualThinkingMenuOfferMessage } from "./visualThinkingContinuation";
import {
  isActivationProblem,
  isFocusProblem,
  isMotivationProblem,
  isOverwhelmProblem,
  isRelationshipQuestion,
  isStrategyProblem,
  shouldSuppressVisualRecommendation,
} from "./visualThinkingGuards";
import {
  COGNITIVE_OVERLOAD_PRIMARY_LABEL,
  COGNITIVE_OVERLOAD_REPLY,
  COGNITIVE_OVERLOAD_STAY_LABEL,
  TASK_BREAKDOWN_REPLY,
  isCognitiveOverloadNeed,
  isTaskBreakdownNeed,
} from "./conversation/overwhelmNeedClassifier";
import {
  buildVisualRecommendationReply,
  recommendVisualStructures,
  shouldOfferVisualRecommendation,
  visualRecommendationPendingFromReply,
} from "./visualRecommendationEngine";
import {
  buildVisualSourceAskReply,
  validateVisualSourceContent,
} from "./visualSourceContentValidation";
import {
  isExplicitVisualThinkingRequest,
  shouldBlockVisualThinking,
} from "./visualThinkingOverreach";
import {
  detectConversionTargetView,
  detectExplicitVisualView,
  getVisualThinkingView,
  immediateVisualOpenAck,
  isVisualConversionRequest,
  shouldRouteBusinessStrategyToCreate,
  type VisualThinkingViewId,
} from "./visualThinkingStudio";
import {
  detectsVisualBeginnerUnsure,
  formatVisualBeginnerChoiceMessage,
  parseVisualBeginnerChoice,
  isVisualBeginnerChoiceMessage,
} from "./cartographersStudio/visualBeginnerChoice";
import {
  detectSheetIntent,
  shouldExcludeSheetOffer,
  startGoogleSheetIntake,
  type GoogleSheetIntakeSession,
  type GoogleSheetTypeId,
} from "./googleSheetsIntelligence";
import { welcomeRoomWorkspaceOffer } from "./welcomeRoom";
import { messageNamesExactEstateRoom } from "./estate/estateRoomAliasRegistry";
import type { WorkspaceOffer } from "./workspaceMode";
import type { TimeBlock } from "./companionStore";
import {
  reminderHintForChat,
  resolveReminderTurn,
  type ReminderDraft,
} from "./reminderIntelligence";
import type { ReminderIntakeSession } from "./reminderStore";
import {
  classifyRememberIntent,
  createRhythmFromContent,
  extractRhythmTitle,
  isUnsupportedLocationTrigger,
  needsRememberClarification,
  parseCadenceFromText,
  sourceRefFromChat,
  tryResolveRememberManagementCommand,
} from "./rhythms";
import {
  buildAmbiguousRememberQuestion,
  buildConversationTypeConfirm,
  clearPendingRememberCreate,
  isAffirmativeRememberConfirm,
  isNegativeRememberConfirm,
  loadPendingRememberCreate,
  parseRememberClarifyAnswer,
  savePendingRememberCreate,
} from "./remindersVsRhythms";
import {
  buildEstateArrivalContinuation,
  isEstateTransitionOfferMessage,
  loadEstatePendingTransition,
  registerEstatePendingTransition,
} from "./estateMemory/estatePendingTransition";
import {
  formatEstateNavigationChoiceMenu,
  resolveEstateNavigationDisambiguation,
  resolveEstateNavigationDiscovery,
} from "./estateExperiences/resolveEstateNavigation";
import {
  formatDirectNavigationLine,
  formatNavigationDecision,
  resolveEstateNavigationIntent,
  shouldNavigateFromDecision,
} from "./estateNavigationIntelligence";
import {
  resolveEstateRecommendation,
  isResolvedEstateRecommendation,
} from "./estateRecommendationIntelligence";
import {
  deriveMemberStageFromJourney,
  loadMemberJourneyProgress,
  syncJourneyProgressFromDiscoveryHistory,
} from "./estateProgressiveDiscoveryJourney";
import { getDiscoveryMemberId } from "./estateDiscovery/memberId";
import { getDefaultDiscoveryHistoryStore } from "./estateDiscovery/discoveryHistory";
import type { HelpDiscoveryContext } from "./estateHelpDiscoveryIntelligence";
import {
  isResolvedHelpDiscovery,
  resolveHelpDiscoveryQuery,
} from "./estateHelpDiscoveryIntelligence";
import {
  authorizeDirectNavigation,
  authorizeScenicPlaceMenu,
  isConversationStabilizationEnabled,
  runConversationRoutingPipeline,
  shouldBlockEstateSubsystem,
  type ArbitrationResult,
  type EstateSubsystem,
  type StabilizationFastPathResult,
} from "./conversationStabilization";
import {
  executeEstateIntelligence,
  isEstateIntelligenceRuntimeEnabled,
  type EstateIntelligenceRuntimeResult,
} from "./estateIntelligenceRuntime";
import { companionSessionContinueHint } from "./companionIntelligence/activeSession";
import { shouldAllowEstateSuggestions } from "./companionIntelligence/estateGate";
import {
  applyCompanionDecisionGuidance,
  type CompanionDecisionInput,
} from "./companionDecisionIntelligence";
import type { EstateNavigationDisambiguation } from "./estateExperiences/types";
import { ESTATE_NAVIGATION_GOLDEN_RULE } from "./estateExperiences/navigationPhilosophy";
import {
  evaluateImpliedNeed,
  formatImpliedNeedReply,
  resolveImpliedNeedContinuation,
} from "./intentAwareConversation/impliedNeed";
import {
  clearImpliedNeedSession,
  loadImpliedNeedSession,
  saveImpliedNeedSession,
} from "./intentAwareConversation/impliedNeedSession";
import { estateNavigateCommandForPlace } from "./estateIntelligence/estateCommandRouter";
import { matchEstateRoomHowToGuide } from "./estateRoomGuides";
import {
  primaryTurnAllowsFrictionlessCategory,
  type PrimaryTurnDecision,
} from "./conversation/primaryTurnClassifier";
import {
  estateConciergeResponseHint,
  resolveEstateConcierge,
  conversationStateHint,
} from "./estateCapabilityRegistry";
import {
  frictionlessDecisionFromCancelledPendingChoice,
  frictionlessDecisionFromContinuedPendingChoice,
  frictionlessDecisionFromPendingChoice,
  frictionlessDecisionFromUnrecognizedPendingChoice,
} from "@/lib/pendingChoice/frictionlessBridge";
import {
  hasActivePendingChoice,
  registerCognitiveOverloadPendingChoices,
  registerEmotionalRegulationPendingChoices,
  registerPendingChoiceFromAssistantText,
  registerPendingChoiceFromConcierge,
  registerPendingChoiceFromExperienceMenu,
  registerPendingChoiceFromNavigation,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";
import {
  composeThinTechFutureMemberReply,
  techFutureHintForChat,
} from "@/lib/technologyFutureIntelligence";
import { casualUpdateLocalReply } from "@/lib/chatFastPath/relationshipChatLocal";

export type FrictionlessActionCategory =
  | "direct_action"
  | "tool_open"
  | "emotional_regulation"
  | "adhd_emotional_friction"
  | "friction_first"
  | "focus_support"
  | "estate_coaching"
  | "estate_discovery"
  | "estate_guide"
  | "estate_concierge"
  | "pending_choice"
  | "estate_restoration"
  | "implied_need"
  | "universal_creation"
  | "decision_support"
  | "strategy"
  | "google_sheet"
  | "reminder"
  | "none";

export type FrictionlessPendingAction = {
  type:
    | "open_tool"
    | "open_workspace"
    | "create_google_sheet"
    | "strategy_offer"
    | "visual_thinking_menu"
    | "visual_recommendation";
  target: AppSection | "focus-audio" | "breathe" | "focus-timer" | "brain-dump" | "google-workspace";
  label?: string;
  context: string;
  artifactType?: string;
  initialPrompt?: string;
  visualFocusMode?: import("./visualFocus/types").VisualFocusMode;
  viewId?: VisualThinkingViewId;
  viewTitle?: string;
  menuOffer?: import("./visualThinkingStudio").VisualThinkingMenuOffer;
  recommendations?: import("./visualRecommendationEngine").VisualRecommendationItem[];
  sourceText?: string;
  focusAudioCategory?: string;
  sheetType?: GoogleSheetTypeId;
  sheetTitle?: string;
  sheetCsv?: string;
  sheetColumns?: string[];
  strategyId?: string;
  strategyTitle?: string;
  offeredAtTurn: number;
  offerSummary: string;
};

export type FrictionlessActionInput = {
  userText: string;
  lastAssistantText?: string;
  currentTurn?: number;
  emotionalState?: string;
  overwhelmed?: boolean;
  workspace?: AppSection | null;
  timeBlocks?: TimeBlock[];
  reminderDraft?: ReminderDraft | null;
  primaryTurn?: import("@/lib/conversation/primaryTurnClassifier").PrimaryTurnDecision | null;
  isReturning?: boolean;
  trustEstablished?: boolean;
  currentRoom?: string | null;
  activeWorkflow?: string | null;
  activeDocument?: string | null;
  pendingNavigationChoices?: boolean;
  pendingConciergeChoices?: boolean;
  /** Pre-computed Decision Engine runtime — skips re-evaluation when set */
  sparkRuntime?: SparkRuntimeAction | null;
};

export type FrictionlessActionDecision = {
  category: FrictionlessActionCategory;
  suppressRelationship: boolean;
  suppressRecap: boolean;
  suppressReflectionFirst: boolean;
  responseHint: string | null;
  localReply: string | null;
  pendingAction: FrictionlessPendingAction | null;
  toolSuggestion: ToolSuggestion | null;
  workspaceOffer: WorkspaceOffer | null;
  intentRouting: IntentRoutingDecision | null;
  googleSheetIntake?: GoogleSheetIntakeSession;
  reminderIntake?: ReminderIntakeSession | null;
  immediateVisualOpen?: {
    mode: import("./visualFocus/types").VisualFocusMode;
    viewId: VisualThinkingViewId;
    viewTitle: string;
    purposeAnswer?: string;
    ack: string;
  };
  /** Open Cartographer's Studio hub (room) — no map creation. */
  immediateCartographersStudioOpen?: boolean;
  immediateCreateOpen?: ImmediateCreateOpenPayload;
  immediateCreateProjectOpen?: ImmediateCreateProjectOpenPayload;
  immediateMomentumOpen?: ImmediateMomentumOpenPayload;
  immediateResearchOpen?: ImmediateResearchOpenPayload;
  immediateEstateCoachingOpen?: ImmediateEstateCoachingOpenPayload;
  estateNavigationDisambiguation?: EstateNavigationDisambiguation;
  estateCoachingMenu?: EstateCoachingMenu;
  estateDiscoverySession?: DiscoverySession;
  universalCreationSession?: UniversalCreationSession;
  immediateEstateGuideOpen?: {
    spreadId: string;
    spreadTitle: string;
    mode: "flipbook" | "conversational";
  };
  impliedNeedEvaluation?: import("@/lib/intentAwareConversation/impliedNeed").ImpliedNeedEvaluation | null;
  immediateEstatePlaceNavigate?: {
    placeId: string;
    navigationLine: string;
    userText: string;
  };
  /** Open Chamber / Business Estate How to Use guide after navigating if needed. */
  immediateEstateHowToGuideOpen?: import("@/lib/estateRoomGuides").EstateHowToGuideId;
  pendingChoiceExecution?: import("@/lib/pendingChoice/frictionlessBridge").PendingChoiceExecution;
  sparkRuntime?: SparkRuntimeAction | null;
};

const STORAGE_KEY = "companion-frictionless-pending-v1";
const PENDING_TURN_LIMIT = 3;

const FOCUS_SUPPORT_RE =
  /\b(?:need to focus|help me focus|help me concentrate|can'?t concentrate|trouble concentrating|stay focused|hard to focus|lose focus|losing focus|can'?t stay on task|stay on task)\b/i;

const EMOTIONAL_REGULATION_RE =
  /\b(?:can'?t seem to relax|can'?t relax|catch(?:ing)? (?:my )?breath|can'?t catch (?:my )?breath|breathless|panicking|panic attack|having a panic|need to calm down|calm me down|help me calm|feel(?:ing)? anxious|i am anxious|i'?m anxious)\b/i;

const PRODUCTIVITY_FRAMING_RE =
  /\b(?:plan my day|marketing plan|launch|revenue|clients?|business|productivity|get more done|prioritize my day)\b/i;

const AFFIRMATION_RE =
  /^(?:yes(?:\s+please)?|yep|yeah|yup|sure|ok(?:ay)?|please|do that|open it|do it|go ahead|let'?s do (?:it|that)|use it|let'?s use it|sounds good|that works|that would be great|perfect|great|take me there|start|create it)\.?$/i;

export function isFrictionlessAffirmation(text: string): boolean {
  return AFFIRMATION_RE.test(text.trim());
}

export function saveFrictionlessPending(
  action: FrictionlessPendingAction | null,
): void {
  if (typeof window === "undefined") return;
  if (!action) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(action));
}

export function loadFrictionlessPending(): FrictionlessPendingAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FrictionlessPendingAction;
  } catch {
    return null;
  }
}

/** Prefer awaiting confirmation ref over stale localStorage when member says yes/sure. */
export function loadFrictionlessPendingForConfirmation(input: {
  confirmationReply: boolean;
  awaitingPending?: FrictionlessPendingAction | null;
  lastAssistantText?: string;
  currentTurn: number;
}): FrictionlessPendingAction | null {
  const assistant = input.lastAssistantText?.trim() ?? "";

  if (input.confirmationReply && input.awaitingPending) {
    const awaiting = input.awaitingPending;
    if (!isFrictionlessPendingExpired(awaiting, input.currentTurn)) {
      if (
        !assistant ||
        isFrictionlessPendingAlignedWithAssistant(
          awaiting,
          assistant,
          input.currentTurn,
        )
      ) {
        return awaiting;
      }
    }
  }

  const stored = loadFrictionlessPending();
  if (!stored || isFrictionlessPendingExpired(stored, input.currentTurn)) {
    return null;
  }
  if (
    assistant &&
    !isFrictionlessPendingAlignedWithAssistant(
      stored,
      assistant,
      input.currentTurn,
    )
  ) {
    return null;
  }
  return stored;
}

export function clearFrictionlessPending(): void {
  saveFrictionlessPending(null);
}

export function isFrictionlessPendingExpired(
  action: FrictionlessPendingAction,
  currentTurn: number,
): boolean {
  return currentTurn - action.offeredAtTurn > PENDING_TURN_LIMIT;
}

export function frictionlessPendingAck(action: FrictionlessPendingAction): string {
  if (action.target === "focus-audio") {
    return action.context
      ? `Opening **Focus Audio** for ${action.context}.`
      : "Opening **Focus Audio**.";
  }
  if (action.target === "breathe") {
    return "Opening **Breathe** — follow along on screen.";
  }
  if (action.target === "content-generator") {
    const pending = loadEstatePendingTransition();
    if (pending?.originalUserIntent) {
      return buildEstateArrivalContinuation(pending);
    }
    return "Let's head to Create.";
  }
  if (action.target === "decision-compass") {
    return "We're in the Decision Compass now — let's talk this through calmly.";
  }
  if (action.target === "visual-focus") {
    const title = action.viewTitle?.trim();
    if (
      action.viewId === "mind-map" ||
      /mind\s*map/i.test(title ?? "")
    ) {
      return "Opening Mind Map Discovery — what would you like to create a mind map about?";
    }
    return title
      ? `Opening **${title}** in Visual Thinking.`
      : "Opening Visual Thinking.";
  }
  if (
    (action.type === "visual_thinking_menu" ||
      action.type === "visual_recommendation") &&
    action.viewTitle
  ) {
    if (
      action.viewId === "mind-map" ||
      /mind\s*map/i.test(action.viewTitle)
    ) {
      return "Opening Mind Map Discovery — what would you like to create a mind map about?";
    }
    return `Opening **${action.viewTitle}** in Visual Thinking.`;
  }
  if (action.target === "brain-dump") {
    return "Tell me everything that’s on your mind. Nothing has to be organized yet. As you type, I’ll safely capture your thoughts. When you’re finished, I’ll place them into a clear list while preserving your words, and you can quickly adjust anything I separated incorrectly.";
  }
  if (action.target === "plan-my-day") {
    return "Let's shape today together in Momentum Builder.";
  }
  if (action.type === "create_google_sheet") {
    return "Creating your Google Sheet.";
  }
  if (action.type === "strategy_offer") {
    const title = action.strategyTitle?.trim();
    return title ? `Opening **${title}**.` : "Opening that strategy.";
  }
  if (action.target === "playbook") {
    return "Opening Strategies.";
  }
  return "On it.";
}

export function frictionlessPendingFromWorkspaceOffer(
  offer: WorkspaceOffer,
  offeredAtTurn: number,
  opts?: { userText?: string; artifactKind?: RegistryArtifactKind | null },
): FrictionlessPendingAction {
  if (opts?.userText?.trim()) {
    registerEstatePendingTransition({
      destinationSection: offer.section,
      originalUserIntent: opts.userText.trim(),
      offeredAtTurn,
      invitationLine: offer.line,
    });
  }
  if (offer.section === "content-generator" && opts?.userText?.trim()) {
    return buildCreateFrictionlessPending({
      target: offer.section,
      userText: opts.userText,
      offeredAtTurn,
      artifactKind: opts.artifactKind,
      offerSummary: offer.buttonLabel,
    });
  }
  const view =
    opts?.userText?.trim() && offer.visualFocusMode
      ? detectExplicitVisualView(opts.userText) ??
        detectConversionTargetView(opts.userText)
      : null;
  return {
    type: "open_workspace",
    target: offer.section,
    context: offer.line,
    offeredAtTurn,
    offerSummary: offer.buttonLabel,
    initialPrompt: opts?.userText?.trim(),
    visualFocusMode: offer.visualFocusMode,
    viewId: view?.id,
    viewTitle: view?.title,
  };
}

export function frictionlessPendingFromToolOffer(
  suggestion: ToolSuggestion,
  offeredAtTurn: number,
): FrictionlessPendingAction {
  const tool =
    suggestion.action.type === "tool" ? suggestion.action.tool : "focus-audio";
  const target = (
    tool === "focus-audio" ||
    tool === "breathe" ||
    tool === "focus-timer" ||
    tool === "brain-dump"
      ? tool
      : "focus-audio"
  ) satisfies FrictionlessPendingAction["target"];
  return {
    type: "open_tool",
    target,
    context: suggestion.line,
    focusAudioCategory: tool === "focus-audio" ? "calm-brain" : undefined,
    offeredAtTurn,
    offerSummary: suggestion.toolLabel,
  };
}

export function frictionlessToToolSuggestion(
  action: FrictionlessPendingAction,
): ToolSuggestion {
  const tool =
    action.target === "focus-audio"
      ? "focus-audio"
      : action.target === "breathe"
        ? "breathe"
        : action.target === "focus-timer"
          ? "focus-timer"
          : action.target === "brain-dump"
            ? "brain-dump"
            : "focus-audio";
  return {
    kind: tool === "focus-audio" ? "focus-session" : "breathe",
    line: action.context,
    toolLabel:
      tool === "focus-audio"
        ? "Open Focus Audio"
        : tool === "breathe"
          ? "Breathe"
          : "Open tool",
    toolObjectId: tool === "focus-audio" ? "focus-audio" : "breathing",
    keepTalkingLabel: "Keep Talking",
    action: { type: "tool", tool },
  };
}

function tryGuardedEnvironmentalAudioFlow(
  userText: string,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const trimmed = userText.trim();
  if (!trimmed) return null;

  if (shouldBlockAutoPlayForAudioQuery(trimmed)) {
    return null;
  }

  const playRequest = resolveGuardedEnvironmentalAudioRequest(trimmed);
  if (playRequest) {
    void executeGuardedEnvironmentalAudioPlay(playRequest, { userInitiated: true });
    const label =
      playRequest.trackId === "greenhouse-birds"
        ? "bird sounds"
        : "coffee chatter";
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "ENVIRONMENTAL AUDIO (play): Member asked to play audio. Playback started — no navigation.",
      localReply: `Starting ${label} for you.`,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  if (/\b(?:stop|turn off|silence)\b/i.test(trimmed) && /\b(?:audio|music|sound|birds?|chatter)\b/i.test(trimmed)) {
    void stopGuardedEnvironmentalAudio();
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: "ENVIRONMENTAL AUDIO (stop): Silence room audio.",
      localReply: "Got it — the room is quiet now.",
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  return null;
}

function buildAudioPending(
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision | null {
  const audio = detectAudioRequest(userText);
  if (!audio.isAudio) return null;

  const context = /\bcalm/i.test(userText)
    ? "calming music"
    : /\bmotivat/i.test(userText)
      ? "motivation"
      : /\bfocus/i.test(userText)
        ? "focus"
        : "background audio";

  const localReply = `I can open Focus Audio for ${context}. Want me to open it?`;

  return {
    category: "tool_open",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "FOCUS AUDIO REQUEST: Offer to open Focus Audio directly. Do NOT lead with relationship observations.",
    localReply,
    pendingAction: {
      type: "open_tool",
      target: "focus-audio",
      context,
      focusAudioCategory: audio.categoryId,
      offeredAtTurn: currentTurn,
      offerSummary: `Focus Audio — ${context}`,
    },
    toolSuggestion: {
      kind: "focus-session",
      line: localReply,
      toolLabel: "Open Focus Audio",
      toolObjectId: "focus-audio",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "focus-audio" },
    },
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildAdhdEmotionalFrictionDecision(
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "adhd_emotional_friction",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: adhdEmotionalFrictionHintForChat(userText),
    localReply: buildAdhdEmotionalFrictionReply(userText),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildFrictionFirstDecision(
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  const evaluation = evaluateFrictionFirst(userText);
  const session = createFrictionFirstSession({
    userText,
    domain: evaluation.domain,
    focusSituation: evaluation.focusSituation,
    offeredAtTurn: currentTurn,
  });
  saveFrictionFirstSession(session);

  return {
    category: "friction_first",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: frictionFirstHintForChat({ userText, session }),
    localReply: buildFrictionFirstOpeningReply({
      userText,
      domain: session.domain,
      focusSituation: session.focusSituation,
    }),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function resolveSparkRuntime(input: FrictionlessActionInput): SparkRuntimeAction {
  if (input.sparkRuntime) return input.sparkRuntime;
  const userText = input.userText.trim();
  const decision = evaluateSparkDecisionEngine({
    userText,
    overwhelmed: input.overwhelmed,
    placeId: input.workspace ?? input.currentRoom ?? null,
    trustEstablished: input.trustEstablished,
  });
  return mapDecisionToRuntimeAction({
    userText,
    overwhelmed: input.overwhelmed,
    placeId: input.workspace ?? input.currentRoom ?? null,
    currentRoom: input.currentRoom ?? input.workspace ?? null,
    isReturning: input.isReturning,
    trustEstablished: input.trustEstablished,
    activeWorkflow: input.activeWorkflow,
    activeDocument: input.activeDocument,
    pendingNavigationChoices: input.pendingNavigationChoices,
    pendingConciergeChoices: input.pendingConciergeChoices,
    decision,
  });
}

function attachSparkRuntime(
  decision: FrictionlessActionDecision,
  runtime: SparkRuntimeAction,
): FrictionlessActionDecision {
  const runtimeHint = runtime.operationalHint;
  return {
    ...decision,
    sparkRuntime: runtime,
    responseHint: decision.responseHint
      ? `${decision.responseHint}\n${runtimeHint}`
      : runtimeHint,
  };
}

function tryEmotionalCanonFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
  runtime: SparkRuntimeAction,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;
  if (runtime.suppressEmotionalCoaching) return null;
  if (isCreateFlowAssistantContext(input.lastAssistantText)) return null;

  const localReply = buildCanonicalEmotionalLocalReply(userText);
  const decision = evaluateEmotionalFirstActionSecond({ userText });
  if (!localReply || decision.depth !== "emotional_first") return null;

  return attachSparkRuntime(
    {
      category: "emotional_regulation",
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: false,
      responseHint: emotionalFirstActionSecondHintForChat({ userText }),
      localReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    },
    runtime,
  );
}

function tryFrictionFirstFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
  runtime: SparkRuntimeAction,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;
  if (runtime.suppressEmotionalCoaching && !runtime.allowFrictionFirst) return null;

  if (isAttentionWanderSignal(userText)) {
    clearFrictionFirstSession();
    return attachSparkRuntime(
      {
        category: "friction_first",
        suppressRelationship: false,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "FRICTION FIRST — attention wandered. Continue gently, no guilt.",
        localReply: buildAttentionWanderReply(),
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
      },
      runtime,
    );
  }

  const session = loadFrictionFirstSession();
  if (
    session &&
    !isFrictionFirstSessionExpired(session, currentTurn) &&
    (isFrictionFirstMenuOffer(input.lastAssistantText ?? "") ||
      input.lastAssistantText?.includes("feels closest"))
  ) {
    const resolved = resolveFrictionBarrierChoice({ userText, session });
    if (resolved.kind !== "unrecognized" && resolved.reply) {
      clearFrictionFirstSession();
      return {
        category: "friction_first",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: frictionFirstHintForChat({ userText, session }),
        localReply: resolved.reply,
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
      };
    }
  }

  if (session && isFrictionFirstSessionExpired(session, currentTurn)) {
    clearFrictionFirstSession();
  }

  if (!isFrictionFirstTurn(userText)) return null;

  if (runtime.suppressEmotionalCoaching) return null;

  return buildFrictionFirstDecision(userText, currentTurn);
}

function buildReminderDecision(
  userText: string,
  currentTurn: number,
  input: FrictionlessActionInput,
): FrictionlessActionDecision | null {
  // Deterministic management commands — never wait on AI.
  const management = tryResolveRememberManagementCommand(userText);
  if (management) {
    return {
      category: "reminder",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: reminderHintForChat(),
      localReply: management.reply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
      reminderIntake: null,
    };
  }

  // CONV-040: prefer rhythm when the member describes an ongoing pattern.
  const intent = classifyRememberIntent(userText);

  if (isUnsupportedLocationTrigger(userText)) {
    return {
      category: "reminder",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: reminderHintForChat(),
      localReply:
        "I can't watch for when you get home yet — but I can set a reminder for a time, or make it a repeating rhythm. Which would help more?",
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
      reminderIntake: null,
    };
  }

  // Pending confirm from a prior turn — create only after yes.
  const pendingRemember = loadPendingRememberCreate();
  if (pendingRemember && !input.reminderDraft) {
    if (isNegativeRememberConfirm(userText)) {
      clearPendingRememberCreate();
      return {
        category: "reminder",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: reminderHintForChat(),
        localReply:
          "Okay — I won’t create that. Want a Reminder for a specific moment, or a Rhythm to return to regularly?",
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: null,
        reminderIntake: null,
      };
    }
    if (isAffirmativeRememberConfirm(userText)) {
      if (pendingRemember.kind === "rhythm") {
        const result = createRhythmFromContent({
          title: pendingRemember.title,
          details: pendingRemember.sourceText,
          cadence: (pendingRemember.cadence as
            | "daily"
            | "weekly"
            | "monthly"
            | "quarterly"
            | "yearly"
            | "custom"
            | undefined) ?? undefined,
          inferCadenceFromText: pendingRemember.sourceText,
          source: "conversation",
          category: "personal",
          sourceRef: sourceRefFromChat(
            `turn-${currentTurn}-${pendingRemember.title.slice(0, 24)}`,
            pendingRemember.title,
          ),
        });
        clearPendingRememberCreate();
        if (!result.ok && result.reason === "missing_cadence") {
          return {
            category: "reminder",
            suppressRelationship: true,
            suppressRecap: true,
            suppressReflectionFirst: true,
            responseHint: reminderHintForChat(),
            localReply:
              result.ask ??
              "Would you like this daily, weekly, or on another rhythm?",
            pendingAction: null,
            toolSuggestion: null,
            workspaceOffer: null,
            intentRouting: null,
            reminderIntake: null,
          };
        }
        if (result.ok) {
          const reply = result.duplicate
            ? `You already have an active rhythm for “${result.rhythm.title}.” I left it as-is — say pause, skip, or reschedule if you'd like a change.`
            : `Done — I’ve set up a ${result.rhythm.cadence} Rhythm for “${result.rhythm.title}.” You can pause, skip, or resume anytime — no streaks.`;
          return {
            category: "reminder",
            suppressRelationship: true,
            suppressRecap: true,
            suppressReflectionFirst: true,
            responseHint: reminderHintForChat(),
            localReply: reply,
            pendingAction: null,
            toolSuggestion: null,
            workspaceOffer: null,
            intentRouting: null,
            reminderIntake: null,
          };
        }
      }
      clearPendingRememberCreate();
    } else {
      const clarified = parseRememberClarifyAnswer(userText);
      if (clarified === "rhythm" || clarified === "reminder") {
        savePendingRememberCreate({
          ...pendingRemember,
          kind: clarified,
        });
        return {
          category: "reminder",
          suppressRelationship: true,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint: reminderHintForChat(),
          localReply: buildConversationTypeConfirm({
            kind: clarified,
            title: pendingRemember.title,
          }),
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: null,
          reminderIntake: null,
        };
      }
    }
  }

  if (needsRememberClarification(userText) && !input.reminderDraft) {
    const title = extractRhythmTitle(userText) || "that";
    savePendingRememberCreate({
      kind: "reminder",
      title,
      sourceText: userText,
      createdAt: new Date().toISOString(),
    });
    return {
      category: "reminder",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: reminderHintForChat(),
      localReply: buildAmbiguousRememberQuestion(),
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
      reminderIntake: null,
    };
  }

  if (intent === "rhythm" && !input.reminderDraft) {
    const title = extractRhythmTitle(userText) || "Something to return to";
    const cadence = parseCadenceFromText(userText);
    if (!cadence) {
      return {
        category: "reminder",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: reminderHintForChat(),
        localReply: `That sounds like a Rhythm for “${title}.” Would you like it daily, weekly, or on another gentle cadence?`,
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: null,
        reminderIntake: null,
      };
    }
    // Confirm before create — never silent wrong type.
    savePendingRememberCreate({
      kind: "rhythm",
      title,
      sourceText: userText,
      cadence,
      createdAt: new Date().toISOString(),
    });
    return {
      category: "reminder",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: reminderHintForChat(),
      localReply: buildConversationTypeConfirm({
        kind: "rhythm",
        title,
        detail: `It would be ${cadence}, with a flexible window — you can skip or pause anytime.`,
      }),
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
      reminderIntake: null,
    };
  }

  const outcome = resolveReminderTurn({
    userText,
    draft: input.reminderDraft ?? null,
    timeBlocks: input.timeBlocks ?? [],
  });
  if (outcome.kind === "not_reminder") return null;

  const base: FrictionlessActionDecision = {
    category: "reminder",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: reminderHintForChat(),
    localReply: outcome.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
    reminderIntake: null,
  };

  if (outcome.kind === "ask") {
    return {
      ...base,
      reminderIntake: {
        phase: "collecting",
        draft: outcome.draft,
        startedAtTurn: currentTurn,
      },
    };
  }

  return base;
}

function tryImpliedNeedFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
  stabilization?: ArbitrationResult | null,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;
  if (
    isSubstantiveConversationHelpRequest(userText) ||
    isEmailAutomationOrInboxHelpRequest(userText)
  ) {
    return null;
  }

  if (
    stabilization &&
    (shouldBlockEstateSubsystem(stabilization, "implied_need") ||
      !shouldAllowEstateSuggestions(stabilization))
  ) {
    return null;
  }
  const session = loadImpliedNeedSession();
  if (session) {
    const continuation = resolveImpliedNeedContinuation(userText, session);
    if (continuation) {
      clearImpliedNeedSession();
      if (continuation.kind === "unrecognized") {
        return {
          category: "implied_need",
          suppressRelationship: false,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint:
            "IMPLIED_NEED: Member answered vaguely — ask which choice (1, 2, or 3). No auto-navigation.",
          localReply: continuation.reply,
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: routing,
          impliedNeedEvaluation: null,
        };
      }
      if (continuation.kind === "estate_place") {
        const place = continuation.placeId;
        const navLine = `${continuation.reply} I'll take you there.`;
        const command = estateNavigateCommandForPlace(place, userText);
        if (!command) {
          return {
            category: "implied_need",
            suppressRelationship: false,
            suppressRecap: true,
            suppressReflectionFirst: true,
            responseHint: "IMPLIED_NEED: Estate place chosen — navigate warmly.",
            localReply: navLine,
            pendingAction: null,
            toolSuggestion: null,
            workspaceOffer: null,
            intentRouting: routing,
            impliedNeedEvaluation: null,
          };
        }
        return {
          category: "implied_need",
          suppressRelationship: false,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint: "IMPLIED_NEED: Member chose Estate place — navigate only after choice.",
          localReply: navLine,
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: routing,
          impliedNeedEvaluation: null,
          immediateEstatePlaceNavigate: {
            placeId: place,
            navigationLine: navLine,
            userText,
          },
        };
      }
      return {
        category: "implied_need",
        suppressRelationship: false,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "IMPLIED_NEED: Member chose presence or real-world break — stay in conversation.",
        localReply: continuation.reply,
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
        impliedNeedEvaluation: null,
      };
    }
  }

  const evaluation = evaluateImpliedNeed(userText);
  if (!evaluation) return null;

  saveImpliedNeedSession({
    matchKey: evaluation.matchKey,
    primaryPlaceId: evaluation.primaryPlaceId,
    choices: evaluation.choices,
    offeredAtTurn: currentTurn,
  });

  return {
    category: "implied_need",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: evaluation.responseHint,
    localReply: formatImpliedNeedReply(evaluation),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    impliedNeedEvaluation: evaluation,
  };
}

function finalizeFrictionlessDecision(
  decision: FrictionlessActionDecision,
  primaryTurn?: PrimaryTurnDecision | null,
): FrictionlessActionDecision {
  if (!primaryTurn?.blockSecondaryResponders) return decision;
  if (primaryTurnAllowsFrictionlessCategory(primaryTurn, decision.category)) {
    return decision;
  }
  return {
    category: "none",
    suppressRelationship: decision.suppressRelationship,
    suppressRecap: decision.suppressRecap,
    suppressReflectionFirst: decision.suppressReflectionFirst,
    responseHint: `PRIMARY_OWNERSHIP:${primaryTurn.type}`,
    localReply: null,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: decision.intentRouting,
  };
}

function resolveFrictionlessForPrimaryTurn(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const primary = input.primaryTurn;
  if (!primary) return null;

  switch (primary.type) {
    case "DIRECT_COMMAND":
      return null;
    case "RELATIONSHIP_CHAT":
    case "INFORMATION_OR_RESEARCH": {
      const guide = tryEstateGuideFlow(input, routing);
      if (guide) return guide;
      return null;
    }
    case "IMPLIED_NEED":
      return tryImpliedNeedFlow(input, routing);
    case "TASK_REQUEST": {
      const beginner = tryVisualBeginnerChoiceFlow(input, routing);
      if (beginner) return beginner;
      const visual = tryVisualStructureEarlyFlow(input, routing);
      if (visual) return visual;
      if (isSimpleCreateRequest(input.userText.trim())) {
        logCreateFastPath({
          turn: input.currentTurn,
          userText: input.userText.trim(),
          documentType: detectUniversalDocumentType(input.userText.trim()),
        });
        const universal = tryUniversalCreationFlow(input, routing);
        if (universal?.localReply) return universal;
        if (isSimpleCreateRequest(input.userText.trim())) {
          return buildCreateFastPathRecoveryDecision(input, routing);
        }
      }
      const universal = tryUniversalCreationFlow(input, routing);
      if (universal) return universal;
      const discovery = tryDiscoveryFlow(input, routing);
      if (discovery) return discovery;
      const coaching = tryEstateCoachingFlow(input, routing);
      if (coaching) return coaching;
      return null;
    }
    case "EMOTIONAL_SUPPORT": {
      const restoration = tryEstateRestorationFlow(input, routing);
      if (restoration) return restoration;
      if (EMOTIONAL_REGULATION_RE.test(input.userText.trim())) {
        return buildEmotionalRegulationDecision(
          input.userText,
          input.currentTurn ?? 0,
        );
      }
      if (isFrictionFirstTurn(input.userText)) {
        return buildFrictionFirstDecision(
          input.userText,
          input.currentTurn ?? 0,
        );
      }
      if (isAdhdEmotionalFrictionTurn(input.userText)) {
        return buildAdhdEmotionalFrictionDecision(
          input.userText,
          input.currentTurn ?? 0,
        );
      }
      return null;
    }
    default: {
      const _exhaustive: never = primary.type;
      return _exhaustive;
    }
  }
}

function tryEstateRestorationFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;

  if (
    input.lastAssistantText &&
    isRestorationOfferMessage(input.lastAssistantText)
  ) {
    if (isRestorationDecline(userText)) {
      recordRestorationDeclined(currentTurn);
      return {
        category: "estate_restoration",
        suppressRelationship: false,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "RESTORATION DECLINED: Respect the choice — no guilt. Continue the work gently.",
        localReply: "We'll stay right here. What would help most?",
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
      };
    }

    if (isRestorationAcceptance(userText) || isRestorationReturnReady(userText)) {
      const pending = loadRestorationStore().pendingReturn;
      if (isRestorationReturnReady(userText) && pending) {
        const returned = resolveRestorationReturn(pending.taskLabel);
        return {
          category: "estate_restoration",
          suppressRelationship: false,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint: returned.responseHint,
          localReply: `${returned.welcomeBack}\n\n${returned.reconnectQuestion}`,
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: routing,
        };
      }

      const store = loadRestorationStore();
      const spreadId =
        store.lastOfferedSpreadId ??
        store.pendingReturn?.spreadId ??
        "butterfly-conservatory";
      const storyTitle = buildStoryPick(spreadId, "acceptance")?.title ?? "the Estate Guide";
      acceptRestorationStory(
        spreadId,
        store.pendingReturn?.taskLabel ?? null,
        currentTurn,
      );

      if (/\b(?:open|read more|guide|pages)\b/i.test(userText)) {
        return {
          category: "estate_restoration",
          suppressRelationship: false,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint:
            "RESTORATION: Open Estate Guide at matched spread — peaceful, never leaving work behind.",
          localReply: `I'll open the Estate Guide to ${storyTitle}. Take your time — I'll be here when you're ready.`,
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: routing,
          immediateEstateGuideOpen: {
            spreadId,
            spreadTitle: storyTitle,
            mode: "flipbook",
          },
        };
      }

      const offer = buildStoryPick(spreadId, "acceptance")
        ? buildRestorationOffer({
            shouldOffer: true,
            trigger: "natural_pause",
            confidence: "medium",
            story: buildStoryPick(spreadId, "acceptance")!,
            deliveryMode: "tell_inline",
            returnContextLabel: store.pendingReturn?.taskLabel ?? null,
          })
        : null;
      return {
        category: "estate_restoration",
        suppressRelationship: false,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          offer?.responseHint ??
          "RESTORATION: Tell story conversationally — member may stay in chat.",
        localReply: offer
          ? formatInlineStoryReply(offer)
          : "Let me share something from the Estate with you.",
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
      };
    }
  }

  const energyEval = evaluateSparkRestoration({
    userText,
    currentTurn,
    emotionalState: input.emotionalState,
    overwhelmed: input.overwhelmed,
    workspace: input.workspace,
    lastAssistantText: input.lastAssistantText,
  });

  if (energyEval) {
    const spreadId =
      energyEval.guideSpreadId ??
      energyEval.primary.spreadId ??
      energyEval.recommendations.find((r) => r.spreadId)?.spreadId ??
      "butterfly-conservatory";
    recordRestorationOffer(currentTurn, spreadId);
    if (energyEval.returnContextLabel) {
      setPendingReturn(
        energyEval.returnContextLabel,
        spreadId,
        currentTurn,
      );
    }

    const offer = buildEnergyRestorationOffer(energyEval);
    const tellInline =
      Boolean(energyEval.guideStorySnippet) &&
      (energyEval.trigger === "natural_pause" ||
        energyEval.trigger === "extended_work");
    const localReply = tellInline
      ? formatInlineEnergyStory(energyEval) ?? formatEnergyRestorationReply(offer)
      : formatEnergyRestorationReply(offer);

    return {
      category: "estate_restoration",
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: offer.responseHint,
      localReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  const evaluation = evaluateRestorationOpportunity({
    userText,
    currentTurn,
    emotionalState: input.emotionalState,
    overwhelmed: input.overwhelmed,
    workspace: input.workspace,
    lastAssistantText: input.lastAssistantText,
  });
  if (!evaluation) return null;

  recordRestorationOffer(currentTurn, evaluation.story.spreadId);
  const offer = buildRestorationOffer(evaluation);
  const localReply =
    evaluation.deliveryMode === "tell_inline"
      ? formatInlineStoryReply(offer)
      : formatRestorationOfferReply(offer);

  return {
    category: "estate_restoration",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: offer.responseHint,
    localReply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function tryPendingChoiceFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  if (!hasActivePendingChoice()) return null;

  const result = resolvePendingChoiceTurn(input.userText.trim(), {
    lastAssistantText: input.lastAssistantText,
    currentTurn: input.currentTurn,
  });
  if (result.kind === "resolved") {
    return frictionlessDecisionFromPendingChoice(
      input.userText.trim(),
      result,
      routing,
    );
  }
  if (result.kind === "unrecognized") {
    return frictionlessDecisionFromUnrecognizedPendingChoice(
      input.userText.trim(),
      result,
      routing,
    );
  }
  if (result.kind === "cancelled") {
    return frictionlessDecisionFromCancelledPendingChoice(result, routing);
  }
  if (result.kind === "continued" || result.kind === "expanded") {
    return frictionlessDecisionFromContinuedPendingChoice(result, routing);
  }
  return null;
}

const MUSIC_CREATION_RE =
  /\b(?:write|compose|create).{0,40}(?:piece of music|a song|song|lyrics|melody|chords?)\b|\b(?:piece of music|song lyrics|chord ideas)\b/i;

function tryMusicCreationGuidance(
  userText: string,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const trimmed = userText.trim();
  if (!trimmed || !MUSIC_CREATION_RE.test(trimmed)) return null;
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "CREATE (music): Offer lyrics, structure, chord ideas, or music-tool prompt — no playable audio promise.",
    localReply:
      "I can't compose playable music directly, but I can help you write lyrics, structure a song, sketch chord ideas, or prepare a prompt for a music tool. Which would help most?",
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function tryEstateConciergeFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;
  if (
    shouldSuppressEnvironmentNeedDuringDistress(
      userText,
      input.lastAssistantText,
    )
  ) {
    return null;
  }
  if (isEstateGuideQuestion(userText, input.lastAssistantText)) return null;
  if (shouldEnterUniversalCreation(userText)) return null;
  if (shouldEnterDiscoveryMode(userText)) return null;
  if (isRegistryArtifactExecution(userText)) return null;
  if (isProjectCreationIntent(userText)) return null;
  if (routing.learnFastPath) return null;
  if (loadDiscoverySession()) return null;
  if (isMomentumForwardIntent(userText)) return null;
  if (shouldCoachBeforeNavigate(userText)) return null;
  if (detectAudioRequest(userText)) return null;
  if (EMOTIONAL_REGULATION_RE.test(userText)) return null;
  if (
    /\b(?:don't know where to start|not sure what to do|where to start|figure it out)\b/i.test(
      userText,
    )
  ) {
    return null;
  }

  const decision = resolveEstateConcierge({
    userText,
    isDirectCommand: input.primaryTurn?.type === "DIRECT_COMMAND",
  });
  if (!decision || decision.kind !== "recommend") return null;

  const localReply = decision.line.replace(/\*\*/g, "");
  registerPendingChoiceFromConcierge({
    goalSummary: decision.goalSummary,
    options: decision.options,
    menuText: localReply,
    offeredAtTurn: input.currentTurn,
    activeIntent: decision.goalSummary,
  });

  return {
    category: "estate_concierge",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: estateConciergeResponseHint(decision),
    localReply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function tryEstateGuideFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (
    !userText ||
    !isEstateGuideQuestion(userText, input.lastAssistantText)
  ) {
    return null;
  }
  // Phase A: turn decision / scenic gate — do not invent place menus when denied.
  if (
    !authorizeScenicPlaceMenu(userText) &&
    !/\bwhere (?:is|are)\b/i.test(userText)
  ) {
    return null;
  }
  if (isSubstantiveConversationHelpRequest(userText)) {
    return null;
  }
  if (
    routing.learnFastPath &&
    !isEstateOrientationQuestion(userText) &&
    !isEstateRoomStoryQuestion(userText)
  ) {
    return null;
  }
  if (isRegistryArtifactExecution(userText)) return null;
  if (isProjectCreationIntent(userText)) return null;
  if (shouldEnterDiscoveryMode(userText)) return null;

  const turn = resolveEstateGuideTurn(userText);
  const knowledgeHint = shariKnowledgeHintForChat({ userText });

  return {
    category: "estate_guide",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: [estateGuideHint(), turn.responseHint, knowledgeHint]
      .filter(Boolean)
      .join("\n\n"),
    localReply: formatEstateGuideReply(turn),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function buildCreateFastPathRecoveryDecision(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  return {
    category: "universal_creation",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: "CREATE_FAST_PATH_RECOVERY",
    localReply: createFastPathRecoveryLine(input.userText.trim()),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function tryUniversalCreationFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;
  if (routing.learnFastPath) return null;
  if (isProjectCreationIntent(userText)) return null;
  if (isMomentumForwardIntent(userText)) return null;
  if (shouldCoachBeforeNavigate(userText)) return null;
  if (
    resolveEstateNavigationDisambiguation(userText) ||
    resolveEstateNavigationDiscovery(userText)
  ) {
    return null;
  }

  let turn;
  try {
    turn = resolveUniversalCreationTurn(
      userText,
      input.currentTurn ?? 0,
      input.lastAssistantText,
    );
  } catch {
    if (isSimpleCreateRequest(userText)) {
      return buildCreateFastPathRecoveryDecision(input, routing);
    }
    return null;
  }
  if (!turn) return null;

  if (turn.kind === "question") {
    saveUniversalCreationSession(turn.session);
    return {
      category: "universal_creation",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: universalCreationHint(turn.session, turn),
      localReply: formatUniversalCreationQuestion(turn),
      pendingAction: universalCreationPendingAction(
        turn.session,
        input.currentTurn ?? 0,
        routing.artifactKind,
      ),
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      universalCreationSession: turn.session,
    };
  }

  if (turn.kind === "uncertainty") {
    saveUniversalCreationSession(turn.session);
    return {
      category: "universal_creation",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: universalCreationHint(turn.session, turn),
      localReply: turn.message,
      pendingAction: universalCreationPendingAction(
        turn.session,
        input.currentTurn ?? 0,
        routing.artifactKind,
      ),
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      universalCreationSession: turn.session,
    };
  }

  if (turn.kind === "draft" || turn.kind === "ready") {
    saveUniversalCreationSession(turn.session);
    return {
      category: "universal_creation",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: universalCreationHint(turn.session, turn),
      localReply: formatUniversalCreationTurnReply(turn),
      pendingAction: universalCreationPendingAction(
        turn.session,
        input.currentTurn ?? 0,
        routing.artifactKind,
      ),
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      universalCreationSession: turn.session,
    };
  }

  if (turn.kind === "message") {
    saveUniversalCreationSession(turn.session);
    return {
      category: "universal_creation",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: universalCreationHint(turn.session, turn),
      localReply: turn.message,
      pendingAction: universalCreationPendingAction(
        turn.session,
        input.currentTurn ?? 0,
        routing.artifactKind,
      ),
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      universalCreationSession: turn.session,
    };
  }

  syncUniversalCreationHandoffToSession(turn.session);
  saveUniversalCreationSession(turn.session);
  const combined = `${turn.session.originalUserText} ${Object.values(turn.session.answers).join(" ")}`;
  const createOpen = resolveImmediateCreateAction(
    combined,
    routing.artifactKind,
    { universalCreationSession: turn.session },
  );
  if (!createOpen) return null;

  return {
    category: "universal_creation",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: universalCreationHint(turn.session, turn),
    localReply: turn.message,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    immediateCreateOpen: createOpen,
    universalCreationSession: turn.session,
  };
}

function tryDiscoveryFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;

  const turn = resolveDiscoveryTurn(
    userText,
    input.currentTurn ?? 0,
    input.lastAssistantText,
  );
  if (!turn) return null;

  if (turn.kind === "question") {
    saveDiscoverySession(turn.session);
    return {
      category: "estate_discovery",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: discoveryHint(turn.session, turn),
      localReply: formatDiscoveryQuestion(turn),
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      estateDiscoverySession: turn.session,
    };
  }

  clearDiscoverySession();

  const base: FrictionlessActionDecision = {
    category: "estate_discovery",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: discoveryHint(turn.session, turn),
    localReply: turn.message,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    estateDiscoverySession: turn.session,
  };

  switch (turn.action.kind) {
    case "coaching_menu":
      cacheCoachingMenu(turn.action.menu);
      return { ...base, estateCoachingMenu: turn.action.menu };
    case "create_open":
      return { ...base, immediateCreateOpen: turn.action.payload };
    case "research_open":
      return { ...base, immediateResearchOpen: turn.action.payload };
    case "navigate":
      return { ...base, immediateEstateCoachingOpen: turn.action.payload };
    default:
      return base;
  }
}

function buildEstateCoachingDecision(
  menu: EstateCoachingMenu,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  cacheCoachingMenu(menu);
  return {
    category: "estate_coaching",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: estateCoachingHint(menu),
    localReply: formatEstateCoachingMenu(menu),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    estateCoachingMenu: menu,
  };
}

function tryEstateCoachingFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;

  const continuation = resolveEstateCoachingContinuation(
    userText,
    input.lastAssistantText,
  );
  if (continuation) {
    return {
      category: "estate_coaching",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "ESTATE COACHING: Member chose a prescription — navigate quietly after warm ack.",
      localReply: continuation.followUpLine,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      immediateEstateCoachingOpen: continuation,
    };
  }

  const isMenuFollowUp =
    Boolean(input.lastAssistantText) &&
    isEstateCoachingMenuMessage(input.lastAssistantText ?? "");

  if (isMenuFollowUp) {
    const menu =
      loadCachedCoachingMenu() ??
      resolveEstateCoachingMenu(input.lastAssistantText ?? "");
    if (!menu) return null;

    const directChoice = parseEstateCoachingChoice(userText, menu);
    if (directChoice && directChoice.id !== "something-else") {
      const payload = buildCoachingOpenPayload(
        userText,
        menu.situation,
        directChoice,
        menu.goal,
      );
      if (payload) {
        return {
          category: "estate_coaching",
          suppressRelationship: true,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint: estateCoachingHint(menu),
          localReply: payload.followUpLine,
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: routing,
          immediateEstateCoachingOpen: payload,
        };
      }
    }

    if (directChoice?.stayInConversation) {
      return {
        category: "estate_coaching",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: estateCoachingHint(menu),
        localReply:
          directChoice.id === "something-else"
            ? "Tell me more — what would actually help right now?"
            : "I'm right here with you. What are you trying to focus on?",
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
      };
    }

    return null;
  }

  const menu = resolveEstateCoachingMenu(userText);
  if (!menu || !shouldCoachBeforeNavigate(userText)) return null;

  return buildEstateCoachingDecision(menu, routing);
}

function buildFocusSupportDecision(
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "focus_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "FOCUS SUPPORT (P0.9): Help pick ONE focus thread. Offer Focus Mode or Focus Audio if helpful. No relationship observations. No recap.",
    localReply:
      "Let's choose one focus thread. What needs your attention most right now?",
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildDifficultClientCallDecision(
  _userText: string,
  _currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  return {
    category: "emotional_regulation",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: false,
    responseHint:
      "SHARI COMPANION ENGINE — difficult client call. Emotional grounding FIRST — boundary conversation weight, not phone-task tactics or outlines.",
    localReply: buildDifficultClientCallOpeningReply(),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function buildEmotionalRegulationDecision(
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  const plan = planEmotionalFirstResponse({ text: userText });
  const opening =
    formatEmotionalFirstOpening(plan) ??
    "A lot is landing at once — we can slow this down together.";
  const localReply = `${opening}\n\nWould you like:\n1. Calming audio\n2. A breathing reset\n3. Stay here with me`;
  registerEmotionalRegulationPendingChoices({
    menuText: localReply,
    offeredAtTurn: currentTurn,
  });
  return {
    category: "emotional_regulation",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: false,
    responseHint:
      "SHARI COMPANION ENGINE — emotion before instruction. Reflect + normalize before tools. Offer Breathe only with consent — never auto-open.",
    localReply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildGoogleSheetsIntakeDecision(
  sheetType: GoogleSheetTypeId,
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  const started = startGoogleSheetIntake(sheetType, userText);
  if (started.outcome !== "ask") {
    return {
      category: "google_sheet",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "GOOGLE SHEETS INTELLIGENCE (P0.18): One intake question at a time. Offer Google Sheet when ready — not Create.",
      localReply: "What's the first detail to capture?",
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
      googleSheetIntake: undefined,
    };
  }
  return {
    category: "google_sheet",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "GOOGLE SHEETS INTELLIGENCE (P0.18): One intake question at a time. Offer Google Sheet when ready — not Create.",
    localReply: started.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
    googleSheetIntake: started.session,
  };
}

function buildDecisionSupportDecision(
  routing: IntentRoutingDecision,
  currentTurn: number,
  userText?: string,
): FrictionlessActionDecision {
  const workspaceOffer = routing.workspaceOffer ?? {
    section: "decision-compass" as const,
    buttonLabel: "Open Decision Compass",
    line: "Want to open Decision Compass together?",
  };
  return {
    category: "decision_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "DECISION SUPPORT (P0.9): Offer Decision Compass or one clarifying question. No relationship lead paragraph.",
    localReply: workspaceOffer.line,
    pendingAction: {
      type: "open_tool",
      target: "decision-compass",
      context: "decision support",
      initialPrompt: userText?.trim(),
      offeredAtTurn: currentTurn,
      offerSummary: "Decision Compass",
    },
    toolSuggestion: null,
    workspaceOffer,
    intentRouting: routing,
  };
}

function universalCreationPendingAction(
  session: UniversalCreationSession,
  currentTurn: number,
  artifactKind?: RegistryArtifactKind | null,
): FrictionlessPendingAction {
  return buildCreateFrictionlessPending({
    target: "content-generator",
    userText: session.originalUserText,
    offeredAtTurn: currentTurn,
    artifactKind,
    offerSummary: "Create",
  });
}

function maybeClearStaleFrictionlessPending(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): void {
  const userText = input.userText.trim();
  if (!userText) return;
  if (isConversationPriorityEngineEnabled()) {
    const priority = resolveConversationPriority({
      userText,
      lastAssistantText: input.lastAssistantText ?? "",
      currentTurn: input.currentTurn ?? 0,
      hasUniversalCreationSession: Boolean(loadUniversalCreationSession()),
      frictionlessPending: loadFrictionlessPending(),
    });
    if (priority.stalePendingsToClear.includes("frictionless")) {
      clearFrictionlessPending();
    }
  }
  if (isFrictionlessAffirmation(userText) || isConfirmationAcceptance(userText)) {
    return;
  }
  if (isPureConfirmationDecline(userText)) {
    clearFrictionlessPending();
    return;
  }
  const last = input.lastAssistantText?.trim() ?? "";
  if (last && isCreateFlowAssistantContext(last)) return;
  if (loadUniversalCreationSession()) return;
  if (loadDiscoverySession()) return;
  if (messageNamesExactEstateRoom(userText)) {
    clearFrictionlessPending();
    return;
  }
  const pending = loadFrictionlessPending();
  if (!pending) return;
  const currentTurn = input.currentTurn ?? 0;
  if (isFrictionlessPendingExpired(pending, currentTurn)) {
    clearFrictionlessPending();
    return;
  }
  if (routing.learnFastPath) {
    clearFrictionlessPending();
  }
}

function buildPendingContinuationDecision(
  pending: FrictionlessPendingAction,
  cont: { execute: boolean; ack: string },
  routing: IntentRoutingDecision,
  input: FrictionlessActionInput,
): FrictionlessActionDecision {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  const base: FrictionlessActionDecision = {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "YES CONTINUATION: Execute the stored pending action — do not re-ask what to create or open the wrong workspace.",
    localReply: cont.ack,
    pendingAction: null,
    toolSuggestion:
      pending.target === "focus-audio" ||
      pending.target === "breathe" ||
      pending.target === "brain-dump"
        ? frictionlessToToolSuggestion(pending)
        : null,
    workspaceOffer: null,
    intentRouting: routing,
  };

  if (pending.target === "content-generator") {
    const prompt = pending.initialPrompt?.trim() ?? "";
    const storedSession = loadUniversalCreationSession();
    if (storedSession) {
      const turn = resolveUniversalCreationTurn(
        userText,
        currentTurn,
        input.lastAssistantText,
      );
      if (turn) {
        saveUniversalCreationSession(turn.session);
        const localReply =
          turn.kind === "question"
            ? formatUniversalCreationQuestion(turn)
            : turn.kind === "uncertainty" || turn.kind === "message"
              ? turn.message
              : formatUniversalCreationTurnReply(turn);
        return {
          ...base,
          category: "universal_creation",
          localReply,
          responseHint: universalCreationHint(turn.session, turn),
          universalCreationSession: turn.session,
        };
      }
    }
    if (prompt) {
      const turn = resolveUniversalCreationTurn(
        prompt,
        currentTurn,
        input.lastAssistantText,
      );
      if (turn?.kind === "question") {
        saveUniversalCreationSession(turn.session);
        return {
          ...base,
          category: "universal_creation",
          localReply: formatUniversalCreationQuestion(turn),
          responseHint: universalCreationHint(turn.session, turn),
          universalCreationSession: turn.session,
          workspaceOffer: {
            section: "content-generator",
            buttonLabel: pending.offerSummary ?? "Create",
            line: cont.ack,
          },
        };
      }
      const createOpen = resolveImmediateCreateAction(
        prompt,
        pending.artifactType as RegistryArtifactKind | undefined,
        { universalCreationSession: loadUniversalCreationSession() },
      );
      if (createOpen) {
        return {
          ...base,
          immediateCreateOpen: createOpen,
          workspaceOffer: {
            section: "content-generator",
            buttonLabel: pending.offerSummary ?? "Create",
            line: cont.ack,
          },
        };
      }
    }
    return {
      ...base,
      workspaceOffer: {
        section: "content-generator",
        buttonLabel: pending.offerSummary ?? "Create",
        line: cont.ack,
      },
    };
  }

  if (pending.target === "decision-compass") {
    return {
      ...base,
      category: "decision_support",
      workspaceOffer: routing.workspaceOffer ?? {
        section: "decision-compass",
        buttonLabel: "Open Decision Compass",
        line: cont.ack,
      },
    };
  }

  if (pending.target === "brain-dump") {
    return {
      ...base,
      workspaceOffer: {
        section: "brain-dump",
        buttonLabel: "Clear My Mind",
        line: cont.ack,
      },
    };
  }

  if (pending.target === "visual-focus") {
    return {
      ...base,
      workspaceOffer: {
        section: "visual-focus",
        buttonLabel: "Open Visual Thinking",
        line: cont.ack,
      },
      immediateVisualOpen:
        pending.viewId && pending.visualFocusMode
          ? {
              mode: pending.visualFocusMode,
              viewId: pending.viewId,
              viewTitle: pending.viewTitle ?? "Visual Thinking",
              purposeAnswer: pending.initialPrompt,
              ack: cont.ack,
            }
          : undefined,
    };
  }

  if (
    pending.type === "visual_thinking_menu" ||
    pending.type === "visual_recommendation"
  ) {
    return {
      ...base,
      workspaceOffer: {
        section: "visual-focus",
        buttonLabel: "Open Visual Thinking",
        line: cont.ack,
      },
    };
  }

  if (pending.target === "focus-audio" || pending.target === "breathe") {
    return { ...base, category: "tool_open" };
  }

  if (pending.type === "create_google_sheet") {
    return { ...base, category: "google_sheet" };
  }

  if (pending.type === "strategy_offer" || pending.target === "playbook") {
    return {
      ...base,
      category: "strategy",
      workspaceOffer: {
        section: "playbook",
        buttonLabel: pending.offerSummary ?? "Open Strategies",
        line: cont.ack,
      },
    };
  }

  if (pending.type === "open_workspace") {
    return {
      ...base,
      workspaceOffer: {
        section: pending.target as AppSection,
        buttonLabel: pending.offerSummary ?? pending.label ?? "Continue",
        line: cont.ack,
      },
    };
  }

  return base;
}

function tryFrictionlessYesContinuation(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;
  if (!isFrictionlessAffirmation(userText) && !isConfirmationAcceptance(userText)) {
    return null;
  }
  if (routing.learnFastPath) return null;
  if (messageNamesExactEstateRoom(userText)) return null;

  if (isConversationPriorityEngineEnabled()) {
    const priority = resolveConversationPriority({
      userText,
      lastAssistantText: input.lastAssistantText ?? "",
      currentTurn,
      hasUniversalCreationSession: Boolean(loadUniversalCreationSession()),
      frictionlessPending: loadFrictionlessPending(),
    });
    if (priority.deferFrictionlessYes) return null;
  }

  const ucSession = loadUniversalCreationSession();
  const lastAssistant = input.lastAssistantText?.trim() ?? "";
  if (
    ucSession &&
    lastAssistant &&
    (isUniversalCreationMessage(lastAssistant) ||
      inferMeaningTopicFromAssistant(lastAssistant) === "create")
  ) {
    return null;
  }

  const pending = loadFrictionlessPendingForConfirmation({
    confirmationReply: true,
    awaitingPending: undefined,
    lastAssistantText: input.lastAssistantText,
    currentTurn,
  });
  if (!pending) return null;

  const cont = resolveFrictionlessContinuation(
    userText,
    pending,
    currentTurn,
    input.lastAssistantText,
  );
  if (!cont?.execute) return null;

  return buildPendingContinuationDecision(pending, cont, routing, input);
}

function buildCreateFrictionlessPending(input: {
  target: AppSection;
  userText: string;
  offeredAtTurn: number;
  artifactKind?: RegistryArtifactKind | null;
  offerSummary?: string;
}): FrictionlessPendingAction {
  const artifactType = inferCreateItemTypeFromText(
    input.userText,
    input.artifactKind,
  );
  const pending: FrictionlessPendingAction = {
    type: "open_workspace",
    target: input.target,
    label: "Create",
    context: input.artifactKind ?? artifactType ?? "create",
    artifactType,
    initialPrompt: input.userText.trim(),
    offeredAtTurn: input.offeredAtTurn,
    offerSummary: input.offerSummary ?? "Create",
  };
  logCreatePendingAction("saved pending action", {
    target: pending.target,
    artifactType: pending.artifactType,
    initialPrompt: pending.initialPrompt,
  });
  return pending;
}

function buildVisualStructureDecision(
  offer: WorkspaceOffer,
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
  route: ReturnType<typeof resolveVisualStructureRoute>,
): FrictionlessActionDecision {
  const view =
    route?.viewId != null
      ? detectExplicitVisualView(userText) ?? detectConversionTargetView(userText)
      : null;

  if (route?.immediate && view) {
    const purpose = isVisualConversionRequest(userText)
      ? userText
      : userText.trim();
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "VISUAL THINKING STUDIO (P0.20 Path B): Open Visual Thinking immediately — never Create.",
      localReply: immediateVisualOpenAck(view),
      pendingAction: null,
      immediateVisualOpen: {
        mode: view.mode,
        viewId: view.id,
        viewTitle: view.title,
        purposeAnswer: purpose,
        ack: immediateVisualOpenAck(view),
      },
      toolSuggestion: null,
      workspaceOffer: offer,
      intentRouting: routing,
    };
  }

  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "VISUAL STRUCTURE (P0.17.2): Route to Visual Thinking or Decision Compass — never Create.",
    localReply: offer.line,
    pendingAction: frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
      userText,
    }),
    toolSuggestion: null,
    workspaceOffer: offer,
    intentRouting: routing,
  };
}

function tryVisualStructureEarlyFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;

  if (routing.learnFastPath || shouldSuppressVisualThinkingForLearn(userText)) {
    return null;
  }

  const plannedVisualReply = resolveUnavailableVisualTypeReply(userText, {
    priorContent: input.lastAssistantText,
  });
  if (plannedVisualReply) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "PLANNED VISUAL TYPE (P0.20.4): Not built yet — draft outline in chat; optional Mind Map offer. Never Create.",
      localReply: plannedVisualReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  const visualRoute = resolveVisualStructureRoute(userText);
  const visualOffer = resolveVisualStructureWorkspaceOffer(userText);
  if (
    visualOffer?.section === "visual-focus" &&
    !shouldBlockVisualThinking(userText)
  ) {
    if (isVisualConversionRequest(userText) && input.lastAssistantText?.trim()) {
      const view = detectConversionTargetView(userText);
      if (view) {
        const sourceValidation = validateVisualSourceContent({
          userText,
          sourceContent: input.lastAssistantText,
          currentTurn,
        });
        if (!sourceValidation.ok) {
          return {
            category: "direct_action",
            suppressRelationship: true,
            suppressRecap: true,
            suppressReflectionFirst: true,
            responseHint:
              "VISUAL SOURCE VALIDATION (P0.20.5): Prior content failed validation — ask for source instead of converting.",
            localReply: buildVisualSourceAskReply(userText, sourceValidation),
            pendingAction: null,
            toolSuggestion: null,
            workspaceOffer: null,
            intentRouting: routing,
          };
        }
        return {
          category: "direct_action",
          suppressRelationship: true,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint:
            "VISUAL CONVERSION (P0.20): Reuse chat content; open Visual Thinking immediately.",
          localReply: immediateVisualOpenAck(view),
          pendingAction: null,
          immediateVisualOpen: {
            mode: view.mode,
            viewId: view.id,
            viewTitle: view.title,
            purposeAnswer: input.lastAssistantText.trim(),
            ack: immediateVisualOpenAck(view),
          },
          toolSuggestion: null,
          workspaceOffer: visualOffer,
          intentRouting: routing,
        };
      }
    }
    return buildVisualStructureDecision(
      visualOffer,
      userText,
      currentTurn,
      routing,
      visualRoute,
    );
  }

  return null;
}

function buildMotivationSupportDecision(
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "focus_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "MOTIVATION SUPPORT (P0.20.3): One small step first — not Visual Thinking. Offer Focus Mode or Focus Audio if helpful.",
    localReply:
      "Let's find one small step forward. What's the smallest piece you could touch right now?\n\nIf it helps, we can use **Focus Mode** or **Focus Audio** — want either?",
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildSimpleOverwhelmOrganizeDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  const cognitive = isCognitiveOverloadNeed(userText);
  const taskBreakdown = isTaskBreakdownNeed(userText);
  const bareOverwhelmReply =
    "I'm here with you. What's feeling heaviest right now — too much in your head, a project that's stuck, or needing to calm your body?\n\nIf getting it out of your head would help, we can open Clear My Mind whenever you're ready.";
  const offer = {
    section: "brain-dump" as const,
    buttonLabel: cognitive
      ? COGNITIVE_OVERLOAD_PRIMARY_LABEL
      : "Clear My Mind",
    line: cognitive
      ? `${COGNITIVE_OVERLOAD_REPLY}\n\n1. ${COGNITIVE_OVERLOAD_PRIMARY_LABEL}\n2. ${COGNITIVE_OVERLOAD_STAY_LABEL}`
      : taskBreakdown
        ? TASK_BREAKDOWN_REPLY
        : bareOverwhelmReply,
    ...(cognitive
      ? {
          secondary: {
            section: "home" as const,
            buttonLabel: COGNITIVE_OVERLOAD_STAY_LABEL,
          },
        }
      : {}),
  };
  const plainOverwhelm =
    /\b(?:i'?m\s+)?overwhelmed\b/i.test(userText.trim()) &&
    !/\btoo many ideas\b/i.test(userText);
  if (cognitive) {
    registerCognitiveOverloadPendingChoices({
      menuText: offer.line,
      offeredAtTurn: currentTurn,
    });
  }
  return {
    category:
      cognitive || taskBreakdown || plainOverwhelm ? "direct_action" : "none",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: cognitive
      ? "COGNITIVE OVERLOAD: Clear My Mind only — never scenic place menus."
      : taskBreakdown
        ? "TASK BREAKDOWN: Ask about the project / first step — never scenic place menus."
        : "OVERWHELM: Conversation first — offer Clear My Mind with permission, never auto-open Breathe.",
    localReply: offer.line,
    pendingAction: cognitive
      ? null
      : taskBreakdown
        ? null
        : frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
            userText,
          }),
    toolSuggestion: null,
    workspaceOffer: cognitive || taskBreakdown ? null : offer,
    intentRouting: routing,
  };
}

function isFocusSupportFollowUp(
  userText: string,
  lastAssistantText?: string,
): boolean {
  if (!lastAssistantText?.trim()) return false;
  if (
    !/choose one focus thread|what needs your attention most/i.test(
      lastAssistantText,
    )
  ) {
    return false;
  }
  return /\b(?:too many thoughts|can't get started|keep getting interrupted|can't concentrate|distracted|no motivation|anxious|tired)\b/i.test(
    userText,
  );
}

function shouldDeferEarlyOverwhelmRoute(
  userText: string,
  lastAssistantText?: string,
): boolean {
  if (isFocusSupportFollowUp(userText, lastAssistantText)) return true;
  if (resolveEstateNavigationDiscovery(userText)) {
    if (
      /\boverwhelm/i.test(userText) &&
      detectOverwhelmTodayRoute(userText)
    ) {
      return false;
    }
    return true;
  }
  return false;
}

function tryEarlyCompanionSupportFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;

  if (
    EMOTIONAL_REGULATION_RE.test(userText) &&
    !PRODUCTIVITY_FRAMING_RE.test(userText)
  ) {
    return buildEmotionalRegulationDecision(userText, currentTurn);
  }

  if (
    isMotivationProblem(userText) &&
    !/\b(?:music|audio|sound|playlist|listen)\b/i.test(userText)
  ) {
    return buildEmotionalRegulationDecision(userText, currentTurn);
  }

  const guardedAudio = tryGuardedEnvironmentalAudioFlow(userText, routing);
  if (guardedAudio) return guardedAudio;

  const audio = buildAudioPending(userText, currentTurn);
  if (audio) return audio;

  // Cognitive overload wins before scenic / multi-destination overwhelm menus.
  if (
    isCognitiveOverloadNeed(userText) &&
    !shouldDeferEarlyOverwhelmRoute(userText, input.lastAssistantText)
  ) {
    return buildSimpleOverwhelmOrganizeDecision(userText, currentTurn, routing);
  }

  if (
    isTaskBreakdownNeed(userText) &&
    !shouldDeferEarlyOverwhelmRoute(userText, input.lastAssistantText)
  ) {
    return buildSimpleOverwhelmOrganizeDecision(userText, currentTurn, routing);
  }

  if (
    !shouldDeferEarlyOverwhelmRoute(userText, input.lastAssistantText) &&
    detectOverwhelmTodayRoute(userText)
  ) {
    const overwhelm = buildOverwhelmFrictionlessDecision(
      userText,
      currentTurn,
      routing,
    );
    if (overwhelm) return overwhelm;
  }

  if (
    isSelfUnderstandingIntent(userText) &&
    !isExplicitVisualThinkingRequest(userText) &&
    !isVisualConversionRequest(userText)
  ) {
    return {
      category: "none",
      suppressRelationship: false,
      suppressRecap: false,
      suppressReflectionFirst: false,
      responseHint:
        "RELATIONSHIP REFLECTION (P0.17): Self-understanding turn — warm conversation, one thoughtful question. No tools. No Visual Thinking.",
      localReply: null,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  if (
    isOverwhelmProblem(userText) &&
    !detectOverwhelmTodayRoute(userText) &&
    !shouldEnterDiscoveryMode(userText) &&
    !isFocusSupportFollowUp(userText, input.lastAssistantText)
  ) {
    return buildSimpleOverwhelmOrganizeDecision(userText, currentTurn, routing);
  }

  if (
    /\bkeep(?:s)?\s+procrastinat\w*\b/i.test(userText) &&
    !/\b(?:sales|outreach|follow[- ]?up)\b/i.test(userText) &&
    !/\bwhy do i\b/i.test(userText)
  ) {
    return buildFocusSupportDecision(currentTurn);
  }

  const strategyEarly = buildStrategyFrictionlessDecision(
    userText,
    currentTurn,
    routing,
  );
  if (strategyEarly) return strategyEarly;

  if (/\btoo many ideas\b/i.test(userText) && shouldBlockVisualThinking(userText)) {
    return buildSimpleOverwhelmOrganizeDecision(userText, currentTurn, routing);
  }

  if (isFocusProblem(userText) && !isOverwhelmProblem(userText)) {
    return buildFocusSupportDecision(currentTurn);
  }

  return null;
}

function buildOverwhelmFrictionlessDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const route = detectOverwhelmTodayRoute(userText);
  if (!route) return null;
  const offers = buildOverwhelmTodayOffers(userText, route);
  const offer = offers.primary;
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "OVERWHELM (P0.20.3): Route to Plan My Day / Clear My Mind — never Visual Thinking.",
    localReply: offer.line,
    pendingAction: frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
      userText,
    }),
    toolSuggestion: null,
    workspaceOffer: offer,
    intentRouting: routing,
  };
}

function buildStrategyFrictionlessDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  if (shouldSkipStrategyOfferForUserText(userText)) return null;
  if (isSelfUnderstandingIntent(userText)) return null;
  if (!isStrategyProblem(userText) && !isActivationProblem(userText)) {
    return null;
  }
  const rec = recommendStrategyFromUserText(userText);
  if (!rec || rec.confidence === "low") return null;
  const pending = buildStrategyOfferPendingFromRecommendation(
    rec,
    userText,
    currentTurn,
  );
  return {
    category: "strategy",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "STRATEGY INTELLIGENCE (P0.20.3): Offer matching strategy before Visual Thinking.",
    localReply: rec.offerMessage,
    pendingAction: pending,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function tryVisualBeginnerChoiceFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;

  const lastAssistant = input.lastAssistantText?.trim() ?? "";
  if (isVisualBeginnerChoiceMessage(lastAssistant)) {
    const choice = parseVisualBeginnerChoice(userText);
    if (choice === "recommend") {
      return buildVisualRecommendationDecision(
        lastAssistant.includes("organize")
          ? "help me organize this visually"
          : "help me choose a visual",
        input.currentTurn ?? 0,
        routing,
        input.lastAssistantText,
      );
    }
    if (choice === "explore") {
      return {
        category: "direct_action",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "CARTOGRAPHER BEGINNER: Open Studio so member can explore frames / Atlas.",
        localReply:
          "I'll open Cartographer's Studio — explore the framed maps or the Atlas, and choose when you're ready.",
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
        immediateCartographersStudioOpen: true,
      };
    }
  }

  if (detectsVisualBeginnerUnsure(userText)) {
    if (detectExplicitVisualView(userText)?.id === "mind-map") {
      return null;
    }
    const reply = formatVisualBeginnerChoiceMessage();
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "CARTOGRAPHER BEGINNER: Offer Recommend One / I'll Choose — never force a map menu.",
      localReply: reply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  return null;
}

function tryVisualRecommendationFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (
    !shouldRouteBusinessStrategyToCreate(userText) &&
    routing.category !== "learn" &&
    !routing.learnFastPath &&
    !shouldSuppressVisualRecommendation(userText) &&
    shouldOfferVisualRecommendation(userText)
  ) {
    if (isRegistryArtifactExecution(userText) || isSimpleCreateRequest(userText)) {
      return null;
    }
    return buildVisualRecommendationDecision(
      userText,
      currentTurn,
      routing,
      input.lastAssistantText,
    );
  }
  return null;
}

function buildVisualRecommendationDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
  lastAssistantText?: string,
): FrictionlessActionDecision {
  const pending = visualRecommendationPendingFromReply({
    userText,
    context: { lastAssistantText },
    offeredAtTurn: currentTurn,
  });
  const reply = buildVisualRecommendationReply(
    recommendVisualStructures({
      userText,
      context: { lastAssistantText },
    }),
  );
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "VISUAL RECOMMENDATION ENGINE (P0.20 Path B): Recommend 2–3 structures with reasons — never for ADHD friction.",
    localReply: reply,
    pendingAction: pending,
    toolSuggestion: null,
    workspaceOffer: {
      section: "visual-focus",
      buttonLabel: "Open Visual Thinking",
      line: reply,
    },
    intentRouting: routing,
  };
}

function tryImmediateEstateExperienceAction(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  if (isSelfUnderstandingIntent(userText)) return null;
  if (
    shouldCoachBeforeNavigate(userText) ||
    shouldEnterDiscoveryMode(userText) ||
    shouldEnterUniversalCreation(userText)
  ) {
    return null;
  }

  const intel = resolveEstateIntelligenceImmediateAction(userText);

  if (intel?.kind === "create-project") {
    const project = resolveImmediateCreateProjectAction(userText);
    if (project) {
      return {
        category: "direct_action",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "CREATE: New project — bring to life in Create; active work lives in Momentum.",
        localReply: project.followUpLine,
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
        immediateCreateProjectOpen: project,
      };
    }
  }

  if (intel?.kind === "conversation" && !routing.learnFastPath) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: formatEstateIntelligenceHint(intel.route),
      localReply: intel.route.followUpLine ?? null,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  if (intel?.kind === "research" && intel.researchPayload) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: formatEstateIntelligenceHint(intel.route),
      localReply: intel.researchPayload.followUpLine,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      immediateResearchOpen: intel.researchPayload,
    };
  }

  if (intel?.kind === "visual") {
    const view = getVisualThinkingView("mind-map");
    if (view) {
      const ack = intel.route.followUpLine ?? immediateVisualOpenAck(view);
      return {
        category: "direct_action",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: formatEstateIntelligenceHint(intel.route),
        localReply: ack,
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: routing,
        immediateVisualOpen: {
          mode: view.mode,
          viewId: view.id,
          viewTitle: view.title,
          purposeAnswer: userText.trim(),
          ack,
        },
      };
    }
  }

  const createProject = resolveImmediateCreateProjectAction(userText);
  if (createProject) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "CREATE: New project — bring to life in Create; active work lives in Momentum.",
      localReply: createProject.followUpLine,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      immediateCreateProjectOpen: createProject,
    };
  }

  const momentumOpen = resolveImmediateMomentumAction(userText);
  if (momentumOpen) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "MOMENTUM: Navigate to projects — creation belongs in Create, forward motion belongs here.",
      localReply: momentumOpen.followUpLine,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      immediateMomentumOpen: momentumOpen,
    };
  }

  const artifact = detectArtifactRequest(userText);
  if (artifact && isRegistryArtifactExecution(userText)) {
    return buildDirectActionDecision(
      {
        ...routing,
        suppressRelationshipIntelligence: true,
      },
      userText,
      currentTurn,
    );
  }

  return null;
}

function buildHelpDiscoveryContext(
  input: FrictionlessActionInput,
): HelpDiscoveryContext {
  const memberId = getDiscoveryMemberId();
  const historyStore = getDefaultDiscoveryHistoryStore();
  let journeyProgress = loadMemberJourneyProgress(memberId);
  journeyProgress = syncJourneyProgressFromDiscoveryHistory(
    journeyProgress,
    historyStore,
  );

  return {
    currentLocationId: input.currentRoom ?? undefined,
    memberId,
    journeyProgress,
    historyStore,
    memberStage: deriveMemberStageFromJourney(journeyProgress),
    exploredDiscoveryIds: journeyProgress.discoveriesViewed,
  };
}

function tryConversationStabilizationFlow(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
  fast: StabilizationFastPathResult,
): FrictionlessActionDecision {
  const base: FrictionlessActionDecision = {
    category:
      fast.category === "universal_creation"
        ? "universal_creation"
        : "direct_action",
    suppressRelationship: fast.suppressRelationship,
    suppressRecap: fast.suppressRecap,
    suppressReflectionFirst: fast.suppressReflectionFirst,
    responseHint: fast.responseHint,
    localReply: fast.localReply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    immediateResearchOpen: fast.immediateResearchOpen,
    immediateCreateProjectOpen: fast.immediateCreateProjectOpen,
  };

  if (fast.category === "universal_creation") {
    const session = loadUniversalCreationSession();
    if (session) {
      base.pendingAction = universalCreationPendingAction(
        session,
        input.currentTurn ?? 0,
        routing.artifactKind,
      );
      base.universalCreationSession = session;
    }
  }

  return base;
}

function mapEstateIntelligenceRuntimeToFrictionless(
  runtime: EstateIntelligenceRuntimeResult,
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  const base: FrictionlessActionDecision = {
    category:
      runtime.category === "universal_creation"
        ? "universal_creation"
        : runtime.category === "estate_guide"
          ? "estate_guide"
          : runtime.category === "estate_concierge"
            ? "estate_concierge"
            : "direct_action",
    suppressRelationship: runtime.suppressRelationship,
    suppressRecap: runtime.suppressRecap,
    suppressReflectionFirst: runtime.suppressReflectionFirst,
    responseHint: runtime.responseHint,
    localReply: runtime.localReply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    immediateResearchOpen: runtime.immediateResearchOpen,
    immediateCreateProjectOpen: runtime.immediateCreateProjectOpen,
    immediateEstatePlaceNavigate: runtime.immediateEstatePlaceNavigate,
    immediateEstateHowToGuideOpen: runtime.immediateEstateHowToGuideOpen,
  };

  if (runtime.universalCreationCategory || runtime.category === "universal_creation") {
    const session = loadUniversalCreationSession();
    if (session) {
      base.pendingAction = universalCreationPendingAction(
        session,
        input.currentTurn ?? 0,
        routing.artifactKind,
      );
      base.universalCreationSession = session;
    }
  }

  // Bind pending to the exact displayed place menu when estate intelligence offered choices.
  if (
    base.localReply &&
    !base.immediateEstatePlaceNavigate &&
    !hasActivePendingChoice()
  ) {
    registerPendingChoiceFromAssistantText(
      base.localReply,
      input.currentTurn,
    );
  }

  return base;
}

function tryEstateHelpDiscoveryFlow(
  userText: string,
  routing: IntentRoutingDecision,
  input: FrictionlessActionInput,
  stabilization?: ArbitrationResult | null,
): FrictionlessActionDecision | null {
  if (
    isSubstantiveConversationHelpRequest(userText) ||
    isEmailAutomationOrInboxHelpRequest(userText)
  ) {
    return null;
  }
  if (
    stabilization &&
    shouldBlockEstateSubsystem(stabilization, "help_discovery_location") &&
    !/\bwhere is\b/i.test(userText)
  ) {
    return null;
  }
  const helpContext = buildHelpDiscoveryContext(input);
  const decision = resolveHelpDiscoveryQuery(userText, helpContext);
  if (!isResolvedHelpDiscovery(decision)) return null;

  const base: FrictionlessActionDecision = {
    category: "estate_concierge",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: `HELP & DISCOVERY (${decision.route}): Knowledge Base guidance only. Permission before navigation.`,
    localReply: decision.memberFacingResponse,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };

  if (
    decision.route === "location" &&
    decision.navigation &&
    shouldNavigateFromDecision(decision.navigation) &&
    !/\bwhere is\b/i.test(userText) &&
    decision.navigation.placeId
  ) {
    return {
      ...base,
      immediateEstatePlaceNavigate: {
        placeId: decision.navigation.placeId,
        navigationLine: decision.memberFacingResponse,
        userText,
      },
    };
  }

  if (
    decision.route === "location" &&
    decision.navigation?.kind === "offer_choices" &&
    decision.navigation.choices?.length &&
    decision.memberFacingResponse
  ) {
    registerPendingChoiceFromNavigation({
      choices: decision.navigation.choices.map((choice, index) => ({
        label: String(index + 1),
        destinationId: choice.placeId,
        displayName: choice.officialDisplayName,
        shortDescription: choice.memberFacingHint,
        confidence: "medium" as const,
        reasonMatched: "help_discovery",
      })),
      menuText: decision.memberFacingResponse,
      queryPhrase: userText,
      offeredAtTurn: input.currentTurn,
    });
  }

  return base;
}

function tryEstateRecommendationInvitation(
  userText: string,
  routing: IntentRoutingDecision,
  currentLocationId?: string,
  stabilization?: ArbitrationResult | null,
): FrictionlessActionDecision | null {
  if (
    isSubstantiveConversationHelpRequest(userText) ||
    isEmailAutomationOrInboxHelpRequest(userText)
  ) {
    return null;
  }
  // Phase A: scenic/recommendation place offers obey turn decision.
  if (!authorizeScenicPlaceMenu(userText)) {
    return null;
  }
  if (
    stabilization &&
    shouldBlockEstateSubsystem(stabilization, "recommendation")
  ) {
    return null;
  }
  if (stabilization && !shouldAllowEstateSuggestions(stabilization)) {
    return null;
  }
  const decision = resolveEstateRecommendation(userText, {
    currentLocationId,
  });
  if (!isResolvedEstateRecommendation(decision)) return null;
  if (!decision.memberFacingInvitation) return null;

  return {
    category: "estate_concierge",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "ESTATE RECOMMENDATION: Why-now invitation only — never force navigation. Staying is valid.",
    localReply: decision.memberFacingInvitation,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function tryEstateNavigationIntelligence(
  userText: string,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const ESTATE_NAVIGATION_GOLDEN_RULE =
    "Offer at most three thoughtful choices. Never guess. Member chooses.";

  const decision = resolveEstateNavigationIntent(userText);
  if (decision.kind === "unresolved") return null;

  const localReply = formatNavigationDecision(decision);
  if (!localReply) return null;

  if (shouldNavigateFromDecision(decision)) {
    // Phase A: direct nav only when turn decision allows navigation.
    if (!authorizeDirectNavigation(userText)) {
      return null;
    }
    const displayName =
      decision.choices?.[0]?.officialDisplayName ?? "that place";
    const hint = decision.choices?.[0]?.memberFacingHint;
    const navigationLine = formatDirectNavigationLine(displayName, hint);

    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: `ESTATE NAVIGATION (high confidence): ${ESTATE_NAVIGATION_GOLDEN_RULE}`,
      localReply: navigationLine,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      immediateEstatePlaceNavigate: {
        placeId: decision.placeId!,
        navigationLine,
        userText,
      },
    };
  }

  if (decision.kind === "offer_choices" && decision.choices?.length) {
    // Phase A: multi-place scenic menus require scenic permission.
    if (!authorizeScenicPlaceMenu(userText)) {
      return null;
    }
    const destinationChoices = decision.choices.map((choice, index) => ({
      label: String(index + 1),
      destinationId: choice.placeId,
      displayName: choice.officialDisplayName,
      shortDescription: choice.memberFacingHint,
      confidence: "medium" as const,
      reasonMatched: decision.intentKind,
    }));
    registerPendingChoiceFromNavigation({
      choices: destinationChoices,
      menuText: localReply,
      queryPhrase: userText,
      offeredAtTurn: undefined,
    });
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: `ESTATE NAVIGATION (medium confidence): ${ESTATE_NAVIGATION_GOLDEN_RULE}`,
      localReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  if (decision.kind === "need_clarification") {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: `ESTATE NAVIGATION (medium confidence): ${ESTATE_NAVIGATION_GOLDEN_RULE}`,
      localReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  return null;
}

function tryEstateNavigationPhilosophy(
  userText: string,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const discovery = resolveEstateNavigationDiscovery(userText);
  if (discovery) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: `ESTATE NAVIGATION (low confidence): ${ESTATE_NAVIGATION_GOLDEN_RULE}`,
      localReply: `${discovery.intro}\n\n${discovery.question}`,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  const disambiguation = resolveEstateNavigationDisambiguation(userText);
  if (disambiguation) {
    const localReply = formatEstateNavigationChoiceMenu(disambiguation);
    registerPendingChoiceFromExperienceMenu({
      choices: disambiguation.choices.map((choice) => ({
        id: choice.spaceId || choice.experienceId,
        label: choice.headline,
        description: choice.detail,
        placeId: choice.spaceId,
      })),
      menuText: localReply,
      queryPhrase: userText,
    });
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: `ESTATE NAVIGATION (medium confidence): ${ESTATE_NAVIGATION_GOLDEN_RULE}`,
      localReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      estateNavigationDisambiguation: disambiguation,
    };
  }

  return null;
}

function buildDirectActionDecision(
  routing: IntentRoutingDecision,
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  const immediateCreate =
    !shouldEnterUniversalCreation(userText) &&
    resolveImmediateCreateAction(userText, routing.artifactKind);
  if (immediateCreate) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "CREATE EXPERIENCE: Navigate to Create, open the tool, continue — no permission ask.",
      localReply: immediateCreate.followUpLine,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: routing.workspaceOffer,
      intentRouting: routing,
      immediateCreateOpen: immediateCreate,
    };
  }

  const execCategory = routing.category === "build" ? "build" : "execute";
  const localReply =
    routing.navigationLine ??
    (routing.artifactKind
      ? buildRegistryArtifactOfferLine(routing.artifactKind, execCategory)
      : "Let's head to Create.");
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "DIRECT ACTION (P0.9): Start the work or ask ONE needed detail. No relationship observations.",
    localReply,
    pendingAction:
      routing.workspaceOffer?.section === "content-generator"
        ? buildCreateFrictionlessPending({
            target: "content-generator",
            userText,
            offeredAtTurn: currentTurn,
            artifactKind: routing.artifactKind,
            offerSummary: routing.featureLabel ?? "Create",
          })
        : routing.workspaceOffer
          ? {
              type: "open_workspace",
              target: routing.workspaceOffer.section,
              context: routing.artifactKind ?? "create",
              offeredAtTurn: currentTurn,
              offerSummary: routing.featureLabel ?? "Create",
            }
          : null,
    toolSuggestion: null,
    workspaceOffer: routing.workspaceOffer,
    intentRouting: routing,
  };
}

function finishFrictionlessDecision(
  decision: FrictionlessActionDecision,
  runtime: SparkRuntimeAction,
  decisionContext?: CompanionDecisionInput | null,
): FrictionlessActionDecision {
  let result = decision.sparkRuntime ? decision : attachSparkRuntime(decision, runtime);
  if (decisionContext) {
    result = applyCompanionDecisionGuidance(result, decisionContext);
  }
  return result;
}

function resolveFrictionlessActionImpl(
  input: FrictionlessActionInput,
): FrictionlessActionDecision {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  const none: FrictionlessActionDecision = {
    category: "none",
    suppressRelationship: shouldSuppressRelationshipIntelligenceForUserText(userText),
    suppressRecap: false,
    suppressReflectionFirst: shouldSuppressRelationshipIntelligenceForUserText(userText),
    responseHint: null,
    localReply: null,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };

  if (!userText) return none;

  const sparkRuntime = resolveSparkRuntime(input);
  let routingPipeline: ReturnType<typeof runConversationRoutingPipeline> | null =
    null;

  const finish = (decision: FrictionlessActionDecision): FrictionlessActionDecision => {
    const result = finishFrictionlessDecision(decision, sparkRuntime, {
      userText,
      lastAssistantText: input.lastAssistantText,
      goal: routingPipeline?.arbitration.goal ?? "general_conversation",
      arbitration: routingPipeline?.arbitration,
      winningCapability: routingPipeline?.winningCapability,
      overwhelmed: input.overwhelmed,
      category: decision.category,
    });
    updateCompanionContextFromDecision({
      userText,
      lastAssistantText: input.lastAssistantText,
      currentTurn,
      decision: result,
      goal: routingPipeline?.arbitration.goal ?? null,
      arbitration: routingPipeline?.arbitration ?? null,
    });
    return result;
  };

  const canonLocalReply = tryCanonLocalReply(userText);
  if (canonLocalReply) {
    return finish({
      ...none,
      category: "estate_guide",
      localReply: canonLocalReply,
      responseHint: buildCanonResponseHint(userText),
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      intentRouting: null,
    });
  }

  const routing = resolveIntentRouting({
    userText,
    workspace: input.workspace,
    emotionalState: input.emotionalState,
    overwhelmed: input.overwhelmed,
  });

  const companionTurn = resolveCompanionTurn(
    {
      userText,
      lastAssistantText: input.lastAssistantText,
      currentTurn,
      currentRoom: input.currentRoom,
      activeWorkflow: input.activeWorkflow,
      workspace: input.workspace,
      overwhelmed: input.overwhelmed,
    },
    routing,
  );
  if (companionTurn.statePatch) {
    writeCompanionConversationState(companionTurn.statePatch);
  }
  if (companionTurn.handled && companionTurn.decision) {
    return finish({
      ...none,
      ...companionTurn.decision,
      intentRouting: companionTurn.decision.intentRouting ?? routing,
    });
  }

  maybeClearStaleFrictionlessPending(input, routing);

  /** Pending numbered choices resolve before overwhelm / emotional early routes. */
  const pendingChoiceFlow = tryPendingChoiceFlow(input, routing);
  if (pendingChoiceFlow) {
    return finish(pendingChoiceFlow);
  }

  const earlySupport = tryEarlyCompanionSupportFlow(input, routing);
  if (earlySupport) {
    return finish(earlySupport);
  }

  const techThin = composeThinTechFutureMemberReply(userText);
  if (techThin) {
    return finish({
      category: "decision_support",
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        techFutureHintForChat(userText) ??
        "TECHNOLOGY & FUTURE: thin advice only — no scenic menu, no auto-navigate.",
      localReply: techThin,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    });
  }

  const casualUpdate = casualUpdateLocalReply(userText);
  if (casualUpdate) {
    return finish({
      category: "none",
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: false,
      responseHint:
        "CASUAL UPDATE: Warm presence only — no workflow, menu, or forced follow-up question.",
      localReply: casualUpdate,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    });
  }

  const yesContinuation = tryFrictionlessYesContinuation(input, routing);
  if (yesContinuation) {
    return finish(yesContinuation);
  }

  routingPipeline = runConversationRoutingPipeline(
    {
      userText,
      lastAssistantText: input.lastAssistantText,
      currentTurn: input.currentTurn,
      activeWorkflow: input.activeWorkflow,
      workspace: input.workspace ?? undefined,
      helpDiscoveryContext: buildHelpDiscoveryContext(input),
    },
    routing,
  );

  const stabilization = routingPipeline.arbitration;

  const estateRoomHowTo = matchEstateRoomHowToGuide(userText);
  if (estateRoomHowTo) {
    return finish({
      category: "estate_concierge",
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: "Estate How to Use guide",
      localReply: estateRoomHowTo.shariReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      immediateEstateHowToGuideOpen: estateRoomHowTo.guideId,
    });
  }

  if (isConversationStabilizationEnabled() && routingPipeline.fastPath) {
    return finish(
      tryConversationStabilizationFlow(
        input,
        routing,
        routingPipeline.fastPath,
      ),
    );
  }

  const visualBeginnerBeforeEstate = tryVisualBeginnerChoiceFlow(input, routing);
  if (visualBeginnerBeforeEstate) {
    return finish(visualBeginnerBeforeEstate);
  }

  const visualStructureBeforeEstate = tryVisualStructureEarlyFlow(input, routing);
  if (visualStructureBeforeEstate) {
    return finish(visualStructureBeforeEstate);
  }

  const visualRecommendationBeforeEstate = tryVisualRecommendationFlow(
    input,
    routing,
  );
  if (visualRecommendationBeforeEstate) {
    return finish(visualRecommendationBeforeEstate);
  }

  if (EMOTIONAL_REGULATION_RE.test(userText) &&
    !PRODUCTIVITY_FRAMING_RE.test(userText)
  ) {
    return finish(buildEmotionalRegulationDecision(userText, currentTurn));
  }

  if (isEstateIntelligenceRuntimeEnabled()) {
    const estateRuntime = executeEstateIntelligence({
      pipeline: routingPipeline,
      userText,
      lastAssistantText: input.lastAssistantText,
      currentTurn: input.currentTurn,
      activeWorkflow: input.activeWorkflow,
      workspace: input.workspace ?? undefined,
      helpContext: buildHelpDiscoveryContext(input),
      routing,
    });
    if (estateRuntime) {
      updateCompanionContextFromEstateRuntime(
        estateRuntime,
        userText,
        currentTurn,
      );
      return finish(
        mapEstateIntelligenceRuntimeToFrictionless(
          estateRuntime,
          input,
          routing,
        ),
      );
    }
  }

  if (stabilization?.sessionLocked && !routingPipeline.fastPath) {
    return finish({
      ...none,
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: companionSessionContinueHint(stabilization.activeSession),
      intentRouting: routing,
    });
  }

  const visualStructureFlow = tryVisualStructureEarlyFlow(input, routing);
  if (visualStructureFlow) {
    return finish(visualStructureFlow);
  }

  const musicGuidance = tryMusicCreationGuidance(userText, routing);
  if (musicGuidance) {
    return finish(musicGuidance);
  }

  if (input.primaryTurn?.blockSecondaryResponders) {
    const owned = resolveFrictionlessForPrimaryTurn(input, routing);
    return finish(
      finalizeFrictionlessDecision(
        owned ?? { ...none, intentRouting: routing },
        input.primaryTurn,
      ),
    );
  }

  const audioWithNavigation =
    /\b(?:take me to|go to|bring me to|open|show me)\b/i.test(userText) &&
    /\b(music|audio|playlist|soundscape|songs?|tunes|beats)\b/i.test(userText);
  if (audioWithNavigation) {
    const audioDecision = buildAudioPending(userText, currentTurn);
    if (audioDecision) return audioDecision;
  }

  if (
    messageNamesExactEstateRoom(userText) &&
    !isEstateGuideQuestion(userText) &&
    !isRegistryArtifactExecution(userText) &&
    !isMomentumForwardIntent(userText) &&
    !isProjectCreationIntent(userText)
  ) {
    return none;
  }

  if (isDifficultClientCallRequest(userText)) {
    return buildDifficultClientCallDecision(userText, currentTurn, routing);
  }

  const emailAutomationReply = buildEmailAutomationHelpReply(userText);
  if (emailAutomationReply) {
    return {
      category: "none",
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "EMAIL_AUTOMATION_HELP: Stay in conversation — never Create write-email or room menus.",
      localReply: emailAutomationReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  const emotionalCanonFlow = tryEmotionalCanonFlow(input, routing, sparkRuntime);
  if (emotionalCanonFlow) return emotionalCanonFlow;

  const sheetTypeEarly = detectSheetIntent(userText);
  if (sheetTypeEarly && !shouldExcludeSheetOffer(userText)) {
    return buildGoogleSheetsIntakeDecision(sheetTypeEarly, userText, currentTurn);
  }

  if (!routing.learnFastPath && isSimpleCreateRequest(userText)) {
    logCreateFastPath({
      turn: currentTurn,
      userText,
      documentType: detectUniversalDocumentType(userText),
    });
    const createFastPath = tryUniversalCreationFlow(input, routing);
    if (createFastPath) return createFastPath;
    return buildCreateFastPathRecoveryDecision(input, routing);
  }

  const impliedNeedFlow = tryImpliedNeedFlow(input, routing, stabilization);
  if (impliedNeedFlow) {
    return attachSparkRuntime(impliedNeedFlow, sparkRuntime);
  }

  const helpDiscoveryFlow = tryEstateHelpDiscoveryFlow(
    userText,
    routing,
    input,
    stabilization,
  );
  if (helpDiscoveryFlow) {
    return attachSparkRuntime(helpDiscoveryFlow, sparkRuntime);
  }

  const recommendationInvitation = tryEstateRecommendationInvitation(
    userText,
    routing,
    input.currentRoom ?? undefined,
    stabilization,
  );
  if (recommendationInvitation) {
    return attachSparkRuntime(recommendationInvitation, sparkRuntime);
  }

  const estateRestorationFlow = tryEstateRestorationFlow(input, routing);
  if (estateRestorationFlow) return estateRestorationFlow;

  const estateGuideFlow = tryEstateGuideFlow(input, routing);
  if (estateGuideFlow) return estateGuideFlow;

  const visualRecommendationFlow = tryVisualRecommendationFlow(input, routing);
  if (visualRecommendationFlow) return visualRecommendationFlow;

  const universalCreationFlow = tryUniversalCreationFlow(input, routing);
  if (universalCreationFlow) return universalCreationFlow;

  const discoveryFlow = tryDiscoveryFlow(input, routing);
  if (discoveryFlow) return discoveryFlow;

  const frictionFirstFlow = tryFrictionFirstFlow(input, routing, sparkRuntime);
  if (frictionFirstFlow) return frictionFirstFlow;

  if (
    isDecisionCompassOfferSignal(userText) ||
    (/\bhelp me decide\b/i.test(userText) && routing.category === "decide")
  ) {
    return finish(
      buildDecisionSupportDecision(routing, currentTurn, userText),
    );
  }

  const coachingFlow = tryEstateCoachingFlow(input, routing);
  if (coachingFlow) return coachingFlow;

  if (!sparkRuntime.suppressDiscoveryAutoRoute) {
    const immediateExperience = tryImmediateEstateExperienceAction(
      userText,
      currentTurn,
      routing,
    );
    if (immediateExperience) return immediateExperience;

    const estateConciergeFlow = tryEstateConciergeFlow(input, routing);
    if (estateConciergeFlow) return estateConciergeFlow;

    const navigationIntelligence = tryEstateNavigationIntelligence(
      userText,
      routing,
    );
    if (navigationIntelligence) return navigationIntelligence;

    const navigationPhilosophy = tryEstateNavigationPhilosophy(userText, routing);
    if (navigationPhilosophy) return navigationPhilosophy;
  }

  if (routing.learnFastPath || shouldSuppressVisualThinkingForLearn(userText)) {
    clearVisualRecommendationPending();
    return {
      ...none,
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "LEARN FAST PATH (P0.20.1): Answer the concept directly — no Visual Thinking open.",
      intentRouting: routing,
    };
  }

  const welcomeOffer = welcomeRoomWorkspaceOffer(userText);
  if (welcomeOffer) {
    return {
      category: "direct_action",
      suppressRelationship: false,
      suppressRecap: false,
      suppressReflectionFirst: false,
      responseHint:
        "WELCOME ROOM: Offer the Welcome Room invitation — never force navigation or read an About page.",
      localReply: welcomeOffer.line,
      pendingAction: frictionlessPendingFromWorkspaceOffer(welcomeOffer, currentTurn, {
        userText,
      }),
      toolSuggestion: null,
      workspaceOffer: welcomeOffer,
      intentRouting: routing,
    };
  }

  const visualStructureLate = tryVisualStructureEarlyFlow(input, routing);
  if (visualStructureLate) return visualStructureLate;

  const sheetType = detectSheetIntent(userText);
  if (sheetType && !shouldExcludeSheetOffer(userText)) {
    return buildGoogleSheetsIntakeDecision(sheetType, userText, currentTurn);
  }

  const reminderDecision = buildReminderDecision(userText, currentTurn, input);
  if (reminderDecision) return reminderDecision;

  if (isOverwhelmProblem(userText)) {
    const overwhelm = buildOverwhelmFrictionlessDecision(
      userText,
      currentTurn,
      routing,
    );
    if (overwhelm) return overwhelm;
    return buildSimpleOverwhelmOrganizeDecision(userText, currentTurn, routing);
  }

  if (/\bkeep procrastinat/i.test(userText)) {
    return buildFocusSupportDecision(currentTurn);
  }

  const strategyDecision = buildStrategyFrictionlessDecision(
    userText,
    currentTurn,
    routing,
  );
  if (strategyDecision) return strategyDecision;

  if (isMotivationProblem(userText) && !isSelfUnderstandingIntent(userText)) {
    return buildEmotionalRegulationDecision(userText, currentTurn);
  }

  if (
    EMOTIONAL_REGULATION_RE.test(userText) &&
    !PRODUCTIVITY_FRAMING_RE.test(userText)
  ) {
    return buildEmotionalRegulationDecision(userText, currentTurn);
  }

  if (isAdhdEmotionalFrictionTurn(userText)) {
    if (isFrictionFirstTurn(userText)) {
      return buildFrictionFirstDecision(userText, currentTurn);
    }
    return buildAdhdEmotionalFrictionDecision(userText, currentTurn);
  }

  const audio = buildAudioPending(userText, currentTurn);
  if (audio) return audio;

  if (FOCUS_SUPPORT_RE.test(userText) && !/\boverwhelm/i.test(userText)) {
    if (isFrictionFirstTurn(userText)) {
      return buildFrictionFirstDecision(userText, currentTurn);
    }
    const menu = resolveEstateCoachingMenu(userText);
    if (menu) return buildEstateCoachingDecision(menu, routing);
    return buildFocusSupportDecision(currentTurn);
  }

  if (routing.learnFastPath) {
    clearVisualRecommendationPending();
    return {
      ...none,
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "LEARN FAST PATH (P0.10): Answer the concept directly — no relationship layer.",
      intentRouting: routing,
    };
  }

  const visualRecommendationLate = tryVisualRecommendationFlow(input, routing);
  if (visualRecommendationLate) return visualRecommendationLate;

  return finish({
    ...none,
    suppressRelationship:
      none.suppressRelationship || routing.suppressRelationshipIntelligence,
    suppressReflectionFirst:
      none.suppressReflectionFirst || routing.suppressReflectionFirst,
    suppressRecap: none.suppressRecap || routing.suppressConversationSummary,
    intentRouting: routing,
  });
}

/**
 * CREATE fast path — Universal Creation owns the turn; never fall through to estate routing.
 */
export function resolveCreateFastPathAction(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  if (!isSimpleCreateRequest(userText) && !loadUniversalCreationSession()) {
    return null;
  }
  logCreateFastPath({
    turn: input.currentTurn,
    userText,
    documentType: detectUniversalDocumentType(userText),
  });
  const universal = tryUniversalCreationFlow(input, routing);
  if (universal?.localReply) return universal;
  if (!isSimpleCreateRequest(userText)) {
    clearUniversalCreationSession();
    return null;
  }
  return buildCreateFastPathRecoveryDecision(input, routing);
}

export function resolveFrictionlessAction(
  input: FrictionlessActionInput,
): FrictionlessActionDecision {
  const userText = input.userText.trim();
  if (!userText) return resolveFrictionlessActionImpl(input);
  return resolveFrictionlessActionImpl({
    ...input,
    sparkRuntime: input.sparkRuntime ?? resolveSparkRuntime(input),
  });
}

export function shouldSuppressRelationshipForFrictionless(
  decision: FrictionlessActionDecision,
): boolean {
  return decision.suppressRelationship;
}

export function frictionlessHintForChat(
  decision: FrictionlessActionDecision,
): string | null {
  if (!decision.responseHint) return null;
  const lines = [
    "FRICTIONLESS ACTION LAYER (P0.9 — before relationship reflection):",
    decision.responseHint,
    "FORBIDDEN: I've noticed…, behavioral analysis, recap, Did I get that right?",
  ];
  if (decision.category === "emotional_regulation") {
    lines.push("No productivity or business framing.");
  }
  if (decision.category === "adhd_emotional_friction") {
    lines.push(
      "Acknowledge first. One question only. No task planning or tools until they answer.",
    );
  }
  if (decision.category === "friction_first") {
    lines.push(
      "FRICTION FIRST: Diagnose barrier before tools or Estate navigation. One barrier → one next step.",
      "Never: Try harder, discipline, Stay focused. Welcome back without guilt if attention wandered.",
    );
  }
  if (decision.category === "focus_support") {
    lines.push("Ask what needs attention OR offer Focus Mode / Focus Audio.");
  }
  if (decision.category === "estate_coaching") {
    lines.push(
      "Coach before navigate. Human prescriptions only — never feature names or 'I'm taking you to…'.",
    );
  }
  if (decision.category === "estate_discovery") {
    lines.push(
      "DISCOVERY MODE: One thoughtful question at a time. Never a form. Stop when confidence ≥ 90%.",
    );
  }
  if (decision.category === "estate_concierge") {
    lines.push(
      "ESTATE CONCIERGE: Registry-informed recommendations only. Max 4 numbered choices. Never overwhelm.",
    );
  }
  const continuity = conversationStateHint();
  if (continuity) lines.push(continuity);
  if (decision.category === "google_sheet") {
    lines.push(
      "One question at a time for sheet intake. Offer Google Sheet creation when ready.",
    );
  }
  if (decision.category === "reminder") {
    lines.push("Short confirmation only. No relationship layer or tool offers.");
  }
  return lines.join("\n");
}

const RESTORATION_OFFER_IN_ASSISTANT_RE =
  /\b(?:clear my mind|clear your mind|brain dump|breathe|decision compass|plan my day|focus audio|focus music|my thoughts)\b/i;

const CREATE_TOPIC_IN_ASSISTANT_RE =
  /\b(?:create|draft|write|build|newsletter|email|sop|proposal|funnel|workshop|sales funnel)\b/i;

export function isFrictionlessPendingAlignedWithAssistant(
  pending: FrictionlessPendingAction,
  lastAssistantText: string,
  currentTurn: number,
): boolean {
  if (isFrictionlessPendingExpired(pending, currentTurn)) return false;

  const assistant = lastAssistantText.trim();
  if (!assistant) return false;

  if (pending.type === "strategy_offer") {
    return isStrategyIntelligenceOfferMessage(assistant);
  }

  if (
    pending.type === "visual_recommendation" ||
    pending.type === "visual_thinking_menu"
  ) {
    return isVisualThinkingMenuOfferMessage(assistant);
  }

  if (pending.type === "create_google_sheet") {
    return /\b(?:google sheet|spreadsheet|create (?:the |your |a )?sheet)\b/i.test(
      assistant,
    );
  }

  if (pending.target === "content-generator") {
    if (
      RESTORATION_OFFER_IN_ASSISTANT_RE.test(assistant) &&
      !CREATE_TOPIC_IN_ASSISTANT_RE.test(assistant)
    ) {
      return false;
    }
    const assistantTopic = inferMeaningTopicFromAssistant(assistant);
    const pendingTopic = inferMeaningTopicFromFrictionlessPending(pending);
    if (assistantTopic === "create" && pendingTopic === "create") {
      return true;
    }
    return (
      /\b(?:\bcreate\b|take (?:us|you|me) there|step into|would you like me to)\b/i.test(
        assistant,
      ) ||
      /\b(?:open create|create workspace|draft (?:a|an|the)|would you like (?:me )?to (?:create|draft|open))\b/i.test(
        assistant,
      ) ||
      isEstateTransitionOfferMessage(assistant) ||
      Boolean(
        pending.artifactType &&
          assistant.toLowerCase().includes(pending.artifactType.toLowerCase()),
      )
    );
  }

  if (pending.target === "brain-dump") {
    return /\bclear my mind\b/i.test(assistant);
  }

  if (pending.target === "plan-my-day") {
    return /\bplan my day\b/i.test(assistant);
  }

  if (pending.target === "decision-compass") {
    return /\bdecision compass\b/i.test(assistant);
  }

  if (pending.target === "focus-audio") {
    return /\bfocus audio\b/i.test(assistant);
  }

  if (pending.target === "breathe") {
    return /\bbreathe\b/i.test(assistant);
  }

  if (pending.target === "playbook") {
    return (
      /\bstrateg(?:y|ies)\b/i.test(assistant) &&
      /\b(?:would you like|open)\b/i.test(assistant)
    );
  }

  if (pending.target === "visual-focus") {
    return (
      /\bvisual thinking\b/i.test(assistant) ||
      /\b(?:mind map|decision tree|flowchart|diagram)\b/i.test(assistant)
    );
  }

  const summary = pending.offerSummary?.trim();
  if (summary && summary.length >= 8) {
    const fragment = summary.slice(0, 28).toLowerCase();
    if (assistant.toLowerCase().includes(fragment)) return true;
  }

  return pending.offeredAtTurn >= currentTurn - 1;
}

export function resolveFrictionlessContinuation(
  userText: string,
  pending: FrictionlessPendingAction,
  currentTurn: number,
  lastAssistantText?: string,
): { execute: boolean; ack: string } | null {
  if (
    !isFrictionlessAffirmation(userText) &&
    !isConfirmationAcceptance(userText)
  ) {
    return null;
  }
  if (isFrictionlessPendingExpired(pending, currentTurn)) return null;
  if (
    lastAssistantText &&
    !isFrictionlessPendingAlignedWithAssistant(
      pending,
      lastAssistantText,
      currentTurn,
    )
  ) {
    return null;
  }
  if (pending.target === "content-generator") {
    logCreatePendingAction("accepted pending action", {
      target: pending.target,
      artifactType: pending.artifactType,
      initialPrompt: pending.initialPrompt,
    });
  }
  if (pending.type === "create_google_sheet") {
    return { execute: true, ack: frictionlessPendingAck(pending) };
  }
  return { execute: true, ack: frictionlessPendingAck(pending) };
}

export function resetFrictionlessPendingForTests(): void {
  clearFrictionlessPending();
}
