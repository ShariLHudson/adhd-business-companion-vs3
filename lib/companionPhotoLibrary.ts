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
import {
  SHARI_OPTIONAL_PHOTOS,
  sortShariPhotoUrls,
} from "./shariPhotoManifest";

export { SHARI_OPTIONAL_PHOTOS } from "./shariPhotoManifest";

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
const PROBE_CACHE_KEY = "companion-shari-photos-v4";
const WORKSPACE_LAST_KEY = "companion-presence-workspace-last-v2";
const GLOBAL_LAST_KEY = "companion-presence-global-last-v1";
const MAX_RECENT = 4;

/** Workspaces that rotate Shari's photo on each entry. */
export type CompanionPresenceWorkspace = "clear-my-mind" | "my-thoughts";

const WORKSPACE_PHOTO_CONTEXT: Record<
  CompanionPresenceWorkspace,
  CompanionPhotoContext
> = {
  "clear-my-mind": "reflection",
  "my-thoughts": "planning",
};

/** Optional drops in public/images/shari/ — enable rotation when files are added. */
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
  ...SHARI_OPTIONAL_PHOTOS.map((src, index): CompanionPhotoEntry => ({
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

/** Probe which approved photos actually exist on disk (client fallback). */
export async function probeAvailableCompanionPhotos(
  options?: { forceRefresh?: boolean },
): Promise<string[]> {
  if (typeof window === "undefined") {
    return [ASSETS.profile];
  }

  if (!options?.forceRefresh) {
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
  } else {
    try {
      sessionStorage.removeItem(PROBE_CACHE_KEY);
    } catch {
      /* ignore */
    }
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

/**
 * Resolve available photos — prefers server manifest API, then client probe.
 * Always re-validates when only one image was cached.
 */
export async function resolveAvailableCompanionPhotos(options?: {
  forceRefresh?: boolean;
}): Promise<string[]> {
  if (typeof window === "undefined") {
    return [ASSETS.profile];
  }

  const force = options?.forceRefresh ?? false;

  if (!force) {
    try {
      const cached = sessionStorage.getItem(PROBE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as string[];
        if (Array.isArray(parsed) && parsed.length > 1) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }

  try {
    const res = await fetch("/api/companion-shari-images", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { images?: string[] };
      if (Array.isArray(data.images) && data.images.length > 0) {
        try {
          sessionStorage.setItem(PROBE_CACHE_KEY, JSON.stringify(data.images));
        } catch {
          /* quota */
        }
        return data.images;
      }
    }
  } catch {
    /* offline / dev without server */
  }

  return probeAvailableCompanionPhotos({ forceRefresh: force });
}

export function companionPhotoFilename(src: string): string {
  const segment = src.split("/").filter(Boolean).pop();
  return segment ?? src;
}

function sortedPhotoPool(available: string[]): string[] {
  return sortShariPhotoUrls(available);
}

function pickNextInRotation(pool: string[], previous: string | null): string {
  if (pool.length === 0) return ASSETS.profile;
  if (pool.length === 1) return pool[0]!;
  if (!previous || !pool.includes(previous)) return pool[0]!;
  const index = pool.indexOf(previous);
  return pool[(index + 1) % pool.length]!;
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

function readGlobalLastPhoto(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(GLOBAL_LAST_KEY);
  } catch {
    return null;
  }
}

function writeGlobalLastPhoto(src: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GLOBAL_LAST_KEY, src);
  } catch {
    /* quota */
  }
}

function readWorkspaceLastPhoto(
  workspace: CompanionPresenceWorkspace,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(WORKSPACE_LAST_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[workspace] ?? null;
  } catch {
    return null;
  }
}

function writeWorkspaceLastPhoto(
  workspace: CompanionPresenceWorkspace,
  src: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(WORKSPACE_LAST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[workspace] = src;
    sessionStorage.setItem(WORKSPACE_LAST_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export type WorkspaceEntryPhotoResult = {
  src: string;
  reason: string;
  previousImage: string | null;
  fallbackOnly: boolean;
  photoContext: CompanionPhotoContext;
};

/**
 * Pick a photo when the user enters Clear My Mind™ or My Thoughts™.
 * Deterministic rotation — next image in sorted list, never same twice in a row.
 */
export function pickWorkspaceEntryPhoto(
  workspace: CompanionPresenceWorkspace,
  available: string[],
): WorkspaceEntryPhotoResult {
  const photoContext = WORKSPACE_PHOTO_CONTEXT[workspace];
  const workspacePrevious = readWorkspaceLastPhoto(workspace);
  const previousImage = readGlobalLastPhoto() ?? workspacePrevious;
  const pool = sortedPhotoPool(
    available.length > 0 ? available : [ASSETS.profile],
  );

  if (pool.length <= 1) {
    const src = pool[0]!;
    writeWorkspaceLastPhoto(workspace, src);
    writeGlobalLastPhoto(src);
    return {
      src,
      reason: "only-one-image-available",
      previousImage,
      fallbackOnly: true,
      photoContext,
    };
  }

  const picked = pickNextInRotation(pool, previousImage);
  writeWorkspaceLastPhoto(workspace, picked);
  writeGlobalLastPhoto(picked);

  return {
    src: picked,
    reason: previousImage
      ? `workspace-entry-rotate:${previousImage}→${picked}`
      : "workspace-first-entry",
    previousImage,
    fallbackOnly: false,
    photoContext,
  };
}

/** Temporary QA logging — remove after Companion Presence rotation is verified. */
export function logCompanionPresenceDebug(
  workspace: CompanionPresenceWorkspace,
  detectedImages: string[],
  result: WorkspaceEntryPhotoResult,
): void {
  if (process.env.NODE_ENV === "production") return;
  console.info("[CompanionPresence Debug]", {
    workspace,
    detectedImages,
    previousImage: result.previousImage,
    selectedImage: result.src,
    fallbackUsed: result.fallbackOnly,
    reason: result.reason,
  });
}

/** @deprecated Use logCompanionPresenceDebug */
export function logCompanionPresenceDev(
  workspace: CompanionPresenceWorkspace,
  availableImages: string[],
  result: WorkspaceEntryPhotoResult,
): void {
  logCompanionPresenceDebug(workspace, availableImages, result);
}
