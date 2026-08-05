import { describe, expect, it } from "vitest";
import {
  SERVICE_CATEGORIES,
  buildServiceCategories,
} from "./serviceCategories";
import { DEFAULT_DIGITAL_WORKSPACE_PREFERENCES } from "./digitalWorkspacePreferences";

describe("Connections service categories", () => {
  it("exposes Calendar, Documents, Storage, and Design only", () => {
    expect(SERVICE_CATEGORIES.map((c) => c.id)).toEqual([
      "calendar",
      "documents",
      "storage",
      "design",
    ]);
  });

  it("does not surface OneDrive or Dropbox until supported", () => {
    const ids = SERVICE_CATEGORIES.flatMap((c) => c.items.map((i) => i.id));
    expect(ids).not.toContain("onedrive");
    expect(ids).not.toContain("dropbox");
    expect(ids).toContain("spark-estate-documents");
    expect(ids).toContain("google-docs");
    expect(ids).toContain("canva");
  });

  it("shows Connected ✓ for Google services when OAuth is live", () => {
    const categories = buildServiceCategories({
      google: { configured: true, connected: true, email: "a@example.com" },
      outlookConnected: false,
      canvaConnected: false,
    });
    const googleCalendar = categories
      .find((c) => c.id === "calendar")!
      .items.find((i) => i.id === "google-calendar")!;
    expect(googleCalendar.showConnectedCheck).toBe(true);
    expect(googleCalendar.statusLabel).toBe("Connected ✓");
  });

  it("shows Connected ✓ for Canva only once it is actually connected", () => {
    const disconnected = buildServiceCategories({
      google: { configured: true, connected: false, email: null },
      canvaConnected: false,
    });
    const canvaOff = disconnected
      .find((c) => c.id === "design")!
      .items.find((i) => i.id === "canva")!;
    expect(canvaOff.showConnectedCheck).toBe(false);
    expect(canvaOff.statusLabel).not.toBe("Connected ✓");

    const connected = buildServiceCategories({
      google: { configured: true, connected: false, email: null },
      canvaConnected: true,
    });
    const canvaOn = connected
      .find((c) => c.id === "design")!
      .items.find((i) => i.id === "canva")!;
    expect(canvaOn.showConnectedCheck).toBe(true);
    expect(canvaOn.statusLabel).toBe("Connected ✓");
  });

  describe("false Connected states (Settings Fix 4)", () => {
    it("never shows Connected ✓ for Spark Estate Documents/Storage or Microsoft Word — they are local preferences, not authenticated connections", () => {
      const categories = buildServiceCategories({
        google: { configured: true, connected: false, email: null },
        outlookConnected: false,
        canvaConnected: false,
        preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
      });
      const docs = categories.find((c) => c.id === "documents")!;
      const storage = categories.find((c) => c.id === "storage")!;

      for (const item of [
        docs.items.find((i) => i.id === "spark-estate-documents")!,
        docs.items.find((i) => i.id === "microsoft-word")!,
        storage.items.find((i) => i.id === "spark-estate-storage")!,
      ]) {
        expect(item.showConnectedCheck).toBe(false);
        expect(item.statusLabel).not.toBe("Connected ✓");
      }
    });

    it("Spark Estate Documents/Storage read Selected ✓ only when they are the member's actual current preference — not on first load for the unselected one", () => {
      // Default preferences: documents="spark-estate", storage="spark-estate".
      const categories = buildServiceCategories({
        google: { configured: true, connected: false, email: null },
        outlookConnected: false,
        canvaConnected: false,
        preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
      });
      const docs = categories.find((c) => c.id === "documents")!;
      const sparkDocs = docs.items.find(
        (i) => i.id === "spark-estate-documents",
      )!;
      const word = docs.items.find((i) => i.id === "microsoft-word")!;

      // Spark Estate Documents genuinely is the active default — honest to
      // read as selected — but never with authenticated "Connected ✓" text.
      expect(sparkDocs.statusLabel).toBe("Selected ✓");
      expect(sparkDocs.ready).toBe(true);

      // Microsoft Word has never been chosen — must not claim any active
      // state, and must never say "Connected ✓" (no OAuth, no API exists).
      expect(word.statusLabel).not.toBe("Connected ✓");
      expect(word.statusLabel).not.toBe("Selected ✓");
      expect(word.ready).toBe(false);
    });

    it("Microsoft Word reads Selected ✓ once the member actually picks it — still never Connected ✓", () => {
      const categories = buildServiceCategories({
        google: { configured: true, connected: false, email: null },
        outlookConnected: false,
        canvaConnected: false,
        preferences: { documents: "microsoft-word", storage: "spark-estate" },
      });
      const docs = categories.find((c) => c.id === "documents")!;
      const word = docs.items.find((i) => i.id === "microsoft-word")!;
      const sparkDocs = docs.items.find(
        (i) => i.id === "spark-estate-documents",
      )!;

      expect(word.statusLabel).toBe("Selected ✓");
      expect(word.showConnectedCheck).toBe(false);
      // Only one Documents destination should read as the active choice.
      expect(sparkDocs.statusLabel).not.toBe("Selected ✓");
      expect(sparkDocs.ready).toBe(false);
    });

    it("Outlook Calendar never shows Connected ✓ — no Microsoft Graph OAuth exists", () => {
      const categories = buildServiceCategories({
        google: { configured: true, connected: false, email: null },
        outlookConnected: true,
        canvaConnected: false,
      });
      const outlook = categories
        .find((c) => c.id === "calendar")!
        .items.find((i) => i.id === "outlook-calendar")!;
      expect(outlook.showConnectedCheck).toBe(false);
      expect(outlook.statusLabel).not.toBe("Connected ✓");
      expect(outlook.statusLabel).toBe("Prepared ✓");
    });

    it("Outlook Calendar reads a neutral, non-Connected label before it is prepared", () => {
      const categories = buildServiceCategories({
        google: { configured: true, connected: false, email: null },
        outlookConnected: false,
        canvaConnected: false,
      });
      const outlook = categories
        .find((c) => c.id === "calendar")!
        .items.find((i) => i.id === "outlook-calendar")!;
      expect(outlook.showConnectedCheck).toBe(false);
      expect(outlook.statusLabel).not.toBe("Connected ✓");
    });

    it("category ready-count reflects real + local-preference readiness, not a blanket true", () => {
      const categories = buildServiceCategories({
        google: { configured: true, connected: false, email: null },
        outlookConnected: false,
        canvaConnected: false,
        preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
      });
      const docs = categories.find((c) => c.id === "documents")!;
      // Only Spark Estate Documents (the default) is ready — Google Docs is
      // not connected and Microsoft Word has not been chosen.
      expect(docs.connectedCount).toBe(1);
    });
  });
});
