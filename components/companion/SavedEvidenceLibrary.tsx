"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import {
  deleteEvidenceEntryDurable,
  EVIDENCE_BANK_UPDATED_EVENT,
  EVIDENCE_CATEGORIES,
  filterEvidenceEntries,
  getEvidenceEntries,
  isEvidenceFavorite,
  toggleEvidenceFavorite,
  updateEvidenceEntryDurable,
  type EvidenceCategory,
  type EvidenceEntry,
  type EvidenceEntryInput,
} from "@/lib/evidenceBankStore";
import { isEvidenceVaultDurableEnabled } from "@/lib/durableRecords/flags";
import { loadEvidenceVaultMerged } from "@/lib/durableRecords/domains/evidenceVaultRead";
import { resolveEvidenceVaultClaim } from "@/lib/durableRecords/evidenceVaultClaims";
import type { DurableRecordResult } from "@/lib/durableRecords";

const ALL_CATEGORIES = "All";

type EditFields = Pick<
  EvidenceEntryInput,
  "whatHappened" | "whoBenefited" | "whyItMattered" | "whatThisProves"
>;

function editFieldsFromEntry(entry: EvidenceEntry): EditFields {
  return {
    whatHappened: entry.whatHappened,
    whoBenefited: entry.whoBenefited,
    whyItMattered: entry.whyItMattered,
    whatThisProves: entry.whatThisProves,
  };
}

/**
 * Saved Evidence — durable-first list + filter + reopen/edit/delete for the
 * Evidence Vault. Modeled on SavedWorkLibrary.tsx: reuses the existing
 * filterEvidenceEntries logic (no new filter design), and every write goes
 * through the durable wrappers so the interface never claims "saved" until a
 * verified receipt comes back. Renders inside EvidenceVaultWorkspaceModal, so
 * it carries no back-button/panel chrome of its own.
 */
