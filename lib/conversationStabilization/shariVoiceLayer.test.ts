/**
 * Shari Voice Layer — style delivery must change wording without changing intent.
 * Uses platform setting names: aiTone (Conversation Style) + helpMode.
 */
import { afterEach, describe, expect, it } from "vitest";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import {
  authorizeBreatheAutoOpen,
  authorizeScenicPlaceMenu,
  buildConversationDecision,
} from "./conversationDecision";
import {
  applyShariVoiceLayer,
  buildShariVoicePromptBlocks,
  loadShariVoiceProfile,
  previewStyledReply,
} from "./shariVoiceLayer";
import { endTurnDecision } from "./turnDecisionStore";

const PROJECT_OVERWHELM = "I'm overwhelmed trying to finish this project.";
const SEED =
  "I hear you. That sounds hard. What's one small step you can take? You're amazing!";

afterEach(() => {
  endTurnDecision();
});

describe("shariVoiceLayer — style delivery", () => {
  it("Gentle vs Direct produce different wording; permissions unchanged", () => {
    const decision = buildConversationDecision({ userText: PROJECT_OVERWHELM });
    expect(decision.emotionalCondition).toBe("task_breakdown");
    expect(decision.scenicMenuPermission).toBe("denied");
    expect(authorizeBreatheAutoOpen(PROJECT_OVERWHELM)).toBe(false);
    expect(authorizeScenicPlaceMenu(PROJECT_OVERWHELM)).toBe(false);

    const gentle = previewStyledReply(
      SEED,
      { aiTone: "gentle", helpMode: "ask-first", supportStyle: "balanced" },
      "task_breakdown",
    );
    const direct = previewStyledReply(
      SEED,
      { aiTone: "direct", helpMode: "direct", supportStyle: "solutions" },
      "task_breakdown",
    );

    expect(gentle.length).toBeGreaterThan(0);
    expect(direct.length).toBeGreaterThan(0);
    expect(direct).not.toBe(gentle);
    // Neither style keeps exaggerated praise.
    expect(gentle.toLowerCase()).not.toMatch(/you'?re amazing/);
    expect(direct.toLowerCase()).not.toMatch(/you'?re amazing/);
    // Direct drops the canned “one small step” prompt.
    expect(direct.toLowerCase()).not.toMatch(/one small step/);
    // Intent/permissions still denied for scenic/breathe.
    expect(decision.responseMode).toBe("ask_one_needed_question");
  });

  it("Concise Help Mode shortens explanation-style replies", () => {
    const long =
      "This setting changes how long my replies are. It keeps warmth. It also reduces extra questions. It never changes where we navigate. It is only about delivery.";
    const concise = previewStyledReply(long, {
      aiTone: "balanced",
      helpMode: "concise",
      supportStyle: "balanced",
    });
    const detailed = previewStyledReply(long, {
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "balanced",
    });
    expect(concise.length).toBeLessThan(detailed.length);
    expect(concise.split(/(?<=[.!?])\s+/).length).toBeLessThanOrEqual(2);
  });

  it("Motivational strips exaggerated praise; keeps practical seed", () => {
    const out = previewStyledReply(
      "You're amazing! Let's look at the email together when you're ready.",
      {
        aiTone: "motivational",
        helpMode: "ask-first",
        supportStyle: "balanced",
      },
    );
    expect(out.toLowerCase()).not.toMatch(/you'?re amazing/);
    expect(out.toLowerCase()).toMatch(/email/);
  });

  it("Personal update seed is not forced into workflow language by voice layer", () => {
    const out = applyShariVoiceLayer({
      text: "That sounds frustrating. I'm glad you told me.",
      userText: "The deployment is frustrating today.",
      emotionalCondition: "none",
      profileOverride: {
        aiTone: "balanced",
        helpMode: "ask-first",
        supportStyle: "balanced",
      },
      finalResponseOwner: "test",
    }).text;
    expect(out.toLowerCase()).not.toMatch(/open (?:the )?(?:library|breathing)/);
    expect(out.toLowerCase()).not.toMatch(/plan my day/);
  });

  it("Prompt blocks always include selected Conversation Style", () => {
    const blocks = buildShariVoicePromptBlocks({
      profile: {
        aiTone: "direct",
        helpMode: "concise",
        supportStyleId: "practical-first",
        supportStyleLegacy: "solutions",
        source: "request_override",
      },
      emotionalCondition: "task_breakdown",
    });
    const joined = blocks.join("\n");
    expect(joined).toMatch(/TONE — DIRECT/);
    expect(joined).toMatch(/HELP MODE — CONCISE/);
    expect(joined).toMatch(/SHARI VOICE LAYER/);
    expect(joined).toMatch(/HUMAN ADAPTATION/);
  });

  it("bypassVoiceLayer leaves legal/safety text unchanged", () => {
    const legal = "By continuing you agree to the Terms of Service.";
    const result = applyShariVoiceLayer({
      text: legal,
      bypassVoiceLayer: true,
      bypassReason: "legal",
      profileOverride: {
        aiTone: "direct",
        helpMode: "concise",
        supportStyle: "balanced",
      },
    });
    expect(result.text).toBe(legal);
    expect(result.metadata.cannedBypassAttempted).toBe(true);
  });
});

describe("shariVoiceLayer — settings path", () => {
  afterEach(() => {
    endTurnDecision();
  });

  it("request override is what the API voice layer uses (no silent default overwrite)", () => {
    const profile = loadShariVoiceProfile({
      aiTone: "direct",
      helpMode: "concise",
      supportStyle: "solutions",
      supportStyleId: "practical-first",
    });
    expect(profile.aiTone).toBe("direct");
    expect(profile.helpMode).toBe("concise");
    expect(profile.source).toBe("request_override");

    const again = loadShariVoiceProfile({
      aiTone: "direct",
      helpMode: "concise",
      supportStyle: "solutions",
    });
    expect(again.aiTone).toBe("direct");
    expect(again.helpMode).toBe("concise");
  });

  it("localStorage prefs round-trip when storage is available", () => {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    const key = "companion-prefs-v1";
    const prior = window.localStorage.getItem(key);
    try {
      savePrefs({ aiTone: "playful", helpMode: "navigate" });
      const stored = getPrefs();
      expect(stored.aiTone).toBe("playful");
      expect(stored.helpMode).toBe("navigate");
      const profile = loadShariVoiceProfile();
      expect(profile.aiTone).toBe("playful");
      expect(profile.helpMode).toBe("navigate");
    } finally {
      if (prior == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, prior);
    }
  });
});
