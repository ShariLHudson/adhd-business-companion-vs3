import { describe, expect, it } from "vitest";
import { InMemoryDiscoveryHistoryStore } from "@/lib/estateDiscovery/discoveryHistory";
import { buildJourneyStageItems } from "./buildJourneyItems";
import { pickJourneyDiscovery } from "./journeyDiscoveryPicker";
import {
  createEmptyMemberJourneyProgress,
  recordDiscoveryViewed,
  recordFeatureExplored,
  recordJourneyItemsIntroduced,
  recordRoomVisit,
} from "./memberJourneyProgress";
import {
  deriveMemberTenure,
  resolveCurrentJourneyStageId,
} from "./resolveJourneyStage";
import { getJourneyStages } from "./journeyConfig";
import { syncJourneyProgressFromDiscoveryHistory } from "./journeySync";
import { recordDiscoveryShown } from "@/lib/estateDiscovery/discoveryHistory";

describe("Progressive Discovery Journey™", () => {
  it("defines five live journey stages", () => {
    const stages = getJourneyStages();
    expect(stages).toHaveLength(5);
    expect(stages.map((stage) => stage.stageId)).toEqual([
      "welcome",
      "explore",
      "discover-features",
      "personalize",
      "deeper-discovery",
    ]);
  });

  it("starts new members on welcome with at most three items", () => {
    const progress = createEmptyMemberJourneyProgress("member-1");
    expect(resolveCurrentJourneyStageId(progress)).toBe("welcome");

    const built = buildJourneyStageItems(progress);
    expect(built?.stageId).toBe("welcome");
    expect(built?.items.length).toBeLessThanOrEqual(3);
    expect(built?.items[0]?.officialName).toBeTruthy();
  });

  it("advances stage after quiet engagement — no scores surfaced", () => {
    let progress = createEmptyMemberJourneyProgress("member-2");
    progress = recordDiscoveryViewed(progress, "DISC-002");
    progress = recordJourneyItemsIntroduced(progress, [
      { type: "tool", id: "folded-map" },
      { type: "tool", id: "discovery-key" },
    ]);

    expect(resolveCurrentJourneyStageId(progress)).toBe("explore");
    expect(deriveMemberTenure(progress)).toBe("returning");
  });

  it("skips already-engaged items in the current stage", () => {
    let progress = createEmptyMemberJourneyProgress("member-3");
    progress = recordDiscoveryViewed(progress, "DISC-002");
    progress = recordJourneyItemsIntroduced(progress, [
      { type: "tool", id: "folded-map" },
      { type: "tool", id: "discovery-key" },
    ]);

    const built = buildJourneyStageItems(progress);
    expect(built?.stageId).toBe("explore");
    expect(built?.items.some((item) => item.id === "DISC-002")).toBe(false);
  });

  it("prioritizes welcome-stage discoveries for new members on sunroom", () => {
    const progress = createEmptyMemberJourneyProgress("member-4");
    const historyStore = new InMemoryDiscoveryHistoryStore();

    const pick = pickJourneyDiscovery({
      progress,
      memberContext: { roomVisitCounts: { sunroom: 1 }, featuresUsed: [] },
      historyStore,
      currentRoomId: "sunroom",
    });

    expect(pick?.discoveryId).toBe("DISC-002");
  });

  it("prefers unseen discoveries over repeats", () => {
    const historyStore = new InMemoryDiscoveryHistoryStore();
    let progress = createEmptyMemberJourneyProgress("member-5");
    progress = recordDiscoveryViewed(progress, "DISC-002");

    const pick = pickJourneyDiscovery({
      progress,
      memberContext: { roomVisitCounts: { sunroom: 1 }, featuresUsed: [] },
      historyStore,
      currentRoomId: "sunroom",
    });

    expect(pick?.discoveryId).not.toBe("DISC-002");
  });

  it("syncs journey progress from discovery history without gamification", () => {
    const historyStore = new InMemoryDiscoveryHistoryStore();
    const memberId = "member-6";

    recordDiscoveryShown(historyStore, memberId, "DISC-001", {
      roomWhereShown: "greenhouse",
    });

    const progress = syncJourneyProgressFromDiscoveryHistory(
      createEmptyMemberJourneyProgress(memberId),
      historyStore,
    );

    expect(progress.discoveriesViewed).toContain("DISC-001");
    expect(progress.roomsVisited).toContain("greenhouse");
  });

  it("marks established members after deeper engagement", () => {
    let progress = createEmptyMemberJourneyProgress("member-7");
    progress = recordDiscoveryViewed(progress, "DISC-002");
    progress = recordRoomVisit(progress, "sunroom");
    progress = recordRoomVisit(progress, "personal-library");
    progress = recordRoomVisit(progress, "music-room");
    progress = recordRoomVisit(progress, "conservatory");
    progress = recordFeatureExplored(progress, "clear-my-mind");
    progress = recordFeatureExplored(progress, "plan-my-day");
    progress = recordFeatureExplored(progress, "focus-audio");
    progress = recordRoomVisit(progress, "greenhouse");
    progress = recordDiscoveryViewed(progress, "DISC-001");

    expect(deriveMemberTenure(progress)).toBe("established");
  });
});
