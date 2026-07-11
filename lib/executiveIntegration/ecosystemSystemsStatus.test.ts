import { describe, expect, it } from "vitest";

import { composeEcosystemSystemsStatus } from "./ecosystemSystemsStatus";

describe("composeEcosystemSystemsStatus", () => {
  it("lists all eight executive systems in order", () => {
    const rows = composeEcosystemSystemsStatus();
    expect(rows.map((row) => row.system)).toEqual([
      "Founder",
      "Spark Companion",
      "PostCraft",
      "GoHighLevel",
      "GitHub",
      "Cursor",
      "Google Drive",
      "Microsoft 365",
    ]);
  });

  it("marks always-on systems as connected with Live sync", () => {
    const rows = composeEcosystemSystemsStatus();
    const founder = rows.find((row) => row.id === "founder");
    const companion = rows.find((row) => row.id === "companion");
    const github = rows.find((row) => row.id === "github");
    const cursor = rows.find((row) => row.id === "cursor");

    expect(founder).toMatchObject({
      statusKind: "connected",
      purpose: "Executive HQ",
      lastSync: "Live",
    });
    expect(companion).toMatchObject({
      statusKind: "connected",
      purpose: "Member Experience",
      lastSync: "Live",
    });
    expect(github?.lastSync).toBe("Live");
    expect(cursor?.purpose).toBe("Development Assistant");
  });

  it("reflects live marketing connection status and sync labels", () => {
    const connected = composeEcosystemSystemsStatus({
      postcraft: "connected",
      gohighlevel: "connected",
    });
    expect(connected.find((row) => row.id === "postcraft")).toMatchObject({
      statusKind: "connected",
      lastSync: "2 min ago",
    });
    expect(connected.find((row) => row.id === "gohighlevel")).toMatchObject({
      statusKind: "connected",
      lastSync: "1 min ago",
    });

    const disconnected = composeEcosystemSystemsStatus({
      postcraft: "not-connected",
      gohighlevel: "not-connected",
    });
    expect(disconnected.find((row) => row.id === "postcraft")).toMatchObject({
      statusKind: "not-connected",
      lastSync: "Not Connected",
    });
  });

  it("marks planned document and calendar systems as not connected", () => {
    const rows = composeEcosystemSystemsStatus();
    expect(rows.find((row) => row.id === "google-drive")).toMatchObject({
      statusKind: "planned",
      purpose: "Documents",
      lastSync: "Not Connected",
    });
    expect(rows.find((row) => row.id === "microsoft-365")).toMatchObject({
      statusKind: "planned",
      purpose: "Email & Calendar",
      lastSync: "Not Connected",
    });
  });
});
