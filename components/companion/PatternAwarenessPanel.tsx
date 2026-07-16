"use client";

import { useEffect, useMemo, useState } from "react";
import {
  findConflictingSavedPatterns,
  listActiveUsablePatterns,
  listSavedPatterns,
  mergeIntoExistingPattern,
  deleteSavedPattern,
  pauseSavedPattern,
  resumeSavedPattern,
  retireSavedPattern,
  saveNewPattern,
  updateSavedPattern,
  getPatternAwarenessControlPrefs,
  savePatternAwarenessControlPrefs,
  subscribePatternAwareness,
  PATTERN_CATEGORY_LABELS,
  PATTERN_USE_CONTEXT_LABELS,
  type PatternCategory,
  type PatternUseContext,
  type SavedPattern,
} from "@/lib/patternAwareness";

const USE_CONTEXT_OPTIONS = Object.entries(PATTERN_USE_CONTEXT_LABELS) as Array<
  [PatternUseContext, string]
>;

const CATEGORY_OPTIONS = Object.entries(PATTERN_CATEGORY_LABELS) as Array<
  [PatternCategory, string]
>;

const EXAMPLE_PATTERNS = [
  "I focus better before noon.",
  "I avoid tasks when the first step is unclear.",
  "Short work sessions help me start.",
  "Too many choices make me freeze.",
  "When I say I am overwhelmed, help me unload my thoughts first.",
];

type StatusMsg = { tone: "ok" | "error"; text: string } | null;

