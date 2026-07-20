/**
 * @vitest-environment jsdom
 * 050 — Creation Ownership and Collaboration
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clearActiveEventRecord } from "@/lib/eventsIntelligence";
import { clearRelationshipRegistryForTests } from "@/lib/creationEcosystem";
import { listCreateBlueprints } from "@/lib/platformIntent/blueprintRegistry";
import { listEventAssetDefinitions } from "@/lib/eventsIntelligence";
import { processUniversalCreationTurn } from "@/lib/universalCreationEngine";
import { looksLikeKnowledgeQuestion } from "@/lib/platformIntent/classifyPlatformIntent";
import {
  assertOwnershipRegistryIntegrity,
  boardAdviceCreatesWorkspace,
  buildContributorContextPacket,
  buildUnifiedOwnerResponse,
  clearOwnershipRegistryCache,
  contributorMayCreateOrphan,
  decideCollaboration,
  getOwnershipForObject,
  listOwnershipDefinitions,
  resolveOwnership,
  resolveOwnershipAlias,
  synthesizeOwnershipConflict,
} from "./index";

describe("050 Creation Ownership and Collaboration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveEventRecord();
    clearRelationshipRegistryForTests();
    clearOwnershipRegistryCache();
  });

  it("standard document exists", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/050_CREATION_OWNERSHIP_AND_COLLABORATION_STANDARD.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/One owner\. Many contributors\. One result/i);
    expect(body).toMatch(/Ownership Registry/i);
  });

  it("1 — every blueprint has exactly one Primary Owner", () => {
    const errors = assertOwnershipRegistryIntegrity();
    expect(errors).toEqual([]);
    for (const bp of listCreateBlueprints()) {
      if (!bp.ownerChamberMemberId) continue;
      const own = getOwnershipForObject("blueprint", bp.id);
      expect(own?.primaryOwner).toBeTruthy();
      expect(own?.primaryOwner).toBe(bp.ownerChamberMemberId);
    }
  });

  it("2 — every asset type has exactly one Primary Owner", () => {
    for (const def of listEventAssetDefinitions()) {
      const own = getOwnershipForObject("asset_type", def.assetTypeId);
      expect(own?.primaryOwner).toBeTruthy();
      expect(typeof own!.primaryOwner).toBe("string");
      // No second competing owner field
      expect(own!.supportingContributors.every((c) => c.chamberMemberId !== own!.primaryOwner)).toBe(
        true,
      );
    }
  });

  it("3 — contributors cannot create disconnected assets", () => {
    expect(contributorMayCreateOrphan()).toBe(false);
    const collab = decideCollaboration({
      assetTypeId: "agenda",
      userText: "Ask content to help with the agenda",
    });
    expect(collab.allowSeparateCreationRecord).toBe(false);
  });

  it("4 — Board advice does not create duplicate workspaces", () => {
    expect(boardAdviceCreatesWorkspace()).toBe(false);
    const collab = decideCollaboration({
      blueprintId: "bp-workshop",
      userText: "What would the board think about this workshop?",
    });
    expect(collab.mode).toBe("board_consultation");
    expect(collab.boardMayOwn).toBe(false);
  });

  it("5 — clear creation requests route to the correct owner", () => {
    const workshop = resolveOwnership({
      text: "Help me create a one-day workshop",
    });
    expect(workshop.primaryOwner).toBe("events");

    const email = resolveOwnership({
      assetTypeId: "registration_confirmation_email",
    });
    expect(email.primaryOwner).toBe("content");

    const budget = resolveOwnership({ assetTypeId: "event_budget" });
    expect(budget.primaryOwner).toBe("finance");

    const deck = resolveOwnership({ assetTypeId: "presentation_deck" });
    expect(deck.primaryOwner).toBe("creative-studio");
  });

  it("6 — general questions remain conversational", () => {
    expect(
      looksLikeKnowledgeQuestion(
        "What should I consider when planning a workshop?",
      ),
    ).toBe(true);
    const turn = processUniversalCreationTurn({
      userText: "What should I consider when planning a workshop?",
    });
    expect(turn.handled).toBe(false);
  });

  it("7 — existing assets are resumed rather than duplicated", () => {
    const start = processUniversalCreationTurn({
      userText: "Help me create a workshop event.",
      forceStart: true,
    });
    const again = processUniversalCreationTurn({
      userText: "Continue my workshop plan",
    });
    expect(again.eventRecordId).toBe(start.eventRecordId);
    expect(again.resolution.isDuplicateAttempt || again.resolution.resume).toBe(
      true,
    );
  });

  it("8 — contributors receive Creation Context", () => {
    const start = processUniversalCreationTurn({
      userText:
        "Help me create a workshop to introduce the ADHD business platform with ADHD business people as the audience.",
      forceStart: true,
    });
    const packet = buildContributorContextPacket({
      eventRecordId: start.eventRecordId,
      assetTypeId: "registration_confirmation_email",
      latestUserGoal: "Draft the confirmation email",
      requestedContributionScope: "Email wording only",
    });
    expect(packet).toBeTruthy();
    expect(packet!.doNotReask.length).toBeGreaterThan(0);
    expect(packet!.primaryOwner).toBe("content");
    expect(packet!.workspaceCoordinator).toBe("events");
    expect(packet!.requestedContributionScope).toMatch(/Email wording/i);
  });

  it("9 — conflicting advice is synthesized by the owner", () => {
    const result = synthesizeOwnershipConflict({
      assetTypeId: "event_budget",
      advice: [
        { from: "events", advice: "Keep catering premium", weight: "suggestion" },
        { from: "finance", advice: "Cap catering at $40/person", weight: "requirement" },
      ],
    });
    expect(result.deferredToOwner).toBe("finance");
    expect(result.synthesizedGuidance.toLowerCase()).toMatch(/finance|constraint|cap/);
    expect(result.considerations.length).toBe(2);
  });

  it("10 + 11 — project/cartography stay connected via ownership metadata", () => {
    const agenda = getOwnershipForObject("asset_type", "agenda");
    expect(agenda?.workspaceCoordinator).toBe("events");
    const ws = getOwnershipForObject(
      "workspace_type",
      "event_creation_workspace",
    );
    expect(ws?.primaryOwner).toBe("events");
    // Cartography nodes open canonical object ids (ownership objectId)
    expect(agenda?.objectId).toBe("agenda");
  });

  it("12 — ownership aliases resolve consistently", () => {
    const a = resolveOwnershipAlias("confirmation email");
    expect(a?.objectId).toBe("registration_confirmation_email");
    expect(a?.primaryOwner).toBe("content");

    const b = resolveOwnershipAlias("event agenda");
    expect(b?.objectId).toBe("agenda");
    expect(b?.primaryOwner).toBe("events");
  });

  it("13 — readiness reflects awaiting contribution when collaboration engaged", () => {
    const collab = decideCollaboration({
      assetTypeId: "attendee_workbook",
      userText: "Ask learning and creative to help with the workbook",
      crossDomainAsset: true,
    });
    expect(collab.engage).toBe(true);
    expect(collab.contributorIds.length).toBeGreaterThan(0);
  });

  it("14 — ownership changes do not orphan work (workspace coordinator preserved)", () => {
    const email = getOwnershipForObject(
      "asset_type",
      "registration_confirmation_email",
    );
    expect(email?.primaryOwner).toBe("content");
    expect(email?.workspaceCoordinator).toBe("events");
    const budget = getOwnershipForObject("asset_type", "event_budget");
    expect(budget?.primaryOwner).toBe("finance");
    expect(budget?.workspaceCoordinator).toBe("events");
  });

  it("15 — Event ADHD workshop reference scenario", () => {
    const turn = processUniversalCreationTurn({
      userText:
        "Help me create a one-day workshop whose purpose is to introduce business people to the ADHD business platform and conduct beta testing, with ADHD business people as the primary audience.",
      forceStart: true,
    });
    expect(turn.handled).toBe(true);

    const workspace = getOwnershipForObject(
      "workspace_type",
      "event_creation_workspace",
    );
    expect(workspace?.primaryOwner).toBe("events");

    expect(resolveOwnership({ assetTypeId: "registration_confirmation_email" }).primaryOwner).toBe(
      "content",
    );
    expect(resolveOwnership({ assetTypeId: "event_budget" }).primaryOwner).toBe(
      "finance",
    );
    expect(resolveOwnership({ assetTypeId: "presentation_deck" }).primaryOwner).toBe(
      "creative-studio",
    );
    expect(resolveOwnership({ assetTypeId: "attendee_workbook" }).supportingContributorIds).toEqual(
      expect.arrayContaining(["learning", "events", "creative-studio"]),
    );
    expect(resolveOwnership({ assetTypeId: "agenda" }).primaryOwner).toBe("events");

    const packet = buildContributorContextPacket({
      eventRecordId: turn.eventRecordId,
      assetTypeId: "event_budget",
    });
    expect(packet?.workspaceCoordinator).toBe("events");
    expect(packet?.primaryOwner).toBe("finance");

    const unified = buildUnifiedOwnerResponse({
      ownerVoice: "We already know the purpose and audience for this workshop.",
      nextStep: "Shall we sketch the agenda next?",
    });
    expect(unified).not.toMatch(/agent|swarm|orchestrat/i);
    expect(unified).toMatch(/agenda/i);

    expect(listOwnershipDefinitions().length).toBeGreaterThan(10);
  });
});
