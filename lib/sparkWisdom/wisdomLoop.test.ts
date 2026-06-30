import { describe, expect, it } from "vitest";
import { runWisdomLoop } from "./wisdomLoop";
import { assessMemberNeed } from "./memberNeed";
import { recommendGentleChallenge } from "./gentleChallenge";
import { recognizeWorkspaceOpportunity } from "./opportunityRecognition";

describe("runWisdomLoop (Spec 130)", () => {
  it("prioritizes clarification over literal SOP answer", () => {
    const result = runWisdomLoop({
      memberMessage: "I need an SOP.",
      messageHistory: [],
    });
    expect(result.memberNeed.primary).toBe("clarification");
    expect(result.hiddenIntentSummary).toMatch(/SOP/i);
    expect(result.promptHint).toMatch(/Wisdom changes outcomes/i);
    expect(result.outcomeDiscovery.hopedSuccess).toMatch(/without you/i);
    expect(result.promptHint).toMatch(/HIDDEN INTENT ACTIVE/i);
    expect(result.promptHint).toMatch(/OUTCOME DISCOVERY/i);
    expect(result.promptHint).toMatch(/Do NOT output outlines/i);
  });

  it("detects marketing hidden intent", () => {
    const result = runWisdomLoop({
      memberMessage: "I need marketing help.",
      messageHistory: [],
    });
    expect(result.hiddenIntentSummary).toMatch(/different/i);
  });

  it("suggests gentle challenge for website-first assumption", () => {
    const challenge = recommendGentleChallenge("I think I need a website first.");
    expect(challenge).not.toBeNull();
    expect(challenge?.permissionPhrase).toMatch(/perspective/i);
  });

  it("recognizes Client Avatar opportunity", () => {
    const opp = recognizeWorkspaceOpportunity("I'm still figuring out my ideal client.");
    expect(opp?.workspace).toBe("client_avatar");
  });

  it("classifies encouragement when overwhelmed", () => {
    const need = assessMemberNeed("I'm overwhelmed and can't start.");
    expect(need.primary).toBe("encouragement");
  });

  it("prioritizes emotional blocker exploration over timers for procrastination", () => {
    const result = runWisdomLoop({
      memberMessage: "I've been procrastinating on my taxes.",
      messageHistory: [],
    });
    expect(result.emotionalBlocker?.depth).toBe("explore");
    expect(result.opportunity).toBeNull();
    expect(result.promptHint).toMatch(/EMOTIONAL BLOCKER ACTIVE/i);
    expect(result.promptHint).toMatch(/Do NOT suggest focus sessions/i);
    expect(result.promptHint).toMatch(/Curiosity first/i);
  });

  it("honors explicit timer requests without emotional blocker mode", () => {
    const result = runWisdomLoop({
      memberMessage: "Start a 25 minute timer for writing.",
      messageHistory: [],
    });
    expect(result.emotionalBlocker).toBeNull();
  });

  it("includes wisdom loop guidance in prompt hint", () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Turn ${i}`,
    }));
    const result = runWisdomLoop({
      memberMessage: "I need pricing help.",
      messageHistory: history,
    });
    expect(result.promptHint).toMatch(/What would help this member most/i);
    expect(result.insight?.due).toBe(true);
  });
});
