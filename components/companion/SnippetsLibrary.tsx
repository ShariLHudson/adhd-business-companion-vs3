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
import { CATEGORY_PICKER_EMPTY_LIST_HINT, NO_CATEGORY } from "@/lib/categoryRevealUx";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import {
  AudienceBadge,
} from "@/components/companion/AudienceSelector";
import { AudienceTypeGenerateBar } from "@/components/companion/AudienceTypeGenerateBar";
import {
  LibraryCloseButton,
  LibraryHelpText,
  LibraryPanelHeader,
  LibraryResultActions,
} from "@/components/companion/LibraryOrientationChrome";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import {
  audienceIdsForStorage,
  buildContentGenerationContext,
  CONTENT_VOICE_TONES,
  getSelectedContentAudienceId,
  getSelectedContentToneId,
  setContentToneId,
  type ContentVoiceToneId,
} from "@/lib/contentAudience";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

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
  onBack,
}: {
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  onBack?: () => void;
}) {
  const [items, setItems] = useState<Snippet[]>([]);
  const [filter, setFilter] = useState<SnippetKind | typeof NO_CATEGORY>(
    NO_CATEGORY,
  );
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
  const [generateToneId, setGenerateToneId] = useState<ContentVoiceToneId>(
    getSelectedContentToneId,
  );
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
      const audienceId = getSelectedContentAudienceId();
      const context = buildContentGenerationContext({
        audienceId,
        toneId: generateToneId,
        businessContext: businessContextSummary(
          audienceId.startsWith("avatar:")
            ? audienceId.slice("avatar:".length)
            : undefined,
        ),
      });
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
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

  function dismissSuggestion(s: Suggestion) {
    setSuggestions((list) => list.filter((x) => x !== s));
  }

  function useSnippetContent(
    content: string,
    kind: SnippetKind,
    whenToUse?: string,
  ) {
    if (!onBuildWithShari) return;
    onBuildWithShari({
      itemType: SNIPPET_KIND_LABEL[kind],
      title: `${SNIPPET_KIND_LABEL[kind]} snippet`,
      draftContent: content,
      brief: whenToUse
        ? `Use this ${SNIPPET_KIND_LABEL[kind].toLowerCase()} snippet. When: ${whenToUse}`
        : `Use this ${SNIPPET_KIND_LABEL[kind].toLowerCase()} snippet`,
      snippetKind: kind,
      stage: "using snippet in draft",
    });
  }

  function closePanel() {
    onBack?.();
  }

  function saveSuggestion(s: Suggestion) {
    setItems(
      createSnippet({
        content: s.content,
        kind: s.kind,
        tone: s.tone || undefined,
        whenToUse: s.whenToUse || undefined,
        whereToUse: s.whereToUse || undefined,
        audienceIds: audienceIdsForStorage(),
      }),
    );
    setSuggestions((list) => list.filter((x) => x !== s));
  }

  const visible =
    filter === NO_CATEGORY
      ? []
      : items.filter((s) => s.kind === filter);

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
      <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-2xl font-semibold text-[#1f1c19]">
            {draft.id ? "Edit snippet" : "New snippet"}
          </p>
          <LibraryCloseButton onClose={closePanel} />
        </div>
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
      <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewId(null)}
            className="text-sm font-semibold text-[#1e4f4f]"
          >
            ‹ Snippets
          </button>
          <LibraryCloseButton onClose={closePanel} />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Snippet
        </p>
        <p className="mt-1 whitespace-pre-wrap rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-lg leading-relaxed text-[#1f1c19]">
          {viewing.content}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AudienceBadge />
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
            {SNIPPET_KIND_LABEL[viewing.kind]}
          </span>
          {viewing.tone ? (
            <span className="rounded-full bg-white/80 px-2 py-0.5 font-semibold text-[#3d3630]">
              {viewing.tone}
            </span>
          ) : null}
        </div>
        {viewing.whenToUse ? (
          <p className="mt-3 text-base text-[#4b463f]">
            <span className="font-semibold">When:</span> {viewing.whenToUse}
          </p>
        ) : null}
        <LibraryResultActions
          onUse={
            onBuildWithShari
              ? () =>
                  useSnippetContent(
                    viewing.content,
                    viewing.kind,
                    viewing.whenToUse,
                  )
              : undefined
          }
          onDelete={() => {
            setItems(deleteSnippet(viewing.id));
            setViewId(null);
          }}
        />
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
          className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          Edit details
        </button>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
      <LibraryPanelHeader
        title="Snippets"
        description="Small reusable content blocks you can use in emails, social posts, newsletters, landing pages, workshops, and more."
        onClose={closePanel}
      />

      <div className="mt-4">
        <WorkspaceAreaWorksGuide areaId="snippets" />
        <LibraryHelpText>
          <li>Choose an audience and tone.</li>
          <li>Click Generate to create fresh snippet ideas.</li>
          <li>Save the ones you like for future use.</li>
          <li>Use them anywhere in your business.</li>
        </LibraryHelpText>
      </div>

      <div className="mt-3">
        <AudienceTypeGenerateBar
          typeOptions={CONTENT_VOICE_TONES.map((t) => ({
            value: t.id,
            label: t.label,
          }))}
          typeValue={generateToneId}
          onTypeChange={(id) => {
            const toneId = id as ContentVoiceToneId;
            setGenerateToneId(toneId);
            setContentToneId(toneId);
          }}
          typeLabel="Voice / Tone"
          typeShowPlaceholder={false}
          onGenerate={suggest}
          generating={suggesting}
          generateLabel="Generate"
        />
      </div>

      {sugErr ? (
        <p className="mt-3 text-sm text-[#a85c4a]">
          Couldn&apos;t generate just now — try again.
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="companion-fade-in mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Generated results
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  Snippet · {SNIPPET_KIND_LABEL[s.kind]}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-[#1f1c19]">
                  {s.content}
                </p>
                <LibraryResultActions
                  onSave={() => saveSuggestion(s)}
                  onUse={
                    onBuildWithShari
                      ? () =>
                          useSnippetContent(s.content, s.kind, s.whenToUse)
                      : undefined
                  }
                  onDelete={() => dismissSuggestion(s)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Your saved snippets
      </p>
      <CategoryPickerSelect
        label="Browse by type"
        value={filter}
        onChange={setFilter}
        options={KINDS.map((k) => ({
          value: k,
          label: SNIPPET_KIND_LABEL[k],
        }))}
        placeholder="Select a type…"
        className="mt-2"
      />

      <div className="mt-4 flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-base text-[#6b635a]">
            {filter === NO_CATEGORY
              ? CATEGORY_PICKER_EMPTY_LIST_HINT
              : "Nothing saved in this type yet — generate snippets above."}
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

      <button
        type="button"
        onClick={() => setDraft({ ...EMPTY })}
        className="mt-4 text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        + Write a snippet by hand
      </button>
    </div>
  );
}
