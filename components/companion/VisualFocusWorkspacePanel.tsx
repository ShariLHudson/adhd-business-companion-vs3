"use client";

import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/companion/BackButton";
import { LibraryCloseButton } from "@/components/companion/LibraryOrientationChrome";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  VISUAL_FOCUS_MODE_META,
  VISUAL_FOCUS_UPDATED,
  createAndActivateMap,
  deleteVisualFocusMap,
  getActiveVisualFocusMap,
  listVisualFocusMaps,
  saveVisualFocusMap,
  setActiveVisualFocusMap,
  type VisualFocusMap,
  type VisualFocusMode,
  type VisualFocusNode,
  type VisualKanbanCard,
  type VisualKanbanColumn,
} from "@/lib/visualFocus";

const NODE_COLORS = ["#1e4f4f", "#5b7c99", "#c48992", "#8b7355", "#6b8e6b"];

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function updateNodeTree(
  root: VisualFocusNode,
  nodeId: string,
  updater: (n: VisualFocusNode) => VisualFocusNode,
): VisualFocusNode {
  if (root.id === nodeId) return updater(root);
  return {
    ...root,
    children: root.children.map((c) => updateNodeTree(c, nodeId, updater)),
  };
}

function VisualFocusTreeEditor({
  root,
  onChange,
  depth = 0,
}: {
  root: VisualFocusNode;
  onChange: (root: VisualFocusNode) => void;
  depth?: number;
}) {
  const toggle = (id: string) => {
    onChange(
      updateNodeTree(root, id, (n) => ({ ...n, collapsed: !n.collapsed })),
    );
  };

  const updateLabel = (id: string, label: string) => {
    onChange(updateNodeTree(root, id, (n) => ({ ...n, label })));
  };

  const addChild = (parentId: string) => {
    onChange(
      updateNodeTree(root, parentId, (n) => ({
        ...n,
        collapsed: false,
        children: [
          ...n.children,
          { id: newId("n"), label: "New branch", children: [] },
        ],
      })),
    );
  };

  const removeNode = (id: string) => {
    function prune(n: VisualFocusNode): VisualFocusNode | null {
      if (n.id === id) return null;
      return {
        ...n,
        children: n.children
          .map((c) => prune(c))
          .filter((c): c is VisualFocusNode => c !== null),
      };
    }
    const next = prune(root);
    if (next) onChange(next);
  };

  const renderNode = (n: VisualFocusNode, d: number) => (
    <li key={n.id} className="mt-2">
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e7dfd4] bg-white px-3 py-2"
        style={{ marginLeft: d * 16 }}
      >
        {n.children.length > 0 ? (
          <button
            type="button"
            aria-label={n.collapsed ? "Expand" : "Collapse"}
            onClick={() => toggle(n.id)}
            className="text-sm font-bold text-[#1e4f4f]"
          >
            {n.collapsed ? "▸" : "▾"}
          </button>
        ) : (
          <span className="w-4" aria-hidden />
        )}
        <input
          value={n.label}
          onChange={(e) => updateLabel(n.id, e.target.value)}
          className="min-w-[8rem] flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-base font-semibold text-[#1f1c19] focus:border-[#1e4f4f]/30 focus:bg-[#faf7f2] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => addChild(n.id)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
        >
          + Branch
        </button>
        {d > 0 ? (
          <button
            type="button"
            onClick={() => removeNode(n.id)}
            className="rounded-lg px-2 py-1 text-xs text-[#9a8f82] hover:bg-red-50 hover:text-red-700"
          >
            Remove
          </button>
        ) : null}
      </div>
      {!n.collapsed && n.children.length > 0 ? (
        <ul className="list-none pl-0">{n.children.map((c) => renderNode(c, d + 1))}</ul>
      ) : null}
    </li>
  );

  return (
    <ul className="list-none pl-0" data-testid="visual-focus-tree">
      {renderNode(root, depth)}
    </ul>
  );
}

