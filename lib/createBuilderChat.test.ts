import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  bootstrapCreateBuilderFromWorkflow,
  applyCreateBuilderChatOpener,
  isAffirmative,
  isPendingApprovalAcceptance,
  pendingApprovalForSession,
  processCreateBuilderTurn,
  resolveBuilderType,
  resolvedCreateTopic,
  shouldSuppressParallelCoaching,
  type CreateBuilderSession,
} from "./createBuilderChat";
import { buildDiscoveryWorkspaceView } from "./createDiscoveryWorkspace";
import {
  processCreateBuilderTurnWithRecord,
  workflowRecordFromState,
} from "./createWorkflowRecord";
import { advanceAfterItemPick, advanceAfterTypePick, advanceToDiscovery, discoveryReadyForDraft } from "./createWorkflow";
import { isDraftWithWhatWeHaveRequest } from "./createSectionDiscovery";

function pendingFor(session: CreateBuilderSession) {
  return session.workflow.pendingFieldApproval;
}

function approveWith(session: CreateBuilderSession, phrase: string) {
  return processCreateBuilderTurn(session, phrase);
}

function answerWithApproval(session: CreateBuilderSession, answer: string) {
  const offered = processCreateBuilderTurn(session, answer);
  expect(pendingFor(offered.session)).toBeTruthy();
  expect(offered.reply).toMatch(/Would you like me to use that/i);
  return offered.session;
}

