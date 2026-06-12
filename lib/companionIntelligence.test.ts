import { describe, expect, it } from "vitest";
import {
  analyzeRecurringTopics,
  buildCompanionIntelligence,
  buildThreadConnection,
  classifyProblem,
  getDiscoveryPhase,
  selectAdvisor,
} from "./companionIntelligence";

describe("companionIntelligence", () => {
  it("connects recurring inbox mentions", () => {
    const topics = analyzeRecurringTopics([
      "I'm having trouble clearing my inbox.",
      "I'm having trouble keeping it cleared.",
      "I'm feeling low and can't get started.",
    ]);
    expect(topics.find((t) => t.id === "inbox")?.mentionCount).toBeGreaterThanOrEqual(
      2,
    );
    const connection = buildThreadConnection(topics);
    expect(connection).toMatch(/inbox/i);
  });

  it("classifies organization problem from inbox thread", () => {
    const problem = classifyProblem(
      [
        "I'm having trouble clearing my inbox.",
        "I'm having trouble keeping it cleared.",
      ],
      "unclear",
      null,
    );
    expect(problem).toBe("organization");
    expect(selectAdvisor(problem)).toBe("organization_advisor");
  });

  it("runs discovery phases across three assistant turns", () => {
    const base = {
      text: "mostly energy",
      state: "unclear" as const,
      obstacle: null,
      somatic: false,
      askingHow: false,
    };

    expect(
      getDiscoveryPhase({
        ...base,
        messages: [{ role: "user", content: "I'm overwhelmed" }],
        lastAssistantText: "",
      }),
    ).toBe("issue");

    expect(
      getDiscoveryPhase({
        ...base,
        messages: [
          { role: "user", content: "I'm overwhelmed" },
          {
            role: "assistant",
            content: "What feels heaviest — too many things or one scary task?",
          },
          { role: "user", content: "Too many things" },
        ],
        lastAssistantText:
          "What feels heaviest — too many things or one scary task?",
      }),
    ).toBe("factors");

    expect(
      getDiscoveryPhase({
        ...base,
        messages: [
          { role: "user", content: "I'm stuck" },
          { role: "assistant", content: "What else is making this hard today?" },
          { role: "user", content: "Low energy" },
          {
            role: "assistant",
            content: "We could sort the pile first, or pick one tiny action.",
          },
        ],
        lastAssistantText:
          "We could sort the pile first, or pick one tiny action.",
      }),
    ).toBe("ready");
  });

  it("defers tools during discovery", () => {
    const intel = buildCompanionIntelligence({
      messages: [{ role: "user", content: "I'm bored and stuck" }],
      text: "I'm bored and stuck",
      lastAssistantText: "",
      state: "stuck",
      obstacle: null,
      somatic: false,
      askingHow: false,
    });
    expect(intel.shouldDeferTools).toBe(true);
    expect(intel.discoveryPhase).toBe("issue");
  });
});
