import { NextResponse } from "next/server";

import { isFounderAdminConfigured, resolveFounderAdminPassword } from "@/lib/founderAdmin";

/** Public check: is founder password set on this server process? (never returns the value) */
export async function GET() {
  const secret = resolveFounderAdminPassword();
  return NextResponse.json({
    configured: isFounderAdminConfigured(),
    /** Helps verify your .env.local save matches this running server (not the secret itself). */
    passwordLength: secret ? secret.length : 0,
  });
}
