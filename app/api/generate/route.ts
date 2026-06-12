import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

// Generic content generator — create any content type (incl. user-created
// types) from a short brief. Returns ready-to-use text.
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const type = (body.type as string)?.trim() || "piece of content";
    const brief = (body.brief as string)?.trim() || "";
    const tone = (body.tone as string)?.trim() || "warm and clear";
    const context = (body.context as string)?.trim() || "";
    const contentLanguageHint = (body.contentLanguageHint as string)?.trim() || "";

    const system = `You create content for an ADHD founder. Produce a ready-to-use "${type}" in a ${tone} tone. If the brief is a template or scaffold, fill it in with real, usable content.

FORMAT IT EXACTLY AS IT SHOULD LOOK WHEN PASTED INTO ITS DESTINATION (a social platform, an email client, a doc). That means:
- Real line breaks and blank lines between sections — never run everything into one paragraph.
- Put each list item / step / tip on its OWN line.
- Do NOT use any markdown symbols — no **, no *, no #, no backticks. Destinations show them literally.
- It should be copy-paste-ready as-is.
Return ONLY the content, nothing else.${
      contentLanguageHint ? `\n\n${contentLanguageHint}` : ""
    }`;
    const user = brief
      ? `Brief / scaffold:\n${brief}\n\nWrite the ${type} now.`
      : `Write a strong example ${type} now.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: context ? `${context}\n\n${system}` : system,
          },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Generation failed." }, { status: 502 });
    }
    const data = await res.json();
    const result = cleanText(data.choices?.[0]?.message?.content ?? "");
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
