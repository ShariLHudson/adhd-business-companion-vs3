import { NextRequest, NextResponse } from "next/server";

import { loadExecutiveMorningBriefing } from "@/lib/ecosystem/executiveMorningBriefing";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";
import type { GhlPeriod } from "@/lib/ghl/types";

async function requireDashboardAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireDashboardAuth(request);
  if (denied) return denied;

  const raw = request.nextUrl.searchParams.get("period") ?? "30d";
  const period: GhlPeriod =
    raw === "7d" || raw === "90d" ? raw : "30d";

  try {
    const briefing = await loadExecutiveMorningBriefing(period);
    return NextResponse.json(briefing);
  } catch (e) {
    console.error("GET /api/ecosystem/briefing", e);
    return NextResponse.json(
      { error: "Could not load executive morning briefing." },
      { status: 500 },
    );
  }
}
