import { NextRequest, NextResponse } from "next/server";
import {
  buildCompanionSystemPrompt,
  type CoachingMode,
} from "@/lib/companionPrompt";
import { resolveOpenAiApiKey } from "@/lib/openai/resolveOpenAiApiKey";

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
    const apiKey = resolveOpenAiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Add OPENAI_API_KEY to companion-app/.env.local and restart the dev server.",
        },
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
    const intentHint = body.intentHint as string | undefined;
    const toolOfferHint = body.toolOfferHint as string | undefined;
    const workspaceContextHint = body.workspaceContextHint as string | undefined;
    const responseLanguageHint = body.responseLanguageHint as string | undefined;
    const obstacle = body.obstacle as string | undefined;
    const somatic = Boolean(body.somatic);
    const adaptiveModeHint = body.adaptiveModeHint as string | undefined;
    const userHealthHint = body.userHealthHint as string | undefined;
    const decisionHint = body.decisionHint as string | undefined;
    const recoveryHint = body.recoveryHint as string | undefined;
    const environmentHint = body.environmentHint as string | undefined;
    const futureHint = body.futureHint as string | undefined;
    const momentumHint = body.momentumHint as string | undefined;
    const businessOSHint = body.businessOSHint as string | undefined;
    const chiefHint = body.chiefHint as string | undefined;
    const ecosystemGuidance = body.ecosystemGuidance as string | undefined;
    const intelligenceContext = body.intelligenceContext as string | undefined;

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
      intentHint,
      responseLanguageHint,
    });

    // Emotional-attunement hints (presence before strategy).
    const attune =
      somatic || obstacle
        ? `\n\nEMOTIONAL READ (apply Presence-Before-Strategy / Somatic rules): ${
            somatic ? "SOMATIC AVOIDANCE present — validate the body response, normalize it, then at most ONE tiny step. " : ""
          }${obstacle ? `Likely obstacle: ${obstacle}. Speak to this blocker, not the surface task.` : ""}`
        : "";

    const offerBlock = toolOfferHint ? `\n\n${toolOfferHint}` : "";
    const workspaceBlock = workspaceContextHint
      ? `\n\n${workspaceContextHint}`
      : "";
    const adaptiveBlock = adaptiveModeHint ? `\n\n${adaptiveModeHint}` : "";
    const healthBlock = userHealthHint ? `\n\n${userHealthHint}` : "";
    const decisionBlock = decisionHint ? `\n\n${decisionHint}` : "";
    const recoveryBlock = recoveryHint ? `\n\n${recoveryHint}` : "";
    const environmentBlock = environmentHint ? `\n\n${environmentHint}` : "";
    const futureBlock = futureHint ? `\n\n${futureHint}` : "";
    const momentumBlock = momentumHint ? `\n\n${momentumHint}` : "";
    const businessOSBlock = businessOSHint ? `\n\n${businessOSHint}` : "";
    const chiefBlock = chiefHint ? `\n\n${chiefHint}` : "";

    const ecosystemBlock = ecosystemGuidance
      ? `\n\n${ecosystemGuidance}`
      : `${recoveryBlock}${healthBlock}${decisionBlock}${environmentBlock}${futureBlock}${momentumBlock}${businessOSBlock}${chiefBlock}`;
    const intelligenceBlock = intelligenceContext
      ? `\n\n${intelligenceContext}`
      : "";

    const finalSystem = `${
      businessContext ? `${systemPrompt}\n\n${businessContext}` : systemPrompt
    }${attune}${ecosystemBlock}${intelligenceBlock}${adaptiveBlock}${workspaceBlock}${offerBlock}`;

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
