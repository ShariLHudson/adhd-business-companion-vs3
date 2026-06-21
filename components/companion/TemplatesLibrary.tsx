"use client";

import { useEffect, useState } from "react";
import {
  businessContextSummary,
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
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import { itemTypeFromTemplate } from "@/lib/templateItemType";
import { templateToCreationInput } from "@/lib/templateBuildWithShari";
import { TEMPLATE_CATEGORY_OPTIONS, parseFrameworkSections } from "@/lib/templateLibraryUx";
import { CATEGORY_PICKER_EMPTY_LIST_HINT, NO_CATEGORY } from "@/lib/categoryRevealUx";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import { AudienceTypeGenerateBar } from "@/components/companion/AudienceTypeGenerateBar";
import {
  LibraryCloseButton,
  LibraryPanelHeader,
  LibraryResultActions,
} from "@/components/companion/LibraryOrientationChrome";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import {
  buildContentGenerationContext,
  CONTENT_VOICE_TONES,
  getSelectedContentAudienceId,
  getSelectedContentToneId,
  setContentToneId,
  type ContentVoiceToneId,
} from "@/lib/contentAudience";
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
  const [filter, setFilter] = useState<TemplateCategory | typeof NO_CATEGORY>(
    NO_CATEGORY,
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [pendingConsent, setPendingConsent] = useState<PendingConsent | null>(
    null,
  );
  const [googleExportError, setGoogleExportError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  type TemplateSuggestion = {
    title: string;
    body: string;
    category: TemplateCategory;
    subcategory: string;
  };
  const [suggesting, setSuggesting] = useState(false);
  const [generateToneId, setGenerateToneId] = useState<ContentVoiceToneId>(
    getSelectedContentToneId,
  );
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [sugErr, setSugErr] = useState(false);
  const [templateType, setTemplateType] = useState<TemplateCategory>("emails");

  useEffect(() => {
    setItems(getTemplates());
  }, []);

  function closePanel() {
    onBack?.();
  }

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
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          templateCategory: TEMPLATE_CATEGORY_LABEL[templateType],
        }),
      });
      const d = await res.json();
      if (res.ok && Array.isArray(d.templates)) setSuggestions(d.templates);
      else setSugErr(true);
    } catch {
      setSugErr(true);
    } finally {
      setSuggesting(false);
    }
  }

  function saveSuggestion(s: TemplateSuggestion) {
    setItems(
      createTemplate({
        title: s.title,
        body: s.body,
        category: s.category,
        subcategory: s.subcategory || undefined,
        status: "saved",
      }),
    );
    setSuggestions((list) => list.filter((x) => x !== s));
  }

  function dismissSuggestion(s: TemplateSuggestion) {
    setSuggestions((list) => list.filter((x) => x !== s));
  }

  function useTemplateFramework(
    title: string,
    body: string,
    category: TemplateCategory = templateType,
  ) {
    const input: CreationWorkspaceInput = {
      itemType: itemTypeFromTemplate({
        id: "draft",
        title,
        body,
        category,
        status: "saved",
        createdAt: "",
        updatedAt: "",
      }),
      title,
      draftContent: body,
      brief: title,
      source: "template",
      stage: "shaping",
    };
    if (onOpenInCreate) {
      onOpenInCreate(input);
      return;
    }
    onBuildWithShari?.(input);
  }

  const visible =
    filter === NO_CATEGORY
      ? []
      : items.filter(
          (t) => t.category === filter && t.status !== "archived",
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
    }
    setDraft(null);
  }

  // ---- Editor view --------------------------------------------------------
  if (draft) {
    return (
      <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-2xl font-semibold text-[#1f1c19]">
            {draft.id ? "Edit template" : "New template"}
          </p>
          <LibraryCloseButton onClose={closePanel} />
        </div>
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
        <div className="mx-4 mt-4 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewId(null)}
            className="text-sm font-semibold text-[#1e4f4f]"
          >
            ‹ Templates
          </button>
          <LibraryCloseButton onClose={closePanel} />
        </div>
        <DraftWorkspacePanel
          itemType={itemType}
          templateName={template.title}
          draft={template.body}
          editable={false}
          templateSections={[]}
          onEditAction={() => {}}
          onSaveAction={(action) => {
            if (
              action === "save-google-docs" ||
              action === "add-existing-project"
            ) {
              if (action === "add-existing-project" && onOpenInCreate) {
                setPendingConsent({
                  kind: "create",
                  template: viewing,
                  action: "addToProject",
                });
              } else {
                void exportToGoogle();
              }
            } else if (action === "save-google-drive") {
              window.open("https://drive.google.com", "_blank");
            }
          }}
          onExportAction={(action) => {
            if (action === "copy-text") {
              void navigator.clipboard?.writeText(template.body);
            } else if (action === "print") {
              printTemplate();
            } else if (action === "export-pdf") {
              downloadTemplate();
            } else if (action === "export-docx") {
              void exportToGoogle();
            }
          }}
          onSocialAction={() => {}}
          googleExportError={googleExportError}
          onClearGoogleError={() => setGoogleExportError(null)}
          onRetryGoogle={exportToGoogle}
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

  // ---- List view -----------------------------------------------------------
  return (
    <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
      <LibraryPanelHeader
        title="Templates"
        description="Reusable frameworks that help you create content faster."
        onClose={closePanel}
      />

      <div className="mt-4">
        <WorkspaceAreaWorksGuide areaId="templates-library" />
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
          extraOptions={TEMPLATE_CATEGORY_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          extraValue={templateType}
          onExtraChange={(v) => setTemplateType(v as TemplateCategory)}
          extraLabel="Type"
          onGenerate={suggest}
          generating={suggesting}
          generateLabel="Generate"
        />
      </div>

      {sugErr ? (
        <p className="mt-3 text-sm text-[#a85c4a]">
          Couldn&apos;t load templates just now — try again.
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="companion-fade-in mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Template results
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {suggestions.map((s, i) => {
              const sections = parseFrameworkSections(s.body);
              return (
                <div
                  key={i}
                  className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3"
                >
                  <p className="text-base font-semibold text-[#1f1c19]">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                    {TEMPLATE_CATEGORY_LABEL[s.category]}
                    {s.subcategory ? ` · ${s.subcategory}` : ""}
                  </p>
                  <ul className="mt-3 space-y-2 border-t border-[#e7dfd4] pt-3">
                    {sections.map((sec) => (
                      <li key={sec.label}>
                        <p className="text-sm font-semibold text-[#1e4f4f]">
                          {sec.label}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-[#4b463f]">
                          {sec.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <LibraryResultActions
                    onSave={() => saveSuggestion(s)}
                    onUse={() =>
                      useTemplateFramework(s.title, s.body, s.category)
                    }
                    onDelete={() => dismissSuggestion(s)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Your saved templates
      </p>
      <CategoryPickerSelect
        label="Browse by category"
        value={filter}
        onChange={setFilter}
        options={TEMPLATE_CATEGORY_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
        placeholder="Select a category…"
        className="mt-2"
      />

      <div className="mt-4 flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-base text-[#6b635a]">
            {filter === NO_CATEGORY
              ? CATEGORY_PICKER_EMPTY_LIST_HINT
              : "Nothing saved in this category yet — show templates above."}
          </p>
        ) : (
          visible.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setViewId(t.id)}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
            >
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-[#1f1c19]">
                  {t.title}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
                  {TEMPLATE_CATEGORY_LABEL[t.category]}
                  {t.subcategory ? ` · ${t.subcategory}` : ""}
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
        onClick={() => setDraft({ ...EMPTY_DRAFT, category: templateType })}
        className="mt-4 text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        + Start from a blank template
      </button>
    </div>
  );
}
