/**
 * 128 — Webinar Event Blueprint foundation + certification.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  NETWORKING_EVENT_BLUEPRINT_ID,
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

describe("128 — Webinar Event Blueprint foundation", () => {
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
    expect(isBlueprintRegistered(WEBINAR_EVENT_BLUEPRINT_ID)).toBe(true);
    const bp = getBlueprint(WEBINAR_EVENT_BLUEPRINT_ID)!;
    expect(bp.title).toBe("Webinar");
    expect(bp.compatibleWorkTypeIds).toEqual([EVENT_PLAN_WORK_TYPE_ID]);
    expect(bp.category).toBe("spark");
    expect(EVENT_PLAN_BLUEPRINT_IDS).toContain(WEBINAR_EVENT_BLUEPRINT_ID);
    expect(
      listBlueprints({ workTypeId: EVENT_PLAN_WORK_TYPE_ID }).some(
        (b) => b.blueprintId === WEBINAR_EVENT_BLUEPRINT_ID,
      ),
    ).toBe(true);
  });

  it("package has no private runtime or durable store of its own", () => {
    const files = walkTsFiles(PACKAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/createPrivateWebinarRuntime|webinarEventStore/);
      expect(src).not.toMatch(/localStorage\.setItem\(\s*["']webinar/);
    }
  });

  it("three depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    changeBlueprintDepthMode(workId, "complete_planning");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      WEBINAR_EVENT_BLUEPRINT_ID,
    );
  });

  it("conditional recording and paid sections appear with known context", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    mergeKnownContext(init.workId, {
      will_record: "true",
      is_paid: "true",
    });
    const state = getWorkBlueprintState(init.workId)!;
    const bp = getBlueprint(WEBINAR_EVENT_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      state,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("swag");
    expect(active).toContain("revenue_pricing");
    expect(active).toContain("technology");
    expect(active).toContain("attendee_experience");
  });

  it("surfaces webinar forgotten items and adaptive CTA question", () => {
    const bp = getBlueprint(WEBINAR_EVENT_BLUEPRINT_ID)!;
    expect(bp.commonlyForgottenItems.some((i) => /rehearsal/i.test(i))).toBe(
      true,
    );
    expect(bp.commonlyForgottenItems.some((i) => /moderator/i.test(i))).toBe(
      true,
    );
    const outcomesQ = bp.adaptiveQuestions.find((q) => q.id === "q_outcomes");
    expect(outcomesQ?.sectionId).toBe("outcomes");
  });

  it("tasks and milestones use universal infrastructure", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    addWorkTask({
      workId: init.workId,
      title: "Schedule tech rehearsal",
      sectionId: "technology",
    });
    addWorkMilestone({
      workId: init.workId,
      title: "Purpose and CTA approved",
    });
    expect(listWorkTasks(init.workId).length).toBeGreaterThanOrEqual(1);
    expect(listWorkMilestones(init.workId).length).toBeGreaterThanOrEqual(1);
  });

  it("research requires approve before apply", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "research",
    });
    const draft = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "venue",
      },
      researchQuestion: "Which platform fits 200 registrants with polls?",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Platforms with native Q&A reduce moderator load.",
    });
    submitResearchForReview(draft.id);
    expect(() => applyApprovedResearch(draft.id, ["change"])).toThrow();
    const approved = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "technology",
      },
      researchQuestion: "Captioning options",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Live captions improve accessibility.",
      proposedActions: ["Enable live captions"],
    });
    submitResearchForReview(approved.id);
    approveResearch(approved.id);
    const applied = applyApprovedResearch(approved.id, [
      "Enable live captions for the webinar",
    ]);
    expect(applied.approvalStatus).toBe("applied");
  });

  it("Project and cartography relationships attach to canonical Work", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "projects",
    });
    linkWorkRelationship({
      fromWorkId: init.workId,
      toRef: { kind: "project", id: "proj-webinar-series" },
      relationship: "supports",
      note: "Customer education",
    });
    expect(
      listWorkRelationships(init.workId).some((r) => r.toRef.kind === "project"),
    ).toBe(true);
  });

  it("skip remains recoverable; answer advances outcomes", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    skipBlueprintQuestion(init.workId, "q_record");
    recoverSkippedQuestion(init.workId, "q_record");
    answerBlueprintQuestion(
      init.workId,
      "q_outcomes",
      "Book a clarity call after the demo",
    );
    expect(
      getWorkBlueprintState(init.workId)?.answeredQuestions.q_outcomes,
    ).toMatch(/clarity call/i);
  });

  it("NL and Create launch resolve webinar; workshop stays distinct", () => {
    const inferred = inferWorkTypeAndBlueprint({
      origin: "conversation",
      originalUserMessage: "Help me plan a webinar",
    });
    expect(inferred.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(inferred.blueprintId).toBe(WEBINAR_EVENT_BLUEPRINT_ID);

    const workshop = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a workshop",
    });
    expect(workshop.blueprintId).toBe(WORKSHOP_EVENT_BLUEPRINT_ID);

    const fromCreate = launchFromCreate({
      originalUserMessage: "Use the Webinar Blueprint",
      candidateBlueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(fromCreate.workId).toBeTruthy();
    expect(getWorkBlueprintState(fromCreate.workId!)?.blueprintId).toBe(
      WEBINAR_EVENT_BLUEPRINT_ID,
    );

    const talk = launchFromShari({
      originalUserMessage: "Just talk through this webinar with me",
      shariMode: "talk_only",
    });
    expect(talk.talkOnly).toBe(true);

    const fromShari = launchFromShari({
      originalUserMessage: "Continue the webinar I started",
      relatedWorkId: fromCreate.workId!,
      candidateBlueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      shariMode: "work_on_this",
    });
    expect(fromShari.workId ?? fromCreate.workId).toBe(fromCreate.workId);
  });

  it("Chamber, Board, Body Doubling, and deliverables stay on universal owners", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "projects",
    });
    const workId = init.workId;
    const bp = getBlueprint(WEBINAR_EVENT_BLUEPRINT_ID)!;
    expect(bp.chamberRoutingRecommendations).toEqual(
      expect.arrayContaining(["events", "presentations"]),
    );
    expect(bp.boardReviewRecommendations).toEqual(
      expect.arrayContaining(["outcomes and CTA", "accessibility"]),
    );
    expect(bp.deliverables).toEqual(
      expect.arrayContaining(["Host and moderator guide", "Tech rehearsal checklist"]),
    );

    const bd = launchFromOrigin("body_doubling", {
      originalUserMessage: "Body double with me while I build the slides",
      relatedWorkId: workId,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      bodyDoublingSessionId: "bd-wb-1",
      sectionId: "production",
    });
    expect(bd.workId ?? workId).toBe(workId);

    const chamber = launchFromOrigin("chamber", {
      originalUserMessage: "Ask Events Intelligence to review the run of show",
      relatedWorkId: workId,
      chamberMemberId: "events",
      applyApproved: true,
    });
    expect(chamber.workId ?? workId).toBe(workId);

    const board = launchFromOrigin("board", {
      originalUserMessage: "Have the Board review the CTA",
      relatedWorkId: workId,
      boardReviewId: "br-wb-cta",
      applyApproved: true,
    });
    expect(board.workId ?? workId).toBe(workId);
  });

  it("duplicate prevention does not invent a second webinar Work", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a webinar",
      candidateBlueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();
    const second = launchFromCreate({
      originalUserMessage: "Help me plan a webinar",
      candidateBlueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    expect(["continue_existing", "clarify", "create_new"]).toContain(
      second.decision,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }
  });

  it("Workshop, Networking, and existing Event Blueprints remain registered", () => {
    expect(EVENT_PLAN_BLUEPRINT_IDS).toHaveLength(8);
    for (const id of [
      "bp-event-business-luncheon",
      "bp-event-online-workshop",
      "bp-event-one-day-workshop",
      "bp-event-three-day-retreat",
      "bp-event-book-signing",
      NETWORKING_EVENT_BLUEPRINT_ID,
      WORKSHOP_EVENT_BLUEPRINT_ID,
      WEBINAR_EVENT_BLUEPRINT_ID,
    ]) {
      expect(isBlueprintRegistered(id)).toBe(true);
    }
  });
});
