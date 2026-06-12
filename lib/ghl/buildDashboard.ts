import {
  ecosystemCountsToContentOpportunities,
  ecosystemCountsToProductSignals,
  toPostCraftLiveExport,
} from "@/lib/ecosystem/ecosystemDashboardSignals";
import { generateLiveContentOpportunities } from "@/lib/ecosystem/liveContentOpportunityGenerator";
import { loadEcosystemSignalCounts } from "@/lib/ecosystem/serverSignalStore";
import { loadFounderWorkspaceFromDb } from "@/lib/founderWorkspace/repository";
import { founderSupabaseConfigured } from "@/lib/supabase/founderServer";
import type { FounderWorkspaceData } from "@/lib/founderWorkspace/types";

import {
  fetchGhlMetrics,
  ghlApiConfigured,
  ghlClientConfigFromEnv,
} from "./client";
import type {
  GhlContentOpportunity,
  GhlDashboardPayload,
  GhlFounderSummary,
  GhlPeriod,
  GhlProductSignal,
} from "./types";

const ASSET_LABELS: Record<string, string> = {
  social_posts: "Social Posts",
  blogs: "Blog",
  newsletters: "Newsletter",
  workshops: "Workshop",
  lead_magnets: "Lead Magnet",
  webinars: "Webinar",
  podcast_episodes: "Podcast",
  email_series: "Email Series",
};

function summarizeWorkspace(data: FounderWorkspaceData | null): GhlFounderSummary {
  if (!data) {
    return {
      activeProjects: 0,
      activeExperiments: 0,
      recentNotes: 0,
      topProjects: [],
      configured: false,
    };
  }

  const activeProjects = data.projects.filter((p) => p.status === "active");
  const activeExperiments = data.experiments.filter((e) => e.status === "active");
  const weekAgo = Date.now() - 7 * 86_400_000;
  const recentNotes = data.notes.filter(
    (n) => new Date(n.updatedAt).getTime() >= weekAgo,
  ).length;

  const topProjects = [...data.projects]
    .filter((p) => p.status !== "done")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5)
    .map((p) => ({ title: p.title, status: p.status }));

  return {
    activeProjects: activeProjects.length,
    activeExperiments: activeExperiments.length,
    recentNotes,
    topProjects,
    configured: true,
  };
}

/** Map ecosystem signal keys to display labels for the GHL dashboard. */
export function defaultProductSignals(): GhlProductSignal[] {
  return [
    { label: "Overwhelm", count: 0, kind: "struggle" },
    { label: "Prioritization", count: 0, kind: "struggle" },
    { label: "Focus", count: 0, kind: "struggle" },
    { label: "What should I work on?", count: 0, kind: "question" },
    { label: "Help me prioritize", count: 0, kind: "question" },
  ];
}

/** PostCraft-ready opportunities (empty until ecosystem sync is wired server-side). */
export function defaultContentOpportunities(): GhlContentOpportunity[] {
  return [
    {
      topic: "Overwhelm",
      mentions: 0,
      opportunityScore: 0,
      suggestedAssets: ["Blog", "Newsletter", "Workshop", "Social Posts"],
    },
    {
      topic: "Prioritization",
      mentions: 0,
      opportunityScore: 0,
      suggestedAssets: ["Blog", "Newsletter", "Lead Magnet"],
    },
  ];
}

export function mergeProductSignals(
  base: GhlProductSignal[],
  counts: { key: string; count: number; kind: GhlProductSignal["kind"] }[],
): GhlProductSignal[] {
  const map = new Map(base.map((s) => [s.label.toLowerCase(), { ...s }]));
  for (const row of counts) {
    const label = row.key.replace(/_/g, " ");
    const existing = map.get(label.toLowerCase());
    if (existing) {
      existing.count += row.count;
    } else {
      map.set(label.toLowerCase(), {
        label: label.replace(/\b\w/g, (c) => c.toUpperCase()),
        count: row.count,
        kind: row.kind,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function formatSuggestedAssets(slugs: string[]): string[] {
  return slugs.map((s) => ASSET_LABELS[s] ?? s);
}

export type BuildGhlDashboardInput = {
  period?: GhlPeriod;
  productSignals?: GhlProductSignal[];
  contentOpportunities?: GhlContentOpportunity[];
};

export async function buildGhlDashboard(
  input: BuildGhlDashboardInput = {},
): Promise<GhlDashboardPayload> {
  const period = input.period ?? "30d";
  const errors: string[] = [];
  const ghlConfigured = ghlApiConfigured();
  const founderDbConfigured = founderSupabaseConfigured();

  let business: GhlDashboardPayload["business"] = null;
  if (ghlConfigured) {
    try {
      const config = ghlClientConfigFromEnv()!;
      const metrics = await fetchGhlMetrics(config, period);
      business = {
        ...metrics,
        period,
        fetchedAt: new Date().toISOString(),
      };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Could not load GHL metrics.");
    }
  } else {
    errors.push("GHL API not configured (GHL_API_TOKEN + GHL_LOCATION_ID).");
  }

  let workspace: FounderWorkspaceData | null = null;
  if (founderDbConfigured) {
    try {
      workspace = await loadFounderWorkspaceFromDb();
    } catch (e) {
      errors.push(
        e instanceof Error ? e.message : "Could not load founder workspace.",
      );
    }
  }

  const ecosystemCounts = await loadEcosystemSignalCounts();
  const hasLiveSignals = ecosystemCounts.some((c) => c.count > 0);

  const productSignalsResolved =
    input.productSignals ??
    (hasLiveSignals
      ? ecosystemCountsToProductSignals(ecosystemCounts)
      : mergeProductSignals(defaultProductSignals(), []));

  const contentOpportunities =
    input.contentOpportunities ??
    (hasLiveSignals
      ? ecosystemCountsToContentOpportunities(
          ecosystemCounts,
          productSignalsResolved,
        )
      : defaultContentOpportunities());

  const liveOpportunities = hasLiveSignals
    ? generateLiveContentOpportunities({
        counts: ecosystemCounts,
        productSignals: productSignalsResolved,
      })
    : [];

  const postCraftExport = liveOpportunities.length
    ? toPostCraftLiveExport(liveOpportunities)
    : null;

  return {
    generatedAt: new Date().toISOString(),
    business,
    founder: summarizeWorkspace(workspace),
    productSignals: productSignalsResolved.filter((s) => s.count >= 0).slice(0, 12),
    contentOpportunities: [...contentOpportunities]
      .sort((a, b) => b.opportunityScore - a.opportunityScore || b.mentions - a.mentions)
      .slice(0, 10),
    postCraftExport,
    integration: {
      ghlConfigured,
      founderDbConfigured,
      ecosystemSignalsConfigured: hasLiveSignals,
      errors,
    },
  };
}
