"use client";

import { useEffect, useState } from "react";
import { ASSETS } from "./companionUi";
import {
  pickCompanionPhoto,
  pickNextCompanionPhoto,
  probeAvailableCompanionPhotos,
  type CompanionPhotoContext,
} from "./companionPhotoLibrary";
import { SHARI_PHOTO_ROTATION_MS } from "./shariPhotoRotation";

type UseRotatingShariPhotoOptions = {
  context?: CompanionPhotoContext;
  /** Rotate through the library on a gentle timer (home welcome). */
  rotate?: boolean;
};

export function useRotatingShariPhoto(
  options: UseRotatingShariPhotoOptions = {},
): string {
  const context = options.context ?? "welcome";
  const rotate = options.rotate ?? true;
  const [photo, setPhoto] = useState(ASSETS.profile);
  const [available, setAvailable] = useState<string[]>([ASSETS.profile]);

  useEffect(() => {
    let cancelled = false;
    void probeAvailableCompanionPhotos().then((found) => {
      if (cancelled) return;
      setAvailable(found);
      setPhoto(
        pickCompanionPhoto(context, {
          available: found,
          preferSessionContinuity: true,
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [context]);

  useEffect(() => {
    if (!rotate || available.length <= 1) return;

    const id = window.setInterval(() => {
      setPhoto((current) =>
        pickNextCompanionPhoto(current, context, available),
      );
    }, SHARI_PHOTO_ROTATION_MS);

    return () => window.clearInterval(id);
  }, [rotate, available, context]);

  return photo;
}
