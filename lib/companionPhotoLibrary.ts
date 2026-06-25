/**
 * Approved companion photo library — intelligent, context-aware selection.
 *
 * Selection priorities:
 * 1. Avoid repetition (track recent usage)
 * 2. Match conversation context
 * 3. Preserve session continuity within a single interaction
 * 4. Rotate naturally across new sessions / days
 */

import { ASSETS } from "./companionUi";

export type CompanionPhotoContext =
  | "welcome"
  | "returning"
  | "planning"
  | "teaching"
  | "celebration"
  | "reflection"
  | "growth"
  | "default";

export type CompanionPhotoEntry = {
  src: string;
  contexts: CompanionPhotoContext[];
};

const CONTEXT_ROTATION: CompanionPhotoContext[] = [
  "welcome",
  "returning",
  "planning",
  "teaching",
  "celebration",
  "reflection",
  "growth",
];

const RECENT_KEY = "companion-shari-recent-photos-v1";
const SESSION_KEY = "companion-shari-session-photo-v1";
const SESSION_DAY_KEY = "companion-shari-session-day-v1";
const PROBE_CACHE_KEY = "companion-shari-photos-v2";
const MAX_RECENT = 4;

/** Optional drops in public/images/shari/ — enable rotation when files are added. */
export const SHARI_OPTIONAL_PHOTOS = Array.from(
  { length: 8 },
  (_, index) => `/images/shari/shari-${index + 1}.jpg`,
);

/** Approved library — extend SHARI_OPTIONAL_PHOTOS as assets ship. */
export const APPROVED_COMPANION_PHOTOS: CompanionPhotoEntry[] = [
  {
    src: ASSETS.profile,
    contexts: [
      "welcome",
      "returning",
      "default",
      "reflection",
      "planning",
      "teaching",
      "growth",
      "celebration",
    ],
  },
  ...SHARI_OPTIONAL_PHOTOS.map((src, index) => ({
    src,
    contexts: [
      CONTEXT_ROTATION[index % CONTEXT_ROTATION.length],
      CONTEXT_ROTATION[(index + 1) % CONTEXT_ROTATION.length],
      "default",
    ],
  })),
];

export function shariImageStateToPhotoContext(
  state: string,
): CompanionPhotoContext {
  switch (state) {
    case "morning":
    case "afternoon":
    case "evening":
      return "returning";
    case "celebration":
    case "birthday":
    case "app_anniversary":
    case "anniversary":
      return "celebration";
    case "support":
    case "encouragement":
    case "overwhelmed_support":
    case "recovery":
      return "reflection";
    case "focus":
      return "planning";
    case "seasonal_spring":
    case "seasonal_summer":
    case "seasonal_fall":
    case "seasonal_winter":
      return "growth";
    default:
      return "default";
  }
}

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecent(recent: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* quota */
  }
}

function recordPhotoUse(src: string) {
  const recent = readRecent().filter((p) => p !== src);
  recent.unshift(src);
  writeRecent(recent);
}

function readSessionPhoto(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const day = sessionStorage.getItem(SESSION_DAY_KEY);
    if (day !== todayKey()) return null;
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSessionPhoto(src: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_DAY_KEY, todayKey());
    sessionStorage.setItem(SESSION_KEY, src);
  } catch {
    /* quota */
  }
}

function probeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(src === ASSETS.profile);
      return;
    }
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/** Probe which approved photos actually exist on disk. */
export async function probeAvailableCompanionPhotos(): Promise<string[]> {
  if (typeof window === "undefined") {
    return [ASSETS.profile];
  }

  try {
    const cached = sessionStorage.getItem(PROBE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt cache */
  }

  const candidates = APPROVED_COMPANION_PHOTOS.map((p) => p.src);
  const results = await Promise.all(
    candidates.map(async (src) => ((await probeImage(src)) ? src : null)),
  );
  const found = results.filter((s): s is string => Boolean(s));
  const library = found.length > 0 ? found : [ASSETS.profile];

  try {
    sessionStorage.setItem(PROBE_CACHE_KEY, JSON.stringify(library));
  } catch {
    /* quota */
  }

  return library;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickFromPool(
  pool: string[],
  context: CompanionPhotoContext,
  recent: string[],
): string {
  if (pool.length === 0) return ASSETS.profile;
  if (pool.length === 1) return pool[0];

  const contextEntries = APPROVED_COMPANION_PHOTOS.filter(
    (e) => pool.includes(e.src) && e.contexts.includes(context),
  );
  const contextPool =
    contextEntries.length > 0 ? contextEntries.map((e) => e.src) : pool;

  const fresh = contextPool.filter((src) => !recent.includes(src));
  const candidates = fresh.length > 0 ? fresh : contextPool;

  const daySeed = todayKey();
  const index = hashSeed(`${daySeed}:${context}`) % candidates.length;
  return candidates[index];
}

export type PickCompanionPhotoOptions = {
  available?: string[];
  /** Reuse the session photo for continuity within a conversation. */
  preferSessionContinuity?: boolean;
  /** Force a new pick (e.g. rotation timer on home). */
  forceNew?: boolean;
};

/**
 * Pick an approved companion photo for the given context.
 * Avoids recent repeats; respects session continuity when requested.
 */
export function pickCompanionPhoto(
  context: CompanionPhotoContext = "default",
  options: PickCompanionPhotoOptions = {},
): string {
  const available = options.available ?? [ASSETS.profile];
  const pool = APPROVED_COMPANION_PHOTOS.map((e) => e.src).filter((src) =>
    available.includes(src),
  );
  const effectivePool = pool.length > 0 ? pool : [ASSETS.profile];

  if (
    options.preferSessionContinuity &&
    !options.forceNew
  ) {
    const sessionPhoto = readSessionPhoto();
    if (sessionPhoto && effectivePool.includes(sessionPhoto)) {
      return sessionPhoto;
    }
  }

  const recent = readRecent();
  const picked = pickFromPool(effectivePool, context, recent);
  recordPhotoUse(picked);
  writeSessionPhoto(picked);
  return picked;
}

/** Next photo in rotation — always avoids the current one when possible. */
export function pickNextCompanionPhoto(
  current: string,
  context: CompanionPhotoContext,
  available: string[],
): string {
  const recent = [current, ...readRecent()];
  const pool = available.filter((src) => src !== current);
  if (pool.length === 0) {
    return pickCompanionPhoto(context, { available, forceNew: true });
  }
  return pickFromPool(pool, context, recent);
}
