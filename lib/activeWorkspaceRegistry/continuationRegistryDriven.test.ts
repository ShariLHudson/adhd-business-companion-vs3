/**
 * Continuation fix (2026-08-06) — resume-intent recognition is derived from
 * the create catalog (lib/createCatalog's CREATE_CATALOG), not a hand-kept
 * type-noun list. A future Build Type added to the catalog automatically
 * gains "Continue my ___" recognition with zero changes here.
 *
 * Founder's required examples: newsletter, workshop, marketing plan, sop,
 * checklist, strategy.
 *
 * @vitest-environment jsdom
 * @see docs/create-experience/UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md
 */

import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { clearRuntimeCreationRecordsForTests } from "@/lib/currentFocus/creationRecord";
import {
  clearActiveWorkspaceRegistryForTests,
  isActiveWorkspaceResumeRequest,
  matchActiveWorkspaceResumeDetailed,
  referencesCreationType,
  registerCreationDestinationWorkspace,
  resetTypeReferenceCacheForTests,
} from "./index";

beforeEach(() => {
  localStorage.clear();
  clearActiveWorkspaceRegistryForTests();
  clearRuntimeCreationRecordsForTests();
  resetTypeReferenceCacheForTests();
});

describe("referencesCreationType — registry-driven, not a hardcoded list", () => {
  it("recognizes every founder-specified example, including compound labels", () => {
    expect(referencesCreationType("Continue my Newsletter")).toBe(true);
    expect(referencesCreationType("Continue my Workshop")).toBe(true);
    expect(referencesCreationType("Continue my Marketing Plan")).toBe(true);
    expect(referencesCreationType("Continue my SOP")).toBe(true);
    expect(referencesCreationType("Continue my Checklist")).toBe(true);
    // "Strategy" is not a bare catalog label — recognized because it's a
    // significant word inside "Marketing Strategy" / "Content Strategy",
    // proving the registry-derived token match, not a hand-added entry.
    expect(referencesCreationType("Continue my Strategy")).toBe(true);
  });

  it("is genuinely derived from the catalog — a fabricated catalog-shaped word is NOT recognized without being added there", () => {
    expect(referencesCreationType("Continue my Wobbledoc")).toBe(false);
  });
});

describe("Founder Test 1 & 2 — existing work resumes on the natural phrase", () => {
  it("an existing Newsletter workspace resumes on 'Continue my newsletter'", () => {
    const workflow = initializeWorkspaceV2Workflow("Newsletter");
    registerCreationDestinationWorkspace(workflow);

    expect(isActiveWorkspaceResumeRequest("Continue my newsletter")).toBe(true);
    const result = matchActiveWorkspaceResumeDetailed("Continue my newsletter");
    expect(result.kind).toBe("single");
    if (result.kind !== "single") return;
    expect(result.entry.creationType.toLowerCase()).toContain("newsletter");
  });

  it("an existing Workshop workspace resumes on 'Continue my workshop'", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    registerCreationDestinationWorkspace(workflow);

    expect(isActiveWorkspaceResumeRequest("Continue my workshop")).toBe(true);
    const result = matchActiveWorkspaceResumeDetailed("Continue my workshop");
    expect(result.kind).toBe("single");
    if (result.kind !== "single") return;
    expect(result.entry.creationType.toLowerCase()).toContain("workshop");
  });

  it("an existing Marketing Plan resumes on 'Continue my marketing plan'", () => {
    const workflow = initializeWorkspaceV2Workflow("Marketing Plan");
    registerCreationDestinationWorkspace(workflow);
    const result = matchActiveWorkspaceResumeDetailed(
      "Continue my marketing plan",
    );
    expect(result.kind).toBe("single");
  });

  it("an existing SOP resumes on 'Continue my SOP'", () => {
    const workflow = initializeWorkspaceV2Workflow("SOP");
    registerCreationDestinationWorkspace(workflow);
    const result = matchActiveWorkspaceResumeDetailed("Continue my SOP");
    expect(result.kind).toBe("single");
  });

  it("an existing Checklist resumes on 'Continue my checklist'", () => {
    const workflow = initializeWorkspaceV2Workflow("Checklist");
    registerCreationDestinationWorkspace(workflow);
    const result = matchActiveWorkspaceResumeDetailed("Continue my checklist");
    expect(result.kind).toBe("single");
  });
});

describe("Founder Test 3 — no existing work is honestly recognized as nothing to resume", () => {
  it("'Continue my newsletter' with zero active workspaces resolves to none, not a false match", () => {
    // No registerCreationDestinationWorkspace call — nothing active.
    const result = matchActiveWorkspaceResumeDetailed("Continue my newsletter");
    expect(result.kind).toBe("none");
  });
});

describe("Founder Test 4 — an explicit new request still creates new work, never a resume", () => {
  it("'I want to create a new newsletter.' is not recognized as resume, even with an existing Newsletter active", () => {
    const workflow = initializeWorkspaceV2Workflow("Newsletter");
    registerCreationDestinationWorkspace(workflow);

    expect(
      isActiveWorkspaceResumeRequest("I want to create a new newsletter."),
    ).toBe(false);
    const result = matchActiveWorkspaceResumeDetailed(
      "I want to create a new newsletter.",
    );
    expect(result.kind).toBe("none");
  });

  it("'open a new newsletter' (no my/the) is create-shaped, not resume-shaped", () => {
    const workflow = initializeWorkspaceV2Workflow("Newsletter");
    registerCreationDestinationWorkspace(workflow);
    expect(isActiveWorkspaceResumeRequest("open a new newsletter")).toBe(
      false,
    );
  });
});
