/**
 * Universal Reasoning Journey — entrance understanding conversation.
 *
 * Acceptance contract: docs/create-experience/UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md
 * — AT-1.1 (understand before classification), AT-1.2 (why it matters),
 * AT-1.3 (sufficient context skips ceremony), AT-B6 (reflect before moving
 * forward), AT-B8 (entrance answers never re-asked after open), AT-6.1
 * (never returns open — 130 gate intact), AT-6.4 (member wording preserved).
 *
 * Create Journey Integration (2026-08-06) — six understanding dimensions
 * (what/why/who/current situation/constraints, plus missing-information as
 * an observation, not a question) and the catalog-type path that makes the
 * entrance the only doorway into a Create workspace.
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
  startEntranceUnderstandingForCatalogType,
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

describe("the six understanding dimensions, in order (Create Journey Integration)", () => {
  it("asks who, then current situation, then constraints — missing information is never a seventh question", () => {
    let step = startEntranceUnderstanding("I need a newsletter")!;
    step = advanceEntranceUnderstanding(step.session, "Readers feel close"); // outcome
    step = advanceEntranceUnderstanding(step.session, "New year, new offer"); // why
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("create-audience");

    step = advanceEntranceUnderstanding(step.session, "Past clients");
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("create-existing");
    expect(step.acknowledgment).toBe(entranceAcknowledgmentFor("create-audience"));

    step = advanceEntranceUnderstanding(step.session, "A few old drafts");
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("create-constraints");
    expect(step.acknowledgment).toBe(entranceAcknowledgmentFor("create-existing"));

    step = advanceEntranceUnderstanding(step.session, "Two weeks");
    expect(step.kind).toBe("classify");
  });
});

describe("sufficient context skips ceremony (AT-1.3)", () => {
  it("a fully-formed request answering all six dimensions classifies without questions", () => {
    const step = startEntranceUnderstanding(
      "I need a newsletter for my clients because they keep asking, so that they feel close between sessions, " +
        "and I already have some draft notes from last time, though there's a tight deadline this week",
    );
    expect(step?.kind).toBe("classify");
  });

  it("a request that answers only three of six dimensions still asks the rest", () => {
    // The bar is genuinely six dimensions now, not three — a request that
    // signals outcome/why/audience alone still gets asked about current
    // situation and constraints before confirm.
    const step = startEntranceUnderstanding(
      "I need a newsletter for my clients because they keep asking, so that they feel close between sessions",
    );
    expect(step?.kind).toBe("question");
    if (step?.kind !== "question") return;
    expect(step.question.id).toBe("create-existing");
  });
});

describe("missing information is Spark's own observation, not a question (Rule 2 step 5)", () => {
  it("a skipped question earns an honest note in the confirm message", () => {
    let step = startEntranceUnderstanding("I need a newsletter")!;
    step = advanceEntranceUnderstanding(step.session, "", { skip: true }); // outcome
    step = advanceEntranceUnderstanding(step.session, "", { skip: true }); // why
    step = advanceEntranceUnderstanding(step.session, "", { skip: true }); // audience
    step = advanceEntranceUnderstanding(step.session, "", { skip: true }); // existing
    step = advanceEntranceUnderstanding(step.session, "", { skip: true }); // constraints
    expect(step.kind).toBe("classify");
    if (step.kind !== "classify" || step.outcome.kind !== "confirm") {
      throw new Error("expected a confirm outcome");
    }
    expect(step.outcome.message).toContain("A few things are still open");
  });

  it("nothing skipped — no note appears", () => {
    const done = answerUntilClassify(
      startEntranceUnderstanding("I need a newsletter")!,
      "clients feel close, because they keep asking, for my past clients",
    );
    if (done.kind !== "classify" || done.outcome.kind !== "confirm") {
      throw new Error("expected a confirm outcome");
    }
    expect(done.outcome.message).not.toContain("still open");
  });
});

describe("catalog / category picks enter the same conversation (AT-E2 — the only doorway)", () => {
  it("never asks 'what' — the pick already answered it — but still asks why/who/existing/constraints", () => {
    const step = startEntranceUnderstandingForCatalogType("Marketing Plan");
    expect(step.kind).toBe("question");
    if (step.kind !== "question") return;
    expect(step.question.id).toBe("create-outcome");
    expect(step.session.answers["create-goal"]).toBe("Create a Marketing Plan");
  });

  it("the explicit type choice is never reclassified, even when answers suggest a different type", () => {
    const start = startEntranceUnderstandingForCatalogType("Marketing Plan");
    // Answers describing something newsletter-shaped must not flip the type
    // away from the member's explicit Marketing Plan click.
    const done = answerUntilClassify(
      start,
      "a weekly newsletter email for subscribers",
    );
    expect(done.kind).toBe("classify");
    if (done.kind !== "classify") return;
    expect(done.outcome.kind).toBe("confirm");
    if (done.outcome.kind !== "confirm") return;
    expect(done.outcome.artifactType.toLowerCase()).toContain("marketing plan");
  });

  it("a real request hint is preserved as identity instead of the synthetic placeholder", () => {
    const start = startEntranceUnderstandingForCatalogType(
      "Newsletter",
      "monthly update for past clients",
    );
    const done = answerUntilClassify(start, "so they stay warm");
    if (done.kind !== "classify" || done.outcome.kind !== "confirm") {
      throw new Error("expected a confirm outcome");
    }
    expect(done.outcome.text).toBe("monthly update for past clients");
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

  it("create-existing and create-constraints land in their own Working Memory fields", () => {
    const id = "entrance-wm-email-2";
    resolveCanonicalCurrentFocus({ creationId: id, workflow: emailWorkflow(id) });
    const existing = applyDiscoveryAnswerToRuntimeCreationRecord(
      id,
      "create-existing",
      "A few old drafts in Google Docs",
    );
    expect(existing!.workingMemory?.existingAssetsFound).toEqual([
      "A few old drafts in Google Docs",
    ]);
    const constrained = applyDiscoveryAnswerToRuntimeCreationRecord(
      id,
      "create-constraints",
      "Needs to go out by Friday",
    );
    expect(constrained!.workingMemory?.constraints).toBe(
      "Needs to go out by Friday",
    );
  });
});
