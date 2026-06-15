import { NextResponse } from "next/server";

import { resolveCompanionSupabaseEnv } from "@/lib/supabase/resolveCompanionSupabaseEnv";
import { isBrowserSafeSupabaseKey } from "@/lib/supabase/supabaseKeyRoles";

/** Server-only: expose public Supabase client config when NEXT_PUBLIC vars are missing in the browser bundle. */
export async function GET() {
  const { url, key } = resolveCompanionSupabaseEnv();
  if (!url || !key || !isBrowserSafeSupabaseKey(key)) {
    return NextResponse.json({
      configured: false,
      url: url || null,
      hasKey: Boolean(key),
    });
  }
  return NextResponse.json({
    configured: true,
    url,
    anonKey: key,
  });
}
