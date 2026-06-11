import { NextRequest, NextResponse } from "next/server";
import {
  buildCompanionSystemPrompt,
  type CoachingMode,
} from "@/lib/companionPrompt";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type InputType = "voice" | "text";

const MODE_TEMPERATURE: Record<CoachingMode, number> = {
  today: 0.75,
  focus: 0.7,
  "how-do-i": 0.65,
  playbook: 0.75,
  progress: 0.75,
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const messages = body.messages as ChatMessage[];
    const inputType = (body.inputType as InputType) ?? "text";
    const coachingMode = (body.coachingMode as CoachingMode) ?? "today";
    const emotionalState = body.emotionalState as string | undefined;
    const dayState = body.dayState as string | undefined;
    const aiTone = body.aiTone as string | undefined;
    const helpMode = body.helpMode as string | undefined;
    const supportStyle = body.supportStyle as string | undefined;
    const userName = body.userName as string | undefined;
    const businessContext = body.businessContext as string | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 },
      );
    }

    const systemPrompt = buildCompanionSystemPrompt(coachingMode, inputType, {
      emotionalState,
      dayState,
      aiTone,
      helpMode,
      supportStyle,
      userName,
    });

    const finalSystem = businessContext
      ? `${systemPrompt}\n\n${businessContext}`
      : systemPrompt;

    const baseTemp = MODE_TEMPERATURE[coachingMode] ?? 0.75;
    const temperature =
      inputType === "voice" ? Math.min(baseTemp + 0.05, 0.9) : baseTemp;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: finalSystem }, ...messages],
        temperature,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI error:", await response.text());
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Companion chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
