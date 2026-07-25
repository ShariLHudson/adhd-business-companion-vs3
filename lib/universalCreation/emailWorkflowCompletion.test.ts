/**
 * Regression: approved email must not restart intake on “let’s write the email”.
 * Supports early draft when recipient+purpose are known (C1), and guided ready→draft.
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  advanceGuidedCreationFlow,
  advanceUniversalCreation,
  clearUniversalCreationSession,
  formatUniversalCreationTurnReply,
  loadUniversalCreationSession,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
  emailWorkflowStateFromSession,
  hasUsableApprovedEmailDraft,
} from "@/lib/universalCreation";
import { resolveRecoveryContinuation } from "@/lib/sparkConversation/coachingFallback";
import type { UniversalCreationTurnResult } from "@/lib/universalCreation";

/** Reach an approved email in awaiting_action via early draft or guided discovery. */
function runEmailToApprovedAwaitingAction(): Extract<
  UniversalCreationTurnResult,
  { kind: "draft" | "message" | "ready" }
> {
  let turn = startUniversalCreationTurn("help me write a client email", 1)!;
  expect(["question", "draft", "ready"]).toContain(turn.kind);

  if (turn.kind === "question") {
    const answers = [
      "One client who may be terminated",
      "Existing client — commitments were not fulfilled",
      "Tell them the relationship may end because commitments were not met",
      "They know work was expected; they need the consequence clearly",
      "Understand the boundary and next step",
      "A calm reply acknowledging the decision",
    ];
    for (const answer of answers) {
      const next = advanceUniversalCreation(turn.session, answer);
      expect(next).toBeTruthy();
      turn = next!;
      if (next?.kind === "ready" || next?.kind === "draft") break;
    }
  }

  if (turn.kind === "ready") {
    const draftTurn = advanceGuidedCreationFlow(
      turn.session,
      "yes",
      turn.message,
    )!;
    expect(draftTurn.kind).toBe("draft");
    saveUniversalCreationSession(draftTurn.session);
    const approveTurn = resolveUniversalCreationTurn(
      "No, I like it, so no changes.",
      8,
      formatUniversalCreationTurnReply(draftTurn),
    )!;
    expect(approveTurn.session.phase).toBe("awaiting_action");
    expect(approveTurn.session.approvedDraft).toBe(true);
    saveUniversalCreationSession(approveTurn.session);
    return approveTurn;
  }

  if (turn.kind === "draft") {
    if (
      turn.session.phase === "awaiting_action" &&
      turn.session.approvedDraft
    ) {
      saveUniversalCreationSession(turn.session);
      return turn;
    }
    saveUniversalCreationSession(turn.session);
    const approveTurn = resolveUniversalCreationTurn(
      "No, I like it, so no changes.",
      8,
      formatUniversalCreationTurnReply(turn),
    )!;
    expect(approveTurn.session.phase).toBe("awaiting_action");
    expect(approveTurn.session.approvedDraft).toBe(true);
    saveUniversalCreationSession(approveTurn.session);
    return approveTurn;
  }

  throw new Error(`Unexpected turn kind after discovery: ${turn.kind}`);
}

