import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCompanionAuthIntelligence,
  hasSignedInOnThisDeviceBefore,
  recordAuthLoginFailure,
  recordAuthLoginSuccess,
} from "./companionAuthIntelligence";

describe("companionAuthIntelligence", () => {
  beforeEach(() => {
    const localMem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    });
    vi.stubGlobal("window", { localStorage });
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0" });
  });

  it("tracks successful logins and preferred method", () => {
    expect(hasSignedInOnThisDeviceBefore()).toBe(false);
    recordAuthLoginSuccess("email");
    expect(hasSignedInOnThisDeviceBefore()).toBe(true);
    const intel = getCompanionAuthIntelligence();
    expect(intel.loginCount).toBe(1);
    expect(intel.preferredLoginMethod).toBe("email");
  });

  it("tracks failed login attempts", () => {
    recordAuthLoginFailure();
    expect(getCompanionAuthIntelligence().failedLoginAttempts).toBe(1);
  });
});
