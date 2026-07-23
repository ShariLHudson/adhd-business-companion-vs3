import { NextResponse } from "next/server";

import { publicViewFromRecord } from "@/lib/billing/fastpay";
import { getVoiceEntitlementStore } from "@/lib/billing/fastpay/entitlementStore";
import { getCompanionSupabaseServer } from "@/lib/supabase/companionServer";

export const runtime = "nodejs";

/**
 * Authenticated Voice entitlement read — source of truth after FastPay verification.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getCompanionSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "auth_unavailable" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const record = await getVoiceEntitlementStore().getByUserId(data.user.id);
  const view = publicViewFromRecord(record);

  return NextResponse.json({
    ok: true,
    ...view,
  });
}
