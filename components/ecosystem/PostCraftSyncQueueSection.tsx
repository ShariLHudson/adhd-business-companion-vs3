"use client";

import { useCallback, useEffect, useState } from "react";

import type { PostCraftSyncQueueView } from "@/lib/ecosystem/postcraftSyncQueue";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ActionChip, DASHBOARD, DashboardSection } from "./ecosystemDashboardUi";

type PostCraftSyncQueueSectionProps = {
  accessToken: string;
  refreshToken?: number;
};

function statusClass(status: string): string {
  if (status === "sent") return "bg-[#1e4f4f]/12 text-[#1e4f4f]";
  if (status === "failed") return "bg-[#a85c4a]/12 text-[#a85c4a]";
  if (status === "ready") return "bg-[#f5edd4] text-[#7a5c00]";
  return "bg-[#ebe4d9] text-[#6b635a]";
}

export function PostCraftSyncQueueSection({
  accessToken,
  refreshToken = 0,
}: PostCraftSyncQueueSectionProps) {
  const [queue, setQueue] = useState<PostCraftSyncQueueView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ecosystem/postcraft/sync", {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
      });
      if (!res.ok) throw new Error("Could not load sync queue.");
      setQueue((await res.json()) as PostCraftSyncQueueView);
    } catch {
      setQueue({ connected: false, items: [] });
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  async function runAction(draftId: string, action: string) {
    setBusyId(draftId);
    setFlash(null);
    try {
      const res = await fetch("/api/ecosystem/postcraft/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        body: JSON.stringify({ draftId, action }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        connected?: boolean;
        queue?: PostCraftSyncQueueView;
      };
      if (data.queue) setQueue(data.queue);
      else await load();

      if (data.error) setFlash(data.error);
      else if (action === "send" && data.connected === false) setFlash("PostCraft is not connected yet.");
      else setFlash(action === "send" ? "Send complete" : `Marked ${action.replace("_", " ")}`);
    } catch {
      setFlash("Action failed.");
    } finally {
      setBusyId(null);
      window.setTimeout(() => setFlash(null), 2500);
    }
  }

  return (
    <DashboardSection
      id="postcraft-sync-queue"
      title="PostCraft Sync Queue"
      subtitle="Approved drafts — manual send only, no auto-publish"
      accent="gold"
    >
      {flash ? (
        <p className={`mb-3 rounded-lg ${DASHBOARD.goldBg} px-3 py-2 text-xs ${DASHBOARD.gold}`}>
          {flash}
        </p>
      ) : null}

      {!queue?.connected ? (
        <p className={`mb-3 rounded-xl border ${DASHBOARD.goldBorder} ${DASHBOARD.goldBg} px-3 py-2 text-sm ${DASHBOARD.muted}`}>
          PostCraft is not connected yet.
        </p>
      ) : null}

      {loading ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Loading sync queue…</p>
      ) : !queue?.items.length ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          No approved drafts in queue. Approve a content draft to add it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {queue.items.map((item) => (
            <li
              key={item.draftId}
              className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                    {item.topic}
                  </p>
                  <p className={`mt-0.5 text-sm font-medium ${DASHBOARD.body}`}>
                    {item.title}
                  </p>
                  <p className={`mt-1 text-xs ${DASHBOARD.muted}`}>
                    Asset type: {item.assetLabel} ({item.assetType})
                  </p>
                  <p className={`mt-1 text-[10px] ${DASHBOARD.muted}`}>
                    Approved{" "}
                    {item.approvedAt
                      ? new Date(item.approvedAt).toLocaleDateString()
                      : "—"}
                    {item.lastSyncAttempt
                      ? ` · Last sync ${new Date(item.lastSyncAttempt).toLocaleString()}`
                      : ""}
                  </p>
                  {item.error ? (
                    <p className="mt-1 text-xs text-[#a85c4a]">
                      <span className="font-semibold">Error:</span> {item.error}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusClass(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <ActionChip
                  label="Send to PostCraft"
                  variant="teal"
                  disabled={busyId === item.draftId}
                  onClick={() => void runAction(item.draftId, "send")}
                />
                <ActionChip
                  label="Mark Sent"
                  disabled={busyId === item.draftId}
                  onClick={() => void runAction(item.draftId, "mark_sent")}
                />
                <ActionChip
                  label="Retry"
                  disabled={busyId === item.draftId || item.status !== "failed"}
                  onClick={() => void runAction(item.draftId, "retry")}
                />
                <ActionChip
                  label="Skip"
                  disabled={busyId === item.draftId}
                  onClick={() => void runAction(item.draftId, "skip")}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
