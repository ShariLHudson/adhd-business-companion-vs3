/** Butterfly House — room experience video (ESTATE-VID-002). */

export const BUTTERFLY_HOUSE_PLACE_ID = "butterfly-house" as const;

export const BUTTERFLY_HOUSE_VIDEO =
  "/Videos/butterfly-house-video.mp4" as const;

export const BUTTERFLY_HOUSE_POSTER =
  "/backgrounds/butterfly-house-background.png" as const;

export const BUTTERFLY_HOUSE_BACKGROUND_FRAGMENT =
  "butterfly-house-background" as const;

export function isButterflyHouseRoom(roomId?: string | null): boolean {
  if (!roomId) return false;
  const id = roomId.trim().toLowerCase();
  return (
    id === BUTTERFLY_HOUSE_PLACE_ID ||
    id === "butterfly-house" ||
    id === "butterfly house" ||
    id === "butterfly-conservatory"
  );
}

export function isButterflyHouseBackground(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.includes(BUTTERFLY_HOUSE_BACKGROUND_FRAGMENT) ||
    url.includes("butterfly-house-video")
  );
}
