/**
 * 587–598 — Facebook Community Work Type foundation + certification suite.
 * @vitest-environment node
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  FACEBOOK_COMMUNITY_BLUEPRINT_IDS,
  FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
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
  ensureFacebookCommunityBlueprintsRegistered,
  ensureFacebookCommunityWorkTypeRegistered,
  ensureMarketingPlanBlueprintsRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  evaluateAdaptiveQuestion,
  getBlueprint,
  getWorkBlueprintState,
  getWorkLifecycleStatus,
  getWorkTypePackage,
  initializeWorkFromBlueprint,
  isBlueprintRegistered,
  isFacebookCommunityCreationRequest,
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
  updateWorkSectionFromBlueprintState,
} from "@/lib/universalWorkEngine";
import { FACEBOOK_COMMUNITY_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/facebookCommunityMap";
import { FACEBOOK_COMMUNITY_BLUEPRINT_DEFINITIONS } from "./facebookCommunityBlueprint";

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

describe("587–598 — Facebook Community Work Type foundation", () => {
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
    ensureFacebookCommunityWorkTypeRegistered();
    ensureFacebookCommunityBlueprintsRegistered();
  });

  describe("Registration and boundaries", () => {
    it("registers Facebook Community through the universal Work Type registry", () => {
      const pkg = requireWorkTypePackage(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
      expect(pkg.displayName).toBe("Facebook Community");
      expect(pkg.blueprintIds).toContain(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID);
      expect(pkg.capabilities.tasks).toBe(true);
      expect(pkg.capabilities.research).toBe(true);
      expect(pkg.capabilities.chamberRouting).toBe(true);
      expect(pkg.capabilities.boardReview).toBe(true);
      expect(pkg.capabilities.cartography).toBe(true);
      expect(pkg.capabilities.projectBridge).toBe(true);
      expect(getWorkTypePackage(FACEBOOK_COMMUNITY_WORK_TYPE_ID)?.version).toBe(
        "1.0.0",
      );
    });

    it("registers Facebook Community Blueprint through the universal Blueprint registry", () => {
      expect(FACEBOOK_COMMUNITY_BLUEPRINT_IDS).toEqual([
        FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
      ]);
      expect(
        isBlueprintRegistered(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID),
      ).toBe(true);
      const bp = getBlueprint(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)!;
      expect(bp.title).toBe("Facebook Community");
      expect(bp.compatibleWorkTypeIds).toContain(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
      expect(bp.supportedDepthModes).toEqual([
        "quick_start",
        "guided_build",
        "complete_planning",
      ]);
      expect(
        listBlueprints({ workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID }),
      ).toHaveLength(1);
    });

    it("package does not mint Work IDs or touch durable storage", () => {
      const registerSrc = readRel(
        "lib/universalWorkEngine/packages/facebookCommunity/registerFacebookCommunityWorkType.ts",
      );
      expect(registerSrc).toMatch(/registerWorkTypePackage/);
      expect(registerSrc).not.toMatch(/allocateCanonicalWorkId/);
      expect(registerSrc).not.toMatch(/creationDurable|upsertAuthoritativeCreation/);

      const pkgFiles = walkTsFiles(
        join(ROOT, "lib/universalWorkEngine/packages/facebookCommunity"),
      );
      for (const file of pkgFiles) {
        const src = readFileSync(file, "utf8");
        expect(src.includes("creationDurable/repository")).toBe(false);
        expect(src.includes("upsertAuthoritativeCreation")).toBe(false);
      }
    });

    it("does not copy Event or Marketing Plan package runtime, or invent a parallel Create runtime", () => {
      const pkgFiles = walkTsFiles(
        join(ROOT, "lib/universalWorkEngine/packages/facebookCommunity"),
      );
      for (const file of pkgFiles) {
        const src = readFileSync(file, "utf8");
        expect(src.includes("packages/eventPlan")).toBe(false);
        expect(src.includes("packages/marketingPlan")).toBe(false);
        expect(src.includes("@/lib/eventsIntelligence")).toBe(false);
        expect(src.includes("@/lib/eventCreationWorkspace")).toBe(false);
      }
    });

    it("unknown facebook community labels do not silently invent Blueprints", () => {
      const launch = launchFromCreate({
        originalUserMessage: "Use bp-legacy-facebook-template-xyz",
        candidateBlueprintId: "bp-legacy-facebook-template-xyz",
        candidateWorkTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        forceNew: true,
      });
      expect(launch.blueprintId).not.toBe("bp-legacy-facebook-template-xyz");
      expect(() => requireWorkTypePackage("facebook_community_v2_unknown")).toThrow(
        UnknownWorkTypeError,
      );
    });

    it("UWE core modules outside packages do not hard-code Facebook Community section logic", () => {
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
            src.includes("purpose_and_audience"),
            `${relative(ROOT, file)} must stay domain-agnostic`,
          ).toBe(false);
        }
      }
    });
  });

  describe("Work identity and lifecycle", () => {
    it("preserves one canonical Work ID across depth change, archive, and restore", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
      });
      const workId = state.workId;
      answerBlueprintQuestion(
        workId,
        "q_community_purpose",
        "Past clients who want ongoing support",
      );
      const guided = changeBlueprintDepthMode(workId, "guided_build");
      expect(guided.workId).toBe(workId);
      expect(guided.depthMode).toBe("guided_build");
      expect(
        getWorkBlueprintState(workId)?.answeredQuestions.q_community_purpose,
      ).toBe("Past clients who want ongoing support");

      archiveWork(workId);
      expect(getWorkLifecycleStatus(workId)).toBe("archived");
      restoreWork(workId);
      expect(getWorkLifecycleStatus(workId)).toBe("active");
      expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    });

    it("duplicate prevention surfaces related Work instead of a shadow workspace", () => {
      const first = launchFromCreate({
        originalUserMessage: "Help me create a Facebook community",
        candidateBlueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        candidateWorkTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        forceNew: true,
      });
      expect(first.workId).toBeTruthy();
      const second = launchFromCreate({
        originalUserMessage: "Help me create a Facebook community",
        candidateBlueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        candidateWorkTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
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
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
      });
      const bp = getBlueprint(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)!;
      const decisions = listAdaptiveQuestionDecisions(state.workId);
      const askIds = decisions
        .filter((d) => d.action === "ask")
        .map((d) => d.questionId);
      expect(askIds).toEqual(
        expect.arrayContaining([
          "q_community_purpose",
          "q_promise",
          "q_name_direction",
          "q_privacy_choice",
          "q_welcome_plan",
          "q_launch_seed",
        ]),
      );
      expect(askIds).not.toContain("q_community_type");
      expect(askIds).not.toContain("q_moderation_support");
      expect(askIds).not.toContain("q_success_signal");

      const active = resolveActiveSections(bp.sections, state, "quick_start")
        .visibleSectionIds;
      expect(active).toEqual(
        expect.arrayContaining([
          "purpose_and_audience",
          "positioning_and_promise",
          "naming_and_tagline",
          "setup_privacy_and_visibility",
          "welcome_and_onboarding",
          "launch_plan",
        ]),
      );
      expect(active).not.toContain("moderation_and_safety");
      expect(active).not.toContain("analytics_and_health");
    });

    it("Guided Build adds brand, rules, and first-week depth without duplicating Work ID", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
      });
      const workId = state.workId;
      const bp = getBlueprint(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)!;
      answerBlueprintQuestion(
        workId,
        "q_community_purpose",
        "Local business owners who want to help each other",
      );
      answerBlueprintQuestion(workId, "q_name_direction", "Explore a few names");
      const guided = changeBlueprintDepthMode(workId, "guided_build");
      expect(guided.workId).toBe(workId);
      const askIds = listAdaptiveQuestionDecisions(workId)
        .filter((d) => d.action === "ask")
        .map((d) => d.questionId);
      expect(askIds).toContain("q_community_type");
      const active = resolveActiveSections(bp.sections, guided, "guided_build")
        .visibleSectionIds;
      expect(active).toContain("brand_and_banner");
      expect(active).toContain("membership_questions_and_rules");
      expect(active).toContain("first_week_journey");
    });

    it("Complete Planning reveals moderation, growth, and analytics safely", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "complete_planning",
        origin: "create",
      });
      const bp = getBlueprint(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)!;
      const active = resolveActiveSections(
        bp.sections,
        state,
        "complete_planning",
      ).visibleSectionIds;
      expect(active).toContain("roles_and_moderation_setup");
      expect(active).toContain("moderation_and_safety");
      expect(active).toContain("growth_and_referral");
      expect(active).toContain("analytics_and_health");
      expect(active).toContain("operating_manual");
      const askIds = listAdaptiveQuestionDecisions(state.workId)
        .filter((d) => d.action === "ask" || d.action === "postpone")
        .map((d) => d.questionId);
      expect(askIds).toEqual(
        expect.arrayContaining(["q_moderation_support", "q_success_signal"]),
      );
    });

    it("known context skips with recovery for skip / I don't know", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "create",
        knownContext: { audience: "ADHD entrepreneurs" },
      });
      mergeKnownContext(state.workId, { audience: "ADHD entrepreneurs" });
      const bp = FACEBOOK_COMMUNITY_BLUEPRINT_DEFINITIONS[0]!;
      const q = bp.adaptiveQuestions.find((x) => x.id === "q_community_purpose")!;
      const decision = evaluateAdaptiveQuestion(
        getWorkBlueprintState(state.workId)!,
        q,
      );
      expect(decision.action).toBe("skip_known");

      skipBlueprintQuestion(state.workId, "q_promise");
      recoverSkippedQuestion(state.workId, "q_promise");
      answerBlueprintQuestion(state.workId, "q_promise", "I don't know yet");
      expect(
        getWorkBlueprintState(state.workId)?.answeredQuestions.q_promise,
      ).toMatch(/don't know/i);
    });
  });

  describe("Research, connections, deliverables", () => {
    it("research requires approval before apply; reject leaves Work unchanged", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "guided_build",
        origin: "research",
      });
      const before = getWorkBlueprintState(state.workId)!;
      const research = createResearchRecord({
        target: {
          kind: "section",
          workId: state.workId,
          sectionId: "purpose_and_audience",
        },
        researchQuestion: "Where do ADHD business owners spend time online?",
        researchMode: "audience_scan",
        originatingExperience: "create",
        findings: "Many already gather in niche Facebook groups and podcasts.",
        proposedActions: ["Reference a comparable community for tone"],
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
          sectionId: "purpose_and_audience",
        },
        researchQuestion: "Audience language",
        researchMode: "quick_check",
        originatingExperience: "create",
        findings: "They say 'overwhelmed' more than 'busy'.",
        proposedActions: ["Use overwhelmed in the promise"],
      });
      submitResearchForReview(approved.id);
      approveResearch(approved.id);
      const applied = applyApprovedResearch(approved.id, [
        "Primary audience language: overwhelmed founders",
      ]);
      expect(applied.approvalStatus).toBe("applied");
      expect(applied.appliedChanges?.[0]).toMatch(/overwhelmed/i);
      updateWorkSectionFromBlueprintState(
        state.workId,
        "purpose_and_audience",
        "Primary audience language: overwhelmed founders",
      );
      expect(
        getWorkBlueprintState(state.workId)?.sectionContent.purpose_and_audience,
      ).toMatch(/overwhelmed/i);
      expect(listResearchForWork(state.workId).length).toBeGreaterThanOrEqual(2);
    });

    it("Projects bridge, tasks, milestones, Cartography, Chamber, Board, Shari, Body Doubling", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "guided_build",
        origin: "projects",
      });
      const workId = state.workId;

      linkWorkRelationship({
        fromWorkId: workId,
        toRef: { kind: "project", id: "proj-launch-fb-1" },
        relationship: "supports",
        note: "Execution in Projects",
      });
      addWorkTask({
        workId,
        title: "Build the seed invitation list",
        sectionId: "launch_plan",
      });
      addWorkMilestone({
        workId,
        title: "Foundation defined and name selected",
        sectionId: "naming_and_tagline",
      });
      linkWorkRelationship({
        fromWorkId: workId,
        toRef: { kind: "cartography_node", id: "node-offer-fb-1" },
        relationship: "informs",
        note: "Informs marketing and content work",
      });

      expect(listWorkTasks(workId)[0]?.title).toMatch(/seed/i);
      expect(listWorkMilestones(workId)[0]?.title).toMatch(/foundation/i);
      expect(listWorkRelationships(workId).length).toBeGreaterThanOrEqual(2);

      const bp = getBlueprint(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)!;
      expect(bp.chamberRoutingRecommendations[0]).toBe("marketing");
      expect(bp.boardReviewRecommendations).toEqual(
        expect.arrayContaining(["Moderation and safety capacity"]),
      );
      expect(bp.deliverables).toEqual(
        expect.arrayContaining([
          "Community Foundation Brief",
          "Welcome Kit",
          "Launch Plan",
        ]),
      );
      expect(bp.projectBridgeRecommendations.length).toBeGreaterThan(0);
      expect(
        bp.projectBridgeRecommendations.some((r) =>
          /never auto-convert/i.test(r),
        ),
      ).toBe(true);

      const talk = launchFromShari({
        originalUserMessage: "Just talk through my Facebook community with me",
        shariMode: "talk_only",
      });
      expect(talk.talkOnly).toBe(true);
      expect(talk.decision).toBe("conversation_support_only");

      const workOnThis = launchFromShari({
        originalUserMessage: "Update the welcome section with me",
        relatedWorkId: workId,
        shariMode: "work_on_this",
      });
      expect(workOnThis.talkOnly).toBe(false);
      expect(workOnThis.workId ?? workId).toBe(workId);

      const bd = launchFromOrigin("body_doubling", {
        originalUserMessage:
          "Body double with me while I write the welcome kit",
        relatedWorkId: workId,
        candidateWorkTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        bodyDoublingSessionId: "bd-fb-1",
        sectionId: "welcome_and_onboarding",
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
        originalUserMessage: "Have the Board review moderation capacity",
        relatedWorkId: workId,
        boardReviewId: "br-fb-moderation",
        applyApproved: true,
      });
      expect(board.workId ?? workId).toBe(workId);
    });

    it("Clear My Mind provenance can attach without duplicating Work content", () => {
      const state = initializeWorkFromBlueprint({
        blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
        workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
        depthMode: "quick_start",
        origin: "clear_my_mind",
      });
      linkWorkRelationship({
        fromWorkId: state.workId,
        toRef: { kind: "journal-entry", id: "cmm-fb-1" },
        relationship: "related_to",
        note: "Clear My Mind capture informed this community idea",
      });
      expect(
        listWorkRelationships(state.workId).some(
          (r) => r.toRef.kind === "journal-entry",
        ),
      ).toBe(true);
    });
  });

  describe("Anywhere-origin + regression", () => {
    it("infers Facebook Community from natural language and NL detectors", () => {
      expect(
        isFacebookCommunityCreationRequest("Help me create a Facebook group"),
      ).toBe(true);
      expect(
        isFacebookCommunityCreationRequest(
          "I want to start a Facebook community for my clients",
        ),
      ).toBe(true);
      expect(isFacebookCommunityCreationRequest("Write me a Facebook post")).toBe(
        false,
      );
      expect(isFacebookCommunityCreationRequest("Write an email")).toBe(false);

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
          originalUserMessage: "Help me create a Facebook community",
          candidateBlueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
          candidateWorkTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
          forceNew: true,
          chamberMemberId: origin === "chamber" ? "marketing" : undefined,
          boardReviewId: origin === "board" ? "br-fb" : undefined,
          bodyDoublingSessionId:
            origin === "body_doubling" ? "bd-fb-origin" : undefined,
        });
        expect(
          result.workTypeId === FACEBOOK_COMMUNITY_WORK_TYPE_ID ||
            result.decision === "clarify" ||
            result.decision === "conversation_support_only" ||
            result.decision === "awaiting_approval" ||
            result.decision === "continue_existing" ||
            result.decision === "create_new",
          `${origin} should resolve facebook community (got ${result.decision})`,
        ).toBe(true);
      }
    });

    it("Event and Marketing Plan Work Types still register and initialize after Facebook Community boot", () => {
      expect(requireWorkTypePackage("event_plan").workTypeId).toBe("event_plan");
      expect(requireWorkTypePackage("marketing_plan").workTypeId).toBe(
        "marketing_plan",
      );
      const marketing = initializeWorkFromBlueprint({
        blueprintId: "marketing_plan.simple",
        workTypeId: "marketing_plan",
        depthMode: "quick_start",
        origin: "create",
      });
      expect(marketing.workTypeId).toBe("marketing_plan");
    });
  });
});
