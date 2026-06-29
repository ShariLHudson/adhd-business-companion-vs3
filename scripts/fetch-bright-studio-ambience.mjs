#!/usr/bin/env node
/**
 * Download Bright Studio™ ambience from a Songer share link.
 *
 * Usage:
 *   node scripts/fetch-bright-studio-ambience.mjs
 *   node scripts/fetch-bright-studio-ambience.mjs https://songer.co/song/ux81ctn5va8keal0p0bicgwy
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "audio", "peaceful-places");
const OUT_FILE = path.join(OUT_DIR, "bright-studio-ambience.mp3");

const DEFAULT_URL =
  "https://songer.co/song/ux81ctn5va8keal0p0bicgwy";

function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function findAudioUrl(pageUrl) {
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": "companion-app/1.0" },
  });
  if (!res.ok) throw new Error(`Songer page failed: ${res.status}`);
  const html = await res.text();
  const decoded = decodeHtmlEntities(html);

  const audioUrlMatch = decoded.match(
    /"audio_url"\s*:\s*"(https?:\/\/[^"]+\.mp3)"/,
  );
  if (audioUrlMatch?.[1]) return audioUrlMatch[1];

  const cdnMatch = decoded.match(
    /(https?:\/\/cdn2\.songer\.co\/audio\/[^"'\s]+\.mp3)/,
  );
  if (cdnMatch?.[1]) return cdnMatch[1];

  throw new Error(
    "Could not find audio URL in Songer page. Save the MP3 as public/audio/peaceful-places/bright-studio-ambience.mp3",
  );
}

async function main() {
  const pageUrl = process.argv[2] ?? DEFAULT_URL;
  console.log(`Fetching Songer page: ${pageUrl}`);
  const audioUrl = await findAudioUrl(pageUrl);
  console.log(`Found audio: ${audioUrl}`);

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error(`Audio download failed: ${audioRes.status}`);
  const buffer = Buffer.from(await audioRes.arrayBuffer());

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, buffer);
  console.log(`Saved ${OUT_FILE} (${buffer.length} bytes)`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
