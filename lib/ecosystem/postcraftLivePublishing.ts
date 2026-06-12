// PostCraft Live Publishing — approved drafts → PostCraft → tracked outcomes.

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";

import type { ContentDraft } from "./postcraftDraftGenerator";
import { sanitizePostCraftSyncPayload } from "./postcraftSyncQueue";
import {
  getPostCraftSyncQueue,
  isDraftEligibleForSyncQueue,
  isPostCraftApiConfigured,
  markSyncRetry,
  markSyncSent,
  markSyncSkipped,
  type PostCraftSyncMeta,
  type PostCraftSyncStatus,
} from "./postcraftSyncQueue";
import { getContentDraft, loadContentDrafts, updateContentDraft } from "./postcraftDraftStore";

export type PostCraftPublishStatus =
  | "drafted"
  | "approved"
  | "queued"
  | "sent_to_postcraft"
  | "scheduled"
  | "published"
  | "failed";

export const POSTCRAFT_PUBLISH_STATUSES: PostCraftPublishStatus[] = [
  "drafted",
  "approved",
  "queued",
  "sent_to_postcraft",
  "scheduled",
  "published",
  "failed",
];

export type PublishResults = {
  views?: number;
  clicks?: number;
  engagementScore?: number;
};

export type PostCraftPublishingRecord = {
  draftId: string;
  publishStatus: PostCraftPublishStatus;
  postcraftId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  publishResults?: PublishResults;
  error?: string;
  updatedAt: string;
};

export type PostCraftPublishingItem = {
  draftId: string;
  title: string;
  topic: string;
  assetType: string;
  assetLabel: string;
  publishStatus: PostCraftPublishStatus;
  opportunityScore: number;
  scheduledAt?: string;
  publishedAt?: string;
  publishResults?: PublishResults;
  error?: string;
  lastSyncAttempt?: string;
};

export type PostCraftPublishingDashboardMetrics = {
  contentPublished: number;
  contentScheduled: number;
  failedPublications: number;
  topPerformingTopics: { topic: string; score: number }[];
};

export type PostCraftPublishingIntelligence = {
  connected: boolean;
  metrics: PostCraftPublishingDashboardMetrics;
  items: PostCraftPublishingItem[];
  generatedAt: string;
};

export type FounderPublishingAction =
  | "publish_now"
  | "schedule"
  | "retry"
  | "cancel"
  | "view_status";

const TABLE = "ecosystem_postcraft_publishing";
const publishingMemory = new Map<string, PostCraftPublishingRecord>();

export function mapSyncStatusToPublish(
  syncStatus: PostCraftSyncStatus | undefined,
): PostCraftPublishStatus | null {
  switch (syncStatus) {
    case "ready":
      return "queued";
    case "sent":
      return "sent_to_postcraft";
    case "failed":
      return "failed";
    default:
      return null;
  }
}

export function resolvePublishStatus(
  draft: ContentDraft,
  syncMeta?: PostCraftSyncMeta,
  record?: PostCraftPublishingRecord,
): PostCraftPublishStatus {
  if (record?.publishStatus === "scheduled" || record?.publishStatus === "published") {
    return record.publishStatus;
  }
  if (draft.status === "published") return "published";
  if (draft.status === "scheduled") return "scheduled";
  if (syncMeta?.status === "failed" || record?.publishStatus === "failed") {
    return "failed";
  }
  if (syncMeta?.status === "sent") return "sent_to_postcraft";
  if (isDraftEligibleForSyncQueue(draft) && syncMeta?.status === "ready") {
    return "queued";
  }
  if (draft.status === "approved") return "approved";
  return "drafted";
}

export function parsePostCraftApiResponse(
  body: unknown,
): {
  postcraftId?: string;
  status?: PostCraftPublishStatus;
  scheduledAt?: string;
  publishedAt?: string;
  results?: PublishResults;
} {
  if (!body || typeof body !== "object") return {};
  const r = body as Record<string, unknown>;
  const rawStatus = String(r.status ?? "").toLowerCase();

  let status: PostCraftPublishStatus | undefined;
  if (rawStatus.includes("publish")) status = "published";
  else if (rawStatus.includes("schedul")) status = "scheduled";
  else if (rawStatus.includes("fail")) status = "failed";
  else if (rawStatus.includes("queue") || rawStatus.includes("sent")) {
    status = "sent_to_postcraft";
  }

  const metrics = r.metrics ?? r.results;
  let results: PublishResults | undefined;
  if (metrics && typeof metrics === "object") {
    const m = metrics as Record<string, unknown>;
    results = {
      views: typeof m.views === "number" ? m.views : undefined,
      clicks: typeof m.clicks === "number" ? m.clicks : undefined,
      engagementScore:
        typeof m.engagementScore === "number" ? m.engagementScore : undefined,
    };
  }

  return {
    postcraftId: typeof r.id === "string" ? r.id : undefined,
    status,
    scheduledAt: typeof r.scheduledAt === "string" ? r.scheduledAt : undefined,
    publishedAt: typeof r.publishedAt === "string" ? r.publishedAt : undefined,
    results,
  };
}

