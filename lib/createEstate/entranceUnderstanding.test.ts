/**
 * Chat-First Reasoning Phase 1 — entrance understanding conversation.
 *
 * Acceptance contract: docs/create-experience/UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md
 * — AT-1.1 (understand before classification), AT-1.2 (why it matters),
 * AT-1.3 (sufficient context skips ceremony), AT-B6 (reflect before moving
 * forward), AT-B8 (entrance answers never re-asked after open), AT-6.1
 * (never returns open — 130 gate intact), AT-6.4 (member wording preserved).
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  advanceEntranceUnderstanding,
  armEntranceUnderstandingHandoff,
  clearEntranceUnderstandingHandoff,
  consumeEntranceUnderstandingHandoff,
  entranceAcknowledgmentFor,
  resetEntranceUnderstandingForTests,
  startEntranceUnderstanding,
  startGuidedEntranceUnderstanding,
  type EntranceUnderstandingStep,
} from "./entranceUnderstanding";
import { defaultTemplateFor } from "@/lib/createTemplates";
import { resolveCanonicalCurrentFocus } from "@/lib/currentFocus/resolveCanonicalFocus";
import {
  applyDiscoveryAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
  getRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";

function answerUntilClassify(
  step: EntranceUnderstandingStep,
  reply: string,
  max = 6,
): EntranceUnderstandingStep {
  let current = step;
  for (let i = 0; i < max && current.kind === "question"; i++) {
    current = advanceEntranceUnderstanding(current.session, reply);
  }
  return current;
}

beforeEach(() => {
  resetEntranceUnderstandingForTests();
  clearRuntimeCreationRecordsForTests();
});

describe("understanding before classification (AT-1.1)", () => {
  it("a typed request gets a question, not a Build Type", () => {
    const step = startEntranceUnderstanding("I need a newsletter");
    expect(step?.kind).toBe("question");
    if (step?.kind !== "question") return;
    expect(step.intro).toBeTruthy();
    expect(step.question.id).toBe("create-outcome");
  });

  it("asks why it matters (AT-1.2) in Rule 2 order", () => {
    let step = startEntranceUnderstanding("I need a newsletter");
    step = advanceEntranceUnderstanding(step!.session, "Readers feel close");
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("create-why");
    // Rule 4 — the previous answer was reflected before this question.
    expect(step.acknowledgment).toBe(entranceAcknowledgmentFor("create-outcome"));
  });

  it("empty text returns null so callers keep today's empty-clarify", () => {
    expect(startEntranceUnderstanding("")).toBeNull();
    expect(startEntranceUnderstanding("   ")).toBeNull();
  });
});

describe("sufficient context skips ceremony (AT-1.3)", () => {
  it("a fully-formed request classifies without questions", () => {
    const step = startEntranceUnderstanding(
      "I need a newsletter for my clients because they keep asking, so that they feel close between sessions",
    );
    expect(step?.kind).toBe("classify");
  });
});

describe("classification and the 130 gate (AT-6.1 / AT-6.4)", () => {
  it("completes to the classifier's confirm — never open — with member wording preserved", () => {
    const original = "I need a newsletter";
    const done = answerUntilClassify(
      startEntranceUnderstanding(original)!,
      "so my clients feel close",
    );
    expect(done.kind).toBe("classify");
    if (done.kind !== "classify") return;
    expect(done.outcome.kind).toBe("confirm");
    if (done.outcome.kind !== "confirm") return;
    // Identity: the member's words, never the enriched conversation blob.
    expect(done.outcome.text).toBe(original);
    expect(done.outcome.artifactType.toLowerCase()).toContain("newsletter");
  });

  it("answers can resolve a request the original wording could not", () => {
    const start = startEntranceUnderstanding(
      "I need something for onboarding people",
    )!;
    const done = answerUntilClassify(
      start,
      "a checklist my assistant follows for every new client",
    );
    expect(done.kind).toBe("classify");
    if (done.kind !== "classify") return;
    // The enriched conversation reaches a confirmable type instead of the
    // ambiguous clarify the bare request would earn.
    expect(done.outcome.kind).toBe("confirm");
  });
});

describe("SOP requests reuse the Phase 2 gate's question ids (AT-B8)", () => {
  it("uses the create_sop set, same ids the in-focus gate reads", () => {
    const step = startEntranceUnderstanding("help me create an SOP for invoicing");
    expect(step?.kind).toBe("question");
    if (step?.kind !== "question") return;
    expect(step.question.id).toBe("sop-audience-type");
  });

  it("guided goal answer that reveals an SOP hands off to the SOP set", () => {
    const start = startGuidedEntranceUnderstanding();
    expect(start.kind).toBe("question");
    if (start.kind !== "question") return;
    expect(start.question.id).toBe("create-goal");
    const next = advanceEntranceUnderstanding(
      start.session,
      "an SOP for client onboarding",
    );
    expect(next.kind).toBe("question");
    if (next.kind !== "question") return;
    expect(next.question.id).toBe("sop-audience-type");
  });
});

describe("skip support", () => {
  it("skip records the id and moves on; empty replies are skips", () => {
    let step = startEntranceUnderstanding("I need a newsletter")!;
    step = advanceEntranceUnderstanding(step.session, "", { skip: true });
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("create-why");
    expect(step.session.skippedIds).toContain("create-outcome");
    expect(step.acknowledgment).toBeNull();
  });
});

describe("Working Memory handoff (Rule 8 / AT-B8)", () => {
  it("arms answers (excluding create-goal), consumes one-shot", () => {
    const done = answerUntilClassify(
      startEntranceUnderstanding("I need a newsletter")!,
      "warm and useful",
    );
    if (done.kind !== "classify") throw new Error("expected classify");
    armEntranceUnderstandingHandoff(done.session);
    const handoff = consumeEntranceUnderstandingHandoff();
    expect(handoff).not.toBeNull();
    expect(handoff!.answers["create-outcome"]).toBe("warm and useful");
    expect(handoff!.answers["create-goal"]).toBeUndefined();
    expect(consumeEntranceUnderstandingHandoff()).toBeNull();
  });

  it("clear prevents stale answers bleeding into a later create", () => {
    const done = answerUntilClassify(
      startEntranceUnderstanding("I need a newsletter")!,
      "warm and useful",
    );
    if (done.kind !== "classify") throw new Error("expected classify");
    armEntranceUnderstandingHandoff(done.session);
    clearEntranceUnderstandingHandoff();
    expect(consumeEntranceUnderstandingHandoff()).toBeNull();
  });
});

describe("entrance answers land in Working Memory for any type", () => {
  function emailWorkflow(sessionId: string): CreateWorkflowState {
    const template = defaultTemplateFor("Email");
    return {
      sessionId,
      selectedTypeLabel: "Email",
      useTemplate: true,
      selectedTemplateId: template.id,
      templateSections: template.sections,
      sectionContent: {},
      skippedSectionIds: [],
      workspaceFirst: true,
      questionMode: "current_focus",
    } as CreateWorkflowState;
  }

  it("create-* ids write mapped fields; non-SOP records never claim SOP discovery", () => {
    const id = "entrance-wm-email-1";
    resolveCanonicalCurrentFocus({ creationId: id, workflow: emailWorkflow(id) });
    const updated = applyDiscoveryAnswerToRuntimeCreationRecord(
      id,
      "create-outcome",
      "Clients reply within a day",
    );
    expect(updated).not.toBeNull();
    expect(updated!.workingMemory?.desiredResult).toBe(
      "Clients reply within a day",
    );
    // The eligibility fix: an Email record must never be told to
    // "Continue understanding your SOP".
    expect(updated!.workingMemory?.nextHelpfulStep ?? "").not.toMatch(/SOP/i);

    const why = applyDiscoveryAnswerToRuntimeCreationRecord(
      id,
      "create-why",
      "Follow-ups keep slipping",
    );
    expect(why!.workingMemory?.whyItMatters).toBe("Follow-ups keep slipping");
    expect(getRuntimeCreationRecord(id)?.discoveryAnswers?.["create-outcome"]).toBe(
      "Clients reply within a day",
    );
  });
});
