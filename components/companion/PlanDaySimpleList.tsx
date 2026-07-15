"use client";

import { useState } from "react";
import type { PlanDayItem } from "@/lib/planMyDay";

type Props = {
  items: PlanDayItem[];
  onComplete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

/**
 * Today's list — complete, edit, delete only.
 */
export function PlanDaySimpleList({
  items,
  onComplete,
  onEdit,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function beginEdit(item: PlanDayItem) {
    setEditingId(item.id);
    setDraft(item.title);
  }

  function saveEdit(id: string) {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onEdit(id, trimmed);
    setEditingId(null);
    setDraft("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }

  return (
    <section
      className="flex flex-col gap-3"
      aria-label="Today's List"
      data-testid="plan-day-todays-list"
    >
      <h2 className="text-lg font-semibold text-[#1f1c19]">Today&apos;s List</h2>
      {items.length === 0 ? (
        <p
          className="text-base text-[#6b635a]"
          data-testid="plan-day-todays-list-empty"
        >
          Nothing here yet. Add whatever you want to do today.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-xl border border-[#e7dfd4] bg-white px-3 py-3"
              data-testid={`plan-day-simple-item-${item.id}`}
            >
              <button
                type="button"
                onClick={() => onComplete(item.id)}
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#c9bfb0] text-base text-[#1e4f4f] hover:bg-[#f5f0ea]"
                aria-label={`Complete ${item.title}`}
                data-testid={`plan-day-simple-complete-${item.id}`}
              >
                □
              </button>

              {editingId === item.id ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2">
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
                <p className="min-w-0 flex-1 text-base leading-snug text-[#1f1c19]">
                  {item.title}
                </p>
              )}

              {editingId === item.id ? null : (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => beginEdit(item)}
                    className="rounded-md px-2 py-1 text-base text-[#6b635a] hover:bg-[#f5f0ea] hover:text-[#1e4f4f]"
                    aria-label={`Edit ${item.title}`}
                    data-testid={`plan-day-simple-edit-${item.id}`}
                  >
                    ✏
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="rounded-md px-2 py-1 text-base text-[#6b635a] hover:bg-[#f5f0ea] hover:text-[#1e4f4f]"
                    aria-label={`Delete ${item.title}`}
                    data-testid={`plan-day-simple-delete-${item.id}`}
                  >
                    🗑
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
