import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

// Email generator — a structured PACKAGE, not a single reply. Two modes:
//  • package  → subjects, hooks, 3 body versions, CTAs, PS line, follow-up
//  • sequence → a 3-email follow-up sequence built from a base email

const PACKAGE_SYSTEM = `You write marketing/business emails for an ADHD founder. Given a goal, audience, and tone, return a complete email PACKAGE as STRICT JSON only — no prose, no markdown:

{
  "subjects": ["5 subject lines, one of EACH angle in this order: soft, direct, curiosity, urgency, storytelling"],
  "hooks": ["3 opening-line options that pull the reader in"],
  "versions": [
    {"label": "Simple", "body": "clear and short"},
    {"label": "Standard", "body": "balanced structure"},
    {"label": "High-conversion", "body": "persuasive, emotional, strong CTA"}
  ],
  "ctas": ["exactly 3 CTAs in order: soft nudge, medium, strong/direct"],
  "psLine": "one optional P.S. line (great for sales emails)",
  "followUp": "a short follow-up email to send if they don't reply in 2–3 days"
}

Bodies are ready-to-send plain text (line breaks, no markdown). Use [name]/[brackets] for placeholders.`;

const SEQUENCE_SYSTEM = `You write email follow-up sequences for an ADHD founder. Given the goal and a base email, return a 3-email FOLLOW-UP sequence as STRICT JSON only:

{
  "sequence": [
    {"label": "Follow-up 1 — gentle nudge (day 2–3)", "subject": "...", "body": "..."},
    {"label": "Follow-up 2 — add value (day 5–6)", "subject": "...", "body": "..."},
    {"label": "Follow-up 3 — last call (day 8–10)", "subject": "...", "body": "..."}
  ]
}

Each escalates appropriately. Plain text bodies. Use [name]/[brackets] for placeholders.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const mode = (body.mode as string) === "sequence" ? "sequence" : "package";
    const goal = (body.goal as string)?.trim() || "a helpful email";
    const audience = (body.audience as string)?.trim() || "the recipient";
    const tone = (body.tone as string)?.trim() || "warm and clear";
    const personalization = (body.personalization as string)?.trim() || "";
    const baseEmail = (body.baseEmail as string)?.trim() || "";
    const context = (body.context as string)?.trim() || "";

    const system = mode === "sequence" ? SEQUENCE_SYSTEM : PACKAGE_SYSTEM;
    const user =
      mode === "sequence"
        ? `Goal: ${goal}\nAudience: ${audience}\nBase email:\n${baseEmail}\n\nWrite the 3-email follow-up sequence now.`
        : `Goal: ${goal}\nAudience: ${audience}\nTone: ${tone}.${personalization ? ` Also: ${personalization}.` : ""}\nWrite the full email package now.`;

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
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Generation failed." }, { status: 502 });
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    if (mode === "sequence") {
      const seq = Array.isArray(parsed.sequence) ? parsed.sequence : [];
      return NextResponse.json({
        sequence: seq
          .filter(
            (s): s is { label?: string; subject?: string; body?: string } =>
              !!s && typeof (s as { body?: string }).body === "string",
          )
          .slice(0, 5)
          .map((s) => ({
            label: s.label ?? "Follow-up",
            subject: s.subject ?? "",
            body: cleanText(s.body ?? ""),
          })),
      });
    }

    const versions = Array.isArray(parsed.versions) ? parsed.versions : [];
    return NextResponse.json({
      subjects: Array.isArray(parsed.subjects)
        ? (parsed.subjects as string[]).slice(0, 5)
        : [],
      hooks: Array.isArray(parsed.hooks)
        ? (parsed.hooks as string[]).slice(0, 3)
        : [],
      versions: versions
        .filter(
          (v): v is { label?: string; body?: string } =>
            !!v && typeof (v as { body?: string }).body === "string",
        )
        .slice(0, 3)
        .map((v) => ({ label: v.label ?? "Version", body: cleanText(v.body ?? "") })),
      ctas: Array.isArray(parsed.ctas) ? (parsed.ctas as string[]).slice(0, 3) : [],
      psLine: typeof parsed.psLine === "string" ? parsed.psLine : "",
      followUp: cleanText(typeof parsed.followUp === "string" ? parsed.followUp : ""),
    });
  } catch (error) {
    console.error("Email generator error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
