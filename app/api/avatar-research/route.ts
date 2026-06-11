import { NextRequest, NextResponse } from "next/server";

// AIRA — Avatar Intelligence Research Assistant. Expands a rough client
// description into a 5-layer behavioral model, grounded ONLY in general,
// category-level behavioral archetypes. No personal data, no individual
// identity, no surveillance.
const SYSTEM = `You are a client-research assistant for an ADHD founder. From a rough description of their audience, produce a behavioral CLIENT MODEL based ONLY on general, aggregated, category-level archetypes — never personal data, never a real individual, never claims about specific people. Return STRICT JSON only:

{
  "simpleProfile": "one plain-language sentence describing this client",
  "behaviorPatterns": ["3–5 generalized behavior patterns"],
  "buyingBehavior": ["3–4 points on when/why this type buys or hesitates"],
  "communicationStyle": ["3–5 rules for messaging them (e.g. keep it short, one CTA)"],
  "contentTriggers": {
    "works": ["phrases/angles that resonate"],
    "avoids": ["what tends to NOT work"]
  },
  "guidance": "one compact sentence of messaging guidance to apply across all content"
}

Keep it supportive, concrete, and non-manipulative. No scores, no jargon.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key." }, { status: 500 });
    }
    const body = await request.json();
    const role = (body.role as string)?.trim() || "";
    const sells = (body.sells as string)?.trim() || "";
    const idealClient = (body.idealClient as string)?.trim() || "";
    const traits = Array.isArray(body.traits) ? body.traits.join(", ") : "";

    if (!idealClient && !sells) {
      return NextResponse.json(
        { error: "Add an ideal-client description first." },
        { status: 400 },
      );
    }

    const user = `Business: ${role || "—"}. Sells: ${sells || "—"}.\nAudience description: ${idealClient || "—"}.\nKnown traits: ${traits || "—"}.\nBuild the category-level client model now.`;

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
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Research failed." }, { status: 502 });
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let p: Record<string, unknown> = {};
    try {
      p = JSON.parse(raw);
    } catch {
      p = {};
    }
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 6) : [];
    const ct = (p.contentTriggers ?? {}) as Record<string, unknown>;

    return NextResponse.json({
      simpleProfile:
        typeof p.simpleProfile === "string" ? p.simpleProfile : "",
      behaviorPatterns: arr(p.behaviorPatterns),
      buyingBehavior: arr(p.buyingBehavior),
      communicationStyle: arr(p.communicationStyle),
      contentTriggers: { works: arr(ct.works), avoids: arr(ct.avoids) },
      guidance: typeof p.guidance === "string" ? p.guidance : "",
    });
  } catch (error) {
    console.error("Avatar research error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
