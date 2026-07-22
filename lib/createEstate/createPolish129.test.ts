/**
 * Spec 129 — Create Experience Polish & Decision Friction Elimination certification.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatAppBackLabel } from "@/lib/navigationBackLabels";
import {
  CREATE_RETURN_TO_CREATE,
  CREATE_RETURN_TO_MY_FOCUS,
  CREATE_RETURN_TO_WELCOME_HOME,
  resolveCreateExitDestination,
} from "@/lib/createGuidedConversation189";
import {
  CREATE_ESTATE_BROWSE_MORE_HEADING,
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING,
  CREATE_ESTATE_START_NEW_HEADING,
  CREATE_VS_PROJECTS_CUE,
} from "./copy";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { welcomeHomeDestinationForSection } from "@/lib/estate/welcomeHomeActiveDestination";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Create polish 129 certification", () => {
  it("has one resume path — Continue Working list, no twin Continue current CTA", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-continue");
    expect(panel).toContain("CreateWorkspaceResumeList");
    expect(panel).toContain("onRenameWorkspace");
    expect(panel).not.toContain("create-estate-continue-current");
    expect(panel).not.toContain("create-estate-active-choice");
    expect(panel).not.toContain("createEstateContinueCurrentLabel");
    expect(CREATE_ESTATE_CONTINUE_HEADING).toBe("Continue Working");
  });

  it("Browse More + Find Previous Work replace Customize/Browse/Explore Ideas (Create Simplification)", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const findPrevious = read(
      "components/companion/CreateFindPreviousWorkPanel.tsx",
    );
    expect(panel).toContain("create-estate-browse-more");
    expect(panel).toContain("create-estate-find-previous-work");
    expect(panel).toContain("CREATE_ESTATE_BROWSE_MORE_HEADING");
    expect(panel).toContain("CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING");
    expect(panel).toContain("CreateBrowseCategoriesPanel");
    expect(panel).toContain("CreateFindPreviousWorkPanel");
    expect(findPrevious).toContain("CreateDraftResumeList");
    expect(panel).not.toContain('data-testid="create-estate-advanced"');
    expect(panel).not.toContain("create-estate-guided-frameworks");
    expect(panel).not.toContain("CreateExploreIdeasPanel");
    expect(CREATE_ESTATE_BROWSE_MORE_HEADING).toBe("Browse More");
    expect(CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING).toBe(
      "Find Previous Work",
    );
  });

  it("shows intro guidance once — no Projects cue on entrance", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("CREATE_GUIDED_SUPPORT_LINE");
    expect(panel).not.toContain("CREATE_VS_PROJECTS_CUE");
    expect(panel).not.toContain("create-vs-projects-cue");
    expect(CREATE_VS_PROJECTS_CUE).toMatch(/Projects organize/i);
  });

  it("clarifies exit destinations — Return to Welcome Home / My Focus / Create", () => {
    expect(formatAppBackLabel(CREATE_RETURN_TO_WELCOME_HOME)).toBe(
      "Return to Welcome Home",
    );
    expect(formatAppBackLabel(CREATE_RETURN_TO_MY_FOCUS)).toBe(
      "Return to My Focus",
    );
    expect(formatAppBackLabel(CREATE_RETURN_TO_CREATE)).toBe(
      "Return to Create",
    );
    expect(formatAppBackLabel("Estate")).toBe("Return to Welcome Home");
    expect(resolveCreateExitDestination("plan my day")).toBe(
      CREATE_RETURN_TO_MY_FOCUS,
    );
    expect(resolveCreateExitDestination(null)).toBe(
      CREATE_RETURN_TO_WELCOME_HOME,
    );

    const entrance = read("components/companion/CreateEstateEntrancePanel.tsx");
    const working = read("components/companion/CreateEstateWorkingPanel.tsx");
    expect(entrance).toContain("resolveCreateExitDestination");
    expect(working).toContain("CREATE_RETURN_TO_CREATE");
    expect(working).not.toContain("CREATE_BACK_TO_FOCUS_DESTINATION");
  });

  it("hierarchy: Continue Working before composer before Browse More", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const continueAt = panel.indexOf('data-testid="create-estate-continue"');
    const startAt = panel.indexOf('data-testid="create-estate-composer"');
    const browseAt = panel.indexOf('data-testid="create-estate-browse-more"');
    expect(continueAt).toBeGreaterThan(-1);
    expect(startAt).toBeGreaterThan(continueAt);
    expect(browseAt).toBeGreaterThan(startAt);
    expect(CREATE_ESTATE_START_NEW_HEADING).toBe("Start Something New");
  });

  it("resume list supports inline rename + single Continue CTA", () => {
    const list = read("components/companion/CreateWorkspaceResumeList.tsx");
    expect(list).toContain("onRename");
    expect(list).toContain("create-workspace-rename-trigger");
    expect(list).toContain("Continue →");
    expect(list).toContain('data-primary-action="resume"');
  });

  it("wires durable rename on resume list and working panel", () => {
    const resume = read("components/companion/CreateWorkspaceResumeList.tsx");
    const working = read("components/companion/CreateEstateWorkingPanel.tsx");
    expect(resume).toContain("renameActiveWorkspaceTitleDurable");
    expect(working).toContain("renameActiveWorkspaceTitleDurable");
    expect(working).toContain("applyRename");
  });

  it("groups Welcome Home by intention (Build / Guidance / Reflection)", () => {
    const labels = WELCOME_HOME_NAV_CATEGORIES.map((c) => c.label);
    expect(labels).toEqual([
      "Today",
      "Build",
      "Guidance",
      "Focus",
      "Reflection",
      "Audio",
      "Spark Estates",
    ]);
    expect(labels).not.toContain("My Story");
    expect(labels).not.toContain("My Day");
    expect(labels).not.toContain("Get Advice");
    expect(labels).not.toContain("Work to Create");
    expect(labels).not.toContain("Focus & Reflection");
    expect(labels).not.toContain("Chamber");
    expect(labels).not.toContain("Board");
  });

  it("maps Create section to active Welcome Home destination", () => {
    expect(welcomeHomeDestinationForSection("create")).toBe("create");
    expect(welcomeHomeDestinationForSection("content-generator")).toBe("create");
    const menu = read("components/companion/estate/EstateRoomExperienceMenu.tsx");
    expect(menu).toContain("activeDestinationId");
    expect(menu).toContain("data-nav-active");
  });

  it("preserves 127 confirm-before-create gate", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).toContain("requestCatalogConfirm");
    expect(panel).toContain("confirmCreateBeginToOpen");
  });
});
