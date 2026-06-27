#!/usr/bin/env node
/**
 * Paste ElevenLabs credentials directly into .env.local (fixes unsaved-editor issues).
 *
 *   npm run welcome-voice:setup
 */
import { createInterface } from "node:readline/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { stdin as input, stdout as output } from "node:process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function looksLikeApiKey(value) {
  return value.startsWith("sk_") && value.length >= 40;
}

function looksLikeVoiceId(value) {
  return !value.startsWith("sk_") && value.length >= 15 && value.length <= 30;
}

function validateOrSwap(apiKey, voiceId) {
  if (looksLikeApiKey(apiKey) && looksLikeVoiceId(voiceId)) {
    return { apiKey, voiceId, swapped: false };
  }
  if (looksLikeApiKey(voiceId) && looksLikeVoiceId(apiKey)) {
    console.log("\nLooks like you pasted them in reverse — swapping automatically.\n");
    return { apiKey: voiceId, voiceId: apiKey, swapped: true };
  }
  return null;
}

const rl = createInterface({ input, output });

console.log("Two different values from ElevenLabs:\n");
console.log("  1) API key  — Developers → API Keys → Create → Copy (starts with sk_, ~50 chars)");
console.log("  2) Voice ID — My Voices → Shari → Copy voice ID (starts with YeGCy, ~20 chars)\n");

let apiKey = "";
let voiceId = "";

while (!looksLikeApiKey(apiKey)) {
  apiKey = (
    await rl.question("ELEVENLABS_API_KEY (sk_... from Create → Copy): ")
  ).trim();
  if (!looksLikeApiKey(apiKey)) {
    console.log(
      `  That does not look like an API key (need sk_ prefix, ~50 chars; got ${apiKey.length} chars, prefix ${apiKey.slice(0, 4)}).`,
    );
    if (looksLikeVoiceId(apiKey)) {
      console.log("  That looks like the Voice ID — use the API key from Developers → API Keys instead.");
    }
  }
}

while (!looksLikeVoiceId(voiceId)) {
  voiceId = (
    await rl.question("ELEVENLABS_VOICE_ID (Copy voice ID on Shari): ")
  ).trim();
  if (!looksLikeVoiceId(voiceId)) {
    console.log(
      `  That does not look like a voice ID (got ${voiceId.length} chars, prefix ${voiceId.slice(0, 4)}).`,
    );
    if (looksLikeApiKey(voiceId)) {
      console.log("  That looks like the API key — use Copy voice ID on the Shari voice instead.");
    }
  }
}

rl.close();

const validated = validateOrSwap(apiKey, voiceId);
if (validated) {
  apiKey = validated.apiKey;
  voiceId = validated.voiceId;
}

let lines = [];
try {
  lines = readFileSync(envPath, "utf8").split(/\r?\n/);
} catch {
  console.error("No .env.local found at", envPath);
  process.exit(1);
}

const out = lines.filter((line) => {
  const t = line.trim();
  return (
    !t.startsWith("ELEVENLABS_API_KEY=") &&
    !t.startsWith("ELEVENLABS_VOICE_ID=")
  );
});

let insertAt = 0;
for (let i = 0; i < out.length; i++) {
  if (out[i].startsWith("OPENAI_API_KEY=")) {
    insertAt = i + 1;
    break;
  }
}
out.splice(insertAt, 0, `ELEVENLABS_API_KEY=${apiKey}`);
out.push(`ELEVENLABS_VOICE_ID=${voiceId}`);

writeFileSync(envPath, out.join("\n") + "\n", "utf8");

console.log("\nWrote to", envPath);
console.log(`  API key: ${apiKey.length} characters`);
console.log(`  Voice ID: ${voiceId.length} characters`);
console.log("\nNow run: npm run welcome-voice:check");
