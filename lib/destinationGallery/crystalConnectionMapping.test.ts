import { describe, expect, it } from "vitest";
import {
  CRYSTAL_CONNECTION_CAPABILITIES,
  CRYSTALS_FORBIDDEN_LEGACY_CREATE,
  getCrystalConnectionCapability,
  resolveCrystalConnection,
  type CrystalConnectionSnapshot,
} from "./crystalConnectionMapping";

const googleDisconnected: CrystalConnectionSnapshot = {
  google: { configured: true, connected: false, email: null },
  outlookConnected: false,
  canvaConnected: false,
};

const googleConnected: CrystalConnectionSnapshot = {
  google: {
    configured: true,
    connected: true,
    email: "member@example.com",
  },
  outlookConnected: false,
  canvaConnected: false,
};

describe("crystal connection mapping architecture", () => {
  it("maps all six crystal IDs without renaming them", () => {
    expect(Object.keys(CRYSTAL_CONNECTION_CAPABILITIES).sort()).toEqual(
      [
        "create",
        "print",
        "save",
        "schedule",
        "spark-social-media",
        "write",
      ].sort(),
    );
  });

  it("defines Schedule with Google Calendar and Outlook Calendar", () => {
    const schedule = getCrystalConnectionCapability("schedule");
    expect(schedule.displayLabel).toBe("Schedule");
    expect(schedule.requiredConnections.map((c) => c.id)).toEqual([
      "google-calendar",
      "outlook-calendar",
    ]);
  });

  it("defines Document / Store / Share / Print / Canva requirements", () => {
    expect(getCrystalConnectionCapability("write").displayLabel).toBe(
      "Document",
    );
    expect(getCrystalConnectionCapability("write").requiredConnections).toEqual(
      [
        expect.objectContaining({
          id: "google-docs",
          presence: "settings-live",
        }),
      ],
    );
    expect(getCrystalConnectionCapability("save").displayLabel).toBe("Store");
    expect(
      getCrystalConnectionCapability("save").futureConnections?.[0]?.id,
    ).toBe("onedrive");
    expect(
      getCrystalConnectionCapability("spark-social-media").requiresPublishApproval,
    ).toBe(true);
    expect(getCrystalConnectionCapability("print").requiredConnections).toEqual(
      [],
    );
    expect(getCrystalConnectionCapability("create").displayLabel).toBe("Canva");
    expect(getCrystalConnectionCapability("create").requiredConnections).toEqual(
      [expect.objectContaining({ id: "canva", presence: "settings-live" })],
    );
  });

  it("resolves Canva missing vs ready messages without opening Create", () => {
    const missing = resolveCrystalConnection("create", googleDisconnected);
    expect(missing.action).toBe("needs_connection");
    expect(missing.memberMessage).toBe("Connect Canva to use this crystal.");
    expect(missing.shouldOpenConnections).toBe(true);

    const ready = resolveCrystalConnection("create", {
      ...googleDisconnected,
      canvaConnected: true,
    });
    expect(ready.action).toBe("ready");
    expect(ready.memberMessage).toBe("Open Canva design workflow.");
    expect(CRYSTALS_FORBIDDEN_LEGACY_CREATE).toContain("create");
  });

  it("treats Schedule as ready when either calendar hand is connected", () => {
    const outlookOnly = resolveCrystalConnection("schedule", {
      ...googleDisconnected,
      outlookConnected: true,
    });
    expect(outlookOnly.action).toBe("ready");

    const googleOnly = resolveCrystalConnection("schedule", googleConnected);
    expect(googleOnly.action).toBe("ready");

    const none = resolveCrystalConnection("schedule", googleDisconnected);
    expect(none.action).toBe("needs_connection");
    expect(none.shouldOpenConnections).toBe(true);
  });

  it("keeps Print local-only with no Connections dependency", () => {
    const print = resolveCrystalConnection("print", googleDisconnected);
    expect(print.action).toBe("local_only");
    expect(print.shouldOpenConnections).toBe(false);
    expect(print.memberMessage).toBe("Open Print or PDF workflow.");
  });

  it("marks Document and Store needs_connection when Google is disconnected", () => {
    expect(resolveCrystalConnection("write", googleDisconnected).action).toBe(
      "needs_connection",
    );
    expect(resolveCrystalConnection("save", googleDisconnected).memberMessage).toBe(
      "Connect Google Drive to use this crystal.",
    );
    expect(resolveCrystalConnection("write", googleConnected).action).toBe(
      "ready",
    );
  });

  it("marks Share as needing a profile and requiring publish approval", () => {
    const empty = resolveCrystalConnection("spark-social-media", googleDisconnected);
    expect(empty.action).toBe("needs_connection");
    expect(empty.requiresPublishApproval).toBe(true);

    const withLinkedIn = resolveCrystalConnection("spark-social-media", {
      ...googleDisconnected,
      socialProfiles: { linkedin: true },
    });
    expect(withLinkedIn.action).toBe("partial");
    expect(withLinkedIn.memberMessage).toContain("approval required");
  });
});
