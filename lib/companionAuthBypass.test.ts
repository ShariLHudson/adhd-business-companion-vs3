import { afterEach, describe, expect, it, vi } from "vitest";

import { isCompanionAuthBypassed } from "./companionAuthBypass";

describe("isCompanionAuthBypassed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is off by default", () => {
    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", undefined);
    expect(isCompanionAuthBypassed()).toBe(false);
  });

  it("is on when env is true or 1", () => {
    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", "true");
    expect(isCompanionAuthBypassed()).toBe(true);

    vi.stubEnv("NEXT_PUBLIC_COMPANION_AUTH_DISABLED", "1");
    expect(isCompanionAuthBypassed()).toBe(true);
  });
});
