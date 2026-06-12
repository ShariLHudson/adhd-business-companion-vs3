import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetMemorySignalStore } from "@/lib/ecosystem/serverSignalStore";

import { buildGhlDashboard } from "./buildDashboard";

vi.mock("@/lib/founderWorkspace/repository", () => ({
  loadFounderWorkspaceFromDb: vi.fn(async () => null),
}));

vi.mock("@/lib/ghl/client", () => ({
  ghlApiConfigured: vi.fn(() => false),
  ghlClientConfigFromEnv: vi.fn(() => null),
  fetchGhlMetrics: vi.fn(),
}));

vi.mock("@/lib/supabase/founderServer", () => ({
  founderSupabaseConfigured: vi.fn(() => false),
  getFounderSupabaseAdmin: vi.fn(() => null),
}));

describe("buildGhlDashboard live content", () => {
  beforeEach(() => {
    resetMemorySignalStore();
  });

  it("builds ranked live content opportunities from ecosystem counts", async () => {
    const { incrementEcosystemSignals } = await import(
      "@/lib/ecosystem/serverSignalStore"
    );
    await incrementEcosystemSignals([
      { kind: "struggle", category: "overwhelm" },
      { kind: "struggle", category: "overwhelm" },
      { kind: "question", category: "im_overwhelmed" },
      { kind: "struggle", category: "prioritization" },
    ]);

    const dashboard = await buildGhlDashboard();

    expect(dashboard.integration.ecosystemSignalsConfigured).toBe(true);
    expect(dashboard.contentOpportunities.length).toBeGreaterThan(0);
    expect(dashboard.contentOpportunities[0].assetIdeas?.length).toBeGreaterThan(0);
    expect(dashboard.postCraftExport?.opportunities.length).toBeGreaterThan(0);
    expect(
      dashboard.contentOpportunities.some((o) => o.topicKey === "overwhelm"),
    ).toBe(true);
  });
});
