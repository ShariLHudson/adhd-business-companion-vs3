import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, parseTokens } from "@/lib/google";

/** Chat-driven edit: revise document text and sync to Google. */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  const stored = parseTokens(request.cookies.get(G_COOKIE)?.value);
  if (!stored) {
    return NextResponse.json({ error: "Not connected." }, { status: 401 });
  }

  const body = await request.json();
  const instruction = (body.instruction as string)?.trim();
  const currentContent = (body.currentContent as string) ?? "";
  const title = ((body.title as string) || "Document").slice(0, 120);
  const fileId = (body.fileId as string)?.trim();
  const kind = (body.kind as string) === "sheet" ? "sheet" : "doc";

  if (!instruction || !fileId) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const system = `You edit documents for an ADHD business companion. The user is working in Google ${kind === "sheet" ? "Sheets" : "Docs"} beside chat.

Apply their instruction to the document. Return ONLY the full revised document text — no preamble, no markdown fences, no explanation.

Title: ${title}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `CURRENT DOCUMENT:\n${currentContent}\n\nINSTRUCTION: ${instruction}`,
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    console.error("OpenAI edit error:", await response.text());
    return NextResponse.json(
      { error: "Couldn't apply edit." },
      { status: 502 },
    );
  }

  const data = await response.json();
  const revised = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!revised) {
    return NextResponse.json({ error: "Empty revision." }, { status: 502 });
  }

  const origin = request.nextUrl.origin;
  const sync = await fetch(`${origin}/api/google/update-doc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ fileId, content: revised, kind }),
  });

  if (!sync.ok) {
    return NextResponse.json(
      { error: "Revised but couldn't sync to Google." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Done.",
    content: revised,
  });
}
