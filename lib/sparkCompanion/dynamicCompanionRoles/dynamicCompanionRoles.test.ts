import { describe, expect, it } from "vitest";
import { evaluateCompanionRole } from "./evaluateCompanionRole";
import { dynamicCompanionRoleHintForChat } from "./dynamicCompanionRoleHintForChat";
import { COMPANION_ROLE_GOVERNING_QUESTION } from "./types";

describe("dynamicCompanionRoles", () => {
  it("Create & Do for help me write an SOP", () => {
    const d = evaluateCompanionRole({ userText: "Help me write an SOP" });
    expect(d.role).toBe("create_do");
    expect(d.assumeCompetence).toBe(true);
  });

  it("Support & Restore for overwhelm", () => {
    const d = evaluateCompanionRole({ userText: "I'm overwhelmed" });
    expect(d.role).toBe("support_restore");
  });

  it("Think & Decide for stuck between options", () => {
    const d = evaluateCompanionRole({
      userText: "I'm stuck between three business ideas",
    });
    expect(d.role).toBe("think_decide");
  });

  it("does not use Support for clear newsletter task", () => {
    expect(evaluateCompanionRole({ userText: "Write a newsletter" }).role).toBe(
      "create_do",
    );
  });

  it("does not use Create for overwhelm", () => {
    expect(
      evaluateCompanionRole({ userText: "I'm overwhelmed" }).role,
    ).not.toBe("create_do");
  });

  it("switches from create to support on harder than expected", () => {
    const d = evaluateCompanionRole({
      userText: "This is harder than I expected",
      previousRole: "create_do",
    });
    expect(d.role).toBe("support_restore");
  });

  it("task with friction favors support", () => {
    const d = evaluateCompanionRole({
      userText: "Help me write an SOP but I'm overwhelmed",
    });
    expect(d.role).toBe("support_restore");
  });

  it("hint includes governing question", () => {
    const hint = dynamicCompanionRoleHintForChat({
      userText: "Help me create a proposal",
    });
    expect(hint).toContain(COMPANION_ROLE_GOVERNING_QUESTION);
    expect(hint).toContain("Create & Do");
  });

  it("Discover & Learn for teach me about pricing", () => {
    expect(
      evaluateCompanionRole({ userText: "Teach me about pricing" }).role,
    ).toBe("discover_learn");
  });

  it("Discover & Learn for business model canvas explain", () => {
    expect(
      evaluateCompanionRole({
        userText: "How does a business model canvas work?",
      }).role,
    ).toBe("discover_learn");
  });

  it("Discover & Learn for estate tour", () => {
    expect(
      evaluateCompanionRole({
        userText: "Show me everything the Estate can do",
      }).role,
    ).toBe("discover_learn");
  });

  it("Discover & Learn for visual thinking models", () => {
    expect(
      evaluateCompanionRole({
        userText: "What visual thinking models do you have?",
      }).role,
    ).toBe("discover_learn");
  });

  it("Create & Do still wins for research competitors", () => {
    expect(
      evaluateCompanionRole({ userText: "Research competitors for my offer" })
        .role,
    ).toBe("create_do");
  });
});
