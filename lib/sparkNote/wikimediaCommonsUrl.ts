/**
 * Build print- and screen-safe Wikimedia Commons image URLs.
 * Prefer direct upload.wikimedia.org thumb paths — Special:FilePath redirects
 * can leave a blank framed <img> in live view while print still paints.
 */

import { md5Hex } from "./md5Hex";

/** Canonical Commons file title (spaces → underscores). */
export function canonicalCommonsFileTitle(title: string): string {
  return title.trim().replace(/ /g, "_");
}

/**
 * Direct thumb URL on upload.wikimedia.org — no Special:FilePath redirect chain.
 */
export function wikimediaCommonsDirectThumbUrl(
  title: string,
  widthPx = 900,
): string {
  const name = canonicalCommonsFileTitle(title);
  const hash = md5Hex(name);
  const a = hash[0]!;
  const ab = hash.slice(0, 2);
  // Commons rounds requested widths; 960 matches Special:FilePath?width=900 redirects.
  const thumbWidth = widthPx <= 640 ? 640 : widthPx <= 800 ? 800 : 960;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${name}/${thumbWidth}px-${name}`;
}

/** True when URL is a Wikimedia Special:FilePath (redirect) link. */
export function isWikimediaSpecialFilePath(url: string): boolean {
  return /commons\.wikimedia\.org\/wiki\/Special:FilePath\//i.test(url);
}

/**
 * Normalize image URLs for live + print parity.
 * Converts Special:FilePath → direct upload thumb when possible.
 */
export function normalizeSparkCardImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  const special = trimmed.match(
    /commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^?&#]+)(?:\?[^#]*)?/i,
  );
  if (special?.[1]) {
    const fileTitle = decodeURIComponent(special[1]);
    const widthMatch = trimmed.match(/[?&]width=(\d+)/i);
    const width = widthMatch ? Number(widthMatch[1]) : 900;
    return wikimediaCommonsDirectThumbUrl(fileTitle, width);
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return trimmed;
}
