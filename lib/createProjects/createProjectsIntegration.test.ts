/**
 * @vitest-environment jsdom
 * Create ↔ Projects — shared canonical work + Estate Create shell regression.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  detectCreateTypeFromPrompt,
  findCanonicalWorkByCreateWorkflow,
  isProjectWorthyCreateType,
  listCanonicalWorkRecords,
  upsertCanonicalWorkRecord,
} from "./canonicalWorkRecord";
import { connectCanonicalWorkToProjectHome } from "./connectCanonicalWorkToProjectHome";
import { syncCanonicalWorkFromCreateWorkflow } from "./syncCanonicalWorkFromCreate";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  isEstateCreateShellMounted,
  isLegacyCreateSplitActive,
  LEGACY_CREATE_SPLIT_SHELL,
} from "@/lib/createEstate/legacyCreateShellQuarantine";
import { defaultTemplateFor } from "@/lib/createTemplates";
import { hasLaunchableCreateWorkflow } from "@/lib/createWorkflow";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Create ↔ Projects canonical work", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("detects retreat / event prompts as Event Plan", () => {
    expect(
      detectCreateTypeFromPrompt("Help me plan a retreat weekend event."),
    ).toBe("Event Plan");
  });

  it("Event Plan is launchable and has event sections", () => {
    expect(hasLaunchableCreateWorkflow("Event Plan")).toBe(true);
    const sections = defaultTemplateFor("Event Plan").sections.map((s) =>
      s.label.toLowerCase(),
    );
    for (const needed of [
      "event type",
      "purpose",
      "audience",
      "outcomes",
      "dates",
      "venue",
      "budget",
      "speakers",
      "vendors",
      "volunteers",
      "marketing",
      "attendee experience",
      "run of show",
      "follow-up",
      "registration",
      "agenda",
    ]) {
      expect(sections).toContain(needed);
    }
  });

  it("standalone creation stays creation-only (no forced project)", () => {
    expect(isProjectWorthyCreateType("Newsletter")).toBe(false);
    const wf = initializeWorkspaceV2Workflow("Newsletter");
    const work = syncCanonicalWorkFromCreateWorkflow({
      workflow: wf,
      createWorkflowId: "wf-newsletter-1",
    });
    expect(work.kind).toBe("creation");
    expect(work.projectHomeId).toBeNull();
    expect(listCanonicalWorkRecords()).toHaveLength(1);
  });

  it("event creation syncs shared record and can connect Project Home once", () => {
    const wf = initializeWorkspaceV2Workflow("Event Plan");
    const work = syncCanonicalWorkFromCreateWorkflow({
      workflow: wf,
      createWorkflowId: "wf-event-1",
      conversationContext: "Help me plan a retreat weekend event.",
    });
    expect(work.workType).toBe("Event Plan");
    expect(work.sections.length).toBeGreaterThanOrEqual(10);
    expect(isProjectWorthyCreateType(work.workType)).toBe(true);

    const first = connectCanonicalWorkToProjectHome({
      work,
      purposeHint: "Retreat weekend",
    });
    expect(first.created).toBe(true);
    expect(first.projectHomeId).toBeTruthy();

    const again = connectCanonicalWorkToProjectHome({
      work: first.work,
    });
    expect(again.created).toBe(false);
    expect(again.projectHomeId).toBe(first.projectHomeId);

    const byWf = findCanonicalWorkByCreateWorkflow("wf-event-1");
    expect(byWf?.projectHomeId).toBe(first.projectHomeId);
    expect(listCanonicalWorkRecords()).toHaveLength(1);
  });

  it("does not invent tasks when connecting Project Home", () => {
    const work = upsertCanonicalWorkRecord({
      title: "Spring Retreat",
      workType: "Event Plan",
      sections: [{ id: "overview", title: "Overview", content: "Quiet weekend" }],
    });
    const linked = connectCanonicalWorkToProjectHome({ work });
    expect(linked.work.tasks).toEqual([]);
  });

  it("shared content persists across Create ↔ Project reopen ids", () => {
    const wf = initializeWorkspaceV2Workflow("Event Plan");
    wf.sectionContent = {
      ...(wf.sectionContent ?? {}),
      purpose: "A restorative weekend for founders",
    };
    const work = syncCanonicalWorkFromCreateWorkflow({
      workflow: wf,
      createWorkflowId: "wf-persist-1",
    });
    const linked = connectCanonicalWorkToProjectHome({ work });
    const reopened = findCanonicalWorkByCreateWorkflow("wf-persist-1");
    expect(reopened?.sections.find((s) => s.id === "purpose")?.content).toMatch(
      /restorative/i,
    );
    expect(reopened?.projectHomeId).toBe(linked.projectHomeId);
  });
});

describe("Estate Create shell ownership", () => {
  it("quarantines legacy split shell metadata", () => {
    expect(LEGACY_CREATE_SPLIT_SHELL.status).toBe("quarantined");
    expect(LEGACY_CREATE_SPLIT_SHELL.replacedBy.panel).toBe(
      "CreateEstateWorkingPanel",
    );
  });

  it("detects estate vs legacy mount rules", () => {
    expect(
      isEstateCreateShellMounted({
        activeSection: "create",
        createShellAttr: "estate-art-studio",
      }),
    ).toBe(true);
    expect(
      isLegacyCreateSplitActive({
        activeSection: "home",
        workspacePanel: "content-generator",
        chatLayoutMode: "split",
      }),
    ).toBe(true);
    expect(
      isLegacyCreateSplitActive({
        activeSection: "create",
        workspacePanel: null,
        chatLayoutMode: "workspace-focus",
      }),
    ).toBe(false);
  });

  it("CPC keeps Create working session on estate shell (no openCreateWorkspace)", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("CreateEstateWorkingPanel");
    expect(client).toContain("syncCanonicalWorkFromCreateWorkflow");
    expect(client).toContain("connectCanonicalWorkToProjectHome");
    const estateStart = client.slice(
      client.indexOf("function startFreshCreateFromEstate"),
      client.indexOf("function startBusinessStrategyBuilder"),
    );
    expect(estateStart).toContain('setActiveSection("create")');
    expect(estateStart).not.toContain("openCreateWorkspace(");
    expect(client).not.toMatch(
      /onOpenSavedDraft=\{\(id\) => \{[\s\S]*?applyChatLayoutMode\("split"\)/,
    );
  });

  it("CreateEstateWorkingPanel mounts Art Studio shell + living sections", () => {
    const panel = read("components/companion/CreateEstateWorkingPanel.tsx");
    expect(panel).toContain("CreateEstateRoomShell");
    expect(panel).toContain('data-create-shell="estate-art-studio"');
    expect(panel).toContain('presentation="estate"');
    expect(panel).toContain("CreateWorkspaceV2Panel");
    expect(panel).toContain("create-connect-project-home");
    expect(panel).not.toMatch(/import.*WorkspaceLayout/);
    expect(panel).not.toContain("ContentGeneratorPanel");
  });

  it("Create is a dedicated exclusive estate destination", () => {
    const dedicated = read("lib/estate/directEstateVisit.ts");
    expect(dedicated).toMatch(/DEDICATED_ESTATE_ROOM_PANEL_SECTIONS[\s\S]*?"create"/);
    const presence = read("lib/estate/estatePresence/registry.ts");
    expect(presence).toMatch(/create:\s*null/);
  });
});
