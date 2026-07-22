import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CRYSTAL_ACTIONS_PANEL_TITLE,
  preferencePatchForDestination,
  rememberCrystalActionDestination,
  resetCrystalActionDestinationsForTests,
  resolveCrystalActions,
} from "./index";

const lsStore: Record<string, string> = {};

describe("resolveCrystalActions", () => {
  beforeEach(() => {
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    resetCrystalActionDestinationsForTests();
    const storage = {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    };
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: storage,
    });
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const disconnected = {
    google: { configured: true, connected: false, email: null },
    outlookConnected: false,
    canvaConnected: false,
  };

  const googleConnected = {
    google: { configured: true, connected: true, email: "a@example.com" },
    outlookConnected: true,
    canvaConnected: false,
  };

  it("uses generic action names for documents", () => {
    const model = resolveCrystalActions({
      itemKind: "document",
      connections: disconnected,
    });
    expect(model.title).toBe(CRYSTAL_ACTIONS_PANEL_TITLE);
    expect(model.actions.map((a) => a.label)).toEqual([
      "Save",
      "Share",
      "Export",
      "Print",
    ]);
    expect(model.actions.every((a) => !/Google|Outlook|Canva/i.test(a.label))).toBe(
      true,
    );
  });

  it("lists event, image, project, and journal action sets", () => {
    expect(
      resolveCrystalActions({
        itemKind: "event",
        connections: googleConnected,
      }).actions.map((a) => a.id),
    ).toEqual(["add-to-calendar", "share", "print"]);
    expect(
      resolveCrystalActions({
        itemKind: "image",
        connections: disconnected,
      }).actions.map((a) => a.id),
    ).toEqual(["download", "share"]);
    expect(
      resolveCrystalActions({
        itemKind: "project",
        connections: disconnected,
      }).actions.map((a) => a.id),
    ).toEqual(["continue-working", "share", "archive"]);
    expect(
      resolveCrystalActions({
        itemKind: "journal",
        connections: disconnected,
      }).actions.map((a) => a.id),
    ).toEqual(["save", "export", "print"]);
  });

  it("asks which calendar only when more than one is connected and none remembered", () => {
    const model = resolveCrystalActions({
      itemKind: "event",
      connections: googleConnected,
      preferences: {
        documents: "spark-estate",
        printing: "save-pdf",
        calendar: "google",
        storage: "spark-estate",
        email: "gmail",
        destinationUrls: {},
      },
    });
    const calendar = model.actions.find((a) => a.id === "add-to-calendar");
    expect(calendar?.providers).toHaveLength(2);
    // Preference auto-selects Google — no question
    expect(calendar?.needsProviderChoice).toBe(false);
    expect(calendar?.autoDestinationId).toBe("google-calendar");
  });

  it("remembers a prior destination choice", () => {
    rememberCrystalActionDestination({
      itemKind: "document",
      actionId: "save",
      destinationId: "local",
    });
    const model = resolveCrystalActions({
      itemKind: "document",
      connections: googleConnected,
    });
    const save = model.actions.find((a) => a.id === "save");
    expect(save?.autoDestinationId).toBe("local");
    expect(save?.needsProviderChoice).toBe(false);
  });

  it("maps destination choices onto preference patches", () => {
    expect(preferencePatchForDestination("save", "google-docs")).toEqual({
      documents: "google-docs",
    });
    expect(
      preferencePatchForDestination("add-to-calendar", "outlook-calendar"),
    ).toEqual({ calendar: "outlook" });
  });
});
