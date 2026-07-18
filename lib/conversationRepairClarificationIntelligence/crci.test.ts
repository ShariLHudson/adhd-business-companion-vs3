import { beforeEach, describe, expect, it } from "vitest";
import {
  detectRepairTrigger,
  extractThoughtToClarify,
  tryConversationRepair,
} from "./index";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("CRCI — trigger detection", () => {
  it("detects common confusion phrases", () => {
    expect(detectRepairTrigger("What do you mean?")).toBe("what-do-you-mean");
    expect(detectRepairTrigger("I don't understand")).toBe("dont-understand");
    expect(detectRepairTrigger("Can you explain that?")).toBe("explain");
    expect(detectRepairTrigger("That doesn't make sense")).toBe(
      "doesnt-make-sense",
    );
    expect(detectRepairTrigger("I'm confused")).toBe("confused");
  });

  it("does not treat ordinary reflection as repair", () => {
    expect(
      detectRepairTrigger("I'm torn about whether to raise my prices."),
    ).toBeNull();
  });
});

describe("CRCI — repair sequence", () => {
  it("explains previous thought and invites correction — no new topic", () => {
    const result = tryConversationRepair({
      experienceId: "talk-it-out",
      userText: "What do you mean?",
      messages: [
        {
          role: "assistant",
          content:
            "I wonder whether the hard part is choosing — or trusting yourself after you choose.",
        },
      ],
    });
    expect(result.needsRepair).toBe(true);
    expect(result.suppressReflectiveQuestions).toBe(true);
    expect(result.assistantText).toBeTruthy();
    expect(result.assistantText!.toLowerCase()).toMatch(
      /meant|trying|explain|plain|fair question|clearly/,
    );
    expect(result.meta.invitedCorrection).toBe(true);
    expect((result.assistantText!.match(/\?/g) ?? []).length).toBeLessThanOrEqual(
      1,
    );
  });

  it("extracts a clear thought from a stacked assistant turn", () => {
    const thought = extractThoughtToClarify(
      "When everything feels equally urgent, starting is hard.\n\nWhich one would make you breathe easier?",
    );
    expect(thought.toLowerCase()).toMatch(/breathe|urgent|starting/);
  });
});

describe("CRCI — Talk It Out wiring", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("pauses reflective questioning when user is confused", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "I keep avoiding three projects.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a1",
        role: "assistant",
        content:
          "I wonder if they all feel equally urgent. Which one would make you breathe easier?",
        createdAt: new Date().toISOString(),
      },
    ]);
    const turn = buildTalkItOutTurn(session, "What do you mean?");
    expect(turn.responseKind).toBe("repair");
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /open the (chamber|boardroom)/i,
    );
    expect(turn.assistantText.toLowerCase()).toMatch(
      /meant|trying|explain|fair|clearly|land|fit/,
    );
  });
});

describe("CRCI — Talk It Out UI simplification", () => {
  it("keeps initial surface minimal — no Keep Talking / How Do I / Speak label", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/TalkItOutPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("talk-it-out-one-line");
    expect(panel).toContain("talk-it-out-composer");
    expect(panel).toContain("talk-it-out-mic");
    expect(panel).toContain("talk-it-out-progressive-controls");
    expect(panel).not.toContain("talk-it-out-keep-talking");
    expect(panel).not.toContain("talk-it-out-how-do-i-btn");
    expect(panel).not.toContain("TALK_IT_OUT_KEEP_TALKING");
    expect(panel).not.toContain("TALK_IT_OUT_HOW_DO_I");
    expect(panel).not.toMatch(/\bSpeak\b/);
    expect(panel).toContain("conversationStarted");
  });
});
