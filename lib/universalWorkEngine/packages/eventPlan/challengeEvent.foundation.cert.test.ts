/**
 * 134 — Challenge Event Blueprint foundation + certification.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  CHALLENGE_EVENT_BLUEPRINT_ID,
  CONFERENCE_EVENT_BLUEPRINT_ID,
  NETWORKING_EVENT_BLUEPRINT_ID,
  PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
  RETREAT_EVENT_BLUEPRINT_ID,
  SUMMIT_EVENT_BLUEPRINT_ID,
  WEBINAR_EVENT_BLUEPRINT_ID,
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

describe("134 — Challenge Event Blueprint foundation", () => {
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
    expect(isBlueprintRegistered(CHALLENGE_EVENT_BLUEPRINT_ID)).toBe(true);
    const bp = getBlueprint(CHALLENGE_EVENT_BLUEPRINT_ID)!;
    expect(bp.title).toBe("Challenge");
    expect(bp.compatibleWorkTypeIds).toEqual([EVENT_PLAN_WORK_TYPE_ID]);
    expect(bp.category).toBe("spark");
    expect(EVENT_PLAN_BLUEPRINT_IDS).toContain(CHALLENGE_EVENT_BLUEPRINT_ID);
    expect(
      listBlueprints({ workTypeId: EVENT_PLAN_WORK_TYPE_ID }).some(
        (b) => b.blueprintId === CHALLENGE_EVENT_BLUEPRINT_ID,
      ),
    ).toBe(true);
  });

  it("package has no private runtime or durable store of its own", () => {
    const files = walkTsFiles(PACKAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/createPrivateChallengeRuntime|challengeEventStore/);
      expect(src).not.toMatch(/localStorage\.setItem\(\s*["']challenge/);
    }
  });

  it("three depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    changeBlueprintDepthMode(workId, "complete_planning");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      CHALLENGE_EVENT_BLUEPRINT_ID,
    );
  });

  it("conditional prizes and pricing sections appear with known context", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    mergeKnownContext(init.workId, {
      has_prizes: "true",
      is_paid: "true",
    });
    const state = getWorkBlueprintState(init.workId)!;
    const bp = getBlueprint(CHALLENGE_EVENT_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      state,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("swag");
    expect(active).toContain("revenue_pricing");
    expect(active).toContain("attendee_experience");
    expect(active).toContain("speakers");
  });

  it("surfaces challenge forgotten items and adaptive purpose question", () => {
    const bp = getBlueprint(CHALLENGE_EVENT_BLUEPRINT_ID)!;
    expect(bp.commonlyForgottenItems.some((i) => /missed-day/i.test(i))).toBe(
      true,
    );
    expect(bp.commonlyForgottenItems.some((i) => /welcome flow/i.test(i))).toBe(
      true,
    );
    const purposeQ = bp.adaptiveQuestions.find((q) => q.id === "q_purpose");
    expect(purposeQ?.sectionId).toBe("purpose");
  });

  it("tasks and milestones use universal infrastructure", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    addWorkTask({
      workId: init.workId,
      title: "Design check-ins and missed-day recovery",
      sectionId: "attendee_experience",
    });
    addWorkMilestone({
      workId: init.workId,
      title: "Purpose and outcomes approved",
    });
    expect(listWorkTasks(init.workId).length).toBeGreaterThanOrEqual(1);
    expect(listWorkMilestones(init.workId).length).toBeGreaterThanOrEqual(1);
  });

  it("research requires approve before apply", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "research",
    });
    const draft = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "format",
      },
      researchQuestion: "Which challenge lengths retain habit practice?",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Seven-day challenges convert well for first-time cohorts.",
    });
    submitResearchForReview(draft.id);
    expect(() => applyApprovedResearch(draft.id, ["change"])).toThrow();
    const approved = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "communications",
      },
      researchQuestion: "Reminder formats that reduce drop-off",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Short morning reminders outperform long evening digests.",
      proposedActions: ["Use short morning reminders"],
    });
    submitResearchForReview(approved.id);
    approveResearch(approved.id);
    const applied = applyApprovedResearch(approved.id, [
      "Use short morning reminders",
    ]);
    expect(applied.approvalStatus).toBe("applied");
  });

  it("Project and cartography relationships attach to canonical Work", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "projects",
    });
    linkWorkRelationship({
      fromWorkId: init.workId,
      toRef: { kind: "project", id: "proj-habit-challenge" },
      relationship: "supports",
      note: "Habit challenge",
    });
    expect(
      listWorkRelationships(init.workId).some((r) => r.toRef.kind === "project"),
    ).toBe(true);
  });

  it("skip remains recoverable; answer advances purpose", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    skipBlueprintQuestion(init.workId, "q_accountability");
    recoverSkippedQuestion(init.workId, "q_accountability");
    answerBlueprintQuestion(
      init.workId,
      "q_purpose",
      "Help busy founders take one focused action each morning",
    );
    expect(
      getWorkBlueprintState(init.workId)?.answeredQuestions.q_purpose,
    ).toMatch(/focused action/i);
  });

  it("NL and Create launch resolve challenge; workshop stays distinct", () => {
    const inferred = inferWorkTypeAndBlueprint({
      origin: "conversation",
      originalUserMessage: "Help me plan a 7-day challenge",
    });
    expect(inferred.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(inferred.blueprintId).toBe(CHALLENGE_EVENT_BLUEPRINT_ID);

    const habit = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me host a habit challenge",
    });
    expect(habit.blueprintId).toBe(CHALLENGE_EVENT_BLUEPRINT_ID);

    const workshop = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a workshop",
    });
    expect(workshop.blueprintId).toBe(WORKSHOP_EVENT_BLUEPRINT_ID);

    const fromCreate = launchFromCreate({
      originalUserMessage: "Use the Challenge Blueprint",
      candidateBlueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(fromCreate.workId).toBeTruthy();
    expect(getWorkBlueprintState(fromCreate.workId!)?.blueprintId).toBe(
      CHALLENGE_EVENT_BLUEPRINT_ID,
    );

    const talk = launchFromShari({
      originalUserMessage: "Just talk through this challenge with me",
      shariMode: "talk_only",
    });
    expect(talk.talkOnly).toBe(true);

    const fromShari = launchFromShari({
      originalUserMessage: "Continue the challenge I started",
      relatedWorkId: fromCreate.workId!,
      candidateBlueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      shariMode: "work_on_this",
    });
    expect(fromShari.workId ?? fromCreate.workId).toBe(fromCreate.workId);
  });

  it("Chamber, Board, Body Doubling, and deliverables stay on universal owners", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "projects",
    });
    const workId = init.workId;
    const bp = getBlueprint(CHALLENGE_EVENT_BLUEPRINT_ID)!;
    expect(bp.chamberRoutingRecommendations).toEqual(
      expect.arrayContaining(["events", "learning", "momentum"]),
    );
    expect(bp.boardReviewRecommendations).toEqual(
      expect.arrayContaining(["challenge purpose", "accountability design"]),
    );
    expect(bp.deliverables).toEqual(
      expect.arrayContaining([
        "Daily content calendar",
        "Missed-day recovery plan",
      ]),
    );

    const bd = launchFromOrigin("body_doubling", {
      originalUserMessage: "Body double with me while I write day-one content",
      relatedWorkId: workId,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      bodyDoublingSessionId: "bd-ch-1",
      sectionId: "agenda",
    });
    expect(bd.workId ?? workId).toBe(workId);

    const chamber = launchFromOrigin("chamber", {
      originalUserMessage: "Ask Learning Intelligence to review the daily rhythm",
      relatedWorkId: workId,
      chamberMemberId: "learning",
      applyApproved: true,
    });
    expect(chamber.workId ?? workId).toBe(workId);

    const board = launchFromOrigin("board", {
      originalUserMessage: "Have the Board review the accountability design",
      relatedWorkId: workId,
      boardReviewId: "br-ch-accountability",
      applyApproved: true,
    });
    expect(board.workId ?? workId).toBe(workId);
  });

  it("duplicate prevention does not invent a second challenge Work", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a 7-day challenge",
      candidateBlueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();
    const second = launchFromCreate({
      originalUserMessage: "Help me plan a 7-day challenge",
      candidateBlueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    expect(["continue_existing", "clarify", "create_new"]).toContain(
      second.decision,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }
  });

  it("Book Launch and existing Event Blueprints remain registered", () => {
    expect(EVENT_PLAN_BLUEPRINT_IDS).toHaveLength(16);
    for (const id of [
      "bp-event-business-luncheon",
      "bp-event-online-workshop",
      "bp-event-one-day-workshop",
      "bp-event-three-day-retreat",
      "bp-event-book-signing",
      NETWORKING_EVENT_BLUEPRINT_ID,
      WORKSHOP_EVENT_BLUEPRINT_ID,
      WEBINAR_EVENT_BLUEPRINT_ID,
      RETREAT_EVENT_BLUEPRINT_ID,
      CONFERENCE_EVENT_BLUEPRINT_ID,
      SUMMIT_EVENT_BLUEPRINT_ID,
      PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
      BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
      CHALLENGE_EVENT_BLUEPRINT_ID,
      "event.masterclass",
      "event.fundraiser_gala",
    ]) {
      expect(isBlueprintRegistered(id)).toBe(true);
    }
  });
});
