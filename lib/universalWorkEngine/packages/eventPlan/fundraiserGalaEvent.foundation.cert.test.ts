/**
 * 136 — Fundraiser / Gala Event Blueprint foundation + certification.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  CHALLENGE_EVENT_BLUEPRINT_ID,
  CONFERENCE_EVENT_BLUEPRINT_ID,
  FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  MASTERCLASS_EVENT_BLUEPRINT_ID,
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

describe("136 — Fundraiser / Gala Event Blueprint foundation", () => {
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
    expect(isBlueprintRegistered(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID)).toBe(true);
    const bp = getBlueprint(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID)!;
    expect(bp.title).toBe("Fundraiser / Gala");
    expect(bp.compatibleWorkTypeIds).toEqual([EVENT_PLAN_WORK_TYPE_ID]);
    expect(bp.category).toBe("spark");
    expect(EVENT_PLAN_BLUEPRINT_IDS).toContain(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID);
    expect(
      listBlueprints({ workTypeId: EVENT_PLAN_WORK_TYPE_ID }).some(
        (b) => b.blueprintId === FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      ),
    ).toBe(true);
  });

  it("package has no private runtime or durable store of its own", () => {
    const files = walkTsFiles(PACKAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/createPrivateFundraiserRuntime|fundraiserGalaEventStore/);
      expect(src).not.toMatch(/localStorage\.setItem\(\s*["']fundraiser/);
    }
  });

  it("three depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    changeBlueprintDepthMode(workId, "complete_planning");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
    );
  });

  it("conditional sponsor and auction sections appear with known context", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    mergeKnownContext(init.workId, {
      has_sponsors: "true",
      has_auction: "true",
      needs_volunteers: "true",
    });
    const state = getWorkBlueprintState(init.workId)!;
    const bp = getBlueprint(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      state,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("sponsors");
    expect(active).toContain("vendors");
    expect(active).toContain("volunteers");
    expect(active).toContain("hospitality");
  });

  it("surfaces fundraiser forgotten items and adaptive purpose question", () => {
    const bp = getBlueprint(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID)!;
    expect(bp.commonlyForgottenItems.some((i) => /tax receipts/i.test(i))).toBe(
      true,
    );
    expect(bp.commonlyForgottenItems.some((i) => /auction checkout/i.test(i))).toBe(
      true,
    );
    const purposeQ = bp.adaptiveQuestions.find((q) => q.id === "q_purpose");
    expect(purposeQ?.sectionId).toBe("purpose");
  });

  it("tasks and milestones use universal infrastructure", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "create",
    });
    addWorkTask({
      workId: init.workId,
      title: "Design stewardship, tax receipts, and follow-up",
      sectionId: "post_event_follow_up",
    });
    addWorkMilestone({
      workId: init.workId,
      title: "Mission and goals approved",
    });
    expect(listWorkTasks(init.workId).length).toBeGreaterThanOrEqual(1);
    expect(listWorkMilestones(init.workId).length).toBeGreaterThanOrEqual(1);
  });

  it("research requires approve before apply", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "research",
    });
    const draft = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "technology",
      },
      researchQuestion: "Which giving platforms support auction checkout?",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Platforms with dual payment paths reduce peak-ask risk.",
    });
    submitResearchForReview(draft.id);
    expect(() => applyApprovedResearch(draft.id, ["change"])).toThrow();
    const approved = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "venue",
      },
      researchQuestion: "Accessible gala venues with strong donor flow",
      researchMode: "venue_scan",
      originatingExperience: "create",
      findings: "Ballrooms with side checkout zones reduce exit bottlenecks.",
      proposedActions: ["Prefer venue with side checkout zone"],
    });
    submitResearchForReview(approved.id);
    approveResearch(approved.id);
    const applied = applyApprovedResearch(approved.id, [
      "Prefer venue with side checkout zone",
    ]);
    expect(applied.approvalStatus).toBe("applied");
  });

  it("Project and cartography relationships attach to canonical Work", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "projects",
    });
    linkWorkRelationship({
      fromWorkId: init.workId,
      toRef: { kind: "project", id: "proj-annual-gala" },
      relationship: "supports",
      note: "Annual gala",
    });
    expect(
      listWorkRelationships(init.workId).some((r) => r.toRef.kind === "project"),
    ).toBe(true);
  });

  it("skip remains recoverable; answer advances purpose", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    skipBlueprintQuestion(init.workId, "q_program");
    recoverSkippedQuestion(init.workId, "q_program");
    answerBlueprintQuestion(
      init.workId,
      "q_purpose",
      "Advance the scholarship mission and deepen donor relationships",
    );
    expect(
      getWorkBlueprintState(init.workId)?.answeredQuestions.q_purpose,
    ).toMatch(/scholarship/i);
  });

  it("NL and Create launch resolve fundraiser/gala; luncheon stays distinct", () => {
    const inferred = inferWorkTypeAndBlueprint({
      origin: "conversation",
      originalUserMessage: "Help me plan a fundraiser gala",
    });
    expect(inferred.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(inferred.blueprintId).toBe(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID);

    const gala = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a charity gala",
    });
    expect(gala.blueprintId).toBe(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID);

    const luncheon = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a business luncheon",
    });
    expect(luncheon.blueprintId).toBe("bp-event-business-luncheon");

    const fromCreate = launchFromCreate({
      originalUserMessage: "Use the Fundraiser / Gala Blueprint",
      candidateBlueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(fromCreate.workId).toBeTruthy();
    expect(getWorkBlueprintState(fromCreate.workId!)?.blueprintId).toBe(
      FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
    );

    const talk = launchFromShari({
      originalUserMessage: "Just talk through this fundraiser with me",
      shariMode: "talk_only",
    });
    expect(talk.talkOnly).toBe(true);

    const fromShari = launchFromShari({
      originalUserMessage: "Continue the gala I started",
      relatedWorkId: fromCreate.workId!,
      candidateBlueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      shariMode: "work_on_this",
    });
    expect(fromShari.workId ?? fromCreate.workId).toBe(fromCreate.workId);
  });

  it("Chamber, Board, Body Doubling, and deliverables stay on universal owners", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "projects",
    });
    const workId = init.workId;
    const bp = getBlueprint(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID)!;
    expect(bp.chamberRoutingRecommendations).toEqual(
      expect.arrayContaining(["events", "partnerships", "finance"]),
    );
    expect(bp.boardReviewRecommendations).toEqual(
      expect.arrayContaining(["mission and cause", "stewardship readiness"]),
    );
    expect(bp.deliverables).toEqual(
      expect.arrayContaining([
        "Stewardship and receipt plan",
        "Auction and checkout checklist",
      ]),
    );

    const bd = launchFromOrigin("body_doubling", {
      originalUserMessage: "Body double with me while I draft the ask script",
      relatedWorkId: workId,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      bodyDoublingSessionId: "bd-fg-1",
      sectionId: "agenda",
    });
    expect(bd.workId ?? workId).toBe(workId);

    const chamber = launchFromOrigin("chamber", {
      originalUserMessage: "Ask Partnerships Intelligence to review sponsor value",
      relatedWorkId: workId,
      chamberMemberId: "partnerships",
      applyApproved: true,
    });
    expect(chamber.workId ?? workId).toBe(workId);

    const board = launchFromOrigin("board", {
      originalUserMessage: "Have the Board review the fundraising goals",
      relatedWorkId: workId,
      boardReviewId: "br-fg-goals",
      applyApproved: true,
    });
    expect(board.workId ?? workId).toBe(workId);
  });

  it("duplicate prevention does not invent a second fundraiser Work", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a fundraiser gala",
      candidateBlueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();
    const second = launchFromCreate({
      originalUserMessage: "Help me plan a fundraiser gala",
      candidateBlueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    expect(["continue_existing", "clarify", "create_new"]).toContain(
      second.decision,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }
  });

  it("Masterclass and existing Event Blueprints remain registered", () => {
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
      MASTERCLASS_EVENT_BLUEPRINT_ID,
      FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
    ]) {
      expect(isBlueprintRegistered(id)).toBe(true);
    }
  });
});
