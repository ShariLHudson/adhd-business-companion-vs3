import { beforeEach, describe, expect, it } from "vitest";

import type { ContentDraft } from "./postcraftDraftGenerator";
import {
  archiveEcosystemGoogleAsset,
  buildContentFromDraft,
  buildContentFromOpportunity,
  buildContentFromSop,
  findAssetBySource,
  listActiveAssetsForFounder,
  loadAllEcosystemGoogleAssets,
  recommendGoogleKindForSource,
  registerEcosystemGoogleAsset,
  resetGoogleAssetStore,
} from "./googleWorkspaceAutomation";

function sampleDraft(): ContentDraft {
  return {
    id: "draft-1",
    topic: "Overwhelm",
    topicKey: "overwhelm",
    assetType: "blog",
    assetLabel: "Blog",
    title: "Stop overwhelm spirals",
    angle: "Triage in 15 minutes",
    opportunityScore: 88,
    trend: "up",
    sourceSignalSummary: "struggle/overwhelm: 40",
    whyThisMatters: "Top user theme.",
    body: "Intro\n\nStep 1\n\nClose",
    status: "approved",
    postCraftSyncReady: true,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-12T10:00:00.000Z",
    approvedAt: "2026-06-10T10:00:00.000Z",
  };
}

describe("googleWorkspaceAutomation", () => {
  beforeEach(() => {
    resetGoogleAssetStore();
  });

  it("1. builds document payloads from approved drafts", () => {
    const payload = buildContentFromDraft(sampleDraft());
    expect(payload.title).toBe("Stop overwhelm spirals");
    expect(payload.content).toContain("Step 1");
    expect(payload.sourceType).toBe("approved_draft");
    expect(payload.kind).toBe("doc");
  });

  it("2. supports update via registered asset lookup", async () => {
    const asset = await registerEcosystemGoogleAsset({
      title: "Workshop draft",
      kind: "doc",
      sourceType: "workshop",
      sourceId: "ws-1",
      googleFileId: "file-abc",
      googleUrl: "https://docs.google.com/document/d/file-abc/edit",
    });
    const found = await findAssetBySource("workshop", "ws-1");
    expect(found?.googleFileId).toBe("file-abc");
    expect(asset.googleUrl).toContain("file-abc");
  });

  it("3. assets are stored and listed correctly", async () => {
    await registerEcosystemGoogleAsset({
      title: "Newsletter",
      kind: "doc",
      sourceType: "newsletter",
      sourceId: "nl-1",
      googleFileId: "file-nl",
    });
    await registerEcosystemGoogleAsset({
      title: "Old doc",
      kind: "doc",
      sourceType: "blog",
      sourceId: "old",
      googleFileId: "file-old",
    });
    await archiveEcosystemGoogleAsset("gasset-file-old");

    const active = listActiveAssetsForFounder(await loadAllEcosystemGoogleAssets());
    expect(active).toHaveLength(1);
    expect(active[0].sourceType).toBe("newsletter");
  });

  it("4. founder can access google links", async () => {
    const asset = await registerEcosystemGoogleAsset({
      title: "Lead magnet",
      kind: "doc",
      sourceType: "lead_magnet",
      sourceId: "lm-1",
      googleFileId: "file-lm",
    });
    expect(asset.googleUrl).toMatch(/^https:\/\/docs\.google\.com\//);
  });

  it("builds content from opportunities and SOPs", () => {
    const opp = buildContentFromOpportunity(
      {
        topic: "Overwhelm",
        topicKey: "overwhelm",
        mentions: 40,
        opportunityScore: 90,
        trend: "up",
        whyThisMatters: "High signal.",
        suggestedAssets: ["Workshop"],
        assetIdeas: [
          {
            type: "workshop",
            label: "Workshop",
            title: "Overwhelm rescue",
            angle: "Fast triage.",
          },
        ],
      },
      "workshop",
    );
    expect(opp.sourceType).toBe("workshop");
    expect(recommendGoogleKindForSource("sop", "Onboarding SOP", "Step 1")).toBe("doc");

    const sop = buildContentFromSop({
      id: "sop-1",
      title: "Client onboarding",
      steps: ["Send welcome", "Book kickoff"],
    });
    expect(sop.content).toContain("1. Send welcome");
  });
});
