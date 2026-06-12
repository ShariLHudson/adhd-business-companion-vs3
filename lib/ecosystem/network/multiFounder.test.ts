// Founder Ecosystem — Phase 17 Multi-Founder Intelligence tests.
// (Spec deliverable "multiFounderTests.ts"; named *.test.ts so vitest runs it.)

import { describe, expect, it } from "vitest";

import { buildCompanionProfile } from "../companion/companionProfile";
import type { FounderEvent, NewEvent } from "../events";
import { ev } from "../events";
import {
  aggregateSnapshots,
  anonymizeFounderId,
  detectHighImpactBehaviors,
  extractAnonymizedSnapshot,
  extractCohortSnapshots,
} from "./aggregationEngine";
import {
  buildStageBenchmarks,
  compareFounderToBenchmarks,
  isCohortReady,
} from "./benchmarkModel";
import { COHORT_TOO_SMALL_MESSAGE, MINIMUM_COHORT_SIZE } from "./multiFounderConfig";
import {
  buildMultiFounderNetwork,
  buildSafeNetworkSummary,
  enrichFounderWithNetwork,
  publicNetworkView,
} from "./multiFounderIntelligence";
import {
  isDashboardSafe,
  recommendationsRespectDigitalTwin,
  selectNetworkDashboard,
} from "./multiFounderSelectors";
import {
  assertSafeForNetworkExport,
  containsPII,
  generalizeProjectTitle,
  redactNarrative,
  sanitizeEventsForNetwork,
  sanitizeText,
} from "./privacyGuard";
import { optimizeRecommendations, usesTrendLanguage } from "./recommendationOptimizer";

const NOW = new Date("2026-06-09T12:00:00.000Z");

function ts(dayOffset: number, hour: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - dayOffset);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function recentMonday(hour: number, minutes = 0): string {
  const d = new Date(NOW);
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(hour, minutes, 0, 0);
  return d.toISOString();
}

let seq = 0;
function asEvent(ne: NewEvent, t: string): FounderEvent {
  seq += 1;
  return { id: `e${seq}`, ts: t, ...ne };
}

function founderAEvents(): FounderEvent[] {
  const f = "founder-a";
  return [
    asEvent(ev.projectCreated(f, "proj-a", "Campaign Alpha"), ts(3, 9)),
    asEvent(ev.chatCoaching(f, "I keep delaying the launch campaign"), ts(2, 10)),
    asEvent(ev.chatCoaching(f, "Shari Hudson emailed me about the ADHD App funnel"), ts(2, 11)),
    asEvent(ev.actionPostponed(f, "act-a", "Launch campaign"), ts(1, 12)),
    asEvent(
      {
        founderId: f,
        type: "document.created",
        refs: { documentId: "doc-1" },
        data: {
          title: "Secret SOP",
          content: "Full private document body with revenue numbers",
          docType: "doc",
        },
      },
      ts(1, 13),
    ),
    asEvent(ev.taskCompleted(f, "task-a", "proj-a"), ts(0, 15)),
  ];
}

function mondayBatcherEvents(founderId: string, offset: number): FounderEvent[] {
  return [
    asEvent(ev.projectCreated(founderId, `proj-${founderId}`, "Sales Funnel Launch"), ts(5, 8)),
    asEvent(ev.chatCoaching(founderId, "Batching campaign work on Mondays"), ts(4, 9)),
    asEvent(
      {
        founderId,
        type: "timeblock.created",
        refs: { timeBlockId: `tb-${founderId}`, projectId: `proj-${founderId}` },
        data: { durationMin: 15, title: "Sales follow-up outreach" },
      },
      recentMonday(8, offset),
    ),
    asEvent(
      { founderId, type: "task.completed", refs: { projectId: `proj-${founderId}` } },
      recentMonday(9, offset),
    ),
    asEvent(
      { founderId, type: "task.completed", refs: { projectId: `proj-${founderId}` } },
      recentMonday(10, offset),
    ),
    asEvent(
      { founderId, type: "task.completed", refs: { projectId: `proj-${founderId}` } },
      recentMonday(11, offset),
    ),
    asEvent(ev.focusCompleted(founderId, 45, `proj-${founderId}`), ts(1, 8 + offset)),
    asEvent(ev.focusCompleted(founderId, 60, `proj-${founderId}`), recentMonday(9 + offset)),
    asEvent(
      { founderId, type: "action.completed", data: { actionId: "x", title: "Launch step" } },
      recentMonday(14, offset),
    ),
  ];
}

function cohortOf(size: number): { events: FounderEvent[]; ids: string[] } {
  const ids = Array.from({ length: size }, (_, i) => `cohort-f-${i}`);
  const events: FounderEvent[] = [];
  for (const id of ids) {
    events.push(...mondayBatcherEvents(id, Number(id.split("-").pop()) % 3));
  }
  return { events, ids };
}

