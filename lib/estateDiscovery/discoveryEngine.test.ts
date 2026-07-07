import { describe, expect, it } from "vitest";

import { selectNextDiscovery } from "./discoveryEngine";
import { InMemoryDiscoveryHistoryStore } from "./discoveryHistory";
import type { DiscoveryMemberContext } from "./types";
import {
  createEmptyMemberJourneyProgress,
  recordDiscoveryViewed,
} from "@/lib/estateProgressiveDiscoveryJourney";

describe("discoveryEngine", () => {
  const memberId = "test-member";

  it("selects welcome DISC-001 for first estate visit", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const context: DiscoveryMemberContext = {
      roomVisitCounts: { sunroom: 1 },
      featuresUsed: [],
    };

    const selection = selectNextDiscovery({
      memberId,
      currentRoomId: "sunroom",
      memberContext: context,
      historyStore: store,
    });

    expect(selection?.discoveryId).toBe("DISC-001");
    expect(selection?.companionResponse).toBeTruthy();
  });

  it("selects greenhouse discovery after welcome arc", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const context: DiscoveryMemberContext = {
      roomVisitCounts: { greenhouse: 0 },
      featuresUsed: [],
    };
    let journeyProgress = createEmptyMemberJourneyProgress(memberId);
    for (const id of [
      "DISC-001",
      "DISC-002",
      "DISC-003",
      "DISC-004",
      "DISC-005",
      "DISC-006",
      "DISC-007",
      "DISC-008",
      "DISC-009",
      "DISC-010",
    ]) {
      journeyProgress = recordDiscoveryViewed(journeyProgress, id);
    }

    const selection = selectNextDiscovery({
      memberId,
      currentRoomId: "greenhouse",
      memberContext: context,
      historyStore: store,
      journeyProgress,
    });

    expect(selection?.discoveryId).toBe("DISC-011");
  });

  it("skips completed discoveries", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    store.upsert({
      userId: memberId,
      discoveryId: "DISC-001",
      status: "completed",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const context: DiscoveryMemberContext = {
      roomVisitCounts: { sunroom: 1 },
      featuresUsed: [],
    };

    const selection = selectNextDiscovery({
      memberId,
      currentRoomId: "sunroom",
      memberContext: context,
      historyStore: store,
    });

    expect(selection?.discoveryId).not.toBe("DISC-001");
  });

  it("skips saved discoveries", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    store.upsert({
      userId: memberId,
      discoveryId: "DISC-001",
      status: "saved",
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const selection = selectNextDiscovery({
      memberId,
      currentRoomId: "sunroom",
      memberContext: { roomVisitCounts: { sunroom: 1 }, featuresUsed: [] },
      historyStore: store,
    });

    expect(selection?.discoveryId).not.toBe("DISC-001");
  });

  it("requires matching room for room-tied discoveries", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const context: DiscoveryMemberContext = {
      roomVisitCounts: { greenhouse: 0 },
      featuresUsed: [],
    };
    const journeyProgress = recordDiscoveryViewed(
      createEmptyMemberJourneyProgress(memberId),
      "DISC-002",
    );

    const selection = selectNextDiscovery({
      memberId,
      currentRoomId: "conservatory",
      memberContext: context,
      historyStore: store,
      journeyProgress,
    });

    expect(selection?.discoveryId).not.toBe("DISC-011");
  });

  it("excludes sunroom room story after repeat visits", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const context: DiscoveryMemberContext = {
      roomVisitCounts: { sunroom: 2 },
      featuresUsed: [],
    };

    const selection = selectNextDiscovery({
      memberId,
      currentRoomId: "sunroom",
      memberContext: context,
      historyStore: store,
    });

    expect(selection?.discoveryId).not.toBe("DISC-012");
  });
});
