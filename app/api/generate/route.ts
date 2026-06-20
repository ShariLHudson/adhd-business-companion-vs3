import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";
import { plainLanguageFormattingHintForPrompt } from "@/lib/plainLanguageFormatting";
import { resolveOpenAiApiKey } from "@/lib/openai/resolveOpenAiApiKey";

// Generic content generator — create any content type (incl. user-created
// types) from a short brief. Returns ready-to-use text.
export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveOpenAiApiKey();
    if (!apiKey) {
      console.error(
        "CREATE ERROR: OPENAI_API_KEY is not set in the server environment.",
      );
      return NextResponse.json(
        {
          error:
            "Draft generation is not configured on the server yet. OPENAI_API_KEY must be set in Vercel → Settings → Environment Variables (Production), then redeploy.",
          code: "missing_api_key",
        },
        { status: 503 },
      );
    }
    const body = await request.json();
    const type = (body.type as string)?.trim() || "piece of content";
    const brief = (body.brief as string)?.trim() || "";
    const tone = (body.tone as string)?.trim() || "match audience";
    const context = (body.context as string)?.trim() || "";
    const contentLanguageHint = (body.contentLanguageHint as string)?.trim() || "";

    const audienceRules = context
      ? `${context}\n\n`
      : "";

    const toneInstruction =
      tone === "match audience" || tone.includes("match")
        ? "Match the audience's natural voice from the context above — do not default to generic motivational tone."
        : `Use a ${tone} tone while staying audience-specific.`;

    const system = `${plainLanguageFormattingHintForPrompt()}

${audienceRules}You create content for a specific audience. The audience context above is PRIMARY — it drives language, examples, pain points, stories, and calls to action. ${toneInstruction}

Do NOT write generic content that could apply to anyone.

Produce a ready-to-use "${type}". If the brief is a template or scaffold, fill it in with real, usable content tuned to the audience.

FORMAT IT EXACTLY AS IT SHOULD LOOK WHEN PASTED INTO ITS DESTINATION (a social platform, an email client, a doc). That means:
- Real line breaks and blank lines between sections — never run everything into one paragraph.
- Put each list item / step / tip on its OWN line.
- Do NOT use any markdown symbols — no **, no *, no #, no ---, no backticks. Destinations show them literally.
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
            content: system,
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
