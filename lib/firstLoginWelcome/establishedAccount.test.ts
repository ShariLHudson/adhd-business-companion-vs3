import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => memory.clear(),
});

vi.mock("@/lib/companionOnboarding", () => ({
  hasUserOnboarded: vi.fn(() => false),
}));

vi.mock("@/lib/companionAuthIntelligence", () => ({
  getCompanionAuthIntelligence: vi.fn(() => ({ loginCount: 0 })),
}));

vi.mock("@/lib/companionLoginPage", () => ({
  companionLoginHasHistory: vi.fn(() => false),
}));

vi.mock("@/lib/companionStore", () => ({
  getPrefs: vi.fn(() => ({
    onboarded: false,
    hasChatted: false,
    hasSeenWelcomeIntro: false,
    name: "",
  })),
  getProjects: vi.fn(() => []),
}));

vi.mock("@/lib/welcomeHome/firstLaunchPersistence", () => ({
  hasSeenWelcomeIntro: vi.fn(() => false),
}));

import { hasUserOnboarded } from "@/lib/companionOnboarding";
import { getCompanionAuthIntelligence } from "@/lib/companionAuthIntelligence";
import { companionLoginHasHistory } from "@/lib/companionLoginPage";
import { getPrefs, getProjects } from "@/lib/companionStore";
import { hasSeenWelcomeIntro } from "@/lib/welcomeHome/firstLaunchPersistence";
import { hasEstablishedAccountWelcomeEvidence } from "./establishedAccount";

describe("hasEstablishedAccountWelcomeEvidence", () => {
  beforeEach(() => {
    memory.clear();
    vi.mocked(hasUserOnboarded).mockReturnValue(false);
    vi.mocked(getCompanionAuthIntelligence).mockReturnValue({
      preferredLoginMethod: null,
      loginCount: 0,
      lastLoginAt: null,
      lastFailedLoginAt: null,
      failedLoginAttempts: 0,
      returnAfterAbsenceDays: null,
      lastDeviceHint: null,
    });
    vi.mocked(companionLoginHasHistory).mockReturnValue(false);
    vi.mocked(getPrefs).mockReturnValue({
      onboarded: false,
      hasChatted: false,
      hasSeenWelcomeIntro: false,
      name: "",
    } as ReturnType<typeof getPrefs>);
    vi.mocked(getProjects).mockReturnValue([]);
    vi.mocked(hasSeenWelcomeIntro).mockReturnValue(false);
  });

  it("treats completed welcome record as established", () => {
    expect(
      hasEstablishedAccountWelcomeEvidence({
        userId: "u1",
        record: {
          welcomeCompletedAt: "2026-07-01T00:00:00.000Z",
          welcomeAudioPlayedAt: null,
        },
      }),
    ).toBe(true);
  });

  it("treats prior project activity as established", () => {
    vi.mocked(getProjects).mockReturnValue([{ id: "p1" }] as never);
    expect(
      hasEstablishedAccountWelcomeEvidence({ userId: "u1" }),
    ).toBe(true);
  });

  it("treats profile / chat history as established", () => {
    vi.mocked(getPrefs).mockReturnValue({
      onboarded: false,
      hasChatted: true,
      hasSeenWelcomeIntro: false,
      name: "",
    } as ReturnType<typeof getPrefs>);
    expect(
      hasEstablishedAccountWelcomeEvidence({ userId: "u1" }),
    ).toBe(true);
  });

  it("treats brand-new empty account as not established", () => {
    expect(
      hasEstablishedAccountWelcomeEvidence({ userId: "u1" }),
    ).toBe(false);
  });

  it("honors existing onboarding flag", () => {
    vi.mocked(hasUserOnboarded).mockReturnValue(true);
    expect(
      hasEstablishedAccountWelcomeEvidence({ userId: "u1" }),
    ).toBe(true);
  });
});
