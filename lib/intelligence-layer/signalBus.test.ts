import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  benchmarkEmitCompanionSignal,
  emitCompanionSignal,
} from "./signalBus";
import {
  clearShadowSignalStoreForTests,
  getShadowSignalStore,
  SHADOW_SIGNAL_STORE_KEY,
} from "./shadowSignalStore";
import { resetShadowDiagnosticsForTests, getShadowBusMetrics } from "./shadowDiagnostics";
import { SIGNAL_BUS_FLAG_KEYS } from "./featureFlags";

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
  vi.stubGlobal("performance", { now: () => Date.now() });
}

function enableBus() {
  localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
}

describe("signalBus", () => {
  beforeEach(() => {
    mockStorage();
    clearShadowSignalStoreForTests();
    resetShadowDiagnosticsForTests();
    localStorage.removeItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus);
  });

  it("returns bus_disabled when flag is off", () => {
    const result = emitCompanionSignal({
      domain: "emotional",
      category: "overwhelm",
      source: "chat",
      emitter: "test",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("bus_disabled");
    expect(getShadowSignalStore().signals).toHaveLength(0);
  });

  it("stores signal in shadow store when flag is on", () => {
    enableBus();
    const result = emitCompanionSignal({
      domain: "emotional",
      category: "overwhelm",
      source: "chat",
      emitter: "test.emitter",
      userId: "user-test",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.deduped).toBe(false);
    expect(getShadowSignalStore().signals).toHaveLength(1);
    expect(localStorage.getItem(SHADOW_SIGNAL_STORE_KEY)).toBeTruthy();
  });

  it("dedupes identical emits within 60s window", () => {
    enableBus();
    const input = {
      domain: "emotional" as const,
      category: "overwhelm",
      source: "chat",
      emitter: "test.emitter",
    };
    emitCompanionSignal(input);
    const second = emitCompanionSignal(input);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.deduped).toBe(true);
    expect(getShadowSignalStore().signals).toHaveLength(1);
    const metrics = getShadowBusMetrics();
    expect(metrics.dedupedEmits).toBe(1);
  });

  it("never throws on validation failure", () => {
    enableBus();
    const result = emitCompanionSignal({
      domain: "emotional",
      category: "INVALID",
      source: "chat",
      emitter: "test",
    });
    expect(result.ok).toBe(false);
  });

  it("100 emit benchmark p95 under 10ms", () => {
    enableBus();
    const bench = benchmarkEmitCompanionSignal(
      {
        domain: "conversation",
        category: "help_me_prioritize",
        source: "bench",
        emitter: "test.bench",
      },
      100,
    );
    expect(bench.p95Ms).toBeLessThan(10);
  });
});
