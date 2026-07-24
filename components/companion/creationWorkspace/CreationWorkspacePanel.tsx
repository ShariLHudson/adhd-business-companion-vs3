"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { NavigationReturnBar } from "@/components/companion/NavigationReturnBar";
import { popNavigationFrame } from "@/lib/navigationContext";
import {
  CREATION_WORKSPACE_SUPPORTING,
  CREATION_WORKSPACE_TITLE,
  applySelectedAreaAction,
  askShariAboutSelection,
  completeHandoff,
  createShorterAlternative,
  detectPostHandoffSyncOffer,
  editWorkspaceItem,
  groupCreationWorkspaces,
  inferSelectedAreaActions,
  inferUseThisWorkOptions,
  listCreationWorkspaces,
  loadActiveCreationWorkspace,
  prepareCreationWorkspaceHandoff,
  researchSelectedWorkspaceArea,
  restoreWorkspaceVersion,
  reviewMissingPieces,
  runRequestIntoCreationWorkspace,
  saveCreationWorkspace,
  selectWorkspaceSection,
  snapshotWorkspaceVersion,
  trackCreationWorkspaceEvent,
  type CreationWorkspace,
  type CreationWorkspaceHandoff,
  type CreationWorkspaceUseOption,
  type CreationWorkspaceView,
} from "@/lib/creationWorkspace";

type Props = {
  onBack?: () => void;
  registerBack?: (fn: (() => void) | null) => void;
  initialWorkspace?: CreationWorkspace | null;
  initialRequest?: string | null;
  /** Return false to keep handoff retryable (consumption failed). */
  onOpenCreate?: (content: string, title: string) => boolean | void;
  onOpenProjects?: (proposal: string) => void;
  onOpenVisualThinking?: (payload: string) => boolean | void;
  onOpenStrategicPlanning?: (content: string) => void;
  onOpenBusinessEstate?: (content: string) => void;
  onOpenResearchLibrary?: () => void;
};

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

