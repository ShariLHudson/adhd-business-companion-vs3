"use client";

import { useState } from "react";
import { createUserLifeArea } from "@/lib/companionBrain/lifeAreas";
import type { LifeArea } from "@/lib/companionBrain/lifeAreas/types";

type Props = {
  onCreated: (area: LifeArea) => void;
  onCancel: () => void;
};

const FIELD =
  "mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
const LABEL = "block text-xs font-bold uppercase tracking-wide text-[#6b635a]";

const COLOR_PRESETS = [
  "#4a6fa5",
  "#2e8b57",
  "#d4688a",
  "#9a6fb0",
  "#e8954a",
  "#5a9fb8",
  "#6b7fa8",
];

export function CreateLifeAreaForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]!);
  const [description, setDescription] = useState("");
  const [remember, setRemember] = useState(true);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const area = createUserLifeArea({
      name: trimmed,
      color,
      description: description.trim() || undefined,
      rememberForSuggestions: remember,
    });
    onCreated(area);
  }

  return (
    <div data-testid="create-life-area-form">
      <label className={LABEL}>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
          placeholder="e.g. Visual Spark Studios™"
        />
      </label>

      <p className={`${LABEL} mt-3`}>Color (optional)</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-[#1e4f4f]" : "border-transparent"}`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>

      <label className={`${LABEL} mt-3`}>
        Description (optional)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={FIELD}
          placeholder="What belongs in this part of your life?"
        />
      </label>

      <label className="mt-3 flex items-center gap-2 text-sm text-[#6b635a]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 accent-[#1e4f4f]"
        />
        Should I remember this Life Area for future suggestions?
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Create Life Area
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#9a8f82]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