describe("createBuilderChat", () => {
  it("resolves strategy and SOP from user text", () => {
    expect(resolveBuilderType("I need an SOP")).toBe("SOP");
    expect(resolveBuilderType("marketing strategy")).toBe("Marketing Strategy");
    expect(resolveBuilderType("business strategy")).toBe("Business Strategy");
    expect(resolveBuilderType("social media post")).toBe("Social Post");
    expect(resolveBuilderType("email sequence")).toBe("Email Sequence");
    expect(resolveBuilderType("lead magnet")).toBe("Lead Magnet");
  });

  it("recognizes approval phrases and not arbitrary content", () => {
    for (const phrase of [
      "yes",
      "yes use that",
      "use that",
      "sounds good",
      "correct",
      "that's right",
      "approved",
      "looks good",
      "Use This",
    ]) {
      expect(isPendingApprovalAcceptance(phrase)).toBe(true);
    }
    expect(isPendingApprovalAcceptance("ADHD business clients")).toBe(false);
    expect(isPendingApprovalAcceptance("maybe later")).toBe(false);
  });

  it("opens pick-type with the create kickoff question", () => {
    const { session, opener } = bootstrapCreateBuilderSession();
    expect(session.phase).toBe("pick-type");
    expect(opener).toContain("What would you like to create?");
  });

  it("Lead Magnet: yes approves audience and advances without looping", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business clients");

    const afterYes = approveWith(session, "yes");
    expect(pendingFor(afterYes.session)).toBeFalsy();
    expect(afterYes.reply).toContain("ADHD business clients");
    expect(afterYes.reply).toMatch(/specific problem are they struggling with/i);
    expect(afterYes.session.workflow.discoveryAnswers.audience).toBe(
      "ADHD business clients",
    );
    expect(afterYes.session.workflow.discoveryAnswers.audience).not.toBe("yes");

    const view = buildDiscoveryWorkspaceView(afterYes.session.workflow);
    expect(view?.templateSections.find((s) => s.id === "audience")?.content).toContain(
      "ADHD business clients",
    );
    expect(view?.progress).toEqual({ current: 1, total: 8 });
  });

  it.each([
    "yes use that",
    "use that",
    "sounds good",
    "correct",
    "that's right",
  ])("Lead Magnet: '%s' commits pending audience", (phrase) => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business clients");
    const turn = approveWith(session, phrase);
    expect(turn.session.workflow.discoveryAnswers.audience).toBe("ADHD business clients");
    expect(pendingFor(turn.session)).toBeFalsy();
  });

  it("Lead Magnet: revise clears approval and does not save yes", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business clients");
    const turn = processCreateBuilderTurn(session, "Revise It");
    expect(pendingFor(turn.session)).toBeFalsy();
    expect(turn.session.workflow.discoveryAnswers.audience).toBeUndefined();
    expect(turn.reply).toMatch(/how would you like to put that/i);
  });

  it("persists awaiting approval through workflow record round-trip", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    const offered = processCreateBuilderTurn(session, "ADHD business clients");
    const record = workflowRecordFromState(offered.session.workflow, {
      builderPhase: offered.session.phase,
      source: "chat",
      itemType: "Lead Magnet",
    });
    const roundTrip = processCreateBuilderTurnWithRecord(record, "yes");
    expect(roundTrip.session.workflow.discoveryAnswers.audience).toBe(
      "ADHD business clients",
    );
    expect(pendingApprovalForSession(roundTrip.session)).toBeFalsy();
    expect(roundTrip.reply).not.toMatch(/audience is \*\*yes\*\*/i);
  });

  it("Lead Magnet: cannot reach readiness until all 8 required fields are approved", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    const answers = [
      "ADHD business clients",
      "They cannot finish marketing tasks",
      "A clear weekly plan",
      "My coaching program",
      "Checklist",
      "Finish your week in 30 minutes",
      "Intro, 5 steps, recap",
      "Book a free call",
    ];
    for (const answer of answers) {
      session = answerWithApproval(session, answer);
      const turn = approveWith(session, "yes");
      session = turn.session;
      if (answer !== answers[answers.length - 1]) {
        expect(turn.session.phase).toBe("discovery");
        expect(discoveryReadyForDraft("Lead Magnet", turn.session.workflow)).toBe(
          false,
        );
      }
    }
    expect(session.phase).toBe("readiness");
    expect(discoveryReadyForDraft("Lead Magnet", session.workflow)).toBe(true);
  });

  it("opens SOP builder with collaborative opener and first question", () => {
    const { session, opener } = bootstrapCreateBuilderSession("SOP");
    expect(session.phase).toBe("discovery");
    expect(opener).toContain("Let's think through your **SOP** together");
    expect(opener).toContain("What process are we documenting?");
  });

  it("requires approval before advancing SOP discovery", () => {
    let { session } = bootstrapCreateBuilderSession("SOP");
    const offered = processCreateBuilderTurn(
      session,
      "ElevenLabs video export workflow",
    );
    expect(pendingFor(offered.session)?.rawAnswer).toContain("ElevenLabs");
    const turn = approveWith(offered.session, "Use This");
    expect(turn.session.phase).toBe("discovery");
    expect(turn.reply).toContain("Who performs");
  });

  it("Newsletter opens collaboratively and asks for approval", () => {
    const { session, opener } = bootstrapCreateBuilderSession("Newsletter");
    expect(opener).toContain("Let's think through your **Newsletter** together");
    const after = approveWith(
      answerWithApproval(session, "Perfectionism traps for founders"),
      "yes",
    );
    expect(after.reply).toMatch(/Who is it for/i);
    expect(after.session.workflow.discoveryAnswers.theme).toBe(
      "Perfectionism traps for founders",
    );
  });

  it("Workshop walks discovery before readiness", () => {
    let { session } = bootstrapCreateBuilderSession("Workshop");
    let turn = approveWith(
      answerWithApproval(session, "ADHD productivity for entrepreneurs"),
      "yes",
    );
    expect(turn.reply).toContain("Who is it for");
    turn = approveWith(
      answerWithApproval(turn.session, "Solo founders with ADHD"),
      "sounds good",
    );
    expect(turn.reply).toContain("outcome");
  });

  it("detects affirmative approval for readiness phase", () => {
    expect(isAffirmative("yes")).toBe(true);
    expect(isAffirmative("go ahead")).toBe(true);
    expect(isAffirmative("maybe later")).toBe(false);
  });

  it("detects draft-with-what-we-have phrasing", () => {
    expect(isDraftWithWhatWeHaveRequest("write the letter with what we have")).toBe(
      true,
    );
    expect(isDraftWithWhatWeHaveRequest("just write it")).toBe(true);
    expect(isDraftWithWhatWeHaveRequest("Introduction")).toBe(false);
  });

  it("offers one confirmation when user wants to draft with partial sections", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business clients");
    session = approveWith(session, "yes").session;
    const turn = processCreateBuilderTurn(
      session,
      "write the letter with what we have",
    );
    expect(turn.session.phase).toBe("readiness");
    expect(turn.reply).toMatch(/create a draft now/i);
    expect(turn.actions?.map((a) => a.label)).toEqual(
      expect.arrayContaining(["Create Draft", "Keep Working"]),
    );
  });

  it("resumes from panel workflow at readiness without restarting", () => {
    let wf = advanceToDiscovery(advanceAfterTypePick("Email", "content"));
    const answers = {
      recipient: "Sarah",
      goal: "Book a call",
      context: "Met at conference",
    };
    const qs = ["recipient", "goal", "context"] as const;
    for (let i = 0; i < qs.length; i++) {
      wf = {
        ...wf,
        discoveryAnswers: { ...wf.discoveryAnswers, [qs[i]]: answers[qs[i]] },
        discoveryIndex: i + 1,
      };
    }
    wf = { ...wf, step: "readiness" };
    const { session, opener } = bootstrapCreateBuilderFromWorkflow("Email", wf);
    expect(session.phase).toBe("readiness");
    expect(opener).toContain("I have your answers");
  });
});
