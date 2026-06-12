// Founder Ecosystem — Phase 14 Business OS Automation tests.
// Proves the ecosystem identifies the right tool, prepares the right action,
// packages context, requests approval when needed, never auto-runs an external
// action, tracks outcomes, and reports connected apps honestly.
// (Spec deliverable "automationTests.ts"; *.test.ts so vitest runs it.)

import { describe, expect, it } from "vitest";

import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { routeAutomation } from "./automationRouter";
import {
  canAutoExecute,
  evaluateApproval,
  requiresApproval,
  trustLevel,
} from "./approvalEngine";
import {
  completeItem,
  enqueueMany,
  initQueue,
  pendingApproval,
  queueCounts,
  requestApproval,
} from "./automationQueue";
import { buildContextPackage } from "./contextPackager";
import { buildAutomationHistory, computeAutomationStats } from "./automationHistory";
import {
  buildConnectedApps,
  defaultConnectedApps,
  summarizeConnectedApps,
} from "./connectedAppsManager";
import { confirmApproval, orchestrateIntent } from "./automationOrchestrator";
import { buildAutomationDashboard } from "./automationDashboard";
import type { AutomationAction } from "./automationTypes";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-02T09:00:00.000Z");
const events = () => simulateMasterWorkflow(FOUNDER, new Date("2026-06-01T09:00:00.000Z"));

describe("router identifies the right tool + action", () => {
  it("routes a follow-up to communications (draft, not send)", () => {
    const r = routeAutomation("I need to follow up with that lead");
    expect(r.toolCategory).toBe("communications");
    expect(r.actionType).toBe("draft-email");
    expect(r.approvalRequired).toBe(false); // a draft is high-trust
  });

  it("routes a proposal to documents → Create", () => {
    const r = routeAutomation("I need a proposal for this client");
    expect(r.toolCategory).toBe("documents");
    expect(r.opensBesideChat).toBe(true);
  });

  it("routes scheduling to the calendar category", () => {
    const r = routeAutomation("I need to schedule time for this");
    expect(r.toolCategory).toBe("calendar");
  });

  it("routes a GHL opportunity to an approval-required external record", () => {
    const r = routeAutomation("create a new opportunity for this deal");
    expect(r.tool).toBe("ghl");
    expect(r.approvalRequired).toBe(true);
  });

  it("falls back gracefully on vague intent", () => {
    expect(routeAutomation("hmm not sure").confidence).toBe("low");
  });
});

describe("approval engine — never automate without permission", () => {
  it("high-trust prep actions can auto-execute when connected", () => {
    expect(trustLevel("create-draft")).toBe("high");
    expect(requiresApproval("create-draft")).toBe(false);
    expect(canAutoExecute({ actionType: "research-topic", tool: "web-research" }, [])).toBe(true);
  });

  it("sends / publishes / external records always need approval", () => {
    for (const at of ["send-email", "publish-content", "create-external-record", "modify-calendar", "trigger-workflow"] as const) {
      expect(requiresApproval(at)).toBe(true);
    }
    expect(
      canAutoExecute({ actionType: "send-email", tool: "gmail" }, buildConnectedApps({ email: "connected" })),
    ).toBe(false);
  });

  it("won't auto-run a high-trust action whose tool is disconnected", () => {
    const decision = evaluateApproval(
      { actionType: "create-google-doc", tool: "google-docs" },
      defaultConnectedApps(),
    );
    expect(decision.autoExecutable).toBe(false);
    expect(decision.reason).toMatch(/google/i);
  });
});

