"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VisualFocusNode } from "@/lib/visualFocus/types";
import {
  addChildNode,
  disconnectToRoot,
  findNode,
  renameNode,
  reorderSibling,
  reparentNode,
  setNodeNote,
  toggleCollapsed,
  removeNodeFromTree,
  visibleSubtree,
} from "@/lib/visualFocus/mindMapEditing";
import { buildVisualLayout } from "@/lib/visualFocus/visualLayout";

type Props = {
  root: VisualFocusNode;
  onChange: (root: VisualFocusNode) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

type ConnectMode = { fromId: string } | null;

export function MindMapEditableCanvas({
  root,
  onChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(root.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState<ConnectMode>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const dragId = useRef<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const layoutRoot = useMemo(() => visibleSubtree(root), [root]);
  const layout = useMemo(
    () =>
      buildVisualLayout({
        id: "live",
        title: root.label,
        mode: "mind-map",
        root: layoutRoot,
        createdAt: "",
        updatedAt: "",
      }),
    [layoutRoot, root.label],
  );

  const selected = selectedId ? findNode(root, selectedId) : null;
  const nodeById = useMemo(
    () => new Map(layout.nodes.map((n) => [n.id, n])),
    [layout.nodes],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }
      if (meta && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        onRedo?.();
        return;
      }
      if (e.key === "Escape") {
        setConnectMode(null);
        setEditingId(null);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (editingId || !selectedId || selectedId === root.id) return;
        if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
        onChange(removeNodeFromTree(root, selectedId));
        setSelectedId(root.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, onChange, onRedo, onUndo, root, selectedId]);

  const handleNodeClick = useCallback(
    (id: string) => {
      if (connectMode) {
        if (connectMode.fromId !== id) {
          onChange(reparentNode(root, connectMode.fromId, id));
        }
        setConnectMode(null);
        setSelectedId(id);
        return;
      }
      setSelectedId(id);
    },
    [connectMode, onChange, root],
  );

  return (
    <div
      className="mind-map-canvas"
      data-testid="mind-map-editable-canvas"
    >
      <div className="mind-map-canvas__toolbar" role="toolbar" aria-label="Mind Map tools">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className="mind-map-canvas__tool"
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          className="mind-map-canvas__tool"
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>
        <button
          type="button"
          disabled={!selectedId}
          onClick={() => {
            if (!selectedId) return;
            onChange(addChildNode(root, selectedId));
          }}
          className="mind-map-canvas__tool"
        >
          + Branch
        </button>
        <button
          type="button"
          disabled={!selectedId || selectedId === root.id}
          onClick={() => {
            if (!selectedId || selectedId === root.id) return;
            setConnectMode({ fromId: selectedId });
          }}
          className={`mind-map-canvas__tool${connectMode ? " mind-map-canvas__tool--active" : ""}`}
        >
          {connectMode ? "Click parent…" : "Connect"}
        </button>
        <button
          type="button"
          disabled={!selectedId || selectedId === root.id}
          onClick={() => {
            if (!selectedId) return;
            onChange(disconnectToRoot(root, selectedId));
          }}
          className="mind-map-canvas__tool"
        >
          Disconnect
        </button>
        <button
          type="button"
          disabled={!selectedId || selectedId === root.id}
          onClick={() => {
            if (!selectedId) return;
            onChange(reorderSibling(root, selectedId, "up"));
          }}
          className="mind-map-canvas__tool"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={!selectedId || selectedId === root.id}
          onClick={() => {
            if (!selectedId) return;
            onChange(reorderSibling(root, selectedId, "down"));
          }}
          className="mind-map-canvas__tool"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={!selectedId}
          onClick={() => setNotesOpen((v) => !v)}
          className={`mind-map-canvas__tool${notesOpen ? " mind-map-canvas__tool--active" : ""}`}
        >
          Notes
        </button>
        {connectMode ? (
          <span className="mind-map-canvas__hint">
            Click another node to connect under it · Esc to cancel
          </span>
        ) : (
          <span className="mind-map-canvas__hint">
            Double-click to rename · Drag onto a node to reconnect
          </span>
        )}
      </div>

      <div className="mind-map-canvas__stage">
        <svg className="mind-map-canvas__edges" aria-hidden>
          <defs>
            <marker
              id="mm-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#8b7355" fillOpacity="0.55" />
            </marker>
          </defs>
          {layout.edges.map((edge) => {
            const from = nodeById.get(edge.fromId);
            const to = nodeById.get(edge.toId);
            if (!from || !to) return null;
            return (
              <line
                key={`${edge.fromId}-${edge.toId}`}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke="#8b7355"
                strokeWidth="2"
                strokeOpacity="0.4"
                markerEnd="url(#mm-arrow)"
              />
            );
          })}
        </svg>

        {layout.nodes.map((vn) => {
          const live = findNode(root, vn.id);
          const selected = selectedId === vn.id;
          const isDrop = dropTargetId === vn.id;
          return (
            <div
              key={vn.id}
              className={`mind-map-node${selected ? " mind-map-node--selected" : ""}${
                isDrop ? " mind-map-node--drop" : ""
              }${connectMode?.fromId === vn.id ? " mind-map-node--connect-from" : ""}`}
              style={{
                left: `${vn.x}%`,
                top: `${vn.y}%`,
                borderColor: vn.color ?? "#8b7355",
              }}
              data-testid={`mind-map-node-${vn.id}`}
              draggable={vn.id !== root.id}
              onDragStart={(e) => {
                dragId.current = vn.id;
                e.dataTransfer.setData("text/plain", vn.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragId.current && dragId.current !== vn.id) {
                  setDropTargetId(vn.id);
                }
              }}
              onDragLeave={() => {
                if (dropTargetId === vn.id) setDropTargetId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData("text/plain") || dragId.current;
                setDropTargetId(null);
                dragId.current = null;
                if (!from || from === vn.id) return;
                onChange(reparentNode(root, from, vn.id));
                setSelectedId(vn.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(vn.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setSelectedId(vn.id);
                setEditingId(vn.id);
              }}
            >
              {live && live.children.length > 0 ? (
                <button
                  type="button"
                  className="mind-map-node__collapse"
                  aria-label={live.collapsed ? "Expand" : "Collapse"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(toggleCollapsed(root, vn.id));
                  }}
                >
                  {live.collapsed ? "+" : "−"}
                </button>
              ) : null}
              {editingId === vn.id ? (
                <input
                  autoFocus
                  className="mind-map-node__input"
                  defaultValue={live?.label ?? vn.label}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    onChange(renameNode(root, vn.id, e.target.value));
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onChange(renameNode(root, vn.id, (e.target as HTMLInputElement).value));
                      setEditingId(null);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              ) : (
                <p className="mind-map-node__label">{live?.label ?? vn.label}</p>
              )}
              {live?.notes ? (
                <p className="mind-map-node__notes-preview">{live.notes}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {notesOpen && selected ? (
        <div className="mind-map-canvas__notes" data-testid="mind-map-notes">
          <p className="mind-map-canvas__notes-title">Notes · {selected.label}</p>
          <textarea
            rows={3}
            value={selected.notes ?? ""}
            placeholder="Add a note to this branch…"
            onChange={(e) => {
              if (!selectedId) return;
              onChange(setNodeNote(root, selectedId, e.target.value));
            }}
            className="mind-map-canvas__notes-input"
          />
        </div>
      ) : null}
    </div>
  );
}
