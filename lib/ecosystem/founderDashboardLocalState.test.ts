import { beforeEach, describe, expect, it } from "vitest";

import {
  addToContentQueue,
  isOpportunityReviewed,
  loadContentQueue,
  markOpportunityReviewed,
  opportunityAssetKey,
  resetFounderDashboardLocalState,
  updateQueueItemStatus,
} from "./founderDashboardLocalState";

const OPPORTUNITY = {
  topic: "Overwhelm",
  topicKey: "overwhelm",
  mentions: 40,
  opportunityScore: 80,
  trend: "up" as const,
  whyThisMatters: "High signal volume.",
  suggestedAssets: ["Blog"],
  sourceSignals: [{ kind: "struggle", category: "overwhelm", count: 40 }],
};

const ASSET = {
  type: "blog",
  label: "Blog",
  title: "ADHD overwhelm in business",
  angle: "Normalize and triage.",
};

describe("founderDashboardLocalState", () => {
  beforeEach(() => {
    resetFounderDashboardLocalState();
  });

  it("marks opportunity assets as reviewed", () => {
    const key = opportunityAssetKey("overwhelm", ASSET);
    expect(isOpportunityReviewed(key)).toBe(false);
    markOpportunityReviewed(key);
    expect(isOpportunityReviewed(key)).toBe(true);
  });

  it("stores opportunities in content queue", () => {
    addToContentQueue({ opportunity: OPPORTUNITY, asset: ASSET });
    const queue = loadContentQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].title).toBe(ASSET.title);
    expect(queue[0].status).toBe("idea");
  });

  it("updates queue item status", () => {
    addToContentQueue({ opportunity: OPPORTUNITY, asset: ASSET });
    const id = loadContentQueue()[0].id;
    updateQueueItemStatus(id, "approved");
    expect(loadContentQueue()[0].status).toBe("approved");
  });
});
