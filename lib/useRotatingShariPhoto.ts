"use client";

import { ASSETS } from "./companionUi";

/** Profile photo only until optional rotation assets ship. */
export function useRotatingShariPhoto(): string {
  return ASSETS.profile;
}
