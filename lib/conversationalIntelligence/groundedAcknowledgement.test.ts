import { describe, expect, it } from "vitest";
import {
  applyGroundedAcknowledgement,
  buildGroundedFallback,
  certifyGroundedAcknowledgement,
  hasVaguePronounOpen,
  isGenericAcknowledgement,
  isUserWordingEcho,
} from "./groundedAcknowledgement";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";
import { beforeEach } from "vitest";

describe("Package 191 — grounded acknowledgement", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("blocks generic acknowledgements", () => {
    const blocked = [
      "That seems important.",
      "That sounds difficult.",
      "I am with you.",
      "That seems like an important part of this.",
      "What else wants to be said?",
    ];
    for (const line of blocked) {
      const cert = certifyGroundedAcknowledgement({
        text: line,
        userText: "If I should hire a marketing person or not.",
      });
      expect(cert.passed, line).toBe(false);
      expect(
        cert.failures.some((f) =>
          [
            "GENERIC_ACKNOWLEDGEMENT",
            "VAGUE_PRONOUN",
            "UNRELATED_NEXT_QUESTION",
            "MISSING_TOPIC_REFERENCE",
          ].includes(f),
        ),
        line,
      ).toBe(true);
      expect(isGenericAcknowledgement(line) || hasVaguePronounOpen(line) || /wants to be said/i.test(line)).toBe(
        true,
      );
    }
  });

  it("blocks vague pronouns without a clear noun", () => {
    expect(hasVaguePronounOpen("That seems like an important part of this.")).toBe(
      true,
    );
    expect(hasVaguePronounOpen("This is hard.")).toBe(true);
    expect(hasVaguePronounOpen("It feels unclear.")).toBe(true);
    expect(
      hasVaguePronounOpen(
        "The timing of hiring a marketing person seems important.",
      ),
    ).toBe(false);
  });

  it("approves grounded hiring / cost / personal-work references", () => {
    const good = [
      "You are trying to decide whether bringing in marketing help would be worth the investment right now. What is making you consider it at this point?",
      "You are weighing the cost of hiring someone against doing the work yourself. Which side feels harder to judge?",
      "Deciding whether to hire someone for marketing is a significant step. What would you hope they would take off your plate?",
    ];
    for (const text of good) {
      const cert = certifyGroundedAcknowledgement({
        text,
        userText: "If I should hire a marketing person or not.",
      });
      expect(cert.passed, text).toBe(true);
    }
  });

  it("blocks near-verbatim echo; approves meaning-based recognition", () => {
    const user = "I do not know if I should hire a marketing person.";
    expect(
      isUserWordingEcho(
        user,
        "You do not know if you should hire a marketing person.",
      ),
    ).toBe(true);
    expect(
      isUserWordingEcho(
        user,
        "You are trying to decide whether bringing in marketing help would be the right investment at this stage.",
      ),
    ).toBe(false);
  });

  it("replaces vague CI draft with grounded fallback for hiring decision", () => {
    const result = applyGroundedAcknowledgement({
      draftText: "That seems like an important part of this.",
      userText: "If I should hire a marketing person or not.",
    });
    expect(result.usedFallback).toBe(true);
    expect(result.text.toLowerCase()).toMatch(/hir|market/);
    expect(result.text).toMatch(/\?/);
    expect(result.text.toLowerCase()).not.toContain(
      "important part of this",
    );
  });

  it("builds scenario-specific grounded fallbacks", () => {
    expect(
      buildGroundedFallback(
        "I have too many things to do and do not know where to start.",
      ).toLowerCase(),
    ).toMatch(/plate|heaviest|start|manageable/);

    expect(
      buildGroundedFallback(
        "I cannot figure out how to explain my new program.",
      ).toLowerCase(),
    ).toMatch(/explain|program/);

    expect(
      buildGroundedFallback(
        "I am not sure whether to bring this up with my client.",
      ).toLowerCase(),
    ).toMatch(/client/);
  });

  it("Talk It Out first turn names hiring/marketing and asks one grounded question", () => {
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "If I should hire a marketing person or not.",
    );
    const text = turn.assistantText;
    expect(text.toLowerCase()).toMatch(/hir|market/);
    expect(text.toLowerCase()).not.toMatch(
      /that seems like an important part of this|that seems important|what else wants to be said/,
    );
    expect((text.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(text.toLowerCase()).not.toMatch(
      /\b(?:you should|you need to|i recommend)\b/,
    );
  });

  it("Talk It Out overwhelm turn references overload or starting", () => {
    const session = createTalkItOutSession();
    appendTalkItOutMessages(session, [
      { role: "assistant", content: "What is on your mind?" },
    ]);
    const turn = buildTalkItOutTurn(
      session,
      "I have too many things to do and do not know where to start.",
    );
    expect(turn.assistantText.toLowerCase()).toMatch(
      /plate|heaviest|start|too many|overload|manageable|sitting/,
    );
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /that seems important|that sounds difficult/,
    );
  });

  it("Talk It Out creative-block turn references explaining the program", () => {
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "I cannot figure out how to explain my new program.",
    );
    expect(turn.assistantText.toLowerCase()).toMatch(/explain|program/);
  });

  it("Talk It Out client turn references the client conversation", () => {
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "I am not sure whether to bring this up with my client.",
    );
    expect(turn.assistantText.toLowerCase()).toMatch(/client/);
  });

  it("does not treat client projects as a client conversation", () => {
    const result = applyGroundedAcknowledgement({
      draftText: "That seems important.",
      userText: "I have three client projects and I keep avoiding all of them.",
    });
    expect(result.text.toLowerCase()).toMatch(/project|heaviest|begin|start/);
    expect(result.text.toLowerCase()).not.toMatch(/bring something up/);
  });
});
