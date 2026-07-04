/**
 * Compress full-screen room PNGs to WebP (max width 1920).
 * Run: node scripts/optimize-room-backgrounds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const TARGETS = [
  "public/backgrounds/sunroom-background.png",
  "public/backgrounds/study-hall-background.png",
  "public/backgrounds/life-experience-room.png",
  "public/backgrounds/room-library-estate-background.png",
  "public/backgrounds/water-seat-at-pond-background.png",
  "public/backgrounds/gallery-background.png",
  "public/backgrounds/gazebo-journal-background.png",
  "public/backgrounds/evidence-vault-background.png",
  "public/backgrounds/room-create-studio-background.png",
  "public/backgrounds/space-celebration-garden-background.png",
  "public/backgrounds/audio-rain-background.png",
  "public/backgrounds/greenhouse-background.png",
  "public/backgrounds/room-coffee-house-background.png",
  "public/backgrounds/music-room-background.png",
];

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

for (const rel of TARGETS) {
  const input = path.join(root, rel);
  if (!fs.existsSync(input)) {
    console.warn("skip (missing):", rel);
    continue;
  }
  const output = input.replace(/\.png$/i, ".webp");
  const before = fs.statSync(input).size;
  await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(output);
  const after = fs.statSync(output).size;
  console.log(
    `${rel} → ${path.basename(output)}: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  );
}
