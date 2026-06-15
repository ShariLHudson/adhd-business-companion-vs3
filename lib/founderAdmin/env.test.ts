import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isFounderAdminConfigured,
  resolveFounderAdminPassword,
} from "./env";

describe("founder admin env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads FOUNDER_ADMIN_PASSWORD when set", () => {
    vi.stubEnv("FOUNDER_ADMIN_PASSWORD", "test-admin-pass");
    expect(resolveFounderAdminPassword()).toBe("test-admin-pass");
    expect(isFounderAdminConfigured()).toBe(true);
  });

  it("returns empty when unset", () => {
    vi.stubEnv("FOUNDER_ADMIN_PASSWORD", "");
    expect(resolveFounderAdminPassword()).toBe("");
    expect(isFounderAdminConfigured()).toBe(false);
  });
});
