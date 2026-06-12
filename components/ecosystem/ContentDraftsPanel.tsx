"use client";

import { useCallback, useEffect, useState } from "react";

import type { ContentDraft } from "@/lib/ecosystem/postcraftDraftGenerator";
import type { GhlContentAssetIdea, GhlContentOpportunity } from "@/lib/ghl/types";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ContentDraftModal } from "./ContentDraftModal";

function statusClass(status: ContentDraft["status"]): string {
  if (status === "approved" || status === "published") {
    return "bg-[#1e4f4f]/12 text-[#1e4f4f]";
  }
  if (status === "drafted" || status === "reviewed") {
    return "bg-[#e8c547]/25 text-[#7a5c00]";
  }
  return "bg-[#6b635a]/12 text-[#6b635a]";
}

type ContentDraftsPanelProps = {
  accessToken: string;
  opportunities: GhlContentOpportunity[];
  onDraftsChange?: () => void;
};

export function ContentDraftsPanel({
  accessToken,
  opportunities,
  onDraftsChange,
}: ContentDraftsPanelProps) {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<ContentDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ecosystem/postcraft/drafts", {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
      });
      if (!res.ok) throw new Error("Could not load drafts.");
      const data = (await res.json()) as { drafts: ContentDraft[] };
      setDrafts(data.drafts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load drafts.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  async function exportDraftToGoogle(draft: ContentDraft) {
    setError(null);
    try {
      const res = await fetch("/api/ecosystem/google-workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        credentials: "include",
        body: JSON.stringify({ action: "create_doc", draftId: draft.id }),
      });
      const data = (await res.json()) as { asset?: { googleUrl: string }; error?: string };
      if (!res.ok || !data.asset?.googleUrl) {
        setError(data.error ?? "Connect Google in companion Settings first.");
        return;
      }
      window.open(data.asset.googleUrl, "_blank", "noopener,noreferrer");
      onDraftsChange?.();
    } catch {
      setError("Could not export to Google.");
    }
  }

  async function generateDraft(
    opportunity: GhlContentOpportunity,
    asset: GhlContentAssetIdea,
  ) {
    const key = `${opportunity.topicKey}-${asset.type}`;
    setGeneratingKey(key);
    setError(null);
    try {
      const res = await fetch("/api/ecosystem/postcraft/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        body: JSON.stringify({
          action: "generate",
          topicKey: opportunity.topicKey,
          assetType: asset.type,
          topic: opportunity.topic,
          opportunityScore: opportunity.opportunityScore,
          mentions: opportunity.mentions,
          trend: opportunity.trend,
          whyThisMatters: opportunity.whyThisMatters,
          assetLabel: asset.label,
          title: asset.title,
          angle: asset.angle,
          sourceSignals: opportunity.sourceSignals ?? [],
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Generation failed.");
      }
      const data = (await res.json()) as { draft: ContentDraft };
      setDrafts((prev) => [data.draft, ...prev.filter((d) => d.id !== data.draft.id)]);
      setActiveDraft(data.draft);
      onDraftsChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGeneratingKey(null);
    }
  }

  return (
    <>
      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
          Content Drafts
        </h2>
        <p className="mt-0.5 text-xs text-[#6b635a]">
          First drafts for founder review — approve before publish
        </p>

        {error ? <p className="mt-2 text-sm text-[#a85c4a]">{error}</p> : null}

        <div className="mt-3 space-y-3">
          <p className="text-xs font-medium text-[#2d2926]">Generate from opportunity</p>
          {opportunities.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No opportunities yet.</p>
          ) : (
            opportunities.slice(0, 4).map((o) => (
              <div
                key={o.topicKey ?? o.topic}
                className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3"
              >
                <p className="text-sm font-medium text-[#1f1c19]">{o.topic}</p>
                <ul className="mt-2 space-y-2">
                  {(o.assetIdeas ?? []).slice(0, 4).map((asset) => {
                    const key = `${o.topicKey}-${asset.type}`;
                    return (
                      <li
                        key={key}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#d4cdc3] bg-white p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase text-[#1e4f4f]">
                            {asset.label}
                          </p>
                          <p className="truncate text-xs text-[#2d2926]">{asset.title}</p>
                        </div>
                        <button
                          type="button"
                          disabled={generatingKey === key}
                          onClick={() => void generateDraft(o, asset)}
                          className="shrink-0 rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-[10px] font-medium text-white disabled:opacity-60"
                        >
                          {generatingKey === key ? "Drafting…" : "Generate draft"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-[#2d2926]">Saved drafts</p>
          {loading ? (
            <p className="mt-2 text-sm text-[#6b635a]">Loading drafts…</p>
          ) : drafts.length === 0 ? (
            <p className="mt-2 text-sm text-[#6b635a]">No drafts yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {drafts.map((draft) => (
                <li
                  key={draft.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d4cdc3] bg-white p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1f1c19]">{draft.title}</p>
                    <p className="text-xs text-[#6b635a]">
                      {draft.assetLabel} · {draft.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusClass(draft.status)}`}
                    >
                      {draft.status}
                    </span>
                    {draft.status === "approved" ? (
                      <button
                        type="button"
                        onClick={() => void exportDraftToGoogle(draft)}
                        className="rounded-lg border border-[#e8d48a] bg-[#f5edd4] px-2.5 py-1 text-[10px] font-medium text-[#7a5c00]"
                      >
                        Google Doc
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setActiveDraft(draft)}
                      className="rounded-lg border border-[#1e4f4f] px-2.5 py-1 text-[10px] font-medium text-[#1e4f4f]"
                    >
                      Open
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ContentDraftModal
        draft={activeDraft}
        accessToken={accessToken}
        onClose={() => setActiveDraft(null)}
        onUpdated={(draft) => {
          setDrafts((prev) => [
            draft,
            ...prev.filter((d) => d.id !== draft.id),
          ]);
          setActiveDraft(draft);
          onDraftsChange?.();
        }}
        onSyncQueueChange={onDraftsChange}
      />
    </>
  );
}
