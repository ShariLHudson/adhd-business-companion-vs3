import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPANION_AUTH_STORAGE_KEY,
  createQuotaSafeStorage,
  isCompanionLocalStorageAvailable,
  isStorageQuotaError,
  reclaimAggressiveCompanionStorage,
  reclaimCompanionStorageHeadroom,
  safeLocalStorageSet,
} from "./companionStorageRecovery";

describe("companionStorageRecovery", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    let quotaFailuresRemaining = 0;

    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (quotaFailuresRemaining > 0) {
          quotaFailuresRemaining -= 1;
          throw new DOMException("quota", "QuotaExceededError");
        }
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      clear: () => mem.clear(),
      get length() {
        return mem.size;
      },
      key: (i: number) => [...mem.keys()][i] ?? null,
    };

    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });

    (globalThis as { __quotaFailures?: (n: number) => void }).__quotaFailures =
      (n: number) => {
        quotaFailuresRemaining = n;
      };
  });

  it("detects QuotaExceededError", () => {
    expect(
      isStorageQuotaError(new DOMException("x", "QuotaExceededError")),
    ).toBe(true);
    expect(isStorageQuotaError(new Error("nope"))).toBe(false);
  });

  it("safeLocalStorageSet reclaims trimmable keys and retries", () => {
    localStorage.setItem(
      "companion-clear-my-mind-intelligence-v2",
      "x".repeat(200),
    );
    (globalThis as { __quotaFailures?: (n: number) => void }).__quotaFailures?.(
      1,
    );
    const ok = safeLocalStorageSet("companion-supabase-auth", '{"session":1}');
    expect(ok).toBe(true);
    expect(localStorage.getItem(COMPANION_AUTH_STORAGE_KEY)).toContain("session");
    expect(
      localStorage.getItem("companion-clear-my-mind-intelligence-v2"),
    ).toBeNull();
  });

  it("createQuotaSafeStorage never throws on setItem", () => {
    (globalThis as { __quotaFailures?: (n: number) => void }).__quotaFailures?.(
      99,
    );
    const storage = createQuotaSafeStorage();
    expect(() =>
      storage.setItem("companion-supabase-auth", '{"token":"huge"}'),
    ).not.toThrow();
  });

  it("reclaimCompanionStorageHeadroom removes only trimmable keys", () => {
    localStorage.setItem("companion-relief-intelligence-v1", "trim-me");
    localStorage.setItem("companion-brain-dumps-v1", "keep-me");
    const freed = reclaimCompanionStorageHeadroom();
    expect(freed).toBeGreaterThan(0);
    expect(localStorage.getItem("companion-relief-intelligence-v1")).toBeNull();
    expect(localStorage.getItem("companion-brain-dumps-v1")).toBe("keep-me");
  });

  it("reclaimAggressiveCompanionStorage keeps prefs and auth", () => {
    localStorage.setItem("companion-conversation-v1", "trim-me");
    localStorage.setItem("companion-prefs-v1", '{"name":"Shari"}');
    localStorage.setItem(COMPANION_AUTH_STORAGE_KEY, '{"access_token":"x"}');
    reclaimAggressiveCompanionStorage();
    expect(localStorage.getItem("companion-conversation-v1")).toBeNull();
    expect(localStorage.getItem("companion-prefs-v1")).toContain("Shari");
    expect(localStorage.getItem(COMPANION_AUTH_STORAGE_KEY)).toContain(
      "access_token",
    );
  });

  it("isCompanionLocalStorageAvailable returns false when setItem throws", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
      getItem: () => null,
      removeItem: () => undefined,
    });
    vi.stubGlobal("window", { localStorage });
    expect(isCompanionLocalStorageAvailable()).toBe(false);
  });

  it("safeLocalStorageSet returns false when write cannot be verified", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => "stale",
      setItem: () => undefined,
      removeItem: () => undefined,
      get length() {
        return 0;
      },
      key: () => null,
    });
    vi.stubGlobal("window", { localStorage });
    expect(
      safeLocalStorageSet(COMPANION_AUTH_STORAGE_KEY, '{"access_token":"new"}'),
    ).toBe(false);
  });
});
