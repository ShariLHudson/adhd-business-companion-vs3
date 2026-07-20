/**
 * @vitest-environment jsdom
 * 049 — Creation Ecosystem Connection + Relationship Registry
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  acceptGeneratedAsset,
  startCreationEcosystem,
} from "@/lib/createAssets";
import { processEventsIntelligenceTurn } from "@/lib/eventsIntelligence";
import {
  assetsNeedingReviewAfterChange,
  buildCreationConversationContext,
  clearRelationshipRegistryForTests,
  computeCreationReadiness,
  connectGeneratedAssetToEcosystem,
  listAssetRelationshipCards,
  listRelationshipEdges,
  registerConnectedAsset,
  resolveLargerCreation,
  runPreCreateChecks,
} from "./index";

describe("049 Creation Ecosystem Connection", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearRelationshipRegistryForTests();
  });

  it("standard document exists and names Relationship Registry", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/049_CREATION_ECOSYSTEM_CONNECTION_STANDARD.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/Relationship Registry/);
    expect(body).toMatch(/Never duplicate/);
    expect(body).toMatch(/Never orphan/);
    expect(body).toMatch(/048/);
  });

  it("resolves larger creation from active Event Record — never orphans", () => {
    processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const resolved = resolveLargerCreation({ preferActiveEvent: true });
    expect(resolved).toBeTruthy();
    expect(resolved!.title.toLowerCase()).toMatch(/retreat/);
    expect(resolved!.eventRecord).toBeTruthy();
    expect(resolved!.ecosystem).toBeTruthy();
  });

  it("registers connected assets in the Relationship Registry", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const eco = startCreationEcosystem({
      blueprintId: "bp-retreat-event",
      title: start.record!.title,
      eventRecordId: start.record!.id,
      canonicalWorkId: start.record!.canonicalWorkId,
      projectHomeId: start.record!.projectHomeId,
    })!;

    const next = acceptGeneratedAsset(eco, "asset-registration-form");
    const cards = listAssetRelationshipCards(
      next.canonicalWorkId || next.eventRecordId || next.id,
    );
    expect(cards.some((c) => c.assetDefId === "asset-registration-form")).toBe(
      true,
    );
    const edges = listRelationshipEdges(
      next.canonicalWorkId || next.eventRecordId || next.id,
    );
    expect(edges.some((e) => e.relation === "parent")).toBe(true);
    expect(edges.some((e) => e.relation === "supports")).toBe(true);
  });

  it("audience change surfaces related assets needing review", () => {
    const creationId = "cw-test-workshop";
    registerConnectedAsset({
      creationId,
      assetDefId: "asset-registration-form",
      label: "Registration Form",
      createdBy: "events",
      supportsSectionIds: ["audience", "registration"],
    });
    registerConnectedAsset({
      creationId,
      assetDefId: "asset-confirmation-email",
      label: "Confirmation Email",
      createdBy: "content",
      supportsSectionIds: ["audience", "registration"],
      dependsOnAssetIds: ["asset-registration-form"],
    });
    const review = assetsNeedingReviewAfterChange({
      creationId,
      changedKind: "section",
      changedId: "audience",
    });
    expect(review.map((r) => r.assetDefId).sort()).toEqual([
      "asset-confirmation-email",
      "asset-registration-form",
    ]);
  });

  it("conversation context lists do-not-reask fields", () => {
    processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    processEventsIntelligenceTurn({
      userText: "People leave rested and clear.",
    });
    const resolved = resolveLargerCreation({ preferActiveEvent: true })!;
    const ctx = buildCreationConversationContext(resolved);
    expect(ctx.doNotReask).toContain("outcomes");
    expect(ctx.doNotReask).toContain("event_type");
    expect(ctx.outcomes.toLowerCase()).toMatch(/rested/);
  });

  it("pre-create checks refuse duplicate when similar asset exists", () => {
    const eco = startCreationEcosystem({
      blueprintId: "bp-retreat-event",
      title: "Spring Retreat",
      eventRecordId: "evt-dup-1",
    })!;
    acceptGeneratedAsset(eco, "asset-registration-form");
    const checks = runPreCreateChecks({
      assetDefId: "asset-registration-form",
      eventRecordId: "evt-dup-1",
    });
    expect(checks.similarExists).toBe(true);
    expect(checks.belongsToExisting).toBe(true);
  });

  it("readiness increases when assets are connected", () => {
    const eco = startCreationEcosystem({
      blueprintId: "bp-workshop",
      title: "Client Workshop",
      eventRecordId: "evt-ready-1",
    })!;
    const creationId = eco.canonicalWorkId || eco.eventRecordId || eco.id;
    connectGeneratedAssetToEcosystem({
      ecosystem: eco,
      assetDefId: "asset-event-plan",
    });
    const before = computeCreationReadiness({
      creationId,
      ecosystem: eco,
      expectedAssetIds: [
        "asset-event-plan",
        "asset-agenda",
        "asset-registration-form",
      ],
    });
    const withReg = acceptGeneratedAsset(eco, "asset-registration-form");
    const after = computeCreationReadiness({
      creationId,
      ecosystem: withReg,
      expectedAssetIds: [
        "asset-event-plan",
        "asset-agenda",
        "asset-registration-form",
      ],
    });
    expect(after.overallPercent).toBeGreaterThanOrEqual(before.overallPercent);
  });
});
