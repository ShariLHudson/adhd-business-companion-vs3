"use client";

import { JournalGazeboExperience } from "@/components/journal-gazebo/JournalGazeboExperience";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

/** Journal Gazebo™ — first-visit envelope, letter, and writing desk. */
export function GrowthJournalPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  return (
    <JournalGazeboExperience
      onBack={nav.onBack}
      backLabel={nav.backLabel ?? "Companion"}
    />
  );
}
