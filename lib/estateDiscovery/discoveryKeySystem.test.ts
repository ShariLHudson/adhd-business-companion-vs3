import { describe, expect, it } from "vitest";

import {
  evaluateDiscoveryKeySession,
  completeDiscoveryKeySession,
} from "./discoveryKeySystem";
import { InMemoryDiscoveryHistoryStore } from "./discoveryHistory";
import {
  createEmptyMemberJourneyProgress,
  recordDiscoveryViewed,
} from "@/lib/estateProgressiveDiscoveryJourney";

describe("discoveryKeySystem", () => {
  it("returns session with note data for eligible room", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    let journeyProgress = createEmptyMemberJourneyProgress("member-1");
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

    const result = evaluateDiscoveryKeySession({
      memberId: "member-1",
      currentRoomId: "greenhouse",
      memberContext: {
        roomVisitCounts: { greenhouse: 0 },
        featuresUsed: [],
      },
      historyStore: store,
      journeyProgress,
    });

    expect(result?.session.discoveryId).toBe("DISC-011");
    expect(result?.noteData.discoveryText).toContain("glass walls");
    expect(result?.session.placement.roomId).toBe("greenhouse");
  });

  it("records completion and clears eligibility", () => {
    const store = new InMemoryDiscoveryHistoryStore();
    const memberId = "member-2";
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

    const first = evaluateDiscoveryKeySession({
      memberId,
      currentRoomId: "greenhouse",
      memberContext: {
        roomVisitCounts: { greenhouse: 0 },
        featuresUsed: [],
      },
      historyStore: store,
      journeyProgress,
    });

    expect(first).not.toBeNull();

    completeDiscoveryKeySession({
      memberId,
      discoveryId: "DISC-011",
      outcome: "completed",
      historyStore: store,
    });

    const second = evaluateDiscoveryKeySession({
      memberId,
      currentRoomId: "greenhouse",
      memberContext: {
        roomVisitCounts: { greenhouse: 0 },
        featuresUsed: [],
      },
      historyStore: store,
      journeyProgress,
    });

    expect(second?.session.discoveryId).not.toBe("DISC-011");
  });
});
