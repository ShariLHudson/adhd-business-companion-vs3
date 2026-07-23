import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildTaskSheetCsv,
  createProjectFromDocument,
  detectExecutionCapability,
  executionActionsForArtifact,
  executionActionsForCapability,
  extractTasksFromDocument,
} from "./createExecution";
import {
  listProjectExecutionLinks,
  saveProjectExecutionLink,
} from "./projectExecutionLinks";
import { getProjects, getProjectItems } from "./companionStore";
import { getSavedWork } from "./savedWorkStore";
import { isGoogleCreateSuccess, saveReceipt } from "./saveExportTrust";

const LAUNCH_PLAN = `# Summit Launch Plan

## Phase 1
- Finalize outline
- Create slides
- Build workbook

## Phase 2
- Create registration page
- Send invitations
- Test presentation
`;

describe("Create execution sprint", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    });
    localStorage.removeItem("companion-projects-v1");
    localStorage.removeItem("companion-project-items-v1");
    localStorage.removeItem("companion-saved-work-v1");
    localStorage.removeItem("companion-project-execution-links-v1");
  });

  it("1. create output can become project", () => {
    const cap = detectExecutionCapability("Launch Plan", LAUNCH_PLAN);
    expect(cap.canBecomeProject).toBe(true);
    expect(cap.suggestedProjectName).toMatch(/Summit Launch/i);
  });

  it("2. tasks generated from document", () => {
    const tasks = extractTasksFromDocument(LAUNCH_PLAN);
    expect(tasks.length).toBeGreaterThanOrEqual(5);
    expect(tasks.some((t) => /slides/i.test(t))).toBe(true);
  });

  it("3. create project from document works", () => {
    const result = createProjectFromDocument({
      title: "Summit Launch",
      artifactType: "Launch Plan",
      body: LAUNCH_PLAN,
    });
    expect(result.projectId).toBeTruthy();
    expect(result.taskCount).toBeGreaterThanOrEqual(5);
    expect(result.milestoneCount).toBeGreaterThanOrEqual(2);
    expect(getProjects().some((p) => p.id === result.projectId)).toBe(true);
    const sections = getProjectItems(result.projectId).filter(
      (i) => i.kind === "section",
    );
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("4. google doc success requires url and id", () => {
    expect(
      isGoogleCreateSuccess(200, {
        url: "https://docs.google.com/document/d/abc",
        id: "abc",
      }),
    ).toBe(true);
    expect(isGoogleCreateSuccess(200, { url: "https://x.com" })).toBe(false);
  });

  it("5. google sheet csv generated from tasks", () => {
    const tasks = extractTasksFromDocument(LAUNCH_PLAN);
    const csv = buildTaskSheetCsv(tasks);
    expect(csv).toContain("Finalize outline");
    expect(csv).toMatch(/Item|,/);
  });

  it("6. project stores google links", () => {
    saveProjectExecutionLink({
      projectId: "proj-1",
      kind: "doc",
      label: "Launch Plan",
      url: "https://docs.google.com/document/d/abc",
      fileId: "abc",
    });
    const links = listProjectExecutionLinks("proj-1");
    expect(links).toHaveLength(1);
    expect(links[0]?.url).toContain("docs.google.com");
  });

  it("7. decision compass creates project via shared path", () => {
    const decisionBody = `Decision: Hire salesperson

Action Plan:
1. Define the role
2. Document process
3. Interview candidates`;
    const cap = detectExecutionCapability("Decision Action Plan", decisionBody);
    expect(cap.canBecomeProject).toBe(true);
    const result = createProjectFromDocument({
      title: "Hire Salesperson",
      artifactType: "Decision Action Plan",
      body: decisionBody,
      tasks: extractTasksFromDocument(decisionBody),
    });
    expect(result.taskCount).toBeGreaterThanOrEqual(2);
  });

  it("8. execution actions appear when appropriate", () => {
    const cap = detectExecutionCapability("Marketing Plan", LAUNCH_PLAN);
    const actions = executionActionsForCapability(cap);
    expect(actions).toContain("create-project");
    expect(actions).toContain("google-doc");
  });

  it("9. receipts display correctly", () => {
    expect(saveReceipt("project", "Summit Launch")).toMatch(/Summit Launch/);
    expect(saveReceipt("google-doc")).toMatch(/Google Doc/i);
    expect(saveReceipt("google-fail")).toMatch(/still saved/i);
  });

  it("10. failures preserve work — saved work created with project", () => {
    const result = createProjectFromDocument({
      title: "Workshop Plan",
      artifactType: "Workshop",
      body: LAUNCH_PLAN,
    });
    const saved = getSavedWork().find((w) => w.id === result.savedWorkId);
    expect(saved?.body).toContain("Finalize outline");
    expect(saved?.projectId).toBe(result.projectId);
  });

  it("11. no duplicate data entry — project links saved work", () => {
    const result = createProjectFromDocument({
      title: "Course Outline",
      artifactType: "Course Outline",
      body: "- Module 1\n- Module 2\n- Module 3",
    });
    const saved = getSavedWork().find((w) => w.id === result.savedWorkId);
    expect(saved?.projectId).toBe(result.projectId);
    expect(saved?.projectName).toBe(result.projectName);
  });

  it("12. task-oriented content may detect sheet capability, but only spreadsheets offer Sheets", () => {
    const cap = detectExecutionCapability("Content Calendar", LAUNCH_PLAN);
    expect(cap.canExportSheet).toBe(true);
    expect(executionActionsForCapability(cap)).not.toContain("google-sheet");
    expect(
      executionActionsForArtifact("Content Calendar", LAUNCH_PLAN),
    ).not.toContain("google-sheet");
    expect(
      executionActionsForArtifact("Spreadsheet", "col1,col2\n1,2"),
    ).toContain("google-sheet");
  });
});
