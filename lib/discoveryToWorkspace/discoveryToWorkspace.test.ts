import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace";
import { createEmptyEventSections } from "@/lib/eventsIntelligence/eventSections";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import {
  BANNED_BLANK_WORKSPACE_OPENERS,
  buildDiscoveryTransitionReply,
  buildEventDiscoveryTransition,
  isBannedBlankWorkspaceOpener,
  isEventFoundationReady,
} from "./index";

function foundationWorkshop(): EventRecord {
  const sections = createEmptyEventSections();
  const set = (id: string, content: string) => {
    const s = sections.find((x) => x.id === id);
    if (s) {
      s.content = content;
      s.status = "confirmed";
    }
  };
  set("purpose", "Introduce the ADHD Business Platform");
  set("audience", "Business owners with ADHD");
  set("outcomes", "Leave with a clear next step for their business");
  set("format", "In person");
  return {
    id: "evt-test-1",
    title: "ADHD Business Platform Workshop",
    eventType: "workshop",
    eventTypeLabel: "Workshop",
    purpose: "Introduce the ADHD Business Platform",
    audience: "Business owners with ADHD",
    outcomes: "Leave with a clear next step for their business",
    format: "in_person",
    dates: "One day · about 8 hours",
    venue: "",
    budget: "",
    lifecyclePhase: "discovery",
    runtimeState: "DISCOVERY",
    sections,
    tasks: [],
    milestones: [],
    decisions: [],
    dependencies: [],
    owners: [],
    nextAction: "Sketch a simple agenda",
    activeQuestionId: null,
    conversationContext: "I want to plan a workshop",
    projectHomeId: null,
    companionProjectId: null,
    canonicalWorkId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("058/059 — Discovery to Workspace transition", () => {
  it("never uses blank workspace openers after foundation", () => {
    const record = foundationWorkshop();
    expect(isEventFoundationReady(record)).toBe(true);
    const reply = buildDiscoveryTransitionReply(record);
    for (const banned of BANNED_BLANK_WORKSPACE_OPENERS) {
      expect(reply.toLowerCase()).not.toContain(banned.toLowerCase());
    }
    expect(isBannedBlankWorkspaceOpener(reply)).toBe(false);
    expect(reply).toMatch(/agenda/i);
    expect(reply).toMatch(/wonderful|home now|getting started/i);
    expect(reply).not.toMatch(/✓/);
  });

  it("stamps Current Focus + What We Know onto the Create workflow", () => {
    const record = foundationWorkshop();
    const snap = buildEventDiscoveryTransition(record);
    expect(snap.foundationReady).toBe(true);
    expect(snap.currentFocus.title).toMatch(/agenda/i);
    expect(snap.whatWeKnow.length).toBeGreaterThan(2);

    const wf = applyEventWorkspaceToCreateWorkflow(
      { ...EMPTY_CREATE_WORKFLOW, selectedTypeLabel: "Event Plan" },
      record,
    );
    expect(wf.workspaceFirst).toBe(true);
    expect(wf.creationWorkspaceKind).toBe("event");
    expect(wf.workspaceKnownFacts?.length).toBeGreaterThan(0);
    expect(wf.workspaceCurrentFocus?.title).toMatch(/agenda/i);
    expect(wf.workspaceCurrentFocus?.assetTypeId).toBe("agenda");
    expect(wf.workspacePhaseLabel).toMatch(/foundation/i);
  });

  it("Create estate working panel renders Current Focus + What We Know", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateWorkingPanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("workspace-current-focus");
    expect(panel).toContain("workspace-what-we-know");
    expect(panel).toContain("What We Already Know");
    expect(panel).toContain("Current Focus");
  });

  it("binds Event Record synchronously in startFreshCreateFromEstate", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("bindEventRecord");
    expect(client).toContain("applyEventWorkspaceToCreateWorkflow");
    // Deferred bind was the race that left blank workspaces
    expect(client).not.toMatch(
      /bindEventRecord:[\s\S]{0,40}window\.setTimeout/,
    );
  });
});
