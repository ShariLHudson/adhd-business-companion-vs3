// Content Drafts persistence — founder review queue (no auto-publish).

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";

import type { ContentDraft, ContentDraftStatus } from "./postcraftDraftGenerator";

const TABLE = "ecosystem_content_drafts";
const MAX_DRAFTS = 500;

const memory: ContentDraft[] = [];

function sortDrafts(rows: ContentDraft[]): ContentDraft[] {
  return [...rows].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function saveContentDraft(draft: ContentDraft): Promise<ContentDraft> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) {
    const idx = memory.findIndex((d) => d.id === draft.id);
    if (idx >= 0) memory[idx] = draft;
    else memory.push(draft);
    if (memory.length > MAX_DRAFTS) memory.splice(0, memory.length - MAX_DRAFTS);
    return draft;
  }

  const { error } = await supabase.from(TABLE).upsert({
    id: draft.id,
    topic: draft.topic,
    topic_key: draft.topicKey,
    asset_type: draft.assetType,
    asset_label: draft.assetLabel,
    title: draft.title,
    angle: draft.angle,
    opportunity_score: draft.opportunityScore,
    trend: draft.trend,
    source_signal_summary: draft.sourceSignalSummary,
    why_this_matters: draft.whyThisMatters,
    body: draft.body,
    status: draft.status,
    post_craft_sync_ready: draft.postCraftSyncReady,
    created_at: draft.createdAt,
    updated_at: draft.updatedAt,
    approved_at: draft.approvedAt ?? null,
  });

  if (error) {
    console.error("ecosystem_content_drafts save", error);
    const idx = memory.findIndex((d) => d.id === draft.id);
    if (idx >= 0) memory[idx] = draft;
    else memory.push(draft);
  }

  return draft;
}

function rowToDraft(row: Record<string, unknown>): ContentDraft {
  return {
    id: String(row.id),
    topic: String(row.topic),
    topicKey: String(row.topic_key),
    assetType: row.asset_type as ContentDraft["assetType"],
    assetLabel: String(row.asset_label),
    title: String(row.title),
    angle: String(row.angle),
    opportunityScore: Number(row.opportunity_score ?? 0),
    trend: (row.trend as ContentDraft["trend"]) ?? "stable",
    sourceSignalSummary: String(row.source_signal_summary ?? ""),
    whyThisMatters: String(row.why_this_matters ?? ""),
    body: String(row.body),
    status: (row.status as ContentDraftStatus) ?? "drafted",
    postCraftSyncReady: Boolean(row.post_craft_sync_ready),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    approvedAt: row.approved_at ? String(row.approved_at) : undefined,
  };
}

export async function loadContentDrafts(): Promise<ContentDraft[]> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return sortDrafts(memory);

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(MAX_DRAFTS);

  if (error) {
    console.error("ecosystem_content_drafts load", error);
    return sortDrafts(memory);
  }

  return (data ?? []).map((row) => rowToDraft(row as Record<string, unknown>));
}

export async function getContentDraft(id: string): Promise<ContentDraft | null> {
  const all = await loadContentDrafts();
  return all.find((d) => d.id === id) ?? null;
}

export async function updateContentDraft(
  id: string,
  patch: Partial<
    Pick<ContentDraft, "body" | "status" | "postCraftSyncReady" | "title" | "angle">
  >,
): Promise<ContentDraft | null> {
  const existing = await getContentDraft(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const next: ContentDraft = {
    ...existing,
    ...patch,
    updatedAt: now,
  };

  if (patch.status === "approved" && !next.approvedAt) {
    next.approvedAt = now;
    next.postCraftSyncReady = true;
  }

  return saveContentDraft(next);
}

export function contentDraftStoreConfigured(): boolean {
  return founderSupabaseConfigured() || memory.length > 0;
}

export function resetContentDraftStore(): void {
  memory.length = 0;
}
