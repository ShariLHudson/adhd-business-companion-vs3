import type { GrowthAttachment } from "@/lib/growthAttachments";
import { resolveGrowthAttachment } from "@/lib/growthAttachments";
import type { EcosystemObjectKind } from "@/lib/intelligence/intelligenceReadyTypes";
import { addAssetReference } from "./assetLibraryStore";
import type { AssetRecordKind } from "./types";

const KIND_TO_OBJECT: Partial<Record<AssetRecordKind, EcosystemObjectKind>> = {
  portfolio: "project",
  "evidence-bank": "document",
  journal: "journal-entry",
  "capture-session": "capture-session",
  journey: "journal-entry",
  win: "momentum-event",
};

export function linkGrowthAttachmentsToRecord(
  attachments: GrowthAttachment[],
  recordKind: AssetRecordKind,
  recordId: string,
): void {
  const objectKind = KIND_TO_OBJECT[recordKind];
  for (const att of attachments) {
    if (!att.assetId) continue;
    addAssetReference({
      assetId: att.assetId,
      recordId,
      recordKind,
      recordObjectKind: objectKind,
    });
  }
}

export function growthAttachmentsFromAssetIds(
  assetIds: string[],
): GrowthAttachment[] {
  return assetIds.map((assetId) => {
    const resolved = resolveGrowthAttachment({
      id: `att-ref-${assetId}`,
      assetId,
      kind: "file",
      name: "",
      url: "",
    });
    return resolved;
  });
}
