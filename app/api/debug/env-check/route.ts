import { NextResponse } from "next/server";

import { ghlApiConfigured } from "@/lib/ghl/client";

/** Temporary deploy debug — booleans/lengths only, never secret values. */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim() ?? "";
  const ghlApiToken = process.env.GHL_API_TOKEN?.trim() ?? "";
  const ghlPrivateToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim() ?? "";
  const ghlLocationId = process.env.GHL_LOCATION_ID?.trim() ?? "";

  return NextResponse.json({
    cwd: process.cwd(),
    hasSupabaseUrl: supabaseUrl.length > 0,
    supabaseUrlLength: supabaseUrl.length,
    hasSupabaseAnonKey: anonKey.length > 0,
    supabaseAnonKeyLength: anonKey.length,
    hasServiceRoleKey: serviceRoleKey.length > 0,
    serviceRoleKeyLength: serviceRoleKey.length,
    hasSupabaseSecretKey: secretKey.length > 0,
    hasGhlApiToken: ghlApiToken.length > 0,
    ghlApiTokenLength: ghlApiToken.length,
    hasGhlPrivateIntegrationToken: ghlPrivateToken.length > 0,
    ghlPrivateIntegrationTokenLength: ghlPrivateToken.length,
    hasGhlLocationId: ghlLocationId.length > 0,
    ghlLocationIdLength: ghlLocationId.length,
    ghlApiConfigured: ghlApiConfigured(),
    locationIdConfigured: ghlLocationId.length > 0,
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