describe("orchestrator prepares + gates", () => {
  it("an approval-required intent is prepared as pending-approval, not run", () => {
    const r = orchestrateIntent("send the email to the client now", { now: NOW });
    expect(r.approvalRequired).toBe(true);
    expect(r.action.status).toBe("pending-approval");
    expect(r.action.buttons).toContain("approve");
    expect(r.autoExecutable).toBe(false);
  });

  it("confirmApproval only advances an approval-required action after consent", () => {
    const r = orchestrateIntent("schedule a call with the lead", { now: NOW });
    const approved = confirmApproval(r.action);
    expect(approved.status).toBe("approved");
  });

  it("a high-trust intent is suggested and openable beside chat", () => {
    const r = orchestrateIntent("open the project and review it", { now: NOW });
    expect(r.action.status).toBe("suggested");
    expect(r.action.opensBesideChat).toBe(true);
  });

  it("packages context when asked", () => {
    const r = orchestrateIntent("draft a follow-up email", {
      events: events(),
      founderId: FOUNDER,
      withContext: true,
      now: NOW,
    });
    expect(r.contextPackage).not.toBeNull();
    expect(r.contextPackage!.summaryText.length).toBeGreaterThan(0);
    expect(r.action.contextPackageId).toBe(r.contextPackage!.id);
  });
});

describe("context packager", () => {
  it("includes project, decisions and founder stage", () => {
    const pkg = buildContextPackage(events(), FOUNDER, {}, NOW);
    expect(pkg.founderContext.stage).toBeTruthy();
    expect(pkg.projectContext).toBeTruthy();
    expect(Array.isArray(pkg.relevantDecisions)).toBe(true);
    expect(pkg.summaryText).toMatch(/Founder is in the/);
  });
});

describe("queue lifecycle", () => {
  it("moves items through statuses and counts them", () => {
    const a = orchestrateIntent("draft a follow-up email", { now: NOW }).action;
    const b = orchestrateIntent("send the email now", { now: NOW }).action;
    let q = enqueueMany(initQueue(), [a, b]);
    q = requestApproval(q, a.id);
    expect(pendingApproval(q).length).toBeGreaterThanOrEqual(1);
    q = completeItem(q, a.id, { ok: true, message: "drafted", timeSavedMinutes: 12 });
    expect(queueCounts(q).completed).toBe(1);
  });
});

describe("automation history + time saved", () => {
  it("records completed automations and sums time saved", () => {
    const done: AutomationAction = {
      ...orchestrateIntent("research the market", { now: NOW }).action,
      status: "completed",
      completedAt: NOW.toISOString(),
      outcome: { ok: true, message: "done", timeSavedMinutes: 25 },
    };
    const history = buildAutomationHistory([done]);
    expect(history.length).toBe(1);
    expect(computeAutomationStats([done]).totalTimeSavedMinutes).toBe(25);
  });
});

describe("connected apps", () => {
  it("defaults everything to disconnected and summarizes", () => {
    const summary = summarizeConnectedApps(defaultConnectedApps());
    expect(summary.connected).toBe(0);
    expect(summary.apps.length).toBeGreaterThanOrEqual(6);
  });

  it("reflects host-provided connection statuses", () => {
    const apps = buildConnectedApps({ google: "connected", ghl: "needs-attention" });
    const s = summarizeConnectedApps(apps);
    expect(s.connected).toBe(1);
    expect(s.needsAttention).toBe(1);
  });
});

describe("dashboard integration", () => {
  it("surfaces opportunities, pending approvals, time saved and apps", () => {
    const dash = buildAutomationDashboard({ events: events(), founderId: FOUNDER, now: NOW });
    expect(dash.automationOpportunities.length).toBeGreaterThan(0);
    expect(Array.isArray(dash.pendingApprovals)).toBe(true);
    expect(dash.timeSaved.display).toBeTruthy();
    expect(dash.connectedApps.apps.length).toBeGreaterThanOrEqual(6);
  });
});

describe("guardrail", () => {
  it("no automation prepared from sample intents is both external and auto-run", () => {
    const intents = ["send the email", "publish the post", "create a contact", "book a meeting"];
    for (const t of intents) {
      const r = orchestrateIntent(t, { now: NOW });
      if (r.approvalRequired) expect(r.autoExecutable).toBe(false);
    }
  });
});
