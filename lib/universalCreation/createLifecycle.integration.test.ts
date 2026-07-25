/**
 * @vitest-environment jsdom
 *
 * Phase 3 certification — Create park / return / revision lifecycle (A1–A8).
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearUniversalCreationSession,
  loadUniversalCreationSession,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
  resolveUniversalCreationTurn,
  formatUniversalCreationTurnReply,
} from "./orchestrator";
import { resolveRecoveryContinuation } from "@/lib/sparkConversation/coachingFallback";
import {
  exitCreateWorkflow,
  getCreateLifecycle,
  isCreateParked,
  parkCreateWorkflow,
  resumeCreateWorkflow,
  shouldSuppressSoftConfirmationForCreate,
} from "./createLifecycle";
import {
  classifyCreateTurnRelationship,
  createHandlerEligible,
  isParkedCreateCompanionDetour,
} from "./createTurnRelationship";
import { buildAnswerFirstFailSafeReply } from "@/lib/shariAnswerFirst";
import { applyDraftRevision, composeEmailDraft } from "./draftComposer";
import { isSimpleCreateRequest } from "./createFastPath";
import { isCreateRevisionInstruction } from "./createRevisionDetect";
import { advanceGuidedCreationFlow } from "./guidedCreationFlow";
import { parseEmailAwaitingAction } from "./emailWorkflowCompletion";
import {
  collectOwnershipClaims,
  selectAuthoritativeClaim,
} from "@/lib/conversationSession/ownership/adaptLegacyOwnership";
import {
  clearFrictionlessPending,
  saveFrictionlessPending,
} from "@/lib/frictionlessActionLayer";
import { getOrCreateConversationSession } from "@/lib/conversationSession/store";
import type { UniversalCreationSession } from "./types";

function seedEmailDraftSession(): UniversalCreationSession {
  getOrCreateConversationSession();
  clearUniversalCreationSession();
  const start = startUniversalCreationTurn(
    "Please draft a customer email announcing a price change. Audience: monthly subscribers. Price: $97/month starting August 1.",
    1,
  )!;
  const withAnswers: UniversalCreationSession = {
    ...start.session,
    phase: "awaiting_action",
    approvedDraft: true,
    answers: {
      ...start.session.answers,
      "email-recipient": "current monthly subscribers",
      "email-purpose":
        "Announce the price change clearly and keep trust with monthly subscribers",
      "email-ask": "New price is $97/month starting August 1",
      "email-context": "We've grown the coaching program this year",
    },
    lifecycle: "awaiting_input",
  };
  const draft = composeEmailDraft(withAnswers);
  const ready: UniversalCreationSession = {
    ...withAnswers,
    draftContent: draft,
    approvedDraft: true,
    phase: "awaiting_action",
  };
  saveUniversalCreationSession(ready);
  return ready;
}

describe("Create lifecycle integration A1–A8", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearUniversalCreationSession();
    clearFrictionlessPending();
    getOrCreateConversationSession();
  });

  it("A1 — park on unrelated question; Create does not steal", () => {
    seedEmailDraftSession();
    const sideQ =
      "Quick side question — do I need a business license to sell online coaching in Texas?";
    const lastMenu =
      "Your email is ready. What would you like to do?\n1. Copy Email";
    const decision = classifyCreateTurnRelationship({
      userText: sideQ,
      session: loadUniversalCreationSession(),
      lastAssistantText: lastMenu,
    });
    expect(decision.relationship).toBe("temporary-detour");
    expect(createHandlerEligible(decision)).toBe(false);
    expect(decision.shouldPark).toBe(true);
    expect(isParkedCreateCompanionDetour(decision)).toBe(true);
    expect(
      buildAnswerFirstFailSafeReply(sideQ, { suppressHowToLesson: true }),
    ).toBeNull();
    expect(buildAnswerFirstFailSafeReply(sideQ)).toMatch(
      /practical way to approach/i,
    );

    parkCreateWorkflow(decision.reason, 5);
    expect(isCreateParked()).toBe(true);
    const session = loadUniversalCreationSession();
    expect(session?.documentType).toBe("email");
    expect(session?.draftContent).toBeTruthy();
    expect(session?.answers["email-purpose"]).toMatch(/price change/i);
    expect(session?.draftContent).not.toMatch(/Your email is ready/i);

    // Rival paths that previously stole parked Create must stay silent.
    const recovery = resolveRecoveryContinuation({
      userText: sideQ,
      lastAssistantText: lastMenu,
    });
    expect(recovery).not.toMatch(/email is ready/i);
    const stolenTurn = resolveUniversalCreationTurn(sideQ, 5, lastMenu);
    expect(stolenTurn).toBeNull();
  });

  it("A2 — resume parked email on explicit return", () => {
    seedEmailDraftSession();
    parkCreateWorkflow("side_question_detour", 5);
    const draftBefore = loadUniversalCreationSession()?.draftContent;

    const decision = classifyCreateTurnRelationship({
      userText: "Let's go back to the email.",
      session: loadUniversalCreationSession(),
      lastAssistantText: "In Texas, whether you need a business license…",
    });
    expect(decision.relationship).toBe("explicit-return-to-create");
    expect(decision.shouldResume).toBe(true);
    expect(createHandlerEligible(decision)).toBe(true);

    resumeCreateWorkflow(decision.reason);
    expect(isCreateParked()).toBe(false);
    expect(loadUniversalCreationSession()?.draftContent).toBe(draftBefore);

    const turn = resolveUniversalCreationTurn(
      "Let's go back to the email.",
      6,
      "In Texas, whether you need a business license…",
    );
    expect(turn).toBeTruthy();
    const reply = formatUniversalCreationTurnReply(turn!);
    expect(reply.toLowerCase()).not.toMatch(/practical way to approach/);
    expect(reply).not.toMatch(/how-to/i);
  });

  it("A3 — revise after return adds free delivery without echoing request as body", () => {
    seedEmailDraftSession();
    parkCreateWorkflow("detour", 5);
    resumeCreateWorkflow("explicit_return");
    const before = loadUniversalCreationSession()!.draftContent!;
    expect(before).not.toMatch(/free delivery/i);

    const revised = applyDraftRevision(before, "Add a free-delivery line.");
    expect(revised).toMatch(/free delivery/i);
    expect(revised).not.toMatch(/^Add a free-delivery line/i);
    expect(revised).not.toMatch(/\*\*Revised with your notes:\*\*\s*\n\s*Add a free-delivery/i);
    expect(revised).toMatch(/\$97|monthly subscribers|price change/i);

    const decision = classifyCreateTurnRelationship({
      userText: "Add a free-delivery line.",
      session: {
        ...loadUniversalCreationSession()!,
        lifecycle: "resumed",
      },
      lastAssistantText: "Of course — here's the email again.",
    });
    expect(decision.relationship).toBe("revise-create");
    expect(createHandlerEligible(decision)).toBe(true);

    const warmer =
      "Make the tone warmer and open with gratitude for their support this year.";
    expect(isSimpleCreateRequest(warmer)).toBe(false);
    const beforeWarmer = loadUniversalCreationSession();
    expect(beforeWarmer?.documentType).toBe("email");
    expect(beforeWarmer?.phase).toBe("awaiting_action");
    expect(beforeWarmer?.draftContent?.trim()).toBeTruthy();
    const warmerRel = classifyCreateTurnRelationship({
      userText: warmer,
      session: beforeWarmer,
      lastAssistantText:
        "Your email is ready. Would you like to copy it, create a Gmail draft, send it, or make changes?",
    });
    expect(warmerRel.relationship).toBe("revise-create");
    expect(isCreateRevisionInstruction(warmer)).toBe(true);
    expect(parseEmailAwaitingAction(warmer)).toBeNull();
    const guidedDirect = advanceGuidedCreationFlow(
      beforeWarmer!,
      warmer,
      "Your email is ready. Would you like to copy it, create a Gmail draft, send it, or make changes?",
    );
    expect(guidedDirect?.kind).toBe("draft");
    const warmerTurn = resolveUniversalCreationTurn(
      warmer,
      7,
      "Your email is ready. Would you like to copy it, create a Gmail draft, send it, or make changes?",
    );
    expect(warmerTurn?.kind).toBe("draft");
    const warmerReply = formatUniversalCreationTurnReply(warmerTurn!);
    expect(warmerReply).toMatch(/Updated|same email/i);
    expect(warmerReply).not.toMatch(/I'd love to help you create this/i);
    expect(warmerReply).not.toMatch(/Who is it for/i);
    expect(loadUniversalCreationSession()?.documentType).toBe("email");
    expect(loadUniversalCreationSession()?.draftContent).toBeTruthy();
  });

  it("A4 — parked Create cannot steal two unrelated questions", () => {
    seedEmailDraftSession();
    parkCreateWorkflow("detour", 5);
    for (const q of [
      "What is a DBA in Texas?",
      "Should I register as an LLC first?",
    ]) {
      const d = classifyCreateTurnRelationship({
        userText: q,
        session: loadUniversalCreationSession(),
        lastAssistantText: "Here's a short answer…",
      });
      expect(createHandlerEligible(d)).toBe(false);
      expect(d.relationship).not.toBe("continue-create");
    }
    expect(isCreateParked()).toBe(true);
    expect(loadUniversalCreationSession()?.draftContent).toBeTruthy();
  });

  it("A5 — soft confirmation suppressed while Create active or parked", () => {
    seedEmailDraftSession();
    saveFrictionlessPending({
      type: "open_workspace",
      target: "content-generator",
      label: "Create",
      context: "email ready",
      offerSummary: "Open Create",
      offeredAtTurn: 3,
    });

    const claimsActive = collectOwnershipClaims({ awaitingConfirmation: null });
    const { selected: selectedActive } = selectAuthoritativeClaim(claimsActive);
    expect(selectedActive?.owner).toBe("create");
    expect(shouldSuppressSoftConfirmationForCreate()).toBe(true);
    expect(
      claimsActive.some(
        (c) =>
          c.owner === "confirmation" && c.reason === "frictionless_pending",
      ),
    ).toBe(false);

    parkCreateWorkflow("detour", 5);
    const claimsParked = collectOwnershipClaims({ awaitingConfirmation: null });
    const { selected: selectedParked } = selectAuthoritativeClaim(claimsParked);
    expect(selectedParked?.owner).toBe("create");
    expect(
      claimsParked.some((c) => c.reason === "frictionless_pending"),
    ).toBe(false);
  });

  it("A6 — explicit exit releases Create; later go-back does not revive", () => {
    seedEmailDraftSession();
    parkCreateWorkflow("detour", 5);
    const decision = classifyCreateTurnRelationship({
      userText: "Forget the email. I want to work on something else.",
      session: loadUniversalCreationSession(),
    });
    expect(decision.relationship).toBe("exit-create");
    expect(decision.shouldExit).toBe(true);
    exitCreateWorkflow("exited");
    expect(loadUniversalCreationSession()).toBeNull();

    const after = classifyCreateTurnRelationship({
      userText: "Let's go back to the email.",
      session: loadUniversalCreationSession(),
    });
    expect(after.createEligible).toBe(false);
    expect(after.relationship).not.toBe("explicit-return-to-create");
  });

  it("A7 — completion release leaves Companion path clear", () => {
    seedEmailDraftSession();
    exitCreateWorkflow("completed");
    expect(loadUniversalCreationSession()).toBeNull();
    expect(getCreateLifecycle().state).toBe("none");
    const d = classifyCreateTurnRelationship({
      userText: "What should I focus on today?",
      session: null,
    });
    expect(d.relationship).toBe("unrelated-turn");
    expect(d.createEligible).toBe(false);
  });

  it("A8 — reload while parked hydrates; unrelated then return + revise", () => {
    seedEmailDraftSession();
    parkCreateWorkflow("detour", 5);
    const raw = localStorage.getItem("universal-creation-session-v1");
    expect(raw).toBeTruthy();

    // Simulate reload — clear memory, reload from storage.
    clearUniversalCreationSession();
    // clear wiped storage — re-seed parked from raw
    localStorage.setItem("universal-creation-session-v1", raw!);
    // Force memory miss
    const hydrated = loadUniversalCreationSession();
    expect(hydrated?.lifecycle).toBe("parked");
    expect(isCreateParked(hydrated)).toBe(true);

    const unrelated = classifyCreateTurnRelationship({
      userText: "Do I need sales tax in Texas?",
      session: hydrated,
      lastAssistantText: "Prior answer",
    });
    expect(createHandlerEligible(unrelated)).toBe(false);

    const ret = classifyCreateTurnRelationship({
      userText: "go back to the email",
      session: loadUniversalCreationSession(),
    });
    expect(ret.relationship).toBe("explicit-return-to-create");
    resumeCreateWorkflow("explicit_return");
    const draft = loadUniversalCreationSession()!.draftContent!;
    const revised = applyDraftRevision(draft, "Add free delivery to the email.");
    expect(revised).toMatch(/free delivery/i);
    expect(revised).not.toMatch(/^Add free delivery to the email/i);
  });

  it("composer — create-command noise does not echo into email body", () => {
    const session = seedEmailDraftSession();
    const noisy: UniversalCreationSession = {
      ...session,
      answers: {
        ...session.answers,
        "email-context":
          "please draft a customer email announcing a price change for our online coaching program",
        "email-relationship":
          "please draft a customer email announcing a price change",
      },
    };
    const draft = composeEmailDraft(noisy);
    expect(draft.toLowerCase()).not.toMatch(
      /hope you're doing well — please draft a customer email/,
    );
  });
});
