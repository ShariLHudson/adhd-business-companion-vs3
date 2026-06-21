"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CONFIDENCE_CATEGORIES,
  CONFIDENCE_SOURCES,
  CONFIDENCE_VAULT_UPDATED_EVENT,
  consumeConfidencePrefill,
  createConfidenceEntry,
  deleteConfidenceEntry,
  EMPTY_CONFIDENCE_DRAFT,
  filterConfidenceEntries,
  getConfidenceDashboardStats,
  getConfidenceEntries,
  searchConfidenceEntries,
  toggleConfidenceFavorite,
  type ConfidenceEntry,
  type ConfidenceEntryInput,
  type ConfidenceVaultFilter,
} from "@/lib/confidenceVaultStore";
import {
  GrowthAttachmentsField,
  GrowthAttachmentsList,
} from "@/components/companion/GrowthAttachmentsField";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import {
  GrowthArchiveBar,
  GrowthSectionHeader,
} from "@/components/companion/GrowthSectionHeader";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  isInGrowthArchivePeriod,
  type GrowthArchivePeriod,
} from "@/lib/growthArchive";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";
const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";

const FILTERS: { id: ConfidenceVaultFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "testimonials", label: "Testimonials" },
  { id: "praise", label: "Praise" },
  { id: "credentials", label: "Credentials" },
  { id: "awards", label: "Awards" },
  { id: "achievements", label: "Achievements" },
  { id: "client-results", label: "Client Results" },
  { id: "favorites", label: "Favorites" },
];

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#e7d9c8] bg-white px-2 py-2 text-center">
      <p className="text-lg font-bold text-[#2f261f]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
        {label}
      </p>
    </div>
  );
}

