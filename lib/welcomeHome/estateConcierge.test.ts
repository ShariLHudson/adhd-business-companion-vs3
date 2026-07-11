import { describe, expect, it } from "vitest";
import {
  evaluateWelcomeHomeConcierge,
  welcomeHomeConciergeHintForChat,
} from "./estateConcierge";

describe("Welcome Home Estate Concierge", () => {
  it("routes overwhelmed to Momentum Builder through estate layer", () => {
    const evaluation = evaluateWelcomeHomeConcierge({
      userText: "I'm overwhelmed",
      activeSection: "home",
      overwhelmed: true,
    });
    expect(evaluation.estate.bestMatch?.entry.id).toBe("momentum-builder");
    expect(evaluation.routerMode.mode).toMatch(/guide_to_room|journey_latent/);
  });

  it("emits concierge mandate with estate invitation for peaceful place", () => {
    const evaluation = evaluateWelcomeHomeConcierge({
      userText: "What is a peaceful place?",
      activeSection: "home",
    });
    const hint = welcomeHomeConciergeHintForChat(evaluation);
    expect(hint).toContain("WELCOME HOME ESTATE CONCIERGE");
    expect(hint).toContain("ESTATE INTELLIGENCE");
    expect(hint).toContain("Peaceful Places");
    expect(hint).toMatch(/go there with me|take us there/i);
  });

  it("matches workshop creation to Creative Studio", () => {
    const evaluation = evaluateWelcomeHomeConcierge({
      userText: "I need help creating a workshop",
      activeSection: "home",
    });
    expect(evaluation.estate.bestMatch?.entry.id).toBe("creative-studio");
  });

  it("matches peaceful music to Peaceful Places", () => {
    const evaluation = evaluateWelcomeHomeConcierge({
      userText: "I need peaceful music",
      activeSection: "home",
    });
    expect(evaluation.estate.bestMatch?.entry.id).toBe("peaceful-places");
  });
});
