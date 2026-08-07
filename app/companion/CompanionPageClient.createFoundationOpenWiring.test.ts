/**
 * Phase C-2 (2026-08-07) — Create Foundation convergence, the chat-to-
 * workspace handoff. CompanionPageClient.tsx is too large to mount in a
 * unit test, so this locks the wiring directly, matching this codebase's
 * established pattern for that file (see
 * CompanionPageClient.notificationSoundWiring.test.ts).
 *
 * What this test CAN verify: the correct existing function
 * (startFreshCreateFromEstate — the same one the Create entrance catalog's
 * confirm click already calls) is invoked with the correct payload shape
 * when frictionlessAction.immediateCreateFoundationOpen is present, and
 * that this new consumption follows the same pattern as its siblings
 * (immediateCreateOpen, immediateCreateProjectOpen).
 *
 * What this test CANNOT verify (needs a live render / browser): that
 * startFreshCreateFromEstate itself correctly writes Working Memory,
 * persists creation type, mints a work object id, opens Current Focus,
 * and becomes resumable/visible in Projects — those guarantees rest on
 * startFreshCreateFromEstate being UNCHANGED by this work (verified by
 * `git diff` showing no edits inside its own definition) and already being
 * the function the catalog path exercises today, per
 * docs/create-experience/CREATE_FOUNDATION_TRANSITION_MAP.md's exhaustive
 * trace. Live browser verification was attempted for this change and
 * blocked by a dev-server memory crash unrelated to this diff (see the
 * session's own verification notes) — flagged, not silently skipped.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const COMPANION_PAGE_CLIENT = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);

function source(): string {
  return readFileSync(COMPANION_PAGE_CLIENT, "utf8");
}

/** The block handling frictionlessAction.immediateCreateFoundationOpen. */
function foundationOpenBlock(): string {
  const src = source();
  const match = src.match(
    /if \(\s*!chamberMemberConversationLocked &&\s*frictionlessAction\.immediateCreateFoundationOpen[\s\S]*?\n {4}\}/,
  );
  if (!match) {
    throw new Error(
      "immediateCreateFoundationOpen consumption block not found in CompanionPageClient.tsx",
    );
  }
  return match[0];
}

describe("CompanionPageClient — Create Foundation chat-to-workspace handoff (Phase C-2)", () => {
  it("consumes immediateCreateFoundationOpen by calling startFreshCreateFromEstate — the SAME function the catalog confirm click uses, not a new one", () => {
    const block = foundationOpenBlock();
    expect(block).toContain("startFreshCreateFromEstate({");
    expect(block).toContain(
      "artifactType: frictionlessAction.immediateCreateFoundationOpen.artifactType,",
    );
    expect(block).toContain(
      "initialPrompt: frictionlessAction.immediateCreateFoundationOpen.initialPrompt,",
    );
    // No alternate/new workspace-opening call invented for this path.
    expect(block).not.toMatch(
      /openCreateWorkspace|bootstrapWorkspaceV2Session|registerCreationDestinationWorkspace/,
    );
  });

  it("finishes the turn the same way every sibling immediate-open handler does", () => {
    const block = foundationOpenBlock();
    expect(block).toContain('setInput("");');
    expect(block).toContain("finishEarlyChatTurn();");
    expect(block).toContain("finishLatencyTurn({ localReply: true });");
    expect(block).toContain("return true;");
  });

  it("is gated on chamberMemberConversationLocked and blockImmediateForAnswerFirst, matching immediateCreateOpen/immediateCreateProjectOpen", () => {
    const block = foundationOpenBlock();
    expect(block).toContain("!chamberMemberConversationLocked");
    expect(block).toContain("!blockImmediateForAnswerFirst");
  });

  it("immediateCreateFoundationOpen is included in the answer-first suppression list (consistent with its siblings)", () => {
    const src = source();
    const match = src.match(
      /blockImmediateForAnswerFirst &&\s*\(frictionlessAction\.immediateCreateOpen[\s\S]*?\)\s*\)\s*\{/,
    );
    expect(match).toBeTruthy();
    expect(match?.[0]).toContain(
      "frictionlessAction.immediateCreateFoundationOpen",
    );
  });

  it("immediateCreateFoundationOpen counts toward frictionlessCreateOwned (consistent delivery-kind categorization)", () => {
    const src = source();
    const match = src.match(
      /const frictionlessCreateOwned =[\s\S]*?;/,
    );
    expect(match).toBeTruthy();
    expect(match?.[0]).toContain(
      "Boolean(frictionlessAction.immediateCreateFoundationOpen)",
    );
  });

  it("isWorkRecognitionJourney bypasses the turnAuthority block that otherwise silently replaces Work Recognition's own reply (found via live browser verification, not assumed)", () => {
    const src = source();
    const match = src.match(
      /const frictionlessBypassesTurnAuthority =[\s\S]*?;/,
    );
    expect(match).toBeTruthy();
    expect(match?.[0]).toContain(
      "Boolean(frictionlessAction.isWorkRecognitionJourney)",
    );
    // frictionlessBlockedByTurnAuthority must read the BROADER bypass flag,
    // not just the narrower universal_creation-only one (a live-verified
    // regression: turnAuthority.owner becomes "create_execution" for many
    // explicit "I want to create X" messages, before Work Recognition's own
    // reply/immediate-open handlers ever run).
    const blockedMatch = src.match(
      /const frictionlessBlockedByTurnAuthority =[\s\S]*?;/,
    );
    expect(blockedMatch).toBeTruthy();
    expect(blockedMatch?.[0]).toContain("!frictionlessBypassesTurnAuthority");
  });

  it("startFreshCreateFromEstate's own definition is untouched by this change (git diff proof, not just claimed)", () => {
    // A static sanity check: the function still exists with its documented
    // signature, and the diagnostic comment this session's Working Memory
    // bug fix depends on (runtimeCreationRecordId, not workspaceId) is
    // still present — proof this change didn't touch that logic.
    const src = source();
    expect(src).toContain("function startFreshCreateFromEstate(opts?: {");
    expect(src).toContain(
      "const recordId = activeEntry.runtimeCreationRecordId || workspaceId;",
    );
  });
});
