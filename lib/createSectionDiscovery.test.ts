import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  processCreateBuilderTurn,
} from "./createBuilderChat";
import { buildDiscoveryWorkspaceView } from "./createDiscoveryWorkspace";
import {
  formatIncompleteSectionsPrompt,
  incompleteTemplateSections,
  isDiscoveryHelpRequest,
  materializeDiscoverySections,
  prepareDiscoveryHelpContext,
  tryResolveSectionOptionApproval,
} from "./createSectionDiscovery";
import { advanceAfterItemPick } from "./createWorkflow";

function answerDiscoveryWithApproval(
  session: ReturnType<typeof bootstrapCreateBuilderSession>["session"],
  answer: string,
) {
  let turn = processCreateBuilderTurn(session, answer);
  if (turn.session.workflow.pendingFieldApproval) {
    turn = processCreateBuilderTurn(turn.session, "yes");
  }
  return { session: turn.session, reply: turn.reply };
}

describe("createSectionDiscovery", () => {
  it("detects Discovery Help requests", () => {
    expect(isDiscoveryHelpRequest("help me create a subject line")).toBe(true);
    expect(isDiscoveryHelpRequest("what should the subject line be")).toBe(true);
    expect(isDiscoveryHelpRequest("give me options")).toBe(true);
    expect(isDiscoveryHelpRequest("I don't know")).toBe(true);
    expect(isDiscoveryHelpRequest("not sure")).toBe(true);
    expect(isDiscoveryHelpRequest("you decide")).toBe(true);
    expect(isDiscoveryHelpRequest("ADHD founders on my list")).toBe(false);
  });

  it("materializes newsletter discovery answers into outline sections", () => {
    let wf = {
      ...advanceAfterItemPick("Newsletter"),
      questionMode: "split_screen" as const,
      discoveryAnswers: {
        reader: "ADHD founders",
        theme: "Perfectionism traps",
      },
    };
    wf = materializeDiscoverySections("Newsletter", wf);
    const view = buildDiscoveryWorkspaceView(wf);
    expect(view!.templateSections.find((s) => s.id === "opening")?.content).toBe(
      "ADHD founders",
    );
    expect(view!.templateSections.find((s) => s.id === "opening")?.status).toBe(
      "filled",
    );
    expect(view!.templateSections.find((s) => s.id === "main")?.content).toContain(
      "Perfectionism",
    );
  });

  it("Newsletter stays in discovery after initial questions when sections remain", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    const answers = [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ];
    let lastReply = "";
    for (const answer of answers) {
      const result = answerDiscoveryWithApproval(session, answer);
      session = result.session;
      lastReply = result.reply;
    }

    expect(session.phase).toBe("discovery");
    expect(session.workflow.discoverySubphase).toBe("sections");
    expect(lastReply).toContain(
      "You can choose a section from the workspace",
    );
    const view = buildDiscoveryWorkspaceView(session.workflow);
    expect(view!.templateSections.find((s) => s.id === "opening")?.status).toBe(
      "filled",
    );
    expect(view!.templateSections.find((s) => s.id === "cta")?.status).toBe(
      "filled",
    );
    expect(view!.templateSections.find((s) => s.id === "subject")?.status).toBe(
      "empty",
    );
  });

  it("does not save I don't know as section content", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerDiscoveryWithApproval(session, answer).session;
    }

    session = {
      ...session,
      workflow: {
        ...session.workflow,
        activeSectionId: "subject",
      },
    };

    const turn = processCreateBuilderTurn(session, "I don't know");
    expect(turn.reply).toBe("");
    expect(turn.session.workflow.sectionContent?.subject).toBeUndefined();
  });

  it("prepareDiscoveryHelpContext sets active section from assistant prompt", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerDiscoveryWithApproval(session, answer).session;
    }

    const help = prepareDiscoveryHelpContext(
      session,
      "I don't know",
      "What would you like the subject line to be?",
    );
    expect(help.workflow.activeSectionId).toBe("subject");
  });

  it("does not save Discovery Help text as section content", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerDiscoveryWithApproval(session, answer).session;
    }

    const turn = processCreateBuilderTurn(
      session,
      "help me create a subject line",
    );
    expect(turn.reply).toBe("");
    expect(turn.session.workflow.sectionContent?.subject).toBeUndefined();
    expect(turn.session.workflow.activeSectionId).not.toBe("subject");
  });

  it("prepareDiscoveryHelpContext sets active section from help request", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerDiscoveryWithApproval(session, answer).session;
    }

    const help = prepareDiscoveryHelpContext(
      session,
      "help me create a subject line",
    );
    expect(help.workflow.activeSectionId).toBe("subject");
  });

  it("collects section content before readiness", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerDiscoveryWithApproval(session, answer).session;
    }

    let turn = processCreateBuilderTurn(session, "Helpful Tip");
    expect(turn.session.workflow.activeSectionId).toBe("tip");
    expect(turn.reply).toContain("Helpful Tip");

    turn = processCreateBuilderTurn(
      turn.session,
      "The 5-minute rule — start with just five minutes",
    );
    expect(turn.session.workflow.pendingFieldApproval).toBeTruthy();
    turn = processCreateBuilderTurn(turn.session, "yes");
    expect(turn.session.phase).toBe("discovery");
    expect(turn.session.workflow.sectionContent?.tip).toContain("5-minute");
    expect(turn.reply).toContain("Done — I added");
    expect(turn.reply).toContain("Helpful Tip");
    expect(turn.reply).toContain(
      "You can choose a section from the workspace",
    );
  });

  it("applies numbered option approval to active section", () => {
    const wf = {
      ...advanceAfterItemPick("Newsletter"),
      questionMode: "split_screen" as const,
      discoverySubphase: "sections" as const,
      activeSectionId: "subject",
      pendingSectionOptions: [
        "Stop waiting for perfect",
        "Perfectionism is a trap",
        "Done beats perfect",
      ],
    };
    const pick = tryResolveSectionOptionApproval("use 2", wf);
    expect(pick?.value).toBe("Perfectionism is a trap");

    let { session } = bootstrapCreateBuilderSession("Newsletter");
    session = {
      ...session,
      workflow: wf,
      phase: "discovery",
    };
    const turn = processCreateBuilderTurn(
      session,
      "use 2",
      "1. Stop waiting for perfect\n2. Perfectionism is a trap\n3. Done beats perfect",
    );
    expect(turn.session.workflow.pendingFieldApproval?.summary).toBe(
      "Perfectionism is a trap",
    );
    const approved = processCreateBuilderTurn(turn.session, "yes");
    expect(approved.session.workflow.sectionContent?.subject).toBe(
      "Perfectionism is a trap",
    );
    expect(approved.reply).toContain("Done — I added");
  });

  it("applies use #2 option approval", () => {
    const wf = {
      ...advanceAfterItemPick("Newsletter"),
      questionMode: "split_screen" as const,
      discoverySubphase: "sections" as const,
      activeSectionId: "subject",
      pendingSectionOptions: [
        "Stop waiting for perfect",
        "Perfectionism is a trap",
        "Done beats perfect",
      ],
    };
    const pick = tryResolveSectionOptionApproval("use #2", wf);
    expect(pick?.value).toBe("Perfectionism is a trap");
  });

  it("allows explicit build approval with open sections", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "Perfectionism traps",
      "ADHD founders",
      "Educate and nurture",
      "Done beats perfect",
      "Reply with your biggest struggle",
    ]) {
      session = answerDiscoveryWithApproval(session, answer).session;
    }

    const turn = processCreateBuilderTurn(session, "good enough");
    expect(turn.session.phase).toBe("readiness");
  });

  it("lists incomplete workshop sections after initial questions", () => {
    const wf = {
      ...advanceAfterItemPick("Workshop"),
      questionMode: "split_screen" as const,
      discoverySubphase: "sections" as const,
      discoveryAnswers: {
        topic: "ADHD productivity",
        audience: "Solo founders",
        outcome: "Leave with a plan",
        duration: "90 minutes",
        deliverables: "Slides and workbook",
      },
    };
    const materialized = materializeDiscoverySections("Workshop", wf);
    const incomplete = incompleteTemplateSections(materialized);
    const labels = incomplete.map((s) => s.label);
    expect(labels).toContain("Activities");
    expect(labels).toContain("Closing & Next Steps");
    expect(formatIncompleteSectionsPrompt(incomplete)).toContain("Activities");
    expect(
      formatIncompleteSectionsPrompt(incomplete, { workspacePanelVisible: true }),
    ).toBe(
      "You can choose a section from the workspace, or tell me what you want to change.",
    );
  });
});
