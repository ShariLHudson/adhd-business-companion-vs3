/**
 * MA-04 Phase 2d — behavior coverage for the three deferred acceptance sites now
 * gated by Boundary in CompanionPageClient handleSend:
 *   F2 tryContinueConversationWorkflow (call gated ~:18806; predicate swapped ~:12881)
 *   F6 strategy-offer acceptance (~:16012)
 *   F8 Decision Compass acceptance (~:18776)
 *
 * Each site now defers when `boundaryClaimedTurn` is true (same 5 decision kinds
 * as Phase 2b/2c). This reproduces each site's matcher composition from public
 * building blocks; `BLOCKED` mirrors the inline `boundaryClaimedTurn` list at
 * CompanionPageClient ~:14420 and must stay in sync with it.
 */
import { describe, expect, it } from "vitest";
import { isShortAcceptanceOfArmedOwner } from "@/lib/conversationConfirmationGate";
import { isFrictionlessAffirmation } from "@/lib/frictionlessActionLayer";
import { isAcceptanceAttempt } from "@/lib/pendingAcceptanceAuthority";
import {
  resolveConversationBoundary,
  type ConversationBoundaryDecisionKind,
} from "@/lib/conversationBoundary";

const BLOCKED = new Set<ConversationBoundaryDecisionKind>([
  "interrupt_and_suspend",
  "switch_topic",
  "cancel_current_workflow",
  "answer_pending_question",
  "return_to_suspended_topic",
]);
const claimed = (d: ConversationBoundaryDecisionKind) => BLOCKED.has(d);

// Mirrors of the three site conditions (armed offer present).
const f2 = (t: string, d: ConversationBoundaryDecisionKind) =>
  !claimed(d) && (isFrictionlessAffirmation(t) || isShortAcceptanceOfArmedOwner(t, true));
const f6 = (t: string, d: ConversationBoundaryDecisionKind) =>
  !claimed(d) && isFrictionlessAffirmation(t);
const f8 = (t: string, d: ConversationBoundaryDecisionKind) =>
  !claimed(d) && isAcceptanceAttempt(t);

const SITES: Array<[string, (t: string, d: ConversationBoundaryDecisionKind) => boolean]> = [
  ["F2 tryContinueConversationWorkflow", f2],
  ["F6 strategy-offer", f6],
  ["F8 Decision Compass", f8],
];

describe("Phase 2d — real Boundary decision for the emotional turn", () => {
  it("'okay, I'm overwhelmed' → interrupt_and_suspend (claimed)", () => {
    expect(
      resolveConversationBoundary({ userText: "okay, I'm overwhelmed", turn: 2 }).decision,
    ).toBe("interrupt_and_suspend");
  });
});

describe.each(SITES)("Phase 2d — %s respects Boundary", (_label, consumes) => {
  it("valid bare acceptance still works when Boundary is unclaimed", () => {
    // "yes"/"okay" are shared across all three site matchers. ("do it" is
    // frictionless-only vocabulary — accepted by F2/F6, not F8's isAcceptanceAttempt;
    // Phase 2d does not change any site's accepted vocabulary.)
    expect(consumes("yes", "unclear")).toBe(true);
    expect(consumes("okay", "unclear")).toBe(true);
  });

  it("'okay, I'm overwhelmed' is not consumed", () => {
    expect(consumes("okay, I'm overwhelmed", "interrupt_and_suspend")).toBe(false);
    expect(consumes("okay, I'm overwhelmed", "unclear")).toBe(false); // whole-message predicate
  });

  it("'yes, but first I need help' is not consumed", () => {
    expect(consumes("yes, but first I need help", "unclear")).toBe(false);
  });

  it("a pending-question answer is not stolen", () => {
    expect(consumes("yes", "answer_pending_question")).toBe(false);
  });

  it("switch / cancel / interrupt / answer-pending / return turns are not consumed", () => {
    for (const d of [...BLOCKED]) {
      expect(consumes("yes", d), d).toBe(false);
    }
  });
});
