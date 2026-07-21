/**
 * Standard 072 — Exact persistence, identity, idempotent resume, fact dedupe.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { buildContinuityManifest } from "@/lib/continuityManifest";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import {
  clearActiveWorkspaceRegistryForTests,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  listActiveWorkspaces,
  registerCreationDestinationWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import {
  applyAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  getRuntimeCreationRecord,
  mergeRuntimeRecordIntoWorkflow,
} from "./creationRecord";
import {
  buildCanonicalKnownFacts,
  migrateLegacyKnownFacts,
  normalizeFactLabelKey,
} from "./canonicalFacts";
import {
  hydrateExactWorkflowFromPersistence,
  verifyHydratedWorkspaceIdentity,
} from "./exactWorkspacePersist";
import { isActiveWorkspaceResumeRequest } from "@/lib/activeWorkspaceRegistry";
import { executeFounderAction } from "@/lib/ecosystem/actions/actionExecutor";
import type { FounderAction } from "@/lib/ecosystem/actions/actionTypes";

describe("072 — Exact workspace persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  it("persists exact templateSections and survives ensure (idempotent)", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    const sections = workflow.templateSections ?? [];
    expect(sections.length).toBeGreaterThan(3);

    const withId = {
      ...workflow,
      sessionId: "ws-072-exact",
      sectionContent: { [sections[0]!.id]: "First answer" },
    };
    const first = ensureRuntimeCreationRecord(withId);
    expect(first.templateSections?.length).toBe(sections.length);
    expect(first.id).toBe("ws-072-exact");

    const second = ensureRuntimeCreationRecord({
      ...withId,
      sectionContent: {
        ...withId.sectionContent,
        [sections[1]!.id]: "Second answer",
      },
    });
    expect(second.id).toBe(first.id);
    expect(second.templateSections?.length).toBe(sections.length);
    expect(second.templateSections?.map((s) => s.id)).toEqual(
      sections.map((s) => s.id),
    );
  });

  it("hydrateExact restores same workspace ID, schema, answers, focus — no bootstrap", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    const sections = workflow.templateSections ?? [];
    const focusId = sections[2]?.id ?? sections[0]!.id;
    const withProgress = {
      ...workflow,
      sessionId: "ws-072-hydrate",
      selectedTemplateName: "Founder Retreat",
      sectionContent: {
        [sections[0]!.id]: "A",
        [sections[1]!.id]: "B",
      },
      skippedSectionIds: [],
      workspaceCurrentFocus: {
        title: sections.find((s) => s.id === focusId)?.label ?? "Focus",
        reason: "test",
        actionLabel: "Continue",
        sectionId: focusId,
        assetTypeId: null,
      },
      draftContent: "# Draft body",
    };
    ensureRuntimeCreationRecord(withProgress);

    const hydrated = hydrateExactWorkflowFromPersistence("ws-072-hydrate");
    expect(hydrated).toBeTruthy();
    expect(verifyHydratedWorkspaceIdentity(hydrated!, "ws-072-hydrate")).toBe(
      true,
    );
    expect(hydrated!.templateSections?.length).toBe(sections.length);
    expect(hydrated!.templateSections?.map((s) => s.id)).toEqual(
      sections.map((s) => s.id),
    );
    expect(hydrated!.sectionContent?.[sections[0]!.id]).toBe("A");
    expect(hydrated!.draftContent).toContain("Draft body");
    expect(hydrated!.selectedTemplateName).toMatch(/Founder Retreat|Workshop/i);
  });

  it("repeated ensure does not duplicate facts", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    const sid = workflow.templateSections![0]!.id;
    const base = {
      ...workflow,
      sessionId: "ws-072-facts",
      sectionContent: { [sid]: "Clear outcomes" },
    };
    ensureRuntimeCreationRecord(base);
    ensureRuntimeCreationRecord(base);
    ensureRuntimeCreationRecord(base);
    const record = getRuntimeCreationRecord("ws-072-facts")!;
    const facts = record.canonicalFacts ?? [];
    const ids = facts.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(facts.filter((f) => f.sectionId === sid)).toHaveLength(1);
  });

  it("case/label variants migrate to one canonical fact", () => {
    const sections = [
      { id: "outcomes", label: "Learning Outcomes" },
      { id: "dates", label: "Dates" },
    ];
    const migrated = migrateLegacyKnownFacts(
      [
        "outcomes: A",
        "Outcomes: A longer answer",
        "Learning Outcomes: A longer answer",
      ],
      { outcomes: "A longer answer" },
      sections,
    );
    expect(migrated.filter((f) => f.sectionId === "outcomes")).toHaveLength(1);
    expect(normalizeFactLabelKey("Learning Outcomes")).toBe("learning outcomes");
    expect(buildCanonicalKnownFacts({ outcomes: "x" }, sections)).toHaveLength(
      1,
    );
  });

  it("applyAnswer rebuilds facts without duplicates", () => {
    const workflow = initializeWorkspaceV2Workflow("Email");
    const sid = workflow.templateSections![0]!.id;
    ensureRuntimeCreationRecord({
      ...workflow,
      sessionId: "ws-072-answer",
    });
    applyAnswerToRuntimeCreationRecord("ws-072-answer", sid, "Hello");
    applyAnswerToRuntimeCreationRecord("ws-072-answer", sid, "Hello world");
    const record = getRuntimeCreationRecord("ws-072-answer")!;
    expect(record.sectionContent[sid]).toBe("Hello world");
    expect(
      (record.canonicalFacts ?? []).filter((f) => f.sectionId === sid),
    ).toHaveLength(1);
  });

  it("registry + Welcome Home / Projects surfaces find work after hydrate", () => {
    const workflow = initializeWorkspaceV2Workflow("Newsletter");
    const entry = registerCreationDestinationWorkspace({
      ...workflow,
      sessionId: "ws-072-surfaces",
      selectedTemplateName: "Client Onboarding",
    });
    clearActiveWorkspaceRegistryForTests();
    // Store still has runtime record
    expect(getRuntimeCreationRecord(entry.workspaceId)).toBeTruthy();
    hydrateActiveWorkspaceRegistryFromRuntimeRecords();
    expect(
      listActiveWorkspaces().some((w) => w.workspaceId === entry.workspaceId),
    ).toBe(true);
    expect(
      listActiveCreationWorkspaces().some((w) => w.id === entry.workspaceId),
    ).toBe(true);
    expect(
      buildContinuityManifest().items.some(
        (i) => i.type === "active-creation" && i.id.includes(entry.workspaceId),
      ),
    ).toBe(true);
  });

  it("chat resume phrases match before Create pitch", () => {
    expect(isActiveWorkspaceResumeRequest("Let's go back to the workshop.")).toBe(
      true,
    );
  });

  it("mergeRuntimeRecordIntoWorkflow preserves focus when section still open", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    const sections = workflow.templateSections ?? [];
    const focusId = sections[3]?.id ?? sections[0]!.id;
    const record = ensureRuntimeCreationRecord({
      ...workflow,
      sessionId: "ws-072-focus",
      sectionContent: {
        [sections[0]!.id]: "done",
        [sections[1]!.id]: "done",
      },
      workspaceCurrentFocus: {
        title: sections.find((s) => s.id === focusId)!.label,
        reason: "r",
        actionLabel: "Continue",
        sectionId: focusId,
        assetTypeId: null,
      },
    });
    const merged = mergeRuntimeRecordIntoWorkflow(
      { ...workflow, sessionId: "ws-072-focus" },
      record,
    );
    expect(merged.workspaceCurrentFocus?.sectionId).toBe(focusId);
  });

  it("Founder action open ack never concatenates marketing risk non-sequitur", () => {
    const action = {
      id: "a1",
      title: "Open Create",
      description: "No marketing activity in the last 10 days",
      nextStep: "No marketing activity in the last 10 days",
      workspace: { section: "content-generator" as const, itemType: "Workshop" },
      prefill: {},
      status: "pending" as const,
    } as unknown as FounderAction;
    const result = executeFounderAction(action, {
      openSection: () => undefined,
    });
    expect(result.message).not.toMatch(/marketing activity/i);
    expect(result.message).toMatch(/opened/i);
  });
});
