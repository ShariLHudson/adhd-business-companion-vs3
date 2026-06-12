"use client";

import { useEffect, useRef, useState } from "react";
import {
  businessContextSummary,
  getContentTypes,
  getAvatars,
  getPrefs,
  getOutputLanguageContext,
  setLastActivity,
  type TemplateCategory,
  type IdealClientAvatar,
} from "@/lib/companionStore";
import { ClientPicker } from "@/components/companion/ClientPicker";
import { RefineActions } from "@/components/companion/RefineActions";
import { RemixActions } from "@/components/companion/RemixActions";
import { ScoreActions } from "@/components/companion/ScoreActions";
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
import {
  isProposalArtifact,
  normalizeArtifactType,
  type ArtifactExportAction,
} from "@/lib/artifactType";
import { CreateCatalogPicker } from "@/components/companion/CreateCatalogPicker";
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
import { type CreateCatalogItem } from "@/lib/createCatalog";
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
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [multi, setMulti] = useState<
    { name: string; emoji?: string; text: string }[] | null
  >(null);
  const [multiLoading, setMultiLoading] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [phase, setPhase] = useState<"building" | "ready">("building");
  const [showMore, setShowMore] = useState(false); // compose advanced options
  const [showTools, setShowTools] = useState(false); // post-draft editing tools
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

  useEffect(() => {
    setAvatars(getAvatars());
    setAdvanced(getPrefs().advancedAiTools);
  }, []);

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

  // Multi-Avatar mode — one tailored version per avatar (campaigns/testing).
  async function runAll() {
    if (!type.trim() && !brief.trim()) return;
    setMultiLoading(true);
    setMulti([]);
    const out: { name: string; emoji?: string; text: string }[] = [];
    const { contentLanguageHint } = getOutputLanguageContext(getPrefs());
    for (const a of avatars) {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            brief,
            tone,
            context: businessContextSummary(a.id),
            contentLanguageHint,
          }),
        });
        const data = await res.json();
        out.push({
          name: a.name,
          emoji: a.emoji,
          text: res.ok && data.result ? data.result : "(couldn't generate)",
        });
        setMulti([...out]);
      } catch {
        out.push({ name: a.name, emoji: a.emoji, text: "(couldn't generate)" });
        setMulti([...out]);
      }
    }
    setMultiLoading(false);
  }

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
      setDraft(seed.draft);
      started.current = true;
    } else if (seed.type && seed.autoGenerate) {
      setDraft("");
      started.current = true;
      void run(seed.type, t, tone);
    } else if (seed.type) {
      setDraft("");
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

  function handleCatalogSelect(item: CreateCatalogItem) {
    if (item.route) {
      onOpenSection?.(item.route);
      return;
    }
    setType(item.label);
    setEditingTopic(false);
  }

  const inputCls =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
  const label = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

  const workspaceRecord =
    savedArtifact ??
    (workspaceMode && type && draft
      ? emptySavedArtifact(type, artifactTitleValue())
      : null);

  return (
    <div className="companion-fade-in flex h-full min-h-0 flex-col">
      {!workspaceMode && (
        <WorkspaceSopProgress session={sopSession ?? null} />
      )}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          workspaceMode ? "" : "mx-auto max-w-2xl overflow-y-auto px-6 py-8"
        }`}
      >
      {!(workspaceMode && draft) && (
        <>
          <p className="text-2xl font-semibold text-[#1f1c19]">
            {workspaceMode ? "✨ Business Asset Builder" : "✨ Create with Shari"}
          </p>
          <p className="mt-1 text-base text-[#6b635a]">
            {workspaceMode
              ? "Build together here — when it's ready, open in Google Docs, Sheets, or Forms and keep coaching beside you."
              : "Pick what you're building — proposals, SOPs, plans, and more."}
          </p>
        </>
      )}

      {type && (topic || brief) && !(workspaceMode && draft) && (
        <div className="mt-5 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.06] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            You&apos;re creating
          </p>
          {editingTopic ? (
            <input
              id="workspace-field-create-topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setBrief(e.target.value);
              }}
              className={`mt-2 ${inputCls}`}
              placeholder="What's this about?"
              autoFocus
            />
          ) : (
            <p className="mt-1 text-lg font-semibold leading-snug text-[#1f1c19]">
              {type}
              {topic || brief ? (
                <>
                  {" "}
                  about{" "}
                  <span className="text-[#1e4f4f]">{topic || brief}</span>
                </>
              ) : null}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditingTopic((e) => !e)}
              className="rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white/90"
            >
              {editingTopic ? "Done" : "✏️ Edit"}
            </button>
            {!typeLocked && (
              <button
                type="button"
                onClick={() => {
                  setType("");
                  setDraft("");
                  setTopic("");
                  setBrief("");
                  setShowMore(false);
                  setEditingTopic(false);
                  started.current = false;
                }}
                className="rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white/90"
              >
                🔄 Change type
              </button>
            )}
            {typeLocked && (
              <>
                <span className="rounded-lg bg-[#1e4f4f]/10 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]">
                  🔒 {normalizeArtifactType(lockedArtifactType!)}
                </span>
                {/* Escape hatch — type was locked, let the user correct it. */}
                <button
                  type="button"
                  onClick={() => {
                    onChangeType?.();
                    setType("");
                    setDraft("");
                    setTopic("");
                    setBrief("");
                    setShowMore(false);
                    setEditingTopic(false);
                    started.current = false;
                  }}
                  className="rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white/90"
                >
                  🔄 Change type
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Zero-hop: routed from chat with a clear type → no form, straight to
          writing. The draft editor (below) takes over once it's ready. */}
      {seeded && !draft && (
        <div className="companion-fade-in mt-8 text-center">
          <p className="text-xl font-semibold text-[#1f1c19]">
            ✨ Writing your {(type || "draft").toLowerCase()}…
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Pulling it together from what you told me.
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
      {draft && workspaceMode && workspaceRecord && phase === "ready" && (
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

      {draft && workspaceMode && workspaceRecord && phase === "building" && (
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

      {!seeded && !(workspaceMode && draft) && (
      <div className="mt-5 flex flex-col gap-3">
        {/* Entry first — pick what you're making. Tools reveal only after. */}
        {!type && !draft ? (
          <div className="companion-fade-in">
            <p className={label}>What are you creating?</p>
            <p className="mt-0.5 text-sm text-[#6b635a]">
              What are we creating? Business assets, content, plans, or
              implementation.
            </p>
            <div className="mt-3">
              <CreateCatalogPicker
                compact={workspaceMode}
                highlightLabel={lockedArtifactType}
                onSelect={handleCatalogSelect}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className={label}>
              Creating: <span className="text-[#1f1c19]">{type || "content"}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setType("");
                setDraft("");
                setShowMore(false);
              }}
              className="text-sm font-semibold text-[#1e4f4f] hover:underline"
            >
              change
            </button>
          </div>
        )}
        {(type || draft) && (
          <>
        <div>
          <label className={label} htmlFor="cg-brief">
            Brief (optional)
          </label>
          <textarea
            id="cg-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="What's it about? Any details, scaffold, or template…"
            className={`mt-1.5 min-h-[90px] resize-none ${inputCls}`}
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <label className={label} htmlFor="cg-tone">
              Tone
            </label>
            <select
              id="cg-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`mt-1.5 ${inputCls}`}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => run(type, brief, tone)}
            disabled={loading || (!type.trim() && !brief.trim())}
            className="shrink-0 rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
          >
            {loading ? "Writing…" : draft ? "Regenerate" : "✨ Generate"}
          </button>
        </div>
        {/* More options — who it's for + power tools, hidden until needed. */}
        <button
          type="button"
          onClick={() => setShowMore((o) => !o)}
          className="self-start text-sm font-semibold text-[#6b635a] hover:underline"
        >
          {showMore ? "Hide options" : "More options"}
        </button>
        {showMore && (
          <div className="flex flex-col gap-3 rounded-xl border border-[#e7dfd4] bg-white/60 p-3">
            <ClientPicker value={forAvatar} onChange={setForAvatar} />
            {type.trim().toLowerCase() === "email" && onOpen && (
              <button
                type="button"
                onClick={() => onOpen("email-generator")}
                className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
              >
                Tip: the full Email generator does subject lines + sequences →
              </button>
            )}
            {advanced && avatars.length >= 2 && (
              <button
                type="button"
                onClick={runAll}
                disabled={multiLoading || (!type.trim() && !brief.trim())}
                className="self-start rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
              >
                {multiLoading
                  ? `Writing ${avatars.length} versions…`
                  : `🧪 Generate for all ${avatars.length} audiences`}
              </button>
            )}
          </div>
        )}
        {error && (
          <p className="text-sm text-[#a85c4a]">
            Couldn&apos;t generate just now — try again.
          </p>
        )}
          </>
        )}
      </div>
      )}

      {multi && multi.length > 0 && (
        <div className="companion-fade-in mt-6">
          <p className={label}>One version per audience</p>
          <div className="mt-2 flex flex-col gap-4">
            {multi.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#1e4f4f]/20 bg-white/85 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-[#1f1c19]">
                    {m.emoji ?? "👤"} {m.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(m.text);
                      note(`Copied ${m.name}'s version ✓`);
                    }}
                    className="rounded-lg bg-[#1e4f4f]/10 px-3 py-1 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-[#2d2926]">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
          {flash && (
            <p className="mt-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
          )}
        </div>
      )}

      {draft && !(workspaceMode && phase === "ready") && (
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

          {!workspaceMode && (
            <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!workspaceMode && onBuildWithShari && (
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
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                ✨ Build With Shari
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(draft);
                note("Copied ✓");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                workspaceMode
                  ? "bg-[#1e4f4f] text-white hover:bg-[#163a3a]"
                  : "border border-[#1e4f4f]/40 bg-white text-[#1e4f4f] hover:bg-[#f0f5f5]"
              }`}
            >
              📋 Copy
            </button>
            <button
              type="button"
              onClick={() => setShowTools((o) => !o)}
              className="text-sm font-semibold text-[#6b635a] hover:underline"
            >
              {showTools ? "Hide tools" : "More options"}
            </button>
          </div>
          {showTools && (
            <div className="companion-fade-in">
              <RefineActions text={draft} onApply={(n) => setDraft(n)} />
              <ScoreActions
                content={draft}
                kind={type}
                onApply={(n) => setDraft(n)}
              />
              <RemixActions content={draft} onApply={(n) => setDraft(n)} />
            </div>
          )}

          <div className="sticky bottom-0 mt-4 -mx-6 border-t border-[#e7dfd4] bg-[#faf7f2]/95 px-6 py-3 backdrop-blur">
            {flash && (
              <p className="mb-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Name this ${type || "content"} (for saving)`}
              className="mb-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                💾 Save to Templates
              </button>
              <button
                type="button"
                onClick={handleAddToProject}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                📁 Add to Project
              </button>
            </div>
            <ExportActions
              text={draft}
              title={title.trim() || type || "content"}
              social={/post|social|tweet|thread|reel/i.test(type)}
            />
          </div>
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
