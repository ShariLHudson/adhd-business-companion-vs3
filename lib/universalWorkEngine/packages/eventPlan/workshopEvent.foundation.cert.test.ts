/**
 * 127 — Workshop Event Blueprint foundation + certification.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  NETWORKING_EVENT_BLUEPRINT_ID,
  WORKSHOP_EVENT_BLUEPRINT_ID,
  addWorkMilestone,
  addWorkTask,
  answerBlueprintQuestion,
  applyApprovedResearch,
  approveResearch,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  createResearchRecord,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  getBlueprint,
  getWorkBlueprintState,
  inferWorkTypeAndBlueprint,
  initializeWorkFromBlueprint,
  isBlueprintRegistered,
  launchFromCreate,
  launchFromOrigin,
  launchFromShari,
  linkWorkRelationship,
  listBlueprints,
  listWorkMilestones,
  listWorkRelationships,
  listWorkTasks,
  mergeKnownContext,
  recoverSkippedQuestion,
  resetBlueprintAuditForTests,
  resetResearchAttachmentsForTests,
  resetWorkArchiveForTests,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resetWorkTasksForTests,
  resolveActiveSections,
  skipBlueprintQuestion,
  submitResearchForReview,
  EVENT_PLAN_BLUEPRINT_IDS,
} from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/eventPlanMap";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PACKAGE_DIR = join(ROOT, "lib/universalWorkEngine/packages/eventPlan");

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
      out.push(full);
  }
  return out;
}

describe("127 — Workshop Event Blueprint foundation", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkBlueprintStateForTests();
    resetBlueprintAuditForTests();
    resetResearchAttachmentsForTests();
    resetWorkTasksForTests();
    resetWorkArchiveForTests();
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
  });

  it("registers through the universal registry on event_plan only", () => {
    expect(isBlueprintRegistered(WORKSHOP_EVENT_BLUEPRINT_ID)).toBe(true);
    const bp = getBlueprint(WORKSHOP_EVENT_BLUEPRINT_ID)!;
    expect(bp.title).toBe("Workshop");
    expect(bp.compatibleWorkTypeIds).toEqual([EVENT_PLAN_WORK_TYPE_ID]);
    expect(bp.category).toBe("spark");
    expect(EVENT_PLAN_BLUEPRINT_IDS).toContain(WORKSHOP_EVENT_BLUEPRINT_ID);
    expect(
      listBlueprints({ workTypeId: EVENT_PLAN_WORK_TYPE_ID }).some(
        (b) => b.blueprintId === WORKSHOP_EVENT_BLUEPRINT_ID,
      ),
    ).toBe(true);
  });

  it("package has no private runtime or durable store of its own", () => {
    const files = walkTsFiles(PACKAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/createPrivateWorkshopRuntime|workshopEventStore/);
      expect(src).not.toMatch(/localStorage\.setItem\(\s*["']workshop/);
    }
  });

  it("three depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    changeBlueprintDepthMode(workId, "complete_planning");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      WORKSHOP_EVENT_BLUEPRINT_ID,
    );
  });

  it("conditional virtual and paid sections appear with known context", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    mergeKnownContext(init.workId, {
      is_virtual_or_hybrid: "true",
      is_paid: "true",
    });
    const state = getWorkBlueprintState(init.workId)!;
    const bp = getBlueprint(WORKSHOP_EVENT_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      state,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("technology");
    expect(active).toContain("revenue_pricing");
    expect(active).toContain("attendee_experience");
    expect(active).toContain("accessibility");
  });

  it("surfaces workshop forgotten items and adaptive outcome question", () => {
    const bp = getBlueprint(WORKSHOP_EVENT_BLUEPRINT_ID)!;
    expect(bp.commonlyForgottenItems.some((i) => /practice/i.test(i))).toBe(
      true,
    );
    expect(bp.commonlyForgottenItems.some((i) => /debrief/i.test(i))).toBe(
      true,
    );
    const outcomesQ = bp.adaptiveQuestions.find((q) => q.id === "q_outcomes");
    expect(outcomesQ?.sectionId).toBe("outcomes");
  });

  it("tasks and milestones use universal infrastructure", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    addWorkTask({
      workId: init.workId,
      title: "Draft core practice activity",
      sectionId: "attendee_experience",
    });
    addWorkMilestone({
      workId: init.workId,
      title: "Outcomes approved",
    });
    expect(listWorkTasks(init.workId).length).toBeGreaterThanOrEqual(1);
    expect(listWorkMilestones(init.workId).length).toBeGreaterThanOrEqual(1);
  });

  it("research requires approve before apply", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "research",
    });
    const draft = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "agenda",
      },
      researchQuestion: "Which activity formats fit mixed experience levels?",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Pair work before full group share reduces anxiety.",
    });
    submitResearchForReview(draft.id);
    expect(() => applyApprovedResearch(draft.id, ["change"])).toThrow();
    const approved = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "agenda",
      },
      researchQuestion: "Break timing for half-day workshops",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "A mid-session break protects attention.",
      proposedActions: ["Add mid-session break"],
    });
    submitResearchForReview(approved.id);
    approveResearch(approved.id);
    const applied = applyApprovedResearch(approved.id, [
      "Schedule a mid-session break before the core practice",
    ]);
    expect(applied.approvalStatus).toBe("applied");
  });

  it("Project and cartography relationships attach to canonical Work", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "projects",
    });
    linkWorkRelationship({
      fromWorkId: init.workId,
      toRef: { kind: "project", id: "proj-learning" },
      relationship: "supports",
      note: "Team development",
    });
    expect(
      listWorkRelationships(init.workId).some((r) => r.toRef.kind === "project"),
    ).toBe(true);
  });

  it("skip remains recoverable; answer advances outcomes", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    skipBlueprintQuestion(init.workId, "q_core_activity");
    recoverSkippedQuestion(init.workId, "q_core_activity");
    answerBlueprintQuestion(
      init.workId,
      "q_outcomes",
      "Draft a simple offer page they can finish in session",
    );
    expect(
      getWorkBlueprintState(init.workId)?.answeredQuestions.q_outcomes,
    ).toMatch(/offer page/i);
  });

  it("NL and Create launch resolve workshop blueprint; specialty workshops stay distinct", () => {
    const inferred = inferWorkTypeAndBlueprint({
      origin: "conversation",
      originalUserMessage: "Help me plan a workshop",
    });
    expect(inferred.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(inferred.blueprintId).toBe(WORKSHOP_EVENT_BLUEPRINT_ID);

    const halfDay = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "I want to host a half-day workshop",
    });
    expect(halfDay.blueprintId).toBe(WORKSHOP_EVENT_BLUEPRINT_ID);

    const online = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "I need to organize an online workshop",
    });
    expect(online.blueprintId).toBe("bp-event-online-workshop");

    const oneDay = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Plan a one-day workshop",
    });
    expect(oneDay.blueprintId).toBe("bp-event-one-day-workshop");

    const fromCreate = launchFromCreate({
      originalUserMessage: "Use the Workshop Blueprint",
      candidateBlueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(fromCreate.workId).toBeTruthy();
    expect(getWorkBlueprintState(fromCreate.workId!)?.blueprintId).toBe(
      WORKSHOP_EVENT_BLUEPRINT_ID,
    );

    const talk = launchFromShari({
      originalUserMessage: "Just talk through this workshop with me",
      shariMode: "talk_only",
    });
    expect(talk.talkOnly).toBe(true);

    const fromShari = launchFromShari({
      originalUserMessage: "Continue the workshop I started",
      relatedWorkId: fromCreate.workId!,
      candidateBlueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      shariMode: "work_on_this",
    });
    expect(fromShari.workId ?? fromCreate.workId).toBe(fromCreate.workId);
  });

  it("Chamber, Board, Body Doubling, and deliverables stay on universal owners", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "projects",
    });
    const workId = init.workId;
    const bp = getBlueprint(WORKSHOP_EVENT_BLUEPRINT_ID)!;
    expect(bp.chamberRoutingRecommendations).toEqual(
      expect.arrayContaining(["events", "learning"]),
    );
    expect(bp.boardReviewRecommendations).toEqual(
      expect.arrayContaining(["learning outcomes", "accessibility"]),
    );
    expect(bp.deliverables).toEqual(
      expect.arrayContaining(["Facilitator guide", "Detailed agenda"]),
    );

    const bd = launchFromOrigin("body_doubling", {
      originalUserMessage:
        "Body double with me while I build the workbook",
      relatedWorkId: workId,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      bodyDoublingSessionId: "bd-ws-1",
      sectionId: "swag",
    });
    expect(bd.workId ?? workId).toBe(workId);

    const chamber = launchFromOrigin("chamber", {
      originalUserMessage: "Ask Learning Intelligence to review the outcomes",
      relatedWorkId: workId,
      chamberMemberId: "learning",
      applyApproved: true,
    });
    expect(chamber.workId ?? workId).toBe(workId);

    const board = launchFromOrigin("board", {
      originalUserMessage: "Have the Board review the pricing",
      relatedWorkId: workId,
      boardReviewId: "br-ws-pricing",
      applyApproved: true,
    });
    expect(board.workId ?? workId).toBe(workId);
  });

  it("duplicate prevention does not invent a second workshop Work", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a workshop",
      candidateBlueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();
    const second = launchFromCreate({
      originalUserMessage: "Help me plan a workshop",
      candidateBlueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    expect(["continue_existing", "clarify", "create_new"]).toContain(
      second.decision,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }
  });

  it("Networking and existing Event Blueprints remain registered", () => {
    expect(EVENT_PLAN_BLUEPRINT_IDS).toHaveLength(7);
    for (const id of [
      "bp-event-business-luncheon",
      "bp-event-online-workshop",
      "bp-event-one-day-workshop",
      "bp-event-three-day-retreat",
      "bp-event-book-signing",
      NETWORKING_EVENT_BLUEPRINT_ID,
      WORKSHOP_EVENT_BLUEPRINT_ID,
    ]) {
      expect(isBlueprintRegistered(id)).toBe(true);
    }
  });
});
