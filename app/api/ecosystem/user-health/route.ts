import { NextRequest, NextResponse } from "next/server";

import {
  loadUserHealthIntelligence,
  recordUserHealthActivity,
  type UserHealthActivityKind,
} from "@/lib/ecosystem/userHealthEngine";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

const VALID_KINDS = new Set<UserHealthActivityKind>([
  "active",
  "login",
  "feature",
  "companion",
  "cancelled",
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
    const intelligence = await loadUserHealthIntelligence();
    return NextResponse.json(intelligence);
  } catch (e) {
    console.error("GET /api/ecosystem/user-health", e);
    return NextResponse.json(
      { error: "Could not load user health intelligence." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const kind = typeof body.kind === "string" ? body.kind : "";

  if (!userId || !VALID_KINDS.has(kind as UserHealthActivityKind)) {
    return NextResponse.json({ error: "userId and valid kind required." }, { status: 400 });
  }

  if (
    userId.includes("@") ||
    /\b(conversation|message|chat|transcript)\b/i.test(userId)
  ) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  try {
    const record = await recordUserHealthActivity({
      userId,
      kind: kind as UserHealthActivityKind,
    });
    return NextResponse.json({
      ok: true,
      healthStatus: record.healthStatus,
      daysSinceLastActivity: record.daysSinceLastActivity,
    });
  } catch (e) {
    console.error("POST /api/ecosystem/user-health", e);
    return NextResponse.json({ error: "Could not record activity." }, { status: 500 });
  }
}
