/**
 * @vitest-environment node
 * Artifact-Intent Disambiguation — centralized policy shared by artifactRegistry
 * and the universalCreation plugin loop.
 */
import { describe, expect, it } from "vitest";
import {
  detectRegistryArtifact,
  isRegistryArtifactExecution,
} from "./artifactRegistry";
import { detectUniversalDocumentType } from "./universalCreation/orchestrator";
import { isSimpleCreateRequest } from "./universalCreation/createFastPath";
import { shouldUseEmotionalFirstSequence } from "./conversation/emotionalFirstResponseSequence";
import { artifactTermExpressesCreation } from "./artifactIntent";

const exec = isRegistryArtifactExecution;

describe("A — verb-collision terms require an explicit creation verb", () => {
  it("ordinary verb usage is NOT execution", () => {
    for (const t of [
      "I need to email the accountant.",
      "I have to email my client back.",
      "Help me email the vendor.",
      "I want to offer them a discount.",
      "I need to offer a refund.",
      "I need to copy the files.",
    ]) {
      expect(exec(t)).toBe(false);
    }
  });

  it("explicit creation (verbs + participles) IS execution", () => {
    for (const t of [
      "Create an email to the accountant.",
      "Write an email to the accountant.",
      "Draft an email to the accountant.",
      "Compose an email to the accountant.",
      "I need an email drafted for the accountant.",
      "Create an offer for this service.",
      "Write sales copy for this page.",
    ]) {
      expect(exec(t)).toBe(true);
    }
  });
});

describe("B — receive-noun terms keep shorthand but exclude receive language", () => {
  it("natural creation shorthand IS execution", () => {
    for (const t of [
      "I need a proposal.",
      "Help me with a checklist.",
      "I need a proposal written.",
      "Create a checklist.",
    ]) {
      expect(exec(t)).toBe(true);
    }
  });

  it("clear receive/request-from-someone is NOT execution", () => {
    for (const t of [
      "I need a proposal from the vendor.",
      "I'm waiting for a proposal from the vendor.",
      "I need a checklist from my assistant.",
      "Ask my assistant for the checklist.",
    ]) {
      expect(exec(t)).toBe(false);
    }
  });

  it("'from scratch' is a creation idiom, not receive", () => {
    expect(exec("I need a proposal from scratch.")).toBe(true);
  });
});

describe("C — mention-only universal-creation terms need a creation signal", () => {
  const mentionOnly = [
    "I have a presentation tomorrow.",
    "I watched a presentation.",
    "I read an article this morning.",
    "That article was helpful.",
    "I need to fix my workflow.",
    "My workflow is confusing.",
  ];
  const genuineCreates = [
    "Create a presentation for tomorrow.",
    "Help me build a presentation.",
    "Write an article about ADHD entrepreneurship.",
    "Draft a proposal.",
    "Create a checklist.",
  ];

  it("mention-only does NOT enter universal creation", () => {
    for (const t of mentionOnly) {
      expect(detectUniversalDocumentType(t)).toBeNull();
    }
  });

  it("genuine creation DOES enter universal creation", () => {
    for (const t of genuineCreates) {
      expect(detectUniversalDocumentType(t)).not.toBeNull();
    }
  });

  it("caption keeps its natural shorthand (create)", () => {
    expect(exec("I need a caption for this photo.")).toBe(true);
    expect(detectUniversalDocumentType("I need a caption for this photo.")).not.toBeNull();
  });
});

describe("D — unambiguous deliverables keep bare need-verb shorthand", () => {
  it("still execution", () => {
    for (const t of [
      "I need a marketing plan.",
      "Help me build a landing page.",
      "I need a lead magnet.",
      "I need an SOP.",
      "I need a funnel.",
      "I need a sales page.",
    ]) {
      expect(exec(t)).toBe(true);
    }
  });
});

describe("8/9 — primary distress message", () => {
  const primary =
    "I'm overwhelmed. I need to email the accountant, call the venue, and pick up supplies.";

  it("is not artifact execution", () => {
    expect(exec(primary)).toBe(false);
    expect(detectUniversalDocumentType(primary)).toBeNull();
    expect(isSimpleCreateRequest(primary)).toBe(false);
  });

  it("no longer suppresses emotional-first because of false Create intent", () => {
    expect(shouldUseEmotionalFirstSequence(primary)).toBe(true);
  });

  it("provides no Create signal an active owner could seize on 'email' as a verb", () => {
    // The three create-detection surfaces all return non-create, so any routing
    // into Create with an active owner cannot be attributed to email-as-verb.
    expect(exec(primary)).toBe(false);
    expect(detectUniversalDocumentType(primary)).toBeNull();
    expect(isSimpleCreateRequest(primary)).toBe(false);
  });
});

describe("policy unit + detectRegistryArtifact stability", () => {
  it("classifies per the four classes", () => {
    expect(
      artifactTermExpressesCreation({ text: "I need to email X", collisionClass: "verb_collision" }),
    ).toBe(false);
    expect(
      artifactTermExpressesCreation({ text: "draft an email", collisionClass: "verb_collision" }),
    ).toBe(true);
    expect(
      artifactTermExpressesCreation({ text: "a proposal from the vendor", collisionClass: "receive_noun" }),
    ).toBe(false);
    expect(
      artifactTermExpressesCreation({ text: "I need a proposal", collisionClass: "receive_noun" }),
    ).toBe(true);
    expect(
      artifactTermExpressesCreation({ text: "I need a landing page", collisionClass: "unambiguous_deliverable" }),
    ).toBe(true);
  });

  it("detectRegistryArtifact still returns the same kinds", () => {
    expect(detectRegistryArtifact("write an email")).toBe("email");
    expect(detectRegistryArtifact("I need a newsletter")).toBe("content");
    expect(detectRegistryArtifact("draft a proposal")).toBe("proposal");
    expect(detectRegistryArtifact("build a marketing plan")).toBe("marketing_plan");
  });
});
