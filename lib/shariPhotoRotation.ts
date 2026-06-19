import { ASSETS } from "./companionUi";

/** Default profile plus optional drops in public/images/shari/. */
export const SHARI_ROTATION_PHOTOS = [
  ASSETS.profile,
  ...Array.from(
    { length: 8 },
    (_, index) => `/images/shari/shari-${index + 1}.jpg`,
  ),
];

export const SHARI_PHOTO_ROTATION_MS = 9000;

export function pickDailyShariPhoto(now = new Date()): string {
  const today = now.toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SHARI_ROTATION_PHOTOS.length;
  return SHARI_ROTATION_PHOTOS[index]!;
}

export function probeAvailableShariPhotos(
  candidates: readonly string[] = SHARI_ROTATION_PHOTOS,
): Promise<string[]> {
  if (typeof window === "undefined") {
    return Promise.resolve([ASSETS.profile]);
  }

  return Promise.all(
    candidates.map(
      (src) =>
        new Promise<string | null>((resolve) => {
          const image = new Image();
          image.onload = () => resolve(src);
          image.onerror = () => resolve(null);
          image.src = src;
        }),
    ),
  ).then((results) => {
    const found = results.filter((src): src is string => Boolean(src));
    return found.length ? found : [ASSETS.profile];
  });
}
