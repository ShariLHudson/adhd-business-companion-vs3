import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  bootstrapCreateBuilderFromWorkflow,
  applyCreateBuilderChatOpener,
  isAffirmative,
  processCreateBuilderTurn,
  resolveBuilderType,
  resolvedCreateTopic,
  shouldSuppressParallelCoaching,
} from "./createBuilderChat";
import { advanceAfterItemPick, advanceAfterTypePick, advanceToDiscovery } from "./createWorkflow";

describe("createBuilderChat", () => {
  it("resolves strategy and SOP from user text", () => {
    expect(resolveBuilderType("I need an SOP")).toBe("SOP");
    expect(resolveBuilderType("marketing strategy")).toBe("Marketing Strategy");
    expect(resolveBuilderType("business strategy")).toBe("Business Strategy");
    expect(resolveBuilderType("social media post")).toBe("Social Post");
    expect(resolveBuilderType("lead magnet")).toBe("Lead Magnet");
  });

  it("opens pick-type with the create kickoff question", () => {
    const { session, opener } = bootstrapCreateBuilderSession();
    expect(session.phase).toBe("pick-type");
    expect(opener).toContain("What would you like to create?");
  });

  it("opens SOP builder with first question only", () => {
    const { session, opener } = bootstrapCreateBuilderSession("SOP");
    expect(session.phase).toBe("discovery");
    expect(opener).toBe("What process are we documenting?");
  });

  it("opens Social Post with topic question first", () => {
    const { opener } = bootstrapCreateBuilderSession("Social Post");
    expect(opener).toBe("What is the post about?");
  });

  it("suppresses parallel coaching during active split-screen create", () => {
    const { session } = bootstrapCreateBuilderSession("Social Post");
    expect(shouldSuppressParallelCoaching(session, true)).toBe(true);
    const ready = { ...session, phase: "readiness" as const };
    expect(shouldSuppressParallelCoaching(ready, true)).toBe(true);
    expect(shouldSuppressParallelCoaching({ ...session, phase: "done" }, true)).toBe(
      false,
    );
    expect(shouldSuppressParallelCoaching(session, false)).toBe(false);
    expect(shouldSuppressParallelCoaching(null, true)).toBe(true);
  });

  it("resolvedCreateTopic ignores type-as-title placeholders", () => {
    expect(resolvedCreateTopic("Social Post", "Social Post", "")).toBe("");
    expect(resolvedCreateTopic("Social Post", "Draft", "")).toBe("");
    expect(resolvedCreateTopic("Social Post", "Coaches on LinkedIn", "")).toBe(
      "Coaches on LinkedIn",
    );
  });

  it("stays in discovery after first SOP answer until all questions are answered", () => {
    let { session } = bootstrapCreateBuilderSession("SOP");
    const turn = processCreateBuilderTurn(
      session,
      "ElevenLabs video export workflow",
    );
    session = turn.session;
    expect(session.phase).toBe("discovery");
    expect(turn.reply).toContain("Who performs");
  });

  it("Newsletter opens with topic question and stays Newsletter", () => {
    const { session, opener } = bootstrapCreateBuilderSession("Newsletter");
    expect(session.typeLabel).toBe("Newsletter");
    expect(session.workflow.selectedTypeLabel).toBe("Newsletter");
    expect(session.phase).toBe("discovery");
    expect(opener).toContain("Great — let's create your **Newsletter**");
    expect(opener).toContain("newsletter about");
    const turn = processCreateBuilderTurn(session, "Perfectionism traps for founders");
    expect(turn.session.phase).toBe("discovery");
    expect(turn.session.typeLabel).toBe("Newsletter");
    expect(turn.reply).toMatch(/Who is it for/i);
  });

  it("replaces generic Create picker chat when a type is selected", () => {
    const generic = [
      { role: "assistant" as const, content: "**What would you like to create?**" },
    ];
    const opener =
      "Great — let's create your **Newsletter**. What is this newsletter about?";
    expect(applyCreateBuilderChatOpener(generic, opener, { replaceAll: true })).toEqual([
      { role: "assistant", content: opener },
    ]);
  });

  it("Workshop uses default workshop template on open", () => {
    const { session } = bootstrapCreateBuilderSession("Workshop");
    expect(session.workflow.selectedTemplateId).toBe("workshop-default");
    expect(session.workflow.useTemplate).toBe(true);
  });

  it("Workshop walks discovery before readiness", () => {
    let { session } = bootstrapCreateBuilderSession("Workshop");
    expect(session.typeLabel).toBe("Workshop");
    let turn = processCreateBuilderTurn(session, "ADHD productivity for entrepreneurs");
    expect(turn.session.phase).toBe("discovery");
    expect(turn.reply).toContain("Who is it for");

    turn = processCreateBuilderTurn(turn.session, "Solo founders with ADHD");
    expect(turn.session.phase).toBe("discovery");
    expect(turn.reply).toContain("outcome");
  });

  it("walks Social Post through topic, audience, and outcome then section discovery", () => {
    let { session } = bootstrapCreateBuilderSession("Social Post");
    let turn = processCreateBuilderTurn(session, "Launch tips for coaches");
    session = turn.session;
    expect(turn.reply).toContain("Who is it for?");

    turn = processCreateBuilderTurn(session, "ADHD founders");
    session = turn.session;
    expect(turn.reply).toContain("What outcome do you want?");

    turn = processCreateBuilderTurn(session, "Engagement");
    session = turn.session;
    expect(session.phase).toBe("discovery");
    expect(session.workflow.discoverySubphase).toBe("sections");
    expect(turn.reply).toContain("sections we can strengthen");
  });

  it("detects affirmative approval", () => {
    expect(isAffirmative("yes")).toBe(true);
    expect(isAffirmative("go ahead")).toBe(true);
    expect(isAffirmative("generate it")).toBe(true);
    expect(isAffirmative("draft it")).toBe(true);
    expect(isAffirmative("maybe later")).toBe(false);
  });

  it("marks chat builder workflow as split_screen", () => {
    const { session } = bootstrapCreateBuilderSession("Video Script");
    expect(session.workflow.questionMode).toBe("split_screen");
  });

  it("starts chat discovery when panel is still on subtype step", () => {
    const { session } = bootstrapCreateBuilderFromWorkflow(
      "Video Script",
      advanceAfterItemPick("Video Script"),
    );
    expect(session.phase).toBe("discovery");
    expect(session.workflow.step).not.toBe("type");
    expect(session.workflow.questionMode).toBe("split_screen");
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
    expect(opener).not.toContain("Who is receiving");
  });
});
