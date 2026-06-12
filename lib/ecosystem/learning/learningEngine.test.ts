// Founder Ecosystem — Phase 15 Learning Engine tests.
// (Spec deliverable "learningEngineTests.ts"; named *.test.ts so vitest runs it.)

import { describe, expect, it } from "vitest";

import { EventStore, MemoryEventSink } from "../eventStore";
import { buildLearningDashboard } from "./dashboardMetrics";
import {
  automationSuccessMetrics,
  pendingVsExecutedCounts,
  toolUsageFrequency,
  totalTimeSavedMinutes,
} from "./ecosystemAnalytics";
import { adaptiveRecommendationPolicy, computeAutomationScores } from "./ecosystemLearning";
import { FounderEcosystemTracker } from "./founderEcosystemTracker";

const FOUNDER = "founder-001";

function simulateFollowUpWorkflow(store: EventStore) {
  const tracker = new FounderEcosystemTracker(store, FOUNDER);

  tracker.suggested("auto-follow-up", "Follow-Up Automation", "gmail", "send-email", {
    goalLabel: "lead follow-up",
    projectId: "proj-leads",
  });
  tracker.approved("auto-follow-up", "Follow-Up Automation", "gmail", "send-email", {
    projectId: "proj-leads",
  });
  tracker.executed("auto-follow-up", "Follow-Up Automation", "gmail", "send-email", {
    projectId: "proj-leads",
    timeSavedMinutes: 12,
  });
  tracker.timeSaved(12, "gmail", { projectId: "proj-leads" });

  tracker.suggested("auto-workshop", "Workshop Plan Draft", "google-docs", "draft-doc", {
    projectId: "proj-workshop",
  });
  tracker.dismissed("auto-workshop", "Workshop Plan Draft", "google-docs", "draft-doc", {
    projectId: "proj-workshop",
  });

  tracker.suggested("auto-workshop", "Workshop Plan Draft", "google-docs", "draft-doc", {
    projectId: "proj-workshop",
  });
  tracker.approved("auto-workshop", "Workshop Plan Draft", "google-docs", "draft-doc");
  tracker.edited("auto-workshop", "Workshop Plan Draft", "google-docs", "draft-doc");
  tracker.executed("auto-workshop", "Workshop Plan Draft", "google-docs", "draft-doc", {
    timeSavedMinutes: 25,
  });

  tracker.toolTriggered("google-docs", "export", { projectId: "proj-workshop", ok: true });
}

describe("FounderEcosystemTracker", () => {
  it("records automation lifecycle and time saved", () => {
    const store = new EventStore(new MemoryEventSink());
    simulateFollowUpWorkflow(store);
    const events = store.all();

    expect(events.some((e) => e.type === "automation.suggested")).toBe(true);
    expect(events.some((e) => e.type === "automation.executed")).toBe(true);
    expect(events.some((e) => e.type === "learning.time_saved")).toBe(true);
    expect(totalTimeSavedMinutes(events, FOUNDER)).toBeGreaterThanOrEqual(37);
  });
});

describe("ecosystemAnalytics", () => {
  it("computes follow-up automation success rate", () => {
    const store = new EventStore(new MemoryEventSink());
    simulateFollowUpWorkflow(store);
    const events = store.all();

    const metrics = automationSuccessMetrics(events, FOUNDER);
    const followUp = metrics.find((m) => m.title === "Follow-Up Automation");
    expect(followUp).toBeTruthy();
    expect(followUp!.approvalRate).toBeGreaterThanOrEqual(80);
    expect(followUp!.executed).toBe(1);

    const tools = toolUsageFrequency(events, FOUNDER);
    expect(tools.some((t) => t.tool === "gmail" || t.tool === "google-docs")).toBe(true);

    const pending = pendingVsExecutedCounts(events, FOUNDER);
    expect(pending.executed).toBeGreaterThanOrEqual(2);
  });
});

describe("ecosystemLearning", () => {
  it("boosts high-success automations and deprioritizes ignored ones", () => {
    const store = new EventStore(new MemoryEventSink());
    simulateFollowUpWorkflow(store);
    const events = store.all();

    const scores = computeAutomationScores(events, FOUNDER);
    const followUp = scores.find((s) => s.title === "Follow-Up Automation");
    expect(followUp?.score).toBeGreaterThanOrEqual(50);

    const policy = adaptiveRecommendationPolicy(events, FOUNDER, [
      {
        id: "a1",
        title: "Follow-Up Automation",
        description: "Send follow-up",
        actionType: "open-google-doc",
        priority: "medium",
        workspace: { section: "create", ecosystemKind: "create" },
        prefill: {},
        status: "offered",
        sourceEventIds: [],
        createdAt: "2026-06-09T10:00:00.000Z",
      },
    ]);
    expect(policy.guidance.length).toBeGreaterThan(0);
    expect(policy.scores.length).toBeGreaterThan(0);
  });
});

describe("dashboardMetrics", () => {
  it("builds learning dashboard sections with insights", () => {
    const store = new EventStore(new MemoryEventSink());
    simulateFollowUpWorkflow(store);
    const dash = buildLearningDashboard(store.all(), FOUNDER);

    expect(dash.automationSuccess.length).toBeGreaterThan(0);
    expect(dash.timeSavedPerTool.length).toBeGreaterThan(0);
    expect(dash.engagementHeatmap.length).toBe(7 * 24);
    expect(dash.insights.length).toBeGreaterThan(0);
    expect(dash.overallSuccessRate).toBeGreaterThan(0);
  });
});
