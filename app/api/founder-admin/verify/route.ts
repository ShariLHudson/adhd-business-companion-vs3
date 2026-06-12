import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { FOUNDER_ADMIN_COOKIE, verifyFounderAdminToken } from "@/lib/founderAdmin";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(FOUNDER_ADMIN_COOKIE)?.value;
  return NextResponse.json({ ok: await verifyFounderAdminToken(token) });
}
