import { NextResponse } from "next/server";

import {
  confirmCompanionUserEmail,
  isInvalidLoginCredentialsError,
  lookupCompanionAuthAccount,
  normalizeCompanionEmail,
} from "@/lib/companionAuthProvision";
import {
  isEmailNotConfirmedError,
  sanitizeSupabaseAuthError,
} from "@/lib/supabase/authErrors";
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
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = normalizeCompanionEmail(body.email ?? "");
    password = body.password ?? "";
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
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error && isEmailNotConfirmedError(error.message)) {
      const confirmed = await confirmCompanionUserEmail(email);
      if (confirmed) {
        ({ data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        }));
      }
    }
    if (error) {
      if (isInvalidLoginCredentialsError(error.message)) {
        const lookup = await lookupCompanionAuthAccount(email);
        if (lookup.status === "not_found") {
          return NextResponse.json(
            {
              ok: false,
              error:
                "No account found for this email. Use Create an account below to get started.",
              hint: "create_account",
            },
            { status: 401 },
          );
        }
        if (lookup.status === "exists") {
          return NextResponse.json(
            {
              ok: false,
              error:
                "That password doesn't match. Use Create an account with the same email to set a new password and sign in.",
              hint: "reset_via_signup",
            },
            { status: 401 },
          );
        }
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (!data.session) {
      return NextResponse.json(
        { ok: false, error: "No session returned. Check your email confirmation." },
        { status: 401 },
      );
    }
    return NextResponse.json({
      ok: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user: data.user,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-in failed.";
    return NextResponse.json(
      { ok: false, error: sanitizeSupabaseAuthError(message) },
      { status: 502 },
    );
  }
}
