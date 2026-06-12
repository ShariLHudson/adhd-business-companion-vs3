"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { mergeWorkspaces } from "./dbMapping";
import {
  loadFounderWorkspace,
  removeFounderWorkspaceItem,
  saveFounderWorkspace,
  setFounderWorkspaceItemStatus,
  upsertFounderWorkspaceItem,
  type FounderWorkspaceItemInput,
} from "./store";
import {
  enqueueSyncOp,
  loadSyncQueue,
  saveSyncQueue,
  type FounderSyncOp,
} from "./syncQueue";
import type {
  FounderWorkspaceData,
  FounderWorkspaceItem,
  FounderWorkspaceItemKind,
  FounderWorkspaceItemStatus,
} from "./types";

export type FounderSyncStatus =
  | "loading"
  | "syncing"
  | "saved"
  | "offline"
  | "error";

async function pushOp(op: FounderSyncOp): Promise<boolean> {
  if (op.type === "upsert") {
    const res = await fetch("/api/founder/workspace/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item: op.item,
        previousKind: op.previousKind,
      }),
    });
    return res.ok;
  }
  const params = new URLSearchParams({ kind: op.kind, id: op.id });
  const res = await fetch(`/api/founder/workspace/items?${params}`, {
    method: "DELETE",
  });
  return res.ok;
}

function itemFromUpsert(
  data: FounderWorkspaceData,
  input: FounderWorkspaceItemInput,
  previousKind?: FounderWorkspaceItemKind,
): FounderWorkspaceItem | null {
  const next = upsertFounderWorkspaceItem(data, input, previousKind);
  const list =
    input.kind === "project"
      ? next.projects
      : input.kind === "experiment"
        ? next.experiments
        : next.notes;
  if (input.id) return list.find((i) => i.id === input.id) ?? null;
  return list[0] ?? null;
}

