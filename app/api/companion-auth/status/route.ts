import { NextResponse } from "next/server";

import { companionAuthConfigStatus } from "@/lib/supabase/companionClient";

/** Public check — never returns secrets. */
export async function GET() {
  return NextResponse.json(companionAuthConfigStatus());
}
