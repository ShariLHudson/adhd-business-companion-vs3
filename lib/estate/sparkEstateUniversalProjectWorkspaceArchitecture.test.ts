import { describe, expect, it } from "vitest";

import {
  assessUniversalProjectWorkspaceCompliance,
  buildCurrentProjectIndicator,
  buildSparkProjectContinuityMessage,
  buildUniversalProjectLibraryView,
  buildUniversalProjectWorkspace,
  formatUniversalProjectWorkspaceReport,
  inferUniversalProjectWorkspaceKind,
  resolveUniversalProjectEntryPoint,
  searchUniversalProjectLibrary,
  SPARK_ESTATE_OLD_WORKSPACE_MODEL_AVOID,
  SPARK_ESTATE_PROJECT_ENTRY_POINTS,
  SPARK_ESTATE_PROJECT_LIBRARY_SHELVES,
  SPARK_ESTATE_UNIVERSAL_PROJECT_PRINCIPLE,
  startUniversalProjectFromEntry,
  verifySparkEstateUniversalProjectWorkspaceArchitecture,
} from "./sparkEstateUniversalProjectWorkspaceArchitecture";

describe("sparkEstateUniversalProjectWorkspaceArchitecture", () => {
  it("defines member-owned projects and the universal flow", () => {
    expect(SPARK_ESTATE_UNIVERSAL_PROJECT_PRINCIPLE).toContain("follows the member");
    expect(SPARK_ESTATE_PROJECT_LIBRARY_SHELVES).toHaveLength(5);
    expect(SPARK_ESTATE_PROJECT_ENTRY_POINTS).toHaveLength(4);
    expect(SPARK_ESTATE_OLD_WORKSPACE_MODEL_AVOID).toHaveLength(4);
  });

  it("builds a sales funnel workspace with overview and sections", () => {
    const workspace = buildUniversalProjectWorkspace({
      id: "funnel-1",
      name: "Sales Funnel Project",
      goal: "Launch a sales funnel",
      goals: ["Launch a sales funnel"],
      horizon: "now",
      status: "active-focus",
      nextAction: "Draft the welcome email headline",
      color: "#1e4f4f",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(workspace.kind).toBe("funnel");
    expect(workspace.sections.some((section) => section.label === "Email Sequence")).toBe(
      true,
    );
    expect(workspace.exportActions).toContain("share");
    expect(buildCurrentProjectIndicator({
      id: "funnel-1",
      name: "Sales Funnel Project",
      goal: "",
      goals: [],
      horizon: "now",
      status: "active-focus",
      nextAction: "",
      color: "#1e4f4f",
      createdAt: "",
      updatedAt: "",
    })).toBe("Working on: Sales Funnel Project");
  });

  it("recognizes project entry from any room and builds continuity messaging", () => {
    const chamberEntry = resolveUniversalProjectEntryPoint({
      text: "I need to create a sales funnel.",
      currentSection: "chamber-of-momentum",
    });
    expect(chamberEntry.shouldBecomeProject).toBe(true);
    expect(chamberEntry.entryPoint).toContain("Chamber");

    const message = buildSparkProjectContinuityMessage(
      {
        id: "funnel-1",
        name: "sales funnel project",
        goal: "Build funnel",
        goals: [],
        horizon: "now",
        status: "active-focus",
        nextAction: "Draft emails",
        color: "#1e4f4f",
        createdAt: "",
        updatedAt: "",
      },
      ["the audience", "offer sections"],
    );
    expect(message).toContain("email sequence");
    expect(message).toContain("Welcome back");
  });

  it("organizes the project library and supports search", () => {
    const projects = [
      {
        id: "1",
        name: "Client Onboarding SOP",
        goal: "SOP",
        goals: [],
        horizon: "now" as const,
        status: "in-progress" as const,
        nextAction: "Draft step one",
        color: "#1e4f4f",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "2",
        name: "Launch Template",
        goal: "Template",
        goals: [],
        horizon: "later" as const,
        status: "completed" as const,
        nextAction: "",
        color: "#9a6fb0",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    ];
    const shelves = buildUniversalProjectLibraryView(projects, new Date("2026-07-08T12:00:00"));
    expect(shelves.active.length).toBeGreaterThan(0);
    expect(shelves.completed).toHaveLength(1);
    expect(inferUniversalProjectWorkspaceKind(projects[0]!)).toBe("sop");
    expect(searchUniversalProjectLibrary("template", projects)).toHaveLength(1);
  });

  it("starts member-owned projects through the chamber engine bridge", () => {
    const project = startUniversalProjectFromEntry({
      name: "Campaign Strategy",
      desiredOutcome: "Define a clear campaign strategy",
      whyItMatters: "Grow the offer",
      nextAction: "Write the audience statement",
    });
    expect(project.status).toBe("active-focus");
    expect(inferUniversalProjectWorkspaceKind(project)).toBe("strategy");
  });

  it("verifies universal workspace compliance and formats a readable report", () => {
    const verification = verifySparkEstateUniversalProjectWorkspaceArchitecture();
    const compliance = assessUniversalProjectWorkspaceCompliance();
    expect(verification.workspaceKinds).toBe(5);
    expect(verification.universalProjectReady).toBe(true);
    expect(verification.memberOwnedReady).toBe(true);
    expect(compliance.creationJourneyBridgeReady).toBe(true);
    expect(compliance.lifecycleBridgeReady).toBe(true);

    const report = formatUniversalProjectWorkspaceReport();
    expect(report).toContain("Project library shelves");
    expect(report).toContain("Universal access");
    expect(report).toContain("Compliance checks");
  });
});
