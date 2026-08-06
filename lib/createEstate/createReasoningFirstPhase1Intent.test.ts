/**
 * Create Reasoning-First Migration — Phase 1B (intent preservation).
 *
 * Proves the first question of a fresh creation acknowledges the member's
 * own opening words when they hold real content, and degrades cleanly to
 * today's plain question otherwise. Build-Type-agnostic: no Build Type name
 * appears in the assertions below beyond fixture setup.
 *
 * @see docs/create-experience/CREATE_REASONING_FIRST_MIGRATION_IMPLEMENTATION_PLAN.md#1b
 */

import { describe, expect, it } from "vitest";
import { defaultTemplateFor } from "@/lib/createTemplates";
import { resolveCanonicalCurrentFocus } from "@/lib/currentFocus/resolveCanonicalFocus";
import {
  applyAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
} from "@/lib/currentFocus/creationRecord";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";

function workflowFor(
  itemType: string,
  sessionId: string,
  originalRequest?: string | null,
): CreateWorkflowState {
  const template = defaultTemplateFor(itemType);
  return {
    sessionId,
    selectedTypeLabel: itemType,
    useTemplate: true,
    selectedTemplateId: template.id,
    templateSections: template.sections,
    sectionContent: {},
    skippedSectionIds: [],
    workspaceFirst: true,
    questionMode: "current_focus",
    originalRequest: originalRequest ?? undefined,
  } as CreateWorkflowState;
}

describe("First question acknowledges genuine original intent", () => {
  it("acknowledges real member words on the first SOP question", () => {
    clearRuntimeCreationRecordsForTests();
    const focus = resolveCanonicalCurrentFocus({
      creationId: "intent-sop-1",
      workflow: workflowFor(
        "SOP",
        "intent-sop-1",
        "I need an SOP for onboarding clients",
      ),
    });
    expect(focus!.purpose).toContain(
      'You said: "I need an SOP for onboarding clients".',
    );
    // The authored reason still follows — acknowledgment adds to it, doesn't replace it.
    expect(focus!.purpose).toContain(
      "Starting with the result keeps every step pointed at something real.",
    );
    // The question itself is unchanged — only the purpose line is affected.
    expect(focus!.prompt).toBe(
      "What should someone be able to accomplish after following this SOP?",
    );
  });

  it("is Build-Type-agnostic — works the same way for a non-SOP creation", () => {
    clearRuntimeCreationRecordsForTests();
    const focus = resolveCanonicalCurrentFocus({
      creationId: "intent-email-1",
      workflow: workflowFor(
        "Email",
        "intent-email-1",
        "I need to remind clients about the deadline",
      ),
    });
    expect(focus!.purpose).toContain(
      'You said: "I need to remind clients about the deadline".',
    );
  });

  it("degrades to the plain purpose line when originalRequest is absent", () => {
    clearRuntimeCreationRecordsForTests();
    const focus = resolveCanonicalCurrentFocus({
      creationId: "intent-sop-2",
      workflow: workflowFor("SOP", "intent-sop-2", null),
    });
    expect(focus!.purpose).not.toContain("You said:");
    expect(focus!.purpose).toBe(
      "Starting with the result keeps every step pointed at something real.",
    );
  });

  it("degrades to the plain purpose line for an auto-generated placeholder request", () => {
    clearRuntimeCreationRecordsForTests();
    for (const placeholder of ["Create a SOP", "Create SOP", "SOP"]) {
      clearRuntimeCreationRecordsForTests();
      const focus = resolveCanonicalCurrentFocus({
        creationId: "intent-sop-3",
        workflow: workflowFor("SOP", "intent-sop-3", placeholder),
      });
      expect(focus!.purpose).not.toContain("You said:");
    }
  });

  it("appears once — the second question does not repeat the acknowledgment", () => {
    clearRuntimeCreationRecordsForTests();
    const first = resolveCanonicalCurrentFocus({
      creationId: "intent-sop-4",
      workflow: workflowFor(
        "SOP",
        "intent-sop-4",
        "I need an SOP for onboarding clients",
      ),
    });
    expect(first!.purpose).toContain("You said:");

    applyAnswerToRuntimeCreationRecord(
      "intent-sop-4",
      "purpose",
      "Izna can onboard a client without asking me.",
    );
    const second = resolveCanonicalCurrentFocus({
      creationId: "intent-sop-4",
      workflow: workflowFor(
        "SOP",
        "intent-sop-4",
        "I need an SOP for onboarding clients",
      ),
    });
    expect(second!.sectionId).toBe("intended-user");
    expect(second!.purpose).not.toContain("You said:");
  });
});
