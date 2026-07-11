import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearClearMyMindPersistedSession,
  getClearMyMindPersistedSession,
  pauseClearMyMindSession,
  resumeClearMyMindSession,
} from "./clearMyMindSessionStore";

function installLocalStorageMock() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
    },
  });
}

describe("clearMyMindSessionStore", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pauses and resumes the same session", () => {
    pauseClearMyMindSession({
      sessionId: "cmind-test-1",
      phase: "choice",
      rawCaptureTexts: ["call doctor", "finish newsletter"],
    });
    const resumed = resumeClearMyMindSession();
    expect(resumed?.sessionId).toBe("cmind-test-1");
    expect(resumed?.phase).toBe("choice");
    expect(resumed?.rawCaptureTexts).toHaveLength(2);
  });

  it("clears persisted session on exit", () => {
    pauseClearMyMindSession({
      sessionId: "cmind-test-2",
      phase: "organize",
      rawCaptureTexts: ["one"],
    });
    clearClearMyMindPersistedSession();
    expect(getClearMyMindPersistedSession()).toBeNull();
  });
});
