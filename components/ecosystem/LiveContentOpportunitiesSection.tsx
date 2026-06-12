"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addToContentQueue,
  buildAssetPostCraftJson,
  isOpportunityReviewed,
  loadReviewedKeys,
  markOpportunityReviewed,
  opportunityAssetKey,
} from "@/lib/ecosystem/founderDashboardLocalState";
import type { GhlContentAssetIdea, GhlContentOpportunity } from "@/lib/ghl/types";

import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import {
  ActionChip,
  copyText,
  DASHBOARD,
  DashboardSection,
} from "./ecosystemDashboardUi";

type LiveContentOpportunitiesSectionProps = {
  accessToken: string;
  opportunities: GhlContentOpportunity[];
  hasLiveSignals: boolean;
  onQueueChange?: () => void;
  onGoogleAssetCreated?: () => void;
};

export function LiveContentOpportunitiesSection({
  accessToken,
  opportunities,
  hasLiveSignals,
  onQueueChange,
  onGoogleAssetCreated,
}: LiveContentOpportunitiesSectionProps) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [placeholderMsg, setPlaceholderMsg] = useState<string | null>(null);

  const refreshReviewed = useCallback(() => {
    setReviewed(loadReviewedKeys());
  }, []);

  useEffect(() => {
    refreshReviewed();
  }, [refreshReviewed, opportunities]);

  function notify(label: string) {
    setFlash(label);
    window.setTimeout(() => setFlash(null), 1800);
  }

  function handleReviewed(
    opportunity: GhlContentOpportunity,
    asset: GhlContentAssetIdea,
  ) {
    const key = opportunityAssetKey(opportunity.topicKey ?? opportunity.topic, asset);
    setReviewed(markOpportunityReviewed(key));
    notify("Marked reviewed");
  }

  async function handleCopyJson(
    opportunity: GhlContentOpportunity,
    asset: GhlContentAssetIdea,
  ) {
    const ok = await copyText(
      JSON.stringify(buildAssetPostCraftJson(opportunity, asset), null, 2),
    );
    notify(ok ? "PostCraft JSON copied" : "Copy blocked");
  }

  async function handleCopyTitle(asset: GhlContentAssetIdea) {
    const ok = await copyText(asset.title);
    notify(ok ? "Title copied" : "Copy blocked");
  }

  async function handleCopyAngle(asset: GhlContentAssetIdea) {
    const ok = await copyText(asset.angle);
    notify(ok ? "Angle copied" : "Copy blocked");
  }

  function handleSendToQueue(
    opportunity: GhlContentOpportunity,
    asset: GhlContentAssetIdea,
  ) {
    addToContentQueue({ opportunity, asset });
    onQueueChange?.();
    notify("Added to Content Queue");
  }

  async function handleCreateGoogleDoc(
    opportunity: GhlContentOpportunity,
    asset: GhlContentAssetIdea,
  ) {
    if (!accessToken) {
      setPlaceholderMsg("Dashboard access token required.");
      return;
    }
    setPlaceholderMsg("Creating Google Doc…");
    try {
      const res = await fetch("/api/ecosystem/google-workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        credentials: "include",
        body: JSON.stringify({
          action: "create_doc",
          opportunity,
          assetType: asset.type,
        }),
      });
      const data = (await res.json()) as {
        asset?: { googleUrl: string };
        error?: string;
      };
      if (!res.ok || !data.asset?.googleUrl) {
        setPlaceholderMsg(data.error ?? "Connect Google in companion Settings first.");
        window.setTimeout(() => setPlaceholderMsg(null), 4000);
        return;
      }
      window.open(data.asset.googleUrl, "_blank", "noopener,noreferrer");
      setPlaceholderMsg("Google Doc created.");
      onGoogleAssetCreated?.();
      window.setTimeout(() => setPlaceholderMsg(null), 2500);
    } catch {
      setPlaceholderMsg("Could not create Google Doc.");
      window.setTimeout(() => setPlaceholderMsg(null), 3000);
    }
  }

  return (
    <DashboardSection
      id="live-opportunities"
      title="Live Content Opportunities"
      subtitle={
        hasLiveSignals
          ? "Ranked from aggregated signals — titles & angles only"
          : "Populates when companion signals sync"
      }
      accent="gold"
    >
      {flash ? (
        <p className={`mb-3 rounded-lg ${DASHBOARD.goldBg} px-3 py-2 text-xs ${DASHBOARD.gold}`}>
          {flash}
        </p>
      ) : null}
      {placeholderMsg ? (
        <p className={`mb-3 rounded-lg border ${DASHBOARD.goldBorder} bg-white px-3 py-2 text-xs ${DASHBOARD.muted}`}>
          {placeholderMsg}
        </p>
      ) : null}

      {opportunities.length === 0 ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>No opportunities yet.</p>
      ) : (
        <ul className="space-y-4">
          {opportunities.map((o) => (
            <li
              key={o.topicKey ?? o.topic}
              className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`font-semibold ${DASHBOARD.body}`}>{o.topic}</p>
                <p className={`text-xs ${DASHBOARD.muted}`}>
                  Score {o.opportunityScore} · {o.mentions} mentions
                  {o.trend ? ` · ${o.trend}` : ""}
                </p>
              </div>
              {o.whyThisMatters ? (
                <p className={`mt-2 text-sm ${DASHBOARD.body}`}>{o.whyThisMatters}</p>
              ) : null}

              {(o.assetIdeas ?? []).length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {o.assetIdeas!.map((asset) => {
                    const key = opportunityAssetKey(o.topicKey ?? o.topic, asset);
                    const isReviewed = reviewed.has(key) || isOpportunityReviewed(key);
                    return (
                      <li
                        key={key}
                        className={`rounded-xl border bg-white p-3 transition-opacity ${
                          isReviewed
                            ? "border-[#e8e2d8] opacity-60"
                            : "border-[#d4cdc3]"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[10px] font-bold uppercase tracking-wide ${DASHBOARD.heading}`}
                            >
                              {asset.label}
                              {isReviewed ? (
                                <span className={`ml-2 normal-case ${DASHBOARD.muted}`}>
                                  · Reviewed
                                </span>
                              ) : null}
                            </p>
                            <p className={`mt-0.5 text-sm font-medium ${DASHBOARD.body}`}>
                              {asset.title}
                            </p>
                            <p className={`mt-0.5 text-xs ${DASHBOARD.muted}`}>
                              {asset.angle}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <ActionChip
                            label="Copy PostCraft JSON"
                            onClick={() => void handleCopyJson(o, asset)}
                          />
                          <ActionChip
                            label="Copy Title"
                            onClick={() => void handleCopyTitle(asset)}
                          />
                          <ActionChip
                            label="Copy Angle"
                            onClick={() => void handleCopyAngle(asset)}
                          />
                          <ActionChip
                            label="Mark Reviewed"
                            variant="gold"
                            onClick={() => handleReviewed(o, asset)}
                            disabled={isReviewed}
                          />
                          <ActionChip
                            label="Send to Queue"
                            variant="teal"
                            onClick={() => handleSendToQueue(o, asset)}
                          />
                          <ActionChip
                            label="Google Doc"
                            onClick={() => void handleCreateGoogleDoc(o, asset)}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={`mt-2 text-xs ${DASHBOARD.muted}`}>
                  Suggested: {o.suggestedAssets.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
