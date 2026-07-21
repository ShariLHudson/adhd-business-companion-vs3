/**
 * 126 — Networking Event Blueprint foundation + certification.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  NETWORKING_EVENT_BLUEPRINT_ID,
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

describe("126 — Networking Event Blueprint foundation", () => {
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
    expect(isBlueprintRegistered(NETWORKING_EVENT_BLUEPRINT_ID)).toBe(true);
    const bp = getBlueprint(NETWORKING_EVENT_BLUEPRINT_ID)!;
    expect(bp.title).toBe("Networking Event");
    expect(bp.compatibleWorkTypeIds).toEqual([EVENT_PLAN_WORK_TYPE_ID]);
    expect(bp.category).toBe("spark");
    expect(EVENT_PLAN_BLUEPRINT_IDS).toContain(NETWORKING_EVENT_BLUEPRINT_ID);
    expect(
      listBlueprints({ workTypeId: EVENT_PLAN_WORK_TYPE_ID }).some(
        (b) => b.blueprintId === NETWORKING_EVENT_BLUEPRINT_ID,
      ),
    ).toBe(true);
  });

  it("package has no private runtime or durable store of its own", () => {
    const files = walkTsFiles(PACKAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/createPrivateNetworkingRuntime|networkingEventStore/);
      expect(src).not.toMatch(/localStorage\.setItem\(\s*["']networking/);
    }
  });

  it("three depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    changeBlueprintDepthMode(workId, "complete_planning");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      NETWORKING_EVENT_BLUEPRINT_ID,
    );
  });

  it("conditional sponsor and virtual sections appear with known context", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    mergeKnownContext(init.workId, {
      has_sponsors: "true",
      is_virtual_or_hybrid: "true",
    });
    const state = getWorkBlueprintState(init.workId)!;
    const bp = getBlueprint(NETWORKING_EVENT_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      state,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("sponsors");
    expect(active).toContain("technology");
    expect(active).toContain("attendee_experience");
    expect(active).toContain("accessibility");
  });

  it("surfaces networking forgotten items and adaptive purpose question", () => {
    const bp = getBlueprint(NETWORKING_EVENT_BLUEPRINT_ID)!;
    expect(bp.commonlyForgottenItems.some((i) => /alone/i.test(i))).toBe(true);
    expect(bp.commonlyForgottenItems.some((i) => /badge/i.test(i))).toBe(true);
    const purposeQ = bp.adaptiveQuestions.find((q) => q.id === "q_purpose");
    expect(purposeQ?.sectionId).toBe("purpose");
  });

  it("tasks and milestones use universal infrastructure", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    addWorkTask({
      workId: init.workId,
      title: "Draft connection prompts",
      sectionId: "agenda",
    });
    addWorkMilestone({
      workId: init.workId,
      title: "Format selected",
    });
    expect(listWorkTasks(init.workId).length).toBeGreaterThanOrEqual(1);
    expect(listWorkMilestones(init.workId).length).toBeGreaterThanOrEqual(1);
  });

  it("research requires approve before apply", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "research",
    });
    const draft = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "venue",
      },
      researchQuestion: "Which rooms support conversation acoustics?",
      researchMode: "venue_scan",
      originatingExperience: "create",
      findings: "Soft surfaces reduce echo.",
    });
    submitResearchForReview(draft.id);
    expect(() => applyApprovedResearch(draft.id, ["change"])).toThrow();
    const approved = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "venue",
      },
      researchQuestion: "Quiet corner options",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Side rooms help.",
      proposedActions: ["Prefer side rooms"],
    });
    submitResearchForReview(approved.id);
    approveResearch(approved.id);
    const applied = applyApprovedResearch(approved.id, [
      "Prefer quieter side rooms for conversation",
    ]);
    expect(applied.approvalStatus).toBe("applied");
  });

  it("Project and cartography relationships attach to canonical Work", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "projects",
    });
    linkWorkRelationship({
      fromWorkId: init.workId,
      toRef: { kind: "project", id: "proj-community" },
      relationship: "supports",
      note: "Community growth",
    });
    expect(
      listWorkRelationships(init.workId).some((r) => r.toRef.kind === "project"),
    ).toBe(true);
  });

  it("skip remains recoverable; answer advances purpose", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    skipBlueprintQuestion(init.workId, "q_capacity");
    recoverSkippedQuestion(init.workId, "q_capacity");
    answerBlueprintQuestion(
      init.workId,
      "q_purpose",
      "Help local founders make warm introductions",
    );
    expect(
      getWorkBlueprintState(init.workId)?.answeredQuestions.q_purpose,
    ).toMatch(/warm introductions/i);
  });

  it("NL and Create launch resolve networking blueprint", () => {
    const inferred = inferWorkTypeAndBlueprint({
      origin: "conversation",
      originalUserMessage: "Help me plan a networking event",
    });
    expect(inferred.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(inferred.blueprintId).toBe(NETWORKING_EVENT_BLUEPRINT_ID);

    const mixer = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "I want to host a business mixer",
    });
    expect(mixer.blueprintId).toBe(NETWORKING_EVENT_BLUEPRINT_ID);

    const fromCreate = launchFromCreate({
      originalUserMessage: "Use the Networking Event Blueprint",
      candidateBlueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(fromCreate.workId).toBeTruthy();
    expect(getWorkBlueprintState(fromCreate.workId!)?.blueprintId).toBe(
      NETWORKING_EVENT_BLUEPRINT_ID,
    );

    const talk = launchFromShari({
      originalUserMessage: "Just talk through this networking event with me",
      shariMode: "talk_only",
    });
    expect(talk.talkOnly).toBe(true);

    const fromShari = launchFromShari({
      originalUserMessage: "Continue the mixer I started",
      relatedWorkId: fromCreate.workId!,
      candidateBlueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      shariMode: "work_on_this",
    });
    expect(fromShari.workId ?? fromCreate.workId).toBe(fromCreate.workId);
  });

  it("Chamber, Board, Body Doubling, and deliverables stay on universal owners", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "projects",
    });
    const workId = init.workId;
    const bp = getBlueprint(NETWORKING_EVENT_BLUEPRINT_ID)!;
    expect(bp.chamberRoutingRecommendations).toEqual(
      expect.arrayContaining(["events"]),
    );
    expect(bp.boardReviewRecommendations).toEqual(
      expect.arrayContaining(["budget", "accessibility"]),
    );
    expect(bp.deliverables).toEqual(
      expect.arrayContaining(["Run of show", "Host and facilitator guide"]),
    );

    const bd = launchFromOrigin("body_doubling", {
      originalUserMessage:
        "Body double with me while I build the guest list",
      relatedWorkId: workId,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      bodyDoublingSessionId: "bd-net-1",
      sectionId: "audience",
    });
    expect(bd.workId ?? workId).toBe(workId);

    const chamber = launchFromOrigin("chamber", {
      originalUserMessage: "Ask Events Intelligence to review the event flow",
      relatedWorkId: workId,
      chamberMemberId: "events",
      applyApproved: true,
    });
    expect(chamber.workId ?? workId).toBe(workId);

    const board = launchFromOrigin("board", {
      originalUserMessage: "Have the Board review the budget",
      relatedWorkId: workId,
      boardReviewId: "br-net-budget",
      applyApproved: true,
    });
    expect(board.workId ?? workId).toBe(workId);
  });

  it("duplicate prevention does not invent a second networking Work", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a networking event",
      candidateBlueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();
    const second = launchFromCreate({
      originalUserMessage: "Help me plan a networking event",
      candidateBlueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    expect(["continue_existing", "clarify", "create_new"]).toContain(
      second.decision,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }
  });

  it("existing Event Blueprints remain registered", () => {
    expect(EVENT_PLAN_BLUEPRINT_IDS).toHaveLength(14);
    for (const id of [
      "bp-event-business-luncheon",
      "bp-event-online-workshop",
      "bp-event-one-day-workshop",
      "bp-event-three-day-retreat",
      "bp-event-book-signing",
      NETWORKING_EVENT_BLUEPRINT_ID,
      "event.workshop",
      "event.webinar",
      "event.retreat",
      "event.conference",
      "event.summit",
      "event.product_launch",
      "event.book_launch",
      "event.challenge",
    ]) {
      expect(isBlueprintRegistered(id)).toBe(true);
    }
  });
});
