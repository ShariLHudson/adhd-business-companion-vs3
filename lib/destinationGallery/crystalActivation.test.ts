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

describe("Destination Gallery crystalActivation (pass 1)", () => {
  const ids: DestinationCrystalId[] = [
    "schedule",
    "write",
    "save",
    "spark-social-media",
    "print",
    "create",
  ];

  it("maps every crystal id to a safe activation kind", () => {
    expect(resolveCrystalActivation("schedule").kind).toBe("open_calendar");
    expect(resolveCrystalActivation("write").kind).toBe("prepared_document");
    expect(resolveCrystalActivation("save").kind).toBe("prepared_store");
    expect(resolveCrystalActivation("spark-social-media").kind).toBe(
      "prepared_share",
    );
    expect(resolveCrystalActivation("print").kind).toBe("prepared_print");
    expect(resolveCrystalActivation("create").kind).toBe("design_pending");
  });

  it("only Schedule leaves the gallery", () => {
    for (const id of ids) {
      const activation = resolveCrystalActivation(id);
      expect(crystalLeavesGallery(activation.kind)).toBe(id === "schedule");
    }
  });

  it("Design stays pending and forbids legacy Create", () => {
    const design = resolveCrystalActivation("create");
    expect(design.body).toBe("Design connection is being prepared.");
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
    expect(client).toContain("setDestinationCrystalPrepared(activation)");

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
