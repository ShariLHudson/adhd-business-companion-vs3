import { ESTATE_ROOM_BG, ESTATE_ROOM_BG_BY_ROOM_ID } from "@/lib/estate/estateRoomAssets";
import { JOURNAL_GAZEBO_COVER_ART_URL } from "./journalGazeboMedia";
import type { JournalGazeboConfig } from "./types";

const ESTATE_PLACE_COVER: Record<string, string> = {
  journal: ESTATE_ROOM_BG.gazeboJournal,
  gardens: ESTATE_ROOM_BG.celebrationGarden,
  library: ESTATE_ROOM_BG.library,
  greenhouse: ESTATE_ROOM_BG.greenhouse,
  conservatory: ESTATE_ROOM_BG.butterflyConservatory,
  "coffee-house": ESTATE_ROOM_BG.coffeeHouse,
  "reading-nook": ESTATE_ROOM_BG.readingNook,
  "my-estate": ESTATE_ROOM_BG.sparkEstatePhoto,
  "journal-gazebo": JOURNAL_GAZEBO_COVER_ART_URL,
};

/** Resolve cover plate for the hero journal — leather shows through when null. */
export function journalCoverImageUrl(config: JournalGazeboConfig): string | null {
  if (config.coverImageKind === "upload" && config.coverImageUrl?.trim()) {
    return config.coverImageUrl.trim();
  }
  if (config.coverImageKind === "estate-room" && config.coverEstatePlaceId) {
    return (
      ESTATE_PLACE_COVER[config.coverEstatePlaceId] ??
      ESTATE_ROOM_BG_BY_ROOM_ID[config.coverEstatePlaceId] ??
      null
    );
  }
  if (config.coverImageKind === "estate-art") {
    return ESTATE_ROOM_BG.galleryOfFirsts;
  }
  return null;
}

export function journalCoverTitle(config: JournalGazeboConfig): string {
  const embossed = config.embossedTitle?.trim();
  if (embossed) return embossed;
  return config.name.trim() || "My Journal";
}
