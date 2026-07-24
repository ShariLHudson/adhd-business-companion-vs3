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

type Props = {
  workspace: ThinkingWorkspaceState;
  deliverables: VisualThinkingGeneratedDeliverable[];
  onWorkspaceChange: (next: ThinkingWorkspaceState) => void;
  onAskShari?: (prompt: string, context: ReturnType<typeof buildAskShariContext>) => void;
  onClose?: () => void;
  researchNotification?: VisualThinkingWorkspaceResearchNotification | null;
  onDismissResearchNotification?: () => void;
  onReviewResearch?: () => void;
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
      data-focus={workspace.focusMode ? "true" : "false"}
      aria-label="Thinking workspace"
    >
      <header className="vts-workspace__toolbar">
        <div className="vts-workspace__toolbar-main">
          <h2 className="vts-workspace__title">Thinking Workspace</h2>
          <p className="vts-workspace__subtitle">
            Arrange to understand — your content stays intact.
          </p>
        </div>
        <div className="vts-workspace__toolbar-actions" role="toolbar">
          <button
            type="button"
            className="vts-request__secondary-btn"
            data-testid="thinking-workspace-fit"
            onClick={() => dispatch({ kind: "fit_content" })}
          >
            Fit view
          </button>
          <button
            type="button"
            className="vts-request__secondary-btn"
            data-testid="thinking-workspace-reorganize"
            onClick={() => dispatch({ kind: "auto_organize" })}
          >
            Auto Organize
          </button>
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
          <button
            type="button"
            className="vts-request__secondary-btn"
            data-testid="thinking-workspace-ask-shari"
            aria-expanded={showAsk}
            onClick={() => setShowAsk((v) => !v)}
          >
            Ask Shari
          </button>
          <button
            type="button"
            className="vts-request__secondary-btn"
            data-testid="thinking-workspace-undo"
            onClick={() => dispatch({ kind: "undo" })}
          >
            Undo
          </button>
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
            </>
          ) : (
            <p className="vts-request__note">
              Select an idea to see details. Moving ideas only rearranges this
              table — it does not change your knowledge.
            </p>
          )}

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
