/**
 * @vitest-environment jsdom
 * 047 — Create Ecosystem & Asset Generation
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertAssetRegistryIntegrity,
  acceptGeneratedAsset,
  getCreateAssetById,
  getCreationEcosystemForBlueprint,
  listCreateAssets,
  listCreationEcosystems,
  mergeEcosystemSignals,
  resolveAssetAcceptFromUserText,
  signalsFromEventSections,
  startCreationEcosystem,
  suggestNextAssets,
} from "./index";

describe("047 Create Asset Registry", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("registry has no duplicate ids or broken dependencies", () => {
    expect(assertAssetRegistryIntegrity()).toEqual([]);
    expect(listCreateAssets().length).toBeGreaterThan(15);
  });

  it("confirmation email is one shared asset used across ecosystems", () => {
    const email = getCreateAssetById("asset-confirmation-email");
    expect(email?.primaryChamberMemberId).toBe("content");
    expect(email?.supportingChamberMemberIds).toContain("events");
    const ecosystemsUsing = listCreationEcosystems().filter((e) =>
      e.assets.some((a) => a.assetId === "asset-confirmation-email"),
    );
    expect(ecosystemsUsing.length).toBeGreaterThanOrEqual(2);
  });

  it("retreat ecosystem references shared assets — not a single document", () => {
    const eco = getCreationEcosystemForBlueprint("bp-retreat-event");
    expect(eco?.label).toBe("Retreat Weekend");
    expect(eco?.assets.length).toBeGreaterThan(15);
    const ids = eco!.assets.map((a) => a.assetId);
    expect(ids).toContain("asset-registration-form");
    expect(ids).toContain("asset-speaker-packet");
    expect(ids).toContain("asset-volunteer-handbook");
    expect(ids).toContain("asset-run-of-show");
  });

  it("never dumps all assets — suggests at most 3 after venue", () => {
    const started = startCreationEcosystem({
      blueprintId: "bp-retreat-event",
      title: "Spring Retreat",
      eventRecordId: "evt-test-1",
    });
    expect(started).toBeTruthy();
    const withVenue = mergeEcosystemSignals(started!, [
      "venue",
      "dates",
      "outcomes",
    ]);
    const result = suggestNextAssets({
      ecosystemRecord: withVenue,
      newSignals: ["venue"],
    });
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeLessThanOrEqual(3);
    expect(result.offerLine).toBeTruthy();
    expect(result.offerLine).not.toMatch(/Speaker Bios.*Incident Log.*Archive/s);
    expect(result.suggestions.some((s) => s.assetId === "asset-registration-form")).toBe(
      true,
    );
  });

  it("one-click generate adds a connected instance without inventing tasks", () => {
    const started = startCreationEcosystem({
      blueprintId: "bp-retreat-event",
      title: "Spring Retreat",
    })!;
    const next = acceptGeneratedAsset(started, "asset-registration-form");
    expect(next.instances.some((i) => i.assetId === "asset-registration-form")).toBe(
      true,
    );
    expect(next.instances).toHaveLength(2); // plan + registration
  });

  it("resolves explicit build request to a pending asset", () => {
    const started = startCreationEcosystem({
      blueprintId: "bp-retreat-event",
      title: "Spring Retreat",
    })!;
    const withPending = {
      ...started,
      pendingSuggestionIds: [
        "asset-registration-form",
        "asset-venue-notes",
        "asset-vendor-list",
      ],
    };
    expect(
      resolveAssetAcceptFromUserText(withPending, "Build the registration form"),
    ).toBe("asset-registration-form");
    expect(
      resolveAssetAcceptFromUserText(withPending, "yes, build one"),
    ).toBe("asset-registration-form");
  });

  it("maps event section progress to unlock signals", () => {
    const signals = signalsFromEventSections({
      outcomes: "Rest and clarity",
      venue: "Mountain lodge",
      format: "in_person",
    });
    expect(signals).toContain("ecosystem_started");
    expect(signals).toContain("outcomes");
    expect(signals).toContain("venue");
    expect(signals).toContain("format");
  });

  it("standard document exists and names the Asset Registry", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/047_CREATE_ECOSYSTEM_AND_ASSET_GENERATION_STANDARD.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/Create Asset Registry/);
    expect(body).toMatch(/One Creation = One Ecosystem/);
    expect(body).toMatch(/045/);
    expect(body).toMatch(/046/);
  });
});
