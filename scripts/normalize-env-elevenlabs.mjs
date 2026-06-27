#!/usr/bin/env node
/**
 * Fix duplicate ELEVENLABS_API_KEY lines — keep the last (newest) key + voice ID.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

const apiKeys = [];
const voiceIds = [];
const out = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) {
    out.push(line);
    continue;
  }
  if (trimmed.startsWith("ELEVENLABS_API_KEY=")) {
    apiKeys.push(trimmed.slice("ELEVENLABS_API_KEY=".length).trim());
    continue;
  }
  if (trimmed.startsWith("ELEVENLABS_VOICE_ID=")) {
    voiceIds.push(trimmed.slice("ELEVENLABS_VOICE_ID=".length).trim());
    continue;
  }
  out.push(line);
}

const apiKey = apiKeys.filter(Boolean).at(-1);
const voiceId = voiceIds.filter(Boolean).at(-1);

if (!apiKey) {
  console.error("No ELEVENLABS_API_KEY found in .env.local");
  process.exit(1);
}

// Insert API key after OPENAI_API_KEY if present, else at top
let insertAt = 0;
for (let i = 0; i < out.length; i++) {
  if (out[i].startsWith("OPENAI_API_KEY=")) {
    insertAt = i + 1;
    break;
  }
}
out.splice(insertAt, 0, `ELEVENLABS_API_KEY=${apiKey}`);

if (voiceId) {
  out.push(`ELEVENLABS_VOICE_ID=${voiceId}`);
}

writeFileSync(envPath, out.join("\n") + "\n", "utf8");

console.log("Fixed .env.local:");
console.log(`  ELEVENLABS_API_KEY: kept last of ${apiKeys.length} (${apiKey.length} chars)`);
console.log(
  voiceId
    ? `  ELEVENLABS_VOICE_ID: ${voiceId.length} chars`
    : "  ELEVENLABS_VOICE_ID: missing — add from Copy voice ID on Shari",
);
