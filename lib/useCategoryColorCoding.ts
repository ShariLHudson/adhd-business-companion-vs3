"use client";

import { useVisualMode } from "@/lib/useVisualMode";
import { isCategoryColorCodingEnabled } from "@/lib/visualColorCoding";

/** True when Category / Adaptive color coding should appear in the UI. */
export function useCategoryColorCoding(): boolean {
  return isCategoryColorCodingEnabled(useVisualMode());
}
