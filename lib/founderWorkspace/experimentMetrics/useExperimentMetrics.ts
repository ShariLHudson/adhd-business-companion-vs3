"use client";

import { useEffect, useMemo, useState } from "react";

import { eventStore } from "@/lib/ecosystem/eventStore";
import { loadApiUsageRecords } from "@/lib/founderWorkspace/analytics/apiUsageStore";
import { loadIntelligenceStore } from "@/lib/founderWorkspace/intelligence/intelligenceStore";
import type { FounderWorkspaceData } from "@/lib/founderWorkspace/types";
import type { ProjectIntelligence } from "@/lib/founderWorkspace/intelligence/types";
import { loadFounderTracking } from "@/lib/founderWorkspace/tracking/store";
import type { FounderTrackingData } from "@/lib/founderWorkspace/tracking/types";

import { buildExperimentMetricsReport } from "./experimentMetricsEngine";
import { loadAllCustomKpis } from "./kpiStore";
import type { ExperimentMetricsFilters, ExperimentMetricsReport } from "./types";

function defaultFilters(): ExperimentMetricsFilters {
  return { timeframe: "month", projectId: null, status: "all", tag: null };
}

export function useExperimentMetrics(
  workspace: FounderWorkspaceData | null,
  analyses: ProjectIntelligence[] = [],
) {
  const [filters, setFilters] = useState<ExperimentMetricsFilters>(defaultFilters);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = eventStore.subscribe(() => setTick((t) => t + 1));
    const interval = window.setInterval(() => setTick((t) => t + 1), 3000);
    return () => {
      unsub();
      window.clearInterval(interval);
    };
  }, []);

  const report: ExperimentMetricsReport = useMemo(() => {
    void tick;
    const events = eventStore.query({});
    const tracking: FounderTrackingData = loadFounderTracking();
    const apiUsage = loadApiUsageRecords();
    const intelligenceStore = loadIntelligenceStore();
    return buildExperimentMetricsReport({
      events,
      workspace,
      tracking,
      apiUsage,
      intelligenceStore,
      customKpis: loadAllCustomKpis(),
      analyses,
      filters,
    });
  }, [workspace, filters, tick, analyses]);

  return { report, filters, setFilters, lastUpdated: report.generatedAt };
}
