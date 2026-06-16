import { describe, expect, it } from "vitest";
import {
  buildProjectGrounding,
  formatProjectGroundingForPrompt,
  groundedCoachReason,
  groundedMissingPrompt,
  isProjectFieldVisible,
  visibleProjectFields,
} from "./projectGrounding";
import type { WorkspacePanelDetail } from "./workspaceAwareness";

describe("projectGrounding", () => {
  const listCtx: WorkspacePanelDetail = {
    view: "list",
    stage: "Project list",
    selectedItemName: null,
    selectedItemGoal: null,
    selectedItemStatus: null,
    selectedItemHorizon: null,
    nextAction: null,
  };

  const createTitleCtx: WorkspacePanelDetail = {
    view: "create",
    stage: "Creating project — title (what you're building)",
    selectedItemName: "VIP Workshop",
    selectedItemGoal: null,
    selectedItemStatus: "Draft (not saved yet)",
    selectedItemHorizon: null,
    nextAction: null,
  };

  const detailCtx: WorkspacePanelDetail = {
    view: "detail",
    stage: "Project detail",
    selectedItemName: "VIP Workshop",
    selectedItemGoal: null,
    selectedItemStatus: "In progress",
    selectedItemHorizon: "Soon",
    nextAction: null,
  };

  const detailNowCtx: WorkspacePanelDetail = {
    ...detailCtx,
    selectedItemHorizon: "Now",
  };

  it("lists only name on project list view", () => {
    expect(visibleProjectFields(listCtx)).toEqual(["name"]);
    expect(isProjectFieldVisible("outcome", listCtx)).toBe(false);
  });

  it("shows outcome only on create outcome step", () => {
    expect(visibleProjectFields(createTitleCtx)).toEqual(["name"]);
    expect(
      visibleProjectFields({
        ...createTitleCtx,
        stage: "Creating project — outcome (why it matters)",
      }),
    ).toContain("outcome");
  });

  it("shows next step only when horizon is Now on detail", () => {
    expect(visibleProjectFields(detailCtx)).not.toContain("nextStep");
    expect(visibleProjectFields(detailNowCtx)).toContain("nextStep");
  });

  it("uses gentle missing copy for visible outcome", () => {
    expect(groundedMissingPrompt("outcome", detailCtx)).toContain(
      "don't see a clear outcome",
    );
    expect(groundedMissingPrompt("outcome", detailCtx)).not.toContain("field");
  });

  it("falls back when field is not visible", () => {
    expect(groundedMissingPrompt("outcome", listCtx)).toContain(
      "success look like",
    );
  });

  it("coach reasons avoid internal field names", () => {
    const reason = groundedCoachReason("outcome", detailCtx);
    expect(reason.toLowerCase()).not.toContain("outcome field");
    expect(reason.toLowerCase()).not.toContain("empty");
  });

  it("prompt block forbids priority and milestones", () => {
    const prompt = formatProjectGroundingForPrompt(detailCtx);
    expect(prompt).toContain("Never say: priority, milestones");
    expect(prompt).toContain("NOT on screen");
  });

  it("hidden fields include next step when horizon is not Now", () => {
    const g = buildProjectGrounding(detailCtx);
    expect(g.hiddenFromUser.some((h) => /next step/i.test(h))).toBe(true);
  });

  it("includes color on detail and list when visual mode is on", () => {
    expect(visibleProjectFields(detailCtx)).toContain("color");
    expect(visibleProjectFields(detailCtx)).toContain("conversations");
    expect(visibleProjectFields(detailCtx)).toContain("files");
    expect(
      visibleProjectFields({ ...listCtx, showProjectColor: true }),
    ).toContain("color");
    expect(visibleProjectFields(listCtx)).not.toContain("color");
  });

  it("prompt mentions conversations and files on detail", () => {
    const prompt = formatProjectGroundingForPrompt({
      ...detailCtx,
      projectConversationCount: 2,
      projectFileCount: 1,
    });
    expect(prompt).toContain("Conversations on screen: 2");
    expect(prompt).toContain("Files on screen: 1");
  });
});
