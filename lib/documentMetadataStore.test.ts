import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDocumentRecoveryReply,
  isDocumentRecoveryRequest,
  listDocumentMetadata,
  upsertDocumentMetadata,
} from "./documentMetadataStore";

describe("documentMetadataStore", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      clear: () => {
        mem.clear();
      },
    });
  });

  it("stores and lists document metadata", () => {
    upsertDocumentMetadata({
      title: "ElevenLabs SOP",
      type: "SOP",
      googleUrl: "https://docs.google.com/document/d/abc/edit",
      googleFileId: "abc",
      googleKind: "doc",
    });
    const items = listDocumentMetadata();
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("ElevenLabs SOP");
  });

  it("detects recovery phrases", () => {
    expect(isDocumentRecoveryRequest("Where is my document?")).toBe(true);
    expect(isDocumentRecoveryRequest("Show my SOP")).toBe(true);
    expect(isDocumentRecoveryRequest("What's for lunch")).toBe(false);
  });

  it("formats honest reply when no metadata", () => {
    expect(formatDocumentRecoveryReply([])).toContain("don't have a Google link");
  });

  it("formats reply with Google link", () => {
    const msg = formatDocumentRecoveryReply([
      {
        id: "1",
        title: "ElevenLabs SOP",
        type: "SOP",
        googleUrl: "https://docs.google.com/document/d/abc/edit",
        googleKind: "doc",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    expect(msg).toContain("ElevenLabs SOP");
    expect(msg).toContain("Google Docs");
  });
});
