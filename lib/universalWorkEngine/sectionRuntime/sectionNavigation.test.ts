/**
 * 098 — Section navigation, independent content, and Complete It Now assembly.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { updateWorkspaceV2SectionContent } from "@/lib/createWorkspaceV2";
import { openWorkshopMapSection } from "@/lib/workTypeSchema/openWorkshopMapSection";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import { syncCanonicalWorkFromCreateWorkflow } from "@/lib/createProjects/syncCanonicalWorkFromCreate";
import {
  completeItNow,
  completeWorkSection,
  resetWorkIdentityStoreForTests,
  resolveActiveSectionId,
  selectWorkSection,
} from "../index";

describe("098 Create section navigation and assembly", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
  });

  it("Introduction opens Introduction; Main Content opens Main Content editor", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-nav-1",
    };
    expect(wf.activeSectionId).toBe("intro");
    let focus = resolveFocusForCreationDestination(wf)!;
    expect(focus.sectionId).toBe("intro");
    expect(focus.title).toMatch(/introduction/i);

    wf = openWorkshopMapSection(wf, "main");
    expect(wf.activeSectionId).toBe("main");
    expect(wf.workspaceCurrentFocus?.sectionId).toBe("main");
    focus = resolveFocusForCreationDestination(wf)!;
    expect(focus.sectionId).toBe("main");
    expect(focus.title).toMatch(/main content/i);
    expect(focus.focusId).toBe("section:main");
  });

  it("Current Focus matches editor section and loads saved content", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-content-1",
    };
    wf = updateWorkspaceV2SectionContent(wf, "intro", "Intro words");
    wf = openWorkshopMapSection(wf, "main");
    wf = updateWorkspaceV2SectionContent(wf, "main", "Main words");
    wf = openWorkshopMapSection(wf, "intro");
    const focus = resolveFocusForCreationDestination(wf)!;
    expect(focus.sectionId).toBe("intro");
    expect(focus.savedContent).toBe("Intro words");
    expect(wf.sectionContent?.main).toBe("Main words");
  });

  it("invalid section IDs fail safely (no switch)", () => {
    const wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-invalid-1",
      activeSectionId: "intro",
    };
    const next = selectWorkSection(wf, "not-a-real-section");
    expect(next.activeSectionId).toBe("intro");
  });

  it("active section survives Create → Projects sync (same Work ID)", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-projects-1",
    };
    wf = openWorkshopMapSection(wf, "main");
    wf = updateWorkspaceV2SectionContent(wf, "main", "Channel plan");
    const work = syncCanonicalWorkFromCreateWorkflow({
      workflow: wf,
      createWorkflowId: wf.sessionId,
    });
    expect(work.id).toBe("work-campaign-projects-1");
    expect(work.activeSectionId).toBe("main");
    expect(resolveActiveSectionId(wf)).toBe("main");
  });

  it("Complete Section affects one section only", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-lifecycle-1",
    };
    wf = updateWorkspaceV2SectionContent(wf, "intro", "Hello");
    wf = completeWorkSection(wf, "intro");
    expect(wf.completedSectionIds).toContain("intro");
    expect(wf.completedSectionIds).not.toContain("main");
  });

  it("Complete It Now assembles in schema order with same Work ID", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-assemble-1",
    };
    wf = updateWorkspaceV2SectionContent(wf, "intro", "Open with care");
    wf = updateWorkspaceV2SectionContent(wf, "main", "Body of the campaign");
    wf = updateWorkspaceV2SectionContent(wf, "cta", "Reply today");
    wf = updateWorkspaceV2SectionContent(wf, "distribution", "Email + posts");
    wf = updateWorkspaceV2SectionContent(wf, "metrics", "Open rate");

    const result = completeItNow(wf);
    expect(result.ok).toBe(true);
    expect(result.assembled?.workId).toBe("work-campaign-assemble-1");
    const body = result.assembled!.body;
    expect(body.indexOf("Introduction")).toBeLessThan(body.indexOf("Main Content"));
    expect(body.indexOf("Main Content")).toBeLessThan(body.indexOf("Call to Action"));
    expect(body).toContain("Open with care");
    expect(body).toContain("Body of the campaign");
    expect(result.workflow.assembledOutput?.stale).toBe(false);

    const edited = updateWorkspaceV2SectionContent(
      result.workflow,
      "main",
      "Revised body",
    );
    expect(edited.assembledOutput?.stale).toBe(true);
  });

  it("Complete It Now blocks when required short-map sections are empty", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-block-1",
    };
    wf = updateWorkspaceV2SectionContent(wf, "intro", "Only intro");
    const result = completeItNow(wf);
    expect(result.ok).toBe(false);
    expect(result.validation.missingRequiredSectionIds.length).toBeGreaterThan(0);
  });

  it("Event Plan map click switches active section (universality)", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Event Plan"),
      sessionId: "work-event-nav-1",
    };
    const first = wf.activeSectionId;
    expect(first).toBeTruthy();
    wf = openWorkshopMapSection(wf, "venue");
    expect(wf.activeSectionId).toBe("venue");
    const focus = resolveFocusForCreationDestination(wf)!;
    expect(focus.sectionId).toBe("venue");
    expect(focus.title).toMatch(/venue/i);
  });
});
