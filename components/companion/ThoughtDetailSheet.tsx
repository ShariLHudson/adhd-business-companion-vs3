"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getBrainDumps,
  getProjects,
  deleteBrainDump,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import {
  acceptSuggestedCollection,
  archiveThought,
  connectThoughtToPerson,
  connectThoughtToProject,
  editThoughtText,
  markThoughtHandled,
  mergeThoughts,
  pinThought,
  restoreThought,
  setThoughtReminder,
} from "@/lib/thinkingSpace";
import {
  collectionPickerValueForThought,
  CREATE_COLLECTION_OPTION_ID,
  getActiveCollectionId,
  isCollectionSelectionDirty,
  listCollectionPickerOptions,
  saveThoughtCollectionSelection,
} from "@/lib/thinkingSpace/thoughtCollectionAuthority";
import { detectThoughtSplitProposal } from "@/lib/clearMyMindThoughtSplitter";
import { separateThoughtWithUndo } from "@/lib/thinkingSpace/thoughtSeparate";
import { ThoughtSeparateOffer } from "@/components/companion/ThoughtSeparateOffer";
import {
  THOUGHT_ACTION_ARCHIVE,
  THOUGHT_ACTION_DELETE,
  THOUGHT_ACTION_EDIT,
  THOUGHT_ACTION_HANDLED,
  THOUGHT_ACTION_MERGE,
  THOUGHT_ACTION_PERSON,
  THOUGHT_ACTION_PIN,
  THOUGHT_ACTION_PROJECT,
  THOUGHT_ACTION_REMINDER,
  THOUGHT_ACTION_RESTORE,
  THOUGHT_ACTION_SAVE,
  THOUGHT_ACTION_UNPIN,
  THOUGHT_ACTION_COLLECTION,
  THOUGHT_CONNECTED_TO,
  THOUGHT_ARCHIVED_MSG,
  THOUGHT_DELETED_MSG,
  THOUGHT_SAVED,
} from "@/lib/thinkingSpace/copy";
import { thoughtDisplayEmoji } from "@/lib/thinkingSpace/thoughtEmoji";
import { UNCATEGORIZED_COLLECTION_ID } from "@/lib/thinkingSpace/collectionSummaries";

const btnClass =
  "rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-sm font-semibold text-[#3d3630] hover:bg-[#faf7f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

const btnPrimary =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 disabled:cursor-not-allowed disabled:opacity-45";

type Props = {
  entry: BrainDumpEntry;
  allThoughts: BrainDumpEntry[];
  variant?: "modal" | "inline";
  onClose: () => void;
  onChanged: () => void;
  onSeparated?: () => void;
  onDeleted?: () => void;
};

function savedReminderDate(entry: BrainDumpEntry): string {
  return entry.reminderAt?.slice(0, 10) ?? "";
}