function rowToRecord(row: Record<string, unknown>): PostCraftPublishingRecord {
  return {
    draftId: String(row.draft_id),
    publishStatus: (row.publish_status as PostCraftPublishStatus) ?? "queued",
    postcraftId: row.postcraft_id ? String(row.postcraft_id) : undefined,
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    publishResults: row.publish_results as PublishResults | undefined,
    error: row.error ? String(row.error) : undefined,
    updatedAt: String(row.updated_at),
  };
}

async function savePublishingRecord(
  record: PostCraftPublishingRecord,
): Promise<PostCraftPublishingRecord> {
  publishingMemory.set(record.draftId, record);
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return record;

  const { error } = await supabase.from(TABLE).upsert({
    draft_id: record.draftId,
    publish_status: record.publishStatus,
    postcraft_id: record.postcraftId ?? null,
    scheduled_at: record.scheduledAt ?? null,
    published_at: record.publishedAt ?? null,
    publish_results: record.publishResults ?? null,
    error: record.error ?? null,
    updated_at: record.updatedAt,
  });

  if (error) console.error("postcraft_publishing save", error);
  return record;
}

export async function loadAllPublishingRecords(): Promise<
  Map<string, PostCraftPublishingRecord>
> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return new Map(publishingMemory);

  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) {
    console.error("postcraft_publishing load", error);
    return new Map(publishingMemory);
  }

  const map = new Map<string, PostCraftPublishingRecord>();
  for (const row of data ?? []) {
    const rec = rowToRecord(row as Record<string, unknown>);
    map.set(rec.draftId, rec);
  }
  return map;
}

export function buildPublishingItems(
  drafts: ContentDraft[],
  syncMeta: Map<string, PostCraftSyncMeta>,
  records: Map<string, PostCraftPublishingRecord>,
): PostCraftPublishingItem[] {
  return drafts
    .filter((d) => d.status !== "idea")
    .map((draft) => {
      const meta = syncMeta.get(draft.id);
      const record = records.get(draft.id);
      return {
        draftId: draft.id,
        title: draft.title,
        topic: draft.topic,
        assetType: draft.assetType,
        assetLabel: draft.assetLabel,
        publishStatus: resolvePublishStatus(draft, meta, record),
        opportunityScore: draft.opportunityScore,
        scheduledAt: record?.scheduledAt,
        publishedAt: record?.publishedAt,
        publishResults: record?.publishResults,
        error: record?.error ?? meta?.error,
        lastSyncAttempt: meta?.lastSyncAttempt,
      };
    })
    .sort((a, b) => {
      const score = (s: PostCraftPublishStatus) => {
        if (s === "failed") return 0;
        if (s === "queued") return 1;
        if (s === "sent_to_postcraft") return 2;
        if (s === "scheduled") return 3;
        if (s === "approved") return 4;
        return 5;
      };
      return score(a.publishStatus) - score(b.publishStatus);
    });
}

export function computePublishingDashboardMetrics(
  items: PostCraftPublishingItem[],
): PostCraftPublishingDashboardMetrics {
  const published = items.filter((i) => i.publishStatus === "published");
  const scheduled = items.filter((i) => i.publishStatus === "scheduled");
  const failed = items.filter((i) => i.publishStatus === "failed");

  const topicScores = new Map<string, number>();
  for (const item of published) {
    const score =
      item.publishResults?.engagementScore ??
      item.publishResults?.views ??
      item.opportunityScore;
    const prev = topicScores.get(item.topic) ?? 0;
    topicScores.set(item.topic, prev + score);
  }
  for (const item of items) {
    if (!topicScores.has(item.topic)) {
      topicScores.set(item.topic, item.opportunityScore);
    }
  }

  const topPerformingTopics = [...topicScores.entries()]
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    contentPublished: published.length,
    contentScheduled: scheduled.length,
    failedPublications: failed.length,
    topPerformingTopics,
  };
}

