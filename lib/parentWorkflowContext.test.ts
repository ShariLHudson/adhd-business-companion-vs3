import { describe, expect, it } from "vitest";
import {
  buildParentWorkflowFromStrategy,
  enrichChildArtifactFromParent,
  isChildArtifactRequest,
  lastChildArtifactRequestInChat,
  parseChildArtifactLabel,
  shouldSuppressCreateBuilderBootstrap,
  strategyChildArtifactFollowUp,
} from "./parentWorkflowContext";

describe("parentWorkflowContext", () => {
  it("detects child artifact requests inside a plan", () => {
    expect(isChildArtifactRequest("Write Week 1 Post 1")).toBe(true);
    expect(isChildArtifactRequest("generate week 2 email 3")).toBe(true);
    expect(isChildArtifactRequest("help me with procrastination")).toBe(false);
  });

  it("parses week/post labels", () => {
    expect(parseChildArtifactLabel("Write Week 1 Post 1")).toBe("Week 1 Post 1");
  });

  it("builds parent context from an active marketing plan session", () => {
    const parent = buildParentWorkflowFromStrategy(
      {
        typeLabel: "4-Week Marketing Plan",
        draft: "Week 1: awareness posts",
        phase: "draft",
        answers: {},
      } as never,
      null,
    );
    expect(parent?.kind).toBe("marketing_plan");
    expect(parent?.title).toBe("4-Week Marketing Plan");
    expect(parent?.panel).toBe("playbook");
  });

  it("enriches child artifacts with parent brief", () => {
    const parent = buildParentWorkflowFromStrategy(
      {
        typeLabel: "4-Week Marketing Plan",
        draft: "Theme: ADHD founders",
        phase: "draft",
        answers: {},
      } as never,
      null,
    )!;
    const enriched = enrichChildArtifactFromParent(
      {
        itemType: "Document",
        title: "Untitled document",
        draftContent: "Post copy here",
      },
      parent,
      "Write Week 1 Post 1",
    );
    expect(enriched.title).toBe("Week 1 Post 1");
    expect(enriched.itemType).toBe("Social Post");
    expect(enriched.brief).toContain("4-Week Marketing Plan");
    expect(enriched.brief).toContain("Theme: ADHD founders");
  });

  it("offers contextual next steps after applying a week post", () => {
    const parent = buildParentWorkflowFromStrategy(
      {
        typeLabel: "4-Week Marketing Plan",
        draft: "",
        phase: "draft",
        answers: {},
      } as never,
      null,
    )!;
    const followUp = strategyChildArtifactFollowUp(parent, "Week 1 Post 1");
    expect(followUp).toContain("Week 1 Post 2");
    expect(followUp).toContain("rest of **Week 1**");
    expect(followUp).toContain("4-Week Marketing Plan");
  });

  it("finds the latest child request in chat", () => {
    const text = lastChildArtifactRequestInChat([
      { role: "user", content: "Build my plan" },
      { role: "assistant", content: "Here is the plan" },
      { role: "user", content: "Write Week 1 Post 1" },
      { role: "assistant", content: "Would you like me to apply this to the draft?" },
      { role: "user", content: "yes" },
    ]);
    expect(text).toBe("Write Week 1 Post 1");
  });

  it("suppresses generic Create builder when parent workflow is active", () => {
    const parent = buildParentWorkflowFromStrategy(
      {
        typeLabel: "Marketing Plan",
        draft: "Plan body",
        phase: "draft",
        answers: {},
      } as never,
      null,
    );
    expect(
      shouldSuppressCreateBuilderBootstrap({
        parent,
        hasDraftInPanel: false,
        workflowIsLiveDraft: false,
      }),
    ).toBe(true);
    expect(
      shouldSuppressCreateBuilderBootstrap({
        parent: null,
        hasDraftInPanel: false,
        workflowIsLiveDraft: false,
      }),
    ).toBe(false);
  });
});
