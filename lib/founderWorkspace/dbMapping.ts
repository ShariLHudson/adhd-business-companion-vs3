import type { FounderWorkspaceData, FounderWorkspaceItem } from "./types";
import { sanitizeStatus } from "./sanitize";

export const NOTE_TITLE_SEPARATOR = "\n---\n";
const STATUS_TAG_PREFIX = "status:";

export type FounderProjectRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type FounderExperimentRow = {
  id: string;
  owner_id: string;
  title: string;
  notes: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type FounderNoteRow = {
  id: string;
  owner_id: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export function projectRowToItem(row: FounderProjectRow): FounderWorkspaceItem {
  return {
    id: row.id,
    kind: "project",
    title: row.title,
    description: row.description,
    status: sanitizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function experimentRowToItem(row: FounderExperimentRow): FounderWorkspaceItem {
  return {
    id: row.id,
    kind: "experiment",
    title: row.title,
    description: row.notes,
    status: sanitizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function noteRowToItem(row: FounderNoteRow): FounderWorkspaceItem {
  const sep = row.content.indexOf(NOTE_TITLE_SEPARATOR);
  let title = row.content;
  let description = "";
  if (sep >= 0) {
    title = row.content.slice(0, sep);
    description = row.content.slice(sep + NOTE_TITLE_SEPARATOR.length);
  }
  const statusTag = (row.tags ?? []).find((t) => t.startsWith(STATUS_TAG_PREFIX));
  const status = statusTag
    ? sanitizeStatus(statusTag.slice(STATUS_TAG_PREFIX.length))
    : "new";
  return {
    id: row.id,
    kind: "note",
    title,
    description,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function itemToProjectRow(
  item: FounderWorkspaceItem,
  ownerId: string,
): FounderProjectRow {
  return {
    id: item.id,
    owner_id: ownerId,
    title: item.title,
    description: item.description,
    type: item.kind,
    status: item.status,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function itemToExperimentRow(
  item: FounderWorkspaceItem,
  ownerId: string,
): FounderExperimentRow {
  return {
    id: item.id,
    owner_id: ownerId,
    title: item.title,
    notes: item.description,
    type: item.kind,
    status: item.status,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function itemToNoteRow(
  item: FounderWorkspaceItem,
  ownerId: string,
): FounderNoteRow {
  const content = item.description
    ? `${item.title}${NOTE_TITLE_SEPARATOR}${item.description}`
    : item.title;
  return {
    id: item.id,
    owner_id: ownerId,
    content,
    tags: [`${STATUS_TAG_PREFIX}${item.status}`],
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function rowsToWorkspaceData(
  projects: FounderProjectRow[],
  experiments: FounderExperimentRow[],
  notes: FounderNoteRow[],
): FounderWorkspaceData {
  return {
    projects: projects.map(projectRowToItem),
    experiments: experiments.map(experimentRowToItem),
    notes: notes.map(noteRowToItem),
  };
}

export function mergeWorkspaces(
  local: FounderWorkspaceData,
  remote: FounderWorkspaceData,
): FounderWorkspaceData {
  function mergeLists(
    a: FounderWorkspaceItem[],
    b: FounderWorkspaceItem[],
  ): FounderWorkspaceItem[] {
    const map = new Map<string, FounderWorkspaceItem>();
    for (const item of [...a, ...b]) {
      const prev = map.get(item.id);
      if (!prev || item.updatedAt >= prev.updatedAt) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values()).sort((x, y) =>
      y.updatedAt.localeCompare(x.updatedAt),
    );
  }
  return {
    projects: mergeLists(local.projects, remote.projects),
    experiments: mergeLists(local.experiments, remote.experiments),
    notes: mergeLists(local.notes, remote.notes),
  };
}
