"use client";

import { useEffect, useState } from "react";
import {
  SUPPORT_STYLE_CATALOG,
  SUPPORT_STYLE_SAMPLE_STATEMENT,
  getSupportStylePreference,
  previewSupportStyleResponse,
  saveSupportStylePreference,
  subscribeSupportStyle,
  type ChoiceCountPref,
  type DiscouragedHelp,
  type EncouragementLevel,
  type OverwhelmedStart,
  type StuckHelp,
  type SupportStyleCustomSettings,
  type SupportStyleId,
} from "@/lib/supportStyle";

type StatusMsg = { tone: "ok" | "error"; text: string } | null;

const OVERWHELMED_OPTIONS: { id: OverwhelmedStart; label: string }[] = [
  { id: "reassurance", label: "Reassurance" },
  { id: "one-next-step", label: "One next step" },
  { id: "few-choices", label: "A few choices" },
  { id: "a-question", label: "A question" },
  { id: "calming-reset", label: "A short calming reset" },
];

const STUCK_OPTIONS: { id: StuckHelp; label: string }[] = [
  { id: "break-down", label: "Breaking the task down" },
  { id: "help-choose", label: "Helping me choose" },
  { id: "show-example", label: "Showing an example" },
  { id: "work-alongside", label: "Working alongside me" },
  { id: "remind-why", label: "Reminding me why it matters" },
];

const DISCOURAGED_OPTIONS: { id: DiscouragedHelp; label: string }[] = [
  { id: "acknowledge", label: "Acknowledge the feeling" },
  { id: "show-progress", label: "Show evidence of progress" },
  { id: "smaller-goal", label: "Help me make the goal smaller" },
  { id: "let-me-talk", label: "Let me talk" },
  { id: "practical-restart", label: "Give me a practical restart" },
];

const CHOICE_COUNT_OPTIONS: { id: ChoiceCountPref; label: string }[] = [
  { id: "one", label: "One recommendation" },
  { id: "two", label: "Two choices" },
  { id: "three", label: "Three choices" },
  { id: "ask", label: "Ask me when needed" },
];

const ENCOURAGEMENT_OPTIONS: { id: EncouragementLevel; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "natural", label: "Natural" },
  { id: "extra-when-struggling", label: "Extra encouragement when I’m struggling" },
];

