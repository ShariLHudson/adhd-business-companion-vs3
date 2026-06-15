"use client";

import { useMemo, useState } from "react";
import {
  sortedCreateCatalog,
  type CreateCatalogItem,
} from "@/lib/createCatalog";

export function CreateCatalogPicker({
  onSelect,
  highlightLabel,
  compact = false,
}: {
  onSelect: (item: CreateCatalogItem) => void;
  highlightLabel?: string | null;
  compact?: boolean;
}) {
  const [filter, setFilter] = useState("");

  const catalog = useMemo(() => sortedCreateCatalog(), []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.matchTerms?.some((t) => t.includes(q)),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [filter, catalog]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search — e.g. proposal, email, SOP…"
          className="w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
      </div>

      {filtered.map((cat) => (
        <section key={cat.id}>
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {cat.label}
          </h3>
          <div
            className={`mt-2 grid gap-2 ${
              compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {cat.items.map((item) => {
              const active =
                highlightLabel?.toLowerCase() === item.label.toLowerCase();
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`rounded-2xl border px-3 py-3 text-left shadow-sm transition-colors ${
                    active
                      ? "border-[#1e4f4f] bg-[#1e4f4f]/10"
                      : "border-[#1e4f4f]/20 bg-white/85 hover:border-[#1e4f4f]/45 hover:bg-white"
                  } ${compact ? "py-2.5" : "py-3.5"}`}
                >
                  <span className={compact ? "text-xl" : "text-2xl"}>
                    {item.emoji}
                  </span>
                  <span
                    className={`mt-1 block font-semibold text-[#1f1c19] ${
                      compact ? "text-sm" : "text-base"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
