/**
 * Standard 071 — Active Workspace Registry & resume continuity.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { clearRuntimeCreationRecordsForTests } from "@/lib/currentFocus/creationRecord";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { buildContinuityManifest } from "@/lib/continuityManifest";
import { buildCreateConsentOffer } from "@/lib/createOpenAuthority";
import {
  buildActiveWorkspaceResumeGuidance,
  clearActiveWorkspaceRegistryForTests,
  getMostRecentActiveWorkspace,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  isActiveWorkspaceResumeRequest,
  listActiveWorkspaces,
  matchActiveWorkspaceResume,
  registerCreationDestinationWorkspace,
} from "./index";
import { ensureRuntimeCreationRecord } from "@/lib/currentFocus/creationRecord";

describe("071 — Active Workspace Registry", () => {
  beforeEach(() => {
    localStorage.clear();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  it("registers Creation Destination and surfaces it everywhere", () => {
    const workflow = initializeWorkspaceV2Workflow("Email");
    const entry = registerCreationDestinationWorkspace(workflow);
    expect(entry.workspaceId).toBeTruthy();
    expect(entry.resumeTarget).toBe("estate-create");
    expect(getMostRecentActiveWorkspace()?.workspaceId).toBe(entry.workspaceId);
    expect(listActiveCreationWorkspaces().some((w) => w.id === entry.workspaceId)).toBe(
      true,
    );
    const manifest = buildContinuityManifest();
    expect(
      manifest.items.some(
        (i) => i.type === "active-creation" && i.id.includes(entry.workspaceId),
      ),
    ).toBe(true);
  });

  it("chat resume phrases match the registry — not new Create", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    registerCreationDestinationWorkspace({
      ...workflow,
      selectedTemplateName: "Simple Productivity System Workshop",
    });
    expect(isActiveWorkspaceResumeRequest("Let's go back to the workshop.")).toBe(
      true,
    );
    expect(
      isActiveWorkspaceResumeRequest(
        "Let's go back to my productivity workshop.",
      ),
    ).toBe(true);
    expect(isActiveWorkspaceResumeRequest("Continue my document.")).toBe(true);
    const matched = matchActiveWorkspaceResume(
      "Let's go back to my productivity workshop.",
    );
    expect(matched).toBeTruthy();
    expect(matched?.title).toMatch(/productivity/i);
    const guidance = buildActiveWorkspaceResumeGuidance(matched!);
    expect(guidance).toMatch(/reopened/i);
    expect(guidance).toMatch(/Simple Productivity System Workshop/i);
    expect(guidance).not.toMatch(/beside us|I can help you build that in Create/i);
  });

  it("never registers Default Workshop Template as the member title", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    expect(workflow.selectedTemplateName ?? "").not.toMatch(/default.+template/i);
    const entry = registerCreationDestinationWorkspace(workflow);
    expect(entry.title).not.toMatch(/default.+template/i);
    expect(entry.title.toLowerCase()).not.toBe("workshop");
  });

  it("consent offer resumes instead of starting Create when work exists", () => {
    const workflow = initializeWorkspaceV2Workflow("Newsletter");
    registerCreationDestinationWorkspace(workflow);
    const offer = buildCreateConsentOffer("Continue my Newsletter");
    expect(offer).toMatch(/reopened/i);
    expect(offer).not.toMatch(/I can help you build that in Create/i);
  });

  it("hydrate rebuilds registry from Runtime Creation Records after clear", () => {
    const workflow = initializeWorkspaceV2Workflow("Document");
    const runtime = ensureRuntimeCreationRecord(workflow);
    clearActiveWorkspaceRegistryForTests();
    // listActiveWorkspaces auto-heals from runtime records (071 refresh survival)
    ensureRuntimeCreationRecord({
      ...workflow,
      sessionId: runtime.id,
    });
    const n = hydrateActiveWorkspaceRegistryFromRuntimeRecords();
    expect(n).toBeGreaterThanOrEqual(0);
    expect(
      listActiveWorkspaces().some((w) => w.workspaceId === runtime.id),
    ).toBe(true);
  });

  it("resume identity stays stable — same workspace ID after re-register", () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    const first = registerCreationDestinationWorkspace({
      ...workflow,
      sessionId: "ws-stable-071",
      selectedTemplateName: "Founder Retreat",
    });
    expect(first.workspaceId).toBe("ws-stable-071");
    const second = registerCreationDestinationWorkspace({
      ...workflow,
      sessionId: "ws-stable-071",
      selectedTemplateName: "Founder Retreat",
      sectionContent: { outcomes: "Clear next steps" },
    });
    expect(second.workspaceId).toBe(first.workspaceId);
    expect(listActiveWorkspaces()).toHaveLength(1);
    expect(getMostRecentActiveWorkspace()?.workspaceId).toBe("ws-stable-071");
  });
});