export function SupportStylePanel() {
  const [styleId, setStyleId] = useState<SupportStyleId>("adaptive");
  const [useMost, setUseMost] = useState(true);
  const [custom, setCustom] = useState<SupportStyleCustomSettings>({});
  const [previewId, setPreviewId] = useState<SupportStyleId | null>(null);
  const [status, setStatus] = useState<StatusMsg>(null);
  const [showCustom, setShowCustom] = useState(false);

  function refresh() {
    const prefs = getSupportStylePreference();
    setStyleId(prefs.styleId);
    setUseMost(prefs.useMostOfTheTime);
    setCustom(prefs.customSettings ?? {});
    setShowCustom(prefs.styleId === "custom");
  }

  useEffect(() => {
    refresh();
    return subscribeSupportStyle(refresh);
  }, []);

  function flash(tone: "ok" | "error", text: string) {
    setStatus({ tone, text });
    window.setTimeout(() => setStatus(null), 3200);
  }

  function persist(patch: Parameters<typeof saveSupportStylePreference>[0]) {
    const result = saveSupportStylePreference(patch);
    if (!result.ok) {
      flash(
        "error",
        "I couldn’t save that preference just now. Your choice is still here, and I’ll keep trying.",
      );
      return false;
    }
    setStyleId(result.preference.styleId);
    setUseMost(result.preference.useMostOfTheTime);
    setCustom(result.preference.customSettings ?? {});
    flash("ok", "I’ll support you this way from now on. You can change it anytime.");
    return true;
  }

  function selectStyle(id: SupportStyleId) {
    setStyleId(id);
    setShowCustom(id === "custom");
    persist({
      styleId: id,
      useMostOfTheTime: useMost,
      customSettings: id === "custom" ? custom : undefined,
    });
  }

  function toggleStuck(id: StuckHelp) {
    const current = custom.stuckHelp ?? [];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    const nextCustom = { ...custom, stuckHelp: next };
    setCustom(nextCustom);
    if (styleId === "custom") {
      persist({ styleId: "custom", customSettings: nextCustom });
    }
  }

  function toggleDiscouraged(id: DiscouragedHelp) {
    const current = custom.discouragedHelp ?? [];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    const nextCustom = { ...custom, discouragedHelp: next };
    setCustom(nextCustom);
    if (styleId === "custom") {
      persist({ styleId: "custom", customSettings: nextCustom });
    }
  }

  return (
    <section
      className="support-style-panel"
      data-testid="support-style-panel"
      aria-label="Support Style"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-[#2c2620]">Support Style</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
          Everyone needs support differently. Some people want gentle reassurance
          first. Others want a clear next step right away. Some want help talking
          things through, while others prefer practical choices without much
          discussion.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
          Your Support Style tells Spark how to respond when you feel stuck,
          overwhelmed, discouraged, unsure, or unable to get started.
        </p>
      </header>

      <div className="mb-4 rounded-xl border border-[#d4cdc3] bg-[#f7f3ec] px-3.5 py-3">
        <p className="text-sm font-semibold text-[#2c2620]">Why This Helps</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          The wrong kind of help can create more frustration. These preferences
          help Spark support you in the way that is most useful to you, instead of
          giving everyone the same response.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3 text-sm text-[#6b635a]">
        <p className="font-semibold text-[#2c2620]">
          Separate from Conversation Style
        </p>
        <p className="mt-1">
          Conversation Style is how Shari talks. Support Style is what Spark does
          first when you need help. Planning Preferences shape how plans are
          organized. You can mix them — for example, warm wording with practical
          support.
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {SUPPORT_STYLE_CATALOG.filter((entry) => entry.id !== "custom").map(
          (entry) => {
            const active = styleId === entry.id;
            return (
              <li
                key={entry.id}
                className={`rounded-xl border px-3.5 py-3 ${
                  active
                    ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]"
                    : "border-[#d4cdc3] bg-white/90"
                }`}
                data-testid={`support-style-option-${entry.id}`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => selectStyle(entry.id)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#2c2620]">
                      {entry.label}
                    </span>
                    {active ? (
                      <span className="text-sm text-[#1e4f4f]">✓</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-[#6b635a]">
                    {entry.summary}
                  </span>
                  <span className="mt-1 block text-xs text-[#6b635a]">
                    {entry.bestFor}
                  </span>
                </button>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#2c2620]"
                    data-testid={`support-style-preview-${entry.id}`}
                    onClick={() =>
                      setPreviewId(previewId === entry.id ? null : entry.id)
                    }
                  >
                    See an Example
                  </button>
                  {!active ? (
                    <button
                      type="button"
                      className="rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white"
                      onClick={() => selectStyle(entry.id)}
                    >
                      Use This Style
                    </button>
                  ) : null}
                </div>
                {previewId === entry.id ? (
                  <div
                    className="mt-2 rounded-lg border border-[#1e4f4f]/20 bg-[#f4f8f8] px-3 py-2 text-sm text-[#2c2620]"
                    data-testid="support-style-preview-body"
                  >
                    <p className="text-xs font-semibold text-[#6b635a]">
                      Sample: “{SUPPORT_STYLE_SAMPLE_STATEMENT}”
                    </p>
                    <p className="mt-1.5 whitespace-pre-line">
                      {previewSupportStyleResponse(entry.id)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white"
                        onClick={() => {
                          selectStyle(entry.id);
                          setPreviewId(null);
                        }}
                      >
                        Use This Style
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold"
                        onClick={() => setPreviewId(null)}
                      >
                        Preview Another
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-2.5 py-1 text-xs text-[#6b635a]"
                        onClick={() => setPreviewId(null)}
                      >
                        Keep My Current Style
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          },
        )}
      </ul>

      <div className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/90 px-3.5 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          data-testid="support-style-option-custom"
          onClick={() => {
            setShowCustom(true);
            selectStyle("custom");
          }}
        >
          <span>
            <span className="block text-sm font-semibold text-[#2c2620]">
              Create My Own Support Style
            </span>
            <span className="mt-0.5 block text-sm text-[#6b635a]">
              Choose how Spark should start when you’re overwhelmed, stuck, or
              discouraged. You do not need to fill every option.
            </span>
          </span>
          {styleId === "custom" ? (
            <span className="text-sm text-[#1e4f4f]">✓</span>
          ) : null}
        </button>

        {showCustom || styleId === "custom" ? (
          <div className="mt-3 flex flex-col gap-3 border-t border-[#e7e0d6] pt-3">
            <fieldset>
              <legend className="text-sm font-semibold text-[#2c2620]">
                When I’m overwhelmed, start with:
              </legend>
              <ul className="mt-1.5 flex flex-col gap-1">
                {OVERWHELMED_OPTIONS.map((option) => (
                  <li key={option.id}>
                    <label className="flex items-center gap-2 text-sm text-[#2c2620]">
                      <input
                        type="radio"
                        name="overwhelmed-start"
                        className="accent-[#1e4f4f]"
                        checked={custom.overwhelmedStart === option.id}
                        onChange={() => {
                          const nextCustom = {
                            ...custom,
                            overwhelmedStart: option.id,
                          };
                          setCustom(nextCustom);
                          persist({
                            styleId: "custom",
                            customSettings: nextCustom,
                          });
                        }}
                      />
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-[#2c2620]">
                When I’m stuck, help me by:
              </legend>
              <ul className="mt-1.5 flex flex-col gap-1">
                {STUCK_OPTIONS.map((option) => (
                  <li key={option.id}>
                    <label className="flex items-center gap-2 text-sm text-[#2c2620]">
                      <input
                        type="checkbox"
                        className="accent-[#1e4f4f]"
                        checked={(custom.stuckHelp ?? []).includes(option.id)}
                        onChange={() => toggleStuck(option.id)}
                      />
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-[#2c2620]">
                When I’m discouraged:
              </legend>
              <ul className="mt-1.5 flex flex-col gap-1">
                {DISCOURAGED_OPTIONS.map((option) => (
                  <li key={option.id}>
                    <label className="flex items-center gap-2 text-sm text-[#2c2620]">
                      <input
                        type="checkbox"
                        className="accent-[#1e4f4f]"
                        checked={(custom.discouragedHelp ?? []).includes(
                          option.id,
                        )}
                        onChange={() => toggleDiscouraged(option.id)}
                      />
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <label className="block text-sm font-semibold text-[#2c2620]">
              How many choices should I see?
              <select
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
                value={custom.choiceCount ?? ""}
                onChange={(event) => {
                  const value = event.target.value as ChoiceCountPref | "";
                  const nextCustom = {
                    ...custom,
                    choiceCount: value || undefined,
                  };
                  setCustom(nextCustom);
                  persist({ styleId: "custom", customSettings: nextCustom });
                }}
              >
                <option value="">Optional</option>
                {CHOICE_COUNT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#2c2620]">
              How much encouragement do I want?
              <select
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
                value={custom.encouragementLevel ?? ""}
                onChange={(event) => {
                  const value = event.target.value as EncouragementLevel | "";
                  const nextCustom = {
                    ...custom,
                    encouragementLevel: value || undefined,
                  };
                  setCustom(nextCustom);
                  persist({ styleId: "custom", customSettings: nextCustom });
                }}
              >
                <option value="">Optional</option>
                {ENCOURAGEMENT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>

      <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
        <input
          type="checkbox"
          className="mt-1 accent-[#1e4f4f]"
          checked={useMost}
          data-testid="support-style-use-most"
          onChange={(event) => {
            const next = event.target.checked;
            setUseMost(next);
            persist({ useMostOfTheTime: next, styleId });
          }}
        />
        <span>
          <span className="block text-sm font-semibold text-[#2c2620]">
            Use This Style Most of the Time
          </span>
          <span className="mt-0.5 block text-sm text-[#6b635a]">
            Spark will use this as your default, but you can ask for something
            different in any conversation without changing the saved style.
          </span>
        </span>
      </label>

      {status ? (
        <p
          className={`mt-3 text-sm ${
            status.tone === "ok" ? "text-[#1e4f4f]" : "text-[#a85c4a]"
          }`}
          role="status"
          data-testid="support-style-status"
        >
          {status.text}
        </p>
      ) : null}
    </section>
  );
}
