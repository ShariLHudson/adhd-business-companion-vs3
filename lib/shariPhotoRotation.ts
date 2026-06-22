import { ASSETS } from "./companionUi";

const PROBE_CACHE_KEY = "companion-shari-photos-v2";

/** Optional drops in public/images/shari/ — enable rotation when files are added. */
export const SHARI_OPTIONAL_PHOTOS = Array.from(
  { length: 8 },
  (_, index) => `/images/shari/shari-${index + 1}.jpg`,
);

export const SHARI_ROTATION_PHOTOS = [ASSETS.profile, ...SHARI_OPTIONAL_PHOTOS];

export const SHARI_PHOTO_ROTATION_MS = 9000;

export function pickDailyShariPhoto(): string {
  return ASSETS.profile;
}

/** Returns profile immediately; optional shari-N.jpg files are not probed until shipped. */
export function probeAvailableShariPhotos(): Promise<string[]> {
  if (typeof window === "undefined") {
    return Promise.resolve([ASSETS.profile]);
  }

  try {
    window.sessionStorage.removeItem("companion-shari-photos-v1");
  } catch {
    /* ignore */
  }

  try {
    const cached = window.sessionStorage.getItem(PROBE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Promise.resolve(parsed);
      }
    }
  } catch {
    /* ignore corrupt cache */
  }

  const found = [ASSETS.profile];
  try {
    window.sessionStorage.setItem(PROBE_CACHE_KEY, JSON.stringify(found));
  } catch {
    /* quota */
  }
  return Promise.resolve(found);
}