export async function loadPostCraftPublishingIntelligence(): Promise<PostCraftPublishingIntelligence> {
  const [drafts, queue, records] = await Promise.all([
    loadContentDrafts(),
    getPostCraftSyncQueue(),
    loadAllPublishingRecords(),
  ]);

  const syncMeta = new Map<string, PostCraftSyncMeta>();
  for (const item of queue.items) {
    syncMeta.set(item.draftId, {
      draftId: item.draftId,
      status: item.status,
      lastSyncAttempt: item.lastSyncAttempt,
      error: item.error,
      updatedAt: item.lastSyncAttempt ?? new Date().toISOString(),
    });
  }

  const items = buildPublishingItems(drafts, syncMeta, records);

  return {
    connected: queue.connected,
    metrics: computePublishingDashboardMetrics(items),
    items,
    generatedAt: new Date().toISOString(),
  };
}

async function pushToPostCraftApi(
  draft: ContentDraft,
  scheduledAt?: string,
): Promise<{
  ok: boolean;
  error?: string;
  parsed: ReturnType<typeof parsePostCraftApiResponse>;
}> {
  if (!isPostCraftApiConfigured()) {
    return { ok: false, error: "PostCraft is not connected yet.", parsed: {} };
  }

  const payload = sanitizePostCraftSyncPayload(draft);
  if (!payload) {
    return { ok: false, error: "Payload blocked.", parsed: {} };
  }

  const url = process.env.POSTCRAFT_API_URL!.trim();
  const key = process.env.POSTCRAFT_API_KEY!.trim();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        ...payload,
        scheduledAt,
        action: scheduledAt ? "schedule" : "publish",
      }),
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));
    const parsed = parsePostCraftApiResponse(body);

    if (!res.ok) {
      return {
        ok: false,
        error: `PostCraft returned ${res.status}`,
        parsed,
      };
    }

    return { ok: true, parsed };
  } catch {
    return { ok: false, error: "PostCraft publish failed.", parsed: {} };
  }
}

export async function pushToPostCraft(
  draftId: string,
  options: { scheduledAt?: string } = {},
): Promise<{ ok: boolean; error?: string; record?: PostCraftPublishingRecord }> {
  const draft = await getContentDraft(draftId);
  if (!draft || !isDraftEligibleForSyncQueue(draft)) {
    return { ok: false, error: "Draft not eligible for publishing." };
  }

  const now = new Date().toISOString();

  if (!isPostCraftApiConfigured()) {
    const record: PostCraftPublishingRecord = {
      draftId,
      publishStatus: "queued",
      error: "PostCraft is not connected yet.",
      updatedAt: now,
    };
    await savePublishingRecord(record);
    return { ok: false, error: record.error, record };
  }

  const result = await pushToPostCraftApi(draft, options.scheduledAt);

  if (!result.ok) {
    const record: PostCraftPublishingRecord = {
      draftId,
      publishStatus: "failed",
      error: result.error,
      updatedAt: now,
    };
    await savePublishingRecord(record);
    return { ok: false, error: result.error, record };
  }

  const status =
    result.parsed.status ??
    (options.scheduledAt ? "scheduled" : "sent_to_postcraft");

  const record: PostCraftPublishingRecord = {
    draftId,
    publishStatus: status,
    postcraftId: result.parsed.postcraftId,
    scheduledAt: result.parsed.scheduledAt ?? options.scheduledAt,
    publishedAt: result.parsed.publishedAt,
    publishResults: result.parsed.results,
    updatedAt: now,
  };
  await savePublishingRecord(record);
  await markSyncSent(draftId);

  if (status === "published") {
    await updateContentDraft(draftId, { status: "published" });
  } else if (status === "scheduled") {
    await updateContentDraft(draftId, { status: "scheduled" });
  }

  return { ok: true, record };
}

export async function receivePostCraftStatus(input: {
  draftId: string;
  status: PostCraftPublishStatus;
  postcraftId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  results?: PublishResults;
  error?: string;
}): Promise<PostCraftPublishingRecord> {
  const now = new Date().toISOString();
  const record: PostCraftPublishingRecord = {
    draftId: input.draftId,
    publishStatus: input.status,
    postcraftId: input.postcraftId,
    scheduledAt: input.scheduledAt,
    publishedAt: input.publishedAt,
    publishResults: input.results,
    error: input.error,
    updatedAt: now,
  };
  await savePublishingRecord(record);

  if (input.status === "published") {
    await updateContentDraft(input.draftId, { status: "published" });
  } else if (input.status === "scheduled") {
    await updateContentDraft(input.draftId, { status: "scheduled" });
  }

  return record;
}

