import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectCanvaLocal,
  disconnectCanvaLocal,
  isCanvaConnected,
  normalizeCanvaDestinationUrl,
  resetCanvaConnectionForTests,
  updateCanvaDestinationUrl,
  verifyCanvaConnection,
} from "./canvaConnection";

const lsStore: Record<string, string> = {};

describe("canvaConnection", () => {
  beforeEach(() => {
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    resetCanvaConnectionForTests();
    const storage = {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    };
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects non-Canva URLs", () => {
    expect(normalizeCanvaDestinationUrl("https://evil.example").ok).toBe(
      false,
    );
    expect(connectCanvaLocal("https://docs.google.com").ok).toBe(false);
  });

  it("connects, updates, verifies, and disconnects Canva", () => {
    expect(isCanvaConnected()).toBe(false);
    const connected = connectCanvaLocal("https://www.canva.com/folder/abc");
    expect(connected.ok).toBe(true);
    expect(isCanvaConnected()).toBe(true);

    const updated = updateCanvaDestinationUrl("www.canva.com");
    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.record.destinationUrl).toMatch(/^https:\/\//);
    }

    const verified = verifyCanvaConnection();
    expect(verified.ok).toBe(true);

    disconnectCanvaLocal();
    expect(isCanvaConnected()).toBe(false);
  });
});
