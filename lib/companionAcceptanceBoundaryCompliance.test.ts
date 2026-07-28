/**
 * MA-04 Phase 2c — behavior coverage for the remaining armed-offer acceptance
 * sites in CompanionPageClient handleSend now gated by Boundary.
 *
 * The guard is inlined at each call site (F1 Client-Avatar ~:14645, F4/F9
 * create-consent, F5 pending-choice, F10 dispatch, F11 auto-launch) as
 * `!boundaryClaimedTurn` over the SAME decision-kind list. This test reproduces
 * that shared classifier + the F1 canonical-predicate swap from public building
 * blocks so the behavior is locked without exporting a new production helper.
 *
 * `BLOCKED` mirrors the inline `boundaryClaimedTurn` list at CompanionPageClient
 * ~:14420 and must stay in sync with it.
 */
import { describe, expect, it } from "vitest";
import { isShortAcceptanceOfArmedOwner } from "@/lib/conversationConfirmationGate";
import {
  resolveConversationBoundary,
  type ConversationBoundaryDecisionKind,
} from "@/lib/conversationBoundary";

/** Decision kinds under which Boundary has claimed the turn — every gated site defers. */
const BLOCKED = new Set<ConversationBoundaryDecisionKind>([
  "interrupt_and_suspend",
  "switch_topic",
  "cancel_current_workflow",
  "answer_pending_question",
  "return_to_suspended_topic",
]);

function boundaryClaimedTurn(decision: ConversationBoundaryDecisionKind): boolean {
  return BLOCKED.has(decision);
}

/** Mirror of the F1 Client-Avatar site: armed offer + canonical predicate + guard. */
function clientAvatarConsumes(
  text: string,
  decision: ConversationBoundaryDecisionKind,
): boolean {
  const armedOffer = true;
  if (boundaryClaimedTurn(decision)) return false;
  return isShortAcceptanceOfArmedOwner(text, armedOffer);
}

describe("Phase 2c — shared boundaryClaimedTurn classifier", () => {
  it("claims exactly the five owner-assigning decision kinds", () => {
    for (const d of [
      "interrupt_and_suspend",
      "switch_topic",
      "cancel_current_workflow",
      "answer_pending_question",
      "return_to_suspended_topic",
    ] as ConversationBoundaryDecisionKind[]) {
      expect(boundaryClaimedTurn(d), d).toBe(true);
    }
  });
  it("does not claim the unclaimed kinds (acceptance may proceed)", () => {
    for (const d of [
      "unclear",
      "continue_current_topic",
      "expand_current_topic",
    ] as ConversationBoundaryDecisionKind[]) {
      expect(boundaryClaimedTurn(d), d).toBe(false);
    }
  });
});

describe("Phase 2c — real Boundary decisions for the risky turns", () => {
  it("'I'm overwhelmed' and 'okay, I'm overwhelmed' → interrupt_and_suspend (claimed)", () => {
    expect(resolveConversationBoundary({ userText: "I'm overwhelmed", turn: 2 }).decision).toBe(
      "interrupt_and_suspend",
    );
    expect(
      resolveConversationBoundary({ userText: "okay, I'm overwhelmed", turn: 2 }).decision,
    ).toBe("interrupt_and_suspend");
  });
});

describe("Phase 2c — F1 Client-Avatar site no longer steals answers/interruptions", () => {
  it("bare acceptance still opens the builder when Boundary is unclaimed", () => {
    expect(clientAvatarConsumes("yes", "unclear")).toBe(true);
    expect(clientAvatarConsumes("okay", "unclear")).toBe(true);
    expect(clientAvatarConsumes("sounds good", "unclear")).toBe(true);
    expect(clientAvatarConsumes("do it", "unclear")).toBe(true);
  });

  it("'yes, but first I need help with this' is NOT consumed (canonical predicate)", () => {
    // Previously the start-anchored isClientAvatarOfferAcceptance matched ^yes.
    expect(isShortAcceptanceOfArmedOwner("yes, but first I need help with this", true)).toBe(false);
    expect(clientAvatarConsumes("yes, but first I need help with this", "unclear")).toBe(false);
  });

  it("'okay, I'm overwhelmed' is NOT consumed — interruption wins", () => {
    expect(clientAvatarConsumes("okay, I'm overwhelmed", "interrupt_and_suspend")).toBe(false);
    // even absent the guard, the whole-message predicate rejects it
    expect(clientAvatarConsumes("okay, I'm overwhelmed", "unclear")).toBe(false);
  });

  it("a bare 'yes' meant for a pending question is not stolen by the offer", () => {
    expect(clientAvatarConsumes("yes", "answer_pending_question")).toBe(false);
  });

  it("a topic switch is not consumed", () => {
    expect(clientAvatarConsumes("actually, something else", "switch_topic")).toBe(false);
  });
});
