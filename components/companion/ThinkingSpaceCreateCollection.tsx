"use client";

import { useState } from "react";
import { createThoughtCollection } from "@/lib/thinkingSpace";
import { DEFAULT_COLLECTION_CATALOG, paletteForColorId } from "@/lib/thinkingSpace/collectionColors";
import {
  MY_THOUGHTS_CREATE_COLLECTION,
  MY_THOUGHTS_CREATE_CUSTOM,
  MY_THOUGHTS_CREATE_PLACEHOLDER,
  MY_THOUGHTS_STARTER_COLLECTIONS,
} from "@/lib/thinkingSpace/copy";

type Props = {
  existingLabels: Set<string>;
  onCreated: () => void;
};

export function ThinkingSpaceCreateCollection({
  existingLabels,
  onCreated,
}: Props) {
  const [customName, setCustomName] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleCreate(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (existingLabels.has(trimmed.toLowerCase())) {
      onCreated();
      return;
    }
    createThoughtCollection({ label: trimmed, userCreated: true });
    setCustomName("");
    onCreated();
  }

  const starters = DEFAULT_COLLECTION_CATALOG.filter(
    (c) => !existingLabels.has(c.label.toLowerCase()),
  );

  return (
    <div
      className="rounded-2xl border border-dashed border-[#d4cdc3] bg-[#faf7f2]/50 p-4"
      data-testid="create-collection"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        {expanded ? "−" : "+"} {MY_THOUGHTS_CREATE_COLLECTION}
      </button>

      {expanded ? (
        <div className="mt-4 space-y-4">
          {starters.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#9a8f82]">
                {MY_THOUGHTS_STARTER_COLLECTIONS}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {starters.map((item) => {
                  const palette = paletteForColorId(item.colorId);
                  return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleCreate(item.label)}
                    className="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: palette.chipBg,
                      borderColor: palette.border,
                      color: palette.chipText,
                    }}
                  >
                    <span aria-hidden>{item.icon}</span> {item.label}
                  </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={MY_THOUGHTS_CREATE_PLACEHOLDER}
              className="min-w-[12rem] flex-1 rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate(customName);
              }}
            />
            <button
              type="button"
              disabled={!customName.trim()}
              onClick={() => handleCreate(customName)}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {MY_THOUGHTS_CREATE_CUSTOM}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
