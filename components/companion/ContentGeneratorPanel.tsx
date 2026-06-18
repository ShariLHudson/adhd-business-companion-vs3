"use client";

import { useEffect, useRef, useState } from "react";
import {
  businessContextSummary,
  getContentTypes,
  getPrefs,
  getOutputLanguageContext,
  setLastActivity,
  type TemplateCategory,
} from "@/lib/companionStore";
import { ExportActions } from "@/components/companion/ExportActions";
import type { AppSection } from "@/lib/companionUi";
import type {
  WorkspaceFieldId,
  WorkspacePanelDetail,
} from "@/lib/workspaceAwareness";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import type { WorkspaceSession } from "@/lib/workspaceSop";
import { useWorkspaceFieldFocus } from "@/lib/useWorkspaceFieldFocus";
import { WorkspaceSopProgress } from "@/components/companion/WorkspaceSopProgress";
import { WorkspaceStepCard } from "@/components/companion/WorkspaceStepCard";
import {
  isProposalArtifact,
  normalizeArtifactType,
  type ArtifactExportAction,
} from "@/lib/artifactType";
import { CreateDraftImprove } from "@/components/companion/CreateDraftImprove";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import {
  CreateOptionsMenu,
  type CreateOptionsAction,
} from "@/components/companion/CreateOptionsMenu";
import { ProjectPickerModal } from "@/components/companion/ProjectPickerModal";
import {
  artifactReadyMessage,
  buildGoogleWorkspaceSession,
  type GoogleFileKind,
  type GoogleWorkspaceSession,
} from "@/lib/googleWorkspace";
import { copyPasteFallbackMessage } from "@/lib/collaborativeDocumentWorkflow";
import { findCatalogItem } from "@/lib/createCatalog";
import {
  advanceAfterItemPick,
  advanceAfterTypePick,
  categoryIdForType,
  EMPTY_CREATE_WORKFLOW,
  mergeCreateWorkflow,
  resolvedTypeLabel,
  buildBriefFromWorkflow,
  normalizeSimplifiedCreateWorkflow,
  discoveryQuestionsForState,
  type CreateWorkflowState,
} from "@/lib/createWorkflow";
import {
  BUILD_DRAFT_LOADING_MESSAGES,
  buildFullCreateBrief,
  reconcileTemplateForType,
  resolveTemplateName,
} from "@/lib/createTemplates";
import { DraftWorkspacePanel } from "@/components/companion/DraftWorkspacePanel";
import {
  logCreateBuild,
  logCreateError,
  validateCreateForBuild,
  enterAddDetailStep,
  resolveCreateWorkspacePhase,
} from "@/lib/createBuild";
import {
  logDraftGenerated,
  logDraftGenerationFailed,
  logDraftRenderedInWorkspace,
  logSharedBuildDraftCalled,
  type CreateBuildDraftHandler,
  type CreateBuildDraftParams,
} from "@/lib/createBuildDraft";
import { CreateWorkflowPanel } from "@/components/companion/CreateWorkflowPanel";
import { CreateDiscoveryWorkspace } from "@/components/companion/CreateDiscoveryWorkspace";
import { CreateTypePicker } from "@/components/companion/CreateTypePicker";
import type { CreateBuilderPhase } from "@/lib/createBuilderChat";
import { blankScaffoldForType } from "@/lib/createInitialization";
import { liveCreateWorkflowState } from "@/lib/liveCreateWorkspace";
import { isUnresolvedCreateType } from "@/lib/createTypePickers";
import { combinedCompanionContextForAI } from "@/lib/activeCompanions";
import {
  emptySavedArtifact,
  recordAfterGoogleDoc,
  recordAfterProjectLink,
  recordAfterSavedWorkSave,
  validateArtifactForExport,
  type SavedArtifactRecord,
} from "@/lib/savedArtifact";
import {
  createSavedWork,
  linkSavedWorkToProject,
  markSavedWorkExported,
  updateSavedWork,
} from "@/lib/savedWorkStore";
import type { Project } from "@/lib/companionStore";

export type GenSeed = {
  type?: string;
  brief?: string;
  topic?: string;
  sourceText?: string;
  draft?: string; // restore a saved draft (Continue card)
  /** When true, auto-call /api/generate on open. Default false — never surprise with old/random drafts. */
  autoGenerate?: boolean;
  createWorkflow?: CreateWorkflowState;
} | null;

const TONES = ["Warm & ADHD-friendly", "Friendly", "Professional", "Persuasive", "Storytelling"];

function categoryFor(type: string): TemplateCategory {
  const t = type.toLowerCase();
  if (t.includes("email")) return "emails";
  if (t.includes("strateg")) return "strategy";
  if (t.includes("plan") || t.includes("brain") || t.includes("focus"))
    return "execution";
  if (t.includes("sop") || t.includes("workflow") || t.includes("system"))
    return "systems";
  if (t.includes("offer") || t.includes("pricing")) return "offers";
  if (t.includes("post") || t.includes("script") || t.includes("content"))
    return "content";
  return "other";
}

