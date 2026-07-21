/**
 * CREATE fast path — document creation only.
 * Sprint 2: Workshop / Webinar are Event Platform (045–065), not documents.
 * Create Foundation types (Checklist, SOP, Newsletter, …) leave frictionless
 * without UC discovery — CompanionPageClient owns the handoff.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { evaluateSparkDecisionEngine } from "@/lib/sparkCompanion";
import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEngine";
import { resolveCreateFoundationClassification } from "@/lib/creationIdentity/createFoundationRouting";
import { isEventDomainCreationRequest } from "@/lib/universalCreationPlatform";
import { isMarketingPlanCreationRequest } from "@/lib/universalWorkEngine/packages/marketingPlan/isMarketingPlanCreationRequest";
import {
  detectUniversalDocumentType,
  shouldEnterUniversalCreation,
  clearUniversalCreationSession,
  loadUniversalCreationSession,
} from "@/lib/universalCreation";
import {
  isSimpleCreateRequest,
  logCreateFastPath,
} from "@/lib/universalCreation/createFastPath";
import { resolveCreateFastPathAction } from "@/lib/frictionlessActionLayer";

/** Still use UC pre-workspace discovery interviews. */
const UC_DISCOVERY_PHRASES = [
  "Write an email",
  "Create a social media campaign",
] as const;

/** 105 — Marketing Plan Work Type resolves through UWE, not document UC. */
const MARKETING_PLAN_UWE_PHRASES = [
  "Create a marketing plan",
  "Help me build a marketing plan",
  "Help me create a simple marketing plan",
] as const;

/** Create Foundation — frictionless must not open UC discovery. */
const CREATE_FOUNDATION_PHRASES = [
  "Help me create an SOP",
  "Write an SOP",
  "Create a newsletter",
  "Create a proposal",
  "Client Onboarding Checklist",
  "create a client onboarding checklist",
] as const;

const EVENT_PHRASES = [
  "Help me write a workshop",
  "Build a webinar",
  "Help me write a new workshop.",
  "I'd like to plan a workshop.",
  "Plan a conference",
] as const;

describe("CREATE fast path — documents only (Sprint 2)", () => {
  beforeEach(() => {
    clearUniversalCreationSession();
  });

  it.each(UC_DISCOVERY_PHRASES)("%s — detects simple document create", (text) => {
    expect(isSimpleCreateRequest(text)).toBe(true);
    expect(detectUniversalDocumentType(text)).toBeTruthy();
    expect(shouldEnterUniversalCreation(text)).toBe(true);
  });

  it.each(EVENT_PHRASES)("%s — never enters document CREATE_FAST_PATH", (text) => {
    expect(isEventDomainCreationRequest(text)).toBe(true);
    expect(isSimpleCreateRequest(text)).toBe(false);
    expect(detectUniversalDocumentType(text)).toBeNull();
    expect(shouldEnterUniversalCreation(text)).toBe(false);
    const primary = classifyPrimaryConversationTurn({ userText: text });
    const blocked = resolveCreateFastPathAction(
      {
        userText: text,
        primaryTurn: primary,
        currentTurn: 1,
      },
      {} as never,
    );
    expect(blocked).toBeNull();
  });

  it.each(MARKETING_PLAN_UWE_PHRASES)(
    "%s — Marketing Plan UWE path (not document UC)",
    (text) => {
      expect(isMarketingPlanCreationRequest(text)).toBe(true);
      expect(isSimpleCreateRequest(text)).toBe(false);
      expect(detectUniversalDocumentType(text)).toBeNull();
      expect(shouldEnterUniversalCreation(text)).toBe(false);
    },
  );

  it.each(UC_DISCOVERY_PHRASES)(
    "%s — frictionless UC discovery local reply",
    (text) => {
      const primary = classifyPrimaryConversationTurn({ userText: text });
      expect(primary.owner).toBe("frictionless:universal_creation");
      const decision = evaluateSparkDecisionEngine({ userText: text });
      expect(decision.intent).toBe("CREATE");
      const frictionless = resolveFrictionlessAction({
        userText: text,
        primaryTurn: primary,
        currentTurn: 1,
      });
      expect(frictionless.category).toBe("universal_creation");
      expect(frictionless.localReply).toBeTruthy();
      expect(frictionless.localReply).not.toContain(SHARI_ERROR_RECOVERY_LINE);
      expect(frictionless.immediateEstatePlaceNavigate).toBeUndefined();
    },
  );

  it.each(CREATE_FOUNDATION_PHRASES)(
    "%s — Create Foundation gate (no UC discovery in frictionless)",
    (text) => {
      expect(
        resolveCreateFoundationClassification(text).routeDirectlyToCreateFoundation,
      ).toBe(true);
      const frictionless = resolveFrictionlessAction({
        userText: text,
        currentTurn: 1,
      });
      expect(frictionless.category).not.toBe("universal_creation");
      expect(frictionless.localReply).toBeNull();
      expect(loadUniversalCreationSession()).toBeNull();
    },
  );

  it("logCreateFastPath emits CREATE_FAST_PATH tag", () => {
    const logs: unknown[] = [];
    const original = console.info;
    console.info = (...args: unknown[]) => {
      logs.push(...args);
    };
    try {
      logCreateFastPath({
        turn: 1,
        userText: "Create a newsletter",
        documentType: "newsletter",
      });
    } finally {
      console.info = original;
    }
    expect(JSON.stringify(logs)).toContain("CREATE_FAST_PATH");
  });
});
