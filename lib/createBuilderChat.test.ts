import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  isAffirmative,
  processCreateBuilderTurn,
  resolveBuilderType,
} from "./createBuilderChat";

describe("createBuilderChat", () => {
  it("resolves strategy and SOP from user text", () => {
    expect(resolveBuilderType("I need an SOP")).toBe("SOP");
    expect(resolveBuilderType("marketing strategy")).toBe("Strategy");
  });

  it("opens SOP builder with first question", () => {
    const { session, opener } = bootstrapCreateBuilderSession("SOP");
    expect(session.phase).toBe("discovery");
    expect(opener).toContain("SOP Builder");
    expect(opener).toContain("What process are we documenting?");
  });

  it("walks discovery one question at a time then asks to generate", () => {
    let { session } = bootstrapCreateBuilderSession("SOP");
    const answers = [
      "ElevenLabs video export",
      "Video editor",
      "New client deliverable due",
      "Open the project template",
      "Export at 1080p and upload",
    ];
    let reply = "";
    for (const a of answers) {
      const turn = processCreateBuilderTurn(session, a);
      session = turn.session;
      reply = turn.reply;
    }
    expect(session.phase).toBe("readiness");
    expect(reply).toContain("Would you like me to generate it");

    const approved = processCreateBuilderTurn(session, "yes please");
    expect(approved.generateBrief).toContain("ElevenLabs");
    expect(approved.generateType).toBe("SOP");
  });

  it("detects affirmative approval", () => {
    expect(isAffirmative("yes")).toBe(true);
    expect(isAffirmative("go ahead")).toBe(true);
    expect(isAffirmative("maybe later")).toBe(false);
  });
});
