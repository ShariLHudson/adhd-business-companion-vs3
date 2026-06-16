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

    const approved = processCreateBuilderTurn(session, "Create Draft");
    expect(approved.generateBrief).toContain("ElevenLabs");
    expect(approved.generateType).toBe("SOP");
  });

  it("detects affirmative approval", () => {
    expect(isAffirmative("yes")).toBe(true);
    expect(isAffirmative("go ahead")).toBe(true);
    expect(isAffirmative("maybe later")).toBe(false);
  });

  it("branches strategy questions after kind is chosen", () => {
    let { session } = bootstrapCreateBuilderSession("Strategy");
    const kind = processCreateBuilderTurn(session, "Personal Companion strategy");
    session = kind.session;
    expect(kind.reply).toContain("Got it");
    const next = processCreateBuilderTurn(
      session,
      "Staying focused during admin work",
    );
    expect(next.reply.length).toBeGreaterThan(5);
  });
});
