/**
 * Thought card display — title, preview, and metadata for Companion Boxes™.
 */

import { getProjects, type BrainDumpEntry } from "@/lib/companionStore";
import { getThoughtCollectionById, getThoughtCollections } from "./collections";
import { paletteForColorId, resolveCollectionVisual } from "./collectionColors";
import { UNCATEGORIZED_COLLECTION_ID } from "./collectionSummaries";
import { getActiveCollectionId } from "./thoughtCollectionAuthority";

const TITLE_MAX = 72;
const PREVIEW_MAX = 120;

export function thoughtTitle(entry: BrainDumpEntry): string {
  if (entry.title?.trim()) return entry.title.trim();
  const firstLine = entry.text.split(/\n/)[0]?.trim() ?? "";
  if (firstLine.length <= TITLE_MAX) return firstLine || "Thought";
  return `${firstLine.slice(0, TITLE_MAX - 1)}…`;
}

export function thoughtPreview(entry: BrainDumpEntry): string | null {
  const title = thoughtTitle(entry);
  const body = entry.text.replace(/\s+/g, " ").trim();
  if (!body || body === title) return null;
  if (body.length <= PREVIEW_MAX) return body;
  return `${body.slice(0, PREVIEW_MAX - 1)}…`;
}

export function formatThoughtReminder(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return `Reminder today · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    }
    return `Reminder · ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  } catch {
    return "Reminder set";
  }
}

export function projectNameForThought(entry: BrainDumpEntry): string | null {
  if (!entry.projectId) return null;
  return getProjects().find((p) => p.id === entry.projectId)?.name ?? null;
}

export type ThoughtCardMeta = {
  pinned: boolean;
  archived: boolean;
  hasReminder: boolean;
  reminderLabel: string | null;
  connectedPerson: string | null;
  projectName: string | null;
  hasConnections: boolean;
};

export function thoughtCardMeta(entry: BrainDumpEntry): ThoughtCardMeta {
  const projectName = projectNameForThought(entry);
  const connectedPerson = entry.connectedPerson?.trim() || null;
  return {
    pinned: Boolean(entry.pinned),
    archived: Boolean(entry.archived),
    hasReminder: Boolean(entry.reminderAt),
    reminderLabel: entry.reminderAt
      ? formatThoughtReminder(entry.reminderAt)
      : null,
    connectedPerson,
    projectName,
    hasConnections: Boolean(projectName || connectedPerson),
  };
}

export type CollectionChipVisual = {
  id: string;
  label: string;
  palette: ReturnType<typeof resolveCollectionVisual>["palette"];
};

/** Single primary collection chip — collectionId only; never legacy categories. */
export function primaryCollectionChipForThought(
  entry: BrainDumpEntry,
): CollectionChipVisual | null {
  const id = getActiveCollectionId(entry);
  if (!id) {
    const palette = paletteForColorId("still-finding");
    return {
      id: UNCATEGORIZED_COLLECTION_ID,
      label: "Still finding a home",
      palette,
    };
  }
  const col = getThoughtCollectionById(id);
  if (!col) return null;
  const visual = resolveCollectionVisual(col, getThoughtCollections());
  return {
    id,
    label: col.label,
    palette: visual.palette,
  };
}

/** @deprecated Use primaryCollectionChipForThought */
export function collectionChipsForThought(
  entry: BrainDumpEntry,
): CollectionChipVisual[] {
  const chip = primaryCollectionChipForThought(entry);
  return chip ? [chip] : [];
}
