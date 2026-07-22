"use client";

import { useEffect, useRef, useState } from "react";
import type { PlanDayItem } from "@/lib/planMyDay";
import {
  isPlanItemLocked,
  planItemPrimaryIndicator,
} from "@/lib/planMyDay/todaysPlanReorder";

export type PlanDaySimpleListMode = "calm-list" | "timeline";

type Props = {
  items: PlanDayItem[];
  mode?: PlanDaySimpleListMode;
  /** When set, list changes (reorder / patches) go through here. */
  onItemsChange?: (items: PlanDayItem[]) => void;
  onComplete?: (id: string) => void;
  onEdit?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (draggedId: string, targetIndex: number) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onPinToTop?: (id: string) => void;
  onLockPosition?: (id: string) => void;
  onSetPreferredTime?: (id: string, time: string) => void;
  onChangeDuration?: (id: string, minutes: number) => void;
  onAddNotes?: (id: string, notes: string) => void;
  onBreakIntoSteps?: (id: string) => void;
  onSkipUntilTomorrow?: (id: string) => void;
  onMoveToAnotherDay?: (id: string) => void;
  /** Show always-visible edit/delete (legacy tests / non-progressive). Default false. */
  showInlineEditDelete?: boolean;
  /** Adjust This Plan — expand every item's action row in place (no per-item tap needed). */
  forceExpandActions?: boolean;
  title?: string;
};

const CHOICE =
  "w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

/**
 * Today's list — calm progressive path: drag + tap-to-reveal actions.
 */
