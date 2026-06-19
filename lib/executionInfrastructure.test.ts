import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProjectFromDocument,
  linkGoogleAssetToProject,
} from "./createExecution";
import {
  addDecisionToProject,
  buildDecisionProjectMilestones,
  createDecisionProject,
  decisionSaveShowsProjectPicker,
} from "./decisionProjectBridge";
import {
  receiptAddedToProject,
  receiptDecisionSavedOnly,
  receiptExecutionFailed,
  receiptProjectCreated,
} from "./executionReceipts";
import {
  groupUnifiedProjectFiles,
  listUnifiedProjectFiles,
} from "./projectFiles";
import {
  buildMilestonePlan,
  extractMilestonesFromDocument,
  STARTER_MILESTONES,
} from "./projectStructure";
import { upsertDocumentMetadata } from "./documentMetadataStore";
import {
  listProjectExecutionLinks,
  saveProjectExecutionLink,
} from "./projectExecutionLinks";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import { enrichAuthority } from "./decisionCompassSessionAuthority";
import { snapshotFromPanelState } from "./decisionCompassSessionStore";
import { getProjectItems, getProjects } from "./companionStore";
import { saveReceipt } from "./saveExportTrust";

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

function sampleDecisionSession() {
  let state = emptyDecisionCompassState();
  state = advanceDecisionCompass(state, {
    decision: "Hire a salesperson or keep doing sales myself?",
  });
  state = advanceDecisionCompass(state, {
    options: "Hire a salesperson\n---\nKeep doing sales myself",
  });
  state = setDecisionType(state, "strategic");
  state = advanceDecisionCompass(state);
  state = advanceDecisionCompass(state, {
    "concern-a": "Cost and training",
    "concern-b": "Burnout risk",
    freedom: "A",
    growth: "A",
  });
  const snap = snapshotFromPanelState(
    state,
    "Hire a salesperson",
    "Keep doing sales myself",
    "",
  );
  return enrichAuthority({
    ...snap,
    complete: true,
    recommendation: {
      type: "strategic",
      headline: "Strategic Recommendation",
      choice: "Hire a salesperson",
      summary: "Growth leads with hiring",
    },
    exploration: {
      confidence: "moderate",
      whatCouldChange: ["Budget changes"],
      exploredQuestions: [],
      alternativePaths: {
        primary: "Hire a salesperson",
        alternatives: ["Commission-only rep", "Part-time support"],
        experimental: ["Two-week sales sprint"],
      },
      actionPlan: {
        decision: "Hire decision",
        recommendedChoice: "Hire a salesperson",
        steps: [
          "Define the role",
          "Document sales process",
          "Interview candidates",
        ],
        createdAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    },
  });
}

describe("Execution Infrastructure Sprint #1", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {
      ...globalThis,
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    });
    for (const key of [
      "companion-projects-v1",
      "companion-project-items-v1",
      "companion-saved-work-v1",
      "companion-project-execution-links-v1",
      "companion-document-metadata",
    ]) {
      localStorage.removeItem(key);
    }
  });

  it("1. document milestones become project sections", () => {
    const milestones = extractMilestonesFromDocument(LAUNCH_PLAN);
    expect(milestones.map((m) => m.title)).toEqual(
      expect.arrayContaining(["Phase 1", "Phase 2"]),
    );
    const result = createProjectFromDocument({
      title: "Summit Launch",
      artifactType: "Launch Plan",
      body: LAUNCH_PLAN,
    });
    const sections = getProjectItems(result.projectId).filter(
      (i) => i.kind === "section",
    );
    expect(sections.length).toBeGreaterThanOrEqual(2);
    expect(result.milestoneCount).toBeGreaterThanOrEqual(2);
  });

  it("2. tasks are saved under milestone sections", () => {
    const result = createProjectFromDocument({
      title: "Summit Launch",
      artifactType: "Launch Plan",
      body: LAUNCH_PLAN,
    });
    const items = getProjectItems(result.projectId);
    const sections = items.filter((i) => i.kind === "section");
    const phase1 = sections.find((s) => s.title === "Phase 1");
    expect(phase1).toBeDefined();
    const childTasks = items.filter(
      (i) => i.parentId === phase1!.id && i.kind === "task",
    );
    expect(childTasks.length).toBeGreaterThanOrEqual(2);
    expect(childTasks.some((t) => /slides/i.test(t.title))).toBe(true);
  });

  it("3. weak content creates starter project structure", () => {
    const plan = buildMilestonePlan("Document", "Short note.");
    expect(plan[0]?.title).toBe(STARTER_MILESTONES[0]!.title);
    const result = createProjectFromDocument({
      title: "Quick Note",
      artifactType: "Document",
      body: "Short note.",
    });
    expect(result.taskCount).toBeGreaterThanOrEqual(4);
    expect(result.milestoneCount).toBeGreaterThanOrEqual(1);
  });

  it("4. decision save shows project picker when no active project", () => {
    expect(decisionSaveShowsProjectPicker(null)).toBe(true);
    expect(decisionSaveShowsProjectPicker(undefined)).toBe(true);
    expect(decisionSaveShowsProjectPicker("proj-1")).toBe(false);
  });

  it("5. decision compass can create new project from decision", () => {
    const session = sampleDecisionSession();
    const result = createDecisionProject(session);
    expect(getProjects().some((p) => p.id === result.projectId)).toBe(true);
    expect(result.milestoneCount).toBeGreaterThanOrEqual(3);
    expect(result.taskCount).toBeGreaterThan(0);
  });

  it("6. decision action plan creates project tasks", () => {
    const session = sampleDecisionSession();
    const result = createDecisionProject(session);
    const items = getProjectItems(result.projectId);
    const actionSection = items.find((i) => i.title === "Action Plan");
    expect(actionSection).toBeDefined();
    const steps = items.filter(
      (i) => i.parentId === actionSection!.id && /Define the role/i.test(i.title),
    );
    expect(steps.length).toBe(1);
  });

  it("7. concerns become risks section tasks", () => {
    const milestones = buildDecisionProjectMilestones(sampleDecisionSession());
    const risks = milestones.find((m) => m.title === "Risks To Watch");
    expect(risks?.tasks.length).toBeGreaterThan(0);
  });

  it("8. alternative paths are saved as notes", () => {
    const milestones = buildDecisionProjectMilestones(sampleDecisionSession());
    const alts = milestones.find((m) => m.title === "Alternative Paths");
    expect(alts?.notes?.some((n) => /Commission-only/i.test(n))).toBe(true);
  });

  it("9. google docs links appear in project files", () => {
    upsertDocumentMetadata({
      title: "Marketing Plan",
      type: "Marketing Plan",
      googleUrl: "https://docs.google.com/document/d/abc",
      googleFileId: "abc",
      googleKind: "doc",
      projectId: "proj-1",
    });
    const files = listUnifiedProjectFiles("proj-1");
    expect(files.some((f) => f.category === "documents")).toBe(true);
  });

  it("10. google sheets links appear in project files", () => {
    saveProjectExecutionLink({
      projectId: "proj-2",
      kind: "sheet",
      label: "Task List",
      url: "https://docs.google.com/spreadsheets/d/xyz",
      fileId: "xyz",
    });
    const files = listUnifiedProjectFiles("proj-2");
    expect(files.some((f) => f.category === "spreadsheets")).toBe(true);
  });

  it("11. google forms links appear in project files", () => {
    upsertDocumentMetadata({
      title: "Feedback Form",
      type: "Form",
      googleUrl: "https://docs.google.com/forms/d/form1",
      googleFileId: "form1",
      googleKind: "form",
      projectId: "proj-3",
    });
    const files = listUnifiedProjectFiles("proj-3");
    expect(files.some((f) => f.category === "forms")).toBe(true);
  });

  it("12. unified files merge metadata and execution links without duplicates", () => {
    const url = "https://docs.google.com/document/d/shared";
    upsertDocumentMetadata({
      title: "Shared Doc",
      type: "Plan",
      googleUrl: url,
      googleFileId: "shared",
      googleKind: "doc",
      projectId: "proj-4",
    });
    saveProjectExecutionLink({
      projectId: "proj-4",
      kind: "doc",
      label: "Shared Doc",
      url,
      fileId: "shared",
    });
    const files = listUnifiedProjectFiles("proj-4");
    expect(files.filter((f) => f.url === url)).toHaveLength(1);
    const grouped = groupUnifiedProjectFiles(files);
    expect(grouped.documents.length).toBe(1);
  });

  it("13. receipts explain exactly what was saved", () => {
    expect(receiptProjectCreated("Marketing Launch", 3, 12)).toMatch(
      /3 milestones and 12 tasks/i,
    );
    expect(receiptAddedToProject("ADHD Workshop", 2, 8)).toMatch(/ADHD Workshop/);
    expect(receiptDecisionSavedOnly("Saved Work > Plans")).toMatch(/Saved Work/);
  });

  it("14. failure keeps local work safe", () => {
    expect(receiptExecutionFailed()).toBe(saveReceipt("google-fail"));
    expect(saveReceipt("google-fail")).toMatch(/still saved/i);
  });

  it("add decision to existing project preserves structure", () => {
    const session = sampleDecisionSession();
    const created = createDecisionProject(session);
    const beforeCount = getProjectItems(created.projectId).length;
    const added = addDecisionToProject(
      session,
      created.projectId,
      created.projectName,
    );
    expect(added.taskCount).toBeGreaterThan(0);
    expect(getProjectItems(created.projectId).length).toBeGreaterThan(
      beforeCount,
    );
  });

  it("linkGoogleAssetToProject writes to both stores", () => {
    linkGoogleAssetToProject("proj-5", {
      kind: "doc",
      url: "https://docs.google.com/document/d/dual",
      fileId: "dual",
      label: "Dual Store Doc",
    });
    expect(listProjectExecutionLinks("proj-5").length).toBe(1);
    expect(listUnifiedProjectFiles("proj-5").length).toBe(1);
  });
});