export async function executeFounderPublishingAction(input: {
  action: FounderPublishingAction;
  draftId: string;
  scheduledAt?: string;
}): Promise<{
  ok: boolean;
  error?: string;
  item?: PostCraftPublishingItem;
  record?: PostCraftPublishingRecord;
}> {
  const { action, draftId } = input;

  if (action === "publish_now") {
    const result = await pushToPostCraft(draftId);
    const intel = await loadPostCraftPublishingIntelligence();
    const item = intel.items.find((i) => i.draftId === draftId);
    return { ok: result.ok, error: result.error, record: result.record, item };
  }

  if (action === "schedule") {
    if (!input.scheduledAt) {
      return { ok: false, error: "scheduledAt required." };
    }
    const result = await pushToPostCraft(draftId, { scheduledAt: input.scheduledAt });
    const intel = await loadPostCraftPublishingIntelligence();
    const item = intel.items.find((i) => i.draftId === draftId);
    return { ok: result.ok, error: result.error, record: result.record, item };
  }

  if (action === "retry") {
    await markSyncRetry(draftId);
    const result = await pushToPostCraft(draftId);
    const intel = await loadPostCraftPublishingIntelligence();
    const item = intel.items.find((i) => i.draftId === draftId);
    return { ok: result.ok, error: result.error, record: result.record, item };
  }

  if (action === "cancel") {
    await markSyncSkipped(draftId);
    const now = new Date().toISOString();
    const record = await savePublishingRecord({
      draftId,
      publishStatus: "approved",
      updatedAt: now,
    });
    await updateContentDraft(draftId, { status: "approved" });
    const intel = await loadPostCraftPublishingIntelligence();
    const item = intel.items.find((i) => i.draftId === draftId);
    return { ok: true, record, item };
  }

  if (action === "view_status") {
    const intel = await loadPostCraftPublishingIntelligence();
    const item = intel.items.find((i) => i.draftId === draftId);
    if (!item) return { ok: false, error: "Draft not found." };
    const records = await loadAllPublishingRecords();
    return { ok: true, item, record: records.get(draftId) };
  }

  return { ok: false, error: "Unknown action." };
}

export function answerPostCraftPublishingQuestion(
  question: string,
  intel: PostCraftPublishingIntelligence,
): { answer: string; nextStep: string } {
  const q = question.toLowerCase();
  const m = intel.metrics;

  if (q.includes("scheduled")) {
    const scheduled = intel.items.filter((i) => i.publishStatus === "scheduled");
    const list = scheduled
      .slice(0, 3)
      .map((i) => `${i.title} (${i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString() : "pending"})`)
      .join("; ");
    return {
      answer: scheduled.length
        ? `${m.contentScheduled} scheduled. ${list || ""}`
        : "Nothing scheduled right now.",
      nextStep: "Open PostCraft Publishing to schedule approved drafts.",
    };
  }

  if (q.includes("failed") || q.includes("what failed")) {
    const failed = intel.items.filter((i) => i.publishStatus === "failed");
    const list = failed
      .slice(0, 3)
      .map((i) => `${i.title}: ${i.error ?? "unknown error"}`)
      .join("; ");
    return {
      answer: failed.length
        ? `${m.failedPublications} failed. ${list}`
        : "No failed publications.",
      nextStep: failed.length ? "Retry the top failed item from the publishing queue." : "Keep approving drafts for sync.",
    };
  }

  if (q.includes("performed") || q.includes("best")) {
    const top = m.topPerformingTopics[0];
    return {
      answer: top
        ? `Top topic: ${top.topic} (score ${top.score}). ${m.contentPublished} published total.`
        : `Published: ${m.contentPublished}. Performance data builds after PostCraft sync.`,
      nextStep: "Publish more content on your top-performing topic.",
    };
  }

  return {
    answer: `Published ${m.contentPublished}, scheduled ${m.contentScheduled}, failed ${m.failedPublications}.`,
    nextStep: "Review PostCraft Publishing on the dashboard.",
  };
}

export function formatPublishingForAdvisor(intel: PostCraftPublishingIntelligence): string {
  const top = intel.metrics.topPerformingTopics[0];
  return [
    `Published: ${intel.metrics.contentPublished}`,
    `Scheduled: ${intel.metrics.contentScheduled}`,
    `Failed: ${intel.metrics.failedPublications}`,
    top ? `Top topic: ${top.topic} (${top.score})` : "Top topic: building",
    `Queue items: ${intel.items.filter((i) => ["queued", "sent_to_postcraft"].includes(i.publishStatus)).length}`,
  ].join(" · ");
}

export function resetPostCraftPublishingStore(): void {
  publishingMemory.clear();
}

export function publishingStoreConfigured(): boolean {
  return founderSupabaseConfigured() || publishingMemory.size > 0;
}
