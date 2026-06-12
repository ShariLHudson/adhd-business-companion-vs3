"use client";

import { useEffect, useState } from "react";
import {
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  getTemplates,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_SUBTYPES,
  updateTemplate,
  type TemplateCategory,
  type TemplateItem,
  type TemplateStatus,
} from "@/lib/companionStore";
import { RefineActions } from "@/components/companion/RefineActions";
import { RemixActions } from "@/components/companion/RemixActions";
import { ScoreActions } from "@/components/companion/ScoreActions";
import { ExportActions } from "@/components/companion/ExportActions";
import type { AppSection } from "@/lib/companionUi";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";

const STATUS_TABS: { id: TemplateStatus; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "draft", label: "Drafts" },
  { id: "archived", label: "Archived" },
];

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
  onOpen,
  onGenerate,
  onBuildWithShari,
}: {
  onBack?: () => void;
  onOpen?: (section: AppSection) => void;
  onGenerate?: (seed: { type?: string; brief?: string }) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
}) {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [status, setStatus] = useState<TemplateStatus>("saved");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  // Which category groups are expanded — empty means everything is closed.
  const [openCats, setOpenCats] = useState<string[]>([]);

  useEffect(() => {
    setItems(getTemplates());
  }, []);

  const visible = items.filter(
    (t) =>
      t.status === status &&
      (category === "all" || t.category === category),
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
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {TEMPLATE_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          {TEMPLATE_SUBTYPES[draft.category].length > 0 && (
            <select
              value={draft.subcategory}
              onChange={(e) =>
                setDraft({ ...draft, subcategory: e.target.value })
              }
              className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Type (optional)…</option>
              {TEMPLATE_SUBTYPES[draft.category].map((s) => (
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

        {/* Score this asset, then remix it into another format */}
        <ScoreActions
          content={viewing.body}
          kind={viewing.subcategory || viewing.category}
          onApply={(next) =>
            setItems(updateTemplate(viewing.id, { body: next }))
          }
        />
        <RemixActions content={viewing.body} />
        <ExportActions
          text={viewing.body}
          title={viewing.title}
          social={
            viewing.category === "content" &&
            /post|social/i.test(viewing.subcategory ?? "")
          }
        />

        {onBuildWithShari && (
          <div className="mt-4 flex flex-wrap gap-2">
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
              className="rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
            >
              ✨ Use With Shari
            </button>
            <button
              type="button"
              onClick={() =>
                onBuildWithShari({
                  itemType: viewing.subcategory || viewing.title,
                  title: viewing.title,
                  draftContent: viewing.body,
                  brief: `Customize this "${viewing.title}" template`,
                  templateId: viewing.id,
                  stage: "customizing template",
                })
              }
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            >
              ✏️ Customize With Shari
            </button>
          </div>
        )}

        {/* Generate a fresh draft from this template (full-page create flow). */}
        {onGenerate && (
          <button
            type="button"
            onClick={() =>
              onGenerate({
                type: viewing.subcategory || viewing.title,
                brief: `Fill in this "${viewing.title}" template:\n\n${viewing.body}`,
              })
            }
            className="mt-3 self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            ✨ Have Shari write this with me
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

  // ---- List view ----------------------------------------------------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Templates Library</p>
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

      {onOpen && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onGenerate && (
            <button
              type="button"
              onClick={() => onGenerate({})}
              className="flex items-center gap-2 rounded-xl border border-[#1e4f4f]/30 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
            >
              ✨ Generate content with Shari →
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpen("snippets")}
            className="flex items-center gap-2 rounded-xl border border-[#1e4f4f]/30 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
          >
            🧩 Snippets →
          </button>
          <button
            type="button"
            onClick={() => onOpen("content-types")}
            className="flex items-center gap-2 rounded-xl border border-[#1e4f4f]/30 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
          >
            ⚙️ Content types →
          </button>
        </div>
      )}

      {/* Status tabs */}
      <div className="mt-4 flex gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setStatus(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              status === t.id
                ? "bg-[#1e4f4f] text-white shadow-sm"
                : "bg-white/80 text-[#3d3630] hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category filter — a dropdown instead of a wall of chips. */}
      <div className="mt-3 flex flex-col">
        <label className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Category
        </label>
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as TemplateCategory | "all")
          }
          className="mt-1 w-full max-w-xs rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="all">All Categories</option>
          {TEMPLATE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TEMPLATE_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>

      {/* List — grouped by category, every group closed on open. */}
      {visible.length === 0 ? (
        <p className="mt-5 text-base text-[#6b635a]">
          Nothing here yet.
          {status === "saved" && " Create one, or save one of Shari's outputs."}
        </p>
      ) : (
        (() => {
          const groups = TEMPLATE_CATEGORIES.map((c) => ({
            cat: c,
            items: visible.filter((t) => t.category === c),
          })).filter((g) => g.items.length > 0);
          return (
            <>
              {openCats.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenCats([])}
                  className="mt-4 self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
                >
                  ▲ Collapse all
                </button>
              )}
              <div className="mt-3 flex flex-col gap-2.5">
                {groups.map((g) => {
                  const open = openCats.includes(g.cat);
                  return (
                    <div
                      key={g.cat}
                      className="overflow-hidden rounded-2xl border border-[#d4cdc3] bg-white/85"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCats((o) =>
                            open ? o.filter((x) => x !== g.cat) : [...o, g.cat],
                          )
                        }
                        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                      >
                        <span className="text-base font-semibold text-[#1f1c19]">
                          {TEMPLATE_CATEGORY_LABEL[g.cat]}{" "}
                          <span className="text-sm font-normal text-[#9a8f82]">
                            ({g.items.length})
                          </span>
                        </span>
                        <span className="text-[#9a8f82]">{open ? "▲" : "▼"}</span>
                      </button>
                      {open && (
                        <div className="flex flex-col gap-2 px-3 pb-3">
                          {g.items.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setViewId(t.id)}
                              className="flex items-center justify-between gap-3 rounded-xl border border-[#e4ddd2] bg-white px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/45"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-base font-semibold text-[#1f1c19]">
                                  {t.title}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide text-[#1e4f4f]">
                                  {TEMPLATE_CATEGORY_LABEL[t.category]}
                                  {t.subcategory ? ` · ${t.subcategory}` : ""}
                                </span>
                              </span>
                              <span
                                aria-hidden="true"
                                className="shrink-0 text-[#9a8f82]"
                              >
                                ›
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()
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
