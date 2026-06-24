"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  durationLabel,
  isPlanItemActive,
  planItemStyle,
  type PlanDayItem,
  type PlanItemColumn,
} from "@/lib/planMyDay";
import { KANBAN_COLUMNS } from "@/lib/planMyDay/types";

const DRAG_MIME = "application/x-plan-day-item";

type Props = {
  items: PlanDayItem[];
  onOpen: (id: string) => void;
  onDrop: (id: string, column: PlanItemColumn) => void;
  onComplete: (id: string) => void;
  colorCoding: boolean;
};

function itemsForColumn(
  items: PlanDayItem[],
  column: PlanItemColumn,
): PlanDayItem[] {
  if (column === "doing") {
    return items
      .filter((i) => i.column === "doing" && !i.done)
      .sort((a, b) => (b.focusRank ?? 0) - (a.focusRank ?? 0));
  }
  if (column === "today") {
    return items.filter((i) => i.column === "today" && isPlanItemActive(i));
  }
  return items.filter((i) => i.column === "ready" && isPlanItemActive(i));
}

function KanbanCard({
  item,
  colorCoding,
  isDragging,
  isTopFocus,
  onOpen,
  onComplete,
  onBeginDrag,
  onDragEnd,
}: {
  item: PlanDayItem;
  colorCoding: boolean;
  isDragging: boolean;
  isTopFocus?: boolean;
  onOpen: (id: string) => void;
  onComplete: (id: string) => void;
  onBeginDrag: (id: string) => void;
  onDragEnd: () => void;
}) {
  const style = planItemStyle(item, colorCoding);

  return (
    <li
      className={`flex items-stretch gap-1 rounded-xl border bg-white text-base shadow-sm transition-opacity ${
        isDragging ? "opacity-40" : ""
      }`}
      style={{
        borderWidth: colorCoding ? 2 : 1,
        borderColor: colorCoding ? style.color : style.border,
      }}
    >
      <span
        draggable
        role="button"
        tabIndex={0}
        aria-label={`Drag ${item.title}`}
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_MIME, item.id);
          e.dataTransfer.effectAllowed = "move";
          onBeginDrag(item.id);
        }}
        onDragEnd={onDragEnd}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 cursor-grab touch-none select-none items-center px-1.5 text-base text-[#9a8f82] hover:text-[#6b635a]"
        title="Drag to move"
      >
        ⠿
      </span>
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="min-w-0 flex-1 px-3 py-2.5 text-left"
      >
        <span className="block text-base font-medium text-[#1f1c19] hover:text-[#1e4f4f]">
          {item.title}
        </span>
        <span className="mt-0.5 block text-sm text-[#6b635a]">
          {durationLabel(item)}
        </span>
        {colorCoding ? (
          <span
            className="mt-0.5 block text-[10px] font-bold uppercase"
            style={{ color: style.color }}
          >
            {style.label}
          </span>
        ) : null}
        {isTopFocus ? (
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-[#1e4f4f]">
            Current focus
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete(item.id);
        }}
        className="flex shrink-0 items-center px-2.5 text-lg font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        aria-label={`Complete ${item.title}`}
        title="Mark complete"
      >
        ✓
      </button>
    </li>
  );
}

function KanbanColumn({
  column,
  label,
  hint,
  items,
  colorCoding,
  isDropTarget,
  draggingId,
  onOpen,
  onComplete,
  onBeginDrag,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  column: PlanItemColumn;
  label: string;
  hint: string;
  items: PlanDayItem[];
  colorCoding: boolean;
  isDropTarget: boolean;
  draggingId: string | null;
  onOpen: (id: string) => void;
  onComplete: (id: string) => void;
  onBeginDrag: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
}) {
  return (
    <div
      className={`flex min-h-[12rem] flex-col rounded-2xl border p-2 transition-colors ${
        isDropTarget
          ? "border-[#1e4f4f]/50 bg-[#f0f8f8]/90 ring-2 ring-[#1e4f4f]/20"
          : "border-[#e7dfd4] bg-[#faf7f2]/80"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="px-1">
        <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          {label}
        </p>
        <p className="text-xs text-[#9a8f82]">{hint}</p>
      </div>
      <ul className="mt-2 flex flex-1 flex-col gap-2">
        {items.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[#d4cdc3] px-2 py-6 text-center text-sm text-[#9a8f82]">
            Drop here
          </li>
        ) : (
          items.map((item, index) => (
            <KanbanCard
              key={item.id}
              item={item}
              colorCoding={colorCoding}
              isDragging={draggingId === item.id}
              isTopFocus={column === "doing" && index === 0}
              onOpen={onOpen}
              onComplete={onComplete}
              onBeginDrag={onBeginDrag}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </ul>
    </div>
  );
}

export function PlanDayKanbanView({
  items,
  onOpen,
  onDrop,
  onComplete,
  colorCoding,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<PlanItemColumn | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  function beginDrag(id: string) {
    draggingIdRef.current = id;
    setDraggingId(id);
  }

  function endDrag() {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  }

  function handleDragOver(e: DragEvent, column: PlanItemColumn) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(column);
  }

  function handleDrop(e: DragEvent, column: PlanItemColumn) {
    e.preventDefault();
    const id =
      e.dataTransfer.getData(DRAG_MIME) || draggingIdRef.current || "";
    endDrag();
    if (id) onDrop(id, column);
  }

  return (
    <div className="w-full min-w-0">
      <p className="text-center text-base text-[#6b635a]">
        Drag tasks between columns — click a card to open details.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 min-[960px]:grid-cols-3">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col.id}
            label={col.label}
            hint={col.hint}
            items={itemsForColumn(items, col.id)}
            colorCoding={colorCoding}
            isDropTarget={dropTarget === col.id}
            draggingId={draggingId}
            onOpen={onOpen}
            onComplete={onComplete}
            onBeginDrag={beginDrag}
            onDragEnd={endDrag}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDropTarget((t) => (t === col.id ? null : t))}
            onDrop={(e) => handleDrop(e, col.id)}
          />
        ))}
      </div>
    </div>
  );
}