describe("1. personally identifying data is removed", () => {
  it("sanitizes names and emails from text", () => {
    const cleaned = sanitizeText("Contact shari@example.com or Shari Hudson");
    expect(cleaned).not.toMatch(/shari@example/i);
    expect(cleaned).not.toMatch(/shari hudson/i);
    expect(containsPII(cleaned)).toBe(false);
  });

  it("snapshot contains no founder id or personal names", () => {
    const snap = extractAnonymizedSnapshot(founderAEvents(), "founder-a", NOW);
    expect(snap.anonId).not.toContain("founder-a");
    expect(JSON.stringify(snap)).not.toMatch(/shari hudson/i);
  });
});

describe("2. business names are removed", () => {
  it("generalizes project titles to categories", () => {
    expect(generalizeProjectTitle("ADHD App Sales Funnel")).toBe("sales/marketing");
    expect(generalizeProjectTitle("Campaign Alpha")).toMatch(/sales\/marketing|launch\/content/);
  });

  it("sanitized events replace titles with categories", () => {
    const events = founderAEvents();
    const sanitized = sanitizeEventsForNetwork(events);
    const titles = sanitized.map((e) => e.data?.title).filter(Boolean);
    expect(titles.every((t) => !/campaign alpha|adhd/i.test(String(t)))).toBe(true);
  });
});

describe("3. exact messages are removed", () => {
  it("redacts userMessage and converts text to category tags", () => {
    const sanitized = sanitizeEventsForNetwork(founderAEvents());
    expect(sanitized.every((e) => e.userMessage === undefined)).toBe(true);
    const chat = sanitized.find((e) => e.type === "chat.coaching");
    expect(String(chat?.data?.text ?? "")).not.toMatch(/delaying the launch campaign/i);
  });
});

describe("4. benchmarks blocked when cohort under 10", () => {
  it("returns empty benchmarks and message for small cohort", () => {
    const { events, ids } = cohortOf(4);
    const network = buildMultiFounderNetwork(events, ids, NOW);
    expect(network.cohortReady).toBe(false);
    expect(network.benchmarks).toEqual([]);
    const summary = buildSafeNetworkSummary(events, ids[0]!, ids, NOW);
    expect(summary.benchmarks).toEqual({ message: COHORT_TOO_SMALL_MESSAGE });
    expect(isCohortReady(4)).toBe(false);
    expect(MINIMUM_COHORT_SIZE).toBe(10);
  });
});

describe("5. benchmarks allowed when cohort is 10 or more", () => {
  it("returns stage benchmarks for sufficient cohort", () => {
    const { events, ids } = cohortOf(10);
    const network = buildMultiFounderNetwork(events, ids, NOW);
    expect(network.cohortReady).toBe(true);
    expect(network.benchmarks.length).toBeGreaterThan(0);
    const bench = network.benchmarks[0]!;
    expect(bench.tasksCompletedPerWeek.average).toBeGreaterThanOrEqual(0);
  });
});

describe("6. recommendations use trend language", () => {
  it("frames suggestions probabilistically", () => {
    const events = [...founderAEvents(), ...cohortOf(10).events];
    const ids = ["founder-a", ...cohortOf(10).ids];
    const network = buildMultiFounderNetwork(events, ids, NOW);
    const enrichment = enrichFounderWithNetwork(events, "founder-a", network, NOW);
    for (const rec of enrichment.recommendations) {
      expect(usesTrendLanguage(rec.framing)).toBe(true);
    }
  });
});

describe("7. recommendations do not override Digital Twin", () => {
  it("marks all network recs as supporting twin only", () => {
    const events = [...founderAEvents(), ...cohortOf(10).events];
    expect(recommendationsRespectDigitalTwin(events, "founder-a")).toBe(true);
    const profileBefore = buildCompanionProfile(
      events.filter((e) => e.founderId === "founder-a"),
      "founder-a",
    );
    const enrichment = getNetworkEnrichment(events, "founder-a");
    const profileAfter = buildCompanionProfile(
      events.filter((e) => e.founderId === "founder-a"),
      "founder-a",
    );
    expect(profileAfter.supportStyle.value).toBe(profileBefore.supportStyle.value);
    expect(enrichment.recommendations.every((r) => r.doesNotOverrideTwin)).toBe(true);
  });
});

function getNetworkEnrichment(events: FounderEvent[], founderId: string) {
  const ids = [...new Set(events.map((e) => e.founderId))];
  return enrichFounderWithNetwork(events, founderId, ids, NOW);
}

describe("8. no raw document content in network aggregation", () => {
  it("strips document body before aggregation export", () => {
    const sanitized = sanitizeEventsForNetwork(founderAEvents());
    const doc = sanitized.find((e) => e.type === "document.created");
    expect(doc?.data?.content).toBeUndefined();
    expect(JSON.stringify(sanitized)).not.toMatch(/private document body/i);
    const snap = extractAnonymizedSnapshot(founderAEvents(), "founder-a", NOW);
    expect(JSON.stringify(snap)).not.toMatch(/secret sop|revenue/i);
  });
});