export function ContentGeneratorPanel({
  seed,
  onOpen,
  onWin,
  onContextChange,
  onBuildWithShari,
  onCreateSessionSync,
  onCreateWorkflowSync,
  workspaceMode = false,
  focusField,
  focusStamp = 0,
  sopSession,
  lockedArtifactType,
  exportTrigger,
  onExportTriggerHandled,
  onOpenSection,
  onOpenSavedWork,
  projectPickerPrefill,
  savedArtifact,
  onSavedArtifactChange,
  onChangeType,
  onSaveForLater,
  onStartOver,
  onDeleteDraft,
  onOpenGoogleWorkspace,
  onArtifactReady,
  onExportGuidance,
  companionBuilderMode = false,
  createBuilderPhase = null,
  chatBuildRequest,
  onChatBuildComplete,
  onChatBuildFailed,
  onCompanionBuilderAction,
  onDiscoveryAudiencePick,
  chatReviseRequest,
  onChatReviseComplete,
  chatSyncedWorkflow,
  onRegisterBuildDraft,
  draftScrollTarget = null,
  draftScrollStamp = 0,
  onCompanionTypePick,
}: {
  seed: GenSeed;
  onOpen?: (s: AppSection) => void;
  onWin?: (label: string) => void;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  onCreateSessionSync?: (state: {
    type: string;
    topic: string;
    brief: string;
    draft: string;
    title: string;
  }) => void;
  onCreateWorkflowSync?: (workflow: CreateWorkflowState) => void;
  workspaceMode?: boolean;
  focusField?: WorkspaceFieldId | null;
  focusStamp?: number;
  sopSession?: WorkspaceSession | null;
  lockedArtifactType?: string | null;
  exportTrigger?: ArtifactExportAction | null;
  onExportTriggerHandled?: () => void;
  onOpenSection?: (section: AppSection) => void;
  onOpenSavedWork?: () => void;
  projectPickerPrefill?: string | null;
  savedArtifact?: SavedArtifactRecord | null;
  onSavedArtifactChange?: (record: SavedArtifactRecord) => void;
  /** Unlock a wrongly-locked artifact type so the user can pick again. */
  onChangeType?: () => void;
  onSaveForLater?: () => void;
  onStartOver?: () => void;
  onDeleteDraft?: () => void;
  onOpenGoogleWorkspace?: (session: GoogleWorkspaceSession) => void;
  onArtifactReady?: (message: string) => void;
  onExportGuidance?: (message: string) => void;
  /** Chat beside Create drives discovery — panel shows status, not questions. */
  companionBuilderMode?: boolean;
  /** Chat builder phase for split-screen status copy. */
  createBuilderPhase?: CreateBuilderPhase | null;
  /** Parent-triggered build from chat builder approval. */
  chatBuildRequest?: {
    type: string;
    brief: string;
    key: number;
    workflow?: CreateWorkflowState;
  } | null;
  onChatBuildComplete?: (result: {
    draft: string;
    workflow: CreateWorkflowState;
  }) => void;
  onChatBuildFailed?: () => void;
  onCompanionBuilderAction?: (
    action: "retry" | "add-detail" | "build-draft",
  ) => void;
  onDiscoveryAudiencePick?: (audienceLabel: string) => void;
  /** Parent-triggered draft revision from chat builder. */
  chatReviseRequest?: { instruction: string; key: number } | null;
  onChatReviseComplete?: () => void;
  /** Chat builder workflow — kept in sync with the Create panel. */
  chatSyncedWorkflow?: CreateWorkflowState | null;
  /** Register the shared build-draft handler (create-only + split-screen). */
  onRegisterBuildDraft?: (handler: CreateBuildDraftHandler | null) => void;
  /** Scroll draft editor to a section after chat apply. */
  draftScrollTarget?: string | null;
  draftScrollStamp?: number;
  /** Panel type pick while split chat is open — starts companion conversation. */
  onCompanionTypePick?: (typeLabel: string) => void;
}) {
  const [type, setType] = useState(seed?.type ?? "");
  const [topic, setTopic] = useState(seed?.topic ?? seed?.brief ?? "");
  const [brief, setBrief] = useState(seed?.topic ?? seed?.brief ?? "");
  const [sourceText, setSourceText] = useState(seed?.sourceText ?? "");
  const [editingTopic, setEditingTopic] = useState(false);
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(seed?.draft ?? "");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);
  const [buildErrorMessage, setBuildErrorMessage] = useState<string | null>(null);
  const [googleExportError, setGoogleExportError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [forAvatar, setForAvatar] = useState<string | undefined>(undefined);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [phase, setPhase] = useState<"building" | "ready">("building");
  const [workflow, setWorkflow] = useState<CreateWorkflowState>(EMPTY_CREATE_WORKFLOW);
  const workflowRef = useRef(workflow);
  workflowRef.current = workflow;
  const [confirmDeleteDraft, setConfirmDeleteDraft] = useState(false);
  const started = useRef(false);
  const lastSeedSig = useRef("");
  // Zero-hop: opened from chat with a clear type → straight to writing, never
  // a selection/config screen. draftRef lands the cursor in the editor.
  const seeded = Boolean(seed?.type);
  const draftRef = useRef<HTMLTextAreaElement | null>(null);
  const exportDocRef = useRef<HTMLButtonElement | null>(null);
  const exportPrintRef = useRef<HTMLButtonElement | null>(null);
  const typeLocked = Boolean(lockedArtifactType);
  const proposalMode = isProposalArtifact(lockedArtifactType ?? type);
  const isGenerating =
    loading ||
    workflow.draftStatus === "building" ||
    createBuilderPhase === "generating";
  const showDraftEditor =
    Boolean(draft.trim()) &&
    (workflow.buildApproved ||
      workflow.draftStatus === "ready" ||
      workflow.draftStatus === "building");
  const splitScreenMode = companionBuilderMode || workflow.questionMode === "split_screen";
  const resolvedCreateType = resolvedTypeLabel(workflow) || type || null;
  const workspacePhase = resolveCreateWorkspacePhase({
    draft,
    draftStatus: workflow.draftStatus,
    buildApproved: workflow.buildApproved,
    step: workflow.step,
    builderPhase: createBuilderPhase,
    loading,
    hasError: error || workflow.draftStatus === "error",
  });
  const showBuildingState = isGenerating && !draft.trim() && !splitScreenMode;
  const inGuidedCreate =
    !workflow.buildApproved && !isGenerating && !splitScreenMode;
  const showSplitScreenStatus =
    splitScreenMode && !showDraftEditor && Boolean(resolvedCreateType);
  const showSplitTypePicker =
    splitScreenMode &&
    !showDraftEditor &&
    !resolvedCreateType &&
    workflow.step === "category";
  const currentDiscoveryQuestion =
    resolvedCreateType && splitScreenMode
      ? discoveryQuestionsForState(resolvedCreateType, workflow)
      : null;
  const audienceStepActive = currentDiscoveryQuestion?.id === "audience";
  const selectedAudienceNames = (workflow.discoveryAnswers.audience ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (workflow.step !== "discovery" || splitScreenMode) return;
    logCreateBuild("Create Session Started", {
      itemType: resolvedTypeLabel(workflow) || type,
      step: workflow.step,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.selectedTypeLabel, workflow.step, splitScreenMode]);

  useEffect(() => {
    if (workflow.step !== "readiness") return;
    logCreateBuild("Questions Complete", {
      itemType: resolvedTypeLabel(workflow) || type,
      answersCount: Object.values(workflow.discoveryAnswers).filter((v) =>
        v.trim(),
      ).length,
    });
  }, [workflow.step, workflow.discoveryAnswers, workflow.selectedTypeLabel, type]);

  useEffect(() => {
    if (!draft.trim() || !workflow.buildApproved) return;
    logCreateBuild("Draft Rendered", {
      itemType: type || resolvedTypeLabel(workflow),
      length: draft.length,
    });
  }, [draft, workflow.buildApproved, type, workflow]);

  useEffect(() => {
    if (!showBuildingState && workspacePhase !== "generating") {
      setLoadingMessageIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % BUILD_DRAFT_LOADING_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [showBuildingState, workspacePhase]);

  const lastReportedDetail = useRef<string>("");
  const lastSessionSyncSig = useRef<string>("");

  useEffect(() => {
    if (!onContextChange) return;
    const stage = draft
      ? "Editing draft"
      : seeded && loading
        ? "Generating draft"
          : type
          ? "Compose setup"
          : "Choosing what to create";
    const detail = {
      view: "create" as const,
      stage,
      selectedItemName: type
        ? `${type}${topic || brief ? ` — ${topic || brief}` : ""}`
        : null,
      selectedItemStatus: draft ? "Draft ready" : loading ? "Generating" : null,
      draftPreview: draft
        ? workspaceMode
          ? draft
          : draft.slice(0, 160)
        : null,
    };
    const sig = JSON.stringify(detail);
    if (sig === lastReportedDetail.current) return;
    lastReportedDetail.current = sig;
    onContextChange(detail);
  }, [type, topic, brief, draft, seeded, loading, workspaceMode, onContextChange]);

  useEffect(() => {
    if (!workspaceMode || !onCreateSessionSync) return;
    const sig = `${type}|${topic}|${brief}|${draft}|${title}`;
    if (sig === lastSessionSyncSig.current) return;
    lastSessionSyncSig.current = sig;
    onCreateSessionSync({
      type,
      topic,
      brief,
      draft,
      title,
    });
  }, [type, topic, brief, draft, title, workspaceMode, onCreateSessionSync]);

  useEffect(() => {
    onCreateWorkflowSync?.(workflow);
  }, [workflow, onCreateWorkflowSync]);

  useEffect(() => {
    if (!companionBuilderMode) return;
    setWorkflow((prev) =>
      prev.questionMode === "split_screen"
        ? prev
        : { ...prev, questionMode: "split_screen" },
    );
  }, [companionBuilderMode]);

  useEffect(() => {
    if (companionBuilderMode) return;
    setWorkflow((prev) =>
      prev.questionMode === "create_only"
        ? prev
        : { ...prev, questionMode: "create_only" },
    );
  }, [companionBuilderMode]);

  const lastChatSyncSig = useRef("");
  useEffect(() => {
    if (!companionBuilderMode || !chatSyncedWorkflow) return;
    const local = workflowRef.current;
    const chatAhead =
      chatSyncedWorkflow.draftStatus === "ready" &&
      Boolean(chatSyncedWorkflow.draftContent?.trim());
    const panelAhead =
      local.draftStatus === "building" ||
      (local.draftStatus === "ready" && Boolean(local.draftContent?.trim()));
    if (panelAhead && !chatAhead) {
      return;
    }
    if (
      local.draftStatus === "building" &&
      chatSyncedWorkflow.draftStatus !== "building" &&
      chatSyncedWorkflow.draftStatus !== "ready"
    ) {
      return;
    }
    const label =
      resolvedTypeLabel(chatSyncedWorkflow) ||
      chatSyncedWorkflow.selectedTypeLabel ||
      type;
    const sig = JSON.stringify({
      step: chatSyncedWorkflow.step,
      answers: chatSyncedWorkflow.discoveryAnswers,
      sectionContent: chatSyncedWorkflow.sectionContent,
      activeSectionId: chatSyncedWorkflow.activeSectionId,
      discoverySubphase: chatSyncedWorkflow.discoverySubphase,
      pendingSectionOptions: chatSyncedWorkflow.pendingSectionOptions,
      subtype: chatSyncedWorkflow.selectedSubtype,
      customSubtype: chatSyncedWorkflow.customSubtype,
      buildApproved: chatSyncedWorkflow.buildApproved,
      draftStatus: chatSyncedWorkflow.draftStatus,
      phase: createBuilderPhase,
    });
    if (sig === lastChatSyncSig.current) return;
    lastChatSyncSig.current = sig;
    setWorkflow(
      reconcileTemplateForType({
        ...chatSyncedWorkflow,
        questionMode: "split_screen",
      }),
    );
    if (
      chatSyncedWorkflow.draftContent?.trim() &&
      chatSyncedWorkflow.draftStatus === "ready"
    ) {
      setDraft(chatSyncedWorkflow.draftContent);
    }
    const resolved = resolvedTypeLabel(chatSyncedWorkflow);
    if (resolved && resolved !== type) {
      setType(resolved);
    } else if (
      chatSyncedWorkflow.selectedTypeLabel &&
      chatSyncedWorkflow.selectedTypeLabel !== type
    ) {
      setType(chatSyncedWorkflow.selectedTypeLabel);
    }
  }, [companionBuilderMode, chatSyncedWorkflow, createBuilderPhase, type]);

  const focusElementId =
    focusField === "create-topic"
      ? "workspace-field-create-topic"
      : focusField === "create-brief"
        ? "workspace-field-create-brief"
        : null;

  useWorkspaceFieldFocus(focusField, focusStamp, focusElementId, [
    type,
    editingTopic,
  ]);

  function note(msg: string) {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2200);
  }

  async function run(
    t: string,
    b: string,
    tn: string,
    wf: CreateWorkflowState = workflowRef.current,
    opts?: { fromChatApproval?: boolean },
  ): Promise<boolean> {
    const resolvedBrief = b.trim() || buildFullCreateBrief(wf);
    const validation = validateCreateForBuild(wf, {
      fromChatApproval: opts?.fromChatApproval,
      brief: resolvedBrief,
    });
    logCreateBuild("Create Session Loaded", {
      itemType: validation.itemType,
      subtype: validation.subtype,
      template: validation.templateName,
      answersCount: validation.answersCount,
      readyToBuild: validation.readyToBuild,
      draftStatus: wf.draftStatus,
    });
    logCreateBuild(`Answers Found: ${validation.answersCount}`);

    const resolvedType = t.trim() || validation.itemType || type;

    if (!validation.ok) {
      logCreateError({
        itemType: validation.itemType || "(missing)",
        template: validation.templateName,
        answersCount: validation.answersCount,
        step: "validate",
        message: `Missing: ${validation.missing.join(", ")}`,
      });
      setError(true);
      setWorkflow((prev) => ({
        ...prev,
        draftStatus: "error",
        buildApproved: false,
        step: prev.step === "improve" ? "readiness" : prev.step,
      }));
      return false;
    }

    if (!resolvedType.trim() && !resolvedBrief.trim()) {
      logCreateError({
        itemType: resolvedType || "(missing)",
        template: validation.templateName,
        answersCount: validation.answersCount,
        step: "validate",
        message: "No type or brief to generate from",
      });
      setError(true);
      setWorkflow((prev) => ({
        ...prev,
        draftStatus: "error",
        buildApproved: false,
        step: "readiness",
      }));
      return false;
    }

    setLoading(true);
    setError(false);
    setBuildErrorMessage(null);
    setWorkflow((prev) => ({ ...prev, draftStatus: "building" }));
    logCreateBuild("Workspace generating state set", {
      itemType: resolvedType,
      template: validation.templateName,
    });
    logCreateBuild("Draft generation called", {
      itemType: resolvedType,
      template: validation.templateName,
      answersCount: validation.answersCount,
    });
    logCreateBuild("Generation Started", {
      itemType: resolvedType,
      template: validation.templateName,
      answersCount: validation.answersCount,
    });

    try {
      const { contentLanguageHint } = getOutputLanguageContext(getPrefs());
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: resolvedType,
          brief: resolvedBrief,
          tone: tn,
          context: combinedCompanionContextForAI(businessContextSummary(forAvatar)),
          contentLanguageHint,
        }),
      });
      const data = (await res.json()) as {
        result?: string;
        error?: string;
        code?: string;
      };
      if (res.ok && data.result) {
        const content = data.result;
        setDraft(content);
        if (resolvedType && resolvedType !== type) setType(resolvedType);
        const nextWorkflow: CreateWorkflowState = {
          ...wf,
          buildApproved: true,
          draftStatus: "ready",
          draftContent: content,
          step: "improve",
          readinessConfirmed: true,
        };
        workflowRef.current = nextWorkflow;
        setWorkflow(nextWorkflow);
        logCreateBuild("Draft generator returned", {
          itemType: resolvedType,
          length: content.length,
        });
        logCreateBuild("Draft content saved", {
          itemType: resolvedType,
          length: content.length,
        });
        logCreateBuild("Generation Finished");
        setLastActivity({
          kind: "draft",
          title: resolvedBrief || resolvedType || "Draft",
          subtitle: resolvedType || "content",
          contentType: resolvedType,
          content,
        });
        return true;
      }
      const errMsg = data.error || `HTTP ${res.status}`;
      const userMessage =
        data.code === "missing_api_key" || /api key/i.test(errMsg)
          ? "Draft generation isn’t set up on the server yet. The site admin needs to add OPENAI_API_KEY in Vercel and redeploy."
          : "Something went wrong creating your draft. Try again, or add more detail.";
      logCreateError({
        itemType: resolvedType,
        template: validation.templateName,
        answersCount: validation.answersCount,
        step: "parse",
        message: errMsg,
      });
      logCreateBuild("Draft failed", { message: errMsg });
      logCreateBuild("Generation Failed", { message: errMsg });
      setError(true);
      setBuildErrorMessage(userMessage);
      setWorkflow((prev) => ({
        ...prev,
        buildApproved: false,
        draftStatus: "error",
        step: "readiness",
      }));
      return false;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      logCreateError({
        itemType: resolvedType,
        template: validation.templateName,
        answersCount: validation.answersCount,
        step: "request",
        message: errMsg,
      });
      logCreateBuild("Draft failed", { message: errMsg });
      logCreateBuild("Generation Failed", { message: errMsg });
      setError(true);
      setBuildErrorMessage(
        "Couldn’t reach the server. Check your connection and try again.",
      );
      setWorkflow((prev) => ({
        ...prev,
        buildApproved: false,
        draftStatus: "error",
        step: "readiness",
      }));
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Open from a seed. If it carries a saved draft (Continue), render that
  // exact draft and NEVER regenerate. Only a type/brief seed auto-generates.
  useEffect(() => {
    if (!seed) return;
    const draftKey = seed.draft
      ? `${seed.draft.length}:${seed.draft.slice(0, 48)}:${seed.draft.slice(-48)}`
      : "0";
    const sig = `${seed.type ?? ""}|${seed.topic ?? ""}|${seed.brief ?? ""}|${seed.sourceText ?? ""}|${draftKey}`;
    if (lastSeedSig.current === sig) return;
    lastSeedSig.current = sig;

    setType(
      lockedArtifactType
        ? normalizeArtifactType(lockedArtifactType)
        : isUnresolvedCreateType(seed.type)
          ? ""
          : (seed.type ?? ""),
    );
    const t = seed.topic ?? seed.brief ?? "";
    setTopic(t);
    setBrief(t);
    setSourceText(seed.sourceText ?? "");
    setEditingTopic(false);

    if (seed.draft) {
      const resolvedType = lockedArtifactType
        ? normalizeArtifactType(lockedArtifactType)
        : (seed.type ?? "");
      const scaffold = resolvedType ? blankScaffoldForType(resolvedType) : "";
      const isScaffold =
        scaffold.trim().length > 0 && seed.draft.trim() === scaffold.trim();
      const liveDraftActive =
        workflowRef.current.step === "improve" && workflowRef.current.buildApproved;
      if (liveDraftActive && seed.type === type) {
        setDraft(seed.draft);
        setWorkflow(liveCreateWorkflowState(resolvedType, workflowRef.current));
        started.current = true;
      } else if (isScaffold && workspaceMode) {
        setDraft(seed.draft);
        setWorkflow(liveCreateWorkflowState(resolvedType));
        started.current = true;
      } else if (isScaffold) {
        setDraft("");
        setWorkflow(advanceAfterTypePick(resolvedType, categoryIdForType(resolvedType)));
      } else {
        setDraft(seed.draft);
        setWorkflow(liveCreateWorkflowState(resolvedType, workflowRef.current));
        started.current = true;
      }
    } else if (seed.type && seed.autoGenerate && false) {
      // Create 2.0 — never auto-generate; user approves at readiness.
    } else if (seed.type && !isUnresolvedCreateType(seed.type)) {
      setDraft("");
      if (seed.createWorkflow) {
        const label = seed.type;
        setWorkflow(
          reconcileTemplateForType(
            mergeCreateWorkflow(seed.createWorkflow, seed.createWorkflow, label),
          ),
        );
      } else if (companionBuilderMode) {
        setWorkflow(
          reconcileTemplateForType({
            ...advanceAfterItemPick(seed.type),
            questionMode: "split_screen",
          }),
        );
      } else {
        setWorkflow(normalizeSimplifiedCreateWorkflow(advanceAfterItemPick(seed.type)));
      }
      started.current = true;
    } else if (companionBuilderMode) {
      setDraft("");
      setWorkflow({
        ...EMPTY_CREATE_WORKFLOW,
        questionMode: "split_screen",
      });
      started.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // Cursor lands in the writing area the moment a draft exists.
  useEffect(() => {
    if (draft) draftRef.current?.focus();
  }, [draft]);

  useEffect(() => {
    if (!draftScrollTarget?.trim() || !draftScrollStamp) return;
    const el = document.querySelector<HTMLTextAreaElement>(
      "[data-draft-workspace-editor]",
    );
    if (!el) return;
    const target = draftScrollTarget.trim().toLowerCase();
    const idx = el.value.toLowerCase().indexOf(target);
    if (idx >= 0) {
      el.focus();
      el.setSelectionRange(idx, idx + draftScrollTarget.trim().length);
      el.scrollTop = Math.max(0, idx / 2 - 80);
    }
  }, [draftScrollTarget, draftScrollStamp, draft]);

  useEffect(() => {
    if (
      !workspaceMode ||
      !draft.trim() ||
      !type ||
      savedArtifact ||
      !onSavedArtifactChange
    ) {
      return;
    }
    onSavedArtifactChange(
      emptySavedArtifact(type, title.trim() || topic || brief || type),
    );
  }, [
    workspaceMode,
    draft,
    type,
    savedArtifact,
    title,
    topic,
    brief,
    onSavedArtifactChange,
  ]);

  useEffect(() => {
    if (!exportTrigger) return;
    if (exportTrigger === "save") handleSave();
    else if (exportTrigger === "copy") {
      void navigator.clipboard?.writeText(draft);
      note("Copied ✓");
    } else if (exportTrigger === "google-doc") {
      void handleOpenGoogle("doc");
    } else if (exportTrigger === "print") {
      exportPrintRef.current?.click();
    } else if (exportTrigger === "add-to-project") {
      handleAddToProject();
    } else if (exportTrigger === "show-location") {
      setLocationPanelOpen(true);
    }
    onExportTriggerHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTrigger]);

  function artifactTitleValue() {
    return (title.trim() || topic || brief || type || "Draft").slice(0, 80);
  }

  function exportGuard(): string | null {
    return validateArtifactForExport(savedArtifact, draft, artifactTitleValue());
  }

  function handleSave() {
    if (!draft.trim()) return;
    const artifactTitle = artifactTitleValue();
    const artifactType = type || "content";
    const existingId = savedArtifact?.savedWorkId ?? savedArtifact?.templateId;
    let savedWorkId = existingId;

    if (existingId) {
      updateSavedWork(existingId, {
        title: artifactTitle,
        body: draft,
        artifactType,
        status: "saved",
      });
    } else {
      const item = createSavedWork({
        title: artifactTitle,
        artifactType,
        body: draft,
        status: "saved",
        sourceWorkspace: "content-generator",
      });
      savedWorkId = item.id;
    }

    if (!savedWorkId) return;

    if (onSavedArtifactChange) {
      onSavedArtifactChange(
        recordAfterSavedWorkSave(
          savedArtifact ?? null,
          artifactType,
          artifactTitle,
          savedWorkId,
          draft,
        ),
      );
    }
    setLocationPanelOpen(true);
    note(existingId ? "Updated in Saved Work ✓" : "Saved to Saved Work ✓");
    onWin?.(artifactTitle);
  }

  function handleProjectPicked(project: Project) {
    if (!onSavedArtifactChange) return;
    const base =
      savedArtifact ?? emptySavedArtifact(type, artifactTitleValue());
    if (base.savedWorkId) {
      linkSavedWorkToProject(base.savedWorkId, project.id, project.name);
    }
    onSavedArtifactChange(recordAfterProjectLink(base, project.id, project.name));
    note(`Added to project “${project.name}” ✓`);
  }

  function handleAddToProject() {
    if (!draft.trim()) return;
    setProjectPickerOpen(true);
  }

  function handleGoogleDocCreated(
    url: string,
    docId?: string,
    kind: GoogleFileKind = "doc",
  ) {
    const session = buildGoogleWorkspaceSession({
      kind,
      url,
      title: artifactTitleValue(),
      artifactType: type || "Document",
      content: draft,
      fileId: docId,
    });
    if (session && onOpenGoogleWorkspace) {
      onOpenGoogleWorkspace(session);
      return;
    }
    if (!onSavedArtifactChange) return;
    const base =
      savedArtifact ?? emptySavedArtifact(type, artifactTitleValue());
    if (base.savedWorkId) {
      markSavedWorkExported(base.savedWorkId, url, docId);
    }
    onSavedArtifactChange(recordAfterGoogleDoc(base, url, docId));
    note("Created Google Doc ✓");
  }

  async function handleOpenGoogle(kind: GoogleFileKind) {
    const block = exportGuard();
    if (block) {
      note(block);
      return;
    }
    if (!draft.trim()) {
      setGoogleExportError("There is no draft content to export yet.");
      return;
    }
    setGoogleExportError(null);
    try {
      const r = await fetch("/api/google/create-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: artifactTitleValue(),
          content: draft,
          kind,
        }),
      });
      const j = (await r.json()) as { url?: string; id?: string; error?: string };
      if (!r.ok) {
        const short =
          r.status === 401
            ? "Connect Google in Settings first."
            : j.error || "Something went wrong sending this to Google Docs.";
        setGoogleExportError(short);
        onExportGuidance?.(`${short}\n\n${copyPasteFallbackMessage(kind)}`);
        return;
      }
      if (j.url) {
        handleGoogleDocCreated(j.url, j.id, kind);
        note("Opened in Google Docs ✓");
      } else {
        setGoogleExportError("Something went wrong sending this to Google Docs.");
        onExportGuidance?.(copyPasteFallbackMessage(kind));
      }
    } catch {
      setGoogleExportError("Something went wrong sending this to Google Docs.");
      onExportGuidance?.(copyPasteFallbackMessage(kind));
    }
  }

  function handleDownloadDraft() {
    try {
      const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${artifactTitleValue().replace(/[^\w.-]+/g, "-").slice(0, 40)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      note("Couldn't download.");
    }
  }

  function handleMarkReady() {
    if (!draft.trim()) return;
    setPhase("ready");
    onArtifactReady?.(artifactReadyMessage(type || "Document", artifactTitleValue()));
  }

  function handleDownloadPdf() {
    exportPrintRef.current?.click();
  }

  function handleShowLocation() {
    setLocationPanelOpen((o) => !o);
  }

  function pickCreateType(
    typeLabel: string,
    opts?: { bypassRoute?: boolean; categoryId?: string | null; skipWorkflow?: boolean },
  ) {
    const item = findCatalogItem(typeLabel);
    if (item?.route && !opts?.bypassRoute) {
      onOpenSection?.(item.route);
      return;
    }
    setType(typeLabel);
    setTopic("");
    setBrief("");
    setEditingTopic(false);
    setDraft("");
    if (!opts?.skipWorkflow && !companionBuilderMode) {
      setWorkflow(reconcileTemplateForType(advanceAfterItemPick(typeLabel)));
    } else if (companionBuilderMode) {
      const advanced = reconcileTemplateForType(advanceAfterItemPick(typeLabel));
      setWorkflow({
        ...advanced,
        questionMode: "split_screen",
        sessionId: workflowRef.current.sessionId ?? advanced.sessionId,
      });
      onCompanionTypePick?.(typeLabel);
    }
    started.current = false;
  }

  const inputCls =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
  const label = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

  const workspaceRecord =
    savedArtifact ??
    (workspaceMode && type && showDraftEditor
      ? emptySavedArtifact(type, artifactTitleValue())
      : null);

  function handleBuildDraft(
    briefText: string,
    typeOverride?: string,
    wfOverride?: CreateWorkflowState,
    fromChat = false,
  ) {
    const wf = wfOverride ?? workflowRef.current;
    if (wfOverride) {
      workflowRef.current = wfOverride;
      setWorkflow(wfOverride);
    }
    const resolved =
      typeOverride?.trim() || resolvedTypeLabel(wf) || type;
    if (typeOverride?.trim() && typeOverride !== type) {
      setType(typeOverride);
    } else if (resolved && resolved !== type) {
      setType(resolved);
    }
    logCreateBuild(fromChat ? "sharedBuildDraftCalled" : "Build Draft Clicked", {
      itemType: resolved,
      mode: wf.questionMode ?? (companionBuilderMode ? "split_screen" : "create_only"),
      answersCount: Object.values(wf.discoveryAnswers).filter((v) => v.trim())
        .length,
    });
    const fullBrief = briefText.trim() || buildFullCreateBrief(wf);
    setBrief(fullBrief);
    setTopic(fullBrief);
    return run(resolved, fullBrief, tone, wf, { fromChatApproval: fromChat });
  }

  const sharedBuildDraftRef = useRef<
    (params: CreateBuildDraftParams) => Promise<boolean>
  >(async () => false);

  sharedBuildDraftRef.current = async (params: CreateBuildDraftParams) => {
    const mode =
      params.mode ??
      params.workflow.questionMode ??
      (companionBuilderMode ? "split_screen" : "create_only");
    logSharedBuildDraftCalled({
      type: params.type,
      fromChat: params.fromChat,
      mode,
    });
    const wf = {
      ...params.workflow,
      draftStatus: "building" as const,
      questionMode:
        mode === "split_screen" ? ("split_screen" as const) : params.workflow.questionMode,
      buildApproved: false,
      step: "readiness" as const,
    };
    workflowRef.current = wf;
    setWorkflow(wf);
    setLoading(true);
    setError(false);
    setBuildErrorMessage(null);
    logCreateBuild("Workspace generating state set", {
      itemType: params.type,
      source: params.fromChat ? "chat-build" : "create-only",
      mode,
    });
    const ok = await handleBuildDraft(
      params.brief,
      params.type,
      wf,
      params.fromChat ?? false,
    );
    if (ok) {
      const content = workflowRef.current.draftContent ?? "";
      logDraftGenerated(params.type, content.length);
      logDraftRenderedInWorkspace(params.type, content.length);
      if (params.fromChat) {
        onChatBuildComplete?.({
          draft: content,
          workflow: workflowRef.current,
        });
      }
    } else if (params.fromChat) {
      logDraftGenerationFailed(params.type, "generation-failed");
      onChatBuildFailed?.();
    }
    return ok;
  };

  useEffect(() => {
    if (!onRegisterBuildDraft) return;
    onRegisterBuildDraft((params) => sharedBuildDraftRef.current(params));
    return () => onRegisterBuildDraft(null);
  }, [onRegisterBuildDraft]);

  const lastChatBuildKey = useRef(0);
  useEffect(() => {
    if (!chatBuildRequest || chatBuildRequest.key === lastChatBuildKey.current) {
      return;
    }
    lastChatBuildKey.current = chatBuildRequest.key;
    void sharedBuildDraftRef.current({
      brief: chatBuildRequest.brief,
      type: chatBuildRequest.type,
      workflow: chatBuildRequest.workflow ?? workflowRef.current,
      fromChat: true,
      mode: "split_screen",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatBuildRequest]);

  const lastChatReviseKey = useRef(0);
  useEffect(() => {
    if (!chatReviseRequest || chatReviseRequest.key === lastChatReviseKey.current) {
      return;
    }
    lastChatReviseKey.current = chatReviseRequest.key;
    const instruction = chatReviseRequest.instruction;
    if (!instruction || !draft.trim()) {
      onChatReviseComplete?.();
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: draft,
            action: "modify",
            instruction,
            context: combinedCompanionContextForAI(businessContextSummary()),
          }),
        });
        const data = await res.json();
        if (res.ok && data.result) {
          setDraft(data.result);
          setLastActivity({
            kind: "draft",
            title: brief || type || "Draft",
            subtitle: type || "content",
            contentType: type,
            content: data.result,
          });
        }
      } catch {
        /* refine failed — user can retry from panel */
      } finally {
        onChatReviseComplete?.();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatReviseRequest]);

  function resetLocalCreateState() {
    setType("");
    setDraft("");
    setTopic("");
    setBrief("");
    setTitle("");
    setEditingTopic(false);
    setWorkflow(EMPTY_CREATE_WORKFLOW);
    setPhase("building");
    started.current = false;
    lastSeedSig.current = "";
  }

  function handleChangeType() {
    if (onChangeType) {
      onChangeType();
      return;
    }
    resetLocalCreateState();
  }

  function handleCreateOption(action: CreateOptionsAction) {
    if (action === "change-type") {
      handleChangeType();
      return;
    }
    if (action === "save-for-later") {
      if (draft.trim()) handleSave();
      onSaveForLater?.();
      if (!onSaveForLater) note("Saved — pick this up anytime from Create.");
      return;
    }
    if (action === "start-over") {
      resetLocalCreateState();
      onStartOver?.();
      if (!onStartOver) note("Fresh start — choose what to create.");
      return;
    }
    if (action === "delete-draft") {
      setConfirmDeleteDraft(true);
    }
  }

  const showCreateOptions =
    !showDraftEditor &&
    (workspaceMode || Boolean(type) || workflow.step !== "category" || Boolean(draft));

  return (
    <div className="companion-fade-in flex h-full min-h-0 flex-col">
      <ConfirmDialog
        open={confirmDeleteDraft}
        title="Delete this draft permanently?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setConfirmDeleteDraft(false)}
        onConfirm={() => {
          setConfirmDeleteDraft(false);
          resetLocalCreateState();
          onDeleteDraft?.();
          if (!onDeleteDraft) note("Draft removed.");
        }}
      />
      {!workspaceMode && (
        <WorkspaceSopProgress session={sopSession ?? null} />
      )}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          workspaceMode ? "" : "mx-auto max-w-2xl overflow-y-auto px-6 py-8"
        }`}
      >
      {showCreateOptions && (
        <div
          className={`flex shrink-0 items-center justify-end ${
            workspaceMode
              ? "border-b border-[#e7dfd4] bg-[#faf7f2]/98 px-4 py-2"
              : "mb-3"
          }`}
        >
          <CreateOptionsMenu
            onAction={handleCreateOption}
            changeTypeDisabled={typeLocked}
          />
        </div>
      )}
      {type && brief && showDraftEditor && !(workspaceMode && phase === "ready") && (
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-[#6b635a]">
            <span className="font-semibold text-[#1f1c19]">{type}</span>
            {brief ? (
              <>
                {" "}
                — <span className="text-[#1e4f4f]">{brief}</span>
              </>
            ) : null}
          </p>
        </div>
      )}

      {showBuildingState && (
        <div className="companion-fade-in mt-8 flex flex-1 flex-col justify-center text-center">
          <p className="text-xl font-semibold text-[#1f1c19]">
            Creating your draft…
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            This usually takes a few seconds.
          </p>
          <p className="mt-3 text-sm text-[#9a8f82]">
            {BUILD_DRAFT_LOADING_MESSAGES[loadingMessageIndex]}
          </p>
        </div>
      )}

      {showSplitTypePicker && (
        <CreateTypePicker
          onPick={(label) =>
            pickCreateType(label, {
              bypassRoute: true,
              categoryId: categoryIdForType(label),
            })
          }
        />
      )}

      {showSplitScreenStatus && (
        <CreateDiscoveryWorkspace
          workflow={workflow}
          workspacePhase={workspacePhase}
          loadingMessageIndex={loadingMessageIndex}
          errorMessage={buildErrorMessage}
          building={loading || workflow.draftStatus === "building"}
          audienceStepActive={audienceStepActive}
          selectedAudienceNames={selectedAudienceNames}
          onAudienceChange={(names) => {
            const label = names.join(", ");
            setWorkflow((prev) => ({
              ...prev,
              discoveryAnswers: { ...prev.discoveryAnswers, audience: label },
            }));
          }}
          onAudienceConfirm={
            onDiscoveryAudiencePick
              ? () => {
                  const label = workflowRef.current.discoveryAnswers.audience?.trim();
                  if (label) onDiscoveryAudiencePick(label);
                }
              : undefined
          }
          onBuildDraft={
            workspacePhase === "ready"
              ? () => onCompanionBuilderAction?.("build-draft")
              : undefined
          }
          onTryAgain={
            workspacePhase === "error"
              ? () => {
                  setError(false);
                  setBuildErrorMessage(null);
                  setWorkflow((prev) => ({ ...prev, draftStatus: "idle" }));
                  onCompanionBuilderAction?.("retry");
                }
              : undefined
          }
          onAddMoreDetail={
            workspacePhase === "error"
              ? () => {
                  setError(false);
                  setBuildErrorMessage(null);
                  setWorkflow((prev) => enterAddDetailStep(prev));
                  onCompanionBuilderAction?.("add-detail");
                }
              : undefined
          }
          onCopyAnswers={
            workspacePhase === "error"
              ? () => {
                  const text = buildFullCreateBrief(workflowRef.current);
                  if (text.trim()) void navigator.clipboard?.writeText(text);
                }
              : undefined
          }
        />
      )}

      {inGuidedCreate &&
        !showDraftEditor &&
        !(workspaceMode && phase === "ready") &&
        !showBuildingState && (
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <CreateWorkflowPanel
            workflow={workflow}
            typeLabel={type}
            onWorkflowChange={setWorkflow}
            onTypeSelect={(label, categoryId) =>
              pickCreateType(label, {
                categoryId,
                bypassRoute: true,
                skipWorkflow: true,
              })
            }
            onRoutedItem={(section) => onOpenSection?.(section)}
            onBuildDraft={(briefText) =>
              void sharedBuildDraftRef.current({
                brief: briefText,
                type: resolvedTypeLabel(workflow) || type,
                workflow: workflowRef.current,
                fromChat: false,
                mode: companionBuilderMode ? "split_screen" : "create_only",
              })
            }
            onBuildWithShari={onBuildWithShari}
            building={loading}
            buildError={workflow.draftStatus === "error" || error}
            buildErrorMessage={buildErrorMessage}
            onClearBuildError={() => {
              setError(false);
              setBuildErrorMessage(null);
              setWorkflow((prev) => ({ ...prev, draftStatus: "idle" }));
            }}
            onAddMoreDetail={() =>
              setWorkflow((prev) => enterAddDetailStep(prev))
            }
            companionDriven={Boolean(onBuildWithShari)}
          />
        </div>
      )}
      {showDraftEditor && workspaceMode && (
        <DraftWorkspacePanel
          itemType={type || resolvedTypeLabel(workflow) || "Draft"}
          templateName={
            workflow.useTemplate ? resolveTemplateName(workflow) : null
          }
          draft={draft}
          onDraftChange={setDraft}
          onApplyDraft={(next) => {
            setDraft(next);
            setLastActivity({
              kind: "draft",
              title: brief || type || "Draft",
              subtitle: type || "content",
              contentType: type,
              content: next,
            });
          }}
          onGoogleDoc={() => handleOpenGoogle("doc")}
          onCopy={() => {
            void navigator.clipboard?.writeText(draft);
            note("Copied ✓");
          }}
          onPrint={() => exportPrintRef.current?.click()}
          onDownload={handleDownloadDraft}
          onAddToProject={handleAddToProject}
          onRegenerate={
            workflow.buildApproved || workflow.draftStatus === "ready"
              ? () =>
                  void sharedBuildDraftRef.current({
                    brief: buildFullCreateBrief(workflowRef.current),
                    type: resolvedTypeLabel(workflowRef.current) || type,
                    workflow: workflowRef.current,
                    fromChat: false,
                    mode: companionBuilderMode ? "split_screen" : "create_only",
                  })
              : undefined
          }
          onMoreAction={handleCreateOption}
          changeTypeDisabled={typeLocked}
          googleExportError={googleExportError}
          onClearGoogleError={() => setGoogleExportError(null)}
          busy={loading}
        />
      )}

      {showDraftEditor && workspaceMode ? (
        <div className="sr-only" aria-hidden>
          <ExportActions
            text={draft}
            title={artifactTitleValue()}
            printButtonRef={exportPrintRef}
            docButtonRef={exportDocRef}
            onGoogleDocCreated={handleGoogleDocCreated}
            variant="workspace"
            onBeforeAction={exportGuard}
          />
        </div>
      ) : null}

      {showDraftEditor && workflow.draftStatus === "building" && (
        <div className="mb-3 rounded-xl border border-[#d4a574]/40 bg-[#faf3e8] px-4 py-2 text-sm text-[#5c4f3f]">
          <span className="font-semibold text-[#1f1c19]">Draft status: Building</span>
          <span className="text-[#6b635a]">
            {" "}
            — add hooks, anecdotes, stories, and CTAs in chat; pieces merge here.
          </span>
        </div>
      )}

      {showDraftEditor && !workspaceMode && (
        <div
          className={`companion-fade-in flex min-h-0 flex-1 flex-col ${
            workspaceMode ? "overflow-y-auto px-4 py-3" : "mt-6"
          }`}
        >
          {!workspaceMode && <p className={label}>Your draft</p>}
          <textarea
            ref={draftRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`min-h-[240px] w-full flex-1 resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f] ${
              workspaceMode ? "mt-0" : "mt-2"
            }`}
          />

          <CreateDraftImprove
            draft={draft}
            onApply={(next) => {
              setDraft(next);
              setLastActivity({
                kind: "draft",
                title: brief || type || "Draft",
                subtitle: type || "content",
                contentType: type,
                content: next,
              });
            }}
            disabled={loading}
            onSave={handleSave}
            onAddToProject={handleAddToProject}
            onCopy={() => {
              void navigator.clipboard?.writeText(draft);
              note("Copied ✓");
            }}
            onPrint={() => exportPrintRef.current?.click()}
            onGoogleDoc={() => exportDocRef.current?.click()}
          />

          {!workspaceMode && (
            <>
              <details className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/70 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]">
                  More actions ▼
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`Name this ${type || "content"} (for saving)`}
                    className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base outline-none focus:border-[#1e4f4f]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(draft);
                        note("Copied ✓");
                      }}
                      className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                    >
                      Save to Saved Work
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToProject}
                      className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
                    >
                      Add to project
                    </button>
                  </div>
                  <ExportActions
                    text={draft}
                    title={title.trim() || type || "content"}
                    social={/post|social|tweet|thread|reel/i.test(type)}
                  />
                </div>
              </details>
              {flash && (
                <p className="mt-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
              )}
            </>
          )}
        </div>
      )}
      </div>
      <ProjectPickerModal
        open={projectPickerOpen}
        artifactTitle={artifactTitleValue()}
        preferredProjectName={projectPickerPrefill ?? undefined}
        onClose={() => setProjectPickerOpen(false)}
        onSelect={handleProjectPicked}
      />
    </div>
  );
}
