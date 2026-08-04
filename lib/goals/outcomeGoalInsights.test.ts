import { describe, expect, it } from "vitest";
import {
  buildOutcomeMotivationMessages,
  buildOutcomeInsightsCards,
} from "./outcomeGoalInsights";
import { migrateOutcomeGoalsTabId } from "../growthCenterHub";

describe("outcomeGoalInsights P0.54", () => {
  it("migrates legacy tab ids to activity and insights", () => {
    expect(migrateOutcomeGoalsTabId("progress")).toBe("activity");
    expect(migrateOutcomeGoalsTabId("reports")).toBe("insights");
    expect(migrateOutcomeGoalsTabId("goals")).toBe("goals");
  });

  it("builds motivation messages with a fallback", () => {
    const messages = buildOutcomeMotivationMessages();
    expect(messages.length).toBeGreaterThan(0);
  });

  it("builds insight dashboard cards", () => {
    const cards = buildOutcomeInsightsCards();
    expect(cards.some((c) => c.id === "active")).toBe(true);
    expect(cards.some((c) => c.id === "overall")).toBe(true);
  });
});
