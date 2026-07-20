import { describe, expect, it } from "vitest";
import {
  buildWorkspaceIdentityCard,
  extractTitleFromDraftContent,
  generateTemporaryTitleFromRequest,
  isTechnicalWorkspaceTitle,
  memberStatusLabel,
  resolveHumanReadableTitle,
  safeUntitledLabel,
  stripCreationMetaPreamble,
} from "./humanReadableIdentity";
import type { ActiveWorkspaceEntry } from "./types";

describe("073 — Human-Readable Workspace Identity", () => {
  it("rejects technical titles", () => {
    expect(isTechnicalWorkspaceTitle("Workshop Creation Workspace")).toBe(true);
    expect(isTechnicalWorkspaceTitle("Event Creation Workspace")).toBe(true);
    expect(isTechnicalWorkspaceTitle("Runtime Creation Record")).toBe(true);
    expect(isTechnicalWorkspaceTitle("Untitled Workspace")).toBe(true);
    expect(
      isTechnicalWorkspaceTitle("Build Your Simple Productivity System"),
    ).toBe(false);
  });

  it("safe untitled uses creation type", () => {
    expect(safeUntitledLabel("Workshop")).toBe("Untitled Workshop");
    expect(safeUntitledLabel("SOP")).toBe("Untitled SOP");
  });

  it("generates temporary title from request", () => {
    const title = generateTemporaryTitleFromRequest(
      "I want to create a workshop for ADHD business owners about simple productivity",
      "Workshop",
    );
    expect(title).toBeTruthy();
    expect(title!.toLowerCase()).toMatch(/productivity|adhd|workshop/);
    expect(isTechnicalWorkspaceTitle(title)).toBe(false);
  });

  it("strips force-new preamble so it never becomes the workspace title", () => {
    const cleaned = stripCreationMetaPreamble(
      "Start something new — create a separate Leadership Retreat 2026 Plan",
    );
    expect(cleaned.toLowerCase()).toMatch(/leadership retreat/);
    expect(cleaned).not.toMatch(/start something new/i);

    const title = generateTemporaryTitleFromRequest(
      "I want to start a brand new project for a client onboarding checklist",
      "Document",
    );
    expect(title).toBeTruthy();
    expect(title!.toLowerCase()).toMatch(/client onboarding|checklist/);
    expect(title!.toLowerCase()).not.toMatch(/start something new|brand new project/);
  });

  it("naming priority: member title wins", () => {
    expect(
      resolveHumanReadableTitle({
        memberTitle: "Build Your Simple Productivity System",
        existingTitle: "Workshop Creation Workspace",
        requestText: "I want a workshop",
        creationType: "Workshop",
      }),
    ).toBe("Build Your Simple Productivity System");
  });

  it("promotes draft title over bare Workshop", () => {
    expect(
      resolveHumanReadableTitle({
        existingTitle: "Workshop",
        draftTitle: "Simple Productivity System Workshop",
        creationType: "Workshop",
      }),
    ).toBe("Simple Productivity System Workshop");
  });

  it("extracts title from Creating a … draft line", () => {
    expect(
      extractTitleFromDraftContent(
        "Creating a Simple Productivity System Workshop\n\nMore body",
        "Workshop",
      ),
    ).toBe("Simple Productivity System Workshop");
  });

  it("never permanently settles on bare Workshop", () => {
    const title = resolveHumanReadableTitle({
      existingTitle: "Workshop",
      creationType: "Workshop",
    });
    expect(title).toBe("Untitled Workshop");
  });

  it("naming priority: never falls back to Creation Workspace", () => {
    const title = resolveHumanReadableTitle({
      existingTitle: "Workshop Creation Workspace",
      requestText: "create something",
      creationType: "Workshop",
    });
    expect(title).not.toMatch(/Creation Workspace/i);
    expect(isTechnicalWorkspaceTitle(title)).toBe(false);
    expect(title.length).toBeGreaterThan(0);
  });

  it("member status language is friendly", () => {
    expect(memberStatusLabel("ready", "Draft ready")).toBe("Draft Ready");
    expect(memberStatusLabel("none", "Getting started")).toBe("Getting Started");
    expect(memberStatusLabel("building", "3 of 30 sections complete")).toBe(
      "In Progress",
    );
  });

  it("identity card hierarchy for resume", () => {
    const entry: ActiveWorkspaceEntry = {
      workspaceId: "ws-1",
      creationType: "Workshop",
      title: "Build Your Simple Productivity System",
      currentFocusTitle: "Dates",
      currentFocusId: "dates",
      progressLabel: "12 of 30 sections complete",
      lastActivityAt: new Date().toISOString(),
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: "ws-1",
      eventRecordId: null,
      projectHomeId: null,
      sessionId: "ws-1",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const card = buildWorkspaceIdentityCard(entry);
    expect(card.title).toBe("Build Your Simple Productivity System");
    expect(card.creationType).toBe("Workshop");
    expect(card.currentFocusOrNext).toMatch(/Dates/);
    expect(card.progressSummary).toMatch(/12 of 30/);
    expect(card.lastWorkedLabel).toMatch(/Today|Recently/);
  });

  it("event apply path no longer uses technical workspaceLabel as title", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const apply = readFileSync(
      resolve(
        process.cwd(),
        "lib/eventCreationWorkspace/applyWorkspaceToCreateWorkflow.ts",
      ),
      "utf8",
    );
    expect(apply).toContain("resolveHumanReadableTitle");
    expect(apply).not.toMatch(/selectedTemplateName:\s*snap\.workspaceLabel/);
  });

  it("working panel header uses human-readable resolver", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateWorkingPanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("resolveHumanReadableTitle");
    expect(panel).not.toContain("Event Creation Workspace");
  });
});
