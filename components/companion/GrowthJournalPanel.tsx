"use client";

import { JournalGazeboExperience } from "@/components/journal-gazebo/JournalGazeboExperience";
import { VisualizeThisButton } from "@/components/companion/VisualizeThisButton";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import type { SparkVisualEngineOpenRequest } from "@/lib/sparkVisualEngine";

/** Journal Gazebo — first-visit envelope, letter, and writing desk. */
export function GrowthJournalPanel({
  nav,
  onVisualizeThis,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
  /** #184 Spark Visual Engine — Visualize This from Journal. */
  onVisualizeThis?: (request: SparkVisualEngineOpenRequest) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {onVisualizeThis ? (
        <div className="flex shrink-0 justify-end px-3 pt-2">
          <VisualizeThisButton
            onVisualize={onVisualizeThis}
            request={{ source: "journal", viewId: "mind-map" }}
          />
        </div>
      ) : null}
      <div className="min-h-0 flex-1">
        <JournalGazeboExperience
          onBack={nav.onBack}
          backLabel={nav.backLabel ?? "Companion"}
        />
      </div>
    </div>
  );
}
