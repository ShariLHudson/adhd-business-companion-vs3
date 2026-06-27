import { describe, expect, it } from "vitest";
import {
  buildAffirmativeWorkspaceTransition,
  buildWorkspaceOpenedTransition,
  buildWorkspaceOpeningTransition,
  workspaceTransitionThinkingLine,
  WORKSPACE_TRANSITION_THINKING_LINES,
} from "./actionTransition";
import { containsForbiddenSystemTransitionPhrase } from "./forbiddenPatterns";

describe("Action Transition", () => {
  it("uses constitutional visible thinking lines", () => {
    expect(WORKSPACE_TRANSITION_THINKING_LINES).toContain(
      "Getting one small workspace ready.",
    );
    expect(workspaceTransitionThinkingLine(0)).toBe(
      "Getting one small workspace ready.",
    );
  });

  it("never uses mechanical beside-us system copy on open", () => {
    const copy = buildWorkspaceOpenedTransition("visual-focus");
    expect(copy).not.toMatch(/is open beside us/i);
    expect(copy).not.toMatch(/opening \*\*/i);
    expect(copy).toMatch(/still here|begin/i);
  });

  it("affirmative yes rule produces warm acknowledgment", () => {
    const copy = buildAffirmativeWorkspaceTransition("visual-focus");
    expect(copy).toMatch(/perfect|easier|sounds good|try this together/i);
    expect(copy).toMatch(/compete for your attention|begin/i);
    expect(copy).not.toMatch(/is open beside us/i);
  });

  it("opening phase reassures conversation continues", () => {
    const copy = buildWorkspaceOpeningTransition("plan-my-day", {
      isAffirmative: true,
    });
    expect(copy).toMatch(/stay right here/i);
    expect(copy).toMatch(/not leaving our conversation/i);
    expect(copy).not.toMatch(/is open beside us/i);
  });

  it("my-thoughts view uses gentle pick-one presence", () => {
    const copy = buildAffirmativeWorkspaceTransition("brain-dump", {
      view: "my-thoughts",
    });
    expect(copy).toMatch(/doable|smallest honest start/i);
  });

  it("flags forbidden system transition phrases", () => {
    expect(
      containsForbiddenSystemTransitionPhrase(
        "**Documents** is open beside us.",
      ),
    ).toBeTruthy();
    expect(containsForbiddenSystemTransitionPhrase("Perfect. I'm still here.")).toBeNull();
  });
});
