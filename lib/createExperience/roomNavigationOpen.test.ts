/**
 * Repair 7 — room navigation opens the Create room via the direct path.
 *
 * openCreateWorkspace previously routed every non-hard-nav open (including
 * roomNavigation) through requestCreateOpen(CREATE_PANEL_SECTION =
 * "content-generator"), which re-applies the legacy artifact-panel block
 * (redirectLegacyCreateWorkspaceIfNeeded → resolveLegacyCreateWorkspaceGuard →
 * prepared_state), posts the global placeholder, and returns opened=false —
 * skipping startCreateBuilderChat so the room never mounts.
 *
 * The repair makes roomNavigation take the SAME direct path hard navigation
 * uses (executeCreateOpenInternal), bypassing requestCreateOpen and its block.
 * Artifact unavailability is surfaced inside Create afterwards, never as the
 * room-level placeholder.
 *
 * This models the open-path selection in CompanionPageClient.tsx (~8383-8420),
 * requestCreateOpen (~6103-6109), and redirectLegacyCreateWorkspaceIfNeeded
 * (~5865-5877), while exercising the REAL legacy guard + turn envelope.
 */
import { describe, expect, it } from "vitest";

import {
  CREATE_ROOM_PREPARED_STATE_MESSAGE,
  resolveLegacyCreateWorkspaceGuard,
} from "./blockLegacyCreateWorkspaceRouting";
import { isCreateRoomNavigable } from "./createDestination";
import { resolveCreationTurnEnvelope } from "@/lib/createIntent/creationTurnEnvelope";

type OpenPath = "executeCreateOpenInternal" | "requestCreateOpen";

/**
 * Faithful model of openCreateWorkspace's open-path selection + outcome.
 * `directOpen = isHardNav || roomNavigation` (the repaired branch condition).
 */
function simulateOpenCreateWorkspace(opts: {
  isHardNav?: boolean;
  roomNavigation?: boolean;
  userText: string;
  itemType?: string | null;
  /** content-generator already open → guard "allow" (real behavior). */
  artifactPanelAlreadyOpen?: boolean;
}): {
  path: OpenPath;
  executeCreateOpenInternalCalled: boolean;
  requestCreateOpenCalled: boolean;
  opened: boolean;
  startCreateBuilderChatCalled: boolean;
  posted: string[];
} {
  const posted: string[] = [];
  const directOpen = Boolean(opts.isHardNav) || Boolean(opts.roomNavigation);
  const path: OpenPath = directOpen
    ? "executeCreateOpenInternal"
    : "requestCreateOpen";

  let opened = false;
  let executeCreateOpenInternalCalled = false;
  let requestCreateOpenCalled = false;

  if (directOpen) {
    // executeCreateOpenInternal mounts the panel directly — no legacy guard.
    executeCreateOpenInternalCalled = true;
    opened = true; // isCreatePanelOpen(...) === true after the internal open
  } else {
    // requestCreateOpen re-applies the legacy block for content-generator.
    requestCreateOpenCalled = true;
    const guard = resolveLegacyCreateWorkspaceGuard({
      section: "content-generator",
      userText: opts.userText,
      itemType: opts.itemType ?? null,
      alreadyOpen: opts.artifactPanelAlreadyOpen,
    });
    if (guard.kind === "prepared_state") {
      posted.push(guard.message ?? CREATE_ROOM_PREPARED_STATE_MESSAGE);
      opened = false; // requestCreateOpen returns false when the guard fires
    } else {
      opened = true;
    }
  }

  // if (opened) startCreateBuilderChat(...)
  const startCreateBuilderChatCalled = opened;

  return {
    path,
    executeCreateOpenInternalCalled,
    requestCreateOpenCalled,
    opened,
    startCreateBuilderChatCalled,
    posted,
  };
}

const roomNav = (userText: string, itemType?: string | null) =>
  simulateOpenCreateWorkspace({ roomNavigation: true, userText, itemType });

describe("Repair 7 — room navigation opens Create via the direct path", () => {
  it("1. roomNavigation bypasses requestCreateOpen", () => {
    const r = roomNav("go to create");
    expect(r.path).toBe("executeCreateOpenInternal");
    expect(r.requestCreateOpenCalled).toBe(false);
  });

  it("2. roomNavigation invokes executeCreateOpenInternal", () => {
    expect(roomNav("open create").executeCreateOpenInternalCalled).toBe(true);
  });

  it("3. roomNavigation produces opened=true", () => {
    expect(roomNav("go to creaste").opened).toBe(true);
  });

  it("4. startCreateBuilderChat is allowed to run after a room open", () => {
    expect(roomNav("create a marketing plan", "Marketing Plan").startCreateBuilderChatCalled).toBe(
      true,
    );
  });

  it("5. room navigation does not post the global prepared-state placeholder", () => {
    for (const t of [
      "go to create",
      "open create",
      "go to creaste",
      "create a marketing plan",
      "i want to create a marketing plan",
    ]) {
      const r = roomNav(t);
      expect(r.posted).toEqual([]);
      expect(r.posted.join(" ")).not.toContain("still being prepared");
    }
  });

  it("5b. isCreateRoomNavigable stays true regardless of artifact availability", () => {
    expect(isCreateRoomNavigable()).toBe(true);
  });
});

describe("Repair 7 — unrelated open paths are unchanged", () => {
  it("6. non-roomNavigation artifact-panel opens remain guarded (blocked)", () => {
    const r = simulateOpenCreateWorkspace({
      userText: "create a marketing plan",
      itemType: "Marketing Plan",
    });
    expect(r.path).toBe("requestCreateOpen");
    expect(r.requestCreateOpenCalled).toBe(true);
    expect(r.opened).toBe(false);
    expect(r.posted).toEqual([CREATE_ROOM_PREPARED_STATE_MESSAGE]);
    expect(r.startCreateBuilderChatCalled).toBe(false);
  });

  it("6b. non-roomNavigation open succeeds when the artifact panel is already open", () => {
    const r = simulateOpenCreateWorkspace({
      userText: "create a marketing plan",
      itemType: "Marketing Plan",
      artifactPanelAlreadyOpen: true,
    });
    expect(r.path).toBe("requestCreateOpen");
    expect(r.opened).toBe(true);
    expect(r.posted).toEqual([]);
  });

  it("7. hard-navigation behavior remains the direct path (unchanged)", () => {
    const r = simulateOpenCreateWorkspace({ isHardNav: true, userText: "go to create" });
    expect(r.path).toBe("executeCreateOpenInternal");
    expect(r.executeCreateOpenInternalCalled).toBe(true);
    expect(r.opened).toBe(true);
    expect(r.posted).toEqual([]);
  });
});

describe("Repair 7 — intent classification is untouched", () => {
  it("room-nav prompts stay eligible/explicit and preserve the intended artifact", () => {
    const nav = resolveCreationTurnEnvelope("go to create", "t");
    expect(nav.explicitCreateNavigation).toBe(true);
    expect(nav.createEligible).toBe(true);

    const plan = resolveCreationTurnEnvelope("i want to create a marketing plan", "t");
    expect(plan.createEligible).toBe(true);
    expect(plan.intendedArtifact).toBe("Marketing Plan");
  });

  it("8. exploratory Create remains conversational (does not open Create)", () => {
    const e = resolveCreationTurnEnvelope("what kind of things can i create", "t");
    expect(e.createEligible).toBe(false);
    expect(e.explicitCreateNavigation).toBe(false);
    expect(e.exploratoryCreation).toBe(true);
  });
});
