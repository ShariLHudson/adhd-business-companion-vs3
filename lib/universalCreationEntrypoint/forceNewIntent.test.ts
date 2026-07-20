/**
 * @vitest-environment jsdom
 * Force-new Creation — resume-by-default preserved; explicit new overrides.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActiveWorkspaceRegistryForTests,
  listActiveWorkspaces,
  registerCreationDestinationWorkspace,
  verifyCreationWorkspaceDurable,
} from "@/lib/activeWorkspaceRegistry";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  fetchAuthoritativeCreation,
  listAuthoritativeCreations,
  persistCreationBegin,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import {
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
} from "@/lib/currentFocus";
import {
  clearActiveEventRecord,
  clearEventAssetInstancesForTests,
  getEventRecord,
  listEventRecords,
} from "@/lib/eventsIntelligence";
import { clearRelationshipRegistryForTests } from "@/lib/creationEcosystem";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  containsResumeClaimCopy,
  enterCreationFromCreate,
  enterCreationFromProjects,
  forceNewCreationAcknowledgment,
  isForceNewCreationRequest,
} from "./index";

describe("force-new Creation Workspace", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveEventRecord();
    clearEventAssetInstancesForTests();
    clearRelationshipRegistryForTests();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
  });

  it("recognizes explicit force-new phrases", () => {
    expect(isForceNewCreationRequest("start something new")).toBe(true);
    expect(isForceNewCreationRequest("brand new separate workspace")).toBe(
      true,
    );
    expect(isForceNewCreationRequest("create another workshop")).toBe(true);
    expect(isForceNewCreationRequest("don't continue the current one")).toBe(
      true,
    );
    expect(isForceNewCreationRequest("begin a different document")).toBe(true);
    expect(isForceNewCreationRequest("Help me create a workshop")).toBe(false);
  });

  it("ambiguous Create entry resumes existing work", async () => {
    const first = enterCreationFromCreate({
      userText:
        "Help me create a one-day workshop for ADHD business people to beta test the platform.",
    });
    expect(first.eventRecordId).toBeTruthy();
    const firstId = first.eventRecordId!;

    const workflow = {
      ...initializeWorkspaceV2Workflow("Workshop"),
      sessionId: firstId,
      eventRecordId: firstId,
      selectedTemplateName: "ADHD Beta Workshop",
    };
    ensureRuntimeCreationRecord(workflow);
    await persistCreationBegin({ workflow });
    registerCreationDestinationWorkspace(workflow);

    const again = enterCreationFromCreate({
      userText: "Create Workshop — continue ADHD beta workshop",
    });
    expect(again.eventRecordId).toBe(firstId);
    expect(
      again.preventedDuplicate ||
        again.action === "resume_workspace" ||
        again.action === "open_workspace",
    ).toBe(true);
  });

  it("explicit brand new separate workspace creates a new ID", async () => {
    const first = enterCreationFromCreate({
      userText:
        "Help me create a workshop for ADHD founders about a simple productivity system.",
    });
    const firstId = first.eventRecordId!;
    expect(firstId).toBeTruthy();

    const firstWorkflow = {
      ...initializeWorkspaceV2Workflow("Workshop"),
      sessionId: firstId,
      eventRecordId: firstId,
      selectedTemplateName: "Simple Productivity System Workshop",
      sectionContent: { audience: "ADHD founders" },
    };
    ensureRuntimeCreationRecord(firstWorkflow);
    const firstDurable = await persistCreationBegin({
      workflow: firstWorkflow,
      originalRequest: "productivity workshop",
    });
    expect(firstDurable.ok).toBe(true);
    registerCreationDestinationWorkspace(firstWorkflow);

    const second = enterCreationFromCreate({
      userText:
        "Start something new — create a separate workshop for a different audience",
      forceNew: true,
    });
    expect(second.action).toBe("open_workspace");
    expect(second.preventedDuplicate).toBe(false);
    expect(second.engineResult?.eventRecordId || second.eventRecordId).toBeTruthy();
    expect(second.eventRecordId).toBeTruthy();
    expect(second.eventRecordId).not.toBe(firstId);
    expect(containsResumeClaimCopy(second.reply)).toBe(false);
    expect(second.reply).toBe(forceNewCreationAcknowledgment());

    const secondId = second.eventRecordId!;
    const secondWorkflow = {
      ...initializeWorkspaceV2Workflow("Workshop"),
      sessionId: secondId,
      eventRecordId: secondId,
      selectedTemplateName: "Second Separate Workshop",
    };
    ensureRuntimeCreationRecord(secondWorkflow);
    const secondDurable = await persistCreationBegin({
      workflow: secondWorkflow,
      originalRequest: "brand new separate workspace",
    });
    expect(secondDurable.ok).toBe(true);
    registerCreationDestinationWorkspace(secondWorkflow);

    // Existing workspace remains intact
    const firstRow = await fetchAuthoritativeCreation(firstId);
    expect(firstRow?.workspaceId).toBe(firstId);
    expect(firstRow?.title).toMatch(/Simple Productivity|Workshop/i);
    expect(getEventRecord(firstId)?.id).toBe(firstId);

    // Registry + durable store contain both
    const registry = listActiveWorkspaces();
    expect(registry.some((w) => w.workspaceId === firstId)).toBe(true);
    expect(registry.some((w) => w.workspaceId === secondId)).toBe(true);

    const rows = await listAuthoritativeCreations();
    expect(rows.some((r) => r.workspaceId === firstId)).toBe(true);
    expect(rows.some((r) => r.workspaceId === secondId)).toBe(true);
    expect(listEventRecords().length).toBeGreaterThanOrEqual(2);

    expect(verifyCreationWorkspaceDurable(firstId)).toBe(true);
    expect(verifyCreationWorkspaceDurable(secondId)).toBe(true);
  });

  it("Projects entry with forceNew opens new workspace", () => {
    const first = enterCreationFromProjects({
      userText: "Help me create a workshop for ADHD founders.",
    });
    const firstId = first.eventRecordId!;

    const second = enterCreationFromProjects({
      userText: "Start something new — create a separate workshop",
      forceNew: true,
    });
    expect(second.eventRecordId).toBeTruthy();
    expect(second.eventRecordId).not.toBe(firstId);
    expect(second.action).toBe("open_workspace");
    expect(containsResumeClaimCopy(second.reply)).toBe(false);
  });

  it("chat force-new acknowledgment never claims continue where we left off", () => {
    const ack = forceNewCreationAcknowledgment();
    expect(containsResumeClaimCopy(ack)).toBe(false);
    expect(ack.toLowerCase()).toMatch(/separate|new/);
  });
});
