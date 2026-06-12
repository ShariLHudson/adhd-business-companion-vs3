import { NextRequest, NextResponse } from "next/server";

import { FOUNDER_ADMIN_COOKIE, verifyFounderAdminToken } from "@/lib/founderAdmin";
import { loadFounderWorkspaceFromDb } from "@/lib/founderWorkspace/repository";
import { founderSupabaseConfigured } from "@/lib/supabase/founderServer";

async function requireFounder(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(FOUNDER_ADMIN_COOKIE)?.value;
  if (!(await verifyFounderAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireFounder(request);
  if (denied) return denied;

  if (!founderSupabaseConfigured()) {
    return NextResponse.json(
      { configured: false, data: null },
      { status: 503 },
    );
  }

  try {
    const data = await loadFounderWorkspaceFromDb();
    return NextResponse.json({ configured: true, data });
  } catch (e) {
    console.error("GET /api/founder/workspace", e);
    return NextResponse.json(
      { error: "Could not load workspace." },
      { status: 500 },
    );
  }
}
