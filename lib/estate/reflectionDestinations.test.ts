/**
 * Reflection Navigation Routing Fix — canonical registry contract.
 * @see docs/navigation/SPARK_ESTATE_REFLECTION_NAVIGATION_ROUTING_FIX.md
 */
import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_EXCLUDED_FROM_REFLECTION,
  REFLECTION_DESTINATIONS,
  REFLECTION_DESTINATION_IDS,
  getReflectionDestination,
  isReflectionDestinationId,
  reflectionDestinationForSection,
} from "./reflectionDestinations";
import { WELCOME_HOME_MY_STORY_DESTINATION_IDS } from "./welcomeHomeNavigationStructure";
import { DEDICATED_ESTATE_ROOM_PANEL_SECTIONS } from "./directEstateVisit";

describe("reflectionDestinations registry", () => {
  it("contains exactly Journal, Evidence Vault, Hall of Accomplishments", () => {
    expect(REFLECTION_DESTINATION_IDS).toEqual([
      "journal",
      "evidence-vault",
      "hall-of-accomplishments",
    ]);
  });

  it("matches the Welcome Home Reflection menu ids (no drift)", () => {
    expect([...REFLECTION_DESTINATION_IDS].sort()).toEqual(
      [...WELCOME_HOME_MY_STORY_DESTINATION_IDS].sort(),
    );
  });

  it("never includes Clear My Mind", () => {
    expect(CLEAR_MY_MIND_EXCLUDED_FROM_REFLECTION).toBe(true);
    expect(
      REFLECTION_DESTINATIONS.some((d) => (d.id as string) === "clear-my-mind"),
    ).toBe(false);
    expect(REFLECTION_DESTINATIONS.some((d) => d.section === "brain-dump")).toBe(
      false,
    );
    expect(isReflectionDestinationId("clear-my-mind")).toBe(false);
  });

  it("has no duplicate ids, routes, or sections", () => {
    const ids = REFLECTION_DESTINATIONS.map((d) => d.id);
    const routes = REFLECTION_DESTINATIONS.map((d) => d.route);
    const sections = REFLECTION_DESTINATIONS.map((d) => d.section);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
    expect(new Set(sections).size).toBe(sections.length);
  });

  it("each destination resolves to its own canonical section — none share brain-dump", () => {
    expect(getReflectionDestination("journal")?.section).toBe("growth-journal");
    expect(getReflectionDestination("evidence-vault")?.section).toBe(
      "evidence-bank",
    );
    expect(getReflectionDestination("hall-of-accomplishments")?.section).toBe(
      "growth-portfolio",
    );
  });

  it("reflectionDestinationForSection round-trips each canonical section", () => {
    expect(reflectionDestinationForSection("growth-journal")?.id).toBe("journal");
    expect(reflectionDestinationForSection("evidence-bank")?.id).toBe(
      "evidence-vault",
    );
    expect(reflectionDestinationForSection("growth-portfolio")?.id).toBe(
      "hall-of-accomplishments",
    );
    expect(reflectionDestinationForSection("brain-dump")).toBeUndefined();
  });

  it("every Reflection section is a dedicated panel — never the frosted chat/CMM overlay", () => {
    for (const dest of REFLECTION_DESTINATIONS) {
      expect(DEDICATED_ESTATE_ROOM_PANEL_SECTIONS).toContain(dest.section);
    }
  });

  it("isReflectionDestinationId / getReflectionDestination agree for every entry", () => {
    for (const dest of REFLECTION_DESTINATIONS) {
      expect(isReflectionDestinationId(dest.id)).toBe(true);
      expect(getReflectionDestination(dest.id)?.id).toBe(dest.id);
    }
  });
});
