/**
 * Estate room background plates — paths match public/backgrounds/ on disk.
 *
 * **Authority:** `estatePlaceMedia.ts` (member-renamed filenames) → canonical registry.
 *
 * @see lib/estate/estatePlaceMedia.ts
 * @see lib/estate/canonicalEstateRegistry.ts
 */

import {
  CANONICAL_PLACE_BACKGROUNDS,
  CANONICAL_PLACE_BACKGROUND_FALLBACKS,
  estateBackgroundPath,
} from "./estatePlaceMedia";
import { backgroundUrlVariants } from "@/lib/roomBackgroundAssets";

export const ESTATE_ROOM_BG = {
  welcomeHome: CANONICAL_PLACE_BACKGROUNDS["welcome-home"]!,
  sunroom: CANONICAL_PLACE_BACKGROUNDS.sunroom!,
  butterflyConservatory: CANONICAL_PLACE_BACKGROUNDS.conservatory!,
  appleOrchard: CANONICAL_PLACE_BACKGROUNDS["apple-orchard"]!,
  celebrationRoom: CANONICAL_PLACE_BACKGROUNDS["celebration-room"]!,
  celebrationGarden: CANONICAL_PLACE_BACKGROUNDS.gardens!,
  gallery: estateBackgroundPath("gallery-background.png"),
  gameRoom: CANONICAL_PLACE_BACKGROUNDS["game-room"]!,
  seatAtPond: CANONICAL_PLACE_BACKGROUNDS["seat-at-pond"]!,
  gazeboJournal: CANONICAL_PLACE_BACKGROUNDS.journal!,
  library: CANONICAL_PLACE_BACKGROUNDS.library!,
  libraryLegacy: CANONICAL_PLACE_BACKGROUNDS["main-staircase"]!,
  readingNook: CANONICAL_PLACE_BACKGROUNDS["reading-nook"]!,
  clearMyMind: CANONICAL_PLACE_BACKGROUNDS["clear-my-mind"]!,
  teaRoom: CANONICAL_PLACE_BACKGROUNDS["tea-room"]!,
  stables: CANONICAL_PLACE_BACKGROUNDS.stables!,
  momentumInstitute: CANONICAL_PLACE_BACKGROUNDS["momentum-institute"]!,
  creativeStudio: CANONICAL_PLACE_BACKGROUNDS["creative-studio"]!,
  evidenceVault: CANONICAL_PLACE_BACKGROUNDS["evidence-vault"]!,
  coffeeHouse: CANONICAL_PLACE_BACKGROUNDS["coffee-house"]!,
  musicRoom: CANONICAL_PLACE_BACKGROUNDS["music-room"]!,
  greenhouse: CANONICAL_PLACE_BACKGROUNDS.greenhouse!,
  portfolio: CANONICAL_PLACE_BACKGROUNDS.portfolio!,
  sparkEstatePhoto: CANONICAL_PLACE_BACKGROUNDS["my-estate"]!,
  peacefulPlacesRain: CANONICAL_PLACE_BACKGROUNDS["peaceful-places"]!,
  artistStudio: estateBackgroundPath("artist-studio-background.png"),
} as const;

/** Room id → background URL */
export const ESTATE_ROOM_BG_BY_ROOM_ID: Record<string, string> = {
  ...CANONICAL_PLACE_BACKGROUNDS,
  "celebration-garden": CANONICAL_PLACE_BACKGROUNDS["celebration-room"]!,
  "growth-journal": CANONICAL_PLACE_BACKGROUNDS.journal!,
  "evidence-bank": CANONICAL_PLACE_BACKGROUNDS["evidence-vault"]!,
  "the-gallery": ESTATE_ROOM_BG.gallery,
  "growth-portfolio": CANONICAL_PLACE_BACKGROUNDS.portfolio!,
  "grow-observatory": CANONICAL_PLACE_BACKGROUNDS.observatory!,
};

/** Legacy plates when primary fails onError. */
export const ESTATE_ROOM_BG_FALLBACKS: Partial<
  Record<keyof typeof ESTATE_ROOM_BG, readonly string[]>
> = {
  celebrationRoom: CANONICAL_PLACE_BACKGROUND_FALLBACKS["celebration-room"],
  greenhouse: CANONICAL_PLACE_BACKGROUND_FALLBACKS.greenhouse,
  butterflyConservatory: CANONICAL_PLACE_BACKGROUND_FALLBACKS.conservatory,
  clearMyMind: CANONICAL_PLACE_BACKGROUND_FALLBACKS["clear-my-mind"],
  library: CANONICAL_PLACE_BACKGROUND_FALLBACKS.library,
  creativeStudio: CANONICAL_PLACE_BACKGROUND_FALLBACKS["creative-studio"],
};

const ROOM_BACKGROUND_FALLBACKS: Record<string, readonly string[]> = {
  greenhouse: ESTATE_ROOM_BG_FALLBACKS.greenhouse ?? [],
  "growth-profile": ESTATE_ROOM_BG_FALLBACKS.greenhouse ?? [],
  conservatory: ESTATE_ROOM_BG_FALLBACKS.butterflyConservatory ?? [],
  "clear-my-mind": ESTATE_ROOM_BG_FALLBACKS.clearMyMind ?? [],
  library: ESTATE_ROOM_BG_FALLBACKS.library ?? [],
  "celebration-room": ESTATE_ROOM_BG_FALLBACKS.celebrationRoom ?? [],
  "celebration-garden": ESTATE_ROOM_BG_FALLBACKS.celebrationRoom ?? [],
  "creative-studio": ESTATE_ROOM_BG_FALLBACKS.creativeStudio ?? [],
};

/** Primary plate plus ordered fallbacks for runtime img onError. */
export function estateRoomBackgroundCandidates(
  roomId: string,
  primaryUrl?: string | null,
): readonly string[] {
  const primary =
    primaryUrl ??
    ESTATE_ROOM_BG_BY_ROOM_ID[roomId] ??
    null;
  if (!primary) return [];
  const fallbacks = ROOM_BACKGROUND_FALLBACKS[roomId] ?? [];
  const urls = [
    ...backgroundUrlVariants(primary),
    ...fallbacks.flatMap((url) => backgroundUrlVariants(url)),
  ];
  return [...new Set(urls)];
}
