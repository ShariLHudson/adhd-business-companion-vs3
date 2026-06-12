import { NextRequest, NextResponse } from "next/server";

import { buildBusinessEcosystemDashboard } from "@/lib/ecosystem/businessEcosystemDashboard";
import {
  COST_CATEGORIES,
  loadCostIntelligence,
  recordCostEvent,
  type CostCategory,
  type CostEventSource,
} from "@/lib/ecosystem/costIntelligenceEngine";
import { loadRevenueIntelligence } from "@/lib/ecosystem/revenueIntelligenceEngine";
import { loadUserHealthIntelligence } from "@/lib/ecosystem/userHealthEngine";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

const VALID_SOURCES = new Set<CostEventSource>(["manual", "api", "estimate", "invoice"]);

async function requireDashboardAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireDashboardAuth(request);
  if (denied) return denied;

  try {
    const period = request.nextUrl.searchParams.get("period") ?? "30d";
    const dashboard = await buildBusinessEcosystemDashboard({
      period: period === "7d" || period === "90d" ? period : "30d",
    });

    const [revenueIntel, userHealth] = await Promise.all([
      loadRevenueIntelligence(dashboard.business),
      loadUserHealthIntelligence(),
    ]);

    const totalUsers =
      (revenueIntel.ghlSignals?.payingSubscribers ?? 0) +
      (revenueIntel.ghlSignals?.trialSubscribers ?? 0) ||
      Object.values(userHealth.healthDistribution).reduce((a, b) => a + b, 0);

    const intelligence = await loadCostIntelligence({
      monthlyRevenue: revenueIntel.dashboardMetrics.revenueThisMonth,
      totalUsers: Math.max(totalUsers, 1),
      activeUsers: Math.max(userHealth.dashboardMetrics.activeUsers, 1),
    });

    return NextResponse.json(intelligence);
  } catch (e) {
    console.error("GET /api/ecosystem/cost", e);
    return NextResponse.json(
      { error: "Could not load cost intelligence." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireDashboardAuth(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const category = typeof body.category === "string" ? body.category : "";
  const amount = Number(body.amount);

  if (!COST_CATEGORIES.includes(category as CostCategory) || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "category and numeric amount required." }, { status: 400 });
  }

  const source =
    typeof body.source === "string" && VALID_SOURCES.has(body.source as CostEventSource)
      ? (body.source as CostEventSource)
      : "manual";

  try {
    const event = await recordCostEvent({
      category: category as CostCategory,
      amount,
      source,
      note: typeof body.note === "string" ? body.note : undefined,
      occurredAt: typeof body.occurredAt === "string" ? body.occurredAt : undefined,
    });
    return NextResponse.json({ ok: true, eventId: event.id });
  } catch (e) {
    console.error("POST /api/ecosystem/cost", e);
    return NextResponse.json({ error: "Could not record cost event." }, { status: 500 });
  }
}
