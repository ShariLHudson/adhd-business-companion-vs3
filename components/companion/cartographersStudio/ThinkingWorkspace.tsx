"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VisualThinkingGeneratedDeliverable } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  applyWorkspaceAction,
  buildAskShariContext,
  projectInspector,
  projectVisibleWorkspaceObjects,
  type ThinkingWorkspaceState,
  type WorkspaceAction,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import type { VisualThinkingWorkspaceResearchNotification } from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import type {
  CoCreationActionId,
  CoCreationInspectorProjection,
  RepresentationSyncPreview,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";

type Props = {
  workspace: ThinkingWorkspaceState;
  deliverables: VisualThinkingGeneratedDeliverable[];
  onWorkspaceChange: (next: ThinkingWorkspaceState) => void;
  onAskShari?: (prompt: string, context: ReturnType<typeof buildAskShariContext>) => void;
  onClose?: () => void;
  researchNotification?: VisualThinkingWorkspaceResearchNotification | null;
  onDismissResearchNotification?: () => void;
  onReviewResearch?: () => void;
  /** Co-creation inspector (progressive). When present, content actions are available. */
  coCreationInspector?: CoCreationInspectorProjection | null;
  syncPreview?: RepresentationSyncPreview | null;
  onCoCreateAction?: (action: CoCreationActionId) => void;
  onSyncChoice?: (
    choice: "update_all" | "choose_representationsations" | "keep_current",
  ) => void;
  coCreationNotice?: string | null;
  /** Learning pilot — source-aware return + supporting written explanation. */
  learningPilot?: {
    topic: string;
    resumeMessage?: string | null;
    writtenExplanationAvailable: boolean;
    onReturnToLearning?: () => void;
    onOpenWrittenExplanation?: () => void;
    onAskInLearning?: () => void;
  } | null;
  projectsPilot?: {
    projectName: string;
    pendingChangeCount: number;
    onReturnToProjects?: () => void;
    onReviewPendingChanges?: () => void;
  } | null;
};

/**
 * Calm Thinking Workspace surface — organization over approved content.
 * Not a diagram editor; conforms to Thinking Workspace Experience Standard.
 */
export function ThinkingWorkspace({
  workspace,
  deliverables,
  onWorkspaceChange,
  onAskShari,
  onClose,
  researchNotification,
  onDismissResearchNotification,
  onReviewResearch,
  coCreationInspector,
  syncPreview,
  onCoCreateAction,
  onSyncChoice,
  coCreationNotice,
  learningPilot,
  projectsPilot,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [ideaDraft, setIdeaDraft] = useState("");
  const [showAsk, setShowAsk] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef<{ id: string; x: number; y: number } | null>(null);

  const visible = useMemo(
    () => projectVisibleWorkspaceObjects(workspace),
    [workspace],
  );
  const inspector = useMemo(
    () => projectInspector(workspace, deliverables),
    [workspace, deliverables],
  );
  const askContext = useMemo(
    () => buildAskShariContext(workspace),
    [workspace],
  );
  const substantiveObjectCount = useMemo(
    () =>
      visible.filter(
        (o) =>
          (o.summary?.trim().split(/\s+/).length ?? 0) >= 4 &&
          !/have not been verified/i.test(o.summary ?? ""),
      ).length,
    [visible],
  );
  const hasSubstantiveWorkspace = substantiveObjectCount >= 2;
  const canAutoOrganize = substantiveObjectCount >= 2;
  const canFitView = substantiveObjectCount >= 1;
  const canFocus = substantiveObjectCount >= 1;
  const canUndo = (workspace.undoStack?.length ?? 0) > 0;
  const warningOnlyShell =
    !hasSubstantiveWorkspace &&
    Boolean(
      workspace.completenessNotice &&
        /have not been verified|awaiting verification/i.test(
          workspace.completenessNotice,
        ),
    );
  const showAddIdea =
    hasSubstantiveWorkspace || workspace.workspaceMode === "user_led";

  function dispatch(action: WorkspaceAction) {
    onWorkspaceChange(applyWorkspaceAction(workspace, action));
  }

  useEffect(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1200;
    const profile =
      width < 640 ? "mobile" : width < 960 ? "tablet" : "desktop";
    if (workspace.layoutProfile !== profile) {
      onWorkspaceChange(
        applyWorkspaceAction(workspace, {
          kind: "set_layout_profile",
          profile,
        }),
      );
    }
    // Intentionally only on mount / resize via listener below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- profile sync
  }, []);

  useEffect(() => {
    function onResize() {
      const width = window.innerWidth;
      const profile =
        width < 640 ? "mobile" : width < 960 ? "tablet" : "desktop";
      if (workspace.layoutProfile !== profile) {
        onWorkspaceChange(
          applyWorkspaceAction(workspace, {
            kind: "set_layout_profile",
            profile,
          }),
        );
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [workspace, onWorkspaceChange]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "f") {
        e.preventDefault();
        const q = window.prompt("Search the workspace", workspace.searchQuery);
        if (q != null) dispatch({ kind: "search", query: q });
        return;
      }
      if (meta && e.key === "0") {
        e.preventDefault();
        dispatch({ kind: "reset_view" });
        return;
      }
      if (meta && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        dispatch({ kind: "zoom", zoom: workspace.viewport.zoom + 0.1 });
        return;
      }
      if (meta && e.key === "-") {
        e.preventDefault();
        dispatch({ kind: "zoom", zoom: workspace.viewport.zoom - 0.1 });
        return;
      }
      if (e.key === "Escape") {
        if (workspace.focusMode) dispatch({ kind: "focus_mode", enabled: false });
        else dispatch({ kind: "select", objectId: null });
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const id = workspace.selection.primaryObjectId;
        if (!id) return;
        const obj = workspace.objects.find((o) => o.id === id);
        if (obj?.userCreated) {
          e.preventDefault();
          dispatch({ kind: "delete_user_object", objectId: id });
        }
      }
      if (e.key === "Enter" && workspace.selection.primaryObjectId) {
        dispatch({ kind: "center_selection" });
      }
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        const list = visible.filter((o) => o.type !== "group" || !o.collapsed);
        if (!list.length) return;
        const idx = list.findIndex(
          (o) => o.id === workspace.selection.primaryObjectId,
        );
        let next = 0;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          next = idx < 0 ? 0 : Math.min(list.length - 1, idx + 1);
        } else {
          next = idx < 0 ? 0 : Math.max(0, idx - 1);
        }
        e.preventDefault();
        dispatch({ kind: "select", objectId: list[next]!.id });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [workspace, visible]);

  function onPointerDownObject(
    e: React.PointerEvent,
    objectId: string,
    x: number,
    y: number,
  ) {
    e.stopPropagation();
    dispatch({ kind: "select", objectId });
    setDraggingId(objectId);
    dragOrigin.current = { id: objectId, x, y };
    const rect = surfaceRef.current?.getBoundingClientRect();
    const z = workspace.viewport.zoom;
    const localX = e.clientX - (rect?.left ?? 0);
    const localY = e.clientY - (rect?.top ?? 0);
    dragOffset.current = {
      x: (localX - workspace.viewport.panX) / z - x,
      y: (localY - workspace.viewport.panY) / z - y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    const rect = surfaceRef.current?.getBoundingClientRect();
    const z = workspace.viewport.zoom;
    const localX = e.clientX - (rect?.left ?? 0);
    const localY = e.clientY - (rect?.top ?? 0);
    const x = (localX - workspace.viewport.panX) / z - dragOffset.current.x;
    const y = (localY - workspace.viewport.panY) / z - dragOffset.current.y;
    onWorkspaceChange({
      ...workspace,
      objects: workspace.objects.map((o) =>
        o.id === draggingId ? { ...o, x, y } : o,
      ),
    });
  }

  function onPointerUp() {
    if (draggingId && dragOrigin.current) {
      const obj = workspace.objects.find((o) => o.id === draggingId);
      const origin = dragOrigin.current;
      if (
        obj &&
        (Math.abs(obj.x - origin.x) > 2 || Math.abs(obj.y - origin.y) > 2)
      ) {
        // Restore origin briefly so move action can capture undo snapshot, then move.
        const restored = {
          ...workspace,
          objects: workspace.objects.map((o) =>
            o.id === draggingId ? { ...o, x: origin.x, y: origin.y } : o,
          ),
        };
        onWorkspaceChange(
          applyWorkspaceAction(restored, {
            kind: "move",
            objectId: draggingId,
            x: obj.x,
            y: obj.y,
          }),
        );
      }
    }
    setDraggingId(null);
    dragOrigin.current = null;
  }
  const { panX, panY, zoom } = workspace.viewport;

  return (
    <section
      className="vts-workspace"
      data-testid="thinking-workspace"
      data-layout={workspace.layoutIntent}
      data-workspace-mode={workspace.workspaceMode}
      data-workspace-status={workspace.status}
      data-focus={workspace.focusMode ? "true" : "false"}
      data-incomplete={workspace.incompleteState ? "true" : "false"}
      aria-label="Thinking workspace"
    >
      <header className="vts-workspace__toolbar">
        <div className="vts-workspace__toolbar-main">
          <h2 className="vts-workspace__title">Thinking Workspace</h2>
          <p className="vts-workspace__subtitle">
            Think together here — arrange, refine, and evolve ideas without
            starting over.
          </p>
          {workspace.completenessNotice ? (
            <p
              className="vts-workspace__incomplete-notice"
              data-testid="thinking-workspace-incomplete-notice"
            >
              {workspace.completenessNotice}
            </p>
          ) : null}
        </div>
        <div className="vts-workspace__toolbar-actions" role="toolbar">
          {canFitView ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-fit"
              onClick={() => dispatch({ kind: "fit_content" })}
            >
              Fit view
            </button>
          ) : null}
          {canAutoOrganize ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-reorganize"
              onClick={() => dispatch({ kind: "auto_organize" })}
            >
              Auto Organize
            </button>
          ) : null}
          {canFocus ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-focus"
              aria-pressed={workspace.focusMode}
              onClick={() =>
                dispatch({
                  kind: "focus_mode",
                  enabled: !workspace.focusMode,
                })
              }
            >
              {workspace.focusMode ? "Exit focus" : "Focus"}
            </button>
          ) : null}
          <button
            type="button"
            className="vts-request__secondary-btn"
            data-testid="thinking-workspace-ask-shari"
            aria-expanded={showAsk}
            onClick={() => setShowAsk((v) => !v)}
          >
            Ask Shari
          </button>
          {learningPilot?.writtenExplanationAvailable ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-written-explanation"
              onClick={() => learningPilot.onOpenWrittenExplanation?.()}
            >
              Open Written Explanation
            </button>
          ) : null}
          {learningPilot?.onAskInLearning ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-ask-in-learning"
              onClick={() => learningPilot.onAskInLearning?.()}
            >
              Ask in Learning
            </button>
          ) : null}
          {learningPilot?.onReturnToLearning ? (
            <button
              type="button"
              className="vts-request__primary-btn"
              data-testid="thinking-workspace-return-learning"
              onClick={() => learningPilot.onReturnToLearning?.()}
            >
              Return to Learning
            </button>
          ) : null}
          {projectsPilot?.onReviewPendingChanges &&
          projectsPilot.pendingChangeCount > 0 ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-pending-changes"
              onClick={() => projectsPilot.onReviewPendingChanges?.()}
            >
              Pending Changes ({projectsPilot.pendingChangeCount})
            </button>
          ) : null}
          {projectsPilot?.onReturnToProjects ? (
            <button
              type="button"
              className="vts-request__primary-btn"
              data-testid="thinking-workspace-return-projects"
              onClick={() => projectsPilot.onReturnToProjects?.()}
            >
              Return to Projects
            </button>
          ) : null}
          {canUndo ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-undo"
              onClick={() => dispatch({ kind: "undo" })}
            >
              Undo
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-close"
              onClick={onClose}
            >
              Close
            </button>
          ) : null}
        </div>
      </header>

      {researchNotification && !researchNotification.dismissed ? (
        <div
          className="vts-workspace__research-note"
          data-testid="thinking-workspace-research-notification"
          role="status"
        >
          <p className="vts-workspace__proposal-text">
            {researchNotification.message}
            {researchNotification.conflictCount > 0
              ? " Some sources disagree — nothing was overwritten."
              : ""}
          </p>
          <div className="vts-workspace__proposal-actions">
            {onReviewResearch ? (
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="thinking-workspace-review-research"
                onClick={onReviewResearch}
              >
                Review new information
              </button>
            ) : null}
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-dismiss-research"
              onClick={() => onDismissResearchNotification?.()}
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {workspace.pendingLayoutProposal ? (
        <div
          className="vts-workspace__proposal"
          data-testid="thinking-workspace-layout-proposal"
          role="status"
        >
          <p className="vts-workspace__proposal-text">
            A calmer arrangement is ready. Your pinned ideas and notes stay put.
          </p>
          <div className="vts-workspace__proposal-actions">
            <button
              type="button"
              className="vts-request__primary"
              data-testid="thinking-workspace-accept-layout"
              onClick={() => dispatch({ kind: "accept_layout_proposal" })}
            >
              Accept arrangement
            </button>
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="thinking-workspace-reject-layout"
              onClick={() => dispatch({ kind: "reject_layout_proposal" })}
            >
              Keep mine
            </button>
          </div>
        </div>
      ) : null}

      {workspace.layoutSuggestions.length > 0 ? (
        <div
          className="vts-workspace__suggestions"
          data-testid="thinking-workspace-layout-suggestions"
        >
          <p className="vts-request__label">Layout ideas</p>
          <ul className="vts-request__choices">
            {workspace.layoutSuggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="vts-request__choice"
                  data-testid={`thinking-layout-suggestion-${suggestion.kind}`}
                  onClick={() => {
                    if (suggestion.suggestedIntent) {
                      dispatch({
                        kind: "set_layout_intent",
                        intent: suggestion.suggestedIntent,
                      });
                    }
                  }}
                >
                  {suggestion.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="vts-workspace__body">
        <div
          className="vts-workspace__surface"
          data-testid="thinking-workspace-surface"
          ref={surfaceRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              dispatch({
                kind: "zoom",
                zoom: workspace.viewport.zoom + (e.deltaY > 0 ? -0.05 : 0.05),
              });
            } else {
              dispatch({
                kind: "pan",
                panX: workspace.viewport.panX - e.deltaX,
                panY: workspace.viewport.panY - e.deltaY,
              });
            }
          }}
        >
          <div
            className="vts-workspace__viewport"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            }}
          >
            <svg
              className="vts-workspace__connectors"
              aria-hidden="true"
              width={4000}
              height={3000}
            >
              {workspace.connectors.map((c) => {
                const from = workspace.objects.find(
                  (o) => o.id === c.fromObjectId,
                );
                const to = workspace.objects.find((o) => o.id === c.toObjectId);
                if (!from || !to) return null;
                if (
                  (from.groupId &&
                    workspace.groups.find((g) => g.id === from.groupId)
                      ?.collapsed) ||
                  (to.groupId &&
                    workspace.groups.find((g) => g.id === to.groupId)?.collapsed)
                ) {
                  return null;
                }
                const x1 = from.x + from.width / 2;
                const y1 = from.y + from.height / 2;
                const x2 = to.x + to.width / 2;
                const y2 = to.y + to.height / 2;
                return (
                  <line
                    key={c.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="vts-workspace__connector-line"
                  />
                );
              })}
            </svg>

            {visible.map((obj) => {
              const selected = workspace.selection.primaryObjectId === obj.id;
              const dimmed =
                workspace.focusMode &&
                workspace.focusedObjectId &&
                obj.id !== workspace.focusedObjectId;
              const match = workspace.searchMatchIds.includes(obj.id);
              const inCollapsed =
                obj.type === "group" && obj.collapsed
                  ? workspace.groups.find((g) => g.id === obj.metadata.groupId)
                  : null;
              return (
                <button
                  key={obj.id}
                  type="button"
                  className={[
                    "vts-workspace__object",
                    selected ? "vts-workspace__object--selected" : "",
                    dimmed ? "vts-workspace__object--dimmed" : "",
                    match ? "vts-workspace__object--match" : "",
                    obj.userCreated ? "vts-workspace__object--user" : "",
                    obj.immutable ? "vts-workspace__object--generated" : "",
                    obj.pinned ? "vts-workspace__object--pinned" : "",
                    `vts-workspace__object--${obj.visualRole}`,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    minHeight: obj.height,
                  }}
                  data-testid={`thinking-object-${obj.id}`}
                  data-object-type={obj.type}
                  data-immutable={obj.immutable ? "true" : "false"}
                  data-pinned={obj.pinned ? "true" : "false"}
                  data-visual-role={obj.visualRole}
                  aria-pressed={selected}
                  onPointerDown={(e) =>
                    onPointerDownObject(e, obj.id, obj.x, obj.y)
                  }
                  onDoubleClick={() => {
                    if (obj.type === "group" && obj.metadata.groupId) {
                      const gid = String(obj.metadata.groupId);
                      dispatch({
                        kind: obj.collapsed ? "expand_group" : "collapse_group",
                        groupId: gid,
                      });
                    }
                  }}
                >
                  <span className="vts-workspace__object-title">{obj.title}</span>
                  <span className="vts-workspace__object-summary">
                    {obj.type === "group" && inCollapsed
                      ? `${inCollapsed.objectIds.length} items`
                      : obj.summary}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside
          className="vts-workspace__inspector"
          data-testid="thinking-workspace-inspector"
          aria-label="Selected idea details"
        >
          {inspector ? (
            <>
              <h3 className="vts-workspace__inspector-title">{inspector.title}</h3>
              <p className="vts-workspace__inspector-details">
                {inspector.details}
              </p>
              {inspector.sourceNote ? (
                <p className="vts-request__note">{inspector.sourceNote}</p>
              ) : null}
              {inspector.related.length > 0 ? (
                <div>
                  <p className="vts-request__label">Connected</p>
                  <ul className="vts-workspace__related">
                    {inspector.related.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {workspace.selection.primaryObjectId ? (
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  data-testid="thinking-workspace-toggle-pin"
                  onClick={() => {
                    const id = workspace.selection.primaryObjectId!;
                    const obj = workspace.objects.find((o) => o.id === id);
                    dispatch({
                      kind: obj?.pinned ? "unpin" : "pin",
                      objectId: id,
                    });
                  }}
                >
                  {workspace.objects.find(
                    (o) => o.id === workspace.selection.primaryObjectId,
                  )?.pinned
                    ? "Unpin"
                    : "Pin in place"}
                </button>
              ) : null}
              {coCreationInspector && onCoCreateAction ? (
                <div
                  className="vts-workspace__cocreate"
                  data-testid="thinking-workspace-cocreate"
                >
                  <p className="vts-request__label">Work with this piece</p>
                  <div
                    className="vts-workspace__cocreate-actions"
                    role="group"
                    aria-label="Co-creation actions for selected idea"
                  >
                    {coCreationInspector.suggestedActions
                      .filter((a) =>
                        ["expand", "simplify", "research", "find_missing_pieces", "generate_alternatives", "ask_board", "lock", "unlock", "annotate"].includes(
                          a.id,
                        ),
                      )
                      .slice(0, 6)
                      .map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          className="vts-request__secondary-btn"
                          data-testid={`thinking-cocreate-${action.id}`}
                          onClick={() => onCoCreateAction(action.id)}
                        >
                          {action.label}
                        </button>
                      ))}
                  </div>
                  {coCreationInspector.locked ? (
                    <p className="vts-request__note">Locked — won’t regenerate.</p>
                  ) : null}
                  {coCreationInspector.notes.length > 0 ? (
                    <ul className="vts-workspace__related">
                      {coCreationInspector.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
              {coCreationNotice ? (
                <p
                  className="vts-request__note"
                  data-testid="thinking-cocreate-notice"
                  role="status"
                >
                  {coCreationNotice}
                </p>
              ) : null}
              {syncPreview && onSyncChoice ? (
                <div
                  className="vts-workspace__sync-preview"
                  data-testid="thinking-sync-preview"
                  role="region"
                  aria-label="Representation update preview"
                >
                  <p className="vts-request__label">This change also affects</p>
                  <ul className="vts-workspace__related">
                    {syncPreview.affectedPresentations.slice(0, 4).map((p) => (
                      <li key={p}>{p.replace(/_/g, " ")}</li>
                    ))}
                  </ul>
                  <div className="vts-workspace__cocreate-actions">
                    <button
                      type="button"
                      className="vts-request__primary-btn"
                      data-testid="thinking-sync-update-all"
                      onClick={() => onSyncChoice("update_all")}
                    >
                      Update all
                    </button>
                    <button
                      type="button"
                      className="vts-request__secondary-btn"
                      data-testid="thinking-sync-keep"
                      onClick={() => onSyncChoice("keep_current")}
                    >
                      Keep current versions
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="vts-request__note">
              Select an idea to refine it with Shari — or rearrange freely. Edits
              stay scoped to what you choose.
            </p>
          )}

          {showAddIdea ? (
            <div className="vts-workspace__add-idea">
              <p className="vts-request__label">Add idea</p>
              <input
                className="vts-workspace__idea-input"
                data-testid="thinking-workspace-idea-input"
                value={ideaDraft}
                placeholder="A note, question, or placeholder…"
                onChange={(e) => setIdeaDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && ideaDraft.trim()) {
                    dispatch({ kind: "add_idea", title: ideaDraft.trim() });
                    setIdeaDraft("");
                  }
                }}
              />
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="thinking-workspace-add-idea"
                onClick={() => {
                  if (!ideaDraft.trim()) return;
                  dispatch({ kind: "add_idea", title: ideaDraft.trim() });
                  setIdeaDraft("");
                }}
              >
                Add Idea
              </button>
            </div>
          ) : null}
          {warningOnlyShell ? (
            <p
              className="vts-request__note"
              data-testid="thinking-workspace-recovery-note"
              role="status"
            >
              I’m still gathering what you need for a usable result. Ask Shari
              to retry research or build the useful guide from stable steps.
            </p>
          ) : null}
        </aside>
      </div>

      {showAsk ? (
        <div
          className="vts-workspace__ask"
          data-testid="thinking-workspace-ask-panel"
        >
          <p className="vts-request__label">Ask Shari</p>
          <ul className="vts-request__choices">
            {askContext.suggestedPrompts.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  className="vts-request__choice"
                  data-testid={`thinking-ask-${prompt.slice(0, 12)}`}
                  onClick={() => {
                    onAskShari?.(prompt, askContext);
                    setShowAsk(false);
                  }}
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
