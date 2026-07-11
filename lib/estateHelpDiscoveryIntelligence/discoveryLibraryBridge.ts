/**
 * Discovery Key library bridge — approved discoveries only.
 */

import discoveryLibraryJson from "@/docs/estate-intelligence/discovery-library.json";
import { getEstateIntelligenceItem } from "@/lib/estateKnowledgeBase/loader";
import type { DiscoveryLibrarySummary } from "./types";

type DiscoveryLibraryItem = {
  id: string;
  status: string;
  title: string;
  subtitle: string | null;
  discoveryText: string;
  whyItMatters: string | null;
  destinationRoute: string | null;
  targetRegistry: string;
  targetId: string;
};

type DiscoveryLibraryFile = {
  items: DiscoveryLibraryItem[];
};

const FILE = discoveryLibraryJson as DiscoveryLibraryFile;

function isApprovedDiscovery(item: DiscoveryLibraryItem): boolean {
  if (item.status !== "Live") return false;
  const kbItem = getEstateIntelligenceItem(
    item.targetRegistry as "estate-rooms",
    item.targetId,
  );
  return kbItem?.status === "Live";
}

export function getLiveDiscoveryLibraryItems(): DiscoveryLibrarySummary[] {
  return FILE.items.filter(isApprovedDiscovery).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    discoveryText: item.discoveryText,
    whyItMatters: item.whyItMatters,
    targetId: item.targetId,
    destinationRoute: item.destinationRoute,
  }));
}

export function pickDiscoveryForMember(
  exploredIds: readonly string[] = [],
): DiscoveryLibrarySummary | null {
  const candidates = getLiveDiscoveryLibraryItems().filter(
    (item) => !exploredIds.includes(item.id),
  );
  if (candidates.length === 0) {
    return getLiveDiscoveryLibraryItems()[0] ?? null;
  }
  return candidates[0] ?? null;
}

export function formatDiscoveryNoteResponse(note: DiscoveryLibrarySummary): string {
  const lines = [note.discoveryText];
  if (note.whyItMatters) {
    lines.push(note.whyItMatters);
  }
  lines.push("", `That's ${note.title}. Would you like to visit, or stay here?`);
  return lines.join("\n\n");
}
