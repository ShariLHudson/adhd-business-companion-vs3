"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  getTemplates,
  sortedTemplateCategories,
  sortedTemplateSubtypes,
  TEMPLATE_CATEGORY_LABEL,
  updateTemplate,
  type TemplateCategory,
  type TemplateItem,
  type TemplateStatus,
} from "@/lib/companionStore";
import { RefineActions } from "@/components/companion/RefineActions";
import { ExportActions } from "@/components/companion/ExportActions";
import type { AppSection } from "@/lib/companionUi";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import {
  filterTemplates,
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_STATUS_OPTIONS,
  type TemplateStatusFilter,
} from "@/lib/templateLibraryUx";
import { CATEGORY_PICKER_EMPTY_LIST_HINT, NO_CATEGORY } from "@/lib/categoryRevealUx";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";

type Draft = {
  id?: string;
  title: string;
  body: string;
  category: TemplateCategory;
  subcategory: string;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  body: "",
  category: "content",
  subcategory: "",
};

export function TemplatesLibrary({
  onBack,
  onBuildWithShari,
}: {
  onBack?: () => void;
  /** @deprecated Snippets / generate moved to Create — kept for call-site compat */
  onOpen?: (section: AppSection) => void;
  onGenerate?: (seed: { type?: string; brief?: string }) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
}) {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [status, setStatus] = useState<TemplateStatusFilter>("saved");
  const [category, setCategory] = useState<TemplateCategory | typeof NO_CATEGORY>(
    NO_CATEGORY,
  );
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getTemplates());
  }, []);

  const visible = useMemo(
    () => filterTemplates(items, { query: search, status, category }),
    [items, search, status, category],
  );

  function saveDraft() {
    const body = draft?.body.trim();
    if (!draft || !body) return;
    if (draft.id) {
      setItems(
        updateTemplate(draft.id, {
          title: draft.title.trim() || "Untitled template",
          body,
          category: draft.category,
          subcategory: draft.subcategory || undefined,
        }),
      );
    } else {
      setItems(
        createTemplate({
          title: draft.title,
          body,
          category: draft.category,
          subcategory: draft.subcategory || undefined,
          status: "saved",
        }),
      );
      setStatus("saved");
    }
    setDraft(null);
  }

  // ---- Editor view --------------------------------------------------------
  if (draft) {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <p className="text-2xl font-semibold text-[#1f1c19]">
          {draft.id ? "Edit template" : "New template"}
        </p>

        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Title"
          className="mt-5 rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft({
                ...draft,
                category: e.target.value as TemplateCategory,
                subcategory: "",
              })
            }
            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            {sortedTemplateCategories().map((c) => (
              <option key={c} value={c}>
                {TEMPLATE_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          {sortedTemplateSubtypes(draft.category).length > 0 && (
            <select
              value={draft.subcategory}
              onChange={(e) =>
                setDraft({ ...draft, subcategory: e.target.value })
              }
              className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Type (optional)…</option>
              {sortedTemplateSubtypes(draft.category).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        <textarea
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          placeholder="Template content…"
          className="mt-3 min-h-[200px] resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />

        {/* Editing layer — refine / rewrite / simplify / break down */}
        <RefineActions
          text={draft.body}
          onApply={(next) => setDraft({ ...draft, body: next })}
        />

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
            disabled={!draft.body.trim()}
            onClick={saveDraft}
            className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white disabled:bg-[#9aaba8]"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // ---- Open / read a single template -------------------------------------
  const viewing = viewId ? items.find((t) => t.id === viewId) : null;
  if (viewing) {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setViewId(null)}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Templates
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          {viewing.title}
        </p>
        <span className="text-xs font-medium uppercase tracking-wide text-[#1e4f4f]">
          {TEMPLATE_CATEGORY_LABEL[viewing.category]}
          {viewing.subcategory ? ` · ${viewing.subcategory}` : ""}
        </span>

        <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-base leading-relaxed text-[#2d2926]">
          {viewing.body}
        </div>

        <ExportActions
          text={viewing.body}
          title={viewing.title}
          social={
            viewing.category === "content" &&
            /post|social/i.test(viewing.subcategory ?? "")
          }
        />

        {onBuildWithShari && (
          <button
            type="button"
            onClick={() =>
              onBuildWithShari({
                itemType: viewing.subcategory || viewing.title,
                title: viewing.title,
                draftContent: viewing.body,
                brief: viewing.title,
                templateId: viewing.id,
                stage: "using template",
              })
            }
            className="mt-4 rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
          >
            Open in Create
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setDraft({
                id: viewing.id,
                title: viewing.title,
                body: viewing.body,
                category: viewing.category,
                subcategory: viewing.subcategory ?? "",
              });
              setViewId(null);
            }}
            className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => setItems(duplicateTemplate(viewing.id))}
            className="rounded-lg px-3 py-2 text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() =>
              setItems(
                updateTemplate(viewing.id, {
                  status: viewing.status === "archived" ? "saved" : "archived",
                }),
              )
            }
            className="rounded-lg px-3 py-2 text-[#6b635a] hover:bg-black/5"
          >
            {viewing.status === "archived" ? "Restore" : "Archive"}
          </button>
          <button
            type="button"
            onClick={() => {
              setItems(deleteTemplate(viewing.id));
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

  // ---- List view — search first, filter second, flat results ---------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <WorkspaceGuide section="templates-library" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Templates</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDraft({ ...EMPTY_DRAFT })}
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            + New
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#6b635a] hover:bg-[#1e4f4f]/10"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        Pick a category first — or search across everything.
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search templates…"
        className="mt-5 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-lg text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        autoFocus
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <CategoryPickerSelect
          className="min-w-0 flex-1"
          label="Category"
          value={category}
          onChange={setCategory}
          options={TEMPLATE_CATEGORY_OPTIONS}
          placeholder="Select a category…"
        />
        <label className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Status
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as TemplateStatusFilter)
            }
            className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            {TEMPLATE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-base text-[#6b635a]">
          {!category && !search.trim()
            ? CATEGORY_PICKER_EMPTY_LIST_HINT
            : "No templates match — try a different search or category."}
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {visible.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setViewId(t.id)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/40 hover:bg-white"
              >
                <span className="min-w-0 truncate text-base font-semibold text-[#1f1c19]">
                  {t.title}
                </span>
                <span className="shrink-0 text-[#9a8f82]" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 self-start rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
        >
          Back
        </button>
      )}
    </div>
  );
}
