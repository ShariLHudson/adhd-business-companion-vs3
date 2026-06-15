import { NextResponse } from "next/server";

import { getAppSiteUrl } from "@/lib/appSite";
import { sanitizeSupabaseAuthError } from "@/lib/supabase/authErrors";
import {
  companionAuthConfigured,
  companionAuthConfigStatus,
} from "@/lib/supabase/companionClient";
import { getCompanionSupabaseServer } from "@/lib/supabase/companionServer";

export async function POST(request: Request) {
  if (!companionAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Sign-in is not configured on this server." },
      { status: 503 },
    );
  }

  if (!companionAuthConfigStatus().anonKeyLooksValid) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Supabase API key looks incomplete. In Vercel, paste the FULL publishable or legacy anon key from Supabase → Project Settings → API, then redeploy.",
      },
      { status: 503 },
    );
  }

  let email = "";
  let password = "";
  let name = "";
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };
    email = body.email?.trim() ?? "";
    password = body.password ?? "";
    name = body.name?.trim() ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const supabase = getCompanionSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Could not connect to Supabase." },
      { status: 503 },
    );
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
        emailRedirectTo: `${getAppSiteUrl()}/companion`,
      },
    });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (data.session) {
      return NextResponse.json({
        ok: true,
        needsConfirmation: false,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        user: data.user,
      });
    }

    return NextResponse.json({
      ok: true,
      needsConfirmation: true,
      user: data.user,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-up failed.";
    return NextResponse.json(
      { ok: false, error: sanitizeSupabaseAuthError(message) },
      { status: 502 },
    );
  }
}
