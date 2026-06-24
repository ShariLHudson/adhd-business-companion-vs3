"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  consumeEvidencePrefill,
  createEvidenceEntry,
  deleteEvidenceEntry,
  downloadEvidenceEntry,
  EMPTY_EVIDENCE_DRAFT,
  EVIDENCE_BANK_UPDATED_EVENT,
  EVIDENCE_CATEGORIES,
  getEvidenceDashboardStats,
  getEvidenceEntries,
  printEvidenceEntry,
  updateEvidenceEntry,
  type EvidenceCategory,
  type EvidenceEntry,
  type EvidenceEntryInput,
} from "@/lib/evidenceBankStore";
import {
  GrowthAttachmentsField,
  GrowthAttachmentsList,
} from "@/components/companion/GrowthAttachmentsField";
import {
  GrowthArchiveBar,
  GrowthSectionHeader,
} from "@/components/companion/GrowthSectionHeader";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  isInGrowthArchivePeriod,
  type GrowthArchivePeriod,
} from "@/lib/growthArchive";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";
const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";

function formatEvidenceDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e7d9c8] bg-white px-3 py-3 text-center">
      <p className="text-2xl font-bold text-[#2f261f]">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#9a8f82]">
        {label}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        tone === "danger"
          ? "border-[#e7d9c8] text-[#9a6b6b] hover:bg-[#faf7f2]"
          : "border-[#e7d9c8] bg-white text-[#2f261f] hover:bg-[#faf7f2]"
      }`}
    >
      {children}
    </button>
  );
}

function EvidenceCard({
  entry,
  expanded,
  editing,
  editDraft,
  onToggle,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDraftChange,
  onDelete,
  onAttach,
}: {
  entry: EvidenceEntry;
  expanded: boolean;
  editing: boolean;
  editDraft: EvidenceEntryInput;
  onToggle: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDraftChange: (draft: EvidenceEntryInput) => void;
  onDelete: () => void;
  onAttach: () => void;
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
            <span className="rounded-full bg-[#faf7f2] px-2.5 py-0.5 text-xs font-semibold text-[#6f6259]">
              {entry.category}
            </span>
            <span className="text-xs text-[#9a8f82]">
              {formatEvidenceDate(entry.createdAt)}
            </span>
            {entry.attachments.length > 0 ? (
              <span className="text-xs text-[#9a8f82]">
                📎 {entry.attachments.length}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm font-medium text-[#2f261f]">
            {entry.whatHappened}
          </p>
          {entry.whyItMattered.trim() && !expanded ? (
            <p className="mt-1 text-sm text-[#6f6259]">
              <span className="font-medium text-[#4b463f]">Why it mattered: </span>
              {entry.whyItMattered}
            </p>
          ) : null}
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-[#efe8de] px-4 pb-4 pt-3 text-sm text-[#4b463f]">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Category</label>
                <select
                  value={editDraft.category}
                  onChange={(e) =>
                    onEditDraftChange({
                      ...editDraft,
                      category: e.target.value as EvidenceCategory,
                    })
                  }
                  className={INPUT_CLASS}
                >
                  {EVIDENCE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {(
                [
                  ["whatHappened", "What happened?"],
                  ["whatImproved", "What improved?"],
                  ["whatMovedForward", "What moved forward?"],
                  ["whatProblemSolved", "Problem solved?"],
                  ["whoBenefited", "Who benefited?"],
                  ["whyItMattered", "Why did it matter?"],
                  ["whatThisProves", "What does this prove?"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className={LABEL_CLASS}>{label}</label>
                  <textarea
                    rows={2}
                    value={editDraft[key]}
                    onChange={(e) =>
                      onEditDraftChange({ ...editDraft, [key]: e.target.value })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              ))}
              <GrowthAttachmentsField
                attachments={editDraft.attachments}
                onAttachmentsChange={(next) =>
                  onEditDraftChange({ ...editDraft, attachments: next })
                }
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="rounded-full bg-[#2f261f] px-4 py-2 text-xs font-semibold text-white"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-full border border-[#e7d9c8] px-4 py-2 text-xs font-semibold text-[#6f6259]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {entry.whatImproved.trim() ? (
                <p className="mt-2">
                  <span className="font-semibold text-[#2f261f]">What improved: </span>
                  {entry.whatImproved}
                </p>
              ) : null}
              {entry.whatMovedForward.trim() ? (
                <p className="mt-2">
                  <span className="font-semibold text-[#2f261f]">What moved forward: </span>
                  {entry.whatMovedForward}
                </p>
              ) : null}
              {entry.whatProblemSolved.trim() ? (
                <p className="mt-2">
                  <span className="font-semibold text-[#2f261f]">Problem solved: </span>
                  {entry.whatProblemSolved}
                </p>
              ) : null}
              {entry.whoBenefited.trim() ? (
                <p className="mt-2">
                  <span className="font-semibold text-[#2f261f]">Who benefited: </span>
                  {entry.whoBenefited}
                </p>
              ) : null}
              {entry.whyItMattered.trim() ? (
                <p className="mt-2">
                  <span className="font-semibold text-[#2f261f]">Why it mattered: </span>
                  {entry.whyItMattered}
                </p>
              ) : null}
              {entry.whatThisProves.trim() ? (
                <p className="mt-2">
                  <span className="font-semibold text-[#2f261f]">What this proves: </span>
                  {entry.whatThisProves}
                </p>
              ) : null}
              <GrowthAttachmentsList attachments={entry.attachments} />
            </>
          )}

          {!editing ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={onToggle}>Open</ActionButton>
              <ActionButton onClick={onEdit}>Edit</ActionButton>
              <ActionButton onClick={onAttach}>Attach</ActionButton>
              <ActionButton onClick={() => printEvidenceEntry(entry)}>
                Print
              </ActionButton>
              <ActionButton onClick={() => downloadEvidenceEntry(entry)}>
                Export
              </ActionButton>
              <ActionButton onClick={onDelete} tone="danger">
                Delete
              </ActionButton>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function EvidenceBankPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [search, setSearch] = useState("");
  const [archivePeriod, setArchivePeriod] = useState<GrowthArchivePeriod>("all");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<EvidenceEntryInput>(EMPTY_EVIDENCE_DRAFT);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EvidenceEntryInput>(EMPTY_EVIDENCE_DRAFT);
  const [attachEntryId, setAttachEntryId] = useState<string | null>(null);

  const reload = useCallback(() => {
    setEntries(getEvidenceEntries());
  }, []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
  }, [reload]);

  useEffect(() => {
    const prefill = consumeEvidencePrefill();
    if (!prefill) return;
    setDraft((d) => ({
      ...d,
      whatHappened: prefill.whatHappened ?? d.whatHappened,
      sourceWinId: prefill.sourceWinId,
    }));
    setShowForm(true);
  }, [refreshKey]);

  const stats = useMemo(() => getEvidenceDashboardStats(), [entries]);

  const visibleEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (!isInGrowthArchivePeriod(e.createdAt, archivePeriod)) return false;
      if (!q) return true;
      const haystack = [
        e.whatHappened,
        e.whyItMattered,
        e.whatImproved,
        e.whatMovedForward,
        e.whatProblemSolved,
        e.whoBenefited,
        e.whatThisProves,
        e.category,
        ...e.attachments.map((a) => a.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, search, archivePeriod]);

  function updateDraft<K extends keyof EvidenceEntryInput>(
    key: K,
    value: EvidenceEntryInput[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleSave() {
    if (!draft.whatHappened.trim()) return;
    createEvidenceEntry({
      ...draft,
      whatHappened: draft.whatHappened.trim(),
    });
    setDraft(EMPTY_EVIDENCE_DRAFT);
    setShowForm(false);
    reload();
  }

  function handleDelete(id: string) {
    deleteEvidenceEntry(id);
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) setEditingId(null);
    reload();
  }

  function startEdit(entry: EvidenceEntry) {
    setEditingId(entry.id);
    setExpandedId(entry.id);
    setEditDraft({
      category: entry.category,
      whatHappened: entry.whatHappened,
      whatImproved: entry.whatImproved,
      whatMovedForward: entry.whatMovedForward,
      whatProblemSolved: entry.whatProblemSolved,
      whoBenefited: entry.whoBenefited,
      whyItMattered: entry.whyItMattered,
      whatThisProves: entry.whatThisProves,
      attachments: [...entry.attachments],
      sourceWinId: entry.sourceWinId,
    });
  }

  function saveEdit() {
    if (!editingId || !editDraft.whatHappened.trim()) return;
    updateEvidenceEntry(editingId, {
      ...editDraft,
      whatHappened: editDraft.whatHappened.trim(),
    });
    setEditingId(null);
    reload();
  }

  const attachEntry = attachEntryId
    ? entries.find((e) => e.id === attachEntryId)
    : null;

  function closeAll() {
    setExpandedId(null);
    setEditingId(null);
    setEditDraft(EMPTY_EVIDENCE_DRAFT);
    setShowForm(false);
    setDraft(EMPTY_EVIDENCE_DRAFT);
    setAttachEntryId(null);
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader
        nav={nav}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search evidence…"
        onCloseAll={closeAll}
        onQuickAttach={(atts) => {
          setDraft((d) => ({
            ...d,
            attachments: [...d.attachments, ...atts],
          }));
          setShowForm(true);
        }}
      />

      <WorkspaceAreaWorksGuide areaId="evidence-bank" />

      <div className="mt-4">
        <GrowthArchiveBar period={archivePeriod} onPeriodChange={setArchivePeriod} />
      </div>

      <div className="mt-5">
        {stats.totalEntries > 0 ? (
          <details className="rounded-2xl border border-[#e7d9c8] bg-[#faf7f2]/50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#6f6259]">
              View totals (optional)
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile label="Total entries" value={stats.totalEntries} />
              <StatTile label="Problems solved" value={stats.problemsSolved} />
              <StatTile label="Things improved" value={stats.thingsImproved} />
              <StatTile label="People benefited" value={stats.peopleBenefited} />
              <StatTile label="Courage moments" value={stats.courageMoments} />
            </div>
          </details>
        ) : null}
      </div>

      <div className="mt-5">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-full bg-[#2f261f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3d342c]"
          >
            Add evidence
          </button>
        ) : (
          <div className="rounded-3xl border border-[#e7d9c8] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#2f261f]">Add evidence entry</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setDraft(EMPTY_EVIDENCE_DRAFT);
                }}
                className="text-xs font-semibold text-[#9a8f82] hover:text-[#6f6259]"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-category">
                  Category
                </label>
                <select
                  id="evidence-category"
                  value={draft.category}
                  onChange={(e) =>
                    updateDraft("category", e.target.value as EvidenceCategory)
                  }
                  className={INPUT_CLASS}
                >
                  {EVIDENCE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-what-happened">
                  What happened?
                </label>
                <textarea
                  id="evidence-what-happened"
                  rows={2}
                  value={draft.whatHappened}
                  onChange={(e) => updateDraft("whatHappened", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="The fact — what you did or what occurred"
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-improved">
                  What improved?
                </label>
                <textarea
                  id="evidence-improved"
                  rows={2}
                  value={draft.whatImproved}
                  onChange={(e) => updateDraft("whatImproved", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-moved">
                  What moved forward?
                </label>
                <textarea
                  id="evidence-moved"
                  rows={2}
                  value={draft.whatMovedForward}
                  onChange={(e) => updateDraft("whatMovedForward", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-problem">
                  What problem was solved or prevented?
                </label>
                <textarea
                  id="evidence-problem"
                  rows={2}
                  value={draft.whatProblemSolved}
                  onChange={(e) => updateDraft("whatProblemSolved", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-who">
                  Who benefited?
                </label>
                <input
                  id="evidence-who"
                  type="text"
                  value={draft.whoBenefited}
                  onChange={(e) => updateDraft("whoBenefited", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-why">
                  Why did it matter?
                </label>
                <textarea
                  id="evidence-why"
                  rows={2}
                  value={draft.whyItMattered}
                  onChange={(e) => updateDraft("whyItMattered", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="evidence-proves">
                  What does this prove?
                </label>
                <textarea
                  id="evidence-proves"
                  rows={2}
                  value={draft.whatThisProves}
                  onChange={(e) => updateDraft("whatThisProves", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <GrowthAttachmentsField
                attachments={draft.attachments}
                onAttachmentsChange={(next) => updateDraft("attachments", next)}
              />

              <button
                type="button"
                onClick={handleSave}
                disabled={!draft.whatHappened.trim()}
                className="rounded-full bg-[#2f261f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3d342c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save evidence
              </button>
            </div>
          </div>
        )}
      </div>

      {attachEntry ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#2f261f]">Attach proof</h3>
            <button
              type="button"
              onClick={() => setAttachEntryId(null)}
              className="text-xs font-semibold text-[#9a8f82]"
            >
              Done
            </button>
          </div>
          <p className="mt-1 text-xs text-[#6f6259] truncate">{attachEntry.whatHappened}</p>
          <div className="mt-3">
            <GrowthAttachmentsField
              attachments={attachEntry.attachments}
              onAttachmentsChange={(next) => {
                updateEvidenceEntry(attachEntry.id, { attachments: next });
                reload();
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <h3 className="text-sm font-bold text-[#2f261f]">Your evidence</h3>
        <p className="mt-1 text-xs text-[#6f6259]">
          Attach screenshots, certificates, and documents to each entry.
        </p>
        {visibleEntries.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[#e7d9c8] bg-[#faf7f2]/50 px-4 py-6 text-center text-sm text-[#6f6259]">
            No evidence for this period — add an entry or check Growth Inbox.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {visibleEntries.map((entry) => (
              <li key={entry.id}>
                <EvidenceCard
                  entry={entry}
                  expanded={expandedId === entry.id}
                  editing={editingId === entry.id}
                  editDraft={editDraft}
                  onToggle={() =>
                    setExpandedId((id) => (id === entry.id ? null : entry.id))
                  }
                  onEdit={() => startEdit(entry)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={saveEdit}
                  onEditDraftChange={setEditDraft}
                  onDelete={() => handleDelete(entry.id)}
                  onAttach={() => {
                    setAttachEntryId(entry.id);
                    setExpandedId(entry.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
