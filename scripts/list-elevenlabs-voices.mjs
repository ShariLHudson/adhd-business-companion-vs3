#!/usr/bin/env node
/**
 * List ElevenLabs voices in your account — find Shari's voice ID.
 *   node scripts/list-elevenlabs-voices.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const path of [join(root, ".env.local"), join(root, ".env")]) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
    break;
  } catch {
    /* try next */
  }
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY is required in .env.local");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v1/voices", {
  headers: { "xi-api-key": apiKey },
});
if (!res.ok) {
  console.error(`ElevenLabs returned ${res.status}. Check your API key.`);
  process.exit(1);
}

const data = await res.json();
for (const v of data.voices ?? []) {
  const marker = /shari/i.test(v.name ?? "") ? " ← likely Shari" : "";
  console.log(`${v.name} | ${v.voice_id}${marker}`);
}

console.log("\nAdd to .env.local:");
console.log("ELEVENLABS_VOICE_ID=your_voice_id_here");
console.log("\nThen regenerate welcome audio:");
console.log("node scripts/generate-welcome-voice-cache.mjs");