export function ThoughtDetailSheet({
  entry,
  allThoughts,
  variant = "inline",
  onClose,
  onChanged,
  onSeparated,
  onDeleted,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text);
  const [status, setStatus] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState("");
  const [draftCollectionId, setDraftCollectionId] = useState(() =>
    collectionPickerValueForThought(entry),
  );
  const [newCollection, setNewCollection] = useState("");
  const [draftPinned, setDraftPinned] = useState(!!entry.pinned);
  const [draftDone, setDraftDone] = useState(!!entry.done);
  const [person, setPerson] = useState(entry.connectedPerson ?? "");
  const [projectId, setProjectId] = useState(entry.projectId ?? "");
  const [reminderDate, setReminderDate] = useState(savedReminderDate(entry));

  const entrySyncKey = [
    entry.id,
    entry.collectionId ?? "",
    entry.text,
    entry.pinned ? "1" : "0",
    entry.done ? "1" : "0",
    entry.reminderAt ?? "",
    entry.projectId ?? "",
    entry.connectedPerson ?? "",
  ].join("|");

  const collectionOptions = useMemo(
    () => listCollectionPickerOptions(),
    [entrySyncKey],
  );
  const projects = useMemo(() => getProjects(), []);
  const emoji = thoughtDisplayEmoji(entry.text);
  const linkedProject = projects.find((p) => p.id === entry.projectId);

  const separateProposal = useMemo(() => {
    if (editing) return null;
    return detectThoughtSplitProposal(entry.text);
  }, [entry.text, editing]);

  useEffect(() => {
    setEditText(entry.text);
    setDraftCollectionId(collectionPickerValueForThought(entry));
    setNewCollection("");
    setDraftPinned(!!entry.pinned);
    setDraftDone(!!entry.done);
    setPerson(entry.connectedPerson ?? "");
    setProjectId(entry.projectId ?? "");
    setReminderDate(savedReminderDate(entry));
    setEditing(false);
  }, [entrySyncKey]);

  const collectionDirty = isCollectionSelectionDirty(
    entry,
    draftCollectionId,
    newCollection,
  );
  const textDirty = editText.trim() !== entry.text.trim();
  const pinDirty = draftPinned !== !!entry.pinned;
  const doneDirty = draftDone !== !!entry.done;
  const reminderDirty = reminderDate !== savedReminderDate(entry);
  const projectDirty = projectId !== (entry.projectId ?? "");
  const personDirty = person !== (entry.connectedPerson ?? "");

  const isDirty =
    textDirty ||
    collectionDirty ||
    pinDirty ||
    doneDirty ||
    reminderDirty ||
    projectDirty ||
    personDirty;

  const canSave =
    isDirty &&
    (draftCollectionId !== CREATE_COLLECTION_OPTION_ID ||
      newCollection.trim().length > 0);

  function flash(msg: string) {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2400);
  }

  function handleSave() {
    const liveEntry = getBrainDumps().find((e) => e.id === entry.id) ?? entry;

    const collectionDirtyNow = isCollectionSelectionDirty(
      liveEntry,
      draftCollectionId,
      newCollection,
    );
    const textDirtyNow = editText.trim() !== liveEntry.text.trim();
    const pinDirtyNow = draftPinned !== !!liveEntry.pinned;
    const doneDirtyNow = draftDone !== !!liveEntry.done;
    const reminderDirtyNow = reminderDate !== savedReminderDate(liveEntry);
    const projectDirtyNow = projectId !== (liveEntry.projectId ?? "");
    const personDirtyNow = person !== (liveEntry.connectedPerson ?? "");

    const isDirtyNow =
      textDirtyNow ||
      collectionDirtyNow ||
      pinDirtyNow ||
      doneDirtyNow ||
      reminderDirtyNow ||
      projectDirtyNow ||
      personDirtyNow;

    const canSaveNow =
      isDirtyNow &&
      (draftCollectionId !== CREATE_COLLECTION_OPTION_ID ||
        newCollection.trim().length > 0);

    if (!canSaveNow) return;

    let changed = false;
    let closeAfterSave = false;

    if (textDirtyNow) {
      const updated = editThoughtText(liveEntry.id, editText);
      if (updated) {
        changed = true;
        setEditing(false);
      }
    }

    if (collectionDirtyNow) {
      const result = saveThoughtCollectionSelection(
        liveEntry,
        draftCollectionId,
        newCollection,
      );
      if (!result.ok) {
        if (result.reason === "missing-name") {
          flash("Name your new collection before saving.");
        } else if (result.reason === "persist-failed") {
          flash("Could not save that collection change. Try again.");
        }
        return;
      }
      changed = true;
      setNewCollection("");
      setDraftCollectionId(collectionPickerValueForThought(result.entry));
    }

    if (pinDirtyNow) {
      pinThought(liveEntry.id, draftPinned);
      changed = true;
    }

    if (doneDirtyNow && draftDone) {
      markThoughtHandled(liveEntry.id);
      changed = true;
      closeAfterSave = true;
    }

    if (reminderDirtyNow) {
      setThoughtReminder(
        liveEntry.id,
        reminderDate ? new Date(reminderDate).toISOString() : null,
      );
      changed = true;
    }

    if (projectDirtyNow) {
      connectThoughtToProject(liveEntry.id, projectId || null);
      changed = true;
    }

    if (personDirtyNow) {
      connectThoughtToPerson(liveEntry.id, person || null);
      changed = true;
    }

    if (!changed) return;

    flash(THOUGHT_SAVED);
    onChanged();
    if (closeAfterSave) onClose();
  }

  function handleDelete() {
    deleteBrainDump(entry.id);
    flash(THOUGHT_DELETED_MSG);
    onDeleted?.();
    onClose();
  }

  function handleArchive() {
    archiveThought(entry.id);
    flash(THOUGHT_ARCHIVED_MSG);
    onClose();
  }

  function handleRestore() {
    restoreThought(entry.id);
    flash(THOUGHT_SAVED);
    onChanged();
  }

  function handleAcceptSuggestion() {
    acceptSuggestedCollection(entry.id);
    flash(THOUGHT_SAVED);
    onChanged();
  }

  function handleMerge() {
    if (!mergeTarget) return;
    mergeThoughts(entry.id, mergeTarget);
    setMergeTarget("");
    flash("Merged.");
    onClose();
  }

  function handleSeparate() {
    if (!separateProposal) return;
    const undo = separateThoughtWithUndo(
      entry.id,
      separateProposal.segments,
    );
    if (!undo) return;
    onSeparated?.();
    onChanged();
    onClose();
  }

  const showCreateCollection =
    draftCollectionId === CREATE_COLLECTION_OPTION_ID;

  return (
    <div
      className={`thought-detail-sheet companion-fade-in overflow-y-auto border border-[#e7dfd4] bg-[#fcfaf7] shadow-2xl ${
        variant === "modal"
          ? "max-h-[min(85vh,36rem)] rounded-2xl"
          : "max-h-[85vh] rounded-t-3xl sm:rounded-2xl"
      }`}
      role="dialog"
      aria-label="Thought details"
      data-testid="thought-detail-sheet"
    >
      <div
        className={`sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#e7dfd4] bg-[#fcfaf7]/95 px-4 py-3 backdrop-blur ${
          variant === "modal" ? "rounded-t-2xl" : "sm:rounded-t-2xl"
        }`}
      >
        <p className="text-sm font-semibold text-[#6b635a]">
          {emoji} Companion Box
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={btnPrimary}
            data-testid="thought-detail-save"
          >
            {THOUGHT_ACTION_SAVE}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-[#6b635a] hover:bg-[#f0ebe3]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {status ? (
          <p
            className="text-sm font-medium text-[#1e4f4f]"
            role="status"
            data-testid="thought-detail-status"
          >
            {status}
          </p>
        ) : null}

        {editing ? (
          <div>
            <label className="sr-only" htmlFor="thought-edit">
              Edit thought
            </label>
            <textarea
              id="thought-edit"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#d4cdc3] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <button
              type="button"
              onClick={() => {
                setEditText(entry.text);
                setEditing(false);
              }}
              className={`${btnClass} mt-2`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-lg leading-relaxed text-[#1f1c19]">{entry.text}</p>
        )}

        {separateProposal ? (
          <ThoughtSeparateOffer
            segments={separateProposal.segments}
            onConfirm={handleSeparate}
          />
        ) : null}

        {entry.suggestedCollection && !getActiveCollectionId(entry) ? (
          <div className="rounded-xl border border-[#c5ddd8] bg-[#f0f8f8] px-3 py-3">
            <p className="text-sm text-[#5a5248]">
              Suggested collection:{" "}
              <strong>{entry.suggestedCollection}</strong>
            </p>
            <button
              type="button"
              onClick={handleAcceptSuggestion}
              className={`${btnPrimary} mt-2`}
            >
              Accept suggestion
            </button>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-semibold text-[#1f1c19]">
            {THOUGHT_ACTION_COLLECTION}
          </p>
          <select
            value={draftCollectionId}
            onChange={(e) => setDraftCollectionId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#1f1c19]"
            aria-label="Primary collection"
            data-testid="thought-collection-select"
          >
            {collectionOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {showCreateCollection ? (
            <input
              type="text"
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="Name your new collection…"
              className="mt-2 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              data-testid="thought-new-collection-input"
            />
          ) : null}
        </div>

        {(linkedProject || entry.connectedPerson?.trim() || entry.reminderAt) &&
        !projectDirty &&
        !personDirty &&
        !reminderDirty ? (
          <div>
            <p className="text-sm font-semibold text-[#1f1c19]">
              {THOUGHT_CONNECTED_TO}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[#5a5248]">
              {linkedProject ? (
                <li>
                  <span className="font-medium text-[#6b635a]">Project:</span>{" "}
                  {linkedProject.name}
                </li>
              ) : null}
              {entry.connectedPerson?.trim() ? (
                <li>
                  <span className="font-medium text-[#6b635a]">Person:</span>{" "}
                  {entry.connectedPerson}
                </li>
              ) : null}
              {entry.reminderAt ? (
                <li>
                  <span className="font-medium text-[#6b635a]">Reminder:</span>{" "}
                  {new Date(entry.reminderAt).toLocaleDateString()}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={btnClass}
          >
            {THOUGHT_ACTION_EDIT}
          </button>
          <button
            type="button"
            onClick={() => setDraftPinned((p) => !p)}
            className={btnClass}
            data-testid="thought-pin-toggle"
          >
            {draftPinned ? THOUGHT_ACTION_UNPIN : THOUGHT_ACTION_PIN}
          </button>
          <button
            type="button"
            onClick={() => setDraftDone(true)}
            disabled={draftDone}
            className={btnClass}
          >
            {THOUGHT_ACTION_HANDLED}
          </button>
          {entry.archived ? (
            <button type="button" onClick={handleRestore} className={btnClass}>
              {THOUGHT_ACTION_RESTORE}
            </button>
          ) : (
            <button type="button" onClick={handleArchive} className={btnClass}>
              {THOUGHT_ACTION_ARCHIVE}
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-[#e8d4d4] bg-white px-3 py-2 text-sm font-semibold text-[#8b4545] hover:bg-[#fdf5f5]"
          >
            {THOUGHT_ACTION_DELETE}
          </button>
        </div>

        <details className="rounded-xl border border-[#e7dfd4] bg-white/80 px-3 py-2">
          <summary className="cursor-pointer text-sm font-semibold text-[#1f1c19]">
            {THOUGHT_ACTION_MERGE} · {THOUGHT_ACTION_REMINDER} ·{" "}
            {THOUGHT_ACTION_PROJECT} · {THOUGHT_ACTION_PERSON}
          </summary>
          <div className="mt-3 space-y-3 pb-2">
            <label className="block text-sm text-[#6b635a]">
              Merge with
              <select
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              >
                <option value="">Choose thought…</option>
                {allThoughts
                  .filter((t) => t.id !== entry.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.text.slice(0, 60)}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleMerge}
                disabled={!mergeTarget}
                className={`${btnClass} mt-2`}
              >
                Merge
              </button>
            </label>
            <label className="block text-sm text-[#6b635a]">
              {THOUGHT_ACTION_REMINDER}
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm text-[#6b635a]">
              {THOUGHT_ACTION_PROJECT}
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-[#6b635a]">
              {THOUGHT_ACTION_PERSON}
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="Name or relationship"
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
              />
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}
