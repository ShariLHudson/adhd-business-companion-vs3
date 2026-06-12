import { NextRequest, NextResponse } from "next/server";

import { buildBusinessEcosystemDashboard } from "@/lib/ecosystem/businessEcosystemDashboard";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";
import type { GhlPeriod } from "@/lib/ghl/types";

function parsePeriod(value: string | null): GhlPeriod {
  if (value === "7d" || value === "90d") return value;
  return "30d";
}

export async function GET(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const period = parsePeriod(request.nextUrl.searchParams.get("period"));

  try {
    const payload = await buildBusinessEcosystemDashboard({ period });
    return NextResponse.json(payload);
  } catch (e) {
    console.error("GET /api/ecosystem/dashboard", e);
    return NextResponse.json(
      { error: "Could not build ecosystem dashboard." },
      { status: 500 },
    );
  }
}
