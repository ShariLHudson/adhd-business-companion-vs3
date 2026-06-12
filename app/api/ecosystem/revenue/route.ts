import { NextRequest, NextResponse } from "next/server";

import { buildBusinessEcosystemDashboard } from "@/lib/ecosystem/businessEcosystemDashboard";
import {
  loadRevenueIntelligence,
  recordRevenueEvent,
  REVENUE_EVENT_KINDS,
  type RevenueEventKind,
  type RevenueEventSource,
} from "@/lib/ecosystem/revenueIntelligenceEngine";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

const VALID_SOURCES = new Set<RevenueEventSource>([
  "ghl",
  "stripe",
  "paypal",
  "manual",
  "internal",
]);

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
    const intelligence = await loadRevenueIntelligence(dashboard.business);
    return NextResponse.json(intelligence);
  } catch (e) {
    console.error("GET /api/ecosystem/revenue", e);
    return NextResponse.json(
      { error: "Could not load revenue intelligence." },
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

  const kind = typeof body.kind === "string" ? body.kind : "";
  const amount = Number(body.amount);

  if (!REVENUE_EVENT_KINDS.includes(kind as RevenueEventKind) || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "kind and numeric amount required." }, { status: 400 });
  }

  const source =
    typeof body.source === "string" && VALID_SOURCES.has(body.source as RevenueEventSource)
      ? (body.source as RevenueEventSource)
      : "manual";

  const customerRef =
    typeof body.customerRef === "string" ? body.customerRef.trim() : undefined;

  if (customerRef?.includes("@")) {
    return NextResponse.json({ error: "Invalid customer ref." }, { status: 400 });
  }

  try {
    const event = await recordRevenueEvent({
      kind: kind as RevenueEventKind,
      amount,
      recurringAmount:
        body.recurringAmount != null ? Number(body.recurringAmount) : undefined,
      source,
      customerRef,
      occurredAt:
        typeof body.occurredAt === "string" ? body.occurredAt : undefined,
    });
    return NextResponse.json({ ok: true, eventId: event.id });
  } catch (e) {
    console.error("POST /api/ecosystem/revenue", e);
    return NextResponse.json({ error: "Could not record revenue event." }, { status: 500 });
  }
}
