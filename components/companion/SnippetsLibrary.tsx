"use client";

import { useEffect, useState } from "react";
import {
  businessContextSummary,
  createSnippet,
  deleteSnippet,
  getSnippets,
  SNIPPET_KIND_LABEL,
  SNIPPET_TONES,
  sortedSnippetKinds,
  updateSnippet,
  type Snippet,
  type SnippetKind,
} from "@/lib/companionStore";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";

const KINDS = sortedSnippetKinds();

type Draft = {
  id?: string;
  content: string;
  kind: SnippetKind;
  tone: string;
  whenToUse: string;
  whereToUse: string;
  category: string;
};

const EMPTY: Draft = {
  content: "",
  kind: "hook",
  tone: "",
  whenToUse: "",
  whereToUse: "",
  category: "",
};

export function SnippetsLibrary({
  onBuildWithShari,
}: {
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
}) {
  const [items, setItems] = useState<Snippet[]>([]);
  const [filter, setFilter] = useState<SnippetKind | "all">("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  type Suggestion = {
    content: string;
    kind: SnippetKind;
    tone: string;
    whenToUse: string;
    whereToUse: string;
  };
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugErr, setSugErr] = useState(false);

  useEffect(() => {
    setItems(getSnippets());
  }, []);

  async function suggest() {
    if (suggesting) return;
    setSuggesting(true);
    setSugErr(false);
    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: businessContextSummary() }),
      });
      const d = await res.json();
      if (res.ok && Array.isArray(d.snippets)) setSuggestions(d.snippets);
      else setSugErr(true);
    } catch {
      setSugErr(true);
    } finally {
      setSuggesting(false);
    }
  }

  function saveSuggestion(s: Suggestion) {
    setItems(
      createSnippet({
        content: s.content,
        kind: s.kind,
        tone: s.tone || undefined,
        whenToUse: s.whenToUse || undefined,
        whereToUse: s.whereToUse || undefined,
      }),
    );
    setSuggestions((list) => list.filter((x) => x !== s));
  }

  const visible = items.filter((s) => filter === "all" || s.kind === filter);

  function save() {
    if (!draft || !draft.content.trim()) return;
    if (draft.id) {
      setItems(
        updateSnippet(draft.id, {
          content: draft.content.trim(),
          kind: draft.kind,
          tone: draft.tone || undefined,
          whenToUse: draft.whenToUse || undefined,
          whereToUse: draft.whereToUse || undefined,
          category: draft.category || undefined,
        }),
      );
    } else {
      setItems(
        createSnippet({
          content: draft.content.trim(),
          kind: draft.kind,
          tone: draft.tone || undefined,
          whenToUse: draft.whenToUse || undefined,
          whereToUse: draft.whereToUse || undefined,
          category: draft.category || undefined,
        }),
      );
    }
    setDraft(null);
  }

  const inputCls =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
  const label = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

  // ---- Editor -------------------------------------------------------------
  if (draft) {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <p className="text-2xl font-semibold text-[#1f1c19]">
          {draft.id ? "Edit snippet" : "New snippet"}
        </p>
        <textarea
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          placeholder="The reusable line (1–5 lines)…"
          className="mt-4 min-h-[100px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label className={label}>Type</label>
            <select
              value={draft.kind}
              onChange={(e) =>
                setDraft({ ...draft, kind: e.target.value as SnippetKind })
              }
              className={`mt-1.5 ${inputCls}`}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {SNIPPET_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <label className={label}>Tone</label>
            <select
              value={draft.tone}
              onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
              className={`mt-1.5 ${inputCls}`}
            >
              <option value="">—</option>
              {SNIPPET_TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className={label}>When to use</label>
          <input
            value={draft.whenToUse}
            onChange={(e) => setDraft({ ...draft, whenToUse: e.target.value })}
            placeholder="e.g. follow-up emails, cold outreach"
            className={`mt-1.5 ${inputCls}`}
          />
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label className={label}>Where to use</label>
            <input
              value={draft.whereToUse}
              onChange={(e) =>
                setDraft({ ...draft, whereToUse: e.target.value })
              }
              placeholder="e.g. Email hook, LinkedIn post"
              className={`mt-1.5 ${inputCls}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className={label}>Category</label>
            <input
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              placeholder="e.g. Sales, Coaching clients"
              className={`mt-1.5 ${inputCls}`}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft.content.trim()}
            onClick={save}
            className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white disabled:bg-[#9aaba8]"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // ---- Open a single snippet ----------------------------------------------
  const viewing = viewId ? items.find((s) => s.id === viewId) : null;
  if (viewing) {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setViewId(null)}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Snippets
        </button>
        <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-lg leading-relaxed text-[#1f1c19]">
          {viewing.content}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 font-semibold text-[#1e4f4f]">
            {SNIPPET_KIND_LABEL[viewing.kind]}
          </span>
          {viewing.tone && (
            <span className="rounded-full bg-white/80 px-2 py-0.5 font-semibold text-[#3d3630]">
              {viewing.tone}
            </span>
          )}
          {viewing.category && (
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[#6b635a]">
              {viewing.category}
            </span>
          )}
        </div>
        {viewing.whenToUse && (
          <p className="mt-3 text-base text-[#4b463f]">
            <span className="font-semibold">When:</span> {viewing.whenToUse}
          </p>
        )}
        {viewing.whereToUse && (
          <p className="mt-1 text-base text-[#4b463f]">
            <span className="font-semibold">Where:</span> {viewing.whereToUse}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
          {onBuildWithShari && (
            <>
              <button
                type="button"
                onClick={() =>
                  onBuildWithShari({
                    itemType: SNIPPET_KIND_LABEL[viewing.kind],
                    title: `${SNIPPET_KIND_LABEL[viewing.kind]} snippet`,
                    draftContent: viewing.content,
                    brief: viewing.whenToUse
                      ? `Use this ${SNIPPET_KIND_LABEL[viewing.kind].toLowerCase()} snippet. When: ${viewing.whenToUse}`
                      : `Use this ${SNIPPET_KIND_LABEL[viewing.kind].toLowerCase()} snippet`,
                    snippetKind: viewing.kind,
                    stage: "using snippet in draft",
                  })
                }
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-white hover:bg-[#163a3a]"
              >
                ✨ Use in Draft
              </button>
              <button
                type="button"
                onClick={() =>
                  onBuildWithShari({
                    itemType: SNIPPET_KIND_LABEL[viewing.kind],
                    title: `${SNIPPET_KIND_LABEL[viewing.kind]} snippet`,
                    draftContent: viewing.content,
                    brief: `Adapt this snippet for my audience: ${viewing.content}`,
                    snippetKind: viewing.kind,
                    stage: "adapting snippet",
                  })
                }
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-[#1e4f4f] hover:bg-[#f0f5f5]"
              >
                💬 Ask Shari to adapt this
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              try {
                void navigator.clipboard?.writeText(viewing.content);
              } catch {
                /* noop */
              }
            }}
            className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            📋 Copy
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft({
                id: viewing.id,
                content: viewing.content,
                kind: viewing.kind,
                tone: viewing.tone ?? "",
                whenToUse: viewing.whenToUse ?? "",
                whereToUse: viewing.whereToUse ?? "",
                category: viewing.category ?? "",
              });
              setViewId(null);
            }}
            className="rounded-lg px-3 py-2 text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setItems(deleteSnippet(viewing.id));
              setViewId(null);
            }}
            className="rounded-lg px-3 py-2 text-[#a85c4a] hover:bg-[#a85c4a]/10"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">🧩 Snippets</p>
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          + New
        </button>
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        Small reusable building blocks — drop them into emails, posts, or
        scripts.
      </p>

      <button
        type="button"
        onClick={suggest}
        disabled={suggesting}
        className="mt-3 self-start rounded-xl border border-[#1e4f4f]/30 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white disabled:opacity-50"
      >
        {suggesting ? "Thinking…" : "✨ Suggest snippets for my audience"}
      </button>
      {sugErr && (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t suggest just now — try again.
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="companion-fade-in mt-3 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Tuned to your business — tap to save
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 rounded-lg border border-[#d4cdc3] bg-white px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block text-base text-[#1f1c19]">
                    {s.content}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                    {SNIPPET_KIND_LABEL[s.kind]}
                    {s.tone ? ` · ${s.tone}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => saveSuggestion(s)}
                  className="shrink-0 rounded-md bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col">
        <label className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Type
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as SnippetKind | "all")}
          className="mt-1 w-full max-w-xs rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="all">All</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {SNIPPET_KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-base text-[#6b635a]">
            Nothing here yet. Create one, or save a line from the email
            generator.
          </p>
        ) : (
          visible.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setViewId(s.id)}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
            >
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-[#1f1c19]">
                  {s.content}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
                  {SNIPPET_KIND_LABEL[s.kind]}
                  {s.tone ? ` · ${s.tone}` : ""}
                </span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-[#9a8f82]">
                ›
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
