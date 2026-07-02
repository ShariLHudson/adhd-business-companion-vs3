import { describe, expect, it } from "vitest";

import { buildCompanionSystemPrompt } from "@/lib/companionPrompt";
import {
  buildMemberTonePreferenceBlocks,
  CONVERSATION_STYLE_MAY_BECOME,
  FORBIDDEN_TONE_PERSONAS,
  hintPreservesShariIdentity,
  memberTonePreferenceHintForChat,
  SHARI_DELIVERY_SCENARIOS,
  SHARI_IDENTITY_TRAITS,
  SPARK_IDENTITY_HIERARCHY,
  THE_IMMUTABLE_FRIEND_GUARDRAIL,
  TONE_DELIVERY_MAY_CHANGE,
  TONE_DELIVERY_NEVER_CHANGES,
  TONE_PREFERENCE_FOUNDATION,
  toneDeliveryProfilePrefs,
  tonePreferenceOverridesRoutingGuidance,
} from "@/lib/companionTonePreferences";

describe("The Immutable Friend — constitutional guardrails", () => {
  it("defines the three-level identity hierarchy", () => {
    expect(SPARK_IDENTITY_HIERARCHY.who.identity).toBe("Shari");
    expect(SPARK_IDENTITY_HIERARCHY.how.scope).toBe("Conversation Style");
    expect(SPARK_IDENTITY_HIERARCHY.today.scope).toBe("Today's Reality");
    expect(SPARK_IDENTITY_HIERARCHY.how.note).toMatch(/delivery only/i);
    expect(SPARK_IDENTITY_HIERARCHY.today.note).toMatch(/never changes who Spark is/i);
  });

  it("lists delivery postures and forbidden personas", () => {
    expect(CONVERSATION_STYLE_MAY_BECOME).toContain("more listening");
    expect(FORBIDDEN_TONE_PERSONAS).toContain("therapist");
    expect(FORBIDDEN_TONE_PERSONAS).toContain("productivity robot");
    expect(FORBIDDEN_TONE_PERSONAS).toContain("generic AI assistant");
  });

  it("guardrail states relationship wins on conflict", () => {
    expect(THE_IMMUTABLE_FRIEND_GUARDRAIL).toMatch(
      /The Friend We All Deserve™ is highest authority/i,
    );
    expect(THE_IMMUTABLE_FRIEND_GUARDRAIL).toMatch(/relationship wins/i);
    expect(THE_IMMUTABLE_FRIEND_GUARDRAIL).toMatch(
      /Do NOT change Conversation Style based on Today's Reality/i,
    );
  });

  it("buildMemberTonePreferenceBlocks prepends constitutional guardrail first", () => {
    const blocks = buildMemberTonePreferenceBlocks({
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "balanced",
    });
    expect(blocks[0]).toBe(THE_IMMUTABLE_FRIEND_GUARDRAIL);
    expect(blocks[1]).toBe(TONE_PREFERENCE_FOUNDATION);
  });
});

