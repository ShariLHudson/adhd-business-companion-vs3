"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  PostCraftPublishingIntelligence,
  PostCraftPublishStatus,
} from "@/lib/ecosystem/postcraftLivePublishing";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ActionChip, DASHBOARD, DashboardSection, MetricCard } from "./ecosystemDashboardUi";

type PostCraftLivePublishingSectionProps = {
  accessToken: string;
  refreshToken?: number;
};

function statusClass(status: PostCraftPublishStatus): string {
  if (status === "published") return "bg-[#1e4f4f]/12 text-[#1e4f4f]";
  if (status === "scheduled") return "bg-[#f5edd4] text-[#7a5c00]";
  if (status === "failed") return "bg-[#a85c4a]/12 text-[#a85c4a]";
  if (status === "queued" || status === "sent_to_postcraft") {
    return "bg-[#ebe4d9] text-[#6b635a]";
  }
  if (status === "approved") return "bg-[#e8f4f4] text-[#1e4f4f]";
  return "bg-[#faf8f5] text-[#6b635a]";
}

function formatStatus(status: PostCraftPublishStatus): string {
  return status.replace(/_/g, " ");
}

export function PostCraftLivePublishingSection({
  accessToken,
  refreshToken = 0,
}: PostCraftLivePublishingSectionProps) {
  const [intel, setIntel] = useState<PostCraftPublishingIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [scheduleDraftId, setScheduleDraftId] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [statusDetail, setStatusDetail] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ecosystem/postcraft/publishing", {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
      });
      if (!res.ok) throw new Error("Could not load publishing state.");
      setIntel((await res.json()) as PostCraftPublishingIntelligence);
    } catch {
      setIntel(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  async function runAction(
    draftId: string,
    action: string,
    extra?: { scheduledAt?: string },
  ) {
    setBusyId(draftId);
    setFlash(null);
    setStatusDetail(null);
    try {
      const res = await fetch("/api/ecosystem/postcraft/publishing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        body: JSON.stringify({ draftId, action, ...extra }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        intelligence?: PostCraftPublishingIntelligence;
        item?: { publishStatus: string; title: string; error?: string };
        record?: { publishStatus: string; scheduledAt?: string; publishedAt?: string };
      };
      if (data.intelligence) setIntel(data.intelligence);
      else await load();

      if (action === "view_status" && data.item) {
        const parts = [
          `${data.item.title}: ${formatStatus(data.item.publishStatus as PostCraftPublishStatus)}`,
        ];
        if (data.record?.scheduledAt) {
          parts.push(`Scheduled ${new Date(data.record.scheduledAt).toLocaleString()}`);
        }
        if (data.record?.publishedAt) {
          parts.push(`Published ${new Date(data.record.publishedAt).toLocaleString()}`);
        }
        if (data.item.error) parts.push(`Error: ${data.item.error}`);
        setStatusDetail(parts.join(" · "));
      } else if (data.error) {
        setFlash(data.error);
      } else {
        setFlash(
          action === "publish_now"
            ? "Published to PostCraft"
            : action === "schedule"
              ? "Scheduled in PostCraft"
              : action === "retry"
                ? "Retry complete"
                : action === "cancel"
                  ? "Publishing cancelled"
                  : "Updated",
        );
      }
    } catch {
      setFlash("Action failed.");
    } finally {
      setBusyId(null);
      setScheduleDraftId(null);
      window.setTimeout(() => setFlash(null), 3000);
    }
  }

  const metrics = intel?.metrics;
  const items = intel?.items ?? [];
  const actionable = items.filter((i) =>
    ["approved", "queued", "sent_to_postcraft", "scheduled", "failed"].includes(
      i.publishStatus,
    ),
  );

  return (
    <DashboardSection
      id="postcraft-live-publishing"
      title="PostCraft Live Publishing"
      subtitle="Approved drafts → PostCraft → tracked outcomes"
      accent="gold"
    >
      {flash ? (
        <p className={`mb-3 rounded-lg ${DASHBOARD.goldBg} px-3 py-2 text-xs ${DASHBOARD.gold}`}>
          {flash}
        </p>
      ) : null}

      {statusDetail ? (
        <p className={`mb-3 rounded-lg border ${DASHBOARD.goldBorder} bg-white px-3 py-2 text-xs ${DASHBOARD.body}`}>
          {statusDetail}
        </p>
      ) : null}

      {!intel?.connected ? (
        <p
          className={`mb-3 rounded-xl border ${DASHBOARD.goldBorder} ${DASHBOARD.goldBg} px-3 py-2 text-sm ${DASHBOARD.muted}`}
        >
          PostCraft is not connected yet. Set POSTCRAFT_API_URL and POSTCRAFT_API_KEY to enable
          live publishing.
        </p>
      ) : null}

      {metrics ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Content Published" value={metrics.contentPublished} />
          <MetricCard label="Content Scheduled" value={metrics.contentScheduled} />
          <MetricCard
            label="Failed Publications"
            value={metrics.failedPublications}
          />
          <MetricCard
            label="Top Topic"
            value={metrics.topPerformingTopics[0]?.topic ?? "—"}
            hint={
              metrics.topPerformingTopics[0]
                ? `Score ${metrics.topPerformingTopics[0].score}`
                : "Builds after publish"
            }
          />
        </div>
      ) : null}

      {metrics && metrics.topPerformingTopics.length > 1 ? (
        <p className={`mb-4 text-xs ${DASHBOARD.muted}`}>
          Top performing topics:{" "}
          {metrics.topPerformingTopics
            .slice(0, 3)
            .map((t) => `${t.topic} (${t.score})`)
            .join(" · ")}
        </p>
      ) : null}

      {loading ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Loading publishing state…</p>
      ) : !actionable.length ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          No drafts in the publishing pipeline. Approve a content draft to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {actionable.map((item) => (
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
                    {item.assetLabel} · score {item.opportunityScore}
                    {item.scheduledAt
                      ? ` · scheduled ${new Date(item.scheduledAt).toLocaleString()}`
                      : ""}
                    {item.publishedAt
                      ? ` · published ${new Date(item.publishedAt).toLocaleDateString()}`
                      : ""}
                    {item.publishResults?.views != null
                      ? ` · ${item.publishResults.views} views`
                      : ""}
                  </p>
                  {item.error ? (
                    <p className="mt-1 text-xs text-[#a85c4a]">
                      <span className="font-semibold">Error:</span> {item.error}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusClass(item.publishStatus)}`}
                >
                  {formatStatus(item.publishStatus)}
                </span>
              </div>

              {scheduleDraftId === item.draftId ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className="rounded-lg border border-[#d4cdc3] px-2 py-1 text-xs"
                  />
                  <ActionChip
                    label="Confirm schedule"
                    variant="teal"
                    disabled={!scheduleAt || busyId === item.draftId}
                    onClick={() =>
                      void runAction(item.draftId, "schedule", {
                        scheduledAt: new Date(scheduleAt).toISOString(),
                      })
                    }
                  />
                  <ActionChip
                    label="Cancel"
                    disabled={busyId === item.draftId}
                    onClick={() => setScheduleDraftId(null)}
                  />
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ActionChip
                    label="Publish Now"
                    variant="teal"
                    disabled={
                      busyId === item.draftId ||
                      item.publishStatus === "published" ||
                      item.publishStatus === "scheduled"
                    }
                    onClick={() => void runAction(item.draftId, "publish_now")}
                  />
                  <ActionChip
                    label="Schedule"
                    disabled={
                      busyId === item.draftId ||
                      item.publishStatus === "published"
                    }
                    onClick={() => {
                      setScheduleDraftId(item.draftId);
                      setScheduleAt("");
                    }}
                  />
                  <ActionChip
                    label="Retry"
                    disabled={busyId === item.draftId || item.publishStatus !== "failed"}
                    onClick={() => void runAction(item.draftId, "retry")}
                  />
                  <ActionChip
                    label="Cancel"
                    disabled={busyId === item.draftId}
                    onClick={() => void runAction(item.draftId, "cancel")}
                  />
                  <ActionChip
                    label="View Status"
                    disabled={busyId === item.draftId}
                    onClick={() => void runAction(item.draftId, "view_status")}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
