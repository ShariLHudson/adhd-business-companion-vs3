/**
 * Warm patterned journal cover plates so design studio + gift covers
 * appear without a blank wait.
 */

import { preloadRoomBackgrounds } from "@/lib/roomBackgroundPreload";
import { JOURNAL_PRINTED_COVER_DESIGNS } from "./designStudioCatalog";
import {
  JOURNAL_ESTATE_COVER_ART_URL,
  JOURNAL_GAZEBO_COVER_ART_URL,
} from "./journalGazeboMedia";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Every printed cover the member can pick or reopen. */
export function journalPrintedCoverImageUrls(): string[] {
  const urls = new Set<string>();
  for (const design of JOURNAL_PRINTED_COVER_DESIGNS) {
    if (design.previewImageUrl) urls.add(design.previewImageUrl);
  }
  urls.add(JOURNAL_GAZEBO_COVER_ART_URL);
  urls.add(JOURNAL_ESTATE_COVER_ART_URL);
  urls.add(ESTATE_ROOM_BG.celebrationGarden);
  urls.add(ESTATE_ROOM_BG.gazeboJournal);
  urls.add(ESTATE_ROOM_BG.sparkEstatePhoto);
  return [...urls].filter(Boolean);
}

/** Preload immediately — call when Journal Gazebo mounts or create starts. */
export function preloadJournalCoverImages(): void {
  preloadRoomBackgrounds(journalPrintedCoverImageUrls());
}
