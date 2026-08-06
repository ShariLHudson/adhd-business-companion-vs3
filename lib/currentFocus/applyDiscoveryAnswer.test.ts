/**
 * SOP Reasoning-First Migration, Phase 2 (2026-08-06) — the record-level
 * discovery-answer write path.
 */
import { describe, expect, it } from "vitest";
import {
  applyDiscoveryAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
} from "./creationRecord";
import { defaultTemplateFor } from "@/lib/createTemplates";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";

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

describe("applyDiscoveryAnswerToRuntimeCreationRecord", () => {
  it("writes the answer into discoveryAnswers and the mapped Working Memory field", () => {
    clearRuntimeCreationRecordsForTests();
    const record = ensureRuntimeCreationRecord(sopWorkflow("disc-1"));
    const updated = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "my own business",
    )!;
    expect(updated.discoveryAnswers?.["sop-audience-type"]).toBe(
      "my own business",
    );
    expect(updated.workingMemory?.ownershipContext).toBe("my own business");
  });

  it("wraps existingAssetsFound as a single-element array (the field's declared shape)", () => {
    clearRuntimeCreationRecordsForTests();
    const record = ensureRuntimeCreationRecord(sopWorkflow("disc-2"));
    const updated = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-starting-point",
      "starting from scratch",
    )!;
    expect(updated.workingMemory?.existingAssetsFound).toEqual([
      "starting from scratch",
    ]);
  });

  it("accumulates across multiple discovery answers without clobbering earlier ones", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow("disc-3"));
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "my own business",
    )!;
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-size",
      "just me",
    )!;
    expect(record.workingMemory?.ownershipContext).toBe("my own business");
    expect(record.workingMemory?.intendedAudience).toBe("just me");
  });

  it("skip marks the question resolved without writing a Working Memory value", () => {
    clearRuntimeCreationRecordsForTests();
    const record = ensureRuntimeCreationRecord(sopWorkflow("disc-4"));
    const updated = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "",
      { skip: true },
    )!;
    expect(updated.skippedDiscoveryIds).toContain("sop-audience-type");
    expect(updated.discoveryAnswers?.["sop-audience-type"]).toBeUndefined();
    expect(updated.workingMemory?.ownershipContext ?? null).toBeNull();
  });

  it("answering after a skip un-skips and writes the value (matches section skip semantics)", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow("disc-5"));
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "",
      { skip: true },
    )!;
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "for a client",
    )!;
    expect(record.skippedDiscoveryIds).not.toContain("sop-audience-type");
    expect(record.discoveryAnswers?.["sop-audience-type"]).toBe(
      "for a client",
    );
  });

  it("returns null for an unknown creationId", () => {
    clearRuntimeCreationRecordsForTests();
    expect(
      applyDiscoveryAnswerToRuntimeCreationRecord(
        "does-not-exist",
        "sop-audience-type",
        "anything",
      ),
    ).toBeNull();
  });

  it("keeps nextHelpfulStep honest while discovery is still in progress", () => {
    clearRuntimeCreationRecordsForTests();
    const record = ensureRuntimeCreationRecord(sopWorkflow("disc-7"));
    // Before any discovery answer, this is the pre-existing section-based
    // value — correct once discovery finishes, but not yet.
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue with Purpose",
    );
    const updated = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "my own business",
    )!;
    expect(updated.workingMemory?.nextHelpfulStep).toBe(
      "Continue understanding your SOP",
    );
  });

  it("nextHelpfulStep correctly reverts once the last discovery question is resolved", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow("disc-8"));
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "my own business",
    )!;
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-starting-point",
      "starting from scratch",
    )!;
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue understanding your SOP",
    );
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-size",
      "just me",
    )!;
    // Discovery just completed — back to the honest section-based phrase.
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue with Purpose",
    );
  });

  it("does not disturb sectionContent while discovery is in progress", () => {
    clearRuntimeCreationRecordsForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow("disc-6"));
    record = applyDiscoveryAnswerToRuntimeCreationRecord(
      record.id,
      "sop-audience-type",
      "my own business",
    )!;
    expect(record.sectionContent).toEqual({});
    // Honest mid-discovery phrase, not the misleading section-based one —
    // see the two nextHelpfulStep-specific tests above for full coverage.
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue understanding your SOP",
    );
  });
});
