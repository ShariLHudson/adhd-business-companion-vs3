import { describe, expect, it } from "vitest";
import { requireWorkTypePackage, UnknownWorkTypeError } from "@/lib/universalWorkEngine";
import { validateCreateForBuild } from "./createBuild";
import { buildFullCreateBrief } from "./createTemplates";
import { OTHER_OPTION } from "./createTypePickers";
import {
  addWorkspaceV2Section,
  buildWorkspaceV2Brief,
  formatCreateWorkspaceV2ChatHint,
  formatCreateWorkspaceV2ExplorationHint,
  initializeWorkspaceV2Workflow,
  moveWorkspaceV2Section,
  reorderWorkspaceV2Sections,
  shouldUseCreateBuilderChatTurns,
  toggleWorkspaceV2SectionSkipped,
  updateWorkspaceV2SectionContent,
  workspaceV2HasBuildableContent,
  workspaceV2Sections,
} from "./createWorkspaceV2";

describe("createWorkspaceV2", () => {
  it("disables chat-controlled builder turns when v2 is on", () => {
    expect(shouldUseCreateBuilderChatTurns()).toBe(false);
  });

  it("opens course outline blueprint with editable sections", () => {
    const wf = initializeWorkspaceV2Workflow("Course Outline");
    const sections = wf.templateSections ?? [];
    expect(sections.length).toBeGreaterThanOrEqual(3);
    expect(sections.some((s) => /module/i.test(s.label))).toBe(true);
    expect(workspaceV2HasBuildableContent(wf)).toBe(false);
  });

  it("builds draft brief from workspace sections only", () => {
    let wf = initializeWorkspaceV2Workflow("Newsletter");
    const first = wf.templateSections?.[0];
    expect(first).toBeTruthy();
    wf = updateWorkspaceV2SectionContent(wf, first!.id, "Perfectionism traps founders");
    const brief = buildWorkspaceV2Brief(wf);
    expect(brief).toContain("Perfectionism traps founders");
    expect(brief).not.toContain("Would you like");
    expect(buildFullCreateBrief(wf)).toContain("Perfectionism traps founders");
  });

  it("allows N/A sections and validates build readiness", () => {
    let wf = initializeWorkspaceV2Workflow("Newsletter");
    const sectionId = wf.templateSections?.[0]?.id;
    expect(sectionId).toBeTruthy();
    wf = toggleWorkspaceV2SectionSkipped(wf, sectionId!);
    expect(workspaceV2HasBuildableContent(wf)).toBe(true);
    const validation = validateCreateForBuild(wf);
    expect(validation.readyToBuild).toBe(true);
  });

  it("unregistered Work Type labels use transitional templates; registry still fails visibly by ID", () => {
    expect(() => requireWorkTypePackage("marketing_plan")).toThrow(
      UnknownWorkTypeError,
    );
    const campaign = initializeWorkspaceV2Workflow("Marketing Campaign");
    expect((campaign.templateSections ?? []).map((s) => s.id)).toEqual([
      "intro",
      "main",
      "cta",
      "distribution",
      "metrics",
    ]);
    expect(campaign.activeSectionId).toBe("intro");
  });

  it("supports adding custom sections", () => {
    let wf = initializeWorkspaceV2Workflow(OTHER_OPTION, "Podcast outline");
    const count = wf.templateSections?.length ?? 0;
    wf = addWorkspaceV2Section(wf, "Episode hook");
    expect(wf.templateSections?.length).toBe(count + 1);
  });

  it("reorders sections for display and draft brief", () => {
    let wf = initializeWorkspaceV2Workflow("Lead Magnet");
    const sections = wf.templateSections ?? [];
    expect(sections.length).toBeGreaterThan(2);
    const last = sections[sections.length - 1]!;
    const first = sections[0]!;
    wf = updateWorkspaceV2SectionContent(wf, first.id, "First content");
    wf = updateWorkspaceV2SectionContent(wf, last.id, "Last content");
    wf = reorderWorkspaceV2Sections(wf, sections.length - 1, 1);
    const labels = (wf.templateSections ?? []).map((s) => s.id);
    expect(labels[1]).toBe(last.id);
    const brief = buildWorkspaceV2Brief(wf);
    const firstPos = brief.indexOf("First content");
    const lastPos = brief.indexOf("Last content");
    expect(firstPos).toBeGreaterThan(-1);
    expect(lastPos).toBeGreaterThan(firstPos);
  });

  it("preserves spaces while editing section content", () => {
    let wf = initializeWorkspaceV2Workflow("Newsletter");
    const first = wf.templateSections?.[0];
    expect(first).toBeTruthy();
    wf = updateWorkspaceV2SectionContent(wf, first!.id, "hello world");
    expect(workspaceV2Sections(wf)[0]?.content).toBe("hello world");
    wf = updateWorkspaceV2SectionContent(wf, first!.id, "hello ");
    expect(workspaceV2Sections(wf)[0]?.content).toBe("hello ");
  });

  it("moves sections up and down", () => {
    let wf = initializeWorkspaceV2Workflow("Social Post");
    const secondId = wf.templateSections?.[1]?.id;
    expect(secondId).toBeTruthy();
    wf = moveWorkspaceV2Section(wf, secondId!, "up");
    expect(wf.templateSections?.[0]?.id).toBe(secondId);
    wf = moveWorkspaceV2Section(wf, secondId!, "down");
    expect(wf.templateSections?.[1]?.id).toBe(secondId);
  });

  it("chat hints forbid approval and workspace-write language", () => {
    const wf = initializeWorkspaceV2Workflow("Mind Map");
    const session = {
      typeLabel: "Mind Map",
      workflow: wf,
    };
    const mainHint = formatCreateWorkspaceV2ChatHint(session);
    const exploreHint = formatCreateWorkspaceV2ExplorationHint(
      session,
      "need ideas for purpose",
      "Purpose",
    );
    expect(mainHint).toMatch(/Current Focus owns answers|Current Focus is the only answer surface/i);
    expect(mainHint).not.toMatch(/\[\[fill:/);
    expect(exploreHint).toMatch(/Copy any parts you like/i);
    expect(exploreHint).not.toMatch(/\[\[fill:/);
  });
});
