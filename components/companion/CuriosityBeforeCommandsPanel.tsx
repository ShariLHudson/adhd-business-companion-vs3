"use client";

import { useEffect, useState } from "react";
import {
  CURIOSITY_MODE_OPTIONS,
  buildCuriosityBeforeCommandsPrompt,
  getCuriosityBeforeCommandsPreference,
  saveCuriosityBeforeCommandsPreference,
  subscribeCuriosityBeforeCommands,
  type CuriosityBeforeCommandsMode,
} from "@/lib/curiosityBeforeCommands";

type StatusMsg = { tone: "ok" | "error"; text: string } | null;

export function CuriosityBeforeCommandsPanel() {
  const [mode, setMode] = useState<CuriosityBeforeCommandsMode>("situational");
  const [status, setStatus] = useState<StatusMsg>(null);
  const [previewSeed, setPreviewSeed] = useState(0);

  function refresh() {
    setMode(getCuriosityBeforeCommandsPreference().mode);
  }

  useEffect(() => {
    refresh();
    return subscribeCuriosityBeforeCommands(refresh);
  }, []);

  function flash(tone: "ok" | "error", text: string) {
    setStatus({ tone, text });
    window.setTimeout(() => setStatus(null), 2800);
  }

  function selectMode(next: CuriosityBeforeCommandsMode) {
    const result = saveCuriosityBeforeCommandsPreference({ mode: next });
    if (!result.ok) {
      flash(
        "error",
        "I couldn’t save that preference just now. Your choice is still here, and I’ll keep trying.",
      );
      return;
    }
    setMode(result.preference.mode);
    flash("ok", "I’ll use this from now on. You can change it anytime.");
  }

  const previewCuriosity = buildCuriosityBeforeCommandsPrompt(
    {
      actionLabel: "the kitchen",
      knownBenefit: "a little more calm at home",
      preferSmallStep: true,
      variationSeed: previewSeed,
    },
    { mode },
  );
  const previewDirect = buildCuriosityBeforeCommandsPrompt(
    {
      actionLabel: "reply to Susan",
      forceDirect: true,
      preferSmallStep: true,
    },
    { mode },
  );

  return (
    <section
      className="curiosity-before-commands-panel"
      data-testid="curiosity-before-commands-panel"
      aria-label="Curiosity Before Commands"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-[#2c2620]">
          Curiosity Before Commands
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
          When an action is optional and not urgent, Shari can invite you with a
          question that connects the step to something meaningful — instead of
          sounding like a command.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
          This is optional. Urgent notices, fixed calendar times, and moments
          when you ask for direct language stay clear and concise.
        </p>
      </header>

      <div className="mb-4 rounded-xl border border-[#d4cdc3] bg-[#f7f3ec] px-3.5 py-3 text-sm text-[#6b635a]">
        <p className="font-semibold text-[#2c2620]">Instead of pressure</p>
        <p className="mt-1">“You need to work on the kitchen.”</p>
        <p className="mt-2 font-semibold text-[#2c2620]">Curiosity invitation</p>
        <p className="mt-1">
          “How would you feel if one part of the kitchen were clearer today?”
        </p>
      </div>

      <fieldset className="mb-4">
        <legend className="text-sm font-semibold text-[#2c2620]">
          How should Shari invite optional actions?
        </legend>
        <ul className="mt-2 flex flex-col gap-2">
          {CURIOSITY_MODE_OPTIONS.map((option) => {
            const active = mode === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  data-testid={`curiosity-mode-${option.id}`}
                  aria-pressed={active}
                  onClick={() => selectMode(option.id)}
                  className={`w-full rounded-xl border px-3.5 py-3 text-left ${
                    active
                      ? "border-[#1e4f4f] bg-[#f0f5f5]"
                      : "border-[#d4cdc3] bg-white/80 hover:bg-[#faf8f4]"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#2c2620]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#6b635a]">
                    {option.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mb-3 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
        <p className="text-sm font-semibold text-[#2c2620]">See an example</p>
        <p className="mt-1 text-sm text-[#6b635a]" data-testid="curiosity-preview">
          {previewCuriosity}
        </p>
        <button
          type="button"
          className="mt-2 text-sm font-semibold text-[#1e4f4f]"
          onClick={() => setPreviewSeed((n) => n + 1)}
        >
          Another wording
        </button>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
          Urgent / direct stays plain
        </p>
        <p className="mt-1 text-sm text-[#6b635a]" data-testid="curiosity-preview-direct">
          {previewDirect}
        </p>
      </div>

      {status ? (
        <p
          className={`text-sm ${
            status.tone === "ok" ? "text-[#1e4f4f]" : "text-[#a85c4a]"
          }`}
          role="status"
          data-testid="curiosity-before-commands-status"
        >
          {status.text}
        </p>
      ) : null}
    </section>
  );
}
