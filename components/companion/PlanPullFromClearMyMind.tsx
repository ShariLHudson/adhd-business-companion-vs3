"use client";

import { useMemo, useState } from "react";
import { getBrainDumps } from "@/lib/companionStore";

export function PlanPullFromClearMyMind({
  onAddSelected,
}: {
  onAddSelected: (titles: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const entries = useMemo(() => {
    if (!open) return [];
    return getBrainDumps()
      .filter((e) => !e.done && e.text.trim())
      .slice(0, 12);
  }, [open]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const titles = entries
      .filter((e) => selected.has(e.id))
      .map((e) => e.text.trim());
    if (titles.length) onAddSelected(titles);
    setSelected(new Set());
    setOpen(false);
  }

  return (
    <div data-testid="plan-pull-from-clear-my-mind">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        Pull From Clear My Mind
      </button>

      {open ? (
        <div className="mt-2 rounded-xl border border-[#e7dfd4] bg-white p-3 shadow-sm">
          {entries.length === 0 ? (
            <p className="text-sm text-[#6b635a]">
              Nothing recent in Clear My Mind yet — capture thoughts there first.
            </p>
          ) : (
            <>
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm text-[#1f1c19]">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => toggle(entry.id)}
                        className="mt-0.5 h-4 w-4 accent-[#1e4f4f]"
                      />
                      <span className="min-w-0 flex-1 leading-snug">{entry.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleAdd}
                disabled={selected.size === 0}
                className="mt-3 rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163c3c] disabled:opacity-50"
              >
                Add Selected To Today
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
