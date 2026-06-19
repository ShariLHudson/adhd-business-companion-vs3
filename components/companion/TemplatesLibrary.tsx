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
  sortedTemplateDropdownOptions,
  templateDropdownLabel,
  templatesForDefaultPicker,
  TEMPLATE_STATUS_OPTIONS,
  type TemplateStatusFilter,
} from "@/lib/templateLibraryUx";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

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
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [pickerSelection, setPickerSelection] = useState("");
  const [pendingConsent, setPendingConsent] = useState<PendingConsent | null>(
    null,
  );
  const [googleExportError, setGoogleExportError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setItems(getTemplates());
  }, []);

  const pickerOptions = useMemo(
    () => sortedTemplateDropdownOptions(templatesForDefaultPicker(items)),
    [items],
  );

  const advancedResults = useMemo(
    () =>
      filterTemplates(items, {
        query: search,
        status,
        category: NO_CATEGORY,
      }),
    [items, search, status],
  );

  const advancedActive = Boolean(search.trim()) || status !== "all";
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
      <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
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

  // ---- List view — calm picker + optional advanced search ------------------
  return (
    <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
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
      <p className="mt-1 text-base text-[#6b635a]">
        Reusable starting points saved on this device. Build With Shari adapts a
        template in chat — nothing drafts until you agree.
      </p>

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
          className="mt-6 w-full rounded-xl bg-[#1e4f4f] px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          ✨ Build With Shari
        </button>
      )}

      <label className="mt-5 block text-sm font-semibold text-[#1f1c19]">
        Choose a template
        <select
          value={pickerSelection}
          onChange={(e) => {
            const id = e.target.value;
            setPickerSelection(id);
            if (id) {
              setViewId(id);
              setPickerSelection("");
            }
          }}
          className="mt-2 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="">
            {pickerOptions.length
              ? "Select a template…"
              : "No templates yet — start with Build With Shari"}
          </option>
          {pickerOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {templateDropdownLabel(t)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => setDraft({ ...EMPTY_DRAFT })}
        className="mt-4 w-full rounded-xl border border-[#1e4f4f]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
      >
        Start from blank
      </button>

      <details className="mt-8 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-[#6b635a] marker:content-none [&::-webkit-details-marker]:hidden">
          Advanced template search
        </summary>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates…"
          className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TemplateStatusFilter)}
            className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            {TEMPLATE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {advancedActive ? (
          advancedResults.length === 0 ? (
            <p className="mt-3 text-sm text-[#6b635a]">
              No templates match — try a different search or status.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {sortedTemplateDropdownOptions(advancedResults).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setViewId(t.id)}
                    className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-[#1f1c19] hover:bg-white/80 hover:text-[#1e4f4f]"
                  >
                    {templateDropdownLabel(t)}
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="mt-3 text-xs text-[#9a8f82]">
            Search or filter by status to browse the full library.
          </p>
        )}
      </details>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 self-start rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
        >
          Back
        </button>
      )}
    </div>
  );
}
