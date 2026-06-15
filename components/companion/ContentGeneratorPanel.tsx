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
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
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
import { ArtifactWorkspaceHeader } from "@/components/companion/ArtifactWorkspaceHeader";
import { ArtifactReadyPanel } from "@/components/companion/ArtifactReadyPanel";
import { ProjectPickerModal } from "@/components/companion/ProjectPickerModal";
import {
  artifactReadyMessage,
  buildGoogleWorkspaceSession,
  type GoogleFileKind,
  type GoogleWorkspaceSession,
} from "@/lib/googleWorkspace";
import { copyPasteFallbackMessage } from "@/lib/collaborativeDocumentWorkflow";
import { type CreateCatalogItem, findCatalogItem } from "@/lib/createCatalog";
import {
  CREATE_FEATURED,
  matchCreateSearch,
  resolveFeaturedType,
} from "@/lib/createWorkspaceUx";
import {
  advanceAfterTypePick,
  categoryIdForType,
  EMPTY_CREATE_WORKFLOW,
  type CreateWorkflowState,
} from "@/lib/createWorkflow";
import { CreateWorkflowPanel } from "@/components/companion/CreateWorkflowPanel";
import { blankScaffoldForType } from "@/lib/createInitialization";
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
  const [flash, setFlash] = useState<string | null>(null);
  const [forAvatar, setForAvatar] = useState<string | undefined>(undefined);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [phase, setPhase] = useState<"building" | "ready">("building");
  const [createSearch, setCreateSearch] = useState("");
  const [workflow, setWorkflow] = useState<CreateWorkflowState>(EMPTY_CREATE_WORKFLOW);
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
  const inGuidedCreate = !workflow.buildApproved;
  const showDraftEditor = Boolean(draft) && workflow.buildApproved;

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
          : "Choosing content type";
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

  async function run(t: string, b: string, tn: string) {
    if (!t.trim() && !b.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const { contentLanguageHint } = getOutputLanguageContext(getPrefs());
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: t,
          brief: b,
          tone: tn,
          context: businessContextSummary(forAvatar),
          contentLanguageHint,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setDraft(data.result);
        // Remember this draft so the home Continue card can resume it.
        setLastActivity({
          kind: "draft",
          title: b || t || "Draft",
          subtitle: t || "content",
          contentType: t,
          content: data.result,
        });
      } else setError(true);
    } catch {
      setError(true);
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
      if (isScaffold) {
        setDraft("");
        setWorkflow(advanceAfterTypePick(resolvedType, categoryIdForType(resolvedType)));
      } else {
        setDraft(seed.draft);
        setWorkflow({
          ...EMPTY_CREATE_WORKFLOW,
          step: "improve",
          buildApproved: true,
          readinessConfirmed: true,
          categoryId: categoryIdForType(resolvedType),
        });
        started.current = true;
      }
    } else if (seed.type && seed.autoGenerate && false) {
      // Create 2.0 — never auto-generate; user approves at readiness.
    } else if (seed.type) {
      setDraft("");
      setWorkflow(advanceAfterTypePick(seed.type, categoryIdForType(seed.type)));
      started.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // Cursor lands in the writing area the moment a draft exists.
  useEffect(() => {
    if (draft) draftRef.current?.focus();
  }, [draft]);

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
      exportDocRef.current?.click();
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
      if (!r.ok) {
        const short =
          r.status === 401
            ? "Connect Google in Settings first."
            : "Couldn't open Google — try again.";
        note(short);
        onExportGuidance?.(
          `${short}\n\n${copyPasteFallbackMessage(kind)}`,
        );
        return;
      }
      const j = await r.json();
      if (j.url) {
        handleGoogleDocCreated(j.url, j.id as string | undefined, kind);
      } else {
        onExportGuidance?.(copyPasteFallbackMessage(kind));
      }
    } catch {
      note("Couldn't open Google — try again.");
      onExportGuidance?.(copyPasteFallbackMessage(kind));
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

  function pickCreateType(typeLabel: string, opts?: { bypassRoute?: boolean }) {
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
    setWorkflow(advanceAfterTypePick(typeLabel, categoryIdForType(typeLabel)));
    started.current = false;
  }

  function handleFeaturedSelect(label: string) {
    const featured = CREATE_FEATURED.find((f) => f.label === label);
    if (!featured) return;
    if (featured.label === "Workshop") {
      pickCreateType("Workshop", { bypassRoute: true });
      return;
    }
    pickCreateType(resolveFeaturedType(featured));
  }

  function handleCreateSearchSubmit() {
    const q = createSearch.trim();
    if (!q) return;
    const match = matchCreateSearch(q);
    if (match?.route) {
      onOpenSection?.(match.route);
      return;
    }
    if (match?.type) {
      pickCreateType(match.type);
      setBrief(q);
      setTopic(q);
      return;
    }
    pickCreateType(q);
    setBrief(q);
    setTopic(q);
  }

  function handleCatalogSelect(item: CreateCatalogItem) {
    if (item.route) {
      onOpenSection?.(item.route);
      return;
    }
    pickCreateType(item.label);
  }

  const inputCls =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
  const label = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

  const workspaceRecord =
    savedArtifact ??
    (workspaceMode && type && showDraftEditor
      ? emptySavedArtifact(type, artifactTitleValue())
      : null);

  function handleBuildDraft(briefText: string) {
    setBrief(briefText);
    setTopic(briefText);
    void run(type, briefText, tone);
  }

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
    workspaceMode || Boolean(type) || workflow.step !== "category" || Boolean(draft);

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
      {!(workspaceMode && showDraftEditor) && !type && workflow.step === "category" && (
        <>
          <WorkspaceGuide section="content-generator" />
          <p className="text-2xl font-semibold text-[#1f1c19]">Create Something</p>
          <p className="mt-1 text-base text-[#6b635a]">
            We&apos;ll shape it together — category, a few questions, then your draft.
          </p>
        </>
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

      {loading && inGuidedCreate && workflow.readinessConfirmed && (
        <div className="companion-fade-in mt-8 text-center">
          <p className="text-xl font-semibold text-[#1f1c19]">
            Building your {(type || "draft").toLowerCase()}…
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Using what you shared — not starting from a blank guess.
          </p>
          {error && (
            <button
              type="button"
              onClick={() => run(type, brief, tone)}
              className="mt-3 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              Try again
            </button>
          )}
        </div>
      )}
      {showDraftEditor && workspaceMode && workspaceRecord && phase === "ready" && (
        <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
          <ArtifactReadyPanel
            artifactType={type || "Document"}
            title={artifactTitleValue()}
            draft={draft}
            onOpenGoogle={handleOpenGoogle}
            onCopy={() => {
              void navigator.clipboard?.writeText(draft);
              note("Copied ✓");
            }}
            onDownloadPdf={handleDownloadPdf}
            onEditInCreate={() => setPhase("building")}
            onAddToProject={handleAddToProject}
          />
          <div className="sr-only" aria-hidden>
            <ExportActions
              text={draft}
              title={artifactTitleValue()}
              printButtonRef={exportPrintRef}
              variant="workspace"
            />
          </div>
        </div>
      )}

      {showDraftEditor && workspaceMode && workspaceRecord && phase === "building" && (
        <ArtifactWorkspaceHeader
          record={workspaceRecord}
          draft={draft}
          title={title}
          onTitleChange={setTitle}
          onEdit={() => draftRef.current?.focus()}
          onSave={handleSave}
          onSaveAgain={handleSave}
          onAddToProject={handleAddToProject}
          onShowLocation={handleShowLocation}
          onOpenSavedWork={onOpenSavedWork}
          onMarkReady={handleMarkReady}
          googleFirst
          onCopy={() => {
            void navigator.clipboard?.writeText(draft);
            note("Copied ✓");
          }}
          docButtonRef={exportDocRef}
          printButtonRef={exportPrintRef}
          onGoogleDocCreated={handleGoogleDocCreated}
          onBeforeExport={exportGuard}
          flash={flash}
          locationOpen={locationPanelOpen}
          onLocationOpenChange={setLocationPanelOpen}
        />
      )}

      {inGuidedCreate && !showDraftEditor && !(workspaceMode && phase === "ready") && (
        <div className="mt-5 flex flex-col gap-3">
          {workflow.step === "category" && (
            <div className="companion-fade-in mb-2">
              <input
                type="search"
                value={createSearch}
                onChange={(e) => setCreateSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateSearchSubmit();
                  }
                }}
                placeholder="Or search for a type…"
                className="w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {CREATE_FEATURED.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleFeaturedSelect(item.label)}
                    className="rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1f1c19] hover:bg-[#f0f5f5]"
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <CreateWorkflowPanel
            workflow={workflow}
            typeLabel={type}
            onWorkflowChange={setWorkflow}
            onTypeSelect={(label) => setType(label)}
            onRoutedItem={(section) => onOpenSection?.(section)}
            onBuildDraft={handleBuildDraft}
            building={loading}
          />
        </div>
      )}

      {showDraftEditor && !(workspaceMode && phase === "ready") && (
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
          />

          {!workspaceMode && (
            <>
              <details className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/70 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]">
                  More actions ▼
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  {onBuildWithShari && (
                    <button
                      type="button"
                      onClick={() =>
                        onBuildWithShari({
                          itemType: type || "content",
                          title: title.trim() || topic || brief || type || "Draft",
                          draftContent: draft,
                          brief: brief || topic,
                          stage: "editing draft",
                        })
                      }
                      className="w-fit rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                    >
                      Continue with Shari in chat
                    </button>
                  )}
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
