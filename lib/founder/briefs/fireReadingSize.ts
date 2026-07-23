/**
 * Persisted Founder Executive Brief reading size.
 * Default ("comfortable") is the ADHD-friendly baseline (24px body).
 * Small / Smaller sit under Comfortable for members who want a denser view.
 */

export type FireReadingSize =
  | "comfortable"
  | "small"
  | "smaller"
  | "larger"
  | "largest";

/** Legacy sizes still may exist in localStorage from prior builds. */
type LegacyFireReadingSize = "default";

export const FIRE_READING_SIZE_STORAGE_KEY =
  "spark-estate:founder-fire-reading-size" as const;

export const FIRE_READING_SIZE_DEFAULT: FireReadingSize = "comfortable";

/**
 * Menu order: Comfortable first, then reduce options, then enlarge.
 */
export const FIRE_READING_SIZE_OPTIONS: readonly FireReadingSize[] = [
  "comfortable",
  "small",
  "smaller",
  "larger",
  "largest",
] as const;

export const FIRE_READING_SIZE_LABELS: Record<FireReadingSize, string> = {
  comfortable: "Comfortable",
  small: "Small",
  smaller: "Smaller",
  larger: "Larger",
  largest: "Largest",
};

/**
 * CSS custom-property scale multipliers relative to comfortable.
 */
export const FIRE_READING_SIZE_SCALE: Record<FireReadingSize, number> = {
  smaller: 0.85,
  small: 0.92,
  comfortable: 1,
  larger: 1.1,
  largest: 1.22,
};

/** Absolute body px targets per size. */
export const FIRE_READING_BODY_PX: Record<FireReadingSize, number> = {
  smaller: 18,
  small: 20,
  comfortable: 24,
  larger: 26,
  largest: 28,
};

export function isFireReadingSize(value: unknown): value is FireReadingSize {
  return (
    value === "comfortable" ||
    value === "small" ||
    value === "smaller" ||
    value === "larger" ||
    value === "largest"
  );
}

function migrateLegacySize(raw: string): FireReadingSize | null {
  if (raw === "default") return "comfortable";
  return null;
}

export function normalizeFireReadingSize(value: unknown): FireReadingSize {
  if (isFireReadingSize(value)) return value;
  if (typeof value === "string") {
    const migrated = migrateLegacySize(value);
    if (migrated) return migrated;
  }
  return FIRE_READING_SIZE_DEFAULT;
}

export function readFireReadingSize(): FireReadingSize {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return FIRE_READING_SIZE_DEFAULT;
    }
    const raw = window.localStorage.getItem(FIRE_READING_SIZE_STORAGE_KEY);
    const size = normalizeFireReadingSize(raw);
    // Rewrite legacy keys so storage stays on the current vocabulary.
    if (raw && (raw as LegacyFireReadingSize | FireReadingSize) !== size && raw === "default") {
      writeFireReadingSize(size);
    }
    return size;
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
