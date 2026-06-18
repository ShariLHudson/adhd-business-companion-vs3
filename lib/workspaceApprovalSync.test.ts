import { describe, expect, it } from "vitest";
import {
  bootstrapCreateBuilderSession,
  processCreateBuilderTurn,
} from "./createBuilderChat";
import { advanceAfterItemPick } from "./createWorkflow";
import {
  inferPendingApprovalField,
  isWorkspaceApprovalMessage,
  normalizeApprovalFillValue,
  tryResolveWorkspaceApprovalTurn,
} from "./workspaceApprovalSync";
import {
  buildWorkspaceContext,
  resolveWorkspaceCoachTurn,
} from "./workspaceAwareness";

const projectStepsAssistant = `Here are suggested next steps:
* Define the workshop outcome
* Outline the main teaching beats
* Plan the opening exercise

Would you like me to add these as steps in your project?`;

const avatarGoalsAssistant = `Top goals for this audience:
* Clarity and focus
* Sustainable growth

Would you like me to add these to the avatar?`;

const strategyStepsAssistant = `Here is a plan with steps:
* Map your current funnel
* Pick one offer to promote
* Draft three outreach messages

Would you like me to add these steps to your plan?`;

const workshopOutlineAssistant = `Workshop outline:
* Opening hook — why perfectionism blocks launches
* Main story — the 5-minute rule
* Exercise — write your messy first draft

Would you like me to add these to your outline?`;

const createSectionAssistant = `Subject line options:
* Stop waiting for perfect
* Done beats perfect every time

Would you like me to add these to the subject line section?`;

describe("workspaceApprovalSync", () => {
  const projectCtx = buildWorkspaceContext("projects", {
    view: "detail",
    selectedItemId: "p1",
    selectedItemName: "Launch Workshop",
  })!;

  const avatarCtx = buildWorkspaceContext("client-avatars", {
    view: "detail",
    selectedItemId: "a1",
    selectedItemName: "ADHD founders",
  })!;

  const playbookCtx = buildWorkspaceContext("playbook", {
    view: "detail",
    selectedItemName: "Launch Strategy",
  })!;

  it("treats yes as approval, never as field content", () => {
    expect(isWorkspaceApprovalMessage("Yes")).toBe(true);
    expect(isWorkspaceApprovalMessage("use that")).toBe(true);
    expect(
      isWorkspaceApprovalMessage("They struggle with focus daily"),
    ).toBe(false);
  });

  it("project suggested steps → yes → steps added to project-tasks", () => {
    const turn = tryResolveWorkspaceApprovalTurn({
      userText: "Yes",
      lastAssistantText: projectStepsAssistant,
      ctx: projectCtx,
    });
    expect(turn).not.toBeNull();
    expect(turn!.fill.field).toBe("project-tasks");
    expect(turn!.fill.value).toMatch(/Define the workshop outcome/);
    expect(turn!.fill.value).toMatch(/Plan the opening exercise/);
    expect(turn!.fill.value.toLowerCase()).not.toContain("yes");

    const normalized = normalizeApprovalFillValue(
      "project-tasks",
      turn!.fill.value,
    );
    expect(normalized.split("\n")).toHaveLength(3);
  });

  it("resolveWorkspaceCoachTurn applies project step approval", () => {
    const coach = resolveWorkspaceCoachTurn(
      projectCtx,
      "yes please",
      "medium",
      projectStepsAssistant,
    );
    expect(coach?.fill?.field).toBe("project-tasks");
    expect(coach?.reply).toMatch(/Added 3 steps/);
  });

  it("avatar suggested options → yes → goals field filled", () => {
    const field = inferPendingApprovalField(
      avatarCtx,
      avatarGoalsAssistant,
      "Yes",
    );
    expect(field).toBe("avatar-goals");

    const turn = tryResolveWorkspaceApprovalTurn({
      userText: "These are good.",
      lastAssistantText: avatarGoalsAssistant,
      ctx: avatarCtx,
    });
    expect(turn?.fill.field).toBe("avatar-goals");
    expect(turn?.fill.value).toMatch(/Clarity and focus/);
    expect(turn?.fill.value).not.toMatch(/these are good/i);
  });

  it("strategy suggested steps → yes → plan section updated", () => {
    const field = inferPendingApprovalField(
      playbookCtx,
      strategyStepsAssistant,
      "Yes",
    );
    expect(field).toBe("workshop-sections");

    const turn = tryResolveWorkspaceApprovalTurn({
      userText: "Yes",
      lastAssistantText: strategyStepsAssistant,
      ctx: playbookCtx,
    });
    expect(turn?.fill.field).toBe("workshop-sections");
    expect(turn?.fill.value).toMatch(/Map your current funnel/);
  });

  it("workshop suggested content → yes → outline updated", () => {
    const turn = tryResolveWorkspaceApprovalTurn({
      userText: "add these",
      lastAssistantText: workshopOutlineAssistant,
      ctx: playbookCtx,
    });
    expect(turn?.fill.field).toBe("workshop-sections");
    expect(turn?.fill.value).toMatch(/Opening hook/);
    expect(turn?.fill.value).toMatch(/5-minute rule/);
  });

  it("create suggested section → yes → section added via builder chat", () => {
    let { session } = bootstrapCreateBuilderSession("Newsletter");
    for (const answer of [
      "ADHD founders",
      "Perfectionism traps",
      "Educate and nurture",
      "Reply with your biggest struggle",
    ]) {
      session = processCreateBuilderTurn(session, answer).session;
    }

    const turn = processCreateBuilderTurn(
      session,
      "Yes",
      createSectionAssistant,
    );
    expect(turn.session.workflow.sectionContent?.subject).toMatch(
      /Stop waiting for perfect/,
    );
    expect(turn.session.workflow.sectionContent?.subject).toMatch(
      /Done beats perfect/,
    );
    expect(turn.reply).toContain("Added to **Subject Line**");
    expect(turn.reply.toLowerCase()).not.toContain("yes");
  });

  it("create split-screen approval via workflow state", () => {
    const wf = {
      ...advanceAfterItemPick("Newsletter"),
      questionMode: "split_screen" as const,
      discoverySubphase: "sections" as const,
      activeSectionId: "subject",
      templateSections: [
        { id: "subject", label: "Subject Line", status: "empty" as const },
      ],
    };
    const createCtx = buildWorkspaceContext("content-generator", {
      view: "detail",
    })!;

    const turn = tryResolveWorkspaceApprovalTurn({
      userText: "Yes",
      lastAssistantText: createSectionAssistant,
      ctx: createCtx,
      createWorkflow: wf,
    });
    expect(turn?.reply).toContain("Subject Line");
    expect(turn?.fill.value).toMatch(/Stop waiting for perfect/);
  });
});
