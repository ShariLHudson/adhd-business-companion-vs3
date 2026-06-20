import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

const CATEGORIES = [
  "content",
  "offers",
  "emails",
  "strategy",
  "systems",
  "execution",
  "other",
];

const SYSTEM = `You generate reusable content templates for a specific audience.

AUDIENCE-FIRST RULES:
- The audience in the user message is PRIMARY — more important than category or tone.
- Use audience-specific language, examples, pain points, desired outcomes, and calls to action.
- Do NOT write generic frameworks that could apply to anyone.
- Each template should be a practical starting framework with clear sections or prompts the user can fill in.
- Format the body with section headers on their own line, then a blank line, then placeholder guidance. Example sections: Hook, Story, Teaching Point, Action Step, Call To Action.

Return STRICT JSON only:
{"templates":[
  {"title":"short name","body":"the template framework with sections or prompts, plain text","category":"content|offers|emails|strategy|systems|execution|other","subcategory":"optional subtype label or empty"}
]}

Plain text in body fields — no markdown.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const context = (body.context as string)?.trim() || "";
    const templateCategory = (body.templateCategory as string)?.trim() || "";
    const categoryHint = templateCategory
      ? ` Generate templates for the "${templateCategory}" category only — use clear section headers (e.g. Hook, Story, Teaching Point, Call To Action).`
      : " Mix categories (content, emails, offers, strategy) with clear section headers.";
    const user = context
      ? `${context}\n\nGenerate 3 reusable template frameworks for this audience.${categoryHint} Honor the voice/tone in the context.`
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
    let parsed: { templates?: Record<string, unknown>[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    const templates = Array.isArray(parsed.templates)
      ? parsed.templates
          .filter((t) => t && typeof t.body === "string")
          .slice(0, 6)
          .map((t) => ({
            title:
              typeof t.title === "string" && t.title.trim()
                ? cleanText(t.title)
                : "Untitled template",
            body: cleanText(t.body as string),
            category: CATEGORIES.includes((t.category as string) ?? "")
              ? (t.category as string)
              : "other",
            subcategory:
              typeof t.subcategory === "string" ? t.subcategory : "",
          }))
      : [];
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates suggest error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
