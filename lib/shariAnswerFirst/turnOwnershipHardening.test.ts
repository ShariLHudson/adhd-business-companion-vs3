/**
 * Turn Ownership & Recovery Hardening — shared rules across artifact types.
 * Not dependent on C1 wording; C1 is covered separately.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { decideShariResponse } from "./decideShariResponse";
import { decideConversationTurnAuthority } from "./turnAuthority";
import {
  classifyTurnRecovery,
  shouldRepairOrResumeTask,
  shouldResumeAfterDetourDecline,
} from "./turnRecovery";
import { evaluateCreationCriticalGap } from "./creationCriticalGap";
import { validateConversationExcellence } from "./conversationExcellence";
import { runShariCognitivePipeline } from "./cognitivePipeline";
import {
  advanceUniversalCreation,
  clearUniversalCreationSession,
  formatUniversalCreationTurnReply,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
} from "@/lib/universalCreation";

beforeEach(() => {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage, sessionStorage: storage });
  clearUniversalCreationSession();
});

function authorityFor(
  text: string,
  opts?: { activeCreateSession?: boolean },
) {
  const decision = decideShariResponse(text);
  return decideConversationTurnAuthority({
    userText: text,
    decision,
    isFollowUp: Boolean(opts?.activeCreateSession),
    thread: null,
    primaryRole: "teacher",
    pendingCreateConsent: false,
    hasCurrentFounderAction: false,
    activeCreateSession: opts?.activeCreateSession ?? false,
  });
}

describe("Turn ownership hardening — shared rules", () => {
  it("complete creation request → immediate first draft (email)", () => {
    const turn = startUniversalCreationTurn(
      "I'm overwhelmed and need my team to wait until tomorrow — write the email for me.",
      1,
    );
    expect(turn?.kind).toBe("draft");
    if (turn?.kind !== "draft") return;
    expect(formatUniversalCreationTurnReply(turn)).toMatch(/team|tomorrow/i);
  });

  it("partial creation request → only one blocking question", () => {
    const turn = startUniversalCreationTurn("help me write an email", 1);
    expect(turn?.kind).toBe("question");
    if (turn?.kind !== "question") return;
    expect(turn.question).toBeTruthy();
    // Single question string — not a stacked multi-question dump
    const qMarks = (turn.question.match(/\?/g) ?? []).length;
    expect(qMarks).toBeLessThanOrEqual(1);
  });

  it("known facts are not requested again", () => {
    const first = startUniversalCreationTurn(
      "write an email to my team about delaying replies until tomorrow",
      1,
    );
    expect(first?.kind).toBe("draft");
    if (!first || first.kind !== "draft") return;
    saveUniversalCreationSession(first.session);
    const again = resolveUniversalCreationTurn(
      "write the email to my team",
      2,
      formatUniversalCreationTurnReply(first),
    );
    expect(again?.kind).not.toBe("question");
    if (again?.kind === "question") {
      expect(again.question).not.toMatch(/who is receiving/i);
    }
  });

  it("emotion affects tone ownership flags but not destination when create owns", () => {
    const auth = authorityFor(
      "I'm so overwhelmed — please draft a proposal for my client about next steps",
    );
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
    expect(auth.allowCreatePresentation).toBe(true);
    expect(auth.responseMode).toBe("execution");
  });

  it("declined optional detour resumes the original task", () => {
    const first = startUniversalCreationTurn(
      "write an email to my team that I'm overwhelmed and need until tomorrow",
      1,
    );
    expect(first?.kind).toBe("draft");
    if (!first || first.kind !== "draft") return;
    saveUniversalCreationSession(first.session);
    expect(
      shouldResumeAfterDetourDecline({
        recoveryType: "rejection",
        activeCreateSession: true,
        createOwnsTurn: true,
      }),
    ).toBe(true);
    const resumed = resolveUniversalCreationTurn(
      "continue",
      3,
      "Would it help to open your Evidence Vault anyway?",
    );
    expect(resumed).not.toBeNull();
    expect(resumed!.kind).not.toBe("question");
    expect(resumed!.session.answers["email-recipient"]).toMatch(/team/i);
  });

  it("repeated request triggers repair/resume", () => {
    expect(classifyTurnRecovery("write the email to my team")).toBe(
      "repetition",
    );
    expect(shouldRepairOrResumeTask("repetition")).toBe(true);
    const first = startUniversalCreationTurn(
      "draft an email asking my team for one more day",
      1,
    );
    if (first) saveUniversalCreationSession(first.session);
    const again = resolveUniversalCreationTurn(
      "write the email to my team",
      4,
      "Who is receiving this email?",
    );
    expect(again?.kind).not.toBe("question");
  });

  it("revision modifies the same artifact", () => {
    expect(classifyTurnRecovery("make it shorter")).toBe("revision");
    const first = startUniversalCreationTurn(
      "write an email to my team that I need until tomorrow",
      1,
    );
    expect(first?.kind).toBe("draft");
    if (!first || first.kind !== "draft") return;
    saveUniversalCreationSession(first.session);
    const revised = resolveUniversalCreationTurn(
      "make it shorter",
      2,
      formatUniversalCreationTurnReply(first),
    );
    expect(revised).not.toBeNull();
    expect(revised!.session.startedAtTurn).toBe(first.session.startedAtTurn);
    expect(revised!.kind).not.toBe("question");
  });

  it("correction does not restart discovery", () => {
    expect(classifyTurnRecovery("no, write the email")).toBe("correction");
    const seeded = startUniversalCreationTurn("help me create a checklist", 1);
    if (seeded) saveUniversalCreationSession(seeded.session);
    const corrected = resolveUniversalCreationTurn(
      "no, write the email for my team about waiting until tomorrow",
      2,
      seeded && seeded.kind === "question"
        ? seeded.question
        : "Who will use this checklist?",
    );
    expect(corrected).not.toBeNull();
    if (corrected?.kind === "question") {
      expect(corrected.question).not.toMatch(/checklist/i);
    }
    if (corrected) {
      expect(corrected.session.documentType).toBe("email");
    }
  });

  it("same draft-first / critical-gap rules across three artifact types", () => {
    const cases: { text: string; type: string }[] = [
      {
        text: "write an email to my team that I need until tomorrow to answer questions",
        type: "email",
      },
      {
        text: "create a checklist for my VA to onboard new clients this week",
        type: "checklist",
      },
      {
        text: "draft a proposal for my client explaining the next project phase and timeline",
        type: "proposal",
      },
    ];
    for (const c of cases) {
      const turn = startUniversalCreationTurn(c.text, 1);
      expect(turn, c.text).not.toBeNull();
      expect(turn!.session.documentType, c.text).toBe(c.type);
      const gap = evaluateCreationCriticalGap(turn!.session);
      if (gap.canDraft) {
        expect(turn!.kind, c.text).toBe("draft");
      } else {
        expect(turn!.kind, c.text).toBe("question");
        expect(gap.blockingQuestion).toBeTruthy();
        const qMarks = (gap.blockingQuestion!.match(/\?/g) ?? []).length;
        expect(qMarks).toBeLessThanOrEqual(1);
      }
    }
  });

  it("exactly one final owner per turn — create suppresses advisory", () => {
    const auth = authorityFor(
      "I'm overwhelmed — write a short summary for my team about today's meeting",
    );
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
    expect(auth.allowCreatePresentation).toBe(true);
  });

  it("advisory systems cannot become the final owner of an explicit create turn", () => {
    const turn = runShariCognitivePipeline(
      "I'm overwhelmed — please draft an agenda for tomorrow's team meeting",
    );
    const stolen = validateConversationExcellence({
      request: turn.decision.rawRequest,
      answer:
        "This feels heavy right now. Would it help to open your Evidence Vault anyway?",
      decision: turn.decision,
      context: turn.context,
      questionPolicy: turn.questionPolicy,
      primaryRole: turn.primaryProfessionalRole,
      composition: turn.composition,
      wisdom: turn.wisdom,
    });
    expect(stolen.excellenceFailures).toContain(
      "explicit_create_stolen_by_emotional_destination",
    );
  });

  it("partial advance asks at most one more critical question then drafts", () => {
    const first = startUniversalCreationTurn("help me write an email", 1);
    expect(first?.kind).toBe("question");
    if (!first || first.kind !== "question") return;
    const after = advanceUniversalCreation(
      first.session,
      "my team — I need until tomorrow before I answer their questions",
    );
    expect(after?.kind).toBe("draft");
  });
});
