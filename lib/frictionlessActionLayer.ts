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

import { detectAudioRequest } from "./audioSuggestions";
import { isConfirmationAcceptance } from "./conversationConfirmationGate";
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
  clearUniversalCreationSession,
  detectUniversalDocumentType,
  formatUniversalCreationQuestion,
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
import {
  estateGuideHint,
  formatEstateGuideReply,
  isEstateGuideQuestion,
  isEstateOrientationQuestion,
  isEstateRoomStoryQuestion,
  resolveEstateGuideTurn,
  shariKnowledgeHintForChat,
} from "./sparkKnowledge";
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
  isMotivationProblem,
  isOverwhelmProblem,
  isRelationshipQuestion,
  isStrategyProblem,
  shouldSuppressVisualRecommendation,
} from "./visualThinkingGuards";
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
import { shouldBlockVisualThinking } from "./visualThinkingOverreach";
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
  frictionlessDecisionFromPendingChoice,
  frictionlessDecisionFromUnrecognizedPendingChoice,
} from "@/lib/pendingChoice/frictionlessBridge";
import {
  hasActivePendingChoice,
  registerPendingChoiceFromConcierge,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";

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
  pendingChoiceExecution?: import("@/lib/pendingChoice/frictionlessBridge").PendingChoiceExecution;
  sparkRuntime?: SparkRuntimeAction | null;
};

const STORAGE_KEY = "companion-frictionless-pending-v1";
const PENDING_TURN_LIMIT = 3;

const FOCUS_SUPPORT_RE =
  /\b(?:need to focus|help me focus|help me concentrate|can'?t concentrate|trouble concentrating|stay focused|hard to focus|lose focus|losing focus|can'?t stay on task|stay on task)\b/i;

const EMOTIONAL_REGULATION_RE =
  /\b(?:can'?t catch (?:my )?breath|breathless|panicking|panic attack|having a panic|need to calm down|calm me down|help me calm|feel(?:ing)? anxious|i am anxious|i'?m anxious)\b/i;

const PRODUCTIVITY_FRAMING_RE =
  /\b(?:plan my day|marketing plan|launch|revenue|clients?|business|productivity|get more done|prioritize my day)\b/i;

const AFFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|do that|open it|do it|go ahead|let'?s do it|use it|let'?s use it|sounds good|that works|perfect|great|take me there)\.?$/i;

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
    return "Opening **Breathe & Reset** — follow along on screen.";
  }
  if (action.target === "content-generator") {
    const pending = loadEstatePendingTransition();
    if (pending?.originalUserIntent) {
      return buildEstateArrivalContinuation(pending);
    }
    return "Let's head to Create.";
  }
  if (action.target === "decision-compass") {
    return "We're in the Decision Compass™ now — let's talk this through calmly.";
  }
  if (action.target === "visual-focus") {
    const title = action.viewTitle?.trim();
    return title
      ? `Opening **${title}** in Visual Thinking.`
      : "Opening Visual Thinking.";
  }
  if (
    (action.type === "visual_thinking_menu" ||
      action.type === "visual_recommendation") &&
    action.viewTitle
  ) {
    return `Opening **${action.viewTitle}** in Visual Thinking.`;
  }
  if (action.target === "brain-dump") {
    return "We're in Clear My Mind™ together — what's crowding your head most right now?";
  }
  if (action.target === "plan-my-day") {
    return "Let's shape today together in Momentum Builder™.";
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
          ? "Breathe & Reset"
          : "Open tool",
    toolObjectId: tool === "focus-audio" ? "focus-audio" : "breathing",
    keepTalkingLabel: "Keep Talking",
    action: { type: "tool", tool },
  };
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
): FrictionlessActionDecision | null {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  if (!userText) return null;

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
      if (isSimpleCreateRequest(input.userText.trim())) {
        logCreateFastPath({
          turn: input.currentTurn,
          userText: input.userText.trim(),
          documentType: detectUniversalDocumentType(input.userText.trim()),
        });
        const universal = tryUniversalCreationFlow(input, routing);
        if (universal) return universal;
        return buildCreateFastPathRecoveryDecision(input, routing);
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

  const result = resolvePendingChoiceTurn(input.userText.trim());
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
  if (isEstateGuideQuestion(userText)) return null;
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
  if (!userText || !isEstateGuideQuestion(userText)) return null;
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
      pendingAction: null,
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
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
      universalCreationSession: turn.session,
    };
  }

  clearUniversalCreationSession();
  const combined = `${turn.session.originalUserText} ${Object.values(turn.session.answers).join(" ")}`;
  const createOpen = resolveImmediateCreateAction(
    combined,
    routing.artifactKind,
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
      "Let's choose one focus thread. What needs your attention most right now?\n\nIf it helps, we can also use **Focus Mode** or **Focus Audio** — want either of those?",
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
  return {
    category: "emotional_regulation",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: false,
    responseHint:
      "SHARI COMPANION ENGINE — emotion before instruction. Reflect + normalize before tools. No productivity framing on the first beat.",
    localReply: `${opening}\n\nWould you like calming audio, a breathing reset, or to stay here with me?`,
    pendingAction: {
      type: "open_tool",
      target: "focus-audio",
      context: "calming support",
      focusAudioCategory: "calm-brain",
      offeredAtTurn: currentTurn,
      offerSummary: "Focus Audio — calming support",
    },
    toolSuggestion: {
      kind: "breathe",
      line: "Would calming audio or a breathing reset help?",
      toolLabel: "Open Focus Audio",
      toolObjectId: "focus-audio",
      keepTalkingLabel: "Stay here with me",
      action: { type: "tool", tool: "focus-audio" },
    },
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
): FrictionlessActionDecision {
  return {
    category: "decision_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "DECISION SUPPORT (P0.9): Offer Decision Compass or one clarifying question. No relationship lead paragraph.",
    localReply: null,
    pendingAction: routing.workspaceOffer
      ? {
          type: "open_tool",
          target: "decision-compass",
          context: "decision support",
          offeredAtTurn: currentTurn,
          offerSummary: "Decision Compass",
        }
      : null,
    toolSuggestion: null,
    workspaceOffer: routing.workspaceOffer,
    intentRouting: routing,
  };
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
  const offer = {
    section: "brain-dump" as const,
    buttonLabel: "Clear My Mind",
    line: "That sounds worth capturing while it's fresh. Would you like to step into Clear My Mind™ together?",
  };
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "OVERWHELM (P0.20.3): Route to Clear My Mind — never Visual Thinking.",
    localReply: offer.line,
    pendingAction: frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
      userText,
    }),
    toolSuggestion: null,
    workspaceOffer: offer,
    intentRouting: routing,
  };
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
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: `ESTATE NAVIGATION (medium confidence): ${ESTATE_NAVIGATION_GOLDEN_RULE}`,
      localReply: formatEstateNavigationChoiceMenu(disambiguation),
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
): FrictionlessActionDecision {
  if (decision.sparkRuntime) return decision;
  return attachSparkRuntime(decision, runtime);
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

  const routing = resolveIntentRouting({
    userText,
    workspace: input.workspace,
    emotionalState: input.emotionalState,
    overwhelmed: input.overwhelmed,
  });

  const pendingChoiceFlow = tryPendingChoiceFlow(input, routing);
  if (pendingChoiceFlow) {
    return finishFrictionlessDecision(pendingChoiceFlow, sparkRuntime);
  }

  const musicGuidance = tryMusicCreationGuidance(userText, routing);
  if (musicGuidance) {
    return finishFrictionlessDecision(musicGuidance, sparkRuntime);
  }

  if (input.primaryTurn?.blockSecondaryResponders) {
    const owned = resolveFrictionlessForPrimaryTurn(input, routing);
    return finishFrictionlessDecision(
      finalizeFrictionlessDecision(
        owned ?? { ...none, intentRouting: routing },
        input.primaryTurn,
      ),
      sparkRuntime,
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

  const emotionalCanonFlow = tryEmotionalCanonFlow(input, routing, sparkRuntime);
  if (emotionalCanonFlow) return emotionalCanonFlow;

  if (isSimpleCreateRequest(userText)) {
    logCreateFastPath({
      turn: currentTurn,
      userText,
      documentType: detectUniversalDocumentType(userText),
    });
    const createFastPath = tryUniversalCreationFlow(input, routing);
    if (createFastPath) return createFastPath;
    return buildCreateFastPathRecoveryDecision(input, routing);
  }

  const impliedNeedFlow = tryImpliedNeedFlow(input, routing);
  if (impliedNeedFlow) {
    return attachSparkRuntime(impliedNeedFlow, sparkRuntime);
  }

  const estateRestorationFlow = tryEstateRestorationFlow(input, routing);
  if (estateRestorationFlow) return estateRestorationFlow;

  const estateGuideFlow = tryEstateGuideFlow(input, routing);
  if (estateGuideFlow) return estateGuideFlow;

  const universalCreationFlow = tryUniversalCreationFlow(input, routing);
  if (universalCreationFlow) return universalCreationFlow;

  const discoveryFlow = tryDiscoveryFlow(input, routing);
  if (discoveryFlow) return discoveryFlow;

  const frictionFirstFlow = tryFrictionFirstFlow(input, routing, sparkRuntime);
  if (frictionFirstFlow) return frictionFirstFlow;

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

  if (
    isDecisionCompassOfferSignal(userText) ||
    /\bhelp me decide\b/i.test(userText)
  ) {
    return buildDecisionSupportDecision(routing, currentTurn);
  }

  if (
    !shouldRouteBusinessStrategyToCreate(userText) &&
    routing.category !== "learn" &&
    !routing.learnFastPath &&
    !shouldSuppressVisualRecommendation(userText) &&
    shouldOfferVisualRecommendation(userText)
  ) {
    return buildVisualRecommendationDecision(
      userText,
      currentTurn,
      routing,
      input.lastAssistantText,
    );
  }

  return {
    ...none,
    suppressRelationship:
      none.suppressRelationship || routing.suppressRelationshipIntelligence,
    suppressReflectionFirst:
      none.suppressReflectionFirst || routing.suppressReflectionFirst,
    suppressRecap: none.suppressRecap || routing.suppressConversationSummary,
    intentRouting: routing,
  };
}

/**
 * CREATE fast path — Universal Creation owns the turn; never fall through to estate routing.
 */
export function resolveCreateFastPathAction(
  input: FrictionlessActionInput,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  const userText = input.userText.trim();
  logCreateFastPath({
    turn: input.currentTurn,
    userText,
    documentType: detectUniversalDocumentType(userText),
  });
  const universal = tryUniversalCreationFlow(input, routing);
  if (universal?.localReply) return universal;
  return buildCreateFastPathRecoveryDecision(input, routing);
}

export function resolveFrictionlessAction(
  input: FrictionlessActionInput,
): FrictionlessActionDecision {
  const userText = input.userText.trim();
  if (!userText) return resolveFrictionlessActionImpl(input);
  const runtime = input.sparkRuntime ?? resolveSparkRuntime(input);
  return finishFrictionlessDecision(
    resolveFrictionlessActionImpl({ ...input, sparkRuntime: runtime }),
    runtime,
  );
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
