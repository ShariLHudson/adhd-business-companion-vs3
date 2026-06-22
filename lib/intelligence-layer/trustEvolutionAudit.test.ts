import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendTrustAuditEntry,
  clearTrustAuditLog,
  getTrustAuditLog,
  resetTrustAuditLogForTests,
  TRUST_AUDIT_MAX_ENTRIES,
  TRUST_AUDIT_STORAGE_KEY,
  type TrustAuditEntry,
} from "./trustEvolutionAudit";

function sampleEntry(id: string): TrustAuditEntry {
  return {
    id,
    at: `2026-06-22T12:00:00.${id}Z`,
    trustCategory: "trust.suggestion_accepted",
    busCategory: "suggestion_accepted",
    source: "test",
    valence: "positive",
    attributionValid: true,
    evolve: false,
    reason: "profile_learning_disabled",
    traitDeltas: [],
  };
}

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

describe("trustEvolutionAudit", () => {
  beforeEach(() => {
    mockStorage();
    resetTrustAuditLogForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("appends and reads entries oldest-first", () => {
    appendTrustAuditEntry(sampleEntry("a"));
    appendTrustAuditEntry(sampleEntry("b"));
    const log = getTrustAuditLog();
    expect(log).toHaveLength(2);
    expect(log[0]?.id).toBe("a");
    expect(log[1]?.id).toBe("b");
  });

  it("caps at 500 entries", () => {
    for (let i = 0; i < TRUST_AUDIT_MAX_ENTRIES + 25; i++) {
      appendTrustAuditEntry(sampleEntry(String(i)));
    }
    const log = getTrustAuditLog();
    expect(log).toHaveLength(TRUST_AUDIT_MAX_ENTRIES);
    expect(log[0]?.id).toBe("25");
    expect(log[log.length - 1]?.id).toBe(String(TRUST_AUDIT_MAX_ENTRIES + 24));
  });

  it("clears the log", () => {
    appendTrustAuditEntry(sampleEntry("x"));
    clearTrustAuditLog();
    expect(getTrustAuditLog()).toHaveLength(0);
    expect(localStorage.getItem(TRUST_AUDIT_STORAGE_KEY)).toBeNull();
  });

  it("does not throw when localStorage setItem fails", () => {
    const storage = mockStorage();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => appendTrustAuditEntry(sampleEntry("fail"))).not.toThrow();
    expect(getTrustAuditLog()).toHaveLength(0);
  });

  it("returns empty log on SSR (no window)", () => {
    vi.unstubAllGlobals();
    const originalWindow = globalThis.window;
    // @ts-expect-error — simulate SSR
    delete globalThis.window;
    expect(getTrustAuditLog()).toEqual([]);
    expect(() => appendTrustAuditEntry(sampleEntry("ssr"))).not.toThrow();
    globalThis.window = originalWindow;
    mockStorage();
  });
});
