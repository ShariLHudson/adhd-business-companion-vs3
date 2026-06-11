import { NextRequest, NextResponse } from "next/server";
import { cleanText } from "@/lib/contentFormat";

// Score & strengthen. Two modes:
//  • assess (default) → named dimensions (Strong/Okay/Weak) + reasons + overall
//  • rewrite          → a stronger version (separate call = reliable)
const ASSESS_SYSTEM = `You are a supportive content coach for an ADHD founder. Assess the user's content and return STRICT JSON only:

{
  "dimensions": [
    {"name": "Hook", "rating": "strong" | "okay" | "weak", "reason": "one short, specific reason"},
    {"name": "Clarity", "rating": "...", "reason": "..."},
    {"name": "Value", "rating": "...", "reason": "..."},
    {"name": "CTA", "rating": "...", "reason": "..."}
  ],
  "overall": "one encouraging sentence — what's working + the single biggest opportunity"
}

Pick 3–5 dimensions that genuinely fit the content type. Be honest but kind — frame weaknesses as opportunities, never harsh. Reasons must be specific to THIS content.`;

function rewriteSystem(focus: string) {
  return `You are a supportive content coach for an ADHD founder. Rewrite the user's content to be noticeably STRONGER — sharper hook, clearer value, tighter call-to-action — while keeping their voice, intent, and key points.${focus ? ` Focus especially on improving: ${focus}.` : ""} Format it ready-to-paste with real line breaks and NO markdown symbols. Return ONLY the rewritten content, nothing else.`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const content = (body.content as string)?.trim() || "";
    const kind = (body.kind as string)?.trim() || "content";
    const mode = (body.mode as string) === "rewrite" ? "rewrite" : "assess";
    const focus = (body.focus as string)?.trim() || "";
    const context = (body.context as string)?.trim() || "";
    const sys = (s: string) => (context ? `${context}\n\n${s}` : s);
    if (!content) {
      return NextResponse.json({ error: "Nothing to score." }, { status: 400 });
    }

    const payload =
      mode === "rewrite"
        ? {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: sys(rewriteSystem(focus)) },
              { role: "user", content: `Type: ${kind}\n\n${content}` },
            ],
            temperature: 0.7,
          }
        : {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: sys(ASSESS_SYSTEM) },
              { role: "user", content: `Type: ${kind}\n\n${content}` },
            ],
            temperature: 0.4,
            response_format: { type: "json_object" as const },
          };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Score API error:", await res.text());
      return NextResponse.json({ error: "Scoring failed." }, { status: 502 });
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    if (mode === "rewrite") {
      return NextResponse.json({ rewrite: cleanText(raw) });
    }

    let parsed: {
      dimensions?: { name?: string; rating?: string; reason?: string }[];
      overall?: string;
    } = {};
    try {
      parsed = JSON.parse(raw || "{}");
    } catch {
      parsed = {};
    }
    const allowed = ["strong", "okay", "weak"];
    return NextResponse.json({
      dimensions: Array.isArray(parsed.dimensions)
        ? parsed.dimensions
            .filter((d) => d && typeof d.name === "string")
            .slice(0, 5)
            .map((d) => ({
              name: d.name,
              rating: allowed.includes((d.rating ?? "").toLowerCase())
                ? (d.rating as string).toLowerCase()
                : "okay",
              reason: d.reason ?? "",
            }))
        : [],
      overall: typeof parsed.overall === "string" ? parsed.overall : "",
    });
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
