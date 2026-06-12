// Private founder workspace persistence (localStorage — founder device only).

import type {
  FounderWorkspaceData,
  FounderWorkspaceItem,
  FounderWorkspaceItemKind,
  FounderWorkspaceItemStatus,
  FounderWorkspaceSection,
} from "./types";

const STORAGE_KEY = "founder-workspace-private-v1";

function newId(): string {
  return `fw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyData(): FounderWorkspaceData {
  return { projects: [], experiments: [], notes: [] };
}

function keyFor(kind: FounderWorkspaceItemKind): keyof FounderWorkspaceData {
  if (kind === "project") return "projects";
  if (kind === "experiment") return "experiments";
  return "notes";
}

function normalizeItem(raw: Partial<FounderWorkspaceItem>): FounderWorkspaceItem | null {
  if (!raw.id || !raw.kind) return null;
  const kind = raw.kind;
  if (kind !== "project" && kind !== "experiment" && kind !== "note") return null;
  const status = raw.status ?? "new";
  const validStatus =
    status === "new" || status === "active" || status === "parked" || status === "done"
      ? status
      : "new";
  const now = new Date().toISOString();
  return {
    id: raw.id,
    kind,
    title: typeof raw.title === "string" ? raw.title : `Untitled ${kind}`,
    description: typeof raw.description === "string" ? raw.description : "",
    status: validStatus,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

function normalizeList(list: unknown): FounderWorkspaceItem[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => normalizeItem(item as Partial<FounderWorkspaceItem>))
    .filter((item): item is FounderWorkspaceItem => item !== null);
}

export function loadFounderWorkspace(): FounderWorkspaceData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as FounderWorkspaceData;
    return {
      projects: normalizeList(parsed.projects),
      experiments: normalizeList(parsed.experiments),
      notes: normalizeList(parsed.notes),
    };
  } catch {
    return emptyData();
  }
}

export function saveFounderWorkspace(data: FounderWorkspaceData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

export type FounderWorkspaceItemInput = {
  id?: string;
  kind: FounderWorkspaceItemKind;
  title: string;
  description: string;
  status: FounderWorkspaceItemStatus;
};

/** Create or update an item; moves between sections when kind changes. */
export function upsertFounderWorkspaceItem(
  data: FounderWorkspaceData,
  input: FounderWorkspaceItemInput,
  previousKind?: FounderWorkspaceItemKind,
): FounderWorkspaceData {
  const now = new Date().toISOString();
  const title = input.title.trim() || `Untitled ${input.kind}`;
  const description = input.description.trim();

  if (input.id) {
    const fromKind = previousKind ?? input.kind;
    const fromKey = keyFor(fromKind);
    const existing = data[fromKey].find((item) => item.id === input.id);
    if (!existing) return data;

    const updated: FounderWorkspaceItem = {
      ...existing,
      kind: input.kind,
      title,
      description,
      status: input.status,
      updatedAt: now,
    };

    let next: FounderWorkspaceData = {
      ...data,
      [fromKey]: data[fromKey].filter((item) => item.id !== input.id),
    };
    const toKey = keyFor(input.kind);
    next = { ...next, [toKey]: [updated, ...next[toKey]] };
    return next;
  }

  const item: FounderWorkspaceItem = {
    id: newId(),
    kind: input.kind,
    title,
    description,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
  const k = keyFor(input.kind);
  return { ...data, [k]: [item, ...data[k]] };
}

export function setFounderWorkspaceItemStatus(
  data: FounderWorkspaceData,
  kind: FounderWorkspaceItemKind,
  id: string,
  status: FounderWorkspaceItemStatus,
): FounderWorkspaceData {
  const k = keyFor(kind);
  const now = new Date().toISOString();
  return {
    ...data,
    [k]: data[k].map((item) =>
      item.id === id ? { ...item, status, updatedAt: now } : item,
    ),
  };
}

export function removeFounderWorkspaceItem(
  data: FounderWorkspaceData,
  kind: FounderWorkspaceItemKind,
  id: string,
): FounderWorkspaceData {
  const k = keyFor(kind);
  return { ...data, [k]: data[k].filter((item) => item.id !== id) };
}

export function itemsForSection(
  data: FounderWorkspaceData,
  section: FounderWorkspaceSection,
): FounderWorkspaceItem[] {
  return data[keyFor(section)];
}

export function exportItemText(item: FounderWorkspaceItem): string {
  return [
    `# ${item.title}`,
    `Type: ${item.kind}`,
    `Status: ${item.status}`,
    `Created: ${item.createdAt}`,
    `Updated: ${item.updatedAt}`,
    "",
    item.description || "(no description)",
  ].join("\n");
}
