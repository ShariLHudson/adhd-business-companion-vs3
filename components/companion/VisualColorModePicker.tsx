"use client";

import { useEffect, useState } from "react";
import type { VisualMode } from "@/lib/companionStore";
import {
  DYNAMIC_MODE_SWATCHES,
  MEANING_CATEGORY_SWATCHES,
  VISUAL_COLOR_OPTIONS,
} from "@/lib/visualColorModes";

const CARD =
  "w-full rounded-2xl border bg-white/90 p-4 text-left transition-colors";

type Props = {
  current: VisualMode;
  onPick: (mode: VisualMode) => void;
};

function DynamicPreview() {
  const [index, setIndex] = useState(0);
  const mode = DYNAMIC_MODE_SWATCHES[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % DYNAMIC_MODE_SWATCHES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#d4cdc3]">
      <div
        className="visual-color-preview-shift px-4 py-5 transition-colors duration-700"
        style={{ backgroundColor: mode.tint }}
        key={mode.id}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Live preview · adapts with you
        </p>
        <p
          className="mt-2 text-lg font-semibold transition-colors duration-700"
          style={{ color: mode.color }}
        >
          {mode.label} mode
        </p>
        <div className="mt-3 flex gap-2">
          <div
            className="h-8 flex-1 rounded-lg transition-colors duration-700"
            style={{ backgroundColor: mode.color }}
          />
          <div className="h-8 flex-1 rounded-lg border border-[#d4cdc3] bg-white/80" />
        </div>
        <p className="mt-2 text-sm text-[#6b635a]">
          Backgrounds and accents shift with your energy, mood, and what you are
          doing.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-[#e7dfd4] bg-white px-3 py-2.5">
        {DYNAMIC_MODE_SWATCHES.map((m, i) => (
          <span
            key={m.id}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-opacity ${
              i === index ? "opacity-100" : "opacity-45"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: m.color }}
              aria-hidden="true"
            />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MeaningPreview() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Live preview · same color every time
      </p>
      <p className="mt-2 text-sm text-[#4b463f]">
        Each area keeps its color so you can scan at a glance.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {MEANING_CATEGORY_SWATCHES.map((cat) => (
          <span
            key={cat.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e7dfd4] bg-white px-2.5 py-1 text-sm font-medium text-[#3d3630]"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
              aria-hidden="true"
            />
            {cat.label}
          </span>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {MEANING_CATEGORY_SWATCHES.slice(0, 3).map((cat) => (
          <div
            key={cat.label}
            className="flex items-center gap-2 rounded-lg border border-[#e7dfd4] bg-white px-3 py-2"
          >
            <span
              className="h-3 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
              aria-hidden="true"
            />
            <span className="text-sm text-[#3d3630]">{cat.label}</span>
            <span
              className="ml-auto text-xs font-medium"
              style={{ color: cat.color }}
            >
              always {cat.label.toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NonePreview() {
  return (
    <div className="mt-3 rounded-xl border border-[#d4cdc3] bg-white px-4 py-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Live preview · minimal
      </p>
      <div className="mt-3 space-y-1.5">
        {["Task", "Reminder", "Note"].map((label) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-[#e7dfd4] px-3 py-2 text-sm text-[#3d3630]"
          >
            {label}
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-[#6b635a]">No color coding — text only.</p>
    </div>
  );
}

function ModePreview({ mode }: { mode: VisualMode }) {
  if (mode === "decorative") return <DynamicPreview />;
  if (mode === "meaning") return <MeaningPreview />;
  return <NonePreview />;
}

export function VisualColorModePicker({ current, onPick }: Props) {
  const [previewMode, setPreviewMode] = useState<VisualMode>(current);

  useEffect(() => {
    setPreviewMode(current);
  }, [current]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        {VISUAL_COLOR_OPTIONS.map((it) => {
          const active = it.id === current;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setPreviewMode(it.id);
                onPick(it.id);
              }}
              onMouseEnter={() => setPreviewMode(it.id)}
              onFocus={() => setPreviewMode(it.id)}
              className={`${CARD} ${
                active
                  ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] ring-1 ring-[#1e4f4f]/20"
                  : "border-[#d4cdc3] hover:border-[#1e4f4f]/45"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-[#1f1c19]">
                  {it.label}
                </span>
                {active && <span className="text-[#1e4f4f]">✓</span>}
              </span>
              <span className="mt-0.5 block text-sm text-[#6b635a]">
                {it.desc}
              </span>
              {it.id === "decorative" && (
                <span className="mt-2 flex flex-wrap gap-1">
                  {DYNAMIC_MODE_SWATCHES.map((m) => (
                    <span
                      key={m.id}
                      className="h-2 w-6 rounded-full"
                      style={{ backgroundColor: m.color }}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              )}
              {it.id === "meaning" && (
                <span className="mt-2 flex flex-wrap gap-1">
                  {MEANING_CATEGORY_SWATCHES.map((m) => (
                    <span
                      key={m.label}
                      className="h-2 w-6 rounded-full"
                      style={{ backgroundColor: m.color }}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        <p className={LABEL}>Preview</p>
        <ModePreview mode={previewMode} />
      </div>
    </div>
  );
}

const LABEL = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";
