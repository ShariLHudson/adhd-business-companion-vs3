import { describe, expect, it } from "vitest";
import {
  buildClientAvatarCoachOpenMessages,
  parseAvatarWhoAnswer,
  processClientAvatarCoachTurn,
  resolveActiveAvatarField,
  suggestAvatarTaglines,
  suggestWhoDescription,
} from "./clientAvatarCoach";

describe("clientAvatarCoach", () => {
  it("opens with step 1 prompt only", () => {
    const msgs = buildClientAvatarCoachOpenMessages();
    expect(msgs).toHaveLength(1);
    expect(msgs[0]?.content).toMatch(/who do you help/i);
    expect(msgs[0]?.content).toMatch(/simple name and quick description/i);
  });

  it("parses I help X into audience name", () => {
    expect(parseAvatarWhoAnswer("I help ADHD entrepreneurs")).toEqual({
      name: "ADHD entrepreneurs",
    });
  });

  it("fills name then asks for description", () => {
    const turn = processClientAvatarCoachTurn(
      "I help coaches, authors, and speakers",
      {
        step: "who",
        stepIndex: 0,
        building: true,
        name: "",
        who: "",
        tagline: "",
        painPoints: "",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      "",
    );
    expect(turn?.fills?.[0]?.field).toBe("avatar-name");
    expect(turn?.fills?.[0]?.value).toMatch(/coaches, authors, and speakers/);
    expect(turn?.reply).toMatch(/description/i);
    expect(turn?.focusField).toBe("avatar-who");
  });

  it("does not save description help questions into fields", () => {
    const turn = processClientAvatarCoachTurn(
      "What should the description say?",
      {
        step: "who",
        stepIndex: 0,
        building: true,
        name: "coaches, authors, and speakers",
        who: "",
        tagline: "",
        painPoints: "",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      "",
    );
    expect(turn?.fills).toBeUndefined();
    expect(turn?.reply).toMatch(/for example/i);
    expect(turn?.focusField).toBe("avatar-who");
  });

  it("applies suggested description on use that", () => {
    const suggestion = suggestWhoDescription("coaches, authors, and speakers");
    const assistant = `A good description is one sentence about who they are and what they need help with. For example: ${suggestion}. Want to use that or adjust it?`;
    const turn = processClientAvatarCoachTurn(
      "Use that.",
      {
        step: "who",
        stepIndex: 0,
        building: true,
        name: "coaches, authors, and speakers",
        who: "",
        tagline: "",
        painPoints: "",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      assistant,
    );
    expect(turn?.fills?.[0]?.field).toBe("avatar-who");
    expect(turn?.fills?.[0]?.value).toBe(suggestion);
  });

  it("resolves active field from snapshot not stale context", () => {
    expect(
      resolveActiveAvatarField({
        step: "goals",
        stepIndex: 3,
        building: true,
        name: "Coaches",
        who: "Authors and speakers",
        tagline: "Built for momentum",
        painPoints: "Overwhelm",
        goals: "",
        currentBehavior: "",
        solution: "",
      }),
    ).toBe("avatar-goals");
  });

  it("fills name then asks for description for ADHD entrepreneurs", () => {
    const turn = processClientAvatarCoachTurn(
      "I help ADHD entrepreneurs",
      {
        step: "who",
        stepIndex: 0,
        building: true,
        name: "",
        who: "",
        tagline: "",
        painPoints: "",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      "",
    );
    expect(turn?.fills?.[0]?.field).toBe("avatar-name");
    expect(turn?.reply).toMatch(/description/i);
  });

  it("offers tagline options on identity step", () => {
    const turn = processClientAvatarCoachTurn(
      "help me write a tagline",
      {
        step: "identity",
        stepIndex: 1,
        building: true,
        name: "ADHD entrepreneurs",
        who: "Founders who struggle with focus",
        tagline: "",
        painPoints: "",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      "",
    );
    expect(turn?.taglineOptions?.length).toBeGreaterThan(1);
    expect(turn?.reply).toMatch(/1\./);
  });

  it("applies chosen tagline with fill directive", () => {
    const options = suggestAvatarTaglines(
      "ADHD entrepreneurs",
      "Founders who struggle with focus",
    );
    const turn = processClientAvatarCoachTurn(
      "1",
      {
        step: "identity",
        stepIndex: 1,
        building: true,
        name: "ADHD entrepreneurs",
        who: "Founders who struggle with focus",
        tagline: "",
        painPoints: "",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      `Pick one:\n1. ${options[0]}`,
      options,
    );
    expect(turn?.fills?.[0]?.field).toBe("avatar-tagline");
    expect(turn?.reply).toMatch(/added that tagline/i);
  });
});
