/** Canonical place id for Ocean Conservatory */
export const OCEAN_CONSERVATORY_PLACE_ID = "conservatory" as const;

export const OCEAN_CONSERVATORY_BACKGROUND_FRAGMENT =
  "aquarium-room-background" as const;

export function isOceanConservatoryRoom(roomId?: string | null): boolean {
  return roomId === OCEAN_CONSERVATORY_PLACE_ID;
}

export function isOceanConservatoryBackground(url?: string | null): boolean {
  if (!url) return false;
  return url.includes(OCEAN_CONSERVATORY_BACKGROUND_FRAGMENT);
}
