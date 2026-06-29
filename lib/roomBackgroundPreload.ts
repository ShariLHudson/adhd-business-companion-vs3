import { preferredBackgroundPreloadUrl } from "./roomBackgroundAssets";

const preloaded = new Set<string>();

function preloadKey(url: string): string {
  return url.split("?")[0] ?? url;
}

/**
 * Warm the browser cache for a room background — safe to call repeatedly.
 * Uses WebP when the source is a PNG path.
 */
export function preloadRoomBackground(imageUrl: string): void {
  if (typeof window === "undefined" || !imageUrl) return;
  const href = preferredBackgroundPreloadUrl(imageUrl);
  const key = preloadKey(href);
  if (preloaded.has(key)) return;
  preloaded.add(key);

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  link.setAttribute("data-room-bg-preload", key);
  document.head.appendChild(link);

  const img = new Image();
  img.decoding = "async";
  img.src = href;
}

export function preloadRoomBackgrounds(urls: readonly string[]): void {
  for (const url of urls) preloadRoomBackground(url);
}

/** After first paint — warm common homestead room art without blocking startup. */
export function scheduleHomesteadRoomBackgroundWarmup(
  urls: readonly string[],
  delayMs = 1800,
): () => void {
  if (typeof window === "undefined") return () => {};
  const id = window.setTimeout(() => {
    preloadRoomBackgrounds(urls);
  }, delayMs);
  return () => window.clearTimeout(id);
}
