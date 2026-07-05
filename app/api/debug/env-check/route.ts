import { NextResponse } from "next/server";

import { appUrlLooksValid, getAppSiteUrl } from "@/lib/appSite";
import { resolveOpenAiApiKey } from "@/lib/openai/resolveOpenAiApiKey";
import { ghlApiConfigured } from "@/lib/ghl/client";
import { companionAuthConfigStatus, companionAuthMisconfigHint, companionSupabaseEnvLooksSwapped, companionSupabaseUrlLooksValid, envValuePrefix, getCompanionSupabaseAnonKey, getCompanionSupabaseUrl } from "@/lib/supabase/companionClient";

/** Temporary deploy debug — booleans/lengths only, never secret values. */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim() ?? "";
  const ghlApiToken = process.env.GHL_API_TOKEN?.trim() ?? "";
  const ghlPrivateToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim() ?? "";
  const ghlLocationId = process.env.GHL_LOCATION_ID?.trim() ?? "";

  const auth = companionAuthConfigStatus();

  return NextResponse.json({
    cwd: process.cwd(),
    hasAppUrl: appUrl.length > 0,
    appUrlLooksValid: appUrlLooksValid(appUrl),
    resolvedAppUrl: getAppSiteUrl(),
    hasSupabaseUrl: supabaseUrl.length > 0,
    supabaseUrlLooksValid: companionSupabaseUrlLooksValid(),
    supabaseUrlLength: supabaseUrl.length,
    supabaseUrlPrefix: envValuePrefix(supabaseUrl),
    hasSupabaseAnonKey: anonKey.length > 0,
    supabaseAnonKeyLength: anonKey.length,
    supabaseAnonKeyPrefix: envValuePrefix(anonKey),
    anonKeyLooksValid: auth.anonKeyLooksValid,
    authConfigured: auth.configured,
    resolvedSupabaseUrlLength: getCompanionSupabaseUrl().length,
    resolvedSupabaseUrlPrefix: envValuePrefix(getCompanionSupabaseUrl()),
    resolvedSupabaseAnonKeyLength: getCompanionSupabaseAnonKey().length,
    autoCorrectedSupabaseEnv: auth.autoCorrectedEnv,
    usedSupabaseUrlFallback: auth.usedSupabaseUrlFallback,
    supabaseEnvLooksSwapped: companionSupabaseEnvLooksSwapped(),
    supabaseEnvHint: companionAuthMisconfigHint(),
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
    hasOpenAiKey: Boolean(resolveOpenAiApiKey()),
  });
}
