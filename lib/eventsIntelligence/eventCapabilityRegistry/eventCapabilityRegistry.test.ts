/**
 * @vitest-environment jsdom
 * 053 — Event Capability Registry & Dynamic Section Runtime
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clearRelationshipRegistryForTests } from "@/lib/creationEcosystem";
import {
  clearActiveEventRecord,
  processEventsIntelligenceTurn,
  EVENT_SECTION_DEFS,
} from "@/lib/eventsIntelligence";
import { clearEventAssetInstancesForTests } from "@/lib/eventsIntelligence/eventAssetRegistry";
import { buildEventCreationWorkspace } from "@/lib/eventCreationWorkspace";
import {
  addAssetToSection,
  assertEventCapabilityRegistryIntegrity,
  buildDynamicSectionRuntimePanel,
  capabilitiesForSection,
  dynamicSectionsLoadFromRegistryOnly,
  getEventCapability,
  listEventAssetTemplates,
  listEventCapabilities,
  resolveCapabilityAlias,
  sectionSupportsAddAsset,
} from "./index";

describe("053 Event Capability Registry", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveEventRecord();
    clearEventAssetInstancesForTests();
    clearRelationshipRegistryForTests();
  });

  it("standard document exists with three-layer model", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/053_EVENT_CAPABILITY_REGISTRY_AND_DYNAMIC_SECTION_RUNTIME.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/Capabilities/i);
    expect(body).toMatch(/Asset Types/i);
    expect(body).toMatch(/Templates/i);
    expect(body).toMatch(/Add Asset/i);
    expect(body).toMatch(/Event Architect Studio/i);
  });

  it("capability registry integrity — unique ids, linked assets & sections", () => {
    expect(assertEventCapabilityRegistryIntegrity()).toEqual([]);
    expect(listEventCapabilities().length).toBeGreaterThanOrEqual(20);
    expect(getEventCapability("cap_echo_command_center")?.userFacingName).toMatch(
      /ECHO/i,
    );
    expect(getEventCapability("cap_finance_budget")?.assetTypeIds).toContain(
      "event_budget",
    );
  });

  it("separates capabilities from asset types and templates", () => {
    const caps = listEventCapabilities();
    const templates = listEventAssetTemplates("agenda");
    expect(caps.some((c) => c.capabilityId === "cap_program_agenda")).toBe(true);
    expect(templates.some((t) => t.templateId.includes("workshop"))).toBe(true);
    // Capability is not an asset type id
    expect(caps.every((c) => !c.capabilityId.startsWith("agenda"))).toBe(true);
  });

  it("every workspace section supports Add Asset and loads from registry", () => {
    expect(dynamicSectionsLoadFromRegistryOnly()).toBe(true);
    for (const s of EVENT_SECTION_DEFS) {
      expect(sectionSupportsAddAsset(s.id)).toBe(true);
    }
  });

  it("dynamic section panel loads capabilities, assets, templates — not hardcoded dumps", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a one-day workshop event.",
      forceStart: true,
    });
    const panel = buildDynamicSectionRuntimePanel(start.record!, "agenda");
    expect(panel.supportsAddAsset).toBe(true);
    expect(panel.capabilities.length).toBeGreaterThan(0);
    expect(panel.assetTypes.some((a) => a.assetTypeId === "agenda")).toBe(true);
    expect(panel.templates.length).toBeGreaterThan(0);
    expect(panel.recommendedAssets.length).toBeLessThanOrEqual(6);
  });

  it("workspace snapshot includes 053 runtime panels for focus sections", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a workshop for ADHD business people.",
      forceStart: true,
    });
    const snap = buildEventCreationWorkspace(start.record!);
    expect(snap.sectionRuntimePanels.length).toBe(snap.focusSectionIds.length);
    expect(snap.sectionRuntimePanels.every((p) => p.supportsAddAsset)).toBe(true);
  });

  it("+ Add Asset connects Event Record, workspace, relationships, project, readiness", () => {
    const start = processEventsIntelligenceTurn({
      userText:
        "Help me create a one-day workshop whose purpose is beta testing the ADHD platform.",
      forceStart: true,
    });
    const receipt = addAssetToSection({
      record: start.record!,
      sectionId: "agenda",
      assetTypeId: "agenda",
      templateId: "tpl-agenda-one-day-workshop",
    });
    expect(receipt.connected).toBe(true);
    expect(receipt.instance?.eventRecordId).toBe(start.record!.id);
    expect(receipt.instance?.creationWorkspaceId).toBeTruthy();
    expect(receipt.instance?.contentRef).toBe(
      "template:tpl-agenda-one-day-workshop",
    );
    expect(receipt.relationshipRegistryKey).toBeTruthy();
    expect(receipt.reasons).toEqual(
      expect.arrayContaining([
        "connected_event_record",
        "connected_creation_workspace",
        "connected_relationship_registry",
        "readiness_updated",
      ]),
    );
    expect(receipt.readinessPercent).not.toBeNull();

    // No duplicate orphan on second add
    const again = addAssetToSection({
      record: start.record!,
      sectionId: "agenda",
      assetTypeId: "agenda",
    });
    expect(again.duplicated).toBe(true);
    expect(again.instance?.instanceId).toBe(receipt.instance?.instanceId);
  });

  it("recommendations stay focused; registration email owned under registration capability", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a conference event.",
      forceStart: true,
    });
    const panel = buildDynamicSectionRuntimePanel(
      start.record!,
      "registration",
    );
    expect(
      panel.assetTypes.some(
        (a) => a.assetTypeId === "registration_confirmation_email",
      ),
    ).toBe(true);
    expect(panel.recommendedAssets.length).toBeLessThanOrEqual(6);
    expect(
      capabilitiesForSection("registration").some(
        (c) => c.capabilityId === "cap_registration_ticketing",
      ),
    ).toBe(true);
  });

  it("capability aliases resolve (ECHO, budgeting, accessibility)", () => {
    expect(resolveCapabilityAlias("ECHO")?.capabilityId).toBe(
      "cap_echo_command_center",
    );
    expect(resolveCapabilityAlias("budgeting")?.capabilityId).toBe(
      "cap_finance_budget",
    );
    expect(resolveCapabilityAlias("accessibility")?.capabilityId).toBe(
      "cap_accessibility_inclusion",
    );
  });
});
