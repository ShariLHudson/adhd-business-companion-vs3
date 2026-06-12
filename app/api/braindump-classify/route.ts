import { NextRequest, NextResponse } from "next/server";
import { normalizeCategory } from "@/lib/brainDumpCategories";

// Silently classify a brain-dump note so it can be organized + routed.
const CLASSIFY_PROMPT = `Classify a single brain-dump note from an ADHD entrepreneur. Return ONLY strict JSON:
{"topic": string, "category": string, "contextType": string, "suggestion": string}

- category: choose EXACTLY ONE from this list, and pick the MOST SPECIFIC that fits. NEVER fall back to a generic bucket when a specific one applies:
  Business → Sales · Marketing · Content · Client Work · Finance · Product / Services · Website / Tech · Learning / Research · Admin
  Personal → Health · Family · Home · Personal Errands
  ADHD → Ideas · Brainstorm · Someday / Maybe · Follow Up
  Other (only if nothing above fits)
  Guidance: outreach/calls/closing/proposals = Sales; funnels/ads/SEO/audience/promotion = Marketing; writing posts/emails/captions/scripts = Content; work delivered FOR a specific client = Client Work; money/invoices/taxes/pricing = Finance; the offer itself/features/packaging = Product / Services; site/app/tools/bugs/automation = Website / Tech; reading/courses/competitor or topic research = Learning / Research; ops/scheduling/filing/email cleanup = Admin; appointments/exercise/food/sleep = Health; errands/shopping = Personal Errands; a new idea = Ideas; loose half-thoughts to expand later = Brainstorm; not-now/maybe-later = Someday / Maybe; "circle back with X" = Follow Up.
  Examples: "update sales funnel" → Marketing · "write 7-day email sequence" → Content · "call prospect" → Sales · "fix website form" → Website / Tech · "research ADHD statistics" → Learning / Research · "send invoice" → Finance · "doctor appt" → Health · "buy printer ink" → Personal Errands · "follow up with Sam" → Follow Up.
- topic: one of Health, Work, Family, Business, Personal, Ideas, Other (coarse grouping only).
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
      category: normalizeCategory(parsed.category), // snap to the known taxonomy
      contextType: parsed.contextType ?? "thought",
      suggestion: parsed.suggestion ?? "keep",
    });
  } catch (error) {
    console.error("Brain dump classify error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
