"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/companion/BackButton";
import { AppSidebar } from "@/components/companion/AppSidebar";
import { CompanionSidebarPortal } from "@/components/companion/CompanionSidebarPortal";
import { CompanionUrlNavigation } from "@/components/companion/CompanionUrlNavigation";
import { AdjustMyDayPanel } from "@/components/companion/AdjustMyDayPanel";
import { BrainDumpPanel } from "@/components/companion/BrainDumpPanel";
import { DecisionCompassWorkspace } from "@/components/companion/DecisionCompassWorkspace";
import { BreathePanel } from "@/components/companion/BreathePanel";
import { StrategiesPanel } from "@/components/companion/StrategiesPanel";
import { ChatInputBar } from "@/components/companion/ChatInputBar";
import { CompanionBackground } from "@/components/companion/CompanionBackground";
import {
  ActiveWorkspaceBar,
  focusTimerWorkspaceItem,
  type ActiveWorkspaceItem,
} from "@/components/companion/ActiveWorkspaceBar";
import { FocusAreaPanel } from "@/components/companion/FocusAreaPanel";
import {
  CompanionActivitiesPanel,
  EMPTY_ACTIVITY_SESSION,
  type ActivitySessionState,
} from "@/components/companion/CompanionActivitiesPanel";
import { CrossWorkspaceSuggestionCard } from "@/components/companion/CrossWorkspaceSuggestionCard";
import { SpinWheelPanel } from "@/components/companion/SpinWheelPanel";
import { GamesPanel } from "@/components/companion/GamesPanel";
import { FocusAudioPanel } from "@/components/companion/FocusAudioPanel";
import { FocusTimerPanel } from "@/components/companion/FocusTimerPanel";
import { IdentityBar } from "@/components/companion/IdentityBar";
import { SimpleHomeWelcome } from "@/components/companion/SimpleHomeWelcome";
import { StressReliefOptionsCard } from "@/components/companion/StressReliefOptionsCard";
import { TodayPanel } from "@/components/companion/TodayPanel";
const PlanMyDayPanel = dynamic(
  () =>
    import("@/components/companion/PlanMyDayPanel").then((mod) => ({
      default: mod.PlanMyDayPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[12rem] items-center justify-center p-6 text-sm text-[#6b635a]">
        Loading Plan My Day…
      </div>
    ),
  },
);
const VisualFocusWorkspacePanel = dynamic(
  () =>
    import("@/components/companion/VisualFocusWorkspacePanel").then((mod) => ({
      default: mod.VisualFocusWorkspacePanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[12rem] items-center justify-center p-6 text-sm text-[#6b635a]">
        Loading Visual Focus…
      </div>
    ),
  },
);
import { PlanMyDayQuickDrawer } from "@/components/companion/PlanMyDayQuickDrawer";
import { WinsThisWeekPanel } from "@/components/companion/WinsThisWeekPanel";
import { EvidenceBankPanel } from "@/components/companion/EvidenceBankPanel";
import { GrowthCenterPanel } from "@/components/companion/GrowthCenterPanel";
import { ConfidenceVaultPanel } from "@/components/companion/ConfidenceVaultPanel";
import { MyJourneyPanel } from "@/components/companion/MyJourneyPanel";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import { findLatestHomeResumeItem } from "@/lib/homeResumeItem";
import { activityReturnLabel as resolveActivityReturnLabel } from "@/lib/activityReturnLabel";
import {
  BEGIN_NEW_DAY_GREETING,
  type FreshStartKind,
  freshStartCopy,
} from "@/lib/freshStartCopy";
import { clearDailySessionFlags } from "@/lib/freshStartSession";
import { resetTodayPlanForNewDay, resetPlanDayView } from "@/lib/planMyDay/planDayItems";
import {
  dismissPlanMyDayForSession,
  dismissTodayResume,
  TODAY_PLAN_LATER_MESSAGE,
  TODAY_RESUME_LATER_MESSAGE,
} from "@/lib/todayPanelDismiss";
import type { StartupOpenTarget } from "@/lib/startupFriction";
import { discoveryContextForChat } from "@/lib/companionDiscovery";
import { useVisualMode } from "@/lib/useVisualMode";
import { useClientMounted } from "@/lib/useClientMounted";
import { resolveAdaptiveVisualContext } from "@/lib/adaptiveVisualContext";
import { HowDoIPanel } from "@/components/companion/HowDoIPanel";
import type { EcosystemSearchResult } from "@/lib/howDoIHelpLibrary";
import type { ProfileSettingsSection } from "@/components/companion/ProfilePanel";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { RecognitionMomentCard } from "@/components/companion/RecognitionMomentCard";
import { ActivationOfferCard } from "@/components/companion/ActivationOfferCard";
import { RelationshipRememberCard } from "@/components/companion/RelationshipRememberCard";
import { OpportunityOfferCard } from "@/components/companion/OpportunityOfferCard";
import { DecisionOfferCard } from "@/components/companion/DecisionOfferCard";
import { DecisionCompassOfferCard } from "@/components/companion/DecisionCompassOfferCard";
import { BusinessConfidenceOfferCard } from "@/components/companion/BusinessConfidenceOfferCard";
import { EnvironmentOfferCard } from "@/components/companion/EnvironmentOfferCard";
import { FutureShariOfferCard } from "@/components/companion/FutureShariOfferCard";
import { MomentumOfferCard } from "@/components/companion/MomentumOfferCard";
import { BusinessOSSortCard } from "@/components/companion/BusinessOSSortCard";
import { ChiefOfStaffOfferCard } from "@/components/companion/ChiefOfStaffOfferCard";
import { PredictiveSupportOfferCard } from "@/components/companion/PredictiveSupportOfferCard";
import { DayPlanCard } from "@/components/companion/DayPlanCard";
import { DayDesignerPromptCard } from "@/components/companion/DayDesignerPromptCard";
import { ProfilePanel } from "@/components/companion/ProfilePanel";
import { ModalSheet } from "@/components/companion/ModalSheet";
import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { CompanionSignInFromQuery } from "@/components/companion/CompanionSignInFromQuery";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { EmailGeneratorPanel } from "@/components/companion/EmailGeneratorPanel";
import { SnippetsLibrary } from "@/components/companion/SnippetsLibrary";
import { BusinessProfilePanel } from "@/components/companion/BusinessProfilePanel";
import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { ContentTypesPanel } from "@/components/companion/ContentTypesPanel";
import {
  ContentGeneratorPanel,
  type GenSeed,
} from "@/components/companion/ContentGeneratorPanel";
import { ProjectsPanel } from "@/components/companion/ProjectsPanel";
import { SettingsPanel } from "@/components/companion/SettingsPanel";
import { TemplatesLibrary } from "@/components/companion/TemplatesLibrary";
import { SavedWorkLibrary } from "@/components/companion/SavedWorkLibrary";
import { MyWorkHubPanel } from "@/components/companion/MyWorkHubPanel";
import { GoogleWorkspacePanel } from "@/components/companion/GoogleWorkspacePanel";
import {
  formatGoogleWorkspaceEditHint,
  googleWorkspaceTitle,
  type GoogleFileKind,
  type GoogleWorkspaceSession,
} from "@/lib/googleWorkspace";
import {
  documentCreationOpenAck,
  documentTypeConfirmationMessage,
  extractDocumentTopic,
  inferDocumentTypeFromRequest,
  isDocumentCreationRequest,
  itemTypeForCollaborativeKind,
  needsDocumentTypeConfirmation,
  parseDocumentTypeChoice,
  titleForCollaborativeDocument,
} from "@/lib/collaborativeDocumentWorkflow";
import { collaborativeScaffoldForType } from "@/lib/createInitialization";
import {
  findDocumentsForRecovery,
  formatDocumentRecoveryReply,
  isDocumentRecoveryRequest,
  upsertDocumentMetadata,
} from "@/lib/documentMetadataStore";
import { recordProjectConversationIfOpen } from "@/lib/projectConversations";
import { TimeBlockPanel } from "@/components/companion/TimeBlockPanel";
import { TimeBlockTrigger } from "@/components/companion/TimeBlockTrigger";
import { TopBar } from "@/components/companion/TopBar";
import { FreshStartConfirmDialog } from "@/components/companion/FreshStartConfirmDialog";
import { SimpleChat } from "@/components/companion/SimpleChat";
import { ToolSuggestionCard } from "@/components/companion/ToolSuggestionCard";
import { PendingActionBar } from "@/components/companion/PendingActionBar";
import { ArtifactActionBar } from "@/components/companion/ArtifactActionBar";
import { ActionBridgeChip } from "@/components/companion/ActionBridgeChip";
import { WorkspaceLayout } from "@/components/companion/WorkspaceLayout";
import {
  SplitWorkspaceAreaPanel,
  SplitWorkspaceBesideEmptyState,
} from "@/components/companion/SplitWorkspacePanelState";
import { WorkspaceShell } from "@/components/companion/WorkspaceShell";
import {
  type ChatLayoutMode,
  shouldOpenBesideChat,
} from "@/lib/workspaceNav";
import {
  DEFAULT_CHAT_LAYOUT_MODE,
  saveWorkspaceChatLayoutPreference,
} from "@/lib/workspaceChatPreference";
import { WORKSPACE_FULL_PAGE_SURFACE_CLASS } from "@/lib/workspaceLayoutTokens";
import {
  loadWorkspaceViewSizePreference,
  resolveEffectiveViewSize,
  saveWorkspaceViewSizePreference,
  type WorkspaceViewSizePreset,
} from "@/lib/workspaceViewSize";
import type { FocusHubAction } from "@/lib/focusHub";
import {
  saveBrainDumpVisualView,
  saveBrainDumpVisualVisible,
} from "@/lib/brainDumpVisualPreference";
import {
  applyCreateBuilderChatOpener,
  filterChatLines,
  createBuilderLabel,
  bootstrapCreateBuilderSession,
  bootstrapCreateBuilderFromWorkflow,
  panelWorkflowForBuilderSync,
  panelWorkflowHasProgress,
  createBuilderActionsForPhase,
  createBuilderExportMessage,
  formatCreateBuilderChatHint,
  markCreateBuilderGenerated,
  shouldSuppressParallelCoaching,
  type CreateBuilderAction,
  type CreateBuilderSession,
} from "@/lib/createBuilderChat";
import {
  bootstrapWorkspaceV2Session,
  bootstrapCreateWorkspaceV2FromWorkflow,
  CREATE_WORKSPACE_V2,
  formatCreateWorkspaceV2ChatHint,
  isCreateWorkspaceV2Phase,
  setWorkspaceV2ActiveSection,
  shouldUseCreateBuilderChatTurns,
} from "@/lib/createWorkspaceV2";
import {
  isUnresolvedCreateType,
  userFacingCreateTypeLabel,
} from "@/lib/createTypePickers";
import {
  builderSessionFromRecord,
  buildBriefFromRecord,
  mergeRecordFromWorkflow,
  processCreateBuilderTurnWithRecord,
  recordAfterDraftBuild,
  workflowRecordFromState,
  workflowStateFromRecord,
  shouldPersistWorkflowRecord,
  type CreateWorkflowRecord,
} from "@/lib/createWorkflowRecord";
import {
  clearAllCreatePersistence,
  createSessionFromWorkflowRecord,
  isCreatePersistencePaused,
  loadWorkflowRecordForExplicitResume,
  pauseCreatePersistence,
  resumeCreatePersistence,
} from "@/lib/createPersistence";
import {
  deleteCreateDraftEntry,
  getCreateDraftEntry,
  upsertCreateDraftEntry,
} from "@/lib/createDraftLibrary";
import { createNavigationHistoryStack } from "@/lib/navigationHistory";
import {
  loadWorkflowRecord,
  saveWorkflowRecord,
  saveWorkflowRecordForLater,
} from "@/lib/createWorkflowRecordStore";
import {
  EMPTY_CREATE_WORKFLOW,
  applyCreateDiscoveryFromChat,
  answeredDiscoveryCount,
  resolvedTypeLabel,
} from "@/lib/createWorkflow";
import { logCreateBuild } from "@/lib/createBuild";
import {
  logChatBuildDraftTriggered,
  type CreateBuildDraftHandler,
} from "@/lib/createBuildDraft";
import {
  logSharedCreateSession,
  newCreateSessionId,
} from "@/lib/createSharedSession";
import { CreateBuilderActionBar } from "@/components/companion/CreateBuilderActionBar";
import { BusinessStrategyDraftPanel } from "@/components/companion/BusinessStrategyDraftPanel";
import {
  bootstrapBusinessStrategySession,
  absorbBusinessStrategyFromUserMessage,
  businessStrategyCoachHintForChat,
  type BusinessStrategySession,
} from "@/lib/businessStrategyBuilder";
import {
  bootstrapStrategyApplySession,
  processStrategyApplyTurn,
  type StrategyApplySession,
} from "@/lib/strategyApplyCoach";
import { pickActiveProjectName } from "@/lib/strategyApplyOptions";
import {
  classifyStrategyIntent,
  parseStrategyDisambiguationChoice,
  strategyDisambiguationMessage,
} from "@/lib/strategyRouting";
import {
  resolveStrategyOpenFromChat,
  strategyOpenAck,
  type StrategyOpenTarget,
} from "@/lib/strategyOpenFromChat";
import { STRATEGIES } from "@/lib/strategySystem";
import {
  artifactLockHintForChat,
  conflictsWithLockedArtifact,
  detectArtifactExportOffer,
  filterAssistedActionForArtifact,
  lockedArtifactFromContext,
  proposalRecoveryMessage,
  shouldLockArtifactType,
  userExplicitlyChangesArtifactType,
  normalizeArtifactType,
  type ArtifactExportAction,
  type ArtifactExportOffer,
} from "@/lib/artifactType";
import { matchCatalogFromText } from "@/lib/createCatalog";
import {
  detectActionBridge,
  type ActionBridge,
} from "@/lib/companionActionBridge";
import {
  detectEmotionalState,
  detectObstacle,
  detectSomaticAvoidance,
  EMOTION_LABELS,
  type EmotionalState,
} from "@/lib/companionEmotions";
import {
  EMOTION_SHELL_CLASS,
  getStateHint,
} from "@/lib/companionStateHint";
import {
  bridgeFromResolved,
  buildCreateRouteMessage,
  intentHintForChat,
  MAKE_CONFIDENCE_THRESHOLD,
  resolveIntent,
  toGenSeed,
  type ResolvedIntent,
} from "@/lib/intentStabilizer";
import {
  classifyCompanionIntentBucket,
  informationIntentHintForChat,
} from "@/lib/companionIntentRouting";
import {
  classifyConversationalMode,
  classifyUserMessage,
  classificationHintForChat,
  conversationModeHintForChat,
  clearMyMindTrustHintForChat,
  frustrationContextHintForChat,
  isGenuineEmotionalDistress,
  shouldAutoOpenWorkspaceBeforeChat,
  shouldBlockArtifactPipeline,
  shouldDeferToolCardOnFirstDistress,
  shouldSuppressCreatePending,
  shouldSuppressEmotionalTools,
  SOMATIC_DISTRESS_RE,
} from "@/lib/messageClassification";
import { shouldBlockDraftPanelFromChat } from "@/lib/draftPermissionGate";
import {
  liveCreateWorkflowState,
  mergeChatContentIntoDraft,
  userAffirmedApplyToDraft,
} from "@/lib/liveCreateWorkspace";
import {
  collaborativeDraftFollowUp,
  inferFragmentSection,
  isPartialComponentRequest,
  mergeFragmentIntoStructuredDraft,
  resolveCollaborativeDraftTitle,
  shouldOfferCompleteDraftBuild,
  collaborativeDraftingHintForChat,
} from "@/lib/collaborativeDrafting";
import { activeCompanionsContextForAI } from "@/lib/activeCompanions";
import {
  buildParentWorkflowFromProject,
  buildParentWorkflowFromStrategy,
  enrichChildArtifactFromParent,
  isChildArtifactRequest,
  lastChildArtifactRequestInChat,
  parentWorkflowCoachHint,
  shouldSuppressCreateBuilderBootstrap,
  strategyChildArtifactFollowUp,
  type ParentWorkflowContext,
} from "@/lib/parentWorkflowContext";
import { hasCreateIntent } from "@/lib/intentStabilizer";
import {
  trackStarterChip,
  type StarterChipId,
} from "@/lib/starterChipAnalytics";
import {
  suggestSupportTool,
  toolOfferHintForChat,
  type ToolSuggestion,
} from "@/lib/companionToolSuggestions";
import {
  buildStressCauseRecommendation,
  buildStressReliefOffer,
  detectStressCauseChoice,
  detectStressReliefToolChoice,
  shouldBlockStressAutoToolRouting,
  shouldOfferStressRelief,
  isExplicitFocusAudioRequest,
  isExplicitStressToolRequest,
  stressReliefHintForChat,
  stressReliefToolAction,
  stressToolOpenAck,
  type StressCauseId,
  type StressReliefOffer,
  type StressReliefOptionId,
} from "@/lib/stressRouting";
import {
  buildDecisionCompassOffer,
  decisionCompassOfferHintForChat,
  decisionCompassOpenAck,
  decisionCompassTalkThroughAck,
  dismissDecisionCompassOfferForSession,
  extractDecisionCompassPrefill,
  isDecisionCompassOfferSignal,
  isExplicitDecisionCompassRequest,
  type DecisionCompassOffer,
} from "@/lib/decisionCompassRouting";
import type { DecisionCompassPrefill } from "@/lib/decisionCompass";
import {
  buildCompanionIntelligence,
  intelligenceHintForChat,
  shouldDeferToolsFromIntelligence,
} from "@/lib/companionIntelligence";
import { appFeatureKnowledgeHintForChat } from "@/lib/appFeatureKnowledge";
import {
  assistantSuggestedAction,
  assistedActionHintForChat,
  isActionAcceptance,
  type AssistedAction,
} from "@/lib/assistedActionBridge";
import {
  detectDoItNowOffer,
  doItNowHintForChat,
  isActionDone,
  physicalDoneFollowUp,
  physicalWaitLaunchMessage,
  type DoItNowOffer,
} from "@/lib/doItNowActions";
import {
  classifyActiveRecovery,
  isActiveWorkspaceRecoveryRequest,
} from "@/lib/activeWorkspaceRecovery";
import {
  conversationGatingHint,
  shouldBlockAutoWorkspaceOpen,
  shouldStayInConversation,
} from "@/lib/conversationGating";
import {
  assistantContainsQuestion,
  isAssistantAwaitingUserAnswer,
  shouldSuppressActivationForTurn,
  shouldSuppressInterventionSurfaces,
  shouldSuppressSecondaryCards,
} from "@/lib/conversationIntervention";
import { arbitrationHintForChat } from "@/lib/companionTurnArbiter";
import {
  evaluateCompanionTurn,
  governorAllowsArtifactHandoff,
  governorBlocksChatTurnAutoOpen,
  governorSuppressesInterventionSurfaces,
  mergeGovernorHints,
} from "@/lib/companionGovernor";
import { isChatConversationOnlyMode } from "@/lib/chatConversationOnly";
import {
  createCompanionRoutingExecutor,
  recordCompanionRoute,
  type CompanionRoutingHandlers,
  type RouteSource,
} from "@/lib/companionRoutingExecutor";
import { installCompanionRouteLogging } from "@/lib/companionRoutingLog";
import { installContinuityAuditHook } from "@/lib/continuityAudit";
import {
  DISCARD_WORKSPACE_CONFIRM,
  recoveryMessageAfterPanelHide,
  resumeReceiptForContinuityType,
  type PanelCloseContext,
} from "@/lib/continuityRecovery";
import type { PanelCloseMode } from "@/lib/continuityPanelClose";
import {
  clearDecisionCompassSession,
  loadDecisionCompassSession,
  saveDecisionCompassSession,
  type PersistedDecisionCompassSession,
} from "@/lib/decisionCompassSessionStore";
import {
  applyUserChatToAuthority,
  createDecisionCompassAuthority,
  decisionCompassFreshOpener,
  decisionCompassResumeOpener,
  decisionCompassWorkspaceHint,
  duplicateQuestionGuardHint,
  enrichAuthority,
  loadDecisionCompassAuthority,
  saveDecisionCompassAuthority,
  snapshotFromAuthority,
} from "@/lib/decisionCompassSessionAuthority";
import {
  clearStrategyApplySession,
  loadStrategyApplySession,
  saveStrategyApplySession,
  toStrategyApplySession,
} from "@/lib/strategyApplySessionStore";
import {
  loadProjectContinuity,
  saveProjectContinuity,
} from "@/lib/projectContinuityStore";
import {
  isPurityScopedSection,
  messagesForApi,
  resolveWorkspaceOpener,
  type WorkspaceChatScope,
} from "@/lib/workspaceChatPurity";
import {
  createReceiptMessage,
  draftPermissionBlockMessage,
  evaluateCreateOpen,
  userAcceptedCreateConsent,
  type CreateOpenContext,
  type CreateOpenSource,
  type PendingCreateOpenPayload,
} from "@/lib/createOpenAuthority";
import {
  createPendingAcceptanceRecord,
  isBareGenericAcceptance,
  isAcceptanceAttempt,
  isPendingAcceptanceExpired,
  resolvePendingAcceptance,
  topicChangeInvalidatesOffer,
  type PendingAcceptanceKind,
  type PendingAcceptanceRecord,
} from "@/lib/pendingAcceptanceAuthority";
import {
  adaptMyDayOfferLine,
  adaptMyDayOpenAck,
  isAdaptMyDayIntent,
} from "@/lib/adaptMyDayChatRouting";
import {
  companionEcosystemRoutingHintForChat,
  detectEcosystemProblemIntent,
  ecosystemIntentToWorkspaceOffer,
} from "@/lib/companionEcosystemIntent";
import { queueVisualFocusOpen, peekVisualFocusPendingOpen, requestVisualFocusStudio } from "@/lib/visualFocus";
import {
  companionEntryLayerHintForChat,
  shouldDeferKeywordWorkspaceOffer,
} from "@/lib/companionEntry";
import {
  adhdNativeHintForChat,
  analyzeAdhdNativeTurn,
  shouldDeferEcosystemRouting,
} from "@/lib/adhdNativeIntelligence";
import {
  adaptiveUserIntelligenceHintForChat,
  adhdEntrepreneurPrimaryHintForChat,
  analyzeAdhdEntrepreneurTurn,
} from "@/lib/adhdEntrepreneurIntelligence";
import {
  buildSprint5Intelligence,
  recordConfidenceWin,
} from "@/lib/companionSprint5Intelligence";
import {
  actionBiasHintForChat,
  analyzeActionBias,
  discoveryOverrideForActionBias,
  shouldDeferRoutingForActionBias,
} from "@/lib/companionActionBias";
import {
  analyzeIntuitiveAwareness,
  intuitiveAwarenessHintForChat,
} from "@/lib/companionIntuitiveAwareness";
import { resolveWorkspaceAdvisorRole } from "@/lib/workspaceContextLock";
import {
  clearOutcomeThread,
  getOutcomeThread,
  outcomeThreadHintForChat,
  registerFeatureOpened,
  registerPendingOffer,
  registerProblemFromUser,
  registerWorkflowContinuation,
  topicChangeClearsThread,
} from "@/lib/companionOutcomeThread";
import {
  buildCompanionDecisionIntelligence,
  companionDecisionIntelligenceHintForChat,
} from "@/lib/companionDecisionIntelligence/companionDecisionIntelligence";
import { shouldOfferDecisionCompassForTurn } from "@/lib/companionDecisionIntelligence/decisionCompassOfferGate";
import { syncOutcomeThreadFromDecisionIntelligence } from "@/lib/companionDecisionIntelligence/outcomeThreadSync";
import {
  SURVEY_TEMPLATES,
  buildSurveyCreationInput,
  evaluateSurveyIntelligence,
  inferSurveyTypeFromAssistantOffer,
  isExplicitSurveyCreateRequest,
  recordSurveyCreated,
  surveyIntelligenceHintForChat,
} from "@/lib/surveyIntelligence";
import {
  applyPhase1OnboardingTurn,
  evaluatePhase1Onboarding,
  isPhase1OnboardingActive,
  isPhase1OnboardingComplete,
  PHASE1_INPUT_PLACEHOLDER,
  phase1OnboardingHintForChat,
  phase1RelationshipProfileForChat,
  shouldDeferWorkspaceRoutingForPhase1,
  shouldSuppressWorkspaceCoachForPhase1,
} from "@/lib/phase1Onboarding";
import {
  maybeTrustBuildingMoment,
  observeFromConversationTurn,
  observeResourcePreference,
  phase2ProgressiveDiscoveryHintForChat,
  recordTrustBuildingMomentShown,
  resourcePreferenceFromAppSection,
} from "@/lib/phase2ProgressiveDiscovery";
import {
  maybeAnticipatorySupport,
  maybeCompanionAwarenessMoment,
  observePhase3Turn,
  phase3AdaptiveRelationshipHintForChat,
  recordAnticipatoryOfferShown,
  recordAwarenessMomentShown,
} from "@/lib/phase3AdaptiveRelationship";
import {
  observePhase4BusinessTurn,
  maybeProactiveBusinessSupport,
  phase4BusinessOperatingPartnerHintForChat,
  recordProactiveBusinessOfferShown,
} from "@/lib/phase4BusinessOperatingPartner";
import {
  maybePredictiveOpportunityOffer,
  observePhase5EcosystemTurn,
  phase5CompanionIntelligenceEcosystemHintForChat,
  recordOpportunityOfferShown,
} from "@/lib/phase5CompanionIntelligenceEcosystem";
import {
  maybeExistingAssetReuseOffer,
  maybeRelatedResourceDiscoveryOffer,
  observePhase6NetworkTurn,
  phase6CompanionIntelligenceNetworkHintForChat,
  recordNetworkDiscoveryOfferShown,
  recordNetworkReuseOfferShown,
} from "@/lib/phase6CompanionIntelligenceNetwork";
import {
  maybeBusinessIntelligenceInsight,
  observePhase7BusinessTurn,
  phase7BusinessIntelligenceHintForChat,
  recordBusinessIntelligenceInsightShown,
} from "@/lib/businessIntelligenceEcosystem";
import {
  maybeEcosystemInsight,
  observeEcosystemIntelligenceTurn,
  phase11EcosystemIntelligenceHintForChat,
  recordEcosystemInsightShown,
} from "@/lib/ecosystemIntelligence";
import { relationshipPhaseSummaryForChat } from "@/lib/companionRelationshipPhases";
import {
  createConversationWorkflow,
  type ConversationWorkflow,
  type WorkflowContinuationResult,
} from "@/lib/conversationWorkflowContinuation";
import {
  resolveCompanionAcceptanceTurn,
  trackConversationOffer,
} from "@/lib/companionIntelligenceRouter";
import { isExplicitBreatheRequest } from "@/lib/explicitBreatheRouting";
import {
  isBusinessAdviceRequest,
  primaryBusinessAdviceDomain,
} from "@/lib/businessAdviceIntent";
import {
  businessIntelligenceConfidenceHintForChat,
} from "@/lib/businessIntelligenceConfidence";
import {
  buildBusinessConfidenceOffer,
  businessConfidenceContinueAck,
  type BusinessConfidenceOffer,
} from "@/lib/businessIntelligenceConfidenceOffer";
import { loadBusinessIntelligenceConfidence } from "@/lib/businessIntelligenceConfidenceClient";
import { userGrantedDraftPermission } from "@/lib/draftPermissionGate";
import {
  assembleConversationArtifact,
  buildRecoveryOfferLine,
  buildRecoveryRestoredMessage,
  clearStashedConversation,
  conversationArtifactToResolved,
  evaluateConversationHandoff,
  handoffReceiptForArtifact,
  hasUsableConversationContext,
  isExplicitBlankCreateOpen,
  isReturnToConversationRequest,
  loadStashedConversation,
  stashConversationBeforeHandoff,
  userAcceptedAssemblyConfirmation,
  type ConversationArtifact,
} from "@/lib/conversationHandoff";
import { templateBuildWithShariChatPrompt } from "@/lib/templateBuildWithShari";
import {
  parseFocusMinutesFromText,
  savePreferredFocusMinutes,
} from "@/lib/focusDuration";
import {
  isWorkspaceOpen,
  isWorkspaceBesideChat,
  coGuideActiveFromSnapshot,
  scrubFalseWorkspaceClaims,
  workspaceOpenAckVerified,
  workspaceVerificationHint,
  type WorkspaceOpenSnapshot,
} from "@/lib/workspaceExecution";
import {
  shouldSuppressCrossWorkspaceNavigation,
  tryStrategyWorkspaceLocalReply,
} from "@/lib/workspaceContextLock";
import {
  trackToolSuggestionAccepted,
  trackToolSuggestionDismissed,
  trackToolSuggestionOffered,
} from "@/lib/toolSuggestionAnalytics";
import {
  buildClosedLoopContext,
  captureOfferShown,
  captureOfferAccepted,
  captureOfferDismissed,
  captureWorkspaceOpened,
  captureWorkspaceUsed,
  captureWorkspaceCompleted,
  captureWorkspaceAbandoned,
  captureWorkspaceReturned,
  captureToolOfferShown,
  captureToolOfferAccepted,
  captureToolOfferDismissed,
} from "@/lib/companionClosedLoopWiring";
import {
  mistakeRecoveryHintForChat,
  processMistakeSignalsFromUserTurn,
  recordRecoveryOutcome,
} from "@/lib/companionMistakeRecovery";
import {
  crossWorkspaceBesideLine,
  crossWorkspaceContextMessage,
  type CrossWorkspaceBesideOffer,
} from "@/lib/crossWorkspaceSuggestion";
import {
  applyAvatarToBusinessStrategySession,
  avatarPrefillsFromDiscovery,
  buildClientAvatarHandoffOffer,
  buildHandoffSnapshot,
  buildReturnToSourceAck,
  clearCrossWorkflowHandoff,
  crossWorkspaceGuidanceHintForChat,
  loadCrossWorkflowHandoff,
  resumeCreateBuilderAfterAvatar,
  saveCrossWorkflowHandoff,
  shouldOfferClientAvatarHandoff,
  userAcceptedClientAvatarHandoff,
  userDeclinedClientAvatarHandoff,
} from "@/lib/crossWorkspaceGuidance";
import {
  buildAppFeatureNavOffer,
  userAcceptedFeatureNav,
  appFeatureNavigationHintForChat,
  type AppFeatureNavOffer,
} from "@/lib/appFeatureNavigation";
import {
  headerForWorkspaceSession,
  HOME_CHAT_SESSION_HEADER,
  workspaceSessionKey,
  type WorkspaceSessionHeaderContext,
} from "@/lib/workspaceSessionHeader";
import { discoveryQuestionsForState } from "@/lib/createWorkflow";
import { shouldWalkThroughFromHowDoI } from "@/lib/howDoIToolWalkthrough";
import {
  detectDoingIntent,
  buildWorkspaceOfferChatReply,
  workspaceOfferHintForChat,
  WORKSPACE_EMOJI,
  workspaceTitle,
  supportsWorkspace,
  type WorkspaceOffer,
} from "@/lib/workspaceMode";
import { detectAudioRequest } from "@/lib/audioSuggestions";
import {
  detectStandaloneToolRequest,
  standaloneToolAck,
} from "@/lib/standaloneToolRouting";
import { isClearMyMindSection } from "@/lib/clearMyMindRouting";
import {
  shouldAutoLaunchPendingAction,
  shouldAutoOpenWorkspaceFromIntent,
} from "@/lib/companionAutoLaunch";
import {
  pendingActionEmoji,
  pendingActionLabel,
  pendingActionLine,
  resolvePendingAction,
  workspaceOpenAck,
  type PendingAction,
} from "@/lib/pendingAction";
import {
  buildWorkspaceChatHints,
  buildWorkspaceContext,
  emptyWorkspaceDetail,
  extractFocusDirective,
  extractWorkspaceDirectives,
  inferWorkspaceChatFill,
  resolveWorkspaceCoachTurn,
  resolveWorkspaceEnergy,
  shouldSuppressWorkspaceOffer,
  workspaceContextForSnapshot,
  type WorkspaceFieldId,
  type WorkspacePanelDetail,
} from "@/lib/workspaceAwareness";
import { isActiveWorkspaceAutoApplyMode } from "@/lib/activeWorkspaceAutoApply";
import {
  buildPrefillSummaryMessage,
  companionGuidanceHintForChat,
  detectResearchWorkspaceConnection,
  extractConversationPrefill,
  shouldOfferConversationPrefill,
  staggerPrefillKeys,
} from "@/lib/companionGuidanceSystem";
import { teachingModeActive } from "@/lib/teachingMode";
import {
  isCreateBuilderWorkflowActive,
  isWorkspaceGuidedCoachActive,
  isWorkflowConceptQuestion,
  shouldSuppressTeachingMode,
} from "@/lib/activeWorkflowContextLock";
import { shouldBypassCreateBuilderForSectionHelp, prepareDiscoveryHelpContext, captureDiscoveryHelpOptions, discoveryHelpHintForChat, isDiscoveryHelpRequest } from "@/lib/createSectionDiscovery";
import {
  buildCompanionFirstOfferReply,
  companionFirstWorkflowHintForChat,
  detectCompanionFirstTarget,
  toWorkspaceOffer,
  usesSplitWalkthrough,
  type CompanionFirstTarget,
} from "@/lib/companionFirstWorkflow";
import {
  buildWorkspaceCoachAutoStart,
  isWorkspaceCoachSilent,
  workspaceCoachSeedKey,
  type WorkspaceCoachExtras,
} from "@/lib/workspaceCoachAutoStart";
import {
  buildClientAvatarKickoffMessage,
  CREATE_KICKOFF_HEADER,
  isBuilderKickoffChatMessage,
  isStaleAvatarCoachOpener,
  isStaleCreateOpener,
  shouldSuppressCardsForBuilderKickoff,
} from "@/lib/builderKickoff";
import {
  clientAvatarCoachHintForChat,
  clientAvatarCompletionMessage,
  coachMessageForStepAdvance,
  processClientAvatarCoachTurn,
  type ClientAvatarBuilderSnapshot,
} from "@/lib/clientAvatarCoach";
import { builderContentSyncHintForChat, isInvalidBuilderFieldValue } from "@/lib/builderContentSync";
import {
  applyWriteAction,
  workspaceFillAction,
  type WriteAction,
} from "@/lib/writeAction";
import { tryResolveWorkspaceApprovalTurn } from "@/lib/workspaceApprovalSync";
import {
  shouldResumeWorkspaceCoach,
  workspaceCoachResumeSeedKey,
} from "@/lib/workspaceCoachResume";
import { getActivityById } from "@/lib/companionActivities";
import {
  isGuidedExerciseActivity,
  standaloneSectionForActivity,
} from "@/lib/guidedExercises";
import { getShariAssistLabel } from "@/lib/shariAssistLabels";
import { resolveProjectWorkspaceDetail } from "@/lib/projectWorkspaceDetail";
import {
  projectCoachTopicOpener,
  type ProjectCoachSelection,
} from "@/lib/projectCoachHandoff";
import { ProjectCoachTopicPicker } from "@/components/companion/ProjectCoachTopicPicker";
import {
  projectCoachTrustHint,
  resolveProjectCoachTurn,
  startProjectCoachSession,
  type ProjectCoachSession,
} from "@/lib/projectCoachSession";
import { FromYesterdayFocusCard } from "@/components/companion/FromYesterdayFocusCard";
import {
  createWorkspaceSession,
  extractNumberedOptions,
  extractSuggestedValue,
  parseOptionSelection,
  setSopStepValue,
  type WorkspaceSession,
} from "@/lib/workspaceSop";
import { resolveSopCoachTurn } from "@/lib/workspaceSopCoach";
import { tryResolveSuggestionSelection } from "@/lib/workspaceSuggestion";
import {
  classifyWorkspaceIntent,
  extractProjectQuery,
} from "@/lib/workspaceIntent";
import {
  buildDuplicateProjectMessage,
  buildProjectChooserMessage,
  buildProjectOpenMessage,
  buildSessionFromProject,
  findSimilarProjects,
  scoreProjectMatch,
  searchProjects,
} from "@/lib/workspaceProjectLookup";
import type { Project } from "@/lib/companionStore";
import { buildSopAcceptMessage } from "@/lib/workspaceSopCoach";
import {
  creationContextEqual,
  genSeedEqual,
  panelDetailEqual,
  workspaceSessionEqual,
} from "@/lib/workspacePanelSync";
import { dbgWorkspace } from "@/lib/workspaceDebug";
import {
  applyResumeIntent,
  buildResumeOpenMessage,
  buildResumeReviewMessage,
  canResumeSession,
  detectWorkspaceResumeIntent,
} from "@/lib/workspaceResume";
import {
  loadWorkspaceSession,
  normalizeSession,
  saveWorkspaceSession,
  clearWorkspaceSession,
  syncSessionProjectMeta,
} from "@/lib/workspaceSessionStore";
import {
  buildCreationWorkspaceOpenMessage,
  toCreationContext,
  type CreationWorkspaceContext,
  type CreationWorkspaceInput,
} from "@/lib/workspaceCreation";
import {
  hasActiveCreateSession,
  loadCreateSession,
  saveCreateSession,
  type CreateGenSeed,
  type CreateSessionSnapshot,
} from "@/lib/createSessionStore";
import {
  buildGoogleDocRecoveryMessage,
  buildSavedArtifactRecoveryMessage,
  detectArtifactWorkspaceCommand,
  isSavedDocumentRecoveryRequest,
  parseAddToProjectRequest,
  recordFromSavedWork,
  type SavedArtifactRecord,
} from "@/lib/savedArtifact";
import {
  getSavedWorkById,
  deleteSavedWork,
  searchSavedWork,
  type SavedWorkItem,
} from "@/lib/savedWorkStore";
import { setEvidencePrefill } from "@/lib/evidenceBankStore";
import { setConfidencePrefill } from "@/lib/confidenceVaultStore";
import { setJourneyPrefill } from "@/lib/myJourneyStore";
import {
  growthPanelBackLabel,
  isGrowthPanelSection,
  type GrowthPanelNav,
  type GrowthSectionId,
} from "@/lib/growthNavigation";
import {
  isMyWorkPanelSection,
  myWorkPanelBackLabel,
} from "@/lib/myWorkNavigation";
import {
  blankScaffoldForType,
  buildCreateOpenAck,
  extractArtifactFromChat,
  isExplicitCreateResumeRequest,
  isExportArtifactRequest,
  looksLikeArtifactContent,
  missingArtifactExportMessage,
  refersToCurrentArtifact,
  buildArtifactAmbiguityMessage,
  collectArtifactCandidates,
  resolveCurrentArtifact,
  type ChatTurn,
  type ResolvedArtifact,
} from "@/lib/createInitialization";
import {
  buildChatArtifactHandoffMessage,
  shouldHandoffChatArtifactToWorkspace,
  shouldSyncChatArtifactToCreate,
} from "@/lib/chatArtifactGuard";
import {
  buildChatHandoffAck,
  clearPendingChatArtifact,
  inferHandoffDestination,
  isEmailToolHandoffRequest,
  isGoogleDocHandoffRequest,
  rememberChatArtifactFromAssistant,
  resolveChatHandoffArtifact,
  shariOfferedEmailToolHandoff,
} from "@/lib/chatCreateHandoff";
import {
  detectAssistantWorkspaceLaunch,
  resolveAssetRoute,
  shouldAutoRouteAssetRequest,
  type AssetRoute,
} from "@/lib/workspaceAssetRouting";
import { eventStore, ev } from "@/lib/ecosystem";
import {
  trackEcosystemEvent,
  trackUserActiveSession,
  trackUserRegisteredOnce,
} from "@/lib/ecosystem/eventTrackingEngine";
import {
  reconcileUserIntelligenceWithServer,
  syncClassifiedSignalsToServer,
} from "@/lib/ecosystem/clientSignalSync";
import {
  observeUserSignalsFromText,
  userIntelligenceEngine,
} from "@/lib/ecosystem/userIntelligenceEngine";
import { ingestClassifiedUserSignals } from "@/lib/intelligence-layer";
import { initCompanionSession } from "@/lib/intelligence-layer/companionSession";
import {
  exposeShadowMetricsToWindow,
  reportShadowParityAfterChatTurn,
} from "@/lib/intelligence-layer/shadowDiagnostics";
import {
  buildActionDashboard,
  executeFounderAction,
  actionStatusForButton,
  isActionRecoveryCommand,
  isActionAcceptance as isFounderActionAcceptance,
  parseActionRecoveryCommand,
  selectRecommendedActions,
  type FounderAction,
  type FounderActionStatus,
} from "@/lib/ecosystem/actions";
import { usePomodoroTimer } from "@/lib/usePomodoroTimer";
import {
  MODE_FEEDBACK,
  SECTION_NAV,
  sidebarNavForSection,
  normalizeSidebarNav,
  type AppSection,
  type SidebarNavId,
  type SidebarToolId,
} from "@/lib/companionUi";
import { type CoachingMode } from "@/lib/companionPrompt";
import { formatAssistantParagraphs, toPlainLanguageDisplay } from "@/lib/plainLanguageFormatting";
import {
  blockDateTime,
  clearConversation,
  createTemplate,
  dayStateSummary,
  getDayState,
  getPrefs,
  getOutputLanguageContext,
  savePrefs,
  speechLocaleForLanguage,
  getLastActivity,
  setLastActivity,
  clearLastActivity,
  clearDraftActivityMemory,
  getRecentWorkItems,
  pushRecentWork,
  getProjects,
  type LastActivity,
  type RecentWorkItem,
  getTimeBlocks,
  saveConversation,
  saveTimeBlock,
  setBlockStatus,
  snoozeBlock,
  todayStr,
  logMomentum,
  businessContextSummary,
  getVoiceStatus,
  addVoiceSeconds,
  setActiveAvatar,
  type TimeBlock,
  type VisualMode,
} from "@/lib/companionStore";
import {
  buildRecognitionContext,
  evaluateRecognitionMoment,
  getRecognitionStore,
  RECOGNITION_UPDATED_EVENT,
  recordConversationStart,
  syncBusinessMilestonesFromApp,
  type RecognitionMoment,
} from "@/lib/recognition";
import { getMemberSinceIso } from "@/lib/shariMemberSince";
import {
  evaluateAndRecordCognitiveLoad,
  type CognitiveLoadResult,
} from "@/lib/cognitive-load";
import {
  evaluateAndRecordActivation,
  shouldSurfaceActivationOffer,
  type ActivationSnapshot,
} from "@/lib/activation";
import {
  evaluateAndRecordLoopIntelligence,
  evaluateLoopIntelligence,
  shouldSurfaceLoopOffer,
  type LoopSnapshot,
} from "@/lib/loop-intelligence";
import {
  adaptiveHintForChat,
  evaluateAndRecordAdaptiveCompanion,
} from "@/lib/adaptive-companion";
import {
  evaluateAndRecordUserHealth,
  type UserHealthSnapshot,
} from "@/lib/user-health";
import {
  evaluateAndRecordRecovery,
  type RecoverySnapshot,
} from "@/lib/recovery-intelligence";
import {
  acceptDecisionNarrow,
  acceptDecisionPark,
  evaluateAndRecordDecision,
  evaluateDecisionOffer,
  shouldSurfaceDecisionOffer,
  type DecisionOffer,
} from "@/lib/decision-intelligence";
import {
  beginDayDesignerFlow,
  buildSimpleDayPlanView,
  companionIntroForDayDesigner,
  isDayDesignerDismissedToday,
  processDayDesignerMessage,
  questionForStep,
  shouldStartDayDesigner,
  type DayDesignerSession,
  type SimpleDayPlanView,
} from "@/lib/day-designer";
import {
  acceptRelationshipRemember,
  evaluateRelationshipOffer,
  shouldSurfaceRelationshipOffer,
  type RelationshipOffer,
} from "@/lib/relationship-intelligence";
import {
  acceptOpportunityExplore,
  evaluateOpportunityOffer,
  shouldSurfaceOpportunityOffer,
  type OpportunityOffer,
} from "@/lib/opportunity-intelligence";
import {
  acceptEnvironmentAdjust,
  evaluateAndRecordEnvironment,
  evaluateEnvironmentOffer,
  shouldSurfaceEnvironmentOffer,
  type EnvironmentOffer,
} from "@/lib/environment-intelligence";
import {
  acceptFutureShari,
  evaluateFutureShariOffer,
  shouldSurfaceFutureOffer,
  type FutureShariOffer,
} from "@/lib/future-shari";
import {
  acceptMomentumAcknowledge,
  evaluateAndRecordMomentum,
  evaluateMomentumOffer,
  shouldSurfaceMomentumOffer,
  type MomentumOffer,
} from "@/lib/momentum-intelligence";
import {
  checkInAckMessage,
  notTodayFollowUpMessage,
  statusForCheckInOutcome,
  talkThroughChatOpener,
  type MomentumCheckInOutcome,
  type MomentumNotTodayAction,
  type MomentumOtherImportantPayload,
} from "@/lib/momentumAppointment";
import { recordMomentumCheckIn } from "@/lib/momentumCheckInAnalytics";
import {
  acceptBusinessSort,
  evaluateAndRecordBusinessOS,
  evaluateBusinessOSSortOffer,
  shouldSurfaceBusinessOSSortOffer,
  type BusinessOSSortOffer,
} from "@/lib/business-os";
import {
  acceptChiefPerspective,
  evaluateAndRecordChiefOfStaff,
  evaluateChiefOffer,
  shouldSurfaceChiefOffer,
  type ChiefOfStaffOffer,
} from "@/lib/chief-of-staff";
import {
  evaluateAndRecordEcosystem,
  ecosystemGuidanceForChat,
  evaluateEcosystem,
  isSuppressed,
} from "@/lib/ecosystem-intelligence";
import {
  acceptPredictiveSupport,
  evaluateAndRecordPredictiveSupport,
  evaluatePredictiveOffer,
  shouldSurfacePredictiveOffer,
  type PredictiveSupportOffer,
} from "@/lib/predictive-support";
import { playChime, unlockChime } from "@/lib/chime";
import { type ScenePage } from "@/lib/companionBackgrounds";
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { isFinal: boolean; 0: { transcript: string } };
  };
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

function presenceDelay() {
  return new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 400),
  );
}

function toApiMessages(messages: Message[]): Message[] {
  return messages.filter((m) => m.role === "user" || m.role === "assistant");
}

function energyOpeningLine(block: TimeBlock): string {
  const goal = block.goal?.trim() || "move this forward";
  if (block.energy === "low") {
    return `**${block.title}** — goal: ${goal}. No pressure — even two minutes of easing in counts as momentum.`;
  }
  if (block.energy === "high") {
    return `**${block.title}** — goal: ${goal}. Good energy window — want to jump in?`;
  }
  return `**${block.title}** — goal: ${goal}. What's one small step to move it forward?`;
}

function tomorrowStr(): string {
  const d = new Date(`${todayStr()}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CHAT_STARTER_PHRASES = [
  /^i'?m feeling overwhelmed\.?$/i,
  /^what should i work on\??$/i,
  /^help me write something\.?$/i,
];

function shouldSaveChatActivity(_userText: string): boolean {
  return false;
}

function chatActivityTitle(assistantMessage: string, userText: string): string {
  const fromReply = assistantMessage
    .replace(/\*\*/g, "")
    .split(/[.!?\n]/)
    .map((s) => s.trim())
    .find((s) => s.length >= 12);
  const title = fromReply || userText.trim();
  return title.length > 50 ? `${title.slice(0, 50)}…` : title;
}

// Choose which organic scene family fits what the person is talking about.
// The actual image within a family is then chosen by time of day.
function sceneForContext(
  emotion: EmotionalState,
  section: AppSection,
): ScenePage {
  // Tool sections have a natural scene regardless of mood.
  if (
    section === "focus-timer" ||
    section === "focus-audio" ||
    section === "breathe"
  ) {
    return "focus";
  }
  if (section === "playbook" || section === "projects") {
    return "business";
  }
  // Otherwise follow the emotional topic.
  switch (emotion) {
    case "emotional":
    case "overwhelmed":
      return "recovery";
    case "focused":
      return "focus";
    case "building":
      return "business";
    case "stuck":
      return "recovery";
    default:
      return "today";
  }
}

const FOUNDER_ID = "founder-001";

function toChatTurns(
  msgs: { role: string; content: string }[],
): ChatTurn[] {
  return msgs.filter(
    (m): m is ChatTurn => m.role === "user" || m.role === "assistant",
  );
}

export default function CompanionPageClient() {
  const router = useRouter();

  useEffect(() => {
    exposeShadowMetricsToWindow();
    initCompanionSession();
  }, []);

  const [activeSection, setActiveSection] = useState<AppSection>("home");
  const [activeNav, setActiveNav] = useState<SidebarNavId>("chat");
  const activeNavRef = useRef<SidebarNavId>("chat");
  activeNavRef.current = activeNav;
  const [messages, setMessages] = useState<Message[]>([]);
  const [workspacePanel, setWorkspacePanelState] = useState<AppSection | null>(
    null,
  );
  const workspacePanelRef = useRef<AppSection | null>(null);
  const routingHandlersRef = useRef<CompanionRoutingHandlers | null>(null);
  const governorRouteCtxRef = useRef({
    userText: "",
    lastAssistantText: "",
    resolved: resolveIntent(""),
    suppressRestore: true,
  });
  const governorChatMessagesRef = useRef<Message[]>([]);
  const routingExecutorRef = useRef(
    createCompanionRoutingExecutor(() => routingHandlersRef.current!),
  );
  const [companionStandaloneSection, setCompanionStandaloneSection] =
    useState<AppSection | null>(null);
  const companionStandaloneSectionRef = useRef<AppSection | null>(null);
  companionStandaloneSectionRef.current = companionStandaloneSection;
  const [guideBesideSession, setGuideBesideSession] = useState<{
    source: { kind: "activity" } | { kind: "section"; section: AppSection };
    targetSection: AppSection;
  } | null>(null);
  const [chatLayoutMode, setChatLayoutModeState] =
    useState<ChatLayoutMode>(DEFAULT_CHAT_LAYOUT_MODE);
  const applyChatLayoutMode = useCallback((mode: ChatLayoutMode) => {
    setChatLayoutModeState(mode);
    saveWorkspaceChatLayoutPreference(mode);
  }, []);
  const [viewSizePreference, setViewSizePreference] =
    useState<WorkspaceViewSizePreset | null>(null);
  useEffect(() => {
    setViewSizePreference(loadWorkspaceViewSizePreference());
  }, []);
  const viewSizeContextSection =
    workspacePanel ??
    companionStandaloneSection ??
    guideBesideSession?.targetSection ??
    null;
  const effectiveViewSize = resolveEffectiveViewSize(
    viewSizeContextSection,
    viewSizePreference,
  );
  const applyViewSizePreset = useCallback(
    (preset: WorkspaceViewSizePreset) => {
      setViewSizePreference(preset);
      saveWorkspaceViewSizePreference(preset);
      if (chatLayoutMode === "workspace-focus") {
        applyChatLayoutMode("split");
      }
    },
    [chatLayoutMode, applyChatLayoutMode],
  );
  const focusWorkspaceLayout = useCallback(() => {
    applyChatLayoutMode("workspace-focus");
  }, [applyChatLayoutMode]);
  const openChatBesideWorkspace = useCallback(() => {
    applyChatLayoutMode("split");
    setChatFocusSeq((n) => n + 1);
  }, [applyChatLayoutMode]);
  const stayInCreateSplitScreen = useCallback(() => {
    applyChatLayoutMode("split");
    setActiveSection("home");
    setActiveNav("other");
  }, [applyChatLayoutMode]);
  const isInCreateWorkspacePhase = useCallback(() => {
    return isCreateWorkspaceV2Phase(
      createPanelWorkflowRef.current,
      createBuilderSessionRef.current?.phase ?? null,
    );
  }, []);
  // True once we've restored any saved conversation from localStorage.
  // Gates the autosave effect so we never overwrite a saved chat with [].
  const [hydrated, setHydrated] = useState(false);
  const [hasChatted, setHasChatted] = useState(false);
  const [recognitionMoment, setRecognitionMoment] =
    useState<RecognitionMoment | null>(null);
  const [cognitiveLoad, setCognitiveLoad] =
    useState<CognitiveLoadResult | null>(null);
  const [userHealth, setUserHealth] = useState<UserHealthSnapshot | null>(null);
  const [recovery, setRecovery] = useState<RecoverySnapshot | null>(null);
  const [activationOffer, setActivationOffer] =
    useState<ActivationSnapshot | null>(null);
  const [loopOffer, setLoopOffer] = useState<LoopSnapshot | null>(null);
  const [dayDesignerSession, setDayDesignerSession] =
    useState<DayDesignerSession | null>(null);
  const [dayDesignerQuestion, setDayDesignerQuestion] = useState<string | null>(
    null,
  );
  const [dayPlanView, setDayPlanView] = useState<SimpleDayPlanView | null>(null);
  const [relationshipOffer, setRelationshipOffer] =
    useState<RelationshipOffer | null>(null);
  const [opportunityOffer, setOpportunityOffer] =
    useState<OpportunityOffer | null>(null);
  const [decisionOffer, setDecisionOffer] = useState<DecisionOffer | null>(null);
  const [environmentOffer, setEnvironmentOffer] =
    useState<EnvironmentOffer | null>(null);
  const [futureShariOffer, setFutureShariOffer] =
    useState<FutureShariOffer | null>(null);
  const [momentumOffer, setMomentumOffer] = useState<MomentumOffer | null>(null);
  const [businessOSSortOffer, setBusinessOSSortOffer] =
    useState<BusinessOSSortOffer | null>(null);
  const [chiefOffer, setChiefOffer] = useState<ChiefOfStaffOffer | null>(null);
  const [predictiveOffer, setPredictiveOffer] =
    useState<PredictiveSupportOffer | null>(null);
  const [stressReliefOffer, setStressReliefOffer] =
    useState<StressReliefOffer | null>(null);
  const [decisionCompassOffer, setDecisionCompassOffer] =
    useState<DecisionCompassOffer | null>(null);
  const [decisionCompassPrefill, setDecisionCompassPrefill] =
    useState<DecisionCompassPrefill | null>(null);
  const [decisionCompassSession, setDecisionCompassSession] =
    useState<PersistedDecisionCompassSession | null>(null);
  const [conversationWorkflow, setConversationWorkflow] =
    useState<ConversationWorkflow | null>(null);
  const [businessConfidenceOffer, setBusinessConfidenceOffer] =
    useState<BusinessConfidenceOffer | null>(null);
  const businessConfidenceBypassRef = useRef(false);
  const businessConfidencePendingTextRef = useRef<string | null>(null);
  const hasInlineIntelligenceOffer = Boolean(
    stressReliefOffer ||
      decisionCompassOffer ||
      businessConfidenceOffer ||
      activationOffer ||
      dayPlanView ||
      (dayDesignerQuestion && dayDesignerSession) ||
      relationshipOffer ||
      decisionOffer ||
      environmentOffer ||
      futureShariOffer ||
      momentumOffer ||
      opportunityOffer ||
      businessOSSortOffer ||
      chiefOffer ||
      predictiveOffer,
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [coachingMode, setCoachingMode] = useState<CoachingMode>("today");
  const [emotion, setEmotion] = useState<EmotionalState>("unclear");
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  // Category to pre-select when Focus Audio opens.
  const [focusAudioCategory, setFocusAudioCategory] = useState<string | null>(
    null,
  );
  // A time block whose start time has arrived (shows the trigger popup).
  const [triggeredBlock, setTriggeredBlock] = useState<TimeBlock | null>(null);
  // A time block starting in ~15 minutes (shows a gentle heads-up toast).
  const [warning, setWarning] = useState<TimeBlock | null>(null);
  const warnedRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseInputRef = useRef("");
  const voiceUsedRef = useRef(false);
  const pomodoroTimer = usePomodoroTimer();

  useEffect(() => {
    if (pomodoroTimer.debriefPending) {
      setActiveSection("focus-timer");
    }
  }, [pomodoroTimer.debriefPending]);

  const isIdle = !messages.some((m) => m.role === "user");
  const splitCreateChat =
    chatLayoutMode === "split" && workspacePanel === "content-generator";
  const workspaceActiveBeside = Boolean(
    workspacePanel || companionStandaloneSection || guideBesideSession,
  );
  const intelligenceIdle = isIdle && !workspaceActiveBeside;
  const homeCalm =
    activeSection === "home" &&
    isIdle &&
    !splitCreateChat &&
    !workspaceActiveBeside;

  useEffect(() => {
    if (!homeCalm) return;
    setActivationOffer(null);
    setLoopOffer(null);
    setRelationshipOffer(null);
    setDecisionOffer(null);
    setEnvironmentOffer(null);
    setFutureShariOffer(null);
    setMomentumOffer(null);
    setOpportunityOffer(null);
    setBusinessOSSortOffer(null);
    setChiefOffer(null);
    setPredictiveOffer(null);
    setDayPlanView(null);
    setDayDesignerSession(null);
    setDayDesignerQuestion(null);
    setRecognitionMoment(null);
    setCognitiveLoad(null);
    setUserHealth(null);
    setRecovery(null);
    setBridge(null);
    setToolSuggestion(null);
    setActionBridge(null);
    setWorkspaceOffer(null);
    setAssistedActionOffer(null);
    setStressReliefOffer(null);
    setDecisionCompassOffer(null);
  }, [homeCalm]);

  const liveEmotion = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const signal = input.trim() || lastUser?.content || "";
    return detectEmotionalState(signal);
  }, [input, messages]);

  const displayEmotion = homeCalm
    ? "unclear"
    : isIdle
      ? liveEmotion
      : emotion;
  const stateHint = getStateHint(displayEmotion);
  const shellClass = EMOTION_SHELL_CLASS[displayEmotion];

  // Organic background. The engine layers in time of day; here we pick the
  // scene family + seed per context:
  //  • Chat/home — locked to the conversation (its first message) so the
  //    backdrop stays put throughout and never shifts while the person types.
  //  • Brain dump — follows what they're writing.
  //  • Tool screens — their own calm scene.
  const firstUserMessage = messages.find((m) => m.role === "user")?.content;
  let scenePage: ScenePage;
  let sceneSeed: string;
  if (activeSection === "brain-dump") {
    // Calm and fixed — the backdrop should never shift while they type.
    scenePage = "recovery";
    sceneSeed = "brain-dump";
  } else if (activeSection === "home") {
    const convoEmotion = firstUserMessage
      ? detectEmotionalState(firstUserMessage)
      : "unclear";
    scenePage = sceneForContext(convoEmotion, "home");
    sceneSeed = firstUserMessage ?? "home";
  } else {
    scenePage = sceneForContext(displayEmotion, activeSection);
    sceneSeed = activeSection;
  }

  // Hydrate prefs and memory — keep calm home empty; don't reopen past chats.
  useEffect(() => {
    setHasChatted(getPrefs().hasChatted);
    setHydrated(true);

    let cancelled = false;
    const runDeferred = () => {
      if (cancelled) return;
      installCompanionRouteLogging();
      installContinuityAuditHook();
      trackUserRegisteredOnce();
      trackUserActiveSession();
      void reconcileUserIntelligenceWithServer(userIntelligenceEngine.getCounts());

      const projectSnap = loadProjectContinuity();
      if (projectSnap?.projectContinueId) {
        setProjectContinueId(projectSnap.projectContinueId);
      }

      const strategySnap = loadStrategyApplySession();
      if (strategySnap) {
        setStrategyApplySession(toStrategyApplySession(strategySnap));
        setStrategyPanelCommand({
          key: Date.now(),
          strategyId: strategySnap.strategyId,
        });
        if (strategySnap.workspacePanelOpen) {
          patchWorkspacePanel("playbook");
          setActiveNav("playbook");
          applyChatLayoutMode("split");
          revealWorkspace();
        }
      }

      const decisionSnap = loadDecisionCompassSession();
      if (decisionSnap) {
        setDecisionCompassSession(decisionSnap);
      }
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(runDeferred, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(runDeferred, 50);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const refreshRecognition = useCallback(() => {
    const synced = syncBusinessMilestonesFromApp();
    const prefs = getPrefs();
    const moment = evaluateRecognitionMoment(
      buildRecognitionContext({
        userName: prefs.name,
        memberSinceIso: getMemberSinceIso(),
        conversationCount: getRecognitionStore().conversationStarts,
        ...synced,
      }),
    );
    setRecognitionMoment(moment);
  }, []);

  useEffect(() => {
    if (!hydrated || !intelligenceIdle || homeCalm) {
      setRecognitionMoment(null);
      return;
    }
    refreshRecognition();
  }, [hydrated, intelligenceIdle, homeCalm, refreshRecognition]);

  useEffect(() => {
    if (!hydrated || !intelligenceIdle || homeCalm) return;
    const onUpdate = () => {
      if (hydrated && intelligenceIdle && !homeCalm) refreshRecognition();
    };
    window.addEventListener(RECOGNITION_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(RECOGNITION_UPDATED_EVENT, onUpdate);
  }, [hydrated, intelligenceIdle, homeCalm, refreshRecognition]);

  useEffect(() => {
    if (!hydrated || !intelligenceIdle || homeCalm) {
      setCognitiveLoad(null);
      setUserHealth(null);
      setRecovery(null);
      return;
    }
    const result = evaluateAndRecordCognitiveLoad({
      emotionalState: displayEmotion,
      recentText:
        ([...messages].reverse().find((m) => m.role === "user")?.content ??
          input.trim()) ||
        undefined,
    });
    setCognitiveLoad(result);
    const health = evaluateAndRecordUserHealth({
      emotionalState: displayEmotion,
      text:
        ([...messages].reverse().find((m) => m.role === "user")?.content ??
          input.trim()) ||
        undefined,
      cognitiveLoadLevel: result.score.level,
      activationState: activationOffer?.state ?? null,
      primaryLoopType: loopOffer?.loopType ?? null,
    });
    setUserHealth(health);
    setRecovery(
      evaluateAndRecordRecovery({
        emotionalState: displayEmotion,
        text:
          ([...messages].reverse().find((m) => m.role === "user")?.content ??
            input.trim()) ||
          undefined,
        cognitiveLoadLevel: result.score.level,
        activationState: activationOffer?.state ?? null,
        userHealthStatus: health.status,
        recognitionRecent: Boolean(recognitionMoment),
      }),
    );
  }, [hydrated, intelligenceIdle, homeCalm, displayEmotion, input, messages, activationOffer?.state, loopOffer?.loopType, recognitionMoment]);

  useEffect(() => {
    if (!hydrated || !intelligenceIdle || homeCalm || splitCreateChat) {
      setLoopOffer(null);
      return;
    }
    const recentText =
      ([...messages].reverse().find((m) => m.role === "user")?.content ??
        input.trim()) ||
      undefined;
    const loop = evaluateLoopIntelligence({
      text: recentText,
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: activationOffer?.state ?? null,
    });
    const blockLoop =
      recentText &&
      governorSuppressesInterventionSurfaces({
        userText: recentText,
        lastAssistantText:
          [...messages].reverse().find((m) => m.role === "assistant")?.content ??
          "",
        workspacePanel,
        workspaceSnap: getWorkspaceSnapshot(),
        resolvedIntent: resolveIntent(recentText),
        strategyApplyActive: Boolean(
          strategyApplySessionRef.current &&
            workspacePanel === "playbook" &&
            strategyApplySessionRef.current.phase !== "done",
        ),
        createBuilderActive: Boolean(
          createBuilderSessionRef.current &&
            workspacePanel === "content-generator" &&
            createBuilderSessionRef.current.phase !== "done",
        ),
        businessStrategyActive: Boolean(
          businessStrategySessionRef.current && workspacePanel === "playbook",
        ),
        dayDesignerActive: Boolean(
          dayDesignerSession && dayDesignerSession.step !== "complete",
        ),
      });
    setLoopOffer(
      !blockLoop && shouldSurfaceLoopOffer(loop) ? loop : null,
    );
  }, [
    hydrated,
    intelligenceIdle,
    input,
    messages,
    cognitiveLoad?.score.level,
    activationOffer?.state,
    homeCalm,
    workspacePanel,
    chatLayoutMode,
    dayDesignerSession,
    splitCreateChat,
  ]);

  // Block legacy Command Center section for end users (founder/admin workspace only).
  useEffect(() => {
    if (activeSection === "progress") {
      setActiveSection("home");
      setActiveNav("chat");
    }
  }, [activeSection]);

  // Persist active chats only — never wipe storage with an empty calm-home load.
  useEffect(() => {
    if (!hydrated) return;
    if (!messages.some((m) => m.role === "user")) return;
    saveConversation(messages);
  }, [messages, hydrated]);

  // Universal back navigation — remembers the section you came from so every
  // screen has a way out (falls back to the chat/home dashboard).
  const sectionHistoryRef = useRef<AppSection[]>([]);
  const navHistoryRef = useRef(createNavigationHistoryStack());
  const panelBackStackRef = useRef<(string | null)[]>([]);
  const [workspacePanelBackLabel, setWorkspacePanelBackLabel] = useState<
    string | null
  >(null);
  const prevSectionRef = useRef<AppSection>(activeSection);
  const goingBackRef = useRef(false);

  useEffect(() => {
    if (prevSectionRef.current === activeSection) return;
    if (goingBackRef.current) {
      goingBackRef.current = false;
    } else {
      sectionHistoryRef.current.push(prevSectionRef.current);
    }
    prevSectionRef.current = activeSection;
  }, [activeSection]);

  // Help Me Right Now is retired — legacy links land on Focus instead.
  useEffect(() => {
    if (activeSection !== "activities") return;
    setActivitySession(EMPTY_ACTIVITY_SESSION);
    setActiveSection("focus");
    activeSectionRef.current = "focus";
    setActiveNav("focus");
  }, [activeSection]);

  // Settings / Profile / Sign-in open as modal sheets on top of the app (not pages).
  const [overlay, setOverlay] = useState<
    null | "settings" | "profile" | "signin"
  >(null);
  const [planMyDayDrawerOpen, setPlanMyDayDrawerOpen] = useState(false);
  const [planMyDayOpenItemId, setPlanMyDayOpenItemId] = useState<string | null>(
    null,
  );
  const [freshStartDialog, setFreshStartDialog] =
    useState<FreshStartKind | null>(null);
  const [activityReturnLabel, setActivityReturnLabel] = useState<string | null>(
    null,
  );
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection | null>(null);
  const [profileGettingToKnowYou, setProfileGettingToKnowYou] = useState(false);
  const visualMode = useVisualMode();
  const clientMounted = useClientMounted();
  const adaptiveVisualContext = useMemo(
    () =>
      resolveAdaptiveVisualContext({
        activeSection,
        workspacePanel,
        companionStandaloneSection,
        focusMode:
          pomodoroTimer.isActive ||
          workspacePanel === "focus-timer" ||
          workspacePanel === "focus-audio",
      }),
    [
      activeSection,
      workspacePanel,
      companionStandaloneSection,
      pomodoroTimer.isActive,
    ],
  );
  const { configured: authConfigured, user } = useCompanionAuth();

  const openSignIn = useCallback(() => {
    if (authConfigured) setOverlay("signin");
    else router.push("/companion/login");
  }, [authConfigured, router]);

  const openHowDoISettings = useCallback((section: SettingsSection) => {
    setSettingsSection(section);
    setOverlay("settings");
  }, []);

  function acceptAppFeatureNavOffer(offer: AppFeatureNavOffer) {
    setAppFeatureNavOffer(null);
    if (offer.target.kind === "settings") {
      openHowDoISettings(offer.target.section);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Here you go — you're in **${offer.target.label}**. Tell me what you'd like to change and I'll walk through it with you.`,
        },
      ]);
      return;
    }
    if (offer.target.itemType) {
      requestCreateOpen(
        "content-generator",
        {
          itemType: offer.target.itemType,
          title: `New ${offer.target.itemType}`,
          brief: lastUserTextRef.current,
          stage: "starting compose",
          source: "generated",
        },
        { seedOverride: { autoGenerate: false } },
        { source: "companion_assist", userInitiated: true },
      );
      return;
    }
    openWorkspaceBesideChatCore(
      offer.target.section,
      `Opening **${offer.target.label}** beside us — chat stays right here.`,
    );
  }

  // Voice output — Shari speaks her replies (ElevenLabs).
  const [voiceOutput, setVoiceOutput] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  // Continue card — the home "you were working on…" memory re-entry.
  const [lastAct, setLastAct] = useState<LastActivity | null>(null);
  const [timeBlockFocusId, setTimeBlockFocusId] = useState<string | null>(null);
  const [projectContinueId, setProjectContinueId] = useState<string | null>(
    null,
  );
  const [projectsResumeId, setProjectsResumeId] = useState<string | null>(null);
  const projectContinueIdRef = useRef<string | null>(null);
  const projectsResumeIdRef = useRef<string | null>(null);
  projectContinueIdRef.current = projectContinueId;
  projectsResumeIdRef.current = projectsResumeId;
  const workspaceCoachSeededRef = useRef<string | null>(null);
  const workspaceChatScopeRef = useRef<WorkspaceChatScope | null>(null);
  const [avatarCoachActive, setAvatarCoachActive] = useState(false);
  const [avatarCoachKickoff, setAvatarCoachKickoff] = useState(0);
  const [builderKickoffActive, setBuilderKickoffActive] = useState(false);
  const avatarBuilderSnapshotRef = useRef<ClientAvatarBuilderSnapshot | null>(
    null,
  );
  const avatarTaglineOptionsRef = useRef<string[]>([]);
  const companionFirstTargetRef = useRef<CompanionFirstTarget | null>(null);
  const prevWorkspacePanelRef = useRef<AppSection | null>(null);
  const [projectCoachTopicPickerVisible, setProjectCoachTopicPickerVisible] =
    useState(false);
  const [projectCoachSession, setProjectCoachSession] =
    useState<ProjectCoachSession | null>(null);

  useEffect(() => {
    if (!shouldDeferWorkspaceRoutingForPhase1()) return;
    workspacePanelRef.current = null;
    setWorkspacePanelState(null);
    setCompanionStandaloneSection(null);
    setGuideBesideSession(null);
    workspaceCoachSeededRef.current = null;
    applyChatLayoutMode("workspace-focus");
  }, [applyChatLayoutMode]);

  useEffect(() => {
    const last = getLastActivity();
    if (last && getRecentWorkItems().length === 0) {
      pushRecentWork(last);
    }
    setLastAct(last);
  }, [activeSection]);

  // Soft execution bridge — ONE chip offered after a chat reply when the
  // conversation implied a deliverable but the user didn't command it.
  const [bridge, setBridge] = useState<{
    type: string;
    brief: string;
    label: string;
  } | null>(null);
  const [toolSuggestion, setToolSuggestion] = useState<ToolSuggestion | null>(
    null,
  );
  const [actionBridge, setActionBridge] = useState<ActionBridge | null>(null);
  const [workspaceOffer, setWorkspaceOffer] = useState<WorkspaceOffer | null>(
    null,
  );
  const [pendingCreateOpen, setPendingCreateOpen] =
    useState<PendingCreateOpenPayload | null>(null);
  const [pendingConversationHandoff, setPendingConversationHandoff] =
    useState<ConversationArtifact | null>(null);
  const [pendingAcceptanceRecord, setPendingAcceptanceRecord] =
    useState<PendingAcceptanceRecord | null>(null);
  const chatTurnRef = useRef(0);
  const lastWorkspaceOfferLineRef = useRef<string | null>(null);
  const lastEmotionalStateRef = useRef<EmotionalState | null>(null);
  const [assistedActionOffer, setAssistedActionOffer] =
    useState<AssistedAction | null>(null);
  const [artifactExportOffer, setArtifactExportOffer] =
    useState<ArtifactExportOffer | null>(null);
  const [createDraftScrollTarget, setCreateDraftScrollTarget] = useState<
    string | null
  >(null);
  const [activeDraftEditSection, setActiveDraftEditSection] = useState<
    string | null
  >(null);
  const [createDraftScrollStamp, setCreateDraftScrollStamp] = useState(0);
  const [exportTrigger, setExportTrigger] =
    useState<ArtifactExportAction | null>(null);
  const [projectPickerPrefill, setProjectPickerPrefill] = useState<
    string | null
  >(null);
  const [pendingDocumentTypeChoice, setPendingDocumentTypeChoice] = useState<{
    topic?: string;
  } | null>(null);
  const [preferredGoogleExportKind, setPreferredGoogleExportKind] =
    useState<GoogleFileKind | null>(null);
  const [createExportReady, setCreateExportReady] = useState(false);
  const [createBuilderSession, setCreateBuilderSession] =
    useState<CreateBuilderSession | null>(null);
  const createBuilderSessionRef = useRef<CreateBuilderSession | null>(null);
  createBuilderSessionRef.current = createBuilderSession;
  const splitCreateBuilder =
    splitCreateChat && Boolean(createBuilderSession);
  const [businessStrategySession, setBusinessStrategySession] =
    useState<BusinessStrategySession | null>(null);
  const businessStrategySessionRef = useRef<BusinessStrategySession | null>(null);
  businessStrategySessionRef.current = businessStrategySession;
  const [strategyPanelCommand, setStrategyPanelCommand] = useState<{
    key: number;
    strategyId?: string;
    hubEntryId?: string;
    openView?: "home" | "adhd" | "business" | "saved" | "recommended";
  } | null>(null);
  const [businessStrategyDraft, setBusinessStrategyDraft] = useState<{
    typeLabel: string;
    draft: string;
  } | null>(null);
  const [strategyApplySession, setStrategyApplySession] =
    useState<StrategyApplySession | null>(null);
  const strategyApplySessionRef = useRef<StrategyApplySession | null>(null);
  strategyApplySessionRef.current = strategyApplySession;
  const [strategyDisambiguationPending, setStrategyDisambiguationPending] =
    useState(false);
  const [chatBuildRequest, setChatBuildRequest] = useState<{
    type: string;
    brief: string;
    key: number;
    workflow: import("@/lib/createWorkflow").CreateWorkflowState;
  } | null>(null);
  const [chatReviseRequest, setChatReviseRequest] = useState<{
    instruction: string;
    key: number;
  } | null>(null);
  const createBuilderBootstrappedRef = useRef(false);
  const createPanelWorkflowRef = useRef(EMPTY_CREATE_WORKFLOW);
  const createWorkflowRecordRef = useRef<CreateWorkflowRecord | null>(null);
  const createPanelBuildRef = useRef<CreateBuildDraftHandler | null>(null);
  const [googleWorkspace, setGoogleWorkspace] =
    useState<GoogleWorkspaceSession | null>(null);
  const googleWorkspaceRef = useRef<GoogleWorkspaceSession | null>(null);
  googleWorkspaceRef.current = googleWorkspace;
  const [doItNowOffer, setDoItNowOffer] = useState<DoItNowOffer | null>(null);
  const [physicalActionWaiting, setPhysicalActionWaiting] = useState(false);
  const workspaceRevealSeqRef = useRef(0);
  const activeSectionRef = useRef<AppSection>("home");
  activeSectionRef.current = activeSection;
  const [workspaceFirstSplit, setWorkspaceFirstSplit] = useState(false);
  const [chatFocusSeq, setChatFocusSeq] = useState(0);
  const [workspaceV2Highlight, setWorkspaceV2Highlight] = useState<{
    sectionId: string;
    key: number;
  } | null>(null);
  const [activitySession, setActivitySession] =
    useState<ActivitySessionState>(EMPTY_ACTIVITY_SESSION);
  const activitySessionRef = useRef<ActivitySessionState>(EMPTY_ACTIVITY_SESSION);
  activitySessionRef.current = activitySession;
  const [workspaceContextBanner, setWorkspaceContextBanner] = useState<
    string | null
  >(null);
  const [crossWorkspaceBesideOffer, setCrossWorkspaceBesideOffer] =
    useState<CrossWorkspaceBesideOffer | null>(null);
  const pendingClientAvatarHandoffRef =
    useRef<import("@/lib/crossWorkspaceGuidance").CrossWorkflowHandoffSnapshot | null>(
      null,
    );
  const clientAvatarHandoffOfferedRef = useRef<string | null>(null);
  const clientAvatarHandoffDeclinedRef = useRef(false);
  const [workspaceSessionHeader, setWorkspaceSessionHeader] = useState(
    HOME_CHAT_SESSION_HEADER,
  );
  const [appFeatureNavOffer, setAppFeatureNavOffer] =
    useState<AppFeatureNavOffer | null>(null);
  const workspaceSessionKeyRef = useRef<string | null>(null);
  const companionReturnSectionRef = useRef<AppSection | null>(null);
  const patchWorkspacePanel = useCallback((next: AppSection | null) => {
    if (next && shouldDeferWorkspaceRoutingForPhase1()) {
      dbgWorkspace("setWorkspacePanel blocked — phase1 onboarding", { to: next });
      return;
    }
    workspacePanelRef.current = next;
    setWorkspacePanelState((prev) => {
      if (prev === next) return prev;
      dbgWorkspace("setWorkspacePanel", { from: prev, to: next });
      const resource = resourcePreferenceFromAppSection(next);
      if (resource) {
        observeResourcePreference({ resource, outcome: "opened" });
      }
      return next;
    });
  }, []);

  function getWorkspaceSnapshot(): WorkspaceOpenSnapshot {
    return {
      panel: workspacePanelRef.current,
      activeSection: activeSectionRef.current,
      revealSeq: workspaceRevealSeqRef.current,
    };
  }

  function handleOpenGoogleWorkspace(session: GoogleWorkspaceSession) {
    setGoogleWorkspace(session);
    const linkedProjectId =
      savedArtifactRef.current?.projectId ??
      workspaceDetailRef.current?.selectedItemId ??
      undefined;
    const linkedProjectName =
      savedArtifactRef.current?.projectName ??
      workspaceDetailRef.current?.selectedItemName ??
      undefined;
    upsertDocumentMetadata({
      title: session.title,
      type: session.artifactType,
      googleUrl: session.url,
      googleFileId: session.fileId,
      googleKind: session.kind,
      projectId: linkedProjectId,
      projectName: linkedProjectName,
    });
    patchWorkspacePanel("google-workspace");
    setActiveSection("home");
    activeSectionRef.current = "home";
    focusWorkspaceLayout();
    revealWorkspace();
    appendVerifiedWorkspaceMessage(
      "google-workspace",
      `**${googleWorkspaceTitle(session.kind)}** is open beside us — tell me what to add, change, or move.`,
    );
  }

  function handleArtifactReadyChat(message: string) {
    setCreateExportReady(true);
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
  }

  function handleExportGuidance(message: string) {
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
  }

  function syncCreateBuilderType(typeLabel: string) {
    const display = userFacingCreateTypeLabel(typeLabel) ?? typeLabel;
    const ctx = toCreationContext("content-generator", {
      itemType: typeLabel,
      title: display,
      brief: "",
      stage: "discovery with Shari",
      source: creationContext?.source ?? "generated",
      artifactTypeLocked: shouldLockArtifactType(typeLabel),
    });
    setCreationContext((prev) =>
      creationContextEqual(prev, ctx) ? prev : ctx,
    );
    setGenSeed((prev) => ({
      type: typeLabel,
      topic: display,
      brief: "",
      autoGenerate: false,
    }));
    setBuilderKickoffActive(false);
    setActiveNav("other");
  }

  function clearParallelCoachingOffers() {
    setActivationOffer(null);
    setLoopOffer(null);
    setRelationshipOffer(null);
    setDecisionOffer(null);
    setDecisionCompassOffer(null);
    setEnvironmentOffer(null);
    setFutureShariOffer(null);
    setMomentumOffer(null);
    setOpportunityOffer(null);
    setBusinessOSSortOffer(null);
    setChiefOffer(null);
    setPredictiveOffer(null);
    setToolSuggestion(null);
    setWorkspaceOffer(null);
    setDoItNowOffer(null);
    setActionBridge(null);
    setAssistedActionOffer(null);
    setBridge(null);
    setStressReliefOffer(null);
    setCognitiveLoad((prev) =>
      prev?.companionOffer ? { ...prev, companionOffer: null } : prev,
    );
  }

  function startCreateBuilderChat(
    typeHint?: string | null,
    panelWorkflow?: import("@/lib/createWorkflow").CreateWorkflowState | null,
    opts?: { skipChatSync?: boolean },
  ) {
    const raw =
      typeHint ??
      creationContext?.itemType ??
      genSeed?.type ??
      lockedArtifactType ??
      null;
    const type =
      raw && !isUnresolvedCreateType(raw) ? raw.trim() : null;

    const resume =
      type && panelWorkflowHasProgress(panelWorkflow ?? createPanelWorkflowRef.current);
    const wf = panelWorkflow ?? createPanelWorkflowRef.current;
    const sessionId = wf.sessionId ?? newCreateSessionId();
    const { session, opener } = CREATE_WORKSPACE_V2
      ? resume && type && wf
        ? bootstrapCreateWorkspaceV2FromWorkflow(type, wf)
        : type
          ? bootstrapWorkspaceV2Session(type)
          : bootstrapCreateBuilderSession(type)
      : resume && wf
        ? bootstrapCreateBuilderFromWorkflow(type!, wf)
        : bootstrapCreateBuilderSession(type);
    const withSession = {
      ...session,
      workflow: { ...session.workflow, sessionId, questionMode: "split_screen" as const },
    };
    const record = workflowRecordFromState(withSession.workflow, {
      builderPhase: withSession.phase,
      source: "chat",
      itemType: withSession.typeLabel,
    });
    commitCreateWorkflowRecord(record);
    setCreateBuilderSession(withSession);
    logSharedCreateSession("splitScreenCreateSession found", withSession.workflow, sessionId);
    if (session.typeLabel) syncCreateBuilderType(session.typeLabel);
    setBuilderKickoffActive(!withSession.typeLabel);
    clearParallelCoachingOffers();
    if (!opts?.skipChatSync) {
      setMessages((prev) =>
        applyCreateBuilderChatOpener(
          filterChatLines(prev),
          opener,
          {
            replaceAll:
              Boolean(withSession.typeLabel) ||
              !prev.some((m) => m.role === "user"),
          },
        ),
      );
    }
    createBuilderBootstrappedRef.current = true;
    proposeClientAvatarHandoffIfNeeded(withSession, { lastAssistantText: opener });
  }

  /** When user picks a type in the Create panel while split chat is open. */
  function syncCreateBuilderFromPanelType(typeLabel: string) {
    const trimmed = typeLabel?.trim();
    if (!trimmed || isUnresolvedCreateType(trimmed)) return;
    const current = createBuilderSessionRef.current;
    if (
      current?.typeLabel === trimmed &&
      current.phase !== "pick-type" &&
      answeredDiscoveryCount(current.workflow) > 0
    ) {
      return;
    }
    if (
      current &&
      ["generating", "revise-offer", "done"].includes(current.phase)
    ) {
      return;
    }
    const panelWf = panelWorkflowForBuilderSync(
      trimmed,
      createPanelWorkflowRef.current,
      createPanelWorkflowRef.current.sessionId,
    );
    const { session, opener } = CREATE_WORKSPACE_V2
      ? bootstrapWorkspaceV2Session(trimmed)
      : bootstrapCreateBuilderFromWorkflow(trimmed, panelWf);
    const sessionId = panelWf.sessionId ?? newCreateSessionId();
    const withSession = {
      ...session,
      workflow: {
        ...session.workflow,
        sessionId,
        selectedTypeLabel: trimmed,
        questionMode: "split_screen" as const,
      },
    };
    createPanelWorkflowRef.current = withSession.workflow;
    const record = workflowRecordFromState(withSession.workflow, {
      builderPhase: withSession.phase,
      source: "panel",
      itemType: withSession.typeLabel,
    });
    commitCreateWorkflowRecord(record);
    setCreateBuilderSession(withSession);
    syncCreateBuilderType(trimmed);
    clearParallelCoachingOffers();
    setMessages((prev) =>
      applyCreateBuilderChatOpener(filterChatLines(prev), opener, {
        replaceAll: true,
      }),
    );
    createBuilderBootstrappedRef.current = true;
  }

  async function triggerChatBuildDraft(
    brief: string,
    itemType: string,
    workflow: import("@/lib/createWorkflow").CreateWorkflowState,
  ): Promise<boolean> {
    logChatBuildDraftTriggered({ type: itemType, workflow, mode: "split_screen" });
    const handler = createPanelBuildRef.current;
    if (handler) {
      return handler({
        brief,
        type: itemType,
        workflow,
        fromChat: true,
        mode: "split_screen",
      });
    }
    setChatBuildRequest({
      type: itemType,
      brief,
      workflow,
      key: Date.now(),
    });
    return true;
  }

  function handleChatBuildComplete(result: {
    draft: string;
    workflow: import("@/lib/createWorkflow").CreateWorkflowState;
  }) {
    const type = createBuilderSessionRef.current?.typeLabel ?? "draft";
    const mergedWorkflow = {
      ...result.workflow,
      draftContent: result.draft,
      draftStatus: "ready" as const,
      buildApproved: true,
      step: "improve" as const,
    };
    const baseRecord =
      createWorkflowRecordRef.current ??
      workflowRecordFromState(mergedWorkflow, {
        builderPhase: "revise-offer",
        itemType: type,
      });
    const record = recordAfterDraftBuild(
      baseRecord,
      result.draft,
      mergedWorkflow,
      "panel",
    );
    commitCreateWorkflowRecord(record);
    setChatBuildRequest(null);
    logCreateBuild("Draft generator returned", {
      itemType: type,
      length: result.draft.length,
    });
  }

  function handleCreateBuilderAction(action: CreateBuilderAction) {
    if (action.id === "revise" && action.instruction === "__custom__") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Tell me what you'd like to change — type it below.",
        },
      ]);
      inputRef.current?.focus();
      return;
    }
    if (action.id === "create-draft") {
      void handleSend("Create Draft", false, true);
      return;
    }
    if (action.id === "keep-working" || action.id === "add-more-info") {
      void handleSend("Keep Working", false, true);
      return;
    }
    if (action.id === "review-template") {
      void handleSend("Review Template", false, true);
      return;
    }
    if (action.id === "use-this") {
      void handleSend("Use This", false, true);
      return;
    }
    if (action.id === "revise-it") {
      void handleSend("Revise It", false, true);
      return;
    }
    if (action.id === "keep-talking") {
      void handleSend("Keep Talking", false, true);
      return;
    }
    if (action.id === "revise") {
      void handleSend(action.label, false, true);
    }
  }

  function handleChatBuildFailed() {
    setChatBuildRequest(null);
    logCreateBuild("draftGenerationFailed", { source: "chat-build" });
    setCreateBuilderSession((prev) =>
      prev
        ? {
            ...prev,
            phase: "readiness",
            workflow: {
              ...prev.workflow,
              draftStatus: "error",
              buildApproved: false,
              step: "readiness",
            },
          }
        : prev,
    );
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Generation hit a snag — want to try again? Reply **yes** when you're ready.",
      },
    ]);
  }

  function openCollaborativeDocument(
    kind: GoogleFileKind,
    topic?: string,
    userText?: string,
  ) {
    const requestText = userText ?? lastUserTextRef.current;
    setPreferredGoogleExportKind(kind);
    setCreateExportReady(false);
    const itemType = itemTypeForCollaborativeKind(kind, topic, requestText);
    const fromChat = resolveChatHandoffArtifact(toChatTurns(messages), {
      userText: requestText,
      hintType: itemType,
    });
    if (fromChat?.draftContent?.trim()) {
      openCreateWithResolvedArtifact(
        {
          ...fromChat,
          itemType,
          title:
            fromChat.title && fromChat.title !== "Untitled draft"
              ? fromChat.title
              : titleForCollaborativeDocument(requestText, topic, itemType),
          source: "chat",
          artifactTypeLocked: shouldLockArtifactType(itemType),
        },
        documentCreationOpenAck(kind, topic),
        "google-doc",
      );
      clearPendingChatArtifact();
      return;
    }
    const title = titleForCollaborativeDocument(requestText, topic, itemType);
    const scaffold = collaborativeScaffoldForType(itemType, topic);
    openCreationWorkspaceCore(
      "content-generator",
      {
        itemType,
        title,
        draftContent: scaffold,
        brief: topic ?? requestText,
        stage: "starting compose",
        source: "generated",
      },
      {
        ackMessage: documentCreationOpenAck(kind, topic),
        seedOverride: {
          type: itemType !== "content" ? itemType : undefined,
          topic: title,
          brief: topic ?? requestText,
          draft: scaffold,
          autoGenerate: false,
        },
      },
    );
  }

  function beginWorkspaceChat(scope: WorkspaceChatScope, opener: string) {
    clearConversation();
    setMessages([{ role: "assistant", content: opener }]);
    workspaceChatScopeRef.current = scope;
    workspaceCoachSeededRef.current = null;
    setProjectCoachSession(null);
    setProjectCoachTopicPickerVisible(false);
    createBuilderBootstrappedRef.current = false;
  }

  function appendVerifiedWorkspaceMessage(
    section: AppSection,
    successMessage?: string,
    opts?: { appendOnly?: boolean; customOpener?: string },
  ) {
    const content = workspaceOpenAckVerified(
      section,
      getWorkspaceSnapshot(),
      successMessage,
    );
    if (isPurityScopedSection(section) && !opts?.appendOnly) {
      beginWorkspaceChat(
        { section },
        resolveWorkspaceOpener(section, opts?.customOpener),
      );
      return;
    }
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }

  const [workspaceDetail, setWorkspaceDetail] =
    useState<WorkspacePanelDetail | null>(null);
  const workspaceDetailRef = useRef(workspaceDetail);
  workspaceDetailRef.current = workspaceDetail;
  const [workspaceFocusField, setWorkspaceFocusField] =
    useState<WorkspaceFieldId | null>(null);
  const [workspaceFocusStamp, setWorkspaceFocusStamp] = useState(0);
  const [projectsBootstrapCreate, setProjectsBootstrapCreate] = useState(false);
  const [workspaceChatFill, setWorkspaceChatFill] = useState<{
    field: WorkspaceFieldId;
    value: string;
    stepId?: string;
    key: number;
  } | null>(null);

  /** Phase 0 — all workspace field writes route through WriteAction. */
  const applyWorkspaceWrite = useCallback(
    (
      action: WriteAction,
      opts?: { userText?: string; skipValidation?: boolean },
    ) =>
      applyWriteAction(
        action,
        {
          invalidateValue: (value, userText) =>
            isInvalidBuilderFieldValue(value, userText),
          onFill: (fill) => setWorkspaceChatFill(fill),
        },
        opts,
      ),
    [],
  );
  const [workspaceWorkflowAction, setWorkspaceWorkflowAction] = useState<{
    type: "advance" | "confirm" | "skip";
    key: number;
  } | null>(null);
  const [workspaceSession, setWorkspaceSession] =
    useState<WorkspaceSession | null>(null);
  const [pendingProjectChoices, setPendingProjectChoices] = useState<
    Project[] | null
  >(null);
  const [pendingDuplicateProject, setPendingDuplicateProject] =
    useState<Project | null>(null);
  const [creationContext, setCreationContext] =
    useState<CreationWorkspaceContext | null>(null);
  const creationContextRef = useRef<CreationWorkspaceContext | null>(null);
  creationContextRef.current = creationContext;

  const commitCreateWorkflowRecord = useCallback(
    (record: CreateWorkflowRecord) => {
      const splitActive = record.workflowState?.questionMode === "split_screen";
      if (!shouldPersistWorkflowRecord(record)) {
        createWorkflowRecordRef.current = null;
        createPanelWorkflowRef.current =
          record.workflowState ?? EMPTY_CREATE_WORKFLOW;
        saveWorkflowRecord(record);
        if (splitActive && workspacePanelRef.current === "content-generator") {
          setCreateBuilderSession(builderSessionFromRecord(record));
        } else {
          setCreateBuilderSession(null);
        }
        return;
      }
      createWorkflowRecordRef.current = record;
      const wf = workflowStateFromRecord(record);
      createPanelWorkflowRef.current = wf;
      saveWorkflowRecord(record);
      upsertCreateDraftEntry(record);
      setCreateBuilderSession(builderSessionFromRecord(record));
      const type = record.itemType;
      if (type || record.draftContent?.trim()) {
        const ctx =
          creationContextRef.current ??
          toCreationContext("content-generator", {
            itemType: type ?? "",
            title: "",
            draftContent: record.draftContent || undefined,
            brief: buildBriefFromRecord(record),
            stage: record.draftContent?.trim()
              ? "editing draft"
              : "discovery with Shari",
            source: "generated",
          });
        saveCreateSession({
          genSeed: {
            type: type ?? undefined,
            topic: type ?? undefined,
            brief: buildBriefFromRecord(record),
            draft: record.draftContent || undefined,
          },
          creationContext: {
            ...ctx,
            itemType: type ?? ctx.itemType,
            draftContent: record.draftContent || ctx.draftContent,
          },
          workspaceDetail: workspaceDetailRef.current,
          savedArtifact: savedArtifactRef.current,
        });
      }
    },
    [],
  );
  const [savedArtifact, setSavedArtifact] = useState<SavedArtifactRecord | null>(
    null,
  );
  const savedArtifactRef = useRef<SavedArtifactRecord | null>(null);
  savedArtifactRef.current = savedArtifact;
  const lastUserTextRef = useRef("");
  const [workspaceRevealSeq, setWorkspaceRevealSeq] = useState(0);
  const [founderActionTick, setFounderActionTick] = useState(0);

  const founderActionBoard = useMemo(() => {
    const events = eventStore.query({ founderId: FOUNDER_ID });
    return buildActionDashboard(events, FOUNDER_ID);
  }, [founderActionTick]);

  const revealWorkspace = useCallback(() => {
    dbgWorkspace("revealWorkspace");
    workspaceRevealSeqRef.current += 1;
    setWorkspaceRevealSeq((s) => s + 1);
  }, []);

  const workspaceContext = useMemo(() => {
    const detail =
      workspacePanel === "projects"
        ? resolveProjectWorkspaceDetail(workspaceDetail, projectContinueId)
        : workspaceDetail;
    return buildWorkspaceContext(workspacePanel, detail);
  }, [workspacePanel, workspaceDetail, projectContinueId]);

  const applyWorkspaceFocus = useCallback((field: WorkspaceFieldId | null) => {
    setWorkspaceFocusField(field);
    setWorkspaceFocusStamp((s) => (field ? s + 1 : 0));
  }, []);

  const persistCreateSession = useCallback(
    (
      live: CreateGenSeed & { title?: string },
      ctx: CreationWorkspaceContext | null,
      detail: WorkspacePanelDetail | null,
      artifact?: SavedArtifactRecord | null,
    ) => {
      if (!ctx) return;
      const genSeed: CreateGenSeed = {
        type: live.type || ctx.itemType,
        topic: live.topic || ctx.title,
        brief: live.brief || ctx.brief,
        draft: live.draft || ctx.draftContent || undefined,
        sourceText: live.sourceText,
      };
      if (!genSeed.type && !genSeed.draft?.trim()) return;
      saveCreateSession({
        genSeed,
        creationContext: {
          ...ctx,
          itemType: genSeed.type || ctx.itemType,
          title: live.title?.trim() || live.topic || ctx.title,
          draftContent: genSeed.draft ?? ctx.draftContent,
        },
        workspaceDetail: detail,
        savedArtifact: artifact ?? savedArtifactRef.current,
      });
      const activityTitle = live.title?.trim() || live.topic || ctx.title;
      const prev = getLastActivity();
      if (
        prev?.kind === "draft" &&
        prev.title === activityTitle &&
        prev.content === genSeed.draft &&
        prev.contentType === genSeed.type
      ) {
        return;
      }
      setLastActivity({
        kind: "draft",
        title: activityTitle,
        subtitle: genSeed.type || "content",
        contentType: genSeed.type,
        content: genSeed.draft,
      });
    },
    [],
  );

  const handleCreateSessionSync = useCallback(
    (live: {
      type: string;
      topic: string;
      brief: string;
      draft: string;
      title: string;
    }) => {
      if (isCreatePersistencePaused()) return;
      dbgWorkspace("handleCreateSessionSync", {
        type: live.type,
        draftLen: live.draft.length,
      });
      setCreationContext((prev) => {
        const base =
          prev ??
          toCreationContext("content-generator", {
            itemType: live.type || "content",
            title: live.title?.trim() || live.topic || "Draft",
            draftContent: live.draft,
            brief: live.brief,
            stage: live.draft?.trim() ? "editing draft" : "generating draft",
            source: "generated",
          });
        const next = {
          ...base,
          itemType: base.artifactTypeLocked
            ? base.itemType
            : normalizeArtifactType(live.type || base.itemType),
          title: live.title?.trim() || live.topic || base.title,
          draftContent: live.draft || base.draftContent,
          brief: live.brief || base.brief,
          stage: live.draft?.trim() ? "editing draft" : base.stage,
        };
        if (creationContextEqual(prev, next)) return prev;
        persistCreateSession(live, next, workspaceDetailRef.current);
        return next;
      });
      setGenSeed((prev) => {
        const ctx = creationContextRef.current;
        const lockedType = ctx?.artifactTypeLocked
          ? ctx.itemType
          : live.type || prev?.type;
        const next = {
          ...(prev ?? {}),
          type: lockedType,
          topic: live.topic || prev?.topic,
          brief: live.brief || prev?.brief,
          draft: live.draft || prev?.draft,
        };
        return genSeedEqual(prev, next) ? prev : next;
      });
      if (
        chatLayoutMode === "split" &&
        workspacePanelRef.current === "content-generator" &&
        live.type?.trim() &&
        !isUnresolvedCreateType(live.type) &&
        !live.draft?.trim()
      ) {
        syncCreateBuilderFromPanelType(live.type);
      }
    },
    [chatLayoutMode, persistCreateSession],
  );

  const handleSavedArtifactChange = useCallback(
    (record: SavedArtifactRecord) => {
      savedArtifactRef.current = record;
      setSavedArtifact(record);
      if (record.savedStatus === "saved" || record.savedStatus === "exported") {
        trackEcosystemEvent({
          eventType: "feature.create_completed",
          feature: "create",
          metadata: {
            documentId: record.savedWorkId ?? "",
            artifactType: record.artifactType,
            status: record.savedStatus,
          },
        });
      }
      const ctx = creationContextRef.current;
      if (!ctx) return;
      const live = loadCreateSession()?.genSeed;
      persistCreateSession(
        {
          type: record.artifactType || ctx.itemType,
          topic: ctx.title,
          brief: ctx.brief,
          draft: ctx.draftContent,
          title: record.artifactTitle,
        },
        ctx,
        workspaceDetailRef.current,
        record,
      );
    },
    [persistCreateSession],
  );

  const handleWorkspaceDetailChange = useCallback(
    (detail: WorkspacePanelDetail) => {
      setWorkspaceDetail((prev) => {
        if (
          detail.view === "list" &&
          !detail.selectedItemId &&
          prev?.view === "detail" &&
          prev.selectedItemId &&
          workspacePanelRef.current === "projects"
        ) {
          return prev;
        }
        return panelDetailEqual(prev, detail) ? prev : detail;
      });
      if (detail.selectedItemId) {
        setProjectContinueId(detail.selectedItemId);
      }
      if (workspacePanelRef.current === "projects") {
        saveProjectContinuity({
          projectContinueId:
            detail.selectedItemId ?? projectContinueIdRef.current,
          projectName: detail.selectedItemName ?? null,
          view: detail.view,
          workspacePanelOpen: true,
        });
      }
      if (detail.draftPreview) {
        setCreationContext((prev) => {
          if (!prev || prev.draftContent === detail.draftPreview) return prev;
          const next = { ...prev, draftContent: detail.draftPreview! };
          persistCreateSession(
            {
              type: prev.itemType,
              topic: prev.title,
              brief: prev.brief,
              draft: detail.draftPreview!,
            },
            next,
            detail,
          );
          return next;
        });
        const panel = workspacePanelRef.current;
        if (panel) {
          captureWorkspaceUsed(
            panel,
            { action: "draft_edit" },
            buildClosedLoopContext({
              emotionalState: lastEmotionalStateRef.current,
            }),
          );
        }
      }
      if (detail.selectedItemId && workspacePanelRef.current === "projects") {
        captureWorkspaceUsed(
          "projects",
          { action: "project_selected" },
          buildClosedLoopContext({
            emotionalState: lastEmotionalStateRef.current,
          }),
        );
      }
    },
    [persistCreateSession],
  );

  const createOpenRef = useRef({
    panel: null as AppSection | null,
    seed: null as GenSeed,
    ctx: null as CreationWorkspaceContext | null,
  });

  const restoreCreateSession = useCallback(
    (snapshot?: CreateSessionSnapshot | null, ack?: string): boolean => {
      let saved = snapshot ?? loadCreateSession();
      if (!saved?.genSeed?.type && !saved?.genSeed?.draft?.trim()) {
        const bookmark = loadWorkflowRecordForExplicitResume();
        if (bookmark) {
          saved = createSessionFromWorkflowRecord(bookmark);
        }
      }
      if (!saved?.genSeed) return false;
      if (!saved.genSeed.type && !saved.genSeed.draft?.trim()) return false;

      dbgWorkspace("restoreCreateSession", {
        hasAck: Boolean(ack),
        type: saved.genSeed.type,
      });

      setWorkspaceOffer(null);
      setToolSuggestion(null);
      setActionBridge(null);

      const open = createOpenRef.current;
      if (
        open.panel === "content-generator" &&
        genSeedEqual(open.seed, saved.genSeed) &&
        creationContextEqual(open.ctx, saved.creationContext)
      ) {
        dbgWorkspace("restoreCreateSession skipped — unchanged");
        if (ack) {
          setMessages((prev) => [...prev, { role: "assistant", content: ack }]);
        }
        return true;
      }

      patchWorkspacePanel("content-generator");
      setGenSeed((prev) =>
        genSeedEqual(prev, saved.genSeed) ? prev : saved.genSeed,
      );
      setCreationContext((prev) =>
        creationContextEqual(prev, saved.creationContext)
          ? prev
          : saved.creationContext,
      );
      setSavedArtifact(saved.savedArtifact ?? null);
      setWorkspaceDetail((prev) =>
        saved.workspaceDetail && panelDetailEqual(prev, saved.workspaceDetail)
          ? prev
          : saved.workspaceDetail,
      );
      setActiveSection("home");
      setActiveNav("other");
      applyWorkspaceFocus(null);
      setWorkspaceSession(null);

      if (ack) {
        setMessages((prev) => [...prev, { role: "assistant", content: ack }]);
      }
      const wfRecord = loadWorkflowRecordForExplicitResume();
      if (wfRecord) {
        createWorkflowRecordRef.current = wfRecord;
        createPanelWorkflowRef.current = workflowStateFromRecord(wfRecord);
        setCreateBuilderSession(builderSessionFromRecord(wfRecord));
      }
      return true;
    },
    [applyWorkspaceFocus, patchWorkspacePanel],
  );

  const handleSopFieldChange = useCallback((stepId: string, value: string) => {
    setWorkspaceSession((prev) => {
      if (!prev) return prev;
      const next = normalizeSession(setSopStepValue(prev, stepId, value));
      return workspaceSessionEqual(prev, next) ? prev : next;
    });
  }, []);

  const handleProjectsBootstrapDone = useCallback(() => {
    setProjectsBootstrapCreate(false);
  }, []);

  const handleWorkspaceProjectSaved = useCallback(
    (projectId: string, projectTitle: string) => {
      setProjectContinueId(projectId);
      setWorkspaceSession((prev) => {
        if (!prev) return prev;
        const next = normalizeSession(
          syncSessionProjectMeta(prev, {
            projectId,
            projectTitle,
            savedStatus: "saved",
          }),
        );
        return next === prev ? prev : next;
      });
    },
    [],
  );

  const openWorkspaceWithSession = useCallback(
    (session: WorkspaceSession, ack: string) => {
      const normalized = normalizeSession(session);
      setWorkspaceOffer(null);
      setToolSuggestion(null);
      patchWorkspacePanel("projects");
      setWorkspaceDetail(emptyWorkspaceDetail());
      setActiveSection("home");
      setActiveNav("projects");
      setProjectsBootstrapCreate(false);
      setProjectContinueId(
        normalized.savedStatus === "saved" && normalized.projectId
          ? normalized.projectId
          : null,
      );
      if (normalized.projectId) {
        saveProjectContinuity({
          projectContinueId: normalized.projectId,
          projectName: normalized.projectTitle ?? null,
          view: "detail",
          workspacePanelOpen: true,
        });
      }
      setActiveSection("home");
      activeSectionRef.current = "home";
      setWorkspaceSession(normalized);
      saveWorkspaceSession(normalized);
      revealWorkspace();
      const { field, content } = extractFocusDirective(ack);
      appendVerifiedWorkspaceMessage("projects", content, {
        customOpener: content,
      });
      applyWorkspaceFocus(field);
    },
    [applyWorkspaceFocus, revealWorkspace],
  );

  useEffect(() => {
    const session = guideBesideSession;
    if (
      session?.source.kind === "section" &&
      shouldWalkThroughFromHowDoI(session.source.section)
    ) {
      openHowDoIToolWalkthrough(session.targetSection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideBesideSession]);

  useEffect(() => {
    if (!workspaceActiveBeside) {
      workspaceCoachSeededRef.current = null;
      prevWorkspacePanelRef.current = null;
      setAvatarCoachActive(false);
      setBuilderKickoffActive(false);
      return;
    }
    if (shouldSuppressWorkspaceCoachForPhase1()) return;
    if (workspacePanel !== prevWorkspacePanelRef.current) {
      workspaceCoachSeededRef.current = null;
      prevWorkspacePanelRef.current = workspacePanel;
    }
    const section =
      workspacePanel ??
      companionStandaloneSection ??
      (guideBesideSession?.source.kind === "activity"
        ? activitySession.activityId
          ? standaloneSectionForActivity(activitySession.activityId)
          : ("focus" as const)
        : guideBesideSession?.source.kind === "section"
          ? guideBesideSession.source.section
          : null);
    if (!section) return;
    if (isWorkspaceCoachSilent(section)) return;
    if (section === "client-avatars" && avatarCoachActive) {
      return;
    }
    if (
      section === "content-generator" &&
      (createBuilderBootstrappedRef.current || splitCreateChat)
    ) {
      return;
    }
    if (
      section === "playbook" &&
      strategyApplySessionRef.current &&
      strategyApplySessionRef.current.phase !== "done"
    ) {
      return;
    }
    seedWorkspaceCoachAutoStart(false);
  }, [
    workspaceDetail,
    chatLayoutMode,
    workspacePanel,
    companionStandaloneSection,
    avatarCoachActive,
    guideBesideSession,
    creationContext,
    activitySession,
    pomodoroTimer.isActive,
    pomodoroTimer.label,
    pomodoroTimer.displayMins,
    workspaceActiveBeside,
    splitCreateChat,
  ]);

  useEffect(() => {
    if (!workspaceSession) return;
    saveWorkspaceSession(workspaceSession);
  }, [workspaceSession]);

  // Create is a workspace, not a full-page section — keep split view mounted.
  useEffect(() => {
    if (!workspacePanel || activeSection === "home") return;
    setActiveSection("home");
    if (workspacePanel === "content-generator") setActiveNav("other");
  }, [workspacePanel, activeSection]);

  useEffect(() => {
    if (!workspaceDetail) return;
    setWorkspaceSession((prev) => {
      if (!prev) return prev;
      const next = normalizeSession(
        syncSessionProjectMeta(prev, {
          projectId: workspaceDetail.selectedItemId ?? prev.projectId,
          projectTitle:
            workspaceDetail.selectedItemName?.trim() || prev.projectTitle,
          savedStatus:
            workspaceDetail.view === "detail" && workspaceDetail.selectedItemId
              ? "saved"
              : prev.savedStatus,
        }),
      );
      return workspaceSessionEqual(prev, next) ? prev : next;
    });
  }, [
    workspaceDetail?.view,
    workspaceDetail?.selectedItemId,
    workspaceDetail?.selectedItemName,
  ]);

  useEffect(() => {
    if (activeSection !== "home") return;
    if (workspacePanel && chatLayoutMode === "workspace-focus") return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    messages,
    isLoading,
    activeSection,
    toolSuggestion,
    actionBridge,
    workspaceOffer,
    workspacePanel,
    chatLayoutMode,
  ]);

  function appendRecoveryMessage(content: string) {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }

  function restoreStrategyApplySession(ack?: string): boolean {
    const snap = loadStrategyApplySession();
    if (!snap) return false;
    const session = toStrategyApplySession(snap);
    setBusinessStrategyDraft(null);
    setBusinessStrategySession(null);
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("playbook");
    if (workspacePanel !== "playbook") {
      patchWorkspacePanel("playbook");
    }
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    applyChatLayoutMode("split");
    revealWorkspace();
    setCoachingMode("playbook");
    setStrategyPanelCommand({ key: Date.now(), strategyId: snap.strategyId });
    setStrategyApplySession(session);
    saveStrategyApplySession(session, { workspacePanelOpen: true });
    if (ack) appendRecoveryMessage(ack);
    return true;
  }

  function handleStartupOpenTarget(target: StartupOpenTarget) {
    switch (target.kind) {
      case "section":
        openSectionBesideChatCore(target.section, target.nav);
        break;
      case "saved-work": {
        const item = getSavedWorkById(target.savedWorkId);
        if (item) {
          openSavedWorkInCreate(
            item,
            buildSavedArtifactRecoveryMessage(recordFromSavedWork(item), true),
          );
        } else {
          openSectionBesideChatCore("saved-work", "saved-work");
        }
        break;
      }
      case "create-draft":
        captureWorkspaceReturned(
          "content-generator",
          buildClosedLoopContext({
            emotionalState: lastEmotionalStateRef.current,
            routingReason: "home_resume",
          }),
        );
        restoreCreateSession(undefined, resumeReceiptForContinuityType("create-draft"));
        break;
      case "resume": {
        const latest = findLatestHomeResumeItem();
        if (latest) resumeHomeItem(latest);
        break;
      }
    }
  }

  function resumeHomeItem(item: HomeResumeItem) {
    switch (item.kind) {
      case "create":
        restoreCreateSession(
          undefined,
          resumeReceiptForContinuityType("create-draft"),
        );
        break;
      case "project":
        setProjectContinueId(item.projectId ?? null);
        if (item.projectId) {
          setProjectsResumeId(item.projectId);
          saveProjectContinuity({
            projectContinueId: item.projectId,
            projectName: item.title,
            view: "detail",
            workspacePanelOpen: false,
          });
          openSectionBesideChatCore("projects", "projects");
        } else {
          setActiveSection("projects");
          setActiveNav("projects");
        }
        appendRecoveryMessage(
          resumeReceiptForContinuityType("project", item.title),
        );
        break;
      case "client-avatar":
        if (item.avatarId) setActiveAvatar(item.avatarId);
        openWorkspaceBesideChatCore(
          "client-avatars",
          workspaceOpenAck("client-avatars"),
        );
        appendRecoveryMessage(resumeReceiptForContinuityType("client-avatar"));
        break;
      case "workspace":
        if (item.projectId) setProjectContinueId(item.projectId);
        openWorkspaceBesideChatCore("projects", workspaceOpenAck("projects"));
        appendRecoveryMessage(
          resumeReceiptForContinuityType("workspace-sop", item.title),
        );
        break;
      case "decision-compass":
        captureWorkspaceReturned(
          "decision-compass",
          buildClosedLoopContext({
            emotionalState: lastEmotionalStateRef.current,
            routingReason: "home_resume",
          }),
        );
        openDecisionCompass();
        appendRecoveryMessage(resumeReceiptForContinuityType("decision-compass"));
        break;
      case "quick-two-option": {
        const activity = getActivityById("two-option");
        if (activity) {
          openActivityFullPageCore({
            ...EMPTY_ACTIVITY_SESSION,
            activityId: "two-option",
            stepIndex: 0,
            phase: "active",
            categoryId: activity.categoryId,
          });
        }
        appendRecoveryMessage(
          "Welcome back — continue your **Quick Two Option Choice**.",
        );
        break;
      }
      case "strategy":
        if (item.strategyId) {
          restoreStrategyApplySession(
            resumeReceiptForContinuityType("strategy-apply", item.title),
          );
        } else {
          setActiveSection("playbook");
          setActiveNav("playbook");
          appendRecoveryMessage(
            resumeReceiptForContinuityType("strategy-apply", item.title),
          );
        }
        break;
      case "visual-focus": {
        const mapId = item.id.replace(/^visual-focus:/, "");
        openVisualFocusMapCore(mapId, true);
        appendRecoveryMessage(
          resumeReceiptForContinuityType("visual-focus-map", item.title),
        );
        break;
      }
    }
  }

  function openVisualFocusMapCore(mapId: string, preferGenerated = true) {
    queueVisualFocusOpen(mapId, preferGenerated);
    openWorkspaceBesideChatCore("visual-focus", workspaceOpenAck("visual-focus"));
  }

  function openDecisionCompass(prefill?: DecisionCompassPrefill | null) {
    clearParallelCoachingOffers();
    setGuideBesideSession(null);
    setActivitySession(EMPTY_ACTIVITY_SESSION);

    let opener: string;
    let snapshot: PersistedDecisionCompassSession;

    if (prefill?.decision?.trim()) {
      clearDecisionCompassSession();
      const authority = createDecisionCompassAuthority(prefill);
      snapshot = snapshotFromAuthority(authority);
      setDecisionCompassPrefill(prefill);
      opener = decisionCompassFreshOpener(prefill);
    } else {
      const restored = loadDecisionCompassAuthority();
      if (restored) {
        snapshot = snapshotFromAuthority(restored);
        setDecisionCompassPrefill(null);
        opener = decisionCompassResumeOpener(restored);
      } else {
        const authority = createDecisionCompassAuthority(null);
        snapshot = snapshotFromAuthority(authority);
        setDecisionCompassPrefill(null);
        opener = decisionCompassFreshOpener(null);
      }
    }

    setDecisionCompassSession(snapshot);
    saveDecisionCompassSession(snapshot);

    if (workspacePanel === "decision-compass") {
      setActiveSection("home");
      activeSectionRef.current = "home";
      focusWorkspaceLayout();
      revealWorkspace();
      beginWorkspaceChat({ section: "decision-compass" }, opener);
      return;
    }

    patchWorkspacePanel("decision-compass");
    setWorkspaceDetail(emptyWorkspaceDetail());
    setCreationContext(null);
    applyWorkspaceFocus(null);
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("chat");
    setWorkspaceSession(null);
    applyChatLayoutMode("split");
    revealWorkspace();
    beginWorkspaceChat({ section: "decision-compass" }, opener);
  }

  function continueWork(a: LastActivity | RecentWorkItem) {
    if (a.kind === "draft") {
      if (isExplicitCreateResumeRequest(lastUserTextRef.current)) {
        if (restoreCreateSession()) return;
      }
      const itemType = a.contentType || "content";
      openCreateWithResolvedArtifact(
        {
          itemType,
          title: a.title,
          draftContent: a.content ?? "",
          source: "last-activity",
          artifactTypeLocked: shouldLockArtifactType(itemType),
        },
        "Picking up your draft — it's open beside you.",
      );
    } else if (a.kind === "project") {
      setProjectContinueId(a.projectId ?? null);
      setActiveSection("projects");
    } else {
      setActiveNav("chat");
      setActiveSection("home");
      void handleSend(`Let's continue where we left off: ${a.title}`, false);
    }
  }
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  async function playTTS(text: string) {
    // Voice is metered per plan. Out of minutes → don't spend the API call.
    const vs = getVoiceStatus();
    if (!vs.hasVoice || vs.leftMin <= 0) {
      setVoiceOutput(false);
      setVoiceBlocked(true);
      return;
    }
    try {
      ttsAudioRef.current?.pause();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => {
        addVoiceSeconds(audio.duration || 0);
        URL.revokeObjectURL(url);
      };
      void audio.play();
    } catch {
      /* voice optional */
    }
  }

  // The content generator opens prefilled from a template or a content type.
  const [genSeed, setGenSeed] = useState<GenSeed>(null);
  createOpenRef.current = {
    panel: workspacePanel,
    seed: genSeed,
    ctx: creationContext,
  };

  function createDraftVisibleInUI(): boolean {
    return (
      workspacePanel === "content-generator" &&
      Boolean(
        genSeed?.draft?.trim() ||
          creationContext?.draftContent?.trim() ||
          workspaceDetail?.draftPreview?.trim(),
      )
    );
  }

  function openGenerator(seed: GenSeed) {
    if (workspacePanel === "content-generator") {
      setActiveSection("home");
      setActiveNav("other");
      if (seed) setGenSeed(seed);
      return;
    }
    if (!seed) {
      if (
        tryOpenCreateForCurrentArtifact(lastUserTextRef.current, {
          allowStoredSession: isExplicitCreateResumeRequest(
            lastUserTextRef.current,
          ),
        })
      ) {
        return;
      }
      if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession()
      ) {
        return;
      }
    } else {
      openCreationWorkspaceCore(
        "content-generator",
        {
          itemType: seed.type || "content",
          title: seed.topic || seed.brief || seed.type || "Draft",
          draftContent: seed.draft ?? "",
          brief: seed.brief ?? seed.topic,
          stage: seed.draft?.trim() ? "editing draft" : "starting compose",
          source: "generated",
        },
        { seedOverride: seed },
      );
      return;
    }
    setGenSeed(null);
    setActiveSection("content-generator");
  }

  function buildCreateOpenContext(): CreateOpenContext {
    const ctx = creationContextRef.current;
    const stored = loadCreateSession();
    return {
      createPanelOpen: workspacePanelRef.current === "content-generator",
      lockedType: ctx?.artifactTypeLocked ? ctx.itemType : null,
      currentDraftType: ctx?.itemType ?? stored?.creationContext?.itemType ?? null,
      currentDraftContent:
        ctx?.draftContent?.trim() ||
        stored?.creationContext?.draftContent?.trim() ||
        genSeed?.draft?.trim() ||
        "",
      storedSessionType: stored?.creationContext?.itemType ?? null,
      userText: lastUserTextRef.current,
      lastAssistantText:
        [...messages].reverse().find((m) => m.role === "assistant")?.content ??
        "",
    };
  }

  function postCreateTransparencyMessage(content: string) {
    const line = content.trim();
    if (!line) return;
    setMessages((prev) => [...prev, { role: "assistant", content: line }]);
  }

  type CreateOpenMeta = {
    source?: CreateOpenSource;
    userInitiated?: boolean;
    userText?: string;
    consentGranted?: boolean;
    skipConsentCheck?: boolean;
    conversationHandoff?: boolean;
    artifact?: import("@/lib/createInitialization").ResolvedArtifact;
  };

  function mapCreateSourceToRoute(
    source: CreateOpenSource | undefined,
  ): import("@/lib/companionRoutingExecutor").RouteSource {
    switch (source) {
      case "ui_nav":
      case "ui_button":
        return "ui_nav";
      case "governor":
        return "governor";
      case "founder":
        return "founder_action";
      case "resume":
        return "recovery";
      case "handoff":
      case "chat":
      case "ensure_live_create":
        return "chat_turn";
      default:
        return "internal";
    }
  }

  function executeCreateOpenInternal(
    section: AppSection,
    input: CreationWorkspaceInput,
    opts?: {
      ackMessage?: string;
      silent?: boolean;
      seedOverride?: GenSeed;
      savedArtifact?: SavedArtifactRecord | null;
    },
  ) {
    const ctx = toCreationContext(section, input);
    const nextSeed: GenSeed =
      section === "content-generator"
        ? (opts?.seedOverride ?? {
            type:
              ctx.itemType && ctx.itemType !== "content"
                ? ctx.itemType
                : undefined,
            brief: ctx.brief ?? ctx.title,
            topic: ctx.title,
            draft: ctx.draftContent || undefined,
            sourceText:
              ctx.source === "snippet" ? ctx.draftContent : undefined,
            createWorkflow: input.createWorkflow,
          })
        : null;

    if (
      section === "content-generator" &&
      workspacePanel === "content-generator" &&
      input.draftContent?.trim() &&
      !opts?.ackMessage
    ) {
      syncCreatePanelDraft(
        {
          itemType:
            input.itemType && input.itemType !== "content"
              ? input.itemType
              : creationContextRef.current?.itemType ?? "Document",
          title: input.title,
          draftContent: input.draftContent,
          source: "generated",
          artifactTypeLocked:
            input.artifactTypeLocked ??
            creationContextRef.current?.artifactTypeLocked ??
            false,
        },
        { merge: true, instruction: input.brief ?? lastUserTextRef.current },
      );
      setActiveSection("home");
      setActiveNav("other");
      focusWorkspaceLayout();
      revealWorkspace();
      return;
    }

    if (
      section === "content-generator" &&
      workspacePanel === "content-generator" &&
      !opts?.ackMessage &&
      creationContextEqual(creationContext, ctx) &&
      genSeedEqual(genSeed, nextSeed)
    ) {
      dbgWorkspace("openCreationWorkspace skipped — already open");
      setActiveSection("home");
      setActiveNav("other");
      return;
    }

    dbgWorkspace("openCreationWorkspace", { section, title: ctx.title });

    if (section === "content-generator") {
      setCreateExportReady(false);
    }

    setCreationContext((prev) => (creationContextEqual(prev, ctx) ? prev : ctx));
    setWorkspaceOffer(null);
    setToolSuggestion(null);
    setActionBridge(null);
    setActiveSection("home");
    activeSectionRef.current = "home";

    if (section === "content-generator") {
      setGenSeed((prev) => (genSeedEqual(prev, nextSeed) ? prev : nextSeed));
      patchWorkspacePanel("content-generator");
      setActiveNav("other");
    } else if (section === "projects") {
      setProjectContinueId(ctx.linkedProjectId ?? null);
      patchWorkspacePanel("projects");
      setActiveNav("projects");
    } else {
      patchWorkspacePanel(section);
      setActiveNav("chat");
    }

    const panelDetail: WorkspacePanelDetail = {
      view: section === "projects" ? "detail" : "create",
      stage: ctx.stage,
      selectedItemName: ctx.title,
      selectedItemId: ctx.linkedProjectId,
      selectedItemGoal: ctx.brief ?? null,
      draftPreview: ctx.draftContent
        ? ctx.draftContent.slice(0, 8000)
        : null,
    };
    setWorkspaceDetail((prev) =>
      panelDetailEqual(prev, panelDetail) ? prev : panelDetail,
    );
    applyWorkspaceFocus(null);

    if (section === "content-generator") {
      setWorkspaceSession(null);
      clearWorkspaceSession();
      setSavedArtifact(opts?.savedArtifact ?? null);
    } else {
      const day = getDayState();
      const energy = resolveWorkspaceEnergy(
        day?.energy,
        ctx.brief ?? ctx.title,
        day?.overwhelm,
      );
      let session = normalizeSession(
        createWorkspaceSession(section, ctx.brief ?? ctx.title, energy),
      );
      if (ctx.linkedProjectId && ctx.linkedProjectName) {
        session = normalizeSession(
          syncSessionProjectMeta(session, {
            projectId: ctx.linkedProjectId,
            projectTitle: ctx.linkedProjectName,
            savedStatus: "saved",
          }),
        );
      }
      setWorkspaceSession(session);
      saveWorkspaceSession(session);
    }

    if (section === "content-generator") {
      const liveSeed =
        opts?.seedOverride ??
        ({
          type:
            ctx.itemType && ctx.itemType !== "content"
              ? ctx.itemType
              : undefined,
          brief: ctx.brief ?? ctx.title,
          topic: ctx.title,
          draft: ctx.draftContent || undefined,
        } satisfies CreateGenSeed);
      persistCreateSession(
        liveSeed,
        ctx,
        panelDetail,
        opts?.savedArtifact ?? savedArtifactRef.current,
      );
    }
    if (
      section === "content-generator" &&
      isCreateWorkspaceV2Phase(
        createPanelWorkflowRef.current,
        createBuilderSessionRef.current?.phase ?? null,
      )
    ) {
      applyChatLayoutMode("split");
    } else {
      focusWorkspaceLayout();
    }
    revealWorkspace();
  }

  function requestCreateOpen(
    section: AppSection,
    input: CreationWorkspaceInput,
    opts?: {
      ackMessage?: string;
      silent?: boolean;
      seedOverride?: GenSeed;
      savedArtifact?: SavedArtifactRecord | null;
    },
    meta?: CreateOpenMeta,
  ): boolean {
    if (section !== "content-generator") {
      routingExecutorRef.current.execute({
        routeId: "create.open",
        source: mapCreateSourceToRoute(meta?.source),
        section,
        silent: false,
        itemType: input.itemType || undefined,
      });
      executeCreateOpenInternal(section, input, opts);
      if (!opts?.silent && opts?.ackMessage) {
        postCreateTransparencyMessage(opts.ackMessage);
      }
      return true;
    }

    const source = meta?.source ?? "artifact";
    const req = {
      source,
      section,
      input,
      artifact: meta?.artifact,
      userInitiated: meta?.userInitiated,
      userText: meta?.userText ?? lastUserTextRef.current,
      lastAssistantText: buildCreateOpenContext().lastAssistantText,
      consentGranted: meta?.consentGranted,
      skipConsentCheck: meta?.skipConsentCheck,
    };
    const decision = evaluateCreateOpen(req, buildCreateOpenContext());

    if (decision.action === "artifact_lock" || decision.action === "blocked") {
      postCreateTransparencyMessage(decision.message);
      return false;
    }
    if (decision.action === "offer" || decision.action === "draft_switch") {
      setPendingCreateOpen(decision.pending);
      registerPendingAcceptance(
        decision.action === "draft_switch" ? "draft_switch" : "create_consent",
        decision.message,
      );
      postCreateTransparencyMessage(decision.message);
      return false;
    }

    if (decision.action === "sync_draft") {
      syncCreatePanelDraft(
        {
          itemType: input.itemType || "Document",
          title: input.title,
          draftContent: input.draftContent ?? "",
          source: "generated",
          artifactTypeLocked:
            input.artifactTypeLocked ??
            creationContextRef.current?.artifactTypeLocked ??
            false,
        },
        { merge: true, instruction: input.brief ?? lastUserTextRef.current },
      );
      postCreateTransparencyMessage(
        opts?.ackMessage ??
          createReceiptMessage(decision.receipt, {
            itemType: input.itemType,
          }),
      );
      return true;
    }

    routingExecutorRef.current.execute({
      routeId: "create.open",
      source: mapCreateSourceToRoute(source),
      section,
      silent: false,
      itemType: input.itemType || undefined,
    });

    executeCreateOpenInternal(section, input, { ...opts, silent: true });

    if (decision.action !== "open") return false;

    const receipt =
      opts?.ackMessage ??
      createReceiptMessage(decision.receipt, { itemType: input.itemType });
    if (meta?.conversationHandoff) {
      beginWorkspaceChat(
        { section: "content-generator" },
        `${receipt}\n\n${buildRecoveryOfferLine()}`,
      );
    } else if (meta?.userInitiated) {
      beginWorkspaceChat(
        { section: "content-generator" },
        resolveWorkspaceOpener("content-generator"),
      );
      if (decision.receipt !== "create_opened") {
        postCreateTransparencyMessage(receipt);
      }
    } else {
      beginWorkspaceChat({ section: "content-generator" }, receipt);
    }
    setPendingCreateOpen(null);
    return true;
  }

  function openCreationWorkspaceCore(
    section: AppSection,
    input: CreationWorkspaceInput,
    opts?: {
      ackMessage?: string;
      /** @deprecated Phase C — all opens are acknowledged; never silent */
      silent?: boolean;
      seedOverride?: GenSeed;
      savedArtifact?: SavedArtifactRecord | null;
    },
    meta?: CreateOpenMeta,
  ) {
    return requestCreateOpen(section, input, opts, {
      source: "ui_button",
      userInitiated: true,
      ...meta,
    });
  }

  function isLiveCreateWorkspaceActive(): boolean {
    return workspacePanelRef.current === "content-generator";
  }

  function getActiveParentWorkflow(): ParentWorkflowContext | null {
    const strategy = buildParentWorkflowFromStrategy(
      businessStrategySessionRef.current,
      businessStrategyDraft?.draft ??
        businessStrategySessionRef.current?.draft,
    );
    if (strategy) return strategy;
    if (workspacePanelRef.current === "projects") {
      const detail = workspaceDetailRef.current;
      return buildParentWorkflowFromProject(
        detail?.selectedItemName,
        detail?.selectedItemGoal,
      );
    }
    const ctxParent = creationContextRef.current;
    if (ctxParent?.parentWorkflowTitle?.trim()) {
      return {
        kind: "marketing_plan",
        title: ctxParent.parentWorkflowTitle.trim(),
        summary: ctxParent.brief ?? undefined,
        panel: ctxParent.parentWorkflowPanel ?? "playbook",
      };
    }
    return null;
  }

  function shouldBootstrapCreateBuilder(): boolean {
    const parent = getActiveParentWorkflow();
    const wf = createPanelWorkflowRef.current;
    return !shouldSuppressCreateBuilderBootstrap({
      parent,
      hasDraftInPanel: Boolean(
        creationContextRef.current?.draftContent?.trim() ||
          genSeed?.draft?.trim(),
      ),
      workflowIsLiveDraft: wf.step === "improve" && wf.buildApproved,
      recentUserText: lastUserTextRef.current,
    });
  }

  function draftPermissionBlocked(
    userText: string,
    lastAssistant = "",
  ): boolean {
    return shouldBlockDraftPanelFromChat(userText, lastAssistant, {
      liveCreateOpen: isLiveCreateWorkspaceActive(),
      activeWorkspaceSection: workspacePanelRef.current,
    });
  }

  function scrollCreateDraftTo(target?: string | null) {
    if (!target?.trim()) return;
    setCreateDraftScrollTarget(target);
    setCreateDraftScrollStamp(Date.now());
  }

  function syncCreatePanelDraft(
    artifact: ResolvedArtifact,
    opts?: {
      merge?: boolean;
      instruction?: string;
      parent?: ParentWorkflowContext | null;
    },
  ) {
    if (draftPermissionBlocked(lastUserTextRef.current)) return;

    const parent = opts?.parent ?? getActiveParentWorkflow();
    const childRequest =
      opts?.instruction ??
      lastChildArtifactRequestInChat(toChatTurns(messages)) ??
      lastUserTextRef.current;

    let itemType = artifact.itemType;
    let title = artifact.title;
    let draftContent = artifact.draftContent;
    let brief = artifact.title;

    if (parent) {
      const enriched = enrichChildArtifactFromParent(
        { itemType, title, draftContent },
        parent,
        childRequest,
      );
      itemType = enriched.itemType;
      draftContent = enriched.draftContent;
      brief = enriched.brief;
    }

    const instruction = opts?.instruction ?? lastUserTextRef.current;
    const incremental =
      isPartialComponentRequest(instruction) ||
      isPartialComponentRequest(childRequest) ||
      Boolean(
        creationContextRef.current?.draftContent?.trim() ||
          genSeed?.draft?.trim(),
      );

    title = resolveCollaborativeDraftTitle({
      itemType,
      userText: instruction || childRequest,
      existingTitle:
        creationContextRef.current?.title ??
        userFacingCreateTypeLabel(itemType) ??
        title,
    });
    const displayTitle = userFacingCreateTypeLabel(itemType) ?? title;

    const existingDraft =
      creationContextRef.current?.draftContent?.trim() ||
      genSeed?.draft?.trim() ||
      "";
    const section = inferFragmentSection(instruction || childRequest);
    const merged = section || isPartialComponentRequest(instruction)
      ? mergeFragmentIntoStructuredDraft(existingDraft, draftContent, section)
      : mergeChatContentIntoDraft(existingDraft, draftContent, {
          instruction,
        });
    const nextDraft = merged.draft;
    const wf = liveCreateWorkflowState(itemType, createPanelWorkflowRef.current, {
      incremental: incremental || Boolean(existingDraft),
    });
    createPanelWorkflowRef.current = wf;
    if (!incremental) {
      setCreateBuilderSession(null);
      createBuilderBootstrappedRef.current = true;
    }

    const baseRecord =
      createWorkflowRecordRef.current ?? loadWorkflowRecord() ?? null;
    if (baseRecord) {
      commitCreateWorkflowRecord(
        mergeRecordFromWorkflow(baseRecord, wf, "chat"),
      );
    }

    const ctx = toCreationContext("content-generator", {
      itemType,
      title: displayTitle,
      draftContent: nextDraft,
      brief,
      stage: wf.draftStatus === "building" ? "building draft" : "editing draft",
      source: "chat",
      artifactTypeLocked:
        artifact.artifactTypeLocked ??
        creationContextRef.current?.artifactTypeLocked ??
        shouldLockArtifactType(itemType),
      parentWorkflowTitle: parent?.title ?? null,
      parentWorkflowPanel: parent?.panel ?? null,
    });
    setCreationContext((prev) =>
      creationContextEqual(prev, ctx) ? prev : ctx,
    );
    const nextSeed: GenSeed = {
      type: itemType,
      topic: displayTitle,
      brief,
      draft: nextDraft,
      autoGenerate: false,
    };
    setGenSeed((prev) => (genSeedEqual(prev, nextSeed) ? prev : nextSeed));
    setCreateExportReady(
      wf.draftStatus === "ready" && Boolean(nextDraft.trim()),
    );
    setWorkspaceDetail((prev) => {
      const next: WorkspacePanelDetail = {
        view: "create",
        stage: wf.draftStatus === "building" ? "Building draft" : "Editing draft",
        selectedItemName: displayTitle,
        selectedItemStatus:
          wf.draftStatus === "building" ? "Building" : "Draft ready",
        draftPreview: nextDraft,
      };
      return prev && panelDetailEqual(prev, next) ? prev : next;
    });
    persistCreateSession(
      {
        type: itemType,
        topic: displayTitle,
        brief,
        draft: nextDraft,
        title: displayTitle,
      },
      ctx,
      workspaceDetailRef.current,
    );
    if (workspacePanelRef.current !== "content-generator") {
      patchWorkspacePanel("content-generator");
    }
    if (parent?.panel === "playbook") {
      setActiveNav("playbook");
      setCoachingMode("playbook");
    } else {
      setActiveNav("other");
    }
    setActiveSection("home");
    if (
      isCreateWorkspaceV2Phase(
        wf,
        createBuilderSessionRef.current?.phase ?? null,
      )
    ) {
      stayInCreateSplitScreen();
    } else {
      focusWorkspaceLayout();
    }
    revealWorkspace();
    scrollCreateDraftTo(merged.scrollTarget);
  }

  function applyConversationToLiveCreate(
    messagesForExtract: Message[],
    opts?: { instruction?: string; ack?: string },
  ): boolean {
    const parent = getActiveParentWorkflow();
    const fromChat = extractArtifactFromChat(toChatTurns(messagesForExtract));
    if (!fromChat) return false;

    const childRequest =
      opts?.instruction ??
      lastChildArtifactRequestInChat(toChatTurns(messagesForExtract)) ??
      "";

    syncCreatePanelDraft(
      {
        ...fromChat,
        source: "chat",
        artifactTypeLocked:
          creationContextRef.current?.artifactTypeLocked ??
          shouldLockArtifactType(fromChat.itemType),
      },
      { merge: true, instruction: opts?.instruction, parent },
    );

    if (opts?.ack) {
      const ack = opts.ack;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: ack },
      ]);
    } else if (parent && childRequest) {
      const label =
        enrichChildArtifactFromParent(
          {
            itemType: fromChat.itemType,
            title: fromChat.title,
            draftContent: fromChat.draftContent,
          },
          parent,
          childRequest,
        ).title;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: strategyChildArtifactFollowUp(parent, label),
        },
      ]);
    } else if (
      isPartialComponentRequest(opts?.instruction ?? "") ||
      createPanelWorkflowRef.current.draftStatus === "building"
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: collaborativeDraftFollowUp(fromChat.itemType, {
            offerCompleteBuild: shouldOfferCompleteDraftBuild(
              creationContextRef.current?.draftContent ??
                genSeed?.draft ??
                fromChat.draftContent,
            ),
          }),
        },
      ]);
    }
    return true;
  }

  function ensureLiveCreateBesideChat(userText: string): boolean {
    if (isChatConversationOnlyMode()) return false;
    if (isLiveCreateWorkspaceActive()) return false;
    if (getActiveParentWorkflow()) return false;
    if (isChildArtifactRequest(userText)) return false;
    if (!hasCreateIntent(userText) || shouldBlockArtifactPipeline(userText)) {
      return false;
    }
    const catalog = matchCatalogFromText(userText);
    if (!catalog?.type) return false;
    const itemType = catalog.type;
    const scaffold = collaborativeScaffoldForType(itemType);
    const opened = requestCreateOpen(
      "content-generator",
      {
        itemType,
        title: `New ${itemType}`,
        draftContent: scaffold,
        brief: userText,
        stage: "editing draft",
        source: "generated",
        artifactTypeLocked: shouldLockArtifactType(itemType),
      },
      {
        seedOverride: {
          type: itemType,
          topic: `New ${itemType}`,
          brief: userText,
          draft: scaffold,
          autoGenerate: false,
        },
      },
      { source: "ensure_live_create", userText },
    );
    if (opened) {
      const wf = liveCreateWorkflowState(itemType);
      createPanelWorkflowRef.current = wf;
    }
    return opened;
  }

  function tryChatCreateHandoff(
    userText: string,
    lastAssistantText: string,
    chatMessages?: Message[],
  ): boolean {
    if (!userGrantedDraftPermission(userText, lastAssistantText)) {
      return false;
    }
    const dest = inferHandoffDestination(lastAssistantText, userText);
    if (!dest && !isEmailToolHandoffRequest(userText) && !isGoogleDocHandoffRequest(userText)) {
      return false;
    }

    const turns = toChatTurns(chatMessages ?? messages);
    const artifact = resolveChatHandoffArtifact(turns, {
      userText,
      lastAssistantText,
      hintType: dest === "email" ? "Email" : dest === "google-doc" ? "Document" : undefined,
    });

    if (artifact?.draftContent?.trim()) {
      openCreateWithResolvedArtifact(
        artifact,
        buildChatHandoffAck(artifact),
        dest === "google-doc" ? "google-doc" : null,
        { source: "handoff", consentGranted: true },
      );
      clearPendingChatArtifact();
      return true;
    }

    if (dest === "email") {
      const itemType = "Email";
      const scaffold = blankScaffoldForType(itemType);
      openCreationWorkspaceCore(
        "content-generator",
        {
          itemType,
          title: "Email Draft",
          draftContent: scaffold,
          brief: lastAssistantText.slice(0, 200),
          stage: "building draft",
          source: "generated",
          artifactTypeLocked: true,
        },
        {
          ackMessage: createReceiptMessage("draft_created", { itemType }),
          seedOverride: {
            type: itemType,
            topic: "Email Draft",
            brief: lastAssistantText.slice(0, 200),
            draft: scaffold,
            autoGenerate: false,
          },
        },
        { source: "handoff", consentGranted: true, userInitiated: false },
      );
      clearPendingChatArtifact();
      return true;
    }

    if (dest === "google-doc") {
      return tryOpenCreateForCurrentArtifact(userText, {
        chatMessages: chatMessages ?? messages,
        exportTrigger: "google-doc",
        ackMessage:
          "Opening Create with your document — use Create Google Doc when you're ready.",
      });
    }

    return tryOpenCreateForCurrentArtifact(userText, {
      chatMessages: chatMessages ?? messages,
      ackMessage: buildChatHandoffAck({
        itemType: "Document",
        title: "Draft",
        draftContent: "",
        source: "chat",
        artifactTypeLocked: false,
      }),
    });
  }

  function openCreateWithResolvedArtifact(
    artifact: ResolvedArtifact,
    ackMessage?: string,
    exportAction?: ArtifactExportAction | null,
    meta?: CreateOpenMeta,
  ) {
    if (draftPermissionBlocked(lastUserTextRef.current)) {
      postCreateTransparencyMessage(
        draftPermissionBlockMessage(
          lastUserTextRef.current,
          [...messages].reverse().find((m) => m.role === "assistant")?.content ??
            "",
        ),
      );
      dbgWorkspace("openCreateWithResolvedArtifact blocked — draft permission gate");
      return;
    }
    const parent = getActiveParentWorkflow();
    if (
      workspacePanelRef.current === "content-generator" ||
      parent ||
      isChildArtifactRequest(lastUserTextRef.current)
    ) {
      syncCreatePanelDraft(artifact, { merge: true, parent });
      postCreateTransparencyMessage(
        ackMessage ?? createReceiptMessage("draft_updated", { itemType: artifact.itemType }),
      );
      if (exportAction) setExportTrigger(exportAction);
      return;
    }
    requestCreateOpen(
      "content-generator",
      {
        itemType: artifact.itemType,
        title: resolveCollaborativeDraftTitle({
          itemType: artifact.itemType,
          userText: lastUserTextRef.current,
          existingTitle: artifact.title,
        }),
        draftContent: artifact.draftContent,
        brief: artifact.title,
        stage: artifact.draftContent.trim()
          ? "building draft"
          : "starting compose",
        source: "generated",
        artifactTypeLocked: artifact.artifactTypeLocked,
      },
      {
        ackMessage:
          ackMessage ??
          createReceiptMessage("draft_created", { itemType: artifact.itemType }),
        silent: false,
        seedOverride: {
          type: artifact.itemType,
          topic: artifact.title,
          brief: artifact.title,
          draft: artifact.draftContent || undefined,
          autoGenerate: false,
        },
      },
      {
        source: meta?.source ?? "artifact",
        artifact,
        userInitiated: meta?.userInitiated,
        consentGranted: meta?.consentGranted,
        skipConsentCheck: meta?.skipConsentCheck,
      },
    );
    createPanelWorkflowRef.current = liveCreateWorkflowState(
      artifact.itemType,
      createPanelWorkflowRef.current,
    );
    if (exportAction) setExportTrigger(exportAction);
  }

  function openSavedWorkInCreate(
    item: SavedWorkItem,
    ackMessage?: string,
  ) {
    const record = recordFromSavedWork(item);
    openCreationWorkspaceCore(
      "content-generator",
      {
        itemType: item.artifactType,
        title: item.title,
        draftContent: item.body,
        brief: item.title,
        stage: "editing draft",
        source: "generated",
        artifactTypeLocked: shouldLockArtifactType(item.artifactType),
      },
      {
        ackMessage:
          ackMessage ?? createReceiptMessage("saved_for_later", { itemType: item.artifactType }),
        savedArtifact: record,
        seedOverride: {
          type: item.artifactType,
          topic: item.title,
          brief: item.title,
          draft: item.body,
          autoGenerate: false,
        },
      },
      { source: "saved_work", userInitiated: true },
    );
  }

  function savedWorkQueryFromRecovery(text: string): string {
    const t = text.trim();
    const typed =
      t.match(/\bfind my ([\w\s-]+)/i)?.[1] ||
      t.match(/\bshow my ([\w\s-]+)/i)?.[1];
    if (typed) return typed.trim();
    return t
      .replace(
        /\b(?:where is|where did|show|find|open|my|saved|document|the|this|work)\b/gi,
        " ",
      )
      .trim();
  }

  function tryOpenCreateForCurrentArtifact(
    userText: string,
    opts?: {
      ackMessage?: string;
      exportTrigger?: ArtifactExportAction | null;
      allowResumeFromMemory?: boolean;
      /** @deprecated use allowResumeFromMemory */
      allowStoredSession?: boolean;
      chatMessages?: Message[];
      projectPickerPrefill?: string | null;
    },
  ): boolean {
    if (
      shouldBlockArtifactPipeline(userText) &&
      !isExplicitCreateResumeRequest(userText)
    ) {
      return false;
    }
    if (draftPermissionBlocked(userText)) {
      postCreateTransparencyMessage(
        draftPermissionBlockMessage(
          userText,
          [...(opts?.chatMessages ?? messages)]
            .reverse()
            .find((m) => m.role === "assistant")?.content ?? "",
        ),
      );
      return false;
    }
    const chatTurns = toChatTurns(opts?.chatMessages ?? messages);
    const allowResume =
      opts?.allowResumeFromMemory ??
      opts?.allowStoredSession ??
      isExplicitCreateResumeRequest(userText);
    const resolveInput = {
      userText,
      messages: chatTurns,
      creationContext: creationContextRef.current,
      lastActivity: lastAct ?? getLastActivity(),
      storedSession: loadCreateSession(),
      allowResumeFromMemory: allowResume,
      allowStoredSession: allowResume,
    };

    if (
      isExportArtifactRequest(userText) ||
      detectArtifactWorkspaceCommand(userText)
    ) {
      const candidates = collectArtifactCandidates(resolveInput);
      if (candidates.length > 1) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: buildArtifactAmbiguityMessage(candidates),
          },
        ]);
        return true;
      }
    }

    const artifact = resolveCurrentArtifact(resolveInput);

    if (!artifact) {
      if (isExportArtifactRequest(userText)) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: missingArtifactExportMessage() },
        ]);
        return true;
      }
      return false;
    }

    openCreateWithResolvedArtifact(
      artifact,
      opts?.ackMessage ?? buildCreateOpenAck(artifact),
      opts?.exportTrigger,
    );
    const prefill =
      opts?.projectPickerPrefill ??
      parseAddToProjectRequest(userText)?.projectName ??
      null;
    setProjectPickerPrefill(prefill);
    return true;
  }

  function openAssetRoute(route: AssetRoute, opts?: { appendAck?: boolean }) {
    const appendAck = opts?.appendAck !== false;
    if (route.section === "content-generator" && route.itemType) {
      openCreateWithResolvedArtifact(
        {
          itemType: route.itemType,
          title: route.title ?? `New ${route.itemType}`,
          draftContent: route.draftContent ?? "",
          source: route.draftContent ? "blank" : "none",
          artifactTypeLocked: shouldLockArtifactType(route.itemType),
        },
        appendAck ? route.ack : undefined,
      );
      if (!appendAck) {
        focusWorkspaceLayout();
        revealWorkspace();
      }
      return;
    }
    if (route.bootstrapProjects) {
      setProjectsBootstrapCreate(true);
    }
    patchWorkspacePanel(route.section);
    setWorkspaceDetail(emptyWorkspaceDetail());
    setActiveSection("home");
    focusWorkspaceLayout();
    setActiveNav(navForWorkspaceSection(route.section) ?? "chat");
    revealWorkspace();
    if (appendAck) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: route.ack },
      ]);
    }
  }

  function bumpFounderActions() {
    setFounderActionTick((n) => n + 1);
  }

  function trackWorkspaceEcosystemEvent(section: AppSection) {
    if (section === "content-generator") {
      trackEcosystemEvent({
        eventType: "feature.create_opened",
        feature: "create",
      });
      return;
    }
    if (section === "brain-dump") {
      trackEcosystemEvent({
        eventType: "feature.clear_my_mind_used",
        feature: "clear-my-mind",
      });
    }
  }

  function closedLoopCtx(
    overrides?: Parameters<typeof buildClosedLoopContext>[0],
  ) {
    return buildClosedLoopContext({
      emotionalState: lastEmotionalStateRef.current,
      ...overrides,
    });
  }

  function noteWorkspaceOpened(
    section: AppSection,
    routingReason?: string,
  ) {
    captureWorkspaceOpened(
      section,
      closedLoopCtx({ routingReason: routingReason ?? section }),
    );
  }

  function emitFounderActionEvent(
    action: FounderAction,
    status: FounderActionStatus,
  ) {
    const pid = action.relatedProject?.id;
    switch (status) {
      case "offered":
        trackEcosystemEvent({
          eventType: "companion.recommendation_given",
          feature: "companion",
          metadata: {
            actionId: action.id,
            actionType: action.actionType,
            projectId: pid ?? "",
          },
        });
        break;
      case "opened":
        eventStore.emit(
          ev.actionOpened(
            FOUNDER_ID,
            action.id,
            action.title,
            action.actionType,
            action.workspace.ecosystemKind,
            pid,
          ),
        );
        eventStore.emit(
          ev.workspaceOpened(FOUNDER_ID, action.workspace.ecosystemKind),
        );
        break;
      case "started":
        eventStore.emit(
          ev.actionStarted(FOUNDER_ID, action.id, action.title, pid),
        );
        break;
      case "completed":
        trackEcosystemEvent({
          eventType: "companion.recommendation_accepted",
          feature: "companion",
          metadata: {
            actionId: action.id,
            actionType: action.actionType,
            projectId: pid ?? "",
          },
        });
        break;
      case "dismissed":
        eventStore.emit(
          ev.actionDismissed(FOUNDER_ID, action.id, action.title, pid),
        );
        break;
      case "skipped":
        eventStore.emit(
          ev.actionSkipped(FOUNDER_ID, action.id, action.title, pid),
        );
        break;
      case "postponed":
        eventStore.emit(
          ev.actionPostponed(FOUNDER_ID, action.id, action.title, pid),
        );
        break;
    }
    bumpFounderActions();
  }

  function openFounderActionWorkspace(action: FounderAction) {
    return executeFounderAction(action, {
      openSection: (section, opts) => {
        if (section === "content-generator") {
          openCreateWithResolvedArtifact({
            itemType: opts?.itemType ?? "Document",
            title: opts?.title ?? `New ${opts?.itemType ?? "Document"}`,
            draftContent: opts?.draftScaffold ?? "",
            source: opts?.draftScaffold ? "blank" : "none",
            artifactTypeLocked: shouldLockArtifactType(
              opts?.itemType ?? "Document",
            ),
          });
          return;
        }
        if (section === "focus-audio") {
          openFocusAudioCore(opts?.focusAudioCategory ?? "deep-work");
          return;
        }
        if (opts?.bootstrapProjects) {
          setProjectsBootstrapCreate(true);
        }
        patchWorkspacePanel(section);
        setWorkspaceDetail(emptyWorkspaceDetail());
        setActiveSection("home");
        focusWorkspaceLayout();
        setActiveNav(navForWorkspaceSection(section) ?? "chat");
        revealWorkspace();
      },
      onStatusChange: (_id, status) => emitFounderActionEvent(action, status),
    });
  }

  function respondToFounderAction(
    action: FounderAction,
    button: "open" | "done" | "later" | "dismiss",
  ) {
    if (button === "open") {
      const result = openFounderActionWorkspace(action);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message },
      ]);
      return;
    }
    emitFounderActionEvent(action, actionStatusForButton(button));
    const ack =
      button === "done"
        ? `Marked **${action.title}** complete — nice work.`
        : button === "later"
          ? `Okay — I'll keep **${action.title}** on your list for later.`
          : `Got it — dismissed **${action.title}**.`;
    setMessages((prev) => [...prev, { role: "assistant", content: ack }]);
  }

  function openCreateFromConversationHandoff(
    artifact: ConversationArtifact,
    chatMessages: Message[],
    ackMessage?: string,
  ) {
    const turns = toChatTurns(chatMessages);
    stashConversationBeforeHandoff(turns, {
      artifactType: artifact.artifactType,
    });
    const resolved = conversationArtifactToResolved(artifact);
    const receipt =
      ackMessage ??
      `${handoffReceiptForArtifact(artifact)}\n\n${buildRecoveryOfferLine()}`;
    openCreateWithResolvedArtifact(resolved, receipt, null, {
      source: "handoff",
      consentGranted: true,
      conversationHandoff: true,
    });
    setPendingConversationHandoff(null);
  }

  function tryConversationHandoffTurn(
    userText: string,
    chatMessages: Message[],
    hintType?: string | null,
  ): boolean {
    const turns = toChatTurns(chatMessages);
    const evaluation = evaluateConversationHandoff({
      userCommand: userText,
      messages: turns,
      hintType,
    });
    if (evaluation.action === "open") {
      openCreateFromConversationHandoff(evaluation.artifact, chatMessages);
      return true;
    }
    if (evaluation.action === "confirm") {
      setPendingConversationHandoff(evaluation.artifact);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: evaluation.message },
      ]);
      return true;
    }
    if (evaluation.action === "clarify") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: evaluation.message },
      ]);
      return true;
    }
    return false;
  }

  function openCreateFromIntent(
    resolved: ResolvedIntent,
    chatMessages?: Message[],
  ) {
    const assetRoute = resolveAssetRoute(resolved.rawText);
    if (assetRoute) {
      openAssetRoute(assetRoute);
      return;
    }

    const catalog = matchCatalogFromText(resolved.rawText);
    if (catalog?.route) {
      const nav = navForWorkspaceSection(catalog.route);
      openSectionBesideChatCore(catalog.route, nav ?? undefined);
      return;
    }

    const msgs = chatMessages ?? messages;
    if (tryConversationHandoffTurn(resolved.rawText, msgs, resolved.type)) {
      return;
    }

    const seed = toGenSeed(resolved);
    const itemType = resolved.type || catalog?.type || "content";
    const hasUserDraft = Boolean(seed.draft?.trim());
    const turns = toChatTurns(msgs);
    if (
      !hasUserDraft &&
      !isExplicitBlankCreateOpen(resolved.rawText) &&
      hasUsableConversationContext(turns, resolved.rawText)
    ) {
      const assembled = assembleConversationArtifact({
        userCommand: resolved.rawText,
        messages: turns,
        hintType: itemType,
      });
      if (assembled && assembled.confidence !== "low") {
        openCreateFromConversationHandoff(assembled, msgs);
        return;
      }
    }
    const scaffold = hasUserDraft ? "" : blankScaffoldForType(itemType);
    const draft = seed.draft?.trim() || scaffold;
    openCreationWorkspaceCore(
      "content-generator",
      {
        itemType,
        title: resolved.topic || itemType || "Draft",
        draftContent: draft,
        brief: seed.brief ?? resolved.rawText,
        stage: draft.trim() ? "editing draft" : "choosing what to create",
        source: "generated",
        artifactTypeLocked: shouldLockArtifactType(itemType),
      },
      {
        ackMessage: buildCreateRouteMessage(resolved),
        seedOverride: {
          ...seed,
          type: itemType,
          draft: draft || undefined,
          autoGenerate: false,
        },
      },
    );
  }

  // A panel can register an in-screen back handler (e.g. close an open detail).
  // If it handles the press (returns true), we don't leave the section yet.
  const backInterceptorRef = useRef<(() => boolean) | null>(null);
  const registerBack = useCallback((fn: (() => boolean) | null) => {
    backInterceptorRef.current = fn;
  }, []);

  type NavigationSnapshot = {
    activeSection: AppSection;
    activeNav: SidebarNavId;
    workspacePanel: AppSection | null;
    companionStandaloneSection: AppSection | null;
    activitySession: ActivitySessionState;
    strategyOpenView?: "home" | "adhd" | "business" | "saved" | "recommended";
  };

  function captureNavigationSnapshot(
    strategyOpenView?: NavigationSnapshot["strategyOpenView"],
  ): NavigationSnapshot {
    return {
      activeSection: activeSectionRef.current,
      activeNav: activeNavRef.current,
      workspacePanel: workspacePanelRef.current,
      companionStandaloneSection: companionStandaloneSectionRef.current,
      activitySession: { ...activitySessionRef.current },
      strategyOpenView,
    };
  }

  const restoreNavigationSnapshot = useCallback(
    (snap: NavigationSnapshot) => {
      goingBackRef.current = true;
      setActiveSection(snap.activeSection);
      activeSectionRef.current = snap.activeSection;
      setActiveNav(snap.activeNav);
      patchWorkspacePanel(snap.workspacePanel);
      setCompanionStandaloneSection(snap.companionStandaloneSection);
      setActivitySession(snap.activitySession);
      if (snap.strategyOpenView) {
        setStrategyPanelCommand({
          key: Date.now(),
          openView: snap.strategyOpenView,
        });
      }
    },
    [patchWorkspacePanel],
  );

  const pushNavigationRestore = useCallback(
    (strategyOpenView?: NavigationSnapshot["strategyOpenView"]) => {
      const snap = captureNavigationSnapshot(strategyOpenView);
      navHistoryRef.current.push(() => restoreNavigationSnapshot(snap));
    },
    [restoreNavigationSnapshot],
  );

  function goBack(options?: { skipInterceptor?: boolean }) {
    if (!options?.skipInterceptor && backInterceptorRef.current?.()) return;

    if (overlay) {
      setOverlay(null);
      setSettingsSection(null);
      setProfileGettingToKnowYou(false);
      return;
    }

    if (planMyDayDrawerOpen) {
      setPlanMyDayDrawerOpen(false);
      return;
    }

    const navRestore = navHistoryRef.current.pop();
    if (navRestore) {
      if (panelBackStackRef.current.length > 0) {
        panelBackStackRef.current.pop();
        const nextLabel =
          panelBackStackRef.current[panelBackStackRef.current.length - 1] ??
          null;
        setWorkspacePanelBackLabel(nextLabel);
      }
      navRestore();
      return;
    }

    if (activeSection === "home" && workspacePanel) {
      if (
        (activeNavRef.current === "other" ||
          activeNavRef.current === "my-work") &&
        workspacePanel !== "my-work"
      ) {
        returnToMyWorkHub();
        return;
      }
      closeWorkspacePanel();
      return;
    }

    const prev = sectionHistoryRef.current.pop() ?? "home";
    goingBackRef.current = true;
    if (prev === "home") setActiveNav("chat");
    setActiveSection(prev);
  }

  // Unlock the chime on first interaction (browsers block audio otherwise).
  useEffect(() => {
    const unlock = () => unlockChime();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Zero-friction capture: on the chat screen, typing any character focuses the
  // input so the thought flows straight in — unless you're in a field/modal.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (activeSection !== "home" || triggeredBlock) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el?.isContentEditable
      ) {
        return;
      }
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection, triggeredBlock]);

  // Time-block alerts: while the app is open, check each ~30s for (a) a block
  // starting in ~15 minutes (gentle heads-up) and (b) a block whose start time
  // has arrived (the trigger popup). Both chime + post a written notification.
  useEffect(() => {
    function notify(title: string, body: string) {
      if (
        getPrefs().desktopNotifications &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(title, { body });
        } catch {
          /* notifications unavailable */
        }
      }
    }

    function check() {
      if (!getPrefs().timeBlockAlerts) return;
      const now = Date.now();
      const blocks = getTimeBlocks();

      // 15-minute heads-up.
      for (const b of blocks) {
        if (b.status !== "pending" || warnedRef.current.has(b.id)) continue;
        if (!b.date) continue; // unscheduled blocks never trigger
        const start = blockDateTime(b).getTime();
        const lead = start - 15 * 60 * 1000;
        if (now >= lead && now < start) {
          warnedRef.current.add(b.id);
          setWarning(b);
          playChime();
          notify(
            `Soon: ${b.title}`,
            "Your momentum appointment begins in about 15 minutes.",
          );
        }
      }

      // At-start trigger.
      if (!triggeredBlock) {
        const due = blocks.find(
          (b) =>
            b.status === "pending" &&
            b.date &&
            blockDateTime(b).getTime() <= now,
        );
        if (due) {
          setBlockStatus(due.id, "triggered");
          setTriggeredBlock(due);
          setWarning((w) => (w?.id === due.id ? null : w));
          playChime();
          notify(
            `${due.title} — how did it go?`,
            "Every outcome counts — open the app when you're ready.",
          );
        }
      }
    }

    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [triggeredBlock]);

  useEffect(() => {
    const win = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognition =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const prefix = baseInputRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";
      voiceUsedRef.current = true;
      setInput(prefix + separator + transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      return;
    }
    recognition.lang = speechLocaleForLanguage(getPrefs().voiceLanguage);
    baseInputRef.current = input;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognition.stop();
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    voiceUsedRef.current = false;
  }

  function appendSystemMessage(content: string) {
    setMessages((prev) => [...prev, { role: "system", content }]);
  }

  function clearTodayContext() {
    recognitionRef.current?.stop();
    setIsListening(false);
    clearConversation();
    setMessages([]);
    workspaceChatScopeRef.current = null;
    setInput("");
    setError(null);
    setEmotion("unclear");
    setBridge(null);
    setWorkspaceOffer(null);
    setBusinessConfidenceOffer(null);
    businessConfidenceBypassRef.current = false;
    businessConfidencePendingTextRef.current = null;
    setAssistedActionOffer(null);
    pauseCreatePersistence();
    patchWorkspacePanel(null);
    setWorkspaceDetail(null);
    setCreationContext(null);
    setGenSeed(null);
    setSavedArtifact(null);
    setCreateExportReady(false);
    setCreateBuilderSession(null);
    setChatBuildRequest(null);
    createBuilderBootstrappedRef.current = false;
    createWorkflowRecordRef.current = null;
    createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
    clearAllCreatePersistence({ preserveSavedForLater: true });
    applyWorkspaceFocus(null);
    clearWorkspaceSession();
    setWorkspaceSession(null);
    setProjectsBootstrapCreate(false);
    voiceUsedRef.current = false;
    setIsLoading(false);
    setActiveSection("home");
    setActiveNav("chat");
    setGuideBesideSession(null);
    setActivitySession(EMPTY_ACTIVITY_SESSION);
    activitySessionRef.current = EMPTY_ACTIVITY_SESSION;
    setPlanMyDayDrawerOpen(false);
    setPlanMyDayOpenItemId(null);
    setOverlay((current) => (current === "signin" ? current : null));
    sectionHistoryRef.current = [];
    navHistoryRef.current = createNavigationHistoryStack();
    setCoachingMode("today");
    resumeCreatePersistence();
    focusWorkspaceLayout();
  }

  function requestClearTodayContext() {
    setFreshStartDialog("clear-context");
  }

  function requestResetDay() {
    setFreshStartDialog("reset-day");
  }

  function requestBeginNewDay() {
    setFreshStartDialog("begin-new-day");
  }

  function confirmFreshStart() {
    if (freshStartDialog === "begin-new-day") {
      beginNewDay();
    } else if (freshStartDialog === "reset-day") {
      resetPlanDay();
    } else if (freshStartDialog === "clear-context") {
      clearTodayContext();
    }
    setFreshStartDialog(null);
  }

  function resetPlanDay() {
    resetPlanDayView();
    setPlanMyDayOpenItemId(null);
  }

  function beginNewDay() {
    clearTodayContext();
    clearDailySessionFlags();
    resetTodayPlanForNewDay();
    setMessages([
      {
        role: "assistant",
        content: BEGIN_NEW_DAY_GREETING,
      },
    ]);
  }

  function buildGrowthPanelNav(current: GrowthSectionId): GrowthPanelNav {
    return {
      current,
      onBack: goBack,
      backLabel: workspacePanelBackLabel,
      onOpenSection: (section) => openSectionBesideChatCore(section, "growth"),
    };
  }

  function isMyWorkFlow(): boolean {
    return (
      activeNavRef.current === "other" || activeNavRef.current === "my-work"
    );
  }

  function returnToMyWorkHub() {
    goingBackRef.current = true;
    openSectionBesideChatCore("my-work", "other");
  }

  function workspacePanelBack() {
    goBack();
  }

  function navForWorkspaceSection(section: AppSection): SidebarNavId | null {
    return sidebarNavForSection(section);
  }

  /** Menu / in-panel navigation — replace right workspace, keep chat on the left. */
  function openSectionBesideChatCore(
    section: AppSection,
    nav?: SidebarNavId,
  ) {
    if (shouldDeferWorkspaceRoutingForPhase1()) return;
    if (isClearMyMindSection(section)) {
      openClearMyMindStandaloneCore();
      return;
    }
    if (section === "content-generator") {
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("other");
        focusWorkspaceLayout();
        revealWorkspace();
        return;
      }
      if (
        tryOpenCreateForCurrentArtifact(lastUserTextRef.current, {
          allowStoredSession: isExplicitCreateResumeRequest(
            lastUserTextRef.current,
          ),
        })
      ) {
        focusWorkspaceLayout();
        revealWorkspace();
        return;
      }
      if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession()
      ) {
        focusWorkspaceLayout();
        revealWorkspace();
        return;
      }
      requestCreateOpen(
        "content-generator",
        {
          itemType: "",
          title: "Create with Shari",
          brief: "",
          stage: "choosing what to create",
          source: "generated",
        },
        undefined,
        { source: "ui_nav", userInitiated: true },
      );
      applyChatLayoutMode("split");
      createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
      createBuilderBootstrappedRef.current = false;
      clearParallelCoachingOffers();
      startCreateBuilderChat(undefined, undefined, { skipChatSync: true });
      focusWorkspaceLayout();
      revealWorkspace();
      return;
    }

    if (workspacePanel === section) {
      if (section === "visual-focus" && !peekVisualFocusPendingOpen()) {
        requestVisualFocusStudio();
      }
      setActiveSection("home");
      if (nav) setActiveNav(nav);
      focusWorkspaceLayout();
      revealWorkspace();
      return;
    }

    if (
      isGrowthPanelSection(section) ||
      isGrowthPanelSection(workspacePanelRef.current)
    ) {
      const label = growthPanelBackLabel(
        workspacePanelRef.current,
        activeSectionRef.current,
      );
      panelBackStackRef.current.push(label);
      setWorkspacePanelBackLabel(label);
    } else if (
      isMyWorkPanelSection(section) ||
      isMyWorkPanelSection(workspacePanelRef.current)
    ) {
      const label = myWorkPanelBackLabel(
        workspacePanelRef.current,
        activeSectionRef.current,
      );
      panelBackStackRef.current.push(label);
      setWorkspacePanelBackLabel(label);
    }

    pushNavigationRestore();
    patchWorkspacePanel(section);
    if (section === "visual-focus" && !peekVisualFocusPendingOpen()) {
      requestVisualFocusStudio();
    }
    if (section === "projects" && !projectsResumeIdRef.current) {
      setProjectsResumeId(null);
    }
    if (section !== "projects") {
      setWorkspaceDetail(emptyWorkspaceDetail());
    } else if (!projectsResumeIdRef.current) {
      setWorkspaceDetail(emptyWorkspaceDetail());
    }
    setCreationContext(null);
    applyWorkspaceFocus(null);
    setActiveSection("home");
    focusWorkspaceLayout();
    setWorkspaceSession(null);
    setProjectsBootstrapCreate(false);

    const navId = nav ?? navForWorkspaceSection(section);
    if (navId) setActiveNav(navId);

    revealWorkspace();
    if (isPurityScopedSection(section)) {
      beginWorkspaceChat({ section }, resolveWorkspaceOpener(section));
    } else if (
      section !== "client-avatars" &&
      !isWorkspaceCoachSilent(section)
    ) {
      window.setTimeout(() => seedWorkspaceCoachAutoStart(true), 120);
    }
  }

  function openCreateDirect() {
    openSectionBesideChatCore("content-generator", "other");
  }

  /** Menu navigation — open the workspace directly without forcing chat. */
  function openNavSectionDirectCore(section: AppSection, nav: SidebarNavId) {
    setWorkspaceFirstSplit(false);
    setCompanionStandaloneSection(null);
    companionReturnSectionRef.current = null;
    patchWorkspacePanel(null);
    focusWorkspaceLayout();
    setActiveNav(nav);

    if (section === "content-generator") {
      openCreateDirect();
      return;
    }

    setWorkspaceSession(null);
    setActiveSection(section);
  }

  function buildWorkspaceCoachExtrasFromState(): WorkspaceCoachExtras {
    const activity = activitySession.activityId
      ? getActivityById(activitySession.activityId)
      : undefined;
    const stepIdx = activitySession.stepIndex ?? 0;
    return {
      creationContext: creationContextRef.current,
      splitScreenCreateActive: splitCreateChat,
      activityTitle: activity?.title ?? null,
      activityStep: activity?.steps[stepIdx]?.instruction ?? null,
      activityCategoryId: activity?.categoryId ?? null,
      focusActive: pomodoroTimer.isActive,
      focusTitle:
        pomodoroTimer.label ??
        pomodoroTimer.sessionMeta?.focusItem ??
        null,
      focusMinutesLeft: pomodoroTimer.isActive
        ? pomodoroTimer.displayMins
        : null,
    };
  }

  function resolveCoachSection(): AppSection | null {
    if (workspacePanelRef.current) return workspacePanelRef.current;
    if (companionStandaloneSection) return companionStandaloneSection;
    if (guideBesideSession?.source.kind === "activity") {
      return activitySession.activityId
        ? standaloneSectionForActivity(activitySession.activityId)
        : "focus";
    }
    if (guideBesideSession?.source.kind === "section") {
      return guideBesideSession.source.section;
    }
    return null;
  }

  /** User chose companion help — chat left, workspace right. */
  function appendWorkspaceCoachOpener(
    sectionOverride?: AppSection | null,
    force = false,
  ) {
    if (shouldSuppressWorkspaceCoachForPhase1()) return;
    const section = sectionOverride ?? resolveCoachSection();
    if (!section) return;
    if (isWorkspaceCoachSilent(section)) return;
    if (section === "content-generator" && splitCreateChat) {
      return;
    }
    if (section === "playbook" && businessStrategySessionRef.current) {
      return;
    }
    if (
      section === "playbook" &&
      strategyApplySessionRef.current &&
      strategyApplySessionRef.current.phase !== "done"
    ) {
      return;
    }
    if (
      section === "content-generator" &&
      createBuilderBootstrappedRef.current
    ) {
      return;
    }
    const extras = buildWorkspaceCoachExtrasFromState();
    const detail =
      section === "projects"
        ? resolveProjectWorkspaceDetail(
            workspaceDetailRef.current,
            projectContinueIdRef.current,
          )
        : workspaceDetailRef.current;
    const ctx = buildWorkspaceContext(section, detail);
    const key = workspaceCoachSeedKey(ctx, extras);
    if (!key) return;
    if (!force && workspaceCoachSeededRef.current === key) return;
    const auto = buildWorkspaceCoachAutoStart(ctx, extras);
    if (!auto) return;
    workspaceCoachSeededRef.current = key;
    const { field, content } = extractFocusDirective(auto.content);
    setMessages((prev) => {
      if (
        prev
          .slice(-5)
          .some((m) => m.role === "assistant" && m.content === content)
      ) {
        return prev;
      }
      return [...prev, { role: "assistant", content }];
    });
    applyWorkspaceFocus(field ?? auto.focusField);
    if (auto.showTopicPicker && section === "projects") {
      setProjectCoachTopicPickerVisible(true);
    } else {
      setProjectCoachTopicPickerVisible(false);
    }
  }

  function seedWorkspaceCoachAutoStart(force = false) {
    appendWorkspaceCoachOpener(null, force);
  }

  function selectProjectCoachChoice(selection: ProjectCoachSelection) {
    setProjectCoachTopicPickerVisible(false);
    const ctx = buildWorkspaceContext(
      "projects",
      resolveProjectWorkspaceDetail(
        workspaceDetailRef.current,
        projectContinueIdRef.current,
      ),
    );
    if (!ctx?.selectedItemId) return;
    const session = startProjectCoachSession(selection, ctx);
    setProjectCoachSession(session);
    const opener = projectCoachTopicOpener(selection, ctx);
    const { field, content } = extractFocusDirective(opener.content);
    setMessages((prev) => [...prev, { role: "assistant", content }]);
    applyWorkspaceFocus(field ?? opener.focusField);
  }

  function startClientAvatarBuilderKickoff() {
    companionReturnSectionRef.current = "client-avatars";
    setWorkspaceFirstSplit(false);
    applyChatLayoutMode("split");
    setCompanionStandaloneSection(null);
    if (workspacePanel !== "client-avatars") {
      patchWorkspacePanel("client-avatars");
    }
    setActiveNav(navForWorkspaceSection("client-avatars") ?? activeNav);
    setActiveSection("home");
    revealWorkspace();

    setAvatarCoachActive(true);
    setBuilderKickoffActive(true);
    setAvatarCoachKickoff(Date.now());
    avatarTaglineOptionsRef.current = [];
    workspaceCoachSeededRef.current = `client-avatars:kickoff:${Date.now()}`;

    beginWorkspaceChat(
      { section: "client-avatars" },
      resolveWorkspaceOpener("client-avatars"),
    );
    applyWorkspaceFocus("avatar-name");
    inputRef.current?.focus();
  }

  function openCompanionAssist(
    sourceSection: AppSection,
    typeHint?: string | null,
    panelWorkflow?: import("@/lib/createWorkflow").CreateWorkflowState | null,
  ) {
    if (sourceSection === "client-avatars") {
      startClientAvatarBuilderKickoff();
      return;
    }

    companionReturnSectionRef.current = sourceSection;
    setWorkspaceFirstSplit(false);
    applyChatLayoutMode("split");

    if (supportsWorkspace(sourceSection)) {
      setCompanionStandaloneSection(null);
      if (workspacePanel !== sourceSection) {
        patchWorkspacePanel(sourceSection);
      }
      if (sourceSection === "projects") {
        const activeId =
          workspaceDetailRef.current?.selectedItemId ?? projectContinueIdRef.current;
        if (activeId) {
          projectContinueIdRef.current = activeId;
          setProjectContinueId(activeId);
          const resolved = resolveProjectWorkspaceDetail(
            workspaceDetailRef.current,
            activeId,
          );
          if (resolved?.selectedItemId) {
            setWorkspaceDetail((prev) =>
              panelDetailEqual(prev, resolved) ? prev : resolved,
            );
          }
        }
      }
    } else {
      setCompanionStandaloneSection(sourceSection);
      patchWorkspacePanel(null);
    }

    setActiveNav(navForWorkspaceSection(sourceSection) ?? activeNav);
    setActiveSection("home");
    revealWorkspace();
    if (
      sourceSection === "content-generator" ||
      (supportsWorkspace(sourceSection) && workspacePanel === "content-generator")
    ) {
      if (isPurityScopedSection("content-generator")) {
        beginWorkspaceChat(
          { section: "content-generator" },
          resolveWorkspaceOpener("content-generator"),
        );
      }
      startCreateBuilderChat(
        typeHint ??
          creationContext?.itemType ??
          genSeed?.type ??
          lockedArtifactType,
        panelWorkflow,
        {
          skipChatSync: isPurityScopedSection("content-generator"),
        },
      );
    } else if (isPurityScopedSection(sourceSection)) {
      beginWorkspaceChat(
        { section: sourceSection },
        resolveWorkspaceOpener(sourceSection),
      );
    } else {
      const detail =
        sourceSection === "projects"
          ? resolveProjectWorkspaceDetail(
              workspaceDetailRef.current,
              projectContinueIdRef.current,
            )
          : workspaceDetailRef.current;
      const ctx = supportsWorkspace(sourceSection)
        ? buildWorkspaceContext(sourceSection, detail)
        : null;
      const extras = buildWorkspaceCoachExtrasFromState();
      const seedKey = workspaceCoachResumeSeedKey(ctx, extras);
      const hasActiveSession = shouldResumeWorkspaceCoach({
        sourceSection,
        ctx,
        extras,
        projectCoachActive: projectCoachSession != null,
        businessStrategyActive: businessStrategySessionRef.current != null,
        chatHasProjectContext:
          messages.length > 0 &&
          messages.some(
            (m) =>
              m.role === "assistant" &&
              /\b(?:project|outcome|tasks?|steps?)\b/i.test(m.content),
          ),
        seededKey:
          seedKey != null && workspaceCoachSeededRef.current === seedKey
            ? seedKey
            : null,
      });

      if (!hasActiveSession) {
        workspaceCoachSeededRef.current = null;
        window.setTimeout(() => seedWorkspaceCoachAutoStart(true), 150);
      }
    }
    inputRef.current?.focus();
  }

  function openCreateWithShari(input: CreationWorkspaceInput) {
    logCreateBuild("Work With Shari opened", { itemType: input.itemType });
    requestCreateOpen(
      "content-generator",
      { ...input, source: input.source ?? "generated" },
      undefined,
      { source: "ui_button", userInitiated: true },
    );
    openCompanionAssist("content-generator", input.itemType, input.createWorkflow);
  }

  /** Walk user from How Do I into a tool — chat left with coach opener, workspace right. */
  function openHowDoIToolWalkthrough(targetSection: AppSection) {
    setCrossWorkspaceBesideOffer(null);
    setGuideBesideSession(null);
    setCompanionStandaloneSection(null);
    setWorkspaceContextBanner(null);
    setWorkspaceFirstSplit(false);
    workspaceCoachSeededRef.current = null;
    applyChatLayoutMode("split");
    setActiveSection("home");
    activeSectionRef.current = "home";

    if (targetSection === "content-generator") {
      if (workspacePanel !== "content-generator") {
        requestCreateOpen(
          "content-generator",
          {
            itemType: "",
            title: "Create with Shari",
            brief: "",
            stage: "choosing what to create",
            source: "generated",
          },
          undefined,
          { source: "companion_assist", userInitiated: true },
        );
      }
      applyChatLayoutMode("split");
      setActiveNav("other");
      revealWorkspace();
      clearParallelCoachingOffers();
      startCreateBuilderChat();
      inputRef.current?.focus();
      return;
    }

    if (!supportsWorkspace(targetSection)) {
      patchWorkspacePanel(null);
      setCompanionStandaloneSection(targetSection);
      const navId = navForWorkspaceSection(targetSection);
      if (navId) setActiveNav(navId);
      revealWorkspace();
      appendWorkspaceCoachOpener(targetSection, true);
      inputRef.current?.focus();
      return;
    }

    patchWorkspacePanel(targetSection);
    if (targetSection !== "projects") {
      setWorkspaceDetail(emptyWorkspaceDetail());
    }
    setCreationContext(null);
    applyWorkspaceFocus(null);
    setWorkspaceSession(null);
    setProjectsBootstrapCreate(false);

    const navId = navForWorkspaceSection(targetSection);
    if (navId) setActiveNav(navId);

    revealWorkspace();
    appendWorkspaceCoachOpener(targetSection, true);
    inputRef.current?.focus();
  }

  function resolveCurrentGuideSection(): AppSection | null {
    if (guideBesideSession) {
      return guideBesideSession.source.kind === "activity"
        ? activitySession.activityId
          ? standaloneSectionForActivity(activitySession.activityId)
          : "focus"
        : guideBesideSession.source.section;
    }
    if (activeSectionRef.current === "home") {
      return workspacePanelRef.current ?? companionStandaloneSection;
    }
    return activeSectionRef.current;
  }

  function proposeClientAvatarHandoffIfNeeded(
    session: CreateBuilderSession | null,
    opts?: { lastAssistantText?: string },
  ) {
    if (!session?.typeLabel || session.phase !== "discovery") return;
    const q = discoveryQuestionsForState(session.typeLabel, session.workflow);
    const sessionKey = session.workflow.sessionId ?? session.typeLabel;
    if (
      !shouldOfferClientAvatarHandoff({
        workspacePanel: workspacePanelRef.current,
        typeLabel: session.typeLabel,
        currentQuestionId: q?.id,
        currentQuestionPrompt: q?.prompt,
        lastAssistantText: opts?.lastAssistantText,
        handoffDeclined: clientAvatarHandoffDeclinedRef.current,
        activeHandoff: loadCrossWorkflowHandoff(),
        alreadyOffered: clientAvatarHandoffOfferedRef.current === sessionKey,
      })
    ) {
      return;
    }

    const sourceTitle = createBuilderLabel(session.typeLabel);
    const offer = buildClientAvatarHandoffOffer(sourceTitle);
    const snapshot = buildHandoffSnapshot({
      sourcePanel: "content-generator",
      sourceTitle,
      sourceKind: "create_builder",
      createBuilderSession: session,
      createWorkflowState: session.workflow,
      pendingQuestionId: q?.id ?? null,
      pendingQuestionPrompt: q?.prompt ?? null,
    });
    pendingClientAvatarHandoffRef.current = snapshot;
    clientAvatarHandoffOfferedRef.current = sessionKey;

    setCrossWorkspaceBesideOffer({
      sourceSection: "content-generator",
      targetSection: "client-avatars",
      sourceTitle,
      line: offer.line,
      contextMessage: offer.contextMessage,
      clientAvatarHandoff: true,
    });
  }

  function applyAvatarPrefillsToPanel(
    prefills: ReturnType<typeof avatarPrefillsFromDiscovery>,
  ) {
    prefills.forEach((fill, i) => {
      window.setTimeout(() => {
        applyWorkspaceWrite(
          workspaceFillAction(
            "client-avatars",
            fill.field,
            fill.value,
            "handoff",
            { key: Date.now() + i },
          ),
          { skipValidation: true },
        );
      }, i * 80);
    });
  }

  function completeClientAvatarHandoffReturn(
    avatar: import("@/lib/companionStore").IdealClientAvatar,
  ) {
    const handoff = loadCrossWorkflowHandoff();
    if (!handoff) return;
    clearCrossWorkflowHandoff();
    pendingClientAvatarHandoffRef.current = null;
    setCrossWorkspaceBesideOffer(null);
    setGuideBesideSession(null);
    setWorkspaceContextBanner(null);

    if (handoff.sourceKind === "create_builder" && handoff.createBuilderSession) {
      const { session, reply } = resumeCreateBuilderAfterAvatar(
        handoff.createBuilderSession,
        avatar,
      );
      setCreateBuilderSession(session);
      createBuilderSessionRef.current = session;
      const record = workflowRecordFromState(session.workflow, {
        builderPhase: session.phase,
        source: "chat",
        itemType: session.typeLabel,
      });
      commitCreateWorkflowRecord(record);
      patchWorkspacePanel("content-generator");
      applyChatLayoutMode("split");
      setActiveNav("other");
      setActiveSection("home");
      revealWorkspace();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      return;
    }

    if (
      handoff.sourceKind === "business_strategy" &&
      handoff.businessStrategySession
    ) {
      const updated = applyAvatarToBusinessStrategySession(
        handoff.businessStrategySession,
        avatar,
      );
      businessStrategySessionRef.current = updated;
      setBusinessStrategySession(updated);
      if (updated.draft) {
        showBusinessStrategyDraft({
          typeLabel: updated.typeLabel,
          draft: updated.draft,
        });
      }
      patchWorkspacePanel("playbook");
      applyChatLayoutMode("split");
      setActiveNav("playbook");
      setActiveSection("home");
      revealWorkspace();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: buildReturnToSourceAck(handoff.sourceTitle),
        },
      ]);
    }
  }

  function suggestCrossWorkspaceOpen(
    targetSection: AppSection,
    opts?: {
      sourceTitle?: string;
      contextMessage?: string;
      line?: string;
      hint?: string;
    },
  ) {
    const source = resolveCurrentGuideSection();
    if (shouldWalkThroughFromHowDoI(source)) {
      openHowDoIToolWalkthrough(targetSection);
      return;
    }
    if (!source || source === targetSection) {
      if (shouldOpenBesideChat(targetSection)) {
        openSectionBesideChatCore(targetSection);
      } else {
        setActiveSection(targetSection);
      }
      return;
    }
    const sourceTitle = opts?.sourceTitle ?? workspaceTitle(source);
    setCrossWorkspaceBesideOffer({
      sourceSection: source,
      targetSection,
      sourceTitle,
      line: opts?.line ?? crossWorkspaceBesideLine(targetSection, opts?.hint),
      contextMessage:
        opts?.contextMessage ??
        crossWorkspaceContextMessage(sourceTitle, targetSection),
    });
  }

  function acceptCrossWorkspaceBeside(offer: CrossWorkspaceBesideOffer) {
    const handoffSnapshot = offer.clientAvatarHandoff
      ? pendingClientAvatarHandoffRef.current
      : null;
    setCrossWorkspaceBesideOffer(null);
    if (offer.sourceSection === "how-do-i" || shouldWalkThroughFromHowDoI(offer.sourceSection)) {
      openHowDoIToolWalkthrough(offer.targetSection);
      return;
    }
    const context =
      offer.contextMessage ??
      crossWorkspaceContextMessage(
        offer.sourceTitle ?? workspaceTitle(offer.sourceSection),
        offer.targetSection,
      );
    setWorkspaceContextBanner(context);
    setGuideBesideSession({
      source:
        offer.sourceSection === "activities" ||
        offer.sourceSection === "focus" ||
        offer.sourceSection === "guided-exercises"
          ? { kind: "activity" }
          : { kind: "section", section: offer.sourceSection },
      targetSection: offer.targetSection,
    });
    if (handoffSnapshot) {
      saveCrossWorkflowHandoff(handoffSnapshot);
      const typeLabel =
        handoffSnapshot.createBuilderSession?.typeLabel ??
        handoffSnapshot.sourceTitle;
      const answers =
        handoffSnapshot.createBuilderSession?.workflow.discoveryAnswers ?? {};
      const prefills = avatarPrefillsFromDiscovery(answers, typeLabel);
      if (prefills.length > 0) {
        applyAvatarPrefillsToPanel(prefills);
      }
    }
    patchWorkspacePanel(offer.targetSection);
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    setActiveSection("home");
    activeSectionRef.current = "home";
    applyChatLayoutMode("split");
    const nav = navForWorkspaceSection(offer.sourceSection);
    if (nav) setActiveNav(nav);
    revealWorkspace();
  }

  function clearSplitBesideWorkspace() {
    setGuideBesideSession(null);
    setWorkspaceContextBanner(null);
    setCrossWorkspaceBesideOffer(null);
    setWorkspaceFirstSplit(false);
    setCompanionStandaloneSection(null);
    patchWorkspacePanel(null);
  }

  /** Relief / guided activities — full-page only; never the split workspace pane. */
  function openActivityFullPageCore(
    session: ActivitySessionState,
    options?: {
      decisionCompassPrefill?: DecisionCompassPrefill | null;
      pushRestore?: boolean;
      strategyOpenView?: NavigationSnapshot["strategyOpenView"];
    },
  ) {
    if (session.activityId === "decision-compass") {
      openDecisionCompass(options?.decisionCompassPrefill ?? null);
      return;
    }
    if (options?.pushRestore !== false) {
      pushNavigationRestore(options?.strategyOpenView);
    }
    clearParallelCoachingOffers();
    clearSplitBesideWorkspace();
    setDecisionCompassPrefill(null);
    setDecisionCompassSession(null);
    setActivitySession(session);
    const section = session.activityId
      ? standaloneSectionForActivity(session.activityId)
      : "focus";
    setActivityReturnLabel(
      resolveActivityReturnLabel(options?.strategyOpenView, section),
    );
    setActiveSection(section);
    activeSectionRef.current = section;
    setActiveNav("focus");
  }

  /** Open full-page Adapt My Day — energy / today's reality check-in. */
  function openAdaptMyDayCore() {
    openStandaloneFocusSectionCore("energy");
  }

  /** Standalone focus tools (Clear My Mind, spin wheel, energy, etc.). */
  function openStandaloneFocusSectionCore(section: AppSection) {
    pushNavigationRestore();
    clearParallelCoachingOffers();
    clearSplitBesideWorkspace();
    setActiveSection(section);
    activeSectionRef.current = section;
    setActiveNav(navForWorkspaceSection(section) ?? "focus");
  }

  /** Full-screen Clear My Mind — top navigation entry (no split chat). */
  function openClearMyMindStandaloneCore() {
    trackWorkspaceEcosystemEvent("brain-dump");
    noteWorkspaceOpened("brain-dump", "nav_or_recommendation");
    openStandaloneFocusSectionCore("brain-dump");
  }

  function handleActivityOpenBeside(
    section: AppSection,
    payload: {
      session: ActivitySessionState;
      contextMessage: string;
    },
  ) {
    setActivitySession(payload.session);

    if (
      section === "guided-exercises" ||
      section === "focus" ||
      section === "activities"
    ) {
      openActivityFullPageCore(payload.session);
      return;
    }

    setWorkspaceContextBanner(payload.contextMessage);
    setGuideBesideSession({
      source: { kind: "activity" },
      targetSection: section,
    });
    patchWorkspacePanel(section);
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("focus");
    applyChatLayoutMode("split");
    revealWorkspace();
  }

  function openWorkspaceFromSection(section: AppSection) {
    const source = resolveCurrentGuideSection();
    if (shouldWalkThroughFromHowDoI(source)) {
      openHowDoIToolWalkthrough(section);
      return;
    }
    if (source && source !== section && source !== "home") {
      suggestCrossWorkspaceOpen(section);
      return;
    }
    if (shouldOpenBesideChat(section)) {
      openSectionBesideChatCore(section);
    } else {
      setActiveSection(section);
    }
  }

  function handleNavSelectCore(nav: SidebarNavId, mode?: CoachingMode) {
    const normalizedNav = normalizeSidebarNav(nav);

    if (normalizedNav === "chat") {
      setActiveNav("chat");
      setActiveSection("home");
      setWorkspaceFirstSplit(false);
      if (mode) setCoachingMode(mode);
      inputRef.current?.focus();
      return;
    }

    if (nav === "settings") {
      setActiveNav("settings");
      setOverlay("settings");
      return;
    }

    const section = SECTION_NAV[nav] ?? SECTION_NAV[normalizedNav] ?? "home";
    if (mode) {
      setCoachingMode(mode);
      if (section === "home") appendSystemMessage(MODE_FEEDBACK[mode]);
    }

    if (section === "home") {
      setActiveNav(normalizedNav);
      setActiveSection("home");
      inputRef.current?.focus();
      return;
    }

    if (shouldOpenBesideChat(section)) {
      openSectionBesideChatCore(section, normalizedNav);
      return;
    }

    openNavSectionDirectCore(section, normalizedNav);
  }

  function openFocusAudioCore(categoryId?: string | null) {
    clearParallelCoachingOffers();
    const fromIntent = detectAudioRequest(lastUserTextRef.current);
    setFocusAudioCategory(
      categoryId ?? (fromIntent.isAudio ? fromIntent.categoryId : null),
    );
    noteWorkspaceOpened("focus-audio", "recommendation_or_nav");
    setActiveSection("focus-audio");
    setActiveNav("focus");
  }

  function handleToolSelectCore(tool: SidebarToolId) {
    switch (tool) {
      case "brain-dump":
        openClearMyMindStandaloneCore();
        break;
      case "focus-timer":
        openStandaloneFocusSectionCore("focus-timer");
        break;
      case "breathe":
        openStandaloneFocusSectionCore("breathe");
        break;
      case "focus-audio":
        openFocusAudioCore(detectAudioRequest(lastUserTextRef.current).categoryId);
        break;
      case "time-block":
        openWorkspaceBesideChatCore("time-block", workspaceOpenAck("time-block"));
        break;
      case "activities":
        openStandaloneFocusSectionCore("focus");
        break;
      case "guided-exercises":
        pushNavigationRestore();
        clearSplitBesideWorkspace();
        setActivitySession(EMPTY_ACTIVITY_SESSION);
        setActiveSection("guided-exercises");
        activeSectionRef.current = "guided-exercises";
        setActiveNav("focus");
        break;
      case "spin-wheel":
        openStandaloneFocusSectionCore("spin-wheel");
        break;
      case "games":
        openStandaloneFocusSectionCore("games");
        break;
      case "reset-day":
        requestClearTodayContext();
        break;
      case "voice":
        toggleVoiceMode();
        setActiveSection("home");
        inputRef.current?.focus();
        break;
    }
  }

  function handleFocusHubAction(action: FocusHubAction) {
    switch (action.kind) {
      case "tool":
        handleToolSelectCore(action.tool);
        break;
      case "section":
        if (isClearMyMindSection(action.section)) {
          openClearMyMindStandaloneCore();
          break;
        }
        if (action.toolId === "mind-map") {
          saveBrainDumpVisualVisible(true);
          saveBrainDumpVisualView("mindmap");
        }
        if (action.section === "decision-compass") {
          openDecisionCompass();
          break;
        }
        if (action.section === "projects") {
          if (action.toolId === "start-new-project") {
            setProjectsBootstrapCreate(true);
            setProjectContinueId(null);
            projectContinueIdRef.current = null;
          } else if (action.toolId === "continue-active-project") {
            setProjectsBootstrapCreate(false);
            const projects = getProjects();
            const active =
              projects.find((p) => p.status === "active-focus") ??
              projects.find((p) => p.status === "in-progress") ??
              projects[0];
            if (active) {
              setProjectContinueId(active.id);
              projectContinueIdRef.current = active.id;
              setProjectsResumeId(active.id);
            }
          }
        }
        if (supportsWorkspace(action.section)) {
          openWorkspaceBesideChatCore(
            action.section,
            workspaceOpenAck(action.section),
          );
        } else {
          openStandaloneFocusSectionCore(action.section);
        }
        break;
      case "activity": {
        if (action.activityId === "decision-compass") {
          openDecisionCompass();
          break;
        }
        const activity = getActivityById(action.activityId);
        if (!activity) return;
        openActivityFullPageCore({
          ...EMPTY_ACTIVITY_SESSION,
          activityId: action.activityId,
          stepIndex: 0,
          phase: "active",
          categoryId: activity.categoryId,
        });
        break;
      }
      case "strategy":
        startStrategyApplyCoach(action.strategyId);
        break;
      case "audio":
        openFocusAudioCore(action.categoryId);
        break;
      case "chat":
        void handleSend(action.prompt, true, true);
        break;
    }
  }

  function handleSaveTemplate(content: string) {
    const firstLine = content.split("\n").find((l) => l.trim()) ?? "";
    const title = firstLine.replace(/[*#>-]/g, "").trim().slice(0, 60);
    createTemplate({
      title: title || "Saved from chat",
      body: content,
      status: "draft",
    });
  }

  function testAlert() {
    unlockChime();
    const demo: TimeBlock = {
      id: "test-alert",
      title: "Marketing plan",
      goal: "Move this forward.",
      date: todayStr(),
      startTime: "00:00",
      durationMin: 30,
      energy: "medium",
      status: "triggered",
      createdAt: new Date().toISOString(),
    };
    setTriggeredBlock(demo);
    playChime();
  }

  function startBlock(block: TimeBlock) {
    setTriggeredBlock(null);
    logMomentum("start", `Started: ${block.title}`);
    trackEcosystemEvent({
      eventType: "feature.time_block_started",
      feature: "time-block",
      metadata: {
        timeBlockId: block.id,
        durationMin: block.durationMin,
      },
    });
    setBlockStatus(block.id, "triggered");
    if (block.timerEnabled) {
      pomodoroTimer.startWith(Math.min(block.durationMin, 480), block.title);
      setActiveSection("home");
      setActiveNav("focus");
      return;
    }
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("focus");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: energyOpeningLine(block) },
    ]);
  }

  function trackMomentumCheckIn(
    block: TimeBlock,
    outcome: MomentumCheckInOutcome,
    extra?: { whatGotAttention?: string },
  ) {
    recordMomentumCheckIn({
      blockId: block.id,
      title: block.title,
      outcome,
      durationMin: block.durationMin,
      whatGotAttention: extra?.whatGotAttention,
    });
    trackEcosystemEvent({
      eventType: "feature.momentum_appointment_checkin",
      feature: "time-block",
      metadata: {
        timeBlockId: block.id,
        outcome,
        durationMin: block.durationMin,
      },
    });
  }

  function handleMomentumCheckIn(
    block: TimeBlock,
    outcome: MomentumCheckInOutcome,
  ) {
    setTriggeredBlock(null);
    setBlockStatus(block.id, statusForCheckInOutcome(outcome));
    trackMomentumCheckIn(block, outcome);
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: checkInAckMessage(outcome, block.title) },
    ]);
  }

  function handleMomentumOtherImportant(
    block: TimeBlock,
    payload: MomentumOtherImportantPayload,
  ) {
    setTriggeredBlock(null);
    setBlockStatus(block.id, statusForCheckInOutcome("other-important"));
    trackMomentumCheckIn(block, "other-important", {
      whatGotAttention: payload.whatGotAttention,
    });
    if (payload.updateAppointment && payload.newTitle?.trim()) {
      saveTimeBlock({
        id: block.id,
        title: payload.newTitle.trim(),
        goal: `Move this forward (was: ${block.title}).`,
        status: "pending",
      });
    }
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
    const msg = payload.updateAppointment
      ? `Updated your appointment to reflect what actually mattered: **${payload.newTitle?.trim()}**. Reality over plan — that's momentum.`
      : `That sounds important. **${block.title}** stays on your list — zero penalty. You moved something that mattered today.`;
    setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
  }

  function handleMomentumNotToday(
    block: TimeBlock,
    action: MomentumNotTodayAction,
  ) {
    setTriggeredBlock(null);
    if (action === "talk-through") {
      trackMomentumCheckIn(block, "not-today");
      setBlockStatus(block.id, "not-today");
      setActiveSection("home");
      setActiveNav("chat");
      setCoachingMode("today");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: notTodayFollowUpMessage(action) },
      ]);
      void handleSend(talkThroughChatOpener(block), false, true);
      return;
    }
    trackMomentumCheckIn(block, "not-today");
    switch (action) {
      case "try-tomorrow":
        saveTimeBlock({
          id: block.id,
          date: tomorrowStr(),
          status: "pending",
        });
        break;
      case "make-smaller":
        saveTimeBlock({
          id: block.id,
          durationMin: 15,
          durationFlexible: false,
          status: "pending",
        });
        break;
      case "reschedule":
        setTimeBlockFocusId(block.id);
        setActiveSection("time-block");
        break;
      case "parking-lot":
        saveTimeBlock({ id: block.id, date: "", status: "pending" });
        break;
      case "let-go":
        setBlockStatus(block.id, "not-today");
        break;
    }
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: notTodayFollowUpMessage(action) },
    ]);
  }

  function dismissMomentumTrigger(block: TimeBlock) {
    snoozeBlock(block.id, 15);
    setTriggeredBlock(null);
  }

  function handlePlaybookAsk(prompt: string) {
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("playbook");
    if (workspacePanel !== "playbook") {
      patchWorkspacePanel("playbook");
    }
    applyChatLayoutMode("split");
    revealWorkspace();
    setCoachingMode("playbook");
    void handleSend(prompt, true, true);
  }

  function handleProjectAsk(prompt: string) {
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("chat");
    if (workspacePanel !== "projects") {
      patchWorkspacePanel("projects");
    }
    applyChatLayoutMode("split");
    revealWorkspace();
    setCoachingMode("today");
    void handleSend(prompt, true, true);
  }

  function handleOpenProjectTimeBlock(projectId: string, blockId?: string) {
    setProjectContinueId(projectId);
    setTimeBlockFocusId(blockId ?? null);
    openWorkspaceBesideChatCore("time-block", workspaceOpenAck("time-block"));
  }

  function handleTemplateBuildWithShari(input: CreationWorkspaceInput) {
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("chat");
    applyChatLayoutMode("split");
    const itemType =
      input.itemType && input.itemType !== "template"
        ? input.itemType
        : "Document";
    const body = input.draftContent?.trim() ?? "";
    requestCreateOpen(
      "content-generator",
      {
        itemType,
        title: input.title,
        draftContent: body || collaborativeScaffoldForType(itemType, input.title),
        brief: input.brief ?? input.title,
        stage: "editing draft",
        source: "template",
        artifactTypeLocked: shouldLockArtifactType(itemType),
      },
      {
        ackMessage: createReceiptMessage("template_applied", { itemType }),
        seedOverride: {
          type: itemType,
          topic: input.title,
          brief: input.brief ?? input.title,
          draft: body || undefined,
          autoGenerate: false,
        },
      },
      { source: "template", userInitiated: true },
    );
    createPanelWorkflowRef.current = liveCreateWorkflowState(
      itemType,
      createPanelWorkflowRef.current,
    );
    revealWorkspace();
    setCoachingMode("today");
    void handleSend(
      templateBuildWithShariChatPrompt({
        title: input.title,
        body: input.draftContent,
      }),
      false,
      true,
    );
  }

  function handleTemplateOpenInCreate(input: CreationWorkspaceInput) {
    openCreateWithShari({
      ...input,
      source: "template",
      stage: input.stage ?? "using template",
    });
  }

  function handleDecisionCompassSessionChange(
    snapshot: PersistedDecisionCompassSession,
  ) {
    const authority = enrichAuthority(snapshot);
    setDecisionCompassSession(snapshot);
    saveDecisionCompassAuthority(authority);
  }

  function handleDecisionCompassComplete() {
    captureWorkspaceCompleted("decision-compass", closedLoopCtx());
    setDecisionCompassPrefill(null);
  }

  function startBusinessStrategyBuilder(typeLabel: string) {
    setBusinessStrategyDraft(null);
    setStrategyApplySession(null);
    clearStrategyApplySession();
    setStrategyPanelCommand(null);
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("playbook");
    patchWorkspacePanel("playbook");
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    applyChatLayoutMode("split");
    revealWorkspace();
    workspaceCoachSeededRef.current = null;
    setCoachingMode("playbook");
    const { session, opener } = bootstrapBusinessStrategySession(typeLabel);
    setBusinessStrategySession(session);
    setMessages((prev) => [...prev, { role: "assistant", content: opener }]);
    inputRef.current?.focus();
  }

  function showBusinessStrategyDraft(draft: {
    typeLabel: string;
    draft: string;
  }) {
    setStrategyPanelCommand(null);
    setStrategyApplySession(null);
    clearStrategyApplySession();
    setBusinessStrategyDraft(draft);
    setCoachingMode("playbook");
  }

  function beginStrategyApplyVisibleChat(opener: string, strategyId: string) {
    clearAllPendingOffers();
    setStrategyDisambiguationPending(false);
    setWorkspaceOffer(null);
    setToolSuggestion(null);
    setActionBridge(null);
    setBridge(null);
    setProjectCoachSession(null);
    setProjectCoachTopicPickerVisible(false);
    workspaceCoachSeededRef.current = `strategy-apply:${strategyId}`;
    workspaceChatScopeRef.current = null;
    clearConversation();
    setMessages([
      { role: "assistant", content: toPlainLanguageDisplay(opener) },
    ]);
    setInput("");
    setError(null);
  }

  function startStrategyApplyCoach(strategyId: string) {
    setBusinessStrategyDraft(null);
    setBusinessStrategySession(null);
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("playbook");
    if (workspacePanel !== "playbook") {
      patchWorkspacePanel("playbook");
    }
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    applyChatLayoutMode("split");
    revealWorkspace();
    setCoachingMode("playbook");
    setStrategyPanelCommand({ key: Date.now(), strategyId });

    const boot = bootstrapStrategyApplySession(strategyId, {
      activeProjectName: pickActiveProjectName(),
    });
    if (!boot) return;
    setStrategyApplySession(boot.session);
    saveStrategyApplySession(boot.session, { workspacePanelOpen: true });
    beginStrategyApplyVisibleChat(boot.opener, strategyId);
    inputRef.current?.focus();
  }

  function strategyIdFromOpenTarget(target: StrategyOpenTarget): string | null {
    if (target.kind === "builtin") return target.strategyId;
    if (target.entry.route.kind === "builtin") return target.entry.route.strategyId;
    return null;
  }

  function handleExitActivity() {
    setActivitySession(EMPTY_ACTIVITY_SESSION);
    activitySessionRef.current = EMPTY_ACTIVITY_SESSION;
    setActivityReturnLabel(null);
    goBack({ skipInterceptor: true });
  }

  function handleStrategiesOpenActivity(activityId: string) {
    const activity = getActivityById(activityId);
    if (!activity) return;
    openActivityFullPageCore(
      {
        ...EMPTY_ACTIVITY_SESSION,
        activityId,
        stepIndex: 0,
        phase: "active",
        categoryId: activity.categoryId,
      },
      { pushRestore: true, strategyOpenView: "adhd" },
    );
  }

  function handleHowDoIEcosystemOpen(result: EcosystemSearchResult) {
    const action = result.action;
    switch (action.kind) {
      case "section":
        openHowDoIToolWalkthrough(action.section);
        break;
      case "activity":
        if (action.activityId === "decision-compass") {
          openDecisionCompass();
        } else {
          handleStrategiesOpenActivity(action.activityId);
        }
        break;
      case "strategy": {
        const strategy = STRATEGIES.find((s) => s.id === action.strategyId);
        if (strategy) {
          openStrategyFromChat({
            kind: "builtin",
            strategyId: strategy.id,
            title: strategy.title,
          });
        }
        break;
      }
      case "tool":
        handleToolSelectCore(action.tool);
        break;
      case "settings":
        openHowDoISettings(action.section as SettingsSection);
        break;
      case "help-article":
        break;
    }
  }

  function openStrategyFromChat(target: StrategyOpenTarget) {
    if (workspacePanel !== "playbook") {
      patchWorkspacePanel("playbook");
      setActiveSection("home");
      activeSectionRef.current = "home";
      setActiveNav("playbook");
      applyChatLayoutMode("split");
      revealWorkspace();
    }
    if (target.kind === "builtin") {
      setStrategyPanelCommand({
        key: Date.now(),
        strategyId: target.strategyId,
      });
      return;
    }
    if (target.entry.route.kind === "builtin") {
      setStrategyPanelCommand({
        key: Date.now(),
        strategyId: target.entry.route.strategyId,
      });
      return;
    }
    setStrategyPanelCommand({
      key: Date.now(),
      hubEntryId: target.entry.id,
    });
  }

  function renderStrategiesPanel(extra?: {
    registerBack?: (fn: (() => boolean) | null) => void;
  }) {
    return renderPlaybookPanel(extra);
  }

  function renderPlaybookPanel(extra?: {
    registerBack?: (fn: (() => boolean) | null) => void;
  }) {
    return (
      <StrategiesPanel
        onOpen={openWorkspaceFromSection}
        onAsk={handlePlaybookAsk}
        onContextChange={handleWorkspaceDetailChange}
        onStartBusinessStrategy={startBusinessStrategyBuilder}
        onStartStrategyApply={startStrategyApplyCoach}
        onOpenActivity={handleStrategiesOpenActivity}
        registerBack={extra?.registerBack}
        openCommand={strategyPanelCommand}
        strategyApplySession={strategyApplySession}
        onDismissStrategyApply={() => {
          setStrategyApplySession(null);
          clearStrategyApplySession();
        }}
        businessStrategySession={businessStrategySession}
        businessStrategyDraft={businessStrategyDraft}
        onDismissBusinessBuild={() => {
          setBusinessStrategyDraft(null);
          setBusinessStrategySession(null);
        }}
        onTalkBusinessWithShari={() => {
          applyChatLayoutMode("split");
          revealWorkspace();
          inputRef.current?.focus();
          if (businessStrategyDraft) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Your **${businessStrategyDraft.typeLabel}** outline is beside us. What should we flesh out first — weekly breakdown, content ideas, messaging, or something else?`,
              },
            ]);
          }
        }}
      />
    );
  }

  function handleFocusSession(minutes: number) {
    savePreferredFocusMinutes(minutes);
    logMomentum("start", `Focus session — ${minutes} min`);
    setActiveNav("focus");
    setCoachingMode("focus");
  }

  function handleFocusSessionStarted() {
    setActiveSection("home");
    if (workspacePanel === "focus-timer") {
      patchWorkspacePanel(null);
    }
  }

  function handleFocusDebrief(
    outcome: import("@/lib/focusSession").FocusDebriefOutcome,
  ) {
    if (outcome === "done" || outcome === "progress") {
      logMomentum("complete", `Focus session — ${outcome}`);
    }
    if (outcome === "stuck") {
      void handleSend(
        "I got stuck during my focus session — can you help me find the smallest next step?",
        true,
        true,
      );
    }
  }

  function clearPendingAcceptanceAuthority() {
    setPendingAcceptanceRecord(null);
  }

  function applyWorkflowContinuation(
    result: WorkflowContinuationResult,
    userMessage: Message,
    fresh: boolean,
  ): boolean {
    const continuedKind =
      conversationWorkflow?.kind ??
      result.nextWorkflow?.kind ??
      "guided_continue";
    setConversationWorkflow(result.nextWorkflow ?? null);

    if (result.action === "open_section") {
      registerFeatureOpened(result.section, result.message);
      recordConfidenceWin({
        kind: "momentum_progress",
        label: `Opened ${result.section.replace(/-/g, " ")}`,
        context: result.message.slice(0, 120),
      });
    }
    registerWorkflowContinuation(continuedKind, result.message);

    if (result.action === "open_section") {
      switch (result.section) {
        case "brain-dump":
          openClearMyMindStandaloneCore();
          break;
        case "decision-compass":
          openDecisionCompass();
          break;
        case "energy":
          setActiveSection("energy");
          activeSectionRef.current = "energy";
          break;
        case "plan-my-day":
          openSectionBesideChatCore("plan-my-day");
          break;
        default:
          openSectionBesideChatCore(result.section);
          break;
      }
    } else if (result.action === "open_tool") {
      handleToolSelectCore(result.tool);
    }

    if (fresh) clearConversation();
    setMessages((prev) => [
      ...(fresh ? [] : prev),
      userMessage,
      { role: "assistant", content: result.message },
    ]);
    setInput("");
    voiceUsedRef.current = false;
    setIsLoading(false);
    inputRef.current?.focus();
    return true;
  }

  function publishConversationOffer(
    offerLine: string,
    workspaceOffer?: WorkspaceOffer | null,
  ) {
    const { workflow } = trackConversationOffer({
      offerLine,
      offeredAtTurn: chatTurnRef.current,
      workspaceOffer,
    });
    if (workflow) setConversationWorkflow(workflow);
    if (workspaceOffer) {
      registerPendingOffer({
        offerSummary: workspaceOffer.buttonLabel,
        section: workspaceOffer.section,
        workflowKind: workflow?.kind,
        pendingQuestion: offerLine,
      });
    }
  }

  function tryContinueConversationWorkflow(
    trimmed: string,
    lastAssistantText: string,
    fresh: boolean,
  ): boolean {
    const userMessage: Message = { role: "user", content: trimmed };

    const surveyOfferType = inferSurveyTypeFromAssistantOffer(lastAssistantText);
    if (surveyOfferType && isAcceptanceAttempt(trimmed)) {
      const template = SURVEY_TEMPLATES[surveyOfferType];
      recordSurveyCreated(surveyOfferType, { influencedDecision: true });
      registerPendingOffer({
        offerSummary: template.name,
        section: "content-generator",
        pendingQuestion: lastAssistantText,
      });
      openCreateWithShari(
        buildSurveyCreationInput(template, "standard"),
      );
      if (fresh) clearConversation();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        {
          role: "assistant",
          content:
            `I've opened **${template.name}** in Create with proven questions already loaded — ` +
            "edit anything to match your voice, then share it with customers.",
        },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      setIsLoading(false);
      inputRef.current?.focus();
      return true;
    }

    const exportOffer = detectArtifactExportOffer(trimmed, creationContext);
    const pendingNow = resolvePendingAction({
      workspaceOffer,
      artifactExportOffer: exportOffer ?? artifactExportOffer,
      assistedActionOffer,
      doItNowOffer,
      toolSuggestion,
      actionBridge,
      bridge,
      lockedArtifactType,
    });

    const resolution = resolveCompanionAcceptanceTurn({
      userText: trimmed,
      lastAssistantText,
      currentTurn: chatTurnRef.current,
      workflow: conversationWorkflow,
      outcomeThread: getOutcomeThread(),
      pendingInput: {
        workspacePanel: workspacePanelRef.current,
        record: pendingAcceptanceRecord,
        pendingAction: pendingNow,
        createConsent: pendingCreateOpen,
      },
    });

    if (resolution.kind === "workflow") {
      return applyWorkflowContinuation(resolution.continuation, userMessage, fresh);
    }

    if (resolution.kind === "pending") {
      const pending = resolution.result;
      if (
        pending.outcome === "conversation" ||
        pending.outcome === "expired"
      ) {
        if (fresh) clearConversation();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: pending.message },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        setIsLoading(false);
        inputRef.current?.focus();
        return true;
      }
      if (dispatchResolvedAcceptance(pending, pendingNow)) {
        if (fresh) clearConversation();
        setMessages((prev) => [...(fresh ? [] : prev), userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        setIsLoading(false);
        inputRef.current?.focus();
        return true;
      }
    }

    return false;
  }

  function openBusinessIntelligenceProfile(section: AppSection) {
    setBusinessConfidenceOffer(null);
    if (section === "business-profile") {
      setActiveSection("business-profile");
      activeSectionRef.current = "business-profile";
      return;
    }
    if (section === "client-avatars") {
      openSectionBesideChatCore("client-avatars");
      return;
    }
    openSectionBesideChatCore(section);
  }

  function continueBusinessAdviceAnyway() {
    businessConfidenceBypassRef.current = true;
    setBusinessConfidenceOffer(null);
    const pending = businessConfidencePendingTextRef.current;
    businessConfidencePendingTextRef.current = null;
    if (pending) {
      void handleSend(pending, false, false);
      return;
    }
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: businessConfidenceContinueAck() },
    ]);
  }

  function registerPendingAcceptance(
    kind: PendingAcceptanceKind,
    offerSummary: string,
  ) {
    setPendingAcceptanceRecord(
      createPendingAcceptanceRecord(
        kind,
        offerSummary,
        chatTurnRef.current,
        workspacePanelRef.current,
      ),
    );
  }

  function pendingKindFromAction(action: PendingAction): PendingAcceptanceKind {
    switch (action.kind) {
      case "workspace":
        return "workspace";
      case "artifact-export":
        return "artifact_export";
      case "assisted":
        return "assisted";
      case "do-it-now":
        return "do_it_now";
      case "tool":
        return "tool";
      case "action-bridge":
        return "action_bridge";
      case "make-bridge":
        return "make_bridge";
    }
  }

  function dispatchResolvedAcceptance(
    acceptance: ReturnType<typeof resolvePendingAcceptance>,
    pendingNow: PendingAction | null,
  ): boolean {
    if (acceptance.outcome !== "accept") return false;

    clearPendingAcceptanceAuthority();
    postCreateTransparencyMessage(acceptance.ack);

    switch (acceptance.kind) {
      case "create_consent":
      case "draft_switch": {
        const pending = pendingCreateOpen;
        setPendingCreateOpen(null);
        if (pending) {
          requestCreateOpen(pending.section, pending.input, undefined, {
            source: pending.source,
            artifact: pending.artifact,
            consentGranted: true,
            skipConsentCheck: true,
          });
        }
        return true;
      }
      case "workspace":
        if (workspaceOffer) {
          if (
            workspacePanel === "content-generator" &&
            workspaceOffer.section === "content-generator"
          ) {
            setWorkspaceOffer(null);
            setActiveSection("home");
            setActiveNav("other");
          } else if (
            workspacePanel === "content-generator" &&
            workspaceOffer.section !== "content-generator"
          ) {
            setWorkspaceOffer(null);
          } else if (companionFirstTargetRef.current) {
            acceptCompanionFirstTarget(companionFirstTargetRef.current);
            companionFirstTargetRef.current = null;
          } else {
            acceptWorkspaceOffer(workspaceOffer);
          }
        } else if (pendingNow?.kind === "workspace") {
          acceptWorkspaceOffer(pendingNow.offer);
        }
        return true;
      case "assisted":
        if (assistedActionOffer) {
          acceptAssistedAction(assistedActionOffer);
        } else if (pendingNow?.kind === "assisted") {
          acceptAssistedAction(pendingNow.action);
        }
        return true;
      default:
        if (pendingNow) {
          executePendingAction(pendingNow);
        }
        return true;
    }
  }

  function clearAllPendingOffers() {
    setWorkspaceOffer(null);
    setAssistedActionOffer(null);
    setArtifactExportOffer(null);
    setDoItNowOffer(null);
    setToolSuggestion(null);
    setStressReliefOffer(null);
    setBusinessConfidenceOffer(null);
    setActionBridge(null);
    setBridge(null);
    setPendingCreateOpen(null);
    clearPendingAcceptanceAuthority();
  }

  const lockedArtifactType = useMemo(
    () => lockedArtifactFromContext(creationContext),
    [creationContext],
  );

  useEffect(() => {
    if (!workspaceOffer) {
      lastWorkspaceOfferLineRef.current = null;
      setPendingAcceptanceRecord((prev) =>
        prev?.kind === "workspace" ? null : prev,
      );
      return;
    }
    if (lastWorkspaceOfferLineRef.current === workspaceOffer.line) return;
    lastWorkspaceOfferLineRef.current = workspaceOffer.line;
    setPendingAcceptanceRecord(
      createPendingAcceptanceRecord(
        "workspace",
        workspaceOffer.line,
        chatTurnRef.current,
        workspacePanelRef.current,
      ),
    );
    captureOfferShown(workspaceOffer, closedLoopCtx());
  }, [workspaceOffer]);

  useEffect(() => {
    if (!assistedActionOffer || workspaceOffer) return;
    setPendingAcceptanceRecord((prev) => {
      if (prev?.kind === "create_consent" || prev?.kind === "draft_switch") {
        return prev;
      }
      return createPendingAcceptanceRecord(
        "assisted",
        assistedActionOffer.offerLine,
        chatTurnRef.current,
        workspacePanelRef.current,
      );
    });
  }, [assistedActionOffer, workspaceOffer]);

  useEffect(() => {
    if (!toolSuggestion || workspaceOffer || assistedActionOffer) return;
    setPendingAcceptanceRecord((prev) => {
      if (prev?.kind === "create_consent" || prev?.kind === "draft_switch") {
        return prev;
      }
      return createPendingAcceptanceRecord(
        "tool",
        toolSuggestion.line,
        chatTurnRef.current,
        workspacePanelRef.current,
      );
    });
  }, [toolSuggestion, workspaceOffer, assistedActionOffer]);

  useEffect(() => {
    if (!actionBridge || workspaceOffer || toolSuggestion) return;
    setPendingAcceptanceRecord((prev) => {
      if (prev?.kind === "create_consent" || prev?.kind === "draft_switch") {
        return prev;
      }
      return createPendingAcceptanceRecord(
        "tool",
        actionBridge.label,
        chatTurnRef.current,
        workspacePanelRef.current,
      );
    });
  }, [actionBridge, workspaceOffer, toolSuggestion]);

  useEffect(() => {
    if (!splitCreateChat) {
      createBuilderBootstrappedRef.current = false;
      return;
    }
    if (createBuilderBootstrappedRef.current) return;
    if (!shouldBootstrapCreateBuilder()) {
      createBuilderBootstrappedRef.current = true;
      setCreateBuilderSession(null);
      return;
    }
    startCreateBuilderChat(
      creationContext?.itemType ?? genSeed?.type ?? lockedArtifactType,
      createPanelWorkflowRef.current,
    );
  }, [
    splitCreateChat,
    creationContext?.itemType,
    genSeed?.type,
    lockedArtifactType,
  ]);

  function runArtifactExport(action: ArtifactExportAction) {
    setArtifactExportOffer(null);
    if (
      tryOpenCreateForCurrentArtifact(lastUserTextRef.current, {
        exportTrigger: action,
      })
    ) {
      return;
    }
    if (workspacePanel === "content-generator") {
      setActiveSection("home");
      setActiveNav("other");
      focusWorkspaceLayout();
      revealWorkspace();
      setExportTrigger(action);
    }
  }

  function acceptCompanionFirstTarget(target: CompanionFirstTarget) {
    clearAllPendingOffers();
    setWorkspaceOffer(null);
    if (target.section === "content-generator" && target.itemType) {
      openCreationWorkspaceCore(
        "content-generator",
        {
          itemType: target.itemType,
          title: `New ${target.itemType}`,
          brief: lastUserTextRef.current,
          stage: "starting compose",
          source: "generated",
        },
        {
          ackMessage: target.coachAfterOpen,
          seedOverride: { autoGenerate: false },
        },
      );
      applyConversationPrefillsToWorkspace("content-generator");
      return;
    }
    if (usesSplitWalkthrough(target)) {
      openHowDoIToolWalkthrough(target.section);
      applyConversationPrefillsToWorkspace(target.section);
      return;
    }
    openWorkspaceBesideChatCore(target.section, target.coachAfterOpen);
  }

  function applyConversationPrefillsToWorkspace(
    section: AppSection,
  ): string | null {
    const prefills = extractConversationPrefill(toChatTurns(messages), section);
    if (prefills.length === 0) return null;
    const staggered = staggerPrefillKeys(prefills);
    staggered.forEach((fill, i) => {
      window.setTimeout(() => {
        applyWorkspaceWrite(
          workspaceFillAction(section, fill.field, fill.value, "prefill", {
            key: fill.key,
          }),
          { skipValidation: true },
        );
      }, i * 80);
    });
    return buildPrefillSummaryMessage(section, prefills);
  }

  function openWorkspaceBesideChatCore(
    section: AppSection,
    ack = workspaceOpenAck(section),
  ) {
    if (isClearMyMindSection(section)) {
      openClearMyMindStandaloneCore();
      return;
    }
    clearParallelCoachingOffers();
    if (section === "content-generator") {
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("other");
        focusWorkspaceLayout();
        revealWorkspace();
      } else if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession(undefined, ack)
      ) {
        focusWorkspaceLayout();
        revealWorkspace();
      } else if (
        tryOpenCreateForCurrentArtifact(lastUserTextRef.current, {
          ackMessage: ack,
        })
      ) {
        /* opened with current artifact */
      } else {
        openCreationWorkspaceCore(
          "content-generator",
          {
            itemType: "",
            title: "Create with Shari",
            brief: lastUserTextRef.current,
            stage: "choosing what to create",
            source: "generated",
          },
          { ackMessage: ack, seedOverride: { autoGenerate: false } },
        );
      }
      trackWorkspaceEcosystemEvent("content-generator");
      noteWorkspaceOpened("content-generator", "beside_chat");
      return;
    }

    if (workspacePanel === section) {
      setActiveSection("home");
      activeSectionRef.current = "home";
      focusWorkspaceLayout();
      revealWorkspace();
      appendVerifiedWorkspaceMessage(section, ack, { appendOnly: true });
      return;
    }

    pushNavigationRestore();
    patchWorkspacePanel(section);
    setWorkspaceDetail(emptyWorkspaceDetail());
    setActiveSection("home");
    activeSectionRef.current = "home";
    focusWorkspaceLayout();
    if (section === "projects") {
      setActiveNav("projects");
      setProjectsBootstrapCreate(true);
      const day = getDayState();
      const energy = resolveWorkspaceEnergy(
        day?.energy,
        lastUserTextRef.current,
        day?.overwhelm,
      );
      const session = normalizeSession(
        createWorkspaceSession(section, lastUserTextRef.current, energy),
      );
      setWorkspaceSession(session);
      saveWorkspaceSession(session);
    } else {
      setActiveNav("chat");
      setWorkspaceSession(null);
    }
    revealWorkspace();
    trackWorkspaceEcosystemEvent(section);
    noteWorkspaceOpened(section, "beside_chat");
    if (isPurityScopedSection(section)) {
      beginWorkspaceChat({ section }, resolveWorkspaceOpener(section));
    } else {
      const prefillNote = applyConversationPrefillsToWorkspace(section);
      appendVerifiedWorkspaceMessage(
        section,
        prefillNote ? `${ack}\n\n${prefillNote}` : ack,
      );
    }
  }

  function executePendingActionCore(action: PendingAction) {
    switch (action.kind) {
      case "workspace":
        acceptWorkspaceOffer(action.offer);
        break;
      case "artifact-export":
        runArtifactExport(action.offer.actions[0] ?? "save");
        break;
      case "assisted":
        acceptAssistedAction(action.action);
        break;
      case "do-it-now":
        launchDoItNow(action.offer);
        break;
      case "tool":
        acceptToolSuggestion(action.suggestion);
        break;
      case "action-bridge":
        launchActionBridge(action.bridge);
        break;
      case "make-bridge": {
        setActiveNav("other");
        const artifact = resolveChatHandoffArtifact(toChatTurns(messages), {
          hintType: action.bridge.type,
          userText: lastUserTextRef.current,
        });
        if (artifact?.draftContent?.trim()) {
          openCreateWithResolvedArtifact(artifact);
          break;
        }
        openCreationWorkspaceCore(
          "content-generator",
          {
            itemType: action.bridge.type,
            title: action.bridge.brief,
            brief: action.bridge.brief,
            stage: "starting compose",
            source: "generated",
          },
          {
            seedOverride: {
              type: action.bridge.type,
              brief: action.bridge.brief,
              topic: action.bridge.brief,
              sourceText: action.bridge.brief,
            },
          },
        );
        break;
      }
    }
    clearAllPendingOffers();
  }

  async function handleSend(
    overrideText?: string,
    fresh = false,
    skipToolOffer = false,
  ) {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isLoading) return;

    chatTurnRef.current += 1;

    if (topicChangeClearsThread(trimmed)) {
      clearOutcomeThread();
    } else if (
      trimmed.length >= 12 &&
      !isBareGenericAcceptance(trimmed) &&
      !isAcceptanceAttempt(trimmed)
    ) {
      registerProblemFromUser(trimmed);
    }

    if (
      conversationWorkflow &&
      !isAcceptanceAttempt(trimmed) &&
      topicChangeInvalidatesOffer(trimmed, {
        id: conversationWorkflow.kind,
        kind: "assisted",
        createdAt: 0,
        offeredAtTurn: conversationWorkflow.offeredAtTurn,
        workspacePanelAtOffer: null,
        offerSummary: conversationWorkflow.offerSummary,
      })
    ) {
      setConversationWorkflow(null);
    }

    if (businessConfidenceOffer) {
      const lower = trimmed.toLowerCase();
      if (
        /continue anyway/i.test(lower) ||
        (isAcceptanceAttempt(trimmed) &&
          /continue|anyway|without (?:the )?profile/i.test(lower))
      ) {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        continueBusinessAdviceAnyway();
        return;
      }
    }

    if (
      pendingAcceptanceRecord &&
      !isAcceptanceAttempt(trimmed) &&
      topicChangeInvalidatesOffer(trimmed, pendingAcceptanceRecord)
    ) {
      clearPendingAcceptanceAuthority();
      setPendingCreateOpen(null);
    }

    if (isReturnToConversationRequest(trimmed)) {
      const stash = loadStashedConversation();
      const userMessage: Message = { role: "user", content: trimmed };
      if (stash?.messages?.length) {
        setMessages([
          ...stash.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          userMessage,
          {
            role: "assistant",
            content: buildRecoveryRestoredMessage(stash.label),
          },
        ]);
        clearStashedConversation();
        setInput("");
        setActiveSection("home");
        setActiveNav("chat");
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (pendingConversationHandoff && userAcceptedAssemblyConfirmation(trimmed)) {
      const userMessage: Message = { role: "user", content: trimmed };
      const nextMsgs = [...messages, userMessage];
      setMessages(nextMsgs);
      setInput("");
      openCreateFromConversationHandoff(pendingConversationHandoff, nextMsgs);
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (builderKickoffActive) {
      setBuilderKickoffActive(false);
    }

    if (appFeatureNavOffer && userAcceptedFeatureNav(trimmed)) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      acceptAppFeatureNavOffer(appFeatureNavOffer);
      setIsLoading(false);
      return;
    }

    const settingsFeatureNav = buildAppFeatureNavOffer(trimmed);
    if (
      settingsFeatureNav?.target.kind === "settings" &&
      !appFeatureNavOffer
    ) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: settingsFeatureNav.reply },
      ]);
      setAppFeatureNavOffer(settingsFeatureNav);
      setInput("");
      setToolSuggestion(null);
      setActionBridge(null);
      setBridge(null);
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (crossWorkspaceBesideOffer?.clientAvatarHandoff) {
      const userMessage: Message = { role: "user", content: trimmed };
      if (userAcceptedClientAvatarHandoff(trimmed)) {
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        acceptCrossWorkspaceBeside(crossWorkspaceBesideOffer);
        setIsLoading(false);
        return;
      }
      if (userDeclinedClientAvatarHandoff(trimmed)) {
        clientAvatarHandoffDeclinedRef.current = true;
        setCrossWorkspaceBesideOffer(null);
        pendingClientAvatarHandoffRef.current = null;
        setMessages((prev) => [
          ...prev,
          userMessage,
          {
            role: "assistant",
            content:
              "No problem — we'll keep building here. Answer in your own words whenever you're ready.",
          },
        ]);
        setInput("");
        setIsLoading(false);
        return;
      }
    }

    if (strategyDisambiguationPending) {
      const choice = parseStrategyDisambiguationChoice(trimmed);
      const userMessage: Message = { role: "user", content: trimmed };
      if (choice === "business_create") {
        setStrategyDisambiguationPending(false);
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        startBusinessStrategyBuilder("Business Strategy");
        return;
      }
      if (choice === "adhd_apply") {
        setStrategyDisambiguationPending(false);
        setMessages((prev) => [
          ...prev,
          userMessage,
          {
            role: "assistant",
            content:
              "Got it — **ADHD strategy to use now**. Open the **ADHD Strategies** dropdown and pick one, or tell me what's happening (focus, overwhelm, deciding, getting started…).",
          },
        ]);
        setInput("");
        return;
      }
    }

    if (
      workspacePanel === "playbook" &&
      !strategyDisambiguationPending &&
      classifyStrategyIntent(trimmed) === "business_create"
    ) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      const typeMatch = trimmed.match(
        /\b(marketing|sales|launch|content|product|visibility)\b/i,
      );
      const label = typeMatch
        ? `${typeMatch[1]!.charAt(0).toUpperCase()}${typeMatch[1]!.slice(1).toLowerCase()} Strategy`
        : "Business Strategy";
      startBusinessStrategyBuilder(label);
      return;
    }

    if (
      /\bstrateg/i.test(trimmed) &&
      /\b(?:create|how\s+do)/i.test(trimmed)
    ) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: strategyDisambiguationMessage() },
      ]);
      setStrategyDisambiguationPending(true);
      setInput("");
      return;
    }

    const applySession = strategyApplySessionRef.current;
    const applyWorkflowActive =
      workspacePanel === "playbook" &&
      applySession &&
      applySession.phase !== "done";
    const applyChatActive =
      applyWorkflowActive && !isWorkflowConceptQuestion(trimmed);

    if (applyChatActive && !fresh) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(false);
      const turn = processStrategyApplyTurn(applySession, trimmed);
      setStrategyApplySession(turn.session);
      saveStrategyApplySession(turn.session, { workspacePanelOpen: true });
      if (turn.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: toPlainLanguageDisplay(turn.reply) },
        ]);
      }
      return;
    }

    const builderSession = createBuilderSessionRef.current;
    const createBuilderWorkflowActive = isCreateBuilderWorkflowActive(
      builderSession,
      workspacePanel,
    );
    const discoveryHelpBypass =
      shouldUseCreateBuilderChatTurns() &&
      createBuilderWorkflowActive &&
      shouldBypassCreateBuilderForSectionHelp(builderSession, trimmed);
    if (discoveryHelpBypass && builderSession) {
      const helpSession = prepareDiscoveryHelpContext(
        builderSession,
        trimmed,
        [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "",
      );
      const baseRecord =
        createWorkflowRecordRef.current ??
        loadWorkflowRecord() ??
        workflowRecordFromState(builderSession.workflow, {
          builderPhase: builderSession.phase,
          source: "chat",
          itemType: builderSession.typeLabel,
        });
      const record = mergeRecordFromWorkflow(
        baseRecord,
        helpSession.workflow,
        "chat",
        builderSession.phase,
      );
      commitCreateWorkflowRecord(record);
      setCreateBuilderSession({ ...builderSession, workflow: helpSession.workflow });
    }
    const builderChatActive =
      shouldUseCreateBuilderChatTurns() &&
      chatLayoutMode === "split" &&
      createBuilderWorkflowActive &&
      !isWorkflowConceptQuestion(trimmed) &&
      !discoveryHelpBypass;

    if (builderChatActive && !fresh && builderSession) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(false);

      const lastAssistantForBuilder =
        [...messages].reverse().find((m) => m.role === "assistant")?.content ??
        "";

      const baseRecord =
        createWorkflowRecordRef.current ??
        loadWorkflowRecord() ??
        workflowRecordFromState(builderSession.workflow, {
          builderPhase: builderSession.phase,
          source: "chat",
          itemType: builderSession.typeLabel,
        });

      const turn = processCreateBuilderTurnWithRecord(
        baseRecord,
        trimmed,
        lastAssistantForBuilder,
      );
      commitCreateWorkflowRecord(turn.record);
      const nextSession = turn.session;
      const sessionId = turn.record.workflowId;
      logSharedCreateSession(
        "chatAnswerSaved",
        turn.record.workflowState,
        sessionId,
      );

      if (nextSession.phase === "readiness") {
        logCreateBuild("readyToBuild true", {
          itemType: nextSession.typeLabel,
          sessionId,
        });
      }

      if (nextSession.typeLabel && nextSession.typeLabel !== creationContext?.itemType) {
        syncCreateBuilderType(nextSession.typeLabel);
      }

      if (turn.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: turn.reply },
        ]);
        proposeClientAvatarHandoffIfNeeded(nextSession, {
          lastAssistantText: turn.reply,
        });
      }

      if (turn.generateBrief && turn.generateType) {
        const wfForBuild = {
          ...workflowStateFromRecord(turn.record),
          draftStatus: "building" as const,
          readinessConfirmed: true,
          buildApproved: false,
          step: "readiness" as const,
          questionMode: "split_screen" as const,
        };
        const buildingRecord = mergeRecordFromWorkflow(
          turn.record,
          wfForBuild,
          "chat",
          "generating",
        );
        commitCreateWorkflowRecord(buildingRecord);
        const brief =
          buildBriefFromRecord(turn.record).trim() || turn.generateBrief;
        const started = await triggerChatBuildDraft(
          brief,
          turn.generateType,
          wfForBuild,
        );
        if (started) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Creating your **${turn.generateType}** draft now.`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Something went wrong starting your draft — try **Build Draft** again.",
            },
          ]);
        }
      }

      if (turn.reviseInstruction) {
        setChatReviseRequest({
          instruction: turn.reviseInstruction,
          key: Date.now(),
        });
      }

      voiceUsedRef.current = false;
      if (splitCreateChat && workspacePanel === "content-generator") {
        stayInCreateSplitScreen();
      }
      return;
    }

    const isNewConversation = !messages.some((m) => m.role === "user");
    if (isNewConversation) recordConversationStart();
    lastUserTextRef.current = trimmed;
    if (!getPrefs().hasChatted) {
      savePrefs({ hasChatted: true });
      setHasChatted(true);
    }
    if (
      typeof window !== "undefined" &&
      !window.sessionStorage.getItem("ecosystem-chat-started-v1")
    ) {
      trackEcosystemEvent({
        eventType: "companion.conversation_started",
        feature: "companion",
      });
      window.sessionStorage.setItem("ecosystem-chat-started-v1", "1");
    }
    const detectedEmotion = detectEmotionalState(trimmed);
    lastEmotionalStateRef.current = detectedEmotion;
    const classifiedSignals = observeUserSignalsFromText({
      text: trimmed,
      emotionalState: detectedEmotion,
      source: "chat",
    });
    void syncClassifiedSignalsToServer(classifiedSignals);
    ingestClassifiedUserSignals(classifiedSignals, {
      source: "chat",
      emotionalState: detectedEmotion,
    });
    const lastAssistantBeforeSend =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
    const mistakeRecord = processMistakeSignalsFromUserTurn({
      userText: trimmed,
      lastAssistantText: lastAssistantBeforeSend,
      hadRecentOffer: Boolean(workspaceOffer || toolSuggestion),
    });
    if (mistakeRecord) {
      recordRecoveryOutcome({
        mistakeId: mistakeRecord.id,
        repairAttempted: false,
        conversationContinued: true,
        outcomeAchieved: false,
      });
    }
    reportShadowParityAfterChatTurn();

    const messageCategory = classifyUserMessage(trimmed, {
      workspaceOpen: workspacePanel,
    });
    const overwhelmed =
      isGenuineEmotionalDistress(trimmed) &&
      (messageCategory === "emotional_distress" ||
        (messageCategory === "mixed_emotional_task" &&
          /\boverwhelm/i.test(trimmed)));
    const askingHow =
      /^\s*(how|what|why|when|can you explain|explain|is it|are you|do you|does)\b/i.test(
        trimmed,
      );
    const distressed =
      !shouldSuppressEmotionalTools(trimmed) &&
      (SOMATIC_DISTRESS_RE.test(trimmed) ||
        (messageCategory === "emotional_distress" &&
          isGenuineEmotionalDistress(trimmed)));
    const suppressCreatePending = shouldSuppressCreatePending(trimmed);
    const resolved = resolveIntent(trimmed, {
      overwhelmed,
      askingHow,
      lastAct,
    });
    const lastAssistantForGov =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
    const turnMessages = fresh
      ? [{ role: "user" as const, content: trimmed }]
      : [...messages, { role: "user" as const, content: trimmed }];

    const workspaceCoachActive = isWorkspaceGuidedCoachActive(
      workspacePanel,
      workspaceSession,
      isWorkspaceBesideChat(getWorkspaceSnapshot()),
    );
    const workflowLockInput = {
      strategyApplyActive: Boolean(applyWorkflowActive),
      strategyApplySession: applySession,
      createBuilderActive: createBuilderWorkflowActive,
      createBuilderSession: builderSession,
      businessStrategyActive: Boolean(
        businessStrategySessionRef.current && workspacePanel === "playbook",
      ),
      businessStrategySession: businessStrategySessionRef.current,
      dayDesignerActive: Boolean(
        dayDesignerSession && dayDesignerSession.step !== "complete",
      ),
      workspaceCoachActive,
      workspacePanel,
      workspaceSession,
      lastAssistantText: lastAssistantForGov,
    };

    const turnSurface = evaluateCompanionTurn({
      userText: trimmed,
      lastAssistantText: lastAssistantForGov,
      workspacePanel,
      workspaceSnap: getWorkspaceSnapshot(),
      resolvedIntent: resolved,
      strategyApplyActive: Boolean(applyWorkflowActive),
      createBuilderActive: createBuilderWorkflowActive,
      businessStrategyActive: Boolean(
        businessStrategySessionRef.current && workspacePanel === "playbook",
      ),
      dayDesignerActive: Boolean(
        dayDesignerSession && dayDesignerSession.step !== "complete",
      ),
      workflowContext: {
        strategyApplySession: applySession,
        createBuilderSession: builderSession,
        businessStrategySession: businessStrategySessionRef.current,
        workspaceCoachActive,
        workspaceSession,
      },
    });
    const governorBlocksCards = turnSurface.suppressCards;
    const governorChatOnly = governorBlocksChatTurnAutoOpen(turnSurface);
    if (governorBlocksCards) {
      clearParallelCoachingOffers();
    }

    const sendEmotion = detectEmotionalState(trimmed);
    lastEmotionalStateRef.current = sendEmotion;
    const recoverySnap = evaluateAndRecordRecovery({
      text: trimmed,
      emotionalState: sendEmotion,
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: undefined,
      now: new Date(),
    });
    setRecovery(recoverySnap);
    const stressReliefTurn = shouldOfferStressRelief(trimmed, turnMessages);

    const suppressCardsThisTurn =
      governorBlocksCards || shouldSuppressActivationForTurn(trimmed);

    const activation = evaluateAndRecordActivation({
      text: trimmed,
      emotionalState: sendEmotion,
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
    });
    if (
      shouldSurfaceActivationOffer(activation, trimmed, turnMessages) &&
      !stressReliefTurn &&
      !shouldSuppressParallelCoaching(
        createBuilderSessionRef.current,
        chatLayoutMode === "split" && workspacePanel === "content-generator",
      ) &&
      !suppressCardsThisTurn
    ) {
      setActivationOffer(activation);
    } else {
      setActivationOffer(null);
    }
    const loop = evaluateAndRecordLoopIntelligence({
      text: trimmed,
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: activation.state,
    });
    setLoopOffer(
      shouldSurfaceLoopOffer(loop) &&
        !shouldSurfaceActivationOffer(activation) &&
        !stressReliefTurn &&
        !suppressCardsThisTurn
        ? loop
        : null,
    );

    const loopPrimary = loop?.loopType ?? null;

    if (dayDesignerSession && dayDesignerSession.step !== "complete") {
      const result = processDayDesignerMessage(dayDesignerSession, trimmed, {
        emotionalState: sendEmotion,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        primaryLoopType: loopPrimary,
      });
      setDayDesignerSession(
        result.session.step === "complete" ? null : result.session,
      );
      setDayDesignerQuestion(result.question);
      if (result.plan) {
        setDayPlanView(buildSimpleDayPlanView(result.plan));
        setActivationOffer(null);
        setLoopOffer(null);
        setRelationshipOffer(null);
        setEnvironmentOffer(null);
        setFutureShariOffer(null);
        setMomentumOffer(null);
        setBusinessOSSortOffer(null);
        setChiefOffer(null);
        setPredictiveOffer(null);
      }
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const base = fresh ? [] : messages;
      const assistantContent = result.plan
        ? "Here's a gentle plan for today — change anything you like."
        : (result.question ?? "Got it.");
      setMessages([
        ...base,
        userMessage,
        { role: "assistant", content: assistantContent },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      return;
    }

    if (shouldStartDayDesigner(trimmed) && !isDayDesignerDismissedToday()) {
      const session = beginDayDesignerFlow();
      const firstQ = questionForStep("time");
      setDayDesignerSession(session);
      setDayDesignerQuestion(firstQ);
      setDayPlanView(null);
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const base = fresh ? [] : messages;
      setMessages([
        ...base,
        userMessage,
        {
          role: "assistant",
          content: `${companionIntroForDayDesigner()} ${firstQ}`,
        },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      return;
    }

    const relOffer = evaluateRelationshipOffer({
      text: trimmed,
      now: new Date(),
    });
    const showRel =
      !governorBlocksCards &&
      shouldSurfaceRelationshipOffer(relOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !dayDesignerSession &&
      !dayPlanView;
    setRelationshipOffer(showRel ? relOffer : null);

    const decision = evaluateDecisionOffer({
      text: trimmed,
      now: new Date(),
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: activation.state,
      loopType: loop?.loopType ?? loopPrimary ?? null,
      userHealthStatus: userHealth?.status ?? null,
      hasDayPlan: Boolean(dayPlanView),
    });
    const showDecision =
      !governorBlocksCards &&
      shouldSurfaceDecisionOffer(decision) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !isDecisionCompassOfferSignal(trimmed) &&
      !dayDesignerSession &&
      !dayPlanView;
    setDecisionOffer(showDecision ? decision : null);

    const envOffer = evaluateEnvironmentOffer({
      text: trimmed,
      now: new Date(),
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: activation.state,
      recoveryLevel: recovery?.recoveryLevel ?? null,
      dayEnvironment: dayDesignerSession?.answers.environment ?? null,
    });
    const showEnv =
      !governorBlocksCards &&
      shouldSurfaceEnvironmentOffer(envOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !dayDesignerSession &&
      !dayPlanView;
    setEnvironmentOffer(showEnv ? envOffer : null);

    const futureOffer = evaluateFutureShariOffer({
      text: trimmed,
      now: new Date(),
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: activation.state,
      recoveryLevel: recovery?.recoveryLevel ?? null,
      decisionState: decision?.snapshot.decisionState ?? null,
    });
    const showFuture =
      !governorBlocksCards &&
      shouldSurfaceFutureOffer(futureOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !showEnv &&
      !dayDesignerSession &&
      !dayPlanView;
    setFutureShariOffer(showFuture ? futureOffer : null);

    const momOffer = evaluateMomentumOffer({
      text: trimmed,
      now: new Date(),
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
      activationState: activation.state,
      userHealthStatus: userHealth?.status ?? null,
      loopType: loop?.loopType ?? loopPrimary ?? null,
    });
    const showMomentum =
      !governorBlocksCards &&
      shouldSurfaceMomentumOffer(momOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !showEnv &&
      !showFuture &&
      !dayDesignerSession &&
      !dayPlanView;
    setMomentumOffer(showMomentum ? momOffer : null);

    const oppOffer = evaluateOpportunityOffer({
      text: trimmed,
      now: new Date(),
      activationBlocker: activation.likelyBlockers[0]?.type ?? null,
      loopType: loop?.loopType ?? loopPrimary ?? null,
      cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
    });
    const showOpp =
      !governorBlocksCards &&
      shouldSurfaceOpportunityOffer(oppOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !showEnv &&
      !showFuture &&
      !showMomentum &&
      !dayDesignerSession &&
      !dayPlanView;
    setOpportunityOffer(showOpp ? oppOffer : null);

    const bizSortOffer = evaluateBusinessOSSortOffer({
      text: trimmed,
      now: new Date(),
    });
    const showBizSort =
      !governorBlocksCards &&
      shouldSurfaceBusinessOSSortOffer(bizSortOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !showEnv &&
      !showFuture &&
      !showMomentum &&
      !showOpp &&
      !dayDesignerSession &&
      !dayPlanView;
    setBusinessOSSortOffer(showBizSort ? bizSortOffer : null);

    const cosOffer = evaluateChiefOffer({
      text: trimmed,
      now: new Date(),
    });
    const showChief =
      !governorBlocksCards &&
      shouldSurfaceChiefOffer(cosOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !showEnv &&
      !showFuture &&
      !showMomentum &&
      !showOpp &&
      !showBizSort &&
      !dayDesignerSession &&
      !dayPlanView;
    setChiefOffer(showChief ? cosOffer : null);

    const predOffer = evaluatePredictiveOffer({
      text: trimmed,
      now: new Date(),
    });
    const showPredictive =
      !governorBlocksCards &&
      shouldSurfacePredictiveOffer(predOffer) &&
      !shouldSurfaceActivationOffer(activation) &&
      !shouldSurfaceLoopOffer(loop) &&
      !showRel &&
      !showDecision &&
      !showEnv &&
      !showFuture &&
      !showMomentum &&
      !showOpp &&
      !showBizSort &&
      !showChief &&
      !dayDesignerSession &&
      !dayPlanView;
    setPredictiveOffer(showPredictive ? predOffer : null);

    if (!governorBlocksCards) {
      const ecosystemPreview = evaluateEcosystem({
        text: trimmed,
        now: new Date(),
        recognitionActive: Boolean(recognitionMoment),
        activationOfferActive:
          shouldSurfaceActivationOffer(activation) || Boolean(activationOffer),
        loopOfferActive: Boolean(loopOffer) || shouldSurfaceLoopOffer(loop),
        dayDesignerActive: Boolean(dayDesignerSession),
        dayPlanActive: Boolean(dayPlanView),
        userRequestedAction:
          /\b(help me|show me|open |create |write |send |draft |plan my day|remember |follow up)\b/i.test(
            trimmed,
          ),
      });
      if (isSuppressed(ecosystemPreview, "activation_offer")) setActivationOffer(null);
      if (isSuppressed(ecosystemPreview, "loop_offer")) setLoopOffer(null);
      if (isSuppressed(ecosystemPreview, "relationship_offer"))
        setRelationshipOffer(null);
      if (isSuppressed(ecosystemPreview, "decision_offer")) setDecisionOffer(null);
      if (isSuppressed(ecosystemPreview, "environment_offer"))
        setEnvironmentOffer(null);
      if (isSuppressed(ecosystemPreview, "future_shari_offer"))
        setFutureShariOffer(null);
      if (isSuppressed(ecosystemPreview, "momentum_offer")) setMomentumOffer(null);
      if (isSuppressed(ecosystemPreview, "opportunity_offer"))
        setOpportunityOffer(null);
      if (isSuppressed(ecosystemPreview, "business_os_sort"))
        setBusinessOSSortOffer(null);
      if (isSuppressed(ecosystemPreview, "chief_of_staff")) setChiefOffer(null);
      if (isSuppressed(ecosystemPreview, "predictive_support_offer"))
        setPredictiveOffer(null);
    }

    if (physicalActionWaiting && isActionDone(trimmed)) {
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const base = fresh ? [] : messages;
      setMessages([
        ...base,
        userMessage,
        { role: "assistant", content: physicalDoneFollowUp() },
      ]);
      setInput("");
      setPhysicalActionWaiting(false);
      voiceUsedRef.current = false;
      return;
    }

    // Conversational wins — reinforce completion inside chat (no dashboards,
    // no XP). A short, clear "done / sent it / finished" gets a warm nod.
    const winRe =
      /\b(sent it|sent that|finished|completed|shipped|posted|published|wrapped (it )?up|knocked it out|all done|all set|got it done|did it)\b|^(done|sent|shipped|finished|posted)[.! ]*$|\bi'?(ve| just| have)\b[^.?!]*\b(sent|finished|completed|shipped|posted|published|did|wrote|made|wrapped)\b/i;
    const winNegated =
      /\b(not|haven'?t|hasn'?t|isn'?t|aren'?t|didn'?t|don'?t|won'?t|can'?t|cannot|never|almost|nearly|need to|trying to|about to|gonna|going to|should)\b/i.test(
        trimmed,
      );
    const isWin = winRe.test(trimmed) && !winNegated;
    if (isWin && !trimmed.includes("?")) {
      setActiveSection("home");
      setActiveNav("chat");
      const prev = getLastActivity();
      const winDetail = prev?.title ?? trimmed.slice(0, 60);
      const acks = prev?.title
        ? [
            `Nice — "${prev.title}" is done. That's real progress, and it's logged.`,
            `Love that. You closed the loop on "${prev.title}" — that counts.`,
            `Done is done. "${prev.title}" is off your plate. What's next, or want to sit with the win for a sec?`,
          ]
        : [
            "That's done — nice work getting it out of the way. That's the kind of step that actually moves your business forward.",
            "Love that. You showed up and moved it — that counts more than it feels like right now.",
            "Done is done. That's real progress, and it's logged. What's next, or do you want to ride that for a sec?",
          ];
      const ack = acks[Math.floor(Math.random() * acks.length)]!;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const base = fresh ? [] : messages;
      setMessages([
        ...base,
        userMessage,
        { role: "assistant", content: ack },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      logMomentum("complete", `Win: ${winDetail}`);
      clearLastActivity();
      setLastAct(null);
      return;
    }

    const commitUserLine = () => {
      const um: Message = { role: "user", content: trimmed };
      setMessages(fresh ? [um] : [...messages, um]);
      setInput("");
      voiceUsedRef.current = false;
    };

    const stayInConversation = shouldStayInConversation(trimmed, {
      multiIntent: resolved.multiIntent,
    });
    const blockAutoWorkspace = shouldBlockAutoWorkspaceOpen(trimmed, {
      stayInConversation,
    });
    const workspaceSnap = getWorkspaceSnapshot();

    let turnArbitration = turnSurface.arbitration;

    const blockArbitratedAutoRoute = turnSurface.suppressWorkspaceRouting;

    const suppressCrossWorkspace = (
      target: AppSection,
    ): boolean =>
      shouldSuppressCrossWorkspaceNavigation(
        workspacePanel,
        target,
        trimmed,
        workspaceSnap,
      );

    if (pendingDocumentTypeChoice) {
      if (
        userGrantedDraftPermission(trimmed, lastAssistantForGov) &&
        (isEmailToolHandoffRequest(trimmed) ||
          shariOfferedEmailToolHandoff(lastAssistantForGov))
      ) {
        setPendingDocumentTypeChoice(null);
        commitUserLine();
        if (tryChatCreateHandoff(trimmed, lastAssistantForGov, turnMessages)) {
          return;
        }
      }
      const picked = parseDocumentTypeChoice(trimmed);
      if (picked) {
        commitUserLine();
        const topic = pendingDocumentTypeChoice.topic;
        setPendingDocumentTypeChoice(null);
        openCollaborativeDocument(picked, topic, trimmed);
        return;
      }
    }

    if (isDocumentRecoveryRequest(trimmed)) {
      commitUserLine();
      const matches = findDocumentsForRecovery(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: formatDocumentRecoveryReply(matches) },
      ]);
      return;
    }

    if (isActionRecoveryCommand(trimmed)) {
      commitUserLine();
      const events = eventStore.query({ founderId: FOUNDER_ID });
      const board = buildActionDashboard(events, FOUNDER_ID);
      const recovery = parseActionRecoveryCommand(
        trimmed,
        selectRecommendedActions(
          board.recommendedActions.length
            ? board.recommendedActions
            : founderActionBoard.recommendedActions,
        ),
        events,
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: recovery.message },
      ]);
      if (recovery.kind === "draft-hint") {
        const createAction = board.recommendedActions.find(
          (a) => a.workspace.section === "content-generator",
        );
        if (createAction) openFounderActionWorkspace(createAction);
      } else if (recovery.kind === "project-hint") {
        openSectionBesideChatCore("projects");
      } else if (
        (recovery.kind === "next-action" || recovery.kind === "recommendation") &&
        /\bopen\b/i.test(trimmed)
      ) {
        openFounderActionWorkspace(recovery.action);
      }
      return;
    }

    if (isFounderActionAcceptance(trimmed) && founderActionBoard.currentAction) {
      commitUserLine();
      respondToFounderAction(founderActionBoard.currentAction, "open");
      return;
    }

    // Scheduling / planning context: do NOT auto-open Create just because the
    // message mentions videos, scripts, posts, or emails. The user is still
    // planning. Only an EXPLICIT create request ("write the script") opens
    // Create while in a planning/time-block flow.
    const inPlanningFlow =
      workspacePanel === "time-block" ||
      /\b(schedul\w*|time ?block\w*|planning\b|plan (a|my|the|some|out)\b|next week|book (some )?time|set aside time|work session)\b/i.test(
        trimmed,
      );
    const explicitCreateRequest =
      /\b(write|create|draft|help me write|make me)\b[^.?!]*\b(script|video|post|email|caption|newsletter|content|copy)\b/i.test(
        trimmed,
      );
    const suppressCreateForPlanning = inPlanningFlow && !explicitCreateRequest;

    const explicitWorkspaceCommand = shouldAutoOpenWorkspaceBeforeChat(trimmed);

    // Distress short-circuits all auto-routing — being seen beats doing.
    // Document workspaces only on explicit create commands — not discovery.
    if (
      !distressed &&
      !stayInConversation &&
      !blockAutoWorkspace &&
      !suppressCreateForPlanning &&
      !governorChatOnly &&
      !turnArbitration.blockAutoOpenDocument &&
      explicitWorkspaceCommand &&
      isDocumentCreationRequest(trimmed) &&
      (!workspacePanel || !suppressCrossWorkspace("content-generator"))
    ) {
      if (needsDocumentTypeConfirmation(trimmed)) {
        commitUserLine();
        const topic = extractDocumentTopic(trimmed);
        setPendingDocumentTypeChoice({ topic });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: documentTypeConfirmationMessage(topic),
          },
        ]);
        return;
      }
      const kind = inferDocumentTypeFromRequest(trimmed);
      if (kind) {
        commitUserLine();
        openCollaborativeDocument(kind, extractDocumentTopic(trimmed), trimmed);
        return;
      }
    }

    if (
      !distressed &&
      !stayInConversation &&
      !suppressCreateForPlanning &&
      !governorChatOnly &&
      !blockArbitratedAutoRoute &&
      explicitWorkspaceCommand
    ) {
      const assetRoute = resolveAssetRoute(trimmed);
      if (
        assetRoute &&
        shouldAutoRouteAssetRequest(trimmed) &&
        !turnArbitration.blockAutoRouteAsset &&
        !suppressCrossWorkspace(assetRoute.section)
      ) {
        commitUserLine();
        openAssetRoute(assetRoute);
        return;
      }

      if (
        resolved.action === "edit-draft" &&
        resolved.draftContent &&
        !turnArbitration.blockIntentEditDraft &&
        !suppressCrossWorkspace("content-generator")
      ) {
        commitUserLine();
        openCreateFromIntent(resolved, turnMessages);
        return;
      }

      if (
        resolved.action === "make" &&
        resolved.confidence >= MAKE_CONFIDENCE_THRESHOLD &&
        resolved.type &&
        !turnArbitration.blockIntentMake &&
        !suppressCrossWorkspace("content-generator")
      ) {
        commitUserLine();
        openCreateFromIntent(resolved, turnMessages);
        return;
      }
    }

    setActiveSection("home");
    setActiveNav(workspacePanel === "content-generator" ? "create" : "chat");

    const detected = detectEmotionalState(trimmed);
    setEmotion(detected);

    const inputType = voiceUsedRef.current ? "voice" : "text";
    const userMessage: Message = { role: "user", content: trimmed };
    // A fresh start (e.g. opening a Playbook path) begins a brand-new
    // conversation rather than appending to the previous one.
    if (fresh) clearConversation();
    const nextMessages = fresh ? [userMessage] : [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    const usedVoiceThisTurn = voiceUsedRef.current;
    voiceUsedRef.current = false;
    setError(null);

    const lastAssistantText =
      [...nextMessages].reverse().find((m) => m.role === "assistant")?.content ??
      "";

    const phase1OnboardingTurn = isPhase1OnboardingActive()
      ? applyPhase1OnboardingTurn({
          messages: toChatTurns(nextMessages),
          userText: trimmed,
          lastAssistantText,
        })
      : null;

    let phase2TrustMoment: string | null = null;
    let phase3AwarenessMoment: string | null = null;
    let phase3AnticipatorySupport: string | null = null;
    let phase4ProactiveSupport: string | null = null;
    let phase5OpportunityOffer: string | null = null;
    let phase6ReuseOffer: string | null = null;
    let phase6DiscoveryOffer: string | null = null;
    let phase7BusinessInsight: string | null = null;
    let phase11EcosystemInsight: string | null = null;
    if (isPhase1OnboardingComplete()) {
      observeFromConversationTurn({
        userText: trimmed,
        usedVoice: usedVoiceThisTurn,
      });
      observePhase3Turn({ userText: trimmed });
      observePhase4BusinessTurn({
        userText: trimmed,
        resourceUsed: resourcePreferenceFromAppSection(workspacePanel) ?? undefined,
      });
      observePhase5EcosystemTurn({ userText: trimmed });
      observePhase6NetworkTurn({ userText: trimmed });
      observePhase7BusinessTurn({ userText: trimmed });
      observeEcosystemIntelligenceTurn({ userText: trimmed });
      phase2TrustMoment = maybeTrustBuildingMoment();
      if (phase2TrustMoment) recordTrustBuildingMomentShown();
      phase3AwarenessMoment = maybeCompanionAwarenessMoment();
      if (phase3AwarenessMoment) recordAwarenessMomentShown();
      phase3AnticipatorySupport = maybeAnticipatorySupport({ userText: trimmed });
      if (phase3AnticipatorySupport) recordAnticipatoryOfferShown();
      phase4ProactiveSupport = maybeProactiveBusinessSupport({ userText: trimmed });
      if (phase4ProactiveSupport) recordProactiveBusinessOfferShown();
      phase5OpportunityOffer = maybePredictiveOpportunityOffer();
      if (phase5OpportunityOffer) recordOpportunityOfferShown();
      phase6ReuseOffer = maybeExistingAssetReuseOffer({ userText: trimmed });
      if (phase6ReuseOffer) recordNetworkReuseOfferShown();
      phase6DiscoveryOffer = maybeRelatedResourceDiscoveryOffer({ userText: trimmed });
      if (phase6DiscoveryOffer) recordNetworkDiscoveryOfferShown();
      phase7BusinessInsight = maybeBusinessIntelligenceInsight({
        userText: trimmed,
        messages: toChatTurns(nextMessages),
      });
      if (phase7BusinessInsight) recordBusinessIntelligenceInsightShown();
      phase11EcosystemInsight = maybeEcosystemInsight({ userText: trimmed });
      if (phase11EcosystemInsight) recordEcosystemInsightShown();
    }

    let compassSessionForApi = decisionCompassSession;
    if (workspacePanel === "decision-compass") {
      const base =
        decisionCompassSession ?? loadDecisionCompassSession();
      const authority = base
        ? enrichAuthority(base)
        : createDecisionCompassAuthority(decisionCompassPrefill);
      const compassSync = applyUserChatToAuthority(authority, trimmed);
      if (compassSync.changed) {
        const snap = snapshotFromAuthority(compassSync.authority);
        setDecisionCompassSession(snap);
        saveDecisionCompassSession(snap);
        compassSessionForApi = snap;
      } else if (!base) {
        compassSessionForApi = snapshotFromAuthority(authority);
      }
    }

    if (decisionCompassOffer && isAcceptanceAttempt(trimmed)) {
      const snap = decisionCompassOffer;
      setDecisionCompassOffer(null);
      clearAllPendingOffers();
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: decisionCompassOpenAck() },
      ]);
      setInput("");
      openDecisionCompass(snap.prefill);
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (isExplicitSurveyCreateRequest(trimmed)) {
      const survey = evaluateSurveyIntelligence({
        userText: trimmed,
        messages: nextMessages,
      });
      if (survey.template) {
        const template = survey.template;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        recordSurveyCreated(template.id, { influencedDecision: true });
        openCreateWithShari(
          buildSurveyCreationInput(template, survey.recommendedLength),
        );
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          {
            role: "assistant",
            content:
              `I've opened **${template.name}** with proven questions already loaded — ` +
              "not a blank page. Edit anything to match your voice.",
          },
        ]);
        setInput("");
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (tryContinueConversationWorkflow(trimmed, lastAssistantText, fresh)) {
      return;
    }

    if (isExplicitBreatheRequest(trimmed) && !governorChatOnly) {
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        {
          role: "assistant",
          content: standaloneToolAck("breathe"),
        },
      ]);
      setInput("");
      setStressReliefOffer(null);
      clearAllPendingOffers();
      handleToolSelectCore("breathe");
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (userAffirmedApplyToDraft(trimmed, lastAssistantText)) {
      const parent = getActiveParentWorkflow();
      if (
        applyConversationToLiveCreate(nextMessages, {
          instruction:
            lastChildArtifactRequestInChat(toChatTurns(nextMessages)) ??
            trimmed,
          ack: parent
            ? undefined
            : createReceiptMessage("draft_updated"),
        })
      ) {
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (pendingCreateOpen && userAcceptedCreateConsent(trimmed, lastAssistantText)) {
      const acceptance = resolvePendingAcceptance({
        userText: trimmed,
        lastAssistantText,
        currentTurn: chatTurnRef.current,
        workspacePanel: workspacePanelRef.current,
        record: pendingAcceptanceRecord,
        pendingAction: null,
        createConsent: pendingCreateOpen,
      });
      if (dispatchResolvedAcceptance(acceptance, null)) {
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        setMessages((prev) => [...(fresh ? [] : prev), userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (!shouldDeferWorkspaceRoutingForPhase1()) {
      ensureLiveCreateBesideChat(trimmed);
    }

    if (turnSurface.outcome === "tool_open" && turnSurface.targetTool === "games") {
      routingExecutorRef.current.execute({
        routeId: "chat.governor_tool",
        source: "governor",
        tool: "games",
      });
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (
      !shouldDeferWorkspaceRoutingForPhase1() &&
      turnSurface.outcome === "workspace_open" &&
      turnSurface.targetSection
    ) {
      const section = turnSurface.targetSection;
      governorChatMessagesRef.current = nextMessages;
      governorRouteCtxRef.current = {
        userText: trimmed,
        lastAssistantText,
        resolved,
        suppressRestore: turnSurface.suppressRestore,
      };
      routingExecutorRef.current.execute({
        routeId: "chat.governor_workspace",
        source: "governor",
        section,
        lane: turnSurface.lane,
      });
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    const bizSessionLive = businessStrategySessionRef.current;
    if (
      bizSessionLive &&
      workspacePanel === "playbook" &&
      !fresh &&
      !isWorkflowConceptQuestion(trimmed)
    ) {
      const absorbed = absorbBusinessStrategyFromUserMessage(
        bizSessionLive,
        trimmed,
        lastAssistantText,
      );
      businessStrategySessionRef.current = absorbed;
      setBusinessStrategySession(absorbed);
      if (absorbed.draft) {
        showBusinessStrategyDraft({
          typeLabel: absorbed.typeLabel,
          draft: absorbed.draft,
        });
      }
    }

    const strategyOpen = resolveStrategyOpenFromChat(trimmed, {
      inStrategiesWorkspace:
        workspacePanelRef.current === "playbook" ||
        activeSectionRef.current === "playbook",
      lastAssistantText,
    });
    if (
      strategyOpen &&
      (!governorChatOnly || turnArbitration.workspaceLocked)
    ) {
      openStrategyFromChat(strategyOpen);
      const strategyId = strategyIdFromOpenTarget(strategyOpen);
      if (strategyId) {
        setBusinessStrategyDraft(null);
        setBusinessStrategySession(null);
        const boot = bootstrapStrategyApplySession(strategyId, {
      activeProjectName: pickActiveProjectName(),
    });
        if (boot) {
          setStrategyApplySession(boot.session);
          saveStrategyApplySession(boot.session, { workspacePanelOpen: true });
          beginStrategyApplyVisibleChat(boot.opener, strategyId);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: strategyOpenAck(strategyOpen.title) },
        ]);
      }
      setWorkspaceOffer(null);
      setToolSuggestion(null);
      setActionBridge(null);
      setBridge(null);
      return;
    }

    const classified = classifyWorkspaceIntent(trimmed, lastAssistantText);

    const exportOffer = detectArtifactExportOffer(trimmed, creationContext);
    const pendingNow = resolvePendingAction({
      workspaceOffer,
      artifactExportOffer: exportOffer ?? artifactExportOffer,
      assistedActionOffer,
      doItNowOffer,
      toolSuggestion,
      actionBridge,
      bridge,
      lockedArtifactType,
    });
    if (exportOffer) {
      setArtifactExportOffer(exportOffer);
      setAssistedActionOffer(null);
    }

    const acceptanceResolution = resolvePendingAcceptance({
      userText: trimmed,
      lastAssistantText,
      currentTurn: chatTurnRef.current,
      workspacePanel: workspacePanelRef.current,
      record: pendingAcceptanceRecord,
      pendingAction: pendingNow,
      createConsent: pendingCreateOpen,
    });

    if (
      acceptanceResolution.outcome === "conversation" ||
      acceptanceResolution.outcome === "expired"
    ) {
      if (isAcceptanceAttempt(trimmed)) {
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          {
            role: "assistant",
            content: acceptanceResolution.message,
          },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (dispatchResolvedAcceptance(acceptanceResolution, pendingNow)) {
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      setMessages((prev) => [...(fresh ? [] : prev), userMessage]);
      setInput("");
      voiceUsedRef.current = false;
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (
      pendingNow &&
      pendingAcceptanceRecord &&
      !isPendingAcceptanceExpired(pendingAcceptanceRecord, {
        currentTurn: chatTurnRef.current,
        workspacePanel: workspacePanelRef.current,
      }) &&
      shouldAutoLaunchPendingAction(trimmed, lastAssistantText, pendingNow)
    ) {
      executePendingAction(pendingNow);
      return;
    }

    const stressToolChoice = detectStressReliefToolChoice(trimmed);
    if (stressToolChoice) {
      commitUserLine();
      setStressReliefOffer(null);
      clearAllPendingOffers();
      if (stressToolChoice === "talk-through") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: stressToolOpenAck("talk-through") },
        ]);
        return;
      }
      acceptStressReliefOption(stressToolChoice);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: stressToolOpenAck(stressToolChoice) },
      ]);
      return;
    }

    if (isExplicitDecisionCompassRequest(trimmed)) {
      commitUserLine();
      setDecisionCompassOffer(null);
      clearAllPendingOffers();
      openDecisionCompass(extractDecisionCompassPrefill(trimmed));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: decisionCompassOpenAck() },
      ]);
      return;
    }

    const standaloneTool = detectStandaloneToolRequest(trimmed);
    if (standaloneTool && !governorChatOnly) {
      if (standaloneTool.tool === "focus-audio") {
        openFocusAudioCore(standaloneTool.focusAudioCategory);
      } else {
        handleToolSelectCore(standaloneTool.tool);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: standaloneToolAck(
            standaloneTool.tool,
            standaloneTool.focusAudioCategory,
          ),
        },
      ]);
      return;
    }

    if (workspacePanel === "google-workspace" && googleWorkspaceRef.current) {
      const gw = googleWorkspaceRef.current;
      setIsLoading(true);
      try {
        const res = await fetch("/api/google/apply-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: gw.fileId,
            kind: gw.kind === "sheet" ? "sheet" : "doc",
            title: gw.title,
            currentContent: gw.content,
            instruction: trimmed,
          }),
        });
        const data = await res.json();
        if (res.ok && data.content) {
          setGoogleWorkspace((prev) =>
            prev ? { ...prev, content: data.content as string } : prev,
          );
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: (data.message as string) || "Done.",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I couldn't update the Google file just now — try again or edit directly in the panel.",
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong updating the file — try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
      return;
    }

    // detectOpenSectionRequest is handled by Governor → workspace_open above.
    // Do not duplicate split-view opens here (Trust Sprint #1 Phase B).

    if (pendingDuplicateProject) {
      if (
        classified.intent === "confirmation" ||
        /\bcontinue\b/i.test(trimmed)
      ) {
        const session = buildSessionFromProject(pendingDuplicateProject);
        setPendingDuplicateProject(null);
        setWorkspaceOffer(null);
        openWorkspaceWithSession(
          session,
          buildProjectOpenMessage(pendingDuplicateProject),
        );
        return;
      }
      if (/\bnew\b/i.test(trimmed) && workspaceOffer) {
        setPendingDuplicateProject(null);
        acceptWorkspaceOffer(workspaceOffer);
        return;
      }
    }

    if (pendingProjectChoices?.length) {
      const idx = parseOptionSelection(trimmed, pendingProjectChoices.length);
      const byName = pendingProjectChoices.find(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
      );
      const picked =
        idx !== null ? pendingProjectChoices[idx] : byName ?? null;
      if (picked) {
        setPendingProjectChoices(null);
        openWorkspaceWithSession(
          buildSessionFromProject(picked),
          buildProjectOpenMessage(picked),
        );
        return;
      }
    }

    const artifactCmd = detectArtifactWorkspaceCommand(trimmed);
    const savedRecord =
      savedArtifactRef.current ?? loadCreateSession()?.savedArtifact ?? null;
    const wantsGoogleDoc = /\bgoogle doc/.test(trimmed.toLowerCase());
    const wantsPrint = /\bprint\b/.test(trimmed.toLowerCase());

    if (
      isExportArtifactRequest(trimmed) &&
      refersToCurrentArtifact(trimmed) &&
      !artifactCmd
    ) {
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: wantsGoogleDoc
          ? "google-doc"
          : wantsPrint
            ? "print"
            : null,
        ackMessage:
          "Opening **Create** with what we just built — use **Create Google Doc**, **Print**, or **Save** above the draft.",
      });
      return;
    }

    if (artifactCmd === "google-doc-location") {
      if (savedRecord?.googleDocUrl) {
        restoreCreateSession(
          undefined,
          buildGoogleDocRecoveryMessage(savedRecord),
        );
        revealWorkspace();
        focusWorkspaceLayout();
        setActiveSection("home");
        setActiveNav("other");
        return;
      }
      if (
        tryOpenCreateForCurrentArtifact(trimmed, {
          chatMessages: nextMessages,
          ackMessage: buildGoogleDocRecoveryMessage(savedRecord),
        })
      ) {
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: buildGoogleDocRecoveryMessage(null) },
      ]);
      return;
    }

    if (artifactCmd === "google-doc") {
      if (savedRecord?.googleDocUrl) {
        restoreCreateSession(
          undefined,
          buildGoogleDocRecoveryMessage(savedRecord),
        );
        revealWorkspace();
        focusWorkspaceLayout();
        setActiveSection("home");
        setActiveNav("other");
        return;
      }
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "google-doc",
        ackMessage:
          "Opening your draft in **Create** — creating the Google Doc now.",
      });
      return;
    }

    if (artifactCmd === "print") {
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "print",
        ackMessage: "Opening print…",
      });
      return;
    }

    if (artifactCmd === "save-again") {
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "save",
        ackMessage: "Saving your updated copy…",
      });
      return;
    }

    if (artifactCmd === "add-to-project") {
      const projectReq = parseAddToProjectRequest(trimmed);
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "add-to-project",
        projectPickerPrefill: projectReq?.projectName ?? null,
        ackMessage: projectReq
          ? `Opening your document — pick **${projectReq.projectName}** or another project to link it.`
          : "Opening your document — choose which project to add it to.",
      });
      return;
    }

    if (
      artifactCmd === "show-location" ||
      isSavedDocumentRecoveryRequest(trimmed)
    ) {
      if (!savedRecord && isSavedDocumentRecoveryRequest(trimmed)) {
        const query = savedWorkQueryFromRecovery(trimmed);
        const hits = query ? searchSavedWork(query) : [];
        if (hits.length === 1) {
          openSavedWorkInCreate(
            hits[0],
            buildSavedArtifactRecoveryMessage(
              recordFromSavedWork(hits[0]),
              true,
            ),
          );
          return;
        }
        if (hits.length > 1) {
          const list = hits
            .slice(0, 5)
            .map((w, i) => `${i + 1}. **${w.artifactType}** — “${w.title}”`)
            .join("\n");
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I found a few saved items — which one do you mean?\n\n" +
                `${list}\n\n` +
                "Reply with the number or open **Saved Work** from the menu.",
            },
          ]);
          return;
        }
      }
      if (isExplicitCreateResumeRequest(trimmed)) {
        restoreCreateSession(
          undefined,
          buildSavedArtifactRecoveryMessage(
            savedRecord,
            workspacePanel === "content-generator",
          ),
        );
        revealWorkspace();
        focusWorkspaceLayout();
        setActiveSection("home");
        setActiveNav("other");
        return;
      }
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger:
          artifactCmd === "show-location" ? "show-location" : undefined,
        ackMessage: buildSavedArtifactRecoveryMessage(
          savedRecord,
          workspacePanel === "content-generator",
        ),
      });
      return;
    }

    if (isActiveWorkspaceRecoveryRequest(trimmed)) {
      const recovery = classifyActiveRecovery(trimmed);
      if (
        (recovery === "focus" || recovery === "any") &&
        pomodoroTimer.isActive
      ) {
        setActiveSection("home");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Your focus session is still running — tap **Open** in the **Active** bar at the top.",
          },
        ]);
        return;
      }
      if (recovery === "brain-dump" || recovery === "any") {
        if (activeSection === "brain-dump") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "**Clear My Mind** is open — you're already there.",
            },
          ]);
          return;
        }
      }
      if (recovery === "create" || recovery === "any") {
        if (isExplicitCreateResumeRequest(trimmed)) {
          const session = loadCreateSession();
          const recoveryAck =
            session?.savedArtifact
              ? buildSavedArtifactRecoveryMessage(
                  session.savedArtifact,
                  workspacePanel === "content-generator",
                )
              : proposalRecoveryMessage(
                  creationContext ?? session?.creationContext ?? null,
                );
          if (restoreCreateSession(undefined, recoveryAck)) {
            revealWorkspace();
            focusWorkspaceLayout();
            return;
          }
        }
        if (
          tryOpenCreateForCurrentArtifact(trimmed, {
            chatMessages: nextMessages,
          })
        ) {
          revealWorkspace();
          focusWorkspaceLayout();
          return;
        }
      }
      if (recovery === "client-avatars") {
        openSectionBesideChatCore("client-avatars");
        return;
      }
      if (recovery === "projects" || recovery === "any") {
        const sessionToResume = workspaceSession ?? loadWorkspaceSession();
        if (canResumeSession(sessionToResume)) {
          openWorkspaceWithSession(
            sessionToResume!,
            buildResumeOpenMessage(sessionToResume!),
          );
          return;
        }
        if (/\bworkshop\b/.test(trimmed.toLowerCase())) {
          setProjectsBootstrapCreate(true);
          openSectionBesideChatCore("projects");
          return;
        }
      }
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        activeSectionRef.current = "home";
        setActiveNav("other");
        revealWorkspace();
        appendVerifiedWorkspaceMessage(
          "content-generator",
          "Your **Create** workspace is open beside you — check the panel on the right (or the **Active** bar).",
          { appendOnly: true },
        );
        return;
      }
      if (
        (recovery === "time-block" || recovery === "any") &&
        workspacePanel === "time-block"
      ) {
        setActiveSection("home");
        activeSectionRef.current = "home";
        revealWorkspace();
        appendVerifiedWorkspaceMessage(
          "time-block",
          "**Momentum Appointments** is open beside you — check the panel on the right (or tap **Open** in the **Active** bar).",
        );
        return;
      }
      if (
        (recovery === "brain-dump" || recovery === "any") &&
        workspacePanel === "brain-dump"
      ) {
        openClearMyMindStandaloneCore();
        appendVerifiedWorkspaceMessage(
          "brain-dump",
          "**Clear My Mind** is open — capture what's on your mind whenever you're ready.",
        );
        return;
      }
      if (
        (recovery === "time-block" || recovery === "any") &&
        !governorChatOnly
      ) {
        openWorkspaceBesideChatCore(
          "time-block",
          "**Momentum Appointments** is open beside you — let's place your next move on the day.",
        );
        return;
      }
    }

    const handoffDest = inferHandoffDestination(lastAssistantText, trimmed);
    if (
      handoffDest === "email" ||
      handoffDest === "google-doc" ||
      isEmailToolHandoffRequest(trimmed) ||
      isGoogleDocHandoffRequest(trimmed)
    ) {
      if (tryChatCreateHandoff(trimmed, lastAssistantText, nextMessages)) {
        return;
      }
    }

    if (tryChatCreateHandoff(trimmed, lastAssistantText, nextMessages)) {
      return;
    }

    if (
      workspacePanel &&
      workspaceContext &&
      !applyChatActive
    ) {
      if (!createBuilderWorkflowActive && !isInCreateWorkspacePhase()) {
        const approvalTurn = tryResolveWorkspaceApprovalTurn({
          userText: trimmed,
          lastAssistantText,
          ctx: workspaceContext,
          sopSession: workspaceSession ?? loadWorkspaceSession(),
          createWorkflow:
            workspacePanel === "content-generator"
              ? createPanelWorkflowRef.current
              : null,
        });
        if (approvalTurn) {
          commitUserLine();
          applyWorkspaceWrite(
            workspaceFillAction(
              workspacePanel,
              approvalTurn.fill.field,
              approvalTurn.fill.value,
              "approval",
              { stepId: approvalTurn.fill.stepId },
            ),
            { userText: trimmed },
          );
          const { field: coachFocus, content: coachMsg } = extractFocusDirective(
            approvalTurn.reply,
          );
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: coachMsg },
          ]);
          applyWorkspaceFocus(coachFocus ?? approvalTurn.focusField ?? null);
          if (workspacePanel === "content-generator" && splitCreateChat) {
            stayInCreateSplitScreen();
          }
          setWorkspaceOffer(null);
          setToolSuggestion(null);
          setActionBridge(null);
          setBridge(null);
          setIsLoading(false);
          inputRef.current?.focus();
          return;
        }
      }
    }

    const resumeIntent = detectWorkspaceResumeIntent(trimmed);
    if (resumeIntent) {
      const sessionToResume = workspaceSession ?? loadWorkspaceSession();
      if (canResumeSession(sessionToResume)) {
        const applied = applyResumeIntent(sessionToResume!, resumeIntent);
        const ack =
          resumeIntent.kind === "review-title" ||
          resumeIntent.kind === "review-step" ||
          resumeIntent.kind === "review-field"
            ? buildResumeReviewMessage(applied, resumeIntent)
            : buildResumeOpenMessage(applied);
        openWorkspaceWithSession(applied, ack);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I don't have a workshop in progress yet. Tell me what you're planning and we can start one together.",
        },
      ]);
      return;
    }

    if (classified.intent === "projectLookup" && !blockAutoWorkspace) {
      const query =
        classified.projectQuery ??
        extractProjectQuery(trimmed) ??
        trimmed.replace(/\?/g, "").trim();
      const matches = searchProjects(query);
      if (matches.length === 1) {
        const match = matches[0]!;
        const score = scoreProjectMatch(match, query);
        if (score >= 95 && /\b(?:work on|create|build|start)\b/i.test(trimmed)) {
          setPendingDuplicateProject(match);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: buildDuplicateProjectMessage(match),
            },
          ]);
          return;
        }
        if (explicitWorkspaceCommand && !governorChatOnly) {
          openWorkspaceWithSession(
            buildSessionFromProject(match),
            buildProjectOpenMessage(match),
          );
          return;
        }
      } else if (matches.length > 1) {
        setPendingProjectChoices(matches);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: buildProjectChooserMessage(matches),
          },
        ]);
        return;
      }
      const sessionToResume = workspaceSession ?? loadWorkspaceSession();
      if (canResumeSession(sessionToResume) && !governorChatOnly) {
        openWorkspaceWithSession(
          sessionToResume!,
          buildResumeOpenMessage(sessionToResume!),
        );
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I don't see that saved yet. I can help recreate it from what we have — tell me what you're working on.",
        },
      ]);
      return;
    }

    if (classified.intent === "workspaceAction" && !blockAutoWorkspace) {
      const wantsCreate =
        (classified.workspaceSection ?? "projects") === "content-generator";
      if (wantsCreate) {
        if (workspacePanel === "content-generator") {
          setActiveSection("home");
          activeSectionRef.current = "home";
          setActiveNav("other");
          revealWorkspace();
          appendVerifiedWorkspaceMessage(
            "content-generator",
            createDraftVisibleInUI()
              ? "Your **Create** workspace is open beside you — your draft is in the panel on the right."
              : "Your **Create** workspace is open beside you — keep chatting here while you work in the panel.",
          );
          return;
        }
        if (
          !governorChatOnly &&
          tryOpenCreateForCurrentArtifact(trimmed, {
            chatMessages: nextMessages,
            allowStoredSession: isExplicitCreateResumeRequest(trimmed),
          })
        ) {
          return;
        }
      }
      if (!governorChatOnly && !workspacePanel) {
        const sessionToResume = workspaceSession ?? loadWorkspaceSession();
        if (
          (classified.workspaceSection ?? "projects") === "projects" &&
          canResumeSession(sessionToResume)
        ) {
          openWorkspaceWithSession(
            sessionToResume!,
            buildResumeOpenMessage(sessionToResume!),
          );
          return;
        }
        const section = classified.workspaceSection ?? "projects";
        acceptWorkspaceOffer({
          section,
          buttonLabel: "Build This Together",
          line: "",
        });
        return;
      }
    }

    // No keyword→tool shortcut: every message flows through the routing
    // engine, which decides (and gates) whether audio is appropriate.
    const obstacle = detectObstacle(trimmed);
    const somatic = detectSomaticAvoidance(trimmed);
    const willBridge =
      !suppressCreatePending && bridgeFromResolved(resolved) !== null;
    const intelligence = buildCompanionIntelligence({
      messages: nextMessages,
      text: trimmed,
      lastAssistantText,
      state: detected,
      obstacle: obstacle ?? null,
      somatic,
      askingHow,
      workspaceOpen: Boolean(workspacePanel),
    });
    const ecosystemProblemMatch = detectEcosystemProblemIntent(trimmed);
    const adhdNative = analyzeAdhdNativeTurn({
      text: trimmed,
      messages: nextMessages,
      emotionalState: detected,
      obstacle: obstacle ?? null,
      discoveryPhase: intelligence.discoveryPhase,
      shouldDeferTools: intelligence.shouldDeferTools,
      hasEcosystemFeatureMatch: Boolean(ecosystemProblemMatch),
    });
    const adhdEntrepreneur = analyzeAdhdEntrepreneurTurn({
      userText: trimmed,
      adhdNative,
      multiTurn: adhdNative.multiTurn,
      boardDomain: resolveWorkspaceAdvisorRole(trimmed, workspacePanel),
    });
    const sprint5 = buildSprint5Intelligence({
      outcomeThread: getOutcomeThread(),
      multiTurn: adhdNative.multiTurn,
      featureLabel: ecosystemProblemMatch?.featureLabel ?? null,
      frictionLabel: adhdNative.primaryFriction?.replace(/_/g, " ") ?? null,
    });
    const actionBias = analyzeActionBias({
      messages: nextMessages,
      userText: trimmed,
      emotionalState: detected,
      adhdNative,
      multiTurn: adhdNative.multiTurn,
    });
    const intuitiveAwareness = analyzeIntuitiveAwareness({
      messages: nextMessages,
      userText: trimmed,
      emotionalState: detected,
      adhdNative,
      multiTurn: adhdNative.multiTurn,
      actionBias,
    });
    const decisionIntelligence = buildCompanionDecisionIntelligence({
      messages: nextMessages,
      userText: trimmed,
      lastAssistantText,
      outcomeThread: getOutcomeThread(),
    });
    syncOutcomeThreadFromDecisionIntelligence(decisionIntelligence, trimmed);
    const surveyIntelligence = evaluateSurveyIntelligence({
      messages: nextMessages,
      userText: trimmed,
      situationId: decisionIntelligence.situation.situationId,
      decisionType: decisionIntelligence.situation.decisionType,
      discoveryComplete: decisionIntelligence.complexity.discoveryComplete,
    });
    const phase1OnboardingEval =
      phase1OnboardingTurn ??
      (isPhase1OnboardingActive()
        ? evaluatePhase1Onboarding({
            messages: nextMessages,
            userText: trimmed,
            lastAssistantText,
          })
        : null);
    const rawWorkspaceOffer =
      willBridge ||
      skipToolOffer ||
      intelligence.shouldDeferTools ||
      decisionIntelligence.shouldDeferSolutions ||
      stayInConversation ||
      suppressCreatePending ||
      turnSurface.suppressCards
        ? null
        : detectDoingIntent(trimmed);
    const stressCause = detectStressCauseChoice(trimmed);
    const pendingDecisionCompassOffer: DecisionCompassOffer | null =
      shouldDeferWorkspaceRoutingForPhase1()
        ? null
        : shouldOfferDecisionCompassForTurn({
            text: trimmed,
            decisionIntelligence,
          })
          ? buildDecisionCompassOffer(trimmed)
          : null;
    const pendingStressOffer: StressReliefOffer | null =
      shouldDeferWorkspaceRoutingForPhase1() || pendingDecisionCompassOffer
        ? null
        : stressCause && !isExplicitStressToolRequest(trimmed)
          ? buildStressCauseRecommendation(stressCause)
          : shouldOfferStressRelief(trimmed, nextMessages)
            ? buildStressReliefOffer()
            : null;
    const pendingWorkspaceOffer =
      shouldDeferWorkspaceRoutingForPhase1() ||
      !rawWorkspaceOffer ||
      shouldSuppressWorkspaceOffer(workspaceContext, rawWorkspaceOffer) ||
      pendingStressOffer ||
      pendingDecisionCompassOffer
        ? null
        : rawWorkspaceOffer;
    const deferToolCards = shouldDeferToolCardOnFirstDistress(
      nextMessages,
      trimmed,
    );
    const pendingToolOffer =
      shouldDeferWorkspaceRoutingForPhase1() ||
      willBridge ||
      skipToolOffer ||
      deferToolCards ||
      turnSurface.suppressCards ||
      shouldSuppressEmotionalTools(trimmed) ||
      decisionIntelligence.shouldDeferSolutions ||
      pendingWorkspaceOffer ||
      pendingStressOffer ||
      pendingDecisionCompassOffer ||
      workspacePanel ||
      physicalActionWaiting ||
      shouldDeferToolsFromIntelligence(intelligence)
        ? null
        : suggestSupportTool({
            text: trimmed,
            lastAssistantText,
            state: detected,
            obstacle: obstacle ?? null,
            somatic,
            askingHow,
            messages: nextMessages,
          });

    if (
      !shouldDeferWorkspaceRoutingForPhase1() &&
      pendingWorkspaceOffer &&
      !workspacePanel &&
      !blockAutoWorkspace
    ) {
      const lookupQuery = extractProjectQuery(trimmed);
      if (lookupQuery && pendingWorkspaceOffer.section === "projects") {
        const existing = searchProjects(lookupQuery);
        if (existing.length === 1 && explicitWorkspaceCommand && !governorChatOnly) {
          openWorkspaceWithSession(
            buildSessionFromProject(existing[0]!),
            buildProjectOpenMessage(existing[0]!),
          );
          return;
        }
      }

      const similar = findSimilarProjects(
        workspaceSession?.projectTitle ?? lookupQuery ?? trimmed,
      );
      if (
        similar.length === 1 &&
        pendingWorkspaceOffer.section === "projects" &&
        /\b(?:create|build|make|new|workshop|project)\b/i.test(trimmed)
      ) {
        setPendingDuplicateProject(similar[0]!);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: buildDuplicateProjectMessage(similar[0]!),
          },
        ]);
        setWorkspaceOffer(pendingWorkspaceOffer);
        setToolSuggestion(null);
        setActionBridge(null);
        setBridge(null);
        return;
      }

      const offerReply = buildWorkspaceOfferChatReply(
        pendingWorkspaceOffer,
        trimmed,
      );
      if (
        shouldAutoOpenWorkspaceFromIntent(trimmed, pendingWorkspaceOffer) &&
        !governorChatOnly
      ) {
        acceptWorkspaceOffer(pendingWorkspaceOffer);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: offerReply },
      ]);
      setWorkspaceOffer(pendingWorkspaceOffer);
      setToolSuggestion(null);
      setActionBridge(null);
      setBridge(null);
      return;
    }

    if (
      !shouldDeferWorkspaceRoutingForPhase1() &&
      workspacePanel &&
      workspaceContext
    ) {
      if (
        avatarCoachActive &&
        workspacePanel === "client-avatars" &&
        avatarBuilderSnapshotRef.current
      ) {
        const coachTurn = processClientAvatarCoachTurn(
          trimmed,
          avatarBuilderSnapshotRef.current,
          lastAssistantText,
          avatarTaglineOptionsRef.current,
        );
        if (coachTurn) {
          if (coachTurn.taglineOptions) {
            avatarTaglineOptionsRef.current = coachTurn.taglineOptions;
          }
          const {
            field: coachFocus,
            fill: directiveFill,
            content: stripped,
          } = extractWorkspaceDirectives(coachTurn.reply);
          if (directiveFill) {
            applyWorkspaceWrite(
              workspaceFillAction(
                "client-avatars",
                directiveFill.field,
                directiveFill.value,
                "avatar-coach",
              ),
              { userText: trimmed },
            );
          } else if (coachTurn.fills?.[0]) {
            const fill = coachTurn.fills[0];
            applyWorkspaceWrite(
              workspaceFillAction(
                "client-avatars",
                fill.field,
                fill.value,
                "avatar-coach",
              ),
              { userText: trimmed },
            );
          }
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: stripped },
          ]);
          applyWorkspaceFocus(coachFocus ?? coachTurn.focusField ?? null);
          setIsLoading(false);
          inputRef.current?.focus();
          return;
        }
      }

      const strategyReply =
        workspacePanel === "client-avatars"
          ? null
          : tryStrategyWorkspaceLocalReply(workspaceContext, trimmed);
      if (strategyReply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: strategyReply },
        ]);
        setWorkspaceOffer(null);
        setToolSuggestion(null);
        setActionBridge(null);
        setBridge(null);
        return;
      }

      if (projectCoachSession && workspacePanel === "projects") {
        const coachTurn = resolveProjectCoachTurn(
          projectCoachSession,
          trimmed,
          workspaceContext,
          lastAssistantText,
        );
        if (coachTurn) {
          setProjectCoachSession(coachTurn.session);
          if (coachTurn.fill) {
            applyWorkspaceWrite(
              workspaceFillAction(
                "projects",
                coachTurn.fill.field,
                coachTurn.fill.value,
                "project-coach",
              ),
              { userText: trimmed },
            );
          }
          const { field: coachFocus, content: coachMsg } = extractFocusDirective(
            coachTurn.reply,
          );
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: coachMsg },
          ]);
          applyWorkspaceFocus(coachFocus ?? coachTurn.focusField ?? null);
          return;
        }
      }

      const dayForCoach = getDayState();
      const coachEnergy = resolveWorkspaceEnergy(
        dayForCoach?.energy,
        trimmed,
        dayForCoach?.overwhelm,
      );
      const coachSession = workspaceSession ?? loadWorkspaceSession();
      const coachTurn =
        avatarCoachActive && workspacePanel === "client-avatars"
          ? null
          : resolveWorkspaceCoachTurn(
              workspaceContext,
              trimmed,
              coachEnergy,
              lastAssistantText,
              coachSession,
              workspacePanel === "content-generator"
                ? createPanelWorkflowRef.current
                : null,
            );

      if (coachTurn) {
        if (coachTurn.sessionPatch) {
          setWorkspaceSession((prev) =>
            workspaceSessionEqual(prev, coachTurn.sessionPatch!)
              ? prev
              : coachTurn.sessionPatch!,
          );
        }
        if (coachTurn.fill) {
          applyWorkspaceWrite(
            workspaceFillAction(
              workspacePanel,
              coachTurn.fill.field,
              coachTurn.fill.value,
              "workspace-coach",
              { stepId: coachTurn.fill.stepId },
            ),
            { userText: trimmed },
          );
        }
        if (coachTurn.workflow) {
          setWorkspaceWorkflowAction({
            type: coachTurn.workflow.type,
            key: Date.now(),
          });
        }
        const { field: coachFocus, content: coachMsg } = extractFocusDirective(
          coachTurn.reply,
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: coachMsg },
        ]);
        applyWorkspaceFocus(
          coachFocus ?? coachTurn.focusField ?? coachTurn.fill?.field ?? null,
        );
        setWorkspaceOffer(null);
        setToolSuggestion(null);
        setActionBridge(null);
        setBridge(null);
        return;
      }

      if (
        workspacePanel === "content-generator" &&
        workspaceContext &&
        !(
          chatLayoutMode === "split" &&
          createBuilderSessionRef.current &&
          createBuilderSessionRef.current.phase !== "done"
        )
      ) {
        const wf = createPanelWorkflowRef.current;
        if (!wf.workspaceFirst) {
          const nextWf = applyCreateDiscoveryFromChat(wf, trimmed);
          if (nextWf) {
            const base =
              createWorkflowRecordRef.current ??
              loadWorkflowRecord() ??
              workflowRecordFromState(wf, {
                source: "panel",
                itemType: resolvedTypeLabel(wf) ?? undefined,
              });
            const record = mergeRecordFromWorkflow(base, nextWf, "chat");
            commitCreateWorkflowRecord(record);
            const typeLabel =
              resolvedTypeLabel(nextWf) ?? creationContext?.itemType ?? "draft";
            setMessages((prev) => [
              ...prev,
              { role: "user", content: trimmed },
              {
                role: "assistant",
                content:
                  nextWf.step === "readiness"
                    ? `Got it — I have enough for a first **${typeLabel}** draft.\n\nClick **Build Draft** in the panel when you're ready, or say **Build Draft** here.`
                    : `Got it — I've added that to your **${typeLabel}**.`,
              },
            ]);
            setInput("");
            setIsLoading(false);
            setWorkspaceOffer(null);
            setToolSuggestion(null);
            setActionBridge(null);
            setBridge(null);
            return;
          }
        }
      }

      if (
        workspacePanel !== "content-generator" &&
        tryResolveSuggestionSelection(
          trimmed,
          coachSession,
          lastAssistantText,
        )
      ) {
        const fallbackSession =
          coachSession ??
          createWorkspaceSession(workspacePanel, trimmed, coachEnergy);
        const sopTurn = resolveSopCoachTurn(
          fallbackSession,
          workspaceContext,
          trimmed,
          coachEnergy,
          lastAssistantText,
        );
        if (sopTurn) {
          if (sopTurn.sessionPatch) {
            setWorkspaceSession((prev) =>
              workspaceSessionEqual(prev, sopTurn.sessionPatch!)
                ? prev
                : sopTurn.sessionPatch!,
            );
          }
          if (sopTurn.fill) {
            applyWorkspaceWrite(
              workspaceFillAction(
                workspacePanel,
                sopTurn.fill.field,
                sopTurn.fill.value,
                "sop-coach",
                { stepId: sopTurn.fill.stepId },
              ),
              { userText: trimmed },
            );
          }
          const { field: coachFocus, content: coachMsg } = extractFocusDirective(
            sopTurn.reply,
          );
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: coachMsg },
          ]);
          applyWorkspaceFocus(
            coachFocus ?? sopTurn.focusField ?? sopTurn.fill?.field ?? null,
          );
          return;
        }
      }
    }

    if (
      !workspacePanel &&
      !pendingWorkspaceOffer &&
      !workspaceOffer &&
      !turnArbitration?.blockAutoRouteAsset
    ) {
      const ecosystemMatch = ecosystemProblemMatch;
      if (
        ecosystemMatch &&
        !shouldDeferKeywordWorkspaceOffer(trimmed) &&
        !shouldDeferRoutingForActionBias(actionBias) &&
        !shouldDeferEcosystemRouting(
          adhdNative,
          intelligence.shouldDeferTools,
          ecosystemMatch.section,
        )
      ) {
        const userMessage: Message = { role: "user", content: trimmed };
        const wsOffer = ecosystemIntentToWorkspaceOffer(ecosystemMatch);
        if (fresh) clearConversation();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: wsOffer.line },
        ]);
        setWorkspaceOffer(wsOffer);
        publishConversationOffer(wsOffer.line, wsOffer);
        registerPendingAcceptance("workspace", ecosystemMatch.featureLabel);
        setInput("");
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (
      !workspacePanel &&
      !pendingWorkspaceOffer &&
      !workspaceOffer &&
      !turnArbitration?.blockAutoRouteAsset &&
      isAdaptMyDayIntent(trimmed) &&
      !isExplicitBreatheRequest(trimmed)
    ) {
      const userMessage: Message = { role: "user", content: trimmed };
      const offerLine = adaptMyDayOfferLine();
      if (fresh) clearConversation();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: offerLine },
      ]);
      const energyOffer: WorkspaceOffer = {
        section: "energy",
        buttonLabel: "Open Adapt My Day",
        line: offerLine,
      };
      setWorkspaceOffer(energyOffer);
      publishConversationOffer(offerLine, energyOffer);
      setInput("");
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    if (
      !workspacePanel &&
      !pendingWorkspaceOffer &&
      !workspaceOffer &&
      !turnArbitration?.blockAutoRouteAsset
    ) {
      const companionFirst = detectCompanionFirstTarget(trimmed);
      if (companionFirst && workspacePanel !== companionFirst.section) {
        companionFirstTargetRef.current = companionFirst;
        const offerLine = buildCompanionFirstOfferReply(companionFirst);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: offerLine },
        ]);
        const wsOffer = toWorkspaceOffer(companionFirst);
        setWorkspaceOffer(wsOffer);
        publishConversationOffer(offerLine, wsOffer);
        setToolSuggestion(null);
        setActionBridge(null);
        setBridge(null);
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }

      const researchMatch = detectResearchWorkspaceConnection(
        trimmed,
        workspacePanel,
      );
      if (researchMatch) {
        const offerLine = shouldOfferConversationPrefill(trimmed)
          ? researchMatch.prefillOfferLine
          : researchMatch.offerLine;
        const researchOffer: WorkspaceOffer = {
          section: researchMatch.section,
          buttonLabel: `Open ${workspaceTitle(researchMatch.section)}`,
          line: offerLine,
        };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: offerLine },
        ]);
        setWorkspaceOffer(researchOffer);
        publishConversationOffer(offerLine, researchOffer);
        setToolSuggestion(null);
        setActionBridge(null);
        setBridge(null);
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (
      isBusinessAdviceRequest(trimmed) &&
      !businessConfidenceBypassRef.current &&
      !businessConfidenceOffer
    ) {
      const confidence = loadBusinessIntelligenceConfidence();
      if (confidence.level === "low") {
        const offer = buildBusinessConfidenceOffer(
          confidence,
          primaryBusinessAdviceDomain(trimmed),
        );
        businessConfidencePendingTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: offer.message },
        ]);
        setBusinessConfidenceOffer(offer);
        setInput("");
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    setIsLoading(true);

    try {
      await presenceDelay();

      const prefs = getPrefs();
      const day = getDayState();
      const workspaceEnergy = resolveWorkspaceEnergy(
        day?.energy,
        trimmed,
        day?.overwhelm,
      );
      const { responseLanguageHint } = getOutputLanguageContext(prefs);
      const adaptiveDecision = evaluateAndRecordAdaptiveCompanion({
        text: trimmed,
        emotionalState: detected,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        loopType: loop?.loopType ?? null,
        celebrationActive: Boolean(recognitionMoment),
        planningContext:
          Boolean(dayDesignerSession) || shouldStartDayDesigner(trimmed),
      });
      const healthSnapshot = evaluateAndRecordUserHealth({
        text: trimmed,
        emotionalState: detected,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        primaryLoopType: loop?.loopType ?? null,
      });
      setUserHealth(healthSnapshot);
      const recoverySnapshot = evaluateAndRecordRecovery({
        text: trimmed,
        emotionalState: detected,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        userHealthStatus: healthSnapshot.status,
        adaptiveMode: adaptiveDecision.mode,
        recognitionRecent: Boolean(recognitionMoment),
      });
      setRecovery(recoverySnapshot);
      const decisionSnapshot = evaluateAndRecordDecision({
        text: trimmed,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        loopType: loop?.loopType ?? null,
        userHealthStatus: healthSnapshot.status,
        hasDayPlan: Boolean(dayPlanView),
      });
      const environmentSnapshot = evaluateAndRecordEnvironment({
        text: trimmed,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        recoveryLevel: recoverySnapshot.recoveryLevel,
        dayEnvironment: dayDesignerSession?.answers.environment ?? null,
      });
      const momentumSnapshot = evaluateAndRecordMomentum({
        text: trimmed,
        cognitiveLoadLevel: cognitiveLoad?.score.level ?? null,
        activationState: activation.state,
        userHealthStatus: healthSnapshot.status,
        loopType: loop?.loopType ?? null,
      });
      const businessOSSnapshot = evaluateAndRecordBusinessOS({
        text: trimmed,
      });
      const chiefSnapshot = evaluateAndRecordChiefOfStaff({
        text: trimmed,
      });
      const ecosystemSnapshot = evaluateAndRecordEcosystem({
        text: trimmed,
        recognitionActive: Boolean(recognitionMoment),
        activationOfferActive: Boolean(activationOffer),
        loopOfferActive: Boolean(loopOffer),
        dayDesignerActive: Boolean(dayDesignerSession),
        dayPlanActive: Boolean(dayPlanView),
      });
      evaluateAndRecordPredictiveSupport({ text: trimmed });
      turnArbitration = turnSurface.arbitration;
      const apiWorkspaceSnap = getWorkspaceSnapshot();
      const apiWorkspaceContext = workspaceContextForSnapshot(
        apiWorkspaceSnap,
        workspaceContext,
        (panel) =>
          panel === "projects"
            ? resolveProjectWorkspaceDetail(
                workspaceDetailRef.current,
                projectContinueIdRef.current,
              )
            : workspaceDetailRef.current,
      );
      const createWorkspaceV2Active = isCreateWorkspaceV2Phase(
        createPanelWorkflowRef.current,
        createBuilderSessionRef.current?.phase ?? null,
      );
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi(
            nextMessages,
            workspaceChatScopeRef.current,
          ),
          inputType,
          coachingMode,
          emotionalState: EMOTION_LABELS[detected],
          dayState: dayStateSummary(getDayState()),
          aiTone: prefs.aiTone,
          helpMode: prefs.helpMode,
          supportStyle: prefs.supportStyle,
          userName: prefs.name || undefined,
          businessContext: (() => {
            const parts = [
              businessContextSummary(),
              activeCompanionsContextForAI(),
              discoveryContextForChat(),
              phase1RelationshipProfileForChat(),
              isPhase1OnboardingComplete()
                ? relationshipPhaseSummaryForChat()
                : null,
            ].filter(Boolean);
            return parts.length ? parts.join(" ") : undefined;
          })(),
          intentHint:
            mergeGovernorHints(
              [
                appFeatureKnowledgeHintForChat(trimmed),
                appFeatureNavigationHintForChat(trimmed),
                arbitrationHintForChat(turnArbitration),
                conversationModeHintForChat(
                  classifyConversationalMode(trimmed),
                  trimmed,
                ),
                informationIntentHintForChat(
                  classifyCompanionIntentBucket(trimmed),
                  trimmed,
                ),
                isBusinessAdviceRequest(trimmed)
                  ? businessIntelligenceConfidenceHintForChat(
                      loadBusinessIntelligenceConfidence(),
                    )
                  : null,
                clearMyMindTrustHintForChat(trimmed, {
                  brainDumpPanelOpen:
                    workspacePanel === "brain-dump" ||
                    activeSection === "brain-dump",
                }),
                classificationHintForChat(messageCategory, trimmed),
                frustrationContextHintForChat(trimmed),
                intentHintForChat(resolved),
                (() => {
                  const audio = detectAudioRequest(trimmed);
                  if (!audio.isAudio || shouldBlockStressAutoToolRouting(trimmed)) {
                    return null;
                  }
                  return (
                    `AUDIO / ENERGIZE REQUEST: User wants listening support — mention **Focus Audio** ` +
                    `(category: ${audio.categoryId}, e.g. Motivation Boost for energizing) as an option. ` +
                    `Offer first; do NOT say you are opening it unless they explicitly asked or accepted the Pending offer.`
                  );
                })(),
                shouldOfferStressRelief(trimmed, nextMessages)
                  ? stressReliefHintForChat(trimmed)
                  : null,
                stayInConversation ? conversationGatingHint(trimmed) : null,
                workspacePanel === "client-avatars"
                  ? null
                  : businessStrategyCoachHintForChat(
                      businessStrategySessionRef.current,
                    ),
                clientAvatarCoachHintForChat(
                  avatarCoachActive ? avatarBuilderSnapshotRef.current : null,
                ),
                avatarCoachActive || workspacePanel === "client-avatars"
                  ? builderContentSyncHintForChat()
                  : null,
                parentWorkflowCoachHint(getActiveParentWorkflow()),
                outcomeThreadHintForChat(getOutcomeThread()),
                companionDecisionIntelligenceHintForChat(decisionIntelligence),
                surveyIntelligenceHintForChat(surveyIntelligence),
                phase1OnboardingEval
                  ? phase1OnboardingHintForChat(phase1OnboardingEval)
                  : null,
                isPhase1OnboardingComplete()
                  ? phase2ProgressiveDiscoveryHintForChat({
                      trustMoment: phase2TrustMoment,
                    })
                  : null,
                phase3AdaptiveRelationshipHintForChat({
                  awarenessMoment: phase3AwarenessMoment,
                  anticipatorySupport: phase3AnticipatorySupport,
                }),
                phase4BusinessOperatingPartnerHintForChat({
                  proactiveSupport: phase4ProactiveSupport,
                  userText: trimmed,
                }),
                phase5CompanionIntelligenceEcosystemHintForChat({
                  opportunityOffer: phase5OpportunityOffer,
                  userText: trimmed,
                }),
                phase6CompanionIntelligenceNetworkHintForChat({
                  reuseOffer: phase6ReuseOffer,
                  discoveryOffer: phase6DiscoveryOffer,
                  userText: trimmed,
                }),
                phase7BusinessIntelligenceHintForChat({
                  insight: phase7BusinessInsight,
                  userText: trimmed,
                  messages: toChatTurns(nextMessages),
                }),
                phase11EcosystemIntelligenceHintForChat({
                  insight: phase11EcosystemInsight,
                  userText: trimmed,
                }),
                sprint5.trustHint,
                sprint5.confidenceHint,
                sprint5.adaptiveHint,
                mistakeRecoveryHintForChat(),
                actionBiasHintForChat(actionBias),
                discoveryOverrideForActionBias(actionBias),
                intuitiveAwarenessHintForChat(intuitiveAwareness),
                adhdEntrepreneurPrimaryHintForChat({
                  analysis: adhdEntrepreneur,
                  adhdNative,
                }),
                adhdNativeHintForChat(adhdNative),
                companionEntryLayerHintForChat(trimmed),
                companionEcosystemRoutingHintForChat(trimmed),
                intelligenceHintForChat(intelligence, trimmed),
                assistedActionHintForChat(lastAssistantText, lockedArtifactType),
                artifactLockHintForChat(creationContext),
                creationContext?.draftContent?.trim() &&
                (createPanelWorkflowRef.current.draftStatus === "building" ||
                  creationContext.stage === "building draft")
                  ? collaborativeDraftingHintForChat(
                      creationContext.itemType,
                      creationContext.draftContent,
                    )
                  : null,
                (() => {
                  const offer = detectDoItNowOffer(lastAssistantText);
                  return offer ? doItNowHintForChat(offer) : null;
                })(),
              ]
                .filter(Boolean)
                .join("\n\n") || undefined,
              turnSurface,
            ),
          workspaceContextHint: phase1OnboardingEval?.active
            ? [
                "PHASE 1 ONBOARDING OVERRIDE: No workspace is active for this conversation. Ignore any stale panel state.",
                "Do NOT respond as workspace coach. Do NOT mention being beside Other or any workspace.",
                phase1OnboardingHintForChat(phase1OnboardingEval),
              ]
                .filter(Boolean)
                .join("\n\n")
            : [
            workspaceVerificationHint(apiWorkspaceSnap),
            googleWorkspace
              ? formatGoogleWorkspaceEditHint(googleWorkspace)
              : null,
            buildWorkspaceChatHints(apiWorkspaceContext, {
              coGuideActive: coGuideActiveFromSnapshot(apiWorkspaceSnap),
              energy: workspaceEnergy,
              userText: trimmed,
              sopSession: workspaceSession,
              creationContext,
              businessStrategySession: businessStrategySessionRef.current,
              businessStrategyDraft: businessStrategyDraft?.draft ?? null,
              savedArtifact:
                savedArtifactRef.current ??
                loadCreateSession()?.savedArtifact ??
                null,
              createDraftVisible:
                workspacePanel === "content-generator" &&
                createDraftVisibleInUI(),
              collaborativePhase:
                workspacePanel === "google-workspace"
                  ? "google"
                  : workspacePanel === "content-generator"
                    ? createExportReady
                      ? "ready"
                      : "building"
                    : undefined,
              preferredGoogleExport: preferredGoogleExportKind,
              openSnapshot: apiWorkspaceSnap,
              createWorkspaceV2Active,
            }),
            splitCreateChat && shouldBootstrapCreateBuilder()
              ? CREATE_WORKSPACE_V2
                ? formatCreateWorkspaceV2ChatHint(createBuilderSession)
                : formatCreateBuilderChatHint(createBuilderSession)
              : null,
            workspacePanel === "decision-compass" && compassSessionForApi
              ? [
                  decisionCompassWorkspaceHint(
                    enrichAuthority(compassSessionForApi),
                  ),
                  duplicateQuestionGuardHint(
                    enrichAuthority(compassSessionForApi),
                  ),
                ]
                  .filter(Boolean)
                  .join("\n\n")
              : null,
            discoveryHelpBypass && createBuilderSession
              ? discoveryHelpHintForChat(createBuilderSession, trimmed)
              : null,
            !workspacePanel && hasActiveCreateSession()
              ? "STORED CREATE SESSION: A saved Create draft exists but the panel is closed. Do NOT say the draft is visible on screen. If they ask to see or continue it, tell them you are reopening Create — the app will restore it."
              : null,
            companionGuidanceHintForChat({
              workspacePanel,
              workspaceContext,
              userText: trimmed,
              lastAssistantText,
              teachingActive: teachingModeActive(trimmed, lastAssistantText, {
                activeWorkflowLocked: shouldSuppressTeachingMode(workflowLockInput),
              }),
              createWorkspaceV2: createWorkspaceV2Active,
            }),
            companionFirstWorkflowHintForChat(trimmed, workspacePanel),
            crossWorkspaceGuidanceHintForChat({
              sourceTitle: createBuilderSession?.typeLabel
                ? createBuilderLabel(createBuilderSession.typeLabel)
                : creationContext?.itemType ?? "your workflow",
              typeLabel:
                createBuilderSession?.typeLabel ?? creationContext?.itemType,
              currentQuestionPrompt: createBuilderSession?.typeLabel
                ? discoveryQuestionsForState(
                    createBuilderSession.typeLabel,
                    createBuilderSession.workflow,
                  )?.prompt
                : undefined,
              offeringHandoff: Boolean(
                crossWorkspaceBesideOffer?.clientAvatarHandoff,
              ),
            }),
          ]
            .filter(Boolean)
            .join("\n\n") || undefined,
          toolOfferHint: pendingDecisionCompassOffer
            ? decisionCompassOfferHintForChat()
            : pendingWorkspaceOffer
              ? workspaceOfferHintForChat(pendingWorkspaceOffer)
              : pendingToolOffer
                ? toolOfferHintForChat(pendingToolOffer)
                : undefined,
          responseLanguageHint,
          obstacle: obstacle ?? undefined,
          somatic: somatic || undefined,
          adaptiveModeHint: adaptiveHintForChat(adaptiveDecision),
          ecosystemGuidance: ecosystemGuidanceForChat(ecosystemSnapshot),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      const rawAssistantMsg =
        typeof data.message === "string" ? data.message : "";
      const {
        field: focusField,
        fill: assistantFill,
        content: assistantMsgRaw,
      } = extractWorkspaceDirectives(rawAssistantMsg);
      const assistantMsg = toPlainLanguageDisplay(
        scrubFalseWorkspaceClaims(assistantMsgRaw, getWorkspaceSnapshot()),
      );
      rememberChatArtifactFromAssistant(assistantMsg, trimmed);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMsg },
      ]);
      if (
        shouldUseCreateBuilderChatTurns() &&
        workspacePanelRef.current === "content-generator" &&
        createBuilderSessionRef.current?.phase === "discovery" &&
        (discoveryHelpBypass || isDiscoveryHelpRequest(trimmed))
      ) {
        const builder = createBuilderSessionRef.current;
        const baseRecord =
          createWorkflowRecordRef.current ??
          loadWorkflowRecord() ??
          workflowRecordFromState(builder.workflow, {
            builderPhase: builder.phase,
            source: "chat",
            itemType: builder.typeLabel,
          });
        const wf = captureDiscoveryHelpOptions(builder.workflow, assistantMsg);
        const record = mergeRecordFromWorkflow(
          baseRecord,
          wf,
          "chat",
          builder.phase,
        );
        commitCreateWorkflowRecord(record);
      }
      const messagesAfterReply = [
        ...nextMessages,
        { role: "assistant", content: assistantMsg },
      ];
      const suppressAfterReply = shouldSuppressSecondaryCards({
        messages: messagesAfterReply,
        userText: trimmed,
        splitCreateDiscovery: shouldSuppressParallelCoaching(
          createBuilderSessionRef.current,
          chatLayoutMode === "split" && workspacePanel === "content-generator",
        ),
      });
      if (
        suppressAfterReply ||
        assistantContainsQuestion(assistantMsg) ||
        shouldSuppressActivationForTurn(trimmed)
      ) {
        clearParallelCoachingOffers();
      }
      recordProjectConversationIfOpen(
        workspacePanelRef.current,
        workspaceDetailRef.current?.selectedItemId,
        workspaceDetailRef.current?.view,
        trimmed,
        assistantMsg,
      );

      const autoWorkspaceRoute = detectAssistantWorkspaceLaunch(
        assistantMsgRaw,
        trimmed,
      );
      if (
        !shouldDeferWorkspaceRoutingForPhase1() &&
        autoWorkspaceRoute &&
        !governorChatOnly &&
        !draftPermissionBlocked(trimmed, lastAssistantText) &&
        !turnArbitration.blockAutoRouteAsset &&
        !isWorkspaceOpen(autoWorkspaceRoute.section, getWorkspaceSnapshot()) &&
        !shouldSuppressCrossWorkspaceNavigation(
          workspacePanelRef.current,
          autoWorkspaceRoute.section,
          trimmed,
          getWorkspaceSnapshot(),
        )
      ) {
        openAssetRoute(autoWorkspaceRoute, { appendAck: false });
      }
      if (
        !draftPermissionBlocked(trimmed, lastAssistantText) &&
        shouldHandoffChatArtifactToWorkspace(
          assistantMsg,
          trimmed,
          lastAssistantText,
        ) &&
        governorAllowsArtifactHandoff(turnSurface) &&
        !turnArbitration.blockIntentMake &&
        workspacePanel !== "content-generator" &&
        !getActiveParentWorkflow() &&
        !isChildArtifactRequest(trimmed) &&
        !shouldSuppressCrossWorkspaceNavigation(
          workspacePanel,
          "content-generator",
          trimmed,
          getWorkspaceSnapshot(),
        )
      ) {
        const fromChat = extractArtifactFromChat(
          toChatTurns([
            ...nextMessages,
            { role: "assistant", content: assistantMsg },
          ]),
        );
        if (fromChat) {
          const handoff = buildChatArtifactHandoffMessage(
            fromChat.itemType,
            fromChat.title,
          );
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1]?.role === "assistant") {
              next[next.length - 1] = { role: "assistant", content: handoff };
            }
            return next;
          });
          openCreateWithResolvedArtifact(
            {
              itemType: fromChat.itemType,
              title: fromChat.title,
              draftContent: fromChat.draftContent,
              source: "chat",
              artifactTypeLocked: shouldLockArtifactType(fromChat.itemType),
            },
            handoff,
          );
        }
      } else if (
        !draftPermissionBlocked(trimmed, lastAssistantText) &&
        shouldSyncChatArtifactToCreate(
          assistantMsg,
          trimmed,
          workspacePanel === "content-generator",
          lastAssistantText,
        )
      ) {
        const chatTurns = toChatTurns([
          ...nextMessages,
          { role: "assistant", content: assistantMsg },
        ]);
        let fromChat = extractArtifactFromChat(chatTurns);
        if (!fromChat && looksLikeArtifactContent(assistantMsg)) {
          fromChat = extractArtifactFromChat(
            toChatTurns([{ role: "assistant", content: assistantMsg }]),
          );
        }
        if (!fromChat) {
          fromChat = extractArtifactFromChat(toChatTurns(nextMessages));
        }
        if (fromChat) {
          syncCreatePanelDraft(
            {
              ...fromChat,
              source: "chat",
              artifactTypeLocked:
                creationContextRef.current?.artifactTypeLocked ??
                shouldLockArtifactType(fromChat.itemType),
            },
            { merge: true, instruction: trimmed },
          );
        }
      } else if (
        !draftPermissionBlocked(trimmed, lastAssistantText) &&
        looksLikeArtifactContent(assistantMsg) &&
        !creationContextRef.current?.draftContent?.trim()
      ) {
        const fromChat = extractArtifactFromChat(
          toChatTurns([
            ...nextMessages,
            { role: "assistant", content: assistantMsg },
          ]),
        );
        if (fromChat) {
          syncCreatePanelDraft({
            ...fromChat,
            source: "chat",
            artifactTypeLocked: shouldLockArtifactType(fromChat.itemType),
          });
        }
      }
      if (
        focusField &&
        workspacePanel &&
        workspacePanel !== "content-generator"
      ) {
        applyWorkspaceFocus(focusField);
      }
      if (workspaceContext && workspacePanel && workspacePanel !== "content-generator") {
        const avatarCoachMode =
          avatarCoachActive && workspacePanel === "client-avatars";
        let inferredFill: { field: WorkspaceFieldId; value: string } | null =
          null;
        if (avatarCoachMode) {
          if (
            assistantFill &&
            !isInvalidBuilderFieldValue(assistantFill.value, trimmed)
          ) {
            inferredFill = assistantFill;
          }
        } else if (
          isActiveWorkspaceAutoApplyMode(
            workspacePanel,
            trimmed,
            lastAssistantText,
          )
        ) {
          const candidate =
            assistantFill ??
            inferWorkspaceChatFill(workspaceContext, trimmed, lastAssistantText);
          if (
            candidate &&
            !isInvalidBuilderFieldValue(candidate.value, trimmed)
          ) {
            inferredFill = candidate;
          }
        }
        if (inferredFill) {
          applyWorkspaceWrite(
            workspaceFillAction(
              workspacePanel,
              inferredFill.field,
              inferredFill.value,
              assistantFill ? "api-fill" : "auto-apply",
            ),
            { userText: trimmed },
          );
        }
      }
      if (
        workspaceSession &&
        assistantMsg &&
        workspacePanel !== "content-generator"
      ) {
        const numbered = extractNumberedOptions(assistantMsg);
        if (numbered.length >= 2) {
          setWorkspaceSession((prev) => {
            if (!prev) return prev;
            const next = {
              ...prev,
              suggestedOptions: numbered,
              suggestedValue: null,
              pendingConfirmation: true,
            };
            return workspaceSessionEqual(prev, next) ? prev : next;
          });
        } else {
          const suggested = extractSuggestedValue(assistantMsg);
          if (suggested) {
            setWorkspaceSession((prev) => {
              if (!prev) return prev;
              const next = {
                ...prev,
                suggestedValue: suggested,
                suggestedOptions: [],
                pendingConfirmation: true,
              };
              return workspaceSessionEqual(prev, next) ? prev : next;
            });
          }
        }
      }
      if (shouldSaveChatActivity(trimmed)) {
        const activity: Omit<LastActivity, "ts"> = {
          kind: "chat",
          title: chatActivityTitle(assistantMsg, trimmed),
          subtitle: "Conversation",
          summary: assistantMsg.slice(0, 160),
        };
        setLastActivity(activity);
        setLastAct({ ...activity, ts: new Date().toISOString() });
      }
      const makeBridge = suppressCreatePending
        ? null
        : bridgeFromResolved(resolved);
      const blockPostReplyCards =
        suppressAfterReply ||
        turnSurface.suppressCards ||
        shouldSuppressActivationForTurn(trimmed) ||
        assistantContainsQuestion(assistantMsg);
      const nextDoItNow =
        blockPostReplyCards ||
        deferToolCards ||
        makeBridge ||
        intelligence.shouldDeferTools
          ? null
          : detectDoItNowOffer(assistantMsg);
      const nextActionBridge =
        blockPostReplyCards ||
        deferToolCards ||
        makeBridge ||
        intelligence.shouldDeferTools ||
        nextDoItNow
          ? null
          : detectActionBridge(assistantMsg);

      setBridge(makeBridge);
      if (pendingDecisionCompassOffer) {
        setDecisionCompassOffer(pendingDecisionCompassOffer);
        setStressReliefOffer(null);
        setActivationOffer(null);
        setLoopOffer(null);
        setWorkspaceOffer(null);
        setToolSuggestion(null);
        setActionBridge(null);
        setDecisionOffer(null);
      } else if (pendingStressOffer) {
        setStressReliefOffer(pendingStressOffer);
        setDecisionCompassOffer(null);
        setActivationOffer(null);
        setLoopOffer(null);
        setWorkspaceOffer(null);
        setToolSuggestion(null);
        setActionBridge(null);
      } else if (pendingWorkspaceOffer) {
        setWorkspaceOffer(pendingWorkspaceOffer);
        setToolSuggestion(null);
        setActionBridge(null);
        setStressReliefOffer(null);
        setDecisionCompassOffer(null);
      } else if (pendingToolOffer) {
        trackToolSuggestionOffered(pendingToolOffer.kind);
        captureToolOfferShown(pendingToolOffer.kind, closedLoopCtx());
        setToolSuggestion(pendingToolOffer);
        setWorkspaceOffer(null);
        setActionBridge(null);
        setStressReliefOffer(null);
        setDecisionCompassOffer(null);
      } else {
        setWorkspaceOffer(null);
        setToolSuggestion(null);
        setStressReliefOffer(null);
        setDecisionCompassOffer(null);
        setDoItNowOffer(nextDoItNow);
        setActionBridge(nextActionBridge);
      }
      const workflowFromReply = createConversationWorkflow(
        assistantMsg,
        chatTurnRef.current,
      );
      if (workflowFromReply) {
        setConversationWorkflow(workflowFromReply);
        if (workflowFromReply.kind === "open_decision_compass") {
          registerPendingOffer({
            offerSummary: workflowFromReply.offerSummary,
            section: "decision-compass",
            workflowKind: workflowFromReply.kind,
            pendingQuestion: workflowFromReply.assistantQuestion,
          });
        } else if (workflowFromReply.kind === "guided_continue") {
          registerPendingOffer({
            offerSummary: workflowFromReply.offerSummary,
            workflowKind: workflowFromReply.kind,
            pendingQuestion: workflowFromReply.assistantQuestion,
          });
        }
      }
      if (voiceOutput && data.message) void playTTS(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey) {
      voiceUsedRef.current = false;
      return;
    }
    e.preventDefault();
    void handleSend();
  }

  function dismissOfferKeepTalking() {
    const lines = [
      "No problem — let's keep talking it through. What's on your mind?",
      "Okay. Tell me a little more about what's going on.",
      "That's okay, we don't have to use a tool. I'm right here — keep going.",
    ];
    const line = lines[Math.floor(Math.random() * lines.length)]!;
    setMessages((prev) => [...prev, { role: "assistant", content: line }]);
  }

  function acceptWorkspaceOfferCore(offer: WorkspaceOffer) {
    captureOfferAccepted(offer, closedLoopCtx());
    clearAllPendingOffers();
    if (offer.section === "content-generator") {
      noteWorkspaceOpened("content-generator", "workspace_offer");
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("other");
        return;
      }
      if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession()
      ) {
        return;
      }
      if (tryOpenCreateForCurrentArtifact(lastUserTextRef.current)) {
        return;
      }
      openCreationWorkspaceCore(
        "content-generator",
        {
          itemType: "content",
          title: "New piece",
          brief: lastUserTextRef.current,
          stage: "choosing content type",
          source: "generated",
        },
        { seedOverride: { autoGenerate: false } },
      );
      return;
    }
    if (offer.section === "time-block") {
      openWorkspaceBesideChatCore("time-block", workspaceOpenAck("time-block"));
      return;
    }
    if (offer.section === "brain-dump") {
      openClearMyMindStandaloneCore();
      return;
    }
    if (offer.section === "focus-audio") {
      openFocusAudioCore(detectAudioRequest(lastUserTextRef.current).categoryId);
      return;
    }
    if (offer.section === "energy") {
      noteWorkspaceOpened("energy", "workspace_offer");
      setActiveSection("energy");
      activeSectionRef.current = "energy";
      setActiveNav("chat");
      return;
    }

    patchWorkspacePanel(offer.section);
    setWorkspaceDetail(emptyWorkspaceDetail());
    setActiveSection("home");
    activeSectionRef.current = "home";
    if (offer.section === "projects") {
      setActiveNav("projects");
      setProjectsBootstrapCreate(true);
    } else setActiveNav("chat");

    const day = getDayState();
    const energy = resolveWorkspaceEnergy(
      day?.energy,
      lastUserTextRef.current,
      day?.overwhelm,
    );
    const session = createWorkspaceSession(
      offer.section,
      lastUserTextRef.current,
      energy,
    );
    const normalized = normalizeSession(session);
    setWorkspaceSession(normalized);
    saveWorkspaceSession(normalized);
    revealWorkspace();
    noteWorkspaceOpened(offer.section, "workspace_offer");
    const ackContent = buildSopAcceptMessage(normalized);
    const { field, content } = extractFocusDirective(ackContent);
    const prefillNote = applyConversationPrefillsToWorkspace(offer.section);
    appendVerifiedWorkspaceMessage(
      offer.section,
      prefillNote ? `${content}\n\n${prefillNote}` : content,
    );
    applyWorkspaceFocus(field);
  }

  function openGovernorWorkspaceCore(
    section: AppSection,
    ctx: {
      lane?: string;
      userText: string;
      lastAssistantText: string;
      resolved: ResolvedIntent;
      suppressRestore: boolean;
    },
  ) {
    if (
      section === "content-generator" &&
      !ctx.suppressRestore &&
      ctx.lane === "resume"
    ) {
      restoreCreateSession();
      openWorkspaceBesideChatCore(
        "content-generator",
        workspaceOpenAck("content-generator"),
      );
      return;
    }
    if (
      section === "content-generator" &&
      userGrantedDraftPermission(ctx.userText, ctx.lastAssistantText)
    ) {
      const chatMsgs = governorChatMessagesRef.current;
      if (
        tryConversationHandoffTurn(
          ctx.userText,
          chatMsgs,
          ctx.resolved.type,
        )
      ) {
        return;
      }
      openCreateFromIntent(ctx.resolved, chatMsgs);
      return;
    }
    openWorkspaceBesideChatCore(section, workspaceOpenAck(section));
  }

  routingHandlersRef.current = {
    handleNavSelect: handleNavSelectCore,
    openWorkspaceBesideChat: openWorkspaceBesideChatCore,
    openSectionBesideChat: openSectionBesideChatCore,
    openNavSectionDirect: openNavSectionDirectCore,
    openActivityFullPage: openActivityFullPageCore,
    openStandaloneFocusSection: openStandaloneFocusSectionCore,
    openFocusAudio: openFocusAudioCore,
    handleToolSelect: handleToolSelectCore,
    openCreationWorkspace: openCreationWorkspaceCore,
    executePendingAction: executePendingActionCore,
    acceptWorkspaceOffer: acceptWorkspaceOfferCore,
    openGovernorWorkspace: (section, lane) =>
      openGovernorWorkspaceCore(section, {
        ...governorRouteCtxRef.current,
        lane,
      }),
    openGovernorToolGames: () => handleToolSelectCore("games"),
  };

  function handleNavSelect(nav: SidebarNavId, mode?: CoachingMode) {
    recordCompanionRoute(
      {
        routeId: "nav.select",
        source: "ui_nav",
        nav,
        coachingMode: mode,
      },
      true,
    );
    handleNavSelectCore(nav, mode);
  }

  function handleToolSelect(tool: SidebarToolId) {
    routingExecutorRef.current.execute({
      routeId: "tool.select",
      source: "ui_click",
      tool,
    });
  }

  function openWorkspaceBesideChat(
    section: AppSection,
    ack?: string,
    source: RouteSource = "internal",
  ) {
    const message = ack ?? workspaceOpenAck(section);
    if (source === "internal") {
      openWorkspaceBesideChatCore(section, message);
      return;
    }
    routingExecutorRef.current.execute({
      routeId: "workspace.beside_chat",
      source,
      section,
      ack: message,
    });
  }

  function openSectionBesideChat(
    section: AppSection,
    nav?: SidebarNavId,
    source: RouteSource = "internal",
  ) {
    if (source === "internal") {
      openSectionBesideChatCore(section, nav);
      return;
    }
    routingExecutorRef.current.execute({
      routeId: "workspace.section_beside",
      source,
      section,
      nav,
    });
  }

  function executePendingAction(action: PendingAction) {
    routingExecutorRef.current.execute(
      {
        routeId: "pending.execute",
        source: "pending_accept",
        pendingKind: action.kind,
      },
      action,
    );
  }

  function acceptWorkspaceOffer(offer: WorkspaceOffer) {
    routingExecutorRef.current.execute({
      routeId: "workspace.offer_accept",
      source: "pending_accept",
      offer,
    });
  }

  function closeWorkspacePanel(opts?: {
    mode?: PanelCloseMode;
    recoveryContext?: Partial<PanelCloseContext>;
    silent?: boolean;
    /** @deprecated use mode: "hide" — hide preserves resumable work */
    preserveCreateSession?: boolean;
  }) {
    const mode: PanelCloseMode = opts?.mode ?? "hide";
    const closingPanel = workspacePanelRef.current;

    if (mode === "discard") {
      if (
        typeof window !== "undefined" &&
        !window.confirm(DISCARD_WORKSPACE_CONFIRM)
      ) {
        return;
      }
    }

    const guideReturn =
      guideBesideSession?.source.kind === "activity"
        ? activitySession.activityId
          ? standaloneSectionForActivity(activitySession.activityId)
          : "focus"
        : guideBesideSession?.source.kind === "section"
          ? guideBesideSession.source.section
          : null;

    if (mode === "discard") {
      if (closingPanel) {
        captureWorkspaceAbandoned(closingPanel, closedLoopCtx());
      }
      pauseCreatePersistence();
    }

    if (mode === "hide" && workspaceSession) {
      saveWorkspaceSession(workspaceSession);
    }

    setGuideBesideSession(null);
    setWorkspaceContextBanner(null);
    setCrossWorkspaceBesideOffer(null);
    const returnTo = companionReturnSectionRef.current;
    companionReturnSectionRef.current = null;
    setWorkspaceFirstSplit(false);
    setCompanionStandaloneSection(null);
    setCreateBuilderSession(null);
    setChatBuildRequest(null);
    createBuilderBootstrappedRef.current = false;
    patchWorkspacePanel(null);
    setWorkspaceDetail(null);
    setCreationContext(null);
    setGenSeed(null);
    setSavedArtifact(null);
    setGoogleWorkspace(null);

    if (mode === "discard") {
      clearAllCreatePersistence({ preserveSavedForLater: true });
      createWorkflowRecordRef.current = null;
      createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
      setCreateExportReady(false);
      clearWorkspaceSession();
    }

    setWorkspaceSession(null);
    setWorkspaceOffer(null);
    applyWorkspaceFocus(null);
    setProjectsBootstrapCreate(false);
    setProjectContinueId(null);
    workspaceChatScopeRef.current = null;
    setPendingCreateOpen(null);
    clearPendingAcceptanceAuthority();

    if (guideReturn && guideReturn !== "home") {
      setActiveSection(guideReturn);
      setActiveNav(navForWorkspaceSection(guideReturn) ?? "chat");
      focusWorkspaceLayout();
    } else if (returnTo && returnTo !== "home") {
      setActiveSection(returnTo);
      setActiveNav(navForWorkspaceSection(returnTo) ?? "chat");
    } else {
      setActiveNav("chat");
    }

    if (mode === "discard") {
      resumeCreatePersistence();
    }

    focusWorkspaceLayout();

    if (!opts?.silent) {
      const recovery = recoveryMessageAfterPanelHide({
        panel: closingPanel,
        ...opts?.recoveryContext,
      });
      if (recovery) {
        appendRecoveryMessage(recovery);
      }
    }
  }

  function returnToCalmChat(message: string) {
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    closeWorkspacePanel({ mode: "hide", silent: true });
    setActiveSection("home");
    setActiveNav("chat");
  }

  function handleTodayResumeLater(item: HomeResumeItem) {
    dismissTodayResume(item);
    returnToCalmChat(TODAY_RESUME_LATER_MESSAGE);
  }

  function handleTodayPlanLater() {
    dismissPlanMyDayForSession();
    returnToCalmChat(TODAY_PLAN_LATER_MESSAGE);
  }

  function saveCreateForLater() {
    const record =
      createWorkflowRecordRef.current ?? loadWorkflowRecord() ?? null;
    if (record && shouldPersistWorkflowRecord(record)) {
      saveWorkflowRecordForLater(record);
      upsertCreateDraftEntry(record);
    }
    closeWorkspacePanel({
      recoveryContext: { savedForLater: true, panel: "content-generator" },
    });
  }

  function openCreateDraftFromLibrary(id: string) {
    const entry = getCreateDraftEntry(id);
    if (!entry) return;
    pauseCreatePersistence();
    saveWorkflowRecord(entry.record);
    createWorkflowRecordRef.current = entry.record;
    createPanelWorkflowRef.current = workflowStateFromRecord(entry.record);
    setCreateBuilderSession(builderSessionFromRecord(entry.record));
    resumeCreatePersistence();
    restoreCreateSession(createSessionFromWorkflowRecord(entry.record));
  }

  function deleteCreateDraftFromLibrary(id: string) {
    const currentId =
      createWorkflowRecordRef.current?.workflowId ??
      loadWorkflowRecord()?.workflowId;
    deleteCreateDraftEntry(id);
    if (currentId !== id) return;
    pauseCreatePersistence();
    clearAllCreatePersistence({ preserveSavedForLater: true });
    createWorkflowRecordRef.current = null;
    createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
    setCreateBuilderSession(null);
    createBuilderBootstrappedRef.current = false;
    setGenSeed(null);
    setCreationContext(null);
    setSavedArtifact(null);
    resumeCreatePersistence();
  }

  function startOverCreate() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(DISCARD_WORKSPACE_CONFIRM)
    ) {
      return;
    }
    pauseCreatePersistence();
    const currentId =
      createWorkflowRecordRef.current?.workflowId ??
      loadWorkflowRecord()?.workflowId;
    if (currentId) deleteCreateDraftEntry(currentId);
    clearAllCreatePersistence({ preserveSavedForLater: true });
    createWorkflowRecordRef.current = null;
    createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
    setCreateBuilderSession(null);
    createBuilderBootstrappedRef.current = false;
    setGenSeed(null);
    setCreationContext(null);
    setSavedArtifact(null);
    setCreateExportReady(false);
    resumeCreatePersistence();
  }

  function deleteCreateDraft() {
    pauseCreatePersistence();
    const draftBody =
      createWorkflowRecordRef.current?.draftContent?.trim() ||
      loadWorkflowRecord()?.draftContent?.trim() ||
      loadCreateSession()?.genSeed.draft?.trim() ||
      creationContextRef.current?.draftContent?.trim() ||
      "";
    patchWorkspacePanel(null);
    setWorkspaceDetail(null);

    const record =
      savedArtifactRef.current ?? loadCreateSession()?.savedArtifact ?? null;
    const id = record?.savedWorkId ?? record?.templateId;
    if (id) deleteSavedWork(id);

    const workflowId =
      createWorkflowRecordRef.current?.workflowId ??
      loadWorkflowRecord()?.workflowId;
    if (workflowId) deleteCreateDraftEntry(workflowId);

    clearDraftActivityMemory(draftBody || undefined);
    clearAllCreatePersistence();
    createWorkflowRecordRef.current = null;
    createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
    setCreateBuilderSession(null);
    createBuilderBootstrappedRef.current = false;
    setChatBuildRequest(null);
    setGenSeed(null);
    setCreationContext(null);
    setSavedArtifact(null);
    setCreateExportReady(false);
    clearWorkspaceSession();
    setWorkspaceSession(null);
    setWorkspaceOffer(null);
    applyWorkspaceFocus(null);
    setProjectsBootstrapCreate(false);
    setProjectContinueId(null);
    setActiveSection("home");
    setActiveNav("chat");
    resumeCreatePersistence();
    focusWorkspaceLayout();
  }

  function renderGuideBesideSection(section: AppSection) {
    switch (section) {
      case "projects":
        return (
          <ProjectsPanel
            resumeProjectId={projectsResumeId}
            onResumeConsumed={() => setProjectsResumeId(null)}
            onOpen={suggestCrossWorkspaceOpen}
            onAsk={handleProjectAsk}
            onOpenTimeBlock={handleOpenProjectTimeBlock}
            onBuildWithShari={(input) =>
              openCreationWorkspaceCore("projects", {
                ...input,
                source: "project",
              })
            }
          />
        );
      case "playbook":
        return renderPlaybookPanel({ registerBack });
      case "brain-dump":
        return (
          <BrainDumpPanel
            onOpen={openWorkspaceFromSection}
            onSuggestOpen={suggestCrossWorkspaceOpen}
            onContextChange={handleWorkspaceDetailChange}
          />
        );
      case "time-block":
        return (
          <TimeBlockPanel
            onStart={startBlock}
            onTestAlert={testAlert}
            initialProjectId={
              workspaceSession?.projectId ??
              workspaceDetail?.selectedItemId ??
              projectContinueId ??
              undefined
            }
            initialBlockId={timeBlockFocusId ?? undefined}
          />
        );
      default:
        return null;
    }
  }

  function renderWorkspacePanel(section: AppSection) {
    switch (section) {
      case "content-generator":
        return (
          <ContentGeneratorPanel
            seed={genSeed}
            workspaceMode
            focusField={workspaceFocusField}
            focusStamp={workspaceFocusStamp}
            sopSession={workspaceSession}
            onContextChange={handleWorkspaceDetailChange}
            onCreateSessionSync={handleCreateSessionSync}
            onCreateWorkflowSync={(wf) => {
              createPanelWorkflowRef.current = wf;
              if (CREATE_WORKSPACE_V2 && createBuilderSessionRef.current) {
                setCreateBuilderSession((prev) =>
                  prev
                    ? { ...prev, workflow: wf, phase: "workspace" }
                    : prev,
                );
              }
              if (isCreatePersistencePaused()) return;
              const base =
                createWorkflowRecordRef.current ?? loadWorkflowRecord();
              const record = mergeRecordFromWorkflow(base, wf, "panel", "workspace");
              commitCreateWorkflowRecord(record);
            }}
            onBuildWithShari={openCreateWithShari}
            onOpen={(s) => {
              if (s !== "content-generator") openWorkspaceFromSection(s);
            }}
            onWin={(label) => {
              logMomentum("complete", `Win: ${label}`);
            }}
            lockedArtifactType={lockedArtifactType}
            onChangeType={() => setCreationContext(null)}
            onSaveForLater={saveCreateForLater}
            onStartOver={startOverCreate}
            onDeleteDraft={deleteCreateDraft}
            onOpenCreateDraft={openCreateDraftFromLibrary}
            onDeleteCreateDraftEntry={deleteCreateDraftFromLibrary}
            exportTrigger={exportTrigger}
            onExportTriggerHandled={() => setExportTrigger(null)}
            onOpenSection={openWorkspaceFromSection}
            savedArtifact={savedArtifact}
            onSavedArtifactChange={handleSavedArtifactChange}
            onOpenSavedWork={() => openSectionBesideChatCore("saved-work")}
            projectPickerPrefill={projectPickerPrefill}
            onOpenGoogleWorkspace={handleOpenGoogleWorkspace}
            onArtifactReady={handleArtifactReadyChat}
            onExportGuidance={handleExportGuidance}
            onDraftGuidedEdit={({ sectionId, opener }) => {
              setActiveDraftEditSection(sectionId);
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: opener },
              ]);
            }}
            onCompanionTypePick={syncCreateBuilderFromPanelType}
            onWorkspaceNeedIdeas={(sectionId, _sectionLabel, prompt) => {
              const wf = createPanelWorkflowRef.current;
              if (sectionId) {
                const nextWf = setWorkspaceV2ActiveSection(wf, sectionId);
                const baseRecord =
                  createWorkflowRecordRef.current ??
                  loadWorkflowRecord() ??
                  workflowRecordFromState(wf, {
                    source: "panel",
                    itemType: resolvedTypeLabel(wf) ?? undefined,
                  });
                commitCreateWorkflowRecord(
                  mergeRecordFromWorkflow(baseRecord, nextWf, "panel"),
                );
              }
              openChatBesideWorkspace();
              void handleSend(prompt, false, true);
            }}
            workspaceV2HighlightSectionId={workspaceV2Highlight?.sectionId ?? null}
            workspaceV2HighlightKey={workspaceV2Highlight?.key ?? 0}
            companionBuilderMode={splitCreateChat}
            createBuilderPhase={createBuilderSession?.phase ?? null}
            chatSyncedWorkflow={
              splitCreateBuilder ? createBuilderSession?.workflow ?? null : null
            }
            onRegisterBuildDraft={(handler) => {
              createPanelBuildRef.current = handler;
            }}
            chatBuildRequest={chatBuildRequest}
            onChatBuildComplete={handleChatBuildComplete}
            onChatBuildFailed={handleChatBuildFailed}
            onDiscoveryAudiencePick={(audienceLabel) => {
              void handleSend(audienceLabel, false, true);
            }}
            onCompanionBuilderAction={(action) => {
              if (CREATE_WORKSPACE_V2) return;
              if (action === "retry" || action === "build-draft") {
                void handleSend("Build Draft", false, true);
              } else if (action === "add-detail") {
                void handleSend("Add more information", false, true);
              }
            }}
            chatReviseRequest={chatReviseRequest}
            onChatReviseComplete={() => setChatReviseRequest(null)}
            draftScrollTarget={createDraftScrollTarget}
            draftScrollStamp={createDraftScrollStamp}
          />
        );
      case "google-workspace":
        return googleWorkspace ? (
          <GoogleWorkspacePanel
            session={googleWorkspace}
            onOpenExternal={() => window.open(googleWorkspace.url, "_blank")}
            onBackToCreate={() => {
              patchWorkspacePanel("content-generator");
              setActiveNav("other");
            }}
            onCopy={() => {
              void navigator.clipboard?.writeText(googleWorkspace.content);
            }}
            onPrintPdf={() => window.open(googleWorkspace.url, "_blank")}
          />
        ) : (
          <SplitWorkspaceBesideEmptyState
            onOpenSection={(s) => openSectionBesideChatCore(s)}
          />
        );
      case "saved-work":
        return (
          <SavedWorkLibrary
            onBack={workspacePanelBack}
            onOpenInCreate={(input) => {
              const item = input.templateId
                ? getSavedWorkById(input.templateId)
                : undefined;
              if (item) {
                openSavedWorkInCreate(
                  item,
                  buildSavedArtifactRecoveryMessage(
                    recordFromSavedWork(item),
                    true,
                  ),
                );
                return;
              }
              openCreationWorkspaceCore("content-generator", {
                ...input,
                source: input.source ?? "generated",
              });
            }}
          />
        );
      case "today":
        return (
          <TodayPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            onResume={resumeHomeItem}
          />
        );
      case "plan-my-day":
        return (
          <PlanMyDayPanel
            onBack={goBack}
            onOpenSettings={() => openHowDoISettings("planning")}
            onStartFocus={() => {
              openSectionBesideChatCore("focus-timer");
            }}
            registerBack={registerBack}
            onOpenProject={(projectId) => {
              setProjectContinueId(projectId);
              setProjectsResumeId(projectId);
              saveProjectContinuity({
                projectContinueId: projectId,
                projectName:
                  getProjects().find((p) => p.id === projectId)?.name ?? null,
                view: "detail",
                workspacePanelOpen: false,
              });
              openSectionBesideChatCore("projects", "projects");
            }}
            onOpenAdaptMyDay={openAdaptMyDayCore}
            initialOpenItemId={planMyDayOpenItemId}
          />
        );
      case "visual-focus":
        return (
          <VisualFocusWorkspacePanel
            onBack={goBack}
            onClose={closeWorkspacePanel}
            registerBack={registerBack}
            onWorkWithShari={() => {
              setInput(
                "I'm in Visual Focus™ and I'm not sure which visual thinking tool fits. Here's what I'm trying to figure out: ",
              );
              inputRef.current?.focus();
            }}
          />
        );
      case "wins-this-week":
        return (
          <WinsThisWeekPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            nav={buildGrowthPanelNav("wins-this-week")}
            onSaveToEvidenceBank={(whatHappened, sourceWinId) => {
              setEvidencePrefill({ whatHappened, sourceWinId });
              openSectionBesideChatCore("evidence-bank", "growth");
            }}
            onSaveEvidence={(text, sourceId) => {
              setEvidencePrefill({ whatHappened: text, sourceWinId: sourceId });
              openSectionBesideChatCore("evidence-bank", "growth");
            }}
            onSaveProof={(text) => {
              setConfidencePrefill({
                title: text.slice(0, 80),
                description: text,
                category: "Praise & Compliments",
              });
              openSectionBesideChatCore("confidence-vault", "growth");
            }}
            onSaveJourney={(text) => {
              setJourneyPrefill({
                title: text.slice(0, 80),
                whatHappened: text,
              });
              openSectionBesideChatCore("my-journey", "growth");
            }}
          />
        );
      case "evidence-bank":
        return (
          <EvidenceBankPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            nav={buildGrowthPanelNav("evidence-bank")}
          />
        );
      case "growth":
        return (
          <GrowthCenterPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            nav={buildGrowthPanelNav("growth")}
          />
        );
      case "confidence-vault":
        return (
          <ConfidenceVaultPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            nav={buildGrowthPanelNav("confidence-vault")}
          />
        );
      case "my-journey":
        return (
          <MyJourneyPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            nav={buildGrowthPanelNav("my-journey")}
          />
        );
      case "my-work":
        return (
          <MyWorkHubPanel
            refreshKey={`${activeSection}-${workspacePanel ?? ""}-${lastAct?.ts ?? ""}`}
            onBack={goBack}
            backLabel={workspacePanelBackLabel}
            registerBack={registerBack}
            onOpenSection={(section, nav) =>
              openSectionBesideChatCore(section, nav ?? "other")
            }
            onOpenProject={(projectId) => {
              setProjectContinueId(projectId);
              setProjectsResumeId(projectId);
              saveProjectContinuity({
                projectContinueId: projectId,
                projectName:
                  getProjects().find((p) => p.id === projectId)?.name ?? null,
                view: "detail",
                workspacePanelOpen: false,
              });
              openSectionBesideChatCore("projects", "other");
            }}
            onOpenSavedWork={(savedWorkId) => {
              const item = getSavedWorkById(savedWorkId);
              if (item) {
                openSavedWorkInCreate(
                  item,
                  buildSavedArtifactRecoveryMessage(
                    recordFromSavedWork(item),
                    true,
                  ),
                );
                return;
              }
              openSectionBesideChatCore("saved-work", "other");
            }}
            onOpenVisualFocusMap={(mapId) =>
              openVisualFocusMapCore(mapId, true)
            }
          />
        );
      case "client-avatars":
        return (
          <IdealClientBuilder
            focusField={workspaceFocusField}
            focusStamp={workspaceFocusStamp}
            chatFieldFill={workspaceChatFill}
            coachKickoff={avatarCoachKickoff}
            onStartNew={startClientAvatarBuilderKickoff}
            onContextChange={handleWorkspaceDetailChange}
            onCoachSnapshot={(snapshot) => {
              avatarBuilderSnapshotRef.current = snapshot;
            }}
            onStepAdvance={(step) => {
              const msg = coachMessageForStepAdvance(
                step,
                avatarBuilderSnapshotRef.current ?? {
                  step,
                  stepIndex: 0,
                  building: true,
                  name: "",
                  who: "",
                  tagline: "",
                  painPoints: "",
                  goals: "",
                  currentBehavior: "",
                  solution: "",
                },
              );
              const { field, content } = extractFocusDirective(msg);
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content },
              ]);
              applyWorkspaceFocus(field);
            }}
            onBuildComplete={() => {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: clientAvatarCompletionMessage() },
              ]);
            }}
            onAvatarSaved={completeClientAvatarHandoffReturn}
          />
        );
      case "projects":
        return (
          <ProjectsPanel
            resumeProjectId={projectsResumeId}
            onResumeConsumed={() => setProjectsResumeId(null)}
            focusField={workspaceFocusField}
            focusStamp={workspaceFocusStamp}
            chatFieldFill={workspaceChatFill}
            workspaceWorkflowAction={workspaceWorkflowAction}
            sopSession={workspaceSession}
            onSopFieldChange={handleSopFieldChange}
            bootstrapCreate={projectsBootstrapCreate}
            onBootstrapDone={handleProjectsBootstrapDone}
            onProjectSaved={handleWorkspaceProjectSaved}
            onContextChange={handleWorkspaceDetailChange}
            onOpen={openWorkspaceFromSection}
            onAsk={handleProjectAsk}
            onOpenTimeBlock={handleOpenProjectTimeBlock}
            onBuildWithShari={() => openCompanionAssist("projects")}
          />
        );
      case "templates-library":
        return (
          <TemplatesLibrary
            onOpen={openWorkspaceFromSection}
            onGenerate={openGenerator}
            onBuildWithShari={handleTemplateBuildWithShari}
            onOpenInCreate={handleTemplateOpenInCreate}
            onBack={workspacePanelBack}
          />
        );
      case "playbook":
        return renderPlaybookPanel({ registerBack });
      case "how-do-i":
        return (
          <HowDoIPanel
            onOpen={openHowDoIToolWalkthrough}
            onOpenActivity={(activityId) => {
              if (activityId === "decision-compass") openDecisionCompass();
            }}
            onOpenSettings={openHowDoISettings}
            onOpenEcosystemResult={handleHowDoIEcosystemOpen}
            onAsk={(prompt) => void handleSend(prompt, false, true)}
            registerBack={registerBack}
          />
        );
      case "snippets":
        return (
          <SnippetsLibrary
            onBack={workspacePanelBack}
            onBuildWithShari={(input) =>
              openCreationWorkspaceCore("content-generator", {
                ...input,
                source: "snippet",
              })
            }
          />
        );
      case "email-generator":
        return (
          <EmailGeneratorPanel
            onOpen={openWorkspaceFromSection}
            onBuildWithShari={(input) =>
              openCreationWorkspaceCore("content-generator", {
                ...input,
                source: "email",
              })
            }
          />
        );
      case "business-profile":
        return (
          <BusinessProfilePanel
            onDone={() => {
              setActiveNav("chat");
              setActiveSection("home");
            }}
          />
        );
      case "brain-dump":
        return (
          <BrainDumpPanel
            onOpen={openWorkspaceFromSection}
            onSuggestOpen={suggestCrossWorkspaceOpen}
            contextBanner={workspaceContextBanner}
            onContextChange={handleWorkspaceDetailChange}
          />
        );
      case "decision-compass":
        return (
          <DecisionCompassWorkspace
            initialPrefill={decisionCompassPrefill}
            restoredSession={decisionCompassSession}
            onSessionChange={handleDecisionCompassSessionChange}
            onComplete={handleDecisionCompassComplete}
            onClose={closeWorkspacePanel}
            projectId={projectContinueId}
            projectName={
              projectContinueId
                ? getProjects().find((p) => p.id === projectContinueId)?.name ??
                  null
                : null
            }
          />
        );
      case "time-block":
        return (
          <TimeBlockPanel
            onStart={startBlock}
            onTestAlert={testAlert}
            initialProjectId={
              workspaceSession?.projectId ??
              workspaceDetail?.selectedItemId ??
              projectContinueId ??
              undefined
            }
            initialBlockId={timeBlockFocusId ?? undefined}
          />
        );
      case "focus-timer":
        return (
          <FocusTimerPanel
            timer={pomodoroTimer}
            onStartSession={handleFocusSession}
            onSessionStarted={handleFocusSessionStarted}
            onDebrief={handleFocusDebrief}
          />
        );
      default:
        return (
          <SplitWorkspaceAreaPanel
            section={section}
            onOpenFullScreen={() => {
              closeWorkspacePanel();
              setActiveSection(section);
            }}
          />
        );
    }
  }

  function renderCompanionStandaloneSection(section: AppSection) {
    switch (section) {
      case "focus-timer":
        return (
          <FocusTimerPanel
            timer={pomodoroTimer}
            onStartSession={handleFocusSession}
            onSessionStarted={handleFocusSessionStarted}
            onDebrief={handleFocusDebrief}
          />
        );
      case "focus":
        return <FocusAreaPanel onAction={handleFocusHubAction} />;
      case "breathe":
        return <BreathePanel onDone={closeWorkspacePanel} />;
      case "focus-audio":
        return (
          <FocusAudioPanel
            emotion={displayEmotion}
            initialCategory={focusAudioCategory ?? undefined}
            onDone={closeWorkspacePanel}
          />
        );
      default:
        return renderWorkspacePanel(section);
    }
  }

  const workspacePanelNode = useMemo(
    () => {
      if (workspacePanel) return renderWorkspacePanel(workspacePanel);
      if (companionStandaloneSection) {
        return renderCompanionStandaloneSection(companionStandaloneSection);
      }
      return null;
    },
    [
      workspacePanel,
      companionStandaloneSection,
      businessStrategyDraft,
      strategyApplySession,
      strategyPanelCommand,
      businessStrategySession,
      genSeed,
      workspaceFocusField,
      workspaceFocusStamp,
      workspaceSession,
      projectContinueId,
      projectsBootstrapCreate,
      workspaceChatFill,
      workspaceWorkflowAction,
      handleCreateSessionSync,
      handleWorkspaceDetailChange,
      handleSopFieldChange,
      handleProjectsBootstrapDone,
      handleWorkspaceProjectSaved,
    ],
  );

  const shariAssistLabel = useMemo(() => {
    const activity = activitySession.activityId
      ? getActivityById(activitySession.activityId)
      : undefined;
    const section =
      companionStandaloneSection ??
      workspacePanel ??
      (guideBesideSession?.source.kind === "activity"
        ? activitySession.activityId
          ? standaloneSectionForActivity(activitySession.activityId)
          : "focus"
        : guideBesideSession?.source.kind === "section"
          ? guideBesideSession.source.section
          : null);
    return getShariAssistLabel(section, {
      activityCategoryId: activity?.categoryId,
      selectedItemName: workspaceDetail?.selectedItemName,
      createItemType: creationContext?.itemType,
      businessStrategyLabel:
        businessStrategyDraft?.typeLabel ??
        businessStrategySession?.typeLabel ??
        null,
      businessStrategyPhase:
        businessStrategyDraft || businessStrategySession?.draft
          ? "coaching"
          : businessStrategySession
            ? "building"
            : null,
    });
  }, [
    activitySession.activityId,
    companionStandaloneSection,
    workspacePanel,
    guideBesideSession,
    workspaceDetail?.selectedItemName,
    creationContext?.itemType,
    businessStrategyDraft,
    businessStrategySession,
  ]);

  const createBuilderActiveForHeader = isCreateBuilderWorkflowActive(
    createBuilderSession,
    workspacePanel,
  );

  const sessionHeaderContext = useMemo(
    (): WorkspaceSessionHeaderContext => ({
      calmHome: homeCalm,
      workspacePanel,
      companionStandaloneSection,
      activeSection,
      activityId: activitySession.activityId || null,
      splitCreateChat,
      createBuilderActive: createBuilderActiveForHeader,
    }),
    [
      homeCalm,
      workspacePanel,
      companionStandaloneSection,
      activeSection,
      activitySession.activityId,
      splitCreateChat,
      createBuilderActiveForHeader,
    ],
  );

  const workspaceSessionKeyValue = useMemo(
    () => workspaceSessionKey(sessionHeaderContext),
    [sessionHeaderContext],
  );

  useEffect(() => {
    if (workspaceSessionKeyRef.current === workspaceSessionKeyValue) return;
    workspaceSessionKeyRef.current = workspaceSessionKeyValue;
    setWorkspaceSessionHeader(headerForWorkspaceSession(sessionHeaderContext));
  }, [workspaceSessionKeyValue, sessionHeaderContext]);

  function launchDoItNow(offer: DoItNowOffer) {
    setDoItNowOffer(null);
    setToolSuggestion(null);
    setActionBridge(null);
    setWorkspaceOffer(null);

    if (offer.kind === "quick-physical") {
      setPhysicalActionWaiting(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: physicalWaitLaunchMessage() },
      ]);
      return;
    }

    if (offer.kind === "quick-mental") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: offer.mentalReply ?? "Go ahead and answer here — I'll wait.",
        },
      ]);
      return;
    }

    if (offer.kind === "work") {
      const assisted = assistantSuggestedAction(
        offer.sourceText,
        lockedArtifactType,
      );
      if (assisted) {
        setAssistedActionOffer(assisted);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assisted.helpMessage },
        ]);
      }
      return;
    }

    const mins =
      offer.minutes ??
      parseFocusMinutesFromText(lastUserTextRef.current) ??
      25;
    savePreferredFocusMinutes(mins);
    logMomentum("start", `Focus session from Do It Now — ${mins} min`);
    pomodoroTimer.startWith(mins);
    setActiveSection("home");
    setActiveNav("focus");
    setCoachingMode("focus");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Starting your **${mins}-minute** focus session — the timer is running in the **Active** bar.`,
      },
    ]);
  }

  function acceptAssistedAction(action: AssistedAction) {
    if (!filterAssistedActionForArtifact(action, lockedArtifactType)) {
      return;
    }
    clearAllPendingOffers();

    if (
      action.section === "content-generator" &&
      workspacePanel === "content-generator" &&
      (action.id === "proposal" || creationContext?.artifactTypeLocked)
    ) {
      setActiveSection("home");
      activeSectionRef.current = "home";
      setActiveNav("other");
      focusWorkspaceLayout();
      revealWorkspace();
      appendVerifiedWorkspaceMessage("content-generator", action.openAck);
      return;
    }

    if (action.tool) {
      handleToolSelectCore(action.tool);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: action.openAck },
      ]);
      return;
    }

    if (action.section === "content-generator") {
      const lastAssistant =
        [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
      const artifact = resolveChatHandoffArtifact(toChatTurns(messages), {
        hintType: action.itemType,
        userText: lastUserTextRef.current,
        lastAssistantText: lastAssistant,
      });

      if (artifact?.draftContent?.trim()) {
        openCreateWithResolvedArtifact(artifact, action.openAck);
        clearPendingChatArtifact();
        return;
      }

      const itemType = action.itemType || "content";
      const title =
        itemType === "Email" ? "Email Draft" : action.title || `New ${itemType}`;
      const scaffold =
        blankScaffoldForType(itemType) ||
        collaborativeScaffoldForType(itemType, title);
      openCreationWorkspaceCore(
        "content-generator",
        {
          itemType,
          title,
          draftContent: scaffold,
          brief: action.brief,
          stage: scaffold.trim() ? "building draft" : "starting compose",
          source: "generated",
          artifactTypeLocked: shouldLockArtifactType(itemType),
        },
        {
          ackMessage: action.openAck,
          seedOverride: {
            type: itemType,
            topic: title,
            brief: action.brief,
            draft: scaffold || undefined,
            autoGenerate: false,
          },
        },
      );
      return;
    }

    if (action.section === "projects") {
      openCreationWorkspaceCore(
        "projects",
        {
          itemType: action.itemType || "project",
          title: action.title,
          brief: action.brief,
          stage: "defining project",
          source: "project",
        },
        { ackMessage: action.openAck },
      );
      return;
    }

    setActiveSection(action.section);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: action.openAck },
    ]);
    revealWorkspace();
  }

  function acceptStressReliefOption(id: StressReliefOptionId) {
    setStressReliefOffer(null);
    clearAllPendingOffers();
    const action = stressReliefToolAction(id);
    if (action.type === "tool") {
      if (action.tool === "focus-audio") {
        openFocusAudioCore("calm-brain");
        return;
      }
      handleToolSelectCore(action.tool);
      return;
    }
    if (action.type === "section") {
      if (action.section === "brain-dump") {
        openClearMyMindStandaloneCore();
        return;
      }
      openStandaloneFocusSectionCore(action.section);
      return;
    }
    if (action.type === "activity") {
      const activity = getActivityById(action.activityId);
      if (!activity) return;
      openActivityFullPageCore({
        ...EMPTY_ACTIVITY_SESSION,
        activityId: action.activityId,
        stepIndex: 0,
        phase: "active",
        categoryId: activity.categoryId,
      });
      return;
    }
    void handleSend(action.prompt, false, true);
  }

  function acceptStressCause(cause: StressCauseId) {
    setStressReliefOffer(buildStressCauseRecommendation(cause));
  }

  function acceptToolSuggestion(offer: ToolSuggestion) {
    trackToolSuggestionAccepted(offer.kind);
    captureToolOfferAccepted(offer.kind, closedLoopCtx());
    clearAllPendingOffers();
    if (offer.action.type === "tool") {
      if (offer.action.tool === "focus-audio") {
        const fromLine = /motivation boost/i.test(offer.line)
          ? "motivation-boost"
          : /calm my brain|calming|something calm/i.test(offer.line)
            ? "calm-brain"
            : detectAudioRequest(lastUserTextRef.current).categoryId;
        openFocusAudioCore(fromLine);
        return;
      }
      handleToolSelectCore(offer.action.tool);
      return;
    }
    void handleSend(offer.action.prompt, false, true);
  }

  function launchActionBridge(bridge: ActionBridge) {
    clearAllPendingOffers();
    if (bridge.tool === "time-block") {
      openWorkspaceBesideChatCore("time-block", workspaceOpenAck("time-block"));
      return;
    }
    if (bridge.tool === "brain-dump") {
      openClearMyMindStandaloneCore();
      return;
    }
    if (bridge.tool === "focus-timer") {
      const mins =
        bridge.minutes ??
        parseFocusMinutesFromText(lastUserTextRef.current) ??
        25;
      savePreferredFocusMinutes(mins);
      logMomentum("start", `Focus session from chat — ${mins} min`);
      pomodoroTimer.startWith(mins);
      setActiveSection("home");
      setActiveNav("focus");
      setCoachingMode("focus");
      return;
    }
    if (bridge.tool === "focus-audio") {
      openFocusAudioCore(
        detectAudioRequest(
          `${lastUserTextRef.current} ${bridge.label}`,
        ).categoryId,
      );
      return;
    }
    handleToolSelectCore(bridge.tool);
  }

  function toggleVoiceMode() {
    const next = !voiceMode;
    setVoiceMode(next);
    if (next && speechSupported && !isListening) {
      baseInputRef.current = input;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        /* mic may already be active */
      }
    } else if (!next && isListening) {
      recognitionRef.current?.stop();
    }
  }

  const pendingAction = useMemo(
    () =>
      resolvePendingAction({
        workspaceOffer,
        artifactExportOffer,
        assistedActionOffer,
        doItNowOffer,
        toolSuggestion,
        actionBridge,
        bridge,
        lockedArtifactType,
      }),
    [
      workspaceOffer,
      artifactExportOffer,
      assistedActionOffer,
      doItNowOffer,
      toolSuggestion,
      actionBridge,
      bridge,
      lockedArtifactType,
    ],
  );

  const suppressInterventionCards = useMemo(() => {
    if (splitCreateChat) return true;
    if (
      shouldSuppressCardsForBuilderKickoff({
        kickoffActive: builderKickoffActive,
        messages,
      })
    ) {
      return true;
    }
    const lastUser = [...messages]
      .reverse()
      .find((m) => m.role === "user")
      ?.content?.trim();
    if (!lastUser) {
      if (workspacePanel || companionStandaloneSection || guideBesideSession) {
        return true;
      }
      return (
        shouldSuppressParallelCoaching(createBuilderSession, splitCreateChat) ||
        builderKickoffActive
      );
    }
    const lastAssistant =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
    const applySession = strategyApplySessionRef.current;
    const builderSession = createBuilderSessionRef.current;
    const governorBlocks = governorSuppressesInterventionSurfaces({
      userText: lastUser,
      lastAssistantText: lastAssistant,
      workspacePanel,
      workspaceSnap: getWorkspaceSnapshot(),
      resolvedIntent: resolveIntent(lastUser),
      strategyApplyActive: Boolean(
        applySession &&
          workspacePanel === "playbook" &&
          applySession.phase !== "done",
      ),
      createBuilderActive: Boolean(
        builderSession &&
          workspacePanel === "content-generator" &&
          builderSession.phase !== "done",
      ),
      businessStrategyActive: Boolean(
        businessStrategySessionRef.current && workspacePanel === "playbook",
      ),
      dayDesignerActive: Boolean(
        dayDesignerSession && dayDesignerSession.step !== "complete",
      ),
    });
    return (
      shouldSuppressInterventionSurfaces({
        userText: lastUser,
        messages,
        governorSuppressesCards: governorBlocks,
        splitCreateDiscovery: shouldSuppressParallelCoaching(
          createBuilderSession,
          splitCreateChat,
        ),
        userRequestedAction:
          /\b(?:help me|show me|open |create |write |send |draft |do it now|start (?:a )?focus)\b/i.test(
            lastUser,
          ),
      }) ||
      shouldSuppressParallelCoaching(createBuilderSession, splitCreateChat)
    );
  }, [
    messages,
    workspacePanel,
    companionStandaloneSection,
    guideBesideSession,
    chatLayoutMode,
    createBuilderSession,
    splitCreateChat,
    dayDesignerSession,
    strategyApplySession,
    builderKickoffActive,
  ]);

  useEffect(() => {
    if (!suppressInterventionCards) return;
    setActivationOffer(null);
    setLoopOffer(null);
    setRelationshipOffer(null);
    setDecisionOffer(null);
    setEnvironmentOffer(null);
    setFutureShariOffer(null);
    setMomentumOffer(null);
    setOpportunityOffer(null);
    setBusinessOSSortOffer(null);
    setChiefOffer(null);
    setPredictiveOffer(null);
  }, [suppressInterventionCards]);

  const activeWorkspaceItems = useMemo(() => {
    const items: ActiveWorkspaceItem[] = [];
    const focus = focusTimerWorkspaceItem(pomodoroTimer, () => {
      setActiveSection("focus-timer");
      setActiveNav("focus");
    });
    if (focus) items.push(focus);

    if (workspacePanel === "content-generator") {
      const hasDraft = Boolean(
        creationContext?.draftContent?.trim() ||
          workspaceDetail?.draftPreview?.trim() ||
          genSeed?.draft?.trim(),
      );
      const title =
        creationContext?.title?.trim() ||
        workspaceDetail?.selectedItemName?.trim() ||
        "Draft";
      items.push({
        id: "create",
        emoji: "📝",
        label: hasDraft ? "Create Draft Open" : "Create Open",
        detail: title.slice(0, 48),
        onOpen: () => {
          setActiveSection("home");
          setActiveNav("other");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "projects") {
      items.push({
        id: "projects",
        emoji: "📋",
        label: "Project",
        detail: (
          workspaceSession?.projectTitle ||
          workspaceDetail?.selectedItemName ||
          "In progress"
        ).slice(0, 48),
        onOpen: () => {
          setActiveSection("home");
          setActiveNav("projects");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "time-block") {
      items.push({
        id: "time-block",
        emoji: "📅",
        label: "Momentum Appointments",
        detail: "Planning open",
        onOpen: () => {
          setActiveSection("home");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "templates-library") {
      items.push({
        id: "templates",
        emoji: "📚",
        label: "Templates",
        detail: "Library open",
        onOpen: () => {
          setActiveSection("home");
          setActiveNav("templates");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "snippets") {
      items.push({
        id: "snippets",
        emoji: "🧩",
        label: "Snippets",
        detail: "Library open",
        onOpen: () => {
          setActiveSection("home");
          setActiveNav("snippets");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "playbook") {
      items.push({
        id: "playbook",
        emoji: "📘",
        label: "Strategies",
        detail: "Browse open",
        onOpen: () => {
          setActiveSection("home");
          setActiveNav("playbook");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    return items;
  }, [
    pomodoroTimer,
    workspacePanel,
    creationContext,
    workspaceDetail,
    genSeed,
    workspaceSession,
    activeSection,
    revealWorkspace,
  ]);

  return (
    <div
      className={`relative flex h-dvh max-h-dvh overflow-hidden text-lg ${
        clientMounted ? shellClass : EMOTION_SHELL_CLASS.unclear
      }`}
      data-visual-mode={clientMounted ? visualMode : "off"}
      data-adaptive-context={clientMounted ? adaptiveVisualContext : "support"}
      suppressHydrationWarning
    >
      <CompanionUrlNavigation
        onNav={handleNavSelect}
        onOverlay={(overlay) => setOverlay(overlay)}
        onSettingsSection={(section) => {
          setSettingsSection(section);
          setOverlay("settings");
        }}
      />
      <Suspense fallback={null}>
        <CompanionSignInFromQuery onOpen={openSignIn} />
      </Suspense>
      <CompanionBackground page={scenePage} seed={sceneSeed} />

      <div className="relative z-10 flex h-full min-h-0 w-full overflow-hidden pl-14 md:pl-44">
        <CompanionSidebarPortal>
          <AppSidebar
            activeNav={activeNav}
            activeSection={activeSection}
            onNavSelect={handleNavSelect}
          />
        </CompanionSidebarPortal>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar
            onOpenClearMyMind={openClearMyMindStandaloneCore}
            onOpenAdaptMyDay={openAdaptMyDayCore}
            onRequestNewConversation={requestClearTodayContext}
            onOpenSettings={(section) => {
              setSettingsSection(section ?? null);
              setOverlay("settings");
            }}
            onOpenProfile={() => setOverlay("profile")}
            showPlanMyDay
            onOpenPlanMyDay={() => openSectionBesideChatCore("plan-my-day")}
          />
          {!homeCalm ? <ActiveWorkspaceBar items={activeWorkspaceItems} /> : null}

          {(activeSection !== "home" || overlay) && !workspacePanel ? (
            <div className="shrink-0 px-4 pt-3 sm:px-6">
              <BackButton onClick={goBack} />
            </div>
          ) : null}

          {activeSection === "home" && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <WorkspaceLayout
                chat={
            guideBesideSession &&
            !(
              guideBesideSession.source.kind === "section" &&
              shouldWalkThroughFromHowDoI(guideBesideSession.source.section)
            ) ? (
              <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#faf7f2]">
                {guideBesideSession.source.kind === "activity" ? (
                  <CompanionActivitiesPanel
                    embedded
                    variant={
                      activitySession.activityId &&
                      isGuidedExerciseActivity(activitySession.activityId)
                        ? "guided"
                        : "help-now"
                    }
                    session={activitySession}
                    onSessionChange={setActivitySession}
                    onOpenBeside={handleActivityOpenBeside}
                    onOpenDecisionCompass={() => openDecisionCompass()}
                    registerBack={registerBack}
                    onBeforeActivityStart={pushNavigationRestore}
                    returnToLabel={activityReturnLabel ?? undefined}
                    onExitActivity={handleExitActivity}
                    decisionCompassPrefill={decisionCompassPrefill}
                    decisionCompassSession={decisionCompassSession}
                    onDecisionCompassSessionChange={
                      handleDecisionCompassSessionChange
                    }
                    onDecisionCompassComplete={handleDecisionCompassComplete}
                  />
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {renderGuideBesideSection(
                      guideBesideSession.source.section,
                    )}
                  </div>
                )}
              </div>
            ) : (
            <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              {splitCreateChat ? (
                <header className="shrink-0 border-b border-[#e7dfd4] bg-[#faf7f2]/98 px-4 py-2.5 text-center sm:px-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                    Create
                  </p>
                  {createBuilderSession?.phase !== "pick-type" &&
                  workspaceSessionHeader ? (
                    <p className="mt-0.5 text-base font-semibold text-[#1f1c19]">
                      {workspaceSessionHeader}
                    </p>
                  ) : null}
                </header>
              ) : homeCalm ? (
                <SimpleHomeWelcome
                  onOpenToday={() => openSectionBesideChat("today")}
                />
              ) : (
              <IdentityBar
                emotion={displayEmotion}
                compact={!isIdle || splitCreateChat}
                calmHome={homeCalm}
                photoError={photoError}
                logoError={logoError}
                onPhotoError={() => setPhotoError(true)}
                onLogoError={() => setLogoError(true)}
                userBirthday={getRecognitionStore().birthday}
                recognitionMoment={homeCalm ? null : recognitionMoment}
                recoveryMode={false}
                focusMode={
                  homeCalm
                    ? false
                    : pomodoroTimer.isActive ||
                      workspacePanel === "focus-timer" ||
                      workspacePanel === "focus-audio"
                }
                recognitionWin={
                  homeCalm
                    ? false
                    : Boolean(
                        recognitionMoment &&
                          (recognitionMoment.type === "project_milestone" ||
                            recognitionMoment.type === "business_milestone" ||
                            recognitionMoment.type === "conversation_milestone"),
                      )
                }
                welcomeLine={null}
                onDismissWelcome={undefined}
                primaryQuestion={null}
                welcomeBack={Boolean(findLatestHomeResumeItem())}
                resumeLine={null}
                onResumeClick={undefined}
              />
              )}

              {homeCalm ? null : isIdle && recognitionMoment && !hasInlineIntelligenceOffer && !suppressInterventionCards ? (
                <RecognitionMomentCard
                  moment={recognitionMoment}
                  onDismiss={() => setRecognitionMoment(null)}
                />
              ) : null}

              <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                {!homeCalm && !suppressInterventionCards ? (
                  <FromYesterdayFocusCard
                    onOpenMomentum={() => setActiveSection("progress")}
                  />
                ) : null}
                {/* Home stays calm: greeting up top, open space here, the chat
                    box below. No menus to scan. */}
                <SimpleChat
                  messages={homeCalm ? [] : messages}
                  stateHint={stateHint}
                  showHint={false}
                  hideEmptyState
                  isLoading={isLoading}
                  formatParagraphs={formatAssistantParagraphs}
                  afterLastAssistant={
                    homeCalm
                      ? undefined
                      : !bridge &&
                        !isLoading &&
                        !pendingAction &&
                        !suppressInterventionCards ? (
                      <>
                        {projectCoachTopicPickerVisible &&
                        workspacePanel === "projects" ? (
                          <ProjectCoachTopicPicker
                            onSelect={selectProjectCoachChoice}
                            onDismiss={() =>
                              setProjectCoachTopicPickerVisible(false)
                            }
                          />
                        ) : null}
                        {businessConfidenceOffer ? (
                          <BusinessConfidenceOfferCard
                            offer={businessConfidenceOffer}
                            onUpdateProfile={() =>
                              openBusinessIntelligenceProfile(
                                businessConfidenceOffer.updateSection,
                              )
                            }
                            onContinueAnyway={continueBusinessAdviceAnyway}
                          />
                        ) : stressReliefOffer ? (
                          <StressReliefOptionsCard
                            offer={stressReliefOffer}
                            onSelectOption={acceptStressReliefOption}
                            onSelectCause={acceptStressCause}
                            onDismiss={() => setStressReliefOffer(null)}
                          />
                        ) : activationOffer &&
                          shouldSurfaceActivationOffer(
                            activationOffer,
                            [...messages]
                              .reverse()
                              .find((m) => m.role === "user")
                              ?.content ?? "",
                            messages,
                          ) ? (
                          <ActivationOfferCard
                            snapshot={activationOffer}
                            onAccept={() => {
                              const snap = activationOffer;
                              setActivationOffer(null);
                              void handleSend(
                                `Help me with this small next step: ${snap.suggestedNextStep}`,
                                false,
                                true,
                              );
                            }}
                            onDismiss={() => setActivationOffer(null)}
                          />
                        ) : dayPlanView ? (
                          <DayPlanCard
                            view={dayPlanView}
                            onDismiss={() => setDayPlanView(null)}
                          />
                        ) : dayDesignerQuestion && dayDesignerSession ? (
                          <DayDesignerPromptCard
                            question={dayDesignerQuestion}
                            onDismiss={() => {
                              setDayDesignerSession(null);
                              setDayDesignerQuestion(null);
                            }}
                          />
                        ) : relationshipOffer ? (
                          <RelationshipRememberCard
                            offer={relationshipOffer}
                            onAccept={() => {
                              const snap = relationshipOffer;
                              const { message } = acceptRelationshipRemember(snap);
                              setRelationshipOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setRelationshipOffer(null)}
                          />
                        ) : decisionCompassOffer ? (
                          <DecisionCompassOfferCard
                            offer={decisionCompassOffer}
                            onOpenCompass={() => {
                              const snap = decisionCompassOffer;
                              setDecisionCompassOffer(null);
                              openDecisionCompass(snap.prefill);
                              setMessages((prev) => [
                                ...prev,
                                {
                                  role: "assistant",
                                  content: decisionCompassOpenAck(),
                                },
                              ]);
                            }}
                            onTalkThrough={() => {
                              setDecisionCompassOffer(null);
                              setMessages((prev) => [
                                ...prev,
                                {
                                  role: "assistant",
                                  content: decisionCompassTalkThroughAck(),
                                },
                              ]);
                            }}
                            onDismiss={() => {
                              dismissDecisionCompassOfferForSession();
                              setDecisionCompassOffer(null);
                            }}
                          />
                        ) : decisionOffer ? (
                          <DecisionOfferCard
                            offer={decisionOffer}
                            onNarrow={() => {
                              const snap = decisionOffer;
                              const { message } = acceptDecisionNarrow(snap);
                              setDecisionOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onPark={() => {
                              const snap = decisionOffer;
                              const { message } = acceptDecisionPark(snap);
                              setDecisionOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setDecisionOffer(null)}
                          />
                        ) : environmentOffer ? (
                          <EnvironmentOfferCard
                            offer={environmentOffer}
                            onTry={() => {
                              const snap = environmentOffer;
                              const { message } = acceptEnvironmentAdjust(snap);
                              setEnvironmentOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setEnvironmentOffer(null)}
                          />
                        ) : futureShariOffer ? (
                          <FutureShariOfferCard
                            offer={futureShariOffer}
                            onTellMe={() => {
                              const snap = futureShariOffer;
                              const { message } = acceptFutureShari(snap);
                              setFutureShariOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setFutureShariOffer(null)}
                          />
                        ) : momentumOffer ? (
                          <MomentumOfferCard
                            offer={momentumOffer}
                            onAcknowledge={() => {
                              const snap = momentumOffer;
                              const { message } = acceptMomentumAcknowledge(snap);
                              setMomentumOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setMomentumOffer(null)}
                          />
                        ) : opportunityOffer ? (
                          <OpportunityOfferCard
                            offer={opportunityOffer}
                            onExplore={() => {
                              const snap = opportunityOffer;
                              const { message } = acceptOpportunityExplore(snap);
                              setOpportunityOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setOpportunityOffer(null)}
                          />
                        ) : businessOSSortOffer ? (
                          <BusinessOSSortCard
                            offer={businessOSSortOffer}
                            onSort={() => {
                              const snap = businessOSSortOffer;
                              const { message } = acceptBusinessSort(snap);
                              setBusinessOSSortOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setBusinessOSSortOffer(null)}
                          />
                        ) : chiefOffer ? (
                          <ChiefOfStaffOfferCard
                            offer={chiefOffer}
                            onTellMe={() => {
                              const snap = chiefOffer;
                              const { message } = acceptChiefPerspective(snap);
                              setChiefOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setChiefOffer(null)}
                          />
                        ) : predictiveOffer ? (
                          <PredictiveSupportOfferCard
                            offer={predictiveOffer}
                            onAccept={() => {
                              const snap = predictiveOffer;
                              const { message } = acceptPredictiveSupport(snap);
                              setPredictiveOffer(null);
                              void handleSend(message, false, true);
                            }}
                            onDismiss={() => setPredictiveOffer(null)}
                          />
                        ) : appFeatureNavOffer ? (
                          <ToolSuggestionCard
                            line="Ready when you are."
                            toolEmoji={appFeatureNavOffer.emoji}
                            toolLabel={appFeatureNavOffer.acceptLabel}
                            keepTalkingLabel="Not now"
                            onAccept={() =>
                              acceptAppFeatureNavOffer(appFeatureNavOffer)
                            }
                            onDismiss={() => setAppFeatureNavOffer(null)}
                          />
                        ) : workspaceOffer ? (
                          <ToolSuggestionCard
                            line={workspaceOffer.line}
                            toolEmoji={
                              WORKSPACE_EMOJI[workspaceOffer.section] ?? "🛠"
                            }
                            toolLabel={workspaceOffer.buttonLabel}
                            keepTalkingLabel="Not now"
                            onAccept={() =>
                              acceptWorkspaceOffer(workspaceOffer)
                            }
                            onDismiss={() => {
                              if (workspaceOffer) {
                                captureOfferDismissed(
                                  workspaceOffer,
                                  closedLoopCtx(),
                                );
                              }
                              setWorkspaceOffer(null);
                            }}
                          />
                        ) : assistedActionOffer ? (
                          <ToolSuggestionCard
                            line={assistedActionOffer.offerLine}
                            toolEmoji={assistedActionOffer.emoji}
                            toolLabel={assistedActionOffer.buttonLabel}
                            keepTalkingLabel="I'll do it alone"
                            onAccept={() =>
                              acceptAssistedAction(assistedActionOffer)
                            }
                            onDismiss={() => {
                              setAssistedActionOffer(null);
                              dismissOfferKeepTalking();
                            }}
                          />
                        ) : doItNowOffer ? (
                          <ActionBridgeChip
                            emoji={doItNowOffer.emoji}
                            label={doItNowOffer.label}
                            onLaunch={() => launchDoItNow(doItNowOffer)}
                          />
                        ) : toolSuggestion ? (
                          <ToolSuggestionCard
                            line={toolSuggestion.line}
                            toolEmoji={toolSuggestion.toolEmoji}
                            toolLabel={toolSuggestion.toolLabel}
                            keepTalkingLabel={toolSuggestion.keepTalkingLabel}
                            onAccept={() => acceptToolSuggestion(toolSuggestion)}
                            onDismiss={() => {
                              trackToolSuggestionDismissed(toolSuggestion.kind);
                              captureToolOfferDismissed(
                                toolSuggestion.kind,
                                closedLoopCtx(),
                              );
                              setToolSuggestion(null);
                              dismissOfferKeepTalking();
                            }}
                          />
                        ) : actionBridge ? (
                          <ActionBridgeChip
                            emoji={actionBridge.emoji}
                            label={actionBridge.label}
                            onLaunch={() => launchActionBridge(actionBridge)}
                          />
                        ) : null}
                      </>
                    ) : undefined
                  }
                />
                <div ref={bottomRef} className="h-2" />
              </div>

              {error && (
                <p
                  className="px-4 pb-2 text-center text-base text-[#a85c4a]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <footer className="input-footer sticky bottom-0 shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
                <div className="mx-auto w-full max-w-xl">
                  {pendingAction && !suppressInterventionCards && !isLoading && !homeCalm ? (
                    pendingAction.kind === "artifact-export" ? (
                      <ArtifactActionBar
                        artifactType={pendingAction.offer.artifactType}
                        line={pendingAction.offer.line}
                        actions={pendingAction.offer.actions}
                        onAction={runArtifactExport}
                        onDismiss={() => {
                          clearAllPendingOffers();
                          dismissOfferKeepTalking();
                        }}
                      />
                    ) : (
                      <PendingActionBar
                        emoji={pendingActionEmoji(pendingAction)}
                        label={pendingActionLabel(pendingAction)}
                        line={pendingActionLine(pendingAction)}
                        onOpen={() => executePendingAction(pendingAction)}
                        onDismiss={() => {
                          clearAllPendingOffers();
                          dismissOfferKeepTalking();
                        }}
                      />
                    )
                  ) : null}
                  {splitCreateBuilder &&
                  createBuilderActionsForPhase(createBuilderSession)?.length ? (
                    <CreateBuilderActionBar
                      actions={
                        createBuilderActionsForPhase(createBuilderSession)!
                      }
                      onAction={handleCreateBuilderAction}
                      disabled={isLoading}
                    />
                  ) : null}
                  <ChatInputBar
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={() => void handleSend()}
                    placeholder={
                      homeCalm
                        ? isPhase1OnboardingActive()
                          ? PHASE1_INPUT_PLACEHOLDER
                          : "What would help most right now?"
                        : undefined
                    }
                  />
                  {!homeCalm && (
                  <div className="mt-2 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-3">
                      {(() => {
                        const vs = getVoiceStatus();
                        // Essential plan has no voice — show a locked upgrade chip.
                        if (!vs.hasVoice) {
                          return (
                            <span
                              title="Voice is part of Voice Lite and Voice Pro"
                              className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#9a8f82]"
                            >
                              🔒 Voice — upgrade to talk back & forth
                            </span>
                          );
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (voiceOutput) ttsAudioRef.current?.pause();
                              setVoiceBlocked(false);
                              setVoiceOutput((v) => !v);
                            }}
                            title="Shari reads her replies aloud"
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                              voiceOutput
                                ? "bg-[#1e4f4f] text-white"
                                : "bg-white/70 text-[#6b635a] hover:bg-white"
                            }`}
                          >
                            {voiceOutput ? "🔊 Voice on" : "🔈 Voice off"} ·{" "}
                            {Math.ceil(vs.leftMin)}m left
                          </button>
                        );
                      })()}
                    </div>
                    {voiceBlocked && (
                      <p className="text-xs font-semibold text-[#a85c4a]">
                        You&apos;re out of voice minutes this month — upgrade for
                        more.
                      </p>
                    )}
                  </div>
                  )}
                </div>
              </footer>
            </main>
            )}
                workspace={workspacePanelNode}
                workspaceActive={Boolean(
                  workspacePanel ||
                    companionStandaloneSection ||
                    guideBesideSession,
                )}
                workspaceTitle={
                  companionStandaloneSection
                    ? workspaceTitle(companionStandaloneSection)
                    : workspacePanel === "google-workspace" && googleWorkspace
                      ? googleWorkspaceTitle(googleWorkspace.kind)
                      : workspacePanel
                        ? workspaceTitle(workspacePanel)
                        : guideBesideSession?.targetSection
                          ? workspaceTitle(guideBesideSession.targetSection)
                          : "Chat"
                }
                chatLayoutMode={chatLayoutMode}
                onChatLayoutModeChange={applyChatLayoutMode}
                viewSizePreset={effectiveViewSize}
                onViewSizePresetChange={applyViewSizePreset}
                onClose={goBack}
                revealKey={workspaceRevealSeq}
                chatFocusKey={chatFocusSeq}
                workspaceFirst={workspaceFirstSplit}
                hideAssistToggle={
                  workspacePanel === "content-generator" ||
                  Boolean(guideBesideSession)
                }
                leftPaneTitle={
                  guideBesideSession
                    ? guideBesideSession.source.kind === "activity"
                      ? "Activity"
                      : workspaceTitle(guideBesideSession.source.section)
                    : "Chat"
                }
                leftPaneEmoji={guideBesideSession ? "📋" : "💬"}
                assistLabel={shariAssistLabel}
              />
            </div>
          )}

          {/* Every non-home panel sits on a frosted white surface so text stays
              readable over the photo background, while the image still frames
              it. */}
          {activeSection !== "home" && (
            <div
              className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-4"
              role="presentation"
              title="Click outside the panel to go back"
              onClick={(e) => {
                // Click on the surrounding area (not the panel itself) goes back.
                if (e.target === e.currentTarget) goBack();
              }}
            >
              <div
                className={WORKSPACE_FULL_PAGE_SURFACE_CLASS}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >

          {activeSection === "focus-timer" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("focus-timer")}
              onAskShari={() => openCompanionAssist("focus-timer")}
            >
              <FocusTimerPanel
                timer={pomodoroTimer}
                onStartSession={handleFocusSession}
                onSessionStarted={handleFocusSessionStarted}
                onAskShari={() => openCompanionAssist("focus-timer")}
                onDebrief={handleFocusDebrief}
              />
            </WorkspaceShell>
          )}

          {activeSection === "brain-dump" && (
            <BrainDumpPanel
              standalone
              onOpen={openWorkspaceFromSection}
              onSuggestOpen={suggestCrossWorkspaceOpen}
              onContextChange={handleWorkspaceDetailChange}
            />
          )}

          {activeSection === "breathe" && (
            <BreathePanel onDone={() => setActiveSection("home")} />
          )}

          {activeSection === "focus-audio" && (
            <FocusAudioPanel
              emotion={displayEmotion}
              initialCategory={focusAudioCategory ?? undefined}
              onDone={() => {
                setFocusAudioCategory(null);
                setActiveSection("home");
              }}
            />
          )}

          {activeSection === "focus" &&
          activitySession.phase !== "browse" &&
          activitySession.activityId &&
          !isGuidedExerciseActivity(activitySession.activityId) ? (
            <CompanionActivitiesPanel
              variant="help-now"
              session={activitySession}
              onSessionChange={setActivitySession}
              onOpenBeside={handleActivityOpenBeside}
              onOpenDecisionCompass={() => openDecisionCompass()}
              onClose={() => goBack()}
              registerBack={registerBack}
              onBeforeActivityStart={pushNavigationRestore}
              returnToLabel={activityReturnLabel ?? undefined}
              onExitActivity={handleExitActivity}
              decisionCompassPrefill={decisionCompassPrefill}
              decisionCompassSession={decisionCompassSession}
              onDecisionCompassSessionChange={handleDecisionCompassSessionChange}
              onDecisionCompassComplete={handleDecisionCompassComplete}
            />
          ) : activeSection === "focus" ? (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("focus")}
              onAskShari={() => openCompanionAssist("focus")}
            >
              <FocusAreaPanel onAction={handleFocusHubAction} />
            </WorkspaceShell>
          ) : null}

          {activeSection === "time-block" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("time-block")}
              onAskShari={() => openCompanionAssist("time-block")}
            >
              <TimeBlockPanel onStart={startBlock} onTestAlert={testAlert} />
            </WorkspaceShell>
          )}

          {activeSection === "guided-exercises" && (
            <CompanionActivitiesPanel
              variant="guided"
              session={activitySession}
              onSessionChange={setActivitySession}
              onOpenBeside={handleActivityOpenBeside}
              onOpenDecisionCompass={() => openDecisionCompass()}
              onClose={() => goBack()}
              registerBack={registerBack}
              onBeforeActivityStart={pushNavigationRestore}
              returnToLabel={activityReturnLabel ?? undefined}
              onExitActivity={handleExitActivity}
              decisionCompassPrefill={decisionCompassPrefill}
              decisionCompassSession={decisionCompassSession}
              onDecisionCompassSessionChange={handleDecisionCompassSessionChange}
              onDecisionCompassComplete={handleDecisionCompassComplete}
            />
          )}

          {activeSection === "spin-wheel" && (
            <SpinWheelPanel
              onOpen={suggestCrossWorkspaceOpen}
              onAsk={handlePlaybookAsk}
            />
          )}

          {activeSection === "games" && (
            <GamesPanel
              onOpenSpinWheel={() => openStandaloneFocusSectionCore("spin-wheel")}
            />
          )}

          {activeSection === "business-profile" && (
            <BusinessProfilePanel
              onDone={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
            />
          )}

          {activeSection === "client-avatars" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("client-avatars")}
              onAskShari={() => openCompanionAssist("client-avatars")}
            >
              <IdealClientBuilder
                coachKickoff={avatarCoachKickoff}
                onStartNew={startClientAvatarBuilderKickoff}
                chatFieldFill={workspaceChatFill}
                focusField={workspaceFocusField}
                focusStamp={workspaceFocusStamp}
                onContextChange={handleWorkspaceDetailChange}
                onCoachSnapshot={(snapshot) => {
                  avatarBuilderSnapshotRef.current = snapshot;
                }}
                onStepAdvance={(step) => {
                  const msg = coachMessageForStepAdvance(
                    step,
                    avatarBuilderSnapshotRef.current ?? {
                      step,
                      stepIndex: 0,
                      building: true,
                      name: "",
                      who: "",
                      tagline: "",
                      painPoints: "",
                      goals: "",
                      currentBehavior: "",
                      solution: "",
                    },
                  );
                  const { field, content } = extractFocusDirective(msg);
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content },
                  ]);
                  applyWorkspaceFocus(field);
                }}
                onBuildComplete={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: clientAvatarCompletionMessage(),
                    },
                  ]);
                }}
              />
            </WorkspaceShell>
          )}

          {activeSection === "projects" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("projects")}
              onAskShari={() => openCompanionAssist("projects")}
            >
              <ProjectsPanel
                resumeProjectId={projectsResumeId}
                onResumeConsumed={() => setProjectsResumeId(null)}
                focusField={workspaceFocusField}
                focusStamp={workspaceFocusStamp}
                chatFieldFill={workspaceChatFill}
                workspaceWorkflowAction={workspaceWorkflowAction}
                sopSession={workspaceSession}
                onSopFieldChange={handleSopFieldChange}
                onProjectSaved={handleWorkspaceProjectSaved}
                onContextChange={handleWorkspaceDetailChange}
                onOpen={suggestCrossWorkspaceOpen}
                onAsk={handleProjectAsk}
                onOpenTimeBlock={handleOpenProjectTimeBlock}
                onBuildWithShari={() => openCompanionAssist("projects")}
              />
            </WorkspaceShell>
          )}

          {activeSection === "playbook" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("playbook")}
              onAskShari={() => openCompanionAssist("playbook")}
            >
              {renderPlaybookPanel({ registerBack })}
            </WorkspaceShell>
          )}

          {activeSection === "how-do-i" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("how-do-i")}
              onAskShari={() => openCompanionAssist("how-do-i")}
            >
              <HowDoIPanel
                onOpen={openHowDoIToolWalkthrough}
                onOpenActivity={(activityId) => {
                  if (activityId === "decision-compass") openDecisionCompass();
                }}
                onOpenSettings={openHowDoISettings}
                onOpenEcosystemResult={handleHowDoIEcosystemOpen}
                onAsk={(prompt) => void handleSend(prompt, false, true)}
                registerBack={registerBack}
              />
            </WorkspaceShell>
          )}

          {activeSection === "templates-library" && (
            <WorkspaceShell
              assistLabel={getShariAssistLabel("templates-library")}
              onAskShari={() => openCompanionAssist("templates-library")}
            >
              <TemplatesLibrary
                onOpen={suggestCrossWorkspaceOpen}
                onGenerate={openGenerator}
                onBuildWithShari={handleTemplateBuildWithShari}
                onOpenInCreate={handleTemplateOpenInCreate}
                onBack={goBack}
              />
            </WorkspaceShell>
          )}

          {activeSection === "email-generator" && (
            <EmailGeneratorPanel
              onOpen={suggestCrossWorkspaceOpen}
              onBuildWithShari={(input) =>
                openCreateWithShari({
                  ...input,
                  source: "email",
                })
              }
            />
          )}

          {activeSection === "snippets" && (
            <SnippetsLibrary
              onBack={goBack}
              onBuildWithShari={(input) =>
                openCreateWithShari({
                  ...input,
                  source: "snippet",
                })
              }
            />
          )}

          {activeSection === "content-types" && (
            <ContentTypesPanel
              onGenerate={openGenerator}
              onBuildWithShari={(type) =>
                openCreateWithShari({
                  itemType: type,
                  title: type,
                  stage: "starting compose",
                  source: "content-type",
                })
              }
            />
          )}

          {activeSection === "content-generator" && !workspacePanel && (
            <WorkspaceShell showAssist={false}>
              <ContentGeneratorPanel
                seed={genSeed}
                onBuildWithShari={openCreateWithShari}
                onCreateWorkflowSync={(wf) => {
                  createPanelWorkflowRef.current = wf;
                }}
                onOpen={(s) => setActiveSection(s)}
                onWin={(label) => {
                  logMomentum("complete", `Win: ${label}`);
                  clearLastActivity();
                  setLastAct(null);
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: `Saved “${label}” — that's a real step done. Nice work.`,
                    },
                  ]);
                }}
                onSaveForLater={() => {
                  setActiveSection("home");
                  setActiveNav("chat");
                }}
                onStartOver={startOverCreate}
                onDeleteDraft={deleteCreateDraft}
                onOpenCreateDraft={openCreateDraftFromLibrary}
                onDeleteCreateDraftEntry={deleteCreateDraftFromLibrary}
              />
            </WorkspaceShell>
          )}

          {activeSection === "energy" && (
            <AdjustMyDayPanel onDone={goBack} />
          )}
              </div>
            </div>
          )}

          <PlanMyDayQuickDrawer
            open={planMyDayDrawerOpen}
            onClose={() => setPlanMyDayDrawerOpen(false)}
            onOpenFull={(itemId) => {
              setPlanMyDayOpenItemId(itemId ?? null);
              openSectionBesideChatCore("plan-my-day");
            }}
          />

          <ModalSheet
            open={overlay === "signin"}
            onClose={() => setOverlay(null)}
            title="Account"
          >
            <div className="px-5 pb-8">
              <CompanionSignInForm
                showClose
                onClose={() => setOverlay(null)}
                onSuccess={() => setOverlay(null)}
              />
            </div>
          </ModalSheet>

          <ModalSheet
            open={overlay === "settings"}
            onClose={() => {
              setOverlay(null);
              setSettingsSection(null);
              setActiveNav((nav) => (nav === "settings" ? "chat" : nav));
            }}
            title="Settings"
          >
            <SettingsPanel
              onSignIn={openSignIn}
              initialSection={settingsSection}
              registerBack={registerBack}
            />
          </ModalSheet>

          <ModalSheet
            open={overlay === "profile"}
            onClose={() => {
              setOverlay(null);
              setProfileGettingToKnowYou(false);
            }}
            title="Profile"
          >
            <ProfilePanel
              onSignIn={openSignIn}
              openGettingToKnowYou={profileGettingToKnowYou}
              onOpen={(s) => {
                setOverlay(null);
                setProfileGettingToKnowYou(false);
                setActiveSection(s);
              }}
              onOpenSettings={(section) => {
                setSettingsSection(section);
                setOverlay("settings");
                setProfileGettingToKnowYou(false);
              }}
            />
          </ModalSheet>

          {triggeredBlock ? (
            <TimeBlockTrigger
              scoped
              block={triggeredBlock}
              onCheckIn={(outcome) =>
                handleMomentumCheckIn(triggeredBlock, outcome)
              }
              onOtherImportant={(payload) =>
                handleMomentumOtherImportant(triggeredBlock, payload)
              }
              onNotTodayAction={(action) =>
                handleMomentumNotToday(triggeredBlock, action)
              }
              onStartNow={() => startBlock(triggeredBlock)}
              onDismiss={() => dismissMomentumTrigger(triggeredBlock)}
            />
          ) : null}

          <FreshStartConfirmDialog
            scoped
            open={freshStartDialog !== null}
            copy={freshStartCopy(freshStartDialog ?? "clear-context")}
            onConfirm={confirmFreshStart}
            onCancel={() => setFreshStartDialog(null)}
          />
        </div>
      </div>

      {warning && !homeCalm && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(92%,28rem)] -translate-x-1/2">
          <div className="companion-fade-in flex items-center gap-3 rounded-2xl bg-[#1e4f4f] px-4 py-3 text-white shadow-2xl">
            <span aria-hidden="true">⏰</span>
            <p className="flex-1 text-sm font-medium">
              <span className="font-semibold">{warning.title}</span> starts in
              about 15 minutes.
            </p>
            <button
              type="button"
              onClick={() => setWarning(null)}
              aria-label="Dismiss"
              className="shrink-0 rounded-md px-2 py-0.5 text-white/80 hover:bg-white/15"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {crossWorkspaceBesideOffer ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto w-full max-w-md">
            <CrossWorkspaceSuggestionCard
              line={crossWorkspaceBesideOffer.line}
              targetSection={crossWorkspaceBesideOffer.targetSection}
              onAccept={() =>
                acceptCrossWorkspaceBeside(crossWorkspaceBesideOffer)
              }
              onDismiss={() => setCrossWorkspaceBesideOffer(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
