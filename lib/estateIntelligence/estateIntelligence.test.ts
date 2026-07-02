import { describe, expect, it } from "vitest";
import {
  evaluateEstateIntelligence,
  estateIntelligenceHintForChat,
  matchEstateCapabilities,
  PEACEFUL_PLACES_ENTRY,
} from "./index";

describe("Estate Matcher™", () => {
  it('matches "What is a peaceful place?" to Peaceful Places™ with high confidence', () => {
    const matches = matchEstateCapabilities({
      userText: "What is a peaceful place?",
    });
    expect(matches[0]?.entry.id).toBe("peaceful-places");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches overwhelm to Momentum Builder™', () => {
    const matches = matchEstateCapabilities({ userText: "I'm overwhelmed" });
    expect(matches[0]?.entry.id).toBe("momentum-builder");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches clear thoughts to Clear My Mind™', () => {
    const matches = matchEstateCapabilities({
      userText: "I need to clear my thoughts",
    });
    expect(matches[0]?.entry.id).toBe("clear-my-mind");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches indecision to Decision Compass™', () => {
    const matches = matchEstateCapabilities({
      userText: "I can't decide what to do first.",
    });
    expect(matches[0]?.entry.id).toBe("decision-compass");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches AI research to Observatory™', () => {
    const matches = matchEstateCapabilities({
      userText: "I want to research AI",
    });
    expect(matches[0]?.entry.id).toBe("observatory");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches overwhelmed and stuck to Momentum Builder™', () => {
    const matches = matchEstateCapabilities({
      userText: "I'm overwhelmed and don't know where to start.",
    });
    expect(matches[0]?.entry.id).toBe("momentum-builder");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches workshop creation to Creative Studio™', () => {
    const matches = matchEstateCapabilities({
      userText: "Help me create a workshop",
    });
    expect(matches[0]?.entry.id).toBe("creative-studio");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches newsletter writing to Creative Studio™', () => {
    const matches = matchEstateCapabilities({
      userText: "I want to write a newsletter",
    });
    expect(matches[0]?.entry.id).toBe("creative-studio");
    expect(matches[0]?.confidence).toBe("high");
  });

  it('matches pricing learning to Momentum Institute™', () => {
    const matches = matchEstateCapabilities({
      userText: "Teach me about pricing",
    });
    expect(matches[0]?.entry.id).toBe("momentum-institute");
    expect(matches[0]?.confidence).toBe("high");
  });
});

describe("evaluateEstateIntelligence", () => {
  it("routes peaceful place questions to estate invitation, not dictionary mode", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "What is a peaceful place?",
      activeSection: "home",
    });

    expect(evaluation.bestMatch?.entry.id).toBe("peaceful-places");
    expect(evaluation.route?.primaryEntry.id).toBe(PEACEFUL_PLACES_ENTRY.id);
    expect(evaluation.route?.primarySection).toBe("focus-audio");
    expect(evaluation.route?.suppressGenericDefinition).toBe(true);
    expect(evaluation.route?.invitation).toMatch(/peaceful place|go there with me/i);
    expect(evaluation.route?.invitation).toMatch(/go there with me/i);
  });

  it("suppresses routing when member is already in the matched room", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "I'm overwhelmed",
      activeSection: "momentum-builder",
    });
    expect(evaluation.suppressed).toBe(true);
    expect(evaluation.route).toBeNull();
  });
});

describe("estateIntelligenceHintForChat", () => {
  it("emits mandatory estate-first hint for high-confidence peaceful place query", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "What is a peaceful place?",
    });
    const hint = estateIntelligenceHintForChat(evaluation);

    expect(hint).toContain("ESTATE INTELLIGENCE (mandatory");
    expect(hint).toContain("Conversation Front Door");
    expect(hint).toContain("Peaceful Places™");
    expect(hint).toContain("FORBIDDEN opening patterns");
    expect(hint).toMatch(/go there with me/i);
  });

  it("returns null when suppressed", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "I'm overwhelmed",
      activeSection: "momentum-builder",
    });
    expect(estateIntelligenceHintForChat(evaluation)).toBeNull();
  });

  it("appends Momentum Institute room knowledge for learn intent", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "Teach me about pricing psychology",
    });
    const hint = estateIntelligenceHintForChat(evaluation);

    expect(hint).toContain("ESTATE ROOM KNOWLEDGE — Momentum Institute™");
    expect(hint).toContain("Entrepreneur Development Center");
    expect(hint).toMatch(/do not invent/i);
  });
});
