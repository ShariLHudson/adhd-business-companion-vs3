/**
 * 126 — First-Time Welcome Experience constitutional contract.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FIRST_TIME_WELCOME_CERTIFICATION_CHECKLIST,
  WELCOME_SKIP_COUNTS_AS_COMPLETION,
  resolveWelcomeDisposition,
  shouldSuppressAutomaticWelcome,
} from "./welcomeExperienceConstitution";
import {
  isWelcomeCompleted,
  markWelcomeCompleted,
  mergeWelcomeRecords,
  resetFirstLoginWelcomeLocalForTests,
} from "./persistence";

vi.mock("@/lib/supabase/companionClient", () => ({
  getCompanionSupabase: () => null,
}));

vi.mock("@/lib/welcomeHome/firstLaunchPersistence", () => ({
  markWelcomeIntroSeen: vi.fn(),
  hasSeenWelcomeIntro: vi.fn(() => false),
}));

describe("126 First-Time Welcome Experience constitution", () => {
  beforeEach(() => {
    resetFirstLoginWelcomeLocalForTests("user-const");
  });

  it("publishes the eight certification requirements", () => {
    expect(FIRST_TIME_WELCOME_CERTIFICATION_CHECKLIST).toHaveLength(8);
    expect(WELCOME_SKIP_COUNTS_AS_COMPLETION).toBe(true);
  });

  it("treats skip and complete as suppressible dispositions", () => {
    expect(resolveWelcomeDisposition({ skipped: true })).toBe("skipped");
    expect(resolveWelcomeDisposition({ skipped: false })).toBe("completed");
    expect(
      shouldSuppressAutomaticWelcome({
        welcomeCompletedAt: "2026-07-21T00:00:00.000Z",
      }),
    ).toBe(true);
    expect(
      shouldSuppressAutomaticWelcome({ welcomeCompletedAt: null }),
    ).toBe(false);
  });

  it("records skip as completion that permanently suppresses automatic display", async () => {
    const done = await markWelcomeCompleted("user-const", {
      skipped: true,
      platformVersion: "0.1.0-test",
      at: "2026-07-21T12:00:00.000Z",
    });
    expect(isWelcomeCompleted(done)).toBe(true);
    expect(done.welcomeDisposition).toBe("skipped");
    expect(done.welcomePlatformVersion).toBe("0.1.0-test");
    expect(
      shouldSuppressAutomaticWelcome({
        welcomeCompletedAt: done.welcomeCompletedAt,
      }),
    ).toBe(true);

    const again = await markWelcomeCompleted("user-const", {
      skipped: false,
      at: "2026-07-22T12:00:00.000Z",
    });
    expect(again.welcomeCompletedAt).toBe("2026-07-21T12:00:00.000Z");
    expect(again.welcomeDisposition).toBe("skipped");
  });

  it("never clears completion when merging server and local", () => {
    const merged = mergeWelcomeRecords(
      {
        welcomeCompletedAt: "2026-07-01T00:00:00.000Z",
        welcomeAudioPlayedAt: null,
        welcomeDisposition: "completed",
        welcomePlatformVersion: "0.1.0",
      },
      {
        welcomeCompletedAt: null,
        welcomeAudioPlayedAt: "2026-07-02T00:00:00.000Z",
        welcomeDisposition: null,
        welcomePlatformVersion: null,
      },
    );
    expect(merged.welcomeCompletedAt).toBe("2026-07-01T00:00:00.000Z");
    expect(merged.welcomeAudioPlayedAt).toBe("2026-07-02T00:00:00.000Z");
    expect(merged.welcomeDisposition).toBe("completed");
  });
});
