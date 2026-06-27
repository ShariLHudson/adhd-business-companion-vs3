import { NextRequest, NextResponse } from "next/server";
import {
  ELEVENLABS_TTS_MODEL,
  ELEVENLABS_VOICE_SETTINGS,
  isShariVoiceConfigured,
  resolveElevenLabsVoiceId,
} from "@/lib/companionElevenLabsVoice";

// Voice output — Shari speaks. Uses ElevenLabs TTS. Returns audio/mpeg.
// Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (Shari clone) in .env.local.

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Voice is not configured." },
        { status: 500 },
      );
    }
    if (!isShariVoiceConfigured()) {
      console.warn(
        "[TTS] ELEVENLABS_VOICE_ID is not set — using generic fallback voice.",
      );
    }
    const body = await request.json();
    const text = ((body.text as string) ?? "").trim().slice(0, 2500);
    if (!text) {
      return NextResponse.json({ error: "Nothing to speak." }, { status: 400 });
    }
    const voiceId = resolveElevenLabsVoiceId();

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_TTS_MODEL,
          voice_settings: ELEVENLABS_VOICE_SETTINGS,
        }),
      },
    );

    if (!res.ok) {
      console.error("ElevenLabs error:", await res.text());
      return NextResponse.json({ error: "Voice failed." }, { status: 502 });
    }
    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
