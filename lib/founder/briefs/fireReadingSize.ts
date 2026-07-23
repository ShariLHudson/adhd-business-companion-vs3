/**
 * Persisted Founder Executive Brief reading size.
 * Default already meets accessibility minimums (22–24px body).
 */

export type FireReadingSize = "smaller" | "default" | "larger";

export const FIRE_READING_SIZE_STORAGE_KEY =
  "spark-estate:founder-fire-reading-size" as const;

export const FIRE_READING_SIZE_DEFAULT: FireReadingSize = "default";

/**
 * CSS custom-property scale multipliers relative to default.
 * Smaller stays at/above the 22px body accessibility floor (default body 23px → 0.96 ≈ 22.1px).
 */
export const FIRE_READING_SIZE_SCALE: Record<FireReadingSize, number> = {
  smaller: 0.96,
  default: 1,
  larger: 1.14,
};

/** Absolute body px floors — Smaller must not drop below 22. */
export const FIRE_READING_BODY_PX: Record<FireReadingSize, number> = {
  smaller: 22,
  default: 23,
  larger: 26,
};

export function isFireReadingSize(value: unknown): value is FireReadingSize {
  return value === "smaller" || value === "default" || value === "larger";
}

export function readFireReadingSize(): FireReadingSize {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return FIRE_READING_SIZE_DEFAULT;
    }
    const raw = window.localStorage.getItem(FIRE_READING_SIZE_STORAGE_KEY);
    if (isFireReadingSize(raw)) return raw;
  } catch {
    /* ignore */
  }
  return FIRE_READING_SIZE_DEFAULT;
}

export function writeFireReadingSize(size: FireReadingSize): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(FIRE_READING_SIZE_STORAGE_KEY, size);
  } catch {
    /* ignore */
  }
}
