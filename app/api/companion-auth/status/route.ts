import { NextResponse } from "next/server";

import { companionAuthConfigured } from "@/lib/supabase/companionClient";

/** Public check — never returns secrets. */
export async function GET() {
  return NextResponse.json({
    configured: companionAuthConfigured(),
  });
}
