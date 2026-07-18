/**
 * Packages 210–212 — architecture ownership + checklist governance.
 */

import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  CONVERSATION_GOVERNANCE_RULES,
  CONVERSATION_IMPLEMENTATION_CHECKLIST,
  CONVERSATION_OWNERSHIP,
  CONVERSATION_PR_REVIEW_CHECKS,
  CONVERSATION_RUNTIME_ORDER,
  CONVERSATION_RUNTIME_ORDER_LABEL,
  EXPERIENCE_WIRING,
  checklistReleaseReady,
  findDuplicateOwnershipIds,
  getGovernanceSnapshot,
} from "@/lib/conversationArchitecture";
import {
  GOLD_BUILD_CATEGORIES,
  GOLD_LIBRARY_TARGET_MIN,
  getGoldBuildProgress,
} from "@/lib/goldStandardConversationLibrary/buildPlan";

const ROOT = path.resolve(__dirname, "../..");

describe("210 — Conversation Architecture Manifest", () => {
  it("has unique responsibility ids", () => {
    expect(findDuplicateOwnershipIds()).toEqual([]);
  });

  it("declares canonical runtime order ending in response", () => {
    expect(CONVERSATION_RUNTIME_ORDER[0]).toBe("intent");
    expect(CONVERSATION_RUNTIME_ORDER.at(-1)).toBe("response");
    expect(CONVERSATION_RUNTIME_ORDER).toContain("human_conversation_validator");
    expect(CONVERSATION_RUNTIME_ORDER_LABEL).toContain("Human Conversation Validator");
  });

  it("ownership modules exist on disk", () => {
    for (const row of CONVERSATION_OWNERSHIP) {
      const abs = path.join(ROOT, row.ownerModule);
      expect(existsSync(abs), row.ownerModule).toBe(true);
    }
  });

  it("Talk It Out is fully wired; bypass list is explicit", () => {
    const tio = EXPERIENCE_WIRING.find((e) => e.experienceId === "talk-it-out");
    expect(tio?.status).toBe("wired_cie_hcv");
    const bypasses = EXPERIENCE_WIRING.filter((e) => e.status === "bypass");
    expect(bypasses.map((b) => b.experienceId)).toEqual(
      expect.arrayContaining(["general-chat", "chamber", "board"]),
    );
  });
});

describe("211 — Implementation Checklist", () => {
  it("tracks repository engine items as pass", () => {
    const repo = CONVERSATION_IMPLEMENTATION_CHECKLIST.filter(
      (i) => i.section === "repository",
    );
    expect(repo.every((i) => i.status === "pass")).toBe(true);
  });

  it("is not release-ready while experiences bypass CIE", () => {
    expect(checklistReleaseReady()).toBe(false);
    const snap = getGovernanceSnapshot();
    expect(snap.releaseReady).toBe(false);
    expect(snap.bypassingExperiences.length).toBeGreaterThan(0);
  });
});

describe("212 — Governance", () => {
  it("publishes non-empty rules and PR review checks", () => {
    expect(CONVERSATION_GOVERNANCE_RULES.length).toBeGreaterThanOrEqual(6);
    expect(CONVERSATION_PR_REVIEW_CHECKS.map((c) => c.id)).toEqual(
      expect.arrayContaining([
        "architecture",
        "validator",
        "shari-voice",
        "regression",
      ]),
    );
  });
});

describe("213 — Gold Standard build plan", () => {
  it("defines initial categories and tracks progress toward 300+", () => {
    expect(GOLD_BUILD_CATEGORIES.length).toBeGreaterThanOrEqual(16);
    const progress = getGoldBuildProgress();
    expect(progress.totalConversations).toBeGreaterThan(0);
    expect(progress.certifiedCount).toBeGreaterThan(0);
    expect(progress.targetMin).toBe(GOLD_LIBRARY_TARGET_MIN);
    expect(progress.percentOfMin).toBeLessThan(100);
  });
});

describe("214 — Platform Implementation Roadmap", () => {
  it("marks CIE stabilize complete and blocks production", async () => {
    const {
      getPlatformRoadmapSnapshot,
      getNextPlatformPriority,
      EXPERIENCE_TRACK_DIMENSIONS,
      isExperienceProductionReady,
    } = await import("@/lib/conversationArchitecture/platformRoadmap");
    const snap = getPlatformRoadmapSnapshot();
    expect(snap.cieStabilized).toBe(true);
    expect(snap.productionReady).toBe(false);
    expect(snap.priorities).toHaveLength(10);
    expect(getNextPlatformPriority()?.id).toBe("welcome-home");
    expect(EXPERIENCE_TRACK_DIMENSIONS).toHaveLength(10);
    expect(isExperienceProductionReady("talk-it-out")).toBe(false);
  });
});

describe("215 — Master Feature Registry", () => {
  it("covers all primary categories and blocks unregistered production", async () => {
    const {
      MASTER_FEATURE_CATEGORIES,
      MASTER_FEATURE_REGISTRY,
      assertRegisteredForProduction,
      getMasterFeature,
      getMasterFeatureRegistrySnapshot,
      meetsDefinitionOfComplete,
    } = await import("@/lib/conversationArchitecture/masterFeatureRegistry");

    expect(MASTER_FEATURE_CATEGORIES.length).toBe(17);
    expect(MASTER_FEATURE_REGISTRY.length).toBeGreaterThanOrEqual(30);

    const ids = new Set(MASTER_FEATURE_REGISTRY.map((r) => r.id));
    expect(ids.has("talk-it-out")).toBe(true);
    expect(ids.has("welcome-home")).toBe(true);
    expect(ids.has("chamber")).toBe(true);
    expect(ids.has("board")).toBe(true);
    expect(ids.has("shared-cie")).toBe(true);

    const tio = getMasterFeature("talk-it-out");
    expect(tio?.cieIntegration).toBe("complete");
    expect(meetsDefinitionOfComplete(tio!)).toBe(false);

    expect(assertRegisteredForProduction("not-a-real-feature").ok).toBe(false);
    expect(assertRegisteredForProduction("talk-it-out").ok).toBe(false);

    const snap = getMasterFeatureRegistrySnapshot();
    expect(snap.productionReady).toBe(0);
    expect(snap.cieComplete).toBeGreaterThanOrEqual(3);
  });
});
