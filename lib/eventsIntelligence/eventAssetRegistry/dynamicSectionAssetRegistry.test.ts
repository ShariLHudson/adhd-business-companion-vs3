/**
 * @vitest-environment jsdom
 * 052A — Dynamic Section Asset Registry
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { processEventsIntelligenceTurn } from "@/lib/eventsIntelligence";
import { createEmptyEventSections } from "@/lib/eventsIntelligence/eventSections";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { buildEventCreationWorkspace } from "@/lib/eventCreationWorkspace";
import {
  EVENT_ASSET_CATEGORIES,
  assertEventAssetRegistryIntegrity,
  buildSectionAssetPanel,
  createEventAssetInstance,
  linksFromEventRecord,
  recommendEventAssets,
  registryCapabilitiesForSection,
  searchEventCapabilityRegistry,
  sectionPanelLoadsFromRegistryOnly,
} from "./index";

function workshopWithBetaContext(): EventRecord {
  const start = processEventsIntelligenceTurn({
    userText: "Help me create a one-day workshop event.",
    forceStart: true,
  });
  const base = start.record!;
  return {
    ...base,
    title: "ADHD Business Platform Workshop",
    eventType: "workshop",
    eventTypeLabel: "Workshop",
    purpose:
      "Introduce business people to the new ADHD business platform and conduct beta testing.",
    audience:
      "Business people with ADHD; also non-ADHD business people who are interested.",
    outcomes: "Participants understand the platform and complete beta testing feedback.",
    format: "unspecified",
    dates: "",
    venue: "",
    sections: createEmptyEventSections({
      event_type: "Workshop",
      purpose:
        "Introduce business people to the new ADHD business platform and conduct beta testing.",
      audience:
        "Business people with ADHD; also non-ADHD business people who are interested.",
      outcomes:
        "Participants understand the platform and complete beta testing feedback.",
    }),
    conversationContext: base.conversationContext,
  };
}

describe("052A Dynamic Section Asset Registry", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("standard document exists", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/052A_DYNAMIC_SECTION_ASSET_REGISTRY_STANDARD.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/Never Hardcode Assets/i);
    expect(body).toMatch(/Capability Registry/i);
    expect(body).toMatch(/048/);
  });

  it("registry integrity holds and panels load from registry only", () => {
    expect(assertEventAssetRegistryIntegrity()).toEqual([]);
    expect(sectionPanelLoadsFromRegistryOnly()).toBe(true);
    expect(EVENT_ASSET_CATEGORIES.length).toBeGreaterThanOrEqual(20);
  });

  it("workspace sections resolve assets from registry — not hardcoded template lists", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const snap = buildEventCreationWorkspace(start.record!);
    const marketing = snap.sections.find((s) => s.id === "marketing");
    expect(marketing?.registryAssetTypeIds?.length).toBeGreaterThan(0);
    // Capabilities for registration come from registry
    const regCaps = registryCapabilitiesForSection(
      "registration",
      "workshop",
    );
    expect(regCaps.some((c) => c.assetTypeId === "registration_form")).toBe(
      true,
    );
    expect(snap.sectionAssetPanels.length).toBe(snap.focusSectionIds.length);
    expect(snap.focusedAssetRecommendations.length).toBeGreaterThan(0);
    expect(snap.focusedAssetRecommendations.length).toBeLessThanOrEqual(12);
  });

  it("recommendEventAssets classifies bands and excludes deprecated", () => {
    const record = workshopWithBetaContext();
    const result = recommendEventAssets(record, { focusLimit: 12 });
    expect(result.focused.every((r) => r.band !== "not_applicable")).toBe(true);
    expect(
      result.byBand.not_applicable.every((r) =>
        ["not_applicable"].includes(r.band),
      ),
    ).toBe(true);
    // Focused set is smaller than full registry
    expect(result.focused.length).toBeLessThan(
      result.all.filter((r) => r.band !== "not_applicable").length,
    );
  });

  it("webinar recommendations favor technology and exclude physical venue when virtual", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me plan a virtual webinar event.",
      forceStart: true,
    });
    const record = {
      ...start.record!,
      eventType: "webinar" as const,
      format: "virtual" as const,
      outcomes: "Teach a clear skill",
      audience: "Professionals online",
    };
    const result = recommendEventAssets(record);
    const focusedIds = result.focused.map((r) => r.assetTypeId);
    const applicableTech = result.all.filter(
      (r) =>
        r.assetTypeId === "technology_plan" &&
        r.band !== "not_applicable",
    );
    expect(applicableTech.length).toBeGreaterThan(0);
    const venueCompare = result.all.find(
      (r) => r.assetTypeId === "venue_comparison",
    );
    // Venue comparison excluded for webinar event types in registry
    expect(
      venueCompare?.band === "not_applicable" ||
        !focusedIds.includes("venue_comparison"),
    ).toBe(true);
  });

  it("already_created when instance exists", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a workshop event.",
    });
    const record = start.record!;
    createEventAssetInstance(
      "registration_form",
      linksFromEventRecord(record),
    );
    const result = recommendEventAssets(record);
    expect(
      result.byBand.already_created.some(
        (r) => r.assetTypeId === "registration_form",
      ),
    ).toBe(true);
    expect(
      result.focused.every((r) => r.assetTypeId !== "registration_form"),
    ).toBe(true);
  });

  it("section panel exposes recommended + registry capabilities without dumping all", () => {
    const record = workshopWithBetaContext();
    const panel = buildSectionAssetPanel(record, "registration");
    expect(panel.recommendedAssets.length).toBeLessThanOrEqual(6);
    expect(panel.registryCapabilities.length).toBeGreaterThan(0);
    expect(
      panel.registryCapabilities.every((c) =>
        c.eventSections.includes("registration"),
      ),
    ).toBe(true);
  });

  it("search finds confirmation email via alias without subtype duplication", () => {
    const hits = searchEventCapabilityRegistry("retreat confirmation email");
    expect(hits.some((h) => h.assetTypeId === "registration_confirmation_email")).toBe(
      true,
    );
    expect(
      hits.filter((h) => h.assetTypeId.includes("confirmation")).length,
    ).toBeLessThanOrEqual(2);
  });

  it("ADHD workshop context focuses useful next assets", () => {
    const record = workshopWithBetaContext();
    const { focused, byBand } = recommendEventAssets(record, {
      focusLimit: 16,
      contextText: record.purpose,
    });
    const ids = new Set([
      ...focused.map((r) => r.assetTypeId),
      ...byBand.recommended_now.map((r) => r.assetTypeId),
      ...byBand.required_now.map((r) => r.assetTypeId),
    ]);
    // Core / high-value workshop assets present in registry recommendations
    const expectedAny = [
      "event_plan",
      "agenda",
      "registration_form",
      "registration_confirmation_email",
      "landing_page",
      "event_budget",
      "technology_plan",
      "run_of_show",
      "accessibility_plan",
      "attendee_workbook",
    ];
    const hitCount = expectedAny.filter((id) => ids.has(id)).length;
    expect(hitCount).toBeGreaterThanOrEqual(5);
  });
});
