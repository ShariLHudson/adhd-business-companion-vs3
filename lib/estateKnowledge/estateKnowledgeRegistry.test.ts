import { describe, expect, it } from "vitest";
import {
  ESTATE_KNOWLEDGE_READING_PLACE_IDS,
  ESTATE_KNOWLEDGE_TREEHOUSE_PLACE_IDS,
  ESTATE_KNOWLEDGE_WATER_PLACE_IDS,
  answerEstateKnowledgeQuery,
  formatEstateKnowledgeAuditReport,
  getEstateKnowledgeRegistry,
  getFeatureCatalog,
  getPlaceByAlias,
  getPlacesByGroup,
  queryPlaces,
  resetEstateKnowledgeRegistryCache,
  runEstateKnowledgeAudit,
} from "@/lib/estateKnowledge";

describe("estateKnowledgeRegistry", () => {
  it("compiles every canonical place with required fields", () => {
    resetEstateKnowledgeRegistryCache();
    expect(getPlacesByGroup("water").length).toBeGreaterThan(0);

    const all = queryPlaces();
    expect(all.length).toBe(getEstateKnowledgeRegistry().places.length);
    expect(all.length).toBeGreaterThanOrEqual(75);

    for (const place of all) {
      expect(place.id).toBeTruthy();
      expect(place.displayName).toBeTruthy();
      expect(["live", "planned", "hidden", "broken"]).toContain(place.status);
      expect(place.groups.length).toBeGreaterThan(0);
      expect(place.synonyms.length).toBeGreaterThan(0);
      expect(place.emotionalUses.length).toBeGreaterThan(0);
      expect(place.media).toBeDefined();
      expect(typeof place.walkable).toBe("boolean");
      expect(typeof place.chatCanDescribe).toBe("boolean");
    }
  });

  it("resolves water places for near-water intent", () => {
    resetEstateKnowledgeRegistryCache();
    const answer = answerEstateKnowledgeQuery("I'd like somewhere near water");
    expect(answer.intent).toBe("places_by_need");
    expect(answer.needGroup).toBe("water");
    expect(answer.placeIds).toContain("conservatory");
    expect(answer.placeIds).toContain("reflection-pond");

    const waterGroup = getPlacesByGroup("water").map((p) => p.id);
    for (const id of ESTATE_KNOWLEDGE_WATER_PLACE_IDS) {
      expect(waterGroup).toContain(id);
    }
  });

  it("resolves reading places", () => {
    resetEstateKnowledgeRegistryCache();
    const answer = answerEstateKnowledgeQuery("I'd like somewhere to read");
    expect(answer.intent).toBe("places_by_need");
    expect(answer.needGroup).toBe("reading");
    expect(answer.placeIds).toContain("library");
    expect(answer.placeIds).toContain("reading-nook");

    const readingGroup = getPlacesByGroup("reading").map((p) => p.id);
    for (const id of ESTATE_KNOWLEDGE_READING_PLACE_IDS) {
      expect(readingGroup).toContain(id);
    }
  });

  it("includes Treehouse / Possibility House places", () => {
    resetEstateKnowledgeRegistryCache();
    const answer = answerEstateKnowledgeQuery("Tell me about the Treehouse");
    expect(answer.intent).toBe("places_by_need");
    expect(answer.needGroup).toBe("treehouse");
    expect(answer.placeIds).toContain("house-possibility-outside");
    expect(answer.placeIds).toContain("house-possibility-discovery-chest");

    const treehouseGroup = getPlacesByGroup("treehouse").map((p) => p.id);
    for (const id of ESTATE_KNOWLEDGE_TREEHOUSE_PLACE_IDS) {
      expect(treehouseGroup).toContain(id);
    }
  });

  it("resolves Butterfly Conservatory alias to Ocean Conservatory", () => {
    resetEstateKnowledgeRegistryCache();
    const butterfly = getPlaceByAlias("Butterfly Conservatory");
    expect(butterfly?.id).toBe("conservatory");
    expect(butterfly?.displayName).toMatch(/Ocean Conservatory/i);

    const ocean = getPlaceByAlias("Ocean Conservatory");
    expect(ocean?.id).toBe("conservatory");
    expect(ocean?.guidebook?.spreadId).toBe("ocean-conservatory");
    expect(ocean?.canonicalStatus).toBe("planned");
    expect(ocean?.status).toBe("broken");
    expect(ocean?.brokenReasons).toContain(
      "offered_in_wander_menu_but_not_walkable",
    );
    expect(ocean?.walkable).toBe(false);
    expect(ocean?.chatCanDescribe).toBe(true);
  });

  it("answers what rooms do you have from full registry", () => {
    resetEstateKnowledgeRegistryCache();
    const answer = answerEstateKnowledgeQuery("What rooms do you have?");
    expect(answer.intent).toBe("room_catalog");
    expect(answer.placeIds.length).toBeGreaterThan(8);
    expect(answer.summary).toMatch(/Estate includes/i);
  });

  it("answers how do I use Clear My Mind", () => {
    resetEstateKnowledgeRegistryCache();
    const answer = answerEstateKnowledgeQuery("How do I use Clear My Mind?");
    expect(answer.intent).toBe("feature_how_to");
    expect(answer.matchedPlaceId).toBe("clear-my-mind");
    expect(answer.placeIds).toContain("clear-my-mind");
    expect(answer.summary).toMatch(/Clear My Mind/i);
    expect(answer.featureIds.length).toBeGreaterThan(0);
  });

  it("answers what features do you have", () => {
    resetEstateKnowledgeRegistryCache();
    const answer = answerEstateKnowledgeQuery("What features do you have?");
    expect(answer.intent).toBe("feature_catalog");
    expect(answer.featureIds.length).toBeGreaterThan(0);
    expect(getFeatureCatalog().length).toBeGreaterThan(20);
  });

  it("produces dev audit output with expected sections", () => {
    resetEstateKnowledgeRegistryCache();
    const report = runEstateKnowledgeAudit();
    expect(report.counts.totalPlaces).toBeGreaterThanOrEqual(75);
    expect(report.counts.features).toBeGreaterThan(0);
    expect(Array.isArray(report.canonicalNotKnownToChat)).toBe(true);
    expect(Array.isArray(report.plannedOfferedAsWalkable)).toBe(true);

    // Snapshot counts for Phase 1 handoff (update when canon grows)
    expect(report.counts).toMatchObject({
      totalPlaces: expect.any(Number),
      live: expect.any(Number),
      planned: expect.any(Number),
      hidden: expect.any(Number),
      broken: expect.any(Number),
      walkable: expect.any(Number),
      chatCanDescribe: expect.any(Number),
    });

    const formatted = formatEstateKnowledgeAuditReport(report);
    expect(formatted).toMatch(/Canonical places not known to chat/);
    expect(formatted).toMatch(/Planned\/non-walkable offered in wander menu/);
    expect(formatted).toMatch(/Registry places missing media/);

    expect(report.counts.totalPlaces).toBe(82);
  });

  it("records Phase 1 audit counts snapshot", () => {
    resetEstateKnowledgeRegistryCache();
    const report = runEstateKnowledgeAudit();
    expect(report.counts).toMatchInlineSnapshot(`
      {
        "broken": 19,
        "chatCanDescribe": 54,
        "features": 134,
        "hidden": 2,
        "live": 33,
        "planned": 28,
        "totalPlaces": 82,
        "walkable": 50,
        "withBrainEntry": 18,
        "withGuidebook": 46,
      }
    `);
  });

  it("records Phase 1 audit gap lists snapshot", () => {
    resetEstateKnowledgeRegistryCache();
    const report = runEstateKnowledgeAudit();
    expect(report.plannedOfferedAsWalkable.sort()).toMatchInlineSnapshot(`
      [
        "conservatory",
        "tea-room",
      ]
    `);
    expect(report.canonicalNotKnownToChat.length).toBeGreaterThan(0);
    expect(report.canonicalNotKnownToChat).toContain("gardens");
  });

  it("flags conservatory as planned but offered in wander menu", () => {
    resetEstateKnowledgeRegistryCache();
    const conservatory = getPlaceByAlias("conservatory");
    expect(conservatory?.offeredInWanderMenu).toBe(true);
    expect(conservatory?.walkable).toBe(false);
    expect(conservatory?.status).toBe("broken");

    const report = runEstateKnowledgeAudit();
    expect(report.plannedOfferedAsWalkable).toContain("conservatory");
  });
});
