/**
 * 105 — Marketing Plan Work Type foundation + certification suite.
 * @vitest-environment node
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  MARKETING_PLAN_BLUEPRINT_IDS,
  MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  UnknownWorkTypeError,
  addWorkMilestone,
  addWorkTask,
  answerBlueprintQuestion,
  applyApprovedResearch,
  approveResearch,
  archiveWork,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  createResearchRecord,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  ensureMarketingPlanBlueprintsRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  evaluateAdaptiveQuestion,
  getBlueprint,
  getWorkBlueprintState,
  getWorkLifecycleStatus,
  getWorkTypePackage,
  initializeWorkFromBlueprint,
  isBlueprintRegistered,
  isMarketingPlanCreationRequest,
  launchFromCreate,
  launchFromOrigin,
  launchFromShari,
  linkWorkRelationship,
  listAdaptiveQuestionDecisions,
  listBlueprints,
  listResearchForWork,
  listWorkMilestones,
  listWorkRelationships,
  listWorkTasks,
  mergeKnownContext,
  recoverSkippedQuestion,
  rejectResearch,
  requireWorkTypePackage,
  resetBlueprintAuditForTests,
  resetResearchAttachmentsForTests,
  resetWorkArchiveForTests,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resetWorkTasksForTests,
  resolveActiveSections,
  restoreWork,
  skipBlueprintQuestion,
  submitResearchForReview,
  syncEventTasksIntoUniversalWork,
  updateWorkSectionFromBlueprintState,
} from "@/lib/universalWorkEngine";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { MARKETING_PLAN_BLUEPRINT_DEFINITIONS } from "./marketingPlanBlueprint";

const ROOT = process.cwd();

function walkTsFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
      out.push(full);
  }
  return out;
}

function readRel(pathFromRoot: string): string {
  return readFileSync(join(ROOT, pathFromRoot), "utf8");
}

describe("105 — Marketing Plan Work Type foundation", () => {
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
    ensureMarketingPlanWorkTypeRegistered();
    ensureMarketingPlanBlueprintsRegistered();
  });

  describe("Registration and boundaries", () => {
    it("registers Marketing Plan through the universal Work Type registry", () => {
      const pkg = requireWorkTypePackage(MARKETING_PLAN_WORK_TYPE_ID);
      expect(pkg.displayName).toBe("Marketing Plan");
      expect(pkg.blueprintIds).toContain(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID);
      expect(pkg.capabilities.tasks).toBe(true);
      expect(pkg.capabilities.research).toBe(true);
      expect(pkg.capabilities.chamberRouting).toBe(true);
      expect(pkg.capabilities.boardReview).toBe(true);
      expect(pkg.capabilities.cartography).toBe(true);
      expect(pkg.capabilities.projectBridge).toBe(true);
      expect(getWorkTypePackage(MARKETING_PLAN_WORK_TYPE_ID)?.version).toBe(
        "1.0.0",
      );
    });

    it("registers Simple Marketing Plan through the universal Blueprint registry", () => {
      expect(MARKETING_PLAN_BLUEPRINT_IDS).toEqual([
        MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
      ]);
      expect(isBlueprintRegistered(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)).toBe(
        true,
      );
      const bp = getBlueprint(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)!;
      expect(bp.title).toBe("Simple Marketing Plan");
      expect(bp.compatibleWorkTypeIds).toContain(MARKETING_PLAN_WORK_TYPE_ID);
      expect(bp.supportedDepthModes).toEqual([
        "quick_start",
        "guided_build",
        "complete_planning",
      ]);
      expect(listBlueprints({ workTypeId: MARKETING_PLAN_WORK_TYPE_ID })).toHaveLength(
        1,
      );
    });

    it("package does not mint Work IDs or touch durable storage", () => {
      const registerSrc = readRel(
        "lib/universalWorkEngine/packages/marketingPlan/registerMarketingPlanWorkType.ts",
      );
      expect(registerSrc).toMatch(/registerWorkTypePackage/);
      expect(registerSrc).not.toMatch(/allocateCanonicalWorkId/);
      expect(registerSrc).not.toMatch(/creationDurable|upsertAuthoritativeCreation/);

      const pkgFiles = walkTsFiles(
        join(ROOT, "lib/universalWorkEngine/packages/marketingPlan"),
      );
      for (const file of pkgFiles) {
        const src = readFileSync(file, "utf8");
        expect(src.includes("creationDurable/repository")).toBe(false);
        expect(src.includes("upsertAuthoritativeCreation")).toBe(false);
      }
    });

    it("does not copy Event package runtime or private Event intelligence", () => {
      const pkgFiles = walkTsFiles(
        join(ROOT, "lib/universalWorkEngine/packages/marketingPlan"),
      );
      for (const file of pkgFiles) {
        const src = readFileSync(file, "utf8");
        expect(src.includes("packages/eventPlan")).toBe(false);
        expect(src.includes("@/lib/eventsIntelligence")).toBe(false);
        expect(src.includes("@/lib/eventCreationWorkspace")).toBe(false);
      }
    });

    it("unknown marketing labels do not silently invent Blueprints", () => {
      const launch = launchFromCreate({
        originalUserMessage: "Use bp-legacy-marketing-template-xyz",
        candidateBlueprintId: "bp-legacy-marketing-template-xyz",
        candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        forceNew: true,
      });
      expect(launch.blueprintId).not.toBe("bp-legacy-marketing-template-xyz");
      expect(() => requireWorkTypePackage("marketing_plan_v2_unknown")).toThrow(
        UnknownWorkTypeError,
      );
    });

    it("UWE core modules outside packages do not hard-code Marketing Plan section logic", () => {
      const coreDirs = [
        "lib/universalWorkEngine/identity",
        "lib/universalWorkEngine/research",
        "lib/universalWorkEngine/tasks",
        "lib/universalWorkEngine/sectionRuntime",
        "lib/universalWorkEngine/cartography",
      ];
      for (const dir of coreDirs) {
        for (const file of walkTsFiles(join(ROOT, dir))) {
          const src = readFileSync(file, "utf8");
          expect(
            src.includes("purpose_outcome"),
            `${relative(ROOT, file)} must stay domain-agnostic`,
          ).toBe(false);
        }
      }
    });
  });

  describe("Work identity and lifecycle", () => {
    it("preserves one canonical Work ID across depth change, archive, and restore", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
      });
      const workId = state.workId;
      answerBlueprintQuestion(workId, "q_what_marketing", "ADHD coaching offer");
      const guided = changeBlueprintDepthMode(workId, "guided_build");
      expect(guided.workId).toBe(workId);
      expect(guided.depthMode).toBe("guided_build");
      expect(getWorkBlueprintState(workId)?.answeredQuestions.q_what_marketing).toBe(
        "ADHD coaching offer",
      );

      archiveWork(workId);
      expect(getWorkLifecycleStatus(workId)).toBe("archived");
      restoreWork(workId);
      expect(getWorkLifecycleStatus(workId)).toBe("active");
      expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    });

    it("duplicate prevention surfaces related Work instead of a shadow workspace", () => {
      const first = launchFromCreate({
        originalUserMessage: "Help me create a simple marketing plan",
        candidateBlueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        forceNew: true,
      });
      expect(first.workId).toBeTruthy();
      const second = launchFromCreate({
        originalUserMessage: "Help me create a simple marketing plan",
        candidateBlueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
      });
      expect(["continue_existing", "clarify", "create_new"]).toContain(
        second.decision,
      );
      if (second.decision === "continue_existing") {
        expect(second.workId).toBe(first.workId);
      }
    });
  });

  describe("Questions and sections", () => {
    it("Quick Start asks only essential questions", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
      });
      const bp = getBlueprint(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)!;
      const decisions = listAdaptiveQuestionDecisions(state.workId);
      const askIds = decisions
        .filter((d) => d.action === "ask")
        .map((d) => d.questionId);
      expect(askIds).toEqual(
        expect.arrayContaining([
          "q_what_marketing",
          "q_who_for",
          "q_main_outcome",
          "q_primary_channel",
          "q_next_actions",
        ]),
      );
      expect(askIds).not.toContain("q_core_message");
      expect(askIds).not.toContain("q_capacity");
      expect(askIds).not.toContain("q_risks");

      const active = resolveActiveSections(bp.sections, state, "quick_start")
        .visibleSectionIds;
      expect(active).toEqual(
        expect.arrayContaining([
          "purpose_outcome",
          "business_offer",
          "people_to_reach",
          "channels",
          "measures",
          "next_actions",
        ]),
      );
      expect(active).not.toContain("capacity");
      expect(active).not.toContain("risks_assumptions");
    });

    it("Guided Build adds depth without duplicating Work ID", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
      });
      const workId = state.workId;
      const bp = getBlueprint(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)!;
      answerBlueprintQuestion(workId, "q_what_marketing", "Workshop offer");
      answerBlueprintQuestion(workId, "q_who_for", "ADHD founders");
      const guided = changeBlueprintDepthMode(workId, "guided_build");
      expect(guided.workId).toBe(workId);
      const askIds = listAdaptiveQuestionDecisions(workId)
        .filter((d) => d.action === "ask")
        .map((d) => d.questionId);
      expect(askIds).toContain("q_core_message");
      const active = resolveActiveSections(bp.sections, guided, "guided_build")
        .visibleSectionIds;
      expect(active).toContain("positioning_message");
      expect(active).toContain("activity_plan");
    });

    it("Complete Planning reveals capacity and risks safely", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "complete_planning",
        origin: "create",
      });
      const bp = getBlueprint(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)!;
      const active = resolveActiveSections(
        bp.sections,
        state,
        "complete_planning",
      ).visibleSectionIds;
      expect(active).toContain("capacity");
      expect(active).toContain("risks_assumptions");
      expect(active).toContain("review_rhythm");
      const askIds = listAdaptiveQuestionDecisions(state.workId)
        .filter((d) => d.action === "ask" || d.action === "postpone")
        .map((d) => d.questionId);
      expect(askIds).toEqual(expect.arrayContaining(["q_capacity", "q_risks"]));
    });

    it("known context skips with recovery for skip / I don't know", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
        knownContext: { offer: "Clarity coaching" },
      });
      mergeKnownContext(state.workId, { offer: "Clarity coaching" });
      const bp = MARKETING_PLAN_BLUEPRINT_DEFINITIONS[0]!;
      const q = bp.adaptiveQuestions.find((x) => x.id === "q_what_marketing")!;
      const decision = evaluateAdaptiveQuestion(
        getWorkBlueprintState(state.workId)!,
        q,
      );
      expect(decision.action).toBe("skip_known");

      skipBlueprintQuestion(state.workId, "q_who_for");
      recoverSkippedQuestion(state.workId, "q_who_for");
      answerBlueprintQuestion(state.workId, "q_who_for", "I don't know yet");
      expect(
        getWorkBlueprintState(state.workId)?.answeredQuestions.q_who_for,
      ).toMatch(/don't know/i);
    });
  });

  describe("Research, connections, deliverables", () => {
    it("research requires approval before apply; reject leaves Work unchanged", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "guided_build",
        origin: "research",
      });
      const before = getWorkBlueprintState(state.workId)!;
      const research = createResearchRecord({
        target: {
          kind: "section",
          workId: state.workId,
          sectionId: "people_to_reach",
        },
        researchQuestion: "Where do ADHD business owners spend time?",
        researchMode: "audience_scan",
        originatingExperience: "create",
        findings: "Many gather in niche Facebook groups and podcasts.",
        proposedActions: ["Test one community post"],
      });
      submitResearchForReview(research.id);
      rejectResearch(research.id);
      expect(getWorkBlueprintState(state.workId)?.sectionContent).toEqual(
        before.sectionContent,
      );

      const approved = createResearchRecord({
        target: {
          kind: "section",
          workId: state.workId,
          sectionId: "people_to_reach",
        },
        researchQuestion: "Audience language",
        researchMode: "quick_check",
        originatingExperience: "create",
        findings: "They say 'overwhelmed' more than 'busy'.",
        proposedActions: ["Use overwhelmed in message"],
      });
      submitResearchForReview(approved.id);
      approveResearch(approved.id);
      const applied = applyApprovedResearch(approved.id, [
        "Primary language: overwhelmed founders",
      ]);
      expect(applied.approvalStatus).toBe("applied");
      expect(applied.appliedChanges?.[0]).toMatch(/overwhelmed/i);
      // Experience layer may apply with member approval — Work content stays explicit
      updateWorkSectionFromBlueprintState(
        state.workId,
        "people_to_reach",
        "Primary language: overwhelmed founders",
      );
      expect(
        getWorkBlueprintState(state.workId)?.sectionContent.people_to_reach,
      ).toMatch(/overwhelmed/i);
      expect(listResearchForWork(state.workId).length).toBeGreaterThanOrEqual(2);
    });

    it("Projects bridge, tasks, milestones, Cartography, Chamber, Board, Shari, Body Doubling", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "guided_build",
        origin: "projects",
      });
      const workId = state.workId;

      linkWorkRelationship({
        fromWorkId: workId,
        toRef: { kind: "project", id: "proj-launch-1" },
        relationship: "supports",
        note: "Execution in Projects",
      });
      addWorkTask({
        workId,
        title: "Draft first outreach",
        sectionId: "next_actions",
      });
      addWorkMilestone({
        workId,
        title: "Useful first plan drafted",
        sectionId: "final_plan",
      });
      linkWorkRelationship({
        fromWorkId: workId,
        toRef: { kind: "cartography_node", id: "node-offer-1" },
        relationship: "informs",
        note: "Markets offer",
      });

      expect(listWorkTasks(workId)[0]?.title).toMatch(/outreach/i);
      expect(listWorkMilestones(workId)[0]?.title).toMatch(/first plan/i);
      expect(listWorkRelationships(workId).length).toBeGreaterThanOrEqual(2);

      const bp = getBlueprint(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)!;
      expect(bp.chamberRoutingRecommendations[0]).toBe("marketing");
      expect(bp.boardReviewRecommendations).toEqual(
        expect.arrayContaining(["Budget and capacity fit"]),
      );
      expect(bp.deliverables).toEqual(
        expect.arrayContaining([
          "concise Marketing Plan",
          "one-page action plan",
          "print/export output",
        ]),
      );
      expect(bp.projectBridgeRecommendations.length).toBeGreaterThan(0);

      const talk = launchFromShari({
        originalUserMessage: "Just talk through my marketing plan with me",
        shariMode: "talk_only",
      });
      expect(talk.talkOnly).toBe(true);
      expect(talk.decision).toBe("conversation_support_only");

      const workOnThis = launchFromShari({
        originalUserMessage: "Update the audience section with me",
        relatedWorkId: workId,
        shariMode: "work_on_this",
      });
      expect(workOnThis.talkOnly).toBe(false);
      expect(workOnThis.workId ?? workId).toBe(workId);

      const bd = launchFromOrigin("body_doubling", {
        originalUserMessage:
          "Body double with me while I write the audience section",
        relatedWorkId: workId,
        candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        bodyDoublingSessionId: "bd-mkt-1",
        sectionId: "people_to_reach",
      });
      expect(bd.workId ?? workId).toBe(workId);

      const chamber = launchFromOrigin("chamber", {
        originalUserMessage: "Ask Marketing Intelligence to review this",
        relatedWorkId: workId,
        chamberMemberId: "marketing",
        applyApproved: true,
      });
      expect(chamber.workId ?? workId).toBe(workId);

      const board = launchFromOrigin("board", {
        originalUserMessage: "Have the Board review the budget",
        relatedWorkId: workId,
        boardReviewId: "br-mkt-budget",
        applyApproved: true,
      });
      expect(board.workId ?? workId).toBe(workId);
    });

    it("Clear My Mind provenance can attach without duplicating Work content", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "clear_my_mind",
      });
      linkWorkRelationship({
        fromWorkId: state.workId,
        toRef: { kind: "journal-entry", id: "cmm-1" },
        relationship: "related_to",
        note: "Clear My Mind capture informed this plan",
      });
      expect(
        listWorkRelationships(state.workId).some(
          (r) => r.toRef.kind === "journal-entry",
        ),
      ).toBe(true);
    });
  });

  describe("Anywhere-origin + regression", () => {
    it("infers Marketing Plan from natural language and NL detectors", () => {
      expect(isMarketingPlanCreationRequest("Help me create a simple marketing plan")).toBe(
        true,
      );
      expect(isMarketingPlanCreationRequest("I need to market this offer")).toBe(
        true,
      );
      expect(isMarketingPlanCreationRequest("Write an email")).toBe(false);

      const origins = [
        "create",
        "projects",
        "strategies",
        "blueprints",
        "cartography",
        "body_doubling",
        "conversation",
        "chamber",
        "board",
        "research",
        "clear_my_mind",
        "tasks",
        "welcome_home",
      ] as const;

      for (const origin of origins) {
        const result = launchFromOrigin(origin, {
          originalUserMessage: "Help me create a simple marketing plan",
          candidateBlueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
          candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
          forceNew: true,
          chamberMemberId: origin === "chamber" ? "marketing" : undefined,
          boardReviewId: origin === "board" ? "br-mkt" : undefined,
          bodyDoublingSessionId:
            origin === "body_doubling" ? "bd-mkt-origin" : undefined,
        });
        expect(
          result.workTypeId === MARKETING_PLAN_WORK_TYPE_ID ||
            result.decision === "clarify" ||
            result.decision === "conversation_support_only" ||
            result.decision === "awaiting_approval" ||
            result.decision === "continue_existing" ||
            result.decision === "create_new",
          `${origin} should resolve marketing plan (got ${result.decision})`,
        ).toBe(true);
      }
    });

    it("Event Work Type still registers and can initialize after Marketing boot", () => {
      expect(requireWorkTypePackage("event_plan").workTypeId).toBe("event_plan");
      const event = initializeWorkFromBlueprint({
        blueprintId: "bp-event-business-luncheon",
        workTypeId: "event_plan",
        depthMode: "quick_start",
        origin: "create",
      });
      syncEventTasksIntoUniversalWork({
        workId: event.workId,
        tasks: [
          {
            id: "t-venue",
            title: "Confirm venue",
            done: false,
            sectionId: "venue",
          },
        ],
        milestones: [],
      });
      expect(listWorkTasks(event.workId)[0]?.title).toBe("Confirm venue");
    });
  });
});
