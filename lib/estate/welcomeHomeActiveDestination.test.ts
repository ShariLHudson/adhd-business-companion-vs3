import { describe, expect, it } from "vitest";
import {
  welcomeHomeCategoryForDestination,
  welcomeHomeDestinationForSection,
} from "./welcomeHomeActiveDestination";

describe("welcomeHomeActiveDestination", () => {
  it("maps Plan / Adapt / Reminders runtime sections to Welcome Home destinations", () => {
    expect(welcomeHomeDestinationForSection("adapt-plan-my-day")).toBe(
      "adapt-plan-my-day",
    );
    expect(welcomeHomeDestinationForSection("plan-my-day")).toBe(
      "adapt-plan-my-day",
    );
    expect(welcomeHomeDestinationForSection("reminders-rhythms")).toBe(
      "reminders-rhythms",
    );
    expect(welcomeHomeDestinationForSection("reminders")).toBe(
      "reminders-rhythms",
    );
    expect(welcomeHomeDestinationForSection("rhythms")).toBe(
      "reminders-rhythms",
    );
  });

  it("maps Evidence Vault and Peaceful Moments runtime aliases", () => {
    expect(welcomeHomeDestinationForSection("evidence-bank")).toBe(
      "evidence-vault",
    );
    expect(welcomeHomeDestinationForSection("evidence-vault")).toBe(
      "evidence-vault",
    );
    expect(welcomeHomeDestinationForSection("focus-audio")).toBe(
      "peaceful-places",
    );
  });

  it("maps Create work (content-generator) to Create destination", () => {
    expect(welcomeHomeDestinationForSection("content-generator")).toBe(
      "create",
    );
    expect(welcomeHomeDestinationForSection("create")).toBe("create");
  });

  it("resolves Reflect category for Browse more destinations (journal, peaceful)", () => {
    expect(welcomeHomeCategoryForDestination("journal")).toBe("take-a-moment");
    expect(welcomeHomeCategoryForDestination("evidence-vault")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("peaceful-places")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("talk-it-out")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("create")).toBe("my-work");
  });
});
