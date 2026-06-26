import type { CompanionPlaceId } from "../types";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

export type ArtworkPiece = {
  id: string;
  title: string;
  mood: string;
  seasons: WelcomeSeason[];
  places: CompanionPlaceId[];
};

/** Artwork Library™ — meaningful wall rotation, not random. */
export const ARTWORK_LIBRARY: ArtworkPiece[] = [];
