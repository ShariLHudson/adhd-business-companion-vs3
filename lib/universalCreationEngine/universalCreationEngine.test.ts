/**
 * @vitest-environment jsdom
 * 051 — Universal Creation Engine Phase 1
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clearRelationshipRegistryForTests } from "@/lib/creationEcosystem";
import { clearActiveEventRecord, listEventRecords } from "@/lib/eventsIntelligence";
import { buildEventCreationWorkspace } from "@/lib/eventCreationWorkspace";
import {
  certifyUniversalCreationResult,
  processUniversalCreationTurn,
  resolveResumeState,
  resolveUniversalCreationIntent,
  coordinateAssetCreation,
  evaluateChangeImpact,
} from "./index";

describe("051 Universal Creation Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveEventRecord();
    clearRelationshipRegistryForTests();
  });

  it("standard document exists", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/051_UNIVERSAL_CREATION_ENGINE_STANDARD.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/One engine\. Many blueprints/i);
    expect(body).toMatch(/Phase 1/i);
    expect(body).toMatch(/045/);
  });

  it("1 — clear creation requests resolve correctly", () => {
    const result = processUniversalCreationTurn({
      userText: "Help me create a one-day workshop event.",
      forceStart: true,
    });
    expect(result.handled).toBe(true);
    expect(result.intent === "create" || result.intent === "plan").toBe(true);
    expect(result.eventRecordId).toBeTruthy();
    expect(result.context?.blueprintId).toBeTruthy();
    expect(result.kind).toBe("start");
  });

  it("2 — knowledge questions do not open Create", () => {
    const intent = resolveUniversalCreationIntent(
      "What should I consider when planning a workshop?",
    );
    expect(intent.intent).toBe("know");
    expect(intent.stayInConversation).toBe(true);

    const result = processUniversalCreationTurn({
      userText: "What should I consider when planning a workshop?",
    });
    expect(result.handled).toBe(false);
    expect(result.kind).toBe("noop");
    expect(result.eventRecordId).toBeNull();
    expect(listEventRecords().length).toBe(0);
  });

  it("3 + 17 — existing work resumes and return state restores", () => {
    const start = processUniversalCreationTurn({
      userText: "Help me create a workshop for ADHD business people.",
      forceStart: true,
    });
    expect(start.eventRecordId).toBeTruthy();
    const id = start.eventRecordId!;

    const cont = processUniversalCreationTurn({
      userText: "Continue my workshop plan",
    });
    expect(cont.resolution.resume || cont.handled).toBe(true);
    expect(cont.eventRecordId).toBe(id);

    const resumed = resolveResumeState({ eventRecordId: id });
    expect(resumed.resumed).toBe(true);
    expect(resumed.context?.creationRecordId).toBeTruthy();
    expect(resumed.workspaceId).toBe(id);
  });

  it("4 — duplicate workspaces are prevented", () => {
    const first = processUniversalCreationTurn({
      userText:
        "Help me create a one-day workshop. Purpose is beta testing the ADHD platform with business people.",
      forceStart: true,
    });
    expect(first.record?.purpose.trim() || first.context?.purpose).toBeTruthy();

    const second = processUniversalCreationTurn({
      userText: "Help me create another workshop event for planning.",
    });
    expect(second.resolution.isDuplicateAttempt || second.eventRecordId === first.eventRecordId).toBe(
      true,
    );
    expect(listEventRecords().filter((r) => r.runtimeState !== "CANCELED").length).toBeLessThanOrEqual(
      2,
    );
  });

  it("6 + 7 — one Creation Record; context includes known facts and do-not-reask", () => {
    const result = processUniversalCreationTurn({
      userText:
        "Help me create a one-day workshop whose purpose is to introduce business people to the ADHD business platform and conduct beta testing, with ADHD business people as the primary audience and interested non-ADHD business people as a secondary audience.",
      forceStart: true,
    });
    expect(result.handled).toBe(true);
    expect(result.context).toBeTruthy();
    expect(result.context!.creationRecordId).toBeTruthy();
    expect(result.context!.knownFacts.length).toBeGreaterThan(0);
    expect(result.context!.doNotReaskFields).toEqual(
      expect.arrayContaining(["purpose", "audience"]),
    );
    expect(result.record?.purpose.toLowerCase()).toMatch(/adhd|beta|platform/);
    expect(result.record?.audience.toLowerCase()).toMatch(/adhd/);
  });

  it("8 — next steps adapt to context", () => {
    const result = processUniversalCreationTurn({
      userText:
        "Plan a workshop to introduce the ADHD business platform and beta test with ADHD business people.",
      forceStart: true,
    });
    expect(result.nextStep).toBeTruthy();
    expect(result.nextStep!.doNotReask.length).toBeGreaterThan(0);
    // Should not ask purpose again when known
    if (result.nextStep!.sectionId) {
      expect(result.nextStep!.sectionId).not.toBe("purpose");
    }
  });

  it("5 + 9 + 10 — asset creation connects, no duplicate, ownership resolves", () => {
    const start = processUniversalCreationTurn({
      userText: "Help me create a workshop event.",
      forceStart: true,
    });
    const record = start.record!;
    const first = coordinateAssetCreation({
      assetTypeId: "agenda",
      record,
    });
    expect(first.reasons.includes("unknown_asset_type")).toBe(false);
    expect(first.owner).toBeTruthy();
    expect(first.instance?.eventRecordId).toBe(record.id);
    expect(first.instance?.creationWorkspaceId).toBeTruthy();

    const again = coordinateAssetCreation({
      assetTypeId: "agenda",
      record,
    });
    // Instance registry returns the same connected instance — never a second orphan
    expect(again.instance?.instanceId).toBe(first.instance?.instanceId);
    expect(again.skippedDuplicate || again.created === false || again.instance).toBeTruthy();
  });

  it("14 — change-impact rules identify affected assets", () => {
    const start = processUniversalCreationTurn({
      userText: "Help me create a conference event.",
      forceStart: true,
    });
    const impact = evaluateChangeImpact({
      creationId: start.context!.creationRecordId,
      changedField: "audience",
    });
    expect(impact.explanation).toMatch(/Audience changes/i);
    expect(impact.reviewRequired).toBe(true);
  });

  it("19 — Event reference scenario end to end (Phase 1)", () => {
    const result = processUniversalCreationTurn({
      userText:
        "Help me create a one-day workshop whose purpose is to introduce business people to the ADHD business platform and conduct beta testing, with ADHD business people as the primary audience and interested non-ADHD business people as a secondary audience.",
      forceStart: true,
    });

    expect(result.handled).toBe(true);
    expect(result.record).toBeTruthy();
    expect(result.context?.doNotReaskFields).toEqual(
      expect.arrayContaining(["purpose", "audience"]),
    );

    const snap = buildEventCreationWorkspace(result.record!);
    expect(snap.workspaceLabel.toLowerCase()).toMatch(/workshop|event/);
    expect(snap.focusSectionIds.length).toBeGreaterThan(0);
    expect(snap.focusedAssetRecommendations.length).toBeGreaterThan(0);
    expect(snap.focusedAssetRecommendations.length).toBeLessThanOrEqual(12);
    expect(result.conversationSafe).toBe(true);

    const cert = certifyUniversalCreationResult(result);
    expect(cert.passed).toBe(true);
  });

  it("20 — second blueprint can resolve through shared engine (not Event-only)", () => {
    const intent = resolveUniversalCreationIntent(
      "Help me create a launch plan for my product",
    );
    expect(intent.blueprint?.id).toBe("bp-launch-plan");
    expect(intent.blueprint?.specialtyRuntime).not.toBe("events");
    // Engine does not force Events for non-event blueprints
    const turn = processUniversalCreationTurn({
      userText: "Help me create a launch plan for my product",
    });
    expect(turn.kind).toBe("noop");
    expect(turn.handled).toBe(false);
  });
});
