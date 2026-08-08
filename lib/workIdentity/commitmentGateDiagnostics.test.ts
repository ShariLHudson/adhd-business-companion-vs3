/**
 * Commitment Gate Diagnostics — unit tests (Slice 1A).
 *
 * Covers the in-memory-only log mechanics in isolation: nothing here
 * touches `resolveCommitmentGate` or any live conversation flow.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCommitmentGateLog,
  logCommitmentGateDecision,
  readCommitmentGateLog,
} from "./commitmentGateDiagnostics";

describe("commitmentGateDiagnostics — outside a browser context", () => {
  it("readCommitmentGateLog returns an empty array when window is undefined", () => {
    expect(readCommitmentGateLog()).toEqual([]);
  });

  it("logCommitmentGateDecision never throws when window is undefined", () => {
    expect(() =>
      logCommitmentGateDecision({
        userText: "I want to create a workshop.",
        result: { outcome: "commit", reason: "unhedged_commitment" },
      }),
    ).not.toThrow();
  });
});

describe("commitmentGateDiagnostics — with a stubbed window", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records an entry and reads it back", () => {
    clearCommitmentGateLog();
    logCommitmentGateDecision({
      turn: 3,
      userText: "I want to create a workshop.",
      result: { outcome: "commit", reason: "unhedged_commitment" },
    });
    const log = readCommitmentGateLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toEqual({
      turn: 3,
      userText: "I want to create a workshop.",
      result: { outcome: "commit", reason: "unhedged_commitment" },
    });
  });

  it("caps the log at 40 entries, dropping the oldest first", () => {
    clearCommitmentGateLog();
    for (let i = 0; i < 45; i++) {
      logCommitmentGateDecision({
        turn: i,
        userText: `turn ${i}`,
        result: { outcome: "explore", reason: "no_work_signal" },
      });
    }
    const log = readCommitmentGateLog();
    expect(log).toHaveLength(40);
    expect(log[0]?.turn).toBe(5);
    expect(log[log.length - 1]?.turn).toBe(44);
  });

  it("clearCommitmentGateLog empties the log", () => {
    logCommitmentGateDecision({
      userText: "anything",
      result: { outcome: "explore", reason: "no_signal" },
    });
    clearCommitmentGateLog();
    expect(readCommitmentGateLog()).toEqual([]);
  });

  it("never writes to localStorage — this is an in-memory log, not storage", () => {
    const setItemSpy = vi.fn();
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null, setItem: setItemSpy, removeItem: () => {}, clear: () => {} },
    });
    logCommitmentGateDecision({
      userText: "I want to create a workshop.",
      result: { outcome: "commit", reason: "unhedged_commitment" },
    });
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
