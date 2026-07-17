"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import { AppSidebar } from "@/components/companion/AppSidebar";
import { CompanionSidebarPortal } from "@/components/companion/CompanionSidebarPortal";
import { CompanionUrlNavigation } from "@/components/companion/CompanionUrlNavigation";
import { AdjustMyDayPanel } from "@/components/companion/AdjustMyDayPanel";
import { BrainDumpPanel } from "@/components/companion/BrainDumpPanel";
import { propertyNavComingSoonMessage } from "@/lib/companionPropertyNav";
import { EstateArrivalHost } from "@/components/companion/estate/EstateArrivalHost";
import { EstatePlaceAudioHost } from "@/components/companion/estate/EstatePlaceAudioHost";
import { EstatePresence } from "@/components/companion/estate/EstatePresence";
import { DiscoveryKeyHost } from "@/components/estate/discovery/DiscoveryKeyHost";
import {
  buildDiscoveryMemberContextFromEstateMemory,
  getDiscoveryMemberId,
} from "@/lib/estateDiscovery";
import { EstateTopRightChrome } from "@/components/companion/estate/EstateTopRightChrome";
import { ExperienceControlsOverlay } from "@/components/companion/estate/ExperienceControlsOverlay";
import { GlobalOverlayHost } from "@/components/companion/estate/GlobalOverlayHost";
import { SoundscapeSelectionOverlay } from "@/components/companion/estate/SoundscapeSelectionOverlay";
import {
  applyExperienceControlPresentation,
  getExperienceControlPrefs,
  patchExperienceControlPrefs,
} from "@/lib/estate/experienceControlPrefs";
import { SparkEstateGuideChrome } from "@/components/companion/SparkEstateGuideChrome";
import { SparkNoteChrome } from "@/components/companion/SparkNoteChrome";
import { estateArrivalShariGreeting } from "@/lib/estate/estateArrivalExperience";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { SparkEstateShell } from "@/components/companion/estate/SparkEstateShell";
import { InstituteCabinetPanel } from "@/components/companion/InstituteCabinetPanel";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import { playExperienceSoundscapeTrack } from "@/lib/soundscapes/playExperienceSoundscapeTrack";
import {
  GALLERY_HOME_SECTION,
  isLegacyGrowthHubSection,
  sidebarNavForGrowthDestination,
} from "@/lib/gallery";
import { GalleryExperiencePanel } from "@/components/companion/GalleryExperiencePanel";
import { DestinationGalleryPanel } from "@/components/companion/destinationGallery/DestinationGalleryPanel";
import { LifeExperienceRoomPanel } from "@/components/companion/LifeExperienceRoomPanel";
import { DecisionCompassWorkspace } from "@/components/companion/DecisionCompassWorkspace";
import { BreatheDestinationHost } from "@/components/companion/BreatheDestinationHost";
import { StrategiesPanel } from "@/components/companion/StrategiesPanel";
import { CompanionCommunicationAnchor } from "@/components/companion/CompanionCommunicationAnchor";
import { CompanionDeskChrome } from "@/components/companion/CompanionDeskChrome";
import { CompanionDeskProvider } from "@/components/companion/CompanionDeskProvider";
import { HomeChatInputFooter } from "@/components/companion/HomeChatInputFooter";
import { CompanionBackground } from "@/components/companion/CompanionBackground";
import { EstateImmersiveHomeLink } from "@/components/companion/EstateImmersiveHomeLink";
import {
  ActiveWorkspaceBar,
  focusTimerWorkspaceItem,
  type ActiveWorkspaceItem,
} from "@/components/companion/ActiveWorkspaceBar";
import { FocusAreaPanel } from "@/components/companion/FocusAreaPanel";
import { FocusMyBrainRoomShell } from "@/components/companion/FocusMyBrainRoomShell";
import {
  CompanionActivitiesPanel,
  EMPTY_ACTIVITY_SESSION,
  buildActiveActivitySession,
  type ActivitySessionState,
} from "@/components/companion/CompanionActivitiesPanel";
import { ensureActivityStepAnswers } from "@/lib/activityFields";
import { CrossWorkspaceSuggestionCard } from "@/components/companion/CrossWorkspaceSuggestionCard";
import { SpinWheelPanel } from "@/components/companion/SpinWheelPanel";
import { MomentumBuildersPanel } from "@/components/companion/MomentumBuildersPanel";
import { MomentumGamesRoomShell } from "@/components/companion/MomentumGamesRoomShell";
import { FocusAudioPanel } from "@/components/companion/FocusAudioPanel";
import { FocusTimerPanel } from "@/components/companion/FocusTimerPanel";
import { IdentityBar } from "@/components/companion/IdentityBar";
import { CompanionHomeCard } from "@/components/companion/CompanionHomeCard";
import { ArrivalLivingRoomExperience } from "@/components/companion/ArrivalLivingRoomExperience";
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
      <SparkLoadingState message="Loading Plan My Day…" size="md" />
    ),
  },
);
const PlanAdaptSharedWindow = dynamic(
  () =>
    import("@/components/companion/PlanAdaptSharedWindow").then((mod) => ({
      default: mod.PlanAdaptSharedWindow,
    })),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Plan My Day…" size="md" />
    ),
  },
);
const RemindersRhythmsEntrancePanel = dynamic(
  () =>
    import("@/components/companion/RemindersRhythmsEntrancePanel").then(
      (mod) => ({
        default: mod.RemindersRhythmsEntrancePanel,
      }),
    ),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Reminders…" size="md" />
    ),
  },
);
const StrategyLibraryEstatePanel = dynamic(
  () =>
    import("@/components/companion/StrategyLibraryEstatePanel").then((mod) => ({
      default: mod.StrategyLibraryEstatePanel,
    })),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Strategy Library…" size="md" />
    ),
  },
);
const RemindersRoomPanel = dynamic(
  () =>
    import("@/components/companion/RemindersRoomPanel").then((mod) => ({
      default: mod.RemindersRoomPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Reminders…" size="md" />
    ),
  },
);
const RhythmsRoomPanel = dynamic(
  () =>
    import("@/components/companion/RhythmsRoomPanel").then((mod) => ({
      default: mod.RhythmsRoomPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Rhythms…" size="md" />
    ),
  },
);
const CalendarRoomPanel = dynamic(
  () =>
    import("@/components/companion/CalendarRoomPanel").then((mod) => ({
      default: mod.CalendarRoomPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Calendar…" size="md" />
    ),
  },
);
const ParkingLotRoomPanel = dynamic(
  () =>
    import("@/components/companion/ParkingLotRoomPanel").then((mod) => ({
      default: mod.ParkingLotRoomPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <SparkLoadingState message="Loading Parking Lot…" size="md" />
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
      <SparkLoadingState message="Loading Visual Focus…" size="md" />
    ),
  },
);
import { PlanMyDayQuickDrawer } from "@/components/companion/PlanMyDayQuickDrawer";
import { EstateCollectionRoomPanel } from "@/components/estate-collection";
import { EvidenceVaultRoomPanel } from "@/components/estate-collection/EvidenceVaultRoomPanel";
import { GrowLandingPanel } from "@/components/companion/GrowLandingPanel";
import { ChamberOfMomentumRoomPanel } from "@/components/companion/chamber/ChamberOfMomentumRoomPanel";
import { ChamberProjectEntryPanel } from "@/components/companion/chamber/ChamberProjectEntryPanel";
import { BoardroomRoomPanel } from "@/components/companion/boardroom/BoardroomRoomPanel";
import {
  BOARDROOM_ROOM_BG,
  resolveBoardroomEntryIntent,
  type BoardroomEntryIntent,
} from "@/lib/boardroom";
import { ProjectHomesPrototypePanel } from "@/components/companion/projectHomes";
import { PROJECT_HOMES_ROOM_BACKGROUND } from "@/lib/projectHomes";
import { GrowthJournalRoomPanel } from "@/components/companion/GrowthJournalRoomPanel";
import { ProfileDestinationHost } from "@/components/companion/ProfileDestinationHost";
import type { ProfileDestination } from "@/lib/profile/profileDestination";
import {
  isProfileDestinationOverlay,
  profileDestinationForMenuAction,
  resolveProfileDestinationNavigation,
} from "@/lib/profile/profileDestination";
import {
  requestOpenEstateHowToGuide,
  type EstateHowToGuideId,
} from "@/lib/estateRoomGuides";
import { GrowthPortfolioPanel } from "@/components/companion/GrowthPortfolioPanel";
import { MomentumBuilderRoomPanel } from "@/components/companion/MomentumBuilderRoomPanel";
import { MomentumInstituteRoomPanel } from "@/components/companion/momentumInstitute/MomentumInstituteRoomPanel";
import type { InstituteLearningChatTurn } from "@/components/companion/momentumInstitute/MomentumInstituteRoomPanel";
import { StablesRoomPanel } from "@/components/companion/stables/StablesRoomPanel";
import type { StablesLearningChatTurn } from "@/components/companion/stables/StablesRoomPanel";
import { GrowPlaceholderPanel } from "@/components/companion/GrowPlaceholderPanel";
import { GrowthStoryLandingPanel } from "@/components/companion/GrowthStoryLandingPanel";
import { GrowthStoryCapturePanel } from "@/components/companion/GrowthStoryCapturePanel";
import {
  MemoryLibraryPage,
  type MemoryLibraryTab,
} from "@/components/companion/memory/MemoryLibraryPage";
import { ConfidenceVaultPanel } from "@/components/companion/ConfidenceVaultPanel";
import { MyJourneyPanel } from "@/components/companion/MyJourneyPanel";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import { findLatestHomeResumeItem } from "@/lib/homeResumeItem";
import {
  resolveCompanionContinue,
  type CompanionContinueOption,
} from "@/lib/companionLedContinue";
import {
  evaluateArrivalIntelligence,
  homeStateDataAttr,
  recordArrivalFirstAction,
  recordFirstRelationshipSignals,
  type ArrivalIntelligence,
} from "@/lib/arrivalIntelligence";
import { recordLivingRoomDeparture } from "@/lib/livingLifeEngine";
import { incrementHomeVisitCount } from "@/lib/homeWelcome";
import {
  clearCompanionPostLoginQuiet,
  isCompanionPostLoginQuiet,
} from "@/lib/companionLoginTransition";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";
import { getDayDesignerSession } from "@/lib/day-designer/dayStore";
import { activityReturnLabel as resolveActivityReturnLabel } from "@/lib/activityReturnLabel";
import {
  type FreshStartKind,
  freshStartCopy,
  NEW_CONVERSATION_GREETING,
} from "@/lib/freshStartCopy";
import {
  beginContextualHelpSession,
  endContextualHelpSession,
  isContextualHelpSessionActive,
  recoverContextualHelpSessionAfterRefresh,
  resetActiveConversation,
} from "@/lib/conversationReset";
import { resetPlanDayView } from "@/lib/planMyDay/planDayItems";
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
import { WelcomeRoomPanel } from "@/components/companion/WelcomeRoomPanel";
import { WelcomeHomePage } from "@/components/companion/WelcomeHomeFirstLaunch";
import { TodaysWelcomeCard } from "@/components/companion/TodaysWelcomeCard";
import { AdaptMyDayCheckIn } from "@/components/companion/AdaptMyDayCheckIn";
import {
  runSharedNewDay,
  resolveDailyOpeningChoiceAction,
  resolveGlobalDailyOpening,
  shouldOfferFirstPlatformOpeningOfDay,
  isAbsenceReturn,
  buildDailyOpeningArrivalMessage,
  markDailyOpeningDiscoveryPresented,
  markDailyOpeningPresented,
  markTodaysWelcomeDismissedThisSession,
  isTodaysWelcomeDismissedThisSession,
  filterLegacyDailyOpeningMessages,
  isSupersededWelcomeHomeGreeting,
  GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER,
  HELP_ME_CHOOSE_NEED_OPTIONS,
  resolveHelpMeChooseSupportOptions,
  registerHelpMeChooseNeedsPending,
  registerHelpMeChooseSupportPending,
  offerNextHelpfulLesson,
  offerNextHelpfulLessonExcluding,
  markHelpfulLessonOpened,
  markHelpfulLessonDismissed,
  type DailyOpeningEntryPoint,
  type GlobalDailyOpeningResult,
  type DailyOpeningChoiceId,
  type HelpMeChooseNeedId,
  type HelpMeChooseSupportOption,
  type HelpfulLessonOffer,
} from "@/lib/dailyOpening";
import {
  type AdaptedDayProposal,
} from "@/lib/dailyAdaptation";
import type { EcosystemSearchResult } from "@/lib/howDoIHelpLibrary";
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
import { WhatsNewPanel } from "@/components/companion/WhatsNewPanel";
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
import { TimeBlockTrigger } from "@/components/companion/TimeBlockTrigger";
import { LegacyMomentumAppointmentRedirect } from "@/components/companion/LegacyMomentumAppointmentRedirect";
import {
  openCalendarItemIntent,
  type CalendarItemOpenSource,
} from "@/lib/calendar/openCalendarItem";
import {
  openMemberCalendarExternal,
  resolveMemberCalendarOpenTarget,
} from "@/lib/calendar/memberCalendarDestination";
import { fetchConnectedCalendarsSnapshot } from "@/lib/connectedCalendars";
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
import { WORKSPACE_FULL_PAGE_SURFACE_CLASS, COMPANION_HOMESTEAD_WORKSPACE_PAGE_CLASS } from "@/lib/workspaceLayoutTokens";
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
  ensureFacilitatedSessionFromText,
  facilitationOpenerForWorkspace,
  formatFacilitatedCreationChatHint,
  getFacilitatedCreationSession,
  markWorkspaceFacilitationActive,
  processFacilitatedWorkspaceTurn,
} from "@/lib/facilitatedCreation";
import {
  applyArtifactRevisionCommand,
  buildArtifactReturnGreeting,
  buildWhatWeHaveSoFarSummary,
  formatArtifactStateChatHint,
  getActiveArtifact,
  isShowProgressRequest,
  parseArtifactRevisionCommand,
  pauseArtifactForRoom,
  recordUserSectionAnswer,
  setActiveArtifact,
  shouldPauseArtifactForSection,
  syncArtifactFromWorkflow,
} from "@/lib/artifactState";
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
import { CHAT_NAVIGATION_INTENT } from "@/lib/navigation/chatDestination";
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
  resolveStrategyOpenFromChat,
  strategyOpenAck,
  type StrategyOpenTarget,
} from "@/lib/strategyOpenFromChat";
import { STRATEGIES, getStrategy } from "@/lib/strategySystem";
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
  declineConversationOffer,
  isConversationOfferDeclined,
  toolSuggestionDeclineKey,
  workspaceOfferDeclineKey,
} from "@/lib/chatConversation/declinedOffers";
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
import {
  queueVisualFocusOpen,
  peekVisualFocusPendingOpen,
  peekMindMapDiscoveryPending,
  requestVisualFocusStudio,
  requestMindMapDiscoveryOpen,
  createAndActivateMap,
} from "@/lib/visualFocus";
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
  consumePendingInvitation,
  getOutcomeThread,
  outcomeThreadHintForChat,
  isEntrepreneurialPatternShare,
  entrepreneurialPatternHintForChat,
  patchOutcomeThread,
  registerProblemFromUser,
  registerFeatureOpened,
  registerPendingOffer,
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
  phase1OnboardingHintForChat,
  phase1RelationshipProfileForChat,
  shouldBlockWorkspaceOpenForPhase1,
  shouldDeferWorkspaceRoutingForPhase1,
  shouldSuppressWorkspaceCoachForPhase1,
} from "@/lib/phase1Onboarding";
import {
  destroyWelcomeHomeAudioManager,
  destroyWelcomeRoomAudioManager,
  primeWelcomeRoomAudioFromGesture,
} from "@/lib/welcomeAudio";
import { markWelcomeRoomOpenedWithGesture } from "@/lib/welcomeRoom/welcomeRoomGesture";
import {
  WELCOME_HOME_REPLAY_EVENT,
  clearWelcomeHomeReplayRequest,
  hasSeenWelcomeIntro,
  isWelcomeHomeIntroAudioBlocked,
  markChatAssistantAudioElement,
  markWelcomeIntroSeen,
  peekWelcomeHomeReplayRequested,
  resolveWelcomeHomeDailyChoices,
  WELCOME_HOME_DISCOVERY_KEY_DELAY_MS,
  type WelcomeHomeDailyChoiceId,
  type WelcomeHomeFirstChoice,
} from "@/lib/welcomeHome";
import { getCompanionAuthIntelligence } from "@/lib/companionAuthIntelligence";
import { evaluateWelcomeHomeExperience } from "@/lib/sparkExperienceEngine";
import { resolveWelcomeHomeChatPrompt } from "@/lib/welcomeHome/chatPrompt";
import {
  observeFromConversationTurn,
  observeResourcePreference,
  maybeTrustBuildingMoment,
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
  maybeAutonomousPreparationOffer,
  observeAutonomousPreparationTurn,
  phase8AutonomousPreparationHintForChat,
  recordPreparationOfferShown,
} from "@/lib/autonomousPreparation";
import {
  maybeBusinessIntelligenceInsight,
  observePhase7BusinessTurn,
  phase7BusinessIntelligenceHintForChat,
  recordBusinessIntelligenceInsightShown,
} from "@/lib/businessIntelligenceEcosystem";
import {
  maybeWisdomReflection,
  observeWisdomIntelligenceTurn,
  phase9WisdomIntelligenceHintForChat,
  recordWisdomReflectionShown,
} from "@/lib/wisdomIntelligence";
import {
  maybeEcosystemInsight,
  observeEcosystemIntelligenceTurn,
  phase11EcosystemIntelligenceHintForChat,
  recordEcosystemInsightShown,
} from "@/lib/ecosystemIntelligence";
import {
  maybeTransformationReflection,
  observeTransformationIntelligenceTurn,
  phase10TransformationIntelligenceHintForChat,
  recordTransformationReflectionShown,
} from "@/lib/transformationIntelligence";
import {
  establishedRelationshipCoachHintForChat,
  isEstablishedRelationshipForChat,
  relationshipMemoryContextForChat,
  relationshipPhaseSummaryForChat,
} from "@/lib/companionRelationshipPhases";
import {
  buildRelationshipIntelligencePriorityBlock,
  relationshipResponseQualityGuardrails,
} from "@/lib/relationshipIntelligencePrompt";
import {
  buildRelationshipTurnDebugClientMeta,
  detectGenericOpeningViolation,
  logRelationshipIntelligenceTurnDebug,
  warnIfGenericOpeningDespitePriority,
} from "@/lib/relationshipIntelligenceTurnDebug";
import {
  intentRoutingHintForChat,
  resolveIntentRouting,
  shouldSuppressRelationshipIntelligenceForRouting,
} from "@/lib/intentRoutingIntelligence";
import { knowledgeIntelligenceHintForChat } from "@/lib/knowledgeIntelligence";
import {
  isResearchIntelligenceRequest,
  researchIntelligenceHintForChat,
} from "@/lib/researchIntelligence";
import { elevateLifeExperienceHintForChat } from "@/lib/elevateLifeExperience";
import { humanConversationHintForChat } from "@/lib/humanConversation";
import {
  isVagueOfferConfusion,
  repairNumberedEstateRoomMenu,
  vagueOfferConfusionReply,
} from "@/lib/conversation/vagueOfferRepair";
import { tryCommitMicCaptureOnEnd } from "@/lib/voiceMicCommit";
import {
  enforceCanonicalPlaceIdentityInCopy,
  repairInventedEstatePlaceList,
} from "@/lib/estate/estatePlaceIdentityLock";
import {
  clearFrictionlessPending,
  frictionlessHintForChat,
  frictionlessPendingFromToolOffer,
  frictionlessPendingFromWorkspaceOffer,
  isFrictionlessAffirmation,
  isFrictionlessPendingAlignedWithAssistant,
  isFrictionlessPendingExpired,
  loadFrictionlessPending,
  loadFrictionlessPendingForConfirmation,
  resolveFrictionlessAction,
  resolveCreateFastPathAction,
  resolveFrictionlessContinuation,
  saveFrictionlessPending,
  shouldSuppressRelationshipForFrictionless,
  type FrictionlessActionDecision,
} from "@/lib/frictionlessActionLayer";
import {
  clearPendingChoice,
  hasActivePendingChoice,
  isCreateWorkflowContinuation,
  loadPendingChoice,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";
import {
  applyConversationPriorityClears,
  isConversationPriorityEngineEnabled,
  resolveTurnPriority,
} from "@/lib/conversationIntelligence/orchestrator";
import type { PendingChoiceExecution } from "@/lib/pendingChoice/frictionlessBridge";
import type { PendingChoiceAction } from "@/lib/pendingChoice/types";
import {
  logTurnOwner,
  normalizeTurnMessage,
} from "@/lib/conversation/turnOwner";
import {
  createAwaitingConfirmationState,
  isConfirmationAcceptance,
  isConfirmationDecline,
  isPureConfirmationDecline,
  shouldStopAfterAssistantOffer,
  type AwaitingUserConfirmationState,
} from "@/lib/conversationConfirmationGate";
import { shouldSuppressRelationshipIntelligenceForUserText } from "@/lib/relationshipIntelligenceBoundaries";
import { resolveHardNavigationCommand } from "@/lib/hardNavigationCommands";
import {
  logCreateOfferRegistration,
  logYesContinuationResolution,
} from "@/lib/yesContinuationTrace";
import {
  googleSheetsHintForChat,
  googleSheetsCreateHintForArtifact,
  resolveGoogleSheetsTurn,
  type GoogleSheetPendingPayload,
} from "@/lib/googleSheetsIntelligence";
import {
  clearGoogleSheetIntakeSession,
  loadGoogleSheetIntakeSession,
  saveGoogleSheetIntakeSession,
} from "@/lib/googleSheetsSessionStore";
import {
  clearReminderIntakeSession,
  loadReminderIntakeSession,
  saveReminderIntakeSession,
} from "@/lib/reminderStore";
import { resolveReminderTurn } from "@/lib/reminderIntelligence";
import {
  afterDeliverableFired,
  collectDueDeliverables,
  deliverableOccurrenceKey,
  shouldDeliverBrowserNotification,
  shouldDeliverInApp,
} from "@/lib/rhythms";
import {
  createGoogleSheetFromPayload,
  googleSheetCreateAck,
  googleSheetCreateFailureAck,
} from "@/lib/googleSheetsCreateAction";
import type { FrictionlessPendingAction } from "@/lib/frictionlessActionLayer";
import {
  recoverStrategyOfferPendingFromChat,
  registerStrategyOfferFromAssistant,
  saveStrategyOfferPending,
  strategyOfferAck,
  isStrategyIntelligenceOfferMessage,
} from "@/lib/strategyOfferContinuation";
import {
  clearVisualThinkingMenuPending,
  isVisualThinkingMenuOfferMessage,
  isVisualThinkingPendingAction,
  loadVisualThinkingMenuPending,
  recoverVisualThinkingMenuFromChat,
  registerVisualThinkingMenuFromAssistant,
  resolveVisualMenuSelection,
  saveVisualThinkingMenuPending,
  visualMenuSelectionAck,
} from "@/lib/visualThinkingContinuation";
import {
  studioModeForViewId,
  visualThinkingViewTitle,
  type VisualThinkingViewId,
} from "@/lib/visualThinkingStudio";
import {
  resolveStudioViewForEngineOpen,
  type SparkVisualEngineOpenRequest,
} from "@/lib/sparkVisualEngine";
import type { VisualFocusMode } from "@/lib/visualFocus/types";
import {
  CREATE_PANEL_SECTION,
  isCreatePanelOpen,
  logHardNavCreate,
} from "@/lib/openCreateWorkspace";
import {
  onEstatePlaceArrived,
  onEstateSectionChanged,
  shouldBlockCreateForRecognitionTurn,
} from "@/lib/sparkRecognitionEngine/shellSync";
import {
  buildCreateOpenLiveSnapshot,
  nextCreateOpenTraceId,
  publishCreateOpenLiveTrace,
  scheduleCreateOpenLiveTrace,
  type CreateOpenLiveTraceSnapshot,
  type CreateOpenLiveTraceStage,
} from "@/lib/createOpenLiveTrace";
import { WorkspaceDebugBanner } from "@/components/companion/WorkspaceDebugBanner";
import { CompanionPreviewTestPanel } from "@/components/companion/CompanionPreviewTestPanel";
import {
  armCompanionPreviewTestHarnessFromQuery,
  buildPreviewDiscoveryKeySession,
  clearCompanionPreviewTestLaunch,
  getCompanionPreviewTestLaunch,
  getCompanionPreviewTestRevision,
  isCompanionPreviewTestHarnessArmed,
  isCompanionPreviewTestSessionActive,
  setCompanionPreviewTestLaunch,
  type CompanionPreviewTestLaunchTarget,
} from "@/lib/companionPreviewTestHarness";
import { InMemoryDiscoveryHistoryStore } from "@/lib/estateDiscovery/discoveryHistory";
import { dispatchEstateArrivalStart } from "@/lib/estate/estateArrivalSession";
import {
  auditPromptBlocks,
  CompanionLatencyProfiler,
  logCompanionLatency,
  measureKnowledgeDetection,
  resolveCompanionResponseRoute,
  type CompanionSpeedProfile,
} from "@/lib/companionLatencyProfiler";
import {
  isSimpleSocialGreeting,
  simpleSocialGreetingReply,
} from "@/lib/chatFastPath/simpleSocial";
import {
  relationshipConversationLocalReply,
  shouldCompleteRelationshipChatLocally,
} from "@/lib/chatFastPath/relationshipChatLocal";
import {
  isVagueHelpRequest,
  vagueHelpLocalReply,
} from "@/lib/chatFastPath/vagueHelpLocal";
import {
  consumeCompanionChatStream,
  isCompanionChatStreamResponse,
} from "@/lib/chatFastPath/companionChatStream";
import {
  buildFailSafeChatReply,
  fetchCompanionChatWithTimeout,
  isInformationalChatTurn,
} from "@/lib/chatFastPath/chatTurnGuarantee";
import {
  isChatRequestAbortError,
  isChatRequestSuperseded,
  supersedeInFlightChatRequest,
} from "@/lib/chatFastPath/chatRequestInterrupt";
import { resolveChatFailureReply } from "@/lib/chatFastPath/resolveChatFailureReply";
import { logConversationPipelineDiagnostic } from "@/lib/conversation/conversationPipelineDiagnostics";
import {
  isSimpleCreateRequest,
  isUniversalCreationMessage,
  isGuidedCreationAssistantContext,
  loadUniversalCreationSession,
  clearUniversalCreationSession,
  detectUniversalDocumentType,
} from "@/lib/universalCreation";
import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "@/lib/sparkKnowledge/estateGuide";
import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
} from "@/lib/conversation/overwhelmNeedClassifier";
import { mayOfferScenicPlaceSuggestions } from "@/lib/estate/scenicPlaceSuggestionPolicy";
import {
  logPipelineTurnFailure,
  runReliableSyncLayer,
} from "@/lib/conversation/conversationTurnPipeline";
import {
  classifyPrimaryConversationTurn,
  primaryTurnAllowsKernel,
  type PrimaryTurnDecision,
} from "@/lib/conversation/primaryTurnClassifier";
import {
  clearConversationOwner,
  continuityOwnerHintForChat,
  getActiveConversationOwner,
  resolveContinuityTurnGate,
  setActiveConversationOwner,
} from "@/lib/conversationContinuity";
import {
  logPrimaryTurnClassification,
  recordPrimaryTurnFinalResponse,
} from "@/lib/conversation/primaryTurnLog";
import { scrollConversationToLatestExchange } from "@/lib/conversation/scrollToLatestExchange";
import { shouldRouteThroughEstateKernel } from "@/lib/estate/estateKernelGate";
import { resolveEstatePlaceIdFromUserText } from "@/lib/estate/estateRoomAliasRegistry";
import { printConversation } from "@/lib/sparkAlpha/conversationExport";
import { setCurrentRoom } from "@/lib/estateCapabilityRegistry";
import type { EstateRoomAction } from "@/lib/estate/roomContext/types";
import { resolveCurrentEstateRoom } from "@/lib/estate/roomContext";
import {
  requestJournalGazeboCommand,
  type JournalGazeboCommandKind,
} from "@/lib/journalGazebo/journalGazeboCommands";
import {
  consumeSparkCardAskCompanion,
  subscribeSparkCardAskCompanion,
} from "@/lib/sparkNote/sparkCardAskCompanion";
import { JOURNAL_WELCOME_PLATE_URL } from "@/lib/journalGazebo/journalGazeboMedia";
import { matchImpliedEstatePlace } from "@/lib/estate/impliedEstatePlaceMatch";
import {
  evaluateImpliedNeed,
  impliedNeedDiagnosticLabel,
} from "@/lib/intentAwareConversation/impliedNeed";
import {
  createChatTurnState,
  guaranteeChatTurnCompletion,
  markAssistantReplied,
  markChatTurnLoading,
  markChatTurnStarted,
  finalizeChatTurn,
  needsFailSafeAssistantReply,
  type ChatTurnState,
} from "@/lib/chatFastPath/chatTurnLifecycle";
import {
  logCreatePendingAction,
  resolvedArtifactFromCreatePending,
} from "@/lib/createPendingAction";
import {
  buildRelationshipLeadParagraph,
  warnIfRelationshipContractViolation,
} from "@/lib/relationshipResponseContract";
import {
  firstParagraphForTrace,
  logRelationshipResponseTrace,
  type RelationshipResponseUiTrace,
} from "@/lib/relationshipResponseTrace";
import {
  createConversationWorkflow,
  type ConversationWorkflow,
  type WorkflowContinuationResult,
} from "@/lib/conversationWorkflowContinuation";
import {
  resolveCompanionAcceptanceTurn,
  trackConversationOffer,
} from "@/lib/companionIntelligenceRouter";
import {
  COMMITMENT_CLARIFY_MESSAGE,
  DUPLICATE_COMMITMENT_MESSAGE,
  createConversationCommitment,
  commitmentAllowsArtifactExport,
  type PendingConversationCommitment,
} from "@/lib/conversationCommitmentEngine";
import {
  buildVisibleThinkingContext,
  type VisibleThinkingContext,
} from "@/lib/visibleThinking";
import { routeCompanionFailure } from "@/lib/companionContextRouting";
import { readJsonResponse } from "@/lib/safeJsonResponse";
import { useVisibleThinking } from "@/lib/useVisibleThinking";
import { isExplicitBreatheRequest } from "@/lib/explicitBreatheRouting";
import {
  BREATHE_DESTINATION_FADE_MS,
  EMPTY_BREATHE_DESTINATION,
  isBreatheDestinationActive,
  type BreatheDestinationState,
} from "@/lib/breatheDestination";
import {
  resolveBreatheEnvironment,
  type BreatheEnvironmentId,
} from "@/lib/breatheDestination/breatheEnvironments";
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
  WORKSPACE_OBJECT_ID,
  workspaceObjectId,
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
  clearRoomBackdropOverride,
  getClearMyMindBackdropImageUrl,
} from "@/lib/chatBackdrop";
import { isEstateHomeDestination } from "@/lib/navigationBack";
import {
  enterClearMyMindMode,
  exitClearMyMindMode,
  isClearMyMindExitRequest,
  isClearMyMindModeActive,
  isClearMyMindOrganizeRequest,
  setClearMyMindModePhase,
  shouldStayInClearMyMindMode,
} from "@/lib/clearMyMind/clearMyMindMode";
import {
  resolveExplicitCapabilityIntent,
  type UniversalCapabilityRequest,
} from "@/lib/universalAccess";
import {
  CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES,
  CLEAR_MY_MIND_EXIT_ANNOUNCE,
  CLEAR_MY_MIND_WELCOME_LINES,
} from "@/lib/clearMyMindCopy";
import {
  directEstateChatRoomId,
  resolveEstatePlaceAudioHostPlaceId,
  shouldShowDirectEstateOverlay,
} from "@/lib/estate/estateChatNavigation";
import {
  isStopEstateAmbienceRequest,
  stopAllEstateEnvironmentalAudio,
  stopEstateAmbienceReply,
} from "@/lib/estate/estateEnvironmentalAudio";
import {
  isEstateAmbienceEnabled,
  setEstateAmbienceEnabled,
} from "@/lib/estate/estateAmbiencePreference";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";
import { kickstartEstateRoomAmbience } from "@/lib/estate/estateRoomAmbience";
import {
  JUST_BE_HERE_ENTER_MS,
  resolvePresenceModeRoomId,
  type JustBeHereSession,
} from "@/lib/estate/justBeHere";
import { resolveEstatePresenceRoomId } from "@/lib/estate/estatePresence";
import {
  formatEstateRoomPickerLine,
} from "@/lib/estate/estateMetaNavigation";
import { formatLibraryGreatThinkersReply } from "@/lib/estate/libraryConversationIntents";
import { useEstateChatInputFocus } from "@/lib/useEstateChatInputFocus";
import {
  isDedicatedEstateRoomPanelSection,
  shouldShowDirectEstateVisitOverlay,
  type DirectEstateVisit,
} from "@/lib/estate/directEstateVisit";
import { resolveSparkEstateShellPlaceId } from "@/lib/estate/estateShellRouting";
import { isEstateFullBleedPanelSection } from "@/lib/estate/estateFullBleedPanelSections";
import { EstateRoomErrorBoundary } from "@/components/companion/estate/EstateRoomErrorBoundary";
import {
  isEstatePlaceChromeActive,
  resolveEstateChromePolicy,
  shouldSuppressEstateInvitationGrid,
} from "@/lib/estate/estateChromePolicy";
import { messageNamesExactEstateRoom } from "@/lib/estate/estateRoomAliasRegistry";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";
import {
  resolveExplicitCompanionAction,
  type ExplicitCompanionAction,
} from "@/lib/companion/explicitCompanionActions";
import {
  estatePresenceGreeting,
  type EstateRoomInvitationItem,
} from "@/lib/estate/estateRoomInvitation";
import {
  EVIDENCE_VAULT_ARRIVAL_WELCOME,
  EVIDENCE_VAULT_INTENTIONAL_ENTRY_WELCOME,
  EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT,
  formatEvidenceVaultFindProofReply,
  formatEvidenceVaultInsightsReply,
  formatEvidenceVaultReminderReply,
  consumeEvidenceVaultPendingWelcome,
  setEvidenceVaultChatPrefill,
  setEvidenceVaultPendingWelcome,
  setEvidenceVaultSkipEntrance,
  setEvidenceVaultWorkspaceMode,
} from "@/lib/estate/evidenceVaultArrival";
import { EVIDENCE_VAULT_CHAT_PRESERVE_OFFER } from "@/lib/estate/evidenceVaultExperience";
import {
  evidenceVaultContextReply,
  isEvidenceVaultLeaveRequest,
  looksLikeEvidenceVaultDiscoveryShare,
} from "@/lib/estate/evidenceVaultContextLock";
import { isPlanMyDaySection } from "@/lib/planMyDayRouting";
import { confirmLeaveUnsavedWork } from "@/lib/unsavedWorkGuard";
import { PLAN_MY_DAY_MORNING_BG } from "@/lib/planMyDay/morningRoom";
import { setPlanDayOwnerUserId } from "@/lib/planMyDay/planDayOwner";
import type { PlanningCenterArea } from "@/lib/planMyDay/planningCenter";
import { GROWTH_ROOM_BG, JOURNAL_ROOM_BG, EVIDENCE_VAULT_ENTRANCE_BG, EVIDENCE_VAULT_ROOM_BG, PORTFOLIO_ROOM_BG, ESTATE_PROFILE_ROOM_BG } from "@/lib/growth/growthRoom";
import {
  isProfileEstateMenuAction,
  isProfileEstateRoomId,
  profileEstateRoomBackgroundImage,
  profileEstateRoomForMenuAction,
  profileEstateSectionForRoom,
  type EstateMenuShellActionId,
  type ProfileEstateRoomId,
} from "@/lib/growth/profileEstateRooms";
import { CREATIVE_STUDIO_ROOM_BG } from "@/lib/creativeStudio/creativeStudioRoom";
import { CELEBRATION_GARDEN_ROOM_BG } from "@/lib/celebrationGarden/celebrationGardenRoom";
import { STORY_LIBRARY_ROOM_BG } from "@/lib/storyLibrary/storyLibraryRoom";
import { CAPTURE_MOMENT_ROOM_BG } from "@/lib/captureMoment/captureMomentRoom";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import {
  type ClearMyMindPanelView,
  workspaceOpenCopyVerified,
  workspaceOpeningHintForChat,
} from "@/lib/workspaceOpeningRule";
import {
  shouldAutoLaunchPendingAction,
  shouldAutoOpenWorkspaceFromIntent,
} from "@/lib/companionAutoLaunch";
import {
  pendingActionObjectId,
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
  evaluateEstateConversationTurn,
  estateConversationHintForChat,
  estateCommandAckLine,
  executeEstateCommandMemoryHandoff,
  isDirectEstateRoomRequest,
  mergeWorkspaceOfferSecondary,
  resolveEstateAwareWorkspaceOffer,
  workspaceOfferReplyLine,
  type EstateCommandDecision,
} from "@/lib/estateIntelligence";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";
import {
  pickWanderDestination,
  recordWanderTransition,
  validateWanderPick,
} from "@/lib/estate/manifest/estateWanderMode";
import { EstateMapFullScreen } from "@/components/estateMap";
import {
  exploreMapLocationIdForPlaceId,
  getExploreSparkMapLocations,
  clearExploreEstateReturnPending,
  markExploreEstateReturnPending,
  resolveExploreMapLocationPlaceId,
} from "@/lib/estateMap/exploreSparkNavigation";
import {
  planWelcomeHomeDestinationSwitch,
  type WelcomeHomeDestinationKind,
} from "@/lib/estate/welcomeHomeDestinationSwitch";
import { getExploreEstateDestinationById } from "@/lib/estateMap/exploreEstateDestinations";
import type { EstateMapLocation } from "@/lib/estateMap/types";
import type {
  ImmediateCreateOpenPayload,
  ImmediateCreateProjectOpenPayload,
  ImmediateMomentumOpenPayload,
} from "@/lib/createExperience/createExperienceRouting";
import {
  CREATE_ROOM_PREPARED_STATE_MESSAGE,
  resolveLegacyCreateWorkspaceGuard,
} from "@/lib/createExperience/blockLegacyCreateWorkspaceRouting";
import {
  savePendingEstatePlaceMenu,
  registerPendingEstatePlaceMenuFromAssistant,
  clearPendingEstatePlaceMenu,
} from "@/lib/estate/estatePlaceNavigation";
import {
  executeSoundscapeIntent,
} from "@/lib/estate/executeUserIntent";
import { executeCaptureWrite } from "@/lib/capture";
import {
  classifyCompanionIntent,
  executeCompanionIntent,
} from "@/lib/companionTurn";
import { isDirectHelpOverrideRequest } from "@/lib/companionTurn/classifyCompanionIntent";
import { patchEstateRuntimeState } from "@/lib/estate/estateRuntimeState";
import {
  estateMemoryHintForChat,
  estateRoomArrivalContinuationLine,
  consumeEstateTransitionPreserveChat,
  buildEstateArrivalContinuation,
  clearEstatePendingTransition,
  loadEstatePendingTransition,
  estateTransitionAckForSection,
  patchEstateMemory,
  recordEstateConversationTurn,
  recordEstateRoomTransition,
  registerEstatePendingTransition,
  estateEntryIdForSection,
  estateSectionForEntryId,
  registerEstateWorkspaceOfferFromAssistant,
  recoverEstateWorkspaceOfferFromChat,
  buildWorkspaceOfferForEstateSection,
  isEstateTransitionOfferMessage,
} from "@/lib/estateMemory";
import {
  prepareEstateSceneTransition,
  prepareEstateSceneTransitionFireAndForget,
  syncEstateSceneActivePlate,
} from "@/lib/estate/estateSceneTransition";
import { WELCOME_ROOM_ASSET } from "@/lib/welcomeRoom/types";
import { resolveMomentumBuilderRoomState } from "@/lib/momentumBuilderRoom/roomExperience";
import { recordMomentumPathMilestone } from "@/lib/momentumBuilderRoom/momentumPathHooks";
import { MOMENTUM_BUILDER_ROOM_BG } from "@/lib/momentumBuilderRoom/roomRegistry";
import {
  isMomentumBuilderRoomSection,
  momentumBuilderRoomHintForChat,
} from "@/lib/momentumBuilderRoom/momentumBuilderPrompt";
import { CHAMBER_OF_MOMENTUM_ROOM_BG } from "@/lib/estate/chamber/chamberOfMomentumRoomRegistry";
import { CARTOGRAPHERS_STUDIO_BACKGROUND } from "@/lib/cartographersStudio";
import {
  DESTINATION_GALLERY_BG,
  resolveCrystalActivation,
  type CrystalActivation,
  type DestinationCrystal,
} from "@/lib/destinationGallery";
import { resolveMyDayAndWorkOpenerFromText } from "@/lib/estate/myDayAndWorkNavigation";
import { ensureChamberDemoDataSeeded } from "@/lib/estate/chamber/seedChamberDemoData";
import { isChamberDemoMode } from "@/lib/estate/chamber/chamberDemoMode";
import {
  MOMENTUM_INSTITUTE_ROOM_BG,
  isMomentumInstituteSection,
} from "@/lib/momentumInstitute/room/instituteRoomRegistry";
import {
  chamberMomentumIntentSection,
  consumeChamberMomentumIntent,
  type ChamberMomentumIntent,
  type ChamberUnsureOption,
} from "@/lib/estate/chamberOfMomentumRouting";
import {
  consumeChamberIntelligence,
  stageChamberIntelligence,
  type ChamberIntelligenceAssessment,
} from "@/lib/estate/chamberOfMomentumIntelligence";
import {
  selectChamberJourneySupport,
  stageChamberJourneySelection,
} from "@/lib/estate/chamber/chamberMemberJourney";
import {
  activateChamberMember,
  clearActiveChamberMember,
  stripChamberMemberActivationMessages,
  readActiveChamberMember,
} from "@/lib/chamber/chamberMemberActivation";
import {
  dismissActiveChamberConversationStorage,
  filterDismissedChamberMessages,
  planDismissActiveChamberConversation,
} from "@/lib/chamber/dismissActiveChamberConversation";
import { chamberMemberHintForChat } from "@/lib/chamber/chamberMemberPrompt";
import { isChamberMemberConversationActive } from "@/lib/chamber/chamberConversationLock";
import {
  chamberConversationTitle,
  formatChamberConversationTranscript,
} from "@/lib/chamber/chamberConversationExport";
import { playPlaceFirstArrival } from "@/lib/estate/estatePlaceFirstArrival";
import {
  getChamberMemberById,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import { recordChamberIntelligenceVisit } from "@/lib/estate/chamberOfMomentumMemory";
import {
  STABLES_ROOM_BG,
  isStablesSection,
  stablesRoomHintForChat,
} from "@/lib/stables";
import "@/lib/momentumInstitute/catalog/bootstrapPhase1Catalog";
import {
  applyMenuContinuationRoutingOverrides,
  loadPendingMenuSelection,
  menuContinuationHintForChat,
  registerPendingMenuFromAssistant,
  resolveMenuContinuation,
  type MenuContinuationResolution,
} from "@/lib/menuContinuationIntelligence";
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
import { isFocusSanctuaryFullBleed } from "@/lib/focusMyBrain/focusSanctuary";
import {
  companionDeskFullBleed as resolveCompanionDeskFullBleed,
  usesCompanionDesk,
} from "@/lib/companionDesk/workspaceLayout";
import { resolveHomeMode } from "@/lib/homeMode";
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
import { exportAllEvidence, setEvidencePrefill } from "@/lib/evidenceBankStore";
import {
  getEstateCollectionRoom,
  setCollectionPrefill,
  evaluateCollectionSaveOffer,
  collectionOfferForRoom,
  createCollectionPendingOffer,
  recoverCollectionPendingFromAssistant,
  resolveCollectionOfferReply,
  loadCollectionPendingOffer,
  saveCollectionPendingOffer,
  clearCollectionPendingOffer,
  markCollectionOfferCooldown,
  isCollectionOfferCooldownActive,
  isCollectionOfferMessage,
  type EstateCollectionRoomId,
  type EstateCollectionCaptureValues,
} from "@/lib/estate/collectionFramework";
import {
  clearWinSavePending,
  createWinSavePending,
  detectsEncouragementNeed,
  detectsSoftDiscouragement,
  detectsWinSaveRequest,
  EVIDENCE_VAULT_ENCOURAGEMENT_LINE,
  formatWinSaveOfferMessage,
  handleEvidenceCaptureMoment,
  handleWinSaveRequest,
  loadWinSavePending,
  resolveWinSaveReply,
  saveWinSavePending,
} from "@/lib/estate/winSavePending";
import {
  CELEBRATION_GARDEN_INVITE_LINE,
  shouldInviteCelebrationGarden,
} from "@/lib/estate/celebrationGardenIntelligence";
import { detectsWinsTimelineRequest } from "@/lib/estate/winsTimelineIntelligence";
import { runConfidenceRecovery } from "@/lib/estate/confidenceRecoveryEngine";
import { setConfidencePrefill } from "@/lib/confidenceVaultStore";
import { setJourneyPrefill } from "@/lib/myJourneyStore";
import {
  growRoomBackLabel,
  isGrowPanelSection,
  type GrowSectionId,
} from "@/lib/growNavigation";
import {
  growthPanelBackLabel,
  growthRoomBackLabel,
  isGrowthPanelSection,
  type GrowthPanelNav,
  type GrowthSectionId,
} from "@/lib/growthNavigation";
import { isEstateImmersiveRoom, isStandaloneEstateRoomSection, shouldPreserveEstateRoomSectionDuringChat } from "@/lib/estateImmersiveLayout";
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
  exposeEstateOrchestrationShadowToWindow,
  observeEstateOrchestrationShadowTurn,
} from "@/lib/estate/estateOrchestrationDev";
import {
  activeTaskLockHintForChat,
  applyAssistantTaskLockTurn,
  applyEstateTaskLockTurn,
  frictionlessOffersEstateRoom,
  sanitizeAssistantCopyDuringActiveTask,
} from "@/lib/estate/estateTaskLockGate";
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
import {
  formatDailyContextCompanionBlock,
  getDailyContext,
} from "@/lib/dailyContextEngine";
import {
  clearPendingGuidedFieldHelp,
  formatGuidedFieldHelpPrompt,
  readPendingGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import {
  GUIDED_FIELD_HELP_EVENT,
  type GuidedFieldHelpRequest,
} from "@/lib/profile/guidedFieldTypes";
import { openGuidedFieldHelpChat } from "@/lib/profile/openGuidedFieldHelpChat";
import {
  PLAN_DAY_IM_STUCK_EVENT,
  PLAN_DAY_IM_STUCK_QUESTION,
  buildPlanDayImStuckQuestion,
  type PlanDayImStuckDetail,
} from "@/lib/planMyDay/planDayImStuck";
import { readExpertSessionPrompt } from "@/lib/profile/fieldHelpRegistry";
import { readStageTalkThroughPrompt } from "@/lib/profile/guidedStageTalkThrough";
import { readResearchSessionPrompt } from "@/lib/profile/businessEstateResearch";
import { readAdvisoryPrompt } from "@/lib/profile/advisoryHelpContext";
import {
  ADVISORY_INVITE_CHAMBER_EVENT,
  type AdvisoryInviteChamberDetail,
} from "@/lib/profile/advisoryHelpTypes";
import "@/app/companion/guided-field-help-chat.css";
import {
  tonePreferenceOverridesRoutingGuidance,
} from "@/lib/companionTonePreferences";
import {
  formatAssistantParagraphs,
  structureMultiItemResponse,
  toPlainLanguageDisplay,
} from "@/lib/plainLanguageFormatting";
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
import {
  playNotificationSoundForEvent,
  unlockNotificationSounds,
} from "@/lib/notifications/playNotificationSound";
import { buildSavedPatternsPromptHint } from "@/lib/patternAwareness";
import { getActiveSupportStyleId, supportStyleHintForChat } from "@/lib/supportStyle";
import { buildCuriosityBeforeCommandsPromptHint } from "@/lib/curiosityBeforeCommands";
import { adhdStrategyHintForChat } from "@/lib/adhdEverydayStrategies";
import { techFutureHintForChat } from "@/lib/technologyFutureIntelligence";
import {
  annotateTurnDecision,
  applyShariVoiceLayer,
  authorizeBreatheAutoOpen,
  authorizeScenicPlaceMenu,
  beginTurnDecision,
  buildConversationDecision,
  endTurnDecision,
  getActiveTurnDecision,
  isBlockedGenericFallbackText,
  logConversationDecision,
  markActiveTopicAnswered,
  processActiveTopicOnUserTurn,
  processIntentWorkflowOnUserTurn,
  shouldAllowChamberKernelExemption,
  type ProcessActiveTopicTurnResult,
  type ProcessIntentWorkflowTurnResult,
} from "@/lib/conversationStabilization";
import { buildCompanionPageRenderContext } from "@/lib/companionConstitution";
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
  relationshipTrace?: import("@/lib/relationshipResponseTrace").RelationshipResponseUiTrace;
};

function companionPresenceDelay(_skip: boolean) {
  return Promise.resolve();
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
    exposeEstateOrchestrationShadowToWindow();
    initCompanionSession();
  }, []);

  const [activeSection, setActiveSection] = useState<AppSection>("home");
  const [activeNav, setActiveNav] = useState<SidebarNavId>("chat");
  const activeNavRef = useRef<SidebarNavId>("chat");
  activeNavRef.current = activeNav;
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const [directEstateVisit, setDirectEstateVisit] = useState<DirectEstateVisit | null>(
    null,
  );
  const [spinWheelAutoSpin, setSpinWheelAutoSpin] = useState(false);
  const directEstateVisitRef = useRef<DirectEstateVisit | null>(null);
  const syncDirectEstateVisit = useCallback((visit: DirectEstateVisit | null) => {
    directEstateVisitRef.current = visit;
    setDirectEstateVisit(visit);
    if (visit) {
      onEstatePlaceArrived({
        placeId: visit.roomId,
        section: visit.section,
      });
      return;
    }
    // Leaving a room without a new visit — if shell is Welcome Home, clear stale visual_room
    // so pivots like "clear my mind" navigate instead of false already-here.
    // Back to Chat (everyday conversation) must not re-enter welcome-home place sync.
    if (
      activeSectionRef.current === "home" &&
      !preferEverydayConversationRef.current
    ) {
      onEstatePlaceArrived({ placeId: "welcome-home", section: "home" });
    }
  }, []);
  const [workspacePanel, setWorkspacePanelState] = useState<AppSection | null>(
    null,
  );
  const workspacePanelRef = useRef<AppSection | null>(null);
  const routingHandlersRef = useRef<CompanionRoutingHandlers | null>(null);

  function armCreateOpenGuard(source: string, ms = 2000) {
    createOpenGuardRef.current = { until: Date.now() + ms, source };
  }

  function isCreateOpenGuardActive(): boolean {
    const guard = createOpenGuardRef.current;
    if (!guard) return false;
    if (Date.now() > guard.until) {
      createOpenGuardRef.current = null;
      return false;
    }
    return true;
  }

  function publishLiveWorkspaceTrace(
    stage: CreateOpenLiveTraceStage,
    extra?: {
      command?: string;
      matchedHardNav?: boolean;
      hardNavTarget?: string | null;
      createOpenRequest?: boolean | null;
      builderBootstrap?: boolean | null;
      hideWorkspacePanel?: boolean;
      patchBlocked?: boolean;
      patchFrom?: AppSection | null;
      patchTo?: AppSection | null;
      note?: string;
    },
  ) {
    const traceId =
      createOpenTraceRef.current ?? nextCreateOpenTraceId(extra?.command ?? "create");
    createOpenTraceRef.current = traceId;
    const panel = workspacePanelRef.current;
    const workspaceActive = Boolean(
      panel || companionStandaloneSectionRef.current || guideBesideSession,
    );
    publishCreateOpenLiveTrace(
      buildCreateOpenLiveSnapshot({
        traceId,
        stage,
        command: extra?.command,
        matchedHardNav: extra?.matchedHardNav,
        hardNavTarget: extra?.hardNavTarget,
        workspacePanel: panel,
        chatLayoutMode: chatLayoutModeRef.current,
        workspaceActive,
        activeSection: activeSectionRef.current,
        activeNav: activeNavRef.current,
        createOpenRequest: extra?.createOpenRequest,
        builderBootstrap:
          extra?.builderBootstrap ?? createBuilderBootstrappedRef.current,
        hideWorkspacePanel: extra?.hideWorkspacePanel,
        patchBlocked: extra?.patchBlocked,
        patchFrom: extra?.patchFrom,
        patchTo: extra?.patchTo,
        extra: extra?.note,
      }),
    );
  }

  function scheduleLiveWorkspaceTraceDelays(command: string) {
    const build =
      (stage: CreateOpenLiveTraceStage) => (): CreateOpenLiveTraceSnapshot => {
        const traceId =
          createOpenTraceRef.current ?? nextCreateOpenTraceId(command);
        const panel = workspacePanelRef.current;
        return buildCreateOpenLiveSnapshot({
          traceId,
          stage,
          command,
          workspacePanel: panel,
          chatLayoutMode: chatLayoutModeRef.current,
          workspaceActive: Boolean(panel || companionStandaloneSectionRef.current),
          activeSection: activeSectionRef.current,
          activeNav: activeNavRef.current,
          builderBootstrap: createBuilderBootstrappedRef.current,
        });
      };
    scheduleCreateOpenLiveTrace(100, build("after_react_settle_100ms"));
    scheduleCreateOpenLiveTrace(500, build("after_react_settle_500ms"));
  }
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
  const chatLayoutModeRef = useRef<ChatLayoutMode>(DEFAULT_CHAT_LAYOUT_MODE);
  const createOpenTraceRef = useRef<string | null>(null);
  const createOpenGuardRef = useRef<{ until: number; source: string } | null>(
    null,
  );
  const applyChatLayoutMode = useCallback((mode: ChatLayoutMode) => {
    chatLayoutModeRef.current = mode;
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
  const ensureSplitBesideChatLayout = useCallback(() => {
    applyChatLayoutMode("split");
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
  const [homeArrival, setHomeArrival] = useState<ArrivalIntelligence | null>(
    null,
  );
  const [arrivalNavImmersion, setArrivalNavImmersion] = useState(false);
  const [postLoginQuiet, setPostLoginQuiet] = useState(() => {
    if (typeof window === "undefined") return false;
    return isCompanionPostLoginQuiet();
  });
  const [welcomeHomeReplay, setWelcomeHomeReplay] = useState(false);
  const [previewTestRevision, setPreviewTestRevision] = useState(0);
  const previewDiscoveryHistoryStoreRef = useRef(new InMemoryDiscoveryHistoryStore());
  const [welcomeHomeIntroActive, setWelcomeHomeIntroActive] = useState(false);
  /**
   * Back to Chat / Chat nav — everyday conversation shell.
   * Must not open Welcome Home lobby, dark curtain, or room restore fallbacks.
   */
  const [preferEverydayConversation, setPreferEverydayConversation] =
    useState(false);
  const preferEverydayConversationRef = useRef(false);
  preferEverydayConversationRef.current = preferEverydayConversation;

  /**
   * Session overlays: settings / sign-in / whats-new sheets, plus dedicated
   * profile destinations (My Business Estate, People I Help, Growth Profile).
   * Profile destinations render through ProfileDestinationHost (body portal) —
   * not ModalSheet. Declared before welcomeHomePrimary so Welcome Home cannot
   * stay semantically active while a profile destination is open.
   */
  const [overlay, setOverlay] = useState<
    | null
    | "settings"
    | "profile"
    | "people-i-help"
    | "signin"
    | "whats-new"
    | "growth-profile"
    | "institute-cabinet"
  >(null);
  /** Destination Gallery pass-1 prepared crystal (Document / Store / Share / Print / Design). */
  const [destinationCrystalPrepared, setDestinationCrystalPrepared] =
    useState<CrystalActivation | null>(null);
  const [growthProfileEmphasizeTimeline, setGrowthProfileEmphasizeTimeline] =
    useState(false);
  const estateProfilePrimary = overlay === "profile";
  const peopleIHelpProfilePrimary = overlay === "people-i-help";
  const growthProfilePrimary = overlay === "growth-profile";
  const profileDestinationActive =
    estateProfilePrimary ||
    peopleIHelpProfilePrimary ||
    growthProfilePrimary;

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
  const [pendingCommitment, setPendingCommitment] =
    useState<PendingConversationCommitment | null>(null);
  const lastConsumedCommitmentIdRef = useRef<string | null>(null);
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
  const [visibleThinkingContext, setVisibleThinkingContext] =
    useState<VisibleThinkingContext | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
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
  const [peacefulPlacesArrivalActive, setPeacefulPlacesArrivalActive] =
    useState(false);
  const [memoryLibraryTab, setMemoryLibraryTab] =
    useState<MemoryLibraryTab>("all");
  // A time block whose start time has arrived (shows the trigger popup).
  const [triggeredBlock, setTriggeredBlock] = useState<TimeBlock | null>(null);
  // A time block starting in ~15 minutes (shows a gentle heads-up toast).
  const [warning, setWarning] = useState<TimeBlock | null>(null);
  /** In-app notice when a rhythm/reminder chimes — so the sound always has a name. */
  const [deliverableNotice, setDeliverableNotice] = useState<{
    title: string;
    body: string;
    kind: "rhythm" | "reminder";
  } | null>(null);
  const warnedRef = useRef<Set<string>>(new Set());
  const remindedRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseInputRef = useRef("");
  const inputSnapshotRef = useRef("");
  const micExplicitStopRef = useRef(false);
  const handleSendRef = useRef<
    (
      overrideText?: string,
      fresh?: boolean,
      skipToolOffer?: boolean,
      preferChatAnswer?: boolean,
    ) => Promise<void>
  >(async () => {});
  const activeChatTurnLifecycleRef = useRef<ChatTurnState | null>(null);
  /** Increments on every send — in-flight AI turns check this to avoid stale UI locks. */
  const chatRequestGenerationRef = useRef(0);
  const chatRequestAbortRef = useRef<AbortController | null>(null);
  /** Active thread id after New Chat / New Day — never reuse prior conversationId. */
  const activeConversationIdRef = useRef<string | null>(null);
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
  const welcomeHomePrimary =
    activeSection === "home" &&
    !preferEverydayConversation &&
    !workspacePanel &&
    !guideBesideSession &&
    !splitCreateChat &&
    !companionStandaloneSection &&
    !profileDestinationActive &&
    !(
      directEstateVisit &&
      directEstateVisit.section === "home" &&
      /** Welcome Home / Spark Estate entry must never be treated as a visit trap. */
      directEstateVisit.roomId !== "welcome-home" &&
      directEstateVisit.roomId !== "spark-estate"
    );
  const momentumBuilderPrimary =
    isMomentumBuilderRoomSection(activeSection) &&
    !workspacePanel &&
    !guideBesideSession &&
    !splitCreateChat &&
    !companionStandaloneSection;
  const momentumInstitutePrimary =
    isMomentumInstituteSection(activeSection) &&
    !workspacePanel &&
    !guideBesideSession &&
    !splitCreateChat &&
    !companionStandaloneSection;
  const stablesPrimary =
    isStablesSection(activeSection) &&
    !workspacePanel &&
    !guideBesideSession &&
    !splitCreateChat &&
    !companionStandaloneSection;
  const directEstateNavActive = Boolean(directEstateVisit);
  const showDirectEstateOverlay = useMemo(
    () => shouldShowDirectEstateOverlay(activeSection, directEstateVisit),
    [activeSection, directEstateVisit],
  );

  useEffect(() => {
    if (!directEstateVisit) return;
    if (shouldShowDirectEstateVisitOverlay(directEstateVisit, activeSection)) {
      return;
    }
    const pending = loadEstatePendingTransition();
    if (
      pending?.destinationSection === directEstateVisit.section &&
      (!pending.destinationEntryId ||
        pending.destinationEntryId === directEstateVisit.roomId)
    ) {
      return;
    }
    syncDirectEstateVisit(null);
  }, [activeSection, directEstateVisit, syncDirectEstateVisit]);
  const estateChatRoomId = useMemo(
    () => directEstateChatRoomId(activeSection, directEstateVisit),
    [activeSection, directEstateVisit],
  );
  const estateConversationStartedSinceVisit = useMemo(() => {
    if (!directEstateVisit) return false;
    const userCount = messages.filter((m) => m.role === "user").length;
    return userCount > directEstateVisit.userMessageCountAtArrival;
  }, [directEstateVisit, messages]);
  const [instituteInitialDrawerId, setInstituteInitialDrawerId] = useState<
    string | null
  >(null);
  const instituteLearningHintRef = useRef<string | null>(null);
  const stablesLearningHintRef = useRef<string | null>(null);
  const previousMomentumPathIdRef = useRef<string | null>(null);
  const [estateRoomChatVisible, setEstateRoomChatVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return getExperienceControlPrefs().conversationVisibility !== "hidden";
  });
  const [experienceControlsOpen, setExperienceControlsOpen] = useState(false);
  const [soundscapeSelectionOpen, setSoundscapeSelectionOpen] = useState(false);
  useEffect(() => {
    applyExperienceControlPresentation(getExperienceControlPrefs());
  }, []);
  const [guidedFieldHelpChatOpen, setGuidedFieldHelpChatOpen] = useState(false);
  const [activeChamberMemberId, setActiveChamberMemberId] =
    useState<ChamberMemberId | null>(null);
  const activeChamberMemberIdRef = useRef<ChamberMemberId | null>(null);
  activeChamberMemberIdRef.current = activeChamberMemberId;
  /** CB-022 — result of processActiveTopicOnUserTurn for the in-flight send. */
  const activeTopicTurnRef = useRef<ProcessActiveTopicTurnResult | null>(null);
  /** CB-022 addendum — intent / workflow resume gate for the in-flight send. */
  const intentWorkflowTurnRef = useRef<ProcessIntentWorkflowTurnResult | null>(
    null,
  );
  /** Message index before the current Chamber member thread began. */
  const chamberThreadStartIndexRef = useRef<number | null>(null);
  const previousSectionForChamberRef = useRef<AppSection | null>(null);
  const [boardroomShariChatOpen, setBoardroomShariChatOpen] = useState(false);
  /** Remount Boardroom on each open so stale subviews cannot hijack home. */
  const [boardroomEntryKey, setBoardroomEntryKey] = useState(0);
  const [boardroomEntryIntent, setBoardroomEntryIntent] =
    useState<BoardroomEntryIntent>("home");
  const [evidenceVaultArrivalKey, setEvidenceVaultArrivalKey] = useState(0);
  const momentumBuilderRoomExperience = useMemo(() => {
    if (!momentumBuilderPrimary) return null;
    return resolveMomentumBuilderRoomState({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      previousPathId: previousMomentumPathIdRef.current,
    });
  }, [momentumBuilderPrimary, messages]);

  useEffect(() => {
    if (!momentumBuilderPrimary) {
      previousMomentumPathIdRef.current = null;
      return;
    }
    const path = momentumBuilderRoomExperience?.todaysPath;
    if (!path?.id) return;

    const prev = previousMomentumPathIdRef.current;
    if (prev !== path.id) {
      if (!prev) {
        recordMomentumPathMilestone({
          id: `path-${path.id}`,
          milestoneKind: "meaningful_forward_motion",
          label: path.headline,
          recordedAt: new Date().toISOString(),
          todaysPathId: path.id,
        });
      }
      previousMomentumPathIdRef.current = path.id;
    }
  }, [momentumBuilderPrimary, momentumBuilderRoomExperience?.todaysPath]);

  // Restore sticky Chamber member only when already inside the Chamber.
  // Never rehydrate an active member into Plan My Day / Projects / etc.
  useEffect(() => {
    if (activeSection !== "chamber-of-momentum") return;
    const stored = readActiveChamberMember();
    if (stored?.id) {
      setActiveChamberMemberId(stored.id);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "growth-journal") {
      setEstateRoomChatVisible(false);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "evidence-bank") {
      setEstateRoomChatVisible(false);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "chamber-of-momentum") return;
    if (activeChamberMemberId) {
      setEstateRoomChatVisible(true);
    }
  }, [activeSection, activeChamberMemberId]);

  useEffect(() => {
    if (activeSection === "boardroom") return;
    setBoardroomShariChatOpen(false);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "chamber-of-momentum") return;
    const assessment = consumeChamberIntelligence();
    if (assessment) {
      routeChamberIntelligenceCore(assessment);
      return;
    }
    const pendingIntent = consumeChamberMomentumIntent();
    if (!pendingIntent) return;
    routeChamberMomentumIntentCore(pendingIntent);
  }, [activeSection]);

  const intelligenceIdle = isIdle && !workspaceActiveBeside;
  const homeCalm =
    activeSection === "home" &&
    isIdle &&
    !preferEverydayConversation &&
    !splitCreateChat &&
    !workspaceActiveBeside &&
    !welcomeHomePrimary;
  const effectiveHomeArrival = useMemo(() => {
    if (!homeCalm) return null;
    return homeArrival ?? evaluateArrivalIntelligence({ record: false });
  }, [homeCalm, homeArrival]);

  const welcomeHomeExperience = useMemo(
    () => {
      const previewLaunch = getCompanionPreviewTestLaunch();
      if (previewLaunch?.target === "welcome-home") {
        return evaluateWelcomeHomeExperience({
          hasSeenWelcomeIntro: false,
          replayRequested: true,
          isRepeatLogin: false,
        });
      }
      const authIntel = getCompanionAuthIntelligence();
      const isRepeatLogin = authIntel.loginCount > 1;
      return evaluateWelcomeHomeExperience({
        hasSeenWelcomeIntro: hasSeenWelcomeIntro(),
        replayRequested: welcomeHomeReplay,
        isRepeatLogin,
      });
    },
    [welcomeHomeReplay, hydrated, previewTestRevision],
  );

  useEffect(() => {
    if (!armCompanionPreviewTestHarnessFromQuery()) return;
    setPreviewTestRevision(getCompanionPreviewTestRevision());
  }, []);

  useEffect(() => {
    if (!isCompanionPreviewTestHarnessArmed()) return;
    const onStorage = () => setPreviewTestRevision(getCompanionPreviewTestRevision());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // First-login completion is account-backed via FirstLoginWelcomeGate
  // (welcome_completed_at). Do not auto-skip from device loginCount.

  const welcomeHomeGreeting =
    welcomeHomeExperience.greeting ??
    (welcomeHomeExperience.visitorKind === "returning"
      ? resolveWelcomeHomeChatPrompt(
          homeArrival ?? evaluateArrivalIntelligence({ record: false }),
        )
      : null);

  const welcomeHomeDaily = useMemo(() => {
    const arrival =
      homeArrival ??
      (welcomeHomePrimary
        ? evaluateArrivalIntelligence({ record: false })
        : null);
    return resolveWelcomeHomeDailyChoices({
      arrival,
      experienceVisitorKind: welcomeHomeExperience.visitorKind,
      hasSeenWelcomeIntro: hasSeenWelcomeIntro(),
      continueResolution: arrival?.continue ?? resolveCompanionContinue(),
      existingGreeting: welcomeHomeGreeting,
    });
  }, [
    homeArrival,
    welcomeHomePrimary,
    welcomeHomeExperience.visitorKind,
    welcomeHomeGreeting,
    hydrated,
  ]);

  const welcomeHomeDisplayMessageRaw =
    welcomeHomeDaily.preferredWelcomeMessage ?? welcomeHomeGreeting;
  /** Never surface retired plain-text openings as Welcome Home chat copy. */
  const welcomeHomeDisplayMessage =
    welcomeHomeDisplayMessageRaw &&
    !isSupersededWelcomeHomeGreeting(welcomeHomeDisplayMessageRaw)
      ? welcomeHomeDisplayMessageRaw
      : null;

  const [welcomeHomeDiscoveryReady, setWelcomeHomeDiscoveryReady] =
    useState(false);

  useEffect(() => {
    if (!hydrated || !welcomeHomePrimary) {
      setWelcomeHomeDiscoveryReady(false);
      return;
    }
    if (welcomeHomeExperience.showIntro) {
      setWelcomeHomeDiscoveryReady(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setWelcomeHomeDiscoveryReady(true);
    }, WELCOME_HOME_DISCOVERY_KEY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    welcomeHomePrimary,
    welcomeHomeExperience.showIntro,
  ]);

  const welcomeScene = false;
  const visibleThinkingMessage = useVisibleThinking(
    isLoading && !homeCalm,
    visibleThinkingContext,
  );

  useEffect(() => {
    if (!homeCalm && !welcomeHomePrimary) {
      setHomeArrival(null);
      setArrivalNavImmersion(false);
      return;
    }
    if (welcomeHomePrimary) {
      if (isCompanionPostLoginQuiet()) {
        setPostLoginQuiet(true);
      } else {
        setPostLoginQuiet(false);
      }
      incrementHomeVisitCount();
      setHomeArrival(evaluateArrivalIntelligence({ record: true }));
      return;
    }
  }, [homeCalm, welcomeHomePrimary]);

  useEffect(() => {
    if (!hydrated || !welcomeHomePrimary) {
      setWelcomeHomeReplay(false);
      return;
    }
    if (peekWelcomeHomeReplayRequested()) {
      clearWelcomeHomeReplayRequest();
      setWelcomeHomeReplay(true);
      return;
    }
    setWelcomeHomeReplay(false);
  }, [hydrated, welcomeHomePrimary]);

  useEffect(() => {
    if (!hydrated) return;
    const onReplay = () => {
      if (welcomeHomePrimary) {
        setWelcomeHomeReplay(true);
      }
    };
    window.addEventListener(WELCOME_HOME_REPLAY_EVENT, onReplay);
    return () =>
      window.removeEventListener(WELCOME_HOME_REPLAY_EVENT, onReplay);
  }, [hydrated, welcomeHomePrimary]);

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

  const firstUserMessage = messages.find((m) => m.role === "user")?.content;
  const constitutionalRenderContext = useMemo(
    () =>
      buildCompanionPageRenderContext({
        activeSection,
        workspacePanel,
        workspaceBesideChat:
          chatLayoutMode === "split" && Boolean(workspacePanel),
        displayEmotion,
        firstUserMessage,
        messageCount: messages.length,
        arrivalActive: welcomeScene,
      }),
    [
      activeSection,
      workspacePanel,
      chatLayoutMode,
      displayEmotion,
      firstUserMessage,
      messages.length,
      welcomeScene,
    ],
  );
  const { scenePage, sceneSeed, clearMyMind, suppress: suppressGlobalBackground } =
    constitutionalRenderContext.globalBackground;

  // If Help was open across refresh, reopen a fresh help thread — never yesterday's chat.
  useEffect(() => {
    if (!isContextualHelpSessionActive()) return;
    const recovered = recoverContextualHelpSessionAfterRefresh();
    if (!recovered) return;
    activeConversationIdRef.current = recovered.helpConversationId;
    setMessages([]);
    setGuidedFieldHelpChatOpen(true);
  }, []);

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
        // Estate-first: restore strategy state but do not cold-open split workspace.
        if (strategySnap.workspacePanelOpen) {
          saveStrategyApplySession(toStrategyApplySession(strategySnap), {
            workspacePanelOpen: false,
          });
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
    // Global — every section change updates live shell place (clears stale rooms).
    // Back to Chat must not sync welcome-home (that triggers lobby / dark curtain).
    if (!directEstateVisitRef.current) {
      if (activeSection === "home") {
        if (!preferEverydayConversationRef.current) {
          onEstatePlaceArrived({ placeId: "welcome-home", section: "home" });
        }
      } else {
        onEstateSectionChanged(activeSection);
      }
    }
  }, [activeSection]);

  // Keep live shell in sync even when section did not "change" (fresh load /
  // Welcome Home / tool screens with stale sessionStorage).
  useEffect(() => {
    if (directEstateVisitRef.current) return;
    if (preferEverydayConversation) return;
    if (welcomeHomePrimary || activeSection === "home") {
      onEstatePlaceArrived({ placeId: "welcome-home", section: "home" });
      return;
    }
    onEstateSectionChanged(activeSection);
  }, [welcomeHomePrimary, activeSection, preferEverydayConversation]);

  // Help Me Right Now is retired — legacy links land on Focus instead.
  useEffect(() => {
    if (activeSection !== "activities") return;
    setActivitySession(EMPTY_ACTIVITY_SESSION);
    setActiveSection("focus");
    activeSectionRef.current = "focus";
    setActiveNav("focus");
  }, [activeSection]);

  /**
   * Breathe Universal Access destination — not a room.
   * Temporarily replaces the current scene; prior workspace stays mounted.
   */
  const [breatheDestination, setBreatheDestination] =
    useState<BreatheDestinationState>(EMPTY_BREATHE_DESTINATION);
  const [breatheResumeActive, setBreatheResumeActive] = useState(false);
  const breathePausedTimerRef = useRef(false);
  const breatheTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const breatheResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [estateGuideFlipbookOpen, setEstateGuideFlipbookOpen] = useState(false);
  const [justBeHereSession, setJustBeHereSession] =
    useState<JustBeHereSession | null>(null);
  const [justBeHerePhase, setJustBeHerePhase] = useState<
    "entering" | "active" | null
  >(null);
  const [justBeHereChatVisible, setJustBeHereChatVisible] = useState(false);
  const [justBeHereSoundEnabled, setJustBeHereSoundEnabled] = useState(false);
  const justBeHereEnterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const profileEstateRoomOverlayId = useMemo((): ProfileEstateRoomId | null => {
    if (estateProfilePrimary) return "my-estate";
    if (growthProfilePrimary) return "growth-profile";
    if (showDirectEstateOverlay && isProfileEstateRoomId(estateChatRoomId)) {
      return estateChatRoomId;
    }
    if (
      directEstateVisit &&
      isProfileEstateRoomId(directEstateVisit.roomId) &&
      activeSection === profileEstateSectionForRoom(directEstateVisit.roomId) &&
      !isDedicatedEstateRoomPanelSection(activeSection)
    ) {
      return directEstateVisit.roomId;
    }
    return null;
  }, [
    estateProfilePrimary,
    growthProfilePrimary,
    showDirectEstateOverlay,
    estateChatRoomId,
    directEstateVisit,
    activeSection,
  ]);
  const profileEstateChromeActive =
    Boolean(profileEstateRoomOverlayId) || peopleIHelpProfilePrimary;
  const [planMyDayDrawerOpen, setPlanMyDayDrawerOpen] = useState(false);
  const [planAdaptSharedChild, setPlanAdaptSharedChild] = useState<
    "plan" | "adapt" | null
  >(null);
  const [remindersRhythmsSharedChild, setRemindersRhythmsSharedChild] =
    useState<"reminders" | "rhythms" | null>(null);
  const [planMyDayOpenItemId, setPlanMyDayOpenItemId] = useState<string | null>(
    null,
  );
  const [planMyDayInitialArea, setPlanMyDayInitialArea] =
    useState<PlanningCenterArea | null>(null);
  const [planMyDayInitialRhythmsTab, setPlanMyDayInitialRhythmsTab] = useState<
    "today" | "all" | "reminders" | null
  >(null);
  const [freshStartDialog, setFreshStartDialog] =
    useState<FreshStartKind | null>(null);
  const [freshStartRevision, setFreshStartRevision] = useState(0);
  /** Global Daily Companion Experience — shared three-choice opening. */
  const [globalDailyOpening, setGlobalDailyOpening] =
    useState<GlobalDailyOpeningResult | null>(null);
  const [dailyOpeningHelpMeChoose, setDailyOpeningHelpMeChoose] = useState<
    | null
    | { step: "needs" }
    | {
        step: "support";
        needId: HelpMeChooseNeedId;
        prompt: string;
        options: HelpMeChooseSupportOption[];
      }
  >(null);
  const [dailyOpeningHelpfulLesson, setDailyOpeningHelpfulLesson] =
    useState<HelpfulLessonOffer | null>(null);
  const [dailyOpeningAdaptCheckIn, setDailyOpeningAdaptCheckIn] =
    useState(false);
  const dailyOpeningStartedRef = useRef(false);
  const [pendingDailyOpeningEntry, setPendingDailyOpeningEntry] =
    useState<DailyOpeningEntryPoint | null>(null);
  const estateChatScrollKey = `${freshStartRevision}-${messages.length}-${isLoading ? 1 : 0}`;

  // Strip retired plain-text daily openings from chat history (keep real talk).
  useEffect(() => {
    if (!hydrated) return;
    setMessages((prev) => {
      const next = filterLegacyDailyOpeningMessages(prev);
      return next.length === prev.length ? prev : next;
    });
  }, [hydrated, messages]);

  // Today's Welcome Card — always present on quiet Welcome Home arrival.
  // First-of-day / absence → full New Day reset. Otherwise soft-present the card
  // (fixes empty local UI when the calendar day was already marked in localStorage).
  useEffect(() => {
    if (!hydrated || !welcomeHomePrimary) return;
    if (welcomeHomeExperience.showIntro) return;
    if (dailyOpeningStartedRef.current) return;
    if (globalDailyOpening) return;
    if (isTodaysWelcomeDismissedThisSession()) return;

    const arrival =
      homeArrival ?? evaluateArrivalIntelligence({ record: false });
    const absence = isAbsenceReturn(arrival?.returnIntervalDays);
    const firstOfDay = shouldOfferFirstPlatformOpeningOfDay();

    // Fresh day / absence: reset conversation and show the card.
    if (firstOfDay || absence) {
      dailyOpeningStartedRef.current = true;
      setPendingDailyOpeningEntry(
        absence ? "absence-return" : "first-platform-opening",
      );
      return;
    }

    // Day already marked — still show the card once on a quiet Welcome Home
    // without wiping the conversation id again. A leftover assistant greeting
    // must not block the card (that was the empty local UI).
    const hasUserMessage = messages.some((m) => m.role === "user");
    if (hasUserMessage) return;

    dailyOpeningStartedRef.current = true;
    const opening = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    setGlobalDailyOpening(opening);
    setDailyOpeningHelpMeChoose(null);
    setDailyOpeningHelpfulLesson(null);
    setDailyOpeningAdaptCheckIn(false);
    setMessages([]);
    markDailyOpeningPresented();
  }, [
    hydrated,
    welcomeHomePrimary,
    welcomeHomeExperience.showIntro,
    homeArrival,
    globalDailyOpening,
    messages,
  ]);

  /** Never fall back to plain-text opening while Welcome Home is quiet. */
  const welcomeHomeQuietForDailyOpening =
    welcomeHomePrimary &&
    !welcomeHomeExperience.showIntro &&
    !isTodaysWelcomeDismissedThisSession() &&
    !messages.some((m) => m.role === "user");

  const todaysWelcomeOpening = useMemo(() => {
    if (globalDailyOpening) return globalDailyOpening;
    if (!welcomeHomeQuietForDailyOpening) return null;
    return resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" });
  }, [globalDailyOpening, welcomeHomeQuietForDailyOpening]);

  const welcomeHomeVisibleMessages = useMemo(
    () => filterLegacyDailyOpeningMessages(messages),
    [messages],
  );

  const estateChatInputFocusEnabled =
    hydrated &&
    overlay !== "signin" &&
    !freshStartDialog &&
    !triggeredBlock &&
    !welcomeHomeIntroActive;

  const estateNavigationFocusKey = [
    activeSection,
    workspacePanel ?? "",
    directEstateVisit?.roomId ?? "",
    directEstateVisit?.section ?? "",
  ].join("|");

  const { requestChatInputFocus } = useEstateChatInputFocus({
    inputRef,
    enabled: estateChatInputFocusEnabled,
    hydrated,
    isLoading,
    activeSection,
    workspacePanel,
    overlay,
    freshStartDialog,
    freshStartRevision,
    estateNavigationKey: estateNavigationFocusKey,
  });

  useEffect(() => {
    return subscribeSparkCardAskCompanion(() => {
      const request = consumeSparkCardAskCompanion();
      if (!request) return;
      setEstateRoomChatVisible(true);
      requestChatInputFocus({ scrollIntoView: true });
      void handleSendRef.current(request.prompt, false, true);
    });
  }, [requestChatInputFocus]);

  const [activityReturnLabel, setActivityReturnLabel] = useState<string | null>(
    null,
  );
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection | null>(null);
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
  const { configured: authConfigured, user, signOut } = useCompanionAuth();

  useEffect(() => {
    setPlanDayOwnerUserId(user?.id ?? null);
  }, [user?.id]);

  const openSignIn = useCallback(() => {
    if (isCompanionAuthBypassed()) return;
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
    if (isCreateOpenGuardActive()) return;
    workspacePanelRef.current = null;
    setWorkspacePanelState(null);
    setCompanionStandaloneSection(null);
    setGuideBesideSession(null);
    workspaceCoachSeededRef.current = null;
    applyChatLayoutMode("workspace-focus");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phase1 reset runs once on mount only
  }, []);

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
  const [momentumBuilderArrivalActive, setMomentumBuilderArrivalActive] =
    useState(false);
  const [welcomeHomeEstateMapVisible, setWelcomeHomeEstateMapVisible] =
    useState(false);
  /** Approved visual Explore Spark Estate map (image cards). */
  const [exploreSparkMapOpen, setExploreSparkMapOpen] = useState(false);
  const [exploreEstateReturnAvailable, setExploreEstateReturnAvailable] =
    useState(false);
  /** When true, next Welcome Home primary render should show lobby signposts. */
  const pendingWelcomeHomeLobbyRevealRef = useRef(false);

  useEffect(() => {
    if (!welcomeHomePrimary) {
      if (!pendingWelcomeHomeLobbyRevealRef.current) {
        setWelcomeHomeEstateMapVisible(false);
      }
      return;
    }
    if (pendingWelcomeHomeLobbyRevealRef.current) {
      pendingWelcomeHomeLobbyRevealRef.current = false;
      setWelcomeHomeEstateMapVisible(true);
    }
  }, [welcomeHomePrimary]);

  useEffect(() => {
    if (!momentumBuilderPrimary) {
      setMomentumBuilderArrivalActive(false);
    }
  }, [momentumBuilderPrimary]);

  useEffect(() => {
    if (activeSection === "brain-dump") return;
    if (isClearMyMindModeActive()) {
      /**
       * Mode is still on but the panel unmounted (stale navigation).
       * Restore the Clear My Mind workspace — never leave frosted estate chat.
       */
      openClearMyMindCore({ silent: true });
      return;
    }
    setEstateConservatoryEngaged(false);
  }, [activeSection]);

  const [pendingCreateOpen, setPendingCreateOpen] =
    useState<PendingCreateOpenPayload | null>(null);
  const [pendingConversationHandoff, setPendingConversationHandoff] =
    useState<ConversationArtifact | null>(null);
  const [pendingAcceptanceRecord, setPendingAcceptanceRecord] =
    useState<PendingAcceptanceRecord | null>(null);
  const chatTurnRef = useRef(0);
  const activePrimaryTurnRef = useRef<PrimaryTurnDecision | null>(null);
  const awaitingUserConfirmationRef = useRef<AwaitingUserConfirmationState | null>(
    null,
  );
  const [chatAwaitingConfirmation, setChatAwaitingConfirmation] = useState(false);
  const declinedConversationOffersRef = useRef<Set<string>>(new Set());
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
  /**
   * Cancels in-flight openStandaloneFocusSectionCore work when a newer
   * navigation (especially Return to Estate → Welcome Home) wins.
   */
  const estateSectionNavEpochRef = useRef(0);
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
  const patchWorkspacePanel = useCallback((
    next: AppSection | null,
    options?: { userInitiated?: boolean },
  ) => {
    const prev = workspacePanelRef.current;
    if (!next && isCreateOpenGuardActive()) {
      publishLiveWorkspaceTrace("after_patch_workspace_panel", {
        patchBlocked: true,
        patchFrom: prev,
        patchTo: next,
        note: `blocked null patch — guard ${createOpenGuardRef.current?.source}`,
      });
      dbgWorkspace("setWorkspacePanel blocked — create open guard", { from: prev });
      return;
    }
    if (next && shouldBlockWorkspaceOpenForPhase1(options)) {
      publishLiveWorkspaceTrace("after_patch_workspace_panel", {
        patchBlocked: true,
        patchFrom: prev,
        patchTo: next,
        note: "blocked phase1 without userInitiated",
      });
      dbgWorkspace("setWorkspacePanel blocked — phase1 onboarding", { to: next });
      return;
    }
    workspacePanelRef.current = next;
    setWorkspacePanelState((prevState) => {
      if (prevState === next) return prevState;
      dbgWorkspace("setWorkspacePanel", { from: prevState, to: next });
      const resource = resourcePreferenceFromAppSection(next);
      if (resource) {
        observeResourcePreference({ resource, outcome: "opened" });
      }
      return next;
    });
    publishLiveWorkspaceTrace("after_patch_workspace_panel", {
      patchFrom: prev,
      patchTo: next,
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
          ? (() => {
              markWorkspaceFacilitationActive(type);
              const boot = bootstrapWorkspaceV2Session(type);
              const paused = getActiveArtifact();
              const greeting =
                paused?.status === "paused" || paused?.status === "saved"
                  ? `${buildArtifactReturnGreeting(paused)}\n\n${facilitationOpenerForWorkspace(type)}`
                  : facilitationOpenerForWorkspace(type);
              return { ...boot, opener: greeting };
            })()
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
      requestChatInputFocus();
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
    if (consumeEstateTransitionPreserveChat()) {
      workspaceChatScopeRef.current = scope;
      const pending = loadEstatePendingTransition();
      const arrival =
        pending && pending.destinationSection === scope.section
          ? buildEstateArrivalContinuation(pending)
          : estateRoomArrivalContinuationLine(
              scope.section.replace(/-/g, " "),
            );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: arrival,
        },
      ]);
      clearEstatePendingTransition();
      workspaceCoachSeededRef.current = null;
      setProjectCoachSession(null);
      setProjectCoachTopicPickerVisible(false);
      createBuilderBootstrappedRef.current = false;
      return;
    }
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
  const [brainDumpInitialView, setBrainDumpInitialView] =
    useState<ClearMyMindPanelView>("capture");
  const [brainDumpPanelKey, setBrainDumpPanelKey] = useState(0);
  const [estateConservatoryEngaged, setEstateConservatoryEngaged] = useState(false);
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

  useEffect(() => {
    if (!workspacePanel) return;
    publishLiveWorkspaceTrace("workspace_layout_render", {
      note: `panel=${workspacePanel} layout=${chatLayoutMode}`,
    });
  }, [workspacePanel, chatLayoutMode, workspaceRevealSeq]);

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
    const scroller =
      bottomRef.current?.closest(
        ".companion-homestead-chat__reading",
      ) ??
      document.querySelector(".companion-homestead-chat__reading");
    if (scroller instanceof HTMLElement) {
      scrollConversationToLatestExchange(scroller, { behavior: "smooth" });
    }
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
          "We can pick up from wherever you are — continue your **Quick Two Option Choice**.",
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

  function focusChatInput() {
    requestChatInputFocus({ scrollIntoView: true, preventScroll: false });
  }

  function handleCompanionContinueOption(option: CompanionContinueOption) {
    recordArrivalFirstAction(`continue:${option.kind}`);
    switch (option.kind) {
      case "conversation":
        if (option.conversationCue) {
          setMessages([{ role: "assistant", content: option.conversationCue }]);
        }
        focusChatInput();
        return;
      case "plan-my-day": {
        const session = getDayDesignerSession();
        if (
          session &&
          session.step !== "complete" &&
          session.step !== "idle"
        ) {
          const q = questionForStep(session.step);
          setDayDesignerSession(session);
          setDayDesignerQuestion(q);
          setMessages([
            {
              role: "assistant",
              content: `${companionIntroForDayDesigner()} ${q}`,
            },
          ]);
        } else {
          openPlanMyDayCore();
        }
        return;
      }
      default:
        if (option.homeResumeItem) {
          resumeHomeItem(option.homeResumeItem);
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
    if (isWelcomeHomeIntroAudioBlocked()) return;
    // Voice is metered per plan. Out of minutes → don't spend the API call.
    const vs = getVoiceStatus();
    if (!vs.hasVoice || vs.leftMin <= 0) {
      setVoiceOutput(false);
      setVoiceBlocked(true);
      return;
    }
    try {
      ttsAudioRef.current?.pause();
      setIsTtsSpeaking(false);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      markChatAssistantAudioElement(audio);
      ttsAudioRef.current = audio;
      audio.onplay = () => setIsTtsSpeaking(true);
      audio.onended = () => {
        setIsTtsSpeaking(false);
        addVoiceSeconds(audio.duration || 0);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setIsTtsSpeaking(false);
      audio.onpause = () => {
        if (audio.ended || audio.paused) setIsTtsSpeaking(false);
      };
      void audio.play().then(() => setIsTtsSpeaking(true)).catch(() => {
        setIsTtsSpeaking(false);
      });
    } catch {
      setIsTtsSpeaking(false);
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

  /**
   * Block legacy split Create / Projects opens. Returns true when handled
   * (caller must not continue into old Chat + Workspace layout).
   */
  function redirectLegacyCreateWorkspaceIfNeeded(
    section: AppSection,
    opts?: { userText?: string | null; itemType?: string | null },
  ): boolean {
    const decision = resolveLegacyCreateWorkspaceGuard({
      section,
      userText: opts?.userText ?? lastUserTextRef.current,
      itemType: opts?.itemType,
      alreadyOpen:
        section === "content-generator" &&
        workspacePanelRef.current === "content-generator",
    });
    if (decision.kind === "allow") return false;
    if (decision.kind === "project_homes") {
      openProjectHomesPrototypeCore();
      return true;
    }
    if (decision.kind === "cartographers_studio") {
      openCartographersStudioCore();
      return true;
    }
    postCreateTransparencyMessage(
      decision.message || CREATE_ROOM_PREPARED_STATE_MESSAGE,
    );
    return true;
  }

  type CreateOpenMeta = {
    source?: CreateOpenSource;
    userInitiated?: boolean;
    userText?: string;
    consentGranted?: boolean;
    workspaceConsentGranted?: boolean;
    skipConsentCheck?: boolean;
    skipWorkspaceChatReset?: boolean;
    conversationHandoff?: boolean;
    artifact?: import("@/lib/createInitialization").ResolvedArtifact;
  };

  function mapCreateSourceToRoute(
    source: CreateOpenSource | undefined,
  ): import("@/lib/companionRoutingExecutor").RouteSource {
    switch (source) {
      case "ui_nav":
      case "ui_button":
      case "hard_nav":
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
      userInitiated?: boolean;
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
      preloadRoomBackground(CREATIVE_STUDIO_ROOM_BG);
    }

    setCreationContext((prev) => (creationContextEqual(prev, ctx) ? prev : ctx));
    setWorkspaceOffer(null);
    setToolSuggestion(null);
    setActionBridge(null);
    setActiveSection("home");
    activeSectionRef.current = "home";

    if (section === "content-generator") {
      setGenSeed((prev) => (genSeedEqual(prev, nextSeed) ? prev : nextSeed));
      patchWorkspacePanel("content-generator", {
        userInitiated: opts?.userInitiated,
      });
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
      (opts?.userInitiated ||
        isCreateWorkspaceV2Phase(
          createPanelWorkflowRef.current,
          createBuilderSessionRef.current?.phase ?? null,
        ))
    ) {
      applyChatLayoutMode("split");
    } else if (section === "content-generator") {
      focusWorkspaceLayout();
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
    if (
      redirectLegacyCreateWorkspaceIfNeeded(section, {
        userText: meta?.userText ?? lastUserTextRef.current,
        itemType: input.itemType,
      })
    ) {
      return false;
    }
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
      workspaceConsentGranted: meta?.workspaceConsentGranted,
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

    executeCreateOpenInternal(section, input, {
      ...opts,
      silent: true,
      userInitiated: meta?.userInitiated,
    });

    if (decision.action !== "open") return false;

    const receipt =
      opts?.ackMessage ??
      createReceiptMessage(decision.receipt, { itemType: input.itemType });
    if (meta?.conversationHandoff) {
      beginWorkspaceChat(
        { section: "content-generator" },
        `${receipt}\n\n${buildRecoveryOfferLine()}`,
      );
    } else if (meta?.skipWorkspaceChatReset) {
      if (!opts?.silent && opts?.ackMessage) {
        postCreateTransparencyMessage(opts.ackMessage);
      }
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
    // Facilitated creation — do not auto-open split workspace with scaffold.
    ensureFacilitatedSessionFromText(userText);
    return false;
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
    if (
      !meta?.skipConsentCheck &&
      !meta?.consentGranted &&
      draftPermissionBlocked(
        lastUserTextRef.current,
        buildCreateOpenContext().lastAssistantText,
      )
    ) {
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
    if (
      redirectLegacyCreateWorkspaceIfNeeded("content-generator", {
        userText: meta?.userText ?? lastUserTextRef.current,
        itemType: artifact.itemType,
      })
    ) {
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
  // Interceptors must not call goBack/onBack — that re-enters and stack-overflows.
  const backInterceptorRef = useRef<(() => boolean) | null>(null);
  const goBackDepthRef = useRef(0);
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

  /**
   * Back to Chat / Chat nav — return to the active conversation shell.
   * Not Back to Estate: never Welcome Home lobby, dark curtain, or room restore.
   * Clear My Mind thoughts stay paused in session storage until explicit discard.
   */
  function navigateToChatCore() {
    const intent = CHAT_NAVIGATION_INTENT;
    backInterceptorRef.current = null;
    goingBackRef.current = false;
    clearJustBeHereMode();

    // Exit Clear My Mind mode flag so the remount-guard does not reopen the panel.
    // Session thoughts remain in pauseClearMyMindSession storage.
    if (isClearMyMindModeActive() || activeSectionRef.current === "brain-dump") {
      exitClearMyMindMode();
    }

    setBreatheDestination(EMPTY_BREATHE_DESTINATION);
    if (breatheTransitionTimerRef.current) {
      clearTimeout(breatheTransitionTimerRef.current);
      breatheTransitionTimerRef.current = null;
    }
    if (breatheResumeTimerRef.current) {
      clearTimeout(breatheResumeTimerRef.current);
      breatheResumeTimerRef.current = null;
    }
    setBreatheResumeActive(false);
    breathePausedTimerRef.current = false;
    syncDirectEstateVisit(null);
    void stopAllEstateEnvironmentalAudio();
    clearEstatePendingTransition();
    setEstateConservatoryEngaged(false);

    if (intent.dismissOverlay && overlay) {
      setOverlay(null);
      setSettingsSection(null);
    }
    if (planMyDayDrawerOpen) setPlanMyDayDrawerOpen(false);

    setPreferEverydayConversation(true);
    preferEverydayConversationRef.current = true;
    setWelcomeHomeReplay(false);
    setWelcomeHomeIntroActive(false);
    setWelcomeHomeEstateMapVisible(false);
    pendingWelcomeHomeLobbyRevealRef.current = false;

    if (intent.clearArrivalImmersion) {
      setArrivalNavImmersion(false);
    }
    if (intent.restoreSplitLayout) {
      applyChatLayoutMode("split");
      setWorkspaceFirstSplit(false);
    }

    // Skip companionReturnSection / guide-return — those reopen Momentum/rooms.
    companionReturnSectionRef.current = null;
    closeWorkspacePanel({
      mode: "hide",
      silent: true,
      skipSectionRestore: intent.skipSectionRestore,
    });

    if (intent.resetPanelBackStack) {
      panelBackStackRef.current = [];
      setWorkspacePanelBackLabel(null);
    }

    setActiveSection(intent.activeSection);
    activeSectionRef.current = intent.activeSection;
    setActiveNav(intent.activeNav);
    setPlanMyDayOpenItemId(null);
    // Do NOT onEstatePlaceArrived(welcome-home) — that is Back to Estate only.

    requestAnimationFrame(() => {
      requestChatInputFocus({ preventScroll: true });
    });
  }

  function goBackToChat() {
    navigateToChatCore();
  }

  function goBack(options?: { skipInterceptor?: boolean }) {
    const skipInterceptor =
      Boolean(options?.skipInterceptor) || goBackDepthRef.current > 0;
    goBackDepthRef.current += 1;
    try {
      if (!skipInterceptor && backInterceptorRef.current?.()) return;

      goBackAfterInterceptor();
    } finally {
      goBackDepthRef.current -= 1;
    }
  }

  function goBackAfterInterceptor() {
    if (isBreatheDestinationActive(breatheDestination)) {
      closeBreatheOverlayCore({ resume: true });
      return;
    }

    if (overlay === "people-i-help") {
      setOverlay(null);
      return;
    }

    if (overlay) {
      setOverlay(null);
      setSettingsSection(null);
      return;
    }

    if (planMyDayDrawerOpen) {
      setPlanMyDayDrawerOpen(false);
      return;
    }

    /**
     * "Back To Estate" must open Welcome Home lobby + welcome-home photograph.
     * Plain history restore leaves the previous room plate (often Library).
     */
    if (isEstateHomeDestination(workspacePanelBackLabel)) {
      navigateBackToEstateHome();
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
    if (prev === "home") {
      navigateBackToEstateHome();
      return;
    }
    goingBackRef.current = true;
    setActiveSection(prev);
  }

  // Unlock the chime on first interaction (browsers block audio otherwise).
  useEffect(() => {
    const unlock = () => unlockChime();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    return () => {
      if (breatheTransitionTimerRef.current) {
        clearTimeout(breatheTransitionTimerRef.current);
      }
      if (breatheResumeTimerRef.current) {
        clearTimeout(breatheResumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function onEvidenceVaultEntranceComplete() {
      const welcome = consumeEvidenceVaultPendingWelcome();
      if (!welcome) return;
      setMessages((prev) => {
        if (prev.some((m) => m.role === "assistant" && m.content === welcome)) {
          return prev;
        }
        return [...prev, { role: "assistant", content: welcome }];
      });
    }
    window.addEventListener(
      EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT,
      onEvidenceVaultEntranceComplete,
    );
    return () => {
      window.removeEventListener(
        EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT,
        onEvidenceVaultEntranceComplete,
      );
    };
  }, []);

  /**
   * Legacy `breathe` section → Universal Access destination.
   * Breathe is not a Focus room; prior workspace stays mounted in memory.
   */
  useEffect(() => {
    if (activeSection !== "breathe") return;
    openBreatheOverlayCore();
    const prev = sectionHistoryRef.current.pop() ?? "home";
    goingBackRef.current = true;
    setActiveSection(prev);
    activeSectionRef.current = prev;
    if (prev === "home") setActiveNav("chat");
  }, [activeSection]);

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
      const now = Date.now();
      const timeBlockAlertsOn = getPrefs().timeBlockAlerts;

      if (timeBlockAlertsOn) {
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

      // Chat reminders (P0.24) + Adaptive Rhythms — independent of time-block toggle.
      for (const item of collectDueDeliverables(now)) {
        const key = deliverableOccurrenceKey(item);
        if (remindedRef.current.has(key)) continue;
        remindedRef.current.add(key);
        const inApp = shouldDeliverInApp();
        const browser = shouldDeliverBrowserNotification();
        if (inApp || browser) {
          playChime();
          if (inApp) {
            setDeliverableNotice({
              title: item.title,
              body: item.body,
              kind: item.kind === "rhythm" ? "rhythm" : "reminder",
            });
          }
          if (browser && getPrefs().desktopNotifications) {
            notify(item.title, item.body);
          }
        }
        afterDeliverableFired(item, now);
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
      const nextValue = prefix + separator + transcript;
      voiceUsedRef.current = true;
      inputSnapshotRef.current = nextValue;
      setInput(nextValue);
    };

    recognition.onend = () => {
      setIsListening(false);
      patchEstateRuntimeState({ micActive: false });
      tryCommitMicCaptureOnEnd({
        explicitStopRequested: micExplicitStopRef.current,
        inputSnapshot: inputSnapshotRef.current,
        send: (text) => {
          voiceUsedRef.current = true;
          void handleSendRef.current(text);
        },
        onConsumedExplicitStop: () => {
          micExplicitStopRef.current = false;
        },
      });
    };
    recognition.onerror = () => {
      setIsListening(false);
      micExplicitStopRef.current = false;
    };
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
      micExplicitStopRef.current = true;
      patchEstateRuntimeState({ micActive: false });
      recognition.stop();
      return;
    }
    recognition.lang = speechLocaleForLanguage(getPrefs().voiceLanguage);
    baseInputRef.current = input;
    inputSnapshotRef.current = input;
    patchEstateRuntimeState({ micActive: true, inputBuffer: input });
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
    inputSnapshotRef.current = value;
    patchEstateRuntimeState({ inputBuffer: value });
    setInput(value);
    voiceUsedRef.current = false;
  }

  function appendSystemMessage(content: string) {
    setMessages((prev) => [...prev, { role: "system", content }]);
  }

  function clearTodayContext(options?: {
    preserveRoom?: boolean;
    mode?: "new-chat" | "new-day";
    /** When true, conversation reset already ran (shared New Day controller). */
    skipReset?: boolean;
    conversationIdAfterReset?: string;
  }) {
    if (!options?.skipReset) {
      const reset = resetActiveConversation({
        mode: options?.mode ?? "new-chat",
        abortController: chatRequestAbortRef.current,
        bumpRequestGeneration: () => {
          chatRequestGenerationRef.current += 1;
        },
      });
      chatRequestAbortRef.current = null;
      activeConversationIdRef.current = reset.conversationId;
    } else {
      chatRequestAbortRef.current = null;
      if (options.conversationIdAfterReset) {
        activeConversationIdRef.current = options.conversationIdAfterReset;
      }
    }

    recognitionRef.current?.stop();
    micExplicitStopRef.current = false;
    setIsListening(false);
    declinedConversationOffersRef.current = new Set();
    // New Chat: approved welcome only. New Day: card owns welcome — keep chat empty.
    const mode = options?.mode ?? "new-chat";
    if (mode === "new-chat") {
      setMessages([{ role: "assistant", content: NEW_CONVERSATION_GREETING }]);
    } else {
      setMessages([]);
    }
    workspaceChatScopeRef.current = null;
    setInput("");
    inputSnapshotRef.current = "";
    lastUserTextRef.current = "";
    setError(null);
    setEmotion("unclear");
    setBridge(null);
    setWorkspaceOffer(null);
    setBusinessConfidenceOffer(null);
    businessConfidenceBypassRef.current = false;
    businessConfidencePendingTextRef.current = null;
    setAssistedActionOffer(null);
    setAwaitingUserConfirmation(null);
    awaitingUserConfirmationRef.current = null;
    dismissActiveChamberConversationCore({ force: true });
    setBoardroomShariChatOpen(false);
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
    endVisibleThinking();
    setIsLoading(false);
    if (!options?.preserveRoom) {
      setActiveSection("home");
      setActiveNav("chat");
    }
    setGuideBesideSession(null);
    setActivitySession(EMPTY_ACTIVITY_SESSION);
    activitySessionRef.current = EMPTY_ACTIVITY_SESSION;
    setPlanMyDayDrawerOpen(false);
    setPlanMyDayOpenItemId(null);
    setOverlay((current) => (current === "signin" ? current : null));
    sectionHistoryRef.current = [];
    navHistoryRef.current = createNavigationHistoryStack();
    setCoachingMode("today");
    governorRouteCtxRef.current = {
      userText: "",
      lastAssistantText: "",
      resolved: resolveIntent(""),
      suppressRestore: true,
    };
    governorChatMessagesRef.current = [];
    resumeCreatePersistence();
    focusWorkspaceLayout();
  }

  function requestClearTodayContext() {
    // Conversations → New Chat: fresh thread + approved welcome only.
    try {
      const preserveRoom = shouldPreserveRoomForFreshConversation();
      clearTodayContext({ preserveRoom, mode: "new-chat" });
      setGlobalDailyOpening(null);
      setDailyOpeningHelpSuggestions(null);
      setFreshStartRevision((revision) => revision + 1);
      window.requestAnimationFrame(() => requestChatInputFocus());
    } catch (err) {
      const routed = routeCompanionFailure(err, {
        surface: "fresh-start",
      });
      if (routed.channel === "estate") {
        setMessages([{ role: "assistant", content: routed.message }]);
      }
    }
  }

  function requestResetDay() {
    setFreshStartDialog("reset-day");
  }

  function requestBeginNewDay(
    entryPoint: DailyOpeningEntryPoint = "explicit-new-day",
  ) {
    // Settings / Conversations → New Day: start immediately (no confirmation dialog).
    try {
      beginNewDay(entryPoint);
      setFreshStartRevision((revision) => revision + 1);
      window.requestAnimationFrame(() => requestChatInputFocus());
    } catch (err) {
      const routed = routeCompanionFailure(err, {
        surface: "fresh-start",
      });
      if (routed.channel === "estate") {
        setMessages([{ role: "assistant", content: routed.message }]);
      }
    }
  }

  function requestBeginNewDayFromSettings() {
    requestBeginNewDay("settings-new-day");
  }

  function handleStartCleanConversation() {
    clearTodayContext();
    setGlobalDailyOpening(null);
    setDailyOpeningHelpSuggestions(null);
  }

  function handleStartNewDayConversation() {
    beginNewDay("explicit-new-day");
  }

  function shouldPreserveRoomForFreshConversation(): boolean {
    if (welcomeHomePrimary) return true;
    const section = activeSectionRef.current;
    return section !== "home" && isStandaloneEstateRoomSection(section);
  }

  function confirmFreshStart() {
    try {
      const preserveRoom = shouldPreserveRoomForFreshConversation();
      if (freshStartDialog === "begin-new-day") {
        beginNewDay("explicit-new-day");
      } else if (freshStartDialog === "reset-day") {
        resetPlanDay();
      } else if (freshStartDialog === "clear-context") {
        clearTodayContext({ preserveRoom, mode: "new-chat" });
        setGlobalDailyOpening(null);
        setDailyOpeningHelpSuggestions(null);
      }
      setFreshStartRevision((revision) => revision + 1);
      window.requestAnimationFrame(() => requestChatInputFocus());
    } catch (err) {
      const routed = routeCompanionFailure(err, {
        surface: "fresh-start",
      });
      if (routed.channel === "estate") {
        setMessages([{ role: "assistant", content: routed.message }]);
      }
    } finally {
      setFreshStartDialog(null);
    }
  }

  function resetPlanDay() {
    resetPlanDayView();
    setPlanMyDayOpenItemId(null);
  }

  /**
   * Shared New Day / Global Daily Companion Experience entry.
   * Always uses runSharedNewDay — never a Settings-only or menu-only path.
   * Does not restore the prior room; opens Welcome Home with three choices.
   */
  function beginNewDay(entryPoint: DailyOpeningEntryPoint = "explicit-new-day") {
    const result = runSharedNewDay({
      entryPoint,
      abortController: chatRequestAbortRef.current,
      bumpRequestGeneration: () => {
        chatRequestGenerationRef.current += 1;
      },
    });

    clearTodayContext({
      preserveRoom: false,
      mode: "new-day",
      skipReset: true,
      conversationIdAfterReset: result.reset.conversationId,
    });

    setOverlay(null);
    setSettingsSection(null);
    setActiveSection("home");
    setActiveNav("chat");
    setGlobalDailyOpening(result.opening);
    setDailyOpeningHelpMeChoose(null);
    setDailyOpeningHelpfulLesson(null);
    setDailyOpeningAdaptCheckIn(false);
    // Card owns the welcome message — do not inject it as a chat bubble.
    setMessages([]);
  }

  function clearDailyOpeningSubViews() {
    setDailyOpeningHelpMeChoose(null);
    setDailyOpeningHelpfulLesson(null);
    setDailyOpeningAdaptCheckIn(false);
    clearPendingChoice();
  }

  function navigateDailyOpeningDestination(
    destination: import("@/lib/dailyOpening").DailyOpeningDestination,
  ) {
    markTodaysWelcomeDismissedThisSession();
    setGlobalDailyOpening(null);
    clearDailyOpeningSubViews();
    const arrival = buildDailyOpeningArrivalMessage(destination);
    switch (destination.kind) {
      case "continue":
        handleCompanionContinueOption(destination.option);
        if (
          arrival &&
          destination.option.kind !== "conversation" &&
          destination.option.kind !== "plan-my-day"
        ) {
          setMessages([{ role: "assistant", content: arrival }]);
        }
        return;
      case "plan-my-day":
        openPlanMyDayCore();
        return;
      case "adapt-my-day":
        // Stay on Welcome Home for the Adapt check-in (not Plan My Day entry).
        setGlobalDailyOpening(
          globalDailyOpening ??
            todaysWelcomeOpening ??
            resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" }),
        );
        setDailyOpeningAdaptCheckIn(true);
        return;
      case "clear-my-mind":
        openClearMyMindCore();
        return;
      case "explore-estate":
        openExploreSparkVisualExplorer();
        return;
      case "business-estate":
        openProfileDestinationCore("my-business-estate");
        return;
      case "section":
        openStandaloneFocusSectionCore(destination.section);
        return;
      case "stay-in-chat":
        setMessages([
          {
            role: "assistant",
            content:
              destination.cue?.trim() ||
              "I'm here. Tell me what would help most.",
          },
        ]);
        focusChatInput();
        return;
      default:
        focusChatInput();
    }
  }

  function handleGlobalDailyOpeningChoice(choiceId: DailyOpeningChoiceId) {
    const opening =
      globalDailyOpening ??
      todaysWelcomeOpening ??
      resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" });
    if (!globalDailyOpening) setGlobalDailyOpening(opening);
    const action = resolveDailyOpeningChoiceAction(choiceId, opening);
    if (action.kind === "show-help-me-choose") {
      setDailyOpeningHelpfulLesson(null);
      setDailyOpeningAdaptCheckIn(false);
      setDailyOpeningHelpMeChoose({ step: "needs" });
      registerHelpMeChooseNeedsPending();
      return;
    }
    navigateDailyOpeningDestination(action.destination);
  }

  function handleShowSomethingHelpful() {
    const offer = offerNextHelpfulLesson();
    if (!offer) return;
    setDailyOpeningHelpMeChoose(null);
    setDailyOpeningAdaptCheckIn(false);
    setDailyOpeningHelpfulLesson(offer);
  }

  function handleHelpfulLessonShowMe() {
    const offer = dailyOpeningHelpfulLesson;
    if (!offer) return;
    markHelpfulLessonOpened(offer.lesson.id);
    const destId = offer.lesson.destinationId;
    setDailyOpeningHelpfulLesson(null);
    if (!destId) {
      navigateDailyOpeningDestination({
        kind: "stay-in-chat",
        cue: `${offer.lesson.title} — ${offer.lesson.shortExplanation} Want to try it together?`,
      });
      return;
    }
    if (destId === "clear-my-mind") {
      navigateDailyOpeningDestination({ kind: "clear-my-mind" });
      return;
    }
    if (destId === "parking-lot") {
      navigateDailyOpeningDestination({
        kind: "section",
        section: "parking-lot",
      });
      return;
    }
    if (destId === "plan-my-day") {
      navigateDailyOpeningDestination({ kind: "plan-my-day" });
      return;
    }
    if (destId === "adapt-my-day") {
      navigateDailyOpeningDestination({ kind: "adapt-my-day" });
      return;
    }
    if (destId === "my-business-estate") {
      navigateDailyOpeningDestination({ kind: "business-estate" });
      return;
    }
    const sectionMap: Record<string, import("@/lib/companionUi").AppSection> = {
      reminders: "reminders",
      rhythms: "rhythms",
      "decision-compass": "decision-compass",
      chamber: "chamber-of-momentum",
      boardroom: "boardroom",
      projects: "projects",
      "people-i-help": "client-avatars",
      settings: "settings",
      journal: "growth-journal",
      "evidence-vault": "evidence-bank",
      guidebook: "how-do-i",
      "peaceful-places": "life-experience",
    };
    const section = sectionMap[destId];
    if (section) {
      navigateDailyOpeningDestination({ kind: "section", section });
      return;
    }
    navigateDailyOpeningDestination({
      kind: "stay-in-chat",
      cue: `Let me show you ${offer.lesson.title}. ${offer.lesson.shortExplanation}`,
    });
  }

  function handleHelpfulLessonSomethingElse() {
    const currentId = dailyOpeningHelpfulLesson?.lesson.id;
    const next = currentId
      ? offerNextHelpfulLessonExcluding(currentId)
      : offerNextHelpfulLesson();
    if (!next) {
      setDailyOpeningHelpfulLesson(null);
      return;
    }
    setDailyOpeningHelpfulLesson(next);
  }

  function handleHelpfulLessonMaybeLater() {
    if (dailyOpeningHelpfulLesson) {
      markHelpfulLessonDismissed(dailyOpeningHelpfulLesson.lesson.id);
    }
    setDailyOpeningHelpfulLesson(null);
  }

  function handleHelpMeChooseNeed(needId: HelpMeChooseNeedId) {
    const opening =
      globalDailyOpening ??
      todaysWelcomeOpening ??
      resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" });
    const options = resolveHelpMeChooseSupportOptions(
      needId,
      opening.continueOption,
    );
    if (options.length === 1 && options[0]?.destination.kind === "stay-in-chat") {
      navigateDailyOpeningDestination(options[0].destination);
      return;
    }
    const prompt =
      needId === "overwhelmed"
        ? "What kind of overwhelm is this?"
        : needId === "not-sure"
          ? "We can keep this simple."
          : "What would help most?";
    setDailyOpeningHelpMeChoose({
      step: "support",
      needId,
      prompt,
      options,
    });
    registerHelpMeChooseSupportPending(options);
  }

  function handleHelpMeChooseSupport(option: HelpMeChooseSupportOption) {
    navigateDailyOpeningDestination(option.destination);
  }

  function finishAdaptMyDayToPlan(_proposal: AdaptedDayProposal) {
    markTodaysWelcomeDismissedThisSession();
    setGlobalDailyOpening(null);
    clearDailyOpeningSubViews();
    openPlanMyDayCore();
  }

  function handleGlobalDailyDiscoveryLearn() {
    markDailyOpeningDiscoveryPresented();
    const opening =
      globalDailyOpening ??
      todaysWelcomeOpening ??
      resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" });
    setGlobalDailyOpening({
      ...opening,
      discovery: { ...opening.discovery, show: false },
    });
    handleWelcomeHomeDiscoveryInvite();
  }

  function handleGlobalDailyDiscoveryDismiss() {
    markDailyOpeningDiscoveryPresented();
    const opening =
      globalDailyOpening ??
      todaysWelcomeOpening ??
      resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" });
    setGlobalDailyOpening({
      ...opening,
      discovery: { ...opening.discovery, show: false },
    });
  }

  function handleGlobalDailyBackToToday() {
    clearDailyOpeningSubViews();
  }

  // Run queued first-of-day / absence opening through the shared New Day controller.
  useEffect(() => {
    if (!pendingDailyOpeningEntry) return;
    const entry = pendingDailyOpeningEntry;
    setPendingDailyOpeningEntry(null);
    try {
      beginNewDay(entry);
      setFreshStartRevision((revision) => revision + 1);
    } catch {
      dailyOpeningStartedRef.current = false;
    }
  }, [pendingDailyOpeningEntry]);

  function buildGrowthPanelNav(current: GrowthSectionId): GrowthPanelNav {
    return {
      current,
      onBack: goBack,
      backLabel: workspacePanelBackLabel,
      onOpenSection: (section) => {
        if (section === "growth") {
          openGrowthLandingCore();
          return;
        }
        if (section === "growth-library") {
          openGrowthLibraryCore();
          return;
        }
        if (section === "growth-reports") {
          openGrowthReportsCore();
          return;
        }
        openGrowthDestinationCore(section);
      },
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

  function openCreateWorkspace(opts?: {
    source?: CreateOpenSource;
    initialPrompt?: string;
    artifactType?: string;
    hardNavCommand?: string;
  }): boolean {
    const source = opts?.source ?? "ui_nav";
    const prompt = opts?.initialPrompt?.trim() ?? lastUserTextRef.current;
    const isHardNav = source === "hard_nav";
    const beforePanel = workspacePanelRef.current;
    const beforeSection = activeSectionRef.current;

    if (
      redirectLegacyCreateWorkspaceIfNeeded("content-generator", {
        userText: prompt || opts?.hardNavCommand,
        itemType: opts?.artifactType,
      })
    ) {
      return false;
    }

    // Sprint 1+ — recognition preserve-first / active flow blocks Create routing
    // unless the member explicitly asked to open Create / draft / build.
    if (
      !isHardNav &&
      source !== "ui_nav" &&
      prompt &&
      shouldBlockCreateForRecognitionTurn(prompt)
    ) {
      return false;
    }

    publishLiveWorkspaceTrace("after_open_create_workspace", {
      command: opts?.hardNavCommand ?? prompt,
      note: `source=${source}`,
    });

    clearParallelCoachingOffers();

    if (workspacePanelRef.current === CREATE_PANEL_SECTION) {
      setActiveSection("home");
      activeSectionRef.current = "home";
      setActiveNav("other");
      applyChatLayoutMode("split");
      revealWorkspace();
      if (opts?.hardNavCommand) {
        logHardNavCreate({
          matched: true,
          command: opts.hardNavCommand,
          target: CREATE_PANEL_SECTION,
          beforeWorkspacePanel: beforePanel,
          beforeActiveSection: beforeSection,
          calledOpenSectionBesideChatCore: true,
          calledRequestCreateOpen: false,
          requestCreateOpenResult: true,
          afterWorkspacePanel: workspacePanelRef.current,
          afterActiveSection: activeSectionRef.current,
          rightPanelVisible: workspacePanelRef.current === CREATE_PANEL_SECTION,
        });
        scheduleLiveWorkspaceTraceDelays(opts.hardNavCommand);
      }
      return true;
    }

    if (!isHardNav) {
      if (
        tryOpenCreateForCurrentArtifact(prompt, {
          allowStoredSession: isExplicitCreateResumeRequest(prompt),
        })
      ) {
        applyChatLayoutMode("split");
        setActiveSection("home");
        activeSectionRef.current = "home";
        setActiveNav("other");
        revealWorkspace();
        return true;
      }

      if (isExplicitCreateResumeRequest(prompt) && restoreCreateSession()) {
        applyChatLayoutMode("split");
        revealWorkspace();
        return true;
      }
    }

    armCreateOpenGuard(isHardNav ? "hard_nav" : source);
    createPanelWorkflowRef.current = EMPTY_CREATE_WORKFLOW;
    createBuilderBootstrappedRef.current = false;
    preloadRoomBackground(CREATIVE_STUDIO_ROOM_BG);

    const createInput = {
      itemType: opts?.artifactType ?? "",
      title: "Create with Shari",
      brief: prompt,
      stage: "choosing what to create",
      source: "generated" as const,
    };

    let opened = false;
    if (isHardNav) {
      executeCreateOpenInternal(CREATE_PANEL_SECTION, createInput, {
        silent: true,
        userInitiated: true,
      });
      opened = isCreatePanelOpen({
        workspacePanel: workspacePanelRef.current,
        activeSection: activeSectionRef.current,
        chatLayoutMode: chatLayoutModeRef.current,
      });
      publishLiveWorkspaceTrace("after_request_create_open", {
        command: opts?.hardNavCommand ?? prompt,
        createOpenRequest: false,
        note: "hard_nav direct executeCreateOpenInternal",
      });
    } else {
      opened = requestCreateOpen(
        CREATE_PANEL_SECTION,
        createInput,
        { silent: true },
        {
          source,
          userInitiated: true,
          skipConsentCheck: true,
          skipWorkspaceChatReset: false,
          userText: prompt,
        },
      );
      publishLiveWorkspaceTrace("after_request_create_open", {
        command: prompt,
        createOpenRequest: opened,
      });
    }

    if (opened) {
      startCreateBuilderChat(opts?.artifactType, undefined, { skipChatSync: true });
    }
    applyChatLayoutMode("split");
    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("other");
    revealWorkspace();
    trackWorkspaceEcosystemEvent(CREATE_PANEL_SECTION);
    noteWorkspaceOpened(CREATE_PANEL_SECTION, "beside_chat");

    if (opts?.hardNavCommand) {
      logHardNavCreate({
        matched: true,
        command: opts.hardNavCommand,
        target: CREATE_PANEL_SECTION,
        beforeWorkspacePanel: beforePanel,
        beforeActiveSection: beforeSection,
        calledOpenSectionBesideChatCore: true,
        calledRequestCreateOpen: !isHardNav,
        requestCreateOpenResult: opened,
        afterWorkspacePanel: workspacePanelRef.current,
        afterActiveSection: activeSectionRef.current,
        rightPanelVisible: isCreatePanelOpen({
          workspacePanel: workspacePanelRef.current,
          activeSection: activeSectionRef.current,
          chatLayoutMode: chatLayoutModeRef.current,
        }),
      });
      scheduleLiveWorkspaceTraceDelays(opts.hardNavCommand);
    }

    return opened;
  }

  /** Menu / in-panel navigation — replace right workspace, keep chat on the left. */
  function openSectionBesideChatCore(
    section: AppSection,
    nav?: SidebarNavId,
    options?: { userInitiated?: boolean },
  ) {
    if (
      isChamberMemberConversationActive({
        activeSection: activeSectionRef.current,
        activeMemberId: activeChamberMemberIdRef.current,
      })
    ) {
      return;
    }
    if (redirectLegacyCreateWorkspaceIfNeeded(section)) return;
    if (shouldBlockWorkspaceOpenForPhase1(options)) return;
    if (section === "growth") {
      openGrowthLandingCore();
      return;
    }
    if (section === "growth-library") {
      openGrowthLibraryCore();
      return;
    }
    if (section === "growth-capture") {
      openGrowthCaptureCore();
      return;
    }
    if (section === "growth-reports") {
      openGrowthReportsCore();
      return;
    }
    if (section === "user-memory") {
      openUserMemoryCore("all");
      return;
    }
    if (
      section === "growth-journal" ||
      section === "growth-portfolio" ||
      section === "wins-this-week" ||
      section === "evidence-bank" ||
      section === "growth-greenhouse" ||
      section === "confidence-vault" ||
      section === "my-journey"
    ) {
      openGrowthDestinationCore(section);
      return;
    }
    if (isClearMyMindSection(section)) {
      openClearMyMindCore();
      return;
    }
    if (isPlanMyDaySection(section)) {
      openPlanMyDayCore();
      return;
    }
    if (isLegacyGrowthHubSection(section)) {
      openNavSectionDirectCore(GALLERY_HOME_SECTION, nav ?? "growth");
      return;
    }
    if (section === "content-generator") {
      openCreateWorkspace({ source: "ui_nav" });
      return;
    }

    const isWelcomeRoom = section === "welcome-room";
    const workspaceFocusPanel = isWelcomeRoom;

    if (workspacePanel === section) {
      if (
        section === "visual-focus" &&
        !peekVisualFocusPendingOpen() &&
        !peekMindMapDiscoveryPending()
      ) {
        requestVisualFocusStudio();
      }
      setActiveSection("home");
      if (nav) setActiveNav(nav);
      if (workspaceFocusPanel) {
        applyChatLayoutMode("workspace-focus");
      } else {
        ensureSplitBesideChatLayout();
      }
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
    patchWorkspacePanel(section, options);
    if (
      section === "visual-focus" &&
      !peekVisualFocusPendingOpen() &&
      !peekMindMapDiscoveryPending()
    ) {
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
    if (workspaceFocusPanel) {
      applyChatLayoutMode("workspace-focus");
    } else {
      ensureSplitBesideChatLayout();
    }
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

  function openWelcomeRoom() {
    markWelcomeRoomOpenedWithGesture();
    primeWelcomeRoomAudioFromGesture();
    applyChatLayoutMode("workspace-focus");
    openSectionBesideChatCore("welcome-room", "welcome-room", {
      userInitiated: true,
    });
  }

  function leaveWelcomeRoom() {
    destroyWelcomeRoomAudioManager();
    navigateToChatCore();
  }

  function finishWelcomeHomeIntro() {
    if (
      !isCompanionPreviewTestSessionActive() &&
      !hasSeenWelcomeIntro()
    ) {
      markWelcomeIntroSeen();
    }
    setWelcomeHomeReplay(false);
    setWelcomeHomeIntroActive(false);
    destroyWelcomeHomeAudioManager();
    destroyWelcomeRoomAudioManager();
  }

  function completeWelcomeHomeFirstLaunch(choice: WelcomeHomeFirstChoice | null) {
    finishWelcomeHomeIntro();

    if (choice === "tour") {
      openWelcomeRoom();
      return;
    }
    if (choice === "surprise") {
      void handleSend("Introduce me to something wonderful.", true);
      return;
    }
    if (choice === "know") {
      window.setTimeout(() => requestChatInputFocus(), 350);
    }
  }

  function openCreateDirect() {
    openCreateWorkspace({ source: "ui_nav" });
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
    requestChatInputFocus();
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
    requestChatInputFocus();
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
      requestChatInputFocus();
      return;
    }

    if (!supportsWorkspace(targetSection)) {
      patchWorkspacePanel(null);
      setCompanionStandaloneSection(targetSection);
      const navId = navForWorkspaceSection(targetSection);
      if (navId) setActiveNav(navId);
      revealWorkspace();
      appendWorkspaceCoachOpener(targetSection, true);
      requestChatInputFocus();
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
    requestChatInputFocus();
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
    if (isCreateOpenGuardActive()) {
      publishLiveWorkspaceTrace("after_patch_workspace_panel", {
        patchBlocked: true,
        note: "clearSplitBesideWorkspace blocked by create open guard",
      });
      return;
    }
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
    const activityForSession = session.activityId
      ? getActivityById(session.activityId)
      : null;
    const normalizedSession =
      activityForSession && session.phase === "active"
        ? {
            ...session,
            answers: ensureActivityStepAnswers(
              activityForSession.steps,
              session.stepIndex,
              session.answers,
            ),
          }
        : session;
    setActivitySession(normalizedSession);
    const section = normalizedSession.activityId
      ? standaloneSectionForActivity(normalizedSession.activityId)
      : "focus";
    setActivityReturnLabel(
      resolveActivityReturnLabel(options?.strategyOpenView, section),
    );
    setActiveSection(section);
    activeSectionRef.current = section;
    setActiveNav("focus");
  }

  /**
   * Shared Plan / Adapt window — Welcome Home My Day parent and children.
   * Child pre-selects Plan or Adapt inside one scrollable window.
   */
  function openPlanAdaptSharedCore(child?: "plan" | "adapt" | null) {
    leaveClearMyMindIfNavigatingAway();
    if (!confirmLeaveUnsavedWork()) return;
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
    setOverlay(null);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    setPlanAdaptSharedChild(child ?? null);
    trackWorkspaceEcosystemEvent("adapt-plan-my-day");
    noteWorkspaceOpened("adapt-plan-my-day", "standalone_room");
    openStandaloneFocusSectionCore("adapt-plan-my-day");
  }

  /** Adapt My Day — opens shared Plan/Adapt window with Adapt selected. */
  function openAdaptMyDayCore() {
    openPlanAdaptSharedCore("adapt");
  }

  /**
   * Close trapping experiences (Explore Estate map, overlays, Breathe, etc.)
   * before a Welcome Home destination opens. Shared by all menu / section openers.
   */
  /**
   * Shared Chamber exit — cancels streams, clears active member, removes
   * Chamber messages from the visible thread. Preserves saved history records.
   */
  function dismissActiveChamberConversationCore(input?: {
    destinationId?: string | null;
    previousSection?: string | null;
    nextSection?: string | null;
    force?: boolean;
  }) {
    const plan = planDismissActiveChamberConversation({
      destinationId: input?.destinationId,
      activeMemberId: activeChamberMemberIdRef.current,
      previousSection: input?.previousSection,
      nextSection: input?.nextSection,
      chamberThreadStartIndex: chamberThreadStartIndexRef.current,
    });

    const shouldRun = input?.force === true || plan.shouldDismiss;
    if (!shouldRun && !activeChamberMemberIdRef.current) {
      return;
    }
    if (!shouldRun && !input?.force) {
      return;
    }

    if (plan.abortStream || input?.force) {
      chatRequestGenerationRef.current += 1;
      supersedeInFlightChatRequest(chatRequestAbortRef.current);
      chatRequestAbortRef.current = null;
      endVisibleThinking();
      setIsLoading(false);
    }

    if (plan.clearActiveMember || input?.force) {
      dismissActiveChamberConversationStorage();
      clearActiveChamberMember();
      setActiveChamberMemberId(null);
      activeChamberMemberIdRef.current = null;
    }

    if (plan.hideChat || input?.force) {
      setEstateRoomChatVisible(false);
    }

    const restoreIndex = plan.restoreMessageIndex;
    if (restoreIndex != null || plan.stripActivationMessages || input?.force) {
      setMessages((prev) =>
        filterDismissedChamberMessages(
          prev,
          restoreIndex ?? chamberThreadStartIndexRef.current,
        ),
      );
    }
    chamberThreadStartIndexRef.current = null;
  }

  function dismissTransientEstateExperiencesForDestinationSwitch(input: {
    destinationId: string;
    kind: WelcomeHomeDestinationKind;
  }) {
    const plan = planWelcomeHomeDestinationSwitch(input);

    if (plan.closeExploreEstate) {
      setExploreSparkMapOpen(false);
      setExploreEstateReturnAvailable(false);
    }
    if (plan.clearExploreReturnPending) {
      clearExploreEstateReturnPending();
    }
    if (plan.clearOverlays) {
      setOverlay(null);
      setSettingsSection(null);
    }
    if (plan.clearGuidedFieldHelpChat) {
      closeGuidedFieldHelpChat();
    }
    if (plan.clearBreathe && isBreatheDestinationActive(breatheDestination)) {
      if (breatheTransitionTimerRef.current) {
        clearTimeout(breatheTransitionTimerRef.current);
        breatheTransitionTimerRef.current = null;
      }
      if (breatheResumeTimerRef.current) {
        clearTimeout(breatheResumeTimerRef.current);
        breatheResumeTimerRef.current = null;
      }
      setBreatheDestination(EMPTY_BREATHE_DESTINATION);
      setBreatheResumeActive(false);
      breathePausedTimerRef.current = false;
    }
    if (plan.clearActiveChamberConversation) {
      dismissActiveChamberConversationCore({
        destinationId: input.destinationId,
        previousSection: activeSectionRef.current,
        nextSection:
          input.kind === "section" || input.kind === "welcome-home"
            ? input.destinationId === "welcome-home"
              ? "home"
              : input.destinationId
            : input.destinationId,
        force: Boolean(activeChamberMemberIdRef.current),
      });
    }
  }

  // Safety net: leaving Chamber for any other section tears down the member session.
  useEffect(() => {
    const previous = previousSectionForChamberRef.current;
    previousSectionForChamberRef.current = activeSection;
    if (
      previous === "chamber-of-momentum" &&
      activeSection !== "chamber-of-momentum"
    ) {
      dismissActiveChamberConversationCore({
        previousSection: previous,
        nextSection: activeSection,
        destinationId: activeSection,
      });
    }
  }, [activeSection]);

  /** Standalone focus tools (Clear My Mind, spin wheel, energy, etc.). */
  function openStandaloneFocusSectionCore(section: AppSection) {
    const resolvedSection = section === "games" ? "quick-recharge" : section;
    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: resolvedSection,
      kind: "section",
    });
    setPreferEverydayConversation(false);
    preferEverydayConversationRef.current = false;

    const navEpoch = ++estateSectionNavEpochRef.current;

    void (async () => {
      await prepareEstateSceneTransition({ toSection: resolvedSection });
      if (navEpoch !== estateSectionNavEpochRef.current) return;
      recordEstateRoomTransition({
        toSection: resolvedSection,
        fromSection: activeSectionRef.current,
        reason: "estate room navigation",
        userText: lastUserTextRef.current || undefined,
        preserveChat: true,
      });
      pushNavigationRestore();
      clearParallelCoachingOffers();
      clearSplitBesideWorkspace();
      setActiveSection(resolvedSection);
      activeSectionRef.current = resolvedSection;
      setActiveNav(navForWorkspaceSection(resolvedSection) ?? "focus");
    })();
  }

  /**
   * Breathe Universal Access destination (#183).
   * Full-screen scene replaces the current room; workspace stays mounted in memory.
   * Pauses an active focus timer; progress is preserved until resume.
   */
  function openBreatheOverlayCore(options?: {
    patternId?: string;
    minutes?: number;
    environmentId?: BreatheEnvironmentId;
  }) {
    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: "breathe",
      kind: "breathe",
    });
    setEstateRoomChatVisible(false);
    const breatheEnv = resolveBreatheEnvironment(options?.environmentId);
    preloadRoomBackground(breatheEnv.imageUrl);
    if (
      pomodoroTimer.isActive &&
      !pomodoroTimer.isPaused &&
      typeof pomodoroTimer.pause === "function"
    ) {
      pomodoroTimer.pause();
      breathePausedTimerRef.current = true;
    } else {
      breathePausedTimerRef.current = false;
    }

    if (breatheTransitionTimerRef.current) {
      clearTimeout(breatheTransitionTimerRef.current);
      breatheTransitionTimerRef.current = null;
    }
    if (breatheResumeTimerRef.current) {
      clearTimeout(breatheResumeTimerRef.current);
      breatheResumeTimerRef.current = null;
    }
    setBreatheResumeActive(false);

    setBreatheDestination({
      phase: "entering",
      patternId: options?.patternId,
      minutes: options?.minutes,
      environmentId: breatheEnv.id,
      key: Date.now(),
    });
    breatheTransitionTimerRef.current = setTimeout(() => {
      setBreatheDestination((prev) =>
        prev.phase === "entering" ? { ...prev, phase: "active" } : prev,
      );
      breatheTransitionTimerRef.current = null;
    }, BREATHE_DESTINATION_FADE_MS);
  }

  function closeBreatheOverlayCore(opts?: {
    resume?: boolean;
    goChat?: boolean;
    goJournal?: boolean;
  }) {
    if (
      !breatheDestination.phase ||
      breatheDestination.phase === "exiting"
    ) {
      return;
    }

    if (breatheTransitionTimerRef.current) {
      clearTimeout(breatheTransitionTimerRef.current);
      breatheTransitionTimerRef.current = null;
    }

    const shouldResumeTimer = breathePausedTimerRef.current;
    const pending = opts;

    setBreatheDestination((prev) => ({ ...prev, phase: "exiting" }));
    breatheTransitionTimerRef.current = setTimeout(() => {
      breatheTransitionTimerRef.current = null;
      setBreatheDestination(EMPTY_BREATHE_DESTINATION);
      setBreatheResumeActive(true);
      if (breatheResumeTimerRef.current) {
        clearTimeout(breatheResumeTimerRef.current);
      }
      breatheResumeTimerRef.current = setTimeout(() => {
        setBreatheResumeActive(false);
        breatheResumeTimerRef.current = null;
      }, BREATHE_DESTINATION_FADE_MS);

      breathePausedTimerRef.current = false;

      if (pending?.goJournal) {
        openGrowthDestinationCore("growth-journal");
        return;
      }
      if (pending?.goChat) {
        navigateToChatCore();
        return;
      }
      /** Resume previous activity — workspace was never unmounted. */
      if (shouldResumeTimer && typeof pomodoroTimer.start === "function") {
        pomodoroTimer.start();
      }
    }, BREATHE_DESTINATION_FADE_MS);
  }

  /** Clear My Mind Mode — interactive capture workspace; never frosted chat overlay. */
  function openClearMyMindCore(options?: {
    initialView?: ClearMyMindPanelView;
    silent?: boolean;
  }) {
    const backdropUrl = getClearMyMindBackdropImageUrl();
    preloadRoomBackground(backdropUrl);
    const view = options?.initialView ?? "capture";
    setPreferEverydayConversation(false);
    preferEverydayConversationRef.current = false;
    enterClearMyMindMode();
    setClearMyMindModePhase(view === "my-thoughts" ? "organize" : "capture");
    setBrainDumpInitialView(view);
    setBrainDumpPanelKey((k) => k + 1);
    trackWorkspaceEcosystemEvent("brain-dump");
    noteWorkspaceOpened("brain-dump", "standalone_room");
    clearSplitBesideWorkspace();
    /** Dedicated panel — never leave a direct-visit overlay covering the workspace. */
    syncDirectEstateVisit(null);
    clearEstatePendingTransition();
    setEstateConservatoryEngaged(true);
    patchEstateRuntimeState({
      currentPlaceId: "clear-my-mind",
      activeConversationMode: true,
    });
    openStandaloneFocusSectionCore("brain-dump");
    if (!options?.silent) {
      const greeting = CLEAR_MY_MIND_WELCOME_LINES[0];
      setMessages((prev) => {
        if (
          prev.some(
            (m) => m.role === "assistant" && m.content === greeting,
          )
        ) {
          return prev;
        }
        return [...prev, { role: "assistant", content: greeting }];
      });
    }
  }

  /**
   * Leave Clear My Mind Mode before opening another My Day & Work destination.
   * Otherwise the active-section restore effect snaps back to Clear My Mind.
   */
  function leaveClearMyMindIfNavigatingAway() {
    if (
      isClearMyMindModeActive() ||
      activeSectionRef.current === "brain-dump"
    ) {
      exitClearMyMindMode();
      setEstateConservatoryEngaged(false);
    }
  }

  /** Plan My Day — Morning Room standalone; never beside chat. */
  function openPlanMyDayCore(options?: {
    itemId?: string | null;
    area?: PlanningCenterArea | null;
    rhythmsTab?: "today" | "all" | "reminders" | null;
  }) {
    leaveClearMyMindIfNavigatingAway();
    if (!confirmLeaveUnsavedWork()) return;
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
    setPlanMyDayOpenItemId(options?.itemId ?? null);
    setPlanMyDayInitialArea(options?.area ?? null);
    setPlanMyDayInitialRhythmsTab(options?.rhythmsTab ?? null);
    trackWorkspaceEcosystemEvent("plan-my-day");
    noteWorkspaceOpened("plan-my-day", "standalone_room");
    clearSplitBesideWorkspace();
    openStandaloneFocusSectionCore("plan-my-day");
  }

  /**
   * Shared calendar item open — Plan My Day → Calendar (+ detail when id given).
   * Never opens legacy Momentum Appointments / TimeBlockPanel split layout.
   */
  function openCalendarItemCore(
    itemId?: string | null,
    source: CalendarItemOpenSource = "planning-calendar",
  ) {
    const intent = openCalendarItemIntent(itemId, source);
    setTimeBlockFocusId(null);
    if (workspacePanel === "time-block") {
      patchWorkspacePanel(null);
    }
    openPlanMyDayCore({
      itemId: intent.planItemId,
      area: "calendar",
    });
  }

  /**
   * My Day → Reminders / Rhythms — one shared window with two selectable children.
   */
  function openRemindersRhythmsCore(child?: "reminders" | "rhythms" | null) {
    leaveClearMyMindIfNavigatingAway();
    if (!confirmLeaveUnsavedWork()) return;
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
    setOverlay(null);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    setRemindersRhythmsSharedChild(child ?? null);
    trackWorkspaceEcosystemEvent("reminders-rhythms");
    noteWorkspaceOpened("reminders-rhythms", "standalone_room");
    openStandaloneFocusSectionCore("reminders-rhythms");
  }

  /**
   * Reminders — Welcome Home opens the shared window with Reminders selected.
   */
  function openRemindersCore() {
    openRemindersRhythmsCore("reminders");
  }

  /**
   * Calendar — opens the member's connected calendar (Google or Outlook —
   * whichever they use) when known, and the Spark Calendar room for connect /
   * planning events. Never Momentum Appointments or Plan My Day shell.
   */
  function openCalendarCore() {
    leaveClearMyMindIfNavigatingAway();
    if (!confirmLeaveUnsavedWork()) return;
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
    setOverlay(null);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    trackWorkspaceEcosystemEvent("calendar");
    noteWorkspaceOpened("calendar", "standalone_room");
    openStandaloneFocusSectionCore("calendar");
    // Open their real calendar when we know which one they use.
    void fetchConnectedCalendarsSnapshot()
      .then((snapshot) => {
        const target = resolveMemberCalendarOpenTarget(snapshot);
        if (target.kind === "external") {
          openMemberCalendarExternal(target.provider);
        }
      })
      .catch(() => {
        /* stay in Spark Calendar room */
      });
  }

  /**
   * Rhythms — Welcome Home opens the shared window with Rhythms selected.
   * Dedicated room remains available for deep links via section "rhythms".
   */
  function openRhythmsCore() {
    openRemindersRhythmsCore("rhythms");
  }

  /**
   * Parking Lot — dedicated estate room (Focus).
   * Never opens Plan My Day, Clear My Mind, Reminders, Settings, or Create.
   */
  function openParkingLotCore() {
    leaveClearMyMindIfNavigatingAway();
    if (!confirmLeaveUnsavedWork()) return;
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
    setOverlay(null);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    trackWorkspaceEcosystemEvent("parking-lot");
    noteWorkspaceOpened("parking-lot", "standalone_room");
    openStandaloneFocusSectionCore("parking-lot");
  }

  /**
   * Destination Gallery — Architecture 156 crystals (not Asset Library / the-gallery).
   */
  function openDestinationGalleryCore() {
    leaveClearMyMindIfNavigatingAway();
    setOverlay(null);
    setDestinationCrystalPrepared(null);
    preloadRoomBackground(DESTINATION_GALLERY_BG.split("?")[0] ?? DESTINATION_GALLERY_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    syncDirectEstateVisit({
      roomId: "destination-gallery",
      section: "destination-gallery",
      userIntent: "destination-gallery",
      userMessageCountAtArrival: messages.filter((m) => m.role === "user")
        .length,
    });
    trackWorkspaceEcosystemEvent("destination-gallery");
    noteWorkspaceOpened("destination-gallery", "standalone_room");
    openStandaloneFocusSectionCore("destination-gallery");
    setEstateRoomChatVisible(false);
  }

  /**
   * Destination Gallery crystal activation (pass 1).
   * Schedule → Connected Calendars. Other crystals → prepared states in-gallery.
   * Never opens content-generator, Evidence Vault, Saved Work, or legacy Create.
   */
  function handleSelectDestinationCrystal(crystal: DestinationCrystal) {
    const activation = resolveCrystalActivation(crystal.id);
    if (activation.kind === "open_calendar") {
      setDestinationCrystalPrepared(null);
      openCalendarCore();
      return;
    }
    // Design and other prepared states stay in Destination Gallery.
    setDestinationCrystalPrepared(activation);
  }

  function openBoardroomCore(options?: { intent?: BoardroomEntryIntent }) {
    pauseActiveArtifactIfLeavingCreate("boardroom");
    setOverlay(null);
    setBoardroomShariChatOpen(false);
    const intent = options?.intent ?? "home";
    const alreadyInBoardroom = activeSectionRef.current === "boardroom";
    setBoardroomEntryIntent(intent);
    /**
     * Remount when entering Boardroom, or when forcing Home from navigation.
     * Do NOT remount while already inside on a non-home re-entry — that wiped
     * in-progress Board intake (concerns → Q1 restart). Intake draft is also
     * persisted as a second safety net.
     */
    if (!alreadyInBoardroom || intent === "home") {
      setBoardroomEntryKey((k) => k + 1);
    }
    preloadRoomBackground(BOARDROOM_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    playPlaceFirstArrival("round-table");
    syncDirectEstateVisit({
      roomId: "round-table",
      section: "boardroom",
      userIntent: "boardroom",
      userMessageCountAtArrival: messages.filter((m) => m.role === "user")
        .length,
    });
    trackWorkspaceEcosystemEvent("boardroom");
    noteWorkspaceOpened("boardroom", "standalone_room");
    openStandaloneFocusSectionCore("boardroom");
    setEstateRoomChatVisible(false);
  }

  /** Design prototype — Project Homes as Estate places (no project storage). */
  function openProjectHomesPrototypeCore() {
    leaveClearMyMindIfNavigatingAway();
    pauseActiveArtifactIfLeavingCreate("project-homes");
    setOverlay(null);
    preloadRoomBackground(PROJECT_HOMES_ROOM_BACKGROUND);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    trackWorkspaceEcosystemEvent("project-homes");
    noteWorkspaceOpened("project-homes", "standalone_room");
    openStandaloneFocusSectionCore("project-homes");
    setEstateRoomChatVisible(false);
  }

  /** Life Experience Room — full-screen library; letters, not articles. */
  function openLifeExperienceRoomCore() {
    trackWorkspaceEcosystemEvent("life-experience");
    noteWorkspaceOpened("life-experience", "standalone_room");
    clearSplitBesideWorkspace();
    openStandaloneFocusSectionCore("life-experience");
  }

  /** Growth — Your Story landing; pond bench, capture-first, never beside chat. */
  function pushGrowthBackLabel() {
    const from = activeSectionRef.current;
    const label = growthRoomBackLabel(from);
    if (!label) return;
    panelBackStackRef.current.push(label);
    setWorkspacePanelBackLabel(label);
  }

  function openGrowthLandingCore() {
    preloadRoomBackground(GROWTH_ROOM_BG);
    preloadRoomBackground(JOURNAL_ROOM_BG);
    preloadRoomBackground(STORY_LIBRARY_ROOM_BG);
    preloadRoomBackground(CAPTURE_MOMENT_ROOM_BG);
    trackWorkspaceEcosystemEvent("growth");
    noteWorkspaceOpened("growth", "standalone_room");
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("growth");
  }

  function pushGrowBackLabel() {
    const from = activeSectionRef.current;
    const label = growRoomBackLabel(from);
    if (!label) return;
    panelBackStackRef.current.push(label);
    setWorkspacePanelBackLabel(label);
  }

  function openGrowLandingCore() {
    preloadRoomBackground(GROWTH_ROOM_BG);
    trackWorkspaceEcosystemEvent("grow");
    noteWorkspaceOpened("grow", "standalone_room");
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("grow");
  }

  function openGrowSectionCore(section: GrowSectionId) {
    if (section === "grow") {
      openGrowLandingCore();
      return;
    }
    if (section === "grow-momentum-builders") {
      openMomentumBuilderRoomCore();
      return;
    }
    pushGrowBackLabel();
    preloadRoomBackground(GROWTH_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore(section);
  }

  function openMomentumBuilderRoomCore() {
    pushGrowBackLabel();
    preloadRoomBackground(MOMENTUM_BUILDER_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("momentum-builder");
  }

  function pauseActiveArtifactIfLeavingCreate(targetSection: AppSection) {
    if (!shouldPauseArtifactForSection(targetSection)) return;
    const artifact = getActiveArtifact();
    if (!artifact || artifact.status === "finalized") return;
    if (workspacePanelRef.current !== "content-generator") return;
    setActiveArtifact(
      pauseArtifactForRoom(artifact, targetSection, "Cross-room learning break"),
    );
  }

  function openMomentumInstituteRoomCore(drawerId?: string | null) {
    pauseActiveArtifactIfLeavingCreate("momentum-institute");
    setInstituteInitialDrawerId(drawerId ?? null);
    pushGrowBackLabel();
    preloadRoomBackground(MOMENTUM_INSTITUTE_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("momentum-institute");
  }

  function openChamberOfMomentumCore(opts?: {
    memberId?: ChamberMemberId | null;
  }) {
    const memberId = opts?.memberId ?? null;
    const alreadyInChamber =
      activeSectionRef.current === "chamber-of-momentum";

    // Already in the Chamber — switch members without relaunching
    if (alreadyInChamber && memberId) {
      inviteChamberMemberCore(memberId, { skipOpener: true });
      return;
    }

    pauseActiveArtifactIfLeavingCreate("chamber-of-momentum");
    setOverlay(null);
    if (!memberId) {
      clearActiveChamberMember();
      setActiveChamberMemberId(null);
    }
    pushGrowBackLabel();
    preloadRoomBackground(CHAMBER_OF_MOMENTUM_ROOM_BG);
    if (isChamberDemoMode()) {
      ensureChamberDemoDataSeeded();
    }
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    // CB-022 — do not inject Chamber arrival greeting into chat when opening
    // with a member (or while an unresolved topic owns the turn).
    const skipArrivalGreeting =
      Boolean(memberId) ||
      Boolean(activeTopicTurnRef.current?.suppressChamberIntroWriters);
    if (!skipArrivalGreeting) {
      playPlaceFirstArrival("chamber-of-momentum");
    }
    syncDirectEstateVisit({
      roomId: "chamber-of-momentum",
      section: "chamber-of-momentum",
      userIntent: "chamber-of-momentum",
      userMessageCountAtArrival: messages.filter((m) => m.role === "user")
        .length,
    });
    openStandaloneFocusSectionCore("chamber-of-momentum");
    if (memberId) {
      inviteChamberMemberCore(memberId, { skipOpener: true });
    } else {
      setEstateRoomChatVisible(false);
    }
  }

  function openCartographersStudioCore() {
    leaveClearMyMindIfNavigatingAway();
    pauseActiveArtifactIfLeavingCreate("visual-focus");
    setOverlay(null);
    pushGrowBackLabel();
    preloadRoomBackground(CARTOGRAPHERS_STUDIO_BACKGROUND);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    setEstateRoomChatVisible(false);
    syncDirectEstateVisit({
      roomId: "cartographers-studio",
      section: "visual-focus",
      userIntent: "cartographers-studio",
      userMessageCountAtArrival: messages.filter((m) => m.role === "user")
        .length,
    });
    openStandaloneFocusSectionCore("visual-focus");
  }

  function inviteChamberMemberCore(
    memberId: ChamberMemberId,
    opts?: { skipOpener?: boolean },
  ) {
    const previousId = activeChamberMemberIdRef.current;
    const activation = activateChamberMember(memberId);
    if (!activation) return;

    // CB-022 — never surface specialist self-intro / activation opener as a
    // visible writer. Activate quietly; Shari remains the only voice.
    const skipOpener =
      opts?.skipOpener !== false ||
      previousId === memberId ||
      Boolean(activeTopicTurnRef.current?.skipRepeatChamberActivation) ||
      Boolean(activeTopicTurnRef.current?.suppressChamberIntroWriters);

    if (previousId && previousId !== memberId) {
      chatRequestGenerationRef.current += 1;
      supersedeInFlightChatRequest(chatRequestAbortRef.current);
      chatRequestAbortRef.current = null;
      endVisibleThinking();
      setIsLoading(false);
      chamberThreadStartIndexRef.current = 0;
      if (!skipOpener) {
        setMessages([
          { role: "system", content: activation.messages.system },
          { role: "assistant", content: activation.messages.assistant },
        ]);
      }
    } else if (!skipOpener) {
      setMessages((prev) => {
        chamberThreadStartIndexRef.current = prev.length;
        return [
          ...prev,
          { role: "system", content: activation.messages.system },
          { role: "assistant", content: activation.messages.assistant },
        ];
      });
    }

    setActiveChamberMemberId(memberId);
    activeChamberMemberIdRef.current = memberId;
    setEstateRoomChatVisible(true);
    requestChatInputFocus();
  }

  // Estate / People I Help advisory help — invite without navigating to Chamber home
  useEffect(() => {
    function onAdvisoryInvite(event: Event) {
      const detail = (event as CustomEvent<AdvisoryInviteChamberDetail>).detail;
      if (!detail?.memberIds?.length) return;
      const primary = detail.memberIds[0];
      if (!primary) return;
      inviteChamberMemberCore(primary);
    }
    window.addEventListener(ADVISORY_INVITE_CHAMBER_EVENT, onAdvisoryInvite);
    return () =>
      window.removeEventListener(ADVISORY_INVITE_CHAMBER_EVENT, onAdvisoryInvite);
  }, []);

  /**
   * Close contextual Help: restore the suspended conversation and return to
   * the same Business Estate / room place (overlay only — no navigation).
   */
  function closeGuidedFieldHelpChat() {
    const ended = endContextualHelpSession();
    clearPendingGuidedFieldHelp();
    setGuidedFieldHelpChatOpen(false);
    if (!ended) return;
    setMessages(ended.restoredMessages);
    activeConversationIdRef.current = ended.conversationId;
    if (ended.restoredMessages.some((m) => m.role === "user")) {
      saveConversation(ended.restoredMessages);
    }
  }

  // Business Estate section help — fresh contextual help (never prior thread)
  useEffect(() => {
    function onGuidedFieldHelp(event: Event) {
      const detail = (event as CustomEvent<GuidedFieldHelpRequest>).detail;
      openGuidedFieldHelpChat(detail, {
        beginFreshHelpSession: () => {
          const begun = beginContextualHelpSession({
            currentMessages: messagesRef.current.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            place: {
              roomEntryId: getEstateMemory().currentRoom?.entryId ?? null,
              sectionId: detail?.sectionId ?? null,
              fieldPath: detail?.fieldPath ?? null,
              stepOrField: detail?.fieldKey ?? null,
              question: detail?.question ?? null,
            },
            abortController: chatRequestAbortRef.current,
            bumpRequestGeneration: () => {
              chatRequestGenerationRef.current += 1;
            },
          });
          chatRequestAbortRef.current = null;
          activeConversationIdRef.current = begun.helpConversationId;
          setMessages([]);
        },
        openChat: () => setGuidedFieldHelpChatOpen(true),
        ensureEstateChatVisible: () => setEstateRoomChatVisible(true),
        appendAssistantWelcome: (text) => {
          setMessages([{ role: "assistant", content: text }]);
        },
        sendMemberOpener: (opener) => {
          window.setTimeout(() => {
            void handleSendRef.current(opener, false, true, true);
            requestChatInputFocus({ scrollIntoView: true });
          }, 40);
        },
      });
    }

    window.addEventListener(GUIDED_FIELD_HELP_EVENT, onGuidedFieldHelp);
    return () =>
      window.removeEventListener(GUIDED_FIELD_HELP_EVENT, onGuidedFieldHelp);
  }, [requestChatInputFocus]);

  // Plan My Day — I'm Stuck → contextual help with today's plan (not a blank chat)
  useEffect(() => {
    function onPlanDayImStuck(event: Event) {
      const detail = (event as CustomEvent<PlanDayImStuckDetail>).detail ?? {
        itemTitles: [],
      };
      const question = buildPlanDayImStuckQuestion(detail);
      beginContextualHelpSession({
        currentMessages: messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        place: {
          sectionId: "plan-my-day",
          stepOrField: detail.activeStep ?? "im-stuck",
          question,
        },
        abortController: chatRequestAbortRef.current,
        bumpRequestGeneration: () => {
          chatRequestGenerationRef.current += 1;
        },
      });
      chatRequestAbortRef.current = null;
      navigateToChatCore();
      setMessages([{ role: "assistant", content: question }]);
      window.setTimeout(() => {
        requestChatInputFocus({ scrollIntoView: true });
      }, 40);
    }

    window.addEventListener(PLAN_DAY_IM_STUCK_EVENT, onPlanDayImStuck);
    return () =>
      window.removeEventListener(PLAN_DAY_IM_STUCK_EVENT, onPlanDayImStuck);
  }, [requestChatInputFocus]);

  function endChamberMemberConversationCore() {
    dismissActiveChamberConversationCore({
      force: true,
      previousSection: "chamber-of-momentum",
      nextSection: "chamber-of-momentum",
      destinationId: "chamber-of-momentum",
    });
  }

  function saveChamberConversationCore() {
    saveConversation(messages);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Saved. This Chamber conversation is in your history whenever you need it again.",
      },
    ]);
  }

  function printChamberConversationCore() {
    const member = activeChamberMemberId
      ? getChamberMemberById(activeChamberMemberId)
      : null;
    if (!member) return;
    const lines = messages.map((message) => ({
      role: message.role,
      text: message.content,
    }));
    const title = chamberConversationTitle(member, lines);
    const transcript = formatChamberConversationTranscript(lines, member);
    const error = printConversation(title, transcript);
    if (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: error },
      ]);
    }
  }

  function continueChamberConversationCore() {
    setEstateRoomChatVisible(true);
    requestChatInputFocus();
  }

  function startChamberNewTopicCore() {
    const member = activeChamberMemberId
      ? getChamberMemberById(activeChamberMemberId)
      : null;
    if (!member) return;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Fresh topic with ${member.displayName}. What would you like help with?`,
      },
    ]);
    setEstateRoomChatVisible(true);
    requestChatInputFocus();
  }

  function openChamberProjectEntryCore() {
    pauseActiveArtifactIfLeavingCreate("chamber-project-entry");
    pushGrowBackLabel();
    preloadRoomBackground(CHAMBER_OF_MOMENTUM_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("chamber-project-entry");
  }

  function openChamberProjectWorkspaceCore(projectId: string) {
    setProjectsResumeId(projectId);
    openStandaloneFocusSectionCore("projects");
  }

  function routeChamberSectionCore(section: AppSection) {
    if (section === "momentum-institute") {
      openMomentumInstituteRoomCore();
      return;
    }
    if (section === "momentum-builder") {
      openMomentumBuilderRoomCore();
      return;
    }
    if (section === "brain-dump") {
      openClearMyMindCore();
      return;
    }
    if (section === "evidence-bank") {
      enterEvidenceVaultRoomCore({ userIntent: "chamber:evidence-vault" });
      return;
    }
    if (section === "chamber-project-entry") {
      openChamberProjectEntryCore();
      return;
    }
    if (section === "projects") {
      openStandaloneFocusSectionCore("projects");
      return;
    }
    openStandaloneFocusSectionCore(section);
  }

  function routeChamberMomentumIntentCore(intent: ChamberMomentumIntent) {
    const selection = selectChamberJourneySupport({ intent });
    if (selection) stageChamberJourneySelection(selection);
    routeChamberSectionCore(chamberMomentumIntentSection(intent));
  }

  function routeChamberIntelligenceCore(
    assessment: ChamberIntelligenceAssessment,
  ) {
    recordChamberIntelligenceVisit(assessment);
    routeChamberSectionCore(assessment.section);
  }

  function routeChamberNaturalLanguageCore(text: string) {
    const selection = selectChamberJourneySupport({ text });
    if (!selection) return;
    stageChamberJourneySelection(selection);
    if (selection.assessment) {
      stageChamberIntelligence(selection.assessment);
      recordChamberIntelligenceVisit(selection.assessment);
    }
    routeChamberSectionCore(selection.target.section);
  }

  function routeChamberUnsureOptionCore(option: ChamberUnsureOption) {
    if (option === "clear-my-mind") {
      openClearMyMindCore();
      return;
    }
    if (option === "quick-capture") {
      openClearMyMindCore({ initialView: "capture" });
      return;
    }
    openMomentumBuilderRoomCore();
  }

  function openStablesRoomCore() {
    pauseActiveArtifactIfLeavingCreate("stables");
    pushGrowBackLabel();
    preloadRoomBackground(STABLES_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("stables");
  }

  const handleInstituteLearningChat = useCallback(
    (turn: InstituteLearningChatTurn) => {
      instituteLearningHintRef.current = turn.chatHint;
      setInput(turn.memberText);
      requestAnimationFrame(() => requestChatInputFocus());
    },
    [],
  );

  const handleStablesLearningChat = useCallback(
    (turn: StablesLearningChatTurn) => {
      stablesLearningHintRef.current = turn.chatHint;
      setInput(turn.memberText);
      requestAnimationFrame(() => requestChatInputFocus());
    },
    [],
  );

  function openSectionFromUrlCore(section: AppSection) {
    if (section === "breathe") {
      openBreatheOverlayCore();
      return;
    }
    if (section === "chamber-of-momentum") {
      openChamberOfMomentumCore();
      return;
    }
    if (section === "boardroom") {
      openBoardroomCore();
      return;
    }
    if (section === "project-homes") {
      openProjectHomesPrototypeCore();
      return;
    }
    if (section === "chamber-project-entry") {
      openChamberProjectEntryCore();
      return;
    }
    if (section === "grow-momentum-builders" || section === "momentum-builder") {
      openMomentumBuilderRoomCore();
      return;
    }
    if (section === "momentum-institute") {
      openMomentumInstituteRoomCore();
      return;
    }
    if (section === "stables") {
      openStablesRoomCore();
      return;
    }
    if (isGrowPanelSection(section)) {
      openGrowSectionCore(section as GrowSectionId);
      return;
    }
    if (section === "quick-recharge" || section === "games") {
      openStandaloneFocusSectionCore("quick-recharge");
      return;
    }
    if (section === "growth") {
      openGrowthLandingCore();
      return;
    }
    if (isGrowthPanelSection(section)) {
      openGrowthDestinationCore(section);
      return;
    }
    openStandaloneFocusSectionCore(section);
  }

  function openGrowthLibraryCore() {
    pushGrowthBackLabel();
    preloadRoomBackground(STORY_LIBRARY_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("growth-library");
  }

  function openGrowthCaptureCore() {
    pushGrowthBackLabel();
    preloadRoomBackground(CAPTURE_MOMENT_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("growth-capture");
  }

  function openGrowthReportsCore() {
    pushGrowthBackLabel();
    preloadRoomBackground(CELEBRATION_GARDEN_ROOM_BG);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("growth-reports");
  }

  function openUserMemoryCore(tab: MemoryLibraryTab = "all") {
    setMemoryLibraryTab(tab);
    pushGrowthBackLabel();
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore("user-memory");
  }

  function executeEstateRoomActionCore(input: {
    userText: string;
    roomAction: EstateRoomAction;
    reply: string;
  }) {
    const { userText, roomAction, reply } = input;

    switch (roomAction.kind) {
      case "open_journal":
      case "create_journal":
      case "resume_journal":
      case "open_writing_tools": {
        const journalCommand: JournalGazeboCommandKind =
          roomAction.kind === "open_journal"
            ? "open_journal"
            : roomAction.kind === "create_journal"
              ? "create_journal"
              : roomAction.kind === "resume_journal"
                ? "resume_journal"
                : "open_writing_tools";
        openGrowthDestinationCore("growth-journal");
        requestJournalGazeboCommand({ kind: journalCommand });
        break;
      }
      case "launch_creation":
        openCreationWorkspaceCore(
          "content-generator",
          {
            itemType: roomAction.creationIntent === "sop" ? "SOP" : "Document",
            title:
              roomAction.creationIntent === "sop"
                ? "Standard Operating Procedure"
                : "New draft",
            brief: userText,
            source: "chat",
          },
          { ackMessage: reply },
        );
        return;
      case "open_projects":
        openStandaloneFocusSectionCore("projects");
        break;
      case "open_section":
        if (roomAction.section) {
          openGrowthDestinationCore(roomAction.section);
        }
        break;
      case "begin_brainstorm":
      case "remain_in_room":
        break;
      default: {
        const _exhaustive: never = roomAction.kind;
        return _exhaustive;
      }
    }

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  }

  function openGrowthDestinationCore(section: AppSection) {
    // Portfolio ≠ Achievement Library — do not remap growth-portfolio → growth-library
    const resolved = section;
    setOverlay(null);
    if (resolved === "brain-dump") {
      openClearMyMindCore();
      return;
    }
    /** Evidence Vault — EST-001 place-first (room + welcome before form). */
    if (resolved === "evidence-bank") {
      enterEvidenceVaultRoomCore({
        userIntent: lastUserTextRef.current || "open-evidence-vault",
      });
      return;
    }
    pushGrowthBackLabel();
    if (resolved === "growth-journal") {
      const journalPlate =
        resolveEstateRoomBackgroundImage("journal") ?? JOURNAL_ROOM_BG;
      preloadRoomBackground(JOURNAL_ROOM_BG);
      preloadRoomBackground(JOURNAL_WELCOME_PLATE_URL);
      syncEstateSceneActivePlate({
        toRoomId: "journal",
        imageUrl: journalPlate,
      });
      prepareEstateSceneTransitionFireAndForget({
        toRoomId: "journal",
        imageUrl: journalPlate,
        silent: true,
      });
      setEstateRoomChatVisible(false);
      syncDirectEstateVisit({
        roomId: "journal",
        section: "growth-journal",
        userIntent: "growth-journal",
        userMessageCountAtArrival: messages.filter((m) => m.role === "user")
          .length,
      });
    }
    if (resolved === "growth-library") {
      preloadRoomBackground(STORY_LIBRARY_ROOM_BG);
    }
    if (resolved === "wins-this-week") {
      preloadRoomBackground(CELEBRATION_GARDEN_ROOM_BG);
    }
    if (resolved === "growth-greenhouse") {
      preloadRoomBackground(GROWTH_ROOM_BG);
    }
    if (resolved === "growth-reports") {
      preloadRoomBackground(
        getEstateCollectionRoom("celebration-hall").backgroundImage,
      );
    }
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore(resolved);
  }

  /**
   * Evidence Vault EST-001 — enter the place first.
   * Background + Spark welcome + invitation offers; form only after member chooses.
   * When workspaceMode is add/browse, skip the frosted arrival overlay and open the panel.
   */
  function enterEvidenceVaultRoomCore(opts?: {
    userIntent?: string;
    workspaceMode?: "arrive" | "add" | "browse";
    skipWelcome?: boolean;
  }) {
    if (isBreatheDestinationActive(breatheDestination)) {
      closeBreatheOverlayCore({ resume: true });
    }
    /**
     * Vault is its own conversation — never continue a Create / document owner
     * ("We were creating your document…") inside Evidence Vault.
     */
    clearConversationOwner();
    clearUniversalCreationSession();
    setEstateRoomChatVisible(false);
    const mode = opts?.workspaceMode ?? "arrive";
    setEvidenceVaultWorkspaceMode(mode);
    if (mode === "add") {
      setEvidenceVaultSkipEntrance(true);
      setEvidenceVaultChatPrefill(true);
    } else if (mode === "browse") {
      setEvidenceVaultSkipEntrance(true);
    } else {
      setEvidenceVaultSkipEntrance(false);
      setEvidenceVaultArrivalKey((key) => key + 1);
    }
    preloadRoomBackground(EVIDENCE_VAULT_ENTRANCE_BG);
    preloadRoomBackground(EVIDENCE_VAULT_ROOM_BG);
    pushGrowthBackLabel();
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    setOverlay(null);

    const visit: DirectEstateVisit = {
      roomId: "evidence-vault",
      section: "evidence-bank",
      userIntent: opts?.userIntent ?? "evidence-vault",
      userMessageCountAtArrival: messages.filter((m) => m.role === "user")
        .length,
    };
    syncDirectEstateVisit(visit);
    openStandaloneFocusSectionCore("evidence-bank");
    if (opts?.skipWelcome) return;
    const intentionalVault =
      /\b(?:use\s+(?:my\s+)?evidence\s+vault|i\s+want\s+to\s+use|open\s+(?:my\s+)?evidence\s+vault)\b/i.test(
        opts?.userIntent ?? "",
      );
    const welcome = intentionalVault
      ? EVIDENCE_VAULT_INTENTIONAL_ENTRY_WELCOME
      : (estateArrivalShariGreeting("evidence-vault") ??
        EVIDENCE_VAULT_ARRIVAL_WELCOME);
    if (mode === "arrive") {
      /** Door/key ritual first — welcome posts after doors open. */
      setEvidenceVaultPendingWelcome(welcome);
      return;
    }
    setMessages((prev) => {
      if (
        prev.some((m) => m.role === "assistant" && m.content === welcome)
      ) {
        return prev;
      }
      return [...prev, { role: "assistant", content: welcome }];
    });
  }

  function openCollectionRoomWithPrefillCore(
    roomId: EstateCollectionRoomId,
    prefill: EstateCollectionCaptureValues,
    sourceText: string,
  ) {
    setCollectionPrefill({
      roomId,
      values: prefill,
      sourceText,
      savedAt: new Date().toISOString(),
    });
    if (roomId === "evidence-vault") {
      enterEvidenceVaultRoomCore({
        userIntent: sourceText,
        workspaceMode: "add",
        skipWelcome: true,
      });
      return;
    }
    const room = getEstateCollectionRoom(roomId);
    openGrowthDestinationCore(room.section);
  }

  function openWhatsNewCore() {
    if (workspacePanelRef.current === "welcome-room") {
      patchWorkspacePanel(null);
      applyChatLayoutMode("split");
    }
    setOverlay("whats-new");
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
    if (section === "breathe") {
      openBreatheOverlayCore();
      return;
    }
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
      openSectionBesideChatCore(section, undefined, { userInitiated: true });
    } else {
      setActiveSection(section);
    }
  }

  function handleNavSelectCore(nav: SidebarNavId, mode?: CoachingMode) {
    const normalizedNav = normalizeSidebarNav(nav);

    const comingSoon = propertyNavComingSoonMessage(nav);
    if (comingSoon) {
      setWorkspaceContextBanner(comingSoon);
      return;
    }

    if (nav === "clear-my-mind") {
      openClearMyMindCore();
      return;
    }

    if (nav === "plan-my-day") {
      openPlanMyDayCore();
      return;
    }

    if (nav === "todays-reality") {
      openAdaptMyDayCore();
      return;
    }

    if (nav === "growth") {
      openGrowthLandingCore();
      return;
    }

    if (nav === "grow") {
      openGrowLandingCore();
      return;
    }

    if (nav === "journal") {
      openGrowthDestinationCore("growth-journal");
      return;
    }

    if (nav === "portfolio") {
      openGrowthDestinationCore("growth-portfolio");
      return;
    }

    if (nav === "evidence-bank") {
      openGrowthDestinationCore("evidence-bank");
      return;
    }

    if (nav === "confidence-vault") {
      openSectionBesideChatCore("confidence-vault", "confidence-vault", {
        userInitiated: true,
      });
      return;
    }

    if (normalizedNav === "chat") {
      navigateToChatCore();
      if (mode) setCoachingMode(mode);
      return;
    }

    if (normalizedNav === "welcome-room") {
      openWelcomeRoom();
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
      requestChatInputFocus();
      return;
    }

    if (shouldOpenBesideChat(section)) {
      openSectionBesideChatCore(section, normalizedNav, { userInitiated: true });
      return;
    }

    openNavSectionDirectCore(section, normalizedNav);
  }

  function openPeacefulPlacesCore(options?: {
    animate?: boolean;
    categoryId?: string | null;
  }) {
    pushNavigationRestore();
    clearParallelCoachingOffers();
    clearSplitBesideWorkspace();
    const fromIntent = detectAudioRequest(lastUserTextRef.current);
    setFocusAudioCategory(
      options?.categoryId ??
        (fromIntent.isAudio ? fromIntent.categoryId : null),
    );
    trackWorkspaceEcosystemEvent("focus-audio");
    noteWorkspaceOpened("focus-audio", "standalone_room");
    setPeacefulPlacesArrivalActive(Boolean(options?.animate));
    openStandaloneFocusSectionCore("focus-audio");
  }

  function openFocusAudioCore(categoryId?: string | null) {
    openPeacefulPlacesCore({ categoryId });
  }

  function handleMomentumBuilderLaunch(
    launch: import("@/lib/momentumBuilders").MomentumBuilderLaunch,
  ) {
    if (launch.kind === "activity") {
      const activity = getActivityById(launch.activityId);
      if (!activity) return;
      openActivityFullPageCore({
        ...EMPTY_ACTIVITY_SESSION,
        activityId: launch.activityId,
        stepIndex: 0,
        phase: "active",
        categoryId: activity.categoryId,
      });
      return;
    }
    if (launch.kind === "section") {
      if (launch.section === "focus-audio") {
        openFocusAudioCore();
        return;
      }
      openStandaloneFocusSectionCore(launch.section);
    }
  }

  const handleEstateLogOut = useCallback(async () => {
    setOverlay(null);
    if (authConfigured) {
      await signOut();
    }
    router.push("/companion/login?signedOut=1");
  }, [authConfigured, router, signOut]);

  function openProfileEstateRoomFromMenu(
    roomId: ProfileEstateRoomId,
    options?: { emphasizeTimeline?: boolean },
  ) {
    if (roomId === "growth-profile") {
      preloadRoomBackground(GROWTH_ROOM_BG);
      setGrowthProfileEmphasizeTimeline(options?.emphasizeTimeline ?? false);
      syncDirectEstateVisit(null);
      setOverlay("growth-profile");
      return;
    }

    if (roomId === "my-estate") {
      preloadRoomBackground(ESTATE_PROFILE_ROOM_BG);
      setGrowthProfileEmphasizeTimeline(false);
      syncDirectEstateVisit(null);
      setOverlay("my-business-estate");
      return;
    }

    if (roomId === "evidence-vault" || roomId === "portfolio") {
      const section = profileEstateSectionForRoom(roomId);
      const bg = profileEstateRoomBackgroundImage(roomId);
      preloadRoomBackground(bg);
      setGrowthProfileEmphasizeTimeline(false);
      setOverlay(null);
      if (roomId === "evidence-vault") {
        enterEvidenceVaultRoomCore({
          userIntent: "estate-menu:evidence-vault",
        });
        return;
      }
      syncDirectEstateVisit(null);
      openGrowthDestinationCore(section);
      return;
    }

    const section = profileEstateSectionForRoom(roomId);
    const bg = profileEstateRoomBackgroundImage(roomId);
    preloadRoomBackground(bg);
    setGrowthProfileEmphasizeTimeline(false);
    setOverlay(null);
    syncDirectEstateVisit({
      roomId,
      section,
      userIntent: `estate-menu:${roomId}`,
      userMessageCountAtArrival: messages.filter((m) => m.role === "user").length,
    });
    openStandaloneFocusSectionCore(section);
  }

  function openProfileDestinationCore(destination: ProfileDestination) {
    const navigation = resolveProfileDestinationNavigation(destination);
    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: navigation.destinationId,
      kind: "overlay",
    });
    preloadRoomBackground(ESTATE_PROFILE_ROOM_BG);
    setGrowthProfileEmphasizeTimeline(false);
    syncDirectEstateVisit(null);
    // Explicit 1:1 mapping — never fall through My Profile to Business Estate.
    switch (navigation.kind) {
      case "people-i-help-overlay":
        setOverlay("people-i-help");
        return;
      case "profile-personal-overlay":
        setOverlay("profile-personal");
        return;
      case "my-business-estate-overlay":
        setOverlay("my-business-estate");
        return;
      default: {
        const _exhaustive: never = navigation;
        return _exhaustive;
      }
    }
  }

  function launchPreviewTestExperience(
    target: CompanionPreviewTestLaunchTarget,
    roomId?: string,
  ) {
    if (!isCompanionPreviewTestHarnessArmed()) return;

    if (target === "welcome-home") {
      setCompanionPreviewTestLaunch({ target });
      returnToWelcomeHomeLobby("preview-test:welcome-home");
      setWelcomeHomeReplay(true);
      setPreviewTestRevision(getCompanionPreviewTestRevision());
      return;
    }

    if (target === "profile-estate" && roomId) {
      setCompanionPreviewTestLaunch({
        target,
        profileRoomId: roomId,
      });
      openProfileEstateRoomFromMenu(roomId as ProfileEstateRoomId);
      setPreviewTestRevision(getCompanionPreviewTestRevision());
      return;
    }

    const estateRoomId =
      roomId ?? (target === "discovery-key" ? "greenhouse" : "coffee-house");
    const section = estateSectionForEntryId(estateRoomId) ?? "home";

    if (target === "discovery-key") {
      previewDiscoveryHistoryStoreRef.current =
        new InMemoryDiscoveryHistoryStore();
      const discoverySession = buildPreviewDiscoveryKeySession(
        getDiscoveryMemberId(),
        estateRoomId,
      );
      setCompanionPreviewTestLaunch({
        target,
        roomId: estateRoomId,
        discoverySession,
      });
    } else {
      setCompanionPreviewTestLaunch({ target, roomId: estateRoomId });
    }

    setOverlay(null);
    setGrowthProfileEmphasizeTimeline(false);
    syncDirectEstateVisit({
      roomId: estateRoomId,
      section,
      userIntent: `preview-test:${target}`,
      userMessageCountAtArrival: messages.filter((m) => m.role === "user").length,
    });
    openStandaloneFocusSectionCore(section);

    if (target === "shari-arrival") {
      window.requestAnimationFrame(() => {
        dispatchEstateArrivalStart({
          roomId: estateRoomId,
          shariGreeting: estateArrivalShariGreeting(estateRoomId) ?? undefined,
          playAmbience: true,
        });
      });
    }

    setPreviewTestRevision(getCompanionPreviewTestRevision());
  }

  function resetPreviewTestExperience() {
    clearCompanionPreviewTestLaunch();
    setWelcomeHomeReplay(false);
    setPreviewTestRevision(getCompanionPreviewTestRevision());
  }

  function openSparkEstateGuideCore() {
    setEstateGuideFlipbookOpen(true);
  }

  function clearJustBeHereMode() {
    if (justBeHereEnterTimerRef.current) {
      clearTimeout(justBeHereEnterTimerRef.current);
      justBeHereEnterTimerRef.current = null;
    }
    setJustBeHereSession(null);
    setJustBeHerePhase(null);
    setJustBeHereChatVisible(false);
  }

  function enterJustBeHere(roomId: string) {
    if (justBeHereEnterTimerRef.current) {
      clearTimeout(justBeHereEnterTimerRef.current);
    }
    setJustBeHereSession({ roomId, enteredAt: Date.now() });
    setJustBeHerePhase("entering");
    justBeHereEnterTimerRef.current = setTimeout(() => {
      setJustBeHerePhase("active");
      justBeHereEnterTimerRef.current = null;
    }, JUST_BE_HERE_ENTER_MS);

    const profile = resolveEstatePlaceAmbientProfile(roomId);
    if (profile) {
      setEstateAmbienceEnabled(true);
      kickstartEstateRoomAmbience(roomId, profile);
      setJustBeHereSoundEnabled(true);
    } else {
      setJustBeHereSoundEnabled(isEstateAmbienceEnabled());
    }
    setJustBeHereChatVisible(false);
  }

  function toggleJustBeHereChat() {
    setJustBeHereChatVisible((visible) => !visible);
  }

  function toggleEstateRoomChat() {
    if (justBeHereSession) {
      toggleJustBeHereChat();
      return;
    }
    setEstateRoomChatVisible((visible) => {
      const next = !visible;
      patchExperienceControlPrefs({
        conversationVisibility: next ? "showing" : "hidden",
      });
      return next;
    });
  }

  function setEstateRoomChatVisiblePreserving(visible: boolean) {
    if (justBeHereSession) {
      setJustBeHereChatVisible(visible);
      return;
    }
    patchExperienceControlPrefs({
      conversationVisibility: visible ? "showing" : "hidden",
    });
    setEstateRoomChatVisible(visible);
  }

  /**
   * Authoritative Welcome Home return (106–108).
   * Always returns to the Welcome Home lobby (not everyday chat shell).
   * Leaving Evidence Vault starts a fresh chat — vault welcome must not linger.
   */
  function returnToWelcomeHome(reason = "welcome home") {
    returnToWelcomeHomeLobby(reason);
  }

  function navigateBackToEstateHome() {
    const leavingEvidenceVault =
      activeSectionRef.current === "evidence-bank" ||
      directEstateVisitRef.current?.roomId === "evidence-vault";
    returnToWelcomeHome("welcome home");
    if (leavingEvidenceVault) {
      clearTodayContext({ preserveRoom: true, mode: "new-chat" });
      setFreshStartRevision((revision) => revision + 1);
    }
  }

  function handleEstateWander(fromRoomId: string) {
    /**
     * Clear My Mind Mode — stay in the capture workspace until explicit exit.
     * Wander must not drop the member into frosted estate chat on another room.
     */
    if (
      isClearMyMindModeActive() ||
      activeSectionRef.current === "brain-dump"
    ) {
      return;
    }

    const pick = pickWanderDestination(fromRoomId);
    if (!pick || !validateWanderPick(pick)) return;

    const command = estateNavigateCommandForPlace(pick.legacyPlaceId, "wander");
    if (!command) return;

    recordWanderTransition(fromRoomId, pick.place);
    runDirectEstateRoomNavigation(command, "wander", undefined, {
      skipAssistantMessage: true,
    });
  }

  /**
   * Explore Spark — open the approved visual Estate explorer.
   * Never wander into Create / Create Studio.
   */
  function openExploreSparkVisualExplorer() {
    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: "explore-estate",
      kind: "explore-estate",
    });
    setWelcomeHomeEstateMapVisible(false);
    setExploreSparkMapOpen(true);
  }

  function handleExploreSparkMapSelect(location: EstateMapLocation) {
    const dest = getExploreEstateDestinationById(location.id);
    const placeId = resolveExploreMapLocationPlaceId(dest ?? location);
    if (!placeId) {
      return;
    }

    const isWelcomeHomePlace =
      placeId === "welcome-home" || placeId === "spark-estate";
    if (isWelcomeHomePlace) {
      returnToWelcomeHomeLobby(`Explore Estate: ${location.name}`);
      return;
    }

    /** Close Explore before the room hop — never leave the map covering arrival. */
    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: placeId,
      kind: "section",
    });
    leaveClearMyMindIfNavigatingAway();

    markExploreEstateReturnPending();
    setExploreEstateReturnAvailable(true);

    if (dest?.destinationType === "overlay" && placeId === "my-business-estate") {
      openProfileDestinationCore("my-business-estate");
      return;
    }

    const command = estateNavigateCommandForPlace(
      placeId,
      `Explore Estate: ${location.name}`,
    );
    if (!command) {
      setExploreSparkMapOpen(true);
      return;
    }

    const commandPlace = command.roomId ?? command.entryId;
    if (
      commandPlace === "welcome-home" ||
      commandPlace === "spark-estate" ||
      command.entryId === "welcome-home" ||
      command.entryId === "spark-estate"
    ) {
      returnToWelcomeHomeLobby(`Explore Estate: ${location.name}`);
      return;
    }

    runDirectEstateRoomNavigation(command, `Explore Estate: ${location.name}`, undefined, {
      skipAssistantMessage: true,
    });
  }

  function toggleJustBeHereSound() {
    const roomId = justBeHereSession?.roomId;
    if (!roomId) return;
    if (justBeHereSoundEnabled) {
      setEstateAmbienceEnabled(false);
      setJustBeHereSoundEnabled(false);
      void stopAllEstateEnvironmentalAudio();
      return;
    }
    const profile = resolveEstatePlaceAmbientProfile(roomId);
    if (!profile) return;
    setEstateAmbienceEnabled(true);
    setJustBeHereSoundEnabled(true);
    kickstartEstateRoomAmbience(roomId, profile);
  }

  function returnFromJustBeHere() {
    returnToWelcomeHomeLobby("just be here return");
  }

  /** Full reset into Welcome Home lobby — clears overlays, visits, and panels that block welcomeHomePrimary. */
  function returnToWelcomeHomeLobby(reason: string) {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        /* member declined or browser blocked */
      });
    }

    /** Invalidate in-flight standalone room opens so they cannot overwrite Welcome Home. */
    estateSectionNavEpochRef.current += 1;

    const fromSection = activeSectionRef.current;

    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: "welcome-home",
      kind: "welcome-home",
    });
    clearExploreEstateReturnPending();
    setExploreEstateReturnAvailable(false);

    if (isBreatheDestinationActive(breatheDestination)) {
      if (breatheTransitionTimerRef.current) {
        clearTimeout(breatheTransitionTimerRef.current);
        breatheTransitionTimerRef.current = null;
      }
      if (breatheResumeTimerRef.current) {
        clearTimeout(breatheResumeTimerRef.current);
        breatheResumeTimerRef.current = null;
      }
      setBreatheDestination(EMPTY_BREATHE_DESTINATION);
      setBreatheResumeActive(false);
      breathePausedTimerRef.current = false;
    }

    if (isClearMyMindModeActive() || fromSection === "brain-dump") {
      exitClearMyMindMode();
    }

    clearJustBeHereMode();
    dismissActiveChamberConversationCore({
      force: true,
      destinationId: "welcome-home",
      previousSection: fromSection,
      nextSection: "home",
    });
    setBoardroomShariChatOpen(false);
    setPreferEverydayConversation(false);
    preferEverydayConversationRef.current = false;
    setWelcomeHomeIntroActive(false);
    setWelcomeHomeReplay(false);
    setEstateRoomChatVisible(false);
    syncDirectEstateVisit(null);
    clearEstatePendingTransition();
    setExploreSparkMapOpen(false);

    /**
     * Always the Welcome Home entrance photograph — never a leftover Library
     * plate or a room backdrop override from Change background.
     */
    clearRoomBackdropOverride("welcome-home");
    const welcomeHomePlate = WELCOME_ROOM_ASSET;
    syncEstateSceneActivePlate({
      toRoomId: "welcome-home",
      imageUrl: welcomeHomePlate,
      force: true,
    });
    prepareEstateSceneTransitionFireAndForget({
      toRoomId: "welcome-home",
      imageUrl: welcomeHomePlate,
      silent: true,
    });
    setEstateConservatoryEngaged(false);
    setMomentumBuilderArrivalActive(false);
    setGuideBesideSession(null);
    setCompanionStandaloneSection(null);
    companionReturnSectionRef.current = null;
    setActivitySession(EMPTY_ACTIVITY_SESSION);
    activitySessionRef.current = EMPTY_ACTIVITY_SESSION;
    setDecisionCompassSession(null);
    setDecisionCompassPrefill(null);
    setPlanMyDayDrawerOpen(false);
    setPlanMyDayOpenItemId(null);
    setPlanMyDayInitialArea(null);
    setPlanMyDayInitialRhythmsTab(null);
    setOverlay(null);
    setSettingsSection(null);
    setEstateGuideFlipbookOpen(false);

    recordEstateRoomTransition({
      toSection: "home",
      toEntryId: "welcome-home",
      fromSection,
      reason,
      preserveChat: true,
      playArrival: false,
    });
    setCurrentRoom("welcome-home");

    backInterceptorRef.current = null;
    goingBackRef.current = false;
    void stopAllEstateEnvironmentalAudio();
    setArrivalNavImmersion(false);
    applyChatLayoutMode("split");
    setWorkspaceFirstSplit(false);
    closeWorkspacePanel({
      mode: "hide",
      silent: true,
      skipSectionRestore: true,
    });
    panelBackStackRef.current = [];
    setWorkspacePanelBackLabel(null);
    navHistoryRef.current = createNavigationHistoryStack();
    sectionHistoryRef.current = [];

    setActiveSection("home");
    activeSectionRef.current = "home";
    setActiveNav("chat");
    onEstatePlaceArrived({ placeId: "welcome-home", section: "home" });

    /** Reveal lobby after welcomeHomePrimary becomes true (effect consumes the flag). */
    pendingWelcomeHomeLobbyRevealRef.current = true;
    setWelcomeHomeEstateMapVisible(true);
    requestAnimationFrame(() => {
      requestChatInputFocus({ preventScroll: true });
    });
  }

  function handleEstateMenuAction(actionId: EstateMenuActionId) {
    if (actionId === "experience-controls") {
      setExperienceControlsOpen(true);
      return;
    }

    if (actionId === "memory-library") {
      openUserMemoryCore("all");
      return;
    }
    if (actionId === "journal") {
      openGrowthDestinationCore("growth-journal");
      return;
    }

    const sparkEstateDestination = profileDestinationForMenuAction(actionId);
    if (sparkEstateDestination) {
      openProfileDestinationCore(sparkEstateDestination);
      return;
    }

    if (actionId === "replay-welcome") {
      // Welcome audio is first-login only — never replay after that.
      return;
    }

    if (isProfileEstateMenuAction(actionId)) {
      openProfileEstateRoomFromMenu(profileEstateRoomForMenuAction(actionId), {
        emphasizeTimeline: actionId === "progress-timeline",
      });
      return;
    }

    const shellActionId = actionId as EstateMenuShellActionId;

    switch (shellActionId) {
      case "institute-cabinet":
        setOverlay("institute-cabinet");
        return;
      case "seeds-planted":
        setOverlay(null);
        openGrowSectionCore("grow-spark-cards");
        return;
      case "goals-projects":
        setOverlay(null);
        openProjectHomesPrototypeCore();
        return;
      case "start-new-conversation":
        requestClearTodayContext();
        return;
      case "start-new-day-conversation":
        requestBeginNewDay();
        return;
      case "settings":
        dismissTransientEstateExperiencesForDestinationSwitch({
          destinationId: "settings",
          kind: "overlay",
        });
        setSettingsSection(null);
        setOverlay("settings");
        return;
      case "notifications":
        dismissTransientEstateExperiencesForDestinationSwitch({
          destinationId: "settings-notifications",
          kind: "overlay",
        });
        setSettingsSection("notifications");
        setOverlay("settings");
        return;
      case "voice-settings":
        dismissTransientEstateExperiencesForDestinationSwitch({
          destinationId: "settings-voice",
          kind: "overlay",
        });
        setSettingsSection("plan");
        setOverlay("settings");
        return;
      case "log-out":
        void handleEstateLogOut();
        return;
      default: {
        const _exhaustive: never = shellActionId;
        return _exhaustive;
      }
    }
  }

  /**
   * Universal Access (#183) — fulfill an explicit capability request from any room.
   * Exits Clear My Mind Mode when leaving for another capability so location never blocks.
   * Always user-initiated so Phase 1 / context locks cannot deny access.
   */
  function fulfillUniversalCapabilityRequest(
    request: UniversalCapabilityRequest,
  ): void {
    const leavingClearMyMind =
      request.capabilityId !== "clear-my-mind" &&
      request.capabilityId !== "breathe" &&
      (isClearMyMindModeActive() ||
        activeSectionRef.current === "brain-dump");
    if (leavingClearMyMind) {
      exitClearMyMindMode();
    }

    const openBeside = (section: AppSection) => {
      openWorkspaceBesideChatCore(section, workspaceOpenAck(section), {
        userInitiated: true,
      });
    };

    switch (request.capabilityId) {
      case "clear-my-mind":
        openClearMyMindCore({ silent: true });
        break;
      case "visual-thinking": {
        const viewId = request.visualStudioViewId ?? "mind-map";
        const mode = studioModeForViewId(viewId);
        completeVisualThinkingOpen({
          mode,
          viewId,
          viewTitle: visualThinkingViewTitle(viewId),
          ack: request.ack,
        });
        break;
      }
      case "focus-timer":
        openStandaloneFocusSectionCore("focus-timer");
        break;
      case "calendar":
        openCalendarCore();
        break;
      case "projects":
        openProjectHomesPrototypeCore();
        break;
      case "journal":
        openGrowthDestinationCore("growth-journal");
        break;
      case "evidence-vault":
        enterEvidenceVaultRoomCore({
          userIntent: "universal:evidence-vault",
        });
        break;
      case "destination-gallery":
        openDestinationGalleryCore();
        break;
      case "google-workspace":
        openCreateWorkspace({ source: "hard_nav", hardNavCommand: "google" });
        break;
      case "decision-compass":
        openDecisionCompass();
        break;
      case "plan-my-day":
        openPlanMyDayCore();
        break;
      case "breathe":
        openBreatheOverlayCore({
          patternId: request.breathePatternId,
        });
        break;
      case "peaceful-places":
        openFocusAudioCore();
        break;
      case "content-create":
        openCreateWorkspace({ source: "hard_nav", hardNavCommand: "create" });
        break;
      case "strategies":
        openBeside("playbook");
        break;
      case "saved-work":
        openBeside("saved-work");
        break;
      case "templates":
        openBeside("templates-library");
        break;
      case "client-avatars":
        openBeside("client-avatars");
        break;
      case "momentum-games":
        openStandaloneFocusSectionCore("quick-recharge");
        break;
      case "spin-wheel":
        openStandaloneFocusSectionCore("spin-wheel");
        break;
      default: {
        const _exhaustive: never = request.capabilityId;
        return _exhaustive;
      }
    }
  }

  function handleToolSelectCore(tool: SidebarToolId) {
    switch (tool) {
      case "brain-dump":
        openClearMyMindCore();
        break;
      case "focus-timer":
        openStandaloneFocusSectionCore("focus-timer");
        break;
      case "breathe":
        openBreatheOverlayCore();
        break;
      case "focus-audio":
        openFocusAudioCore(detectAudioRequest(lastUserTextRef.current).categoryId);
        break;
      case "time-block":
        openCalendarItemCore(timeBlockFocusId, "tool");
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
        openStandaloneFocusSectionCore("quick-recharge");
        break;
      case "reset-day":
        requestClearTodayContext();
        break;
      case "voice":
        toggleVoiceMode();
        setActiveSection("home");
        requestChatInputFocus();
        break;
    }
  }

  function executeExplicitCompanionAction(
    action: ExplicitCompanionAction,
    finishLatencyTurn: (opts?: {
      localReply?: boolean;
      calledApi?: boolean;
    }) => void,
  ) {
    clearFrictionlessPending();
    clearPendingAcceptanceAuthority();
    setToolSuggestion(null);
    setWorkspaceOffer(null);
    setAwaitingUserConfirmation(null);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: action.message },
    ]);

    switch (action.kind) {
      case "open-breathe":
        handleToolSelectCore("breathe");
        break;
      case "open-spin-wheel":
        setSpinWheelAutoSpin(true);
        handleToolSelectCore("spin-wheel");
        break;
      case "start-timer": {
        savePreferredFocusMinutes(action.minutes);
        logMomentum("start", `Focus session from chat — ${action.minutes} min`);
        pomodoroTimer.startWith(action.minutes);
        setActiveNav("focus");
        setCoachingMode("focus");
        openStandaloneFocusSectionCore("focus-timer");
        break;
      }
    }

    finishEarlyChatTurn();
    finishLatencyTurn({ localReply: true });
  }

  function handleFocusHubAction(action: FocusHubAction) {
    switch (action.kind) {
      case "tool":
        handleToolSelectCore(action.tool);
        break;
      case "section":
        if (isPlanMyDaySection(action.section)) {
          openPlanMyDayCore();
          break;
        }
        if (isClearMyMindSection(action.section)) {
          openClearMyMindCore();
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
    unlockNotificationSounds();
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
    if (!playNotificationSoundForEvent("test", "test-alert")) {
      playChime();
    }
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
        openCalendarItemCore(block.id, "legacy-redirect");
        return;
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
    openCalendarItemCore(blockId ?? null, "project");
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

  /** Get Advice → Strategy Library (Spark Estate destination — not split workspace). */
  function openStrategyLibraryCore(opts?: {
    openView?: "home" | "adhd" | "business" | "saved" | "recommended";
    strategyId?: string;
  }) {
    setOverlay(null);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    setStrategyPanelCommand({
      key: Date.now(),
      openView: opts?.openView ?? "home",
      strategyId: opts?.strategyId,
    });
    trackWorkspaceEcosystemEvent("playbook");
    noteWorkspaceOpened("playbook", "standalone_room");
    openStandaloneFocusSectionCore("playbook");
  }

  function startBusinessStrategyBuilder(typeLabel: string) {
    setBusinessStrategyDraft(null);
    setStrategyApplySession(null);
    clearStrategyApplySession();
    setStrategyPanelCommand(null);
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    workspaceCoachSeededRef.current = null;
    if (activeSectionRef.current !== "playbook") {
      noteWorkspaceOpened("playbook", "standalone_room");
      openStandaloneFocusSectionCore("playbook");
    } else {
      setActiveNav("playbook");
    }
    setEstateRoomChatVisible(true);
    const { session, opener } = bootstrapBusinessStrategySession(typeLabel);
    setBusinessStrategySession(session);
    setMessages((prev) => [...prev, { role: "assistant", content: opener }]);
    requestChatInputFocus();
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
    setCompanionStandaloneSection(null);
    setWorkspaceFirstSplit(false);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    setStrategyPanelCommand({ key: Date.now(), strategyId });
    if (activeSectionRef.current !== "playbook") {
      noteWorkspaceOpened("playbook", "standalone_room");
      openStandaloneFocusSectionCore("playbook");
    } else {
      setActiveNav("playbook");
    }
    setEstateRoomChatVisible(true);

    const boot = bootstrapStrategyApplySession(strategyId, {
      activeProjectName: pickActiveProjectName(),
    });
    if (!boot) return;
    setStrategyApplySession(boot.session);
    saveStrategyApplySession(boot.session, { workspacePanelOpen: true });
    beginStrategyApplyVisibleChat(boot.opener, strategyId);
    requestChatInputFocus();
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

  function handlePeacefulPlacesGardenActivity(activityId: string) {
    const activity = getActivityById(activityId);
    if (!activity) return;
    setFocusAudioCategory(null);
    setPeacefulPlacesArrivalActive(false);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openActivityFullPageCore(buildActiveActivitySession(activity));
  }

  function handlePeacefulPlacesGardenSection(section: AppSection) {
    setFocusAudioCategory(null);
    setPeacefulPlacesArrivalActive(false);
    clearSplitBesideWorkspace();
    patchWorkspacePanel(null);
    openStandaloneFocusSectionCore(section);
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
          setEstateRoomChatVisible(true);
          requestChatInputFocus();
          if (businessStrategyDraft) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Your **${businessStrategyDraft.typeLabel}** outline is ready. What should we flesh out first — weekly breakdown, content ideas, messaging, or something else?`,
              },
            ]);
          }
        }}
      />
    );
  }

  function renderStrategyLibraryEstate(extra?: {
    registerBack?: (fn: (() => boolean) | null) => void;
  }) {
    return (
      <StrategyLibraryEstatePanel
        onBack={goBack}
        registerBack={extra?.registerBack}
        onOpen={openWorkspaceFromSection}
        onAsk={handlePlaybookAsk}
        onContextChange={handleWorkspaceDetailChange}
        onStartBusinessStrategy={startBusinessStrategyBuilder}
        onStartStrategyApply={startStrategyApplyCoach}
        onOpenActivity={handleStrategiesOpenActivity}
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
          setEstateRoomChatVisible(true);
          requestChatInputFocus();
          if (businessStrategyDraft) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Your **${businessStrategyDraft.typeLabel}** outline is ready. What should we flesh out first — weekly breakdown, content ideas, messaging, or something else?`,
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

  function clearPendingCommitmentAuthority() {
    setPendingCommitment(null);
  }

  function consumePendingCommitment(consumed: PendingConversationCommitment) {
    lastConsumedCommitmentIdRef.current = consumed.id;
    setPendingCommitment(null);
  }

  function registerCommitmentFromAssistant(assistantText: string) {
    const commitment = createConversationCommitment(
      assistantText,
      chatTurnRef.current,
    );
    if (commitment) setPendingCommitment(commitment);
  }

  function applyWorkflowContinuation(
    result: WorkflowContinuationResult,
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
    consumePendingInvitation();
    setConversationWorkflow(null);
    clearPendingAcceptanceAuthority();
    clearPendingCommitmentAuthority();

    if (result.action === "open_section") {
      switch (result.section) {
        case "brain-dump":
          openClearMyMindCore({
            initialView: "capture",
            silent: true,
          });
          break;
        case "decision-compass":
          openDecisionCompass();
          break;
        case "energy":
          setActiveSection("energy");
          activeSectionRef.current = "energy";
          break;
        case "plan-my-day":
          openPlanMyDayCore();
          break;
        default:
          openSectionBesideChatCore(result.section);
          break;
      }
    } else if (result.action === "open_tool") {
      if (result.tool === "focus-audio") {
        openFocusAudioCore(
          detectAudioRequest(
            conversationWorkflow?.assistantQuestion ?? result.message,
          ).categoryId,
        );
      } else {
        handleToolSelectCore(result.tool);
      }
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: result.message },
    ]);
    setInput("");
    voiceUsedRef.current = false;
    finishEarlyChatTurn();
    return true;
  }

  function publishConversationOffer(
    offerLine: string,
    workspaceOffer?: WorkspaceOffer | null,
  ) {
    const { workflow, commitment } = trackConversationOffer({
      offerLine,
      offeredAtTurn: chatTurnRef.current,
      workspaceOffer,
    });
    if (workflow) setConversationWorkflow(workflow);
    if (commitment) setPendingCommitment(commitment);
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
    _fresh: boolean,
  ): boolean {
    if (
      isFrictionlessAffirmation(trimmed) ||
      isConfirmationAcceptance(trimmed)
    ) {
      const frictionlessPending = loadFrictionlessPendingForConfirmation({
        confirmationReply: true,
        awaitingPending: awaitingUserConfirmationRef.current?.frictionlessPending,
        lastAssistantText,
        currentTurn: chatTurnRef.current,
      });
      if (frictionlessPending) {
        const continuation = resolveFrictionlessContinuation(
          trimmed,
          frictionlessPending,
          chatTurnRef.current,
          lastAssistantText,
        );
        if (continuation?.execute) {
          if (frictionlessPending.target === "focus-audio") {
            openFocusAudioCore(
              frictionlessPending.focusAudioCategory ??
                detectAudioRequest(lastAssistantText).categoryId,
            );
          } else if (frictionlessPending.target === "breathe") {
            handleToolSelectCore("breathe");
          } else if (frictionlessPending.target === "brain-dump") {
            handleToolSelectCore("brain-dump");
          } else if (frictionlessPending.target === "decision-compass") {
            openDecisionCompass();
          } else if (frictionlessPending.target === "playbook") {
            openSectionBesideChatCore("playbook", undefined, {
              userInitiated: true,
            });
          } else if (
            frictionlessPending.type === "open_workspace" &&
            frictionlessPending.target !== "visual-focus"
          ) {
            const offer =
              workspaceOffer ??
              ({
                section: frictionlessPending.target,
                buttonLabel:
                  frictionlessPending.offerSummary ??
                  frictionlessPending.label ??
                  "Continue",
                line: frictionlessPending.context,
              } satisfies WorkspaceOffer);
            acceptWorkspaceOfferCore(offer);
            if (frictionlessPending.target !== "content-generator") {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: continuation.ack },
              ]);
            }
            clearFrictionlessPending();
            clearPendingAcceptanceAuthority();
            setToolSuggestion(null);
            setWorkspaceOffer(null);
            setAwaitingUserConfirmation(null);
            setConversationWorkflow(null);
            setInput("");
            voiceUsedRef.current = false;
            finishEarlyChatTurn();
            return true;
          }
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: continuation.ack },
          ]);
          clearFrictionlessPending();
          clearPendingAcceptanceAuthority();
          setToolSuggestion(null);
          setWorkspaceOffer(null);
          setAwaitingUserConfirmation(null);
          setConversationWorkflow(null);
          setInput("");
          voiceUsedRef.current = false;
          finishEarlyChatTurn();
          return true;
        }
      }
    }

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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `I've opened **${template.name}** in Create with proven questions already loaded — ` +
            "edit anything to match your voice, then share it with customers.",
        },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      finishEarlyChatTurn();
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

    const hasRealArtifactDraft = Boolean(
      creationContext?.artifactTypeLocked &&
        creationContext?.draftContent?.trim(),
    );

    const resolution = resolveCompanionAcceptanceTurn({
      userText: trimmed,
      lastAssistantText,
      currentTurn: chatTurnRef.current,
      workflow: conversationWorkflow,
      commitment: pendingCommitment,
      lastConsumedCommitmentId: lastConsumedCommitmentIdRef.current,
      hasRealArtifactDraft,
      outcomeThread: getOutcomeThread(),
      pendingInput: {
        workspacePanel: workspacePanelRef.current,
        record: pendingAcceptanceRecord,
        pendingAction: pendingNow,
        createConsent: pendingCreateOpen,
      },
    });

    if (resolution.kind === "commitment") {
      const commitmentResult = resolution.resolution;
      switch (commitmentResult.outcome) {
        case "decline": {
          consumePendingCommitment(commitmentResult.consumed);
          setConversationWorkflow(null);
          clearPendingAcceptanceAuthority();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: commitmentResult.message },
          ]);
          setInput("");
          voiceUsedRef.current = false;
          finishEarlyChatTurn();
          return true;
        }
        case "duplicate": {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: DUPLICATE_COMMITMENT_MESSAGE },
          ]);
          setInput("");
          voiceUsedRef.current = false;
          finishEarlyChatTurn();
          return true;
        }
        case "no_pending": {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: COMMITMENT_CLARIFY_MESSAGE },
          ]);
          setInput("");
          voiceUsedRef.current = false;
          finishEarlyChatTurn();
          return true;
        }
        case "expired":
          break;
        case "affirm": {
          consumePendingCommitment(commitmentResult.consumed);
          return applyWorkflowContinuation(commitmentResult.continuation);
        }
        case "affirm_create": {
          consumePendingCommitment(commitmentResult.consumed);
          setConversationWorkflow(null);
          clearPendingAcceptanceAuthority();
          openSectionBesideChatCore("content-generator");
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: commitmentResult.message },
          ]);
          setInput("");
          voiceUsedRef.current = false;
          finishEarlyChatTurn();
          return true;
        }
        case "affirm_export": {
          consumePendingCommitment(commitmentResult.consumed);
          if (hasRealArtifactDraft && exportOffer) {
            setArtifactExportOffer(exportOffer);
          }
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: commitmentResult.message },
          ]);
          setInput("");
          voiceUsedRef.current = false;
          finishEarlyChatTurn();
          return true;
        }
      }
    }

    if (resolution.kind === "workflow") {
      return applyWorkflowContinuation(resolution.continuation);
    }

    if (resolution.kind === "pending") {
      const pending = resolution.result;
      if (
        pending.outcome === "conversation" ||
        pending.outcome === "expired"
      ) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: pending.message },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        finishEarlyChatTurn();
        return true;
      }
      if (dispatchResolvedAcceptance(pending, pendingNow)) {
        setInput("");
        voiceUsedRef.current = false;
        finishEarlyChatTurn();
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
            workspaceConsentGranted: true,
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

  function clearOfferStateOnly() {
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

  function clearAllPendingOffers() {
    clearOfferStateOnly();
    clearEstatePendingTransition();
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
    options?: { userInitiated?: boolean },
  ) {
    if (isClearMyMindSection(section)) {
      openClearMyMindCore();
      return;
    }
    if (isPlanMyDaySection(section)) {
      openPlanMyDayCore();
      return;
    }
    // Legacy Momentum Appointments → current Plan My Day Calendar (never split-chat).
    if (section === "time-block") {
      openCalendarItemCore(timeBlockFocusId, "legacy-redirect");
      return;
    }
    if (redirectLegacyCreateWorkspaceIfNeeded(section)) return;
    clearParallelCoachingOffers();
    if (section === "content-generator") {
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("other");
        ensureSplitBesideChatLayout();
        revealWorkspace();
      } else if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession(undefined, ack)
      ) {
        ensureSplitBesideChatLayout();
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
      ensureSplitBesideChatLayout();
      revealWorkspace();
      appendVerifiedWorkspaceMessage(section, ack, { appendOnly: true });
      return;
    }

    pushNavigationRestore();
    patchWorkspacePanel(section, {
      userInitiated: options?.userInitiated ?? true,
    });
    setWorkspaceDetail(emptyWorkspaceDetail());
    setActiveSection("home");
    activeSectionRef.current = "home";
    ensureSplitBesideChatLayout();
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

  async function executeGoogleSheetCreateFromPending(
    pending: FrictionlessPendingAction,
  ): Promise<string> {
    if (!pending.sheetTitle || !pending.sheetCsv || !pending.sheetType) {
      return "I lost the sheet details — tell me what tracker or calendar you want again.";
    }
    const payload: GoogleSheetPendingPayload = {
      sheetType: pending.sheetType,
      title: pending.sheetTitle,
      csv: pending.sheetCsv,
      columns: pending.sheetColumns ?? [],
      artifactType: pending.artifactType ?? "Google Sheet",
    };
    const session = loadGoogleSheetIntakeSession();
    const result = await createGoogleSheetFromPayload(payload, {
      projectId: session?.projectId,
      projectName: session?.projectId ? undefined : undefined,
    });
    clearGoogleSheetIntakeSession();
    if (!result.ok) {
      return googleSheetCreateFailureAck(result.error);
    }
    return googleSheetCreateAck(payload.title, result.url);
  }

  function saveGoogleSheetFrictionlessPending(
    pending: GoogleSheetPendingPayload,
    offeredAtTurn: number,
  ): void {
    saveFrictionlessPending({
      type: "create_google_sheet",
      target: "google-workspace",
      context: pending.sheetType,
      sheetType: pending.sheetType,
      sheetTitle: pending.title,
      sheetCsv: pending.csv,
      sheetColumns: pending.columns,
      artifactType: pending.artifactType,
      offeredAtTurn,
      offerSummary: "Create Google Sheet",
    });
    registerPendingAcceptance("workspace", "Create Google Sheet");
  }

  function completeStrategyOfferFromPending(
    pending: FrictionlessPendingAction,
    ack: string,
  ) {
    const strategyId = pending.strategyId;
    const title =
      pending.strategyTitle ??
      (strategyId ? getStrategy(strategyId)?.title : null) ??
      "that strategy";
    if (pending.initialPrompt?.trim()) {
      lastUserTextRef.current = pending.initialPrompt.trim();
    }
    if (strategyId) {
      openStrategyFromChat({
        kind: "builtin",
        strategyId,
        title,
      });
      setBusinessStrategyDraft(null);
      setBusinessStrategySession(null);
      const boot = bootstrapStrategyApplySession(strategyId, {
        activeProjectName: pickActiveProjectName(),
      });
      if (boot) {
        setStrategyApplySession(boot.session);
        saveStrategyApplySession(boot.session, { workspacePanelOpen: true });
      }
      setActiveNav("playbook");
      applyChatLayoutMode("split");
      revealWorkspace();
    } else {
      openSectionBesideChatCore("playbook", undefined, { userInitiated: true });
    }
    clearFrictionlessPending();
    clearPendingAcceptanceAuthority();
    setToolSuggestion(null);
    setWorkspaceOffer(null);
    setDecisionCompassOffer(null);
    setActionBridge(null);
    setBridge(null);
    return ack || strategyOfferAck(title);
  }

  function completeVisualThinkingOpen(input: {
    mode: VisualFocusMode;
    viewId?: VisualThinkingViewId;
    viewTitle?: string;
    purposeAnswer?: string;
    ack: string;
  }) {
    const prompt = input.purposeAnswer?.trim();
    if (prompt) lastUserTextRef.current = prompt;

    const isMindMap =
      input.mode === "mind-map" ||
      input.viewId === "mind-map" ||
      /mind\s*map/i.test(input.viewTitle ?? "");

    if (isMindMap) {
      // Same Discovery Interview as the Mind Map frame — never the old dashboard.
      requestMindMapDiscoveryOpen(prompt || undefined);
      openSectionBesideChatCore("visual-focus", undefined, {
        userInitiated: true,
      });
      clearVisualThinkingMenuPending();
      clearFrictionlessPending();
      clearPendingAcceptanceAuthority();
      setToolSuggestion(null);
      setWorkspaceOffer(null);
      setDecisionCompassOffer(null);
      setActionBridge(null);
      setBridge(null);
      return (
        input.ack ||
        "Let's start with Discovery — what would you like to create a mind map about?"
      );
    }

    const map = createAndActivateMap(input.mode, prompt || undefined);
    queueVisualFocusOpen(map.id);
    openSectionBesideChatCore("visual-focus", undefined, { userInitiated: true });
    clearVisualThinkingMenuPending();
    clearFrictionlessPending();
    clearPendingAcceptanceAuthority();
    setToolSuggestion(null);
    setWorkspaceOffer(null);
    setDecisionCompassOffer(null);
    setActionBridge(null);
    setBridge(null);
    return input.ack;
  }

  function openSparkVisualEngineFromExperience(
    request: SparkVisualEngineOpenRequest,
  ) {
    const viewId = resolveStudioViewForEngineOpen(request);
    const mode = studioModeForViewId(viewId);
    const ack = completeVisualThinkingOpen({
      mode,
      viewId,
      viewTitle: visualThinkingViewTitle(viewId),
      purposeAnswer: request.seedText,
      ack: "I'll bring that up.",
    });
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: ack },
    ]);
  }

  function clearFrictionlessOfferState() {
    clearVisualThinkingMenuPending();
    clearFrictionlessPending();
    clearPendingAcceptanceAuthority();
    clearPendingEstatePlaceMenu();
    setToolSuggestion(null);
    setWorkspaceOffer(null);
    setDecisionCompassOffer(null);
    setActionBridge(null);
    setBridge(null);
    setAwaitingUserConfirmation(null);
  }

  function completeImmediateCreateOpen(payload: ImmediateCreateOpenPayload) {
    clearFrictionlessOfferState();
    // Never open legacy Create / content-generator from chat create intents.
    redirectLegacyCreateWorkspaceIfNeeded("content-generator", {
      userText: payload.userText,
      itemType: payload.artifact.itemType,
    });
  }

  function completeImmediateCreateProjectOpen(
    payload: ImmediateCreateProjectOpenPayload,
  ) {
    clearFrictionlessOfferState();
    openProjectHomesPrototypeCore();
    if (payload.followUpLine?.trim()) {
      postCreateTransparencyMessage(payload.followUpLine);
    }
  }

  function completeImmediateMomentumOpen(payload: ImmediateMomentumOpenPayload) {
    clearFrictionlessOfferState();
    openProjectHomesPrototypeCore();
    if (payload.followUpLine?.trim()) {
      postCreateTransparencyMessage(payload.followUpLine);
    }
  }

  function completeImmediateResearchOpen(
    payload: import("@/lib/estateBrain/intelligenceTypes").ImmediateResearchOpenPayload,
  ) {
    clearFrictionlessOfferState();
    const command = estateNavigateCommandForPlace(
      payload.estatePlaceId,
      payload.userText,
    );
    const alreadyAtPlace =
      directEstateVisitRef.current?.roomId === payload.estatePlaceId;
    if (command && !alreadyAtPlace) {
      runDirectEstateRoomNavigation(command, payload.userText, undefined, {
        skipAssistantMessage: true,
      });
    } else if (command) {
      patchEstateRuntimeState({
        currentPlaceId: payload.estatePlaceId,
        activeConversationMode: true,
      });
    }
    openSectionBesideChatCore(payload.section, undefined, {
      userInitiated: true,
    });
  }

  function completeImmediateEstateHowToGuideOpen(guideId: EstateHowToGuideId) {
    clearFrictionlessOfferState();
    if (guideId === "chamber-of-momentum") {
      if (activeSectionRef.current !== "chamber-of-momentum") {
        openChamberOfMomentumCore();
      }
      window.setTimeout(() => {
        requestOpenEstateHowToGuide("chamber-of-momentum");
      }, 0);
      return;
    }
    if (overlay !== "my-business-estate" && overlay !== "profile") {
      openProfileDestinationCore("my-business-estate");
    }
    window.setTimeout(() => {
      requestOpenEstateHowToGuide("my-business-estate");
    }, 0);
  }

  function completeImmediateEstateCoachingOpen(
    payload: import("@/lib/estateBrain/estateCoachingTypes").ImmediateEstateCoachingOpenPayload,
  ) {
    clearFrictionlessOfferState();
    const command = estateNavigateCommandForPlace(
      payload.estatePlaceId,
      payload.userText,
    );
    const alreadyAtPlace =
      directEstateVisitRef.current?.roomId === payload.estatePlaceId;
    if (command && !alreadyAtPlace) {
      runDirectEstateRoomNavigation(command, payload.userText, undefined, {
        skipAssistantMessage: true,
      });
    } else if (command) {
      patchEstateRuntimeState({
        currentPlaceId: payload.estatePlaceId,
        activeConversationMode: true,
      });
    }
    if (payload.openSection) {
      openSectionBesideChatCore(payload.openSection, undefined, {
        userInitiated: true,
      });
    }
  }

  function completePendingChoiceExecution(execution: PendingChoiceExecution) {
    clearFrictionlessOfferState();
    clearPendingEstatePlaceMenu();
    const { action, userText } = execution;

    const navigateIfNeeded = (placeId?: string) => {
      if (!placeId) return;
      const command = estateNavigateCommandForPlace(placeId, userText);
      const alreadyAtPlace =
        directEstateVisitRef.current?.roomId === placeId;
      if (command && !alreadyAtPlace) {
        runDirectEstateRoomNavigation(command, userText, undefined, {
          skipAssistantMessage: true,
        });
      } else if (command) {
        patchEstateRuntimeState({
          currentPlaceId: placeId,
          activeConversationMode: true,
        });
      }
    };

    const openSection = (section: AppSection, nav?: SidebarNavId) => {
      openSectionBesideChatCore(section, nav, { userInitiated: true });
    };

    const runAction = (pendingAction: PendingChoiceAction) => {
      switch (pendingAction.kind) {
        case "navigate_place":
          navigateIfNeeded(pendingAction.placeId);
          break;
        case "open_section":
          navigateIfNeeded(pendingAction.placeId);
          if (pendingAction.section === "focus-audio") {
            openFocusAudioCore(pendingAction.focusAudioCategory ?? "calm-brain");
          } else if (pendingAction.section) {
            openSection(pendingAction.section);
          }
          break;
        case "open_focus_audio":
          navigateIfNeeded(pendingAction.placeId);
          openFocusAudioCore(pendingAction.focusAudioCategory ?? "calm-brain");
          break;
        case "start_discovery":
          navigateIfNeeded(pendingAction.placeId);
          openSection(pendingAction.section ?? "content-generator", "create");
          break;
        case "open_journal":
          navigateIfNeeded(pendingAction.placeId);
          openSection("growth-journal", "growth");
          break;
        case "coaching_open":
          navigateIfNeeded(pendingAction.placeId);
          if (pendingAction.section) openSection(pendingAction.section);
          break;
        case "stay_in_chat":
          break;
        default:
          break;
      }
    };

    runAction(action);
  }

  function beginVisibleThinking(
    userText: string,
    emotionalState: EmotionalState,
  ) {
    setVisibleThinkingContext(
      buildVisibleThinkingContext({
        userText,
        emotionalState,
        activeSection: activeSectionRef.current,
        workspaceBeside:
          chatLayoutMode === "split" || Boolean(workspacePanelRef.current),
        offeredAtTurn: chatTurnRef.current,
      }),
    );
  }

  function endVisibleThinking() {
    setVisibleThinkingContext(null);
  }

  function setAwaitingUserConfirmation(
    state: AwaitingUserConfirmationState | null,
  ) {
    awaitingUserConfirmationRef.current = state;
    setChatAwaitingConfirmation(Boolean(state?.active));
  }

  function recordPrimaryTurnResponse(content: string) {
    recordPrimaryTurnFinalResponse(chatTurnRef.current, content);
  }

  /**
   * Shari Voice Layer — every normal member-facing assistant string passes here
   * before it is shown. Legal/safety/system copy may set bypassVoiceLayer.
   */
  function finalizeMemberFacingAssistantText(
    content: string,
    owner: string,
    opts?: { bypassVoiceLayer?: boolean; bypassReason?: "legal" | "safety" | "system_required" },
  ): string {
    const decision = getActiveTurnDecision();
    const voiced = applyShariVoiceLayer({
      text: content,
      userText: lastUserTextRef.current ?? undefined,
      emotionalCondition: decision?.emotionalCondition,
      contentPlanOwner: owner,
      finalResponseOwner: owner,
      bypassVoiceLayer: opts?.bypassVoiceLayer,
      bypassReason: opts?.bypassReason,
    }).text;
    // Global readability: never leave multi-item lists crushed into one paragraph.
    return structureMultiItemResponse(voiced);
  }

  function finishEarlyChatTurn(ownerHint?: string) {
    try {
      const decision = getActiveTurnDecision();
      if (decision) {
        if (ownerHint) {
          annotateTurnDecision({ finalResponseOwner: ownerHint });
        }
        logConversationDecision(decision, {
          messageId: `turn-${chatTurnRef.current}`,
          turnId: `turn-${chatTurnRef.current}`,
        });
        endTurnDecision();
      }
    } catch {
      endTurnDecision();
    }
    const turnState = activeChatTurnLifecycleRef.current;
    const finalize = () => {
      endVisibleThinking();
      setIsLoading(false);
      requestChatInputFocus();
    };
    if (turnState) {
      finalizeChatTurn(turnState, finalize);
    } else {
      finalize();
    }
  }

  function presentFrictionlessLocalReply(
    frictionlessAction: FrictionlessActionDecision,
    finishLatencyTurn: (opts?: {
      localReply?: boolean;
      calledApi?: boolean;
    }) => void,
  ): boolean {
    if (!frictionlessAction.localReply) return false;

    annotateTurnDecision({
      finalResponseOwner: `frictionless:${frictionlessAction.category}`,
      routeSelected: frictionlessAction.category,
      actionExecuted: frictionlessAction.immediateEstatePlaceNavigate
        ? "navigate_place"
        : frictionlessAction.immediateVisualOpen
          ? "open_visual"
          : "local_reply",
    });

    const voicedLocalReply = finalizeMemberFacingAssistantText(
      frictionlessAction.localReply!,
      `frictionless:${frictionlessAction.category}`,
    );

    if (activeChatTurnLifecycleRef.current) {
      markAssistantReplied(activeChatTurnLifecycleRef.current);
    }
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: voicedLocalReply },
    ]);
    recordPrimaryTurnResponse(voicedLocalReply);

    const chamberMemberConversationLocked = isChamberMemberConversationActive({
      activeSection: activeSectionRef.current,
      activeMemberId: activeChamberMemberIdRef.current,
    });

    if (!chamberMemberConversationLocked && frictionlessAction.immediateVisualOpen) {
      completeVisualThinkingOpen(frictionlessAction.immediateVisualOpen);
      setInput("");
      setAwaitingUserConfirmation(null);
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateCartographersStudioOpen) {
      requestVisualFocusStudio();
      openSectionBesideChatCore("visual-focus", undefined, {
        userInitiated: true,
      });
      setInput("");
      setAwaitingUserConfirmation(null);
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateCreateOpen) {
      completeImmediateCreateOpen(frictionlessAction.immediateCreateOpen);
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateCreateProjectOpen) {
      completeImmediateCreateProjectOpen(
        frictionlessAction.immediateCreateProjectOpen,
      );
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateMomentumOpen) {
      completeImmediateMomentumOpen(frictionlessAction.immediateMomentumOpen);
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateResearchOpen) {
      completeImmediateResearchOpen(frictionlessAction.immediateResearchOpen);
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateEstateCoachingOpen) {
      completeImmediateEstateCoachingOpen(
        frictionlessAction.immediateEstateCoachingOpen,
      );
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.pendingChoiceExecution) {
      completePendingChoiceExecution(frictionlessAction.pendingChoiceExecution);
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateEstateHowToGuideOpen) {
      completeImmediateEstateHowToGuideOpen(
        frictionlessAction.immediateEstateHowToGuideOpen,
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: frictionlessAction.localReply! },
      ]);
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (!chamberMemberConversationLocked && frictionlessAction.immediateEstatePlaceNavigate) {
      const payload = frictionlessAction.immediateEstatePlaceNavigate;
      const command = estateNavigateCommandForPlace(
        payload.placeId,
        payload.userText,
      );
      if (command) {
        runDirectEstateRoomNavigation(
          command,
          payload.userText,
          payload.navigationLine,
        );
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: frictionlessAction.localReply! },
      ]);
      setInput("");
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return true;
    }

    if (frictionlessAction.pendingAction) {
      const pendingAction = frictionlessAction.pendingAction;
      if (isVisualThinkingPendingAction(pendingAction)) {
        saveVisualThinkingMenuPending(pendingAction);
      } else {
        saveFrictionlessPending(pendingAction);
      }
      if (
        frictionlessAction.localReply &&
        isEstateTransitionOfferMessage(frictionlessAction.localReply) &&
        lastUserTextRef.current.trim()
      ) {
        registerEstateWorkspaceOfferFromAssistant({
          assistantText: frictionlessAction.localReply,
          priorUserText: lastUserTextRef.current,
          offeredAtTurn: chatTurnRef.current,
        });
      }
      registerPendingAcceptance(
        frictionlessAction.workspaceOffer ? "workspace" : "tool",
        pendingAction.offerSummary,
      );
      registerPendingOffer({
        offerSummary: pendingAction.offerSummary,
        section:
          pendingAction.target === "focus-audio"
            ? "focus-audio"
            : typeof pendingAction.target === "string" &&
                pendingAction.target !== "breathe" &&
                pendingAction.target !== "focus-timer" &&
                pendingAction.target !== "brain-dump" &&
                pendingAction.target !== "google-workspace"
              ? pendingAction.target
              : undefined,
      });
      const workflow = createConversationWorkflow(
        frictionlessAction.localReply!,
        chatTurnRef.current,
      );
      if (workflow) setConversationWorkflow(workflow);
      logCreateOfferRegistration({
        pendingAction,
        pendingMenuSelection: loadPendingMenuSelection(),
        pendingAcceptance: {
          kind: frictionlessAction.workspaceOffer ? "workspace" : "tool",
          offerSummary: frictionlessAction.pendingAction.offerSummary,
        },
      });
    }
    if (frictionlessAction.googleSheetIntake) {
      saveGoogleSheetIntakeSession(frictionlessAction.googleSheetIntake);
    }
    if (frictionlessAction.reminderIntake) {
      saveReminderIntakeSession(frictionlessAction.reminderIntake);
    } else if (frictionlessAction.category === "reminder") {
      clearReminderIntakeSession();
    }
    if (frictionlessAction.toolSuggestion) {
      setToolSuggestion(frictionlessAction.toolSuggestion);
    }
    if (frictionlessAction.workspaceOffer) {
      setWorkspaceOffer(frictionlessAction.workspaceOffer);
    }

    if (shouldStopAfterAssistantOffer(frictionlessAction.localReply)) {
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: frictionlessAction.localReply,
          offeredAtTurn: chatTurnRef.current,
          kind: frictionlessAction.workspaceOffer
            ? "workspace"
            : frictionlessAction.pendingAction
              ? "tool"
              : "general",
          frictionlessPending: frictionlessAction.pendingAction,
          workspaceOffer: frictionlessAction.workspaceOffer,
        }),
      );
    } else {
      setAwaitingUserConfirmation(null);
    }

    finishEarlyChatTurn();
    finishLatencyTurn({ localReply: true });
    return true;
  }

  async function handleSend(
    overrideText?: string,
    fresh = false,
    skipToolOffer = false,
    preferChatAnswer = false,
  ) {
    handleSendRef.current = handleSend;
    const trimmed = (
      overrideText ??
      inputRef.current?.value ??
      inputSnapshotRef.current ??
      input
    ).trim();
    // Never block send on isLoading — newer messages supersede in-flight AI.
    if (!trimmed) return;

    // Freeform input dismisses the guided daily opening (choices stay optional).
    if (globalDailyOpening) {
      markTodaysWelcomeDismissedThisSession();
      setGlobalDailyOpening(null);
      clearDailyOpeningSubViews();
    }

    chatRequestGenerationRef.current += 1;
    const sendGeneration = chatRequestGenerationRef.current;
    supersedeInFlightChatRequest(chatRequestAbortRef.current);
    chatRequestAbortRef.current = null;
    if (isLoading) {
      endVisibleThinking();
      setIsLoading(false);
      // Drop an empty streaming shell from the superseded turn.
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }

    micExplicitStopRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);

    if (postLoginQuiet) {
      clearCompanionPostLoginQuiet();
      setPostLoginQuiet(false);
    }

    if (homeCalm) {
      recordArrivalFirstAction(
        voiceUsedRef.current ? "voice_message" : "chat_message",
      );
      if (homeArrival?.homeState === "FIRST_VISIT") {
        recordFirstRelationshipSignals({
          userText: trimmed,
          usedVoice: voiceUsedRef.current,
        });
      }
    }

    chatTurnRef.current += 1;
    const lastAssistantForPrimary =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

    // CB-022 — authoritative active-topic owner (before Chamber NAVIGATE / fallbacks).
    activeTopicTurnRef.current = processActiveTopicOnUserTurn({
      userText: trimmed,
      turn: chatTurnRef.current,
      lastAssistantText: lastAssistantForPrimary,
      activeChamberMemberId: activeChamberMemberIdRef.current,
    });

    // CB-022 addendum — intent-first + WorkflowResumeDecision before Continuity/UC.
    const continuityOwnerPeek = getActiveConversationOwner({
      activeSection: activeSectionRef.current,
    });
    intentWorkflowTurnRef.current = processIntentWorkflowOnUserTurn({
      userText: trimmed,
      turn: chatTurnRef.current,
      activeOwner: continuityOwnerPeek,
      ucSession: loadUniversalCreationSession(),
      hasActiveStrategySession: Boolean(
        businessStrategySessionRef.current ||
          (strategyApplySessionRef.current &&
            strategyApplySessionRef.current.phase !== "done"),
      ),
    });
    if (intentWorkflowTurnRef.current.invalidateStaleDocumentWorkflow) {
      clearConversationOwner();
      clearUniversalCreationSession();
    }
    setStrategyDisambiguationPending(
      intentWorkflowTurnRef.current.strategyAction?.needsClassificationAsk ===
        true,
    );

    const confirmationReply =
      isConfirmationAcceptance(trimmed) || isConfirmationDecline(trimmed);
    if (!confirmationReply) {
      setAwaitingUserConfirmation(null);
    }
    const latencyProfiler = new CompanionLatencyProfiler(
      chatTurnRef.current,
      trimmed,
    );
    const finishLatencyTurn = (opts?: {
      localReply?: boolean;
      calledApi?: boolean;
    }) => {
      if (opts?.localReply) latencyProfiler.usedLocalReply = true;
      if (opts?.calledApi) latencyProfiler.calledApi = true;
      logCompanionLatency(latencyProfiler.report());
    };

    const chatTurnState = createChatTurnState();
    markChatTurnStarted(chatTurnState);
    activeChatTurnLifecycleRef.current = chatTurnState;

    const applyMyDayAndWorkOpener = (
      opener: import("@/lib/estate/myDayAndWorkNavigation").MyDayAndWorkOpener,
    ) => {
      switch (opener) {
        case "plan-my-day":
          openPlanMyDayCore();
          break;
        case "rhythms":
          openRhythmsCore();
          break;
        case "reminders":
          openRemindersCore();
          break;
        case "calendar":
          openCalendarCore();
          break;
        case "project-homes":
          openProjectHomesPrototypeCore();
          break;
        case "clear-my-mind":
          openClearMyMindCore();
          break;
        case "parking-lot":
          openParkingLotCore();
          break;
        case "destination-gallery":
          openDestinationGalleryCore();
          break;
        case "cartographers-studio":
          openCartographersStudioCore();
          break;
        default: {
          const _exhaustive: never = opener;
          void _exhaustive;
          break;
        }
      }
    };

    let continuityLocksBroadRouting = false;
    let primaryTurnDecision: PrimaryTurnDecision | null = null;

    try {
    /**
     * CB-022 addendum — Strategy Library / strategy modes claim the turn before
     * Continuity sticky UC and CREATE fast path. One Shari response owner.
     */
    const intentWf = intentWorkflowTurnRef.current;
    if (intentWf?.strategyAction) {
      const action = intentWf.strategyAction;
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();

      if (action.openLibrary) {
        openStrategyLibraryCore({
          openView: action.openView,
        });
      }

      if (action.startBusinessBuilder) {
        setBusinessStrategyDraft(null);
        setStrategyApplySession(null);
        clearStrategyApplySession();
        const { session } = bootstrapBusinessStrategySession(
          action.builderLabel ?? "Business Strategy",
        );
        setBusinessStrategySession(session);
      }

      if (action.startApplyCoach) {
        const applyId = "shrink-first-step";
        setBusinessStrategyDraft(null);
        setBusinessStrategySession(null);
        const boot = bootstrapStrategyApplySession(applyId, {
          activeProjectName: pickActiveProjectName(),
        });
        if (boot) {
          setStrategyApplySession(boot.session);
          saveStrategyApplySession(boot.session, { workspacePanelOpen: true });
          openStrategyLibraryCore({
            openView: action.openView ?? "adhd",
            strategyId: applyId,
          });
        }
      }

      setStrategyDisambiguationPending(action.needsClassificationAsk);
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: action.reply },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      if (!getPrefs().hasChatted) {
        savePrefs({ hasChatted: true });
        setHasChatted(true);
      }
      recordPrimaryTurnResponse(action.reply);
      markAssistantReplied(chatTurnState);
      logConversationPipelineDiagnostic({
        turn: chatTurnRef.current,
        userText: trimmed,
        detectedIntent: "STRATEGY",
        kernelHandled: false,
        informationalChatBypass: true,
        estateKernelForced: false,
        taskLockBlocksEstate: true,
        selectedHandler: `intent_workflow:strategy_${action.mode}`,
        turnOwner: "shari",
        normalizedMessage: normalizeTurnMessage(trimmed),
        primaryType: "TASK_REQUEST",
        primaryOwner: "shari",
        primaryConfidence: "high",
      });
      finishEarlyChatTurn("intent_workflow:strategy");
      finishLatencyTurn({ localReply: true });
      return;
    }

    /**
     * Continuity ownership gate (Slice 2) — before primary / Decision Engine /
     * navigation / generic recovery. Active owner receives the turn unless the
     * member explicitly exits or changes tasks.
     *
     * Inside Evidence Vault, never continue Create / document ownership.
     */
    const sendInEvidenceVault =
      activeSectionRef.current === "evidence-bank" ||
      directEstateVisitRef.current?.roomId === "evidence-vault";
    if (sendInEvidenceVault) {
      clearConversationOwner();
      clearUniversalCreationSession();
    }

    const continuityGate = resolveContinuityTurnGate({
      userText: trimmed,
      lastAssistantText: lastAssistantForPrimary,
      activeSection: activeSectionRef.current,
    });

    if (continuityGate.action === "clear_owner_continue") {
      if (continuityGate.clearUniversalCreation) {
        clearUniversalCreationSession();
      }
      // Authoritative correction — acknowledge once, never resume the rejected workflow.
      if (
        continuityGate.reason === "workflow_correction" &&
        continuityGate.correctionAck
      ) {
        lastUserTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        const wantsEvent =
          /\b(?:online event|virtual event|webinar|create(?: an?)? event)\b/i.test(
            trimmed,
          );
        const followUp = wantsEvent
          ? `${continuityGate.correctionAck}\n\nWhat kind of online event are you creating?`
          : continuityGate.correctionAck;
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: followUp },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        if (!getPrefs().hasChatted) {
          savePrefs({ hasChatted: true });
          setHasChatted(true);
        }
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    if (continuityGate.action === "destination") {
      if (continuityGate.clearUniversalCreation) {
        clearUniversalCreationSession();
      }
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const dest = continuityGate.destination;
      if (dest.kind === "my_day") {
        applyMyDayAndWorkOpener(dest.opener);
      } else if (dest.destination === "evidence-vault") {
        enterEvidenceVaultRoomCore({
          userIntent: trimmed || "show-evidence",
        });
      } else if (dest.destination === "my-business-estate") {
        openProfileDestinationCore("my-business-estate");
      } else if (dest.destination === "boardroom") {
        openBoardroomCore({
          intent: dest.boardroomIntent ?? "past",
        });
      }
      setMessages((prev) => [...(fresh ? [] : prev), userMessage]);
      setInput("");
      voiceUsedRef.current = false;
      if (!getPrefs().hasChatted) {
        savePrefs({ hasChatted: true });
        setHasChatted(true);
      }
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (continuityGate.action === "route_to_owner") {
      const { routed, owner } = continuityGate;
      if (routed.kind === "universal_creation" || routed.kind === "board_intake") {
        lastUserTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: routed.reply },
        ]);
        setActiveConversationOwner(owner);
        setInput("");
        voiceUsedRef.current = false;
        if (!getPrefs().hasChatted) {
          savePrefs({ hasChatted: true });
          setHasChatted(true);
        }
        recordPrimaryTurnResponse(routed.reply);
        markAssistantReplied(chatTurnState);
        logConversationPipelineDiagnostic({
          turn: chatTurnRef.current,
          userText: trimmed,
          detectedIntent:
            routed.kind === "universal_creation" ? "CREATE" : "BOARD_INTAKE",
          kernelHandled: false,
          informationalChatBypass: true,
          estateKernelForced: false,
          taskLockBlocksEstate: true,
          selectedHandler: `continuity:${routed.kind}`,
          turnOwner: owner.kind,
          normalizedMessage: normalizeTurnMessage(trimmed),
          primaryType: "TASK_REQUEST",
          primaryOwner: owner.kind,
          primaryConfidence: "high",
        });
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
      if (routed.kind === "continue_in_chat") {
        continuityLocksBroadRouting = true;
        setActiveConversationOwner(routed.owner);
        primaryTurnDecision = {
          type: "RELATIONSHIP_CHAT",
          confidence: "high",
          owner: routed.syntheticPrimaryOwner,
          reason: `continuity gate — ${routed.owner.kind} owns turn`,
          blockKernelNavigation: true,
          blockBridgeResponder: true,
          blockCollectionOffer: true,
          blockSecondaryResponders: true,
        };
      }
    }

    if (!primaryTurnDecision) {
      primaryTurnDecision = runReliableSyncLayer(
        "decision_engine",
        () =>
          classifyPrimaryConversationTurn({
            userText: trimmed,
            lastAssistantText: lastAssistantForPrimary,
          }),
        {
          type: "RELATIONSHIP_CHAT",
          confidence: "low",
          owner: "chat",
          reason: "classification recovered — stay in chat",
          blockKernelNavigation: true,
          blockBridgeResponder: true,
          blockCollectionOffer: true,
          blockSecondaryResponders: false,
        } satisfies PrimaryTurnDecision,
        {
          turn: chatTurnRef.current,
          userText: trimmed,
          normalizedMessage: normalizeTurnMessage(trimmed),
        },
      );
    }
    // Continuity gate always leaves a decision before broad routing continues.
    const activePrimaryTurn: PrimaryTurnDecision = primaryTurnDecision;
    primaryTurnDecision = activePrimaryTurn;
    activePrimaryTurnRef.current = activePrimaryTurn;
    logPrimaryTurnClassification(chatTurnRef.current, trimmed, activePrimaryTurn);

    /** Phase A — single immutable decision for this turn (permissions + logging). */
    const turnId = `turn-${chatTurnRef.current}`;
    const pendingSelectionActive = hasActivePendingChoice();
    const turnConversationDecision = beginTurnDecision(
      turnId,
      buildConversationDecision({
        userText: trimmed,
        lastAssistantText: lastAssistantForPrimary,
        activeWorkflow: null,
        workspace: workspacePanelRef.current ?? null,
        primaryTurnType: activePrimaryTurn.type,
        pendingSelectionActive,
      }),
    );
    if (techFutureHintForChat(trimmed)) {
      turnConversationDecision.selectedIntelligence.push("technology_future");
    }
    if (adhdStrategyHintForChat(trimmed)) {
      turnConversationDecision.selectedIntelligence.push("adhd_everyday_strategies");
    }
    if (pendingSelectionActive) {
      annotateTurnDecision({ pendingState: "active" });
    }
    logConversationDecision(turnConversationDecision, {
      messageId: turnId,
      turnId,
    });

    /**
     * Universal Access (#183) — explicit capability requests win over location.
     * Must run before Clear My Mind capture lock so CMM never denies another capability.
     * Skipped when a sticky continuity owner (e.g. Chamber) already owns the turn.
     */
    if (!continuityLocksBroadRouting) {
      const myDayOpener = resolveMyDayAndWorkOpenerFromText(trimmed);
      if (myDayOpener) {
        annotateTurnDecision({
          finalResponseOwner: "my_day_opener",
          routeSelected: "my_day",
          actionExecuted: "open_my_day",
        });
        lastUserTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        applyMyDayAndWorkOpener(myDayOpener);
        setMessages((prev) => [...(fresh ? [] : prev), userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        if (!getPrefs().hasChatted) {
          savePrefs({ hasChatted: true });
          setHasChatted(true);
        }
        finishEarlyChatTurn("my_day_opener");
        finishLatencyTurn({ localReply: true });
        return;
      }

      const universalRequest = resolveExplicitCapabilityIntent(trimmed);
      const breatheBlockedByDecision =
        universalRequest?.capabilityId === "breathe" &&
        !authorizeBreatheAutoOpen(trimmed);
      if (universalRequest && !breatheBlockedByDecision) {
        annotateTurnDecision({
          finalResponseOwner: `universal:${universalRequest.capabilityId}`,
          routeSelected: universalRequest.capabilityId,
          actionExecuted:
            universalRequest.capabilityId === "breathe"
              ? "open_breathe"
              : "open_capability",
        });
        lastUserTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        fulfillUniversalCapabilityRequest(universalRequest);
        const voicedAck = finalizeMemberFacingAssistantText(
          universalRequest.ack,
          `universal:${universalRequest.capabilityId}`,
        );
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: voicedAck },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        if (!getPrefs().hasChatted) {
          savePrefs({ hasChatted: true });
          setHasChatted(true);
        }
        finishEarlyChatTurn(`universal:${universalRequest.capabilityId}`);
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    /**
     * Clear My Mind Mode lock — stay in the interactive workspace.
     * Do not route to normal chat until the member explicitly exits.
     */
    if (
      shouldStayInClearMyMindMode({
        activeSection: activeSectionRef.current,
      }) ||
      isClearMyMindModeActive()
    ) {
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();

      if (isClearMyMindExitRequest(trimmed)) {
        exitClearMyMindMode();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          { role: "assistant", content: CLEAR_MY_MIND_EXIT_ANNOUNCE },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        navigateToChatCore();
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }

      if (isClearMyMindOrganizeRequest(trimmed)) {
        setClearMyMindModePhase("organize");
        setBrainDumpInitialView("my-thoughts");
        setBrainDumpPanelKey((k) => k + 1);
        if (activeSectionRef.current !== "brain-dump") {
          openClearMyMindCore({ initialView: "my-thoughts", silent: true });
        }
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
          {
            role: "assistant",
            content:
              "I'll group what you've shared. You can rename any cluster — nothing has to stay as I sorted it.",
          },
        ]);
        setInput("");
        voiceUsedRef.current = false;
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }

      /** Recover workspace if mode is on but panel was torn down (e.g. prior Wander). */
      if (activeSectionRef.current !== "brain-dump") {
        openClearMyMindCore({ silent: true });
      }

      /** Capture Mode — encourage only; never coach or organize. */
      const encourage =
        CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES[
          Math.floor(Math.random() * CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES.length)
        ] ?? "I'm still listening.";
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: encourage },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      if (activeSectionRef.current !== "brain-dump") {
        openClearMyMindCore({ silent: true });
      }
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (isStopEstateAmbienceRequest(trimmed)) {
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      await stopAllEstateEnvironmentalAudio();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: stopEstateAmbienceReply() },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      if (!getPrefs().hasChatted) {
        savePrefs({ hasChatted: true });
        setHasChatted(true);
      }
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (isSimpleSocialGreeting(trimmed)) {
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: simpleSocialGreetingReply(trimmed) },
      ]);
      recordPrimaryTurnResponse(simpleSocialGreetingReply(trimmed));
      setInput("");
      voiceUsedRef.current = false;
      if (!getPrefs().hasChatted) {
        savePrefs({ hasChatted: true });
        setHasChatted(true);
      }
      requestChatInputFocus();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (shouldCompleteRelationshipChatLocally(primaryTurnDecision, trimmed)) {
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const reply = relationshipConversationLocalReply(trimmed);
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: reply },
      ]);
      recordPrimaryTurnResponse(reply);
      markAssistantReplied(chatTurnState);
      logConversationPipelineDiagnostic({
        turn: chatTurnRef.current,
        userText: trimmed,
        detectedIntent: "RELATIONSHIP_CHAT",
        kernelHandled: false,
        informationalChatBypass: true,
        estateKernelForced: false,
        taskLockBlocksEstate: false,
        selectedHandler: "relationship_chat_local",
        turnOwner: "chat",
        normalizedMessage: normalizeTurnMessage(trimmed),
        primaryType: primaryTurnDecision.type,
        primaryOwner: primaryTurnDecision.owner,
        primaryConfidence: primaryTurnDecision.confidence,
      });
      setInput("");
      voiceUsedRef.current = false;
      if (!getPrefs().hasChatted) {
        savePrefs({ hasChatted: true });
        setHasChatted(true);
      }
      requestChatInputFocus();
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (isVagueHelpRequest(trimmed) && !continuityLocksBroadRouting) {
      clearUniversalCreationSession();
      lastUserTextRef.current = trimmed;
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      const reply = vagueHelpLocalReply();
      setMessages((prev) => [
        ...(fresh ? [] : prev),
        userMessage,
        { role: "assistant", content: reply },
      ]);
      recordPrimaryTurnResponse(reply);
      markAssistantReplied(chatTurnState);
      logConversationPipelineDiagnostic({
        turn: chatTurnRef.current,
        userText: trimmed,
        detectedIntent: "CLARIFY",
        kernelHandled: false,
        informationalChatBypass: true,
        estateKernelForced: false,
        taskLockBlocksEstate: false,
        selectedHandler: "vague_help_local",
        turnOwner: "chat",
        normalizedMessage: normalizeTurnMessage(trimmed),
        primaryType: primaryTurnDecision.type,
        primaryOwner: primaryTurnDecision.owner,
        primaryConfidence: primaryTurnDecision.confidence,
      });
      setInput("");
      voiceUsedRef.current = false;
      if (!getPrefs().hasChatted) {
        savePrefs({ hasChatted: true });
        setHasChatted(true);
      }
      requestChatInputFocus();
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    const activeReminderSession = loadReminderIntakeSession();
    if (
      activeReminderSession?.phase === "collecting" &&
      !isFrictionlessAffirmation(trimmed)
    ) {
      const reminderTurn = resolveReminderTurn({
        userText: trimmed,
        draft: activeReminderSession.draft,
        timeBlocks: getTimeBlocks(),
      });
      if (reminderTurn.kind === "not_reminder") {
        clearReminderIntakeSession();
      } else if (reminderTurn.kind === "ask" || reminderTurn.kind === "confirm") {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        if (reminderTurn.kind === "confirm") {
          clearReminderIntakeSession();
        } else {
          saveReminderIntakeSession({
            ...activeReminderSession,
            draft: reminderTurn.draft,
          });
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reminderTurn.reply },
        ]);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const activeSheetSession = loadGoogleSheetIntakeSession();
    if (
      activeSheetSession?.phase === "collecting" &&
      !isFrictionlessAffirmation(trimmed)
    ) {
      const intakeTurn = resolveGoogleSheetsTurn({
        userText: trimmed,
        currentTurn: chatTurnRef.current,
        session: activeSheetSession,
        isAffirmation: false,
      });
      if (intakeTurn.outcome === "ask" || intakeTurn.outcome === "offer") {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        saveGoogleSheetIntakeSession(intakeTurn.session);
        if (intakeTurn.outcome === "offer") {
          saveGoogleSheetFrictionlessPending(
            intakeTurn.pending,
            chatTurnRef.current,
          );
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: intakeTurn.reply },
        ]);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const lastAssistantForPriority =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ??
      "";

    const conversationPriority = isConversationPriorityEngineEnabled()
      ? resolveTurnPriority({
          userText: trimmed,
          lastAssistantText: lastAssistantForPriority,
          currentTurn: chatTurnRef.current,
        })
      : null;

    if (conversationPriority) {
      applyConversationPriorityClears(conversationPriority);
    } else if (
      loadUniversalCreationSession() &&
      isCreateWorkflowContinuation(trimmed)
    ) {
      clearPendingChoice();
    }

    const shouldRunPendingChoice =
      hasActivePendingChoice() &&
      !(conversationPriority?.deferPendingChoice ?? false);

    if (shouldRunPendingChoice) {
      const pendingTurnStarted = Date.now();
      const pendingResult = resolvePendingChoiceTurn(trimmed, {
        lastAssistantText: lastAssistantForPriority,
        currentTurn: chatTurnRef.current,
      });
      if (
        pendingResult.kind === "resolved" ||
        pendingResult.kind === "unrecognized" ||
        pendingResult.kind === "cancelled" ||
        pendingResult.kind === "continued" ||
        pendingResult.kind === "expanded"
      ) {
        const pendingState = loadPendingChoice();
        logTurnOwner({
          turn: chatTurnRef.current,
          rawMessage: trimmed,
          normalizedMessage: normalizeTurnMessage(trimmed),
          owner: "pending_choice",
          intent: primaryTurnDecision.type,
          currentRoom:
            resolveCurrentEstateRoom({
              directVisitRoomId: directEstateVisitRef.current?.roomId ?? null,
              activeSection: activeSectionRef.current,
              memoryRoomId: getEstateMemory().currentRoom?.entryId ?? null,
            }) ?? null,
          pendingChoices: pendingResult.kind === "unrecognized",
          pendingChoiceType: pendingState?.pendingChoiceType ?? null,
          navigationTarget:
            pendingResult.kind === "resolved"
              ? (pendingResult.action.placeId ??
                pendingResult.action.section ??
                pendingResult.action.capabilityId ??
                null)
              : null,
          elapsedMs: Date.now() - pendingTurnStarted,
        });
        logConversationPipelineDiagnostic({
          turn: chatTurnRef.current,
          userText: trimmed,
          detectedIntent: primaryTurnDecision.type,
          kernelHandled: false,
          informationalChatBypass: false,
          estateKernelForced: false,
          taskLockBlocksEstate: false,
          selectedHandler: "pending_choice",
          turnOwner: "pending_choice",
          normalizedMessage: normalizeTurnMessage(trimmed),
          pendingChoices: pendingResult.kind === "unrecognized",
          pendingChoiceType: pendingState?.pendingChoiceType ?? null,
          navigationTarget:
            pendingResult.kind === "resolved"
              ? (pendingResult.action.placeId ?? null)
              : null,
          primaryType: primaryTurnDecision.type,
          primaryOwner: primaryTurnDecision.owner,
          primaryConfidence: primaryTurnDecision.confidence,
        });
        lastUserTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        if (!getPrefs().hasChatted) {
          savePrefs({ hasChatted: true });
          setHasChatted(true);
        }
        const replyRaw =
          pendingResult.kind === "resolved"
            ? pendingResult.reply
            : pendingResult.kind === "unrecognized"
              ? pendingResult.reply
              : pendingResult.kind === "continued" ||
                  pendingResult.kind === "expanded"
                ? pendingResult.reply
              : (pendingResult.reply ??
                "No problem — we can stay right here.");
        const reply = finalizeMemberFacingAssistantText(
          replyRaw,
          "pending_choice",
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);
        recordPrimaryTurnResponse(reply);
        if (pendingResult.kind === "resolved") {
          annotateTurnDecision({
            pendingState: "resolved",
            routeSelected:
              pendingResult.action.placeId ??
              pendingResult.action.section ??
              pendingResult.action.capabilityId ??
              "pending_choice",
            actionExecuted: "resolve_pending_selection",
            finalResponseOwner: "pending_choice",
          });
          completePendingChoiceExecution({
            userText: trimmed,
            action: pendingResult.action,
            reply: pendingResult.reply,
          });
        } else {
          annotateTurnDecision({
            pendingState: pendingResult.kind,
            finalResponseOwner: "pending_choice",
            actionExecuted: `pending_${pendingResult.kind}`,
          });
        }
        setAwaitingUserConfirmation(null);
        finishEarlyChatTurn("pending_choice");
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const lastAssistantForCreateFastPath = lastAssistantForPriority;
    const universalSessionActive = loadUniversalCreationSession();
    const createWorkflowContinuation =
      Boolean(universalSessionActive) &&
      isCreateWorkflowContinuation(trimmed);
    const universalCreationContinuation =
      Boolean(universalSessionActive) &&
      (isUniversalCreationMessage(lastAssistantForCreateFastPath) ||
        isGuidedCreationAssistantContext(lastAssistantForCreateFastPath) ||
        createWorkflowContinuation ||
        conversationPriority?.winner === "continue_creation" ||
        Boolean(universalSessionActive?.approvedDraft) ||
        universalSessionActive?.phase === "awaiting_action" ||
        universalSessionActive?.phase === "review" ||
        universalSessionActive?.phase === "revision" ||
        universalSessionActive?.phase === "approval" ||
        universalSessionActive?.phase === "guided_creation") &&
      !isVagueHelpRequest(trimmed);

    if (
      !continuityLocksBroadRouting &&
      !intentWorkflowTurnRef.current?.blockCreateFastPath &&
      (isSimpleCreateRequest(trimmed) || universalCreationContinuation)
    ) {
      const createRouting = resolveIntentRouting({
        userText: trimmed,
        workspace: workspacePanel,
        emotionalState: detectEmotionalState(trimmed),
        overwhelmed: detectEmotionalState(trimmed) === "overwhelmed",
      });
      const createDocType = detectUniversalDocumentType(trimmed);
      const createFastPathAction = runReliableSyncLayer(
        "create_fast_path",
        () =>
          resolveCreateFastPathAction(
            {
              userText: trimmed,
              currentTurn: chatTurnRef.current,
              lastAssistantText: lastAssistantForCreateFastPath,
              workspace: workspacePanel,
              primaryTurn: primaryTurnDecision,
            },
            createRouting,
          ),
        {
          category: "none",
          suppressRelationship: false,
          suppressRecap: false,
          suppressReflectionFirst: false,
          responseHint: null,
          localReply: null,
          pendingAction: null,
          toolSuggestion: null,
          workspaceOffer: null,
          intentRouting: createRouting,
        } satisfies FrictionlessActionDecision,
        {
          turn: chatTurnRef.current,
          userText: trimmed,
          intent: primaryTurnDecision.type,
          turnOwner: "frictionless:universal_creation",
        },
      );

      if (createFastPathAction?.localReply) {
        logConversationPipelineDiagnostic({
          turn: chatTurnRef.current,
          userText: trimmed,
          detectedIntent: "CREATE",
          kernelHandled: false,
          informationalChatBypass: true,
          estateKernelForced: false,
          taskLockBlocksEstate: true,
          selectedHandler: "CREATE_FAST_PATH",
          turnOwner: "frictionless:universal_creation",
          normalizedMessage: normalizeTurnMessage(trimmed),
          primaryType: primaryTurnDecision.type,
          primaryOwner: "frictionless:universal_creation",
          primaryConfidence: primaryTurnDecision.confidence,
          createFastPath: true,
          createDocumentType: createDocType,
        });
        lastUserTextRef.current = trimmed;
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        setMessages((prev) => [
          ...(fresh ? [] : prev),
          userMessage,
        ]);
        setInput("");
        voiceUsedRef.current = false;
        if (!getPrefs().hasChatted) {
          savePrefs({ hasChatted: true });
          setHasChatted(true);
        }
        if (
          presentFrictionlessLocalReply(createFastPathAction, finishLatencyTurn)
        ) {
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: createFastPathAction.localReply!,
          },
        ]);
        recordPrimaryTurnResponse(createFastPathAction.localReply!);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const lastAssistantForYesEarly =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
    const priorUserForYesEarly = [...messages]
      .reverse()
      .find((m) => m.role === "user")?.content;

    let estateTaskLockTurn: ReturnType<typeof applyEstateTaskLockTurn> | null =
      null;
    let taskLockBlocksEstateRouting = false;
    const detectedForTaskLockEarly = detectEmotionalState(trimmed);
    estateTaskLockTurn = applyEstateTaskLockTurn({
      userText: trimmed,
      lastAssistantText: lastAssistantForYesEarly,
      priorUserText: priorUserForYesEarly,
      conversationTurn: chatTurnRef.current,
      informationalTurn: isInformationalChatTurn(trimmed),
      overwhelmed: detectedForTaskLockEarly === "overwhelmed",
      inDirectEstateVisit: Boolean(directEstateVisitRef.current),
    });
    taskLockBlocksEstateRouting =
      estateTaskLockTurn.suppressEstateRoomRouting;

    const frictionlessPending = loadFrictionlessPendingForConfirmation({
      confirmationReply,
      awaitingPending: awaitingUserConfirmationRef.current?.frictionlessPending,
      lastAssistantText: lastAssistantForYesEarly,
      currentTurn: chatTurnRef.current,
    });

    const estateOfferOnLastTurn =
      confirmationReply && isEstateTransitionOfferMessage(lastAssistantForYesEarly);
    const collectionOfferOnLastTurn =
      confirmationReply && isCollectionOfferMessage(lastAssistantForYesEarly);
    const recoveredCollectionPending =
      !loadCollectionPendingOffer() && collectionOfferOnLastTurn
        ? recoverCollectionPendingFromAssistant({
            assistantText: lastAssistantForYesEarly,
            sourceUserText: priorUserForYesEarly ?? trimmed,
            offeredAtTurn: chatTurnRef.current,
          })
        : null;
    if (recoveredCollectionPending) {
      saveCollectionPendingOffer(recoveredCollectionPending);
    }
    const recoveredEstatePending =
      !frictionlessPending &&
      !taskLockBlocksEstateRouting &&
      estateOfferOnLastTurn
        ? recoverEstateWorkspaceOfferFromChat({
            lastAssistantText: lastAssistantForYesEarly,
            priorUserText: priorUserForYesEarly,
            currentTurn: chatTurnRef.current,
          })
        : null;
    if (recoveredEstatePending) {
      saveFrictionlessPending(recoveredEstatePending);
      registerPendingAcceptance(
        "workspace",
        recoveredEstatePending.offerSummary ?? "Estate room",
      );
      setWorkspaceOffer({
        section: recoveredEstatePending.target as AppSection,
        buttonLabel: recoveredEstatePending.offerSummary ?? "Continue",
        line: lastAssistantForYesEarly,
      });
    }
    const frictionlessPendingForYes =
      frictionlessPending ?? recoveredEstatePending;

    const visualMenuPendingEarly =
      loadVisualThinkingMenuPending() ??
      (isVisualThinkingMenuOfferMessage(lastAssistantForYesEarly)
        ? recoverVisualThinkingMenuFromChat({
            userText: trimmed,
            lastAssistantText: lastAssistantForYesEarly,
            priorUserText: priorUserForYesEarly,
            currentTurn: chatTurnRef.current,
          })
        : null);
    if (visualMenuPendingEarly) {
      const menuPick = resolveVisualMenuSelection(trimmed, visualMenuPendingEarly);
      if (menuPick) {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        const ack = completeVisualThinkingOpen({
          mode: menuPick.mode,
          viewId: menuPick.viewId,
          viewTitle: visualThinkingViewTitle(menuPick.viewId),
          purposeAnswer:
            visualMenuPendingEarly.initialPrompt?.trim() ?? priorUserForYesEarly,
          ack: visualMenuSelectionAck(menuPick.viewId),
        });
        setMessages((prev) => [...prev, { role: "assistant", content: ack }]);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const strategyOfferOnLastTurn =
      isFrictionlessAffirmation(trimmed) &&
      isStrategyIntelligenceOfferMessage(lastAssistantForYesEarly);
    const recoveredStrategyPending = strategyOfferOnLastTurn
      ? recoverStrategyOfferPendingFromChat({
          userText: trimmed,
          lastAssistantText: lastAssistantForYesEarly,
          priorUserText: priorUserForYesEarly,
          currentTurn: chatTurnRef.current,
        })
      : null;
    const strategyPendingForYes =
      recoveredStrategyPending ??
      (frictionlessPending?.type === "strategy_offer"
        ? frictionlessPending
        : null);

    if (strategyPendingForYes && strategyOfferOnLastTurn) {
      const continuation = resolveFrictionlessContinuation(
        trimmed,
        strategyPendingForYes,
        chatTurnRef.current,
        lastAssistantForYesEarly,
      );
      if (continuation?.execute) {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        const ack = completeStrategyOfferFromPending(
          strategyPendingForYes,
          continuation.ack,
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: ack },
        ]);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const isDirectEstateNavPhrase = isDirectEstateRoomRequest(trimmed);

    if (
      !taskLockBlocksEstateRouting &&
      !isDirectEstateNavPhrase &&
      frictionlessPendingForYes &&
      (isFrictionlessAffirmation(trimmed) || isConfirmationAcceptance(trimmed)) &&
      !strategyOfferOnLastTurn
    ) {
      const lastAssistantForYes = lastAssistantForYesEarly;
      if (
        !isFrictionlessPendingAlignedWithAssistant(
          frictionlessPendingForYes,
          lastAssistantForYes,
          chatTurnRef.current,
        )
      ) {
        if (!recoveredEstatePending) {
          clearFrictionlessPending();
          clearVisualThinkingMenuPending();
        }
      } else {
      const continuation = resolveFrictionlessContinuation(
        trimmed,
        frictionlessPendingForYes,
        chatTurnRef.current,
        lastAssistantForYes,
      );
      logYesContinuationResolution({
        userText: trimmed,
        pendingAction: frictionlessPendingForYes,
        frictionlessContinuation: continuation,
        menuContinuation: resolveMenuContinuation({
          userText: trimmed,
          lastAssistantText: lastAssistantForYes,
        }),
        hardNav: resolveHardNavigationCommand(trimmed),
      });
      if (continuation?.execute) {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        if (frictionlessPendingForYes.type === "create_google_sheet") {
          const sheetMsg = await executeGoogleSheetCreateFromPending(
            frictionlessPendingForYes,
          );
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: sheetMsg },
          ]);
          clearFrictionlessPending();
          clearPendingAcceptanceAuthority();
          setToolSuggestion(null);
          setWorkspaceOffer(null);
          finishEarlyChatTurn();
          finishLatencyTurn({ localReply: true });
          return;
        }
        if (frictionlessPendingForYes.type === "strategy_offer") {
          const ack = completeStrategyOfferFromPending(
            frictionlessPendingForYes,
            continuation.ack,
          );
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: ack },
          ]);
          finishEarlyChatTurn();
          finishLatencyTurn({ localReply: true });
          return;
        }
        if (frictionlessPendingForYes.target === "playbook") {
          lastUserTextRef.current = trimmed;
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: continuation.ack },
          ]);
          openSectionBesideChatCore("playbook", undefined, {
            userInitiated: true,
          });
          clearFrictionlessPending();
          clearPendingAcceptanceAuthority();
          setToolSuggestion(null);
          setWorkspaceOffer(null);
          finishEarlyChatTurn();
          finishLatencyTurn({ localReply: true });
          return;
        }
        if (frictionlessPendingForYes.target === "focus-audio") {
          lastUserTextRef.current = trimmed;
          openFocusAudioCore(
            frictionlessPendingForYes.focusAudioCategory ?? "calm-brain",
          );
        } else if (frictionlessPendingForYes.target === "breathe") {
          lastUserTextRef.current = trimmed;
          handleToolSelectCore("breathe");
        } else if (frictionlessPendingForYes.target === "brain-dump") {
          lastUserTextRef.current = trimmed;
          handleToolSelectCore("brain-dump");
        } else if (frictionlessPendingForYes.target === "decision-compass") {
          lastUserTextRef.current = trimmed;
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: continuation.ack },
          ]);
          openDecisionCompass();
        } else if (frictionlessPendingForYes.target === "visual-focus") {
          const prompt =
            frictionlessPendingForYes.initialPrompt?.trim() ?? trimmed;
          lastUserTextRef.current = prompt;
          const ack = completeVisualThinkingOpen({
            mode:
              frictionlessPendingForYes.visualFocusMode ??
              "mind-map",
            viewId: frictionlessPendingForYes.viewId,
            viewTitle: frictionlessPendingForYes.viewTitle,
            purposeAnswer: prompt,
            ack: continuation.ack,
          });
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: ack },
          ]);
        } else if (
          frictionlessPendingForYes.type === "visual_thinking_menu" ||
          frictionlessPendingForYes.type === "visual_recommendation"
        ) {
          const prompt =
            frictionlessPendingForYes.initialPrompt?.trim() ?? trimmed;
          lastUserTextRef.current = prompt;
          const viewId = frictionlessPendingForYes.viewId;
          const mode =
            frictionlessPendingForYes.visualFocusMode ??
            (viewId ? undefined : "mind-map");
          const ack = completeVisualThinkingOpen({
            mode: mode ?? "mind-map",
            viewId,
            viewTitle: frictionlessPendingForYes.viewTitle,
            purposeAnswer: prompt,
            ack: continuation.ack,
          });
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: ack },
          ]);
        } else if (frictionlessPendingForYes.target === "content-generator") {
          const prompt = frictionlessPendingForYes.initialPrompt?.trim() ?? "";
          if (prompt) lastUserTextRef.current = prompt;
          const ack = continuation.ack;
          logCreatePendingAction("target workspace", {
            target: frictionlessPendingForYes.target,
            artifactType: frictionlessPendingForYes.artifactType,
            initialPrompt: prompt,
          });
          const artifact = resolvedArtifactFromCreatePending({
            type: "open_workspace",
            target: frictionlessPendingForYes.target,
            artifactType: frictionlessPendingForYes.artifactType,
            initialPrompt: prompt,
          });
          setMessages((prev) => [...prev, { role: "assistant", content: ack }]);
          armCreateOpenGuard("frictionless_yes");
          setActiveNav("other");
          if (artifact) {
            executeCreateOpenInternal(
              CREATE_PANEL_SECTION,
              {
                itemType: artifact.itemType,
                title: resolveCollaborativeDraftTitle({
                  itemType: artifact.itemType,
                  userText: prompt,
                  existingTitle: artifact.title,
                }),
                draftContent: artifact.draftContent,
                brief: artifact.title,
                stage: "starting compose",
                source: "generated",
                artifactTypeLocked: artifact.artifactTypeLocked,
              },
              {
                silent: true,
                userInitiated: true,
                seedOverride: {
                  type: artifact.itemType,
                  topic: artifact.title,
                  brief: artifact.title,
                  draft: artifact.draftContent || undefined,
                  autoGenerate: false,
                },
              },
            );
            logCreatePendingAction("workspace opened", {
              target: "content-generator",
              artifactType: artifact.itemType,
            });
          } else {
            openCreateWorkspace({
              source: "hard_nav",
              initialPrompt: prompt,
              artifactType: frictionlessPendingForYes.artifactType,
            });
          }
          if (!shouldPreserveEstateRoomSectionDuringChat(activeSectionRef.current)) {
            applyChatLayoutMode("split");
            setActiveSection("home");
            activeSectionRef.current = "home";
          }
          revealWorkspace();
          logCreatePendingAction("active panel after open", {
            activePanel: workspacePanelRef.current ?? "content-generator",
          });
        } else if (
          frictionlessPendingForYes.type === "open_workspace" &&
          frictionlessPendingForYes.target &&
          (frictionlessPendingForYes.target as string) !== "content-generator"
        ) {
          const offer =
            workspaceOffer ??
            buildWorkspaceOfferForEstateSection(
              frictionlessPendingForYes.target as AppSection,
              lastAssistantForYesEarly,
            );
          acceptWorkspaceOfferCore(offer);
        } else {
          lastUserTextRef.current = trimmed;
        }
        const handledEstateWorkspaceYes =
          frictionlessPendingForYes.type === "open_workspace" &&
          frictionlessPendingForYes.target !== "content-generator";
        if (
          frictionlessPendingForYes.target !== "content-generator" &&
          !handledEstateWorkspaceYes
        ) {
          if (frictionlessPendingForYes.target !== "visual-focus") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: continuation.ack },
            ]);
          }
        }
        clearFrictionlessPending();
        clearPendingAcceptanceAuthority();
        setToolSuggestion(null);
        setWorkspaceOffer(null);
        setAwaitingUserConfirmation(null);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
      }
    }

    if (
      isPureConfirmationDecline(trimmed) &&
      awaitingUserConfirmationRef.current?.active
    ) {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          role: "assistant",
          content: "No problem — we can stay right here. What would help most?",
        },
      ]);
      setInput("");
      voiceUsedRef.current = false;
      clearFrictionlessPending();
      clearVisualThinkingMenuPending();
      clearPendingAcceptanceAuthority();
      setToolSuggestion(null);
      setWorkspaceOffer(null);
      setAwaitingUserConfirmation(null);
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    const hardNav = resolveHardNavigationCommand(trimmed);
    if (hardNav) {
      createOpenTraceRef.current = nextCreateOpenTraceId(trimmed);
      publishLiveWorkspaceTrace("before_handler", {
        command: trimmed,
        matchedHardNav: true,
        hardNavTarget:
          hardNav.target.kind === "workspace"
            ? hardNav.target.section
            : hardNav.target.kind,
      });
      publishLiveWorkspaceTrace("after_resolve_hard_nav", {
        command: trimmed,
        matchedHardNav: true,
        hardNavTarget:
          hardNav.target.kind === "workspace"
            ? hardNav.target.section
            : hardNav.target.kind,
      });
      const userMessage: Message = { role: "user", content: trimmed };
      if (fresh) clearConversation();
      setMessages((prev) =>
        fresh
          ? [userMessage, { role: "assistant", content: hardNav.localReply }]
          : [
              ...prev,
              userMessage,
              { role: "assistant", content: hardNav.localReply },
            ],
      );
      setInput("");
      voiceUsedRef.current = false;
      lastUserTextRef.current = trimmed;
      clearAllPendingOffers();
      clearFrictionlessPending();
      if (
        hardNav.target.kind === "workspace" &&
        hardNav.target.section === CREATE_PANEL_SECTION
      ) {
        openCreateWorkspace({
          source: "hard_nav",
          initialPrompt: trimmed,
          hardNavCommand: trimmed,
        });
      } else {
        switch (hardNav.target.kind) {
          case "workspace":
            openSectionBesideChatCore(hardNav.target.section, hardNav.target.nav, {
              userInitiated: true,
            });
            break;
          case "decision-compass":
            openDecisionCompass();
            break;
          case "focus-audio":
            openFocusAudioCore();
            break;
          case "adapt-my-day":
            openAdaptMyDayCore();
            break;
          case "clear-my-mind":
            openClearMyMindCore();
            break;
        }
      }
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (topicChangeClearsThread(trimmed)) {
      clearOutcomeThread();
    } else if (
      trimmed.length >= 12 &&
      !isBareGenericAcceptance(trimmed) &&
      !isAcceptanceAttempt(trimmed) &&
      !isEntrepreneurialPatternShare(trimmed)
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
      clearPendingCommitmentAuthority();
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
        finishEarlyChatTurn();
        return;
      }
    }

    if (pendingConversationHandoff && userAcceptedAssemblyConfirmation(trimmed)) {
      const userMessage: Message = { role: "user", content: trimmed };
      const nextMsgs = [...messages, userMessage];
      setMessages(nextMsgs);
      setInput("");
      openCreateFromConversationHandoff(pendingConversationHandoff, nextMsgs);
      finishEarlyChatTurn();
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
      finishEarlyChatTurn();
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

    // Strategy create / browse / apply / resume + classification are owned by
    // processIntentWorkflowOnUserTurn (early in this send). Do not re-ask or
    // re-enter Create Document from the late CPC strategy regex.

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

    const facilitatedV2Active =
      CREATE_WORKSPACE_V2 &&
      chatLayoutMode === "split" &&
      workspacePanel === "content-generator" &&
      createBuilderSession?.workflow.workspaceFirst &&
      !fresh &&
      !isWorkflowConceptQuestion(trimmed);

    if (facilitatedV2Active && createBuilderSession) {
      const lastAssistantForFacilitation =
        [...messages].reverse().find((m) => m.role === "assistant")?.content ??
        "";
      const facilitation = processFacilitatedWorkspaceTurn(
        trimmed,
        createBuilderSession.workflow,
        lastAssistantForFacilitation,
      );
      if (facilitation.kind === "apply_section") {
        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(false);

        const nextWorkflow = facilitation.workflow;
        const nextSession = {
          ...createBuilderSession,
          workflow: nextWorkflow,
        };
        setCreateBuilderSession(nextSession);
        const record = mergeRecordFromWorkflow(
          createWorkflowRecordRef.current ??
            loadWorkflowRecord() ??
            workflowRecordFromState(createBuilderSession.workflow, {
              builderPhase: createBuilderSession.phase,
              source: "chat",
              itemType: createBuilderSession.typeLabel,
            }),
          nextWorkflow,
          "chat",
          createBuilderSession.phase,
        );
        commitCreateWorkflowRecord(record);

        const reply = facilitation.nextPrompt
          ? `Got it — I've added that to **${facilitation.sectionId}**.\n\n${facilitation.nextPrompt}`
          : `Got it — I've added that to **${facilitation.sectionId}**. Here's what we have so far.`;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);
        if (splitCreateChat && workspacePanel === "content-generator") {
          stayInCreateSplitScreen();
        }
        return;
      }
    }

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
    if (isEntrepreneurialPatternShare(trimmed)) {
      patchOutcomeThread({
        currentProblem: trimmed.slice(0, 200),
        pendingAction: undefined,
        pendingQuestion: undefined,
        lastOfferSummary: undefined,
        activeFeature: undefined,
      });
      clearFrictionlessPending();
      clearPendingAcceptanceAuthority();
      setWorkspaceOffer(null);
    }
    const detected = detectEmotionalState(trimmed);
    setEmotion(detected);
    const userMessage: Message = { role: "user", content: trimmed };
    if (fresh) clearConversation();
    const nextMessages = fresh ? [userMessage] : [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    inputSnapshotRef.current = "";
    patchEstateRuntimeState({ inputBuffer: "" });
    const usedVoiceThisTurn = voiceUsedRef.current;
    voiceUsedRef.current = false;
    setError(null);

    const lastAssistantBeforeSend =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

    const winSavePendingNow = loadWinSavePending();
    if (winSavePendingNow) {
      const winSaveReply = resolveWinSaveReply(trimmed, winSavePendingNow);
      if (winSaveReply.handled) {
        if (winSaveReply.openPlaceId === "evidence-vault") {
          openGrowthDestinationCore("evidence-bank");
        } else if (winSaveReply.openPlaceId === "portfolio") {
          openGrowthDestinationCore("growth-portfolio");
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: winSaveReply.ack },
        ]);
        setAwaitingUserConfirmation(null);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const winSaveRequest =
      handleWinSaveRequest({
        userText: trimmed,
        seedText: lastAssistantBeforeSend.slice(0, 400) || trimmed,
        offeredAtTurn: chatTurnRef.current,
      }) ??
      handleEvidenceCaptureMoment({
        userText: trimmed,
        offeredAtTurn: chatTurnRef.current,
      });
    if (winSaveRequest) {
      if (winSaveRequest.kind === "offer") {
        saveWinSavePending(winSaveRequest.pending);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: winSaveRequest.message },
        ]);
        setAwaitingUserConfirmation(
          createAwaitingConfirmationState({
            assistantPrompt: winSaveRequest.message,
            offeredAtTurn: chatTurnRef.current,
            kind: "general",
          }),
        );
      } else {
        clearWinSavePending();
        if (winSaveRequest.openPlaceId === "evidence-vault") {
          openGrowthDestinationCore("evidence-bank");
        } else if (winSaveRequest.openPlaceId === "portfolio") {
          openGrowthDestinationCore("growth-portfolio");
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: winSaveRequest.ack },
        ]);
        setAwaitingUserConfirmation(null);
      }
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    const confidenceRecovery = runConfidenceRecovery(trimmed);
    if (confidenceRecovery) {
      const recoveryMessage = confidenceRecovery.message;
      const openTarget =
        confidenceRecovery.openPlaceId === "portfolio"
          ? "growth-portfolio"
          : confidenceRecovery.openPlaceId === "wins-this-week"
            ? "wins-this-week"
            : confidenceRecovery.openPlaceId === "my-journey"
              ? "my-journey"
              : "evidence-bank";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: recoveryMessage },
      ]);
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: recoveryMessage,
          offeredAtTurn: chatTurnRef.current,
          kind: "general",
          frictionlessPending: {
            type: "open_workspace",
            target: openTarget,
            label:
              openTarget === "growth-portfolio"
                ? "Hall of Accomplishments"
                : openTarget === "wins-this-week"
                  ? "Celebration Garden"
                  : openTarget === "my-journey"
                    ? "Wins Timeline"
                    : "Evidence Vault",
            context: recoveryMessage,
            offerSummary: "Open evidence for restoration",
            offeredAtTurn: chatTurnRef.current,
          },
        }),
      );
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (
      detectsSoftDiscouragement(trimmed) ||
      detectsEncouragementNeed(trimmed)
    ) {
      /** Permission first — never auto-open Evidence Vault for encouragement/doubt. */
      const encouragementLine = EVIDENCE_VAULT_ENCOURAGEMENT_LINE;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: encouragementLine },
      ]);
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: encouragementLine,
          offeredAtTurn: chatTurnRef.current,
          kind: "general",
          frictionlessPending: {
            type: "open_workspace",
            target: "evidence-bank",
            label: "Evidence Vault",
            context: encouragementLine,
            offerSummary: "Open Evidence Vault",
            offeredAtTurn: chatTurnRef.current,
          },
        }),
      );
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (detectsWinsTimelineRequest(trimmed)) {
      openGrowthDestinationCore("my-journey");
      const timelineAck =
        "Opening your Wins Timeline — progress over months and years, not just isolated moments.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: timelineAck },
      ]);
      setAwaitingUserConfirmation(null);
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (
      shouldInviteCelebrationGarden(trimmed) &&
      !detectsWinSaveRequest(trimmed)
    ) {
      const inviteLine = CELEBRATION_GARDEN_INVITE_LINE;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: inviteLine },
      ]);
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: inviteLine,
          offeredAtTurn: chatTurnRef.current,
          kind: "general",
          frictionlessPending: {
            type: "open_workspace",
            target: "wins-this-week",
            label: "Celebration Garden",
            context: inviteLine,
            offerSummary: "Open Celebration Garden",
            offeredAtTurn: chatTurnRef.current,
          },
        }),
      );
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    const collectionPendingNow = loadCollectionPendingOffer();
    if (collectionPendingNow) {
      const collectionReply = resolveCollectionOfferReply(
        trimmed,
        collectionPendingNow,
      );
      if (collectionReply.handled) {
        if (collectionReply.kind === "open" && collectionReply.openRoomId) {
          openCollectionRoomWithPrefillCore(
            collectionReply.openRoomId,
            collectionReply.prefill ?? collectionPendingNow.prefill,
            collectionReply.sourceText ?? collectionPendingNow.sourceUserText,
          );
        }
        if (collectionReply.nextPending) {
          saveCollectionPendingOffer(collectionReply.nextPending);
        } else if (collectionReply.kind !== "menu") {
          clearCollectionPendingOffer();
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: collectionReply.ack },
        ]);
        if (
          collectionReply.kind === "menu" ||
          collectionReply.kind === "decline" ||
          isCollectionOfferMessage(collectionReply.ack)
        ) {
          setAwaitingUserConfirmation(
            createAwaitingConfirmationState({
              assistantPrompt: collectionReply.ack,
              offeredAtTurn: chatTurnRef.current,
              kind: "general",
            }),
          );
        } else {
          setAwaitingUserConfirmation(null);
        }
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    if (isVagueOfferConfusion(trimmed, lastAssistantBeforeSend)) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: vagueOfferConfusionReply() },
      ]);
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    const explicitAction = resolveExplicitCompanionAction(
      trimmed,
      lastAssistantBeforeSend,
    );
    if (explicitAction) {
      executeExplicitCompanionAction(explicitAction, finishLatencyTurn);
      return;
    }

    const visitAtSend = directEstateVisitRef.current;
    const currentEstateRoomId = resolveCurrentEstateRoom({
      directVisitRoomId: visitAtSend?.roomId ?? null,
      activeSection: activeSectionRef.current,
      memoryRoomId: getEstateMemory().currentRoom?.entryId ?? null,
    });
    setCurrentRoom(currentEstateRoomId);

    if (
      currentEstateRoomId === "evidence-vault" ||
      activeSectionRef.current === "evidence-bank"
    ) {
      if (isEvidenceVaultLeaveRequest(trimmed)) {
        navigateBackToEstateHome();
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }

      const lastVaultPrompt =
        lastAssistantBeforeSend.includes(
          "What discovery would you like to preserve",
        ) ||
        lastAssistantBeforeSend.includes(
          "What would you like to preserve today",
        );

      if (
        looksLikeEvidenceVaultDiscoveryShare(trimmed) ||
        (lastVaultPrompt && trimmed.length >= 8)
      ) {
        openCollectionRoomWithPrefillCore(
          "evidence-vault",
          { situation: trimmed },
          trimmed,
        );
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I've opened today's Discovery File with what you shared. Add anything else you'd like, then we can preserve it.",
          },
        ]);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }

      const vaultContextReply = evidenceVaultContextReply(trimmed);
      if (vaultContextReply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: vaultContextReply },
        ]);
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const informationalChatTurn = isInformationalChatTurn(trimmed);

    // estateTaskLockTurn applied before frictionless yes-handler (Phase 2C)
    if (!estateTaskLockTurn) {
      const priorUserMessagesForTaskLock = messages.filter(
        (m) => m.role === "user",
      );
      const priorUserForTaskLock =
        priorUserMessagesForTaskLock.length > 1
          ? priorUserMessagesForTaskLock[
              priorUserMessagesForTaskLock.length - 2
            ]?.content
          : undefined;
      estateTaskLockTurn = applyEstateTaskLockTurn({
        userText: trimmed,
        lastAssistantText: lastAssistantBeforeSend,
        priorUserText: priorUserForTaskLock,
        conversationTurn: chatTurnRef.current,
        informationalTurn: informationalChatTurn,
        overwhelmed: detected === "overwhelmed",
        inDirectEstateVisit: Boolean(visitAtSend),
      });
      taskLockBlocksEstateRouting =
        estateTaskLockTurn.suppressEstateRoomRouting;
    }

    const estateKernelForced =
      !preferChatAnswer &&
      primaryTurnAllowsKernel(primaryTurnDecision) &&
      shouldRouteThroughEstateKernel(trimmed, {
        primaryTurn: primaryTurnDecision,
      });

    const classifiedIntent = runReliableSyncLayer(
      "estate_kernel",
      () =>
        classifyCompanionIntent({
          userText: trimmed,
          lastAssistantText: lastAssistantBeforeSend,
          currentPlaceId: currentEstateRoomId,
          activeSection: activeSectionRef.current,
          forceChat:
            preferChatAnswer ||
            ((informationalChatTurn ||
              taskLockBlocksEstateRouting ||
              isDirectHelpOverrideRequest(trimmed)) &&
              !estateKernelForced),
          primaryTurn: primaryTurnDecision,
        }),
      {
        kind: "CHAT",
        userText: trimmed,
        plan: { type: "chat", userText: trimmed },
      },
      {
        turn: chatTurnRef.current,
        userText: trimmed,
        intent: primaryTurnDecision.type,
        currentRoom: currentEstateRoomId ?? null,
        turnOwner: primaryTurnDecision.owner,
      },
    );

    const priorUserMessagesForDiagnostic = messages.filter((m) => m.role === "user");
    const priorUserForDiagnostic =
      priorUserMessagesForDiagnostic.length > 1
        ? priorUserMessagesForDiagnostic[
            priorUserMessagesForDiagnostic.length - 2
          ]?.content
        : undefined;

    const kernelHandled = executeCompanionIntent(classifiedIntent, {
      onCaptureWrite: (plan) => {
        executeCaptureWrite({
          kind: "write",
          captureType: plan.captureType,
          content: plan.content,
          userText: plan.userText,
        });
      },
      onNavigateMemory: ({ tab }) => {
        openUserMemoryCore(tab);
      },
      onNavigatePlace: ({ command, navigationLine }) => {
        if (preferChatAnswer) {
          return;
        }
        if (
          taskLockBlocksEstateRouting &&
          !estateTaskLockTurn.allowsExplicitEstateNavigation
        ) {
          return;
        }
        // Chat-primary turns answer in conversation — do not swap rooms as a
        // side effect of send. Clear My Mind stays exempt. CB-022 — Chamber
        // members only when the shared navigate gate allows (not bare aliases).
        if (activePrimaryTurnRef.current?.blockKernelNavigation) {
          const roomId = command.roomId ?? command.entryId;
          const opensClearMyMind =
            command.section === "brain-dump" ||
            roomId === "clear-my-mind" ||
            command.entryId === "clear-my-mind";
          const opensChamberMember = Boolean(
            command.workspaceOffer.chamberMemberId,
          );
          const chamberNavAllowed =
            opensChamberMember && shouldAllowChamberKernelExemption(trimmed);
          if (!opensClearMyMind && !chamberNavAllowed) {
            const offerLine =
              navigationLine?.trim() ||
              command.workspaceOffer.line?.trim() ||
              (command.entry?.name
                ? `If you'd like, we could visit the ${command.entry.name} — just say when.`
                : null);
            if (
              offerLine &&
              !isBlockedGenericFallbackText(offerLine) &&
              !opensChamberMember
            ) {
              markAssistantReplied(chatTurnState);
              recordPrimaryTurnResponse(offerLine);
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: offerLine },
              ]);
            }
            return;
          }
        }
        runDirectEstateRoomNavigation(command, trimmed, navigationLine);
      },
      onSoundscape: (plan) => {
        void executeSoundscapeIntent(plan);
      },
      onAssistantLine: (line) => {
        markAssistantReplied(chatTurnState);
        recordPrimaryTurnResponse(line);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: line },
        ]);
      },
      onPlaceMenu: ({ line, placeIds }) => {
        if (taskLockBlocksEstateRouting && !estateKernelForced) return;
        savePendingEstatePlaceMenu({
          placeIds,
          offeredAtTurn: chatTurnRef.current,
          menuText: line,
        });
        markAssistantReplied(chatTurnState);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: line },
        ]);
        setAwaitingUserConfirmation(
          createAwaitingConfirmationState({
            assistantPrompt: line,
            offeredAtTurn: chatTurnRef.current,
            kind: "general",
          }),
        );
      },
      onCaptureMenu: ({ line }) => {
        markAssistantReplied(chatTurnState);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: line },
        ]);
      },
      onRoomAction: ({ roomAction, reply, userText }) => {
        markAssistantReplied(chatTurnState);
        recordPrimaryTurnResponse(reply);
        executeEstateRoomActionCore({ userText, roomAction, reply });
      },
      onClearPlaceMenu: () => clearPendingEstatePlaceMenu(),
      onOpenExploreSpark: () => {
        if (taskLockBlocksEstateRouting && !estateKernelForced) return;
        openExploreSparkVisualExplorer();
      },
    });

    const resolvedCanonicalPlaceId = resolveEstatePlaceIdFromUserText(trimmed);
    const impliedPlaceMatchResult = matchImpliedEstatePlace(trimmed);
    const impliedPlaceMatch = impliedPlaceMatchResult
      ? `${impliedPlaceMatchResult.matchKey}:${impliedPlaceMatchResult.placeId}`
      : null;
    const impliedNeedIntent = impliedNeedDiagnosticLabel(evaluateImpliedNeed(trimmed));
    logConversationPipelineDiagnostic({
      turn: chatTurnRef.current,
      userText: trimmed,
      detectedIntent: primaryTurnDecision.type,
      kernelHandled,
      informationalChatBypass:
        informationalChatTurn && !estateKernelForced,
      estateKernelForced,
      taskLockBlocksEstate: taskLockBlocksEstateRouting,
      selectedHandler: kernelHandled
        ? `kernel:${classifiedIntent.plan.type}`
        : primaryTurnDecision.owner,
      workspacePanel: workspacePanel ?? null,
      currentPlaceId: currentEstateRoomId,
      resolvedCanonicalPlaceId,
      impliedPlaceMatch,
      impliedNeedIntent,
      primaryType: primaryTurnDecision.type,
      primaryOwner: primaryTurnDecision.owner,
      primaryConfidence: primaryTurnDecision.confidence,
      lastAssistantPreview: lastAssistantBeforeSend ?? null,
      priorUserPreview: priorUserForDiagnostic ?? null,
    });

    if (process.env.NODE_ENV === "development") {
      const priorUserMessages = messages.filter((m) => m.role === "user");
      const priorUserForShadow =
        priorUserMessages.length > 0
          ? priorUserMessages[priorUserMessages.length - 1]?.content
          : undefined;
      observeEstateOrchestrationShadowTurn({
        userText: trimmed,
        lastAssistantText: lastAssistantBeforeSend,
        priorUserText: priorUserForShadow,
        conversationTurn: chatTurnRef.current,
        currentPlaceId: currentEstateRoomId,
        workspacePanel: workspacePanel ?? null,
        overwhelmed: detected === "overwhelmed",
        informationalTurn: informationalChatTurn,
        inDirectEstateVisit: Boolean(visitAtSend),
      });
    }

    if (kernelHandled) {
      const navTarget =
        classifiedIntent.plan.type === "navigate-place"
          ? classifiedIntent.plan.command.roomId ??
            classifiedIntent.plan.command.entryId ??
            null
          : null;
      logTurnOwner({
        turn: chatTurnRef.current,
        rawMessage: trimmed,
        normalizedMessage: normalizeTurnMessage(trimmed),
        owner:
          classifiedIntent.plan.type === "room-action"
            ? "in_room_action"
            : "estate_kernel",
        intent: classifiedIntent.kind,
        currentRoom: currentEstateRoomId ?? null,
        navigationTarget: navTarget,
      });
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    // Overwhelm / cognitive need wins before Estate Guide scenic menus.
    // Phase A: authorizeScenicPlaceMenu is the single scenic permission check.
    const overwhelmNeedKind = classifyOverwhelmNeed(trimmed);
    const blockScenicEstateGuide =
      !authorizeScenicPlaceMenu(trimmed) ||
      !mayOfferScenicPlaceSuggestions(trimmed) ||
      shouldBlockScenicOverwhelmMenu(trimmed) ||
      overwhelmNeedKind === "cognitive_overload" ||
      overwhelmNeedKind === "task_breakdown" ||
      overwhelmNeedKind === "emotional_calming" ||
      detected === "overwhelmed" ||
      detected === "burnout";

    if (!blockScenicEstateGuide && isEstateGuideQuestion(trimmed)) {
      const guideReply = finalizeMemberFacingAssistantText(
        formatEstateGuideReply(resolveEstateGuideTurn(trimmed)),
        "estate_guide",
      );
      markAssistantReplied(chatTurnState);
      recordPrimaryTurnResponse(guideReply);
      annotateTurnDecision({
        finalResponseOwner: "estate_guide",
        routeSelected: "estate_guide",
        actionExecuted: "local_reply",
      });
      logConversationPipelineDiagnostic({
        turn: chatTurnRef.current,
        userText: trimmed,
        detectedIntent: "INFORMATION_OR_RESEARCH",
        kernelHandled: false,
        informationalChatBypass: true,
        estateKernelForced: false,
        taskLockBlocksEstate: false,
        selectedHandler: "estate_guide",
        turnOwner: "frictionless:estate_guide",
        normalizedMessage: normalizeTurnMessage(trimmed),
        primaryType: primaryTurnDecision.type,
        primaryOwner: primaryTurnDecision.owner,
        primaryConfidence: primaryTurnDecision.confidence,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: guideReply },
      ]);
      finishEarlyChatTurn("estate_guide");
      finishLatencyTurn({ localReply: true });
      return;
    }

    // classifiedIntent.kind === "CHAT" — chat API path only.

    if (isChatRequestSuperseded(sendGeneration, chatRequestGenerationRef.current)) {
      endTurnDecision();
      return;
    }

    markChatTurnLoading(chatTurnState);
    beginVisibleThinking(trimmed, detected);
    setIsLoading(true);
    const requestAbort = new AbortController();
    chatRequestAbortRef.current = requestAbort;
    const isStaleSend = () =>
      isChatRequestSuperseded(sendGeneration, chatRequestGenerationRef.current) ||
      requestAbort.signal.aborted;
    const finishLocalChatTurn = (assistantContent?: string) => {
      if (assistantContent) {
        const voiced = finalizeMemberFacingAssistantText(
          assistantContent,
          "local_chat_turn",
        );
        markAssistantReplied(chatTurnState);
        recordPrimaryTurnResponse(voiced);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: voiced },
        ]);
      }
      annotateTurnDecision({
        finalResponseOwner: "local_chat_turn",
        routeSelected: "natural_conversation",
        actionExecuted: assistantContent ? "assistant_reply" : "empty",
      });
      finishEarlyChatTurn("local_chat_turn");
    };
    if (!getPrefs().hasChatted) {
      savePrefs({ hasChatted: true });
      setHasChatted(true);
    }
    lastEmotionalStateRef.current = detected;
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
    const classifiedSignals = observeUserSignalsFromText({
      text: trimmed,
      emotionalState: detected,
      source: "chat",
    });
    void syncClassifiedSignalsToServer(classifiedSignals);
    ingestClassifiedUserSignals(classifiedSignals, {
      source: "chat",
      emotionalState: detected,
    });
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
      const assistantContent = result.plan
        ? "Here's a gentle plan for today — change anything you like."
        : (result.question ?? "Got it.");
      finishLocalChatTurn(assistantContent);
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (shouldStartDayDesigner(trimmed) && !isDayDesignerDismissedToday()) {
      const session = beginDayDesignerFlow();
      const firstQ = questionForStep("time");
      setDayDesignerSession(session);
      setDayDesignerQuestion(firstQ);
      setDayPlanView(null);
      finishLocalChatTurn(`${companionIntroForDayDesigner()} ${firstQ}`);
      finishLatencyTurn({ localReply: true });
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
      setPhysicalActionWaiting(false);
      finishLocalChatTurn(physicalDoneFollowUp());
      finishLatencyTurn({ localReply: true });
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
      const collectionOffer = collectionOfferForRoom("celebration-garden", trimmed);
      const pending = createCollectionPendingOffer({
        roomId: collectionOffer.roomId,
        sourceUserText: trimmed,
        offerLine: collectionOffer.offerLine,
        prefill: collectionOffer.prefill,
        offeredAtTurn: chatTurnRef.current,
      });
      saveCollectionPendingOffer(pending);
      markCollectionOfferCooldown(chatTurnRef.current);
      finishLocalChatTurn(collectionOffer.offerLine);
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: collectionOffer.offerLine,
          offeredAtTurn: chatTurnRef.current,
          kind: "general",
        }),
      );
      logMomentum("complete", `Win: ${trimmed.slice(0, 60)}`);
      clearLastActivity();
      setLastAct(null);
      finishLatencyTurn({ localReply: true });
      return;
    }

    const commitUserLine = () => {
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
          finishEarlyChatTurn();
          return;
        }
      }
      const picked = parseDocumentTypeChoice(trimmed);
      if (picked) {
        commitUserLine();
        const topic = pendingDocumentTypeChoice.topic;
        setPendingDocumentTypeChoice(null);
        openCollaborativeDocument(picked, topic, trimmed);
        finishEarlyChatTurn();
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
      finishEarlyChatTurn();
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
      finishEarlyChatTurn();
      return;
    }

    if (isFounderActionAcceptance(trimmed) && founderActionBoard.currentAction) {
      commitUserLine();
      respondToFounderAction(founderActionBoard.currentAction, "open");
      finishEarlyChatTurn();
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
        finishEarlyChatTurn();
        return;
      }
      const kind = inferDocumentTypeFromRequest(trimmed);
      if (kind) {
        commitUserLine();
        openCollaborativeDocument(kind, extractDocumentTopic(trimmed), trimmed);
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
        return;
      }
    }

    if (!shouldPreserveEstateRoomSectionDuringChat(activeSectionRef.current)) {
      setActiveSection("home");
      setActiveNav(workspacePanel === "content-generator" ? "create" : "chat");
    }

    latencyProfiler.mark("intentRouting");
    let turnIntentRouting = resolveIntentRouting({
      userText: trimmed,
      workspace: workspacePanel,
      supportStyle: getActiveSupportStyleId(),
      emotionalState: detected,
      overwhelmed: detected === "overwhelmed",
    });
    latencyProfiler.measure("intentRouting");
    const learnFastPath = turnIntentRouting.learnFastPath;

    const inputType = usedVoiceThisTurn ? "voice" : "text";

    const lastAssistantText =
      [...nextMessages].reverse().find((m) => m.role === "assistant")?.content ??
      "";

    const userTurns = nextMessages.filter((m) => m.role === "user");
    const priorUserText =
      userTurns.length >= 2
        ? userTurns[userTurns.length - 2]?.content
        : undefined;
    const menuContinuation: MenuContinuationResolution = resolveMenuContinuation({
      userText: trimmed,
      lastAssistantText,
      priorUserText,
    });
    if (menuContinuation.active) {
      turnIntentRouting = applyMenuContinuationRoutingOverrides(turnIntentRouting);
    }

    const welcomeHomeConciergeContext =
      !workspacePanel &&
      !guideBesideSession &&
      !splitCreateChat &&
      !companionStandaloneSection;
    const estateConversationTurn =
      informationalChatTurn || taskLockBlocksEstateRouting
      ? null
      : evaluateEstateConversationTurn({
      userText: trimmed,
      activeSection: activeSectionRef.current,
      workspacePanel,
      emotionalState: detected,
      overwhelmed: detected === "overwhelmed",
      intentCategory: turnIntentRouting.category,
      welcomeHomePrimary,
      hasConversationHistory: messages.some((m) => m.role === "user"),
      frostedChatContext: welcomeHomeConciergeContext,
    });
    const estateIntelligenceEval = estateConversationTurn?.estate ?? null;
    const estateWorkspaceOffer =
      estateConversationTurn?.workspaceOffer ?? null;
    const estateRoutingActive =
      !taskLockBlocksEstateRouting &&
      Boolean(estateConversationTurn?.estateRoutingActive);
    const suppressGenericFeatureHintsForEstate = Boolean(
      estateConversationTurn?.suppressGenericFeatureHints,
    );

    recordEstateConversationTurn({
      userText: trimmed,
      emotionalLabel: detected,
      overwhelmed: detected === "overwhelmed",
      intentLabel: turnIntentRouting.category ?? null,
    });

    latencyProfiler.mark("frictionlessAction");

    if (
      !distressed &&
      !estateRoutingActive &&
      !workspacePanel &&
      !isCollectionOfferCooldownActive(chatTurnRef.current) &&
      !primaryTurnDecision.blockCollectionOffer
    ) {
      const collectionOffer = evaluateCollectionSaveOffer({
        userText: trimmed,
        currentTurn: chatTurnRef.current,
        workspaceOpen: Boolean(workspacePanel),
        overwhelmed: detected === "overwhelmed",
        cooldownActive: isCollectionOfferCooldownActive(chatTurnRef.current),
      });
      if (collectionOffer) {
        const isWinOrEvidenceRoom =
          collectionOffer.roomId === "celebration-garden" ||
          collectionOffer.roomId === "celebration-hall" ||
          collectionOffer.roomId === "achievement-library";
        if (collectionOffer.roomId === "evidence-vault") {
          const vaultOfferLine = `${EVIDENCE_VAULT_CHAT_PRESERVE_OFFER}\n\nWould you like to preserve it?`;
          const pending = createCollectionPendingOffer({
            roomId: "evidence-vault",
            sourceUserText: trimmed,
            offerLine: vaultOfferLine,
            prefill: collectionOffer.prefill,
            offeredAtTurn: chatTurnRef.current,
          });
          saveCollectionPendingOffer(pending);
          markCollectionOfferCooldown(chatTurnRef.current);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: vaultOfferLine },
          ]);
          recordPrimaryTurnResponse(vaultOfferLine);
          setAwaitingUserConfirmation(
            createAwaitingConfirmationState({
              assistantPrompt: vaultOfferLine,
              offeredAtTurn: chatTurnRef.current,
              kind: "general",
            }),
          );
          finishEarlyChatTurn();
          finishLatencyTurn({ localReply: true });
          return;
        }
        if (isWinOrEvidenceRoom) {
          const winPending = createWinSavePending({
            seedText: trimmed,
            offeredAtTurn: chatTurnRef.current,
          });
          saveWinSavePending(winPending);
          markCollectionOfferCooldown(chatTurnRef.current);
          const winOfferLine = formatWinSaveOfferMessage(winPending.offer);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: winOfferLine },
          ]);
          recordPrimaryTurnResponse(winOfferLine);
          setAwaitingUserConfirmation(
            createAwaitingConfirmationState({
              assistantPrompt: winOfferLine,
              offeredAtTurn: chatTurnRef.current,
              kind: "general",
            }),
          );
          finishEarlyChatTurn();
          finishLatencyTurn({ localReply: true });
          return;
        }
        const pending = createCollectionPendingOffer({
          roomId: collectionOffer.roomId,
          sourceUserText: trimmed,
          offerLine: collectionOffer.offerLine,
          prefill: collectionOffer.prefill,
          offeredAtTurn: chatTurnRef.current,
          alternateRoomIds: collectionOffer.alternateRoomIds,
        });
        saveCollectionPendingOffer(pending);
        markCollectionOfferCooldown(chatTurnRef.current);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: collectionOffer.offerLine },
        ]);
        recordPrimaryTurnResponse(collectionOffer.offerLine);
        setAwaitingUserConfirmation(
          createAwaitingConfirmationState({
            assistantPrompt: collectionOffer.offerLine,
            offeredAtTurn: chatTurnRef.current,
            kind: "general",
          }),
        );
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    const frictionlessAction = runReliableSyncLayer(
      "frictionless",
      () =>
        resolveFrictionlessAction({
          userText: trimmed,
          currentTurn: chatTurnRef.current,
          lastAssistantText,
          workspace: workspacePanel,
          emotionalState: detected,
          overwhelmed: detected === "overwhelmed",
          primaryTurn: primaryTurnDecision,
          pendingConciergeChoices: hasActivePendingChoice(),
        }),
      {
        category: "none",
        suppressRelationship: false,
        suppressRecap: false,
        suppressReflectionFirst: false,
        responseHint: null,
        localReply: null,
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: null,
      } satisfies FrictionlessActionDecision,
      {
        turn: chatTurnRef.current,
        userText: trimmed,
        intent: primaryTurnDecision.type,
        currentRoom: currentEstateRoomId ?? null,
        turnOwner: primaryTurnDecision.owner,
      },
    );
    latencyProfiler.measure("frictionlessAction");

    const frictionlessBlockedByTaskLock =
      taskLockBlocksEstateRouting &&
      frictionlessOffersEstateRoom(frictionlessAction.localReply);

    if (
      !frictionlessBlockedByTaskLock &&
      presentFrictionlessLocalReply(frictionlessAction, finishLatencyTurn)
    ) {
      return;
    }

    if (
      turnIntentRouting.surfaceClarificationUi &&
      turnIntentRouting.routeMode === "clarify" &&
      turnIntentRouting.clarifyPrompt &&
      !workspacePanel
    ) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: turnIntentRouting.clarifyPrompt! },
      ]);
      setInput("");
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: turnIntentRouting.clarifyPrompt!,
          offeredAtTurn: chatTurnRef.current,
          kind: "general",
        }),
      );
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
      return;
    }

    const knowledgeTiming = measureKnowledgeDetection(trimmed);
    latencyProfiler.recordTiming("knowledgeDetection", knowledgeTiming.ms);
    const speedProfile: CompanionSpeedProfile = resolveCompanionResponseRoute({
      userText: trimmed,
      routing: turnIntentRouting,
      frictionless: frictionlessAction,
      isYesContinuation:
        Boolean(loadFrictionlessPending()) && isFrictionlessAffirmation(trimmed),
      hasPendingFrictionless: Boolean(loadFrictionlessPending()),
      isMenuContinuation: menuContinuation.active,
    });
    latencyProfiler.applySpeedProfile(speedProfile);

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
    let phase8PreparationOffer: string | null = null;
    let phase9WisdomReflection: string | null = null;
    let phase10TransformationReflection: string | null = null;
    let phase11EcosystemInsight: string | null = null;
    if (isPhase1OnboardingComplete() && !speedProfile.skipLayers.phaseObservers && !menuContinuation.active) {
      latencyProfiler.mark("observationEngine");
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
      observeAutonomousPreparationTurn({ userText: trimmed });
      observeWisdomIntelligenceTurn({ userText: trimmed });
      observeTransformationIntelligenceTurn({ userText: trimmed });
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
      phase8PreparationOffer = maybeAutonomousPreparationOffer({ userText: trimmed });
      if (phase8PreparationOffer) recordPreparationOfferShown();
      phase9WisdomReflection = maybeWisdomReflection({ userText: trimmed });
      if (phase9WisdomReflection) recordWisdomReflectionShown();
      phase10TransformationReflection = maybeTransformationReflection({ userText: trimmed });
      if (phase10TransformationReflection) recordTransformationReflectionShown();
      phase11EcosystemInsight = maybeEcosystemInsight({ userText: trimmed });
      if (phase11EcosystemInsight) recordEcosystemInsightShown();
      latencyProfiler.measure("observationEngine");
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
      openDecisionCompass(snap.prefill);
      finishLocalChatTurn(decisionCompassOpenAck());
      finishLatencyTurn({ localReply: true });
      return;
    }

    if (isExplicitSurveyCreateRequest(trimmed)) {
      const survey = evaluateSurveyIntelligence({
        userText: trimmed,
        messages: nextMessages,
      });
      if (survey.template) {
        const template = survey.template;
        recordSurveyCreated(template.id, { influencedDecision: true });
        openCreateWithShari(
          buildSurveyCreationInput(template, survey.recommendedLength),
        );
        finishLocalChatTurn(
          `I've opened **${template.name}** with proven questions already loaded — ` +
            "not a blank page. Edit anything to match your voice.",
        );
        finishLatencyTurn({ localReply: true });
        return;
      }
    }

    if (tryContinueConversationWorkflow(trimmed, lastAssistantText, fresh)) {
      return;
    }

    if (isExplicitBreatheRequest(trimmed)) {
      setStressReliefOffer(null);
      clearAllPendingOffers();
      handleToolSelectCore("breathe");
      finishLocalChatTurn(standaloneToolAck("breathe"));
      finishLatencyTurn({ localReply: true });
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
        finishEarlyChatTurn();
        return;
      }
    }

    const artifactForMemory =
      createBuilderSession?.workflow
        ? syncArtifactFromWorkflow(
            createBuilderSession.workflow,
            getFacilitatedCreationSession(),
          )
        : getActiveArtifact();

    if (isShowProgressRequest(trimmed) && artifactForMemory) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: buildWhatWeHaveSoFarSummary(artifactForMemory),
        },
      ]);
      finishEarlyChatTurn();
      return;
    }

    const revisionCmd = parseArtifactRevisionCommand(trimmed, artifactForMemory);
    if (revisionCmd.kind !== "none" && artifactForMemory) {
      const revisionResult = applyArtifactRevisionCommand(
        artifactForMemory,
        revisionCmd,
      );
      if (revisionResult) {
        setActiveArtifact(revisionResult.artifact);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: revisionResult.reply },
        ]);
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
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
      finishEarlyChatTurn();
      return;
    }

    if (
      !shouldDeferWorkspaceRoutingForPhase1() &&
      turnSurface.outcome === "workspace_open" &&
      turnSurface.targetSection &&
      !directEstateVisitRef.current
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
      finishEarlyChatTurn();
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
      finishEarlyChatTurn();
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
    if (
      exportOffer &&
      (!isBareGenericAcceptance(trimmed) ||
        commitmentAllowsArtifactExport(pendingCommitment))
    ) {
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
      outcomeThread: getOutcomeThread(),
    });

    if (
      acceptanceResolution.outcome === "conversation" ||
      acceptanceResolution.outcome === "expired"
    ) {
      if (isAcceptanceAttempt(trimmed)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: acceptanceResolution.message,
          },
        ]);
        finishEarlyChatTurn();
        return;
      }
    }

    if (dispatchResolvedAcceptance(acceptanceResolution, pendingNow)) {
      finishEarlyChatTurn();
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
      finishEarlyChatTurn();
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
        finishEarlyChatTurn();
        return;
      }
      acceptStressReliefOption(stressToolChoice);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: stressToolOpenAck(stressToolChoice) },
      ]);
      finishEarlyChatTurn();
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
      finishEarlyChatTurn();
      return;
    }

    const standaloneTool = detectStandaloneToolRequest(trimmed);
    if (standaloneTool) {
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
      finishEarlyChatTurn();
      return;
    }

    if (workspacePanel === "google-workspace" && googleWorkspaceRef.current) {
      const gw = googleWorkspaceRef.current;
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
        const data = await readJsonResponse<Record<string, unknown>>(res, {
          url: "/api/google/apply-edit",
        });
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
      } catch (err) {
        const message = resolveChatFailureReply({
          err,
          userText: trimmed,
          messages,
          surface: "workspace-action",
        });
        if (message) {
          markAssistantReplied(chatTurnState);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: message },
          ]);
        }
        setError(null);
      } finally {
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
        return;
      }
      if (/\bnew\b/i.test(trimmed) && workspaceOffer) {
        setPendingDuplicateProject(null);
        acceptWorkspaceOffer(workspaceOffer);
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
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
      finishEarlyChatTurn();
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
        finishEarlyChatTurn();
        return;
      }
      if (
        tryOpenCreateForCurrentArtifact(trimmed, {
          chatMessages: nextMessages,
          ackMessage: buildGoogleDocRecoveryMessage(savedRecord),
        })
      ) {
        finishEarlyChatTurn();
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: buildGoogleDocRecoveryMessage(null) },
      ]);
      finishEarlyChatTurn();
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
        finishEarlyChatTurn();
        return;
      }
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "google-doc",
        ackMessage:
          "Opening your draft in **Create** — creating the Google Doc now.",
      });
      finishEarlyChatTurn();
      return;
    }

    if (artifactCmd === "print") {
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "print",
        ackMessage: "Opening print…",
      });
      finishEarlyChatTurn();
      return;
    }

    if (artifactCmd === "save-again") {
      tryOpenCreateForCurrentArtifact(trimmed, {
        chatMessages: nextMessages,
        exportTrigger: "save",
        ackMessage: "Saving your updated copy…",
      });
      finishEarlyChatTurn();
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
      finishEarlyChatTurn();
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
                "Reply with the number, or say 'open saved work' and I'll help you find it.",
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
        (workspacePanel === "time-block" || !governorChatOnly)
      ) {
        openCalendarItemCore(timeBlockFocusId, "recovery");
        return;
      }
      if (
        (recovery === "brain-dump" || recovery === "any") &&
        workspacePanel === "brain-dump"
      ) {
        openClearMyMindCore({ silent: true });
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
          finishEarlyChatTurn();
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
        if (explicitWorkspaceCommand) {
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
    const ecosystemProblemMatch = speedProfile.skipLayers.adhdOS
      ? null
      : detectEcosystemProblemIntent(trimmed);
    const adhdNative = speedProfile.skipLayers.adhdOS
      ? analyzeAdhdNativeTurn({
          text: trimmed,
          messages: nextMessages,
          emotionalState: detected,
          obstacle: obstacle ?? null,
          discoveryPhase: "none",
          shouldDeferTools: true,
          hasEcosystemFeatureMatch: false,
        })
      : analyzeAdhdNativeTurn({
          text: trimmed,
          messages: nextMessages,
          emotionalState: detected,
          obstacle: obstacle ?? null,
          discoveryPhase: intelligence.discoveryPhase,
          shouldDeferTools: intelligence.shouldDeferTools,
          hasEcosystemFeatureMatch: Boolean(ecosystemProblemMatch),
        });
    const adhdEntrepreneur = speedProfile.skipLayers.adhdOS
      ? null
      : analyzeAdhdEntrepreneurTurn({
          userText: trimmed,
          adhdNative,
          multiTurn: adhdNative.multiTurn,
          boardDomain: resolveWorkspaceAdvisorRole(trimmed, workspacePanel),
        });
    const sprint5 = speedProfile.skipLayers.adhdOS
      ? { trustHint: null, confidenceHint: null, adaptiveHint: null }
      : buildSprint5Intelligence({
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
    const intuitiveAwareness = speedProfile.skipLayers.adhdOS
      ? null
      : analyzeIntuitiveAwareness({
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
    const workspaceRoutingBlocked =
      willBridge ||
      skipToolOffer ||
      intelligence.shouldDeferTools ||
      decisionIntelligence.shouldDeferSolutions ||
      suppressCreatePending ||
      turnSurface.suppressCards ||
      taskLockBlocksEstateRouting;
    const rawWorkspaceOffer = resolveEstateAwareWorkspaceOffer({
      routingBlocked: workspaceRoutingBlocked,
      estateTurn: taskLockBlocksEstateRouting ? null : estateConversationTurn,
      turnIntentRouting,
      doingIntentOffer:
        turnIntentRouting.surfaceOfferUi && !estateRoutingActive
          ? detectDoingIntent(trimmed)
          : null,
      stayInConversation:
        stayInConversation && !estateRoutingActive && !estateWorkspaceOffer,
    });
    const resolvedWorkspaceOffer = rawWorkspaceOffer
      ? mergeWorkspaceOfferSecondary(rawWorkspaceOffer, turnIntentRouting)
      : null;
    const stressCause = detectStressCauseChoice(trimmed);
    const pendingDecisionCompassOffer: DecisionCompassOffer | null =
      shouldDeferWorkspaceRoutingForPhase1() || estateRoutingActive
        ? null
        : shouldOfferDecisionCompassForTurn({
            text: trimmed,
            decisionIntelligence,
          })
          ? buildDecisionCompassOffer(trimmed)
          : null;
    const pendingStressOffer: StressReliefOffer | null =
      shouldDeferWorkspaceRoutingForPhase1() ||
      pendingDecisionCompassOffer ||
      estateRoutingActive
        ? null
        : stressCause && !isExplicitStressToolRequest(trimmed)
          ? buildStressCauseRecommendation(stressCause)
          : shouldOfferStressRelief(trimmed, nextMessages)
            ? buildStressReliefOffer()
            : null;
    const pendingWorkspaceOfferRaw =
      shouldDeferWorkspaceRoutingForPhase1() ||
      !resolvedWorkspaceOffer ||
      shouldSuppressWorkspaceOffer(workspaceContext, resolvedWorkspaceOffer) ||
      pendingStressOffer ||
      pendingDecisionCompassOffer
        ? null
        : resolvedWorkspaceOffer;
    let pendingWorkspaceOffer = pendingWorkspaceOfferRaw;
    if (
      pendingWorkspaceOffer &&
      !isExplicitFocusAudioRequest(trimmed) &&
      isConversationOfferDeclined(
        declinedConversationOffersRef.current,
        workspaceOfferDeclineKey(pendingWorkspaceOffer),
      )
    ) {
      pendingWorkspaceOffer = null;
    }
    const deferToolCards = shouldDeferToolCardOnFirstDistress(
      nextMessages,
      trimmed,
    );
    const pendingToolOfferRaw =
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
    let pendingToolOffer = pendingToolOfferRaw;
    if (
      pendingToolOffer &&
      !isExplicitFocusAudioRequest(trimmed) &&
      isConversationOfferDeclined(
        declinedConversationOffersRef.current,
        toolSuggestionDeclineKey(pendingToolOffer),
      )
    ) {
      pendingToolOffer = null;
    }

    if (
      !shouldDeferWorkspaceRoutingForPhase1() &&
      pendingWorkspaceOffer &&
      !workspacePanel &&
      !blockAutoWorkspace
    ) {
      const lookupQuery = extractProjectQuery(trimmed);
      if (lookupQuery && pendingWorkspaceOffer.section === "projects") {
        const existing = searchProjects(lookupQuery);
        if (existing.length === 1 && explicitWorkspaceCommand) {
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
        setAwaitingUserConfirmation(
          createAwaitingConfirmationState({
            assistantPrompt: buildDuplicateProjectMessage(similar[0]!),
            offeredAtTurn: chatTurnRef.current,
            kind: "workspace",
            workspaceOffer: pendingWorkspaceOffer,
          }),
        );
        finishEarlyChatTurn();
        finishLatencyTurn({ localReply: true });
        return;
      }

      const offerReply = workspaceOfferReplyLine(
        pendingWorkspaceOffer,
        estateConversationTurn,
        turnIntentRouting.navigationLine ??
          buildWorkspaceOfferChatReply(pendingWorkspaceOffer, trimmed),
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
      saveFrictionlessPending(
        frictionlessPendingFromWorkspaceOffer(
          pendingWorkspaceOffer,
          chatTurnRef.current,
          {
            userText: trimmed,
            artifactKind: turnIntentRouting.artifactKind,
          },
        ),
      );
      registerPendingAcceptance("workspace", pendingWorkspaceOffer.buttonLabel);
      setToolSuggestion(null);
      setActionBridge(null);
      setBridge(null);
      setAwaitingUserConfirmation(
        createAwaitingConfirmationState({
          assistantPrompt: offerReply,
          offeredAtTurn: chatTurnRef.current,
          kind: "estate",
          workspaceOffer: pendingWorkspaceOffer,
        }),
      );
      finishEarlyChatTurn();
      finishLatencyTurn({ localReply: true });
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
          finishEarlyChatTurn();
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
            finishEarlyChatTurn();
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
        const wsOffer = ecosystemIntentToWorkspaceOffer(ecosystemMatch);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: wsOffer.line },
        ]);
        setWorkspaceOffer(wsOffer);
        publishConversationOffer(wsOffer.line, wsOffer);
        registerPendingAcceptance("workspace", ecosystemMatch.featureLabel);
        finishEarlyChatTurn();
        return;
      }
    }

    if (
      !workspacePanel &&
      !pendingWorkspaceOffer &&
      !workspaceOffer &&
      !turnArbitration?.blockAutoRouteAsset &&
      isAdaptMyDayIntent(trimmed) &&
      !isExplicitBreatheRequest(trimmed) &&
      !turnIntentRouting.overwhelmTodayRoute
    ) {
      const offerLine = adaptMyDayOfferLine();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: offerLine },
      ]);
      const energyOffer: WorkspaceOffer = {
        section: "energy",
        buttonLabel: "Open Today's Reality",
        line: offerLine,
      };
      setWorkspaceOffer(energyOffer);
      publishConversationOffer(offerLine, energyOffer);
      finishEarlyChatTurn();
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
        finishEarlyChatTurn();
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
        finishEarlyChatTurn();
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
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: offer.message },
        ]);
        setBusinessConfidenceOffer(offer);
        finishEarlyChatTurn();
        return;
      }
    }

    try {
      latencyProfiler.mark("promptConstruction");
      await companionPresenceDelay(speedProfile.skipLayers.presenceDelay);

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
      const businessOSSnapshot = speedProfile.skipLayers.ecosystemSnapshots
        ? null
        : evaluateAndRecordBusinessOS({
            text: trimmed,
          });
      const chiefSnapshot = speedProfile.skipLayers.ecosystemSnapshots
        ? null
        : evaluateAndRecordChiefOfStaff({
            text: trimmed,
          });
      const ecosystemSnapshot = speedProfile.skipLayers.ecosystemSnapshots
        ? null
        : evaluateAndRecordEcosystem({
            text: trimmed,
            recognitionActive: Boolean(recognitionMoment),
            activationOfferActive: Boolean(activationOffer),
            loopOfferActive: Boolean(loopOffer),
            dayDesignerActive: Boolean(dayDesignerSession),
            dayPlanActive: Boolean(dayPlanView),
          });
      if (!speedProfile.skipLayers.ecosystemSnapshots) {
        latencyProfiler.mark("ecosystemIntelligence");
        evaluateAndRecordPredictiveSupport({ text: trimmed });
        latencyProfiler.measure("ecosystemIntelligence");
      }
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
      const suppressRelationshipIntelligence =
        menuContinuation.active ||
        speedProfile.skipHeavyLayers ||
        shouldSuppressRelationshipIntelligenceForUserText(trimmed) ||
        shouldSuppressRelationshipIntelligenceForRouting(turnIntentRouting) ||
        shouldSuppressRelationshipForFrictionless(frictionlessAction);
      const businessContextForApi = (() => {
        const suppressSummary =
          turnIntentRouting.suppressConversationSummary ||
          suppressRelationshipIntelligence ||
          frictionlessAction.suppressRecap;
        const parts = [
          businessContextSummary(),
          activeCompanionsContextForAI(),
          estateIntelligenceEval?.route
            ? `Estate context: member need aligns with ${estateIntelligenceEval.route.primaryEntry.name}.`
            : null,
          suppressSummary ? null : discoveryContextForChat(),
          suppressSummary ? null : phase1RelationshipProfileForChat(),
          suppressSummary ? null : relationshipMemoryContextForChat(),
          suppressSummary || !isPhase1OnboardingComplete()
            ? null
            : relationshipPhaseSummaryForChat(),
        ].filter(Boolean);
        return parts.length ? parts.join(" ") : undefined;
      })();
      const relationshipIntelligencePriority = suppressRelationshipIntelligence
        ? null
        : buildRelationshipIntelligencePriorityBlock(trimmed, new Date(), {
            suppressContractForRouting:
              turnIntentRouting.suppressRelationshipLead ||
              turnIntentRouting.suppressConversationSummary,
            workspace: workspacePanel,
          });
      const establishedRelationshipHint = suppressRelationshipIntelligence
        ? null
        : establishedRelationshipCoachHintForChat();
      const phase9HintPreview = suppressRelationshipIntelligence
        ? null
        : phase9WisdomIntelligenceHintForChat({
            reflection: phase9WisdomReflection,
            userText: trimmed,
          });
      const phase10HintPreview = suppressRelationshipIntelligence
        ? null
        : phase10TransformationIntelligenceHintForChat({
            reflection: phase10TransformationReflection,
            userText: trimmed,
          });
      const phase11HintPreview = suppressRelationshipIntelligence
        ? null
        : phase11EcosystemIntelligenceHintForChat({
            insight: phase11EcosystemInsight,
            userText: trimmed,
          });
      const relationshipGuardrailsHint = relationshipIntelligencePriority
        ? relationshipResponseQualityGuardrails()
        : null;
      const relationshipLeadParagraph = suppressRelationshipIntelligence
        ? null
        : buildRelationshipLeadParagraph(trimmed, new Date(), {
            workspace: workspacePanel,
            suppressForRouting:
              turnIntentRouting.suppressRelationshipLead ||
              turnIntentRouting.suppressConversationSummary,
          });
      const activeHintNames: string[] = [];
      if (relationshipIntelligencePriority) {
        activeHintNames.push("relationshipIntelligencePriority");
        activeHintNames.push("relationshipResponseQualityGuardrails");
      }
      if (relationshipLeadParagraph) {
        activeHintNames.push("relationshipResponseContract");
      }
      if (establishedRelationshipHint) activeHintNames.push("establishedRelationshipCoach");
      if (phase9HintPreview) activeHintNames.push("phase9WisdomIntelligence");
      if (phase10HintPreview) activeHintNames.push("phase10Transformation");
      if (phase11HintPreview) activeHintNames.push("phase11Ecosystem");
      if (phase7BusinessInsight) activeHintNames.push("phase7BusinessInsight");
      if (phase9WisdomReflection) activeHintNames.push("phase9WisdomReflection");
      if (intelligence.discoveryPhase !== "none") {
        activeHintNames.push(`companionDiscovery:${intelligence.discoveryPhase}`);
      }
      activeHintNames.push(`companionProblemType:${intelligence.problemType}`);
      if (adhdEntrepreneur) activeHintNames.push("adhdEntrepreneurPrimary");
      if (adhdNative) activeHintNames.push("adhdNative");
      activeHintNames.push(`actionBias:${actionBias.investigationPhase}`);
      const relationshipTurnClientMeta = buildRelationshipTurnDebugClientMeta({
        userText: trimmed,
        relationshipPriorityBlock: relationshipIntelligencePriority,
        activeHintNames,
        relationshipLeadParagraph,
      });
      logRelationshipIntelligenceTurnDebug({
        userText: trimmed,
        ...relationshipTurnClientMeta,
        phase: "pre-api",
      });
      latencyProfiler.setPromptAudit(
        auditPromptBlocks({
          blocks: [
            {
              name: "relationshipIntelligencePriority",
              text: relationshipIntelligencePriority,
            },
            {
              name: "relationshipLeadParagraph",
              text: relationshipLeadParagraph,
            },
            {
              name: "relationshipGuardrails",
              text: relationshipGuardrailsHint,
            },
          ],
          skippedBlockNames: speedProfile.skipHeavyLayers
            ? [
                "relationshipObservation",
                "adhdOS",
                "wisdom",
                "transformation",
                "ecosystem",
                "responseContract",
                "heavyPhaseHints",
              ]
            : [],
        }),
      );
      latencyProfiler.measure("promptConstruction");
      latencyProfiler.mark("apiModel");
      latencyProfiler.calledApi = true;
      const instituteLearningHint = instituteLearningHintRef.current;
      instituteLearningHintRef.current = null;
      const stablesLearningHint = stablesLearningHintRef.current;
      stablesLearningHintRef.current = null;
      const chamberConversationActive = isChamberMemberConversationActive({
        activeSection: activeSectionRef.current,
        activeMemberId: activeChamberMemberIdRef.current,
      });
      const activeChamberMember =
        chamberConversationActive && activeChamberMemberIdRef.current
          ? getChamberMemberById(activeChamberMemberIdRef.current)
          : undefined;
      // Never inject Chamber persona outside an active Chamber member session.
      const chamberMemberChatHint = activeChamberMember
        ? chamberMemberHintForChat(activeChamberMember)
        : null;
      const useChatStream = speedProfile.routeClass !== "instant";
      const res = await fetchCompanionChatWithTimeout(
        {
          stream: useChatStream,
          messages: messagesForApi(
            nextMessages,
            workspaceChatScopeRef.current,
          ),
          inputType,
          coachingMode,
          relationshipIntelligencePriority: relationshipIntelligencePriority ?? undefined,
          relationshipLeadParagraph: relationshipLeadParagraph ?? undefined,
          memoryConfidence: relationshipTurnClientMeta.memoryConfidence,
          emotionalState: EMOTION_LABELS[detected],
          dayState: dayStateSummary(getDayState()),
          dailyContextHint: formatDailyContextCompanionBlock(
            getDailyContext({
              activeFocusSession: activeSectionRef.current === "focus-timer",
            }),
          ),
          guidedFieldHelpHint: (() => {
            const parts: string[] = [];
            const pending = readPendingGuidedFieldHelp();
            if (pending) parts.push(formatGuidedFieldHelpPrompt(pending));
            const expertPrompt = readExpertSessionPrompt();
            if (expertPrompt) parts.push(expertPrompt);
            const stageTalk = readStageTalkThroughPrompt();
            if (stageTalk) parts.push(stageTalk);
            const estateResearch = readResearchSessionPrompt();
            if (estateResearch) parts.push(estateResearch);
            const advisory = readAdvisoryPrompt();
            if (advisory) parts.push(advisory);
            return parts.length ? parts.join("\n\n") : undefined;
          })(),
          aiTone: prefs.aiTone,
          helpMode: prefs.helpMode,
          supportStyle: getActiveSupportStyleId(),
          userName: prefs.name || undefined,
          businessContext: businessContextForApi,
          intentHint:
            mergeGovernorHints(
              [
                tonePreferenceOverridesRoutingGuidance(prefs)
                  ? "Member tone preference in Settings overrides conflicting action-first routing hints this turn."
                  : null,
                continuityOwnerHintForChat({
                  activeSection: activeSectionRef.current,
                }),
                estateMemoryHintForChat(),
                buildSavedPatternsPromptHint(),
                supportStyleHintForChat(trimmed),
                buildCuriosityBeforeCommandsPromptHint(),
                adhdStrategyHintForChat(trimmed),
                techFutureHintForChat(trimmed),
                chamberMemberChatHint,
                activeTaskLockHintForChat(estateTaskLockTurn.state),
                estateConversationTurn && !taskLockBlocksEstateRouting
                  ? estateConversationHintForChat(estateConversationTurn, {
                      hasConversationHistory: messages.some(
                        (m) => m.role === "user",
                      ),
                      overwhelmed: detected === "overwhelmed",
                      emotionalState: EMOTION_LABELS[detected],
                      userText: trimmed,
                      inRoomHint: isMomentumBuilderRoomSection(activeSection)
                        ? momentumBuilderRoomHintForChat({
                            userText: trimmed,
                            hasConversationStarted: messages.some(
                              (m) => m.role === "user",
                            ),
                          })
                        : isStablesSection(activeSection)
                          ? stablesRoomHintForChat()
                          : null,
                    })
                  : null,
                intentRoutingHintForChat(turnIntentRouting),
                menuContinuation.active
                  ? menuContinuationHintForChat(
                      menuContinuation,
                      trimmed,
                      lastAssistantText,
                    )
                  : null,
                learnFastPath ? knowledgeIntelligenceHintForChat(trimmed) : null,
                isResearchIntelligenceRequest(trimmed)
                  ? researchIntelligenceHintForChat(trimmed)
                  : null,
                googleSheetsHintForChat(loadGoogleSheetIntakeSession()),
                frictionlessHintForChat(frictionlessAction),
                relationshipGuardrailsHint,
                suppressGenericFeatureHintsForEstate
                  ? null
                  : appFeatureKnowledgeHintForChat(trimmed),
                suppressGenericFeatureHintsForEstate
                  ? null
                  : appFeatureNavigationHintForChat(trimmed),
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
                  if (
                    !audio.isAudio ||
                    shouldBlockStressAutoToolRouting(trimmed) ||
                    suppressGenericFeatureHintsForEstate
                  ) {
                    return null;
                  }
                  return (
                    `AUDIO / ENERGIZE REQUEST: User wants listening support — lead with Peaceful Places ` +
                    `(category: ${audio.categoryId}). Offer invitation; Estate Registry is source of truth. ` +
                    `Do NOT define soundscapes or give a generic lecture.`
                  );
                })(),
                shouldOfferStressRelief(trimmed, nextMessages) &&
                !suppressGenericFeatureHintsForEstate
                  ? stressReliefHintForChat(trimmed)
                  : null,
                stayInConversation && !suppressGenericFeatureHintsForEstate
                  ? conversationGatingHint(trimmed)
                  : null,
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
                elevateLifeExperienceHintForChat({
                  emotionalState: EMOTION_LABELS[detected],
                  overwhelmed: detected === "overwhelmed",
                }),
                humanConversationHintForChat({
                  userText: trimmed,
                  emotionalState: detected,
                  activeSection: activeSectionRef.current,
                  workspaceBeside:
                    chatLayoutMode === "split" ||
                    Boolean(workspacePanelRef.current),
                }),
                workspaceOpeningHintForChat(getWorkspaceSnapshot()),
                outcomeThreadHintForChat(getOutcomeThread()),
                instituteLearningHint,
                stablesLearningHint,
                entrepreneurialPatternHintForChat(trimmed),
                companionDecisionIntelligenceHintForChat(decisionIntelligence, {
                  userText: trimmed,
                  messages: toChatTurns(nextMessages),
                }),
                surveyIntelligenceHintForChat(surveyIntelligence),
                phase1OnboardingEval && !turnIntentRouting.suppressConversationSummary
                  ? phase1OnboardingHintForChat(phase1OnboardingEval)
                  : null,
                isEstablishedRelationshipForChat() &&
                !speedProfile.skipLayers.heavyPhaseHints &&
                !turnIntentRouting.suppressConversationSummary
                  ? establishedRelationshipCoachHintForChat()
                  : isPhase1OnboardingComplete() &&
                      !speedProfile.skipLayers.heavyPhaseHints &&
                      !turnIntentRouting.suppressConversationSummary
                    ? phase2ProgressiveDiscoveryHintForChat({
                        trustMoment: phase2TrustMoment,
                      })
                    : null,
                turnIntentRouting.suppressConversationSummary ||
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase3AdaptiveRelationshipHintForChat({
                      awarenessMoment: phase3AwarenessMoment,
                      anticipatorySupport: phase3AnticipatorySupport,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase4BusinessOperatingPartnerHintForChat({
                      proactiveSupport: phase4ProactiveSupport,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase5CompanionIntelligenceEcosystemHintForChat({
                      opportunityOffer: phase5OpportunityOffer,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase6CompanionIntelligenceNetworkHintForChat({
                      reuseOffer: phase6ReuseOffer,
                      discoveryOffer: phase6DiscoveryOffer,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase7BusinessIntelligenceHintForChat({
                      insight: phase7BusinessInsight,
                      userText: trimmed,
                      messages: toChatTurns(nextMessages),
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase8AutonomousPreparationHintForChat({
                      preparationOffer: phase8PreparationOffer,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase9WisdomIntelligenceHintForChat({
                      reflection: phase9WisdomReflection,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase10TransformationIntelligenceHintForChat({
                      reflection: phase10TransformationReflection,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : phase11EcosystemIntelligenceHintForChat({
                      insight: phase11EcosystemInsight,
                      userText: trimmed,
                    }),
                speedProfile.skipLayers.heavyPhaseHints ? null : sprint5.trustHint,
                speedProfile.skipLayers.heavyPhaseHints ? null : sprint5.confidenceHint,
                speedProfile.skipLayers.heavyPhaseHints ? null : sprint5.adaptiveHint,
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : mistakeRecoveryHintForChat(),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : actionBiasHintForChat(actionBias),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : discoveryOverrideForActionBias(actionBias),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : intuitiveAwareness
                    ? intuitiveAwarenessHintForChat(intuitiveAwareness)
                    : null,
                speedProfile.skipLayers.heavyPhaseHints || !adhdEntrepreneur
                  ? null
                  : adhdEntrepreneurPrimaryHintForChat({
                      analysis: adhdEntrepreneur,
                      adhdNative,
                    }),
                speedProfile.skipLayers.heavyPhaseHints || !adhdNative
                  ? null
                  : adhdNativeHintForChat(adhdNative),
                companionEntryLayerHintForChat(trimmed),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : companionEcosystemRoutingHintForChat(trimmed),
                speedProfile.skipLayers.heavyPhaseHints
                  ? null
                  : intelligenceHintForChat(intelligence, trimmed),
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
                ? [
                    formatCreateWorkspaceV2ChatHint(createBuilderSession),
                    formatFacilitatedCreationChatHint(
                      getFacilitatedCreationSession(),
                      createBuilderSession?.workflow,
                    ),
                  ]
                    .filter(Boolean)
                    .join("\n\n")
                : formatCreateBuilderChatHint(createBuilderSession)
              : formatFacilitatedCreationChatHint(
                  getFacilitatedCreationSession(),
                  null,
                ),
            formatArtifactStateChatHint(
              createBuilderSession?.workflow
                ? syncArtifactFromWorkflow(
                    createBuilderSession.workflow,
                    getFacilitatedCreationSession(),
                  )
                : getActiveArtifact(),
            ),
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
              teachingActive:
                menuContinuation.active ||
                (learnFastPath
                  ? false
                  : teachingModeActive(trimmed, lastAssistantText, {
                      activeWorkflowLocked:
                        shouldSuppressTeachingMode(workflowLockInput) ||
                        isMomentumBuilderRoomSection(activeSection),
                    })),
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
            googleSheetsCreateHintForArtifact(
              createBuilderSession?.typeLabel ?? creationContext?.itemType,
            ),
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
          ecosystemGuidance: ecosystemSnapshot
            ? ecosystemGuidanceForChat(ecosystemSnapshot)
            : undefined,
        },
        { signal: requestAbort.signal },
      );

      if (isStaleSend()) {
        return;
      }

      let rawAssistantMsg = "";
      let relationshipResponseId = "unknown";
      let apiTurnDebug: Record<string, unknown> | undefined;
      let streamedChatResponse = false;

      if (!res.ok) {
        const errorData = await readJsonResponse<Record<string, unknown>>(res, {
          url: "/api/companion-chat",
        });
        const apiError =
          typeof errorData.error === "string" ? errorData.error : undefined;
        throw new Error(apiError ?? "companion-chat-unavailable");
      }

      if (useChatStream && isCompanionChatStreamResponse(res)) {
        streamedChatResponse = true;
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        let firstChunk = false;
        const streamResult = await consumeCompanionChatStream(res, (text) => {
          if (isStaleSend()) return;
          if (!firstChunk && text) {
            firstChunk = true;
            endVisibleThinking();
          }
          setMessages((prev) => {
            if (isStaleSend()) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: text };
            }
            return copy;
          });
        });
        rawAssistantMsg = streamResult.fullText;
        relationshipResponseId = streamResult.relationshipResponseId ?? "unknown";
      } else {
        const data = await readJsonResponse<Record<string, unknown>>(res, {
          url: "/api/companion-chat",
        });
        rawAssistantMsg =
          typeof data.message === "string" ? data.message : "";
        apiTurnDebug = data._relationshipTurnDebug as
          | Record<string, unknown>
          | undefined;
        relationshipResponseId =
          (typeof data.relationshipResponseId === "string"
            ? data.relationshipResponseId
            : undefined) ??
          (typeof apiTurnDebug?.relationshipResponseId === "string"
            ? apiTurnDebug.relationshipResponseId
            : undefined) ??
          "unknown";
      }

      latencyProfiler.measure("apiModel");
      latencyProfiler.mark("responseEnforcement");

      // Shari Voice Layer — final expression using live Conversation Style / Help Mode prefs.
      rawAssistantMsg = finalizeMemberFacingAssistantText(
        rawAssistantMsg,
        "chat_api",
      );
      applyAssistantTaskLockTurn({
        assistantText: rawAssistantMsg,
        priorUserText: trimmed,
        conversationTurn: chatTurnRef.current,
      });
      if (!taskLockBlocksEstateRouting) {
        rawAssistantMsg = repairNumberedEstateRoomMenu(rawAssistantMsg, trimmed);
        rawAssistantMsg = repairInventedEstatePlaceList(rawAssistantMsg, trimmed);
        registerPendingEstatePlaceMenuFromAssistant(
          rawAssistantMsg,
          chatTurnRef.current,
        );
        rawAssistantMsg = enforceCanonicalPlaceIdentityInCopy(rawAssistantMsg, {
          userText: trimmed,
        });
      } else {
        rawAssistantMsg = sanitizeAssistantCopyDuringActiveTask(rawAssistantMsg);
      }

      const {
        field: focusField,
        fill: assistantFill,
        content: assistantMsgRaw,
      } = extractWorkspaceDirectives(rawAssistantMsg);
      const assistantMsg = toPlainLanguageDisplay(
        scrubFalseWorkspaceClaims(assistantMsgRaw, getWorkspaceSnapshot()),
      );

      const uiTrace: RelationshipResponseUiTrace = {
        responseId: relationshipResponseId,
        rewritten: Boolean(apiTurnDebug?.relationshipResponseRewritten),
        memoryConfidence: relationshipTurnClientMeta.memoryConfidence,
        relationshipLeadParagraphLength:
          relationshipLeadParagraph?.length ??
          relationshipTurnClientMeta.relationshipLeadParagraph?.length ??
          0,
        enforcementRan: Boolean(apiTurnDebug?.relationshipEnforcementRan),
        enforcementSkipReason:
          (apiTurnDebug?.relationshipEnforcementSkipReason as string | null) ??
          null,
        violationReason:
          (apiTurnDebug?.relationshipResponseRewriteReason as string | null) ??
          null,
        firstParagraphAtApiReceive: firstParagraphForTrace(rawAssistantMsg),
        firstParagraphAfterDirectives: firstParagraphForTrace(assistantMsgRaw),
        firstParagraphAtRender: firstParagraphForTrace(assistantMsg),
        confidenceObservationsCount:
          relationshipTurnClientMeta.confidenceObservationsCount,
        confidenceSignalCount: relationshipTurnClientMeta.confidenceSignalCount,
        confidenceResultReason: relationshipTurnClientMeta.confidenceResultReason,
        confidenceFloorApplied: relationshipTurnClientMeta.confidenceFloorApplied,
      };

      logRelationshipResponseTrace({
        responseId: relationshipResponseId,
        stage: "ui-receive",
        firstParagraph: uiTrace.firstParagraphAtApiReceive,
        relationshipResponseRewritten: uiTrace.rewritten,
        memoryConfidence: uiTrace.memoryConfidence,
        relationshipLeadParagraphLength: uiTrace.relationshipLeadParagraphLength,
        enforcementRan: uiTrace.enforcementRan,
        skipReason: uiTrace.enforcementSkipReason,
        violationReason: uiTrace.violationReason,
      });

      const contractViolation = warnIfRelationshipContractViolation({
        response: rawAssistantMsg,
        relationshipPriorityBlockLength:
          relationshipTurnClientMeta.relationshipPriorityBlockLength,
        userText: trimmed,
        memoryConfidence: relationshipTurnClientMeta.memoryConfidence,
      });
      logRelationshipIntelligenceTurnDebug({
        userText: trimmed,
        ...relationshipTurnClientMeta,
        ...(apiTurnDebug ?? {}),
        assistantResponsePreview: rawAssistantMsg,
        genericOpeningViolation: detectGenericOpeningViolation(rawAssistantMsg),
        relationshipContractViolation: contractViolation?.reason ?? null,
        relationshipResponseRewritten: Boolean(
          (apiTurnDebug as { relationshipResponseRewritten?: boolean } | undefined)
            ?.relationshipResponseRewritten,
        ),
        relationshipResponseRewriteReason:
          (apiTurnDebug as { relationshipResponseRewriteReason?: string } | undefined)
            ?.relationshipResponseRewriteReason ?? null,
        relationshipEnforcementRan: Boolean(
          (apiTurnDebug as { relationshipEnforcementRan?: boolean } | undefined)
            ?.relationshipEnforcementRan,
        ),
        relationshipEnforcementSkipReason:
          (apiTurnDebug as { relationshipEnforcementSkipReason?: string } | undefined)
            ?.relationshipEnforcementSkipReason ?? null,
        relationshipResponseId,
        uiTraceFirstParagraphAtReceive: uiTrace.firstParagraphAtApiReceive,
        uiTraceFirstParagraphAtRender: uiTrace.firstParagraphAtRender,
        phase: "post-api",
      });
      warnIfGenericOpeningDespitePriority(
        relationshipTurnClientMeta.relationshipPriorityBlockLength,
        rawAssistantMsg,
        trimmed,
      );

      latencyProfiler.measure("responseEnforcement");
      latencyProfiler.mark("uiRender");

      rememberChatArtifactFromAssistant(assistantMsg, trimmed);
      const menuPending = registerPendingMenuFromAssistant(
        assistantMsg,
        menuContinuation.active ? (priorUserText ?? trimmed) : trimmed,
        chatTurnRef.current,
      );
      if (!menuPending) {
        const strategyPending = registerStrategyOfferFromAssistant({
          assistantText: assistantMsg,
          priorUserText: menuContinuation.active ? (priorUserText ?? trimmed) : trimmed,
          offeredAtTurn: chatTurnRef.current,
        });
        if (strategyPending) {
          clearAllPendingOffers();
          saveStrategyOfferPending(strategyPending);
          registerPendingAcceptance(
            "strategy_selection",
            strategyPending.offerSummary,
          );
        } else {
          const visualPending = registerVisualThinkingMenuFromAssistant({
            assistantText: assistantMsg,
            priorUserText: menuContinuation.active ? (priorUserText ?? trimmed) : trimmed,
            offeredAtTurn: chatTurnRef.current,
          });
          if (visualPending) {
            clearAllPendingOffers();
            saveVisualThinkingMenuPending(visualPending);
            registerPendingAcceptance("workspace", visualPending.offerSummary);
          } else {
            const estatePending = registerEstateWorkspaceOfferFromAssistant({
              assistantText: assistantMsg,
              priorUserText: menuContinuation.active
                ? (priorUserText ?? trimmed)
                : trimmed,
              offeredAtTurn: chatTurnRef.current,
            });
            if (estatePending) {
              saveFrictionlessPending(estatePending);
              registerPendingAcceptance(
                "workspace",
                estatePending.offerSummary ?? "Estate room",
              );
              setWorkspaceOffer({
                section: estatePending.target as AppSection,
                buttonLabel: estatePending.offerSummary ?? "Continue",
                line: assistantMsg,
              });
              setAwaitingUserConfirmation(
                createAwaitingConfirmationState({
                  assistantPrompt: assistantMsg,
                  offeredAtTurn: chatTurnRef.current,
                  kind: "estate",
                  frictionlessPending: estatePending,
                  workspaceOffer: {
                    section: estatePending.target as AppSection,
                    buttonLabel: estatePending.offerSummary ?? "Continue",
                    line: assistantMsg,
                  },
                }),
              );
            }
          }
        }
      }
      markAssistantReplied(chatTurnState);
      recordPrimaryTurnResponse(assistantMsg);
      setMessages((prev) => {
        if (streamedChatResponse) {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          const last = copy[lastIdx];
          if (last?.role === "assistant") {
            copy[lastIdx] = {
              role: "assistant",
              content: assistantMsg,
              relationshipTrace: uiTrace,
            };
            return copy;
          }
        }
        return [
          ...prev,
          { role: "assistant", content: assistantMsg, relationshipTrace: uiTrace },
        ];
      });
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
      } else if (pendingStressOffer && !estateWorkspaceOffer) {
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
        saveFrictionlessPending(
          frictionlessPendingFromToolOffer(
            pendingToolOffer,
            chatTurnRef.current,
          ),
        );
        registerPendingAcceptance("tool", pendingToolOffer.toolLabel);
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
        registerCommitmentFromAssistant(assistantMsg);
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
      } else {
        registerCommitmentFromAssistant(assistantMsg);
      }
      if (voiceOutput && rawAssistantMsg && !isWelcomeHomeIntroAudioBlocked()) {
        void playTTS(rawAssistantMsg);
      }
    } catch (err) {
      if (isStaleSend() || isChatRequestAbortError(err)) {
        // Superseded by a newer message — stay silent; newest turn owns the UI.
        return;
      }
      logPipelineTurnFailure({
        turn: chatTurnRef.current,
        userText: trimmed,
        normalizedMessage: normalizeTurnMessage(trimmed),
        intent: primaryTurnDecision?.type ?? "unknown",
        turnOwner: primaryTurnDecision?.owner ?? "unknown",
        currentRoom: currentEstateRoomId ?? null,
        failureReason:
          err instanceof Error ? err.message : "companion-chat-error",
        selectedHandler: "companion_api",
      });
      const message = resolveChatFailureReply({
        err,
        userText: trimmed,
        messages: turnMessages,
        surface: "chat",
      });
      if (message) {
        markAssistantReplied(chatTurnState);
        markActiveTopicAnswered(chatTurnRef.current);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message },
        ]);
      }
      setError(null);
    } finally {
      if (chatRequestAbortRef.current === requestAbort) {
        chatRequestAbortRef.current = null;
      }
      if (isStaleSend()) {
        return;
      }
      if (latencyProfiler.calledApi) {
        latencyProfiler.measure("uiRender");
        finishLatencyTurn({ calledApi: true });
      }
      finishEarlyChatTurn();
    }
    } catch (err) {
      if (
        isChatRequestSuperseded(sendGeneration, chatRequestGenerationRef.current) ||
        isChatRequestAbortError(err)
      ) {
        return;
      }
      logPipelineTurnFailure({
        turn: chatTurnRef.current,
        userText: trimmed,
        normalizedMessage: normalizeTurnMessage(trimmed),
        intent: primaryTurnDecision?.type ?? "unknown",
        turnOwner: primaryTurnDecision?.owner ?? "unknown",
        currentRoom:
          resolveCurrentEstateRoom({
            directVisitRoomId: directEstateVisitRef.current?.roomId ?? null,
            activeSection: activeSectionRef.current,
            memoryRoomId: getEstateMemory().currentRoom?.entryId ?? null,
          }) ?? null,
        failureReason:
          err instanceof Error ? err.message : "handle-send-error",
        selectedHandler: "handle_send",
      });
      if (!chatTurnState.assistantReplied) {
        const message = resolveChatFailureReply({
          err,
          userText: trimmed,
          messages: [...messages, { role: "user" as const, content: trimmed }],
          surface: "chat",
        });
        if (message) {
          markAssistantReplied(chatTurnState);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: message },
          ]);
        }
      }
      setError(null);
    } finally {
      if (isChatRequestSuperseded(sendGeneration, chatRequestGenerationRef.current)) {
        // Newest turn owns loading + fail-safe — do not unlock or invent a reply here.
        if (activeChatTurnLifecycleRef.current === chatTurnState) {
          activeChatTurnLifecycleRef.current = null;
        }
        return;
      }
      guaranteeChatTurnCompletion({
        state: chatTurnState,
        ensureVisibleReply: () => {
          if (!needsFailSafeAssistantReply(chatTurnState)) return;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              markAssistantReplied(chatTurnState);
              return prev;
            }
            const lastAssistant = [...prev]
              .reverse()
              .find((m) => m.role === "assistant")?.content;
            const userLines = prev
              .filter((m) => m.role === "user")
              .map((m) => m.content);
            const priorUser =
              userLines.length >= 2
                ? userLines[userLines.length - 2]
                : userLines[0];
            markAssistantReplied(chatTurnState);
            const failSafeReply = buildFailSafeChatReply(
              trimmed,
              {
                lastAssistantText: lastAssistant,
                priorUserText: priorUser,
              },
              prev,
            );
            if (!failSafeReply) return prev;
            return [
              ...prev,
              {
                role: "assistant" as const,
                content: failSafeReply,
              },
            ];
          });
        },
        finish: () => {
          finalizeChatTurn(chatTurnState, () => {
            endVisibleThinking();
            setIsLoading(false);
            requestChatInputFocus();
          });
        },
      });
      activeChatTurnLifecycleRef.current = null;
    }
  }

  handleSendRef.current = handleSend;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    voiceUsedRef.current = false;
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

  function revealWelcomeHomeEstateMap() {
    openExploreSparkVisualExplorer();
  }

  function handleWelcomeHomeDailyChoice(choiceId: WelcomeHomeDailyChoiceId) {
    switch (choiceId) {
      case "tell-spark-about-me":
        openProfileDestinationCore("my-business-estate");
        return;
      case "clear-my-mind":
        openClearMyMindCore();
        return;
      case "explore-spark-estate":
        openExploreSparkVisualExplorer();
        return;
      case "continue-where-left-off": {
        const resolution = resolveCompanionContinue();
        if (resolution.mode === "single") {
          handleCompanionContinueOption(resolution.option);
          return;
        }
        if (resolution.mode === "choose" && resolution.options[0]) {
          handleCompanionContinueOption(resolution.options[0]);
          return;
        }
        focusChatInput();
        return;
      }
      case "check-my-day":
        openPlanMyDayCore();
        return;
      case "help-me-restart":
        void handleSend(
          "I'm returning after some time away. Help me gently restart — what matters most right now?",
          true,
        );
        return;
      default:
        focusChatInput();
    }
  }

  function handleWelcomeHomeDiscoveryInvite() {
    setWelcomeHomeDiscoveryReady(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "I have a new discovery ready whenever you'd like. Look for the Discovery Key nearby — or just tell me when you're curious.",
      },
    ]);
  }

  function revealEstateRoomChoices(fromRoomId?: string | null) {
    const line = formatEstateRoomPickerLine(fromRoomId);
    setMessages((prev) => [...prev, { role: "assistant", content: line }]);
    registerPendingEstatePlaceMenuFromAssistant(line, chatTurnRef.current);
    requestAnimationFrame(() => {
      requestChatInputFocus({ preventScroll: true });
    });
  }

  function handleEstateRoomInvitationSelect(item: EstateRoomInvitationItem) {
    const action = item.action;
    const roomId =
      directEstateVisitRef.current?.roomId ??
      getEstateMemory().currentRoom?.entryId ??
      "welcome-home";
    switch (action.kind) {
      case "conversation":
        if (item.id === "great-thinkers") {
          setMessages((prev) => [
            ...prev,
            {
              role: "user",
              content: "I'd like to learn from great thinkers.",
            },
            {
              role: "assistant",
              content: formatLibraryGreatThinkersReply(),
            },
          ]);
          requestAnimationFrame(() => {
            requestChatInputFocus({ preventScroll: true });
          });
          return;
        }
        handleEstateConversationStart(roomId);
        return;
      case "presence":
        enterJustBeHere(roomId);
        return;
      case "estate-map":
        openExploreSparkVisualExplorer();
        return;
      case "companion-continue": {
        const resolution = resolveCompanionContinue();
        if (resolution.mode === "single") {
          handleCompanionContinueOption(resolution.option);
          return;
        }
        if (resolution.mode === "choose" && resolution.options[0]) {
          handleCompanionContinueOption(resolution.options[0]);
          return;
        }
        focusChatInput();
        return;
      }
      case "plan-my-day":
        openPlanMyDayCore();
        return;
      case "show-suggestions":
        void handleSend(
          "What would help me focus on today? Show me a few gentle suggestions.",
          true,
        );
        return;
      case "return-home":
        navigateToChatCore();
        return;
      case "section":
        syncDirectEstateVisit(null);
        clearEstatePendingTransition();
        openStandaloneFocusSectionCore(action.section);
        return;
      case "brain-dump-engage":
        setEstateConservatoryEngaged(true);
        return;
      case "institute-browse":
        openMomentumInstituteRoomCore();
        return;
      case "stables-experience":
        openStablesRoomCore();
        return;
      case "evidence-reminder": {
        const reply = formatEvidenceVaultReminderReply();
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "Show me a reminder" },
          { role: "assistant", content: reply },
        ]);
        return;
      }
      case "evidence-add":
      case "evidence-today":
        enterEvidenceVaultRoomCore({
          userIntent: "open-todays-discovery-file",
          workspaceMode: "add",
          skipWelcome: true,
        });
        return;
      case "evidence-browse":
        enterEvidenceVaultRoomCore({
          userIntent: "browse-evidence-archive",
          workspaceMode: "browse",
          skipWelcome: true,
        });
        return;
      case "evidence-find-proof":
      case "evidence-search":
        enterEvidenceVaultRoomCore({
          userIntent: "search-discoveries",
          workspaceMode: "browse",
          skipWelcome: true,
        });
        return;
      case "evidence-insights": {
        const reply = formatEvidenceVaultInsightsReply();
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "View Insights" },
          { role: "assistant", content: reply },
        ]);
        return;
      }
      case "evidence-print": {
        exportAllEvidence("print");
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "Print Discoveries" },
          {
            role: "assistant",
            content:
              "Your discoveries are ready to print — the print dialog should be open.",
          },
        ]);
        return;
      }
      default:
        return;
    }
  }

  function handleEstateConversationStart(roomId: string) {
    const greeting = estatePresenceGreeting(roomId);
    setMessages((prev) => {
      if (
        prev.some(
          (message) =>
            message.role === "assistant" && message.content === greeting,
        )
      ) {
        return prev;
      }
      return [...prev, { role: "assistant", content: greeting }];
    });
  }

  function runDirectEstateRoomNavigation(
    command: EstateCommandDecision,
    userText: string,
    navigationLine?: string,
    opts?: { skipAssistantMessage?: boolean },
  ) {
    if (
      isChamberMemberConversationActive({
        activeSection: activeSectionRef.current,
        activeMemberId: activeChamberMemberIdRef.current,
      }) &&
      command.section !== "chamber-of-momentum"
    ) {
      return;
    }
    setStressReliefOffer(null);
    clearOfferStateOnly();

    const roomId = command.roomId ?? command.entryId;

    /**
     * Always dismiss Explore Estate before a room hop so the map cannot cover
     * Welcome Home or the destination photograph.
     */
    dismissTransientEstateExperiencesForDestinationSwitch({
      destinationId: roomId || command.section,
      kind: "section",
    });

    /** Welcome Home is the lobby — never a home-section direct visit trap. */
    if (
      roomId === "welcome-home" ||
      roomId === "spark-estate" ||
      command.entryId === "welcome-home" ||
      command.entryId === "spark-estate"
    ) {
      returnToWelcomeHomeLobby(userText || "welcome home");
      return;
    }

    const openingClearMyMind =
      command.section === "brain-dump" ||
      roomId === "clear-my-mind" ||
      command.entryId === "clear-my-mind";
    if (!openingClearMyMind) {
      leaveClearMyMindIfNavigatingAway();
    }

    /**
     * Clear My Mind Mode — dedicated interactive workspace, never frosted chat.
     * Enter mode immediately; do not create a direct-visit overlay.
     */
    if (
      command.section === "brain-dump" ||
      roomId === "clear-my-mind" ||
      command.entryId === "clear-my-mind"
    ) {
      patchEstateRuntimeState({
        currentPlaceId: "clear-my-mind",
        activeConversationMode: true,
      });
      registerEstatePendingTransition({
        destinationSection: "brain-dump",
        destinationEntryId: "clear-my-mind",
        originalUserIntent: userText,
        offeredAtTurn: chatTurnRef.current,
        followUpQuestion: false,
      });
      executeEstateCommandMemoryHandoff(command, {
        userText,
        fromSection: activeSectionRef.current,
        playArrival: true,
        playAmbience: true,
      });
      captureOfferAccepted(command.workspaceOffer, closedLoopCtx());
      const arrivalAck =
        navigationLine ??
        CLEAR_MY_MIND_WELCOME_LINES[0] ??
        estateCommandAckLine(command);
      openClearMyMindCore({ silent: true });
      if (!opts?.skipAssistantMessage) {
        if (activeChatTurnLifecycleRef.current) {
          markAssistantReplied(activeChatTurnLifecycleRef.current);
        }
        setMessages((prev) => {
          if (
            prev.some(
              (m) => m.role === "assistant" && m.content === arrivalAck,
            )
          ) {
            return prev;
          }
          return [...prev, { role: "assistant", content: arrivalAck }];
        });
      }
      finishEarlyChatTurn();
      return;
    }

    /**
     * Cartographer's Studio — dedicated orientation room, never Focus Studio
     * frosted invitation chrome (Just Chat / Visit Another Room / Enjoy the Estate).
     */
    if (
      command.section === "visual-focus" ||
      roomId === "focus-studio" ||
      roomId === "cartographers-studio" ||
      command.entryId === "focus-studio" ||
      command.entryId === "cartographers-studio"
    ) {
      patchEstateRuntimeState({
        currentPlaceId: "focus-studio",
        activeConversationMode: true,
      });
      registerEstatePendingTransition({
        destinationSection: "visual-focus",
        destinationEntryId: "focus-studio",
        originalUserIntent: userText,
        offeredAtTurn: chatTurnRef.current,
        followUpQuestion: false,
      });
      executeEstateCommandMemoryHandoff(command, {
        userText,
        fromSection: activeSectionRef.current,
        playArrival: true,
        playAmbience: true,
      });
      captureOfferAccepted(command.workspaceOffer, closedLoopCtx());
      requestVisualFocusStudio();
      clearSplitBesideWorkspace();
      openStandaloneFocusSectionCore("visual-focus");
      const arrivalAck =
        navigationLine ??
        "Welcome to the Cartographer's Studio — every map tells a story.";
      if (!opts?.skipAssistantMessage) {
        if (activeChatTurnLifecycleRef.current) {
          markAssistantReplied(activeChatTurnLifecycleRef.current);
        }
        setMessages((prev) => {
          if (
            prev.some(
              (m) => m.role === "assistant" && m.content === arrivalAck,
            )
          ) {
            return prev;
          }
          return [...prev, { role: "assistant", content: arrivalAck }];
        });
      }
      finishEarlyChatTurn();
      return;
    }

    /**
     * Round Table Boardroom — structured decision support, never Projects stub
     * or blank frosted chat as the primary interface.
     */
    if (
      command.section === "boardroom" ||
      roomId === "round-table" ||
      command.entryId === "round-table"
    ) {
      patchEstateRuntimeState({
        currentPlaceId: "round-table",
        activeConversationMode: true,
      });
      registerEstatePendingTransition({
        destinationSection: "boardroom",
        destinationEntryId: "round-table",
        originalUserIntent: userText,
        offeredAtTurn: chatTurnRef.current,
        followUpQuestion: false,
      });
      executeEstateCommandMemoryHandoff(command, {
        userText,
        fromSection: activeSectionRef.current,
        playArrival: true,
        playAmbience: true,
      });
      captureOfferAccepted(command.workspaceOffer, closedLoopCtx());
      openBoardroomCore({
        intent: resolveBoardroomEntryIntent(userText),
      });
      const arrivalAck =
        navigationLine ??
        "Welcome to the Round Table — we can explore this from several angles.";
      if (!opts?.skipAssistantMessage) {
        if (activeChatTurnLifecycleRef.current) {
          markAssistantReplied(activeChatTurnLifecycleRef.current);
        }
        setMessages((prev) => {
          if (
            prev.some(
              (m) => m.role === "assistant" && m.content === arrivalAck,
            )
          ) {
            return prev;
          }
          return [...prev, { role: "assistant", content: arrivalAck }];
        });
      }
      finishEarlyChatTurn();
      return;
    }

    /**
     * While Clear My Mind Mode is active, refuse estate room hops that would
     * replace the workspace with frosted chat (Wander / go-to-room).
     * Member exits only via Back, Welcome Home, or explicit leave phrases.
     */
    if (
      isClearMyMindModeActive() ||
      activeSectionRef.current === "brain-dump"
    ) {
      openClearMyMindCore({ silent: true });
      finishEarlyChatTurn();
      return;
    }

    setEstateConservatoryEngaged(false);
    patchEstateRuntimeState({
      currentPlaceId: roomId,
      activeConversationMode: true,
    });
    const roomBg =
      command.backgroundImageOverride ??
      resolveEstateRoomBackgroundImage(roomId);
    if (roomBg) preloadRoomBackground(roomBg);
    const visit: DirectEstateVisit = {
      roomId,
      section: command.section,
      userIntent: userText,
      userMessageCountAtArrival: messages.filter((m) => m.role === "user")
        .length,
      backgroundImageOverride: command.backgroundImageOverride ?? null,
    };
    directEstateVisitRef.current = visit;
    registerEstatePendingTransition({
      destinationSection: command.section,
      destinationEntryId: command.roomId ?? command.entryId,
      originalUserIntent: userText,
      offeredAtTurn: chatTurnRef.current,
      followUpQuestion: false,
    });
    executeEstateCommandMemoryHandoff(command, {
      userText,
      fromSection: activeSectionRef.current,
      playArrival: true,
      playAmbience: true,
    });
    if (command.pendingJourneyEntryIds?.length) {
      patchEstateMemory((mem) => ({
        ...mem,
        activeJourney: {
          ...mem.activeJourney,
          pendingEntryIds: command.pendingJourneyEntryIds!,
        },
      }));
    }
    captureOfferAccepted(command.workspaceOffer, closedLoopCtx());
    acceptWorkspaceOfferCore(command.workspaceOffer);
    syncDirectEstateVisit(visit);
    const arrivalAck = navigationLine ?? estateCommandAckLine(command);
    if (!opts?.skipAssistantMessage) {
      if (activeChatTurnLifecycleRef.current) {
        markAssistantReplied(activeChatTurnLifecycleRef.current);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: arrivalAck },
      ]);
    }
    finishEarlyChatTurn();
  }

  function acceptWorkspaceOfferCore(offer: WorkspaceOffer) {
    const pendingTransition = loadEstatePendingTransition();
    const pendingIntent = pendingTransition?.originalUserIntent;
    const estateAck = estateTransitionAckForSection(offer.section, pendingIntent);
    captureOfferAccepted(offer, closedLoopCtx());
    clearOfferStateOnly();
    const directVisitAtOffer = directEstateVisitRef.current;
    if (offer.estateMenuActionId && !directVisitAtOffer) {
      const menuEntryId =
        pendingTransition?.destinationEntryId ??
        estateEntryIdForSection(offer.section) ??
        offer.section;
      recordEstateRoomTransition({
        toSection: offer.section,
        toEntryId: menuEntryId,
        fromSection: activeSectionRef.current,
        reason: "direct room command",
        userText: pendingIntent || lastUserTextRef.current || undefined,
        preserveChat: true,
        expectedNextStep: estateAck.split("\n\n").pop(),
        shariGreeting: estateArrivalShariGreeting(menuEntryId) ?? undefined,
      });
      handleEstateMenuAction(offer.estateMenuActionId);
      return;
    }
    const arrivalEntryId =
      pendingTransition?.destinationEntryId ??
      estateEntryIdForSection(offer.section) ??
      offer.section;
    recordEstateRoomTransition({
      toSection: offer.section,
      toEntryId: arrivalEntryId,
      fromSection: activeSectionRef.current,
      reason: "workspace offer accepted",
      userText: pendingIntent || lastUserTextRef.current || undefined,
      preserveChat: true,
      expectedNextStep: estateAck.split("\n\n").pop(),
      shariGreeting: estateArrivalShariGreeting(arrivalEntryId) ?? undefined,
      playArrival: !(
        pendingIntent?.trim() && isDirectEstateRoomRequest(pendingIntent)
      ),
    });
    if (offer.section === "content-generator") {
      noteWorkspaceOpened("content-generator", "workspace_offer");
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("other");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: estateAck },
        ]);
        return;
      }
      if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession()
      ) {
        return;
      }
      if (tryOpenCreateForCurrentArtifact(lastUserTextRef.current)) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: estateAck },
        ]);
        return;
      }
      const intentText = pendingIntent ?? lastUserTextRef.current;
      openCreationWorkspaceCore(
        "content-generator",
        {
          itemType: "content",
          title: "New piece",
          brief: intentText,
          stage: "choosing content type",
          source: "generated",
        },
        {
          ackMessage: estateAck,
          seedOverride: { autoGenerate: false },
        },
      );
      return;
    }
    if (offer.section === "time-block") {
      openCalendarItemCore(timeBlockFocusId, "workspace-offer");
      return;
    }
    if (offer.section === "brain-dump") {
      openClearMyMindCore({
        initialView: "capture",
        silent: Boolean(directEstateVisitRef.current),
      });
      return;
    }
    if (offer.section === "visual-focus") {
      noteWorkspaceOpened("visual-focus", "estate_offer");
      requestVisualFocusStudio();
      clearSplitBesideWorkspace();
      openStandaloneFocusSectionCore("visual-focus");
      return;
    }
    if (offer.section === "momentum-builder") {
      noteWorkspaceOpened("momentum-builder", "estate_offer");
      setMomentumBuilderArrivalActive(true);
      openMomentumBuilderRoomCore();
      return;
    }
    if (offer.section === "chamber-of-momentum") {
      noteWorkspaceOpened("chamber-of-momentum", "estate_offer");
      openChamberOfMomentumCore({
        memberId: offer.chamberMemberId ?? null,
      });
      return;
    }
    if (offer.section === "boardroom") {
      noteWorkspaceOpened("boardroom", "estate_offer");
      openBoardroomCore();
      return;
    }
    if (offer.section === "momentum-institute") {
      // Legacy institute drawer only when a specific drawer was requested;
      // otherwise open the live Chamber of Momentum (no launch bridge).
      if (offer.instituteDrawerId) {
        noteWorkspaceOpened("momentum-institute", "estate_offer");
        openMomentumInstituteRoomCore(offer.instituteDrawerId);
        return;
      }
      noteWorkspaceOpened("chamber-of-momentum", "estate_offer");
      openChamberOfMomentumCore({
        memberId: offer.chamberMemberId ?? null,
      });
      return;
    }
    if (offer.section === "stables") {
      noteWorkspaceOpened("stables", "estate_offer");
      openStablesRoomCore();
      return;
    }
    if (offer.section === "grow-observatory") {
      noteWorkspaceOpened("grow-observatory", "estate_offer");
      openStandaloneFocusSectionCore("grow-observatory");
      return;
    }
    if (offer.section === "growth-library" || offer.section === "how-do-i") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "library") {
        noteWorkspaceOpened("growth-library", "standalone_room");
        clearSplitBesideWorkspace();
        openStandaloneFocusSectionCore("growth-library");
        return;
      }
      noteWorkspaceOpened("momentum-institute", "estate_offer");
      openMomentumInstituteRoomCore(offer.instituteDrawerId);
      return;
    }
    if (offer.section === "growth-journal") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "journal") {
        noteWorkspaceOpened("growth-journal", "standalone_room");
        clearSplitBesideWorkspace();
        setEstateRoomChatVisible(false);
        openStandaloneFocusSectionCore("growth-journal");
        return;
      }
      noteWorkspaceOpened("growth-journal", "estate_offer");
      openGrowthDestinationCore("growth-journal");
      return;
    }
    if (offer.section === "growth-greenhouse") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "greenhouse") {
        noteWorkspaceOpened("growth-greenhouse", "standalone_room");
        clearSplitBesideWorkspace();
        openStandaloneFocusSectionCore("growth-greenhouse");
        return;
      }
      noteWorkspaceOpened("growth-greenhouse", "estate_offer");
      openStandaloneFocusSectionCore("growth-greenhouse");
      return;
    }
    if (offer.section === "evidence-bank") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "evidence-vault") {
        noteWorkspaceOpened("evidence-bank", "standalone_room");
        clearSplitBesideWorkspace();
        /** Stay on place-first arrival — do not jump into the form. */
        openStandaloneFocusSectionCore("evidence-bank");
        return;
      }
      noteWorkspaceOpened("evidence-bank", "estate_offer");
      enterEvidenceVaultRoomCore({
        userIntent: pendingIntent || lastUserTextRef.current || "evidence-vault",
      });
      return;
    }
    if (offer.section === "growth-portfolio") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "portfolio") {
        noteWorkspaceOpened("growth-portfolio", "standalone_room");
        clearSplitBesideWorkspace();
        openStandaloneFocusSectionCore("growth-portfolio");
        return;
      }
      noteWorkspaceOpened("growth-portfolio", "estate_offer");
      openGrowthDestinationCore("growth-portfolio");
      return;
    }
    if (offer.section === "grow-spark-cards") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "seeds-planted") {
        noteWorkspaceOpened("grow-spark-cards", "standalone_room");
        clearSplitBesideWorkspace();
        openStandaloneFocusSectionCore("grow-spark-cards");
        return;
      }
    }
    if (offer.section === "decision-compass") {
      openDecisionCompass();
      return;
    }
    if (offer.section === "focus-audio") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "peaceful-places") {
        const peacefulBg = resolveEstateRoomBackgroundImage("peaceful-places");
        if (peacefulBg) preloadRoomBackground(peacefulBg);
        setPeacefulPlacesArrivalActive(true);
        setFocusAudioCategory(null);
        clearSplitBesideWorkspace();
        trackWorkspaceEcosystemEvent("focus-audio");
        noteWorkspaceOpened("focus-audio", "standalone_room");
        openStandaloneFocusSectionCore("focus-audio");
        return;
      }
      if (directVisit && directVisit.roomId !== "peaceful-places") {
        setPeacefulPlacesArrivalActive(false);
        setFocusAudioCategory(null);
        clearSplitBesideWorkspace();
        trackWorkspaceEcosystemEvent("focus-audio");
        noteWorkspaceOpened("focus-audio", "standalone_room");
        openStandaloneFocusSectionCore("focus-audio");
        return;
      }
      openFocusAudioCore(detectAudioRequest(lastUserTextRef.current).categoryId);
      return;
    }
    if (offer.section === "games" || offer.section === "quick-recharge") {
      const directVisit = directEstateVisitRef.current;
      if (directVisit?.roomId === "game-room") {
        clearSplitBesideWorkspace();
        trackWorkspaceEcosystemEvent("games");
        noteWorkspaceOpened("quick-recharge", "standalone_room");
        openStandaloneFocusSectionCore("games");
        return;
      }
    }
    if (offer.section === "energy") {
      noteWorkspaceOpened("energy", "workspace_offer");
      setActiveSection("energy");
      activeSectionRef.current = "energy";
      setActiveNav("chat");
      return;
    }
    if (offer.section === "welcome-room") {
      if (directEstateVisitRef.current?.roomId === "sunroom") {
        syncDirectEstateVisit(null);
      }
      openWelcomeRoom();
      return;
    }

    const directVisit = directEstateVisitRef.current;
    if (
      directVisit &&
      directVisit.section === offer.section &&
      !isDedicatedEstateRoomPanelSection(offer.section)
    ) {
      noteWorkspaceOpened(offer.section, "standalone_room");
      clearSplitBesideWorkspace();
      openStandaloneFocusSectionCore(offer.section);
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
    /** Back to Chat — never restore companionReturnSection / guide room. */
    skipSectionRestore?: boolean;
    /** @deprecated use mode: "hide" — hide preserves resumable work */
    preserveCreateSession?: boolean;
  }) {
    const mode: PanelCloseMode = opts?.mode ?? "hide";
    const closingPanel = workspacePanelRef.current;

    if (closingPanel === "welcome-room") {
      applyChatLayoutMode("split");
    }

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

    if (!opts?.skipSectionRestore) {
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
            onVisualizeThis={openSparkVisualEngineFromExperience}
            onPreviewProjectHomes={openProjectHomesPrototypeCore}
          />
        );
      case "playbook":
        return renderPlaybookPanel({ registerBack });
      case "brain-dump":
        return (
          <BrainDumpPanel
            key={brainDumpPanelKey}
            initialView={brainDumpInitialView}
            onOpen={openWorkspaceFromSection}
            onSuggestOpen={suggestCrossWorkspaceOpen}
            onContextChange={handleWorkspaceDetailChange}
            onBackToChat={goBackToChat}
            onVisualizeThis={openSparkVisualEngineFromExperience}
          />
        );
      case "time-block":
        return (
          <LegacyMomentumAppointmentRedirect
            onRedirect={() =>
              openCalendarItemCore(timeBlockFocusId, "legacy-redirect")
            }
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
        return null;
      case "visual-focus":
        return (
          <VisualFocusWorkspacePanel
            onBack={goBack}
            onClose={closeWorkspacePanel}
            registerBack={registerBack}
            onReturnToEstate={navigateBackToEstateHome}
          />
        );
      case "wins-this-week":
        return (
          <EstateCollectionRoomPanel
            roomId="celebration-garden"
            nav={buildGrowthPanelNav("wins-this-week")}
          />
        );
      case "evidence-bank":
        return (
          <EvidenceVaultRoomPanel
            nav={buildGrowthPanelNav("evidence-bank")}
            arrivalKey={evidenceVaultArrivalKey}
            chatVisible={roomMenuChatVisible}
            conversationScrollKey={estateChatScrollKey}
            thread={
              <SimpleChat
                messages={messages}
                stateHint={stateHint}
                showHint={false}
                hideEmptyState
                isLoading={isLoading}
                thinkingMessage={visibleThinkingMessage}
                awaitingUserConfirmation={chatAwaitingConfirmation}
                thinkingEmotion={displayEmotion}
                workspacePanel={workspacePanel}
                workspaceActiveBeside={workspaceActiveBeside}
                formatParagraphs={formatAssistantParagraphs}
                afterLastAssistant={undefined}
              />
            }
            footer={
              <HomeChatInputFooter
                homeCalm={false}
                homeChatPlaceholder="What discovery would you like to preserve?"
                conversationMode
                input={input}
                isLoading={isLoading}
                isListening={isListening}
                speechSupported={speechSupported}
                inputRef={inputRef}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onToggleListening={toggleListening}
                onSend={(text) => void handleSend(text)}
                pendingAction={pendingAction}
                suppressInterventionCards
                onRunArtifactExport={runArtifactExport}
                onClearPendingOffers={clearAllPendingOffers}
                onDismissOfferKeepTalking={dismissOfferKeepTalking}
                onExecutePendingAction={executePendingAction}
                splitCreateBuilder={splitCreateBuilder}
                createBuilderSession={createBuilderSession}
                onCreateBuilderAction={handleCreateBuilderAction}
                voiceOutput={voiceOutput}
                voiceBlocked={voiceBlocked}
                onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                onVoiceBlockedReset={() => setVoiceBlocked(false)}
                ttsAudioRef={ttsAudioRef}
              />
            }
          />
        );
      case "focus":
        return <FocusAreaPanel onAction={handleFocusHubAction} />;
      case "growth":
        return null;
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
      case "growth-journal":
        if (activeSection === "growth-journal") return null;
        return (
          <GrowthJournalRoomPanel
            nav={buildGrowthPanelNav("growth-journal")}
            chatVisible={roomMenuChatVisible}
            onVisualizeThis={openSparkVisualEngineFromExperience}
            conversationScrollKey={estateChatScrollKey}
            thread={
              <SimpleChat
                messages={messages}
                stateHint={stateHint}
                showHint={false}
                hideEmptyState
                isLoading={isLoading}
                thinkingMessage={visibleThinkingMessage}
                awaitingUserConfirmation={chatAwaitingConfirmation}
                thinkingEmotion={displayEmotion}
                workspacePanel={workspacePanel}
                workspaceActiveBeside={workspaceActiveBeside}
                formatParagraphs={formatAssistantParagraphs}
                afterLastAssistant={undefined}
              />
            }
            footer={
              <HomeChatInputFooter
                homeCalm={false}
                homeChatPlaceholder="Share a thought when you're ready."
                conversationMode
                input={input}
                isLoading={isLoading}
                isListening={isListening}
                speechSupported={speechSupported}
                inputRef={inputRef}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onToggleListening={toggleListening}
                onSend={(text) => void handleSend(text)}
                pendingAction={pendingAction}
                suppressInterventionCards
                onRunArtifactExport={runArtifactExport}
                onClearPendingOffers={clearAllPendingOffers}
                onDismissOfferKeepTalking={dismissOfferKeepTalking}
                onExecutePendingAction={executePendingAction}
                splitCreateBuilder={splitCreateBuilder}
                createBuilderSession={createBuilderSession}
                onCreateBuilderAction={handleCreateBuilderAction}
                voiceOutput={voiceOutput}
                voiceBlocked={voiceBlocked}
                onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                onVoiceBlockedReset={() => setVoiceBlocked(false)}
                ttsAudioRef={ttsAudioRef}
              />
            }
          />
        );
      case "growth-portfolio":
        return (
          <GrowthPortfolioPanel
            nav={buildGrowthPanelNav("growth-portfolio")}
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
              openSectionBesideChatCore(section, nav ?? "other", {
                userInitiated: true,
              })
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
            onVisualizeThis={openSparkVisualEngineFromExperience}
            onPreviewProjectHomes={openProjectHomesPrototypeCore}
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
      case "welcome-room":
        return null;
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
            onOpenAvatars={() => openProfileDestinationCore("people-i-help")}
          />
        );
      case "brain-dump":
        return null;
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
            onVisualizeThis={openSparkVisualEngineFromExperience}
          />
        );
      case "time-block":
        return (
          <LegacyMomentumAppointmentRedirect
            onRedirect={() =>
              openCalendarItemCore(timeBlockFocusId, "legacy-redirect")
            }
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
              if (section === "chamber-of-momentum") {
                openChamberOfMomentumCore();
                return;
              }
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
        /** Legacy section id — Breathe is overlay-only; effect redirects. */
        return null;
      case "focus-audio":
        return (
          <FocusAudioPanel
            emotion={displayEmotion}
            initialCategory={focusAudioCategory ?? undefined}
            onDone={closeWorkspacePanel}
            onLaunchActivity={handlePeacefulPlacesGardenActivity}
            onLaunchSection={handlePeacefulPlacesGardenSection}
          />
        );
      default:
        return renderWorkspacePanel(section);
    }
  }

  const workspacePanelNode = useMemo(
    () => {
      if (workspacePanel === "welcome-room") return null;
      if (workspacePanel) return renderWorkspacePanel(workspacePanel);
      if (companionStandaloneSection) {
        return renderCompanionStandaloneSection(companionStandaloneSection);
      }
      return null;
    },
    [
      workspacePanel,
      companionStandaloneSection,
      brainDumpPanelKey,
      brainDumpInitialView,
      workspaceContextBanner,
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
        openClearMyMindCore();
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
      openCalendarItemCore(timeBlockFocusId, "action-bridge");
      return;
    }
    if (bridge.tool === "brain-dump") {
      openClearMyMindCore();
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
      micExplicitStopRef.current = true;
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
        objectId: "create",
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
        objectId: "projects",
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
        objectId: "calendar",
        label: "Calendar",
        detail: "Planning open",
        onOpen: () => openCalendarItemCore(timeBlockFocusId, "legacy-redirect"),
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "templates-library") {
      items.push({
        id: "templates",
        objectId: "templates",
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
        objectId: "toolbelt-snippets",
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
        objectId: "strategies",
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

  const arrivalNavVisibility = welcomeScene
    ? "normal"
    : (effectiveHomeArrival?.chrome.navVisibility ?? "calm");

  function handleArrivalWalkComplete(section: AppSection) {
    if (section === "home") return;
    const living = homeArrival?.livingRoom;
    if (living?.livingChangeSet) {
      recordLivingRoomDeparture({
        toSection: section,
        snapshot: {
          kinsey: living.livingChangeSet.kinsey,
          wildlife: living.livingChangeSet.wildlife,
          heroMotion: living.livingChangeSet.heroMotion,
          objectKinds: living.layer2.map((object) => object.kind),
        },
      });
    }
    openSectionBesideChatCore(section, undefined, { userInitiated: true });
  }

  const focusSanctuaryFullBleed = isFocusSanctuaryFullBleed(
    activeSection,
    activitySession,
  );
  const focusWorkflowSanctuary =
    focusSanctuaryFullBleed &&
    Boolean(activitySession.activityId) &&
    activitySession.phase !== "browse";

  const peacefulPlacesChromeActive =
    activeSection === "focus-audio" &&
    (!directEstateVisit || directEstateVisit.roomId === "peaceful-places");

  const estateImmersiveActive = isEstateImmersiveRoom({
    activeSection,
    workspacePanel,
    welcomeHomePrimary,
    momentumBuilderPrimary,
    overlay,
    focusSanctuaryFullBleed,
  });

  const estatePresenceRoomId = resolveEstatePresenceRoomId({
    activeSection,
    momentumInstitutePrimary,
    stablesPrimary,
    directEstateVisit,
    showDirectEstateOverlay,
    memoryRoomId: getEstateMemory().currentRoom?.entryId,
  });

  const showGlobalEstatePresence = Boolean(
    estatePresenceRoomId &&
      estateImmersiveActive &&
      !momentumInstitutePrimary &&
      !stablesPrimary,
  );

  const discoveryMemberId = useMemo(() => getDiscoveryMemberId(), []);

  const discoveryMemberContext = useMemo(
    () => {
      const memory = getEstateMemory();
      return buildDiscoveryMemberContextFromEstateMemory({
        roomVisitCounts: memory.roomVisitMemory?.visitCounts ?? {},
        featuresUsed: [],
        favoriteRoomIds: memory.roomVisitMemory?.favoriteRoomIds ?? [],
      });
    },
    [activeSection, estatePresenceRoomId],
  );

  const previewTestLaunch = useMemo(
    () => getCompanionPreviewTestLaunch(),
    [previewTestRevision],
  );

  const previewDiscoverySession =
    previewTestLaunch?.target === "discovery-key"
      ? previewTestLaunch.discoverySession ?? null
      : null;

  const previewDiscoveryRoomId =
    previewTestLaunch?.target === "discovery-key"
      ? previewTestLaunch.roomId ?? null
      : null;

  const showDiscoveryKeyHost = Boolean(
    !overlay &&
      ((estatePresenceRoomId &&
        ((showGlobalEstatePresence && estateImmersiveActive) ||
          (previewDiscoverySession &&
            previewDiscoveryRoomId === estatePresenceRoomId))) ||
        (welcomeHomePrimary &&
          welcomeHomeDiscoveryReady &&
          !welcomeHomeExperience.showIntro)),
  );

  const discoveryKeyHostRoomId =
    welcomeHomePrimary && welcomeHomeDiscoveryReady
      ? "sunroom"
      : estatePresenceRoomId;

  const estatePlaceAudioHostPlaceId = resolveEstatePlaceAudioHostPlaceId({
    directEstateVisit,
    showDirectEstateOverlay,
    estatePresenceRoomId,
    showGlobalEstatePresence,
    welcomeHomePrimary,
  });

  const estatePlaceChromeActive = isEstatePlaceChromeActive({
    activeSection,
    welcomeHomePrimary,
    profileEstateChromeActive,
    estateImmersiveActive,
    showDirectEstateOverlay,
    momentumInstitutePrimary,
    stablesPrimary,
    momentumBuilderPrimary,
    overlay,
  });

  const estateChromePolicy = resolveEstateChromePolicy({
    placeId:
      (showDirectEstateOverlay ? estateChatRoomId : null) ??
      profileEstateRoomOverlayId ??
      directEstateVisit?.roomId ??
      null,
    activeSection,
    welcomeHomePrimary,
    profileEstateChromeActive,
    estateImmersiveActive,
    showDirectEstateOverlay,
    momentumInstitutePrimary,
    stablesPrimary,
    momentumBuilderPrimary,
    overlay,
  });

  /** Keep profile trigger visible while overlays open — only hide during sign-in. */
  const showGlobalEstateMenu =
    estateChromePolicy.showSubtleEstateMenu && overlay !== "signin";
  /**
   * Spark Estate Guide — menu-only entry (Welcome Home → Spark Estate).
   * Never show bottom-corner launcher; mount chrome only while guide is open.
   */
  const showSparkEstateGuideChrome =
    estateGuideFlipbookOpen && overlay !== "signin" && !justBeHereSession;
  /** Spark Note chrome — hide while Strategy Library estate destination is open. */
  const showSparkNoteChrome =
    overlay !== "signin" &&
    !justBeHereSession &&
    activeSection !== "playbook";

  const clearMyMindWorkspaceActive =
    activeSection === "brain-dump" || isClearMyMindModeActive();

  const createWorkspaceActive =
    workspacePanel === "content-generator" ||
    activeSection === "content-generator";

  const sparkEstateShellPlaceId = resolveSparkEstateShellPlaceId({
    clearMyMindWorkspaceActive,
    profileEstateRoomOverlayId,
    showDirectEstateOverlay,
    estateConservatoryEngaged,
    estateChatRoomId,
    activeSection,
  });
  /**
   * Evidence Vault uses Arrival Before Activity (invitation grid).
   * Do not force profile conversation-only chrome — EST-001 place-first.
   */
  const sparkEstateShellProfileMode = Boolean(
    profileEstateRoomOverlayId &&
      profileEstateRoomOverlayId !== "evidence-vault",
  );

  /**
   * Persistent top-left Welcome Home (106–108).
   * Shown throughout Spark Estate; hidden only for sign-in and Just Be Here.
   */
  const showCompanionBackControl =
    overlay !== "signin" &&
    !justBeHereSession &&
    (estatePlaceChromeActive ||
      isEstateFullBleedPanelSection(activeSection) ||
      estateGuideFlipbookOpen ||
      Boolean(sparkEstateShellPlaceId));

  const activeSectionMenuRoomId =
    activeSection === "growth-journal"
      ? "journal"
      : activeSection === "evidence-bank"
        ? "evidence-vault"
        : activeSection === "chamber-of-momentum"
          ? "chamber-of-momentum"
          : activeSection === "boardroom"
            ? "round-table"
            : activeSection === "visual-focus"
              ? "cartographers-studio"
              : activeSection === "destination-gallery"
                ? "destination-gallery"
              : activeSection === "the-gallery"
                ? "the-gallery"
                : welcomeHomePrimary
                  ? "welcome-home"
                  : null;

  const estateExperienceMenuRoomId = resolvePresenceModeRoomId({
    directRoomId:
      activeSectionMenuRoomId ??
      sparkEstateShellPlaceId ??
      (showDirectEstateOverlay ? estateChatRoomId : null) ??
      (directEstateVisit?.section === activeSection
        ? directEstateVisit.roomId
        : null),
    memoryRoomId: getEstateMemory().currentRoom?.entryId ?? null,
    presenceRoomId: estatePresenceRoomId,
    fallbackRoomId: welcomeHomePrimary ? "welcome-home" : null,
  });
  const roomMenuRoomId = justBeHereSession?.roomId
    ? justBeHereSession.roomId
    : clearMyMindWorkspaceActive
      ? "clear-my-mind"
      : estateExperienceMenuRoomId;
  const roomMenuChatVisible = justBeHereSession
    ? justBeHereChatVisible
    : estateRoomChatVisible;
  const showEstateExperienceMenu =
    overlay !== "signin" && Boolean(roomMenuRoomId);

  const handleCompanionBack = () => {
    // Back To Estate / Return to Estate — always Welcome Home lobby, never everyday chat.
    navigateBackToEstateHome();
  };

  const portaledModalSheets =
    welcomeHomePrimary ||
    estateImmersiveActive ||
    momentumBuilderPrimary ||
    momentumInstitutePrimary ||
    stablesPrimary ||
    profileEstateChromeActive;

  const profileEstateWelcomeMessage = useMemo(() => {
    if (!profileEstateRoomOverlayId) return undefined;
    if (profileEstateRoomOverlayId === "evidence-vault") {
      return (
        estateArrivalShariGreeting("evidence-vault") ??
        EVIDENCE_VAULT_ARRIVAL_WELCOME
      );
    }
    if (shouldSuppressEstateInvitationGrid(profileEstateRoomOverlayId)) {
      return undefined;
    }
    if (messages.length > 0 || isLoading) return undefined;
    if (
      profileEstateRoomOverlayId === "growth-profile" &&
      growthProfileEmphasizeTimeline
    ) {
      return "We can walk through your progress together — what feels most worth remembering?";
    }
    return estateArrivalShariGreeting(profileEstateRoomOverlayId) ?? undefined;
  }, [
    profileEstateRoomOverlayId,
    messages.length,
    isLoading,
    growthProfileEmphasizeTimeline,
  ]);

  const homeHasUserMessages = messages.some((m) => m.role === "user");
  const homeMode = resolveHomeMode({
    activeSection,
    homeCalm,
    hasUserMessages: homeHasUserMessages,
  });

  const workspaceLayoutCtx = {
    activeSection,
    overlay,
    workspacePanel,
    welcomeScene,
    activitySession,
  };

  const companionDeskVisible = usesCompanionDesk(workspaceLayoutCtx);

  const companionDeskFullBleed = resolveCompanionDeskFullBleed(workspaceLayoutCtx);

  const showHomeFloatingChat =
    activeSection === "home" &&
    !welcomeScene &&
    !companionDeskVisible &&
    !welcomeHomePrimary &&
    !showDirectEstateOverlay &&
    !sparkEstateShellPlaceId &&
    !momentumBuilderPrimary &&
    !momentumInstitutePrimary &&
    !stablesPrimary;

  const estateFullBleedShellActive =
    isEstateFullBleedPanelSection(activeSection) || focusSanctuaryFullBleed;

  return (
    <CompanionDeskProvider
      fullBleed={companionDeskFullBleed}
      visible={companionDeskVisible}
      defaultContent={
        companionDeskVisible ? <CompanionDeskChrome /> : null
      }
    >
    <div
      className={`companion-root relative flex h-dvh max-h-dvh overflow-hidden text-lg ${
        companionDeskVisible ? "companion-has-companion-desk" : ""
      }${welcomeHomePrimary ? " companion-welcome-home-root" : ""}${
        momentumBuilderPrimary ? " companion-momentum-builder-root" : ""
      }${
        momentumInstitutePrimary ? " companion-momentum-institute-root" : ""
      }${
        stablesPrimary ? " companion-stables-root" : ""
      }${
        profileEstateChromeActive ? " companion-growth-profile-root" : ""
      }${
        estatePlaceChromeActive ? " companion-estate-immersive-root" : ""
      }${showDirectEstateOverlay ? " companion-direct-estate-room-active" : ""} ${
        clientMounted ? shellClass : EMOTION_SHELL_CLASS.unclear
      }`}
      data-visual-mode={clientMounted ? visualMode : "off"}
      data-adaptive-context={clientMounted ? adaptiveVisualContext : "support"}
      data-home-mode={homeMode ?? undefined}
      data-just-be-here={justBeHereSession ? "" : undefined}
      data-just-be-here--entering={
        justBeHerePhase === "entering" ? "" : undefined
      }
      data-just-be-here--active={justBeHerePhase === "active" ? "" : undefined}
      data-just-be-here-chat-visible={
        justBeHereChatVisible ? "true" : undefined
      }
      data-breathe-destination={
        isBreatheDestinationActive(breatheDestination) ? "" : undefined
      }
      data-breathe-destination-phase={breatheDestination.phase ?? undefined}
      data-breathe-resume={breatheResumeActive ? "" : undefined}
      data-journal-gazebo-active={
        activeSection === "growth-journal" ? "" : undefined
      }
      data-estate-room-chat-visible={
        roomMenuChatVisible ? "true" : "false"
      }
      {...constitutionalRenderContext.environment.dataAttributes}
      {...constitutionalRenderContext.presence.dataAttributes}
      suppressHydrationWarning
    >
      <CompanionUrlNavigation
        onNav={handleNavSelect}
        onOpenSection={openSectionFromUrlCore}
        onOverlay={(overlay) => setOverlay(overlay)}
        onSettingsSection={(section) => {
          setSettingsSection(section);
          setOverlay("settings");
        }}
      />
      <EstateArrivalHost
        onShariGreeting={(message, roomId) => {
          const greeting = message.trim();
          if (!greeting) return;
          // CB-022 — block Chamber arrival / generic greetings during unresolved topics.
          if (isBlockedGenericFallbackText(greeting)) return;
          if (
            roomId === "chamber-of-momentum" &&
            activeTopicTurnRef.current?.suppressChamberIntroWriters
          ) {
            setEstateRoomChatVisible(true);
            return;
          }
          setMessages((prev) => {
            if (
              prev.some(
                (entry) => entry.role === "assistant" && entry.content === greeting,
              )
            ) {
              return prev;
            }
            return [...prev, { role: "assistant", content: greeting }];
          });
          if (roomId === "chamber-of-momentum") {
            setEstateRoomChatVisible(true);
          }
        }}
      />
      <EstatePlaceAudioHost placeId={estatePlaceAudioHostPlaceId} />
      {showGlobalEstatePresence && estatePresenceRoomId ? (
        <EstatePresence roomId={estatePresenceRoomId} />
      ) : null}
      {showDiscoveryKeyHost && discoveryKeyHostRoomId ? (
        <DiscoveryKeyHost
          roomId={discoveryKeyHostRoomId}
          memberId={discoveryMemberId}
          memberContext={discoveryMemberContext}
          enabled={showDiscoveryKeyHost}
          previewForcedSession={
            previewDiscoverySession &&
            previewDiscoveryRoomId === estatePresenceRoomId
              ? previewDiscoverySession
              : null
          }
          previewHistoryStore={
            previewDiscoverySession &&
            previewDiscoveryRoomId === estatePresenceRoomId
              ? previewDiscoveryHistoryStoreRef.current
              : undefined
          }
          onNavigateSection={openStandaloneFocusSectionCore}
          onCompanionResponse={(message) => {
            setMessages((prev) => [...prev, { role: "assistant", content: message }]);
          }}
        />
      ) : null}
      <CompanionPreviewTestPanel
        onLaunch={launchPreviewTestExperience}
        onReset={resetPreviewTestExperience}
      />
      <Suspense fallback={null}>
        <CompanionSignInFromQuery onOpen={openSignIn} />
      </Suspense>
      {createWorkspaceActive && !sparkEstateShellPlaceId ? (
        <EstateRoomFullBleedBackground
          roomId="creative-studio"
          imageUrl={CREATIVE_STUDIO_ROOM_BG}
        />
      ) : (
        <CompanionBackground
          page={scenePage}
          seed={sceneSeed}
          calmHome={false}
          clearMyMind={clearMyMind}
          homesteadChat={homeMode === "chat" && !suppressGlobalBackground}
          suppress={
            suppressGlobalBackground ||
            isBreatheDestinationActive(breatheDestination) ||
            workspacePanel === "welcome-room" ||
            homeMode === "welcome" ||
            welcomeHomePrimary ||
            momentumBuilderPrimary ||
            momentumInstitutePrimary ||
            stablesPrimary ||
            profileEstateChromeActive ||
            estateImmersiveActive
          }
        />
      )}

      <div
        data-companion-session-layer=""
        className={`relative z-10 flex h-full min-h-0 w-full overflow-hidden ${
          estatePlaceChromeActive
            ? `companion-estate-immersive-active pl-0 pr-0${
                profileEstateChromeActive ? " companion-growth-profile-active" : ""
              }`
            : createWorkspaceActive
              ? "companion-create-active pl-0 pr-0"
            : welcomeHomePrimary
            ? `companion-welcome-home-active pl-0 pr-0${
                welcomeHomeIntroActive
                  ? " companion-welcome-home-intro-active"
                  : ""
              }${
                welcomeHomeEstateMapVisible
                  ? " companion-welcome-home-show-estate-nav"
                  : ""
              }`
            : momentumBuilderPrimary
              ? "companion-momentum-builder-active pl-0 pr-0"
            : momentumInstitutePrimary
              ? "companion-momentum-institute-active pl-0 pr-0"
            : activeSection === "chamber-of-momentum"
              ? "companion-chamber-active pl-0 pr-0"
            : activeSection === "boardroom"
              ? "companion-boardroom-active pl-0 pr-0"
            : activeSection === "project-homes"
              ? "companion-project-homes-active pl-0 pr-0"
            : activeSection === "destination-gallery"
              ? "companion-destination-gallery-active pl-0 pr-0"
            : activeSection === "visual-focus"
              ? "companion-cartographers-active pl-0 pr-0"
            : activeSection === "evidence-bank"
              ? "companion-evidence-vault-active pl-0 pr-0"
            : stablesPrimary
              ? "companion-stables-active pl-0 pr-0"
            : welcomeScene
            ? "pl-14 md:pl-44 companion-welcome-scene-active"
            : workspacePanel === "welcome-room"
              ? "pl-0"
              : activeSection === "the-gallery"
                ? "pl-0 companion-gallery-active"
              : isGrowthPanelSection(activeSection)
                ? "pl-0 companion-growth-active"
              : activeSection === "plan-my-day" ||
                  activeSection === "reminders" ||
                  activeSection === "rhythms" ||
                  activeSection === "reminders-rhythms" ||
                  activeSection === "calendar" ||
                  activeSection === "parking-lot" ||
                  activeSection === "spin-wheel"
                ? "pl-0 companion-plan-my-day-active"
              : activeSection === "brain-dump"
                ? "pl-0 companion-clear-my-mind-active"
              : activeSection === "focus-audio"
                ? peacefulPlacesChromeActive
                  ? "pl-0 companion-peaceful-places-active"
                  : "pl-0"
              : activeSection === "games" || activeSection === "quick-recharge"
                ? "pl-0 companion-momentum-games-active"
              : focusSanctuaryFullBleed
                ? "pl-0 companion-focus-my-brain-active"
              : "pl-14 md:pl-44"
        } ${homeCalm && !welcomeHomePrimary ? "companion-home-calm" : ""} ${
          workspacePanel === "welcome-room" ? "companion-welcome-room-active" : ""
        } ${
          isGrowPanelSection(activeSection) ? "companion-grow-active" : ""
        } ${
          isGrowthPanelSection(activeSection) ? "companion-growth-active" : ""
        } ${
          activeSection === "the-gallery" ? "companion-gallery-active" : ""
        } ${
          activeSection === "destination-gallery"
            ? "companion-destination-gallery-active"
            : ""
        } ${
          activeSection === "plan-my-day" ||
          activeSection === "reminders" ||
          activeSection === "rhythms" ||
          activeSection === "reminders-rhythms" ||
          activeSection === "calendar" ||
          activeSection === "parking-lot" ||
          activeSection === "spin-wheel"
            ? "companion-plan-my-day-active"
            : ""
        } ${
          activeSection === "brain-dump" ? "companion-clear-my-mind-active" : ""
        } ${
          peacefulPlacesChromeActive ? "companion-peaceful-places-active" : ""
        } ${
          activeSection === "games" || activeSection === "quick-recharge"
            ? "companion-momentum-games-active"
            : ""
        } ${
          momentumBuilderPrimary ? "companion-momentum-builder-active" : ""
        } ${
          focusSanctuaryFullBleed ? "companion-focus-my-brain-active" : ""
        } ${
          focusWorkflowSanctuary ? "companion-focus-workflow-active" : ""
        }`}
        data-everyday-chat={
          activeSection === "home" &&
          !welcomeScene &&
          !homeCalm &&
          (welcomeHomePrimary ? !welcomeHomeExperience.showIntro : true)
            ? ""
            : undefined
        }
        data-home-calm={homeCalm ? "" : undefined}
        data-arrival-immersion={
          arrivalNavImmersion && welcomeScene ? "" : undefined
        }
        data-home-state={
          homeArrival ? homeStateDataAttr(homeArrival.homeState) : undefined
        }
      >
        {!estatePlaceChromeActive ? (
        <CompanionSidebarPortal
          calmHome={homeCalm}
          navVisibility={arrivalNavVisibility}
        >
          <AppSidebar
            activeNav={activeNav}
            activeSection={activeSection}
            onNavSelect={handleNavSelect}
          />
        </CompanionSidebarPortal>
        ) : null}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {!estatePlaceChromeActive ? (
          <>
          <TopBar
            calmHome={homeCalm}
            navVisibility="normal"
            activeSection={activeSection}
            onOpenClearMyMind={() => openClearMyMindCore()}
            onOpenPlanMyDay={() => openPlanMyDayCore()}
            onOpenTodaysReality={() => openAdaptMyDayCore()}
            onEstateMenuAction={handleEstateMenuAction}
          />
          {!homeCalm && activeSection !== "plan-my-day" && !focusWorkflowSanctuary ? (
            <ActiveWorkspaceBar items={activeWorkspaceItems} />
          ) : null}
          </>
          ) : null}

          {showCompanionBackControl ? (
            <EstateImmersiveHomeLink
              label="Welcome Home"
              onClick={handleCompanionBack}
            />
          ) : null}

          {sparkEstateShellPlaceId ? (
            <div
              className={
                showDirectEstateOverlay
                  ? "pointer-events-auto absolute inset-0 z-20 flex min-h-0 min-w-0 flex-col"
                  : "relative flex min-h-0 min-w-0 flex-1 flex-col"
              }
            >
              <SparkEstateShell
                placeId={sparkEstateShellPlaceId}
                section={activeSection}
                profileEstateMode={sparkEstateShellProfileMode}
                backgroundImageOverride={
                  directEstateVisit?.backgroundImageOverride ?? null
                }
                welcomeMessage={profileEstateWelcomeMessage}
                conversationScrollKey={estateChatScrollKey}
                activityEngaged={estateConservatoryEngaged}
                conversationStarted={estateConversationStartedSinceVisit}
                onInvitationSelect={handleEstateRoomInvitationSelect}
                onConversationStart={handleEstateConversationStart}
                thread={
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What's on your mind?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    onShowEstateMap={revealWelcomeHomeEstateMap}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </div>
          ) : null}

          {(activeSection === "home" ||
            stablesPrimary ||
            momentumInstitutePrimary ||
            momentumBuilderPrimary) &&
            !profileEstateChromeActive &&
            !sparkEstateShellPlaceId && (
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {!welcomeHomePrimary ? (
              <WorkspaceDebugBanner
                workspacePanel={workspacePanel}
                chatLayoutMode={chatLayoutMode}
                workspaceActive={Boolean(
                  (workspacePanel && workspacePanel !== "welcome-room") ||
                    companionStandaloneSection ||
                    guideBesideSession,
                )}
                createMounted={workspacePanel === CREATE_PANEL_SECTION}
              />
              ) : null}
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
            ) : welcomeHomePrimary ? (
            <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              <WelcomeHomePage
                experience={welcomeHomeExperience}
                onIntroComplete={finishWelcomeHomeIntro}
                onIntroActiveChange={setWelcomeHomeIntroActive}
                welcomeMessage={todaysWelcomeOpening ? null : welcomeHomeDisplayMessage}
                showWelcomeLine={
                  !isLoading &&
                  Boolean(
                    todaysWelcomeOpening ||
                      (welcomeHomeVisibleMessages.length === 0 &&
                        welcomeHomeDisplayMessage),
                  )
                }
                welcomeSlot={
                  todaysWelcomeOpening && !isLoading ? (
                    dailyOpeningAdaptCheckIn ? (
                      <AdaptMyDayCheckIn
                        onBack={() => {
                          setDailyOpeningAdaptCheckIn(false);
                        }}
                        onUsePlan={finishAdaptMyDayToPlan}
                        onAdjustPlan={finishAdaptMyDayToPlan}
                        onStartFirstStep={finishAdaptMyDayToPlan}
                        onKeepCurrentPlan={() => {
                          markTodaysWelcomeDismissedThisSession();
                          setGlobalDailyOpening(null);
                          clearDailyOpeningSubViews();
                          openPlanMyDayCore();
                        }}
                      />
                    ) : dailyOpeningHelpfulLesson ? (
                      <TodaysWelcomeCard
                        mode="show-something-helpful"
                        lesson={dailyOpeningHelpfulLesson.lesson}
                        onShowMe={handleHelpfulLessonShowMe}
                        onSomethingElse={handleHelpfulLessonSomethingElse}
                        onMaybeLater={handleHelpfulLessonMaybeLater}
                      />
                    ) : dailyOpeningHelpMeChoose?.step === "needs" ? (
                      <TodaysWelcomeCard
                        mode="help-me-choose-needs"
                        needs={HELP_ME_CHOOSE_NEED_OPTIONS}
                        onSelectNeed={handleHelpMeChooseNeed}
                        onBackToToday={handleGlobalDailyBackToToday}
                      />
                    ) : dailyOpeningHelpMeChoose?.step === "support" ? (
                      <TodaysWelcomeCard
                        mode="help-me-choose-support"
                        prompt={dailyOpeningHelpMeChoose.prompt}
                        options={dailyOpeningHelpMeChoose.options}
                        onSelectSupport={handleHelpMeChooseSupport}
                        onBackToToday={handleGlobalDailyBackToToday}
                      />
                    ) : (
                      <TodaysWelcomeCard
                        mode="main"
                        greetingTitle={todaysWelcomeOpening.greetingTitle}
                        welcomeLine={todaysWelcomeOpening.welcomeLine}
                        choicesIntro={todaysWelcomeOpening.choicesIntro}
                        discoveryInviteLine={
                          todaysWelcomeOpening.discoveryInviteLine
                        }
                        welcomeMessage={todaysWelcomeOpening.welcomeMessage}
                        choiceCards={todaysWelcomeOpening.choiceCards}
                        discovery={todaysWelcomeOpening.discovery}
                        onSelect={handleGlobalDailyOpeningChoice}
                        onShowSomethingHelpful={handleShowSomethingHelpful}
                        onDiscoveryPrimary={handleGlobalDailyDiscoveryLearn}
                        onDiscoveryDismiss={handleGlobalDailyDiscoveryDismiss}
                      />
                    )
                  ) : undefined
                }
                showConversation={
                  welcomeHomeVisibleMessages.length > 0 || isLoading
                }
                conversationScrollKey={`${welcomeHomeVisibleMessages.length}-${isLoading ? 1 : 0}`}
                inputRef={inputRef}
                registerBack={registerBack}
                thread={
                  <>
                    <SimpleChat
                      messages={welcomeHomeVisibleMessages}
                      stateHint={stateHint}
                      showHint={false}
                      hideEmptyState
                      isLoading={isLoading}
                      thinkingMessage={visibleThinkingMessage}
                      awaitingUserConfirmation={chatAwaitingConfirmation}
                      thinkingEmotion={displayEmotion}
                      workspacePanel={workspacePanel}
                      workspaceActiveBeside={workspaceActiveBeside}
                      formatParagraphs={formatAssistantParagraphs}
                    />
                  </>
                }
                footer={
                  <HomeChatInputFooter
                    welcomeHome
                    homeCalm={false}
                    className={
                      todaysWelcomeOpening
                        ? "todays-welcome-card__input-secondary"
                        : undefined
                    }
                    homeChatPlaceholder={
                      todaysWelcomeOpening
                        ? GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER
                        : homeArrival?.chatPlaceholder
                    }
                    conversationMode={
                      homeArrival?.chrome.conversationInput ?? true
                    }
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    onShowEstateMap={revealWelcomeHomeEstateMap}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </main>
            ) : momentumBuilderPrimary ? (
            <main className="estate-room-main">
              <MomentumBuilderRoomPanel
                conversationScrollKey={estateChatScrollKey}
                onInvitationSelect={handleEstateRoomInvitationSelect}
                onConversationStart={handleEstateConversationStart}
                todaysPath={momentumBuilderRoomExperience?.todaysPath ?? null}
                celebrationKind={momentumBuilderRoomExperience?.celebration ?? null}
                thread={
                  <>
                    <SimpleChat
                      messages={messages}
                      stateHint={stateHint}
                      showHint={false}
                      hideEmptyState
                      isLoading={isLoading}
                      thinkingMessage={visibleThinkingMessage}
                      awaitingUserConfirmation={chatAwaitingConfirmation}
                      thinkingEmotion={displayEmotion}
                      workspacePanel={workspacePanel}
                      workspaceActiveBeside={workspaceActiveBeside}
                      formatParagraphs={formatAssistantParagraphs}
                      afterLastAssistant={undefined}
                    />
                  </>
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What's on your mind?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </main>
            ) : momentumInstitutePrimary ? (
            <main className="estate-room-main">
              <MomentumInstituteRoomPanel
                conversationScrollKey={estateChatScrollKey}
                onInvitationSelect={handleEstateRoomInvitationSelect}
                onConversationStart={handleEstateConversationStart}
                initialOpenDrawerId={instituteInitialDrawerId}
                onInstituteLearningChat={handleInstituteLearningChat}
                thread={
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What would you like to explore?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </main>
            ) : stablesPrimary ? (
            <main className="estate-room-main">
              <StablesRoomPanel
                conversationScrollKey={estateChatScrollKey}
                onInvitationSelect={handleEstateRoomInvitationSelect}
                onConversationStart={handleEstateConversationStart}
                onBackHome={navigateToChatCore}
                conversationStarted={estateConversationStartedSinceVisit}
                onStablesLearningChat={handleStablesLearningChat}
                thread={
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What's on your heart today?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </main>
            ) : (
            <main
              className={`flex h-full min-h-0 flex-1 flex-col overflow-hidden ${
                welcomeScene ? "companion-welcome-scene-main" : ""
              }`}
            >
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
              ) : welcomeScene && effectiveHomeArrival ? (
                <ArrivalLivingRoomExperience
                  arrival={effectiveHomeArrival}
                  input={input}
                  isLoading={isLoading}
                  isListening={isListening}
                  speechSupported={speechSupported}
                  inputRef={inputRef}
                  onInputChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onToggleListening={toggleListening}
                  onImmersionNav={setArrivalNavImmersion}
                  onWalkComplete={handleArrivalWalkComplete}
                  onStayAndChat={() => undefined}
                  onSend={(text) => void handleSend(text, false, false, true)}
                />
              ) : activeSection === "home" && !welcomeScene ? null : (
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
                recoveryLevel={
                  homeCalm
                    ? null
                    : recovery?.recoveryLevel ?? null
                }
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
                workspacePanel={workspacePanel}
                workspaceActiveBeside={workspaceActiveBeside}
                isThinking={Boolean(visibleThinkingMessage) && !homeCalm}
                thinkingMessage={visibleThinkingMessage}
                isListening={isListening && !homeCalm}
                isSpeaking={isTtsSpeaking && !homeCalm}
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

              {!welcomeScene ? (
              <div
                className="companion-homestead-chat__reading flex-1 overflow-y-auto px-4 sm:px-6"
              >
                {homeCalm && !welcomeScene ? (
                  <CompanionHomeCard
                    arrival={homeArrival}
                    onContinue={handleCompanionContinueOption}
                  />
                ) : null}
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
                  thinkingMessage={visibleThinkingMessage}
                  awaitingUserConfirmation={chatAwaitingConfirmation}
                  thinkingEmotion={displayEmotion}
                  workspacePanel={workspacePanel}
                  workspaceActiveBeside={workspaceActiveBeside}
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
                            toolObjectId={appFeatureNavOffer.objectId}
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
                            toolObjectId={workspaceObjectId(workspaceOffer.section)}
                            toolLabel={workspaceOffer.buttonLabel}
                            keepTalkingLabel="Stay Here"
                            secondaryObjectId={
                              workspaceOffer.secondary
                                ? workspaceObjectId(workspaceOffer.secondary.section)
                                : undefined
                            }
                            secondaryLabel={workspaceOffer.secondary?.buttonLabel}
                            onSecondaryAccept={
                              workspaceOffer.secondary
                                ? () =>
                                    acceptWorkspaceOffer({
                                      section: workspaceOffer.secondary!.section,
                                      buttonLabel:
                                        workspaceOffer.secondary!.buttonLabel,
                                      line: workspaceOffer.line,
                                    })
                                : undefined
                            }
                            onAccept={() =>
                              acceptWorkspaceOffer(workspaceOffer)
                            }
                            onDismiss={() => {
                              if (workspaceOffer) {
                                declineConversationOffer(
                                  declinedConversationOffersRef.current,
                                  workspaceOfferDeclineKey(workspaceOffer),
                                );
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
                            toolObjectId={assistedActionOffer.objectId}
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
                            toolObjectId={toolSuggestion.toolObjectId}
                            toolLabel={toolSuggestion.toolLabel}
                            keepTalkingLabel={toolSuggestion.keepTalkingLabel}
                            onAccept={() => acceptToolSuggestion(toolSuggestion)}
                            onDismiss={() => {
                              declineConversationOffer(
                                declinedConversationOffersRef.current,
                                toolSuggestionDeclineKey(toolSuggestion),
                              );
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
              ) : null}

              {error && !welcomeScene && !welcomeHomePrimary && (
                <p
                  className="px-4 pb-2 text-center text-base text-[#a85c4a]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {!welcomeScene ? (
              <footer className="shrink-0">
                {showHomeFloatingChat ? (
                  <HomeChatInputFooter
                    homeCalm={homeCalm}
                    homeChatPlaceholder={homeArrival?.chatPlaceholder}
                    conversationMode={
                      homeArrival?.chrome.conversationInput ?? false
                    }
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards={suppressInterventionCards}
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                ) : companionDeskVisible ? (
                  <div
                    className="companion-desk-scroll-spacer h-[clamp(18vh,20vh,22vh)]"
                    aria-hidden
                  />
                ) : null}
              </footer>
              ) : null}
            </main>
            )}
                workspace={workspacePanelNode}
                workspaceActive={Boolean(
                  (workspacePanel && workspacePanel !== "welcome-room") ||
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
                onReturnToChat={navigateToChatCore}
                viewSizePreset={effectiveViewSize}
                onViewSizePresetChange={workspacePanel === "visual-focus" ? undefined : applyViewSizePreset}
                onClose={
                  workspacePanel === "plan-my-day" || workspacePanel === "visual-focus" ? undefined : goBack
                }
                revealKey={workspaceRevealSeq}
                chatFocusKey={chatFocusSeq}
                workspaceFirst={workspaceFirstSplit}
                hideAssistToggle={
                  workspacePanel === "content-generator" ||
                  workspacePanel === "welcome-room" ||
                  workspacePanel === "visual-focus" ||
                  Boolean(guideBesideSession)
                }
                immersiveWorkspace={workspacePanel === "visual-focus"}
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
          {activeSection !== "home" && !momentumBuilderPrimary && !profileEstateChromeActive && (
            <div
              className={
                estateFullBleedShellActive
                  ? "clear-my-mind-standalone-shell min-h-[100dvh] min-h-[100svh] flex-1 overflow-hidden"
                  : "min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-4"
              }
              role="presentation"
              title={
                estateFullBleedShellActive
                  ? undefined
                  : "Click outside the panel to go back"
              }
              onClick={
                estateFullBleedShellActive
                  ? undefined
                  : (e) => {
                      if (e.target === e.currentTarget) goBack();
                    }
              }
            >
              <div
                className={
                  estateFullBleedShellActive
                    ? "clear-my-mind-standalone-frame h-full min-h-[100dvh] min-h-[100svh] w-full"
                    : WORKSPACE_FULL_PAGE_SURFACE_CLASS
                }
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
              key={brainDumpPanelKey}
              standalone
              initialView={brainDumpInitialView}
              onOpen={openWorkspaceFromSection}
              onSuggestOpen={suggestCrossWorkspaceOpen}
              onContextChange={handleWorkspaceDetailChange}
              onVisualizeThis={openSparkVisualEngineFromExperience}
              onBackToChat={goBackToChat}
            />
          )}

          {activeSection === "visual-focus" && !showDirectEstateOverlay && (
            <EstateRoomErrorBoundary
              roomLabel="Cartographer's Studio"
              onReturnToEstate={navigateBackToEstateHome}
            >
              <VisualFocusWorkspacePanel
                onBack={navigateToChatCore}
                onClose={navigateToChatCore}
                registerBack={registerBack}
                onReturnToEstate={navigateBackToEstateHome}
              />
            </EstateRoomErrorBoundary>
          )}

          {activeSection === "life-experience" && (
            <LifeExperienceRoomPanel onBackToChat={navigateToChatCore} />
          )}

          {activeSection === "the-gallery" && (
            <GalleryExperiencePanel
              onBackToChat={navigateToChatCore}
              onOpenSection={(section, nav) =>
                openSectionBesideChatCore(section, nav, { userInitiated: true })
              }
            />
          )}

          {activeSection === "destination-gallery" && (
            <EstateRoomErrorBoundary
              roomLabel="Destination Gallery"
              onReturnToEstate={navigateBackToEstateHome}
            >
              <DestinationGalleryPanel
                onBack={navigateBackToEstateHome}
                onReturnToEstate={navigateBackToEstateHome}
                onSelectCrystal={handleSelectDestinationCrystal}
                prepared={destinationCrystalPrepared}
                onClearPrepared={() => setDestinationCrystalPrepared(null)}
                exportText={
                  [...messages]
                    .reverse()
                    .find((m) => m.role === "assistant")?.content ?? ""
                }
                exportTitle="Spark work"
                onOpenConnections={() => openHowDoISettings("connections")}
              />
            </EstateRoomErrorBoundary>
          )}

          {activeSection === "adapt-plan-my-day" && (
            <PlanAdaptSharedWindow
              onBack={goBack}
              registerBack={registerBack}
              initialChild={planAdaptSharedChild}
            />
          )}

          {activeSection === "plan-my-day" && (
            <PlanMyDayPanel
              standalone
              onBack={goBack}
              onOpenSettings={() => openHowDoISettings("planning")}
              onStartFocus={() => {
                openStandaloneFocusSectionCore("focus-timer");
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
              onOpenProjects={() => openSectionBesideChatCore("projects", "projects")}
              onOpenCalendar={() => openCalendarCore()}
              onOpenAppointment={(appointmentId) =>
                openCalendarItemCore(appointmentId, "planning-calendar")
              }
              initialOpenItemId={planMyDayOpenItemId}
              initialPlanningArea={planMyDayInitialArea}
              initialRhythmsTab={planMyDayInitialRhythmsTab}
            />
          )}

          {activeSection === "reminders-rhythms" && (
            <RemindersRhythmsEntrancePanel
              onBack={goBack}
              registerBack={registerBack}
              initialChild={remindersRhythmsSharedChild}
            />
          )}

          {activeSection === "reminders" && (
            <RemindersRoomPanel onBack={goBack} registerBack={registerBack} />
          )}

          {activeSection === "rhythms" && (
            <RhythmsRoomPanel onBack={goBack} registerBack={registerBack} />
          )}

          {activeSection === "calendar" && (
            <CalendarRoomPanel
              onBack={goBack}
              registerBack={registerBack}
              onOpenPlanItem={(itemId) =>
                openCalendarItemCore(itemId, "calendar-room")
              }
              onOpenAppointment={(appointmentId) =>
                openCalendarItemCore(appointmentId, "calendar-room")
              }
            />
          )}

          {activeSection === "parking-lot" && (
            <ParkingLotRoomPanel onBack={goBack} registerBack={registerBack} />
          )}

          {activeSection === "grow" && (
            <GrowLandingPanel
              onBack={goBack}
              onOpenSection={(section) => openGrowSectionCore(section)}
            />
          )}

          {activeSection === "chamber-project-entry" && (
            <ChamberProjectEntryPanel
              onBack={openChamberOfMomentumCore}
              onOpenProject={openChamberProjectWorkspaceCore}
            />
          )}

          {activeSection === "chamber-of-momentum" && (
            <EstateRoomErrorBoundary
              roomLabel="The Chamber"
              onReturnToEstate={navigateBackToEstateHome}
            >
              <ChamberOfMomentumRoomPanel
                onBack={navigateBackToEstateHome}
                activeMemberId={activeChamberMemberId}
                onInviteMember={inviteChamberMemberCore}
                onEndMemberConversation={endChamberMemberConversationCore}
                conversationScrollKey={estateChatScrollKey}
                thread={
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What would you like to work on together?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </EstateRoomErrorBoundary>
          )}

          {activeSection === "boardroom" && (
            <EstateRoomErrorBoundary
              roomLabel="Round Table Boardroom"
              onReturnToEstate={navigateBackToEstateHome}
            >
              <BoardroomRoomPanel
                key={boardroomEntryKey}
                entryIntent={boardroomEntryIntent}
                onBack={navigateBackToEstateHome}
                shariChatOpen={boardroomShariChatOpen}
                onToggleShariChat={setBoardroomShariChatOpen}
                conversationScrollKey={estateChatScrollKey}
                thread={
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What would you like to talk through?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </EstateRoomErrorBoundary>
          )}

          {activeSection === "project-homes" && (
            <EstateRoomErrorBoundary
              roomLabel="Project Homes"
              onReturnToEstate={navigateBackToEstateHome}
            >
              <ProjectHomesPrototypePanel
                onBack={navigateBackToEstateHome}
                chatVisible={roomMenuChatVisible}
                conversationScrollKey={estateChatScrollKey}
                thread={
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                }
                footer={
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What would you like to work on in this project?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                }
              />
            </EstateRoomErrorBoundary>
          )}

          {activeSection === "grow-spark-cards" && !showDirectEstateOverlay && (
            <GrowPlaceholderPanel
              section="grow-spark-cards"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "grow-guilds" && (
            <GrowPlaceholderPanel
              section="grow-guilds"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "grow-daily-discoveries" && (
            <GrowPlaceholderPanel
              section="grow-daily-discoveries"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "grow-business-history" && (
            <GrowPlaceholderPanel
              section="grow-business-history"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "grow-observatory" && (
            <GrowPlaceholderPanel
              section="grow-observatory"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "growth" && (
            <GrowthStoryLandingPanel
              onBack={goBack}
              onOpenJournal={() => openGrowthDestinationCore("growth-journal")}
              onOpenCapture={openGrowthCaptureCore}
              onOpenMilestones={() => openGrowthDestinationCore("wins-this-week")}
              onOpenStorybook={openGrowthReportsCore}
            />
          )}

          {activeSection === "growth-capture" && (
            <GrowthStoryCapturePanel
              nav={{
                onBack: goBack,
                backLabel: workspacePanelBackLabel,
              }}
            />
          )}

          {activeSection === "growth-greenhouse" && !showDirectEstateOverlay && (
            <EstateCollectionRoomPanel
              roomId="greenhouse"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "growth-library" && !showDirectEstateOverlay && (
            <EstateCollectionRoomPanel
              roomId="achievement-library"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "growth-reports" && !showDirectEstateOverlay && (
            <EstateCollectionRoomPanel
              roomId="celebration-hall"
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
            />
          )}

          {activeSection === "user-memory" && !showDirectEstateOverlay && (
            <MemoryLibraryPage
              onBack={goBack}
              backLabel={workspacePanelBackLabel}
              initialTab={memoryLibraryTab}
            />
          )}

          {activeSection === "growth-journal" &&
            !showDirectEstateOverlay && (
            <GrowthJournalRoomPanel
              nav={buildGrowthPanelNav("growth-journal")}
              chatVisible={roomMenuChatVisible}
              onVisualizeThis={openSparkVisualEngineFromExperience}
              conversationScrollKey={estateChatScrollKey}
              thread={
                <SimpleChat
                  messages={messages}
                  stateHint={stateHint}
                  showHint={false}
                  hideEmptyState
                  isLoading={isLoading}
                  thinkingMessage={visibleThinkingMessage}
                  awaitingUserConfirmation={chatAwaitingConfirmation}
                  thinkingEmotion={displayEmotion}
                  workspacePanel={workspacePanel}
                  workspaceActiveBeside={workspaceActiveBeside}
                  formatParagraphs={formatAssistantParagraphs}
                  afterLastAssistant={undefined}
                />
              }
              footer={
                <HomeChatInputFooter
                  homeCalm={false}
                  homeChatPlaceholder="Share a thought when you're ready."
                  conversationMode
                  input={input}
                  isLoading={isLoading}
                  isListening={isListening}
                  speechSupported={speechSupported}
                  inputRef={inputRef}
                  onInputChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onToggleListening={toggleListening}
                  onSend={(text) => void handleSend(text)}
                  pendingAction={pendingAction}
                  suppressInterventionCards
                  onRunArtifactExport={runArtifactExport}
                  onClearPendingOffers={clearAllPendingOffers}
                  onDismissOfferKeepTalking={dismissOfferKeepTalking}
                  onExecutePendingAction={executePendingAction}
                  splitCreateBuilder={splitCreateBuilder}
                  createBuilderSession={createBuilderSession}
                  onCreateBuilderAction={handleCreateBuilderAction}
                  voiceOutput={voiceOutput}
                  voiceBlocked={voiceBlocked}
                  onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                  onVoiceBlockedReset={() => setVoiceBlocked(false)}
                  ttsAudioRef={ttsAudioRef}
                />
              }
            />
          )}

          {activeSection === "growth-portfolio" &&
            !showDirectEstateOverlay &&
            !profileEstateRoomOverlayId && (
            <GrowthPortfolioPanel
              nav={buildGrowthPanelNav("growth-portfolio")}
            />
          )}

          {activeSection === "wins-this-week" && !showDirectEstateOverlay && (
            <EstateCollectionRoomPanel
              roomId="celebration-garden"
              nav={buildGrowthPanelNav("wins-this-week")}
            />
          )}

          {activeSection === "evidence-bank" &&
            !showDirectEstateOverlay && (
            <EvidenceVaultRoomPanel
              nav={buildGrowthPanelNav("evidence-bank")}
              arrivalKey={evidenceVaultArrivalKey}
              chatVisible={roomMenuChatVisible}
              conversationScrollKey={estateChatScrollKey}
              thread={
                <SimpleChat
                  messages={messages}
                  stateHint={stateHint}
                  showHint={false}
                  hideEmptyState
                  isLoading={isLoading}
                  thinkingMessage={visibleThinkingMessage}
                  awaitingUserConfirmation={chatAwaitingConfirmation}
                  thinkingEmotion={displayEmotion}
                  workspacePanel={workspacePanel}
                  workspaceActiveBeside={workspaceActiveBeside}
                  formatParagraphs={formatAssistantParagraphs}
                  afterLastAssistant={undefined}
                />
              }
              footer={
                <HomeChatInputFooter
                  homeCalm={false}
                  homeChatPlaceholder="What discovery would you like to preserve?"
                  conversationMode
                  input={input}
                  isLoading={isLoading}
                  isListening={isListening}
                  speechSupported={speechSupported}
                  inputRef={inputRef}
                  onInputChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onToggleListening={toggleListening}
                  onSend={(text) => void handleSend(text)}
                  pendingAction={pendingAction}
                  suppressInterventionCards
                  onRunArtifactExport={runArtifactExport}
                  onClearPendingOffers={clearAllPendingOffers}
                  onDismissOfferKeepTalking={dismissOfferKeepTalking}
                  onExecutePendingAction={executePendingAction}
                  splitCreateBuilder={splitCreateBuilder}
                  createBuilderSession={createBuilderSession}
                  onCreateBuilderAction={handleCreateBuilderAction}
                  voiceOutput={voiceOutput}
                  voiceBlocked={voiceBlocked}
                  onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                  onVoiceBlockedReset={() => setVoiceBlocked(false)}
                  ttsAudioRef={ttsAudioRef}
                />
              }
            />
          )}

          {activeSection === "confidence-vault" && !showDirectEstateOverlay && (
            <ConfidenceVaultPanel nav={buildGrowthPanelNav("confidence-vault")} />
          )}

          {activeSection === "my-journey" && !showDirectEstateOverlay && (
            <MyJourneyPanel nav={buildGrowthPanelNav("my-journey")} />
          )}

          {activeSection === "focus-audio" && !showDirectEstateOverlay && (
            <FocusAudioPanel
              emotion={displayEmotion}
              initialCategory={focusAudioCategory ?? undefined}
              arrivalActive={peacefulPlacesArrivalActive}
              onArrivalComplete={() => setPeacefulPlacesArrivalActive(false)}
              onLaunchActivity={handlePeacefulPlacesGardenActivity}
              onLaunchSection={handlePeacefulPlacesGardenSection}
              onDone={() => {
                setFocusAudioCategory(null);
                setPeacefulPlacesArrivalActive(false);
                navigateToChatCore();
              }}
            />
          )}

          {activeSection === "focus" &&
          activitySession.phase !== "browse" &&
          activitySession.activityId &&
          !isGuidedExerciseActivity(activitySession.activityId) ? (
            <FocusMyBrainRoomShell floatingWorkflow>
              <CompanionActivitiesPanel
                sanctuary
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
            </FocusMyBrainRoomShell>
          ) : activeSection === "focus" ? (
            <FocusAreaPanel standalone onAction={handleFocusHubAction} />
          ) : null}

          {activeSection === "time-block" && (
            <LegacyMomentumAppointmentRedirect
              onRedirect={() =>
                openCalendarItemCore(timeBlockFocusId, "deep-link")
              }
            />
          )}

          {activeSection === "guided-exercises" &&
          (focusWorkflowSanctuary ? (
            <FocusMyBrainRoomShell floatingWorkflow>
              <CompanionActivitiesPanel
                sanctuary
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
            </FocusMyBrainRoomShell>
          ) : (
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
          ))}

          {activeSection === "spin-wheel" && (
            <SpinWheelPanel
              autoSpinWhenReady={spinWheelAutoSpin}
              onAutoSpinStarted={() => setSpinWheelAutoSpin(false)}
              onOpen={suggestCrossWorkspaceOpen}
              onAsk={handlePlaybookAsk}
              onBack={goBack}
            />
          )}

          {(activeSection === "games" || activeSection === "quick-recharge") &&
            !showDirectEstateOverlay && (
            <MomentumGamesRoomShell>
              <MomentumBuildersPanel
                variant="quick-recharge"
                panelTitle="Quick Recharge"
                panelIntro="Simple activities for when your brain needs a reset."
                backDestination="Quick Recharge"
                menuBackDestination="Focus"
                onLaunchExternal={handleMomentumBuilderLaunch}
                onReturnHome={goBack}
              />
            </MomentumGamesRoomShell>
          )}

          {activeSection === "business-profile" && (
            <BusinessProfilePanel
              onDone={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
              onOpenAvatars={() => openProfileDestinationCore("people-i-help")}
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

          {activeSection === "projects" && !showDirectEstateOverlay && (
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
                onVisualizeThis={openSparkVisualEngineFromExperience}
                onPreviewProjectHomes={openProjectHomesPrototypeCore}
              />
            </WorkspaceShell>
          )}

          {activeSection === "playbook" &&
            renderStrategyLibraryEstate({ registerBack })}

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
              openPlanMyDayCore({ itemId: itemId ?? null });
            }}
          />

          <ModalSheet
            portaled={portaledModalSheets}
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
            portaled={portaledModalSheets}
            open={overlay === "settings"}
            onClose={() => {
              setOverlay(null);
              setSettingsSection(null);
              setActiveNav((nav) => (nav === "settings" ? "chat" : nav));
            }}
            title="Settings"
            theme="estate-dark"
          >
            <SettingsPanel
              onSignIn={openSignIn}
              initialSection={settingsSection}
              registerBack={registerBack}
              onBeginNewDay={requestBeginNewDayFromSettings}
            />
          </ModalSheet>

          <ModalSheet
            portaled={portaledModalSheets}
            open={overlay === "whats-new"}
            onClose={() => setOverlay(null)}
            title="What's New"
          >
            <WhatsNewPanel />
          </ModalSheet>

          <ModalSheet
            portaled={portaledModalSheets}
            open={overlay === "institute-cabinet"}
            onClose={() => setOverlay(null)}
            title="My Institute Cabinet"
          >
            <InstituteCabinetPanel />
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

      {workspacePanel === "welcome-room" ? (
        <WelcomeRoomPanel
          onBackToChat={leaveWelcomeRoom}
          onContinue={leaveWelcomeRoom}
          registerBack={registerBack}
        />
      ) : null}

      <SparkEstateGuideChrome
        visible={showSparkEstateGuideChrome}
        flipbookOpen={estateGuideFlipbookOpen}
        onOpen={openSparkEstateGuideCore}
        onClose={() => setEstateGuideFlipbookOpen(false)}
      />
      <SparkNoteChrome
        visible={showSparkNoteChrome}
        firstName={getPrefs().name || null}
        birthday={getRecognitionStore().birthday}
        personalDates={getRecognitionStore().personalDates}
        memberSinceIso={getMemberSinceIso()}
      />
      <EstateTopRightChrome
        showProfile={showGlobalEstateMenu}
        showRoom={showEstateExperienceMenu}
        roomId={roomMenuRoomId}
        chatVisible={roomMenuChatVisible}
        backdropSurface={
          activeSection === "brain-dump" || isClearMyMindModeActive()
            ? "clear-my-mind"
            : "chat"
        }
        onEstateMenuAction={handleEstateMenuAction}
        onToggleChat={toggleEstateRoomChat}
        onToggleSound={
          justBeHereSession ? toggleJustBeHereSound : undefined
        }
        soundEnabled={
          justBeHereSession ? justBeHereSoundEnabled : undefined
        }
        onBackToEstate={navigateBackToEstateHome}
        onExploreSpark={
          clearMyMindWorkspaceActive
            ? undefined
            : () => {
                openExploreSparkVisualExplorer();
              }
        }
        onOpenSparkEstateGuide={() => openSparkEstateGuideCore()}
        onReturnToExploreEstate={
          exploreEstateReturnAvailable
            ? () => {
                setExploreEstateReturnAvailable(false);
                openExploreSparkVisualExplorer();
              }
            : undefined
        }
        onOpenAdaptPlanMyDay={() => openPlanAdaptSharedCore(null)}
        onOpenPlanMyDay={() => openPlanAdaptSharedCore("plan")}
        onOpenAdaptMyDay={() => openPlanAdaptSharedCore("adapt")}
        onOpenRemindersRhythms={() => openRemindersRhythmsCore(null)}
        onOpenRhythms={() => openRemindersRhythmsCore("rhythms")}
        onOpenReminders={() => openRemindersRhythmsCore("reminders")}
        onOpenCalendar={() => openCalendarCore()}
        onOpenProjects={() => openProjectHomesPrototypeCore()}
        onOpenClearMyMind={() => openClearMyMindCore()}
        onOpenParkingLot={() => openParkingLotCore()}
        onOpenSpinTheWheel={() => openStandaloneFocusSectionCore("spin-wheel")}
        onOpenDestinationGallery={() => openDestinationGalleryCore()}
        onOpenCartographersStudio={() => openCartographersStudioCore()}
        onOpenEvidenceVault={() =>
          enterEvidenceVaultRoomCore({ userIntent: "room-menu:evidence-vault" })
        }
        onOpenHallOfAccomplishments={() =>
          openGrowthDestinationCore("growth-portfolio")
        }
        onOpenJournal={() => openGrowthDestinationCore("growth-journal")}
        onOpenChamber={() => openChamberOfMomentumCore()}
        onOpenBoardroom={() => openBoardroomCore()}
        onOpenStrategyLibrary={() => openStrategyLibraryCore()}
        onOpenBreathe={() => openBreatheOverlayCore()}
        onOpenPeacefulPlaces={() => openPeacefulPlacesCore({ animate: true })}
        onOpenSoundscapes={() => setSoundscapeSelectionOpen(true)}
      />

      <GlobalOverlayHost>
        <ExperienceControlsOverlay
          open={experienceControlsOpen}
          onClose={() => setExperienceControlsOpen(false)}
          roomId={roomMenuRoomId ?? "welcome-home"}
          chatVisible={roomMenuChatVisible}
          onSetChatVisible={setEstateRoomChatVisiblePreserving}
          onOpenNotifications={() => {
            setExperienceControlsOpen(false);
            handleEstateMenuAction("notifications");
          }}
        />
      </GlobalOverlayHost>

      <SoundscapeSelectionOverlay
        open={soundscapeSelectionOpen}
        onClose={() => setSoundscapeSelectionOpen(false)}
        onPlay={(track) => {
          void playExperienceSoundscapeTrack(track);
        }}
      />

      {!roomMenuChatVisible && !experienceControlsOpen ? (
        <button
          type="button"
          className="conversation-visibility-chip"
          data-testid="show-conversation-chip"
          onClick={() => setEstateRoomChatVisiblePreserving(true)}
        >
          Show Conversation
        </button>
      ) : null}

      <ProfileDestinationHost
        destination={
          isProfileDestinationOverlay(overlay) ? overlay : null
        }
        growthProfileEmphasizeTimeline={growthProfileEmphasizeTimeline}
        onClose={goBack}
        onOpenEstatePlace={handleEstateMenuAction}
        onOpenPeopleIHelp={() => openProfileDestinationCore("people-i-help")}
        onOpenSettings={(section) => {
          setSettingsSection(section ?? null);
          setOverlay("settings");
        }}
        onOpenExperienceControls={() => setExperienceControlsOpen(true)}
      />

      {guidedFieldHelpChatOpen
        ? createPortal(
            <div
              className="guided-field-help-chat"
              data-testid="guided-field-help-chat"
              role="dialog"
              aria-modal="true"
              aria-label="Shari help"
            >
              <div className="guided-field-help-chat__panel">
                <header className="guided-field-help-chat__header">
                  <div>
                    <p className="guided-field-help-chat__title">
                      Talk with Shari
                    </p>
                    <p className="guided-field-help-chat__sub">
                      Your Business Estate draft stays open behind this — nothing
                      is saved until you choose.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="guided-field-help-chat__close"
                    data-testid="guided-field-help-chat-close"
                    onClick={() => closeGuidedFieldHelpChat()}
                  >
                    Back to your profile
                  </button>
                </header>
                <div className="guided-field-help-chat__thread">
                  <SimpleChat
                    messages={messages}
                    stateHint={stateHint}
                    showHint={false}
                    hideEmptyState
                    isLoading={isLoading}
                    thinkingMessage={visibleThinkingMessage}
                    awaitingUserConfirmation={chatAwaitingConfirmation}
                    thinkingEmotion={displayEmotion}
                    workspacePanel={workspacePanel}
                    workspaceActiveBeside={workspaceActiveBeside}
                    formatParagraphs={formatAssistantParagraphs}
                    afterLastAssistant={undefined}
                  />
                </div>
                <div className="guided-field-help-chat__footer">
                  <HomeChatInputFooter
                    homeCalm={false}
                    homeChatPlaceholder="What would help most right now?"
                    conversationMode
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={(text) => void handleSend(text)}
                    pendingAction={pendingAction}
                    suppressInterventionCards
                    onRunArtifactExport={runArtifactExport}
                    onClearPendingOffers={clearAllPendingOffers}
                    onDismissOfferKeepTalking={dismissOfferKeepTalking}
                    onExecutePendingAction={executePendingAction}
                    splitCreateBuilder={splitCreateBuilder}
                    createBuilderSession={createBuilderSession}
                    onCreateBuilderAction={handleCreateBuilderAction}
                    voiceOutput={voiceOutput}
                    voiceBlocked={voiceBlocked}
                    onToggleVoiceOutput={() => setVoiceOutput((v) => !v)}
                    onVoiceBlockedReset={() => setVoiceBlocked(false)}
                    ttsAudioRef={ttsAudioRef}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <BreatheDestinationHost
        destination={breatheDestination}
        resumeActive={breatheResumeActive}
        onDone={() => closeBreatheOverlayCore({ resume: true })}
        onContinueChat={() => closeBreatheOverlayCore({ goChat: true })}
        onReturnPrevious={() => closeBreatheOverlayCore({ resume: true })}
        onJournalThis={() => closeBreatheOverlayCore({ goJournal: true })}
      />

      <EstateMapFullScreen
        open={exploreSparkMapOpen}
        onClose={() => returnToWelcomeHomeLobby("explore estate fold")}
        onReturnToEstate={() =>
          returnToWelcomeHomeLobby("explore estate return")
        }
        locations={getExploreSparkMapLocations()}
        currentLocationId={exploreMapLocationIdForPlaceId(
          roomMenuRoomId ??
            getEstateMemory().currentRoom?.entryId ??
            undefined,
        )}
        onSelectLocation={handleExploreSparkMapSelect}
      />
    </div>
    </CompanionDeskProvider>
  );
}
