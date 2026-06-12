import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContentDraft } from "./postcraftDraftGenerator";
import {
  buildPublishingItems,
  computePublishingDashboardMetrics,
  parsePostCraftApiResponse,
  pushToPostCraft,
  receivePostCraftStatus,
  resolvePublishStatus,
  resetPostCraftPublishingStore,
} from "./postcraftLivePublishing";
import { resetContentDraftStore, saveContentDraft } from "./postcraftDraftStore";
import { resetPostCraftSyncQueue } from "./postcraftSyncQueue";

function approvedDraft(overrides: Partial<ContentDraft> = {}): ContentDraft {
  const now = "2026-06-12T12:00:00.000Z";
  return {
    id: "draft-pub-1",
    topic: "Overwhelm",
    topicKey: "overwhelm",
    assetType: "blog",
    assetLabel: "Blog",
    title: "Overwhelm rescue blog",
    angle: "Triage fast.",
    opportunityScore: 90,
    trend: "up",
    sourceSignalSummary: "struggle/overwhelm: 40",
    whyThisMatters: "Top theme.",
    body: "Blog body content.",
    status: "approved",
    postCraftSyncReady: true,
    createdAt: now,
    updatedAt: now,
    approvedAt: now,
    ...overrides,
  };
}

describe("postcraftLivePublishing", () => {
  beforeEach(() => {
    resetPostCraftPublishingStore();
    resetPostCraftSyncQueue();
    resetContentDraftStore();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("1. approved drafts publish successfully when API configured", async () => {
    vi.stubEnv("POSTCRAFT_API_URL", "https://postcraft.example/publish");
    vi.stubEnv("POSTCRAFT_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            id: "pc-99",
            status: "published",
            publishedAt: "2026-06-12T13:00:00.000Z",
            metrics: { views: 120, clicks: 15 },
          }),
          { status: 200 },
        ),
      ),
    );

    await saveContentDraft(approvedDraft());
    const result = await pushToPostCraft("draft-pub-1");
    expect(result.ok).toBe(true);
    expect(result.record?.publishStatus).toBe("published");
    expect(result.record?.publishResults?.views).toBe(120);
  });

  it("2. status updates return correctly via webhook", async () => {
    await saveContentDraft(approvedDraft());
    const record = await receivePostCraftStatus({
      draftId: "draft-pub-1",
      status: "scheduled",
      scheduledAt: "2026-06-15T09:00:00.000Z",
    });
    expect(record.publishStatus).toBe("scheduled");
    expect(record.scheduledAt).toBeTruthy();
  });

  it("3. dashboard reflects publishing state", () => {
    const items = buildPublishingItems(
      [approvedDraft(), approvedDraft({ id: "d2", status: "published" })],
      new Map([
        [
          "draft-pub-1",
          {
            draftId: "draft-pub-1",
            status: "ready",
            updatedAt: "2026-06-12T12:00:00.000Z",
          },
        ],
      ]),
      new Map([
        [
          "d2",
          {
            draftId: "d2",
            publishStatus: "published",
            publishedAt: "2026-06-12T12:00:00.000Z",
            publishResults: { views: 200, engagementScore: 200 },
            updatedAt: "2026-06-12T12:00:00.000Z",
          },
        ],
      ]),
    );

    const metrics = computePublishingDashboardMetrics(items);
    expect(metrics.contentPublished).toBe(1);
    expect(metrics.topPerformingTopics[0]?.topic).toBe("Overwhelm");
    expect(resolvePublishStatus(approvedDraft(), { draftId: "draft-pub-1", status: "ready", updatedAt: "" })).toBe(
      "queued",
    );
  });

  it("4. founder AI can reference publishing via format helper", async () => {
    const parsed = parsePostCraftApiResponse({
      status: "scheduled",
      scheduledAt: "2026-06-20T10:00:00.000Z",
    });
    expect(parsed.status).toBe("scheduled");

    const { answerPostCraftPublishingQuestion, loadPostCraftPublishingIntelligence } =
      await import("./postcraftLivePublishing");
    await saveContentDraft(approvedDraft());
    const intel = await loadPostCraftPublishingIntelligence();
    const answer = answerPostCraftPublishingQuestion("What failed?", intel);
    expect(answer.answer).toBeTruthy();
  });
});
