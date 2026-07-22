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
    expect(welcomeHomeDestinationForSection("focus-audio")).toBe("focus-audio");
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

  it("resolves intention categories after Prompt 144 reorganization", () => {
    expect(welcomeHomeCategoryForDestination("journal")).toBe("take-a-moment");
    expect(welcomeHomeCategoryForDestination("evidence-vault")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("peaceful-places")).toBe("audio");
    expect(welcomeHomeCategoryForDestination("soundscapes")).toBe("audio");
    expect(welcomeHomeCategoryForDestination("nature-sounds")).toBe("audio");
    expect(welcomeHomeCategoryForDestination("talk-it-out")).toBe(
      "take-a-moment",
    );
    expect(welcomeHomeCategoryForDestination("breathe")).toBe("take-a-moment");
    expect(welcomeHomeCategoryForDestination("create")).toBe("my-work");
    expect(welcomeHomeCategoryForDestination("strategy-library")).toBe(
      "my-work",
    );
    expect(welcomeHomeCategoryForDestination("spin-the-wheel")).toBe("my-work");
    expect(welcomeHomeCategoryForDestination("cartographers-studio")).toBe(
      "cartography",
    );
  });
});
