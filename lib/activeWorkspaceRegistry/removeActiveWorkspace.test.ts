import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  archiveActiveWorkspace,
  clearActiveWorkspaceRegistryForTests,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  peekRegistryWorkspaceEntry,
  permanentlyDeleteActiveWorkspace,
  removeActiveWorkspaceFromContinue,
  restoreActiveWorkspace,
  upsertActiveWorkspace,
} from "./registry";
import {
  clearRuntimeCreationRecordsForTests,
  getRuntimeCreationRecord,
  upsertRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import { listActiveWorkCards } from "@/lib/projects/activeWork";

function seedWork(id: string, title: string) {
  upsertRuntimeCreationRecord({
    id,
    typeLabel: "Document",
    title,
    sectionContent: { a: "kept" },
    skippedSectionIds: [],
    knownFacts: [],
    focusSectionId: null,
    eventRecordId: null,
    draftContent: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  upsertActiveWorkspace({
    workspaceId: id,
    creationType: "Document",
    title,
    currentFocusTitle: "Introduction",
    currentFocusId: null,
    progressLabel: "Getting started",
    lastActivityAt: new Date().toISOString(),
    draftState: "none",
    hasDraft: false,
    resumeTarget: "estate-create",
    runtimeCreationRecordId: id,
    eventRecordId: null,
    projectHomeId: null,
    sessionId: id,
    status: "active",
    createdAt: new Date().toISOString(),
  });
}

describe("084 Continue disposition — Archive / Trash / Delete / Restore", () => {
  beforeEach(() => {
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  afterEach(() => {
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  it("Move to Trash hides from Continue but preserves Work ID + runtime", () => {
    const id = "ws-trash-me";
    seedWork(id, "Do Procrastinate So Often Document");

    removeActiveWorkspaceFromContinue(id);

    expect(listActiveWorkspaces()).toHaveLength(0);
    expect(listActiveWorkCards([])).toHaveLength(0);
    expect(getRuntimeCreationRecord(id)?.sectionContent.a).toBe("kept");
    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("trashed");
    expect(peekRegistryWorkspaceEntry(id)?.workspaceId).toBe(id);

    hydrateActiveWorkspaceRegistryFromRuntimeRecords();
    expect(listActiveWorkspaces()).toHaveLength(0);
  });

  it("Restore returns the same Work ID to Continue", () => {
    const id = "ws-restore-me";
    seedWork(id, "Restore Me Doc");
    moveActiveWorkspaceToTrash(id);

    const restored = restoreActiveWorkspace(id);
    expect(restored?.workspaceId).toBe(id);
    expect(restored?.status).toBe("active");
    expect(listActiveWorkspaces().map((e) => e.workspaceId)).toEqual([id]);
    expect(getRuntimeCreationRecord(id)?.sectionContent.a).toBe("kept");
  });

  it("Archive is recoverable and distinct from Trash", () => {
    const id = "ws-archive-me";
    seedWork(id, "Archive Me");
    archiveActiveWorkspace(id);
    expect(listActiveWorkspaces()).toHaveLength(0);
    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("archived");
    expect(listRecoverableWorkspaces().map((e) => e.workspaceId)).toContain(id);

    const restored = restoreActiveWorkspace(id);
    expect(restored?.workspaceId).toBe(id);
    expect(listActiveWorkspaces()).toHaveLength(1);
  });

  it("Permanent delete destroys runtime and cannot restore", () => {
    const id = "ws-gone";
    seedWork(id, "Gone Forever");
    permanentlyDeleteActiveWorkspace(id);
    expect(getRuntimeCreationRecord(id)).toBeNull();
    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("deleted");
    expect(restoreActiveWorkspace(id)).toBeNull();
    expect(listActiveWorkspaces()).toHaveLength(0);
  });

  it("a background re-registration (autosave/hydrate) never resurrects Trash", () => {
    const id = "ws-trash-then-autosave";
    seedWork(id, "Undo Create Then Autosave Draft");
    moveActiveWorkspaceToTrash(id);
    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("trashed");

    // Simulate a stray background write still referencing the same
    // workspace/session id (e.g. registerCreationDestinationWorkspace,
    // syncRegistryFromRuntimeRecord, or DB hydrate) after Move to Trash.
    seedWork(id, "Undo Create Then Autosave Draft");

    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("trashed");
    expect(listActiveWorkspaces()).toHaveLength(0);
    expect(listActiveWorkCards([])).toHaveLength(0);
  });

  it("a background re-registration never resurrects Archive either", () => {
    const id = "ws-archive-then-autosave";
    seedWork(id, "Archived Then Autosave Draft");
    archiveActiveWorkspace(id);
    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("archived");

    seedWork(id, "Archived Then Autosave Draft");

    expect(peekRegistryWorkspaceEntry(id)?.status).toBe("archived");
    expect(listActiveWorkspaces()).toHaveLength(0);
  });

  it("explicit Restore still brings Trash back to Continue", () => {
    const id = "ws-trash-then-restore";
    seedWork(id, "Trash Then Restore Doc");
    moveActiveWorkspaceToTrash(id);
    expect(listActiveWorkspaces()).toHaveLength(0);

    const restored = restoreActiveWorkspace(id);
    expect(restored?.status).toBe("active");
    expect(listActiveWorkspaces().map((e) => e.workspaceId)).toEqual([id]);
  });
});
