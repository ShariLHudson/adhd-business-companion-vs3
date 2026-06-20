import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  processCreateBuilderTurn,
} from "./createBuilderChat";
import { buildDiscoveryWorkspaceView } from "./createDiscoveryWorkspace";
import {
  shouldCaptureFieldAnswer,
} from "./createBuilderModes";
import { isCreateExplorationRequest } from "./createExplorationMode";
import { isDraftWithWhatWeHaveRequest } from "./createSectionDiscovery";
import { SOCIAL_PLATFORM_URLS } from "./createDraftActions";
import { matchSectionFromText } from "./createSectionDiscovery";

function answerWithApproval(
  session: ReturnType<typeof bootstrapCreateBuilderSession>["session"],
  answer: string,
) {
  const offered = processCreateBuilderTurn(session, answer);
  if (!offered.session.workflow.pendingFieldApproval) return offered;
  return processCreateBuilderTurn(offered.session, "yes");
}

describe("createBuilderStabilization", () => {
  it("help question does not fill field", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business owners").session;

    const turn = processCreateBuilderTurn(
      session,
      "What problems do ADHD business owners usually have?",
    );
    expect(turn.reply).toBe("");
    expect(turn.session.workflow.pendingFieldApproval).toBeFalsy();
    expect(turn.session.workflow.discoveryAnswers.problem).toBeUndefined();
    expect(isCreateExplorationRequest("What problems do ADHD business owners usually have?")).toBe(
      true,
    );
    expect(shouldCaptureFieldAnswer("What problems do ADHD business owners usually have?", false)).toBe(
      false,
    );
  });

  it("research request does not fill field", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business owners").session;

    expect(isCreateExplorationRequest("help me research ADHD pain points")).toBe(
      true,
    );
    expect(shouldCaptureFieldAnswer("help me research ADHD pain points", false)).toBe(
      false,
    );

    const turn = processCreateBuilderTurn(
      session,
      "help me research ADHD pain points",
    );
    expect(turn.session.workflow.discoveryAnswers.problem).toBeUndefined();
    expect(turn.session.workflow.pendingFieldApproval).toBeFalsy();
  });

  it("approval saves correct pending value — not the approval word", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    const offered = processCreateBuilderTurn(session, "ADHD business owners");
    expect(offered.session.workflow.pendingFieldApproval?.summary).toBe(
      "ADHD business owners",
    );

    const approved = processCreateBuilderTurn(offered.session, "yes");
    expect(approved.session.workflow.discoveryAnswers.audience).toBe(
      "ADHD business owners",
    );
    expect(approved.session.workflow.discoveryAnswers.audience).not.toBe("yes");
    expect(approved.session.workflow.pendingFieldApproval).toBeFalsy();
  });

  it("orphan approval word does not become field content", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business owners").session;

    const turn = processCreateBuilderTurn(session, "yes use that");
    expect(turn.session.workflow.discoveryAnswers.problem).toBeUndefined();
    expect(turn.session.workflow.pendingFieldApproval).toBeFalsy();
  });

  it("field maps to correct workspace section after approval", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business owners").session;
    session = answerWithApproval(
      session,
      "They cannot finish marketing tasks",
    ).session;

    const view = buildDiscoveryWorkspaceView(session.workflow);
    const audienceSection = view?.templateSections.find((s) => s.id === "audience");
    const problemSection = view?.templateSections.find((s) => s.id === "problem");
    expect(audienceSection?.content).toContain("ADHD business owners");
    expect(problemSection?.content).toContain("marketing tasks");
  });

  it("draft with what we have offers one confirmation", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    session = answerWithApproval(session, "ADHD business owners").session;

    expect(isDraftWithWhatWeHaveRequest("write the letter with what we have")).toBe(
      true,
    );
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

  it("long content mentioning a section name is not treated as section pick", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerWithApproval(session, answer).session;
    }
    const pool =
      buildDiscoveryWorkspaceView(session.workflow)?.templateSections.map((s) => ({
        id: s.id,
        label: s.label,
      })) ?? [];
    expect(pool.length).toBeGreaterThan(0);

    const longText =
      "For the introduction, welcome readers and explain why perfectionism traps founders.";
    expect(matchSectionFromText(longText, pool)).toBeNull();
  });

  it("numbered option pick requires approval before workspace write", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerWithApproval(session, answer).session;
    }
    session = {
      ...session,
      workflow: {
        ...session.workflow,
        activeSectionId: "subject",
        pendingSectionOptions: [
          "Stop waiting for perfect",
          "Perfectionism is a trap",
        ],
      },
    };

    const offered = processCreateBuilderTurn(session, "use 2");
    expect(offered.session.workflow.pendingFieldApproval?.summary).toBe(
      "Perfectionism is a trap",
    );
    expect(offered.session.workflow.sectionContent?.subject).toBeUndefined();

    const approved = processCreateBuilderTurn(offered.session, "yes");
    expect(approved.session.workflow.sectionContent?.subject).toBe(
      "Perfectionism is a trap",
    );
  });

  it("social platform open links are preserved", () => {
    expect(SOCIAL_PLATFORM_URLS.linkedin).toContain("linkedin.com");
    expect(SOCIAL_PLATFORM_URLS.facebook).toContain("facebook.com");
    expect(SOCIAL_PLATFORM_URLS.instagram).toContain("instagram.com");
  });
});
