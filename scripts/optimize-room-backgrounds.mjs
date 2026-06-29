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
  "public/backgrounds/clear-my-mind-background.png",
  "public/backgrounds/plan-my-day-background.png",
  "public/backgrounds/life-experience-room.png",
  "public/backgrounds/memory-story-room-background.png",
  "public/backgrounds/capture-a-moment-background.png",
  "public/backgrounds/gallery-background.png",
  "public/backgrounds/growth-background.png",
  "public/backgrounds/journal-background.png",
  "public/backgrounds/evidence-vault-background.png",
  "public/backgrounds/creative-studio-background.png",
  "public/backgrounds/celebration-garden-background.png",
  "public/backgrounds/focus-my-brain-games-background.png",
  "public/backgrounds/audio-rain-background.png",
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