export function PatternAwarenessPanel() {
  const [noticeNew, setNoticeNew] = useState(true);
  const [useSaved, setUseSaved] = useState(true);
  const [patterns, setPatterns] = useState<SavedPattern[]>([]);
  const [status, setStatus] = useState<StatusMsg>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] =
    useState<PatternCategory>("custom");
  const [draftContexts, setDraftContexts] = useState<PatternUseContext[]>([
    "everywhere",
  ]);
  const [similarPrompt, setSimilarPrompt] = useState<SavedPattern[] | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatement, setEditStatement] = useState("");
  const [contextsEditId, setContextsEditId] = useState<string | null>(null);

  function refresh() {
    const prefs = getPatternAwarenessControlPrefs();
    setNoticeNew(prefs.noticeNewPatterns);
    setUseSaved(prefs.useSavedPatterns);
    setPatterns(listSavedPatterns());
  }

  useEffect(() => {
    refresh();
    return subscribePatternAwareness(refresh);
  }, []);

  const conflicts = useMemo(
    () => findConflictingSavedPatterns(patterns),
    [patterns],
  );

  function flash(tone: "ok" | "error", text: string) {
    setStatus({ tone, text });
    window.setTimeout(() => setStatus(null), 2800);
  }

  function persistControls(nextNotice: boolean, nextUse: boolean) {
    savePatternAwarenessControlPrefs({
      noticeNewPatterns: nextNotice,
      useSavedPatterns: nextUse,
    });
    setNoticeNew(nextNotice);
    setUseSaved(nextUse);
    flash("ok", "Saved. You can change this anytime.");
  }

  function toggleContext(context: PatternUseContext) {
    setDraftContexts((current) => {
      if (current.includes(context)) {
        return current.filter((c) => c !== context);
      }
      return [...current, context];
    });
  }

  function attemptSave(force = false) {
    const result = saveNewPattern({
      statement: draft,
      category: draftCategory,
      source: "user-added",
      useContexts:
        draftContexts.length > 0 ? draftContexts : ["everywhere"],
      force,
    });
    if (result.ok) {
      setDraft("");
      setAdding(false);
      setSimilarPrompt(null);
      refresh();
      flash("ok", "Saved. Spark will use this when it fits.");
      return;
    }
    if (result.reason === "similar-exists" && result.similar) {
      setSimilarPrompt(result.similar);
      return;
    }
    if (result.reason === "empty") {
      flash("error", "Add a short statement first.");
      return;
    }
    flash(
      "error",
      "I couldn’t save that preference just now. Your draft is still here — try again.",
    );
  }

  function saveEdit(id: string) {
    const updated = updateSavedPattern(id, { statement: editStatement });
    if (!updated) {
      flash("error", "I couldn’t save that change just now.");
      return;
    }
    setEditingId(null);
    refresh();
    flash("ok", "Updated.");
  }

  return (
    <section
      className="pattern-awareness-panel"
      data-testid="pattern-awareness-panel"
      aria-label="Pattern Awareness"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-[#2c2620]">
          Pattern Awareness
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
          Pattern Awareness helps Spark notice repeated things that may affect
          how you work, plan, focus, and make progress. For example, Spark may
          notice that you often have more energy in the morning, that certain
          tasks are easier after a short break, or that large projects become
          easier when the first step is made very small.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
          Spark will show you what it noticed before saving it as an ongoing
          pattern. You choose what to keep.
        </p>
      </header>

      <div className="mb-4 rounded-xl border border-[#d4cdc3] bg-[#f7f3ec] px-3.5 py-3">
        <p className="text-sm font-semibold text-[#2c2620]">Why This Can Help</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          You should not have to rediscover the same things about yourself every
          week. Saved patterns can make suggestions more realistic, reduce
          repeated questions, and fit how you actually work.
        </p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-[#6b635a]">
          <li>More realistic Plan My Day suggestions</li>
          <li>Fewer repeated questions</li>
          <li>Better timing and smaller first steps</li>
          <li>Earlier recognition of overload</li>
          <li>Support based on what has helped you before</li>
        </ul>
      </div>

      <details className="mb-4 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#2c2620]">
          What Spark may notice
        </summary>
        <ul className="mt-2 space-y-2 text-sm text-[#6b635a]">
          <li>
            <span className="font-semibold text-[#2c2620]">Energy and Time</span>
            — morning energy, slower starts, post-meeting dips
          </li>
          <li>
            <span className="font-semibold text-[#2c2620]">Starting and Focus</span>
            — small first steps, timers, fewer options
          </li>
          <li>
            <span className="font-semibold text-[#2c2620]">Planning and Workload</span>
            — fewer priorities, buffer time, realistic estimates
          </li>
          <li>
            <span className="font-semibold text-[#2c2620]">Motivation</span>
            — interest, accountability, visible progress
          </li>
          <li>
            <span className="font-semibold text-[#2c2620]">Overwhelm and Recovery</span>
            — brain dumps before planning, quiet recovery time
          </li>
          <li>
            <span className="font-semibold text-[#2c2620]">Communication and Learning</span>
            — one question at a time, examples, shorter replies
          </li>
        </ul>
        <p className="mt-2 text-sm text-[#6b635a]">
          Spark will never treat a guess as fact, invent who you are, or save a
          pattern without asking.
        </p>
      </details>

      <div className="mb-4 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
        <p className="text-sm font-semibold text-[#2c2620]">You Stay in Control</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Spark will not treat a possible pattern as permanent unless you save
          it. You can review, change, pause, or delete saved patterns anytime.
          If something no longer feels true, mark it outdated.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <label className="flex items-start gap-2.5 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
          <input
            type="checkbox"
            className="mt-1 accent-[#1e4f4f]"
            checked={noticeNew}
            onChange={(event) =>
              persistControls(event.target.checked, useSaved)
            }
            data-testid="pattern-notice-new"
          />
          <span>
            <span className="block text-sm font-semibold text-[#2c2620]">
              Notice New Patterns
            </span>
            <span className="mt-0.5 block text-sm text-[#6b635a]">
              When on, Spark may gently offer patterns it noticed — never silent
              saves.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2.5 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
          <input
            type="checkbox"
            className="mt-1 accent-[#1e4f4f]"
            checked={useSaved}
            onChange={(event) =>
              persistControls(noticeNew, event.target.checked)
            }
            data-testid="pattern-use-saved"
          />
          <span>
            <span className="block text-sm font-semibold text-[#2c2620]">
              Use My Saved Patterns
            </span>
            <span className="mt-0.5 block text-sm text-[#6b635a]">
              When on, active patterns can shape suggestions. When off, they stay
              stored but unused.
            </span>
          </span>
        </label>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-[#2c2620]">Saved Patterns</h4>
        <button
          type="button"
          className="rounded-lg border border-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          data-testid="pattern-add-known"
          onClick={() => {
            setAdding(true);
            setSimilarPrompt(null);
          }}
        >
          + Add a Pattern I Already Know
        </button>
      </div>

      {adding ? (
        <div
          className="mb-4 rounded-xl border border-[#1e4f4f]/35 bg-white px-3.5 py-3"
          data-testid="pattern-add-form"
        >
          <label className="block text-sm font-semibold text-[#2c2620]">
            What would you like Spark to remember?
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm text-[#2c2620]"
              placeholder="Example: Short work sessions help me start."
              data-testid="pattern-draft-statement"
            />
          </label>
          <p className="mt-2 text-xs text-[#6b635a]">
            Examples: {EXAMPLE_PATTERNS.slice(0, 3).join(" · ")}
          </p>
          <label className="mt-3 block text-sm font-semibold text-[#2c2620]">
            Category
            <select
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              value={draftCategory}
              onChange={(event) =>
                setDraftCategory(event.target.value as PatternCategory)
              }
            >
              {CATEGORY_OPTIONS.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="mt-3">
            <legend className="text-sm font-semibold text-[#2c2620]">
              How should Spark use this?
            </legend>
            <ul className="mt-1.5 flex flex-col gap-1">
              {USE_CONTEXT_OPTIONS.map(([id, label]) => (
                <li key={id}>
                  <label className="flex items-center gap-2 text-sm text-[#2c2620]">
                    <input
                      type="checkbox"
                      className="accent-[#1e4f4f]"
                      checked={draftContexts.includes(id)}
                      onChange={() => toggleContext(id)}
                    />
                    {label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          {similarPrompt ? (
            <div className="mt-3 rounded-lg border border-[#c4a574] bg-[#fff8ee] px-3 py-2 text-sm text-[#6b635a]">
              <p className="font-semibold text-[#2c2620]">
                You already have a similar pattern saved.
              </p>
              <p className="mt-1">
                Closest: “{similarPrompt[0]?.statement}”
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                  onClick={() => {
                    const target = similarPrompt[0];
                    if (!target) return;
                    mergeIntoExistingPattern(
                      target.id,
                      draft,
                      draftContexts,
                    );
                    setDraft("");
                    setAdding(false);
                    setSimilarPrompt(null);
                    refresh();
                    flash("ok", "Updated your existing pattern.");
                  }}
                >
                  Update Existing Pattern
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                  onClick={() => attemptSave(true)}
                >
                  Keep Both
                </button>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm text-[#6b635a]"
                  onClick={() => setSimilarPrompt(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
              data-testid="pattern-save-draft"
              onClick={() => attemptSave(false)}
            >
              Save Pattern
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm text-[#6b635a]"
              onClick={() => {
                setAdding(false);
                setSimilarPrompt(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {conflicts.length > 0 ? (
        <div
          className="mb-3 rounded-xl border border-[#c4a574] bg-[#fff8ee] px-3.5 py-3 text-sm text-[#6b635a]"
          data-testid="pattern-conflicts"
        >
          <p className="font-semibold text-[#2c2620]">
            These saved patterns may conflict
          </p>
          {conflicts.slice(0, 2).map(([a, b]) => (
            <p key={`${a.id}-${b.id}`} className="mt-1">
              “{a.statement}” · “{b.statement}”
            </p>
          ))}
          <p className="mt-1">
            Pause or edit the one that no longer feels true.
          </p>
        </div>
      ) : null}

      {patterns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d4cdc3] px-3.5 py-4 text-sm text-[#6b635a]">
          No saved patterns yet. Add one you already know, or wait for a gentle
          suggestion when Notice New Patterns is on.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {patterns.map((pattern) => (
            <li
              key={pattern.id}
              className="rounded-xl border border-[#d4cdc3] bg-white/90 px-3.5 py-3"
              data-testid={`saved-pattern-${pattern.id}`}
            >
              {editingId === pattern.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editStatement}
                    onChange={(event) => setEditStatement(event.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                      onClick={() => saveEdit(pattern.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="text-sm text-[#6b635a]"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#2c2620]">
                    {pattern.statement}
                  </p>
                  <p className="mt-1 text-xs text-[#6b635a]">
                    {PATTERN_CATEGORY_LABELS[pattern.category]} ·{" "}
                    {pattern.source === "user-added"
                      ? "You added this"
                      : "Spark suggested"}{" "}
                    · {pattern.status}
                  </p>
                  <p className="mt-1 text-xs text-[#6b635a]">
                    Used for:{" "}
                    {pattern.useContexts
                      .map((c) => PATTERN_USE_CONTEXT_LABELS[c])
                      .join("; ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#2c2620]"
                      onClick={() => {
                        setEditingId(pattern.id);
                        setEditStatement(pattern.statement);
                        setContextsEditId(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#2c2620]"
                      onClick={() =>
                        setContextsEditId(
                          contextsEditId === pattern.id ? null : pattern.id,
                        )
                      }
                    >
                      Change Where It Is Used
                    </button>
                    {contextsEditId === pattern.id ? (
                      <fieldset className="mt-2 w-full basis-full">
                        <legend className="sr-only">Where Spark may use this</legend>
                        <ul className="flex flex-col gap-1">
                          {USE_CONTEXT_OPTIONS.map(([id, label]) => (
                            <li key={id}>
                              <label className="flex items-center gap-2 text-xs text-[#2c2620]">
                                <input
                                  type="checkbox"
                                  className="accent-[#1e4f4f]"
                                  checked={pattern.useContexts.includes(id)}
                                  onChange={() => {
                                    const next = pattern.useContexts.includes(id)
                                      ? pattern.useContexts.filter((c) => c !== id)
                                      : [...pattern.useContexts, id];
                                    updateSavedPattern(pattern.id, {
                                      useContexts:
                                        next.length > 0 ? next : ["reference-only"],
                                    });
                                    refresh();
                                    flash("ok", "Updated where this is used.");
                                  }}
                                />
                                {label}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </fieldset>
                    ) : null}
                    {pattern.status === "active" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#2c2620]"
                        onClick={() => {
                          pauseSavedPattern(pattern.id);
                          refresh();
                          flash("ok", "Paused.");
                        }}
                      >
                        Pause
                      </button>
                    ) : pattern.status === "paused" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#2c2620]"
                        onClick={() => {
                          resumeSavedPattern(pattern.id);
                          refresh();
                          flash("ok", "Resumed.");
                        }}
                      >
                        Resume
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#2c2620]"
                      onClick={() => {
                        retireSavedPattern(pattern.id);
                        refresh();
                        flash("ok", "Marked as no longer true.");
                      }}
                    >
                      No Longer True
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#a85c4a]/40 px-2.5 py-1 text-xs font-semibold text-[#a85c4a]"
                      onClick={() => {
                        deleteSavedPattern(pattern.id);
                        refresh();
                        flash("ok", "Deleted.");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {!useSaved && patterns.some((p) => p.status === "active") ? (
        <p className="mt-3 text-sm text-[#6b635a]">
          Saved patterns are stored, but not applied while Use My Saved Patterns
          is off. ({listActiveUsablePatterns().length} would apply if enabled)
        </p>
      ) : null}

      {status ? (
        <p
          className={`mt-3 text-sm ${
            status.tone === "ok" ? "text-[#1e4f4f]" : "text-[#a85c4a]"
          }`}
          role="status"
          data-testid="pattern-awareness-status"
        >
          {status.text}
        </p>
      ) : null}
    </section>
  );
}

/** Soft suggestion card for Spark-noticed patterns (never auto-saves). */
export function PatternSuggestionCard(props: {
  statement: string;
  evidenceSummary?: string;
  confidenceLabel?: string;
  onSave: () => void;
  onNotYet: () => void;
  onDontSuggest: () => void;
  onEdit: () => void;
}) {
  return (
    <aside
      className="rounded-xl border border-[#1e4f4f]/25 bg-[#f4f8f8] px-3.5 py-3"
      data-testid="pattern-suggestion-card"
    >
      <p className="text-sm text-[#2c2620]">{props.statement}</p>
      {props.evidenceSummary ? (
        <p className="mt-1 text-xs text-[#6b635a]">{props.evidenceSummary}</p>
      ) : null}
      {props.confidenceLabel ? (
        <p className="mt-1 text-xs font-semibold text-[#1e4f4f]">
          {props.confidenceLabel}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white"
          onClick={props.onSave}
        >
          Save This Pattern
        </button>
        <button
          type="button"
          className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-semibold"
          onClick={props.onNotYet}
        >
          Not Yet
        </button>
        <button
          type="button"
          className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-semibold"
          onClick={props.onDontSuggest}
        >
          Don’t Suggest This Again
        </button>
        <button
          type="button"
          className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-semibold"
          onClick={props.onEdit}
        >
          Edit Before Saving
        </button>
      </div>
    </aside>
  );
}
