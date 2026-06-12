import { NextRequest, NextResponse } from "next/server";

import { FOUNDER_ADMIN_COOKIE, verifyFounderAdminToken } from "@/lib/founderAdmin";
import {
  deleteFounderWorkspaceItemFromDb,
  upsertFounderWorkspaceItemInDb,
} from "@/lib/founderWorkspace/repository";
import { sanitizeId, sanitizeKind, sanitizeWorkspaceItemInput } from "@/lib/founderWorkspace/sanitize";
import { founderSupabaseConfigured } from "@/lib/supabase/founderServer";

async function requireFounder(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(FOUNDER_ADMIN_COOKIE)?.value;
  if (!(await verifyFounderAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const denied = await requireFounder(request);
  if (denied) return denied;

  if (!founderSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = body as {
    item?: Record<string, unknown>;
    previousKind?: string;
  };
  const item = sanitizeWorkspaceItemInput(
    raw.item as Parameters<typeof sanitizeWorkspaceItemInput>[0],
  );
  if (!item) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  const previousKind = raw.previousKind
    ? sanitizeKind(raw.previousKind)
    : undefined;

  try {
    await upsertFounderWorkspaceItemInDb(
      item,
      previousKind ?? undefined,
    );
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error("POST /api/founder/workspace/items", e);
    return NextResponse.json(
      { error: "Could not save item." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireFounder(request);
  if (denied) return denied;

  if (!founderSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 },
    );
  }

  const kind = sanitizeKind(request.nextUrl.searchParams.get("kind"));
  const id = sanitizeId(request.nextUrl.searchParams.get("id"));
  if (!kind || !id) {
    return NextResponse.json({ error: "Invalid kind or id." }, { status: 400 });
  }

  try {
    await deleteFounderWorkspaceItemFromDb(kind, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/founder/workspace/items", e);
    return NextResponse.json(
      { error: "Could not delete item." },
      { status: 500 },
    );
  }
}