export function SavedEvidenceLibrary() {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [category, setCategory] = useState<EvidenceCategory | typeof ALL_CATEGORIES>(
    ALL_CATEGORIES,
  );
  const [query, setQuery] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditFields | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EvidenceEntry | null>(null);
  const [opStatus, setOpStatus] = useState<
    null | { message: string; retryable: boolean; retry?: () => void }
  >(null);

  function refresh() {
    if (isEvidenceVaultDurableEnabled()) {
      void loadEvidenceVaultMerged().then(setEntries);
    } else {
      setEntries(getEvidenceEntries());
    }
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
  }, []);

  function applyDurableOutcome(
    receipt: DurableRecordResult<EvidenceEntry>,
    action: "update" | "delete",
    retry?: () => void,
  ) {
    const claim = resolveEvidenceVaultClaim(receipt, action);
    setOpStatus(
      claim.status === "durably_saved"
        ? null
        : { message: claim.message, retryable: claim.retryable, retry },
    );
    refresh();
  }

  const visible = filterEvidenceEntries(entries, {
    category: category === ALL_CATEGORIES ? undefined : category,
    query: query.trim() || undefined,
  });

  const viewing = viewId ? entries.find((e) => e.id === viewId) ?? null : null;

  function openEntry(id: string) {
    setViewId(id);
    setEditing(null);
  }

  function beginEdit(entry: EvidenceEntry) {
    setEditing(editFieldsFromEntry(entry));
  }

  function confirmEdit() {
    if (!viewing || !editing) return;
    const id = viewing.id;
    const patch = editing;
    setEditing(null);
    const applyEdit = () =>
      void updateEvidenceEntryDurable(id, patch).then((res) =>
        applyDurableOutcome(res.receipt, "update", applyEdit),
      );
    applyEdit();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    if (viewId === id) setViewId(null);
    setDeleteTarget(null);
    const applyDelete = () =>
      void deleteEvidenceEntryDurable(id).then((r) =>
        applyDurableOutcome(r, "delete", applyDelete),
      );
    applyDelete();
  }

  function handleFavorite(id: string) {
    toggleEvidenceFavorite(id);
    refresh();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this discovery?"
        message="This removes it from your Evidence Vault, on every device."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {opStatus && (
        <div className="flex items-center gap-3 rounded-lg border border-[#e2d3bf] bg-[#fbf5ea] px-3 py-2">
          <p className="text-sm font-medium text-[#8a5a2b]">{opStatus.message}</p>
          {opStatus.retryable && opStatus.retry && (
            <button
              type="button"
              onClick={() => {
                const retry = opStatus.retry;
                setOpStatus(null);
                retry?.();
              }}
              className="text-sm font-semibold text-[#1e4f4f] underline"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!viewing ? (
        <>
          <div className="flex flex-wrap gap-2">
            <label className="flex-1 min-w-[10rem]">
              <span className="sr-only">Category</span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as EvidenceCategory | typeof ALL_CATEGORIES)
                }
                className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
              >
                <option value={ALL_CATEGORIES}>All categories</option>
                {EVIDENCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search evidence…"
              className="flex-[2] min-w-[12rem] rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
            />
          </div>

          <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="rounded-xl border border-dashed border-[#e7dfd4] p-6 text-center text-sm text-[#6b635a]">
                Nothing matches yet — try a different search or category.
              </li>
            ) : (
              visible.map((entry) => (
                <li key={entry.id}>
                  <div className="flex items-stretch gap-1 rounded-xl border border-[#e7dfd4] bg-white hover:border-[#1e4f4f]/30">
                    <button
                      type="button"
                      onClick={() => openEntry(entry.id)}
                      className="min-w-0 flex-1 px-4 py-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="shrink-0 text-xs font-bold uppercase text-[#6b635a]">
                          {entry.category}
                        </span>
                        <span className="shrink-0 text-xs text-[#9a8f82]">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-[#2d2926]">
                        {entry.whatHappened}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(entry.id);
                      }}
                      aria-pressed={isEvidenceFavorite(entry)}
                      aria-label={
                        isEvidenceFavorite(entry)
                          ? "Remove from favorites"
                          : "Mark as favorite"
                      }
                      className="px-3 py-3 text-lg text-[#c9a24a]"
                    >
                      {isEvidenceFavorite(entry) ? "★" : "☆"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e7dfd4] bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setViewId(null);
                setEditing(null);
              }}
              className="text-sm font-semibold text-[#1e4f4f]"
            >
              ← Back
            </button>
            <div className="flex gap-2">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => beginEdit(viewing)}
                  className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-1.5 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
                >
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setDeleteTarget(viewing)}
                className="rounded-lg border border-[#a85c4a]/40 px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/8"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {viewing.category} · {new Date(viewing.createdAt).toLocaleDateString()}
          </p>

          {editing ? (
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
              <label className="text-sm font-semibold text-[#4b463f]">
                What happened
                <textarea
                  value={editing.whatHappened}
                  onChange={(e) =>
                    setEditing({ ...editing, whatHappened: e.target.value })
                  }
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                />
              </label>
              <label className="text-sm font-semibold text-[#4b463f]">
                Who benefited
                <input
                  value={editing.whoBenefited}
                  onChange={(e) =>
                    setEditing({ ...editing, whoBenefited: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                />
              </label>
              <label className="text-sm font-semibold text-[#4b463f]">
                Why it mattered
                <textarea
                  value={editing.whyItMattered}
                  onChange={(e) =>
                    setEditing({ ...editing, whyItMattered: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                />
              </label>
              <label className="text-sm font-semibold text-[#4b463f]">
                What this proves
                <textarea
                  value={editing.whatThisProves}
                  onChange={(e) =>
                    setEditing({ ...editing, whatThisProves: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#4b463f]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmEdit}
                  className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto text-sm leading-relaxed text-[#2d2926]">
              <p>{viewing.whatHappened}</p>
              {viewing.whoBenefited.trim() ? (
                <p>
                  <span className="font-semibold text-[#6b635a]">Who benefited: </span>
                  {viewing.whoBenefited}
                </p>
              ) : null}
              {viewing.whyItMattered.trim() ? (
                <p>
                  <span className="font-semibold text-[#6b635a]">Why it mattered: </span>
                  {viewing.whyItMattered}
                </p>
              ) : null}
              {viewing.whatThisProves.trim() ? (
                <p>
                  <span className="font-semibold text-[#6b635a]">What this proves: </span>
                  {viewing.whatThisProves}
                </p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
