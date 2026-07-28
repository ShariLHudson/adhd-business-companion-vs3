/**
 * MA-04 Phase 2b — behavior coverage for the single frictionless-offer
 * acceptance path in CompanionPageClient handleSend (~:16013).
 *
 * The production logic is inlined at that call site (Option B — no reusable
 * acceptance wrapper). This test reproduces the SAME composition from public
 * building blocks so the nine required behaviors are locked:
 *
 *   armed && !boundaryClaimedTurn &&
 *   (isFrictionlessAffirmation(text) || isShortAcceptanceOfArmedOwner(text, armed))
 *
 * `BLOCKED` mirrors the inline guard's decision-kind list; it must stay in sync
 * with the call site (that is the accepted cost of keeping the guard inline
 * rather than exporting a wrapper).
 */

import { describe, expect, it } from "vitest";
import { isFrictionlessAffirmation } from "@/lib/frictionlessActionLayer";
import { isShortAcceptanceOfArmedOwner } from "@/lib/conversationConfirmationGate";
import {
  resolveConversationBoundary,
  type ConversationBoundaryDecisionKind,
} from "@/lib/conversationBoundary";

/** Decision kinds under which Boundary has claimed the turn — the path must defer. */
const BLOCKED = new Set<ConversationBoundaryDecisionKind>([
  "interrupt_and_suspend",
  "switch_topic",
  "cancel_current_workflow",
  "answer_pending_question",
  "return_to_suspended_topic",
]);

/** Mirror of the inline call-site condition (armed offer assumed). */
function pathConsumes(
  text: string,
  decision: ConversationBoundaryDecisionKind,
): boolean {
  if (BLOCKED.has(decision)) return false;
  return (
    isFrictionlessAffirmation(text) || isShortAcceptanceOfArmedOwner(text, true)
  );
}

describe("frictionless acceptance path — Boundary claim guard", () => {
  it("blocks exactly the five claiming decision kinds", () => {
    for (const d of BLOCKED) expect(pathConsumes("yes", d), d).toBe(false);
  });
  it("permits the unclaimed decision kinds", () => {
    for (const d of [
      "unclear",
      "continue_current_topic",
      "expand_current_topic",
    ] as ConversationBoundaryDecisionKind[]) {
      expect(pathConsumes("yes", d), d).toBe(true);
    }
  });
});

describe("frictionless acceptance path — nine required behaviors (armed offer)", () => {
  it("`yes` accepts when Boundary has not claimed the turn", () =>
    expect(pathConsumes("yes", "unclear")).toBe(true));
  it("`okay` accepts", () => expect(pathConsumes("okay", "unclear")).toBe(true));
  it("`do it` accepts", () => expect(pathConsumes("do it", "unclear")).toBe(true));

  it("`okay, please` is intentionally NOT accepted in this slice (deferred)", () =>
    expect(pathConsumes("okay, please", "unclear")).toBe(false));

  it("`okay, I'm overwhelmed` does not accept — interruption wins", () => {
    expect(resolveConversationBoundary({ userText: "okay, I'm overwhelmed", turn: 2 }).decision).toBe(
      "interrupt_and_suspend",
    );
    expect(pathConsumes("okay, I'm overwhelmed", "interrupt_and_suspend")).toBe(false);
    // Whole-message predicate rejects it even absent the guard.
    expect(pathConsumes("okay, I'm overwhelmed", "unclear")).toBe(false);
  });

  it("`yes, but I have a question` is not consumed as bare acceptance", () =>
    expect(pathConsumes("yes, but I have a question", "unclear")).toBe(false));

  it("`no, not yet` does not accept", () =>
    expect(pathConsumes("no, not yet", "unclear")).toBe(false));

  it("an affirmation belonging to another pending question is not stolen", () =>
    expect(pathConsumes("yes", "answer_pending_question")).toBe(false));

  it("a new topic does not accept", () => {
    expect(pathConsumes("my dog threw up on the carpet", "switch_topic")).toBe(false);
    expect(pathConsumes("my dog threw up on the carpet", "unclear")).toBe(false);
  });
});
