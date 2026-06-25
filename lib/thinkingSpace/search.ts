/**
 * One search field — thoughts, collections, people, projects, reminders, tags.
 */

import { getProjects, type BrainDumpEntry } from "@/lib/companionStore";
import { getThoughtCollections } from "./collections";
import { formatThoughtReminder } from "./thoughtCard";
import { getActiveCollectionId } from "./thoughtCollectionAuthority";
import { getThinkingSpaceThoughts } from "./queries";

function searchableStrings(entry: BrainDumpEntry): string[] {
  const values: string[] = [entry.text];
  if (entry.title) values.push(entry.title);
  if (entry.category) values.push(entry.category);
  if (entry.topic) values.push(entry.topic);
  if (entry.contextType) values.push(entry.contextType);
  if (entry.actionType) values.push(entry.actionType);
  if (entry.schedulingIntent) values.push(entry.schedulingIntent);
  if (entry.connectedPerson) values.push(entry.connectedPerson);
  if (entry.suggestedCollection) values.push(entry.suggestedCollection);
  if (entry.reminderAt) {
    values.push(entry.reminderAt);
    values.push(formatThoughtReminder(entry.reminderAt));
    try {
      const d = new Date(entry.reminderAt);
      values.push(d.toLocaleDateString());
      values.push(d.toISOString().slice(0, 10));
    } catch {
      /* ignore */
    }
  }
  if (entry.createdAt) {
    try {
      values.push(new Date(entry.createdAt).toLocaleDateString());
      values.push(entry.createdAt.slice(0, 10));
    } catch {
      /* ignore */
    }
  }
  if (entry.projectId) {
    const project = getProjects().find((p) => p.id === entry.projectId);
    if (project?.name) values.push(project.name);
    values.push(entry.projectId);
  }
  return values.map((v) => v.toLowerCase());
}

export function searchThinkingSpaceThoughts(
  query: string,
  thoughts = getThinkingSpaceThoughts(),
): BrainDumpEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const collectionLabels = new Map(
    getThoughtCollections().map((c) => [c.id, c.label.toLowerCase()]),
  );

  return thoughts.filter((entry) => {
    for (const value of searchableStrings(entry)) {
      if (value.includes(q)) return true;
    }
    if (getActiveCollectionId(entry)) {
      const col = getThoughtCollections().find(
        (c) => c.id === getActiveCollectionId(entry),
      );
      if (col?.label.toLowerCase().includes(q)) return true;
    }
    for (const id of entry.collectionIds ?? []) {
      const label = collectionLabels.get(id);
      if (label?.includes(q)) return true;
    }
    return false;
  });
}
