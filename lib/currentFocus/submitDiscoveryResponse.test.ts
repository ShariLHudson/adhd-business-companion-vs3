/**
 * SOP Reasoning-First Migration, Phase 2 (2026-08-06) — submitCurrentFocusResponse
 * routing for discovery focus ids, and the durable persistence round trip
 * for the raw discoveryAnswers/skippedDiscoveryIds state (distinct from the
 * derived Working Memory values, which Phase 2's own tests already cover).
 *
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import { submitCurrentFocusResponse } from "./submitCurrentFocusResponse";
import {
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  getRuntimeCreationRecord,
  upsertRuntimeCreationRecord,
} from "./creationRecord";
import { resolveCanonicalCurrentFocus } from "./resolveCanonicalFocus";
import { defaultTemplateFor } from "@/lib/createTemplates";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";
import { buildAuthoritativeFromWorkflow } from "@/lib/creationDurable/mapping";
import { authoritativeToRuntimeRecord } from "@/lib/creationDurable/applyVerified";

function sopWorkflow(sessionId: string): CreateWorkflowState {
  const template = defaultTemplateFor("SOP");
  return {
    sessionId,
    selectedTypeLabel: "SOP",
    useTemplate: true,
    selectedTemplateId: template.id,
    templateSections: template.sections,
    sectionContent: {},
    skippedSectionIds: [],
    workspaceFirst: true,
    questionMode: "current_focus",
  } as CreateWorkflowState;
}

describe("submitCurrentFocusResponse routes discovery focus ids correctly", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearRuntimeCreationRecordsForTests();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
  });

  it("an answer to a discovery question writes it and advances to question 2", async () => {
    const workflow = sopWorkflow("submit-disc-1");
    const focus = resolveCanonicalCurrentFocus({
      creationId: "submit-disc-1",
      workflow,
    })!;
    expect(focus.focusId).toBe("discovery:sop-audience-type");

    const result = await submitCurrentFocusResponse(
      {
        creationId: "submit-disc-1",
        focusId: focus.focusId,
        response: "my own business",
        responseType: "multiline",
        requestId: "req-1",
        contextVersion: focus.contextVersion,
      },
      { workflow },
    );

    expect(result.ok).toBe(true);
    expect(result.nextFocus?.focusId).toBe("discovery:sop-starting-point");
    const record = getRuntimeCreationRecord("submit-disc-1");
    expect(record?.discoveryAnswers?.["sop-audience-type"]).toBe(
      "my own business",
    );
    expect(record?.workingMemory?.ownershipContext).toBe("my own business");
  });

  it("skip resolves the discovery question without a Working Memory value", async () => {
    const workflow = sopWorkflow("submit-disc-2");
    const focus = resolveCanonicalCurrentFocus({
      creationId: "submit-disc-2",
      workflow,
    })!;

    const result = await submitCurrentFocusResponse(
      {
        creationId: "submit-disc-2",
        focusId: focus.focusId,
        response: "",
        responseType: "skip",
        requestId: "req-2",
        contextVersion: focus.contextVersion,
      },
      { workflow },
    );

    expect(result.ok).toBe(true);
    expect(result.nextFocus?.focusId).toBe("discovery:sop-starting-point");
    const record = getRuntimeCreationRecord("submit-disc-2");
    expect(record?.skippedDiscoveryIds).toContain("sop-audience-type");
    expect(record?.workingMemory?.ownershipContext ?? null).toBeNull();
  });

  it("unsure never advances, for a discovery focus same as for sections", async () => {
    const workflow = sopWorkflow("submit-disc-3");
    const focus = resolveCanonicalCurrentFocus({
      creationId: "submit-disc-3",
      workflow,
    })!;

    const unsure = await submitCurrentFocusResponse(
      {
        creationId: "submit-disc-3",
        focusId: focus.focusId,
        response: "",
        responseType: "unsure",
        requestId: "req-3",
        contextVersion: focus.contextVersion,
      },
      { workflow },
    );
    expect(unsure.ok).toBe(true);
    expect(unsure.advanced).toBe(false);
    expect(unsure.nextFocus?.focusId).toBe("discovery:sop-audience-type");
  });

  it("the third answer advances into the existing, unmodified Purpose section", async () => {
    const workflow = sopWorkflow("submit-disc-4");
    let focus = resolveCanonicalCurrentFocus({
      creationId: "submit-disc-4",
      workflow,
    })!;

    for (const answer of [
      "my own business",
      "starting from scratch",
      "just me",
    ]) {
      const result = await submitCurrentFocusResponse(
        {
          creationId: "submit-disc-4",
          focusId: focus.focusId,
          response: answer,
          responseType: "multiline",
          requestId: `req-${answer}`,
          contextVersion: focus.contextVersion,
        },
        { workflow },
      );
      expect(result.ok).toBe(true);
      focus = result.nextFocus!;
    }

    expect(focus.sectionId).toBe("purpose");
    expect(focus.focusId).not.toMatch(/^discovery:/);
  });
});

describe("Discovery state survives the durable save / hydrate round trip", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearRuntimeCreationRecordsForTests();
  });

  it("persists sopDiscoveryAnswers / sopSkippedDiscoveryIds and reads them back", () => {
    const workflow = sopWorkflow("submit-disc-5");
    const record = ensureRuntimeCreationRecord(workflow);
    const withDiscovery = upsertRuntimeCreationRecord({
      ...record,
      discoveryAnswers: { "sop-audience-type": "my own business" },
      skippedDiscoveryIds: ["sop-starting-point"],
    });

    const authoritative = buildAuthoritativeFromWorkflow({
      workflow,
      runtime: withDiscovery,
      userId: "test-user",
    });
    const snapshot = authoritative.payload.workflowSnapshot as {
      sopDiscoveryAnswers?: Record<string, string>;
      sopSkippedDiscoveryIds?: string[];
    } | null;
    expect(snapshot?.sopDiscoveryAnswers).toEqual({
      "sop-audience-type": "my own business",
    });
    expect(snapshot?.sopSkippedDiscoveryIds).toEqual(["sop-starting-point"]);

    const rehydrated = authoritativeToRuntimeRecord(authoritative);
    expect(rehydrated.discoveryAnswers).toEqual({
      "sop-audience-type": "my own business",
    });
    expect(rehydrated.skippedDiscoveryIds).toEqual(["sop-starting-point"]);
  });

  it("a record saved before this phase hydrates with null discovery state, not a throw", () => {
    const authoritative = buildAuthoritativeFromWorkflow({
      workflow: sopWorkflow("submit-disc-6"),
      runtime: null,
      userId: "test-user",
    });
    expect(() => authoritativeToRuntimeRecord(authoritative)).not.toThrow();
    const rehydrated = authoritativeToRuntimeRecord(authoritative);
    expect(rehydrated.discoveryAnswers).toBeNull();
    expect(rehydrated.skippedDiscoveryIds).toBeNull();
  });
});
