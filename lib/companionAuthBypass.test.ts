import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isCompanionAuthBypassed,
  isCompanionDevFastPath,
} from "./companionAuthBypass";

describe("isCompanionAuthBypassed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is off in production unless env forces it", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", undefined);
    expect(isCompanionAuthBypassed()).toBe(false);
  });

  it("is on in development by default", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", undefined);
    expect(isCompanionAuthBypassed()).toBe(true);
  });

  it("can force login in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", "false");
    expect(isCompanionAuthBypassed()).toBe(false);
  });

  it("is on when env is true or 1 in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", "true");
    expect(isCompanionAuthBypassed()).toBe(true);

    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", "1");
    expect(isCompanionAuthBypassed()).toBe(true);
  });

  it("dev fast path follows bypass", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isCompanionDevFastPath()).toBe(true);
  });
});
