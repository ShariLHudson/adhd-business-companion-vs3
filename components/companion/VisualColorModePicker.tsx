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

const LABEL = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

type Props = {
  current: VisualMode;
  onPick: (mode: VisualMode) => void;
};

function DynamicPreview() {
  const [index, setIndex] = useState(0);
  const active = DYNAMIC_MODE_SWATCHES[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % DYNAMIC_MODE_SWATCHES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#d4cdc3]">
      <div
        className="px-4 py-5 transition-colors duration-500"
        style={{ backgroundColor: active.tint }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Dynamic · shifts with your situation
        </p>
        <p
          className="mt-2 text-lg font-semibold transition-colors duration-500"
          style={{ color: active.color }}
        >
          {active.label} right now
        </p>
        <div
          className="mt-3 rounded-lg border px-3 py-2.5 transition-colors duration-500"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: active.color,
            backgroundColor: "rgba(255,255,255,0.75)",
          }}
        >
          <p className="text-sm font-medium text-[#3d3630]">Sample workspace row</p>
          <p className="mt-0.5 text-xs text-[#6b635a]">
            Accent color follows {active.label.toLowerCase()}, not the category.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 border-t border-[#e7dfd4] bg-white p-2">
        {DYNAMIC_MODE_SWATCHES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`rounded-lg px-1 py-2 text-center transition-all ${
              i === index ? "ring-2 ring-[#1e4f4f]/40" : "opacity-60 hover:opacity-90"
            }`}
            style={{ backgroundColor: m.tint }}
          >
            <span
              className="mx-auto mb-1 block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: m.color }}
              aria-hidden="true"
            />
            <span className="block text-[10px] font-semibold leading-tight text-[#3d3630]">
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MeaningPreview() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Meaning-based · same color every time
      </p>
      <p className="mt-1 text-sm text-[#4b463f]">
        Projects are always teal. Focus is always blue. Scan by color, not label.
      </p>
      <div className="mt-3 space-y-1.5">
        {MEANING_CATEGORY_SWATCHES.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center gap-2 rounded-lg border border-[#e7dfd4] bg-white px-3 py-2"
            style={{ borderLeftWidth: 4, borderLeftColor: cat.color }}
          >
            <span className="text-sm font-medium text-[#3d3630]">{cat.label}</span>
            <span
              className="ml-auto text-xs font-semibold"
              style={{ color: cat.color }}
            >
              fixed
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
        None · clean and neutral
      </p>
      <div className="mt-3 space-y-1.5">
        {["Projects", "Focus", "Planning"].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2 text-sm text-[#3d3630]"
          >
            {label}
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-[#6b635a]">No color coding — text and layout only.</p>
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
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setPreviewMode(current);
  }, [current]);

  useEffect(() => {
    if (!savedFlash) return;
    const id = window.setTimeout(() => setSavedFlash(false), 2200);
    return () => window.clearTimeout(id);
  }, [savedFlash]);

  function pick(mode: VisualMode) {
    setPreviewMode(mode);
    onPick(mode);
    setSavedFlash(true);
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {savedFlash ? (
        <p
          className="companion-fade-in text-center text-sm font-semibold text-[#1e4f4f]"
          role="status"
        >
          ✓ Appearance updated
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {VISUAL_COLOR_OPTIONS.map((it) => {
          const active = it.id === current;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => pick(it.id)}
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
              <span className="mt-0.5 block text-sm text-[#6b635a]">{it.desc}</span>
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
        <p className={LABEL}>Preview — {VISUAL_COLOR_OPTIONS.find((o) => o.id === previewMode)?.label}</p>
        <ModePreview mode={previewMode} />
      </div>
    </div>
  );
}
