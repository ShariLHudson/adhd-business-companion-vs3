// Google Workspace Automation — ecosystem intelligence → Google assets.

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";
import {
  createGoogleDriveFile,
  createGoogleDriveFolder,
  googleUrlForFile,
  updateGoogleDriveFile,
} from "@/lib/googleDriveServer";
import type { GTokens } from "@/lib/google";
import { recommendGoogleExport } from "@/lib/googleWorkspace";
import type { GoogleFileKind } from "@/lib/googleWorkspace";
import type { GhlContentOpportunity } from "@/lib/ghl/types";

import type { ContentDraft } from "./postcraftDraftGenerator";

export type GoogleAssetKind = GoogleFileKind | "folder";

export type GoogleAssetSourceType =
  | "content_opportunity"
  | "approved_draft"
  | "workshop"
  | "lead_magnet"
  | "newsletter"
  | "blog"
  | "sop"
  | "founder_note";

export const GOOGLE_ASSET_SOURCE_TYPES: GoogleAssetSourceType[] = [
  "content_opportunity",
  "approved_draft",
  "workshop",
  "lead_magnet",
  "newsletter",
  "blog",
  "sop",
  "founder_note",
];

export type GoogleWorkspaceAutomationAction =
  | "create_doc"
  | "create_sheet"
  | "create_form"
  | "save_to_drive"
  | "update_document";

export type FounderGoogleWorkspaceAction =
  | "open_in_google"
  | "save_to_drive"
  | "create_folder"
  | "archive_asset";

