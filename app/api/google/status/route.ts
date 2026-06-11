import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, googleConfigured, parseTokens } from "@/lib/google";

// Is a Google account connected? (and which one)
export async function GET(request: NextRequest) {
  const tokens = parseTokens(request.cookies.get(G_COOKIE)?.value);
  return NextResponse.json({
    configured: googleConfigured(),
    connected: Boolean(tokens),
    email: tokens?.email ?? null,
  });
}
