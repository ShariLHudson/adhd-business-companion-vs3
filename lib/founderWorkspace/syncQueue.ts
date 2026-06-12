import type { FounderWorkspaceItem, FounderWorkspaceItemKind } from "./types";

const QUEUE_KEY = "founder-workspace-sync-queue-v1";

export type FounderSyncOp =
  | {
      type: "upsert";
      item: FounderWorkspaceItem;
      previousKind?: FounderWorkspaceItemKind;
    }
  | { type: "delete"; kind: FounderWorkspaceItemKind; id: string };

export function loadSyncQueue(): FounderSyncOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FounderSyncOp[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSyncQueue(ops: FounderSyncOp[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
  } catch {
    /* quota */
  }
}

export function enqueueSyncOp(op: FounderSyncOp): void {
  const queue = loadSyncQueue();
  if (op.type === "upsert") {
    const filtered = queue.filter(
      (q) => !(q.type === "delete" && q.id === op.item.id),
    );
    filtered.push(op);
    saveSyncQueue(filtered);
    return;
  }
  const filtered = queue.filter(
    (q) => !(q.type === "upsert" && q.item.id === op.id),
  );
  filtered.push(op);
  saveSyncQueue(filtered);
}

export function clearSyncQueue(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* ignore */
  }
}
