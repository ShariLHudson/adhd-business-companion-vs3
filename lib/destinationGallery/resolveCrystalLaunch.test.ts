import { describe, expect, it } from "vitest";
import { DEFAULT_DIGITAL_WORKSPACE_PREFERENCES } from "@/lib/connections/digitalWorkspacePreferences";
import { resolveCrystalLaunch } from "./resolveCrystalLaunch";

const baseConnections = {
  google: { configured: true, connected: true, email: "a@example.com" },
  outlookConnected: false,
  canvaConnected: false,
};

describe("resolveCrystalLaunch (Prompt 142)", () => {
  it("opens calendar when a calendar hand is ready", () => {
    const plan = resolveCrystalLaunch("schedule", {
      connections: baseConnections,
      preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
    });
    expect(plan.kind).toBe("open_calendar");
  });

  it("opens Canva URL when connected; otherwise guides to Connections", () => {
    const missing = resolveCrystalLaunch("create", {
      connections: { ...baseConnections, canvaConnected: false },
      preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
      canvaDestinationUrl: null,
    });
    expect(missing.kind).toBe("needs_connection");
    expect(missing.shouldOpenConnections).toBe(true);

    const ready = resolveCrystalLaunch("create", {
      connections: { ...baseConnections, canvaConnected: true },
      preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
      canvaDestinationUrl: "https://www.canva.com/folder/x",
    });
    expect(ready.kind).toBe("open_external_url");
    expect(ready.externalUrl).toContain("canva.com");
  });

  it("uses Document and Printing preferences in prepared states", () => {
    const doc = resolveCrystalLaunch("write", {
      connections: baseConnections,
      preferences: {
        ...DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
        documents: "local",
      },
    });
    expect(doc.kind).toBe("prepared_document");
    expect(doc.preferenceLabel).toBe("Local Documents");

    const print = resolveCrystalLaunch("print", {
      connections: baseConnections,
      preferences: {
        ...DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
        printing: "print-dialog",
      },
    });
    expect(print.kind).toBe("prepared_print");
    expect(print.body).toMatch(/Print dialog/i);
  });

  it("never leaves Design on a silent empty path", () => {
    const plan = resolveCrystalLaunch("create", {
      connections: baseConnections,
      preferences: DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
    });
    expect(["needs_connection", "open_external_url"]).toContain(plan.kind);
    expect(plan.body.trim().length).toBeGreaterThan(10);
  });
});
