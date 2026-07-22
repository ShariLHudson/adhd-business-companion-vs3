import { describe, expect, it } from "vitest";
import {
  welcomeHomeCategoryForDestination,
  welcomeHomeDestinationForSection,
} from "./welcomeHomeActiveDestination";

describe("welcomeHomeActiveDestination (Prompt 144)", () => {
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

  it("maps Evidence Vault and audio runtime aliases", () => {
    expect(welcomeHomeDestinationForSection("evidence-bank")).toBe(
      "evidence-vault",
    );
    expect(welcomeHomeDestinationForSection("evidence-vault")).toBe(
      "evidence-vault",
    );
    expect(welcomeHomeDestinationForSection("focus-audio")).toBe(
      "peaceful-places",
    );
    expect(welcomeHomeDestinationForSection("peaceful-places")).toBe(
      "peaceful-places",
    );
  });

  it("maps Create work (content-generator) to Create destination", () => {
    expect(welcomeHomeDestinationForSection("content-generator")).toBe(
      "create",
    );
    expect(welcomeHomeDestinationForSection("create")).toBe("create");
  });

  it("resolves intention categories for the current Welcome Home IA", () => {
    expect(welcomeHomeCategoryForDestination("journal")).toBe("reflection");
    expect(welcomeHomeCategoryForDestination("evidence-vault")).toBe(
      "reflection",
    );
    expect(welcomeHomeCategoryForDestination("hall-of-accomplishments")).toBe(
      "reflection",
    );
    expect(welcomeHomeCategoryForDestination("peaceful-places")).toBe("audio");
    expect(welcomeHomeCategoryForDestination("soundscapes")).toBe("audio");
    expect(welcomeHomeCategoryForDestination("nature-sounds")).toBe("audio");
    expect(welcomeHomeCategoryForDestination("talk-it-out")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("breathe")).toBe("take-a-moment");
    expect(welcomeHomeCategoryForDestination("focus-library")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("start-focus-session")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("create")).toBe("build");
    expect(welcomeHomeCategoryForDestination("strategy-library")).toBe(
      "get-advice",
    );
    expect(welcomeHomeCategoryForDestination("cartographers-studio")).toBe(
      "build",
    );
    expect(welcomeHomeCategoryForDestination("chamber-of-momentum")).toBe(
      "get-advice",
    );
    expect(welcomeHomeCategoryForDestination("boardroom")).toBe("get-advice");
  });
});

