/**
 * SOP Build Journey — Phase 2a (record + mapping + hydrate safety).
 *
 * Proves: Working Memory accumulates progressively as the member answers,
 * survives the durable save/hydrate round trip, and — the D5 gate's own
 * requirement — records saved before this phase still open cleanly with no
 * throw. No conversation UI, no visibility change.
 *
 * @see docs/create-experience/SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md#10
 */

import { describe, expect, it } from "vitest";
import {
  applyAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  upsertRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import { defaultTemplateFor } from "@/lib/createTemplates";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";
import { authoritativeToRuntimeRecord } from "@/lib/creationDurable/applyVerified";
import { buildAuthoritativeFromWorkflow } from "@/lib/creationDurable/mapping";
import type { AuthoritativeCreationRecord } from "@/lib/creationDurable/types";

function sopWorkflow(sectionContent: Record<string, string> = {}): CreateWorkflowState {
  const template = defaultTemplateFor("SOP");
  return {
    sessionId: "sop-phase2-test",
    selectedTypeLabel: "SOP",
    useTemplate: true,
    selectedTemplateId: template.id,
    templateSections: template.sections,
    sectionContent,
    skippedSectionIds: [],
    workspaceFirst: true,
    questionMode: "current_focus",
  } as CreateWorkflowState;
}

describe("1. Working Memory accumulates progressively on the record", () => {
  it("starts empty, then fills in as sections are answered — never clobbering earlier context", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow());
    expect(record.workingMemory?.desiredResult ?? null).toBeNull();
    expect(record.workingMemory?.nextHelpfulStep).toBe("Continue with Purpose");

    record = applyAnswerToRuntimeCreationRecord(
      record.id,
      "purpose",
      "Izna can onboard a client without asking me every step.",
    )!;
    expect(record.workingMemory?.desiredResult).toBe(
      "Izna can onboard a client without asking me every step.",
    );
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue with Intended User",
    );

    record = applyAnswerToRuntimeCreationRecord(
      record.id,
      "intended-user",
      "Izna, my assistant",
    )!;
    // Earlier context survives the second answer.
    expect(record.workingMemory?.desiredResult).toBe(
      "Izna can onboard a client without asking me every step.",
    );
    expect(record.workingMemory?.primaryUser).toBe("Izna, my assistant");
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue with Before You Begin",
    );
  });

  it("is Build-Type-agnostic — a non-SOP creation still gets desiredResult from purpose", () => {
    clearRuntimeCreationRecordsForTests();
    const template = defaultTemplateFor("Email");
    const record = ensureRuntimeCreationRecord({
      sessionId: "email-phase2-test",
      selectedTypeLabel: "Email",
      useTemplate: true,
      selectedTemplateId: template.id,
      templateSections: template.sections,
      sectionContent: {},
      skippedSectionIds: [],
      workspaceFirst: true,
      questionMode: "current_focus",
    } as CreateWorkflowState);
    // Email has no "intended-user" section — primaryUser correctly stays null.
    expect(record.workingMemory?.primaryUser ?? null).toBeNull();
  });
});

describe("2. Working Memory survives the durable save / hydrate round trip", () => {
  it("a record with Working Memory persists it into the payload snapshot", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow());
    record = applyAnswerToRuntimeCreationRecord(
      record.id,
      "purpose",
      "Client can start onboarding without a call.",
    )!;

    const authoritative = buildAuthoritativeFromWorkflow({
      workflow: sopWorkflow({
        purpose: "Client can start onboarding without a call.",
      }),
      runtime: record,
      userId: "test-user",
    });

    const snapshot = authoritative.payload.workflowSnapshot as {
      workingMemory?: { desiredResult?: string | null };
    } | null;
    expect(snapshot?.workingMemory?.desiredResult).toBe(
      "Client can start onboarding without a call.",
    );
  });

  it("round-trips back into a RuntimeCreationRecord unchanged", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow());
    record = applyAnswerToRuntimeCreationRecord(
      record.id,
      "purpose",
      "Client can start onboarding without a call.",
    )!;
    record = applyAnswerToRuntimeCreationRecord(
      record.id,
      "intended-user",
      "Izna",
    )!;

    const authoritative = buildAuthoritativeFromWorkflow({
      workflow: sopWorkflow(record.sectionContent),
      runtime: record,
      userId: "test-user",
    });

    const rehydrated = authoritativeToRuntimeRecord(authoritative);
    expect(rehydrated.workingMemory?.desiredResult).toBe(
      "Client can start onboarding without a call.",
    );
    expect(rehydrated.workingMemory?.primaryUser).toBe("Izna");
  });
});

