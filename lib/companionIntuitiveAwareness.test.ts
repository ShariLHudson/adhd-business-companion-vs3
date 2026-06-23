import { describe, expect, it } from "vitest";
import {
  analyzeIntuitiveAwareness,
  intuitiveAwarenessHintForChat,
} from "./companionIntuitiveAwareness";
import { analyzeActionBias } from "./companionActionBias";
import { analyzeAdhdNativeTurn } from "./adhdNativeIntelligence";
import { analyzeMultiTurnPatterns } from "./adhdMultiTurnPatterns";

describe("companionIntuitiveAwareness", () => {
  it("detects launch avoidance beneath website tweak request", () => {
    const messages = [
      { role: "user", content: "I need to launch my coaching offer this week" },
      { role: "assistant", content: "What's first?" },
      { role: "user", content: "I just need to tweak my website first" },
    ];
    const adhdNative = analyzeAdhdNativeTurn({
      text: "I just need to tweak my website first",
      messages,
      emotionalState: "stuck",
      obstacle: null,
    });
    const multiTurn = analyzeMultiTurnPatterns({ messages });
    const actionBias = analyzeActionBias({
      messages,
      userText: "I just need to tweak my website first",
      emotionalState: "stuck",
      adhdNative,
      multiTurn,
    });
    const analysis = analyzeIntuitiveAwareness({
      messages,
      userText: "I just need to tweak my website first",
      emotionalState: "stuck",
      adhdNative,
      multiTurn,
      actionBias,
    });
    expect(analysis.signals).toContain("avoidance");
    expect(analysis.actualNeed).toBe("launch_move");
    expect(analysis.gapDetected).toBe(true);
    expect(intuitiveAwarenessHintForChat(analysis)).toMatch(/SURFACE INTENT/i);
  });

  it("detects momentum and protect_flow actual need", () => {
    const analysis = analyzeIntuitiveAwareness({
      messages: [
        { role: "user", content: "I'm on a roll writing the draft" },
      ],
      userText: "I'm on a roll writing the draft",
      emotionalState: "focused",
      actionBias: analyzeActionBias({
        messages: [],
        userText: "I'm on a roll writing the draft",
        emotionalState: "focused",
      }),
    });
    expect(analysis.signals).toContain("momentum");
    expect(analysis.actualNeed).toBe("protect_flow");
    expect(intuitiveAwarenessHintForChat(analysis)).toMatch(/Protect momentum/i);
  });

  it("detects drift and reconnect_goal for shiny object syndrome", () => {
    const messages = [
      { role: "user", content: "I'm trying to grow my coaching business" },
      { role: "user", content: "Or maybe a membership instead" },
      { role: "user", content: "What about a workshop series too?" },
      { role: "user", content: "Actually maybe I should launch a podcast" },
    ];
    const multiTurn = analyzeMultiTurnPatterns({ messages });
    const analysis = analyzeIntuitiveAwareness({
      messages,
      userText: "Can you give me more options to consider?",
      emotionalState: "unclear",
      multiTurn,
    });
    expect(analysis.signals).toContain("drift");
    expect(analysis.actualNeed).toBe("reconnect_goal");
  });
});
