"use client";

import { useCompanionPresence } from "@/lib/useCompanionPresence";
import type { CompanionPhotoContext } from "@/lib/companionPhotoLibrary";

type UseRotatingShariPhotoOptions = {
  context?: CompanionPhotoContext;
  /** Rotate through the library on a gentle timer (home welcome). */
  rotate?: boolean;
};

/**
 * @deprecated Prefer useCompanionPresence — preserves legacy home rotation API.
 */
export function useRotatingShariPhoto(
  options: UseRotatingShariPhotoOptions = {},
): string {
  const context = options.context ?? "welcome";
  const presence = useCompanionPresence({
    calmHome: true,
    homeState:
      context === "welcome" ? "FIRST_VISIT" : "RETURNING_ACTIVE",
  });
  return presence.src;
}
