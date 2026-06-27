import { describe, expect, it } from "vitest";
import { evaluateCompanionPresence } from "./evaluateCompanionPresence";
import { homeStatePresenceMapping } from "./homeStateToPresence";
import { workspacePresenceMapping } from "./sectionToPhotoContext";
import { companionThinkingMessage } from "./thinkingCopy";

describe("evaluateCompanionPresence", () => {
  it("maps first visit home to warm welcome without rotation", () => {
    const result = evaluateCompanionPresence({
      calmHome: true,
      homeState: "FIRST_VISIT",
    });
    expect(result.photoContext).toBe("welcome");
    expect(result.expression).toBe("warm_welcome");
    expect(result.rotate).toBe(false);
  });

  it("rotates gently for returning active home", () => {
    const result = evaluateCompanionPresence({
      calmHome: true,
      homeState: "RETURNING_ACTIVE",
    });
    expect(result.rotate).toBe(true);
    expect(result.expression).toBe("thoughtful");
  });

  it("freezes rotation while thinking", () => {
    const result = evaluateCompanionPresence({
      calmHome: true,
      homeState: "RETURNING_ACTIVE",
      isThinking: true,
    });
    expect(result.animationState).toBe("thinking");
    expect(result.rotate).toBe(false);
    expect(result.thinkingMessage).toBeTruthy();
  });

  it("prefers recognition shari state", () => {
    const result = evaluateCompanionPresence({
      recognitionMoment: {
        type: "birthday",
        shariState: "birthday",
      } as never,
    });
    expect(result.shariImageState).toBe("birthday");
    expect(result.expression).toBe("celebrating");
  });

  it("maps brain dump workspace to listening", () => {
    const mapping = workspacePresenceMapping("brain-dump");
    expect(mapping?.expression).toBe("listening");
    expect(mapping?.photoContext).toBe("reflection");
  });

  it("maps recovery to calm reassurance via organic state", () => {
    const result = evaluateCompanionPresence({
      recoveryLevel: "depleted",
      emotion: "overwhelmed",
    });
    expect(result.shariImageState).toBe("recovery");
    expect(result.expression).toBe("calm_reassurance");
  });

  it("uses compact mode for slim headers", () => {
    const result = evaluateCompanionPresence({ compact: true });
    expect(result.shariImageState).toBe("default");
    expect(result.rotate).toBe(false);
  });

  it("routes clear my mind journey through dedicated presence", () => {
    const result = evaluateCompanionPresence({
      clearMyMindPhase: "listening",
    });
    expect(result.expression).toBe("listening");
    expect(result.reason).toBe("clear-my-mind:listening");
  });
});

describe("homeStatePresenceMapping", () => {
  it("quiet presence stays still", () => {
    const home = homeStatePresenceMapping("QUIET_PRESENCE");
    expect(home.expression).toBe("quiet_presence");
    expect(home.rotate).toBe(false);
  });
});

describe("companionThinkingMessage", () => {
  it("returns a quiet thinking line", () => {
    expect(companionThinkingMessage(0)).toMatch(/second|moment|shared/i);
    expect(companionThinkingMessage(0)).not.toMatch(/^Thinking/i);
  });
});
