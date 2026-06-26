/**
 * Companion Photo Catalog™ — one source of truth for Shari portrait URLs.
 * Every workspace consumes this catalog; no independent probes or caches.
 */

import {
  resolveAvailableCompanionPhotos,
  type CompanionPhotoContext,
} from "./companionPhotoLibrary";
import { ASSETS } from "./companionUi";

export const COMPANION_PHOTOS_UPDATED = "companion-photos-updated";

const PROBE_CACHE_KEY = "companion-shari-photos-v4";
const SESSION_KEY = "companion-shari-session-photo-v1";
const SESSION_DAY_KEY = "companion-shari-session-day-v1";
const RECENT_KEY = "companion-shari-recent-photos-v1";
const DAY_PRESENCE_KEY = "companion-presence-day-v1";
const WORKSPACE_LAST_KEY = "companion-presence-workspace-last-v2";
const GLOBAL_LAST_KEY = "companion-presence-global-last-v1";

export type CompanionPhotoCatalogSnapshot = {
  /** Approved image URLs that exist on disk. */
  images: string[];
  /** Bust browser/CDN cache when files change on the server. */
  version: string;
  /** Primary portrait — default shari.jpg when present, else first gallery image. */
  primarySrc: string;
  loadedAt: string;
  revision: number;
};

let revision = 0;

export function companionPhotoCacheKeys(): string[] {
  return [
    PROBE_CACHE_KEY,
    SESSION_KEY,
    SESSION_DAY_KEY,
    RECENT_KEY,
    DAY_PRESENCE_KEY,
    WORKSPACE_LAST_KEY,
    GLOBAL_LAST_KEY,
  ];
}

/** Clear client-side photo caches without broadcasting. */
export function clearCompanionPhotoStorage(): void {
  if (typeof globalThis.window === "undefined") return;
  try {
    sessionStorage.removeItem(PROBE_CACHE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_DAY_KEY);
    sessionStorage.removeItem(WORKSPACE_LAST_KEY);
    sessionStorage.removeItem(GLOBAL_LAST_KEY);
    localStorage.removeItem(RECENT_KEY);
    localStorage.removeItem(DAY_PRESENCE_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** Clear caches and notify every workspace to reload portraits. */
export function invalidateCompanionPhotoCache(): void {
  clearCompanionPhotoStorage();
  if (typeof globalThis.window === "undefined") return;
  revision += 1;
  globalThis.window.dispatchEvent(
    new CustomEvent(COMPANION_PHOTOS_UPDATED, { detail: { revision } }),
  );
}

export function readCompanionPhotoRevision(): number {
  return revision;
}

export function primaryCompanionPhotoSrc(images: string[]): string {
  if (images.includes(ASSETS.profile)) return ASSETS.profile;
  return images[0] ?? ASSETS.profile;
}

export async function loadCompanionPhotoCatalog(options?: {
  forceRefresh?: boolean;
}): Promise<CompanionPhotoCatalogSnapshot> {
  const force = options?.forceRefresh ?? false;
  if (force) {
    clearCompanionPhotoStorage();
  }

  let version = "0";
  let images: string[] = [];

  if (typeof globalThis.window !== "undefined") {
    try {
      const res = await fetch("/api/companion-shari-images", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          images?: string[];
          version?: string;
        };
        if (Array.isArray(data.images) && data.images.length > 0) {
          images = data.images;
          version = data.version ?? version;
        }
      }
    } catch {
      /* offline */
    }
  }

  if (!images.length) {
    images = await resolveAvailableCompanionPhotos({ forceRefresh: force });
  }

  return {
    images,
    version,
    primarySrc: primaryCompanionPhotoSrc(images),
    loadedAt: new Date().toISOString(),
    revision: readCompanionPhotoRevision(),
  };
}

export function companionPhotoSrcWithVersion(src: string, version: string): string {
  if (!version || version === "0") return src;
  if (/[?&]v=/.test(src)) return src;
  const join = src.includes("?") ? "&" : "?";
  return `${src}${join}v=${encodeURIComponent(version)}`;
}

export function subscribeCompanionPhotoCatalog(
  listener: (revision: number) => void,
): () => void {
  if (typeof globalThis.window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ revision?: number }>).detail;
    listener(detail?.revision ?? readCompanionPhotoRevision());
  };
  globalThis.window.addEventListener(COMPANION_PHOTOS_UPDATED, handler);
  return () => globalThis.window.removeEventListener(COMPANION_PHOTOS_UPDATED, handler);
}

/** @internal tests */
export function resetCompanionPhotoRevisionForTests(): void {
  revision = 0;
}
