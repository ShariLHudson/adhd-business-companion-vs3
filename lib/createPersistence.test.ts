/**
 * Launch acceptance — Create draft persistence (Constitution: remember by default, restore by consent).
 */

import { describe, expect, it, beforeEach, vi } from "vitest";

import { getLastActivity, setLastActivity } from "./companionStore";
import {
  clearAllCreatePersistence,
  hasSavedForLaterBookmark,
  pauseCreatePersistence,
  resumeCreatePersistence,
  wouldSilentlyRestoreCreateDraft,
} from "./createPersistence";
import { resolveCurrentArtifact } from "./createInitialization";
import {
  hasActiveCreateSession,
  loadCreateSession,
  saveCreateSession,
} from "./createSessionStore";
import { toCreationContext } from "./workspaceCreation";
import {
  applyAnswerToRecord,
  emptyWorkflowRecord,
  recordAfterDraftBuild,
  startNewWorkflowRecord,
  workflowStateFromRecord,
} from "./createWorkflowRecord";
import {
  clearSavedWorkflowRecord,
  loadSavedWorkflowRecord,
  loadWorkflowRecord,
  saveWorkflowRecord,
  saveWorkflowRecordForLater,
} from "./createWorkflowRecordStore";

function installLocalStorageMock() {
  const mem = new Map<string, string>();
  vi.stubGlobal("window", globalThis);
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

function seedActiveCreateDraft() {
  let record = startNewWorkflowRecord("Social Post", "panel");
  const draft =
    "Launch day is here — share one win from your week.\n\n#ADHDBusiness";
  record = recordAfterDraftBuild(
    record,
    draft,
    {
      ...workflowStateFromRecord(record),
      selectedTypeLabel: "Social Post",
      buildApproved: true,
      readinessConfirmed: true,
    },
    "panel",
  );
  saveWorkflowRecord(record);
  const ctx = toCreationContext("content-generator", {
    itemType: "Social Post",
    title: "Launch post",
    draftContent: draft,
    stage: "editing draft",
  });
  saveCreateSession({
    genSeed: { type: "Social Post", topic: "Launch post", draft },
    creationContext: ctx,
    workspaceDetail: { view: "create", stage: "Editing draft" },
  });
  setLastActivity({
    kind: "draft",
    title: "Launch post",
    subtitle: "Social Post",
    contentType: "Social Post",
    content: draft,
  });
  return record;
}

describe("createPersistence guards", () => {
  beforeEach(() => {
    installLocalStorageMock();
    clearSavedWorkflowRecord();
    clearAllCreatePersistence();
    resumeCreatePersistence();
  });

  it("does not persist empty workflow tombstones", () => {
    saveWorkflowRecord(emptyWorkflowRecord());
    expect(loadWorkflowRecord()).toBeNull();
  });

  it("blocks writes while persistence is paused", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    record = applyAnswerToRecord(record, "Pat", "chat");
    pauseCreatePersistence();
    saveWorkflowRecord(record);
    expect(loadWorkflowRecord()).toBeNull();
    resumeCreatePersistence();
    saveWorkflowRecord(record);
    expect(loadWorkflowRecord()?.collectedAnswers.recipient).toBe("Pat");
  });

  it("save for later bookmarks without active auto-restore record", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    record = applyAnswerToRecord(record, "Pat", "chat");
    saveWorkflowRecordForLater(record);
    expect(loadWorkflowRecord()).toBeNull();
    expect(loadSavedWorkflowRecord()?.collectedAnswers.recipient).toBe("Pat");
  });
});

describe("Launch Acceptance — Create persistence", () => {
  beforeEach(() => {
    installLocalStorageMock();
    clearSavedWorkflowRecord();
    clearAllCreatePersistence();
    resumeCreatePersistence();
  });

  it("1 — create draft, delete, refresh, open Create: no silent restore", () => {
    seedActiveCreateDraft();
    expect(wouldSilentlyRestoreCreateDraft()).toBe(true);

    pauseCreatePersistence();
    clearAllCreatePersistence();
    resumeCreatePersistence();

    expect(loadWorkflowRecord()).toBeNull();
    expect(hasActiveCreateSession()).toBe(false);
    expect(wouldSilentlyRestoreCreateDraft()).toBe(false);
  });

  it("2 — create draft, New Day, open Create: no silent restore but activity memory kept", () => {
    seedActiveCreateDraft();
    const activityBefore = getLastActivity();

    clearAllCreatePersistence({ preserveSavedForLater: true });

    expect(loadWorkflowRecord()).toBeNull();
    expect(hasActiveCreateSession()).toBe(false);
    expect(getLastActivity()).toEqual(activityBefore);
    expect(wouldSilentlyRestoreCreateDraft()).toBe(false);
    expect(
      resolveCurrentArtifact({
        userText: "",
        messages: [],
        creationContext: null,
        lastActivity: getLastActivity(),
        storedSession: loadCreateSession(),
        allowResumeFromMemory: false,
      }),
    ).toBeNull();
  });

  it("3 — save for later, New Day, open Create: bookmark only, no auto-restore", () => {
    const record = seedActiveCreateDraft();
    saveWorkflowRecordForLater(record);
    clearAllCreatePersistence({ preserveSavedForLater: true });

    expect(wouldSilentlyRestoreCreateDraft()).toBe(false);
    expect(hasActiveCreateSession()).toBe(false);
    expect(getLastActivity()).not.toBeNull();
    expect(hasSavedForLaterBookmark()).toBe(true);
    expect(loadSavedWorkflowRecord()?.draftContent).toContain("Launch day");
  });

  it("last-activity draft opens in Create only with explicit resume consent", () => {
    seedActiveCreateDraft();
    const activity = getLastActivity();
    clearAllCreatePersistence({ preserveSavedForLater: true });

    expect(
      resolveCurrentArtifact({
        userText: "open create",
        messages: [],
        creationContext: null,
        lastActivity: activity,
        storedSession: null,
        allowResumeFromMemory: false,
      }),
    ).toBeNull();

    expect(
      resolveCurrentArtifact({
        userText: "continue my draft",
        messages: [],
        creationContext: null,
        lastActivity: activity,
        storedSession: null,
        allowResumeFromMemory: true,
      })?.source,
    ).toBe("last-activity");
  });

  it("delete race — paused persistence cannot re-save after clear", () => {
    const record = seedActiveCreateDraft();
    pauseCreatePersistence();
    clearAllCreatePersistence();
    saveWorkflowRecord(record);
    saveCreateSession({
      genSeed: { type: "Social Post", draft: record.draftContent },
      creationContext: toCreationContext("content-generator", {
        itemType: "Social Post",
        title: "Launch post",
        draftContent: record.draftContent,
      }),
      workspaceDetail: null,
    });
    expect(loadWorkflowRecord()).toBeNull();
    expect(hasActiveCreateSession()).toBe(false);
    resumeCreatePersistence();
  });
});
