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
import { DraftWorkspacePanel } from "@/components/companion/DraftWorkspacePanel";
import type { AppSection } from "@/lib/companionUi";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import { itemTypeFromTemplate } from "@/lib/templateItemType";
import { templateToCreationInput } from "@/lib/templateBuildWithShari";
import {
  filterTemplates,
  groupTemplatesByCategory,
  TEMPLATE_STATUS_OPTIONS,
  type TemplateStatusFilter,
} from "@/lib/templateLibraryUx";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";

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

type PendingConsent =
  | { kind: "chat"; template: TemplateItem }
  | { kind: "create"; template: TemplateItem; action: "regenerate" | "addToProject" };

function TemplateConsentGate({
  variant,
  templateTitle,
  onConfirm,
  onCancel,
}: {
  variant: "chat" | "create";
  templateTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#1e4f4f]/20 bg-[#f0f5f5] p-4">
      <p className="text-base font-semibold text-[#1f1c19]">
        {variant === "create"
          ? "Want to open Create and build from this template?"
          : `Build from “${templateTitle}” with Shari in chat?`}
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        {variant === "create"
          ? "Nothing opens until you choose Yes."
          : "Shari will ask one question first — nothing drafts until you agree."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          {variant === "create" ? "Yes, open Create" : "Yes — start in chat"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-black/5"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

export function TemplatesLibrary({
  onBack,
  onBuildWithShari,
  onOpenInCreate,
}: {
  onBack?: () => void;
  /** @deprecated Snippets / generate moved to Create — kept for call-site compat */
  onOpen?: (section: AppSection) => void;
  onGenerate?: (seed: { type?: string; brief?: string }) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  /** Opens Create only after in-panel consent (Regenerate / Add To Project). */
  onOpenInCreate?: (input: CreationWorkspaceInput) => void;
}) {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [status, setStatus] = useState<TemplateStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [pendingBuildId, setPendingBuildId] = useState<string | null>(null);
  const [pendingConsent, setPendingConsent] = useState<PendingConsent | null>(
    null,
  );
  /** Accordion — at most one category open; null = all collapsed. */
  const [openCategory, setOpenCategory] = useState<TemplateCategory | null>(
    null,
  );
  const [googleExportError, setGoogleExportError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setItems(getTemplates());
  }, []);

  const visible = useMemo(
    () =>
      filterTemplates(items, {
        query: search,
        status,
        category: NO_CATEGORY,
      }),
    [items, search, status],
  );

  const grouped = useMemo(
    () => groupTemplatesByCategory(visible),
    [visible],
  );

  const categoryDisplayLabel = (cat: TemplateCategory): string => {
    if (cat === "offers") return "Sales";
    if (cat === "emails") return "Email";
    if (cat === "systems") return "Operations";
    return TEMPLATE_CATEGORY_LABEL[cat];
  };

  function toggleCategory(cat: TemplateCategory) {
    setOpenCategory((prev) => (prev === cat ? null : cat));
  }

  function closeCategory() {
    setOpenCategory(null);
  }

  function renderTemplateRow(t: TemplateItem) {
    return (
      <li
        key={t.id}
        className="rounded-lg border border-[#e7dfd4] bg-[#faf7f2]/60 p-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setViewId(t.id)}
            className="min-w-0 flex-1 text-left text-base font-semibold text-[#1f1c19] hover:text-[#1e4f4f]"
          >
            {t.title}
          </button>
          {onBuildWithShari ? (
            pendingBuildId === t.id ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingBuildId(null);
                    onBuildWithShari(templateToCreationInput(t));
                  }}
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Yes — start in chat
                </button>
                <button
                  type="button"
                  onClick={() => setPendingBuildId(null)}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5"
                >
                  Not now
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPendingBuildId(t.id)}
                className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                Build With Shari
              </button>
            )
          ) : null}
        </div>
      </li>
    );
  }

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
        <p className="mt-1 text-sm text-[#6b635a]">
          Advanced: edit the framework directly. Prefer{" "}
          <strong>Build With Shari</strong> on the list if you want help shaping
          it in chat first.
        </p>

        {onBuildWithShari && (
          <button
            type="button"
            onClick={() =>
              onBuildWithShari({
                itemType: "template",
                title: draft.title.trim() || "New template",
                brief: draft.title.trim() || "new template",
                draftContent: draft.body,
                source: "template",
                stage: "shaping",
              })
            }
            className="mt-4 self-start rounded-xl border-2 border-[#1e4f4f]/30 bg-[#f0f5f5] px-4 py-3 text-left text-sm font-semibold text-[#1e4f4f] hover:border-[#1e4f4f] hover:bg-white"
          >
            ✨ Help me start
            <span className="mt-0.5 block text-xs font-normal text-[#6b635a]">
              Opens chat with one gentle question — nothing saves until you
              agree.
            </span>
          </button>
        )}
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
    const template = viewing;
    const itemType = itemTypeFromTemplate(template);

    async function exportToGoogle() {
      if (!template.body.trim()) {
        setGoogleExportError("There is no content to export.");
        return;
      }
      setGoogleExportError(null);
      setGoogleLoading(true);
      try {
        const r = await fetch("/api/google/create-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: template.title,
            content: template.body,
            kind: "doc",
          }),
        });
        const j = (await r.json()) as { url?: string; error?: string };
        if (!r.ok || !j.url) {
          setGoogleExportError(
            j.error || "Something went wrong sending this to Google Docs.",
          );
          return;
        }
        window.open(j.url, "_blank");
      } catch {
        setGoogleExportError("Something went wrong sending this to Google Docs.");
      } finally {
        setGoogleLoading(false);
      }
    }

    function downloadTemplate() {
      const blob = new Blob([template.body], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.title.replace(/[^\w.-]+/g, "-").slice(0, 40)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function printTemplate() {
      const w = window.open("", "_blank", "width=720,height=900");
      if (!w) return;
      w.document.write(
        `<html><head><title>${template.title}</title></head><body><pre style="white-space:pre-wrap;font-family:system-ui;padding:28px;">${template.body.replace(/</g, "&lt;")}</pre></body></html>`,
      );
      w.document.close();
      w.focus();
      window.setTimeout(() => w.print(), 300);
    }

    return (
      <div className="companion-fade-in flex h-full min-h-0 flex-col">
        <button
          type="button"
          onClick={() => setViewId(null)}
          className="mx-4 mt-4 self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Templates
        </button>
        <DraftWorkspacePanel
          itemType={itemType}
          templateName={template.title}
          draft={template.body}
          editable={false}
          onApplyDraft={() => {}}
          onGoogleDoc={exportToGoogle}
          onCopy={() => void navigator.clipboard?.writeText(template.body)}
          onPrint={printTemplate}
          onDownload={downloadTemplate}
          onAddToProject={
            onOpenInCreate
              ? () =>
                  setPendingConsent({
                    kind: "create",
                    template: viewing,
                    action: "addToProject",
                  })
              : undefined
          }
          onRegenerate={
            onOpenInCreate
              ? () =>
                  setPendingConsent({
                    kind: "create",
                    template: viewing,
                    action: "regenerate",
                  })
              : undefined
          }
          googleExportError={googleExportError}
          onClearGoogleError={() => setGoogleExportError(null)}
          busy={googleLoading}
        />
        {pendingConsent?.kind === "create" &&
        pendingConsent.template.id === viewing.id ? (
          <div className="mx-auto w-full max-w-3xl px-4 pb-2">
            <TemplateConsentGate
              variant="create"
              templateTitle={viewing.title}
              onConfirm={() => {
                onOpenInCreate?.(templateToCreationInput(pendingConsent.template));
                setPendingConsent(null);
              }}
              onCancel={() => setPendingConsent(null)}
            />
          </div>
        ) : null}
        <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-4 pb-2">
          {onBuildWithShari &&
            (pendingConsent?.kind === "chat" &&
            pendingConsent.template.id === viewing.id ? (
              <TemplateConsentGate
                variant="chat"
                templateTitle={viewing.title}
                onConfirm={() => {
                  onBuildWithShari(templateToCreationInput(viewing));
                  setPendingConsent(null);
                }}
                onCancel={() => setPendingConsent(null)}
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  setPendingConsent({
                    kind: "chat",
                    template: viewing,
                  })
                }
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                ✨ Build With Shari
              </button>
            ))}
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-4 pb-6 text-sm font-semibold">
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
            Edit template
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
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Templates</p>
        <div className="flex shrink-0 items-center gap-2">
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
      <div className="mt-1 space-y-1 text-base text-[#6b635a]">
        <p>Templates are reusable starting points saved on this device.</p>
        <p>
          Build With Shari opens a conversation to adapt the template together.
          Nothing is drafted until you agree.
        </p>
      </div>

      {onBuildWithShari && (
        <button
          type="button"
          onClick={() =>
            onBuildWithShari({
              itemType: "template",
              title: "New template",
              brief: "new template",
              source: "template",
              stage: "shaping",
            })
          }
          className="mt-5 w-full rounded-xl bg-[#1e4f4f] px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          ✨ Build With Shari
        </button>
      )}

      <button
        type="button"
        onClick={() => setDraft({ ...EMPTY_DRAFT })}
        className="mt-2 self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        Start from blank →
      </button>

      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpenCategory(null);
        }}
        placeholder="Search templates…"
        className="mt-5 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-lg text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        autoFocus
      />

      <details
        className="mt-3 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-2"
        open={filtersOpen}
        onToggle={(e) => setFiltersOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-[#6b635a] marker:content-none [&::-webkit-details-marker]:hidden">
          Filter templates
          {status !== "all" ? (
            <span className="ml-2 font-normal text-[#1e4f4f]">(filtered)</span>
          ) : null}
        </summary>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TemplateStatusFilter);
              setOpenCategory(null);
            }}
            className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            {TEMPLATE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </details>

      {visible.length === 0 ? (
        <p className="mt-6 text-base text-[#6b635a]">
          {search.trim() || status !== "all"
            ? "No templates match — try a different search or filter."
            : "No saved templates yet — tap Build With Shari above or start from blank."}
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {grouped.map((group) => {
            const open = openCategory === group.category;
            return (
              <section
                key={group.category}
                className="rounded-xl border border-[#d4cdc3] bg-white/90"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(group.category)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
                >
                  <span className="text-base font-semibold text-[#1f1c19]">
                    {categoryDisplayLabel(group.category)} Templates
                  </span>
                  <span className="text-sm font-medium text-[#6b635a]">
                    ({group.templates.length}) {open ? "▾" : "▸"}
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-[#e7dfd4] px-3 py-3">
                    <ul className="flex flex-col gap-2">
                      {group.templates.map((t) => renderTemplateRow(t))}
                    </ul>
                    <button
                      type="button"
                      onClick={closeCategory}
                      className="mt-3 w-full rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                    >
                      Close category
                    </button>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
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
