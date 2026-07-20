/**
 * @vitest-environment jsdom
 * Event Asset Registry — canonical definitions (not instances, not subtype copies).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { processEventsIntelligenceTurn } from "../guideEventPlanning";
import {
  assertEventAssetRegistryIntegrity,
  clearEventAssetInstancesForTests,
  createEventAssetInstance,
  getEventAssetDefinition,
  linksFromEventRecord,
  listEventAssetDefinitions,
  listEventAssetInstances,
  listEventAssetsForEventType,
  listFocusEventAssetsForType,
  presentationLabelForEvent,
  resolveEventAssetDefinition,
} from "./index";

describe("Event Asset Registry", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearEventAssetInstancesForTests();
  });

  it("passes integrity — one id per asset, valid bridges, no orphan deps", () => {
    expect(assertEventAssetRegistryIntegrity()).toEqual([]);
  });

  it("has one canonical registration_confirmation_email — not per event subtype", () => {
    const defs = listEventAssetDefinitions().filter((d) =>
      /confirmation/i.test(d.assetTypeId),
    );
    expect(defs).toHaveLength(1);
    expect(defs[0]!.assetTypeId).toBe("registration_confirmation_email");

    const byAlias = resolveEventAssetDefinition("Retreat Confirmation Email");
    expect(byAlias?.assetTypeId).toBe("registration_confirmation_email");
    expect(resolveEventAssetDefinition("Workshop Confirmation Email")?.assetTypeId).toBe(
      "registration_confirmation_email",
    );
  });

  it("covers planning through reuse without treating event as one document", () => {
    const ids = listEventAssetDefinitions().map((d) => d.assetTypeId);
    for (const needed of [
      "event_plan",
      "agenda",
      "event_budget",
      "registration_form",
      "landing_page",
      "registration_confirmation_email",
      "registration_reminder_email",
      "attendee_workbook",
      "presentation_deck",
      "speaker_packet",
      "vendor_brief",
      "volunteer_guide",
      "run_of_show",
      "technology_plan",
      "feedback_survey",
      "thank_you_message",
      "debrief_report",
    ]) {
      expect(ids).toContain(needed);
    }
    expect(ids.length).toBeGreaterThanOrEqual(25);
  });

  it("declares creation mode and editable honesty", () => {
    const form = getEventAssetDefinition("registration_form");
    expect(form?.creationMode).toBe("native_form_builder");
    expect(form?.editableInPlatform).toBe(true);

    const archive = getEventAssetDefinition("archive_package");
    expect(archive?.creationMode).toBe("reference_only");
    expect(archive?.editableInPlatform).toBe(false);
  });

  it("filters by event type without duplicating definitions", () => {
    const webinar = listEventAssetsForEventType("webinar");
    expect(webinar.some((d) => d.assetTypeId === "registration_form")).toBe(
      true,
    );
    expect(webinar.some((d) => d.assetTypeId === "venue_comparison")).toBe(
      false,
    );

    const retreat = listEventAssetsForEventType("retreat");
    expect(retreat.some((d) => d.assetTypeId === "volunteer_guide")).toBe(true);
    expect(retreat.some((d) => d.assetTypeId === "packing_list")).toBe(true);
  });

  it("focus list is smaller than the full registry", () => {
    const focus = listFocusEventAssetsForType("retreat");
    const all = listEventAssetsForEventType("retreat");
    expect(focus.length).toBeGreaterThan(3);
    expect(focus.length).toBeLessThan(all.length);
  });

  it("adapts presentation label without creating a new asset type", () => {
    const def = getEventAssetDefinition("registration_confirmation_email")!;
    expect(presentationLabelForEvent(def, "Retreat")).toMatch(/Retreat.*Confirmation/i);
    expect(def.assetTypeId).toBe("registration_confirmation_email");
  });

  it("instances require Event Record + workspace — never orphans", () => {
    expect(
      createEventAssetInstance("agenda", {
        eventRecordId: "",
        creationWorkspaceId: "ws-1",
        eventType: "workshop",
        lifecyclePhase: "planning",
      }),
    ).toBeNull();

    const start = processEventsIntelligenceTurn({
      userText: "I need help creating a workshop event.",
    });
    const record = start.record!;
    const instance = createEventAssetInstance(
      "registration_form",
      linksFromEventRecord(record),
    );
    expect(instance).toBeTruthy();
    expect(instance!.eventRecordId).toBe(record.id);
    expect(instance!.creationWorkspaceId).toBeTruthy();
    expect(instance!.canonicalWorkId).toBe(record.canonicalWorkId);
    expect(listEventAssetInstances(record.id)).toHaveLength(1);

    // Second create returns same instance — no duplicate
    const again = createEventAssetInstance(
      "registration_form",
      linksFromEventRecord(record),
    );
    expect(again?.instanceId).toBe(instance!.instanceId);
  });

  it("bridges to Create Asset Registry when linked", () => {
    const budget = getEventAssetDefinition("event_budget");
    expect(budget?.createAssetRegistryId).toBe("asset-budget");
    const workbook = getEventAssetDefinition("attendee_workbook");
    expect(workbook?.createAssetRegistryId).toBeNull();
  });
});
