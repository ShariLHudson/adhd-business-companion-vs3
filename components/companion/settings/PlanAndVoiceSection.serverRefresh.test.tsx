/**
 * @vitest-environment jsdom
 *
 * Covers PlanAndVoiceSection exactly as SettingsPanel renders it in
 * production — no `plan` prop — so the real server entitlement refresh
 * (refreshVoicePlanEntitlementFromServer) actually runs. The existing
 * PlanAndVoiceSection.test.tsx and voicePlanServerSync.test.ts cover the
 * display/entitlement-resolution logic in isolation; this file proves the
 * two are actually wired together the way production uses them.
 */
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanAndVoiceSection } from "./PlanAndVoiceSection";
import {
  clearVoicePlanPaymentPending,
  markVoicePlanPaymentPending,
  readVoicePlanPaymentPending,
} from "@/lib/voicePlans/voicePlanEntitlement";
import { getPrefs, savePrefs } from "@/lib/companionStore";

vi.mock("@/lib/supabase/companionClient", () => ({
  getCompanionSupabase: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "test-token",
            user: { id: "user-1", email: "member@example.com" },
          },
        },
      }),
    },
  }),
}));

let container: HTMLDivElement;
let root: Root;

function mockFetchOnce(body: unknown, init?: ResponseInit) {
  return vi.fn(async () => Response.json(body, init));
}

/** Drain the entitlement fetch's promise chain (readAccessToken -> fetch -> res.json -> savePrefs). */
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  clearVoicePlanPaymentPending();
  savePrefs({ plan: "essential" });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PlanAndVoiceSection — production wiring (no plan prop override)", () => {
  it("calls the server entitlement endpoint on mount when no plan prop is passed", async () => {
    const fetchMock = mockFetchOnce({
      ok: true,
      plan: "essential",
      entitlementStatus: "active",
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/billing/voice-entitlement");
  });

  it("unlocks Voice Lite after server confirmation, even though the local plan starts stale at essential", async () => {
    expect(getPrefs().plan).toBe("essential");
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({ ok: true, plan: "voice-lite", entitlementStatus: "active" }),
    );

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();

    expect(getPrefs().plan).toBe("voice-lite");
    expect(
      container.querySelector("[data-testid='voice-plan-lite-current']")
        ?.textContent,
    ).toBe("Current Voice Plan");
    expect(
      container.querySelector("[data-testid='voice-plan-lite-choose']"),
    ).toBeNull();
  });

  it("unlocks Voice Pro after server confirmation", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({ ok: true, plan: "voice-pro", entitlementStatus: "active" }),
    );

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();

    expect(getPrefs().plan).toBe("voice-pro");
    expect(
      container.querySelector("[data-testid='voice-plan-pro-current']")
        ?.textContent,
    ).toBe("Current Voice Plan");
    expect(
      container.querySelector("[data-testid='voice-plan-pro-choose']"),
    ).toBeNull();
  });

  it("keeps a free/essential member locked when the server confirms essential", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce({ ok: true, plan: "essential", entitlementStatus: "active" }),
    );

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();

    expect(getPrefs().plan).toBe("essential");
    expect(
      container.querySelector("[data-testid='voice-plan-lite-choose']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='voice-plan-pro-choose']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='voice-plan-lite-current']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='voice-plan-pro-current']"),
    ).toBeNull();
  });

  it("does not falsely unlock when the entitlement request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ ok: false, error: "unauthorized" }, { status: 401 }),
      ),
    );

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();

    expect(getPrefs().plan).toBe("essential");
    expect(
      container.querySelector("[data-testid='voice-plan-lite-choose']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-and-voice-verify-soft-fail']")
        ?.textContent,
    ).toMatch(/couldn.t confirm/i);
  });

  it("does not falsely unlock and preserves the pending marker when the request throws", async () => {
    markVoicePlanPaymentPending("voice-lite");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();

    expect(getPrefs().plan).toBe("essential");
    expect(readVoicePlanPaymentPending()?.plan).toBe("voice-lite");
  });

  it("issues exactly one request for an already-confirmed entitlement on a single mount (no repeated requests)", async () => {
    savePrefs({ plan: "voice-lite" });
    const fetchMock = mockFetchOnce({
      ok: true,
      plan: "voice-lite",
      entitlementStatus: "active",
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      root.render(<PlanAndVoiceSection />);
    });
    await flush();
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("PlanAndVoiceSection — test seam still works (plan prop / disableServerRefresh)", () => {
  it("does not call fetch when disableServerRefresh is set", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      root.render(<PlanAndVoiceSection plan="essential" disableServerRefresh />);
    });
    await flush();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
