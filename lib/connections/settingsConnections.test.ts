import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  SETTINGS_CONNECTION_CARDS,
  SETTINGS_CONNECTIONS_HIDDEN_FROM_UI,
  buildSettingsConnectionCards,
} from "./settingsConnectionCatalog";
import {
  connectOutlookCalendarLocal,
  disconnectOutlookCalendarLocal,
  isOutlookCalendarConnected,
  resetOutlookCalendarConnectionForTests,
} from "./outlookCalendarConnection";

const lsStore: Record<string, string> = {};

describe("settings connections catalog", () => {
  beforeEach(() => {
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    resetOutlookCalendarConnectionForTests();
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

  it("shows Calendar, Docs, Drive, Outlook, and Canva — not Sheets or Forms", () => {
    const ids = SETTINGS_CONNECTION_CARDS.map((c) => c.id);
    expect(ids).toEqual([
      "google-calendar",
      "google-docs",
      "google-drive",
      "outlook-calendar",
      "canva",
    ]);
    expect(ids).not.toContain("google-sheets");
    expect(ids).not.toContain("google-forms");
    expect(
      SETTINGS_CONNECTIONS_HIDDEN_FROM_UI.map((h) => h.id),
    ).toEqual(
      expect.arrayContaining(["google-forms", "google-sheets", "notion"]),
    );
  });

  it("maps Google OAuth status onto Calendar, Docs, and Drive cards", () => {
    const cards = buildSettingsConnectionCards({
      google: { configured: true, connected: true, email: "a@example.com" },
      outlookConnected: false,
    });
    const googleCards = cards.filter((c) => c.kind === "google");
    expect(googleCards.every((c) => c.status === "connected")).toBe(true);
    expect(googleCards.every((c) => c.accountEmail === "a@example.com")).toBe(
      true,
    );
    expect(cards.find((c) => c.id === "outlook-calendar")?.status).toBe(
      "disconnected",
    );
  });

  it("tracks Outlook Calendar connected/disconnected without Graph", () => {
    expect(isOutlookCalendarConnected()).toBe(false);
    connectOutlookCalendarLocal();
    expect(isOutlookCalendarConnected()).toBe(true);
    const cards = buildSettingsConnectionCards({
      google: { configured: true, connected: false, email: null },
      outlookConnected: true,
    });
    expect(cards.find((c) => c.id === "outlook-calendar")?.status).toBe(
      "connected",
    );
    disconnectOutlookCalendarLocal();
    expect(isOutlookCalendarConnected()).toBe(false);
  });

  it("surfaces Canva connection status on the Connected Services card", () => {
    const disconnected = buildSettingsConnectionCards({
      google: { configured: true, connected: false, email: null },
      outlookConnected: false,
      canvaConnected: false,
    });
    expect(disconnected.find((c) => c.id === "canva")?.status).toBe(
      "disconnected",
    );
    const connected = buildSettingsConnectionCards({
      google: { configured: true, connected: false, email: null },
      outlookConnected: false,
      canvaConnected: true,
      canvaDestinationUrl: "https://www.canva.com/",
    });
    expect(connected.find((c) => c.id === "canva")?.status).toBe("connected");
    expect(connected.find((c) => c.id === "canva")?.destinationUrl).toContain(
      "canva.com",
    );
  });
});