export type EcosystemGoogleAsset = {
  id: string;
  title: string;
  kind: GoogleAssetKind;
  sourceType: GoogleAssetSourceType;
  sourceId: string;
  googleFileId: string;
  googleUrl: string;
  folderId?: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type GoogleAssetPayload = {
  title: string;
  content: string;
  kind: GoogleFileKind;
  sourceType: GoogleAssetSourceType;
  sourceId: string;
};

const ASSETS_TABLE = "ecosystem_google_assets";
const assetMemory = new Map<string, EcosystemGoogleAsset>();

export function recommendGoogleKindForSource(
  sourceType: GoogleAssetSourceType,
  title = "",
  content = "",
): GoogleFileKind {
  if (sourceType === "lead_magnet" && /\b(form|quiz|survey)\b/i.test(title)) {
    return "form";
  }
  if (sourceType === "workshop" || sourceType === "sop" || sourceType === "blog") {
    return "doc";
  }
  if (sourceType === "newsletter") return "doc";
  return recommendGoogleExport(sourceType.replace(/_/g, " "), content);
}

export function mapDraftToSourceType(draft: ContentDraft): GoogleAssetSourceType {
  if (draft.status === "approved") return "approved_draft";
  switch (draft.assetType) {
    case "workshop":
      return "workshop";
    case "lead_magnet":
      return "lead_magnet";
    case "newsletter":
      return "newsletter";
    case "blog":
      return "blog";
    default:
      return "content_opportunity";
  }
}

export function buildContentFromDraft(draft: ContentDraft): GoogleAssetPayload {
  const sourceType = mapDraftToSourceType(draft);
  const content = [
    draft.title,
    "",
    draft.angle,
    "",
    "---",
    "",
    draft.body,
    "",
    `Why this matters: ${draft.whyThisMatters}`,
    `Signals: ${draft.sourceSignalSummary}`,
  ].join("\n");

  return {
    title: draft.title,
    content,
    kind: recommendGoogleKindForSource(sourceType, draft.title, content),
    sourceType,
    sourceId: draft.id,
  };
}

export function buildContentFromOpportunity(
  opportunity: GhlContentOpportunity,
  assetType = "blog",
): GoogleAssetPayload {
  const asset =
    opportunity.assetIdeas?.find((a) => a.type === assetType) ??
    opportunity.assetIdeas?.[0];

  const title = asset?.title ?? `${opportunity.topic} — ${assetType}`;
  const angle = asset?.angle ?? opportunity.whyThisMatters ?? "";
  const sourceType: GoogleAssetSourceType =
    assetType === "workshop"
      ? "workshop"
      : assetType === "newsletter"
        ? "newsletter"
        : assetType === "lead_magnet"
          ? "lead_magnet"
          : assetType === "blog"
            ? "blog"
            : "content_opportunity";

  const content = [
    title,
    "",
    angle,
    "",
    `Topic: ${opportunity.topic}`,
    `Opportunity score: ${opportunity.opportunityScore}`,
    `Mentions: ${opportunity.mentions}`,
    opportunity.whyThisMatters ? `\n${opportunity.whyThisMatters}` : "",
    "",
    "Suggested sections:",
    "- Hook",
    "- Practical steps",
    "- Gentle close / CTA",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title,
    content,
    kind: recommendGoogleKindForSource(sourceType, title, content),
    sourceType,
    sourceId: opportunity.topicKey ?? opportunity.topic,
  };
}

export function buildContentFromFounderNote(input: {
  id: string;
  title: string;
  body: string;
}): GoogleAssetPayload {
  return {
    title: input.title,
    content: input.body,
    kind: "doc",
    sourceType: "founder_note",
    sourceId: input.id,
  };
}

export function buildContentFromSop(input: {
  id: string;
  title: string;
  steps: string[];
}): GoogleAssetPayload {
  const content = [
    input.title,
    "",
    ...input.steps.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");
  return {
    title: input.title,
    content,
    kind: "doc",
    sourceType: "sop",
    sourceId: input.id,
  };
}

export function actionToKind(action: GoogleWorkspaceAutomationAction): GoogleFileKind | null {
  if (action === "create_sheet") return "sheet";
  if (action === "create_form") return "form";
  if (action === "create_doc" || action === "save_to_drive") return "doc";
  return null;
}

// ---- Asset registry ----------------------------------------------------------

function rowToAsset(row: Record<string, unknown>): EcosystemGoogleAsset {
  return {
    id: String(row.id),
    title: String(row.title),
    kind: row.kind as GoogleAssetKind,
    sourceType: row.source_type as GoogleAssetSourceType,
    sourceId: String(row.source_id),
    googleFileId: String(row.google_file_id),
    googleUrl: String(row.google_url),
    folderId: row.folder_id ? String(row.folder_id) : undefined,
    status: (row.status as EcosystemGoogleAsset["status"]) ?? "active",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function saveAsset(asset: EcosystemGoogleAsset): Promise<EcosystemGoogleAsset> {
  assetMemory.set(asset.id, asset);
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return asset;

  const { error } = await supabase.from(ASSETS_TABLE).upsert({
    id: asset.id,
    title: asset.title,
    kind: asset.kind,
    source_type: asset.sourceType,
    source_id: asset.sourceId,
    google_file_id: asset.googleFileId,
    google_url: asset.googleUrl,
    folder_id: asset.folderId ?? null,
    status: asset.status,
    created_at: asset.createdAt,
    updated_at: asset.updatedAt,
  });

  if (error) console.error("ecosystem_google_assets save", error);
  return asset;
}

export async function loadAllEcosystemGoogleAssets(): Promise<EcosystemGoogleAsset[]> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return [...assetMemory.values()];

  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("ecosystem_google_assets load", error);
    return [...assetMemory.values()];
  }

  return (data ?? []).map((row) => rowToAsset(row as Record<string, unknown>));
}

export async function findAssetBySource(
  sourceType: GoogleAssetSourceType,
  sourceId: string,
): Promise<EcosystemGoogleAsset | null> {
  const all = await loadAllEcosystemGoogleAssets();
  return (
    all.find(
      (a) =>
        a.sourceType === sourceType &&
        a.sourceId === sourceId &&
        a.status === "active",
    ) ?? null
  );
}

export async function registerEcosystemGoogleAsset(input: {
  title: string;
  kind: GoogleFileKind;
  sourceType: GoogleAssetSourceType;
  sourceId: string;
  googleFileId: string;
  googleUrl?: string;
  folderId?: string;
}): Promise<EcosystemGoogleAsset> {
  const now = new Date().toISOString();
  const asset: EcosystemGoogleAsset = {
    id: `gasset-${input.googleFileId}`,
    title: input.title,
    kind: input.kind,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    googleFileId: input.googleFileId,
    googleUrl: input.googleUrl ?? googleUrlForFile(input.kind, input.googleFileId),
    folderId: input.folderId,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  return saveAsset(asset);
}

export async function archiveEcosystemGoogleAsset(assetId: string): Promise<EcosystemGoogleAsset | null> {
  const all = await loadAllEcosystemGoogleAssets();
  const existing = all.find((a) => a.id === assetId);
  if (!existing) return null;
  const next = { ...existing, status: "archived" as const, updatedAt: new Date().toISOString() };
  return saveAsset(next);
}

export function resetGoogleAssetStore(): void {
  assetMemory.clear();
}

export function googleAssetStoreConfigured(): boolean {
  return founderSupabaseConfigured() || assetMemory.size > 0;
}

// ---- Automation execution (server) -------------------------------------------

export async function executeGoogleWorkspaceAutomation(input: {
  tokens: GTokens;
  action: GoogleWorkspaceAutomationAction;
  payload: GoogleAssetPayload;
  folderId?: string;
  existingFileId?: string;
}): Promise<EcosystemGoogleAsset> {
  const kind =
    actionToKind(input.action) ?? input.payload.kind;

  if (input.action === "update_document") {
    if (!input.existingFileId) {
      throw new Error("existingFileId required for update.");
    }
    await updateGoogleDriveFile(input.tokens, {
      fileId: input.existingFileId,
      content: input.payload.content,
      kind,
    });
    const existing = (await loadAllEcosystemGoogleAssets()).find(
      (a) => a.googleFileId === input.existingFileId,
    );
    if (existing) {
      const updated = {
        ...existing,
        title: input.payload.title,
        updatedAt: new Date().toISOString(),
      };
      return saveAsset(updated);
    }
    return registerEcosystemGoogleAsset({
      title: input.payload.title,
      kind,
      sourceType: input.payload.sourceType,
      sourceId: input.payload.sourceId,
      googleFileId: input.existingFileId,
    });
  }

  const created = await createGoogleDriveFile(input.tokens, {
    title: input.payload.title,
    content: input.payload.content,
    kind,
    folderId: input.folderId,
  });

  return registerEcosystemGoogleAsset({
    title: input.payload.title,
    kind: created.kind,
    sourceType: input.payload.sourceType,
    sourceId: input.payload.sourceId,
    googleFileId: created.fileId,
    googleUrl: created.url,
    folderId: input.folderId,
  });
}

export async function executeFounderGoogleAction(input: {
  tokens: GTokens;
  action: FounderGoogleWorkspaceAction;
  assetId?: string;
  folderName?: string;
  parentFolderId?: string;
}): Promise<{ url?: string; folderId?: string; asset?: EcosystemGoogleAsset }> {
  if (input.action === "create_folder") {
    const folder = await createGoogleDriveFolder(
      input.tokens,
      input.folderName ?? "Ecosystem Assets",
      input.parentFolderId,
    );
    return { url: folder.url, folderId: folder.folderId };
  }

  if (!input.assetId) {
    throw new Error("assetId required.");
  }

  const all = await loadAllEcosystemGoogleAssets();
  const asset = all.find((a) => a.id === input.assetId);
  if (!asset) throw new Error("Asset not found.");

  if (input.action === "open_in_google" || input.action === "save_to_drive") {
    return { url: asset.googleUrl, asset };
  }

  if (input.action === "archive_asset") {
    const archived = await archiveEcosystemGoogleAsset(asset.id);
    return { asset: archived ?? undefined };
  }

  return {};
}

export function listActiveAssetsForFounder(
  assets: EcosystemGoogleAsset[],
): EcosystemGoogleAsset[] {
  return assets.filter((a) => a.status === "active");
}
