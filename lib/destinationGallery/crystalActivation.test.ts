import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  FORBIDDEN_CRYSTAL_TARGETS,
  crystalLeavesGallery,
  isLegacyCreateForbidden,
  resolveCrystalActivation,
} from "./crystalActivation";
import type { DestinationCrystalId } from "./constants";

describe("Destination Gallery crystalActivation (Prompt 142)", () => {
  const ids: DestinationCrystalId[] = [
    "schedule",
    "write",
    "save",
    "spark-social-media",
    "print",
    "create",
  ];

  it("maps every crystal id to a safe activation kind", () => {
    expect(resolveCrystalActivation("schedule").kind).toBe("needs_connection");
    expect(resolveCrystalActivation("write").kind).toBe("prepared_document");
    expect(resolveCrystalActivation("save").kind).toBe("prepared_store");
    expect(resolveCrystalActivation("spark-social-media").kind).toBe(
      "needs_connection",
    );
    expect(resolveCrystalActivation("print").kind).toBe("prepared_print");
    expect(resolveCrystalActivation("create").kind).toBe("needs_connection");
  });

  it("opens Canva when connected with a destination URL", () => {
    const activation = resolveCrystalActivation("create", {
      connections: {
        google: { configured: true, connected: false, email: null },
        outlookConnected: false,
        canvaConnected: true,
      },
      canvaDestinationUrl: "https://www.canva.com/",
    });
    expect(activation.kind).toBe("open_external_url");
    expect(activation.externalUrl).toBe("https://www.canva.com/");
    expect(crystalLeavesGallery(activation.kind)).toBe(true);
  });

  it("only Schedule and external Canva leave the gallery by default", () => {
    for (const id of ids) {
      const activation = resolveCrystalActivation(id);
      expect(crystalLeavesGallery(activation.kind)).toBe(false);
    }
  });

  it("Design forbids legacy Create and guides to Connections when disconnected", () => {
    const design = resolveCrystalActivation("create");
    expect(design.body).toMatch(/Canva/i);
    expect(design.shouldOpenConnections).toBe(true);
    expect(isLegacyCreateForbidden(design.kind)).toBe(true);
  });

  it("wires CompanionPageClient crystal handler without forbidden targets", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("onSelectCrystal={handleSelectDestinationCrystal}");
    expect(client).toContain("function handleSelectDestinationCrystal");
    expect(client).toContain('activation.kind === "open_calendar"');
    expect(client).toContain("openCalendarCore()");
    expect(client).toContain('activation.kind === "open_external_url"');
    expect(client).toContain("setDestinationCrystalPrepared(activation)");
    expect(client).toContain("CrystalActionsPanel");
    expect(client).toContain("setCrystalActionsKind");

    const handler = client.match(
      /function handleSelectDestinationCrystal\([\s\S]*?\n  \}/,
    )?.[0];
    expect(handler).toBeTruthy();
    for (const forbidden of FORBIDDEN_CRYSTAL_TARGETS) {
      expect(handler).not.toContain(forbidden);
    }
    expect(handler).not.toContain("openCreateStudioCore");
    expect(handler).not.toContain("content-generator");
    expect(handler).not.toContain("drive.google.com");
    expect(handler).not.toContain("calendar.google.com");
  });
});
