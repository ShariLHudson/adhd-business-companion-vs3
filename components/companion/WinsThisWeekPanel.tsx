"use client";

import { EstateCollectionRoomPanel } from "@/components/estate-collection";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

/** Celebration Garden — Spark Estate Collection Framework */
export function WinsThisWeekPanel({
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
  /** @deprecated collection engine — evidence bridge handled in conversation */
  onSaveToEvidenceBank?: (whatHappened: string, sourceWinId: string) => void;
}) {
  return <EstateCollectionRoomPanel roomId="celebration-garden" nav={nav} />;
}
