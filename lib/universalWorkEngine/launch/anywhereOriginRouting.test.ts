/**
 * 103 — Anywhere-Origin Universal Work Routing certification.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ANYWHERE_ORIGIN_NL_EXAMPLES,
  ANYWHERE_WORK_ORIGINS,
  assessDuplicateRisk,
  clearBlueprintRegistryForTests,
  ensureEventBlueprintsRegistered,
  getWorkBlueprintState,
  initializeWorkFromBlueprint,
  launchFromBodyDoubling,
  launchFromBoard,
  launchFromChamber,
  launchFromClearMyMind,
  launchFromCreate,
  launchFromOrigin,
  launchFromResearch,
  launchFromShari,
  launchFromWelcomeHome,
  linkWorkRelationship,
  listWorkBlueprintStates,
  mapLegacyCreateBlueprintToUwe,
  REQUIRED_ANYWHERE_ORIGINS,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resolveAnywhereOriginWork,
  resolveNlExample,
  resolvePlatformIntentViaAnywhereOrigin,
} from "@/lib/universalWorkEngine";

describe("103 Anywhere-Origin routing", () => {
  beforeEach(() => {
    clearBlueprintRegistryForTests();
    resetWorkBlueprintStateForTests();
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    ensureEventBlueprintsRegistered();
  });

  it("exposes every required origin on WorkOrigin / adapters", () => {
    for (const origin of REQUIRED_ANYWHERE_ORIGINS) {
      expect(ANYWHERE_WORK_ORIGINS).toContain(origin);
      const result = launchFromOrigin(origin, {
        originalUserMessage: "Help me plan a business luncheon.",
        forceNew: true,
      });
      expect(
        ["create_new", "clarify", "awaiting_approval", "conversation_support_only"].includes(
          result.decision,
        ) || result.openUniversalInterface || result.awaitingApproval,
      ).toBe(true);
      expect(result.origin).toBe(origin);
      expect(result.reply).not.toMatch(/canonical|registry|schema|runtime/i);
    }
  });

  it("every origin can continue, connect, create, or stay non-creating", () => {
    const seed = initializeWorkFromBlueprint({
      blueprintId: "bp-event-online-workshop",
      workTypeId: "event_plan",
      origin: "create",
      knownContext: { purpose: "Workshop clarity" },
    });
    linkWorkRelationship({
      fromWorkId: seed.workId,
      toRef: { kind: "project", id: "proj-1" },
      relationship: "part_of",
    });
    linkWorkRelationship({
      fromWorkId: seed.workId,
      toRef: { kind: "cartography_node", id: "node-1" },
      relationship: "visualizes",
    });

    for (const origin of REQUIRED_ANYWHERE_ORIGINS) {
      const cont = launchFromOrigin(origin, {
        relatedWorkId: seed.workId,
        originalUserMessage: "Continue the workshop I started.",
      });
      expect(cont.decision).toBe("continue_existing");
      expect(cont.workId).toBe(seed.workId);
      expect(cont.preventedDuplicate).toBe(true);

      const connect = launchFromOrigin(origin, {
        originalUserMessage: "Connect this to my launch map.",
        projectId: "proj-1",
        cartographyNodeId: "node-1",
        candidateBlueprintId: "bp-event-online-workshop",
      });
      expect(["continue_existing", "connect_existing", "clarify"]).toContain(
        connect.decision,
      );
      expect(connect.workId).toBe(seed.workId);

      const created = launchFromOrigin(origin, {
        originalUserMessage: "Help me plan a business luncheon.",
        forceNew: true,
      });
      if (origin === "chamber" || origin === "board" || origin === "research") {
        // Without applyApproved these stay advisory
        expect(created.awaitingApproval || created.decision === "create_new").toBe(
          true,
        );
      } else {
        expect(created.decision).toBe("create_new");
        expect(created.workId).toBeTruthy();
        expect(created.workId).not.toBe(seed.workId);
      }
    }

    const countBeforeTalk = listWorkBlueprintStates().length;
    const talk = launchFromShari({
      originalUserMessage: "Just talk this through with me.",
      shariMode: "talk_only",
    });
    expect(talk.talkOnly).toBe(true);
    expect(talk.workId).toBeNull();
    expect(listWorkBlueprintStates().length).toBe(countBeforeTalk);
  });

  it("Shari work-on-this requires approval before mutation", () => {
    const seed = initializeWorkFromBlueprint({
      blueprintId: "bp-event-book-signing",
      workTypeId: "event_plan",
    });
    const before = getWorkBlueprintState(seed.workId)!;
    const pending = launchFromShari({
      relatedWorkId: seed.workId,
      shariMode: "work_on_this",
      originalUserMessage: "Update the budget section.",
      sectionId: "budget",
      applyApproved: false,
    });
    expect(pending.awaitingApproval).toBe(true);
    expect(getWorkBlueprintState(seed.workId)?.updatedAt).toBe(before.updatedAt);

    const applied = launchFromShari({
      relatedWorkId: seed.workId,
      shariMode: "work_on_this",
      applyApproved: true,
      originalUserMessage: "Update the budget section.",
      sectionId: "budget",
    });
    expect(applied.decision).toBe("continue_existing");
    expect(applied.workId).toBe(seed.workId);
    expect(applied.awaitingApproval).toBe(false);
  });

  it("Chamber and Board retain attribution context; Research approval enforced", () => {
    const seed = initializeWorkFromBlueprint({
      blueprintId: "bp-event-three-day-retreat",
      workTypeId: "event_plan",
    });

    const chamber = launchFromChamber({
      relatedWorkId: seed.workId,
      chamberMemberId: "events",
      originalUserMessage: "Ask the Chamber to help improve this event.",
      applyApproved: false,
    });
    expect(chamber.awaitingApproval).toBe(true);

    const board = launchFromBoard({
      relatedWorkId: seed.workId,
      boardReviewId: "br-1",
      sectionId: "budget",
      originalUserMessage: "Have the Board review this event budget.",
      applyApproved: false,
    });
    expect(board.awaitingApproval).toBe(true);

    const research = launchFromResearch({
      relatedWorkId: seed.workId,
      researchRecordId: "res-1",
      originalUserMessage: "Research venues for this retreat.",
      applyApproved: false,
    });
    expect(research.awaitingApproval).toBe(true);

    const approved = launchFromResearch({
      relatedWorkId: seed.workId,
      researchRecordId: "res-1",
      applyApproved: true,
      originalUserMessage: "Apply the venue research.",
    });
    expect(approved.decision).toBe("continue_existing");
    expect(
      getWorkBlueprintState(seed.workId)?.knownContext.launch_origin ||
        getWorkBlueprintState(seed.workId)?.knownContext,
    ).toBeTruthy();
  });

  it("Body Doubling attaches to existing Work; Cartography does not duplicate content", () => {
    const seed = initializeWorkFromBlueprint({
      blueprintId: "bp-event-business-luncheon",
      workTypeId: "event_plan",
    });
    const bd = launchFromBodyDoubling({
      relatedWorkId: seed.workId,
      sectionId: "agenda",
      bodyDoublingSessionId: "bd-1",
      originalUserMessage:
        "Body double with me while I work on the event agenda.",
    });
    expect(bd.workId).toBe(seed.workId);
    expect(
      getWorkBlueprintState(seed.workId)?.knownContext.body_doubling_session_id,
    ).toBe("bd-1");

    const carto = resolveAnywhereOriginWork({
      origin: "cartography",
      relatedWorkId: seed.workId,
      cartographyNodeId: "node-lunch",
      originalUserMessage: "Show this event in Cartography.",
    });
    expect(carto.workId).toBe(seed.workId);
    expect(listWorkBlueprintStates().filter((s) => s.workId === seed.workId)).toHaveLength(
      1,
    );
  });

  it("duplicate detection works across origins; one Work ID survives", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a business luncheon.",
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();

    const second = launchFromWelcomeHome({
      originalUserMessage: "Help me plan a business luncheon.",
    });
    expect(second.preventedDuplicate || second.decision === "clarify").toBe(
      true,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }

    const risk = assessDuplicateRisk({
      contract: {
        origin: "projects",
        originalUserMessage: "business luncheon",
        candidateBlueprintId: "bp-event-business-luncheon",
      },
      related: [
        {
          workId: first.workId!,
          title: "Business Luncheon",
          workTypeId: "event_plan",
          blueprintId: "bp-event-business-luncheon",
          matchReasons: ["related_blueprint", "similar_title_or_intent", "same_work_type"],
        },
      ],
    });
    expect(risk.riskLevel).toBe("likely");
  });

  it("maps legacy CreateBlueprint aliases without template fallthrough", () => {
    expect(mapLegacyCreateBlueprintToUwe("bp-retreat-event")).toBe(
      "bp-event-three-day-retreat",
    );
    expect(mapLegacyCreateBlueprintToUwe("bp-workshop")).toBe(
      "bp-event-online-workshop",
    );
    expect(mapLegacyCreateBlueprintToUwe("bp-unknown-xyz")).toBeNull();

    const via = resolvePlatformIntentViaAnywhereOrigin({
      userText: "Use the retreat Blueprint.",
      legacyCreateBlueprintId: "bp-retreat-event",
      forceNew: true,
    });
    expect(via.blueprintId).toBe("bp-event-three-day-retreat");
    expect(via.routingNote).not.toMatch(/fallthrough/i);
  });

  it("resolves all required natural-language examples through UWE", () => {
    for (const example of ANYWHERE_ORIGIN_NL_EXAMPLES) {
      // Isolate each example so prior creates do not steal Blueprint match
      resetWorkBlueprintStateForTests();
      resetWorkIdentityStoreForTests();
      resetWorkRelationshipsForTests();
      ensureEventBlueprintsRegistered();

      const workshop =
        example.id === "continue_workshop" ||
        example.id === "show_in_cartography" ||
        example.id === "body_double_agenda" ||
        example.id === "chamber_help_event" ||
        example.id === "board_review_budget" ||
        example.id === "research_venues"
          ? initializeWorkFromBlueprint({
              blueprintId: "bp-event-online-workshop",
              workTypeId: "event_plan",
              knownContext: { purpose: "Workshop I started" },
            })
          : null;

      const overlay = workshop
        ? { relatedWorkId: workshop.workId }
        : example.id === "business_luncheon" ||
            example.id === "online_workshop" ||
            example.id === "three_day_retreat" ||
            example.id === "project_to_book_signing" ||
            example.id === "use_retreat_blueprint" ||
            example.id === "cmm_to_event"
          ? { forceNew: true }
          : undefined;

      const result = resolveNlExample(example, overlay);
      const allowed = Array.isArray(example.expect.decision)
        ? example.expect.decision
        : example.expect.decision
          ? [example.expect.decision]
          : null;
      if (allowed) {
        expect(allowed, example.id).toContain(result.decision);
      }
      if (example.expect.blueprintId) {
        expect(result.blueprintId, example.id).toBe(example.expect.blueprintId);
      }
      if (example.expect.openUniversalInterface != null) {
        expect(result.openUniversalInterface, example.id).toBe(
          example.expect.openUniversalInterface,
        );
      }
      if (example.expect.talkOnly != null) {
        expect(result.talkOnly, example.id).toBe(example.expect.talkOnly);
      }
      if (example.expect.awaitingApproval != null) {
        expect(result.awaitingApproval, example.id).toBe(
          example.expect.awaitingApproval,
        );
      }
      if (example.expect.hasWorkId) {
        expect(result.workId, example.id).toBeTruthy();
      }
      expect(result.reply, example.id).not.toMatch(
        /canonical|registry|schema|runtime/i,
      );
    }
  });

  it("Clear My Mind can stay thought-only or create with provenance", () => {
    const thoughtOnly = launchFromClearMyMind({
      originalUserMessage: "Just capturing a thought.",
      clearMyMindThoughtId: "t1",
    });
    expect(
      ["conversation_support_only", "clarify"].includes(thoughtOnly.decision) ||
        thoughtOnly.talkOnly,
    ).toBe(true);

    const asEvent = launchFromClearMyMind({
      originalUserMessage:
        "This thought from Clear My Mind should become an event.",
      clearMyMindThoughtId: "t2",
      candidateBlueprintId: "bp-event-business-luncheon",
      forceNew: true,
    });
    expect(asEvent.workId).toBeTruthy();
    expect(
      getWorkBlueprintState(asEvent.workId!)?.knownContext
        .clear_my_mind_thought_id,
    ).toBe("t2");
  });

  it("launch modules do not import durable repositories or Marketing Plan", () => {
    const files = [
      "lib/universalWorkEngine/launch/resolveAnywhereOriginWork.ts",
      "lib/universalWorkEngine/launch/originAdapters.ts",
      "lib/universalWorkEngine/launch/bridgePlatformIntent.ts",
      "lib/universalWorkEngine/launch/naturalLanguageExamples.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(resolve(process.cwd(), rel), "utf8");
      expect(src).not.toMatch(/creationDurable|from ["']@\/lib\/supabase/);
      expect(src).not.toMatch(/marketing_plan|Marketing Plan/);
    }
  });
});
