/**
 * @vitest-environment jsdom
 * Sprint 2 — One Creation Platform gates
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { detectUniversalDocumentType } from "@/lib/universalCreation";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import { resolveAssetRoute } from "@/lib/workspaceAssetRouting";
import {
  ONE_CREATION_PLATFORM_RULE,
  isEventDomainCatalogType,
  isEventDomainCreationRequest,
} from "./oneCreationPlatform";

describe("Sprint 2 — One Creation Platform", () => {
  it("publishes the permanent rule", () => {
    expect(ONE_CREATION_PLATFORM_RULE).toMatch(/one Creation Platform/i);
    expect(ONE_CREATION_PLATFORM_RULE).toMatch(/045/);
  });

  it("classifies Event domain language", () => {
    expect(isEventDomainCreationRequest("I'd like to plan a workshop")).toBe(
      true,
    );
    expect(isEventDomainCreationRequest("Build a webinar")).toBe(true);
    expect(isEventDomainCreationRequest("Write an email")).toBe(false);
    expect(
      isEventDomainCreationRequest("I want to create a launch plan"),
    ).toBe(false);
  });

  it("document fast-path refuses Event domain", () => {
    expect(isSimpleCreateRequest("Help me write a workshop")).toBe(false);
    expect(detectUniversalDocumentType("Help me write a workshop")).toBeNull();
    expect(detectUniversalDocumentType("Build a webinar")).toBeNull();
  });

  it("asset route sends Workshop to Universal Creation, not Projects", () => {
    const route = resolveAssetRoute("workshop");
    expect(route?.useUniversalCreation).toBe(true);
    expect(route?.bootstrapProjects).toBeFalsy();
    expect(route?.section).not.toBe("projects");
    expect(isEventDomainCatalogType("Workshop")).toBe(true);
  });

  it("CPC gates CREATE_FAST_PATH and wires continuity + Search", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("isEventDomainCreationRequest");
    expect(client).toContain("!isEventDomainCreationRequest(trimmed)");
    expect(client).toContain("openUniversalCreationFromText");
    expect(client).toContain("enterCreationFromSearch");
    expect(client).toContain("readCreationContinuityHint");
    expect(client).toContain("buildWelcomeBackBridge");
    expect(client).toContain("onRestoreContinuity");
    expect(client).toContain("useUniversalCreation");
  });
});
