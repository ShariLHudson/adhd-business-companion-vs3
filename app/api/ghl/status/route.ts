import { NextResponse } from "next/server";

import {
  BUSINESS_ECOSYSTEM_DASHBOARD_EMBED_PATH,
  BUSINESS_ECOSYSTEM_DASHBOARD_TITLE,
} from "@/lib/ecosystem/businessEcosystemDashboard";
import { isGhlDashboardConfigured } from "@/lib/ghl/auth";
import { ghlApiConfigured } from "@/lib/ghl/client";
import { founderSupabaseConfigured } from "@/lib/supabase/founderServer";

/** Legacy alias — prefer /api/ecosystem/dashboard/status */
export async function GET() {
  const dashboardToken =
    process.env.ECOSYSTEM_DASHBOARD_TOKEN?.trim() ||
    process.env.GHL_DASHBOARD_TOKEN?.trim() ||
    process.env.FOUNDER_ADMIN_PASSWORD?.trim() ||
    "";

  return NextResponse.json({
    dashboardName: BUSINESS_ECOSYSTEM_DASHBOARD_TITLE,
    embedPath: BUSINESS_ECOSYSTEM_DASHBOARD_EMBED_PATH,
    dashboardAuthConfigured: isGhlDashboardConfigured(),
    dashboardTokenLength: dashboardToken.length,
    ghlApiConfigured: ghlApiConfigured(),
    locationIdConfigured: Boolean(process.env.GHL_LOCATION_ID?.trim()),
    founderDbConfigured: founderSupabaseConfigured(),
  });
}
