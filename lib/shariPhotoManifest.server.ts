import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  isShariImageFilename,
  publicUrlFromPublicRelative,
  SHARI_GALLERY_SUBDIR,
  SHARI_OPTIONAL_PHOTOS,
  sortShariPhotoUrls,
} from "@/lib/shariPhotoManifest";
import { ASSETS } from "@/lib/companionUi";

function collectGalleryImages(publicRoot: string, subdir: string): string[] {
  const dir = path.join(publicRoot, subdir);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isShariImageFilename(entry.name))
    .map((entry) => publicUrlFromPublicRelative(`${subdir}/${entry.name}`))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Server-side scan of approved Shari photos in /public.
 * More reliable than client Image() probing (no stale browser cache).
 */
export function detectShariImagesOnDisk(): string[] {
  const publicRoot = path.join(process.cwd(), "public");
  const found: string[] = [];

  if (fs.existsSync(path.join(publicRoot, "shari.jpg"))) {
    found.push(ASSETS.profile);
  }

  for (const url of SHARI_OPTIONAL_PHOTOS) {
    const relative = url.replace(/^\//, "");
    if (fs.existsSync(path.join(publicRoot, relative))) {
      found.push(url);
    }
  }

  found.push(...collectGalleryImages(publicRoot, SHARI_GALLERY_SUBDIR));

  const statesDir = path.join(publicRoot, "images/shari/states");
  if (fs.existsSync(statesDir)) {
    found.push(...collectGalleryImages(publicRoot, "images/shari/states"));
  }

  return sortShariPhotoUrls(found.length > 0 ? found : [ASSETS.profile]);
}

function fileVersionToken(filePath: string): string {
  try {
    const stat = fs.statSync(filePath);
    return `${stat.mtimeMs}`;
  } catch {
    return "";
  }
}

/** Cache-bust token derived from on-disk file mtimes. */
export function detectShariPhotoManifestVersion(): string {
  const publicRoot = path.join(process.cwd(), "public");
  const parts: string[] = [];

  const profilePath = path.join(publicRoot, "shari.jpg");
  if (fs.existsSync(profilePath)) {
    parts.push(`profile:${fileVersionToken(profilePath)}`);
  }

  const galleryDir = path.join(publicRoot, SHARI_GALLERY_SUBDIR);
  if (fs.existsSync(galleryDir)) {
    for (const entry of fs.readdirSync(galleryDir, { withFileTypes: true })) {
      if (!entry.isFile() || !isShariImageFilename(entry.name)) continue;
      parts.push(
        `g:${entry.name}:${fileVersionToken(path.join(galleryDir, entry.name))}`,
      );
    }
  }

  if (!parts.length) return "0";
  return crypto
    .createHash("sha1")
    .update(parts.sort().join("|"))
    .digest("hex")
    .slice(0, 12);
}
