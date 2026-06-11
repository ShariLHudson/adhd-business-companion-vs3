import { NextResponse } from "next/server";
import { googleConfig, googleConfigured, GOOGLE_SCOPE } from "@/lib/google";

// Start the Google OAuth consent flow.
export async function GET() {
  if (!googleConfigured()) {
    return NextResponse.json(
      { error: "Google is not configured. See GOOGLE_SETUP.md." },
      { status: 500 },
    );
  }
  const c = googleConfig();
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
