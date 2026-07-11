"use client";

import { useCallback, useMemo, useState } from "react";

import {
  composeDailyDiscoveryBrief,
  composeDiscoveryFindingDetail,
  composeMonthlyExecutiveDiscoveryReport,
  composeWeeklyDiscoveryReport,
} from "@/lib/executiveDiscoveryEngine";
import { getDiscoveryEngineCenterBootstrap } from "@/lib/founder/discoveryEngineCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { DailyBriefView } from "./discoveryEngine/DailyBriefView";
import { DiscoveryEngineEntryZone } from "./discoveryEngine/DiscoveryEngineEntryZone";
import { FindingDetailPanel } from "./discoveryEngine/FindingDetailPanel";
import { PeriodReportView } from "./discoveryEngine/PeriodReportView";

type ViewMode = "entry" | "daily" | "weekly" | "monthly";

export function FounderExecutiveDiscoveryEngine() {
  const bootstrap = useMemo(() => getDiscoveryEngineCenterBootstrap(), []);
  const [viewMode, setViewMode] = useState<ViewMode>("entry");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  const dailyBrief = useMemo(() => composeDailyDiscoveryBrief(), [viewMode]);
  const weeklyReport = useMemo(() => composeWeeklyDiscoveryReport(), [viewMode]);
  const monthlyReport = useMemo(() => composeMonthlyExecutiveDiscoveryReport(), [viewMode]);

  const detailView = useMemo(
    () => (selectedFindingId ? composeDiscoveryFindingDetail(selectedFindingId) : null),
    [selectedFindingId],
  );

  const handleBackFromDetail = useCallback(() => {
    setSelectedFindingId(null);
  }, []);

  const handleBackToEntry = useCallback(() => {
    setViewMode("entry");
    setSelectedFindingId(null);
  }, []);

  return (
    <div className="founder-discovery-engine">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Discovery Engine"
        title="Your Executive Discovery Department"
        question="What did Founder find while you were away?"
        purpose="Continuous executive discovery — calm briefs, rare alerts, and recommendations that help you move from insight to action."
      />

      {detailView ? (
        <FindingDetailPanel view={detailView} onBack={handleBackFromDetail} />
      ) : viewMode === "daily" ? (
        <DailyBriefView
          brief={dailyBrief}
          onSelectFinding={setSelectedFindingId}
          onBack={handleBackToEntry}
        />
      ) : viewMode === "weekly" ? (
        <PeriodReportView
          mode="weekly"
          weekly={weeklyReport}
          onSelectFinding={setSelectedFindingId}
          onBack={handleBackToEntry}
        />
      ) : viewMode === "monthly" ? (
        <PeriodReportView
          mode="monthly"
          monthly={monthlyReport}
          onSelectFinding={setSelectedFindingId}
          onBack={handleBackToEntry}
        />
      ) : (
        <DiscoveryEngineEntryZone
          overnightMessage={bootstrap.overnightMessage}
          onOpenDailyBrief={() => setViewMode("daily")}
          onOpenWeeklyReport={() => setViewMode("weekly")}
          onOpenMonthlyReport={() => setViewMode("monthly")}
          findingCount={bootstrap.findingCount}
          alertCount={bootstrap.founderAlertCount}
        />
      )}
    </div>
  );
}
