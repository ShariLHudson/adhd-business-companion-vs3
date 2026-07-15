"use client";

import { useEffect, useState } from "react";
import type { VisualMode } from "@/lib/companionStore";
import {
  DYNAMIC_MODE_SWATCHES,
  MEANING_CATEGORY_SWATCHES,
  VISUAL_COLOR_OPTIONS,
} from "@/lib/visualColorModes";
import { activeColorModeProofLabel } from "@/lib/visualColorCoding";

/** Match dark Settings / Estate menu button rows (not light cream cards). */
const CARD =
  "settings-appearance-option w-full rounded-[0.65rem] border border-[rgba(255,248,235,0.2)] bg-[rgba(255,255,255,0.05)] p-4 text-left text-[rgba(255,248,235,0.98)] transition-colors";

type Props = {
  current: VisualMode;
  onSave: (mode: VisualMode) => void;
};

const PREVIEW_SHELL =
  "settings-color-mode-preview mt-3 overflow-hidden rounded-xl border border-[#cfc6ba]";

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
    <div
      className={PREVIEW_SHELL}
      data-testid="settings-color-mode-preview"
      data-preview-mode="decorative"
    >
      <div
        className="px-4 py-5 transition-colors duration-500"
        style={{ backgroundColor: active.tint }}
      >
        <p className="settings-color-mode-preview__eyebrow text-xs font-bold uppercase tracking-wide">
          Adaptive · soft rainbow
        </p>
        <p className="mt-2 text-lg font-semibold text-[#2d2926]">
          {active.label} right now
        </p>
        <div
          className="mt-3 rounded-lg border border-[#d4cdc3] px-3 py-2.5 transition-colors duration-500"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: active.color,
            backgroundColor: "rgba(255,255,255,0.88)",
          }}
        >
          <p className="text-sm font-medium text-[#2d2926]">Sample workspace row</p>
          <p className="settings-color-mode-preview__muted mt-0.5 text-xs">
            Accent color follows {active.label.toLowerCase()}, not the category.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 border-t border-[#d4cdc3] bg-[#f0ebe3] p-2 sm:grid-cols-7">
        {DYNAMIC_MODE_SWATCHES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            aria-label={`Preview ${m.label}`}
            className={`rounded-lg px-1 py-2 text-center transition-all ${
              i === index
                ? "ring-2 ring-[#1e4f4f]/55"
                : "opacity-90 hover:opacity-100"
            }`}
            style={{ backgroundColor: m.tint }}
          >
            <span
              className="mx-auto mb-1 block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: m.color }}
              aria-hidden="true"
            />
            <span className="settings-color-mode-preview__chip-label block text-[10px] font-semibold leading-tight">
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
    <div
      className={`${PREVIEW_SHELL} bg-[#f0ebe3] px-4 py-5`}
      data-testid="settings-color-mode-preview"
      data-preview-mode="meaning"
    >
      <p className="settings-color-mode-preview__eyebrow text-xs font-bold uppercase tracking-wide">
        Category · same color every time
      </p>
      <p className="settings-color-mode-preview__muted mt-1 text-sm">
        Projects are always teal. Focus is always blue. Scan by color, not label.
      </p>
      <div className="mt-3 space-y-1.5">
        {MEANING_CATEGORY_SWATCHES.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center gap-2 rounded-lg border border-[#d4cdc3] bg-white px-3 py-2"
            style={{ borderLeftWidth: 4, borderLeftColor: cat.color }}
          >
            <span className="text-sm font-medium text-[#2d2926]">{cat.label}</span>
            <span className="settings-color-mode-preview__muted ml-auto text-xs font-semibold">
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
    <div
      className={`${PREVIEW_SHELL} bg-[#f0ebe3] px-4 py-5`}
      data-testid="settings-color-mode-preview"
      data-preview-mode="off"
    >
      <p className="settings-color-mode-preview__eyebrow text-xs font-bold uppercase tracking-wide">
        Minimal · clean and neutral
      </p>
      <div className="mt-3 space-y-1.5">
        {["Projects", "Focus", "Planning"].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#2d2926]"
          >
            {label}
          </div>
        ))}
      </div>
      <p className="settings-color-mode-preview__muted mt-2 text-sm">
        No color coding — text and layout only.
      </p>
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

  const dirty = draft !== current;

  function save() {
    onSave(draft);
    setSavedFlash(true);
  }

  return (
    <div
      className="settings-appearance-picker mt-4 flex flex-col gap-4"
      data-testid="settings-appearance-picker"
    >
      <p
        className="rounded-[0.65rem] border border-[rgba(255,248,235,0.2)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm font-semibold text-[rgba(255,248,235,0.98)]"
        role="status"
        aria-live="polite"
      >
        {activeColorModeProofLabel(current)}
      </p>

      <details className="rounded-[0.65rem] border border-[rgba(255,248,235,0.2)] bg-[rgba(255,255,255,0.05)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[rgba(255,248,235,0.98)] hover:text-[rgba(255,236,200,1)]">
          ▼ What do these color modes do?
        </summary>
        <div className="mt-3 flex flex-col gap-3 text-sm text-[rgba(255,236,200,0.78)]">
          {VISUAL_COLOR_OPTIONS.map((opt) => (
            <div key={opt.id}>
              <p className="font-semibold text-[rgba(255,248,235,0.98)]">
                {opt.label}
              </p>
              <p className="mt-0.5 text-[rgba(255,236,200,0.72)]">
                {opt.explanation}
              </p>
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
                  ? "border-[rgba(201,164,108,0.55)] bg-[rgba(201,164,108,0.1)]"
                  : "hover:border-[rgba(255,248,235,0.3)] hover:bg-[rgba(255,255,255,0.1)]"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-[rgba(255,248,235,0.98)]">
                  {it.label}
                </span>
                {selected && current === it.id ? (
                  <span className="text-[rgba(255,220,160,0.95)]">✓</span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-sm text-[rgba(255,236,200,0.72)]">
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
        <p className="text-sm font-semibold text-[rgba(255,248,235,0.98)]">Preview</p>
        <p className="mt-1 text-sm text-[rgba(255,236,200,0.78)]">
          This is an example of how Spark Estate will look using the selected color
          mode. The preview updates instantly as you choose different options.
        </p>
        <ModePreview mode={draft} />
      </div>

      {savedFlash ? (
        <p
          className="companion-fade-in text-center text-sm font-semibold text-[rgba(255,220,160,0.95)]"
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
