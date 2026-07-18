import { describe, expect, it } from "vitest";
import {
  certifyConversationalQuality,
  deliverConversationalResponse,
  detectConversationalGoal,
  stripLeadingFormulaicOpener,
  varyAgainstRecent,
} from "./index";
import { buildTalkItOutTurn, createTalkItOutSession } from "@/lib/talkItOut";
import { resetTalkItOutSessionsForTests } from "@/lib/talkItOut/sessionStore";

describe("Conversational Intelligence — variation", () => {
  it("strips stacked formulaic openers", () => {
    const raw =
      "Can I ask you something? I am curious about one part of that. Which part feels heaviest?";
    const cleaned = stripLeadingFormulaicOpener(raw);
    expect(cleaned.toLowerCase()).not.toMatch(/^can i ask you something/);
    expect(cleaned.toLowerCase()).not.toMatch(/^i am curious/);
    expect(cleaned).toMatch(/heaviest/i);
  });

  it("varies against recent assistant stems", () => {
    const recent = [
      "I am curious about one part of that. What feels unfinished?",
    ];
    const next = varyAgainstRecent(
      "I am curious about one part of that. What keeps pulling your attention?",
      recent,
    );
    expect(next.toLowerCase().startsWith("i am curious")).toBe(false);
  });
});

describe("Conversational Intelligence — goals & quality", () => {
  it("detects compare / overwhelm goals", () => {
    expect(
      detectConversationalGoal({
        userText: "I cannot decide whether to raise prices or keep them.",
        responseKind: "thoughtful-question",
      }),
    ).toBe("compare-options");
    expect(
      detectConversationalGoal({
        userText: "I am overwhelmed and everything feels like too much.",
        responseKind: "gentle-observation",
      }),
    ).toBe("untangle-ideas");
  });

  it("certifies human, non-scripted wording", () => {
    const ok = certifyConversationalQuality({
      text: "Which part of the decision feels stickiest right now?",
      userText: "I cannot decide on pricing.",
    });
    expect(ok.passed).toBe(true);

    const bad = certifyConversationalQuality({
      text: "How does that make you feel?",
      userText: "I am stuck.",
    });
    expect(bad.passed).toBe(false);
    expect(bad.failures).toContain("not-scripted");
  });
});

describe("Conversational Intelligence — delivery API", () => {
  it("delivers one natural response without formulaic stacking", () => {
    const result = deliverConversationalResponse({
      experienceId: "talk-it-out",
      draftText:
        "Can I ask you something? I am curious about one part of that. What matters most here?",
      userText: "I need to choose between two clients.",
      responseKind: "thoughtful-question",
      archetype: "business-decision",
      recentAssistantTexts: [
        "I am curious about one part of that. What feels unfinished?",
      ],
    });
    expect(result.text).toBeTruthy();
    expect((result.text.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(result.text.toLowerCase()).not.toMatch(
      /^can i ask you something\? i am curious/,
    );
    expect(result.toneBand).toBe("business");
  });

  it("wires Talk It Out through CI for everyday reflective turns", () => {
    resetTalkItOutSessionsForTests();
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "I have three client projects and I keep avoiding all of them.",
    );
    expect(turn.assistantText.length).toBeGreaterThan(12);
    expect((turn.assistantText.match(/\?/g) ?? []).length).toBeLessThanOrEqual(
      1,
    );
    expect(turn.assistantText.toLowerCase()).not.toContain(
      "how does that make you feel",
    );
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /^can i ask you something\? i am curious/,
    );
  });
});
