/**
 * Binding tests for Celebration Garden (249) + Wins Timeline (250).
 */
import { describe, expect, it } from "vitest";
import {
  CELEBRATION_GARDEN_FEEL,
  CELEBRATION_GARDEN_INVITE_LINE,
  CELEBRATION_GARDEN_MOMENT_EXAMPLES,
  CELEBRATION_GARDEN_VS_HALL,
  detectsCelebrationGardenMoment,
  shouldInviteCelebrationGarden,
} from "./celebrationGardenIntelligence";
import {
  WINS_TIMELINE_FEATURES,
  WINS_TIMELINE_ITEM_TYPES,
  WINS_TIMELINE_PURPOSE,
  detectsWinsTimelineRequest,
  filterEntriesByYear,
  isMajorTimelineMoment,
  journeyCategoryToTimelineType,
  listYearsFromDates,
} from "./winsTimelineIntelligence";
import { getEstateCollectionRoom } from "./collectionFramework/registry";
import { GROWTH_SECTION_META } from "@/lib/growthNavigation";

describe("249 Celebration Garden Standard", () => {
  it("distinguishes moments from Hall milestones", () => {
    expect(CELEBRATION_GARDEN_VS_HALL).toMatch(/moments rather than milestones/i);
    expect(CELEBRATION_GARDEN_FEEL).toMatch(/not like an awards ceremony/i);
    expect(CELEBRATION_GARDEN_MOMENT_EXAMPLES).toContain(
      "Finished a difficult week",
    );
  });

  it("detects garden moments and skips Hall language", () => {
    expect(
      detectsCelebrationGardenMoment("I finished a difficult week and kept going."),
    ).toBe(true);
    expect(detectsCelebrationGardenMoment("I maintained a new habit")).toBe(true);
    expect(detectsCelebrationGardenMoment("I published a book this year")).toBe(
      false,
    );
    expect(shouldInviteCelebrationGarden("Helped someone this week")).toBe(true);
    expect(CELEBRATION_GARDEN_INVITE_LINE).toMatch(/Celebration Garden/);
  });

  it("garden room copy binds to peaceful moments, not awards", () => {
    const room = getEstateCollectionRoom("celebration-garden");
    expect(room?.roomName).toBe("Celebration Garden");
    expect(room?.kicker).toMatch(/moments/i);
    expect(room?.description).toMatch(/not an awards ceremony/i);
    expect(room?.sparkSuggestionLines[0]).toMatch(/Celebration Garden/);
  });
});

describe("250 Wins Timeline Standard", () => {
  it("binds purpose, item types, and features", () => {
    expect(WINS_TIMELINE_PURPOSE).toMatch(/chronological story/i);
    expect(WINS_TIMELINE_ITEM_TYPES).toEqual([
      "Personal wins",
      "Business wins",
      "Family milestones",
      "Education",
      "Health progress",
      "Spiritual milestones",
      "Creative work",
    ]);
    expect(WINS_TIMELINE_FEATURES).toContain("Filter by year");
    expect(WINS_TIMELINE_FEATURES).toContain("View supporting evidence");
  });

  it("maps journey categories and filters by year", () => {
    expect(journeyCategoryToTimelineType("Education")).toBe("Education");
    expect(journeyCategoryToTimelineType("Health Journey")).toBe(
      "Health progress",
    );
    expect(isMajorTimelineMoment("Major Life Events")).toBe(true);
    const years = listYearsFromDates(["2024-06-01", "2023-01-15", "2024-12-01"]);
    expect(years).toEqual([2024, 2023]);
    const filtered = filterEntriesByYear(
      [
        { date: "2024-06-01", id: "a" },
        { date: "2023-01-15", id: "b" },
      ],
      2024,
    );
    expect(filtered.map((e) => e.id)).toEqual(["a"]);
  });

  it("detects Wins Timeline open requests", () => {
    expect(detectsWinsTimelineRequest("Open my Wins Timeline")).toBe(true);
    expect(detectsWinsTimelineRequest("Show me my growth timeline")).toBe(true);
    expect(detectsWinsTimelineRequest("my wins")).toBe(false);
  });

  it("Growth shell titles Wins Timeline for my-journey", () => {
    expect(GROWTH_SECTION_META["my-journey"].title).toBe("Wins Timeline");
  });
});
