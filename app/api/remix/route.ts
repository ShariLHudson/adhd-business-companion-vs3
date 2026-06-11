import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

// Remix — convert a piece of content into another format while keeping the
// core message. Target can be a preset or any custom content type name.
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const content = (body.content as string)?.trim() || "";
    const target = (body.target as string)?.trim() || "social post";
    const context = (body.context as string)?.trim() || "";
    if (!content) {
      return NextResponse.json({ error: "Nothing to remix." }, { status: 400 });
    }

    const system = `You convert content between formats for an ADHD founder. Convert the user's content into a "${target}", keeping the core message, intent, and key points. Adapt structure, length, and tone to fit the new format naturally. If the target is a sequence, produce the numbered parts.

FORMAT IT EXACTLY AS IT SHOULD LOOK WHEN PASTED INTO ITS DESTINATION:
- Real line breaks and blank lines between sections; each item on its own line.
- NO markdown symbols (no **, *, #, backticks) — destinations show them literally.
- Copy-paste-ready as-is.
Return ONLY the converted content, nothing else.${context ? `\n\n${context}` : ""}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Remix failed." }, { status: 502 });
    }
    const data = await res.json();
    const result = cleanText(data.choices?.[0]?.message?.content ?? "");
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Remix error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
