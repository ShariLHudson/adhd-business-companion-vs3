"use client";

import { useCallback, useEffect, useState } from "react";

import {
  CONTENT_QUEUE_STATUSES,
  loadContentQueue,
  removeQueueItem,
  updateQueueItemStatus,
  type ContentQueueItem,
  type ContentQueueStatus,
} from "@/lib/ecosystem/founderDashboardLocalState";

import { DASHBOARD, DashboardSection } from "./ecosystemDashboardUi";

type ContentQueueSectionProps = {
  refreshToken?: number;
};

function statusStyle(status: ContentQueueStatus): string {
  if (status === "approved" || status === "published") {
    return "bg-[#1e4f4f]/12 text-[#1e4f4f]";
  }
  if (status === "drafting" || status === "scheduled") {
    return "bg-[#f5edd4] text-[#7a5c00]";
  }
  return "bg-[#ebe4d9] text-[#6b635a]";
}

export function ContentQueueSection({ refreshToken = 0 }: ContentQueueSectionProps) {
  const [queue, setQueue] = useState<ContentQueueItem[]>([]);

  const reload = useCallback(() => {
    setQueue(loadContentQueue());
  }, []);

  useEffect(() => {
    reload();
  }, [reload, refreshToken]);

  function changeStatus(id: string, status: ContentQueueStatus) {
    setQueue(updateQueueItemStatus(id, status));
  }

  function remove(id: string) {
    setQueue(removeQueueItem(id));
  }

  return (
    <DashboardSection
      id="content-queue"
      title="Content Queue"
      subtitle="Local queue — Idea → Drafting → Approved → Scheduled → Published"
    >
      {queue.length === 0 ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          No items yet. Use <strong>Send to Queue</strong> on a content opportunity.
        </p>
      ) : (
        <ul className="space-y-3">
          {queue.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                    {item.assetLabel} · {item.topic}
                  </p>
                  <p className={`mt-0.5 text-sm font-medium ${DASHBOARD.body}`}>
                    {item.title}
                  </p>
                  <p className={`mt-0.5 text-xs ${DASHBOARD.muted}`}>{item.angle}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className={`text-[10px] ${DASHBOARD.muted}`}>
                  Status
                  <select
                    value={item.status}
                    onChange={(e) =>
                      changeStatus(item.id, e.target.value as ContentQueueStatus)
                    }
                    className="ml-1 rounded-lg border border-[#d4cdc3] bg-white px-2 py-1 text-xs text-[#2d2926]"
                  >
                    {CONTENT_QUEUE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-[10px] text-[#a85c4a] hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
