import { ASSETS } from "./companionUi";
import {
  pickCompanionPhoto,
  probeAvailableCompanionPhotos,
  SHARI_OPTIONAL_PHOTOS,
  type CompanionPhotoContext,
} from "./companionPhotoLibrary";

export { SHARI_OPTIONAL_PHOTOS };

export const SHARI_ROTATION_PHOTOS = [ASSETS.profile, ...SHARI_OPTIONAL_PHOTOS];

export const SHARI_PHOTO_ROTATION_MS = 9000;

export function pickDailyShariPhoto(
  context: CompanionPhotoContext = "welcome",
): string {
  return pickCompanionPhoto(context, { preferSessionContinuity: true });
}

/** Probe which approved companion photos exist; caches per session. */
export function probeAvailableShariPhotos(): Promise<string[]> {
  return probeAvailableCompanionPhotos();
}
