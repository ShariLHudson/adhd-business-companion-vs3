import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  bootstrapCreateBuilderFromWorkflow,
  isAffirmative,
  processCreateBuilderTurn,
  resolveBuilderType,
} from "./createBuilderChat";
import { advanceAfterItemPick, advanceAfterTypePick, advanceToDiscovery } from "./createWorkflow";

describe("createBuilderChat", () => {
  it("resolves strategy and SOP from user text", () => {
    expect(resolveBuilderType("I need an SOP")).toBe("SOP");
    expect(resolveBuilderType("marketing strategy")).toBe("Marketing Strategy");
    expect(resolveBuilderType("business strategy")).toBe("Business Strategy");
  });

  it("opens SOP builder with first question", () => {
    const { session, opener } = bootstrapCreateBuilderSession("SOP");
    expect(session.phase).toBe("discovery");
    expect(opener).toContain("SOP Builder");
    expect(opener).toContain("What process are we documenting?");
  });

  it("walks discovery one question at a time then asks to create draft", () => {
    let { session } = bootstrapCreateBuilderSession("SOP");
    const answers = [
      "ElevenLabs video export",
      "Video editor",
      "New client deliverable due",
      "Open the project template",
      "Export at 1080p and upload",
      "ElevenLabs app and Google Drive",
      "File uploaded and client notified",
    ];
    let reply = "";
    for (const a of answers) {
      const turn = processCreateBuilderTurn(session, a);
      session = turn.session;
      reply = turn.reply;
    }
    expect(session.phase).toBe("readiness");
    expect(reply).toContain("Would you like me to create the draft");

    const approved = processCreateBuilderTurn(session, "Build Draft");
    expect(approved.generateBrief).toContain("ElevenLabs");
    expect(approved.generateType).toBe("SOP");
  });

  it("detects affirmative approval", () => {
    expect(isAffirmative("yes")).toBe(true);
    expect(isAffirmative("go ahead")).toBe(true);
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
