import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { companionAuthConfigured } from "./companionClient";
import {
  clearResolvedCompanionSupabaseEnvCache,
  resolveCompanionSupabaseEnv,
} from "./resolveCompanionSupabaseEnv";
import { isBrowserSafeSupabaseKey } from "./supabaseKeyRoles";

function loadEnvLocal(): boolean {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    process.env[key] = val;
  }
  return true;
}

afterEach(() => {
  clearResolvedCompanionSupabaseEnvCache();
});

describe("companion auth env integration", () => {
  it("resolves a browser-safe key from .env.local when present", () => {
    if (!loadEnvLocal()) {
      expect(true).toBe(true);
      return;
    }
    clearResolvedCompanionSupabaseEnvCache();
    const resolved = resolveCompanionSupabaseEnv();
    expect(resolved.key.length).toBeGreaterThan(0);
    expect(isBrowserSafeSupabaseKey(resolved.key)).toBe(true);
    expect(companionAuthConfigured()).toBe(true);
  });
});
