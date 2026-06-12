import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContentDraft } from "./postcraftDraftGenerator";
import {
  buildSyncQueueItems,
  getPostCraftSyncQueue,
  isDraftEligibleForSyncQueue,
  isPostCraftApiConfigured,
  markSyncRetry,
  markSyncSent,
  markSyncSkipped,
  payloadIsSyncSafe,
  resetPostCraftSyncQueue,
  sanitizePostCraftSyncPayload,
  sendDraftToPostCraft,
} from "./postcraftSyncQueue";
import { resetContentDraftStore, saveContentDraft } from "./postcraftDraftStore";
import { toPostCraftSyncPayload } from "./postcraftDraftGenerator";

function approvedDraft(overrides: Partial<ContentDraft> = {}): ContentDraft {
  const now = "2026-06-12T12:00:00.000Z";
  return {
    id: "draft-approved-1",
    topic: "Overwhelm",
    topicKey: "overwhelm",
    assetType: "blog",
    assetLabel: "Blog",
    title: "ADHD overwhelm in business",
    angle: "Normalize and triage.",
    opportunityScore: 88,
    trend: "up",
    sourceSignalSummary: "struggle/overwhelm: 40",
    whyThisMatters: "High demand topic.",
    body: "Draft body for approved overwhelm blog post.",
    status: "approved",
    postCraftSyncReady: true,
    createdAt: now,
    updatedAt: now,
    approvedAt: now,
    ...overrides,
  };
}

describe("postcraftSyncQueue", () => {
  beforeEach(() => {
    resetPostCraftSyncQueue();
    resetContentDraftStore();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("1. includes approved sync-ready drafts only", () => {
    const approved = approvedDraft();
    const drafted = approvedDraft({
      id: "draft-2",
      status: "drafted",
      postCraftSyncReady: false,
    });
    const syncReadyNotApproved = approvedDraft({
      id: "draft-3",
      status: "reviewed",
      postCraftSyncReady: true,
    });
    expect(isDraftEligibleForSyncQueue(approved)).toBe(true);
    expect(isDraftEligibleForSyncQueue(drafted)).toBe(false);
    expect(isDraftEligibleForSyncQueue(syncReadyNotApproved)).toBe(false);

    const items = buildSyncQueueItems([approved, drafted, syncReadyNotApproved], new Map());
    expect(items.length).toBe(1);
    expect(items[0].title).toBe(approved.title);
    expect(items[0].assetType).toBe("blog");
  });

  it("2. excludes unapproved drafts from queue", () => {
    const items = buildSyncQueueItems(
      [approvedDraft({ status: "drafted", postCraftSyncReady: false })],
      new Map(),
    );
    expect(items.length).toBe(0);
  });

  it("3. send shows not connected when PostCraft API is missing", async () => {
    await saveContentDraft(approvedDraft());
    const result = await sendDraftToPostCraft("draft-approved-1");
    expect(result.connected).toBe(false);
    expect(result.error).toBe("PostCraft is not connected yet.");

    const queue = await getPostCraftSyncQueue([approvedDraft()]);
    expect(queue.connected).toBe(false);
  });

  it("4. retry resets failed status to ready", async () => {
    await saveContentDraft(approvedDraft());
    const { attemptPostCraftSend } = await import("./postcraftSyncQueue");
    vi.stubEnv("POSTCRAFT_API_URL", "https://postcraft.example/ingest");
    vi.stubEnv("POSTCRAFT_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("error", { status: 500 })),
    );
    const draft = approvedDraft();
    const sendResult = await attemptPostCraftSend(draft);
    expect(sendResult.ok).toBe(false);

    let queue = await getPostCraftSyncQueue([draft]);
    expect(queue.items[0].status).toBe("failed");

    await markSyncRetry("draft-approved-1");
    queue = await getPostCraftSyncQueue([draft]);
    expect(queue.items[0].status).toBe("ready");
  });

  it("5. mark sent updates status", async () => {
    await saveContentDraft(approvedDraft());
    await markSyncSent("draft-approved-1");
    const queue = await getPostCraftSyncQueue();
    expect(queue.items[0].status).toBe("sent");
    expect(queue.items[0].lastSyncAttempt).toBeTruthy();
  });

  it("6. skip removes item from active queue", async () => {
    await saveContentDraft(approvedDraft());
    await markSyncSkipped("draft-approved-1");
    const queue = await getPostCraftSyncQueue();
    expect(queue.items.length).toBe(0);
  });

  it("7. blocks unsafe payloads — no conversation, messages, or PII", () => {
    const safe = sanitizePostCraftSyncPayload(approvedDraft());
    expect(safe).not.toBeNull();
    expect(safe?.topic).toBe("Overwhelm");

    const withConversation = approvedDraft({
      body: 'The user said in conversation: "I am overwhelmed"',
    });
    expect(sanitizePostCraftSyncPayload(withConversation)).toBeNull();

    const withEmail = approvedDraft({
      body: "Contact me at founder@example.com for details",
    });
    expect(sanitizePostCraftSyncPayload(withEmail)).toBeNull();

    const forbiddenKeyPayload = {
      ...toPostCraftSyncPayload(approvedDraft()),
      message: "secret chat",
    } as ReturnType<typeof toPostCraftSyncPayload>;
    expect(payloadIsSyncSafe(forbiddenKeyPayload)).toBe(false);

    const queue = buildSyncQueueItems([approvedDraft()], new Map());
    expect("payload" in queue[0]).toBe(false);
  });

  it("send succeeds when PostCraft API is configured", async () => {
    vi.stubEnv("POSTCRAFT_API_URL", "https://postcraft.example/ingest");
    vi.stubEnv("POSTCRAFT_API_KEY", "test-key");
    expect(isPostCraftApiConfigured()).toBe(true);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );

    await saveContentDraft(approvedDraft());
    const result = await sendDraftToPostCraft("draft-approved-1");
    expect(result.ok).toBe(true);
    expect(result.connected).toBe(true);

    const queue = await getPostCraftSyncQueue();
    expect(queue.items[0].status).toBe("sent");
  });
});
