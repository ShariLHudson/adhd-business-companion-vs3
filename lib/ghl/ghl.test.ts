import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { verifyGhlDashboardToken } from "./auth";
import { mergeProductSignals, defaultProductSignals } from "./buildDashboard";
import { fetchGhlMetrics, ghlClientConfigFromEnv } from "./client";

describe("verifyGhlDashboardToken", () => {
  beforeEach(() => {
    vi.stubEnv("ECOSYSTEM_DASHBOARD_TOKEN", "embed-secret-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the configured dashboard token", () => {
    expect(verifyGhlDashboardToken("embed-secret-123")).toBe(true);
    expect(verifyGhlDashboardToken("wrong")).toBe(false);
  });
});

describe("mergeProductSignals", () => {
  it("merges ecosystem counts into product signals", () => {
    const merged = mergeProductSignals(defaultProductSignals(), [
      { key: "overwhelm", count: 42, kind: "struggle" },
      { key: "help_me_prioritize", count: 18, kind: "question" },
    ]);
    const overwhelm = merged.find((s) => s.label === "Overwhelm");
    expect(overwhelm?.count).toBe(42);
    expect(merged[0].count).toBeGreaterThanOrEqual(42);
  });
});

describe("fetchGhlMetrics", () => {
  beforeEach(() => {
    vi.stubEnv("GHL_API_TOKEN", "pit-test");
    vi.stubEnv("GHL_LOCATION_ID", "loc-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("parses contact and opportunity responses", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("/contacts/search")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          filters?: unknown[];
        };
        const isNew = Array.isArray(body.filters) && body.filters.length > 0;
        return new Response(
          JSON.stringify({ total: isNew ? 12 : 427 }),
          { status: 200 },
        );
      }
      if (url.includes("/opportunities/search")) {
        return new Response(
          JSON.stringify({
            opportunities: [
              { status: "open", monetaryValue: 500 },
              { status: "won", monetaryValue: 1200 },
              { status: "lost", monetaryValue: 0 },
            ],
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ total: 5 }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const config = ghlClientConfigFromEnv()!;
    const metrics = await fetchGhlMetrics(config, "30d");

    expect(metrics.totalContacts).toBe(427);
    expect(metrics.newContacts).toBe(12);
    expect(metrics.openOpportunities).toBe(1);
    expect(metrics.wonOpportunities).toBe(1);
    expect(metrics.conversionRate).toBe(50);
  });
});
