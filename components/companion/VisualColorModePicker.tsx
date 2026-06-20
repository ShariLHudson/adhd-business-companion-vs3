"use client";

import { useEffect, useState } from "react";
import type { VisualMode } from "@/lib/companionStore";
import {
  DYNAMIC_MODE_SWATCHES,
  MEANING_CATEGORY_SWATCHES,
  VISUAL_COLOR_OPTIONS,
} from "@/lib/visualColorModes";
import { activeColorModeProofLabel } from "@/lib/visualColorCoding";

const CARD =
  "w-full rounded-2xl border bg-white/90 p-4 text-left transition-colors";

const LABEL = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

type Props = {
  current: VisualMode;
  onSave: (mode: VisualMode) => void;
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
          Adaptive · soft rainbow
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
      <div className="grid grid-cols-4 gap-1 border-t border-[#e7dfd4] bg-white p-2 sm:grid-cols-7">
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
        Category · same color every time
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
        Minimal · clean and neutral
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

export function VisualColorModePicker({ current, onSave }: Props) {
  const [draft, setDraft] = useState<VisualMode>(current);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(current);
  }, [current]);

  useEffect(() => {
    if (!savedFlash) return;
    const id = window.setTimeout(() => setSavedFlash(false), 2200);
    return () => window.clearTimeout(id);
  }, [savedFlash]);

  const previewOption = VISUAL_COLOR_OPTIONS.find((o) => o.id === draft);
  const dirty = draft !== current;

  function save() {
    onSave(draft);
    setSavedFlash(true);
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <p
        className="rounded-xl border border-dashed border-[#c9bfb0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1c19]"
        role="status"
        aria-live="polite"
      >
        {activeColorModeProofLabel(current)}
      </p>

      <details className="rounded-xl border border-[#d4cdc3] bg-white/70 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#1f1c19] hover:text-[#1e4f4f]">
          ▼ What do these color modes do?
        </summary>
        <div className="mt-3 flex flex-col gap-3 text-sm text-[#4b463f]">
          {VISUAL_COLOR_OPTIONS.map((opt) => (
            <div key={opt.id}>
              <p className="font-semibold text-[#1f1c19]">{opt.label}</p>
              <p className="mt-0.5 text-[#6b635a]">{opt.explanation}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="flex flex-col gap-2.5">
        {VISUAL_COLOR_OPTIONS.map((it) => {
          const selected = it.id === draft;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setDraft(it.id)}
              className={`${CARD} ${
                selected
                  ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] ring-1 ring-[#1e4f4f]/20"
                  : "border-[#d4cdc3] hover:border-[#1e4f4f]/45"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-[#1f1c19]">
                  {it.label}
                </span>
                {selected && current === it.id ? (
                  <span className="text-[#1e4f4f]">✓</span>
                ) : null}
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
        <p className="text-sm text-[#6b635a]">
          What you&apos;re seeing below is an example of how the app would look using
          the selected color mode.
        </p>
        {previewOption ? (
          <p className="mt-1 text-sm font-medium text-[#4b463f]">
            {previewOption.previewNote}
          </p>
        ) : null}
        <p className={`${LABEL} mt-3`}>Preview — {previewOption?.label}</p>
        <ModePreview mode={draft} />
      </div>

      {savedFlash ? (
        <p
          className="companion-fade-in text-center text-sm font-semibold text-[#1e4f4f]"
          role="status"
        >
          ✓ Appearance updated — {activeColorModeProofLabel(draft)}
        </p>
      ) : null}

      <button
        type="button"
        onClick={save}
        disabled={!dirty && !savedFlash}
        className="w-full rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:cursor-default disabled:opacity-50"
      >
        Save Changes
      </button>
    </div>
  );
}
