import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

// Audience-first snippet suggestions — language, pain points, and CTAs must
// match the selected audience, not generic motivational copy.
const SYSTEM = `You generate short, reusable content snippets for a specific audience.

AUDIENCE-FIRST RULES:
- The audience in the user message is PRIMARY — more important than snippet type or tone.
- Use audience-specific language, examples, pain points, desired outcomes, and calls to action.
- Do NOT write generic content that could apply to anyone.
- BAD (generic): "Feeling overwhelmed by perfectionism? Remember, done is better than perfect."
- GOOD (ADHD business): "ADHD entrepreneurs often spend hours trying to perfect a task before sharing it. What would happen if you shipped version one today?"

Return STRICT JSON only:
{"snippets":[
  {"content":"the line, 1–2 lines, ready to paste","kind":"hook|cta|opener|value|story|objection","tone":"optional short tone word or empty","whenToUse":"when this fits","whereToUse":"e.g. Email hook · Social post"}
]}

Plain text in content fields — no markdown.`;

const KINDS = ["hook", "cta", "opener", "value", "story", "objection", "other"];

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const context = (body.context as string)?.trim() || "";
    const user = context
      ? `${context}\n\nGenerate 6 snippets for this audience. Mix hooks, CTAs, openers, value lines, a story starter, and an objection response. Honor the voice/tone in the context.`
      : "No audience context provided — use ADHD Business Clients with ADHD-aware language.";

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
