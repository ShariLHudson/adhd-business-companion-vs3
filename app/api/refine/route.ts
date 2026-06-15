import { NextRequest, NextResponse } from "next/server";

// The editing / help layer: refine, rewrite, simplify, or break down a piece of
// text. Returns the transformed text only — no preamble, no explanation.
type Action = "refine" | "rewrite" | "simplify" | "break-down" | "modify";

const INSTRUCTION: Record<Action, string> = {
  refine:
    "Improve clarity, flow, and quality. Keep the original meaning and roughly the same length. Fix awkward phrasing.",
  rewrite:
    "Rewrite it fresh with the same intent and key points, but different wording and structure.",
  simplify:
    "Make it simpler and shorter. Plain, everyday language, no jargon. Keep only the core message.",
  "break-down":
    "Break it into clear, concrete steps or smaller parts. Return a short numbered or bulleted list, ordered if there's a natural sequence.",
  modify:
    "Apply the user's specific edit request. Change only what they asked for; keep the rest intact.",
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }

    const body = await request.json();
    const text = (body.text as string) ?? "";
    const action = body.action as Action;
    const context = (body.context as string)?.trim() || "";
    const customInstruction = (body.instruction as string)?.trim() || "";
    if (!text.trim()) {
      return NextResponse.json({ error: "Nothing to edit." }, { status: 400 });
    }

    let system: string;
    if (action === "modify") {
      if (!customInstruction) {
        return NextResponse.json(
          { error: "Instruction required." },
          { status: 400 },
        );
      }
      system = `You edit drafts for an ADHD entrepreneur. Apply this change to the text: ${customInstruction}

Return the FULL updated draft only — no quotes, no preamble, no commentary. Keep the same format (line breaks, lists) unless the change requires otherwise.${
        context ? `\n\n${context}` : ""
      }`;
    } else {
      if (!INSTRUCTION[action]) {
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
      }
      system = `You are an editing assistant for an ADHD entrepreneur. ${INSTRUCTION[action]} Return ONLY the edited text — no quotes, no preamble, no commentary.${context ? `\n\n${context}` : ""}`;
    }

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
          { role: "user", content: text },
        ],
        temperature: action === "rewrite" ? 0.8 : 0.5,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Edit failed." }, { status: 502 });
    }
    const data = await response.json();
    const result = (data.choices?.[0]?.message?.content ?? "").trim();
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Refine error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
