import { NextResponse } from "next/server";

import { companionAuthConfigStatus } from "@/lib/supabase/companionClient";
import { companionAnonKeyLooksValid } from "@/lib/supabase/companionServer";

/** Public check — never returns secrets. */
export async function GET() {
  return NextResponse.json(companionAuthConfigStatus());
}
