/** Canonical place id for Ocean Conservatory */
export const OCEAN_CONSERVATORY_PLACE_ID = "conservatory" as const;

export const OCEAN_CONSERVATORY_BACKGROUND_FRAGMENT =
  "aquarium-room-background" as const;

export function isOceanConservatoryRoom(roomId?: string | null): boolean {
  if (!roomId) return false;
  const id = roomId.trim().toLowerCase();
  return (
    id === OCEAN_CONSERVATORY_PLACE_ID ||
    id === "aquarium-room" ||
    id === "ocean-conservatory" ||
    id === "ocean conservatory"
  );
}

export function isOceanConservatoryBackground(url?: string | null): boolean {
  if (!url) return false;
  return url.includes(OCEAN_CONSERVATORY_BACKGROUND_FRAGMENT);
}
