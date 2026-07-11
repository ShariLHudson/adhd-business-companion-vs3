import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  armCompanionPreviewTestHarnessFromQuery,
  clearCompanionPreviewTestLaunch,
  COMPANION_PREVIEW_TEST_ARMED_KEY,
  COMPANION_PREVIEW_TEST_LAUNCH_KEY,
  getCompanionPreviewTestLaunch,
  isCompanionPreviewTestHarnessArmed,
  isCompanionPreviewTestHarnessAvailable,
  resetCompanionPreviewTestHarness,
  setCompanionPreviewTestLaunch,
} from "./companionPreviewTestHarness";

describe("companionPreviewTestHarness", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("window", {
      location: { search: "", hostname: "localhost" },
    });
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("is available on Vercel preview hostnames", () => {
    vi.stubGlobal("window", {
      location: { hostname: "adhd-business-companion-vs3-h6kbfo0xl-shari-hudsons-projects.vercel.app", search: "" },
    });
    vi.stubEnv("VERCEL_ENV", undefined);
    vi.stubEnv("NODE_ENV", "production");
    expect(isCompanionPreviewTestHarnessAvailable()).toBe(true);
  });

  it("is unavailable on Vercel production", () => {
    vi.stubGlobal("window", {
      location: {
        search: "",
        hostname: "ecosystem.visualsparkstudios.com",
      },
    });
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NODE_ENV", "production");
    expect(isCompanionPreviewTestHarnessAvailable()).toBe(false);
  });

  it("arms from previewTest=1 query param", () => {
    expect(
      armCompanionPreviewTestHarnessFromQuery("?previewTest=1"),
    ).toBe(true);
    expect(isCompanionPreviewTestHarnessArmed()).toBe(true);
  });

  it("stores launch targets in sessionStorage only", () => {
    armCompanionPreviewTestHarnessFromQuery("?previewTest=1");
    setCompanionPreviewTestLaunch({ target: "welcome-home" });
    expect(getCompanionPreviewTestLaunch()).toEqual({ target: "welcome-home" });
    clearCompanionPreviewTestLaunch();
    expect(getCompanionPreviewTestLaunch()).toBeNull();
    expect(storage.get(COMPANION_PREVIEW_TEST_ARMED_KEY)).toBe("1");
  });

  it("reset clears launch state but keeps harness armed", () => {
    armCompanionPreviewTestHarnessFromQuery("?previewTest=1");
    setCompanionPreviewTestLaunch({ target: "discovery-key", roomId: "greenhouse" });
    resetCompanionPreviewTestHarness();
    expect(getCompanionPreviewTestLaunch()).toBeNull();
    expect(storage.get(COMPANION_PREVIEW_TEST_LAUNCH_KEY)).toBeUndefined();
    expect(isCompanionPreviewTestHarnessArmed()).toBe(true);
  });
});
