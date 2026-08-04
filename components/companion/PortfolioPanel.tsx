"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  consumePortfolioPrefill,
  createPortfolioEntry,
  deletePortfolioEntry,
  getPortfolioEntries,
  PORTFOLIO_ASSET_TYPES,
  PORTFOLIO_UPDATED_EVENT,
  updatePortfolioEntry,
  type PortfolioEntry,
  type PortfolioEntryInput,
} from "@/lib/portfolioStore";
import {
  GrowthAttachmentsField,
  GrowthAttachmentsList,
} from "@/components/companion/GrowthAttachmentsField";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import { OutcomeGoalMultiLinkPicker } from "@/components/companion/OutcomeGoalMultiLinkPicker";
import { getLinkedGoalIds, packGoalLinks } from "@/lib/goals/goalLinking";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";
const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";

const EMPTY_DRAFT: PortfolioEntryInput = {
  title: "",
  assetType: "Course",
  description: "",
  link: "",
  completedAt: new Date().toISOString().slice(0, 10),
  attachments: [],
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PortfolioPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
  const [tick, setTick] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<PortfolioEntryInput>(() => {
    const prefill = consumePortfolioPrefill();
    if (!prefill) return EMPTY_DRAFT;
    return {
      ...EMPTY_DRAFT,
      title: prefill.title ?? "",
      description: prefill.description ?? "",
      assetType: prefill.assetType ?? "Other",
    };
  });
  const [linkedGoalIds, setLinkedGoalIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PortfolioEntryInput>(EMPTY_DRAFT);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(PORTFOLIO_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PORTFOLIO_UPDATED_EVENT, onUpdate);
  }, [reload]);

  const entries = useMemo(() => getPortfolioEntries(), [tick]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    createPortfolioEntry({
      ...draft,
      title: draft.title.trim(),
      ...packGoalLinks(linkedGoalIds),
    });
    setDraft(EMPTY_DRAFT);
    setLinkedGoalIds([]);
    setShowForm(false);
    reload();
  }

  function startEdit(entry: PortfolioEntry) {
    setEditingId(entry.id);
    setEditDraft({
      title: entry.title,
      assetType: entry.assetType,
      description: entry.description,
      link: entry.link,
      completedAt: entry.completedAt,
      attachments: entry.attachments,
      ...packGoalLinks(getLinkedGoalIds(entry)),
    });
    setExpandedId(entry.id);
  }

  function saveEdit(id: string) {
    updatePortfolioEntry(id, {
      ...editDraft,
      title: editDraft.title.trim(),
      ...packGoalLinks(getLinkedGoalIds(editDraft)),
    });
    setEditingId(null);
    reload();
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader nav={nav} />

      <WorkspaceAreaWorksGuide areaId="portfolio" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#6b635a]">
          Completed assets and creations — courses, books, products, funnels, and more.
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50"
        >
          {showForm ? "Cancel" : "+ Add to Portfolio"}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="mt-4 space-y-3 rounded-2xl border border-[#e7d9c8] bg-white p-4"
        >
          <div>
            <label className={LABEL_CLASS}>Title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={INPUT_CLASS}
              placeholder="Launch funnel for workshop"
              required
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Asset type</label>
            <select
              value={draft.assetType}
              onChange={(e) => setDraft({ ...draft, assetType: e.target.value })}
              className={INPUT_CLASS}
            >
              {PORTFOLIO_ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Completed</label>
              <input
                type="date"
                value={draft.completedAt}
                onChange={(e) => setDraft({ ...draft, completedAt: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Link (optional)</label>
              <input
                value={draft.link}
                onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                className={INPUT_CLASS}
                placeholder="https://"
              />
            </div>
          </div>
          <GrowthAttachmentsField
            attachments={draft.attachments}
            onAttachmentsChange={(attachments) => setDraft({ ...draft, attachments })}
          />
          <OutcomeGoalMultiLinkPicker
            value={linkedGoalIds}
            onChange={setLinkedGoalIds}
          />
          <button
            type="submit"
            className="rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
          >
            Save to Portfolio™
          </button>
        </form>
      ) : null}

      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-[#9a8f82]" data-testid="portfolio-empty">
            No portfolio items yet — add a completed course, book, funnel, or creation.
          </p>
        ) : (
          entries.map((entry) => {
            const expanded = expandedId === entry.id;
            const editing = editingId === entry.id;
            return (
              <article
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-[#e7d9c8] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
                >
                  <span className="shrink-0 text-sm text-[#9a8f82]">
                    {expanded ? "▼" : "▶"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                        {entry.assetType}
                      </span>
                      <span className="text-xs text-[#9a8f82]">
                        {formatDate(entry.completedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[#2f261f]">{entry.title}</p>
                  </div>
                </button>
                {expanded ? (
                  <div className="border-t border-[#efe8de] px-4 pb-4 pt-3 text-sm">
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          value={editDraft.title}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, title: e.target.value })
                          }
                          className={INPUT_CLASS}
                        />
                        <select
                          value={editDraft.assetType}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, assetType: e.target.value })
                          }
                          className={INPUT_CLASS}
                        >
                          {PORTFOLIO_ASSET_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <textarea
                          rows={3}
                          value={editDraft.description}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, description: e.target.value })
                          }
                          className={INPUT_CLASS}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(entry.id)}
                            className="rounded-full bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-full border border-[#e7d9c8] px-3 py-1.5 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {entry.description ? (
                          <p className="text-[#4b463f]">{entry.description}</p>
                        ) : null}
                        {entry.link ? (
                          <a
                            href={entry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-sm font-semibold text-indigo-700 hover:underline"
                          >
                            Open link →
                          </a>
                        ) : null}
                        <GrowthAttachmentsList attachments={entry.attachments} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            className="rounded-full border border-[#e7d9c8] px-2.5 py-1 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deletePortfolioEntry(entry.id);
                              reload();
                            }}
                            className="rounded-full border border-[#e7d9c8] px-2.5 py-1 text-xs font-semibold text-[#9a6b6b]"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
