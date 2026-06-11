import { NextRequest, NextResponse } from "next/server";
import { googleConfig, G_COOKIE, type GTokens } from "@/lib/google";

// OAuth redirect target: exchange the code for tokens, fetch the account email,
// store everything in an httpOnly cookie, then return to the app.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const home = new URL("/companion", request.url);
  if (!code) {
    home.searchParams.set("google", "error");
    return NextResponse.redirect(home);
  }
  const c = googleConfig();
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: c.clientId,
        client_secret: c.clientSecret,
        redirect_uri: c.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      home.searchParams.set("google", "error");
      return NextResponse.redirect(home);
    }
    const t = await tokenRes.json();

    // Fetch the account email for display.
    let email: string | undefined;
    try {
      const ui = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${t.access_token}` } },
      );
      if (ui.ok) email = (await ui.json()).email;
    } catch {
      /* email is optional */
    }

    const tokens: GTokens = {
      access_token: t.access_token,
      refresh_token: t.refresh_token,
      expiry: Date.now() + (t.expires_in ?? 3600) * 1000,
      email,
    };

    home.searchParams.set("google", "connected");
    const res = NextResponse.redirect(home);
    res.cookies.set(G_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
    return res;
  } catch {
    home.searchParams.set("google", "error");
    return NextResponse.redirect(home);
  }
}
