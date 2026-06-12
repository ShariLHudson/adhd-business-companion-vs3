import { NextRequest, NextResponse } from "next/server";

import {
  answerFounderHubQuestion,
  loadCrossSystemIntelligenceHub,
} from "@/lib/ecosystem/crossSystemIntelligenceHub";
import type { GhlPeriod } from "@/lib/ghl/types";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

function parsePeriod(value: string | null): GhlPeriod {
  if (value === "7d" || value === "90d") return value;
  return "30d";
}

async function requireAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  const period = parsePeriod(request.nextUrl.searchParams.get("period"));
  const question = request.nextUrl.searchParams.get("question")?.trim();

  try {
    const hub = await loadCrossSystemIntelligenceHub(period);
    if (question) {
      const { answer, relatedInsights } = answerFounderHubQuestion(question, hub);
      return NextResponse.json({ hub, question, answer, relatedInsights });
    }
    return NextResponse.json(hub);
  } catch (e) {
    console.error("GET /api/ecosystem/intelligence-hub", e);
    return NextResponse.json(
      { error: "Could not load intelligence hub." },
      { status: 500 },
    );
  }
}
