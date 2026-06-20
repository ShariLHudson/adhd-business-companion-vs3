import { describe, expect, it } from "vitest";
import {
  isCandidateFieldAnswer,
  isCreateExplorationRequest,
  shouldCaptureAsFieldAnswer,
} from "./createExplorationMode";
import {
  handleGuidedCreateMessage,
  startGuidedCreateSession,
} from "./createGuidedSession";
import { getTemplateProgress } from "./createTemplateFields";
import {
  bootstrapCreateBuilderSession,
  processCreateBuilderTurn,
} from "./createBuilderChat";
import { buildDiscoveryWorkspaceView } from "./createDiscoveryWorkspace";

describe("createExplorationMode", () => {
  it("treats research requests as exploration", () => {
    expect(isCreateExplorationRequest("help me research")).toBe(true);
    expect(isCreateExplorationRequest("help me research ADHD pain points")).toBe(
      true,
    );
    expect(shouldCaptureAsFieldAnswer("help me research")).toBe(false);
  });

  it("treats brainstorming as exploration", () => {
    expect(isCreateExplorationRequest("let's brainstorm")).toBe(true);
    expect(isCreateExplorationRequest("help me brainstorm ideas")).toBe(true);
    expect(shouldCaptureAsFieldAnswer("let's brainstorm")).toBe(false);
  });

  it("treats example requests as exploration", () => {
    expect(isCreateExplorationRequest("give me examples")).toBe(true);
    expect(isCreateExplorationRequest("what are some options")).toBe(true);
    expect(isCreateExplorationRequest("what would you suggest")).toBe(true);
    expect(shouldCaptureAsFieldAnswer("give me examples")).toBe(false);
  });

  it("only treats candidate answers as field capture", () => {
    expect(isCandidateFieldAnswer("I think overwhelm and prioritization")).toBe(
      true,
    );
    expect(
      shouldCaptureAsFieldAnswer("I think overwhelm and prioritization"),
    ).toBe(true);
    expect(isCreateExplorationRequest("what problems do they have")).toBe(true);
    expect(
      shouldCaptureAsFieldAnswer("what problems do they have"),
    ).toBe(false);
  });

  it("keeps template progress unchanged during exploration", () => {
    let session = startGuidedCreateSession("lead-magnet");
    session = {
      ...session,
      values: { audience: "ADHD business owners" },
    };
    const before = getTemplateProgress("lead-magnet", session.values);

    const turn = handleGuidedCreateMessage(
      session,
      "What problems do ADHD business owners usually have?",
    );
    expect(turn.explorationMode).toBe(true);
    expect(turn.pendingApproval).toBeNull();
    expect(turn.values).toEqual(session.values);
    expect(getTemplateProgress("lead-magnet", turn.values)).toEqual(before);
  });

  it("creates pending approval only for candidate answers", () => {
    let session = startGuidedCreateSession("lead-magnet");
    session = {
      ...session,
      values: { audience: "ADHD business owners" },
    };

    const explore = handleGuidedCreateMessage(
      session,
      "what problems do they have",
    );
    expect(explore.pendingApproval).toBeNull();
    expect(explore.explorationMode).toBe(true);

    const capture = handleGuidedCreateMessage(
      session,
      "I think overwhelm and struggling to prioritize what matters most",
    );
    expect(capture.explorationMode).not.toBe(true);
    expect(capture.pendingApproval?.fieldId).toBe("problem");
    expect(capture.pendingApproval?.value).toContain("overwhelm");
    expect(capture.assistantMessage).toMatch(/problem is/i);
  });
});

describe("createExplorationMode builder integration", () => {
  function approveAudience(session: ReturnType<typeof bootstrapCreateBuilderSession>["session"]) {
    const offered = processCreateBuilderTurn(session, "ADHD business owners");
    return processCreateBuilderTurn(offered.session, "yes").session;
  }

  it("Lead Magnet: exploration in chat never saves or creates pending approval", () => {
    let session = approveAudience(bootstrapCreateBuilderSession("Lead Magnet").session);

    const explore = processCreateBuilderTurn(
      session,
      "What problems do ADHD business owners usually have?",
    );
    expect(explore.reply).toBe("");
    expect(explore.session.workflow.pendingFieldApproval).toBeFalsy();
    expect(explore.session.workflow.discoveryAnswers.problem).toBeUndefined();

    const view = buildDiscoveryWorkspaceView(explore.session.workflow);
    expect(view?.progress).toEqual({ current: 1, total: 8 });
  });

  it("Lead Magnet: candidate answer after exploration offers approval", () => {
    let session = approveAudience(bootstrapCreateBuilderSession("Lead Magnet").session);

    processCreateBuilderTurn(
      session,
      "What problems do ADHD business owners usually have?",
    );
    const capture = processCreateBuilderTurn(
      session,
      "I think overwhelm and prioritization",
    );
    expect(capture.session.workflow.pendingFieldApproval?.questionId).toBe(
      "problem",
    );
    expect(capture.reply).toMatch(/problem is/i);
    expect(capture.reply).toMatch(/Would you like me to use that/i);
  });
});