describe("Conversation Style — recognizably Shari in every delivery", () => {
  it.each(SHARI_DELIVERY_SCENARIOS)(
    "$id preserves Shari identity — only delivery changes",
    ({ prefs }) => {
      const hint = memberTonePreferenceHintForChat(prefs);
      expect(hintPreservesShariIdentity(hint)).toBe(true);

      for (const trait of SHARI_IDENTITY_TRAITS) {
        if (trait === "trusted friend") {
          expect(hint.toLowerCase()).toMatch(/trusted[- ]friend/);
        } else {
          expect(hint.toLowerCase()).toContain(trait);
        }
      }

      for (const may of TONE_DELIVERY_MAY_CHANGE) {
        expect(THE_IMMUTABLE_FRIEND_GUARDRAIL.toLowerCase()).toContain(may);
      }

      for (const never of TONE_DELIVERY_NEVER_CHANGES) {
        expect(THE_IMMUTABLE_FRIEND_GUARDRAIL).toContain(never);
      }
    },
  );

  it("gentle prioritizes safety without becoming a therapist", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "gentle")!.prefs,
    );
    expect(hint).toMatch(/GENTLE/i);
    expect(hint).toMatch(/validate|safety|pressure/i);
    expect(hint).toMatch(/therapist/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("balanced stays trusted-partner Shari, not generic AI", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "balanced")!.prefs,
    );
    expect(hint).toMatch(/BALANCED/i);
    expect(hint).toMatch(/trusted partner/i);
    expect(hint).toMatch(/generic AI assistant/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("direct is kind truth, not executive coach or cold command", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "direct")!.prefs,
    );
    expect(hint).toMatch(/DIRECT/i);
    expect(hint).toMatch(/kindly|never cold|never harsh/i);
    expect(hint).toMatch(/executive coach/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("playful allows humor without dismissiveness or motivational-speaker energy", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "playful")!.prefs,
    );
    expect(hint).toMatch(/PLAYFUL/i);
    expect(hint).toMatch(/never dismissive/i);
    expect(hint).toMatch(/motivational speaker/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("strategic zooms out with care, not productivity-robot framing", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "strategic")!.prefs,
    );
    expect(hint).toMatch(/STRATEGIC/i);
    expect(hint).toMatch(/productivity robot|productivity bot/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("motivational encourages without toxic positivity or speaker persona", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "motivational")!.prefs,
    );
    expect(hint).toMatch(/MOTIVATIONAL/i);
    expect(hint).toMatch(/toxic positivity/i);
    expect(hint).toMatch(/motivational speaker/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("concise stays warm while shorter — not curt or robotic", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "concise")!.prefs,
    );
    expect(hint).toMatch(/CONCISE/i);
    expect(hint).toMatch(/still warm|never curt/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("listen-only offers presence, not therapist silence or advice dump", () => {
    const hint = memberTonePreferenceHintForChat(
      SHARI_DELIVERY_SCENARIOS.find((s) => s.id === "listen-only")!.prefs,
    );
    expect(hint).toMatch(/LISTEN ONLY/i);
    expect(hint).toMatch(/Do NOT give advice/i);
    expect(hint).toMatch(/unless they explicitly ask/i);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });
});

describe("companion tone preferences — integration", () => {
  const profiles = [
    "gentle-soft",
    "direct-honest",
    "humorous-light",
    "concise",
    "reflective-listening",
    "listen-only",
  ] as const;

  it.each(profiles)("profile %s includes constitutional blocks", (profile) => {
    const prefs = toneDeliveryProfilePrefs(profile);
    const hint = memberTonePreferenceHintForChat(prefs);
    expect(hint).toContain(THE_IMMUTABLE_FRIEND_GUARDRAIL);
    expect(hint).toContain(TONE_PREFERENCE_FOUNDATION);
    expect(hintPreservesShariIdentity(hint)).toBe(true);
  });

  it("buildCompanionSystemPrompt includes immutable friend guardrail", () => {
    const prefs = toneDeliveryProfilePrefs("listen-only");
    const prompt = buildCompanionSystemPrompt("today", "text", {
      aiTone: prefs.aiTone,
      helpMode: prefs.helpMode,
      supportStyle: prefs.supportStyle,
    });
    expect(prompt).toContain(THE_IMMUTABLE_FRIEND_GUARDRAIL);
    expect(prompt).toContain("LISTEN ONLY");
  });

  it("Today's Reality prompt block is level 3 member context only", () => {
    const prompt = buildCompanionSystemPrompt("today", "text", {
      dayState: "Energy: low. Motivation: dragging.",
    });
    expect(prompt).toMatch(/LEVEL 3 — TODAY'S REALITY/i);
    expect(prompt).toMatch(/never changes who Spark is/i);
    expect(prompt).toMatch(
      /Do NOT change Conversation Style based on Today's Reality/i,
    );
  });

  it("voice turns still receive constitutional tone blocks", () => {
    const prefs = toneDeliveryProfilePrefs("concise");
    const prompt = buildCompanionSystemPrompt("today", "voice", {
      aiTone: prefs.aiTone,
      helpMode: prefs.helpMode,
      supportStyle: prefs.supportStyle,
    });
    expect(prompt).toContain(THE_IMMUTABLE_FRIEND_GUARDRAIL);
    expect(prompt).toMatch(/shorter sentences/i);
  });

  it("reflective and listen profiles override aggressive routing guidance", () => {
    expect(
      tonePreferenceOverridesRoutingGuidance(
        toneDeliveryProfilePrefs("listen-only"),
      ),
    ).toBe(true);
    expect(
      tonePreferenceOverridesRoutingGuidance(
        toneDeliveryProfilePrefs("direct-honest"),
      ),
    ).toBe(false);
  });
});
