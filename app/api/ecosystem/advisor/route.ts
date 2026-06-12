import { NextRequest, NextResponse } from "next/server";

import {
  formatFounderAdvisorContextBlock,
  generateFounderAdvisorFallback,
  loadFounderAdvisorSnapshot,
  parseFounderAdvisorResponse,
  callFounderAdvisorLlm,
  type FounderAdvisorHistoryMessage,
} from "@/lib/ecosystem/founderAiAdvisor";
import type { GhlPeriod } from "@/lib/ghl/types";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

const MAX_MESSAGE = 2_000;
const MAX_HISTORY = 10;

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, max);
}

function parsePeriod(value: unknown): GhlPeriod {
  if (value === "7d" || value === "90d") return value;
  return "30d";
}

function sanitizeHistory(raw: unknown): FounderAdvisorHistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_HISTORY)
    .map((entry) => {
      const e = entry as { role?: string; content?: string };
      const role = e.role === "assistant" ? "assistant" : "user";
      const content = cleanText(e.content, MAX_MESSAGE);
      return content ? { role, content } : null;
    })
    .filter((m): m is FounderAdvisorHistoryMessage => m !== null);
}

async function requireAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const message = cleanText(body.message, MAX_MESSAGE);
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const period = parsePeriod(body.period);
  const history = sanitizeHistory(body.history);

  try {
    const { context } = await loadFounderAdvisorSnapshot(period);
    const contextBlock = formatFounderAdvisorContextBlock(context);

    let response;
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      try {
        const raw = await callFounderAdvisorLlm({
          question: message,
          contextBlock,
          history,
        });
        response = parseFounderAdvisorResponse(raw);
      } catch {
        response = generateFounderAdvisorFallback(message, context);
      }
    } else {
      response = generateFounderAdvisorFallback(message, context);
    }

    return NextResponse.json({
      ...response,
      contextGeneratedAt: context.generatedAt,
    });
  } catch (e) {
    console.error("POST /api/ecosystem/advisor", e);
    return NextResponse.json(
      { error: "Could not generate advisor response." },
      { status: 500 },
    );
  }
}
