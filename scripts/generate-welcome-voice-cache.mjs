#!/usr/bin/env node
/**
 * Generate cached Welcome Room voice MP3s via ElevenLabs (Shari's voice).
 *
 *   node scripts/generate-welcome-voice-cache.mjs
 *   node scripts/list-elevenlabs-voices.mjs
 *
 * Requires in .env.local:
 *   ELEVENLABS_API_KEY
 *   ELEVENLABS_VOICE_ID  — your cloned Shari voice (not the stock default)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "audio", "welcome-room");

function loadEnvLocal() {
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
      return;
    } catch {
      /* try next */
    }
  }
}

loadEnvLocal();

const apiKey = process.env.ELEVENLABS_API_KEY;
let voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();

if (!apiKey) {
  console.error("ELEVENLABS_API_KEY is required in .env.local");
  process.exit(1);
}

async function listVoices() {
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) throw new Error(`Could not list voices: ${res.status}`);
  const data = await res.json();
  return data.voices ?? [];
}

async function resolveVoiceId() {
  if (voiceId) return voiceId;

  console.warn(
    "ELEVENLABS_VOICE_ID is not set — looking for a voice named Shari…",
  );
  const voices = await listVoices();
  const shari = voices.find((v) => /shari/i.test(v.name ?? ""));
  if (shari?.voice_id) {
    console.log(`Found voice "${shari.name}" (${shari.voice_id})`);
    console.log("Add to .env.local:");
    console.log(`ELEVENLABS_VOICE_ID=${shari.voice_id}`);
    return shari.voice_id;
  }

  console.error("\nNo Shari voice found. Available voices:");
  for (const v of voices) {
    console.error(`  - ${v.name} (${v.voice_id})`);
  }
  console.error(
    "\nSet ELEVENLABS_VOICE_ID in .env.local to your cloned Shari voice, then re-run.",
  );
  process.exit(1);
}

const greeting =
  "Hi... I'm really glad you're here. Come on in.";

const bodyPart1 = `Before we jump into anything, I just wanted to take a couple of minutes to welcome you personally.
If you're anything like me, life can feel noisy sometimes. There are ideas pulling at you, unfinished projects, things you meant to do yesterday, and that feeling that your brain is trying to keep track of everything all at once.
I know that feeling because I've lived it.
For a long time, I thought I just needed to try harder, get more organized, or become more disciplined. It wasn't until later in life that I discovered ADHD had been quietly shaping so much of my experience.
That changed everything.
Not because it solved my problems overnight, but because it finally helped me understand why my brain worked the way it did.
As I looked for tools to help, I found plenty of apps that could manage tasks, make lists, or answer questions.
But I couldn't find anything that felt like someone was walking beside me.
I wanted something that understood that some days you need a strategy, some days you need encouragement, and some days you simply need someone to help you untangle everything that's spinning around in your head.
So I decided to build the Companion I wished I'd had.
That's what this place is.
It isn't here to judge you.
It isn't here to tell you you're behind.
It isn't here to remind you of everything you haven't finished.
It's here to help you work with your brain instead of constantly feeling like you're working against it.`;

const bodyPart2 = `As you explore, you'll discover different rooms throughout the Companion. Each one has a purpose. Some help you clear your mind. Others help you focus, plan your day, make decisions, or move your business forward.
You don't have to learn everything today.
There isn't a right place to begin.
We'll simply start with whatever feels most helpful to you right now.
I also want you to know something that's important to me.
This Companion isn't designed to replace human connection.
It's designed to provide a steady, supportive place you can return to whenever you need a little clarity, encouragement, or direction.
Whether you're having an amazing day or one where everything feels upside down, you're welcome here.
Thank you for giving me the opportunity to be part of your journey.
I truly hope this becomes a place that feels familiar, comforting, and genuinely helpful every time you visit.
Whenever you're ready, we'll take the next step together.
I'll meet you in the Companion.`;

const jobs = [
  { file: "welcome-greeting.mp3", text: greeting },
  { file: "welcome-part-01.mp3", text: bodyPart1 },
  { file: "welcome-part-02.mp3", text: bodyPart2 },
];

async function synthesize(text, id) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${id}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return Buffer.from(await res.arrayBuffer());
}

voiceId = await resolveVoiceId();
mkdirSync(outDir, { recursive: true });

for (const job of jobs) {
  const outPath = join(outDir, job.file);
  if (existsSync(outPath)) {
    console.log(`Skipping ${job.file} (already exists)`);
    continue;
  }
  process.stdout.write(`Synthesizing ${job.file}… `);
  const audio = await synthesize(job.text, voiceId);
  writeFileSync(outPath, audio);
  console.log(`done (${audio.length} bytes)`);
}

console.log(`\nWrote ${jobs.length} files to public/audio/welcome-room/`);
console.log("Hard-refresh the Welcome Room to hear the full letter in Shari's voice.");
