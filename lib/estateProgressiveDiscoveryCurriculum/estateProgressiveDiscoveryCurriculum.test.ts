import { describe, expect, it } from "vitest";
import {
  createEmptyMemberJourneyProgress,
  recordDiscoveryViewed,
  recordRoomVisit,
} from "@/lib/estateProgressiveDiscoveryJourney";
import {
  getDiscoveryCollectionById,
  getDiscoveryCollections,
  getLiveDiscoveryCollections,
  getProgressiveDiscoveryCurriculum,
  isDiscoveryEligibleByCurriculum,
  rankDiscoveryForCurriculum,
  sortDiscoveriesByCurriculum,
} from "./index";
import { getLiveDiscoveryLibraryItems } from "@/lib/estateDiscovery/discoveryLibraryLoader";

describe("Progressive Discovery Curriculum", () => {
  it("loads curriculum philosophy and rules", () => {
    const curriculum = getProgressiveDiscoveryCurriculum();
    expect(curriculum.registry).toBe("progressive-discovery-curriculum");
    expect(curriculum.rules.oneMeaningfulDiscoveryAtATime).toBe(true);
    expect(curriculum.rules.neverSurfaceProgress).toBe(true);
    expect(curriculum.philosophy.memberShouldNeverFeel).toMatch(
      /learn another feature/i,
    );
  });

  it("defines eleven discovery collections", () => {
    const collections = getDiscoveryCollections();
    expect(collections.length).toBeGreaterThanOrEqual(10);
    expect(
      collections.some((c) => c.collectionId === "welcome-to-spark-estate"),
    ).toBe(true);
    expect(
      collections.some((c) => c.collectionId === "listening-experiences"),
    ).toBe(true);
  });

  it("welcome collection sequences DISC-001 through DISC-010", () => {
    const welcome = getDiscoveryCollectionById("welcome-to-spark-estate");
    expect(welcome?.status).toBe("Live");
    expect(welcome?.items[0]).toMatchObject({
      refType: "discovery",
      refId: "DISC-001",
      order: 1,
    });
    expect(welcome?.items[9]).toMatchObject({
      refType: "discovery",
      refId: "DISC-010",
      order: 10,
    });
  });

  it("blocks DISC-003 until DISC-002 is viewed", () => {
    let progress = createEmptyMemberJourneyProgress("curriculum-1");
    expect(isDiscoveryEligibleByCurriculum("DISC-003", progress)).toBe(false);

    progress = recordDiscoveryViewed(progress, "DISC-002");
    expect(isDiscoveryEligibleByCurriculum("DISC-003", progress)).toBe(true);
  });

  it("allows DISC-001 for new members without prerequisites", () => {
    const progress = createEmptyMemberJourneyProgress("curriculum-2");
    expect(isDiscoveryEligibleByCurriculum("DISC-001", progress)).toBe(true);
  });

  it("prioritizes welcome collection discoveries for new members", () => {
    const progress = createEmptyMemberJourneyProgress("curriculum-3");
    const live = getLiveDiscoveryLibraryItems();
    const sorted = sortDiscoveriesByCurriculum(live, progress);

    expect(sorted[0]?.id).toBe("DISC-001");
    const rank = rankDiscoveryForCurriculum("DISC-001", progress);
    expect(rank.collectionId).toBe("welcome-to-spark-estate");
    expect(rank.prerequisitesMet).toBe(true);
  });

  it("defers DISC-002 behind DISC-001 in curriculum sort when prerequisites unmet", () => {
    const progress = createEmptyMemberJourneyProgress("curriculum-4");
    const live = getLiveDiscoveryLibraryItems().filter((item) =>
      ["DISC-001", "DISC-002", "DISC-003"].includes(item.id),
    );
    const sorted = sortDiscoveriesByCurriculum(live, progress);
    expect(sorted[0]?.id).toBe("DISC-001");
    expect(sorted.some((item) => item.id === "DISC-002")).toBe(true);
  });

  it("maps listening collection to music room and audio experiences", () => {
    const listening = getDiscoveryCollectionById("listening-experiences");
    expect(listening?.relatedSparkCards).toEqual(
      expect.arrayContaining(["music", "focus", "creativity"]),
    );
    expect(
      listening?.items.some(
        (item) => item.refType === "audio" && item.refId === "music-room-piano",
      ),
    ).toBe(true);
  });

  it("keeps live collections separate from draft-only collections", () => {
    const live = getLiveDiscoveryCollections();
    expect(live.every((collection) => collection.status === "Live")).toBe(true);
    expect(live.some((c) => c.collectionId === "hidden-treasures")).toBe(
      false,
    );
  });

  it("allows music-room discovery note after room visit", () => {
    let progress = createEmptyMemberJourneyProgress("curriculum-5");
    expect(isDiscoveryEligibleByCurriculum("DISC-014", progress)).toBe(false);
    progress = recordRoomVisit(progress, "music-room");
    expect(isDiscoveryEligibleByCurriculum("DISC-014", progress)).toBe(true);
  });
});