export function useFounderWorkspaceSync() {
  const [data, setData] = useState<FounderWorkspaceData | null>(null);
  const [syncStatus, setSyncStatus] = useState<FounderSyncStatus>("loading");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const flushing = useRef(false);
  const backendEnabled = useRef(false);

  const applyLocal = useCallback((next: FounderWorkspaceData) => {
    setData(next);
    saveFounderWorkspace(next);
  }, []);

  const flushQueue = useCallback(async (): Promise<boolean> => {
    if (flushing.current || !backendEnabled.current) return true;
    const queue = loadSyncQueue();
    if (queue.length === 0) return true;

    flushing.current = true;
    setSyncStatus("syncing");
    const remaining: FounderSyncOp[] = [];
    let hadFailure = false;

    for (const op of queue) {
      try {
        const ok = await pushOp(op);
        if (!ok) {
          remaining.push(op);
          hadFailure = true;
        }
      } catch {
        remaining.push(op);
        hadFailure = true;
      }
    }

    saveSyncQueue(remaining);
    flushing.current = false;

    if (hadFailure) {
      setSyncStatus("offline");
      setSyncMessage("Saved locally — will sync when back online.");
      return false;
    }
    if (remaining.length === 0) {
      setSyncStatus("saved");
      setSyncMessage(null);
    }
    return !hadFailure;
  }, []);

  const syncItem = useCallback(
    async (
      item: FounderWorkspaceItem,
      previousKind?: FounderWorkspaceItemKind,
    ) => {
      if (!backendEnabled.current) {
        enqueueSyncOp({ type: "upsert", item, previousKind });
        setSyncStatus("offline");
        setSyncMessage("Saved locally — database not available.");
        return;
      }
      setSyncStatus("syncing");
      try {
        const ok = await pushOp({ type: "upsert", item, previousKind });
        if (!ok) throw new Error("save failed");
        await flushQueue();
        setSyncStatus("saved");
        setSyncMessage(null);
      } catch {
        enqueueSyncOp({ type: "upsert", item, previousKind });
        setSyncStatus("offline");
        setSyncMessage("Saved locally — will sync when back online.");
      }
    },
    [flushQueue],
  );

  const syncDelete = useCallback(
    async (kind: FounderWorkspaceItemKind, id: string) => {
      if (!backendEnabled.current) {
        enqueueSyncOp({ type: "delete", kind, id });
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("syncing");
      try {
        const ok = await pushOp({ type: "delete", kind, id });
        if (!ok) throw new Error("delete failed");
        await flushQueue();
        setSyncStatus("saved");
      } catch {
        enqueueSyncOp({ type: "delete", kind, id });
        setSyncStatus("offline");
        setSyncMessage("Deleted locally — will sync when back online.");
      }
    },
    [flushQueue],
  );

  useEffect(() => {
    let cancelled = false;
    const local = loadFounderWorkspace();
    setData(local);

    (async () => {
      try {
        const res = await fetch("/api/founder/workspace", { cache: "no-store" });
        if (cancelled) return;

        if (res.status === 503) {
          backendEnabled.current = false;
          setSyncStatus("offline");
          setSyncMessage("Using local copy — Supabase not configured.");
          return;
        }

        if (!res.ok) {
          backendEnabled.current = false;
          setSyncStatus("offline");
          setSyncMessage("Using local copy — could not reach database.");
          return;
        }

        const json = (await res.json()) as {
          configured?: boolean;
          data?: FounderWorkspaceData | null;
        };
        backendEnabled.current = Boolean(json.configured);
        const remote = json.data ?? {
          projects: [],
          experiments: [],
          notes: [],
        };
        const merged = mergeWorkspaces(local, remote);
        applyLocal(merged);
        setSyncStatus("syncing");

        const localOnlyOps: FounderSyncOp[] = [];
        for (const kind of ["project", "experiment", "note"] as const) {
          const list =
            kind === "project"
              ? merged.projects
              : kind === "experiment"
                ? merged.experiments
                : merged.notes;
          for (const item of list) {
            const remoteList =
              kind === "project"
                ? remote.projects
                : kind === "experiment"
                  ? remote.experiments
                  : remote.notes;
            const onRemote = remoteList.find((r) => r.id === item.id);
            if (!onRemote || item.updatedAt > onRemote.updatedAt) {
              localOnlyOps.push({ type: "upsert", item });
            }
          }
        }

        const queue = [...loadSyncQueue(), ...localOnlyOps];
        saveSyncQueue(queue);
        await flushQueue();
        if (!cancelled) {
          setSyncStatus(loadSyncQueue().length > 0 ? "offline" : "saved");
        }
      } catch {
        if (!cancelled) {
          backendEnabled.current = false;
          setSyncStatus("offline");
          setSyncMessage("Using local copy — network error.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyLocal, flushQueue]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (loadSyncQueue().length > 0) {
        void flushQueue();
      }
    }, 12_000);
    return () => window.clearInterval(timer);
  }, [flushQueue]);

  useEffect(() => {
    function onOnline() {
      void flushQueue();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueue]);

  const persistUpsert = useCallback(
    (
      input: FounderWorkspaceItemInput,
      previousKind?: FounderWorkspaceItemKind,
    ) => {
      if (!data) return;
      const next = upsertFounderWorkspaceItem(data, input, previousKind);
      applyLocal(next);
      const item = itemFromUpsert(data, input, previousKind);
      if (item) void syncItem(item, previousKind);
    },
    [applyLocal, data, syncItem],
  );

  const persistStatus = useCallback(
    (
      kind: FounderWorkspaceItemKind,
      id: string,
      status: FounderWorkspaceItemStatus,
    ) => {
      if (!data) return;
      const next = setFounderWorkspaceItemStatus(data, kind, id, status);
      applyLocal(next);
      const list =
        kind === "project"
          ? next.projects
          : kind === "experiment"
            ? next.experiments
            : next.notes;
      const item = list.find((i) => i.id === id);
      if (item) void syncItem(item);
    },
    [applyLocal, data, syncItem],
  );

  const persistRemove = useCallback(
    (kind: FounderWorkspaceItemKind, id: string) => {
      if (!data) return;
      const next = removeFounderWorkspaceItem(data, kind, id);
      applyLocal(next);
      void syncDelete(kind, id);
    },
    [applyLocal, data, syncDelete],
  );

  return {
    data,
    syncStatus,
    syncMessage,
    persistUpsert,
    persistStatus,
    persistRemove,
    retrySync: flushQueue,
  };
}
