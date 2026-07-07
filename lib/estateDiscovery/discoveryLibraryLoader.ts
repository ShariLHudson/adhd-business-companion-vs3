/**
 * Discovery Library™ — load discovery records from CMS repository (JSON V1).
 */

import {
  getAllDiscoveryRecords,
  getDiscoveryRecordById,
  getMemberReadyDiscoveryRecords,
} from "./discoveryCms/repository";
import type { DiscoveryLibraryItem } from "./types";

export function getDiscoveryLibraryItems(): DiscoveryLibraryItem[] {
  return getAllDiscoveryRecords();
}

export function getDiscoveryLibraryItem(
  id: string,
): DiscoveryLibraryItem | null {
  return getDiscoveryRecordById(id);
}

/** Live discoveries that pass CMS validation — safe for member-facing engine. */
export function getLiveDiscoveryLibraryItems(): DiscoveryLibraryItem[] {
  return getMemberReadyDiscoveryRecords();
}