export function CreationWorkspacePanel({
  onBack,
  registerBack,
  initialWorkspace = null,
  initialRequest = null,
  onOpenCreate,
  onOpenProjects,
  onOpenVisualThinking,
  onOpenStrategicPlanning,
  onOpenBusinessEstate,
  onOpenResearchLibrary,
}: Props) {
  const titleId = useId();
  const [workspace, setWorkspace] = useState<CreationWorkspace | null>(
    initialWorkspace,
  );
  const [view, setView] = useState<CreationWorkspaceView>("draft");
  const [showUse, setShowUse] = useState(false);
  const [useOptions, setUseOptions] = useState<CreationWorkspaceUseOption[]>(
    [],
  );
  const [handoffPreview, setHandoffPreview] =
    useState<CreationWorkspaceHandoff | null>(null);
  const [shariReply, setShariReply] = useState<string | null>(null);
  const [askDraft, setAskDraft] = useState("");
  const [syncOffer, setSyncOffer] = useState<string | null>(null);
  const [savedList, setSavedList] = useState(() => listCreationWorkspaces());
  const [homeRequest, setHomeRequest] = useState("");

  useEffect(() => {
    registerBack?.(onBack ?? null);
    return () => registerBack?.(null);
  }, [onBack, registerBack]);

  useEffect(() => {
    if (workspace) return;
    if (initialWorkspace) {
      setWorkspace(initialWorkspace);
      return;
    }
    if (initialRequest?.trim()) {
      const result = runRequestIntoCreationWorkspace(initialRequest.trim(), {
        sourceExperience: "creation_workspace",
        userAskedToKeepWorking: true,
      });
      if (result.workspace) setWorkspace(result.workspace);
      return;
    }
    const active = loadActiveCreationWorkspace();
    if (active) {
      trackCreationWorkspaceEvent("workspace_resumed");
      setWorkspace(active);
    }
  }, [initialWorkspace, initialRequest, workspace]);

  const draftItems = useMemo(
    () =>
      (workspace?.items ?? [])
        .filter((i) => i.groupId !== "research" && i.status !== "removed")
        .sort((a, b) => a.order - b.order),
    [workspace],
  );

  const activeItem =
    workspace?.items.find((i) => i.id === workspace.activeSectionId) ??
    draftItems[0] ??
    null;

  const selectedActions = inferSelectedAreaActions(activeItem);

  function persist(next: CreationWorkspace) {
    setWorkspace(next);
    saveCreationWorkspace(next);
    setSavedList(listCreationWorkspaces());
  }

  function openUseThisWork() {
    if (!workspace) return;
    const options = inferUseThisWorkOptions(workspace);
    setUseOptions(options);
    setShowUse(true);
    trackCreationWorkspaceEvent("use_this_work_opened", {
      count: options.length,
    });
  }

  function selectUseOption(option: CreationWorkspaceUseOption) {
    if (!workspace) return;
    trackCreationWorkspaceEvent("destination_option_selected", {
      id: option.id,
    });
    if (option.destination === "save") {
      const snapped = snapshotWorkspaceVersion(workspace, "Saved Working Material");
      persist({ ...snapped, status: "paused" });
      setShowUse(false);
      return;
    }
    if (option.destination === "research_library") {
      onOpenResearchLibrary?.();
      setShowUse(false);
      return;
    }
    const { workspace: next, handoff } = prepareCreationWorkspaceHandoff({
      workspace,
      option,
    });
    trackCreationWorkspaceEvent("handoff_prepared", {
      destination: option.destination,
    });
    persist(next);
    setHandoffPreview(handoff);
    setShowUse(false);

    if (option.destination === "create") {
      const opened = onOpenCreate?.(handoff.payload, workspace.title);
      if (opened !== false) {
        persist(completeHandoff(next, handoff.id, "completed"));
        trackCreationWorkspaceEvent("handoff_completed");
      }
    } else if (option.destination === "projects") {
      onOpenProjects?.(handoff.payload);
    } else if (option.destination === "visual_thinking") {
      const opened = onOpenVisualThinking?.(handoff.payload);
      if (opened !== false) {
        persist(completeHandoff(next, handoff.id, "completed"));
        trackCreationWorkspaceEvent("handoff_completed");
      }
    } else if (option.destination === "strategic_planning") {
      onOpenStrategicPlanning?.(handoff.payload);
    } else if (option.destination === "business_estate") {
      onOpenBusinessEstate?.(handoff.payload);
    }
  }

  function approveHandoff() {
    if (!workspace || !handoffPreview) return;
    const next = completeHandoff(workspace, handoffPreview.id, "approved");
    persist(completeHandoff(next, handoffPreview.id, "completed"));
    trackCreationWorkspaceEvent("handoff_approved");
    if (handoffPreview.destination === "projects") {
      onOpenProjects?.(handoffPreview.payload);
    }
    if (handoffPreview.destination === "strategic_planning") {
      onOpenStrategicPlanning?.(handoffPreview.payload);
    }
    if (handoffPreview.destination === "business_estate") {
      onOpenBusinessEstate?.(handoffPreview.payload);
    }
    setHandoffPreview(null);
  }

  const groups = groupCreationWorkspaces(savedList);

  if (!workspace) {
    return (
      <section
        className="relative flex h-full min-h-0 w-full flex-col bg-[linear-gradient(160deg,#f7f1e8_0%,#efe6d8_45%,#e7ddd0_100%)] text-[#2f2a24]"
        aria-labelledby={titleId}
        data-testid="creation-workspace-panel"
      >
        <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#6b6358]">
              Spark Estate
            </p>
            <h1 id={titleId} className="mt-1 text-3xl font-semibold">
              {CREATION_WORKSPACE_TITLE}
            </h1>
            <p className="mt-1 max-w-2xl text-base text-[#5a5349]">
              {CREATION_WORKSPACE_SUPPORTING}
            </p>
          </div>
          <NavigationReturnBar
            currentDestination="creation-workspace"
            onReturn={() => {
              popNavigationFrame();
              onBack?.();
            }}
          />
        </header>
        <div className="mx-auto mt-6 w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-4 pb-6 sm:px-6">
          <form
            className="rounded-2xl border border-[#ddd2c3] bg-white/70 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!homeRequest.trim()) return;
              const result = runRequestIntoCreationWorkspace(
                homeRequest.trim(),
                {
                  sourceExperience: "creation_workspace",
                  userAskedToKeepWorking: true,
                },
              );
              if (result.workspace) {
                setWorkspace(result.workspace);
                setHomeRequest("");
              } else if (result.openDecision.open === false) {
                if (result.openDecision.bypassTo === "create") {
                  onOpenCreate?.(homeRequest, homeRequest.slice(0, 80));
                }
              }
            }}
          >
            <label
              className="text-lg font-medium"
              htmlFor="creation-workspace-home-input"
            >
              What would you like to develop?
            </label>
            <textarea
              id="creation-workspace-home-input"
              data-testid="creation-workspace-home-input"
              className="mt-3 min-h-[80px] w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-lg outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]"
              value={homeRequest}
              onChange={(e) => setHomeRequest(e.target.value)}
              placeholder="Describe the plan, handbook, program, or idea…"
            />
            <button type="submit" className={`${BTN_PRIMARY} mt-3`}>
              Begin
            </button>
          </form>
          {(
            [
              ["Continue Previous Work", groups.continuePrevious],
              ["Recently Updated", groups.recentlyUpdated],
              ["Needs My Input", groups.needsMyInput],
              ["Ready to Use", groups.readyToUse],
            ] as const
          ).map(([label, items]) => (
            <section key={label}>
              <h2 className="text-lg font-semibold">{label}</h2>
              {items.length === 0 ? (
                <p className="mt-1 text-sm text-[#6b6358]">None yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {items.slice(0, 5).map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        className={`${BTN_SECONDARY} w-full text-left`}
                        onClick={() => {
                          trackCreationWorkspaceEvent("workspace_resumed");
                          setWorkspace(w);
                        }}
                      >
                        {w.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex h-full min-h-0 w-full flex-col bg-[linear-gradient(160deg,#f7f1e8_0%,#efe6d8_45%,#e7ddd0_100%)] text-[#2f2a24]"
      aria-labelledby={titleId}
      data-testid="creation-workspace-panel"
    >
      <header className="relative z-[1] flex flex-wrap items-start justify-between gap-3 border-b border-[#ddd2c3]/80 px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#6b6358]">
            {CREATION_WORKSPACE_TITLE}
          </p>
          <h1 id={titleId} className="mt-1 text-2xl font-semibold sm:text-3xl">
            {workspace.title}
          </h1>
          <p className="mt-1 text-base text-[#5a5349]">{workspace.purpose}</p>
          <p className="mt-2 text-sm text-[#6b6358]" role="status">
            Status: {workspace.status.replace(/_/g, " ")}
            {workspace.researchStatus
              ? ` · Research: ${workspace.researchStatus.replace(/_/g, " ")}`
              : ""}
            {" · "}
            Saved
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NavigationReturnBar
            currentDestination="creation-workspace"
            onReturn={() => {
              popNavigationFrame();
              onBack?.();
            }}
          />
          <button
            type="button"
            className={BTN_PRIMARY}
            data-testid="creation-workspace-use-this-work"
            onClick={openUseThisWork}
          >
            Use This Work
          </button>
        </div>
      </header>

      <div className="relative z-[1] flex flex-wrap gap-2 px-4 py-3 sm:px-6">
        {(
          [
            ["draft", "Draft"],
            ["sections", "Sections"],
            ["research", "Research"],
            ["questions", "Questions"],
            ["alternatives", "Alternatives"],
            ["sources", "Sources"],
            ["readiness", "Readiness"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={view === id ? BTN_PRIMARY : BTN_SECONDARY}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative z-[1] grid min-h-0 flex-1 gap-4 overflow-hidden px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] sm:px-6">
        <div className="min-h-0 overflow-y-auto rounded-2xl border border-[#ddd2c3] bg-white/70 p-4 sm:p-5">
          {showUse ? (
            <div data-testid="creation-workspace-use-options">
              <h2 className="text-2xl font-semibold">Use This Work</h2>
              <p className="mt-1 text-[#5a5349]">
                Choose how you’d like to use what you’ve developed.
              </p>
              <ul className="mt-4 space-y-2">
                {useOptions.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      className={`${opt.primary ? BTN_PRIMARY : BTN_SECONDARY} w-full text-left`}
                      onClick={() => selectUseOption(opt)}
                    >
                      <span className="block font-semibold">{opt.label}</span>
                      <span className="mt-1 block text-sm opacity-90">
                        {opt.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`${BTN_SECONDARY} mt-4`}
                onClick={() => setShowUse(false)}
              >
                Back to draft
              </button>
            </div>
          ) : null}

          {!showUse && (view === "draft" || view === "sections") ? (
            <div className="space-y-4" data-testid="creation-workspace-draft">
              {draftItems.map((item) => {
                const selected = item.id === activeItem?.id;
                return (
                  <article
                    key={item.id}
                    className={`rounded-xl border px-4 py-3 ${
                      selected
                        ? "border-[#1e4f4f] bg-[#1e4f4f]/5"
                        : "border-[#e5ddd0] bg-white/50"
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        persist(selectWorkspaceSection(workspace, item.id));
                        trackCreationWorkspaceEvent("section_selected");
                      }}
                    >
                      <h2 className="text-xl font-semibold">{item.title}</h2>
                      {item.protected ? (
                        <p className="mt-1 text-xs font-medium text-[#1e4f4f]">
                          Protected — your edits are kept
                        </p>
                      ) : null}
                    </button>
                    <label className="sr-only" htmlFor={`cw-body-${item.id}`}>
                      Edit {item.title}
                    </label>
                    <textarea
                      id={`cw-body-${item.id}`}
                      data-testid={`creation-workspace-section-${item.id}`}
                      className="mt-2 min-h-[120px] w-full rounded-lg border border-[#d4cdc3] bg-white/90 px-3 py-2 text-base leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]"
                      value={item.body}
                      onFocus={() =>
                        persist(selectWorkspaceSection(workspace, item.id))
                      }
                      onChange={(e) => {
                        const next = editWorkspaceItem(workspace, item.id, {
                          body: e.target.value,
                          summary: e.target.value.slice(0, 140),
                        });
                        const offer = detectPostHandoffSyncOffer(next, item.id);
                        setSyncOffer(offer);
                        persist(next);
                        trackCreationWorkspaceEvent("section_edited");
                      }}
                    />
                  </article>
                );
              })}
            </div>
          ) : null}

          {!showUse && view === "research" ? (
            <div>
              <h2 className="text-xl font-semibold">Research</h2>
              <p className="mt-2 text-[#5a5349]">
                Linked collections:{" "}
                {workspace.researchCollectionIds.length || "none yet"}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {workspace.items
                  .filter((i) => i.type === "finding")
                  .map((f) => (
                    <li key={f.id}>
                      <strong>{f.title}</strong> — {f.body}
                    </li>
                  ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={() => {
                    if (!activeItem) return;
                    const result = researchSelectedWorkspaceArea({
                      workspace,
                      itemId: activeItem.id,
                      approveUpdate: !(
                        activeItem.protected || activeItem.userEdited
                      ),
                    });
                    persist(result.workspace);
                    setShariReply(result.message);
                    trackCreationWorkspaceEvent("research_this_invoked");
                    trackCreationWorkspaceEvent("research_returned");
                  }}
                >
                  Research selected area
                </button>
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={() => onOpenResearchLibrary?.()}
                >
                  Open Research Library
                </button>
              </div>
            </div>
          ) : null}

          {!showUse && view === "questions" ? (
            <div>
              <h2 className="text-xl font-semibold">Questions</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {workspace.missingPieces.length ? (
                  workspace.missingPieces.map((m) => <li key={m}>{m}</li>)
                ) : (
                  <li>No open questions recorded.</li>
                )}
              </ul>
            </div>
          ) : null}

          {!showUse && view === "alternatives" ? (
            <div>
              <h2 className="text-xl font-semibold">Alternatives</h2>
              <button
                type="button"
                className={`${BTN_SECONDARY} mt-3`}
                onClick={() => {
                  const next = createShorterAlternative(
                    workspace,
                    "Shorter version",
                  );
                  persist(next);
                  trackCreationWorkspaceEvent("alternative_created");
                }}
              >
                Create a shorter version
              </button>
              <ul className="mt-4 space-y-2">
                {workspace.alternatives.map((alt) => (
                  <li key={alt.id} className="rounded-xl border border-[#e5ddd0] p-3">
                    <p className="font-semibold">{alt.label}</p>
                    <p className="text-sm text-[#5a5349]">
                      {alt.items.length} sections preserved separately
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <h3 className="font-semibold">Versions</h3>
                <ul className="mt-2 space-y-2">
                  {workspace.versions.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        className={BTN_SECONDARY}
                        onClick={() => {
                          persist(restoreWorkspaceVersion(workspace, v.id));
                          trackCreationWorkspaceEvent("recovery_used");
                        }}
                      >
                        Restore: {v.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {!showUse && view === "sources" ? (
            <div>
              <h2 className="text-xl font-semibold">Sources</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {Array.from(
                  new Set(
                    workspace.items.flatMap((i) => i.sourceReferences),
                  ),
                ).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {!showUse && view === "readiness" ? (
            <div>
              <h2 className="text-xl font-semibold">Readiness</h2>
              <button
                type="button"
                className={`${BTN_SECONDARY} mt-3`}
                onClick={() => {
                  const next = reviewMissingPieces({ workspace });
                  persist(next);
                  trackCreationWorkspaceEvent("missing_pieces_review");
                  setView("questions");
                }}
              >
                Review missing pieces
              </button>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {workspace.missingPieces.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              {handoffPreview ? (
                <aside className="mt-4 rounded-xl border border-[#1e4f4f]/30 bg-[#fff9f0] p-4">
                  <h3 className="font-semibold">
                    Handoff ready for review: {handoffPreview.requestedOutcome}
                  </h3>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm">
                    {handoffPreview.payload.slice(0, 2000)}
                  </pre>
                  {handoffPreview.requiresReview ? (
                    <button
                      type="button"
                      className={`${BTN_PRIMARY} mt-3`}
                      onClick={approveHandoff}
                    >
                      Approve handoff
                    </button>
                  ) : null}
                </aside>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="min-h-0 overflow-y-auto rounded-2xl border border-[#ddd2c3] bg-white/60 p-4">
          <h2 className="text-lg font-semibold">Shari</h2>
          {activeItem ? (
            <p className="mt-1 text-sm text-[#5a5349]">
              Looking at: {activeItem.title}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#5a5349]">
              Select a section to work together.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={BTN_SECONDARY}
                onClick={() => {
                  if (!activeItem) return;
                  if (action.id === "ask_shari") return;
                  if (action.id === "research_this") {
                    const result = researchSelectedWorkspaceArea({
                      workspace,
                      itemId: activeItem.id,
                      approveUpdate: !(
                        activeItem.protected || activeItem.userEdited
                      ),
                    });
                    persist(result.workspace);
                    setShariReply(result.message);
                    return;
                  }
                  persist(
                    applySelectedAreaAction(
                      workspace,
                      activeItem.id,
                      action.id,
                    ),
                  );
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!activeItem) return;
              const result = askShariAboutSelection(
                workspace,
                activeItem.id,
                askDraft,
              );
              persist(result.workspace);
              setShariReply(result.reply);
              setAskDraft("");
            }}
          >
            <label className="sr-only" htmlFor="cw-ask-shari">
              Ask Shari
            </label>
            <textarea
              id="cw-ask-shari"
              className="min-h-[72px] w-full rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]"
              placeholder="Ask about this section…"
              value={askDraft}
              onChange={(e) => setAskDraft(e.target.value)}
            />
            <button type="submit" className={BTN_PRIMARY}>
              Ask Shari
            </button>
          </form>
          {shariReply ? (
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#f7f1e8] p-3 text-base leading-relaxed">
              {shariReply}
            </p>
          ) : null}
          {syncOffer ? (
            <p className="mt-3 rounded-xl border border-[#d9cfc0] bg-[#fff9f0] p-3 text-sm" role="status">
              {syncOffer}
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
