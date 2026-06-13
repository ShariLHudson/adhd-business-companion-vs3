"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppSidebar } from "@/components/companion/AppSidebar";
import { AdjustMyDayPanel } from "@/components/companion/AdjustMyDayPanel";
import { BrainDumpPanel } from "@/components/companion/BrainDumpPanel";
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
import { GamesPanel } from "@/components/companion/GamesPanel";
import { SpinWheelPanel } from "@/components/companion/SpinWheelPanel";
import { FocusAudioPanel } from "@/components/companion/FocusAudioPanel";
import { FocusTimerPanel } from "@/components/companion/FocusTimerPanel";
import { IdentityBar } from "@/components/companion/IdentityBar";
import { ProfilePanel } from "@/components/companion/ProfilePanel";
import { ModalSheet } from "@/components/companion/ModalSheet";
import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { CompanionSignInFromQuery } from "@/components/companion/CompanionSignInFromQuery";
import { CompanionAuthGate } from "@/components/companion/CompanionAuthGate";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { hasUserOnboarded } from "@/lib/companionOnboarding";
import { EmailGeneratorPanel } from "@/components/companion/EmailGeneratorPanel";
import { SnippetsLibrary } from "@/components/companion/SnippetsLibrary";
import { BusinessProfilePanel } from "@/components/companion/BusinessProfilePanel";
import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { OnboardingFlow } from "@/components/companion/OnboardingFlow";
import { ContentTypesPanel } from "@/components/companion/ContentTypesPanel";
import {
  ContentGeneratorPanel,
  type GenSeed,
} from "@/components/companion/ContentGeneratorPanel";
import { ProjectsPanel } from "@/components/companion/ProjectsPanel";
import { SettingsPanel } from "@/components/companion/SettingsPanel";
import { TemplatesLibrary } from "@/components/companion/TemplatesLibrary";
import { SavedWorkLibrary } from "@/components/companion/SavedWorkLibrary";
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
import { TimeBlockPanel } from "@/components/companion/TimeBlockPanel";
import { TimeBlockTrigger } from "@/components/companion/TimeBlockTrigger";
import { TopBar } from "@/components/companion/TopBar";
import { SimpleChat } from "@/components/companion/SimpleChat";
import { ToolSuggestionCard } from "@/components/companion/ToolSuggestionCard";
import { PendingActionBar } from "@/components/companion/PendingActionBar";
import { FounderActionBar } from "@/components/companion/FounderActionBar";
import { ArtifactActionBar } from "@/components/companion/ArtifactActionBar";
import { ActionBridgeChip } from "@/components/companion/ActionBridgeChip";
import { WorkspaceLayout } from "@/components/companion/WorkspaceLayout";
import {
  type ChatLayoutMode,
  shouldOpenBesideChat,
} from "@/lib/workspaceNav";
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
  trackStarterChip,
  type StarterChipId,
} from "@/lib/starterChipAnalytics";
import {
  suggestSupportTool,
  toolOfferHintForChat,
  type ToolSuggestion,
} from "@/lib/companionToolSuggestions";
import {
  buildCompanionIntelligence,
  intelligenceHintForChat,
  shouldDeferToolsFromIntelligence,
} from "@/lib/companionIntelligence";
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
  isWorkspaceOpen,
  scrubFalseWorkspaceClaims,
  workspaceOpenAckVerified,
  workspaceVerificationHint,
  type WorkspaceOpenSnapshot,
} from "@/lib/workspaceExecution";
import {
  trackToolSuggestionAccepted,
  trackToolSuggestionDismissed,
  trackToolSuggestionOffered,
} from "@/lib/toolSuggestionAnalytics";
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
  detectAssistantToolLaunch,
  detectStandaloneToolRequest,
  standaloneToolAck,
} from "@/lib/standaloneToolRouting";
import {
  detectOpenSectionRequest,
  matchesPendingAcceptance,
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
  resolveWorkspaceCoachTurn,
  resolveWorkspaceEnergy,
  shouldSuppressWorkspaceOffer,
  type WorkspaceFieldId,
  type WorkspacePanelDetail,
} from "@/lib/workspaceAwareness";
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
  clearCreateSession,
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
  searchSavedWork,
  type SavedWorkItem,
} from "@/lib/savedWorkStore";
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
  type AppSection,
  type SidebarNavId,
  type SidebarToolId,
} from "@/lib/companionUi";
import { type CoachingMode } from "@/lib/companionPrompt";
import {
  blockDateTime,
  clearConversation,
  createTemplate,
  dayStateSummary,
  getDayState,
  getPrefs,
  getOutputLanguageContext,
  savePrefs,
  getLastActivity,
  setLastActivity,
  clearLastActivity,
  type LastActivity,
  getTimeBlocks,
  loadConversation,
  saveConversation,
  setBlockStatus,
  snoozeBlock,
  todayStr,
  logMomentum,
  businessContextSummary,
  getVoiceStatus,
  addVoiceSeconds,
  type TimeBlock,
} from "@/lib/companionStore";
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
  if (block.energy === "low") {
    return `It's time for "${block.title}". This might feel heavy right now — want to start with 2 minutes of easing in?`;
  }
  if (block.energy === "high") {
    return `It's time for "${block.title}". Perfect timing — want to jump straight in?`;
  }
  return `It's time for "${block.title}". Want to take the first small step together?`;
}

function formatAssistantParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const CHAT_STARTER_PHRASES = [
  /^i'?m feeling overwhelmed\.?$/i,
  /^what should i work on\??$/i,
  /^help me write something\.?$/i,
];

