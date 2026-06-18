import { describe, expect, it } from "vitest";
import {
  activeWorkflowConceptHintForChat,
  extractPendingQuestionFromAssistant,
  isCreateBuilderWorkflowActive,
  isWorkflowConceptQuestion,
  resolveActiveWorkflowContext,
  shouldSuppressTeachingMode,
} from "./activeWorkflowContextLock";
import { teachingModeActive } from "./teachingMode";
import type { CreateBuilderSession } from "./createBuilderChat";
import { EMPTY_CREATE_WORKFLOW } from "./createWorkflow";

describe("activeWorkflowContextLock", () => {
  it("detects workflow concept questions", () => {
    expect(isWorkflowConceptQuestion("What is a positioning statement?")).toBe(
      true,
    );
    expect(isWorkflowConceptQuestion("ADHD coaches")).toBe(false);
  });

  it("extracts pending question from assistant message", () => {
    expect(
      extractPendingQuestionFromAssistant(
        "Let's build your positioning.\n\n**Who is the target audience?**",
      ),
    ).toBe("Who is the target audience?");
  });

  it("resolves create builder workflow with resume question", () => {
    const session: CreateBuilderSession = {
      typeLabel: "Business Strategy",
      workflow: {
        ...EMPTY_CREATE_WORKFLOW,
        step: "discovery",
        discoveryAnswers: { goal: "Grow visibility" },
      },
      phase: "discovery",
    };
    const ctx = resolveActiveWorkflowContext({
      createBuilderActive: true,
      createBuilderSession: session,
      lastAssistantText: "**Who is the target audience?**",
    });
    expect(ctx?.kind).toBe("create_builder");
    expect(ctx?.label).toBe("Strategy Builder");
    expect(ctx?.resumeQuestion).toBe("Who is the target audience?");
  });

  it("suppresses teaching mode when workflow is active", () => {
    const session: CreateBuilderSession = {
      typeLabel: "Business Strategy",
      workflow: { ...EMPTY_CREATE_WORKFLOW, step: "discovery" },
      phase: "discovery",
    };
    const input = {
      createBuilderActive: isCreateBuilderWorkflowActive(
        session,
        "content-generator",
      ),
      createBuilderSession: session,
    };
    expect(shouldSuppressTeachingMode(input)).toBe(true);
    expect(
      teachingModeActive("What is a positioning statement?", "", {
        activeWorkflowLocked: shouldSuppressTeachingMode(input),
      }),
    ).toBe(false);
  });

  it("concept hint blocks teaching menu and resumes workflow", () => {
    const hint = activeWorkflowConceptHintForChat({
      userText: "What is a positioning statement?",
      workflow: {
        kind: "create_builder",
        label: "Strategy Builder",
        resumeQuestion: "Who is the target audience?",
      },
    });
    expect(hint).toMatch(/ACTIVE WORKFLOW CONTEXT LOCK/i);
    expect(hint).toMatch(/Do NOT enter Teaching Mode/i);
    expect(hint).toMatch(/Who is the target audience/i);
    expect(hint).toMatch(/Do NOT offer/i);
  });
});
