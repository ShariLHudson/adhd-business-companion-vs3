const HOME_VISIT_KEY = "companion-home-visit-count-v1";
const INTRO_VISIT_LIMIT = 3;

export function getHomeVisitCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(HOME_VISIT_KEY);
  return raw ? Number(raw) || 0 : 0;
}

export function incrementHomeVisitCount(): number {
  if (typeof window === "undefined") return 0;
  const next = getHomeVisitCount() + 1;
  window.localStorage.setItem(HOME_VISIT_KEY, String(next));
  return next;
}

export function shouldShowIntroCopy(count: number): boolean {
  return count <= INTRO_VISIT_LIMIT;
}

import { pickDailyShariPhoto, SHARI_ROTATION_PHOTOS } from "./shariPhotoRotation";

export const SHARI_HOME_PHOTOS = SHARI_ROTATION_PHOTOS;

export function getRotatingShariPhoto(): string {
  return pickDailyShariPhoto();
}
