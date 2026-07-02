"use client";

import { EstateCollectionRoomPanel } from "@/components/estate-collection";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

/** Evidence Vault — Spark Estate Collection Framework™ */
export function EvidenceBankPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  return <EstateCollectionRoomPanel roomId="evidence-vault" nav={nav} />;
}
