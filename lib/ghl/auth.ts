import type { NextRequest } from "next/server";

import { verifyFounderAdminToken } from "@/lib/founderAdmin";
import { FOUNDER_ADMIN_COOKIE } from "@/lib/founderAdmin/constants";

export const ECOSYSTEM_DASHBOARD_ACCESS_HEADER = "x-ecosystem-dashboard-token";
const LEGACY_ACCESS_HEADER = "x-ghl-dashboard-token";

function dashboardTokenSecret(): string {
  return (
    process.env.ECOSYSTEM_DASHBOARD_TOKEN?.trim() ||
    process.env.GHL_DASHBOARD_TOKEN?.trim() ||
    process.env.FOUNDER_ADMIN_PASSWORD?.trim() ||
    ""
  );
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function isGhlDashboardConfigured(): boolean {
  return Boolean(dashboardTokenSecret());
}

export function verifyGhlDashboardToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = dashboardTokenSecret();
  if (!expected) return false;
  return timingSafeEqualString(token, expected);
}

export async function isGhlDashboardAuthorized(
  request: NextRequest,
): Promise<boolean> {
  const headerToken =
    request.headers.get(ECOSYSTEM_DASHBOARD_ACCESS_HEADER) ??
    request.headers.get(LEGACY_ACCESS_HEADER);
  if (verifyGhlDashboardToken(headerToken)) return true;

  const queryToken = request.nextUrl.searchParams.get("access");
  if (verifyGhlDashboardToken(queryToken)) return true;

  const founderCookie = request.cookies.get(FOUNDER_ADMIN_COOKIE)?.value;
  if (await verifyFounderAdminToken(founderCookie)) return true;

  return false;
}

/** @deprecated Use ECOSYSTEM_DASHBOARD_ACCESS_HEADER */
export const GHL_DASHBOARD_ACCESS_HEADER = ECOSYSTEM_DASHBOARD_ACCESS_HEADER;
