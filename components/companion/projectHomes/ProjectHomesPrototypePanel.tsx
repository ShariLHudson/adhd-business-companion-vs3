"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { NavigationReturnBar } from "@/components/companion/NavigationReturnBar";
import { ProjectHomesRoomShell } from "@/components/companion/projectHomes/ProjectHomesRoomShell";
import {
  jumpToNavigationIndex,
  peekNavigationFrame,
  popNavigationFrame,
  pushNavigationFrame,
  setNavigationCurrent,
} from "@/lib/navigationContext/stack";
import { ActiveWorkCard } from "@/components/companion/projectHomes/ActiveWorkCard";
import {
  ProjectHomeCard,
  type ProjectHomeCardAction,
} from "@/components/companion/projectHomes/ProjectHomeCard";
import { ProjectHomeDetail } from "@/components/companion/projectHomes/ProjectHomeDetail";
import { ProjectLibraryPanel } from "@/components/companion/library/ProjectLibraryPanel";
import {
  archiveProjectHome,
  createPersistedProjectHomeWithResult,
  deleteProjectHome,
  exploreExampleHomes,
  loadMemberProjectHomesFromStore,
  mergeMemberHomesWithStore,
  renameProjectHome,
  duplicateProjectHome,
  visibleGalleryHomes,
} from "@/lib/projectHomes/homeActions";
import {
  getProjectHomeBackgroundUrl,
  getProjectHomeRoom,
  listProjectHomeRooms,
  PROJECT_HOMES_ROOM_BACKGROUND,
  recommendProjectHome,
} from "@/lib/projectHomes/roomCatalog";
import {
  EXPLORE_EXAMPLES_SECTION_NOTE,
  SAMPLE_PROJECT_HOMES,
} from "@/lib/projectHomes/sampleProjects";
import type {
  ProjectHomeRecord,
  ProjectHomeRoomId,
  ProjectHomeView,
} from "@/lib/projectHomes/types";
import { PROJECTS_UPDATED_EVENT } from "@/lib/companionProjectsEvents";
import {
  PROJECTS_BROWSE_EXAMPLES_LABEL,
  PROJECTS_CURRENT_WORK_HEADING,
  PROJECTS_EMPTY_ENCOURAGEMENT,
  PROJECTS_HIDE_EXAMPLES_LABEL,
  PROJECTS_LANDING_KICKER,
  PROJECTS_LANDING_LEAD,
  PROJECTS_LANDING_TITLE,
  PROJECTS_RECENT_INSPIRATIONS_LABEL,
  PROJECTS_START_NEW_LABEL,
} from "@/lib/projects/activeWork/copy";
import type { ActiveWorkCardModel } from "@/lib/projects/activeWork/types";
import {
  archiveLiteActiveWorkspace,
  listLiteActiveWorkCards,
  listLiteRecoverableWorkspaces,
  restoreLiteActiveWorkspace,
} from "@/lib/projects/projectsContinueLite";
import {
  addProjectPiece,
  detectProjectCreateFlavor,
  emptyProjectPiecesDraft,
  EVENT_PROJECT_LEAD,
  projectIntentionPromptForFlavor,
  projectPiecesPromptForFlavor,
  projectPurposePromptForFlavor,
  removeProjectPiece,
  shouldDivertEventCreateToWorkspace,
  updateProjectPiece,
} from "@/lib/projects/projectPieces190";
import "@/app/companion/project-homes.css";

