/**
 * 045 Platform Intent Routing + 046 Blueprint Registry
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  classifyPlatformIntent,
  looksLikeKnowledgeQuestion,
  resolveBlueprintFromText,
  resolvePlatformIntentRoute,
  listCreateBlueprints,
} from "./index";

describe("045 Platform Intent Routing", () => {
  it("KNOW — knowledge about retreat stays in conversation (no Create)", () => {
    const text = "What should I consider when planning a retreat?";
    expect(looksLikeKnowledgeQuestion(text)).toBe(true);
    const c = classifyPlatformIntent(text);
    expect(c.intent).toBe("know");
    const route = resolvePlatformIntentRoute({ userText: text });
    expect(route.action).toBe("stay_conversation");
    expect(route.blueprint).toBeNull();
    expect(route.autoProjectHome).toBe(false);
  });

  it("KNOW — marketing advice stays in Marketing", () => {
    const text = "What is the best way to market a membership?";
    const route = resolvePlatformIntentRoute({
      userText: text,
      activeChamberMemberId: "marketing",
    });
    expect(route.intent).toBe("know");
    expect(route.action).toBe("stay_conversation");
  });

  it("CREATE — retreat launches Events Retreat blueprint", () => {
    const text = "I want to plan a retreat.";
    const c = classifyPlatformIntent(text);
    expect(c.intent).toBe("create");
    expect(c.blueprint?.id).toBe("bp-retreat-event");
    expect(c.blueprint?.specialtyRuntime).toBe("events");
    const route = resolvePlatformIntentRoute({ userText: text });
    expect(route.action).toBe("launch_create");
    expect(route.autoProjectHome).toBe(true);
    expect(route.ownerChamberMemberId).toBe("events");
  });

  it("CREATE — retreat weekend event (Events Intelligence path)", () => {
    const text = "I need help creating a retreat weekend event.";
    const route = resolvePlatformIntentRoute({ userText: text });
    expect(route.intent).toBe("create");
    expect(route.action).toBe("launch_create");
    expect(route.blueprint?.catalogType).toBe("Event Plan");
    expect(route.blueprint?.specialtyRuntime).toBe("events");
  });

  it("CREATE — launch plan opens Marketing doorway", () => {
    const text = "I want to create a launch plan.";
    const route = resolvePlatformIntentRoute({ userText: text });
    expect(route.action).toBe("launch_create");
    expect(route.blueprint?.ownerChamberMemberId).toBe("marketing");
    expect(route.blueprint?.catalogType).toBe("Launch Plan");
  });

  it("CREATE — ebook opens Content book blueprint", () => {
    const text = "I want to write an ebook.";
    const route = resolvePlatformIntentRoute({ userText: text });
    expect(route.action).toBe("launch_create");
    expect(route.blueprint?.ownerChamberMemberId).toBe("content");
  });

  it("DECIDE — stays in conversation; Board optional", () => {
    const route = resolvePlatformIntentRoute({
      userText: "Should I launch everything at once or phase it?",
    });
    expect(route.intent).toBe("decide");
    expect(route.action).toBe("offer_board");
  });

  it("IMPROVE — resume create path", () => {
    const route = resolvePlatformIntentRoute({
      userText: "Improve this proposal for my client.",
      hasActiveCreation: true,
    });
    expect(route.intent).toBe("improve");
    expect(route.action).toBe("resume_create");
  });

  it("CONTINUE — resume without duplicate", () => {
    const route = resolvePlatformIntentRoute({
      userText: "Continue my workshop plan.",
      hasActiveCreation: true,
    });
    expect(route.intent).toBe("continue");
    expect(route.action).toBe("resume_create");
  });

  it("help figure out — does not force a blueprint", () => {
    const route = resolvePlatformIntentRoute({
      userText: "I need help figuring out what I should create.",
    });
    expect(route.action).toBe("help_figure_out");
    expect(route.blueprint).toBeNull();
  });
});

describe("046 Blueprint Registry", () => {
  it("every blueprint has one owner rule fields", () => {
    for (const bp of listCreateBlueprints()) {
      expect(bp.id).toBeTruthy();
      expect(bp.catalogType).toBeTruthy();
      expect(bp.purpose).toBeTruthy();
      expect(bp.expectedOutcome).toBeTruthy();
      expect(bp.projectIntegration).toBeTruthy();
      expect(bp.visibleThinking).toBeTruthy();
    }
  });

  it("aliases resolve to a single owner — retreat weekend → retreat event", () => {
    const bp = resolveBlueprintFromText("retreat weekend event");
    expect(bp?.id).toBe("bp-retreat-event");
    expect(bp?.ownerChamberMemberId).toBe("events");
  });

  it("product launch event → Event Plan (not Marketing Launch Plan)", () => {
    const gathering = resolveBlueprintFromText(
      "I want to plan a product launch event",
    );
    expect(gathering?.id).toBe("bp-event-plan");
    expect(gathering?.specialtyRuntime).toBe("events");
    expect(gathering?.catalogType).toBe("Event Plan");

    const gtm = resolveBlueprintFromText(
      "I want to create a launch plan for my product",
    );
    expect(gtm?.id).toBe("bp-launch-plan");
    expect(gtm?.specialtyRuntime).toBeFalsy();
  });

  it("standards docs exist", () => {
    for (const path of [
      "docs/create-experience/standards/045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md",
      "docs/create-experience/standards/046_CREATE_BLUEPRINT_STANDARD.md",
    ]) {
      const body = readFileSync(resolve(process.cwd(), path), "utf8");
      expect(body.length).toBeGreaterThan(200);
    }
  });

  it("CPC wires platform intent before Create launches", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("resolvePlatformIntentRoute");
    expect(client).toContain("045 — Platform Intent Routing");
    const blockStart = client.indexOf("045 — Platform Intent Routing");
    const block = client.slice(blockStart, blockStart + 2500);
    expect(block).toContain("resolvePlatformIntentRoute");
    expect(block).toContain("shouldRouteToEventsIntelligence");
    expect(block.indexOf("resolvePlatformIntentRoute")).toBeLessThan(
      block.indexOf("shouldRouteToEventsIntelligence"),
    );
  });
});
