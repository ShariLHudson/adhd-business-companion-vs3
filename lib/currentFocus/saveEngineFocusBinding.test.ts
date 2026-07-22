/**
 * SAVE ENGINE — deterministic Current Focus binding + stale-focus race.
 *
 * Release-blocker regression: the Create UI was submitting the whole focus
 * object (and a hardcoded contextVersion) instead of `focusId`, so every Save
 * failed with "This Focus moved — your words are still here." and nothing was
 * ever persisted to Supabase. These tests lock the durable save contract:
 *   - correct focusId binding → durable save + advance
 *   - missing focusId (contract gap) → bind to live Focus, still save
 *   - genuinely stale focusId (Focus advanced) → preserve words, honest retry
 *   - the real UI callsite maps focusId (not the focus object)
 *
 * @vitest-environment jsdom
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  fetchAuthoritativeCreation,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { clearRuntimeCreationRecordsForTests } from "./creationRecord";
import { resolveCanonicalCurrentFocus } from "./resolveCanonicalFocus";
import { submitCurrentFocusResponse } from "./submitCurrentFocusResponse";

function baseWorkflow(): CreateWorkflowState {
  return {
    sessionId: "wk-save-engine-1",
    selectedTypeLabel: "Checklist",
    selectedTemplateName: "Launch checklist",
    templateSections: [
      { id: "outcomes", label: "Outcomes" },
      { id: "audience", label: "Audience" },
    ],
    sectionContent: {},
    skippedSectionIds: [],
    workspaceFirst: true,
    questionMode: "current_focus",
  } as unknown as CreateWorkflowState;
}

describe("Save Engine — Current Focus durable binding", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearRuntimeCreationRecordsForTests();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
  });

  it("persists durably and advances when focusId is bound correctly", async () => {
    const workflow = baseWorkflow();
    const focus = resolveCanonicalCurrentFocus({
      creationId: workflow.sessionId!,
      workflow,
    })!;
    expect(focus.focusId).toBe("section:outcomes");

    const result = await submitCurrentFocusResponse(
      {
        creationId: workflow.sessionId!,
        focusId: focus.focusId,
        response: "Leave with one clear next offer.",
        responseType: "multiline",
        requestId: "req-1",
        contextVersion: focus.contextVersion,
      },
      { workflow, activeCreationId: workflow.sessionId },
    );

    expect(result.ok).toBe(true);
    expect(result.durable).toBe(true);
    expect(result.advanced).toBe(true);
    expect(result.failureMessage).toBeNull();
    expect(result.updatedWorkflow?.sectionContent?.outcomes).toContain(
      "one clear next offer",
    );

    // Reload path: the answer must be readable back from the durable store.
    const durable = await fetchAuthoritativeCreation(workflow.sessionId!);
    expect(durable?.payload.answers.outcomes).toContain("one clear next offer");
  });

  it("does NOT fail every save the way the buggy callsite did (focusId undefined)", async () => {
    // The old UI passed `focus: input.focus` and no `focusId`, so at runtime
    // `input.focusId` was undefined. That must not be interpreted as a stale
    // Focus — the member is answering the live Focus, so it should still save.
    const workflow = baseWorkflow();
    const result = await submitCurrentFocusResponse(
      {
        creationId: workflow.sessionId!,
        focusId: undefined as unknown as string,
        response: "Small business owners in year one.",
        responseType: "multiline",
        requestId: "req-2",
        contextVersion: 1,
      },
      { workflow, activeCreationId: workflow.sessionId },
    );

    expect(result.ok).toBe(true);
    expect(result.durable).toBe(true);
    expect(result.updatedWorkflow?.sectionContent?.outcomes).toBeTruthy();
  });

  it("catches a genuinely stale focusId after the Focus has advanced", async () => {
    const workflow = baseWorkflow();
    const firstFocus = resolveCanonicalCurrentFocus({
      creationId: workflow.sessionId!,
      workflow,
    })!;

    const first = await submitCurrentFocusResponse(
      {
        creationId: workflow.sessionId!,
        focusId: firstFocus.focusId,
        response: "Leave with one clear next offer.",
        responseType: "multiline",
        requestId: "req-a",
        contextVersion: firstFocus.contextVersion,
      },
      { workflow, activeCreationId: workflow.sessionId },
    );
    expect(first.ok).toBe(true);
    expect(first.advanced).toBe(true);

    const advancedWorkflow = first.updatedWorkflow!;
    const liveFocus = resolveCanonicalCurrentFocus({
      creationId: advancedWorkflow.sessionId!,
      workflow: advancedWorkflow,
    })!;
    // Focus really did move on to the next unanswered section.
    expect(liveFocus.focusId).toBe("section:audience");

    // A late duplicate submit still bound to the OLD focus must not clobber the
    // new section — it preserves the words and asks for an honest retry.
    const stale = await submitCurrentFocusResponse(
      {
        creationId: advancedWorkflow.sessionId!,
        focusId: firstFocus.focusId, // section:outcomes — now stale
        response: "This belonged to the previous question",
        responseType: "multiline",
        requestId: "req-b",
        contextVersion: liveFocus.contextVersion,
      },
      { workflow: advancedWorkflow, activeCreationId: advancedWorkflow.sessionId },
    );

    expect(stale.ok).toBe(false);
    expect(stale.durable).toBe(false);
    expect(stale.advanced).toBe(false);
    expect(stale.preservedResponse).toBe(
      "This belonged to the previous question",
    );
    expect(stale.failureMessage).toMatch(/still here/i);
  });

  it("UI callsite binds focusId (not the focus object) and a real contextVersion", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const start = client.indexOf("onSubmitCurrentFocus={async (input)");
    expect(start).toBeGreaterThan(-1);
    const block = client.slice(start, start + 1800);
    expect(block).toContain("focusId: input.focus.focusId");
    expect(block).toContain("contextVersion: input.focus.contextVersion");
    // Guard against the regression returning: whole object / hardcoded version.
    expect(block).not.toContain("focus: input.focus,");
    expect(block).not.toContain("contextVersion: 1,");
  });
});