type Props = {
  onBack: () => void;
  /** Call the Board with Current Focus from a Project Home (Prompt 145). */
  onCallTheBoard?: (project: ProjectHomeRecord) => void;
  /** Open Visual Thinking Studio with project execution context (Build 11). */
  onOpenVisualThinking?: (project: ProjectHomeRecord) => void;
  /** When opening from "create a project", land on create-purpose. */
  initialView?: ProjectHomeView;
  /**
   * Event intention → Event Creation Workspace (skips generic pieces interview).
   */
  onLaunchEventWorkspace?: (intention: string) => void;
  /**
   * Optional override for "Start Something New" — when provided, takes over
   * instead of the built-in new-project questions below. Not wired by
   * CompanionPageClient for the Projects landing button (Start New Project
   * Routing Fix): Projects must open its own new-project setup flow, never
   * Create. Reserved for a future explicit Create handoff, if one is added.
   */
  onStartSomethingNew?: () => void;
  /** 057 — Resume Creation Workspace from Active Work card. */
  onResumeActiveWork?: (work: ActiveWorkCardModel) => void;
  /** 073 — Rename Active Work title (preserves Workspace ID). */
  onRenameActiveWork?: (work: ActiveWorkCardModel, nextTitle: string) => void;
  /** 084 — Move Creation Workspace to Trash (recoverable). */
  onRemoveActiveWork?: (work: ActiveWorkCardModel) => void;
  /** 084 — Archive (recoverable). Defaults to local registry archive. */
  onArchiveActiveWork?: (work: ActiveWorkCardModel) => void;
  /** 084 — Restore from Archive/Trash (same Work ID). */
  onRestoreActiveWork?: (workspaceId: string) => void;
  /**
   * @deprecated Projects owns the screen — conversation overlay is not used.
   * Kept optional so CompanionPageClient call sites stay stable.
   */
  chatVisible?: boolean;
  thread?: ReactNode;
  footer?: ReactNode;
  conversationScrollKey?: string | number;
};