describe("9. stage-specific benchmark returns correct cohort", () => {
  it("benchmarks are grouped by business stage", () => {
    const { events, ids } = cohortOf(10);
    const snapshots = extractCohortSnapshots(events, ids, NOW);
    const benchmarks = buildStageBenchmarks(snapshots, 10);
    expect(benchmarks.length).toBeGreaterThan(0);
    const stages = new Set(snapshots.map((s) => s.stage));
    for (const bench of benchmarks) {
      expect(stages.has(bench.stage)).toBe(true);
    }
  });
});

describe("10. dashboard selectors return safe summary only", () => {
  it("dashboard passes PII safety check", () => {
    const { events, ids } = cohortOf(10);
    const dash = selectNetworkDashboard(events, ids[0]!, ids, NOW);
    expect(isDashboardSafe(dash)).toBe(true);
    expect(JSON.stringify(dash)).not.toMatch(/cohort-f-/);
    expect(dash).not.toHaveProperty("_snapshots");
  });
});

describe("privacy narrative example", () => {
  it("transforms identifying narrative to safe summary", () => {
    const bad =
      "Shari Hudson's ADHD App Sales Funnel project stalled for 14 days.";
    const good = redactNarrative(bad, "building");
    expect(good).toMatch(/founder in the building stage/i);
    expect(good).not.toMatch(/shari hudson/i);
    expect(good).not.toMatch(/adhd app/i);
  });
});

describe("final success test — safe network output", () => {
  it("returns empty-safe shape without exposing private data", () => {
    const { events, ids } = cohortOf(3);
    const summary = buildSafeNetworkSummary(events, ids[0]!, ids, NOW);
    expect(summary).toMatchObject({
      benchmarks: { message: COHORT_TOO_SMALL_MESSAGE },
      cohortReady: false,
    });
    expect(assertSafeForNetworkExport(summary)).toBe(true);
    expect(JSON.stringify(summary)).not.toMatch(
      /sales funnel|shari|founder-a|private document|@/i,
    );
  });

  it("populated cohort still exports no individual identity", () => {
    const { events, ids } = cohortOf(10);
    const summary = buildSafeNetworkSummary(events, ids[0]!, ids, NOW);
    expect(assertSafeForNetworkExport(summary)).toBe(true);
    expect(publicNetworkView(buildMultiFounderNetwork(events, ids, NOW)).cohortReady).toBe(
      true,
    );
  });
});

describe("pattern recognition", () => {
  it("detects monday-batching and correlates with progress", () => {
    const snapshots = [
      extractAnonymizedSnapshot(founderAEvents(), "founder-a", NOW),
      ...cohortOf(4).ids.map((id) =>
        extractAnonymizedSnapshot(cohortOf(4).events, id, NOW),
      ),
    ];
    const behaviors = detectHighImpactBehaviors(snapshots);
    const monday = behaviors.find((b) => b.habit === "monday-batching");
    expect(monday?.correlatedProgressLift).toBeGreaterThan(0);
  });

  it("aggregate builds recurring challenges", () => {
    const snapshots = [
      extractAnonymizedSnapshot(founderAEvents(), "founder-a", NOW),
      extractAnonymizedSnapshot(mondayBatcherEvents("founder-b", 0), "founder-b", NOW),
    ];
    const agg = aggregateSnapshots(snapshots, NOW);
    expect(agg.recurringChallenges.length).toBeGreaterThan(0);
  });
});

describe("recommendation optimizer", () => {
  it("suggests outreach block for follow-up friction", () => {
    const cohort = cohortOf(10);
    const events = [
      asEvent(ev.chatCoaching("founder-a", "I avoid sales follow-up"), ts(1, 9)),
      ...cohort.events,
    ];
    const ids = ["founder-a", ...cohort.ids];
    const network = buildMultiFounderNetwork(events, ids, NOW);
    const snap = extractAnonymizedSnapshot(events, "founder-a", NOW);
    const recs = optimizeRecommendations(snap, network.aggregate, network.benchmarks);
    expect(recs.some((r) => /outreach|follow-up/i.test(r.strategy))).toBe(true);
  });
});

describe("benchmark comparison when ready", () => {
  it("compares founder to median when cohort ready", () => {
    const { events, ids } = cohortOf(10);
    const network = buildMultiFounderNetwork(events, ids, NOW);
    const snap = extractAnonymizedSnapshot(events, ids[0]!, NOW);
    const comparisons = compareFounderToBenchmarks(snap, network.benchmarks, true);
    expect(comparisons.length).toBeGreaterThan(0);
  });
});
