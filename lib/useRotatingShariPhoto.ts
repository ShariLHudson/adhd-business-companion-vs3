"use client";

import { useEffect, useState } from "react";
import { ASSETS } from "./companionUi";
import {
  pickDailyShariPhoto,
  probeAvailableShariPhotos,
  SHARI_PHOTO_ROTATION_MS,
} from "./shariPhotoRotation";

export function useRotatingShariPhoto(
  intervalMs: number = SHARI_PHOTO_ROTATION_MS,
): string {
  const [photo, setPhoto] = useState(() => pickDailyShariPhoto());
  const [available, setAvailable] = useState<string[]>([ASSETS.profile]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void probeAvailableShariPhotos().then((found) => {
      if (cancelled) return;
      setAvailable(found);
      const daily = pickDailyShariPhoto();
      const dailyIndex = found.indexOf(daily);
      const startIndex = dailyIndex >= 0 ? dailyIndex : 0;
      setIndex(startIndex);
      setPhoto(found[startIndex] ?? found[0] ?? ASSETS.profile);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (available.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % available.length;
        setPhoto(available[next] ?? ASSETS.profile);
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [available, intervalMs]);

  return photo;
}
