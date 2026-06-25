/**
 * Living thought operations — every action the user can take on a thought.
 */

import {
  addBrainDumps,
  deleteBrainDump,
  getBrainDumps,
  updateBrainDump,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { splitCaptureInput } from "@/lib/clearMyMindCapture";
import {
  createThoughtCollection,
  mergeThoughtCollections,
  renameThoughtCollection,
} from "./collections";
import {
  acceptSuggestedCollectionForThought,
  collectionLabelFromAiCategory,
  getActiveCollectionId,
  moveThoughtToCollection,
  setThoughtCollectionSuggestion,
} from "./thoughtCollectionAuthority";

export function editThoughtText(id: string, text: string): BrainDumpEntry | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  updateBrainDump(id, { text: trimmed });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function archiveThought(id: string): BrainDumpEntry | null {
  updateBrainDump(id, {
    archived: true,
    archivedAt: new Date().toISOString(),
  });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function restoreThought(id: string): BrainDumpEntry | null {
  updateBrainDump(id, { archived: false, archivedAt: undefined });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function pinThought(id: string, pinned: boolean): BrainDumpEntry | null {
  updateBrainDump(id, { pinned });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function markThoughtHandled(id: string): BrainDumpEntry | null {
  updateBrainDump(id, { done: true });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function setThoughtReminder(
  id: string,
  reminderAt: string | null,
): BrainDumpEntry | null {
  updateBrainDump(id, {
    reminderAt: reminderAt ?? undefined,
    schedulingIntent: reminderAt ? "later" : undefined,
  });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function connectThoughtToProject(
  id: string,
  projectId: string | null,
): BrainDumpEntry | null {
  updateBrainDump(id, { projectId: projectId ?? undefined });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function connectThoughtToPerson(
  id: string,
  person: string | null,
): BrainDumpEntry | null {
  updateBrainDump(id, {
    connectedPerson: person?.trim() || undefined,
  });
  return getBrainDumps().find((e) => e.id === id) ?? null;
}

export function addThoughtToCollection(
  thoughtId: string,
  collectionId: string,
): BrainDumpEntry | null {
  return moveThoughtToCollection(thoughtId, collectionId);
}

export function removeThoughtFromCollection(
  thoughtId: string,
  _collectionId: string,
): BrainDumpEntry | null {
  return moveThoughtToCollection(thoughtId, null);
}

export function acceptSuggestedCollection(
  thoughtId: string,
): BrainDumpEntry | null {
  return acceptSuggestedCollectionForThought(thoughtId);
}

export function setThoughtCategory(
  thoughtId: string,
  category: string,
): BrainDumpEntry | null {
  updateBrainDump(thoughtId, { category });
  const col = createThoughtCollection({
    label: category,
    userCreated: true,
  });
  return moveThoughtToCollection(thoughtId, col.id);
}

export function renameThoughtCollectionForThought(
  collectionId: string,
  newLabel: string,
): void {
  renameThoughtCollection(collectionId, newLabel);
}

export function mergeThoughts(
  targetId: string,
  sourceId: string,
): BrainDumpEntry | null {
  const target = getBrainDumps().find((e) => e.id === targetId);
  const source = getBrainDumps().find((e) => e.id === sourceId);
  if (!target || !source || targetId === sourceId) return null;

  const mergedText = `${target.text.trim()}\n${source.text.trim()}`.trim();
  const activeId = getActiveCollectionId(target) ?? getActiveCollectionId(source);
  updateBrainDump(targetId, {
    text: mergedText,
    collectionId: activeId,
    collectionIds: undefined,
  });
  deleteBrainDump(sourceId);
  return getBrainDumps().find((e) => e.id === targetId) ?? null;
}

export function splitThoughtIntoParts(
  id: string,
  parts: string[],
): BrainDumpEntry[] {
  const entry = getBrainDumps().find((e) => e.id === id);
  if (!entry || !parts.length) return [];

  const trimmed = parts.map((p) => p.trim()).filter(Boolean);
  if (trimmed.length <= 1) return [entry];

  const parentCollectionId = getActiveCollectionId(entry);

  updateBrainDump(id, { text: trimmed[0]! });
  const created = addBrainDumps(trimmed.slice(1), {
    captureSessionId: entry.captureSessionId,
  });
  const newOnes = created.filter(
    (e) => e.captureSessionId === entry.captureSessionId && e.id !== id,
  );
  for (const thought of newOnes) {
    if (parentCollectionId) {
      updateBrainDump(thought.id, { collectionId: parentCollectionId });
    }
  }
  return [
    getBrainDumps().find((e) => e.id === id)!,
    ...getBrainDumps().filter((e) =>
      newOnes.some((n) => n.id === e.id),
    ),
  ];
}

export function splitThoughtByLines(id: string): BrainDumpEntry[] {
  const entry = getBrainDumps().find((e) => e.id === id);
  if (!entry) return [];
  const parts = splitCaptureInput(entry.text);
  if (parts.length <= 1) return [entry];
  return splitThoughtIntoParts(id, parts);
}

export function suggestCollectionsForThoughts(
  entries: BrainDumpEntry[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of entries) {
    const label = collectionLabelFromAiCategory(entry.category, entry.topic);
    if (label) map.set(entry.id, [label]);
  }
  return map;
}

export function applyAiCollectionSuggestions(
  entries: BrainDumpEntry[],
  clusterLabels: string[],
): void {
  for (const entry of entries) {
    if (getActiveCollectionId(entry)) continue;
    const label =
      collectionLabelFromAiCategory(entry.category, entry.topic) ??
      clusterLabels.find((l) =>
        entry.text.toLowerCase().includes(l.toLowerCase().slice(0, 8)),
      );
    if (label) {
      setThoughtCollectionSuggestion(entry.id, label);
    }
  }
}

export function acceptAllSuggestedCollections(
  thoughtIds: string[],
): void {
  for (const id of thoughtIds) {
    acceptSuggestedCollection(id);
  }
}

export function acceptClusterAsCollection(
  label: string,
  thoughtIds: string[],
): string {
  const col = createThoughtCollection({
    label,
    userCreated: false,
    suggestedByAi: true,
  });
  for (const id of thoughtIds) {
    moveThoughtToCollection(id, col.id);
  }
  return col.id;
}

export { mergeThoughtCollections };
