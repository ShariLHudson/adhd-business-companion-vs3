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

const updateUser = vi.fn(async () => ({ data: {}, error: null }));
const getUser = vi.fn(async () => ({
  data: {
    user: {
      id: "user-1",
      user_metadata: {},
    },
  },
  error: null,
}));

vi.mock("@/lib/supabase/companionClient", () => ({
  getCompanionSupabase: () => ({
    auth: {
      getUser,
      updateUser,
    },
  }),
}));

vi.mock("@/lib/welcomeHome/firstLaunchPersistence", () => ({
  markWelcomeIntroSeen: vi.fn(),
}));

import {
  isWelcomeCompleted,
  loadFirstLoginWelcomeRecord,
  markWelcomeAudioPlayed,
  markWelcomeCompleted,
  mergeWelcomeRecords,
  recordFromUserMetadata,
  resetFirstLoginWelcomeLocalForTests,
} from "@/lib/firstLoginWelcome";
import { markWelcomeIntroSeen } from "@/lib/welcomeHome/firstLaunchPersistence";

describe("firstLoginWelcome persistence", () => {
  beforeEach(() => {
    memory.clear();
    resetFirstLoginWelcomeLocalForTests("user-1");
    updateUser.mockClear();
    getUser.mockClear();
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", user_metadata: {} } },
      error: null,
    });
  });

  it("reads welcome fields from user metadata", () => {
    const record = recordFromUserMetadata({
      welcome_completed_at: "2026-07-01T00:00:00.000Z",
      welcome_audio_played_at: "2026-07-01T00:00:01.000Z",
    });
    expect(isWelcomeCompleted(record)).toBe(true);
    expect(record.welcomeAudioPlayedAt).toBe("2026-07-01T00:00:01.000Z");
  });

  it("merges server completion over empty local", () => {
    const merged = mergeWelcomeRecords(
      {
        welcomeCompletedAt: "2026-07-02T00:00:00.000Z",
        welcomeAudioPlayedAt: null,
      },
      {
        welcomeCompletedAt: null,
        welcomeAudioPlayedAt: "2026-07-01T00:00:00.000Z",
      },
    );
    expect(merged.welcomeCompletedAt).toBe("2026-07-02T00:00:00.000Z");
    expect(merged.welcomeAudioPlayedAt).toBe("2026-07-01T00:00:00.000Z");
  });

  it("marks audio played once and persists locally + metadata", async () => {
    const first = await markWelcomeAudioPlayed(
      "user-1",
      "2026-07-13T12:00:00.000Z",
    );
    expect(first.welcomeAudioPlayedAt).toBe("2026-07-13T12:00:00.000Z");
    expect(updateUser).toHaveBeenCalledWith({
      data: { welcome_audio_played_at: "2026-07-13T12:00:00.000Z" },
    });

    updateUser.mockClear();
    const second = await markWelcomeAudioPlayed(
      "user-1",
      "2026-07-13T13:00:00.000Z",
    );
    expect(second.welcomeAudioPlayedAt).toBe("2026-07-13T12:00:00.000Z");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("marks welcome completed without clearing audio timestamp", async () => {
    await markWelcomeAudioPlayed("user-1", "2026-07-13T12:00:00.000Z");
    const done = await markWelcomeCompleted(
      "user-1",
      "2026-07-13T12:05:00.000Z",
    );
    expect(done.welcomeCompletedAt).toBe("2026-07-13T12:05:00.000Z");
    expect(done.welcomeAudioPlayedAt).toBe("2026-07-13T12:00:00.000Z");
    expect(markWelcomeIntroSeen).toHaveBeenCalled();
    expect(isWelcomeCompleted(done)).toBe(true);

    const reloaded = await loadFirstLoginWelcomeRecord("user-1");
    expect(isWelcomeCompleted(reloaded)).toBe(true);
  });

  it("treats incomplete welcome as required until Continue finishes it", () => {
    expect(
      isWelcomeCompleted({
        welcomeCompletedAt: null,
        welcomeAudioPlayedAt: "2026-07-13T12:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("exports Stop & Continue and Welcome Home continue labels", async () => {
    const {
      FIRST_LOGIN_WELCOME_PRIMARY,
      FIRST_LOGIN_WELCOME_STOP,
    } = await import("@/lib/firstLoginWelcome/types");
    expect(FIRST_LOGIN_WELCOME_PRIMARY).toBe("Continue to Welcome Home");
    expect(FIRST_LOGIN_WELCOME_STOP).toBe("Stop & Continue");
  });
});
