import { afterEach, describe, expect, it } from "vitest";

import {
  clearResolvedCompanionSupabaseEnvCache,
  isSupabaseClientKey,
  isSupabaseProjectUrl,
  resolveCompanionSupabaseEnv,
} from "@/lib/supabase/resolveCompanionSupabaseEnv";

const KEY = "sb_publishable_TestKey1234567890AB_cd";
const URL = "https://weercszpdcxjxauxrhmj.supabase.co";

afterEach(() => {
  clearResolvedCompanionSupabaseEnvCache();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

describe("resolveCompanionSupabaseEnv", () => {
  it("accepts correct env placement", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = KEY;
    const r = resolveCompanionSupabaseEnv();
    expect(r.url).toBe(URL);
    expect(r.key).toBe(KEY);
    expect(r.usedUrlFallback).toBe(false);
  });

  it("fixes key pasted into URL slot", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = KEY;
    const r = resolveCompanionSupabaseEnv();
    expect(r.key).toBe(KEY);
    expect(r.url).toBe(URL);
    expect(r.usedUrlFallback).toBe(true);
    expect(r.autoCorrectedEnv).toBe(true);
  });

  it("fixes swapped url and key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = URL;
    const r = resolveCompanionSupabaseEnv();
    expect(r.url).toBe(URL);
    expect(r.key).toBe(KEY);
  });
});

describe("isSupabaseProjectUrl", () => {
  it("recognizes project urls", () => {
    expect(isSupabaseProjectUrl(URL)).toBe(true);
    expect(isSupabaseClientKey(KEY)).toBe(true);
    expect(isSupabaseProjectUrl(KEY)).toBe(false);
  });
});
