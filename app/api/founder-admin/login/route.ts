import { NextResponse } from "next/server";

import {
  FOUNDER_ADMIN_COOKIE,
  founderAdminToken,
  isFounderAdminConfigured,
  resolveFounderAdminPassword,
} from "@/lib/founderAdmin";

export async function POST(request: Request) {
  if (!isFounderAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Founder admin access is not configured." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const expected = resolveFounderAdminPassword();
  if (!password.trim() || password.trim() !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid password. This sign-in uses FOUNDER_ADMIN_PASSWORD from .env.local — not your companion app account. Restart the dev server after changing it.",
      },
      { status: 401 },
    );
  }

  const token = await founderAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(FOUNDER_ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
