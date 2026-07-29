/**
 * Conversation Failure Audit — bounded fix #1.
 * Create must only open for a real deliverable / known capability; ordinary
 * "make/create/build" talk and Create rejections must not route to Create.
 * Covers every classifier layer, not just one helper.
 */
import { describe, expect, it } from "vitest";

import {
  isExplicitCreationRequest,
  shouldAutoOpenWorkspaceBeforeChat,
} from "./messageClassification";
import {
  classifyCompanionIntentBucket,
  shouldOpenCreateWorkspace,
  CREATE_INTENT_BUCKETS,
} from "./companionIntentRouting";
import { hasCreateIntent } from "./intentStabilizer";
import { understandUniversalRequest } from "./universalRequestOutcome/understandRequest";
import {
  isCreateRejection,
  mentionsCreateDeliverable,
} from "./createIntentVocabulary";

const NEGATIVE = [
  "what should I make for dinner",
  "help me make dinner for four",
  "if I make the creamy mushroom pasta, how long will it take",
  "give me the calorie count and nutrient information",
  "help me make a decision",
  "make this easier to understand",
  "make this simpler",
  "make sense of this",
  "make a decision",
  "make progress on my goals",
  "I don't need the Create room",
  "don't open Create",
  "stop taking me to Create",
  "just answer me here",
  "stay here",
];

const POSITIVE = [
  "draft an email to my client",
  "write me a cancellation letter",
  "create a business proposal",
  "turn this into a checklist",
  "make me an SOP",
  "build a presentation",
  "save this as a document",
  "write the LinkedIn post", // known-supported create phrasing
];

describe("Create tightening — negative cases stay in conversation", () => {
  it.each(NEGATIVE)("does not treat %o as an explicit creation request", (text) => {
    expect(isExplicitCreationRequest(text)).toBe(false);
  });

  it.each(NEGATIVE)("does not choose a Create intent bucket for %o", (text) => {
    expect(CREATE_INTENT_BUCKETS.has(classifyCompanionIntentBucket(text))).toBe(
      false,
    );
  });

  it.each(NEGATIVE)("does not open the Create workspace for %o", (text) => {
    expect(shouldOpenCreateWorkspace(text)).toBe(false);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
  });

  it.each(NEGATIVE)("does not flag pre-routing create intent for %o", (text) => {
    expect(hasCreateIntent(text)).toBe(false);
  });

  it.each(NEGATIVE)("universal understanding does not mark %o as create", (text) => {
    expect(understandUniversalRequest(text).primaryIntent).not.toBe("create");
  });
  // Note: createOpenAuthority.createOpenBypassesConsent inherits this fix through
  // isExplicitCreationRequest (its text-based bypass), which is asserted false
  // above; it is a request/context predicate, not a bare-text predicate.
});

describe("Create tightening — rejection never counts as create", () => {
  const REJECTIONS = [
    "I don't need the Create room",
    "I don't need Create",
    "don't open Create",
    "stop taking me to Create",
    "just answer me here",
    "stay in the conversation",
  ];
  it.each(REJECTIONS)("classifies %o as a Create rejection", (text) => {
    expect(isCreateRejection(text)).toBe(true);
  });
  it.each(REJECTIONS)("does not retrigger Create from the rejection %o", (text) => {
    expect(isExplicitCreationRequest(text)).toBe(false);
    expect(hasCreateIntent(text)).toBe(false);
    expect(understandUniversalRequest(text).primaryIntent).not.toBe("create");
  });
});

describe("Create tightening — genuine deliverable requests still route", () => {
  it.each(POSITIVE)("treats %o as an explicit creation request", (text) => {
    expect(isExplicitCreationRequest(text)).toBe(true);
  });

  it.each(POSITIVE)("opens the Create workspace for %o", (text) => {
    expect(shouldOpenCreateWorkspace(text)).toBe(true);
  });

  it("routes a known Create catalog request (Facebook post) to Create", () => {
    const text = "Create a Facebook post about ADHD procrastination.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(classifyCompanionIntentBucket(text)).toBe("content_creation");
    expect(shouldOpenCreateWorkspace(text)).toBe(true);
  });
});

describe("Create tightening — audit live-check conversations", () => {
  const stayInConversation = [
    "I need an idea of what to make for dinner for a family of four.",
    "If I make the creamy mushroom pasta, how long will it take and what is the estimated nutrition per serving?",
    "I don't need the Create room. You already gave me the idea.",
  ];
  it.each(stayInConversation)("stays in conversation: %o", (text) => {
    expect(isExplicitCreationRequest(text)).toBe(false);
    expect(hasCreateIntent(text)).toBe(false);
    expect(shouldOpenCreateWorkspace(text)).toBe(false);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(understandUniversalRequest(text).primaryIntent).not.toBe("create");
  });

  it("still opens Create for an explicit email draft", () => {
    const text = "Draft an email telling my client I need to reschedule.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(shouldOpenCreateWorkspace(text)).toBe(true);
    expect(hasCreateIntent(text)).toBe(true);
  });
});

describe("Create vocabulary helpers", () => {
  it("recognizes concrete deliverables", () => {
    for (const d of ["email", "letter", "proposal", "checklist", "SOP", "presentation", "document"]) {
      expect(mentionsCreateDeliverable(`make me a ${d}`)).toBe(true);
    }
  });
  it("does not treat ordinary objects as deliverables", () => {
    for (const o of ["dinner", "pasta", "decision", "progress", "choice", "sense"]) {
      expect(mentionsCreateDeliverable(`make ${o}`)).toBe(false);
    }
  });
});