export function ProjectHomesPrototypePanel({
  onBack,
  onCallTheBoard,
  onOpenVisualThinking,
  initialView = "gallery",
  onLaunchEventWorkspace,
  onStartSomethingNew,
  onResumeActiveWork,
  onRenameActiveWork,
  onRemoveActiveWork,
  onArchiveActiveWork,
  onRestoreActiveWork,
}: Props) {
  const [view, setView] = useState<ProjectHomeView>(initialView);
  /** Member projects only — hydrated from companion-projects-v1 */
  const [memberHomes, setMemberHomes] = useState<ProjectHomeRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Bump when Continue list changes outside memberHomes (rename / delete). */
  const [activeWorkRevision, setActiveWorkRevision] = useState(0);

  const [intention, setIntention] = useState("");
  const [purpose, setPurpose] = useState("");
  const [draftName, setDraftName] = useState("");
  const [pieces, setPieces] = useState<string[]>(() => emptyProjectPiecesDraft());
  const [createError, setCreateError] = useState<string | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const [selectedRoomId, setSelectedRoomId] =
    useState<ProjectHomeRoomId | null>(null);
  const [browsingHomes, setBrowsingHomes] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  /** Samples stay hidden until the member asks to see them. */
  const [showExamples, setShowExamples] = useState(false);

  const exampleHomes = useMemo(() => exploreExampleHomes(), []);
  const rooms = useMemo(() => listProjectHomeRooms(), []);
  const myProjects = useMemo(
    () => visibleGalleryHomes(memberHomes),
    [memberHomes],
  );
  const activeWork = useMemo(
    () => listLiteActiveWorkCards(myProjects),
    [myProjects, activeWorkRevision],
  );
  const recoverableWork = useMemo(
    () => listLiteRecoverableWorkspaces(),
    [activeWorkRevision],
  );

  function removeActiveWorkCard(work: ActiveWorkCardModel) {
    if (work.sourceKind === "member_project" && work.projectHomeRecordId) {
      const result = deleteProjectHome(memberHomes, work.projectHomeRecordId);
      setMemberHomes(result.homes);
      setActiveWorkRevision((n) => n + 1);
      return;
    }
    onRemoveActiveWork?.(work);
    setActiveWorkRevision((n) => n + 1);
  }

  function archiveActiveWorkCard(work: ActiveWorkCardModel) {
    if (work.sourceKind !== "creation_workspace") return;
    if (onArchiveActiveWork) onArchiveActiveWork(work);
    else archiveLiteActiveWorkspace(work.id);
    setActiveWorkRevision((n) => n + 1);
  }

  function restoreRecoverable(workspaceId: string) {
    if (onRestoreActiveWork) onRestoreActiveWork(workspaceId);
    else restoreLiteActiveWorkspace(workspaceId);
    setActiveWorkRevision((n) => n + 1);
  }

  function refreshMemberHomes(preserveLocal: ProjectHomeRecord[] = memberHomes) {
    const roomByCompanion = new Map<string, ProjectHomeRoomId>();
    for (const home of preserveLocal) {
      const key = home.companionProjectId ?? home.id;
      if (key) roomByCompanion.set(key, home.projectHomeId);
    }
    const fromStore = loadMemberProjectHomesFromStore(roomByCompanion);
    setMemberHomes(mergeMemberHomesWithStore(preserveLocal, fromStore));
  }

  useEffect(() => {
    refreshMemberHomes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only load
  }, []);

  useEffect(() => {
    // Start New Project Routing Fix — deep links that ask for the new-project
    // flow open the built-in wizard here unless an explicit override callback
    // is provided.
    if (
      onStartSomethingNew &&
      (initialView === "create-purpose" ||
        initialView === "create-why" ||
        initialView === "create-pieces" ||
        initialView === "create-home")
    ) {
      onStartSomethingNew();
      setView("gallery");
      return;
    }
    if (initialView && initialView !== "gallery") {
      setView(initialView);
    }
  }, [initialView, onStartSomethingNew]);

  useEffect(() => {
    const onUpdated = () => refreshMemberHomes(memberHomes);
    window.addEventListener(PROJECTS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(PROJECTS_UPDATED_EVENT, onUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on store events
  }, [memberHomes]);

  const allHomes = useMemo(
    () => [...memberHomes, ...exampleHomes],
    [memberHomes, exampleHomes],
  );
  const active = allHomes.find((h) => h.id === activeId) ?? null;
  const inCreateFlow =
    view === "create-purpose" ||
    view === "create-why" ||
    view === "create-pieces" ||
    view === "create-home";
  const galleryBackground =
    active && view === "detail"
      ? getProjectHomeBackgroundUrl(active)
      : selectedRoomId && inCreateFlow
        ? getProjectHomeRoom(selectedRoomId).artwork.backgroundUrl
        : PROJECT_HOMES_ROOM_BACKGROUND;

  function beginCreate() {
    // Start New Project Routing Fix — Start Something New opens the
    // Project setup flow below by default (never Create). onStartSomethingNew
    // is only honored when a caller explicitly overrides it.
    if (onStartSomethingNew) {
      onStartSomethingNew();
      return;
    }
    setIntention("");
    setPurpose("");
    setDraftName("");
    setPieces(emptyProjectPiecesDraft());
    setCreateError(null);
    setSelectedRoomId(null);
    setBrowsingHomes(false);
    setView("create-purpose");
  }

  function continueActiveWork(work: ActiveWorkCardModel) {
    // 071 — Creation Workspaces always resume via registry path (Event optional)
    if (work.sourceKind === "creation_workspace") {
      if (onResumeActiveWork) {
        onResumeActiveWork(work);
        return;
      }
      if (work.eventRecordId && onLaunchEventWorkspace) {
        onLaunchEventWorkspace(`Continue ${work.name}`);
        return;
      }
    }
    if (work.projectHomeRecordId) {
      openDetail(work.projectHomeRecordId);
    }
  }

  function continueFromIntention() {
    if (!intention.trim()) return;
    const flavor = detectProjectCreateFlavor(intention);
    // Events leave the generic Project create wizard — open Event Creation Workspace
    if (
      shouldDivertEventCreateToWorkspace(flavor) &&
      onLaunchEventWorkspace
    ) {
      onLaunchEventWorkspace(intention.trim());
      return;
    }
    if (!draftName.trim()) {
      const first =
        intention.trim().split(/[.!?\n]/)[0]?.trim() ?? "New Project";
      setDraftName(first.slice(0, 64));
    }
    setView("create-why");
  }

  function continueFromWhy() {
    setView("create-pieces");
  }

  function continueFromPieces() {
    const rec = recommendProjectHome(
      `${intention.trim()} ${purpose.trim()}`.trim(),
    );
    setSelectedRoomId(rec.roomId);
    setBrowsingHomes(false);
    setView("create-home");
  }

  function restoreRecommendation() {
    const rec = recommendProjectHome(
      `${intention.trim()} ${purpose.trim()}`.trim(),
    );
    setSelectedRoomId(rec.roomId);
    setBrowsingHomes(false);
  }

  function createHome() {
    if (!purpose.trim() || !selectedRoomId) return;
    setCreateError(null);
    const room = getProjectHomeRoom(selectedRoomId);
    // Pieces are facts the member already knows (e.g. "Date: mid-September,
    // one Saturday morning") — they become Project Plan sections, never
    // Current Focus or Your Next Step text. The Next-Step Intelligence
    // engine derives both from project context (see createPersistedProjectHomeWithResult).
    const result = createPersistedProjectHomeWithResult({
      name: draftName.trim() || intention.trim().slice(0, 64) || `${room.name} Project`,
      purpose: purpose.trim(),
      projectHomeId: selectedRoomId,
      atmosphereNote: room.description,
      pieces,
    });
    if (!result.persisted || !result.home) {
      setCreateError(
        result.error ?? "Could not save the project. Please try again.",
      );
      return;
    }
    const record = result.home;
    refreshMemberHomes([record, ...memberHomes]);
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 2000);
    setActiveId(record.id);
    setView("detail");
  }

  function openDetail(id: string) {
    const project = allHomes.find((h) => h.id === id);
    const top = peekNavigationFrame();
    if (!top || top.destinationId !== "project-homes") {
      pushNavigationFrame({
        destinationId: "project-homes",
        label: "Projects",
        kind: "destination",
      });
    }
    setNavigationCurrent({
      destinationId: "project",
      label: project?.name ?? "Project",
      kind: "nested",
    });
    setActiveId(id);
    setView("detail");
  }

  function updateActiveProject(next: ProjectHomeRecord) {
    if (next.isSample || SAMPLE_PROJECT_HOMES.some((s) => s.id === next.id)) {
      return;
    }
    setMemberHomes((prev) =>
      prev.map((h) => (h.id === next.id ? next : h)),
    );
  }

  function beginRename(id: string) {
    const target = memberHomes.find((h) => h.id === id);
    if (!target) return;
    setRenameTargetId(id);
    setRenameValue(target.name);
  }

  function commitRename() {
    if (!renameTargetId) return;
    setMemberHomes((prev) =>
      renameProjectHome(prev, renameTargetId, renameValue),
    );
    setRenameTargetId(null);
    setRenameValue("");
  }

  function handleCardAction(action: ProjectHomeCardAction, id: string) {
    switch (action) {
      case "open":
        openDetail(id);
        break;
      case "rename":
        beginRename(id);
        break;
      case "duplicate": {
        const source =
          memberHomes.find((h) => h.id === id) ??
          exampleHomes.find((h) => h.id === id);
        if (!source) break;
        const result = duplicateProjectHome(
          [source, ...memberHomes],
          source.id,
        );
        if (result.duplicate) {
          refreshMemberHomes(
            result.homes.filter(
              (h) => !SAMPLE_PROJECT_HOMES.some((s) => s.id === h.id),
            ),
          );
        }
        break;
      }
      case "archive":
        setMemberHomes((prev) => archiveProjectHome(prev, id));
        if (activeId === id) {
          setActiveId(null);
          setView("gallery");
        }
        break;
      case "delete": {
        const result = deleteProjectHome(memberHomes, id);
        if (result.blockedAsSample) return;
        refreshMemberHomes(result.homes);
        if (activeId === id) {
          setActiveId(null);
          setView("gallery");
        }
        break;
      }
      default:
        break;
    }
  }

  const recommendation = recommendProjectHome(purpose);
  const recommendedRoom = getProjectHomeRoom(
    selectedRoomId ?? recommendation.roomId,
  );
  const renameTarget = renameTargetId
    ? memberHomes.find((h) => h.id === renameTargetId)
    : null;
  const createFlavor = detectProjectCreateFlavor(
    `${intention} ${purpose} ${draftName}`,
  );
  const intentionPrompt = projectIntentionPromptForFlavor(createFlavor);
  const purposePrompt = projectPurposePromptForFlavor(createFlavor);
  const piecesPrompt = projectPiecesPromptForFlavor(createFlavor);

  return (
    <ProjectHomesRoomShell backgroundUrl={galleryBackground}>
      <EstateWorkspace className="project-homes-workspace grow-room-panel">
        <NavigationReturnBar
          currentDestination={
            view === "gallery" ? "project-homes" : "project-detail"
          }
          onReturn={() => {
            const frame = popNavigationFrame();
            if (view === "detail") {
              setActiveId(null);
              setView("gallery");
              return;
            }
            if (frame?.destinationId === "project-homes" || !frame) {
              onBack();
              return;
            }
            setActiveId(null);
            setView("gallery");
          }}
          onJumpToIndex={(index) => {
            jumpToNavigationIndex(index);
            const frame = peekNavigationFrame();
            if (!frame || frame.destinationId === "project-homes") {
              setActiveId(null);
              setView("gallery");
            }
          }}
        />
        <GrowPanelBackButton
          onBack={
            view === "gallery"
              ? onBack
              : view === "detail"
                ? () => {
                    popNavigationFrame();
                    setActiveId(null);
                    setView("gallery");
                  }
                : () => {
                    if (view === "create-home") setView("create-pieces");
                    else if (view === "create-pieces") setView("create-why");
                    else if (view === "create-why") setView("create-purpose");
                    else setView("gallery");
                  }
          }
          label={view === "gallery" ? "Projects" : "Your Work"}
        />

        {view === "gallery" ? (
          <div data-testid="project-homes-gallery">
            <p className="project-homes-kicker">{PROJECTS_LANDING_KICKER}</p>
            <h1
              className="project-homes-title"
              data-testid="projects-landing-title"
            >
              {PROJECTS_LANDING_TITLE}
            </h1>
            <p className="project-homes-lead">{PROJECTS_LANDING_LEAD}</p>
            <div className="project-homes-actions">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                data-testid="projects-start-something-new"
                onClick={beginCreate}
              >
                {PROJECTS_START_NEW_LABEL}
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                data-testid="project-homes-view-samples"
                onClick={() => setShowExamples(true)}
              >
                {PROJECTS_BROWSE_EXAMPLES_LABEL}
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                data-testid="projects-recent-inspirations"
                onClick={() => setShowExamples(true)}
              >
                {PROJECTS_RECENT_INSPIRATIONS_LABEL}
              </button>
            </div>

            <section
              className="project-homes-gallery-section"
              data-testid="project-homes-my-projects"
              aria-labelledby="project-homes-my-projects-heading"
            >
              <h2
                id="project-homes-my-projects-heading"
                className="project-homes-gallery-section__title"
              >
                {PROJECTS_CURRENT_WORK_HEADING}
              </h2>
              {activeWork.length === 0 ? (
                <p
                  className="project-homes-empty"
                  data-testid="project-homes-empty-state"
                >
                  {PROJECTS_EMPTY_ENCOURAGEMENT}
                </p>
              ) : (
                <div
                  className="project-homes-grid"
                  data-testid="projects-active-work-grid"
                >
                  {activeWork.map((work) => (
                    <ActiveWorkCard
                      key={work.id}
                      work={work}
                      onContinue={continueActiveWork}
                      onRename={
                        work.sourceKind === "creation_workspace"
                          ? (item, nextTitle) => {
                              onRenameActiveWork?.(item, nextTitle);
                              setActiveWorkRevision((n) => n + 1);
                            }
                          : undefined
                      }
                      onArchive={
                        work.sourceKind === "creation_workspace"
                          ? archiveActiveWorkCard
                          : undefined
                      }
                      onTrash={
                        work.sourceKind === "creation_workspace"
                          ? onRemoveActiveWork
                            ? removeActiveWorkCard
                            : undefined
                          : removeActiveWorkCard
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {memberHomes.some((h) => !h.isSample) ? (
              <section
                className="project-homes-gallery-section"
                data-testid="project-homes-library"
                aria-labelledby="project-homes-library-heading"
              >
                <h2
                  id="project-homes-library-heading"
                  className="project-homes-gallery-section__title"
                >
                  Your Project Homes
                </h2>
                <ProjectLibraryPanel
                  homes={memberHomes}
                  onHomesChange={(next) => {
                    setMemberHomes(next);
                    setActiveWorkRevision((n) => n + 1);
                  }}
                  onOpen={openDetail}
                  onOpenSourceCreation={(creationId) => {
                    const match = activeWork.find((w) => w.id === creationId);
                    if (match) continueActiveWork(match);
                  }}
                />
              </section>
            ) : null}

            {recoverableWork.length > 0 ? (
              <section
                className="project-homes-gallery-section"
                data-testid="projects-recoverable-work"
                aria-labelledby="projects-recoverable-heading"
              >
                <h2
                  id="projects-recoverable-heading"
                  className="project-homes-gallery-section__title"
                >
                  Recently removed
                </h2>
                <ul className="mt-2 flex flex-col gap-2">
                  {recoverableWork.slice(0, 5).map((entry) => (
                    <li
                      key={entry.workspaceId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white/80 px-3 py-2"
                      data-testid={`recoverable-work-${entry.workspaceId}`}
                      data-workspace-id={entry.workspaceId}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1f1c19]">
                          {entry.title}
                        </p>
                        <p className="text-xs text-[#6b635a]">
                          {entry.status === "archived" ? "Archived" : "In Trash"}{" "}
                          · same Work ID on restore
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                        data-testid={`restore-work-${entry.workspaceId}`}
                        onClick={() => restoreRecoverable(entry.workspaceId)}
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {showExamples ? (
              <section
                className="project-homes-gallery-section"
                data-testid="project-homes-explore-examples"
                aria-labelledby="project-homes-explore-examples-heading"
              >
                <div className="project-homes-gallery-section__header">
                  <h2
                    id="project-homes-explore-examples-heading"
                    className="project-homes-gallery-section__title"
                  >
                    {PROJECTS_BROWSE_EXAMPLES_LABEL}
                  </h2>
                  <button
                    type="button"
                    className="project-homes-btn project-homes-btn--ghost"
                    data-testid="project-homes-hide-samples"
                    onClick={() => setShowExamples(false)}
                  >
                    {PROJECTS_HIDE_EXAMPLES_LABEL}
                  </button>
                </div>
                <p
                  className="project-homes-sample-note"
                  data-testid="project-homes-sample-note"
                >
                  {EXPLORE_EXAMPLES_SECTION_NOTE}
                </p>
                <div className="project-homes-grid">
                  {exampleHomes.map((project) => (
                    <ProjectHomeCard
                      key={project.id}
                      project={project}
                      onOpen={openDetail}
                      onAction={handleCardAction}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {view === "create-purpose" ? (
          <div
            className={[
              "project-homes-create",
              createFlavor === "event" ? "project-homes-create--event" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-testid="project-homes-create-purpose"
            data-create-flavor={createFlavor}
          >
            <p className="project-homes-kicker">
              {createFlavor === "event"
                ? "New Event · Step 1"
                : "New Project · Step 1"}
            </p>
            <h1 className="project-homes-title">{intentionPrompt}</h1>
            <p className="project-homes-lead">
              {createFlavor === "event"
                ? `${EVENT_PROJECT_LEAD} Continue and I'll build the full event map for you — no need to list pieces.`
                : "Say it in your own words. You can shape the details next."}
            </p>
            <div className="project-homes-field mt-4">
              <label htmlFor="project-home-intention">
                {intentionPrompt}{" "}
                <span
                  className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]"
                  data-testid="project-homes-intention-required"
                >
                  Required
                </span>
              </label>
              <textarea
                id="project-home-intention"
                rows={4}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder={
                  createFlavor === "event"
                    ? "A weekend retreat, a client workshop, a launch gathering…"
                    : "A book chapter, a brand mood board, a workshop offer…"
                }
                data-testid="project-home-intention-input"
                autoFocus
              />
            </div>
            <div className="project-homes-field mt-3">
              <label htmlFor="project-home-name">
                {createFlavor === "event"
                  ? "Event name (optional)"
                  : "Project name (optional)"}
              </label>
              <input
                id="project-home-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={
                  createFlavor === "event"
                    ? "Give the event a name when you are ready"
                    : "Give it a name when you are ready"
                }
                data-testid="project-home-name-input"
              />
            </div>
            <div className="project-homes-actions">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                disabled={!intention.trim()}
                onClick={continueFromIntention}
                data-testid="project-homes-continue-intention"
              >
                Continue
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                onClick={() => setView("gallery")}
                data-testid="project-homes-cancel-create"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {view === "create-why" ? (
          <div
            className="project-homes-create"
            data-testid="project-homes-create-why"
            data-create-flavor={createFlavor}
          >
            <p className="project-homes-kicker">
              {createFlavor === "event"
                ? "New Event · Step 2"
                : "New Project · Step 2"}
            </p>
            <h1 className="project-homes-title">{purposePrompt}</h1>
            <p className="project-homes-lead">
              {createFlavor === "event"
                ? "One clear outcome for your guests is enough. The full run-of-show can wait."
                : "One clear sentence is enough. You do not need a full plan yet."}
            </p>
            <div className="project-homes-field mt-4">
              <label htmlFor="project-home-purpose">
                {purposePrompt}{" "}
                <span
                  className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]"
                  data-testid="project-homes-purpose-optional"
                >
                  Optional
                </span>
              </label>
              <textarea
                id="project-home-purpose"
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={
                  createFlavor === "event"
                    ? "Optional — what success looks like for this gathering…"
                    : "Optional — what success looks like for this project…"
                }
                data-testid="project-home-purpose-input"
                autoFocus
              />
            </div>
            <div className="project-homes-actions">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                onClick={continueFromWhy}
                data-testid="project-homes-continue-purpose"
              >
                Continue
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                onClick={() => setView("create-purpose")}
              >
                Back
              </button>
            </div>
          </div>
        ) : null}

        {view === "create-pieces" ? (
          <div
            className="project-homes-create"
            data-testid="project-homes-create-pieces"
            data-create-flavor={createFlavor}
          >
            <p className="project-homes-kicker">
              {createFlavor === "event"
                ? "New Event · Step 3"
                : "New Project · Step 3"}
            </p>
            <h1 className="project-homes-title">{piecesPrompt}</h1>
            <p
              className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]"
              data-testid="project-homes-pieces-optional"
            >
              Optional
            </p>
            <p className="project-homes-lead">
              {createFlavor === "event"
                ? "Date, place, guests, program — one piece at a time is enough."
                : "One piece, several, or none yet — you can add more after the project is created."}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {pieces.map((piece, index) => (
                <div key={index} className="flex items-end gap-2">
                  <label className="block min-w-0 flex-1 text-sm font-semibold text-[#6b635a]">
                    Piece {index + 1}
                    <input
                      value={piece}
                      onChange={(e) =>
                        setPieces(
                          updateProjectPiece(pieces, index, e.target.value),
                        )
                      }
                      placeholder={
                        index === 0 ? "e.g. Planning" : "Optional"
                      }
                      className="mt-1 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                      data-testid={`project-homes-piece-${index}`}
                    />
                  </label>
                  {pieces.length > 1 ? (
                    <button
                      type="button"
                      className="mb-0.5 shrink-0 text-sm font-semibold text-[#8a5a4a]"
                      onClick={() =>
                        setPieces(removeProjectPiece(pieces, index))
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="self-start text-sm font-semibold text-[#1e4f4f]"
                onClick={() => setPieces(addProjectPiece(pieces))}
                data-testid="project-homes-add-piece"
              >
                Add another piece
              </button>
            </div>
            <div className="project-homes-actions">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                onClick={continueFromPieces}
                data-testid="project-homes-continue-pieces"
              >
                Continue
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                onClick={() => setView("create-why")}
              >
                Back
              </button>
            </div>
          </div>
        ) : null}

        {view === "create-home" ? (
          <div>
            {!browsingHomes && selectedRoomId ? (
              <>
                <p className="project-homes-kicker">A quiet recommendation</p>
                <h1 className="project-homes-title">Your Project Home</h1>
                <p className="project-homes-shari-voice">
                  {selectedRoomId === recommendation.roomId
                    ? recommendation.reason
                    : `I think the ${recommendedRoom.name} would be a wonderful Project Home for this project because ${recommendedRoom.recommendVoice}.`}
                </p>
                <div className="project-homes-recommend">
                  <div
                    className="project-homes-recommend__photo"
                    style={{
                      backgroundImage: `url(${recommendedRoom.artwork.backgroundUrl})`,
                    }}
                    aria-hidden
                  />
                  <p className="mt-3 text-lg font-semibold text-[#1f1c19]">
                    {recommendedRoom.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#4b463f]">
                    {recommendedRoom.description}
                  </p>
                  {recommendedRoom.artwork.isPlaceholder ? (
                    <p className="project-homes-placeholder-note project-homes-placeholder-note--ink">
                      Temporary artwork — dedicated Strategy Conference plate
                      coming later.
                    </p>
                  ) : null}
                  <div className="project-homes-actions">
                    <button
                      type="button"
                      className="project-homes-btn project-homes-btn--primary"
                      onClick={createHome}
                      data-testid="project-homes-create-project"
                    >
                      Create Project
                    </button>
                    <button
                      type="button"
                      className="project-homes-btn project-homes-btn--secondary"
                      onClick={() => setBrowsingHomes(true)}
                    >
                      Browse Other Project Homes
                    </button>
                  </div>
                  {createError ? (
                    <p
                      className="mt-3 text-sm text-[#8a5a4a]"
                      role="alert"
                      data-testid="project-homes-create-error"
                    >
                      {createError}
                    </p>
                  ) : null}
                  {saveFlash ? (
                    <p
                      className="mt-2 text-sm text-[#6b635a]"
                      data-testid="project-homes-saved-quiet"
                    >
                      Saved
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {browsingHomes ? (
              <>
                <p className="project-homes-kicker">Browse</p>
                <h1 className="project-homes-title">Other Project Homes</h1>
                <p className="project-homes-lead">
                  Choose another place if a different room feels more like home
                  for this work.
                </p>
                <div className="project-homes-room-grid">
                  {rooms.map((room) => {
                    const selected = selectedRoomId === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        className={`project-homes-room-option${
                          selected
                            ? " project-homes-room-option--selected"
                            : ""
                        }`}
                        onClick={() => setSelectedRoomId(room.id)}
                        aria-pressed={selected}
                      >
                        <span
                          className="project-homes-room-option__photo"
                          style={{
                            backgroundImage: `url(${room.artwork.backgroundUrl})`,
                          }}
                          aria-hidden
                        />
                        <span className="project-homes-room-option__body">
                          <span className="project-homes-room-option__name">
                            {room.name}
                            {room.artwork.isPlaceholder ? (
                              <span className="project-homes-room-option__placeholder">
                                {" "}
                                · temp art
                              </span>
                            ) : null}
                          </span>
                          <span className="project-homes-room-option__fit">
                            {room.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="project-homes-actions">
                  <button
                    type="button"
                    className="project-homes-btn project-homes-btn--primary"
                    disabled={!selectedRoomId}
                    onClick={createHome}
                    data-testid="project-homes-create-project-browse"
                  >
                    Create Project
                  </button>
                  <button
                    type="button"
                    className="project-homes-btn project-homes-btn--ghost"
                    onClick={restoreRecommendation}
                  >
                    Back to recommendation
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {view === "detail" && active ? (
          <ProjectHomeDetail
            project={active}
            onProjectChange={updateActiveProject}
            onCallTheBoard={onCallTheBoard}
            onOpenVisualThinking={onOpenVisualThinking}
          />
        ) : null}

        {renameTarget ? (
          <div
            className="project-homes-rename-overlay"
            data-testid="project-homes-rename-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-homes-rename-title"
          >
            <div className="project-homes-rename-dialog">
              <h2 id="project-homes-rename-title">Rename project</h2>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                aria-label="Project name"
                data-testid="project-homes-rename-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") {
                    setRenameTargetId(null);
                    setRenameValue("");
                  }
                }}
              />
              <div className="project-homes-actions">
                <button
                  type="button"
                  className="project-homes-btn project-homes-btn--primary"
                  data-testid="project-homes-rename-save"
                  onClick={commitRename}
                  disabled={!renameValue.trim()}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="project-homes-btn project-homes-btn--ghost"
                  onClick={() => {
                    setRenameTargetId(null);
                    setRenameValue("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </EstateWorkspace>
    </ProjectHomesRoomShell>
  ); // Projects owns this destination — no layered chat chrome.
}

