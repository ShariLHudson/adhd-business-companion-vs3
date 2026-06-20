import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearCreateDraftLibraryForTests,
  deleteCreateDraftEntry,
  duplicateCreateDraftEntry,
  listCreateDraftEntries,
  renameCreateDraftEntry,
  upsertCreateDraftEntry,
} from "./createDraftLibrary";
import { initializeWorkspaceV2Workflow } from "./createWorkspaceV2";
import { startNewWorkflowRecord } from "./createWorkflowRecord";
import { loadWorkflowRecord } from "./createWorkflowRecordStore";

function installLocalStorageMock() {
  const mem = new Map<string, string>();
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  });
}

function seedWorkspaceDraft(type: string, title: string) {
  const wf = initializeWorkspaceV2Workflow(type);
  const record = startNewWorkflowRecord(type, "panel");
  return {
    ...record,
    itemType: type,
    workflowState: { ...wf, sessionId: record.workflowId },
  };
}

describe("createDraftLibrary", () => {
  beforeEach(() => {
    installLocalStorageMock();
    clearCreateDraftLibraryForTests();
  });

  it("upserts and lists drafts", () => {
    const record = seedWorkspaceDraft("Email", "Client welcome email");
    upsertCreateDraftEntry(record, "Client welcome email");
    expect(listCreateDraftEntries()).toHaveLength(1);
    expect(listCreateDraftEntries()[0]?.title).toBe("Client welcome email");
  });

  it("renames a draft", () => {
    const record = seedWorkspaceDraft("Newsletter", "Weekly update");
    upsertCreateDraftEntry(record, "Weekly update");
    renameCreateDraftEntry(record.workflowId, "March newsletter");
    expect(listCreateDraftEntries()[0]?.title).toBe("March newsletter");
  });

  it("duplicates a draft with a new id", () => {
    const record = seedWorkspaceDraft("Workshop", "Launch workshop");
    upsertCreateDraftEntry(record, "Launch workshop");
    const copy = duplicateCreateDraftEntry(record.workflowId);
    expect(copy).not.toBeNull();
    expect(copy!.id).not.toBe(record.workflowId);
    expect(listCreateDraftEntries()).toHaveLength(2);
    expect(
      listCreateDraftEntries().some((e) => e.title.endsWith("(copy)")),
    ).toBe(true);
  });

  it("deletes a draft and clears active storage when matched", () => {
    const record = seedWorkspaceDraft("SOP", "Onboarding SOP");
    upsertCreateDraftEntry(record, "Onboarding SOP");
    localStorage.setItem(
      "companion-create-workflow-record-v1",
      JSON.stringify(record),
    );
    expect(loadWorkflowRecord()?.workflowId).toBe(record.workflowId);

    deleteCreateDraftEntry(record.workflowId);
    expect(listCreateDraftEntries()).toHaveLength(0);
    expect(loadWorkflowRecord()).toBeNull();
  });
});
