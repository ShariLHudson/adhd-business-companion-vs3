/**
 * SOP Reasoning-First Migration, Phase 2 (2026-08-06) — the discovery gate
 * inside resolveCanonicalCurrentFocus.
 *
 * Conversation first, structure second: a fresh SOP now opens with three
 * discovery questions before the existing (unmodified) section flow
 * begins. Once discovery is resolved, everything from Phase 1 continues
 * exactly as before — same sections, same intent acknowledgment, same
 * ideas, same resume plumbing.
 */
import { describe, expect, it } from "vitest";
import { resolveCanonicalCurrentFocus } from "./resolveCanonicalFocus";
import {
  applyDiscoveryAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
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

function emailWorkflow(sessionId: string): CreateWorkflowState {
  const template = defaultTemplateFor("Email");
  return {
    sessionId,
    selectedTypeLabel: "Email",
    useTemplate: true,
    selectedTemplateId: template.id,
    templateSections: template.sections,
    sectionContent: {},
    skippedSectionIds: [],
    workspaceFirst: true,
    questionMode: "current_focus",
  } as CreateWorkflowState;
}

describe("A fresh SOP opens with discovery, not the section wizard", () => {
  it("the very first focus is the discovery intro + question 1, not Purpose", () => {
    clearRuntimeCreationRecordsForTests();
    const focus = resolveCanonicalCurrentFocus({
      creationId: "gate-sop-1",
      workflow: sopWorkflow("gate-sop-1"),
    });
    expect(focus!.focusId).toBe("discovery:sop-audience-type");
    expect(focus!.prompt).toBe(
      "Is this SOP for your own business, or for a client?",
    );
    expect(focus!.purpose).toMatch(/understand what you're trying to build/i);
    expect(focus!.sectionId).toBeNull();
  });

  it("advances through all three discovery questions in order", () => {
    clearRuntimeCreationRecordsForTests();
    resolveCanonicalCurrentFocus({
      creationId: "gate-sop-2",
      workflow: sopWorkflow("gate-sop-2"),
    });
    applyDiscoveryAnswerToRuntimeCreationRecord(
      "gate-sop-2",
      "sop-audience-type",
      "my own business",
    );
    const second = resolveCanonicalCurrentFocus({
      creationId: "gate-sop-2",
      workflow: sopWorkflow("gate-sop-2"),
    });
    expect(second!.focusId).toBe("discovery:sop-starting-point");

    applyDiscoveryAnswerToRuntimeCreationRecord(
      "gate-sop-2",
      "sop-starting-point",
      "starting from scratch",
    );
    const third = resolveCanonicalCurrentFocus({
      creationId: "gate-sop-2",
      workflow: sopWorkflow("gate-sop-2"),
    });
    expect(third!.focusId).toBe("discovery:sop-audience-size");
  });

  it("falls through to the existing, unmodified Purpose section once discovery is resolved", () => {
    clearRuntimeCreationRecordsForTests();
    resolveCanonicalCurrentFocus({
      creationId: "gate-sop-3",
      workflow: sopWorkflow("gate-sop-3"),
    });
    applyDiscoveryAnswerToRuntimeCreationRecord(
      "gate-sop-3",
      "sop-audience-type",
      "my own business",
    );
    applyDiscoveryAnswerToRuntimeCreationRecord(
      "gate-sop-3",
      "sop-starting-point",
      "starting from scratch",
    );
    applyDiscoveryAnswerToRuntimeCreationRecord(
      "gate-sop-3",
      "sop-audience-size",
      "just me",
    );
    const focus = resolveCanonicalCurrentFocus({
      creationId: "gate-sop-3",
      workflow: sopWorkflow("gate-sop-3"),
    });
    expect(focus!.sectionId).toBe("purpose");
    expect(focus!.prompt).toBe(
      "What should someone be able to accomplish after following this SOP?",
    );
  });

  it("skipping all three discovery questions still reaches the section flow", () => {
    clearRuntimeCreationRecordsForTests();
    resolveCanonicalCurrentFocus({
      creationId: "gate-sop-4",
      workflow: sopWorkflow("gate-sop-4"),
    });
    for (const id of [
      "sop-audience-type",
      "sop-starting-point",
      "sop-audience-size",
    ]) {
      applyDiscoveryAnswerToRuntimeCreationRecord("gate-sop-4", id, "", {
        skip: true,
      });
    }
    const focus = resolveCanonicalCurrentFocus({
      creationId: "gate-sop-4",
      workflow: sopWorkflow("gate-sop-4"),
    });
    expect(focus!.sectionId).toBe("purpose");
  });
});

describe("Non-SOP Build Types are completely unaffected", () => {
  it("Email opens directly at its first section — no discovery gate applies", () => {
    clearRuntimeCreationRecordsForTests();
    const focus = resolveCanonicalCurrentFocus({
      creationId: "gate-email-1",
      workflow: emailWorkflow("gate-email-1"),
    });
    expect(focus!.focusId).not.toMatch(/^discovery:/);
    expect(focus!.sectionId).not.toBeNull();
  });
});
