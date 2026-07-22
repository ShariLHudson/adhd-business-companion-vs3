import { NextRequest, NextResponse } from "next/server";

// The Project Brain: given one project + the user's energy, return exactly ONE
// next action, an optional suggested mode, and an updated status. Strict JSON.

const PROJECT_BRAIN_PROMPT = `You are the Project Brain inside Spark Studio Companions — the "Next Step Engine." You remove decision paralysis for an ADHD founder by deciding what to do NOW. You are NOT a task manager and never show roadmaps or long plans.

Rules:
- Decide ONE primary next action — short, concrete, a single step (e.g. "Write the homepage hook").
- Offer at most TWO backup options, each a short alternative ("Or outline the sections", "Or gather 3 examples"). Never more than 2 backups.
- Adapt to the user's energy and time available:
  • High energy → execution-heavy primary action; lean Focus Session or Time Block.
  • Medium → a structured but simple step.
  • Low → a micro-step with minimal friction (e.g. "Open the draft").
  • Overwhelmed (high overwhelm) → do NOT advance complexity; simplify or pause; suggest Reset.
  • Little time available → keep the primary action small enough to finish in that window.
- Lifecycle: if stuck, reduce scope; if active, keep momentum (Focus/Time Block); if the goal reads done, mark completed and suggest reflection.
- Reduce complexity, never add structure. Never exceed 1 primary + 2 backups.

Return ONLY strict JSON, no prose:
{"nextAction": "<one short action>", "backups": ["<alt 1>", "<alt 2>"], "mode": "focus" | "time-block" | "reset" | "chat" | "none", "status": "not-started" | "in-progress" | "active-focus" | "paused" | "completed"}`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const name = (body.name as string) ?? "Untitled project";
    const goal = (body.goal as string) ?? "";
    const status = (body.status as string) ?? "in-progress";
    const lastAction = (body.lastAction as string) ?? "";
    const energy = (body.energy as string) ?? "medium";
    const overwhelm = (body.overwhelm as string) ?? "low";
    const timeAvailable = (body.timeAvailable as string) ?? "";
    const modifier = body.modifier as string | undefined;

    const modifierLine =
      modifier === "smaller"
        ? "The user said this feels too big — make the next action MUCH smaller and lower-friction."
        : modifier === "blocked"
          ? "The user said they can't do this right now — simplify drastically to the tiniest starting point, or suggest a reset."
          : modifier === "breakdown"
            ? "Break the current next action into its single smallest first step."
            : modifier === "matters"
              ? "Focus only on what matters most for the stated goal — ignore secondary tasks; name the single highest-leverage next action."
              : "";

    const userMessage = `Project: ${name}
Goal: ${goal || "(not set)"}
Current status: ${status}
Last next action: ${lastAction || "none yet"}
User energy: ${energy}. Overwhelm: ${overwhelm}.${timeAvailable ? ` Time available: ${timeAvailable}.` : ""}
${modifierLine}
Decide the one primary next action plus up to two backups now.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: PROJECT_BRAIN_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("Project Brain OpenAI error:", await response.text());
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
      nextAction?: string;
      backups?: string[];
      mode?: string;
      status?: string;
    } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const backups = Array.isArray(parsed.backups)
      ? parsed.backups.filter((b) => typeof b === "string" && b.trim()).slice(0, 2)
      : [];

    return NextResponse.json({
      nextAction: parsed.nextAction ?? "",
      backups,
      mode: parsed.mode ?? "none",
      status: parsed.status ?? status,
    });
  } catch (error) {
    console.error("Project Brain error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
