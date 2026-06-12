// PostCraft Sync Queue — approved drafts ready for manual founder-triggered sync.

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";

import type { ContentDraft } from "./postcraftDraftGenerator";
import { toPostCraftSyncPayload } from "./postcraftDraftGenerator";
import { loadContentDrafts } from "./postcraftDraftStore";

export type PostCraftSyncStatus = "ready" | "sent" | "failed" | "skipped";

export type PostCraftSyncMeta = {
  draftId: string;
  status: PostCraftSyncStatus;
  lastSyncAttempt?: string;
  error?: string;
  updatedAt: string;
};

export type PostCraftSyncPayload = ReturnType<typeof toPostCraftSyncPayload>;

export type PostCraftSyncQueueItem = {
  draftId: string;
  title: string;
  assetType: string;
  assetLabel: string;
  topic: string;
  angle: string;
  status: PostCraftSyncStatus;
  approvedAt?: string;
  lastSyncAttempt?: string;
  error?: string;
};

export type PostCraftSyncQueueView = {
  connected: boolean;
  items: PostCraftSyncQueueItem[];
};

const TABLE = "ecosystem_postcraft_sync";
const memoryMeta = new Map<string, PostCraftSyncMeta>();

const FORBIDDEN_PAYLOAD_KEYS = [
  "conversation",
  "transcript",
  "message",
  "messages",
  "chat",
  "userMessage",
  "userId",
  "email",
  "phone",
  "name",
  "password",
  "prompt",
  "completion",
];

const PII_PATTERNS = [
  /\b[\w.+-]+@[\w.-]+\.\w{2,}\b/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
];

/** Allowed fields only — approved draft content + metadata (no raw user messages). */
export function sanitizePostCraftSyncPayload(
  draft: ContentDraft,
): PostCraftSyncPayload | null {
  if (!isDraftEligibleForSyncQueue(draft)) return null;

  const payload: PostCraftSyncPayload = {
    id: draft.id,
    status: draft.status,
    topic: draft.topic,
    assetType: draft.assetType,
    assetLabel: draft.assetLabel,
    title: draft.title,
    angle: draft.angle,
    body: draft.body,
    opportunityScore: draft.opportunityScore,
    trend: draft.trend,
    sourceSignalSummary: draft.sourceSignalSummary,
    approvedAt: draft.approvedAt,
    updatedAt: draft.updatedAt,
  };

  if (!payloadIsSyncSafe(payload)) return null;
  const blob = JSON.stringify(payload);
  if (PII_PATTERNS.some((re) => re.test(blob))) return null;
  return payload;
}

export function isPostCraftApiConfigured(): boolean {
  return Boolean(
    process.env.POSTCRAFT_API_URL?.trim() &&
      process.env.POSTCRAFT_API_KEY?.trim(),
  );
}

export function isDraftEligibleForSyncQueue(draft: ContentDraft): boolean {
  return (
    draft.postCraftSyncReady === true &&
    draft.status === "approved"
  );
}

const FORBIDDEN_CONTENT_PHRASES = [
  "user said in conversation",
  "chat transcript",
  "raw message",
  "conversation text",
];

export function payloadIsSyncSafe(payload: PostCraftSyncPayload): boolean {
  const blob = JSON.stringify(payload).toLowerCase();
  if (FORBIDDEN_PAYLOAD_KEYS.some((k) => blob.includes(`"${k}"`))) return false;
  if (FORBIDDEN_CONTENT_PHRASES.some((p) => blob.includes(p))) return false;
  return !PII_PATTERNS.some((re) => re.test(blob));
}

function defaultMeta(draftId: string): PostCraftSyncMeta {
  const now = new Date().toISOString();
  return { draftId, status: "ready", updatedAt: now };
}

async function loadAllMeta(): Promise<Map<string, PostCraftSyncMeta>> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return new Map(memoryMeta);

  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) {
    console.error("postcraft_sync load", error);
    return new Map(memoryMeta);
  }

  const map = new Map<string, PostCraftSyncMeta>();
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const draftId = String(r.draft_id);
    map.set(draftId, {
      draftId,
      status: (r.status as PostCraftSyncStatus) ?? "ready",
      lastSyncAttempt: r.last_sync_attempt
        ? String(r.last_sync_attempt)
        : undefined,
      error: r.error ? String(r.error) : undefined,
      updatedAt: String(r.updated_at),
    });
  }
  return map;
}

async function saveMeta(meta: PostCraftSyncMeta): Promise<PostCraftSyncMeta> {
  memoryMeta.set(meta.draftId, meta);

  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return meta;

  const { error } = await supabase.from(TABLE).upsert({
    draft_id: meta.draftId,
    status: meta.status,
    last_sync_attempt: meta.lastSyncAttempt ?? null,
    error: meta.error ?? null,
    updated_at: meta.updatedAt,
  });

  if (error) console.error("postcraft_sync save", error);
  return meta;
}

