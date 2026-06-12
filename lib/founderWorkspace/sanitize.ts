import type {
  FounderWorkspaceItem,
  FounderWorkspaceItemKind,
  FounderWorkspaceItemStatus,
} from "./types";

const MAX_TITLE = 200;
const MAX_BODY = 20_000;

const VALID_KINDS = new Set<FounderWorkspaceItemKind>([
  "project",
  "experiment",
  "note",
]);

const VALID_STATUSES = new Set<FounderWorkspaceItemStatus>([
  "new",
  "active",
  "parked",
  "done",
]);

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\0/g, "")
    .trim()
    .slice(0, max);
}

export function sanitizeKind(value: unknown): FounderWorkspaceItemKind | null {
  if (typeof value !== "string") return null;
  const k = value.trim().toLowerCase() as FounderWorkspaceItemKind;
  return VALID_KINDS.has(k) ? k : null;
}

export function sanitizeStatus(value: unknown): FounderWorkspaceItemStatus {
  if (typeof value !== "string") return "new";
  const s = value.trim().toLowerCase() as FounderWorkspaceItemStatus;
  return VALID_STATUSES.has(s) ? s : "new";
}

export function sanitizeWorkspaceItemInput(
  raw: Partial<FounderWorkspaceItem>,
): FounderWorkspaceItem | null {
  const kind = sanitizeKind(raw.kind);
  if (!kind) return null;
  const id = cleanText(raw.id, 80);
  if (!id) return null;
  const now = new Date().toISOString();
  return {
    id,
    kind,
    title: cleanText(raw.title, MAX_TITLE) || `Untitled ${kind}`,
    description: cleanText(raw.description, MAX_BODY),
    status: sanitizeStatus(raw.status),
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt
        ? raw.createdAt
        : now,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt
        ? raw.updatedAt
        : now,
  };
}

export function sanitizeId(value: unknown): string | null {
  const id = cleanText(value, 80);
  return id || null;
}
