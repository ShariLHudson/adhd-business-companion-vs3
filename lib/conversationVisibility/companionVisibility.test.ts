import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetConversationDisplayPrefsForTests,
  companionVisibilityAriaLabel,
  companionVisibilityLabel,
  classifyDestinationChat,
  getConversationDisplayPreference,
  isCompanionVisible,
  normalizeConversationDestinationId,
  resolveCompanionVisibility,
  setCompanionVisibility,
  setGlobalCompanionDefault,
  supportsCompanionVisibilityControl,
} from "@/lib/conversationVisibility";

describe("Companion conversation visibility", () => {
  beforeEach(() => {
    __resetConversationDisplayPrefsForTests();
  });

  it("labels use Companion: On / Off", () => {
    expect(companionVisibilityLabel("on")).toBe("Companion: On");
    expect(companionVisibilityLabel("off")).toBe("Companion: Off");
    expect(companionVisibilityAriaLabel("on")).toBe("Companion conversation on");
    expect(companionVisibilityAriaLabel("off")).toBe(
      "Companion conversation off",
    );
  });

  it("defaults controllable destinations to On", () => {
    expect(resolveCompanionVisibility("welcome-home")).toBe("on");
    expect(resolveCompanionVisibility("strategy-library")).toBe("on");
    expect(isCompanionVisible("create")).toBe(true);
  });

  it("defaults initially-hidden destinations to Off without an override", () => {
    expect(resolveCompanionVisibility("evidence-vault")).toBe("off");
    expect(resolveCompanionVisibility("journal")).toBe("off");
  });

  it("honors destination overrides and survives re-read", () => {
    setCompanionVisibility({
      visibility: "off",
      destinationId: "welcome-home",
      source: "conversation_header",
    });
    expect(resolveCompanionVisibility("welcome-home")).toBe("off");
    expect(getConversationDisplayPreference().destinationOverrides["welcome-home"]).toBe(
      "off",
    );
    setCompanionVisibility({
      visibility: "on",
      destinationId: "welcome-home",
      source: "empty_state",
    });
    expect(resolveCompanionVisibility("welcome-home")).toBe("on");
  });

  it("global default applies to controllable destinations without overrides", () => {
    setGlobalCompanionDefault("off");
    expect(resolveCompanionVisibility("strategy-library")).toBe("off");
    expect(resolveCompanionVisibility("evidence-vault")).toBe("off");
  });

  it("SET_COMPANION_VISIBILITY aborts in-flight only when turning off", () => {
    const off = setCompanionVisibility({
      visibility: "off",
      destinationId: "welcome-home",
      source: "conversation_header",
    });
    expect(off.abortInFlightResponse).toBe(true);
    expect(off.preserveConversation).toBe(true);
    expect(off.preserveSavedWork).toBe(true);

    const on = setCompanionVisibility({
      visibility: "on",
      destinationId: "welcome-home",
      source: "conversation_header",
    });
    expect(on.abortInFlightResponse).toBe(false);
  });

  it("does not treat Off as New Day or New Chat (action type)", () => {
    const result = setCompanionVisibility({
      visibility: "off",
      destinationId: "welcome-home",
      source: "conversation_header",
    });
    expect(result.preference.version).toBe(1);
    // No day/session fields mutated by this action
    expect(Object.keys(result)).not.toContain("daySessionId");
    expect(Object.keys(result)).not.toContain("newChat");
  });

  it("classifies destinations and control support", () => {
    expect(classifyDestinationChat("talk-it-out")).toBe(
      "specialized_conversation",
    );
    expect(supportsCompanionVisibilityControl("talk-it-out")).toBe(false);
    expect(supportsCompanionVisibilityControl("boardroom")).toBe(false);
    expect(supportsCompanionVisibilityControl("welcome-home")).toBe(true);
    expect(supportsCompanionVisibilityControl("journal")).toBe(false);
    expect(normalizeConversationDestinationId("playbook")).toBe(
      "strategy-library",
    );
  });

  it("Settings global default and header share the same preference source", () => {
    setCompanionVisibility({
      visibility: "off",
      destinationId: null,
      source: "settings",
      updateGlobalDefault: true,
    });
    expect(getConversationDisplayPreference().globalDefault).toBe("off");
    expect(resolveCompanionVisibility("create")).toBe("off");
  });
});
