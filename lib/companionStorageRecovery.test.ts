import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQuotaSafeStorage,
  isStorageQuotaError,
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
    expect(localStorage.getItem("companion-supabase-auth")).toContain("session");
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
});
