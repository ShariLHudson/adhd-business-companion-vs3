import { describe, expect, it, beforeEach } from "vitest";

import {
  buildPostCraftDraftPrompt,
  draftContentIsSafe,
  findAssetInPostCraftExport,
  generatePostCraftDraft,
  summarizeSourceSignals,
  toPostCraftSyncPayload,
} from "./postcraftDraftGenerator";
import { resetContentDraftStore, saveContentDraft } from "./postcraftDraftStore";
import type { PostCraftLiveExport } from "./liveContentOpportunityGenerator";

const SAMPLE_EXPORT: PostCraftLiveExport = {
  generatedAt: "2026-06-12T12:00:00.000Z",
  dashboardName: "ADHD Business Ecosystem Dashboard",
  opportunities: [
    {
      topic: "Overwhelm",
      topicKey: "overwhelm",
      mentions: 120,
      opportunityScore: 88,
      trend: "up",
      whyThisMatters: "Founders report urgent-pile paralysis.",
      sourceSignals: [
        { kind: "struggle", category: "overwhelm", count: 80 },
        { kind: "question", category: "im_overwhelmed", count: 40 },
      ],
      assets: [
        {
          type: "blog",
          label: "Blog",
          title: "ADHD overwhelm in business",
          angle: "Normalize the pattern and offer one triage question.",
        },
      ],
    },
    {
      topic: "Prioritization",
      topicKey: "prioritization",
      mentions: 60,
      opportunityScore: 72,
      trend: "stable",
      whyThisMatters: "Founders ask what matters first.",
      sourceSignals: [
        { kind: "struggle", category: "prioritization", count: 60 },
      ],
      assets: [
        {
          type: "lead_magnet",
          label: "Lead Magnet",
          title: "ADHD Priority Rescue Checklist",
          angle: "One-page triage for competing priorities.",
        },
      ],
    },
  ],
};

describe("postcraftDraftGenerator", () => {
  beforeEach(() => {
    resetContentDraftStore();
  });

  it("finds opportunity asset from PostCraft export", () => {
    const input = findAssetInPostCraftExport(SAMPLE_EXPORT, "overwhelm", "blog");
    expect(input?.title).toBe("ADHD overwhelm in business");
    expect(input?.angle).toContain("triage");
  });

  it("generates draft using title and angle without conversation text", async () => {
    const input = findAssetInPostCraftExport(SAMPLE_EXPORT, "overwhelm", "blog")!;
    const { draft } = await generatePostCraftDraft(input);

    expect(draft.status).toBe("drafted");
    expect(draft.body).toContain(input.title);
    expect(draft.body.toLowerCase()).toContain("overwhelm");
    expect(draftContentIsSafe(draft.body)).toBe(true);
    expect(draft.body.toLowerCase()).not.toMatch(/user said|conversation|transcript/);
    expect(summarizeSourceSignals(input.sourceSignals)).toContain("overwhelm");
  });

  it("creates prioritization-related draft for prioritization opportunity", async () => {
    const input = findAssetInPostCraftExport(
      SAMPLE_EXPORT,
      "prioritization",
      "lead_magnet",
    )!;
    const { draft } = await generatePostCraftDraft(input);

    expect(draft.topicKey).toBe("prioritization");
    expect(draft.assetType).toBe("lead_magnet");
    expect(draft.body.toLowerCase()).toMatch(/priorit|lane|step/);
  });

  it("prompt uses aggregated signals only", () => {
    const input = findAssetInPostCraftExport(SAMPLE_EXPORT, "overwhelm", "blog")!;
    const prompt = buildPostCraftDraftPrompt(input);
    expect(prompt.user).toContain(input.title);
    expect(prompt.user).toContain(input.angle);
    expect(prompt.user).toContain("struggle/overwhelm: 80");
    expect(prompt.system).toContain("Do NOT invent or quote user conversations");
  });

  it("stores draft and prepares PostCraft sync payload after approval", async () => {
    const input = findAssetInPostCraftExport(SAMPLE_EXPORT, "overwhelm", "blog")!;
    const { draft } = await generatePostCraftDraft(input);
    await saveContentDraft(draft);

    const approved = {
      ...draft,
      status: "approved" as const,
      postCraftSyncReady: true,
      approvedAt: new Date().toISOString(),
    };
    const payload = toPostCraftSyncPayload(approved);

    expect(payload.title).toBe(draft.title);
    expect(payload.body).toBe(draft.body);
    expect(payload.status).toBe("approved");
    expect(JSON.stringify(payload)).not.toContain("conversation");
  });
});