function EntryCard({
  entry,
  expanded,
  onToggle,
  onFavorite,
  onDelete,
}: {
  entry: ConfidenceEntry;
  expanded: boolean;
  onToggle: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e7d9c8] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
        aria-expanded={expanded}
      >
        <span className="shrink-0 text-sm text-[#9a8f82]" aria-hidden="true">
          {expanded ? "▼" : "▶"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {entry.favorite ? (
              <span className="text-sm" aria-label="Most meaningful">
                ⭐
              </span>
            ) : null}
            <span className="rounded-full bg-[#faf7f2] px-2.5 py-0.5 text-xs font-semibold text-[#6f6259]">
              {entry.category}
            </span>
            {entry.date ? (
              <span className="text-xs text-[#9a8f82]">{formatDate(entry.date)}</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm font-medium text-[#2f261f]">{entry.title}</p>
        </div>
      </button>
      {expanded ? (
        <div className="border-t border-[#efe8de] px-4 pb-4 pt-3 text-sm text-[#4b463f]">
          {entry.description ? <p className="leading-relaxed">{entry.description}</p> : null}
          {entry.source ? (
            <p className="mt-2 text-xs text-[#6f6259]">Source: {entry.source}</p>
          ) : null}
          <GrowthAttachmentsList attachments={entry.attachments} link={entry.link} />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onFavorite}
              className="text-xs font-semibold text-[#b45309] hover:underline"
            >
              {entry.favorite ? "Unstar" : "⭐ Mark most meaningful"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs font-semibold text-[#9a6b6b] hover:text-[#7f4f4f]"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function ConfidenceVaultPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<ConfidenceEntry[]>([]);
  const [filter, setFilter] = useState<ConfidenceVaultFilter>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [quickText, setQuickText] = useState("");
  const [draft, setDraft] = useState<ConfidenceEntryInput>(EMPTY_CONFIDENCE_DRAFT);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reload = useCallback(() => setEntries(getConfidenceEntries()), []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(CONFIDENCE_VAULT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONFIDENCE_VAULT_UPDATED_EVENT, onUpdate);
  }, [reload]);

  useEffect(() => {
    const prefill = consumeConfidencePrefill();
    if (!prefill) return;
    setDraft((d) => ({
      ...d,
      title: prefill.title ?? d.title,
      description: prefill.description ?? d.description,
      category: prefill.category ?? d.category,
    }));
    setShowForm(true);
  }, [refreshKey]);

  const stats = useMemo(() => getConfidenceDashboardStats(), [entries]);
  const visible = useMemo(() => {
    if (search.trim()) return searchConfidenceEntries(search, filter);
    return filterConfidenceEntries(filter);
  }, [search, filter, entries]);

  function updateDraft<K extends keyof ConfidenceEntryInput>(
    key: K,
    value: ConfidenceEntryInput[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleQuickSave() {
    const text = quickText.trim();
    if (!text) return;
    const firstLine = text.split("\n")[0]?.slice(0, 120) ?? "Saved praise";
    createConfidenceEntry({
      ...EMPTY_CONFIDENCE_DRAFT,
      title: firstLine,
      description: text,
      category: "Praise & Compliments",
    });
    setQuickText("");
    reload();
  }

  function handleSave() {
    if (!draft.title.trim()) return;
    createConfidenceEntry({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
    });
    setDraft(EMPTY_CONFIDENCE_DRAFT);
    setShowForm(false);
    reload();
  }

  function closeAll() {
    setExpandedId(null);
    setShowForm(false);
    setDraft(EMPTY_CONFIDENCE_DRAFT);
    setQuickText("");
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader nav={nav} onCloseAll={closeAll} />

      <WorkspaceAreaWorksGuide areaId="confidence-vault" />

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatPill label="Testimonials" value={stats.testimonials} />
        <StatPill label="Praise" value={stats.praise} />
        <StatPill label="Credentials" value={stats.credentials} />
        <StatPill label="Accomplishments" value={stats.accomplishments} />
        <StatPill label="Certifications" value={stats.certifications} />
        <StatPill label="Awards" value={stats.awards} />
        <StatPill label="Client Results" value={stats.clientResults} />
        <StatPill label="Success Stories" value={stats.successStories} />
        <StatPill label="Speaking" value={stats.speakingEvents} />
        <StatPill label="Media" value={stats.mediaMentions} />
      </div>

      {stats.total === 0 ? (
        <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-gradient-to-b from-[#faf7f2] to-white p-5 text-center">
          <p className="font-semibold text-[#2f261f]">
            Start collecting your highlights.
          </p>
          <p className="mt-2 text-sm text-[#6f6259]">
            Save accomplishments, praise, expertise, credentials, testimonials, and moments
            that remind you of your strengths.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full bg-[#2f261f] px-4 py-2 text-sm font-semibold text-white"
            >
              Add First Item
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft({
                  ...EMPTY_CONFIDENCE_DRAFT,
                  category: "Testimonials",
                });
                setShowForm(true);
              }}
              className="rounded-full border border-[#e7d9c8] bg-white px-4 py-2 text-sm font-semibold text-[#2f261f]"
            >
              Import Testimonial
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-4">
        <h3 className="text-sm font-bold text-[#2f261f]">Quick Save</h3>
        <p className="mt-1 text-xs text-[#6f6259]">
          Paste a compliment, testimonial, praise, or positive email — no long form.
        </p>
        <textarea
          rows={3}
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder="Paste praise here…"
          className={`${INPUT_CLASS} mt-2`}
        />
        <button
          type="button"
          onClick={handleQuickSave}
          disabled={!quickText.trim()}
          className="mt-2 rounded-full bg-[#2f261f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          Quick Save
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-[#e7d9c8] bg-white px-4 py-2 text-sm font-semibold text-[#2f261f]"
        >
          {showForm ? "Hide full form" : "Add full item"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-[#e7d9c8] bg-white px-3 py-2 text-xs font-semibold text-[#6f6259]"
        >
          🖨 Print
        </button>
        <button
          type="button"
          disabled
          title="PDF export coming soon"
          className="cursor-not-allowed rounded-full border border-dashed border-[#e7d9c8] px-3 py-2 text-xs font-semibold text-[#b8afa4]"
        >
          📄 Export PDF
        </button>
      </div>

      {showForm ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-white p-5">
          <div className="space-y-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="cv-title">Title</label>
              <input
                id="cv-title"
                value={draft.title}
                onChange={(e) => updateDraft("title", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="cv-category">Category</label>
                <select
                  id="cv-category"
                  value={draft.category}
                  onChange={(e) =>
                    updateDraft("category", e.target.value as ConfidenceEntryInput["category"])
                  }
                  className={INPUT_CLASS}
                >
                  {CONFIDENCE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="cv-source">Source</label>
                <select
                  id="cv-source"
                  value={draft.source}
                  onChange={(e) =>
                    updateDraft("source", e.target.value as ConfidenceEntryInput["source"])
                  }
                  className={INPUT_CLASS}
                >
                  {CONFIDENCE_SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cv-desc">Description</label>
              <textarea
                id="cv-desc"
                rows={4}
                value={draft.description}
                onChange={(e) => updateDraft("description", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cv-date">Date</label>
              <input
                id="cv-date"
                type="date"
                value={draft.date}
                onChange={(e) => updateDraft("date", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <GrowthAttachmentsField
              attachments={draft.attachments}
              link={draft.link}
              onAttachmentsChange={(next) => updateDraft("attachments", next)}
              onLinkChange={(next) => updateDraft("link", next)}
            />
            <label className="flex items-center gap-2 text-sm text-[#2f261f]">
              <input
                type="checkbox"
                checked={draft.favorite}
                onChange={(e) => updateDraft("favorite", e.target.checked)}
              />
              ⭐ Most meaningful
            </label>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.title.trim()}
              className="rounded-full bg-[#2f261f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save to My Highlights
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, description, source…"
          className="w-full rounded-full border border-[#e4ddd2] bg-white px-4 py-2 text-sm"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === f.id
                  ? "bg-[#2f261f] text-white"
                  : "border border-[#e7d9c8] bg-white text-[#6f6259]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ul className="mt-3 space-y-3">
          {visible.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-[#e7d9c8] px-4 py-6 text-center text-sm text-[#6f6259]">
              No items yet for this view.
            </li>
          ) : (
            visible.map((entry) => (
              <li key={entry.id}>
                <EntryCard
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === entry.id ? null : entry.id))
                  }
                  onFavorite={() => {
                    toggleConfidenceFavorite(entry.id);
                    reload();
                  }}
                  onDelete={() => {
                    deleteConfidenceEntry(entry.id);
                    reload();
                  }}
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
