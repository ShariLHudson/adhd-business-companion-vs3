/**
 * Create Reasoning-First Migration — Phase 1C (resume narrative).
 *
 * Proves continuation cards read RuntimeCreationRecord.workingMemory
 * .nextHelpfulStep instead of the bare section label / a hardcoded
 * "Continue" string. Working Memory derivation runs unconditionally inside
 * ensureRuntimeCreationRecord, so it is present from the very first register
 * call (not only after an answer exists) for every Build Type using the
 * runtime-record path, and self-heals for records saved before this phase.
 *
 * @see docs/create-experience/CREATE_REASONING_FIRST_MIGRATION_IMPLEMENTATION_PLAN.md#1c
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultTemplateFor } from "@/lib/createTemplates";
import {
  applyAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  upsertRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import {
  clearActiveWorkspaceRegistryForTests,
  registerCreationDestinationWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import { entryFromAuthoritative } from "@/lib/creationDurable/hydrate";
import type { AuthoritativeCreationRecord } from "@/lib/creationDurable/types";
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

describe("registerCreationDestinationWorkspace prefers Working Memory's next step", () => {
  it("shows the Working Memory phrase once an answer exists", () => {
    clearRuntimeCreationRecordsForTests();
    clearActiveWorkspaceRegistryForTests();
    let record = ensureRuntimeCreationRecord(sopWorkflow("resume-sop-1"));
    record = applyAnswerToRuntimeCreationRecord(
      record.id,
      "purpose",
      "Izna can onboard a client without asking me.",
    )!;
    expect(record.workingMemory?.nextHelpfulStep).toBe(
      "Continue with Intended User",
    );

    const entry = registerCreationDestinationWorkspace({
      ...sopWorkflow("resume-sop-1"),
      sectionContent: record.sectionContent,
    });
    expect(entry.currentFocusTitle).toBe("Continue with Intended User");
  });

  it("shows a Working Memory phrase even before the first answer — this is correct, not a regression", () => {
    // deriveWorkingMemoryFields runs unconditionally inside
    // ensureRuntimeCreationRecord (SOP Phase 2), so any Build Type using the
    // runtime-record path gets a helpful nextHelpfulStep immediately, not
    // only after an answer exists. "Continue with Purpose" is a strictly
    // better phrase than the bare label "Purpose" at every stage.
    clearRuntimeCreationRecordsForTests();
    clearActiveWorkspaceRegistryForTests();
    const entry = registerCreationDestinationWorkspace(
      sopWorkflow("resume-sop-2"),
    );
    expect(entry.currentFocusTitle).toBe("Continue with Purpose");
  });

  it("a record predating Working Memory self-heals on the next register instead of staying stuck", () => {
    // Simulates a pre-Phase-2 hydrated record (workingMemory: null, the D5
    // hydrate-safety shape). ensureRuntimeCreationRecord re-derives on every
    // register call, so it picks up Working Memory going forward rather than
    // permanently showing the bare label — the fallback is transitional,
    // not a dead end.
    clearRuntimeCreationRecordsForTests();
    clearActiveWorkspaceRegistryForTests();
    const record = ensureRuntimeCreationRecord(sopWorkflow("resume-sop-3"));
    upsertRuntimeCreationRecord({ ...record, workingMemory: null });

    const entry = registerCreationDestinationWorkspace(
      sopWorkflow("resume-sop-3"),
    );
    expect(entry.currentFocusTitle).toBe("Continue with Purpose");
  });

  it("is Build-Type-agnostic — a non-SOP creation gets the same phrase shape", () => {
    clearRuntimeCreationRecordsForTests();
    clearActiveWorkspaceRegistryForTests();
    const entry = registerCreationDestinationWorkspace({
      sessionId: "resume-generic-1",
      selectedTypeLabel: "Document",
      useTemplate: true,
      templateSections: [{ id: "overview", label: "Overview" }],
      sectionContent: {},
      skippedSectionIds: [],
      workspaceFirst: true,
      questionMode: "current_focus",
    } as CreateWorkflowState);
    expect(entry.currentFocusTitle).toBe("Continue with Overview");
  });
});

describe("Fresh-login DB hydration also reads Working Memory's next step", () => {
  function authoritativeWithWorkingMemory(
    nextHelpfulStep: string | null,
  ): AuthoritativeCreationRecord {
    return {
      workspaceId: "hydrate-sop-1",
      userId: "test-user",
      creationType: "SOP",
      title: "Client Onboarding SOP",
      status: "active",
      originalRequest: "an SOP for onboarding clients",
      kind: "creation",
      eventRecordId: null,
      projectHomeId: null,
      version: 2,
      payload: {
        schemaId: "sop-default",
        schemaVersion: "1",
        templateSections: [{ id: "purpose", title: "Purpose", prompt: undefined }],
        currentFocusId: "purpose",
        currentFocusIndex: 0,
        answers: {},
        knownFacts: {},
        draft: null,
        draftReady: false,
        progress: { answeredCount: 0, totalFocusCount: 1, percent: 0 },
        workflowSnapshot: {
          workingMemory: nextHelpfulStep ? { nextHelpfulStep } : null,
        },
        registryMeta: {
          humanTitle: "Client Onboarding SOP",
          creationTypeLabel: "SOP",
          lastActiveAt: new Date().toISOString(),
          projectLinked: false,
        },
      },
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-05T00:00:00.000Z",
    };
  }

  it("shows the Working Memory phrase immediately after login, before any interaction", () => {
    const entry = entryFromAuthoritative(
      authoritativeWithWorkingMemory("Continue with Intended User"),
    );
    expect(entry.currentFocusTitle).toBe("Continue with Intended User");
  });

  it("falls back to null (today's behavior) for a pre-Phase-2 record with no Working Memory", () => {
    const entry = entryFromAuthoritative(authoritativeWithWorkingMemory(null));
    expect(entry.currentFocusTitle).toBeNull();
  });
});

describe("Entrance panel resume path (ambiguity clarify) — source certification", () => {
  it("resumeWorkId reads Working Memory's next step instead of a hardcoded string", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateEntrancePanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("getRuntimeCreationRecord(workId)?.workingMemory?.nextHelpfulStep");
    expect(panel).not.toContain('nextAction: "Continue"');
  });
});
