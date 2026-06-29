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

const bodyPart1 = `Before we do anything else, I want to personally welcome you into your Ecosystem.
Take a look around for a moment. This sunroom is one of my favorite places because it reminds me to slow down, breathe, and simply enjoy where I am. I hope it becomes a place that feels familiar and comforting to you, too.
If you're anything like me, life can get noisy.
There are probably ideas bouncing around in your head...
Things you want to remember...
Projects you haven't finished...
And probably a few things you've been meaning to do for weeks.
Sometimes it can feel like your brain never really gets a chance to rest.
I understand that feeling because I've lived it.
I was diagnosed with ADHD when I was 72 years old. Looking back, so many things suddenly made sense. I realized I wasn't lazy, broken, or lacking motivation.
My brain simply worked differently, and no one had ever handed me the instruction manual.
As I searched for help, I found plenty of apps that could make lists, organize tasks, or answer questions. They were useful, but something was missing.
None of them felt like a trusted companion.
I wanted something that could help me think through challenges, encourage me on difficult days, celebrate progress, and gently guide me back whenever I got distracted—without ever making me feel guilty for being human.
So I decided to build the Ecosystem I wish I'd had many years ago.
That's what this place is.`;

const bodyPart2 = `You'll notice there are different rooms throughout the Ecosystem. Each one has its own purpose. Some are designed to help you clear your mind. Others help you plan your day, stay focused, make decisions, learn something new, create, or move your business forward.
You don't need to learn everything today.
You don't have to use every room.
Simply use whatever helps you most in the moment.
One thing that's very important to me is that this Ecosystem never makes you feel behind.
Life happens.
Energy changes.
Motivation comes and goes.
Some days you'll accomplish amazing things, and other days just showing up is enough.
Both kinds of days are welcome here.
You'll also discover places that don't ask anything of you at all. Peaceful places where you can simply sit, listen to the rain, watch butterflies drift through a conservatory, relax by a crackling fire, or enjoy a quiet moment before jumping back into your day.
Because sometimes the most important thing we can do isn't accomplish more...
It's simply take a moment to breathe.
My hope is that this becomes more than an app.
I hope it becomes a place you genuinely enjoy visiting—a place where you feel understood, encouraged, and supported.
A place that helps you move forward one small step at a time.
So, take your time.
There's no rush.
Whenever you're ready, we'll take the next step together.
And thank you for giving me the opportunity to be part of your journey.
I'll see you again soon.`;

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
