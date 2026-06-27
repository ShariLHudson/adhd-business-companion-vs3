import { readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const raw = readFileSync(envPath, "utf8");
const modified = statSync(envPath).mtime.toLocaleString();

console.log(`Reading: ${envPath}`);
console.log(`Last saved: ${modified}\n`);

for (const line of raw.split(/\r?\n/)) {
  if (!line.includes("ELEVENLABS")) continue;
  const i = line.indexOf("=");
  const key = line.slice(0, i).trim();
  let value = line.slice(i + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  console.log(
    `${key}: length=${value.length}, prefix=${value.slice(0, 4)}, hasWhitespace=${/\s/.test(value)}`,
  );
  if (key === "ELEVENLABS_API_KEY" && !value.startsWith("sk_")) {
    console.log("  ^ WRONG: API key must start with sk_ (you may have pasted the Voice ID here)");
  }
  if (key === "ELEVENLABS_VOICE_ID" && value.startsWith("sk_")) {
    console.log("  ^ WRONG: Voice ID must not start with sk_ (you may have pasted the API key here)");
  }
}

const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[trimmed.slice(0, eq).trim()] = value;
}

const apiKey = env.ELEVENLABS_API_KEY ?? "";
const voiceId = env.ELEVENLABS_VOICE_ID ?? "";

if (!apiKey) {
  console.log("\nMissing ELEVENLABS_API_KEY in the SAVED file.");
  process.exit(1);
}
if (!voiceId) {
  console.log("\nMissing ELEVENLABS_VOICE_ID in the SAVED file.");
  console.log("Add at bottom: ELEVENLABS_VOICE_ID=paste_from_Copy_voice_ID");
  process.exit(1);
}

// Scoped keys often lack user_read / voices_read — verify with a tiny TTS call instead.
const ttsRes = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: "ok",
      model_id: "eleven_multilingual_v2",
    }),
  },
);

console.log(`API test (TTS): ${ttsRes.status} ${ttsRes.statusText}`);

if (ttsRes.ok) {
  console.log("API key and voice ID look good.");
  console.log("\nReady for: npm run welcome-voice:cache");
  process.exit(0);
}

let detail = "";
try {
  const body = await ttsRes.json();
  detail = body?.detail?.message ?? "";
  const status = body?.detail?.status ?? body?.detail?.code ?? "";
  if (status === "invalid_api_key" || ttsRes.status === 401) {
    console.log(
      "\nAPI key rejected — in ElevenLabs create a key with Text to Speech access, or use Unrestricted.",
    );
  } else if (status === "voice_not_found" || ttsRes.status === 404) {
    console.log(
      "\nVoice ID not found in this ElevenLabs account.",
    );
    console.log(
      "My Voices → Shari → ⋮ → Copy voice ID (not the API key).",
    );
  } else if (detail) {
    console.log(`\nElevenLabs says: ${detail}`);
  }
} catch {
  console.log("\nCould not verify TTS. Check key permissions and voice ID.");
}
process.exit(1);
