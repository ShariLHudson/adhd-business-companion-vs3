import { NextRequest, NextResponse } from "next/server";

// Silently classify a brain-dump note so it can be organized + routed.
const CLASSIFY_PROMPT = `Classify a single brain-dump note from an ADHD entrepreneur. Return ONLY strict JSON:
{"topic": string, "category": string, "contextType": string, "suggestion": string}
- topic: one of Health, Work, Family, Business, Personal, Ideas, Other.
- category: a short specific bucket (e.g. Calls, Appointments, Emails, Tasks, Ideas, Worries, Follow-ups, Other).
- contextType: one of task, reminder, thought, urgent, emotional, idea.
- suggestion: where this should go next — one of "timeblock" (schedule it), "project" (actionable, multi-step), "reminder" (time-based), "keep" (just a thought, leave it).
No prose, JSON only.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const text = (body.text as string) ?? "";
    if (!text.trim()) {
      return NextResponse.json({ error: "Empty note." }, { status: 400 });
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
          { role: "system", content: CLASSIFY_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Classify failed." }, { status: 502 });
    }
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
      topic?: string;
      category?: string;
      contextType?: string;
      suggestion?: string;
    } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    return NextResponse.json({
      topic: parsed.topic ?? "Other",
      category: parsed.category ?? "Other",
      contextType: parsed.contextType ?? "thought",
      suggestion: parsed.suggestion ?? "keep",
    });
  } catch (error) {
    console.error("Brain dump classify error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
