import { describe, expect, it } from "vitest";
import {
  dedupeKeyForInput,
  dedupeKeyForSignal,
  isDuplicateInIndex,
} from "./signalDedup";

describe("signalDedup", () => {
  const base = {
    emitter: "companion.chat",
    domain: "emotional",
    category: "overwhelm",
    source: "chat",
  };

  it("same inputs in same minute produce same dedupe key", () => {
    const at = "2026-06-22T10:00:30.000Z";
    const k1 = dedupeKeyForInput(base, at);
    const k2 = dedupeKeyForInput(base, "2026-06-22T10:00:45.000Z");
    expect(k1).toBe(k2);
  });

  it("different source produces different key", () => {
    const at = "2026-06-22T10:00:30.000Z";
    const k1 = dedupeKeyForInput(base, at);
    const k2 = dedupeKeyForInput({ ...base, source: "other" }, at);
    expect(k1).not.toBe(k2);
  });

  it("different minute bucket produces different key", () => {
    const k1 = dedupeKeyForInput(base, "2026-06-22T10:00:30.000Z");
    const k2 = dedupeKeyForInput(base, "2026-06-22T10:01:30.000Z");
    expect(k1).not.toBe(k2);
  });

  it("tracks duplicates in index", () => {
    const index = new Map<string, string>();
    const signal = {
      ...base,
      at: "2026-06-22T10:00:30.000Z",
    };
    const key = dedupeKeyForSignal(signal);
    expect(isDuplicateInIndex(key, index)).toBe(false);
    index.set(key, signal.at);
    expect(isDuplicateInIndex(key, index)).toBe(true);
  });
});
