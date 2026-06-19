import { NextRequest, NextResponse } from "next/server";
import {
  buildDraftReviewSystemPrompt,
  buildDraftReviewUserPayload,
  parseDraftReviewResponse,
  type DraftReviewContext,
  type DraftReviewMessage,
} from "@/lib/createDraftReview";
import { resolveOpenAiApiKey } from "@/lib/openai/resolveOpenAiApiKey";

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveOpenAiApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }

    const body = await request.json();
    const question = (body.question as string)?.trim() ?? "";
    const context = body.context as DraftReviewContext;
    const history = (body.history as DraftReviewMessage[]) ?? [];

    if (!question) {
      return NextResponse.json({ error: "Question required." }, { status: 400 });
    }
    if (!context?.draftContent?.trim()) {
      return NextResponse.json({ error: "Draft required." }, { status: 400 });
    }

    const system = buildDraftReviewSystemPrompt(context);
    const userContent = buildDraftReviewUserPayload(question, history);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        temperature: 0.55,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Review failed." }, { status: 502 });
    }

    const data = await response.json();
    const raw = (data.choices?.[0]?.message?.content ?? "").trim();
    const parsed = parseDraftReviewResponse(raw);

    return NextResponse.json({
      answer: parsed.answer,
      suggestion: parsed.suggestion,
    });
  } catch (error) {
    console.error("Create draft review error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
