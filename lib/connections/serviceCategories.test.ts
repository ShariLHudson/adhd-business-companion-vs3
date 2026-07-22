import { describe, expect, it } from "vitest";
import {
  SERVICE_CATEGORIES,
  buildServiceCategories,
} from "./serviceCategories";

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

  it("marks Spark Estate built-ins connected and Google as connectable", () => {
    const categories = buildServiceCategories({
      google: { configured: true, connected: false, email: null },
      outlookConnected: false,
      canvaConnected: false,
    });
    const docs = categories.find((c) => c.id === "documents")!;
    expect(
      docs.items.find((i) => i.id === "spark-estate-documents")
        ?.showConnectedCheck,
    ).toBe(true);
    expect(
      docs.items.find((i) => i.id === "google-docs")?.showConnectedCheck,
    ).toBe(false);
    expect(docs.items.find((i) => i.id === "google-docs")?.statusLabel).toBe(
      "Not connected",
    );
  });

  it("shows Connected ✓ for Google services when OAuth is live", () => {
    const categories = buildServiceCategories({
      google: { configured: true, connected: true, email: "a@example.com" },
      outlookConnected: true,
      canvaConnected: true,
    });
    const calendar = categories.find((c) => c.id === "calendar")!;
    expect(
      calendar.items.every((i) => i.showConnectedCheck && i.statusLabel === "Connected ✓"),
    ).toBe(true);
  });
});
