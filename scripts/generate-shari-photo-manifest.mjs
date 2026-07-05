#!/usr/bin/env node
/**
 * Build-time Shari photo manifest — keeps /api/companion-shari-images under
 * Vercel's serverless size limit (avoids tracing all of /public into the function).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_ROOT = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "lib", "generated");
const OUT_FILE = path.join(OUT_DIR, "shariPhotoManifest.json");

const PROFILE = "/shari.jpg";
const GALLERY_SUBDIR = "images/shari/shari-images";
const OPTIONAL = Array.from(
  { length: 8 },
  (_, index) => `/images/shari/shari-${index + 1}.jpg`,
);
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function isImageFilename(name) {
  const lower = name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function publicUrlFromRelative(relativePath) {
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length === 0) return PROFILE;
  const encoded = parts.map((part, index) =>
    index === parts.length - 1 ? encodeURIComponent(part) : part,
  );
  return `/${encoded.join("/")}`;
}

function collectGalleryImages(subdir) {
  const dir = path.join(PUBLIC_ROOT, subdir);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isImageFilename(entry.name))
    .map((entry) => publicUrlFromRelative(`${subdir}/${entry.name}`))
    .sort((a, b) => a.localeCompare(b));
}

function sortUrls(urls) {
  const unique = [...new Set(urls)];
  return unique.sort((a, b) => {
    if (a === PROFILE) return -1;
    if (b === PROFILE) return 1;
    return a.localeCompare(b);
  });
}

function detectImages() {
  const found = [];

  if (fs.existsSync(path.join(PUBLIC_ROOT, "shari.jpg"))) {
    found.push(PROFILE);
  }

  for (const url of OPTIONAL) {
    const relative = url.replace(/^\//, "");
    if (fs.existsSync(path.join(PUBLIC_ROOT, relative))) {
      found.push(url);
    }
  }

  found.push(...collectGalleryImages(GALLERY_SUBDIR));

  const statesDir = path.join(PUBLIC_ROOT, "images/shari/states");
  if (fs.existsSync(statesDir)) {
    found.push(...collectGalleryImages("images/shari/states"));
  }

  return sortUrls(found.length > 0 ? found : [PROFILE]);
}

function fileVersionToken(filePath) {
  try {
    return `${fs.statSync(filePath).mtimeMs}`;
  } catch {
    return "";
  }
}

function detectVersion() {
  const parts = [];
  const profilePath = path.join(PUBLIC_ROOT, "shari.jpg");
  if (fs.existsSync(profilePath)) {
    parts.push(`profile:${fileVersionToken(profilePath)}`);
  }

  const galleryDir = path.join(PUBLIC_ROOT, GALLERY_SUBDIR);
  if (fs.existsSync(galleryDir)) {
    for (const entry of fs.readdirSync(galleryDir, { withFileTypes: true })) {
      if (!entry.isFile() || !isImageFilename(entry.name)) continue;
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

const images = detectImages();
const manifest = {
  images,
  count: images.length,
  version: detectVersion(),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `Shari photo manifest: ${manifest.count} image(s) → lib/generated/shariPhotoManifest.json`,
);