export function PlanDaySimpleList({
  items,
  mode = "calm-list",
  onComplete,
  onEdit,
  onDelete,
  onReorder,
  onMoveUp,
  onMoveDown,
  onPinToTop,
  onLockPosition,
  onSetPreferredTime,
  onChangeDuration,
  onAddNotes,
  onBreakIntoSteps,
  onSkipUntilTomorrow,
  onMoveToAnotherDay,
  showInlineEditDelete = false,
  forceExpandActions = false,
  title,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [inlinePrompt, setInlinePrompt] = useState<{
    id: string;
    kind: "time" | "duration" | "notes";
  } | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuId) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuId(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuId]);

  function beginEdit(item: PlanDayItem) {
    setEditingId(item.id);
    setDraft(item.title);
    setExpandedId(item.id);
    setMenuId(null);
  }

  function saveEdit(id: string) {
    const trimmed = draft.trim();
    if (!trimmed || !onEdit) return;
    onEdit(id, trimmed);
    setEditingId(null);
    setDraft("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }

  function openPrompt(
    id: string,
    kind: "time" | "duration" | "notes",
    initial: string,
  ) {
    setInlinePrompt({ id, kind });
    setPromptValue(initial);
    setMenuId(null);
    setExpandedId(id);
  }

  function submitPrompt() {
    if (!inlinePrompt) return;
    const { id, kind } = inlinePrompt;
    if (kind === "time" && onSetPreferredTime) {
      onSetPreferredTime(id, promptValue.trim());
    }
    if (kind === "duration" && onChangeDuration) {
      const mins = Number(promptValue);
      if (!Number.isNaN(mins) && mins > 0) onChangeDuration(id, mins);
    }
    if (kind === "notes" && onAddNotes) {
      onAddNotes(id, promptValue.trim());
    }
    setInlinePrompt(null);
    setPromptValue("");
  }

  const heading =
    title ?? (mode === "timeline" ? "TODAY" : "Today's List");

  return (
    <section
      className="flex flex-col gap-3"
      aria-label={heading}
      data-testid="plan-day-todays-list"
      data-list-mode={mode}
    >
      <h2
        className={
          mode === "timeline"
            ? "text-xl font-semibold tracking-wide text-[#1f1c19]"
            : "text-lg font-semibold text-[#1f1c19]"
        }
      >
        {heading}
      </h2>
      {items.length === 0 ? (
        <p
          className="text-base text-[#6b635a]"
          data-testid="plan-day-todays-list-empty"
        >
          Nothing here yet. Add whatever you want to do today.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const locked = isPlanItemLocked(item);
            const indicator = planItemPrimaryIndicator(item);
            const expanded =
              forceExpandActions || expandedId === item.id || menuId === item.id;
            const showActions =
              mode === "timeline" ? expanded : menuId === item.id;
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <li
                key={item.id}
                className="rounded-xl border border-[#e7dfd4] bg-white px-3 py-3"
                data-testid={`plan-day-simple-item-${item.id}`}
                data-locked={locked ? "true" : "false"}
                data-sort-order={item.sortOrder ?? index + 1}
                draggable={!locked && Boolean(onReorder)}
                onDragStart={(e) => {
                  if (locked || !onReorder) return;
                  setDragId(item.id);
                  e.dataTransfer.setData("text/plain", item.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!onReorder || !dragId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  if (id && onReorder) onReorder(id, index);
                  setDragId(null);
                }}
                onDragEnd={() => setDragId(null)}
              >
                <div className="flex items-start gap-2">
                  {locked ? (
                    <span
                      className="mt-1 inline-flex h-11 w-8 shrink-0 items-center justify-center text-base text-[#6b635a]"
                      aria-label="Locked in place"
                      data-testid={`plan-day-lock-${item.id}`}
                    >
                      🔒
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="mt-1 inline-flex h-11 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-base text-[#6b635a] hover:bg-[#f5f0ea] active:cursor-grabbing"
                      aria-label={`Drag to reorder ${item.title}`}
                      data-testid={`plan-day-drag-${item.id}`}
                      draggable={Boolean(onReorder)}
                      onDragStart={(e) => {
                        if (!onReorder) return;
                        e.stopPropagation();
                        setDragId(item.id);
                        e.dataTransfer.setData("text/plain", item.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    >
                      ⋮⋮
                    </button>
                  )}

                  <span
                    className="mt-2 w-6 shrink-0 text-sm font-semibold text-[#6b635a]"
                    aria-hidden="true"
                    data-testid={`plan-day-number-${item.id}`}
                  >
                    {item.sortOrder ?? index + 1}
                  </span>

                  {!locked && (onMoveUp || onMoveDown) ? (
                    <div className="mt-0.5 flex shrink-0 flex-col">
                      {onMoveUp ? (
                        <button
                          type="button"
                          className="inline-flex h-6 w-8 items-center justify-center rounded-md text-sm text-[#1e4f4f] hover:bg-[#f5f0ea] disabled:cursor-not-allowed disabled:text-[#c9bfb0] disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                          aria-label={`Move ${item.title} up`}
                          data-testid={`plan-day-move-up-${item.id}`}
                          disabled={isFirst}
                          onClick={() => onMoveUp(item.id)}
                        >
                          ▲
                        </button>
                      ) : null}
                      {onMoveDown ? (
                        <button
                          type="button"
                          className="inline-flex h-6 w-8 items-center justify-center rounded-md text-sm text-[#1e4f4f] hover:bg-[#f5f0ea] disabled:cursor-not-allowed disabled:text-[#c9bfb0] disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                          aria-label={`Move ${item.title} down`}
                          data-testid={`plan-day-move-down-${item.id}`}
                          disabled={isLast}
                          onClick={() => onMoveDown(item.id)}
                        >
                          ▼
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {mode === "calm-list" && onComplete ? (
                    <button
                      type="button"
                      onClick={() => onComplete(item.id)}
                      className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#c9bfb0] text-base text-[#1e4f4f] hover:bg-[#f5f0ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                      aria-label={`Complete ${item.title}`}
                      data-testid={`plan-day-simple-complete-${item.id}`}
                    >
                      □
                    </button>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    {editingId === item.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit(item.id);
                            }
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="w-full rounded-lg border border-[#c9bfb0] px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                          aria-label="Edit item"
                          data-testid={`plan-day-simple-edit-input-${item.id}`}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="text-sm font-semibold text-[#1e4f4f] hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-sm font-semibold text-[#6b635a] hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          if (mode === "timeline") {
                            setExpandedId((cur) =>
                              cur === item.id ? null : item.id,
                            );
                          }
                        }}
                        data-testid={`plan-day-card-${item.id}`}
                      >
                        <p className="text-base leading-snug text-[#1f1c19]">
                          {item.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {item.durationMinutes ? (
                            <span
                              className="rounded-full bg-[#f5f0ea] px-2 py-0.5 text-xs font-semibold text-[#6b635a]"
                              data-testid={`plan-day-duration-${item.id}`}
                            >
                              {item.durationMinutes} min
                            </span>
                          ) : null}
                          {item.startTime || item.preferredTime ? (
                            <span className="text-xs font-medium text-[#6b635a]">
                              {item.preferredTime || item.startTime}
                            </span>
                          ) : null}
                          {indicator ? (
                            <span
                              className="rounded-full bg-[#faf7f2] px-2 py-0.5 text-xs font-medium text-[#4b463f]"
                              data-testid={`plan-day-indicator-${item.id}`}
                            >
                              <span aria-hidden="true">{indicator.emoji}</span>{" "}
                              {indicator.label}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    )}

                    {inlinePrompt?.id === item.id ? (
                      <div
                        className="mt-2 flex flex-col gap-2"
                        data-testid={`plan-day-inline-prompt-${item.id}`}
                      >
                        <label className="text-sm font-semibold text-[#6b635a]">
                          {inlinePrompt.kind === "time"
                            ? "Preferred time"
                            : inlinePrompt.kind === "duration"
                              ? "Duration (minutes)"
                              : "Notes"}
                        </label>
                        <input
                          type={
                            inlinePrompt.kind === "time"
                              ? "time"
                              : inlinePrompt.kind === "duration"
                                ? "number"
                                : "text"
                          }
                          value={promptValue}
                          onChange={(e) => setPromptValue(e.target.value)}
                          className="w-full rounded-lg border border-[#c9bfb0] px-3 py-2 text-base"
                          data-testid={`plan-day-prompt-input-${item.id}`}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-sm font-semibold text-[#1e4f4f]"
                            onClick={submitPrompt}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="text-sm font-semibold text-[#6b635a]"
                            onClick={() => setInlinePrompt(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {showActions && mode === "timeline" ? (
                      <div
                        className="mt-3 flex flex-wrap gap-2"
                        data-testid={`plan-day-card-actions-${item.id}`}
                      >
                        {onEdit ? (
                          <button
                            type="button"
                            className="rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
                            onClick={() => beginEdit(item)}
                            data-testid={`plan-day-action-edit-${item.id}`}
                          >
                            Edit
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            type="button"
                            className="rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
                            onClick={() => onDelete(item.id)}
                            data-testid={`plan-day-action-delete-${item.id}`}
                          >
                            Delete
                          </button>
                        ) : null}
                        {onSetPreferredTime ? (
                          <button
                            type="button"
                            className="rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
                            onClick={() =>
                              openPrompt(
                                item.id,
                                "time",
                                item.preferredTime || item.startTime || "09:00",
                              )
                            }
                          >
                            Set Time
                          </button>
                        ) : null}
                        {onAddNotes ? (
                          <button
                            type="button"
                            className="rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
                            onClick={() =>
                              openPrompt(item.id, "notes", item.notes ?? "")
                            }
                          >
                            Add Notes
                          </button>
                        ) : null}
                        {onBreakIntoSteps ? (
                          <button
                            type="button"
                            className="rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
                            onClick={() => onBreakIntoSteps(item.id)}
                            data-testid={`plan-day-action-break-${item.id}`}
                          >
                            Break into steps
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="relative shrink-0" ref={menuId === item.id ? menuRef : undefined}>
                    <button
                      type="button"
                      className="inline-flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-lg font-semibold text-[#6b635a] hover:bg-[#f5f0ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                      aria-label={`More actions for ${item.title}`}
                      aria-expanded={menuId === item.id}
                      data-testid={`plan-day-more-${item.id}`}
                      onClick={() =>
                        setMenuId((cur) => (cur === item.id ? null : item.id))
                      }
                    >
                      ⋯
                    </button>
                    {menuId === item.id ? (
                      <div
                        className="absolute right-0 z-20 mt-1 min-w-[12rem] rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-md"
                        role="menu"
                        data-testid={`plan-day-more-menu-${item.id}`}
                      >
                        {!locked && onMoveUp ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            data-testid={`plan-day-menu-move-up-${item.id}`}
                            onClick={() => {
                              onMoveUp(item.id);
                              setMenuId(null);
                            }}
                          >
                            Move Up
                          </button>
                        ) : null}
                        {!locked && onMoveDown ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            data-testid={`plan-day-menu-move-down-${item.id}`}
                            onClick={() => {
                              onMoveDown(item.id);
                              setMenuId(null);
                            }}
                          >
                            Move Down
                          </button>
                        ) : null}
                        {!locked && onPinToTop ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() => {
                              onPinToTop(item.id);
                              setMenuId(null);
                            }}
                          >
                            Pin to Top
                          </button>
                        ) : null}
                        {!locked && onLockPosition ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() => {
                              onLockPosition(item.id);
                              setMenuId(null);
                            }}
                          >
                            Lock This Position
                          </button>
                        ) : null}
                        {onSetPreferredTime ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() =>
                              openPrompt(
                                item.id,
                                "time",
                                item.preferredTime || item.startTime || "09:00",
                              )
                            }
                          >
                            Set Preferred Time
                          </button>
                        ) : null}
                        {onChangeDuration ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() =>
                              openPrompt(
                                item.id,
                                "duration",
                                String(item.durationMinutes ?? 30),
                              )
                            }
                          >
                            Change Duration
                          </button>
                        ) : null}
                        {onEdit ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            data-testid={`plan-day-simple-edit-${item.id}`}
                            onClick={() => beginEdit(item)}
                          >
                            Edit
                          </button>
                        ) : null}
                        {onBreakIntoSteps ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() => {
                              onBreakIntoSteps(item.id);
                              setMenuId(null);
                            }}
                          >
                            Break Into Smaller Steps
                          </button>
                        ) : null}
                        {onSkipUntilTomorrow ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() => {
                              onSkipUntilTomorrow(item.id);
                              setMenuId(null);
                            }}
                          >
                            Skip Until Tomorrow
                          </button>
                        ) : null}
                        {onMoveToAnotherDay ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() => {
                              onMoveToAnotherDay(item.id);
                              setMenuId(null);
                            }}
                          >
                            Move to Another Day
                          </button>
                        ) : null}
                        {onComplete ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            onClick={() => {
                              onComplete(item.id);
                              setMenuId(null);
                            }}
                          >
                            Mark Complete
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            type="button"
                            className={CHOICE}
                            role="menuitem"
                            data-testid={`plan-day-simple-delete-${item.id}`}
                            onClick={() => {
                              onDelete(item.id);
                              setMenuId(null);
                            }}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {showInlineEditDelete && editingId !== item.id ? (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => beginEdit(item)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 py-1 text-base text-[#6b635a] hover:bg-[#f5f0ea]"
                        aria-label={`Edit ${item.title}`}
                        data-testid={`plan-day-simple-edit-${item.id}`}
                      >
                        ✏
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(item.id)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 py-1 text-base text-[#6b635a] hover:bg-[#f5f0ea]"
                        aria-label={`Delete ${item.title}`}
                        data-testid={`plan-day-simple-delete-${item.id}`}
                      >
                        🗑
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