function shouldSaveChatActivity(userText: string): boolean {
  if (userText.trim().length < 20) return false;
  if (CHAT_STARTER_PHRASES.some((p) => p.test(userText.trim()))) return false;
  if (loadCreateSession()?.genSeed.draft?.trim()) return false;
  const prev = getLastActivity();
  if (prev?.kind === "draft" && prev.ts) {
    const age = Date.now() - new Date(prev.ts).getTime();
    if (age < 24 * 60 * 60 * 1000) return false;
  }
  return true;
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

export default function CompanionPage() {
  const [activeSection, setActiveSection] = useState<AppSection>("home");
  const [activeNav, setActiveNav] = useState<SidebarNavId>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  // True once we've restored any saved conversation from localStorage.
  // Gates the autosave effect so we never overwrite a saved chat with [].
  const [hydrated, setHydrated] = useState(false);
  const [hasChatted, setHasChatted] = useState(false);
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

  const isIdle = !messages.some((m) => m.role === "user");

  const liveEmotion = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const signal = input.trim() || lastUser?.content || "";
    return detectEmotionalState(signal);
  }, [input, messages]);

  const displayEmotion = isIdle ? liveEmotion : emotion;
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

  // Restore a saved conversation on first load (crash / reload insurance).
  useEffect(() => {
    const saved = loadConversation();
    if (saved && saved.length > 0) {
      setMessages(saved);
    }
    setHasChatted(getPrefs().hasChatted);
    setHydrated(true);
    trackUserRegisteredOnce();
    trackUserActiveSession();
    void reconcileUserIntelligenceWithServer(userIntelligenceEngine.getCounts());
  }, []);

  // Block legacy Command Center section for end users (founder/admin workspace only).
  useEffect(() => {
    if (activeSection === "progress") {
      setActiveSection("home");
      setActiveNav("chat");
    }
  }, [activeSection]);

  // Local-first autosave: persist the conversation whenever it changes, but
  // only after hydration so we don't clobber a saved chat with the empty
  // initial state.
  useEffect(() => {
    if (!hydrated) return;
    saveConversation(messages);
  }, [messages, hydrated]);

  // Universal back navigation — remembers the section you came from so every
  // screen has a way out (falls back to the chat/home dashboard).
  const sectionHistoryRef = useRef<AppSection[]>([]);
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

  // Settings / Profile / Sign-in open as modal sheets on top of the app (not pages).
  const [overlay, setOverlay] = useState<
    null | "settings" | "profile" | "signin"
  >(null);
  const { configured: authConfigured, user } = useCompanionAuth();
  const openSignIn = useCallback(() => setOverlay("signin"), []);

  // Voice output — Shari speaks her replies (ElevenLabs).
  const [voiceOutput, setVoiceOutput] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const openSetup = useCallback(() => setShowOnboarding(true), []);
  const needsSetup = !hasUserOnboarded(user?.id);

  // Continue card — the home "you were working on…" memory re-entry.
  const [lastAct, setLastAct] = useState<LastActivity | null>(null);
  const [projectContinueId, setProjectContinueId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    setLastAct(getLastActivity());
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
  const [assistedActionOffer, setAssistedActionOffer] =
    useState<AssistedAction | null>(null);
  const [artifactExportOffer, setArtifactExportOffer] =
    useState<ArtifactExportOffer | null>(null);
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
  const [googleWorkspace, setGoogleWorkspace] =
    useState<GoogleWorkspaceSession | null>(null);
  const googleWorkspaceRef = useRef<GoogleWorkspaceSession | null>(null);
  googleWorkspaceRef.current = googleWorkspace;
  const [doItNowOffer, setDoItNowOffer] = useState<DoItNowOffer | null>(null);
  const [physicalActionWaiting, setPhysicalActionWaiting] = useState(false);
  const [workspacePanel, setWorkspacePanelState] = useState<AppSection | null>(
    null,
  );
  const workspacePanelRef = useRef<AppSection | null>(null);
  const workspaceRevealSeqRef = useRef(0);
  const activeSectionRef = useRef<AppSection>("home");
  activeSectionRef.current = activeSection;
  const [chatLayoutMode, setChatLayoutMode] =
    useState<ChatLayoutMode>("split");
  const patchWorkspacePanel = useCallback((next: AppSection | null) => {
    workspacePanelRef.current = next;
    setWorkspacePanelState((prev) => {
      if (prev === next) return prev;
      dbgWorkspace("setWorkspacePanel", { from: prev, to: next });
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
    upsertDocumentMetadata({
      title: session.title,
      type: session.artifactType,
      googleUrl: session.url,
      googleFileId: session.fileId,
      googleKind: session.kind,
      projectId: savedArtifactRef.current?.projectId,
      projectName: savedArtifactRef.current?.projectName,
    });
    patchWorkspacePanel("google-workspace");
    setActiveSection("home");
    activeSectionRef.current = "home";
    setChatLayoutMode("split");
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

  function openCollaborativeDocument(
    kind: GoogleFileKind,
    topic?: string,
    userText?: string,
  ) {
    const requestText = userText ?? lastUserTextRef.current;
    setPreferredGoogleExportKind(kind);
    setCreateExportReady(false);
    const itemType = itemTypeForCollaborativeKind(kind, topic, requestText);
    const title = titleForCollaborativeDocument(requestText, topic, itemType);
    const scaffold = collaborativeScaffoldForType(itemType, topic);
    openCreationWorkspace(
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

  function appendVerifiedWorkspaceMessage(
    section: AppSection,
    successMessage?: string,
  ) {
    const content = workspaceOpenAckVerified(
      section,
      getWorkspaceSnapshot(),
      successMessage,
    );
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
  const [savedArtifact, setSavedArtifact] = useState<SavedArtifactRecord | null>(
    null,
  );
  const savedArtifactRef = useRef<SavedArtifactRecord | null>(null);
  savedArtifactRef.current = savedArtifact;
  const createSessionRestoredRef = useRef(false);
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

  const workspaceContext = useMemo(
    () => buildWorkspaceContext(workspacePanel, workspaceDetail),
    [workspacePanel, workspaceDetail],
  );

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
    },
    [persistCreateSession],
  );

  const handleSavedArtifactChange = useCallback(
    (record: SavedArtifactRecord) => {
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
      setWorkspaceDetail((prev) =>
        panelDetailEqual(prev, detail) ? prev : detail,
      );
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
      const saved = snapshot ?? loadCreateSession();
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
      setActiveNav("create");
      applyWorkspaceFocus(null);
      setWorkspaceSession(null);

      if (ack) {
        setMessages((prev) => [...prev, { role: "assistant", content: ack }]);
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
      setActiveSection("home");
      activeSectionRef.current = "home";
      setWorkspaceSession(normalized);
      saveWorkspaceSession(normalized);
      revealWorkspace();
      const { field, content } = extractFocusDirective(ack);
      appendVerifiedWorkspaceMessage("projects", content);
      applyWorkspaceFocus(field);
    },
    [applyWorkspaceFocus, revealWorkspace],
  );

  useEffect(() => {
    if (!workspaceSession) return;
    saveWorkspaceSession(workspaceSession);
  }, [workspaceSession]);

  useEffect(() => {
    if (createSessionRestoredRef.current) return;
    createSessionRestoredRef.current = true;
    restoreCreateSession();
  }, [restoreCreateSession]);

  // Create is a workspace, not a full-page section — keep split view mounted.
  useEffect(() => {
    if (!workspacePanel || activeSection === "home") return;
    setActiveSection("home");
    if (workspacePanel === "content-generator") setActiveNav("create");
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
    if (activeSection === "home") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    messages,
    isLoading,
    activeSection,
    toolSuggestion,
    actionBridge,
    workspaceOffer,
    workspacePanel,
  ]);

  function continueWork(a: LastActivity) {
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
      setActiveNav("create");
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
      openCreationWorkspace(
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

  function openCreationWorkspace(
    section: AppSection,
    input: CreationWorkspaceInput,
    opts?: {
      ackMessage?: string;
      /** Open panel without adding a chat ack (assistant already spoke). */
      silent?: boolean;
      seedOverride?: GenSeed;
      savedArtifact?: SavedArtifactRecord | null;
    },
  ) {
    const activeCtx = creationContextRef.current;
    if (
      section === "content-generator" &&
      activeCtx?.artifactTypeLocked &&
      input.itemType &&
      conflictsWithLockedArtifact(activeCtx.itemType, input.itemType) &&
      !userExplicitlyChangesArtifactType(input.brief ?? lastUserTextRef.current)
    ) {
      setActiveSection("home");
      setActiveNav("create");
      setChatLayoutMode("split");
      revealWorkspace();
      return;
    }

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
          })
        : null;

    if (
      section === "content-generator" &&
      workspacePanel === "content-generator" &&
      !opts?.ackMessage &&
      creationContextEqual(creationContext, ctx) &&
      genSeedEqual(genSeed, nextSeed)
    ) {
      dbgWorkspace("openCreationWorkspace skipped — already open");
      setActiveSection("home");
      setActiveNav("create");
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
      setActiveNav("create");
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

    if (!opts?.silent) {
      if (section === "content-generator") {
        const ack =
          opts?.ackMessage ?? buildCreationWorkspaceOpenMessage(ctx);
        appendVerifiedWorkspaceMessage("content-generator", ack);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: opts?.ackMessage ?? buildCreationWorkspaceOpenMessage(ctx),
          },
        ]);
      }
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
    setChatLayoutMode("split");
    revealWorkspace();
  }

  function syncCreatePanelDraft(artifact: ResolvedArtifact) {
    const ctx = toCreationContext("content-generator", {
      itemType: artifact.itemType,
      title: artifact.title,
      draftContent: artifact.draftContent,
      brief: artifact.title,
      stage: "editing draft",
      source: "chat",
      artifactTypeLocked:
        artifact.artifactTypeLocked ??
        creationContextRef.current?.artifactTypeLocked ??
        shouldLockArtifactType(artifact.itemType),
    });
    setCreationContext((prev) =>
      creationContextEqual(prev, ctx) ? prev : ctx,
    );
    const nextSeed: GenSeed = {
      type: artifact.itemType,
      topic: artifact.title,
      brief: artifact.title,
      draft: artifact.draftContent,
      autoGenerate: false,
    };
    setGenSeed((prev) => (genSeedEqual(prev, nextSeed) ? prev : nextSeed));
    setCreateExportReady(false);
    setWorkspaceDetail((prev) => {
      const next: WorkspacePanelDetail = {
        view: "create",
        stage: "Editing draft",
        selectedItemName: `${artifact.itemType} — ${artifact.title}`,
        selectedItemStatus: "Draft ready",
        draftPreview: artifact.draftContent,
      };
      return prev && panelDetailEqual(prev, next) ? prev : next;
    });
    persistCreateSession(
      {
        type: artifact.itemType,
        topic: artifact.title,
        brief: artifact.title,
        draft: artifact.draftContent,
        title: artifact.title,
      },
      ctx,
      workspaceDetailRef.current,
    );
    if (workspacePanelRef.current !== "content-generator") {
      patchWorkspacePanel("content-generator");
      setActiveNav("create");
    }
    setChatLayoutMode("split");
    revealWorkspace();
  }

  function openCreateWithResolvedArtifact(
    artifact: ResolvedArtifact,
    ackMessage?: string,
    exportAction?: ArtifactExportAction | null,
  ) {
    openCreationWorkspace(
      "content-generator",
      {
        itemType: artifact.itemType,
        title: artifact.title,
        draftContent: artifact.draftContent,
        brief: artifact.title,
        stage: artifact.draftContent.trim()
          ? "editing draft"
          : "starting compose",
        source: "generated",
        artifactTypeLocked: artifact.artifactTypeLocked,
      },
      {
        ackMessage,
        silent: !ackMessage,
        seedOverride: {
          type: artifact.itemType,
          topic: artifact.title,
          brief: artifact.title,
          draft: artifact.draftContent || undefined,
          autoGenerate: false,
        },
      },
    );
    if (exportAction) setExportTrigger(exportAction);
  }

  function openSavedWorkInCreate(
    item: SavedWorkItem,
    ackMessage?: string,
  ) {
    const record = recordFromSavedWork(item);
    openCreationWorkspace(
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
          ackMessage ??
          `Opening **${item.title}** from **Saved Work** beside you.`,
        seedOverride: {
          type: item.artifactType,
          topic: item.title,
          brief: item.title,
          draft: item.body,
          autoGenerate: false,
        },
        savedArtifact: record,
      },
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
      allowStoredSession?: boolean;
      chatMessages?: Message[];
      projectPickerPrefill?: string | null;
    },
  ): boolean {
    const chatTurns = toChatTurns(opts?.chatMessages ?? messages);
    const allowStoredSession =
      opts?.allowStoredSession ?? isExplicitCreateResumeRequest(userText);
    const resolveInput = {
      userText,
      messages: chatTurns,
      creationContext: creationContextRef.current,
      lastActivity: lastAct ?? getLastActivity(),
      storedSession: loadCreateSession(),
      allowStoredSession,
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
        setChatLayoutMode("split");
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
    setChatLayoutMode("split");
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
          openFocusAudio(opts?.focusAudioCategory ?? "deep-work");
          return;
        }
        if (opts?.bootstrapProjects) {
          setProjectsBootstrapCreate(true);
        }
        patchWorkspacePanel(section);
        setWorkspaceDetail(emptyWorkspaceDetail());
        setActiveSection("home");
        setChatLayoutMode("split");
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

  function openCreateFromIntent(resolved: ResolvedIntent) {
    const assetRoute = resolveAssetRoute(resolved.rawText);
    if (assetRoute) {
      openAssetRoute(assetRoute);
      return;
    }

    const catalog = matchCatalogFromText(resolved.rawText);
    if (catalog?.route) {
      const nav = navForWorkspaceSection(catalog.route);
      openSectionBesideChat(catalog.route, nav ?? undefined);
      return;
    }

    const seed = toGenSeed(resolved);
    const itemType = resolved.type || catalog?.type || "content";
    const hasUserDraft = Boolean(seed.draft?.trim());
    const scaffold = hasUserDraft ? "" : blankScaffoldForType(itemType);
    const draft = seed.draft?.trim() || scaffold;
    openCreationWorkspace(
      "content-generator",
      {
        itemType,
        title: resolved.topic || itemType || "Draft",
        draftContent: draft,
        brief: seed.brief ?? resolved.rawText,
        stage: draft.trim() ? "editing draft" : "choosing content type",
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

  function goBack() {
    if (backInterceptorRef.current?.()) return;
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
          notify(`Starting soon: ${b.title}`, "Begins in about 15 minutes.");
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
          notify(`Time to start: ${due.title}`, `You planned ${due.durationMin} min`);
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

  function resetChat() {
    recognitionRef.current?.stop();
    setIsListening(false);
    clearConversation();
    setMessages([]);
    setInput("");
    setError(null);
    setEmotion("unclear");
    setBridge(null);
    setWorkspaceOffer(null);
    setAssistedActionOffer(null);
    patchWorkspacePanel(null);
    setWorkspaceDetail(null);
    setCreationContext(null);
    clearCreateSession();
    applyWorkspaceFocus(null);
    clearWorkspaceSession();
    setWorkspaceSession(null);
    setProjectsBootstrapCreate(false);
    voiceUsedRef.current = false;
    setIsLoading(false);
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
    setChatLayoutMode("split");
  }

  function navForWorkspaceSection(section: AppSection): SidebarNavId | null {
    switch (section) {
      case "content-generator":
        return "create";
      case "projects":
        return "projects";
      case "templates-library":
        return "templates";
      case "saved-work":
        return "saved-work";
      case "playbook":
        return "playbook";
      default:
        return null;
    }
  }

  /** Menu / in-panel navigation — replace right workspace, keep chat on the left. */
  function openSectionBesideChat(
    section: AppSection,
    nav?: SidebarNavId,
  ) {
    if (section === "content-generator") {
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("create");
        setChatLayoutMode("split");
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
        setChatLayoutMode("split");
        revealWorkspace();
        return;
      }
      if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession()
      ) {
        setChatLayoutMode("split");
        revealWorkspace();
        return;
      }
      openCreationWorkspace(
        "content-generator",
        {
          itemType: "content",
          title: "New piece",
          brief: "",
          stage: "choosing content type",
          source: "generated",
        },
        { ackMessage: undefined },
      );
      setChatLayoutMode("split");
      revealWorkspace();
      return;
    }

    if (workspacePanel === section) {
      setActiveSection("home");
      if (nav) setActiveNav(nav);
      setChatLayoutMode("split");
      revealWorkspace();
      return;
    }

    patchWorkspacePanel(section);
    setWorkspaceDetail(emptyWorkspaceDetail());
    setCreationContext(null);
    applyWorkspaceFocus(null);
    setActiveSection("home");
    setChatLayoutMode("split");
    setWorkspaceSession(null);
    setProjectsBootstrapCreate(false);

    const navId = nav ?? navForWorkspaceSection(section);
    if (navId) setActiveNav(navId);

    if (section === "projects") {
      setProjectContinueId(null);
    }

    revealWorkspace();
  }

  function openWorkspaceFromSection(section: AppSection) {
    if (shouldOpenBesideChat(section)) {
      openSectionBesideChat(section);
    } else {
      setActiveSection(section);
    }
  }

  function handleNavSelect(nav: SidebarNavId, mode?: CoachingMode) {
    if (nav === "chat") {
      setActiveNav("chat");
      setActiveSection("home");
      if (mode) setCoachingMode(mode);
      inputRef.current?.focus();
      return;
    }

    if (nav === "create") {
      // Clicking Create starts a NEW create conversation — never open the panel
      // cold with an old draft/chat. Gather context in chat first; Create opens
      // only after the user picks a type and confirms (or says "continue my
      // draft" to resume). This avoids the abrupt takeover with stale content.
      setActiveNav("chat");
      setActiveSection("home");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            'What would you like to create today? You can make things like:\n\n- Proposal\n- SOP\n- Email\n- Client Avatar\n- Sales Page\n- Marketing Plan\n- Google Doc\n- Google Sheet\n- Google Form\n\nJust tell me which — or say "continue my draft" to pick up where you left off.',
        },
      ]);
      inputRef.current?.focus();
      return;
    }

    const section = SECTION_NAV[nav] ?? "home";
    if (mode) {
      setCoachingMode(mode);
      if (section === "home") appendSystemMessage(MODE_FEEDBACK[mode]);
    }

    if (section === "home") {
      setActiveNav(nav);
      setActiveSection("home");
      inputRef.current?.focus();
      return;
    }

    if (shouldOpenBesideChat(section)) {
      openSectionBesideChat(section, nav);
      return;
    }

    setActiveNav(nav);
    setActiveSection(section);
  }

  function openFocusAudio(categoryId?: string | null) {
    const fromIntent = detectAudioRequest(lastUserTextRef.current);
    setFocusAudioCategory(
      categoryId ?? (fromIntent.isAudio ? fromIntent.categoryId : null),
    );
    setActiveSection("focus-audio");
    setActiveNav("focus");
  }

  function handleToolSelect(tool: SidebarToolId) {
    switch (tool) {
      case "brain-dump":
        openWorkspaceBesideChat("brain-dump", workspaceOpenAck("brain-dump"));
        break;
      case "focus-timer":
        setActiveSection("focus-timer");
        break;
      case "breathe":
        setActiveSection("breathe");
        break;
      case "focus-audio":
        openFocusAudio();
        break;
      case "time-block":
        openWorkspaceBesideChat("time-block", workspaceOpenAck("time-block"));
        break;
      case "games":
        setActiveSection("games");
        break;
      case "spin-wheel":
        setActiveSection("spin-wheel");
        break;
      case "reset-day":
        resetChat();
        appendSystemMessage("Fresh start — I'm here with you.");
        break;
      case "voice":
        toggleVoiceMode();
        setActiveSection("home");
        inputRef.current?.focus();
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

  function handleNewDayChat() {
    resetChat();
    // A daily reset thread — fresh, but warm (light memory is kept in storage).
    setMessages([
      {
        role: "assistant",
        content: "New day — fresh start. What feels most important right now?",
      },
    ]);
  }

  function testAlert() {
    unlockChime();
    const demo: TimeBlock = {
      id: "test-alert",
      title: "Test block",
      date: todayStr(),
      startTime: "00:00",
      durationMin: 25,
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
    // Timer enabled → launch the linked Focus Session timer at the block's
    // duration (capped at 8h).
    if (block.timerEnabled) {
      setBlockStatus(block.id, "triggered");
      pomodoroTimer.startWith(Math.min(block.durationMin, 480), block.title);
      setActiveSection("focus-timer");
      return;
    }
    // Otherwise a gentle, energy-adapted hand-off into chat.
    setBlockStatus(block.id, "completed");
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("focus");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: energyOpeningLine(block) },
    ]);
  }

  function blockNotReady(block: TimeBlock) {
    snoozeBlock(block.id, 15);
    setTriggeredBlock(null);
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "That's okay — no pressure at all. Let's take a breath together. What's the smallest possible first step, even just opening the file?",
      },
    ]);
  }

  function handlePlaybookAsk(prompt: string) {
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("playbook");
    // Start a fresh conversation — not a continuation of the old one.
    void handleSend(prompt, true);
  }

  function handleFocusSession(minutes: number) {
    logMomentum("start", "Focus session started");
    setActiveSection("home");
    setActiveNav("focus");
    setCoachingMode("focus");
    appendSystemMessage(`Focus session — ${minutes} minutes.`);
  }

  function clearAllPendingOffers() {
    setWorkspaceOffer(null);
    setAssistedActionOffer(null);
    setArtifactExportOffer(null);
    setDoItNowOffer(null);
    setToolSuggestion(null);
    setActionBridge(null);
    setBridge(null);
  }

  const lockedArtifactType = useMemo(
    () => lockedArtifactFromContext(creationContext),
    [creationContext],
  );

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
      setActiveNav("create");
      setChatLayoutMode("split");
      revealWorkspace();
      setExportTrigger(action);
    }
  }

  function openWorkspaceBesideChat(
    section: AppSection,
    ack = workspaceOpenAck(section),
  ) {
    if (section === "content-generator") {
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("create");
        setChatLayoutMode("split");
        revealWorkspace();
      } else if (
        isExplicitCreateResumeRequest(lastUserTextRef.current) &&
        restoreCreateSession(undefined, ack)
      ) {
        setChatLayoutMode("split");
        revealWorkspace();
      } else if (
        tryOpenCreateForCurrentArtifact(lastUserTextRef.current, {
          ackMessage: ack,
        })
      ) {
        /* opened with current artifact */
      } else {
        openCreationWorkspace(
          "content-generator",
          {
            itemType: "content",
            title: "New piece",
            brief: lastUserTextRef.current,
            stage: "choosing content type",
            source: "generated",
          },
          { ackMessage: ack, seedOverride: { autoGenerate: false } },
        );
      }
      trackWorkspaceEcosystemEvent("content-generator");
      return;
    }

    if (workspacePanel === section) {
      setActiveSection("home");
      activeSectionRef.current = "home";
      setChatLayoutMode("split");
      revealWorkspace();
      appendVerifiedWorkspaceMessage(section, ack);
      return;
    }

    patchWorkspacePanel(section);
    setWorkspaceDetail(emptyWorkspaceDetail());
    setActiveSection("home");
    activeSectionRef.current = "home";
    setChatLayoutMode("split");
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
    appendVerifiedWorkspaceMessage(section, ack);
  }

  function executePendingAction(action: PendingAction) {
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
        setActiveNav("create");
        openCreationWorkspace(
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
    const classifiedSignals = observeUserSignalsFromText({
      text: trimmed,
      emotionalState: detectEmotionalState(trimmed),
      source: "chat",
    });
    void syncClassifiedSignalsToServer(classifiedSignals);
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

    const overwhelmed =
      /\b(overwhelm|too much|so much|stuck|don'?t know|where do i (start|begin)|where to (start|begin)|can'?t think|drowning|frozen|paralyz)/i.test(
        trimmed,
      );
    const askingHow =
      /^\s*(how|what|why|when|can you explain|explain|is it|are you|do you|does)\b/i.test(
        trimmed,
      );
    // Raw feeling / somatic distress → stay in chat and attend to it. Never
    // route to a tool or pop a bridge chip when someone is hurting.
    const distressed =
      /\b(feel sick|feeling sick|nauseous|nauseated|throw up|might cry|want to cry|crying|tearful|failure|failing|fraud|imposter|impostor|exhausted|anxious|anxiety|ashamed|hopeless|helpless|heavy|numb|can't cope|breaking down|falling apart|grief|grieving|body won'?t)\b/i.test(
        trimmed,
      );

    const resolved = resolveIntent(trimmed, {
      overwhelmed,
      askingHow,
      lastAct,
    });

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

    if (pendingDocumentTypeChoice) {
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
        openSectionBesideChat("projects");
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

    // Distress short-circuits all auto-routing — being seen beats doing.
    if (
      !distressed &&
      !stayInConversation &&
      !blockAutoWorkspace &&
      !suppressCreateForPlanning &&
      isDocumentCreationRequest(trimmed)
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

    if (!distressed && !stayInConversation && !suppressCreateForPlanning) {
      const assetRoute = resolveAssetRoute(trimmed);
      if (assetRoute && shouldAutoRouteAssetRequest(trimmed)) {
        commitUserLine();
        openAssetRoute(assetRoute);
        return;
      }

      if (resolved.action === "edit-draft" && resolved.draftContent) {
        commitUserLine();
        openCreateFromIntent(resolved);
        return;
      }

      if (resolved.action === "stabilize") {
        commitUserLine();
        openCreationWorkspace(
          "content-generator",
          {
            itemType: "content",
            title: resolved.topic || "your piece",
            brief: resolved.topic || resolved.rawText,
            stage: "choosing content type",
            source: "generated",
          },
          {
            ackMessage:
              "I'm opening **Create** — pick what you're making in the panel beside us, or tell me here.",
            seedOverride: {
              sourceText: resolved.rawText,
              topic: resolved.topic || undefined,
              brief: resolved.topic || resolved.rawText,
            },
          },
        );
        return;
      }

      if (
        resolved.action === "make" &&
        resolved.confidence >= MAKE_CONFIDENCE_THRESHOLD &&
        resolved.type
      ) {
        commitUserLine();
        openCreateFromIntent(resolved);
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
    voiceUsedRef.current = false;
    setError(null);

    const lastAssistantText =
      [...nextMessages].reverse().find((m) => m.role === "assistant")?.content ??
      "";
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

    if (pendingNow && matchesPendingAcceptance(trimmed, pendingNow)) {
      executePendingAction(pendingNow);
      return;
    }

    const standaloneTool = detectStandaloneToolRequest(trimmed);
    if (standaloneTool) {
      if (standaloneTool.tool === "focus-audio") {
        openFocusAudio(standaloneTool.focusAudioCategory);
      } else {
        handleToolSelect(standaloneTool.tool);
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

    const directOpen = detectOpenSectionRequest(trimmed);
    if (directOpen === "breathe" || directOpen === "focus-audio") {
      if (directOpen === "focus-audio") {
        openFocusAudio(detectAudioRequest(trimmed).categoryId);
      } else {
        handleToolSelect("breathe");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: standaloneToolAck(
            directOpen === "breathe" ? "breathe" : "focus-audio",
            directOpen === "focus-audio"
              ? detectAudioRequest(trimmed).categoryId
              : undefined,
          ),
        },
      ]);
      return;
    }
    if (directOpen && supportsWorkspace(directOpen) && !blockAutoWorkspace) {
      openWorkspaceBesideChat(directOpen);
      return;
    }

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

    if (workspaceOffer && classified.intent === "confirmation") {
      if (
        workspacePanel === "content-generator" &&
        workspaceOffer.section !== "content-generator"
      ) {
        setWorkspaceOffer(null);
      } else if (
        workspacePanel === "content-generator" &&
        workspaceOffer.section === "content-generator"
      ) {
        setWorkspaceOffer(null);
        setActiveSection("home");
        setActiveNav("create");
        return;
      } else {
        acceptWorkspaceOffer(workspaceOffer);
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
        setChatLayoutMode("split");
        setActiveSection("home");
        setActiveNav("create");
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
        setChatLayoutMode("split");
        setActiveSection("home");
        setActiveNav("create");
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
        setChatLayoutMode("split");
        setActiveSection("home");
        setActiveNav("create");
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
            setChatLayoutMode("split");
            return;
          }
        }
        if (
          tryOpenCreateForCurrentArtifact(trimmed, {
            chatMessages: nextMessages,
          })
        ) {
          revealWorkspace();
          setChatLayoutMode("split");
          return;
        }
      }
      if (recovery === "client-avatars") {
        openSectionBesideChat("client-avatars");
        appendVerifiedWorkspaceMessage(
          "client-avatars",
          "**Client Avatar** is open beside you — build your ideal client in the panel while we chat.",
        );
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
          openSectionBesideChat("projects");
          appendVerifiedWorkspaceMessage(
            "projects",
            "Opening **Projects** for your workshop — the builder is beside you.",
          );
          return;
        }
      }
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        activeSectionRef.current = "home";
        setActiveNav("create");
        revealWorkspace();
        appendVerifiedWorkspaceMessage(
          "content-generator",
          "Your **Create** workspace is open beside you — check the panel on the right (or the **Active** bar).",
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
          "**Time Block** is open beside you — check the panel on the right (or tap **Open** in the **Active** bar).",
        );
        return;
      }
      if (
        (recovery === "brain-dump" || recovery === "any") &&
        workspacePanel === "brain-dump"
      ) {
        setActiveSection("home");
        activeSectionRef.current = "home";
        revealWorkspace();
        appendVerifiedWorkspaceMessage(
          "brain-dump",
          "**Clear My Mind** is open beside you — check the panel on the right.",
        );
        return;
      }
      if (recovery === "time-block" || recovery === "any") {
        openWorkspaceBesideChat(
          "time-block",
          "**Time Block** is open beside you — let's place your focused time on the day.",
        );
        return;
      }
    }

    if (
      assistedActionOffer &&
      (isActionAcceptance(trimmed) || classified.intent === "confirmation")
    ) {
      acceptAssistedAction(assistedActionOffer);
      return;
    }

    if (
      !assistedActionOffer &&
      !workspaceOffer &&
      isActionAcceptance(trimmed)
    ) {
      const doNow = detectDoItNowOffer(lastAssistantText);
      if (doNow) {
        const userMessage: Message = { role: "user", content: trimmed };
        if (fresh) clearConversation();
        const base = fresh ? [] : messages;
        setMessages([...base, userMessage]);
        setInput("");
        voiceUsedRef.current = false;
        launchDoItNow(doNow);
        return;
      }
      const suggested = assistantSuggestedAction(
        lastAssistantText,
        lockedArtifactType,
      );
      if (suggested) {
        setAssistedActionOffer(suggested);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: suggested.helpMessage,
          },
        ]);
        return;
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
        openWorkspaceWithSession(
          buildSessionFromProject(match),
          buildProjectOpenMessage(match),
        );
        return;
      }
      if (matches.length > 1) {
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
      if (canResumeSession(sessionToResume)) {
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
          setActiveNav("create");
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
          tryOpenCreateForCurrentArtifact(trimmed, {
            chatMessages: nextMessages,
            allowStoredSession: isExplicitCreateResumeRequest(trimmed),
          })
        ) {
          return;
        }
      }
      if (!workspacePanel) {
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
    const willBridge = bridgeFromResolved(resolved) !== null;
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
    const rawWorkspaceOffer =
      willBridge ||
      skipToolOffer ||
      intelligence.shouldDeferTools ||
      stayInConversation
        ? null
        : detectDoingIntent(trimmed);
    const pendingWorkspaceOffer =
      rawWorkspaceOffer &&
      !shouldSuppressWorkspaceOffer(workspaceContext, rawWorkspaceOffer)
        ? rawWorkspaceOffer
        : null;
    const pendingToolOffer =
      willBridge ||
      skipToolOffer ||
      pendingWorkspaceOffer ||
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

    if (pendingWorkspaceOffer && !workspacePanel && !blockAutoWorkspace) {
      const lookupQuery = extractProjectQuery(trimmed);
      if (lookupQuery && pendingWorkspaceOffer.section === "projects") {
        const existing = searchProjects(lookupQuery);
        if (existing.length === 1) {
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

    if (workspacePanel && workspaceContext) {
      const dayForCoach = getDayState();
      const coachEnergy = resolveWorkspaceEnergy(
        dayForCoach?.energy,
        trimmed,
        dayForCoach?.overwhelm,
      );
      const coachSession = workspaceSession ?? loadWorkspaceSession();
      const coachTurn = resolveWorkspaceCoachTurn(
        workspaceContext,
        trimmed,
        coachEnergy,
        lastAssistantText,
        coachSession,
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
          setWorkspaceChatFill({
            field: coachTurn.fill.field,
            value: coachTurn.fill.value,
            stepId: coachTurn.fill.stepId,
            key: Date.now(),
          });
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
            setWorkspaceChatFill({
              field: sopTurn.fill.field,
              value: sopTurn.fill.value,
              stepId: sopTurn.fill.stepId,
              key: Date.now(),
            });
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
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(nextMessages),
          inputType,
          coachingMode,
          emotionalState: EMOTION_LABELS[detected],
          dayState: dayStateSummary(getDayState()),
          aiTone: prefs.aiTone,
          helpMode: prefs.helpMode,
          supportStyle: prefs.supportStyle,
          userName: prefs.name || undefined,
          businessContext: businessContextSummary(),
          intentHint:
            [
              intentHintForChat(resolved),
              (() => {
                const audio = detectAudioRequest(trimmed);
                if (!audio.isAudio) return null;
                return (
                  `AUDIO / ENERGIZE REQUEST: User wants listening support — open or mention **Focus Audio** ` +
                  `(category: ${audio.categoryId}, e.g. Motivation Boost for energizing). ` +
                  `Do not only give abstract ideas — name Focus Audio and energizing music as an option.`
                );
              })(),
              stayInConversation ? conversationGatingHint(trimmed) : null,
              intelligenceHintForChat(intelligence, trimmed),
              assistedActionHintForChat(lastAssistantText, lockedArtifactType),
              artifactLockHintForChat(creationContext),
              (() => {
                const offer = detectDoItNowOffer(lastAssistantText);
                return offer ? doItNowHintForChat(offer) : null;
              })(),
            ]
              .filter(Boolean)
              .join("\n\n") || undefined,
          workspaceContextHint: [
            workspaceVerificationHint(getWorkspaceSnapshot()),
            googleWorkspace
              ? formatGoogleWorkspaceEditHint(googleWorkspace)
              : null,
            buildWorkspaceChatHints(workspaceContext, {
              coGuideActive:
                workspacePanel !== null &&
                isWorkspaceOpen(workspacePanel, getWorkspaceSnapshot()),
              energy: workspaceEnergy,
              userText: trimmed,
              sopSession: workspaceSession,
              creationContext,
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
            }),
            !workspacePanel && hasActiveCreateSession()
              ? "STORED CREATE SESSION: A saved Create draft exists but the panel is closed. Do NOT say the draft is visible on screen. If they ask to see or continue it, tell them you are reopening Create — the app will restore it."
              : null,
          ]
            .filter(Boolean)
            .join("\n\n") || undefined,
          toolOfferHint: pendingWorkspaceOffer
            ? workspaceOfferHintForChat(pendingWorkspaceOffer)
            : pendingToolOffer
              ? toolOfferHintForChat(pendingToolOffer)
              : undefined,
          responseLanguageHint,
          obstacle: obstacle ?? undefined,
          somatic: somatic || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      const rawAssistantMsg =
        typeof data.message === "string" ? data.message : "";
      const { field: focusField, content: assistantMsgRaw } =
        extractFocusDirective(rawAssistantMsg);
      const assistantMsg = scrubFalseWorkspaceClaims(
        assistantMsgRaw,
        getWorkspaceSnapshot(),
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMsg },
      ]);

      const autoWorkspaceRoute = detectAssistantWorkspaceLaunch(
        assistantMsgRaw,
        trimmed,
      );
      if (
        autoWorkspaceRoute &&
        !isWorkspaceOpen(autoWorkspaceRoute.section, getWorkspaceSnapshot())
      ) {
        openAssetRoute(autoWorkspaceRoute, { appendAck: false });
      }
      if (
        shouldHandoffChatArtifactToWorkspace(assistantMsg, trimmed) &&
        workspacePanel !== "content-generator"
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
        shouldSyncChatArtifactToCreate(
          assistantMsg,
          trimmed,
          workspacePanel === "content-generator",
        )
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
            artifactTypeLocked:
              creationContextRef.current?.artifactTypeLocked ??
              shouldLockArtifactType(fromChat.itemType),
          });
        }
      } else if (
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
      const makeBridge = bridgeFromResolved(resolved);
      setBridge(makeBridge);
      if (pendingWorkspaceOffer) {
        setWorkspaceOffer(pendingWorkspaceOffer);
        setToolSuggestion(null);
        setActionBridge(null);
      } else if (pendingToolOffer) {
        trackToolSuggestionOffered(pendingToolOffer.kind);
        setToolSuggestion(pendingToolOffer);
        setWorkspaceOffer(null);
        setActionBridge(null);
      } else {
        setWorkspaceOffer(null);
        setToolSuggestion(null);
        const nextDoItNow =
          makeBridge || intelligence.shouldDeferTools
            ? null
            : detectDoItNowOffer(assistantMsg);
        setDoItNowOffer(nextDoItNow);
        setActionBridge(
          makeBridge || intelligence.shouldDeferTools || nextDoItNow
            ? null
            : detectActionBridge(assistantMsg),
        );
      }
      const autoLaunchTool = detectAssistantToolLaunch(assistantMsg);
      if (autoLaunchTool) {
        handleToolSelect(autoLaunchTool);
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

  function acceptWorkspaceOffer(offer: WorkspaceOffer) {
    clearAllPendingOffers();
    if (offer.section === "content-generator") {
      if (workspacePanel === "content-generator") {
        setActiveSection("home");
        setActiveNav("create");
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
      openCreationWorkspace(
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
      openWorkspaceBesideChat("time-block", workspaceOpenAck("time-block"));
      return;
    }
    if (offer.section === "brain-dump") {
      openWorkspaceBesideChat("brain-dump", workspaceOpenAck("brain-dump"));
      return;
    }
    if (offer.section === "focus-audio") {
      openFocusAudio(detectAudioRequest(lastUserTextRef.current).categoryId);
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
    const ackContent = buildSopAcceptMessage(normalized);
    const { field, content } = extractFocusDirective(ackContent);
    appendVerifiedWorkspaceMessage(offer.section, content);
    applyWorkspaceFocus(field);
  }

  function closeWorkspacePanel() {
    patchWorkspacePanel(null);
    setWorkspaceDetail(null);
    setCreationContext(null);
    setSavedArtifact(null);
    setGoogleWorkspace(null);
    clearCreateSession();
    // Explicit close = the workspace is gone. Clear its recovery state and stop
    // referencing it in chat (no lingering "X is open beside us").
    clearWorkspaceSession();
    setWorkspaceSession(null);
    setWorkspaceOffer(null);
    applyWorkspaceFocus(null);
    setProjectsBootstrapCreate(false);
    setProjectContinueId(null);
    setActiveNav("chat");
    setChatLayoutMode("split");
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
            onBuildWithShari={(input) =>
              openCreationWorkspace("content-generator", {
                ...input,
                source: input.source ?? "generated",
              })
            }
            onOpen={(s) => {
              if (s !== "content-generator") openWorkspaceFromSection(s);
            }}
            onWin={(label) => {
              logMomentum("complete", `Win: ${label}`);
            }}
            lockedArtifactType={lockedArtifactType}
            onChangeType={() => setCreationContext(null)}
            exportTrigger={exportTrigger}
            onExportTriggerHandled={() => setExportTrigger(null)}
            onOpenSection={openWorkspaceFromSection}
            savedArtifact={savedArtifact}
            onSavedArtifactChange={handleSavedArtifactChange}
            onOpenSavedWork={() => openSectionBesideChat("saved-work")}
            projectPickerPrefill={projectPickerPrefill}
            onOpenGoogleWorkspace={handleOpenGoogleWorkspace}
            onArtifactReady={handleArtifactReadyChat}
            onExportGuidance={handleExportGuidance}
          />
        );
      case "google-workspace":
        return googleWorkspace ? (
          <GoogleWorkspacePanel
            session={googleWorkspace}
            onOpenExternal={() => window.open(googleWorkspace.url, "_blank")}
            onBackToCreate={() => {
              patchWorkspacePanel("content-generator");
              setActiveNav("create");
            }}
            onCopy={() => {
              void navigator.clipboard?.writeText(googleWorkspace.content);
            }}
            onPrintPdf={() => window.open(googleWorkspace.url, "_blank")}
          />
        ) : null;
      case "saved-work":
        return (
          <SavedWorkLibrary
            onBack={closeWorkspacePanel}
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
              openCreationWorkspace("content-generator", {
                ...input,
                source: input.source ?? "generated",
              });
            }}
          />
        );
      case "client-avatars":
        return <IdealClientBuilder />;
      case "projects":
        return (
          <ProjectsPanel
            initialProjectId={projectContinueId}
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
            onAsk={handlePlaybookAsk}
            onBuildWithShari={(input) =>
              openCreationWorkspace("projects", {
                ...input,
                source: "project",
              })
            }
          />
        );
      case "templates-library":
        return (
          <TemplatesLibrary
            onOpen={openWorkspaceFromSection}
            onGenerate={openGenerator}
            onBuildWithShari={(input) =>
              openCreationWorkspace("content-generator", {
                ...input,
                source: "template",
              })
            }
            onBack={closeWorkspacePanel}
          />
        );
      case "playbook":
        return (
          <StrategiesPanel
            onOpen={openWorkspaceFromSection}
            onAsk={handlePlaybookAsk}
            registerBack={registerBack}
          />
        );
      case "snippets":
        return (
          <SnippetsLibrary
            onBuildWithShari={(input) =>
              openCreationWorkspace("content-generator", {
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
              openCreationWorkspace("content-generator", {
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
            onOpenAvatars={() => setActiveSection("client-avatars")}
          />
        );
      case "brain-dump":
        return (
          <BrainDumpPanel
            onOpen={openWorkspaceFromSection}
            onAsk={handlePlaybookAsk}
            registerBack={registerBack}
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
              undefined
            }
          />
        );
      default:
        return (
          <p className="p-6 text-base text-[#6b635a]">
            {workspaceTitle(section)} isn&apos;t available in split view yet.
          </p>
        );
    }
  }

  const workspacePanelNode = useMemo(
    () => (workspacePanel ? renderWorkspacePanel(workspacePanel) : null),
    [
      workspacePanel,
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

    const mins = offer.minutes ?? 25;
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
      setActiveNav("create");
      setChatLayoutMode("split");
      revealWorkspace();
      appendVerifiedWorkspaceMessage("content-generator", action.openAck);
      return;
    }

    if (action.tool) {
      handleToolSelect(action.tool);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: action.openAck },
      ]);
      return;
    }

    if (action.section === "content-generator") {
      openCreationWorkspace(
        "content-generator",
        {
          itemType: action.itemType || "content",
          title: action.title,
          brief: action.brief,
          stage: "starting compose",
          source: "generated",
        },
        {
          ackMessage: action.openAck,
          seedOverride: {
            type: action.itemType,
            topic: action.title,
            brief: action.brief,
          },
        },
      );
      return;
    }

    if (action.section === "projects") {
      openCreationWorkspace(
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

  function acceptToolSuggestion(offer: ToolSuggestion) {
    trackToolSuggestionAccepted(offer.kind);
    clearAllPendingOffers();
    if (offer.action.type === "tool") {
      handleToolSelect(offer.action.tool);
      return;
    }
    void handleSend(offer.action.prompt, false, true);
  }

  function launchActionBridge(bridge: ActionBridge) {
    clearAllPendingOffers();
    if (bridge.tool === "time-block") {
      openWorkspaceBesideChat("time-block", workspaceOpenAck("time-block"));
      return;
    }
    if (bridge.tool === "brain-dump") {
      openWorkspaceBesideChat("brain-dump", workspaceOpenAck("brain-dump"));
      return;
    }
    if (bridge.tool === "focus-timer") {
      const mins = bridge.minutes ?? 25;
      logMomentum("start", `Focus session from chat — ${mins} min`);
      pomodoroTimer.startWith(mins);
      setActiveSection("focus-timer");
      setActiveNav("focus");
      setCoachingMode("focus");
      return;
    }
    if (bridge.tool === "focus-audio") {
      openFocusAudio();
      return;
    }
    handleToolSelect(bridge.tool);
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

  const activeWorkspaceItems = useMemo(() => {
    const items: ActiveWorkspaceItem[] = [];
    const focus = focusTimerWorkspaceItem(pomodoroTimer, () => {
      setActiveSection("home");
      setActiveNav("focus");
      setCoachingMode("focus");
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
          setActiveNav("create");
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

    if (workspacePanel === "brain-dump") {
      items.push({
        id: "brain-dump",
        emoji: "🧠",
        label: "Clear My Mind",
        detail: "Session active",
        onOpen: () => {
          setActiveSection("home");
          revealWorkspace();
        },
        onClose: closeWorkspacePanel,
      });
    }

    if (workspacePanel === "time-block") {
      items.push({
        id: "time-block",
        emoji: "📅",
        label: "Time Block",
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
    <CompanionAuthGate>
    <div
      className={`relative flex h-dvh max-h-dvh overflow-hidden text-lg text-[#2d2926] ${shellClass}`}
    >
      <Suspense fallback={null}>
        <CompanionSignInFromQuery onOpen={openSignIn} />
      </Suspense>
      {showOnboarding && (
        <OnboardingFlow
          userId={user?.id}
          onDone={() => setShowOnboarding(false)}
        />
      )}
      <CompanionBackground page={scenePage} seed={sceneSeed} />

      <div className="relative z-10 flex h-full min-h-0 w-full overflow-hidden">
        <AppSidebar
          activeNav={activeNav}
          activeSection={activeSection}
          onNavSelect={handleNavSelect}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar
            onAdjustDay={() => setActiveSection("energy")}
            onNewChat={resetChat}
            onNewDayChat={handleNewDayChat}
            onSettings={() => setOverlay("settings")}
            onProfile={() => setOverlay("profile")}
            onSignIn={authConfigured ? openSignIn : undefined}
            signedInEmail={user?.email ?? null}
            onOpenAvatars={() => setActiveSection("client-avatars")}
            minimal={activeSection === "home"}
          />
          <ActiveWorkspaceBar items={activeWorkspaceItems} />

          {activeSection !== "home" && (
            <div className="shrink-0 px-4 pt-3 sm:px-6">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-xl border border-[#1e4f4f]/25 bg-white/80 px-4 py-2.5 text-lg font-bold text-[#1e4f4f] hover:bg-white"
              >
                <span className="text-2xl leading-none">‹</span> Back
              </button>
            </div>
          )}

          {activeSection === "home" && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <WorkspaceLayout
                chat={
            <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              <IdentityBar
                emotion={displayEmotion}
                compact={!isIdle}
                photoError={photoError}
                logoError={logoError}
                onPhotoError={() => setPhotoError(true)}
                onLogoError={() => setLogoError(true)}
                resumeLine={
                  // Only when the Continue card is NOT showing — never both.
                  isIdle && hydrated && lastAct && !hasChatted
                    ? `Still on ${lastAct.title}?`
                    : null
                }
                onResumeClick={
                  lastAct ? () => continueWork(lastAct) : undefined
                }
              />

              <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                {/* Home stays calm: greeting up top, open space here, the chat
                    box below. No menus to scan. */}
                <SimpleChat
                  messages={messages}
                  stateHint={stateHint}
                  showHint={false}
                  hideEmptyState
                  isLoading={isLoading}
                  formatParagraphs={formatAssistantParagraphs}
                  afterLastAssistant={
                    // The Pending Action bar (driven by pendingAction) is the
                    // single launcher — never also show inline offer chips.
                    !bridge && !isLoading && !pendingAction ? (
                      <>
                        {workspaceOffer ? (
                          <ToolSuggestionCard
                            line={workspaceOffer.line}
                            toolEmoji={
                              WORKSPACE_EMOJI[workspaceOffer.section] ?? "🛠"
                            }
                            toolLabel={workspaceOffer.buttonLabel}
                            showDismiss={false}
                            onAccept={() =>
                              acceptWorkspaceOffer(workspaceOffer)
                            }
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
                {isIdle && hydrated &&
                  (hasChatted && lastAct ? (
                    // Continue card — one re-entry into unfinished work.
                    <div className="mx-auto mt-5 w-full max-w-md rounded-2xl border border-[#1e4f4f]/20 bg-white/90 p-5 shadow-sm">
                      <p className="text-base font-semibold text-[#6b635a]">
                        {/* Emotion-aware override > strict memory title. */}
                        {/overwhelm|anxious|stress|tired|low|scattered/i.test(
                          displayEmotion,
                        )
                          ? "No rush — pick this back up whenever you're ready:"
                          : /focus|energ|motivat|ready/i.test(displayEmotion)
                            ? "Let's keep going — continue where you left off:"
                            : "You were working on…"}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
                        {lastAct.title}
                      </p>
                      {lastAct.subtitle && (
                        <p className="text-base text-[#6b635a]">
                          {lastAct.subtitle}
                        </p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => continueWork(lastAct)}
                          className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a]"
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clearLastActivity();
                            setLastAct(null);
                          }}
                          className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-semibold text-[#1e4f4f]"
                        >
                          Start fresh
                        </button>
                      </div>
                    </div>
                  ) : hasChatted ? (
                    // Returning user: one soft line, no starter wall.
                    <>
                      {needsSetup && (
                        <div className="mx-auto mt-5 w-full max-w-md rounded-2xl border border-[#1e4f4f]/20 bg-white/90 p-4 shadow-sm">
                          <p className="text-base font-semibold text-[#1f1c19]">
                            Personalize Shari for your business
                          </p>
                          <p className="mt-1 text-sm text-[#6b635a]">
                            About 2 minutes — helps Shari speak your language.
                          </p>
                          <button
                            type="button"
                            onClick={openSetup}
                            className="mt-3 rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                          >
                            Start setup
                          </button>
                        </div>
                      )}
                      <p className="mx-auto mt-5 max-w-xl text-center text-base text-[#6b635a]">
                        What&apos;s on your mind? Just start typing or talking.
                      </p>
                    </>
                  ) : (
                    // First-timer: welcome + optional setup, then starter chips.
                    <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-2.5">
                      {needsSetup && (
                        <div className="w-full max-w-md rounded-2xl border border-[#1e4f4f]/20 bg-white/90 p-4 shadow-sm">
                          <p className="text-base font-semibold text-[#1f1c19]">
                            Welcome — glad you&apos;re here
                          </p>
                          <p className="mt-1 text-sm text-[#6b635a]">
                            Optional: take 2 minutes so Shari knows your business.
                            You can also jump straight into chat below.
                          </p>
                          <button
                            type="button"
                            onClick={openSetup}
                            className="mt-3 rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                          >
                            Start 2-minute setup
                          </button>
                        </div>
                      )}
                      <p className="text-base text-[#6b635a]">
                        Not sure where to start? Tap one:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {(
                          [
                            // Action intent → open the tool. Thinking → chat.
                            {
                              id: "help_me_write" as StarterChipId,
                              label: "✍️ Help me write something",
                              run: () => {
                                trackStarterChip("help_me_write");
                                if (!hasChatted) {
                                  savePrefs({ hasChatted: true });
                                  setHasChatted(true);
                                }
                                setActiveNav("create");
                                openGenerator(null);
                              },
                            },
                            {
                              id: "im_overwhelmed" as StarterChipId,
                              label: "I'm feeling overwhelmed",
                              run: () => {
                                trackStarterChip("im_overwhelmed");
                                void handleSend("I'm feeling overwhelmed", true);
                              },
                            },
                            {
                              id: "what_should_i_work_on" as StarterChipId,
                              label: "What should I work on?",
                              run: () => {
                                trackStarterChip("what_should_i_work_on");
                                void handleSend("What should I work on?", true);
                              },
                            },
                          ] as const
                        ).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={s.run}
                            className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2 text-base font-medium text-[#1e4f4f] transition-colors hover:bg-white"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
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
                  {hydrated &&
                  founderActionBoard.currentAction &&
                  !pendingAction &&
                  !isLoading ? (
                    <FounderActionBar
                      action={founderActionBoard.currentAction}
                      onOpen={() =>
                        respondToFounderAction(
                          founderActionBoard.currentAction!,
                          "open",
                        )
                      }
                      onDone={() =>
                        respondToFounderAction(
                          founderActionBoard.currentAction!,
                          "done",
                        )
                      }
                      onLater={() =>
                        respondToFounderAction(
                          founderActionBoard.currentAction!,
                          "later",
                        )
                      }
                      onDismiss={() =>
                        respondToFounderAction(
                          founderActionBoard.currentAction!,
                          "dismiss",
                        )
                      }
                    />
                  ) : null}
                  {pendingAction && !isLoading ? (
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
                  />
                  {/* Cold open stays bare: just starters + input. The voice
                      chip and upsell only appear once a conversation exists. */}
                  {!isIdle && (
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
                }
                workspace={workspacePanelNode}
                workspaceActive={Boolean(workspacePanel)}
                workspaceTitle={
                  workspacePanel === "google-workspace" && googleWorkspace
                    ? googleWorkspaceTitle(googleWorkspace.kind)
                    : workspacePanel
                      ? workspaceTitle(workspacePanel)
                      : "Workspace"
                }
                chatLayoutMode={chatLayoutMode}
                onChatLayoutModeChange={setChatLayoutMode}
                onClose={closeWorkspacePanel}
                revealKey={workspaceRevealSeq}
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
              <div className="mx-auto min-h-full w-full max-w-3xl rounded-3xl bg-white/80 shadow-sm backdrop-blur-sm">

          {activeSection === "focus-timer" && (
            <FocusTimerPanel
              timer={pomodoroTimer}
              onStartSession={handleFocusSession}
            />
          )}

          {activeSection === "brain-dump" && (
            <BrainDumpPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
              registerBack={registerBack}
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

          {activeSection === "focus" && (
            <FocusAreaPanel
              onOpen={handleToolSelect}
              onGetUnstuck={() => {
                setActiveSection("home");
                setActiveNav("chat");
                void handleSend(
                  "I'm feeling stuck — can you help me find the smallest next step?",
                  true,
                  true,
                );
              }}
            />
          )}

          {activeSection === "time-block" && (
            <TimeBlockPanel onStart={startBlock} onTestAlert={testAlert} />
          )}

          {activeSection === "games" && (
            <GamesPanel onOpen={(s) => setActiveSection(s)} />
          )}

          {activeSection === "spin-wheel" && (
            <SpinWheelPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
            />
          )}

          {activeSection === "business-profile" && (
            <BusinessProfilePanel
              onDone={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
              onOpenAvatars={() => setActiveSection("client-avatars")}
            />
          )}

          {activeSection === "client-avatars" && <IdealClientBuilder />}

          {activeSection === "projects" && (
            <ProjectsPanel
              initialProjectId={projectContinueId}
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
              onBuildWithShari={(input) =>
                openCreationWorkspace("projects", {
                  ...input,
                  source: "project",
                })
              }
            />
          )}

          {activeSection === "playbook" && (
            <StrategiesPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
              registerBack={registerBack}
            />
          )}

          {activeSection === "templates-library" && (
            <TemplatesLibrary
              onOpen={(s) => setActiveSection(s)}
              onGenerate={openGenerator}
              onBuildWithShari={(input) =>
                openCreationWorkspace("content-generator", {
                  ...input,
                  source: "template",
                })
              }
              onBack={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
            />
          )}

          {activeSection === "email-generator" && (
            <EmailGeneratorPanel
              onOpen={(s) => setActiveSection(s)}
              onBuildWithShari={(input) =>
                openCreationWorkspace("content-generator", {
                  ...input,
                  source: "email",
                })
              }
            />
          )}

          {activeSection === "snippets" && (
            <SnippetsLibrary
              onBuildWithShari={(input) =>
                openCreationWorkspace("content-generator", {
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
                openCreationWorkspace("content-generator", {
                  itemType: type,
                  title: type,
                  stage: "starting compose",
                  source: "content-type",
                })
              }
            />
          )}

          {activeSection === "content-generator" && !workspacePanel && (
            <ContentGeneratorPanel
              seed={genSeed}
              onBuildWithShari={(input) =>
                openCreationWorkspace("content-generator", {
                  ...input,
                  source: input.source ?? "generated",
                })
              }
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
            />
          )}

          {activeSection === "energy" && (
            <AdjustMyDayPanel
              onDone={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
            />
          )}
              </div>
            </div>
          )}
        </div>
      </div>

      {warning && (
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
        onClose={() => setOverlay(null)}
        title="Settings"
      >
        <SettingsPanel onSignIn={authConfigured ? openSignIn : undefined} />
      </ModalSheet>

      <ModalSheet
        open={overlay === "profile"}
        onClose={() => setOverlay(null)}
        title="Profile"
      >
        <ProfilePanel
          onSignIn={authConfigured ? openSignIn : undefined}
          onOpen={(s) => {
            setOverlay(null);
            setActiveSection(s);
          }}
        />
      </ModalSheet>

      {triggeredBlock && (
        <TimeBlockTrigger
          block={triggeredBlock}
          onStartNow={() => startBlock(triggeredBlock)}
          onSnooze={() => {
            snoozeBlock(triggeredBlock.id, 10);
            setTriggeredBlock(null);
          }}
          onReschedule={() => {
            setTriggeredBlock(null);
            setActiveSection("time-block");
          }}
          onNotReady={() => blockNotReady(triggeredBlock)}
        />
      )}
    </div>
    </CompanionAuthGate>
  );
}
