import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

// Suggest reusable snippets (hooks, CTAs, openers) tuned to the user's business
// + client avatar context.
const SYSTEM = `Generate 6 short, reusable content snippets for an ADHD founder, tuned to their business and audience. Use a mix of hooks, CTAs, openers, and a story starter. Return STRICT JSON only:

{"snippets":[
  {"content":"the line, 1–2 lines, ready to paste","kind":"hook|cta|opener|value|story|objection","tone":"a short tone word","whenToUse":"when this fits","whereToUse":"e.g. Email hook · Social post"}
]}

Match the audience's psychology and buying behavior. Plain text, no markdown.`;

const KINDS = ["hook", "cta", "opener", "value", "story", "objection", "other"];

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const context = (body.context as string)?.trim() || "";
    const user = context || "General small-business audience.";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed." }, { status: 502 });
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: { snippets?: Record<string, unknown>[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    const snippets = Array.isArray(parsed.snippets)
      ? parsed.snippets
          .filter((s) => s && typeof s.content === "string")
          .slice(0, 8)
          .map((s) => ({
            content: cleanText(s.content as string),
            kind: KINDS.includes((s.kind as string) ?? "")
              ? (s.kind as string)
              : "other",
            tone: typeof s.tone === "string" ? s.tone : "",
            whenToUse: typeof s.whenToUse === "string" ? s.whenToUse : "",
            whereToUse: typeof s.whereToUse === "string" ? s.whereToUse : "",
          }))
      : [];
    return NextResponse.json({ snippets });
  } catch (error) {
    console.error("Snippets suggest error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
