import { describe, expect, it } from "vitest";
import { isBrowserSafeSupabaseKey, supabaseJwtRole } from "./supabaseKeyRoles";

const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.signature";
const SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.signature";

describe("supabaseKeyRoles", () => {
  it("accepts anon JWT keys", () => {
    expect(supabaseJwtRole(ANON)).toBe("anon");
    expect(isBrowserSafeSupabaseKey(ANON)).toBe(true);
  });

  it("rejects service role JWT keys for browser use", () => {
    expect(supabaseJwtRole(SERVICE)).toBe("service_role");
    expect(isBrowserSafeSupabaseKey(SERVICE)).toBe(false);
  });
});
