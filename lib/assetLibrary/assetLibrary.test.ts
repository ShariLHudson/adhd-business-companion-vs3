import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addAssetReference,
  createAssetRecord,
  findAssetByContentHash,
  getAssetRecords,
  getAssetReferences,
  getUnattachedAssets,
} from "./assetLibraryStore";
import { hashAssetContent } from "./ingest";
import { linkGrowthAttachmentsToRecord } from "./references";
import { searchAssets } from "./search";

describe("assetLibrary", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("window", {
      localStorage,
      dispatchEvent: () => {},
    });
  });

  it("stores assets once with content hash dedup", () => {
    const url = "data:image/png;base64,abc";
    const hash = hashAssetContent(url, "test.png");
    const a = createAssetRecord({
      filename: "test.png",
      category: "image",
      mimeType: "image/png",
      url,
      contentHash: hash,
    });
    expect(findAssetByContentHash(hash)?.id).toBe(a.id);
    expect(getAssetRecords()).toHaveLength(1);
  });

  it("tracks references without duplicating assets", () => {
    const asset = createAssetRecord({
      filename: "proof.pdf",
      category: "pdf",
      mimeType: "application/pdf",
      url: "data:application/pdf;base64,x",
    });
    addAssetReference({
      assetId: asset.id,
      recordId: "ev-1",
      recordKind: "evidence-bank",
    });
    addAssetReference({
      assetId: asset.id,
      recordId: "pf-1",
      recordKind: "portfolio",
    });
    expect(getAssetReferences(asset.id)).toHaveLength(2);
    expect(getUnattachedAssets()).toHaveLength(0);
  });

  it("links growth attachments by assetId", () => {
    const asset = createAssetRecord({
      filename: "shot.png",
      category: "screenshot",
      mimeType: "image/png",
      url: "data:image/png;base64,y",
    });
    linkGrowthAttachmentsToRecord(
      [
        {
          id: "att-1",
          assetId: asset.id,
          kind: "image",
          name: "shot.png",
          url: "",
        },
      ],
      "journal",
      "jr-1",
    );
    const hits = searchAssets({ recordId: "jr-1", recordKind: "journal" });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.id).toBe(asset.id);
  });
});
