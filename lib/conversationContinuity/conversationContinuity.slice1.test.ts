/**
 * Slice 1 — Conversation Continuity ownership model.
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONTINUITY_REGRESSION_CASES,
  canOwnerHandleTurn,
  clearConversationOwner,
  describeOwnerForRecovery,
  getActiveConversationOwner,
  isExplicitOwnerExit,
  isExplicitTaskChange,
  isGenericRecoveryCopy,
  looksLikeWorkflowContentNotExit,
  persistConversationOwner,
  recoveryMustNotOverrideOwner,
  setActiveConversationOwner,
} from "@/lib/conversationContinuity";
import {
  clearUniversalCreationSession,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
} from "@/lib/universalCreation";
import {
  answerBoardIntakeStep,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { activateChamberMember } from "@/lib/chamber/chamberMemberActivation";

function stubBrowserStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", {
    localStorage: storage,
    sessionStorage: storage,
  });
}

describe("conversationContinuity — Slice 1 ownership model", () => {
  beforeEach(() => {
    stubBrowserStorage();
    clearUniversalCreationSession();
    clearConversationOwner();
  });

  it("exposes all A–G regression fixtures", () => {
    expect(CONTINUITY_REGRESSION_CASES.map((c) => c.id)).toEqual([
      "A_newsletter_purpose",
      "B_email_approval_restart",
      "C_section_write_above",
      "D_chamber_specialist_reset",
      "E_board_intake_restart",
      "F_stored_projects",
      "G_direct_navigation",
    ]);
  });

  it("does not treat explain/introduce/app as owner exit during newsletter", () => {
    const purpose =
      "To introduce my ADHD app to new users and explain how it all works.";
    expect(isExplicitOwnerExit(purpose)).toBe(false);
    expect(isExplicitTaskChange(purpose)).toBe(false);
    expect(looksLikeWorkflowContentNotExit(purpose)).toBe(true);
  });

  it("recognizes explicit exit and task change", () => {
    expect(isExplicitOwnerExit("cancel")).toBe(true);
    expect(isExplicitOwnerExit("forget the newsletter")).toBe(true);
    expect(isExplicitTaskChange("open Plan My Day instead")).toBe(true);
  });

  it("detects UC discovery as guided_workflow awaiting answer", () => {
    const turn = startUniversalCreationTurn("I need to write a newsletter.", 1);
    expect(turn?.kind).toBe("question");
    if (turn) saveUniversalCreationSession(turn.session);

    const owner = getActiveConversationOwner();
    expect(owner.kind).toBe("guided_workflow");
    if (owner.kind === "guided_workflow") {
      expect(owner.workflowType).toBe("newsletter");
      expect(owner.awaitingAnswer).toBe(true);
    }
    expect(
      canOwnerHandleTurn(
        owner,
        "To introduce my ADHD app to new users and explain how it all works.",
      ),
    ).toBe(true);
  });

  it("detects board intake at concerns as board_intake", () => {
    let draft = createEmptyBoardIntakeDraft(["board-chair"]);
    draft = answerBoardIntakeStep(draft, "Should we raise prices?");
    draft = answerBoardIntakeStep(draft, "Cash flow matters.");
    draft = answerBoardIntakeStep(draft, "Raise, hold, or package");
    saveBoardIntakeDraft(draft);

    const owner = getActiveConversationOwner();
    expect(owner.kind).toBe("board_intake");
    if (owner.kind === "board_intake") {
      expect(owner.currentStepId).toBe("concerns");
    }
  });

  it("detects chamber specialist only when in chamber section", () => {
    activateChamberMember("data-analytics");
    expect(getActiveConversationOwner().kind).toBe("general_chat");

    const owner = getActiveConversationOwner({
      activeSection: "chamber-of-momentum",
    });
    expect(owner.kind).toBe("chamber_specialist");
    if (owner.kind === "chamber_specialist") {
      expect(owner.memberId).toBe("data-analytics");
    }
  });

  it("blocks generic recovery when sticky owner exists", () => {
    const turn = startUniversalCreationTurn("help me write a client email", 1)!;
    saveUniversalCreationSession(turn.session);
    const owner = getActiveConversationOwner();
    setActiveConversationOwner(owner);

    const generic = "Pick up wherever you left off — I'm still with you.";
    expect(isGenericRecoveryCopy(generic)).toBe(true);
    expect(recoveryMustNotOverrideOwner(owner, generic)).toBe(true);
    expect(describeOwnerForRecovery(owner)).toMatch(/creating|newsletter|email/i);
  });

  it("clears owner on explicit request", () => {
    persistConversationOwner({
      kind: "guided_workflow",
      workflowId: "uc:newsletter:t1",
      workflowType: "newsletter",
      currentStepId: "q:0",
      awaitingAnswer: true,
    });
    clearConversationOwner();
    expect(getActiveConversationOwner().kind).toBe("general_chat");
  });
});
