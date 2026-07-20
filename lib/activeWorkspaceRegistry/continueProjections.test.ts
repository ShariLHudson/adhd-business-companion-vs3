/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import {
  clearActiveWorkspaceRegistryForTests,
  listActiveContinueProjection,
  listResumableContinueProjection,
  listTrashedContinueProjection,
  moveActiveWorkspaceToTrash,
  restoreActiveWorkspace,
  upsertActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";

describe("Continue projections — registry only", () => {
  beforeEach(() => {
    clearActiveWorkspaceRegistryForTests();
    window.localStorage.clear();
  });

  it("lists active from registry with newest-first ordering", () => {
    upsertActiveWorkspace({
      workspaceId: "ws-old",
      creationType: "Email",
      title: "Old note",
      currentFocusTitle: null,
      currentFocusId: null,
      progressLabel: "",
      lastActivityAt: "2026-01-01T00:00:00.000Z",
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: "ws-old",
      eventRecordId: null,
      projectHomeId: null,
      sessionId: "ws-old",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    upsertActiveWorkspace({
      workspaceId: "ws-new",
      creationType: "Event Plan",
      title: "New retreat",
      currentFocusTitle: "Purpose",
      currentFocusId: "purpose",
      progressLabel: "",
      lastActivityAt: "2026-06-01T00:00:00.000Z",
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: "ws-new",
      eventRecordId: "ws-new",
      projectHomeId: null,
      sessionId: "ws-new",
      status: "active",
      createdAt: "2026-06-01T00:00:00.000Z",
    });

    const active = listActiveContinueProjection();
    expect(active.map((e) => e.workspaceId)).toEqual(["ws-new", "ws-old"]);
    expect(listActiveCreationWorkspaces().map((w) => w.id)).toEqual([
      "ws-new",
      "ws-old",
    ]);
  });

  it("trash removes from active; restore keeps the same Work ID", () => {
    upsertActiveWorkspace({
      workspaceId: "ws-trash",
      creationType: "SOP",
      title: "Ops guide",
      currentFocusTitle: null,
      currentFocusId: null,
      progressLabel: "",
      lastActivityAt: new Date().toISOString(),
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: "ws-trash",
      eventRecordId: null,
      projectHomeId: null,
      sessionId: "ws-trash",
      status: "active",
      createdAt: new Date().toISOString(),
    });
    moveActiveWorkspaceToTrash("ws-trash");
    expect(listActiveContinueProjection().map((e) => e.workspaceId)).not.toContain(
      "ws-trash",
    );
    expect(listTrashedContinueProjection().map((e) => e.workspaceId)).toContain(
      "ws-trash",
    );
    const restored = restoreActiveWorkspace("ws-trash");
    expect(restored?.workspaceId).toBe("ws-trash");
    expect(listActiveContinueProjection().map((e) => e.workspaceId)).toContain(
      "ws-trash",
    );
    expect(listResumableContinueProjection().some((e) => e.workspaceId === "ws-trash")).toBe(
      true,
    );
  });
});
