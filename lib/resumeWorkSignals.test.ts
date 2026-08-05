/**
 * 2026-08-05 fix — active-creation and visual-focus-map must be able to
 * become eligible for Continue Where I Left Off when real work exists,
 * and must stay ineligible when nothing has actually been done. Both
 * types were silently falling to `default: viewedOnly: true` in
 * buildSignalForItem — see ADR-013 / the 2026-08-05 architectural audit.
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach } from "vitest";
import {
  buildResumeWorkSignals,
  mapContinuityTypeToResumeKind,
} from "./resumeWorkSignals";
import { evaluateResumeWorkEligibility } from "./resumeWorkEligibility";
import type { ContinuityManifestItem } from "./continuityManifest";
import {
  clearRuntimeCreationRecordsForTests,
  upsertRuntimeCreationRecord,
} from "./currentFocus/creationRecord";
import { createAndActivateMap, saveVisualFocusMap } from "./visualFocus/store";

function activeCreationItem(workspaceId: string): ContinuityManifestItem {
  return {
    id: `active-creation:${workspaceId}`,
    title: "Test Workspace",
    type: "active-creation",
    lastTouchedAt: new Date().toISOString(),
    location: "Checklist",
    storageKey: "spark.activeWorkspaceRegistry.v1",
    resumeAction: "restore-active-creation",
  };
}

function visualFocusItem(mapId: string): ContinuityManifestItem {
  return {
    id: `visual-focus:${mapId}`,
    title: "Test Map",
    type: "visual-focus-map",
    lastTouchedAt: new Date().toISOString(),
    location: "Mind Map",
    storageKey: "spark.visualFocusMaps.v1",
    resumeAction: "restore-visual-focus",
    visualFocusMapId: mapId,
  };
}

describe("resumeWorkSignals — active-creation and visual-focus-map", () => {
  beforeEach(() => {
    localStorage.clear();
    clearRuntimeCreationRecordsForTests();
  });

  it("active-creation with real answered content is eligible for Continue", () => {
    upsertRuntimeCreationRecord({
      id: "create-real-1",
      typeLabel: "Checklist",
      title: "Client Onboarding Checklist",
      sectionContent: { overview: "Send the welcome packet first." },
      skippedSectionIds: [],
      knownFacts: [],
      focusSectionId: "next-steps",
      eventRecordId: null,
      draftContent: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const [signal] = buildResumeWorkSignals([activeCreationItem("create-real-1")]);
    expect(signal.viewedOnly).not.toBe(true);
    expect(evaluateResumeWorkEligibility(signal).eligible).toBe(true);
  });

  it("active-creation with no answers and no draft stays ineligible (not merely opened)", () => {
    upsertRuntimeCreationRecord({
      id: "create-empty-1",
      typeLabel: "Checklist",
      title: "Untitled",
      sectionContent: {},
      skippedSectionIds: [],
      knownFacts: [],
      focusSectionId: "overview",
      eventRecordId: null,
      draftContent: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const [signal] = buildResumeWorkSignals([activeCreationItem("create-empty-1")]);
    expect(signal.viewedOnly).toBe(true);
    expect(evaluateResumeWorkEligibility(signal).eligible).toBe(false);
  });

  it("active-creation with no matching runtime record stays ineligible (never crashes)", () => {
    const [signal] = buildResumeWorkSignals([activeCreationItem("create-missing")]);
    expect(signal.viewedOnly).toBe(true);
    expect(evaluateResumeWorkEligibility(signal).eligible).toBe(false);
  });

  it("visual-focus-map with real labeled nodes is eligible for Continue", () => {
    const map = createAndActivateMap("mind-map");
    saveVisualFocusMap({
      ...map,
      root: {
        id: map.root.id,
        label: "Central Idea",
        children: [{ id: "child-1", label: "Real branch idea", children: [] }],
      },
    });

    const [signal] = buildResumeWorkSignals([visualFocusItem(map.id)]);
    expect(signal.viewedOnly).not.toBe(true);
    expect(evaluateResumeWorkEligibility(signal).eligible).toBe(true);
  });

  it("visual-focus-map with only placeholder/empty content stays ineligible", () => {
    // The default template ships pre-filled example labels (by design —
    // members get a starter scaffold), so use an explicit placeholder root
    // to represent "opened but nothing real added yet."
    const map = createAndActivateMap("mind-map");
    saveVisualFocusMap({
      ...map,
      root: { id: map.root.id, label: "Central Idea", children: [] },
    });

    const [signal] = buildResumeWorkSignals([visualFocusItem(map.id)]);
    expect(signal.viewedOnly).toBe(true);
    expect(evaluateResumeWorkEligibility(signal).eligible).toBe(false);
  });

  it("mapContinuityTypeToResumeKind handles both types without throwing", () => {
    expect(mapContinuityTypeToResumeKind("active-creation")).toBe("create");
    expect(mapContinuityTypeToResumeKind("visual-focus-map")).toBe("create");
    expect(mapContinuityTypeToResumeKind("saved-work")).toBe("create");
  });
});
