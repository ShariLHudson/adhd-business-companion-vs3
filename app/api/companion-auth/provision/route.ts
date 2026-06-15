import { NextResponse } from "next/server";

import {
  provisionCompanionUser,
  verifyCompanionProvisionToken,
} from "@/lib/companionAuthProvision";
import { sanitizeSupabaseAuthError } from "@/lib/supabase/authErrors";

const PROVISION_HEADER = "x-companion-provision-token";

/**
 * GHL / automation webhook — create a confirmed companion account.
 * POST with header `x-companion-provision-token` and JSON { email, password, name? }.
 */
export async function POST(request: Request) {
  const token = request.headers.get(PROVISION_HEADER);
  if (!verifyCompanionProvisionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
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

  try {
    const result = await provisionCompanionUser({ email, password, name });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: sanitizeSupabaseAuthError(result.error) },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      created: result.created,
      userId: result.user.id,
      email: result.user.email,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Provisioning failed.";
    return NextResponse.json(
      { ok: false, error: sanitizeSupabaseAuthError(message) },
      { status: 502 },
    );
  }
}
