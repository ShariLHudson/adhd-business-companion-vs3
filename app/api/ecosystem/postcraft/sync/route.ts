import { NextRequest, NextResponse } from "next/server";

import { getContentDraft } from "@/lib/ecosystem/postcraftDraftStore";
import {
  getPostCraftSyncQueue,
  markSyncRetry,
  markSyncSent,
  markSyncSkipped,
  sendDraftToPostCraft,
} from "@/lib/ecosystem/postcraftSyncQueue";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

async function requireAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  const queue = await getPostCraftSyncQueue();
  return NextResponse.json(queue);
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
  const action = typeof body.action === "string" ? body.action : "";

  if (!draftId) {
    return NextResponse.json({ error: "draftId required." }, { status: 400 });
  }

  const draft = await getContentDraft(draftId);
  if (!draft && action !== "skip") {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  switch (action) {
    case "send": {
      const result = await sendDraftToPostCraft(draftId);
      const queue = await getPostCraftSyncQueue();
      return NextResponse.json({ ...result, queue });
    }
    case "mark_sent": {
      await markSyncSent(draftId);
      const queue = await getPostCraftSyncQueue();
      return NextResponse.json({ ok: true, queue });
    }
    case "retry": {
      await markSyncRetry(draftId);
      const queue = await getPostCraftSyncQueue();
      return NextResponse.json({ ok: true, queue });
    }
    case "skip": {
      await markSyncSkipped(draftId);
      const queue = await getPostCraftSyncQueue();
      return NextResponse.json({ ok: true, queue });
    }
    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
}
