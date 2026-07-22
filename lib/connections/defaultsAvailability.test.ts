import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  maybeAutoSelectSoleCalendar,
  resolveCalendarDefaults,
  resolveDocumentDefaults,
  resolvePrintingDefaults,
  resolveStorageDefaults,
} from "./defaultsAvailability";
import {
  DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
  resetDigitalWorkspacePreferencesForTests,
  type DigitalWorkspacePreferences,
} from "./digitalWorkspacePreferences";

const lsStore: Record<string, string> = {};

describe("defaults availability", () => {
  beforeEach(() => {
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    resetDigitalWorkspacePreferencesForTests();
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

  const basePrefs = (): DigitalWorkspacePreferences => ({
    ...DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
    destinationUrls: {},
  });

  it("flags Google Docs default when Google is disconnected", () => {
    const group = resolveDocumentDefaults(basePrefs(), {
      googleConfigured: true,
      googleConnected: false,
      outlookConnected: false,
    });
    expect(group.needsAttention).toBe(true);
    expect(group.options.find((o) => o.id === "spark-estate")?.selectable).toBe(
      true,
    );
    expect(group.options.find((o) => o.id === "google-docs")?.connectToUse).toBe(
      true,
    );
  });

  it("hides OneDrive and Dropbox from selectable storage options", () => {
    const group = resolveStorageDefaults(basePrefs(), {
      googleConfigured: true,
      googleConnected: true,
      outlookConnected: false,
    });
    expect(group.options.map((o) => o.id)).toEqual([
      "spark-estate",
      "google-drive",
    ]);
  });

  it("auto-selects the sole connected calendar", () => {
    const prefs = { ...basePrefs(), calendar: "google" as const };
    expect(
      maybeAutoSelectSoleCalendar(prefs, {
        googleConfigured: true,
        googleConnected: false,
        outlookConnected: true,
      }),
    ).toBe("outlook");
    const resolved = resolveCalendarDefaults(prefs, {
      googleConfigured: true,
      googleConnected: false,
      outlookConnected: true,
    });
    expect(resolved.currentId).toBe("outlook");
    expect(resolved.needsAttention).toBe(false);
  });

  it("marks calendar default when no calendars are connected", () => {
    const group = resolveCalendarDefaults(basePrefs(), {
      googleConfigured: true,
      googleConnected: false,
      outlookConnected: false,
    });
    expect(group.needsAttention).toBe(true);
  });

  it("simplifies printing to PDF and print dialog", () => {
    const group = resolvePrintingDefaults(basePrefs());
    expect(group.options.every((o) => o.selectable)).toBe(true);
    expect(group.options.map((o) => o.id)).toEqual([
      "save-pdf",
      "print-dialog",
    ]);
  });

  it("flags legacy preferred print provider", () => {
    const group = resolvePrintingDefaults({
      ...basePrefs(),
      printing: "preferred-provider",
    });
    expect(group.needsAttention).toBe(true);
  });
});
