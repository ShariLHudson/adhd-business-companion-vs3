import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isProfileLearningEnabled,
  isTrustLearningAllowed,
  isTrustSignal,
  shouldEvolveFromSignal,
} from "./learningGates";
import { PROFILE_LEARNING_FLAG_KEYS } from "./featureFlags";
import type { IntelligenceSignal } from "./types";

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
}

function signal(
  category: string,
  domain: IntelligenceSignal["domain"] = "emotional",
): IntelligenceSignal {
  return {
    id: "sig-1",
    at: "2026-06-22T12:00:00.000Z",
    date: "2026-06-22",
    domain,
    category,
    source: "test",
  };
}

const validAttribution = {
  productId: "ecosystem",
  sessionId: "session-1",
  interventionBucket: "clear_mind",
  causationType: "user_action" as const,
};

describe("learningGates", () => {
  beforeEach(() => {
    mockStorage();
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    vi.unstubAllEnvs();
  });

  it("isProfileLearningEnabled defaults OFF", () => {
    expect(isProfileLearningEnabled()).toBe(false);
  });

  it("isProfileLearningEnabled respects localStorage override", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    expect(isProfileLearningEnabled()).toBe(true);
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "0");
    expect(isProfileLearningEnabled()).toBe(false);
  });

  it("isProfileLearningEnabled respects env var", () => {
    vi.stubEnv("NEXT_PUBLIC_PROFILE_LEARNING", "true");
    expect(isProfileLearningEnabled()).toBe(true);
  });

  it("isTrustSignal detects trust-mapped categories", () => {
    expect(isTrustSignal(signal("suggestion_accepted", "action"))).toBe(true);
    expect(isTrustSignal(signal("suggestion_ignored", "action"))).toBe(true);
    expect(isTrustSignal(signal("overwhelm", "emotional"))).toBe(false);
  });

  it("shouldEvolveFromSignal blocks all signals when profile learning OFF", () => {
    expect(shouldEvolveFromSignal(signal("overwhelm"))).toBe(false);
    expect(
      shouldEvolveFromSignal(signal("suggestion_accepted", "action"), validAttribution),
    ).toBe(false);
  });

  it("shouldEvolveFromSignal allows non-trust signals when profile learning ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    expect(shouldEvolveFromSignal(signal("overwhelm"))).toBe(true);
    expect(shouldEvolveFromSignal(signal("help_me_prioritize", "conversation"))).toBe(
      true,
    );
  });

  it("shouldEvolveFromSignal blocks trust signals without attribution when learning ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    expect(shouldEvolveFromSignal(signal("suggestion_accepted", "action"))).toBe(
      false,
    );
  });

  it("isTrustLearningAllowed requires full attribution and user_action causation", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    expect(isTrustLearningAllowed(validAttribution)).toBe(true);
    expect(isTrustLearningAllowed(null)).toBe(false);
    expect(
      isTrustLearningAllowed({
        ...validAttribution,
        causationType: "system_suppressed",
      }),
    ).toBe(false);
    expect(
      isTrustLearningAllowed({
        ...validAttribution,
        sessionId: "",
      }),
    ).toBe(false);
  });

  it("shouldEvolveFromSignal allows trust signals with valid attribution when learning ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    expect(
      shouldEvolveFromSignal(signal("suggestion_accepted", "action"), validAttribution),
    ).toBe(true);
  });

  it("blocks trust evolution for unknown intervention buckets when learning ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    expect(
      isTrustLearningAllowed({
        ...validAttribution,
        interventionBucket: "unknown_bucket" as typeof validAttribution.interventionBucket,
      }),
    ).toBe(false);
  });
});