describe("Email workflow completion — no intake restart after approval", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
    clearUniversalCreationSession();
  });

  it("creates a draft, approves with no changes, and moves to awaiting_action", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();
    expect(approveTurn.session.approvedDraft).toBe(true);
    expect(approveTurn.session.phase).toBe("awaiting_action");
    expect(emailWorkflowStateFromSession(approveTurn.session)).toBe(
      "awaiting_action",
    );

    const reply = formatUniversalCreationTurnReply(
      approveTurn.kind === "draft" || approveTurn.kind === "message"
        ? approveTurn
        : {
            kind: "draft",
            message: "Your email is ready.",
            draftBody: approveTurn.session.draftContent ?? "",
            session: approveTurn.session,
          },
    );
    expect(reply).toMatch(/Copy Email/i);
    expect(reply).toMatch(/Create Gmail Draft/i);
    expect(reply).toMatch(/Send Email/i);
    expect(reply).not.toMatch(/Who is receiving this email/i);
  });

  it("does not restart intake when user says let’s write the email after approval", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();
    const approvedBody = approveTurn.session.draftContent;
    expect(approvedBody).toBeTruthy();

    const writeAgain = resolveUniversalCreationTurn(
      "Okay, so let’s write the email",
      10,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approvedBody ?? "",
        session: approveTurn.session,
      }),
    );
    expect(writeAgain).toBeTruthy();
    expect(writeAgain!.kind).not.toBe("question");
    if (writeAgain!.kind === "question") {
      expect(writeAgain.question).not.toMatch(/Who is receiving this email/i);
    }
    expect(writeAgain!.session.phase).toBe("awaiting_action");
    expect(writeAgain!.session.draftContent).toBe(approvedBody);
    expect(writeAgain!.session.answers["email-recipient"]).toBeTruthy();
    expect(hasUsableApprovedEmailDraft(writeAgain!.session)).toBe(true);

    const reply = formatUniversalCreationTurnReply(writeAgain!);
    expect(reply).toMatch(/Copy Email|ready/i);
    expect(reply).not.toMatch(/Who is receiving this email/i);
  });

  it("Make Changes edits the existing draft without restarting intake", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();

    const edit = resolveUniversalCreationTurn(
      "Make Changes",
      11,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approveTurn.session.draftContent ?? "",
        session: approveTurn.session,
      }),
    );
    expect(edit?.session.phase).toBe("revision");
    expect(edit?.message).toMatch(/what you'd like different/i);
    expect(edit?.session.draftContent).toBe(approveTurn.session.draftContent);
  });

  it("Copy Email preserves the approved draft", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();

    const copy = resolveUniversalCreationTurn(
      "Copy Email",
      12,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approveTurn.session.draftContent ?? "",
        session: approveTurn.session,
      }),
    );
    expect(copy?.kind).toBe("draft");
    expect(copy?.session.phase).toBe("awaiting_action");
    expect(copy?.session.draftContent).toBe(approveTurn.session.draftContent);
    expect(copy?.message).toMatch(/Copied/i);
  });

  it("Create Gmail Draft does not send", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();

    const gmail = resolveUniversalCreationTurn(
      "2",
      13,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approveTurn.session.draftContent ?? "",
        session: approveTurn.session,
      }),
    );
    expect(gmail?.message).toMatch(/Gmail draft/i);
    expect(gmail?.message).toMatch(/won'?t send/i);
    expect(gmail?.session.phase).toBe("awaiting_action");
  });

  it("Send Email requires explicit confirmation", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();

    const send = resolveUniversalCreationTurn(
      "Send Email",
      14,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approveTurn.session.draftContent ?? "",
        session: approveTurn.session,
      }),
    );
    expect(send?.message).toMatch(/explicit send confirmation/i);
    expect(send?.message).toMatch(/Yes, send it/i);
    expect(send?.session.phase).toBe("awaiting_action");
  });

  it("generic recovery restores awaiting_action for an approved email", () => {
    runEmailToApprovedAwaitingAction();
    expect(loadUniversalCreationSession()?.approvedDraft).toBe(true);

    const recovery = resolveRecoveryContinuation({
      userText: "okay",
      lastAssistantText: "Something got tangled for a second, but I'm still here.",
    });
    expect(recovery).toMatch(/email is ready/i);
    expect(recovery).not.toMatch(/Pick up wherever you left off/i);
    expect(recovery).not.toMatch(/Who is receiving this email/i);
  });

  it("Start Over is the only normal path back to intake", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();

    const restart = resolveUniversalCreationTurn(
      "Start over — write a different email",
      15,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approveTurn.session.draftContent ?? "",
        session: approveTurn.session,
      }),
    );
    expect(restart).toBeTruthy();
    if (restart?.kind === "question") {
      expect(restart.question).toMatch(/receiving this email|Who is/i);
    }
  });

  it("does not create a duplicate email workflow while approved draft exists", () => {
    const approveTurn = runEmailToApprovedAwaitingAction();
    const before = loadUniversalCreationSession();

    const again = resolveUniversalCreationTurn(
      "help me write an email",
      16,
      formatUniversalCreationTurnReply({
        kind: "draft",
        message: "Your email is ready.",
        draftBody: approveTurn.session.draftContent ?? "",
        session: approveTurn.session,
      }),
    );
    expect(again?.session.phase).toBe("awaiting_action");
    expect(again?.session.draftContent).toBe(before?.draftContent);
    expect(again?.session.startedAtTurn).toBe(before?.startedAtTurn);
  });
});