export function buildSyncQueueItems(
  drafts: ContentDraft[],
  metaMap: Map<string, PostCraftSyncMeta>,
): PostCraftSyncQueueItem[] {
  return drafts
    .filter(isDraftEligibleForSyncQueue)
    .map((draft) => {
      const meta = metaMap.get(draft.id) ?? defaultMeta(draft.id);
      return {
        draftId: draft.id,
        title: draft.title,
        assetType: draft.assetType,
        assetLabel: draft.assetLabel,
        topic: draft.topic,
        angle: draft.angle,
        status: meta.status,
        approvedAt: draft.approvedAt,
        lastSyncAttempt: meta.lastSyncAttempt,
        error: meta.error,
      };
    })
    .filter((item) => item.status !== "skipped")
    .sort((a, b) => {
      const aTime = a.approvedAt ?? "";
      const bTime = b.approvedAt ?? "";
      return bTime.localeCompare(aTime);
    });
}

export async function getPostCraftSyncQueue(
  drafts?: ContentDraft[],
): Promise<PostCraftSyncQueueView> {
  const allDrafts = drafts ?? (await loadContentDrafts());
  const metaMap = await loadAllMeta();
  const items = buildSyncQueueItems(allDrafts, metaMap);
  return {
    connected: isPostCraftApiConfigured(),
    items,
  };
}

export async function markSyncSent(draftId: string): Promise<PostCraftSyncMeta> {
  const now = new Date().toISOString();
  return saveMeta({
    draftId,
    status: "sent",
    lastSyncAttempt: now,
    error: undefined,
    updatedAt: now,
  });
}

export async function markSyncSkipped(draftId: string): Promise<PostCraftSyncMeta> {
  const now = new Date().toISOString();
  return saveMeta({
    draftId,
    status: "skipped",
    updatedAt: now,
  });
}

export async function markSyncRetry(draftId: string): Promise<PostCraftSyncMeta> {
  const now = new Date().toISOString();
  return saveMeta({
    draftId,
    status: "ready",
    error: undefined,
    updatedAt: now,
  });
}

export async function attemptPostCraftSend(
  draft: ContentDraft,
): Promise<{ ok: boolean; error?: string }> {
  if (!isPostCraftApiConfigured()) {
    return { ok: false, error: "PostCraft is not connected yet." };
  }

  const payload = sanitizePostCraftSyncPayload(draft);
  if (!payload) {
    return {
      ok: false,
      error: "Payload blocked — only approved metadata and content allowed.",
    };
  }

  const url = process.env.POSTCRAFT_API_URL!.trim();
  const key = process.env.POSTCRAFT_API_KEY!.trim();
  const now = new Date().toISOString();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = `PostCraft returned ${res.status}`;
      await saveMeta({
        draftId: draft.id,
        status: "failed",
        lastSyncAttempt: now,
        error: err,
        updatedAt: now,
      });
      return { ok: false, error: err };
    }

    await saveMeta({
      draftId: draft.id,
      status: "sent",
      lastSyncAttempt: now,
      error: undefined,
      updatedAt: now,
    });
    return { ok: true };
  } catch {
    const err = "PostCraft sync failed.";
    await saveMeta({
      draftId: draft.id,
      status: "failed",
      lastSyncAttempt: now,
      error: err,
      updatedAt: now,
    });
    return { ok: false, error: err };
  }
}

export async function sendDraftToPostCraft(
  draftId: string,
): Promise<{ ok: boolean; error?: string; connected: boolean }> {
  const drafts = await loadContentDrafts();
  const draft = drafts.find((d) => d.id === draftId);
  if (!draft || !isDraftEligibleForSyncQueue(draft)) {
    return { ok: false, error: "Draft not eligible for sync.", connected: isPostCraftApiConfigured() };
  }

  if (!isPostCraftApiConfigured()) {
    const now = new Date().toISOString();
    await saveMeta({
      draftId,
      status: "ready",
      lastSyncAttempt: now,
      error: "PostCraft is not connected yet.",
      updatedAt: now,
    });
    return { ok: false, error: "PostCraft is not connected yet.", connected: false };
  }

  const result = await attemptPostCraftSend(draft);
  return { ...result, connected: true };
}

export function resetPostCraftSyncQueue(): void {
  memoryMeta.clear();
}

export function syncQueueStoreConfigured(): boolean {
  return founderSupabaseConfigured() || memoryMeta.size > 0;
}
