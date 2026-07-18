/**
 * Parking Lot entry mode — Park It (capture) vs review destination.
 * Stored briefly so activity / Help Me Right Now can open capture-first.
 */

export type ParkingLotEntryMode = "review" | "park-it";

const KEY = "companion-parking-lot-entry-mode-v1";

export function setParkingLotEntryMode(mode: ParkingLotEntryMode): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
}

/** Read and clear — default review when unset. */
export function consumeParkingLotEntryMode(): ParkingLotEntryMode {
  if (typeof window === "undefined") return "review";
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (raw === "park-it") return "park-it";
    return "review";
  } catch {
    return "review";
  }
}
