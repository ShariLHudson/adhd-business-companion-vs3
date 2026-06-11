import { NextRequest, NextResponse } from "next/server";

// Voice output — Shari speaks. Uses ElevenLabs TTS. Returns audio/mpeg.
// Set ELEVENLABS_API_KEY (and optionally ELEVENLABS_VOICE_ID) in .env.local.
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // a warm default voice

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Voice is not configured." },
        { status: 500 },
      );
    }
    const body = await request.json();
    const text = ((body.text as string) ?? "").trim().slice(0, 2500);
    if (!text) {
      return NextResponse.json({ error: "Nothing to speak." }, { status: 400 });
    }
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

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
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
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
