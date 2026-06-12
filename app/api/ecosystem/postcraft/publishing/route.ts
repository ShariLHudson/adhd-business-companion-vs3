import { NextRequest, NextResponse } from "next/server";

import {
  executeFounderPublishingAction,
  loadPostCraftPublishingIntelligence,
  receivePostCraftStatus,
  type FounderPublishingAction,
  type PostCraftPublishStatus,
} from "@/lib/ecosystem/postcraftLivePublishing";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

const FOUNDER_ACTIONS = new Set<FounderPublishingAction>([
  "publish_now",
  "schedule",
  "retry",
  "cancel",
  "view_status",
]);

async function requireAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  try {
    const intelligence = await loadPostCraftPublishingIntelligence();
    return NextResponse.json(intelligence);
  } catch (e) {
    console.error("GET /api/ecosystem/postcraft/publishing", e);
    return NextResponse.json(
      { error: "Could not load publishing intelligence." },
      { status: 500 },
    );
  }
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

  const draftId = typeof body.draftId === "string" ? body.draftId : "";
  if (!draftId) {
    return NextResponse.json({ error: "draftId required." }, { status: 400 });
  }

  if (body.webhook === true) {
    const status = typeof body.status === "string" ? body.status : "";
    const record = await receivePostCraftStatus({
      draftId,
      status: status as PostCraftPublishStatus,
      postcraftId: typeof body.postcraftId === "string" ? body.postcraftId : undefined,
      scheduledAt: typeof body.scheduledAt === "string" ? body.scheduledAt : undefined,
      publishedAt: typeof body.publishedAt === "string" ? body.publishedAt : undefined,
      results:
        body.results && typeof body.results === "object"
          ? (body.results as { views?: number; clicks?: number; engagementScore?: number })
          : undefined,
      error: typeof body.error === "string" ? body.error : undefined,
    });
    const intelligence = await loadPostCraftPublishingIntelligence();
    return NextResponse.json({ ok: true, record, intelligence });
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!FOUNDER_ACTIONS.has(action as FounderPublishingAction)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  try {
    const result = await executeFounderPublishingAction({
      action: action as FounderPublishingAction,
      draftId,
      scheduledAt: typeof body.scheduledAt === "string" ? body.scheduledAt : undefined,
    });
    const intelligence = await loadPostCraftPublishingIntelligence();
    return NextResponse.json({ ...result, intelligence });
  } catch (e) {
    console.error("POST /api/ecosystem/postcraft/publishing", e);
    return NextResponse.json({ error: "Publishing action failed." }, { status: 500 });
  }
}