function VisualFocusKanbanEditor({
  columns,
  cards,
  onChange,
}: {
  columns: VisualKanbanColumn[];
  cards: Record<string, VisualKanbanCard>;
  onChange: (columns: VisualKanbanColumn[], cards: Record<string, VisualKanbanCard>) => void;
}) {
  const [dragCardId, setDragCardId] = useState<string | null>(null);

  function moveCard(cardId: string, toColumnId: string) {
    const nextCols = columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId),
    }));
    const target = nextCols.find((c) => c.id === toColumnId);
    if (target) target.cardIds = [...target.cardIds, cardId];
    onChange(nextCols, cards);
  }

  function addCard(columnId: string) {
    const id = newId("card");
    const nextCards = {
      ...cards,
      [id]: { id, label: "New card", color: NODE_COLORS[columns.length % NODE_COLORS.length] },
    };
    const nextCols = columns.map((c) =>
      c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c,
    );
    onChange(nextCols, nextCards);
  }

  function updateCardLabel(cardId: string, label: string) {
    const card = cards[cardId];
    if (!card) return;
    onChange(columns, { ...cards, [cardId]: { ...card, label } });
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2"
      data-testid="visual-focus-kanban"
    >
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[200px] flex-1 rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragCardId) moveCard(dragCardId, col.id);
            setDragCardId(null);
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              {col.label}
            </p>
            <button
              type="button"
              onClick={() => addCard(col.id)}
              className="text-xs font-semibold text-[#1e4f4f]"
            >
              + Card
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {col.cardIds.map((cardId) => {
              const card = cards[cardId];
              if (!card) return null;
              return (
                <li key={cardId}>
                  <div
                    draggable
                    onDragStart={() => setDragCardId(cardId)}
                    className="cursor-grab rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 shadow-sm active:cursor-grabbing"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: card.color ?? "#1e4f4f",
                    }}
                  >
                    <input
                      value={card.label}
                      onChange={(e) => updateCardLabel(cardId, e.target.value)}
                      className="w-full border-0 bg-transparent text-sm font-semibold text-[#1f1c19] focus:outline-none"
                    />
                    {card.linkedTo?.length ? (
                      <p className="mt-1 text-[10px] text-[#9a8f82]">
                        Linked: {card.linkedTo.length}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function VisualFocusWorkspacePanel({
  onBack,
  registerBack,
}: {
  onBack?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [maps, setMaps] = useState<VisualFocusMap[]>([]);
  const [active, setActive] = useState<VisualFocusMap | null>(null);
  const [mode, setMode] = useState<VisualFocusMode>("mind-map");

  const reload = useCallback(() => {
    setMaps(listVisualFocusMaps());
    setActive(getActiveVisualFocusMap());
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
    return () => window.removeEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
  }, [reload]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  useEffect(() => {
    if (active) setMode(active.mode);
  }, [active]);

  function persist(map: VisualFocusMap) {
    const saved = saveVisualFocusMap(map);
    setActive(saved);
    setMaps(listVisualFocusMaps());
  }

  function handleNewMap() {
    const map = createAndActivateMap(mode);
    setActive(map);
    setMaps(listVisualFocusMaps());
  }

  function handleSelectMap(id: string) {
    setActiveVisualFocusMap(id);
    reload();
  }

  const modeMeta = VISUAL_FOCUS_MODE_META.find((m) => m.id === mode);

  return (
    <div
      className={`${workspacePanelShellClass({ width: "full", inSplit: true })} companion-panel-surface`}
      data-testid="visual-focus-workspace"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#e7dfd4] pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f1c19]">Visual Focus</h1>
          <p className="mt-1 max-w-xl text-base text-[#6b635a]">
            A cognitive workspace — mind maps, decisions, strategy, and
            connections. Think spatially, not as a task list.
          </p>
        </div>
        {onBack ? <LibraryCloseButton onClose={onBack} /> : null}
      </div>

      <WorkspaceAreaWorksGuide areaId="visual-focus" />

      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Visual Focus mode">
        {VISUAL_FOCUS_MODE_META.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === m.id
                ? "companion-btn-primary"
                : "bg-white text-[#4b463f] ring-1 ring-[#d4cdc3]"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {modeMeta ? (
        <p className="mt-3 text-sm text-[#6b635a]">{modeMeta.desc}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleNewMap}
          className="companion-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
        >
          New {modeMeta?.label ?? "Map"}
        </button>
        {maps.length > 0 ? (
          <select
            value={active?.id ?? ""}
            onChange={(e) => handleSelectMap(e.target.value)}
            className="rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#1f1c19]"
            aria-label="Open saved map"
          >
            {maps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.mode.replace("-", " ")})
              </option>
            ))}
          </select>
        ) : null}
        {active ? (
          <button
            type="button"
            onClick={() => {
              deleteVisualFocusMap(active.id);
              reload();
            }}
            className="rounded-xl px-3 py-2 text-sm text-[#9a8f82] hover:text-red-700"
          >
            Delete map
          </button>
        ) : null}
      </div>

      {!active ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#d4cdc3] bg-[#faf7f2] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#1f1c19]">
            How do you want to think today?
          </p>
          <p className="mt-2 text-sm text-[#6b635a]">
            Pick a mode above and create your first visual map.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <input
            value={active.title}
            onChange={(e) =>
              persist({ ...active, title: e.target.value })
            }
            className="mb-4 w-full border-0 border-b border-[#e7dfd4] bg-transparent pb-2 text-xl font-semibold text-[#1f1c19] focus:border-[#1e4f4f] focus:outline-none"
            aria-label="Map title"
          />
          {active.mode === "visual-kanban" && active.kanban ? (
            <VisualFocusKanbanEditor
              columns={active.kanban.columns}
              cards={active.kanban.cards}
              onChange={(columns, cards) =>
                persist({ ...active, kanban: { columns, cards } })
              }
            />
          ) : (
            <VisualFocusTreeEditor
              root={active.root}
              onChange={(root) => persist({ ...active, root })}
            />
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-[#9a8f82]">
        Visual Focus is for thinking — use{" "}
        <strong className="font-semibold text-[#6b635a]">Plan My Day</strong>{" "}
        when you want to view and manage today&apos;s tasks.
      </p>
    </div>
  );
}