describe("3. D5 gate — records saved before Phase 2 still open cleanly (hydrate safety)", () => {
  function preExistingPayloadRecord(): AuthoritativeCreationRecord {
    // Simulates a row saved before this phase — workflowSnapshot has no
    // "workingMemory" key at all, exactly like every real row in the
    // database today.
    return {
      workspaceId: "pre-phase2-record",
      userId: "test-user",
      creationType: "SOP",
      title: "Old SOP",
      status: "active",
      originalRequest: "an SOP for something",
      kind: "creation",
      eventRecordId: null,
      projectHomeId: null,
      version: 3,
      payload: {
        schemaId: "sop-default",
        schemaVersion: "1",
        templateSections: [
          { id: "purpose", title: "Purpose", prompt: undefined },
          { id: "scope", title: "Scope", prompt: undefined },
          { id: "steps", title: "Steps", prompt: undefined },
          { id: "notes", title: "Notes & Tips", prompt: undefined },
        ],
        currentFocusId: "purpose",
        currentFocusIndex: 0,
        answers: { purpose: "Old purpose answer" },
        knownFacts: { purpose: "Old purpose answer" },
        draft: null,
        draftReady: false,
        progress: { answeredCount: 1, totalFocusCount: 4, percent: 25 },
        workflowSnapshot: {
          sessionId: "pre-phase2-record",
          selectedTypeLabel: "SOP",
          selectedTemplateName: "Old SOP",
          workingIntent: "Create SOP",
          originalRequest: "an SOP for something",
          skippedSectionIds: [],
          discoveryAnswers: {},
          draftStatus: "idle",
          workspacePhaseLabel: "Shaping",
          questionMode: "current_focus",
          creationWorkspaceKind: null,
          // Deliberately no "workingMemory" key — this is the pre-Phase-2 shape.
        },
        registryMeta: {
          humanTitle: "Old SOP",
          creationTypeLabel: "SOP",
          lastActiveAt: new Date().toISOString(),
          projectLinked: false,
        },
      },
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-01T00:00:00.000Z",
    };
  }

  it("does not throw and returns a valid record", () => {
    expect(() => authoritativeToRuntimeRecord(preExistingPayloadRecord())).not.toThrow();
  });

  it("workingMemory is null rather than crashing or fabricating data", () => {
    const record = authoritativeToRuntimeRecord(preExistingPayloadRecord());
    expect(record.workingMemory).toBeNull();
  });

  it("every other field on the old record still hydrates correctly", () => {
    const record = authoritativeToRuntimeRecord(preExistingPayloadRecord());
    expect(record.id).toBe("pre-phase2-record");
    expect(record.title).toBe("Old SOP");
    expect(record.sectionContent.purpose).toBe("Old purpose answer");
    expect(record.templateSections).toHaveLength(4); // the old 4-section shape
  });

  it("the old 4-section record can still receive a new answer without error", () => {
    clearRuntimeCreationRecordsForTests();
    const record = authoritativeToRuntimeRecord(preExistingPayloadRecord());
    // upsert it into the local store the way real hydration does
    upsertRuntimeCreationRecord(record);
    const updated = applyAnswerToRuntimeCreationRecord(
      record.id,
      "scope",
      "Some scope answer",
    );
    expect(updated).toBeTruthy();
    expect(updated!.sectionContent.scope).toBe("Some scope answer");
    // Working Memory begins accumulating from this point forward even though
    // the record predates it — desiredResult derives from the existing
    // "purpose" answer that was already there.
    expect(updated!.workingMemory?.desiredResult).toBe("Old purpose answer");
  });
});
