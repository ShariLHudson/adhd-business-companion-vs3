import { describe, expect, it } from "vitest";
import { hasLeadingExplicitNavigationVerb } from "./explicitNavigationVerb";

describe("hasLeadingExplicitNavigationVerb", () => {
  it.each([
    "go to projects",
    "Go to Create",
    "take me to the Coffee House",
    "Take me Clear My Mind",
    "bring me to the Conservatory",
    "open Create",
    "Open Plan My Day",
    "show me Projects",
    "show the Evidence Vault",
    "enter the Conservatory",
    "please open Create",
    "can you take me to the Library",
    "go create", // first verb is go — destination first
  ])("true — %s", (text) => {
    expect(hasLeadingExplicitNavigationVerb(text)).toBe(true);
  });

  it.each([
    "Help me create an SOP",
    "I want to create a project",
    "Take a Moment",
    "Take a deep breath",
    "Research AI tools",
    "I'm overwhelmed",
    "create a project for me",
    "I need to go to projects later", // first verb is need, not go
  ])("false — %s", (text) => {
    expect(hasLeadingExplicitNavigationVerb(text)).toBe(false);
  });

  it("wins over later create/write language in the same utterance", () => {
    expect(
      hasLeadingExplicitNavigationVerb(
        "Open Create and help me write an SOP",
      ),
    ).toBe(true);
    expect(
      hasLeadingExplicitNavigationVerb(
        "Go to Create and draft an email",
      ),
    ).toBe(true);
  });
});
