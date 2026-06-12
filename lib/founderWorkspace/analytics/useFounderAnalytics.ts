"use client";

import { useEffect, useMemo, useState } from "react";

import { eventStore } from "@/lib/ecosystem/eventStore";
import type { ProjectIntelligence } from "@/lib/founderWorkspace/intelligence/types";
import type { FounderWorkspaceData } from "@/lib/founderWorkspace/types";
import { loadFounderTracking } from "@/lib/founderWorkspace/tracking/store";
import type { FounderTrackingData } from "@/lib/founderWorkspace/tracking/types";

import { loadApiUsageRecords } from "./apiUsageStore";
import { buildFounderAnalyticsReport } from "./analyticsEngine";
import type { AnalyticsFilters, FounderAnalyticsReport } from "./types";

function defaultFilters(): AnalyticsFilters {
  return { timeframe: "week", projectId: null, workspace: null };
}

export function useFounderAnalytics(
  workspace: FounderWorkspaceData | null,
  analyses: ProjectIntelligence[] = [],
) {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = eventStore.subscribe(() => setTick((t) => t + 1));
    const interval = window.setInterval(() => setTick((t) => t + 1), 5000);
    return () => {
      unsub();
      window.clearInterval(interval);
    };
  }, []);

  const report: FounderAnalyticsReport = useMemo(() => {
    void tick;
    const events = eventStore.query({});
    const tracking: FounderTrackingData = loadFounderTracking();
    const apiUsage = loadApiUsageRecords();
    return buildFounderAnalyticsReport({
      events,
      workspace,
      tracking,
      apiUsage,
      filters,
      analyses,
    });
  }, [workspace, filters, tick, analyses]);

  return { report, filters, setFilters };
}
