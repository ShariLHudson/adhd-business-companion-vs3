/**
 * Universal Work Recognition (2026-08-06). Step 1 (the additive fallthrough
 * seam) plus the priority fix (AT-5.7 — Research Inside Creation): an active
 * journey retains ownership of the conversation over standalone intent
 * detection, unless the member explicitly requests a different direction.
 *
 * @vitest-environment jsdom
 * @see docs/create-experience/UNIVERSAL_WORK_RECOGNITION_ARCHITECTURE_ANALYSIS.md
 * @see docs/create-experience/UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md (AT-5.7)
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearWorkRecognitionSession,
  detectWorkRecognitionShape,
  isWorkRecognitionFirstRefusalEnabled,
  isWorkRecognitionMessage,
  resetWorkRecognitionSessionForTests,
  resolveCreateFoundationRecognition,
  resolveWorkRecognitionFirstRefusal,
  resolveWorkRecognitionNewRecognition,
  resolveWorkRecognitionResumption,
} from "./workRecognitionFallthrough";
import {
  consumeEntranceUnderstandingHandoff,
  resetEntranceUnderstandingForTests,
  startEntranceUnderstandingForCatalogType,
} from "@/lib/createEstate/entranceUnderstanding";
import { clearRuntimeCreationRecordsForTests } from "@/lib/currentFocus/creationRecord";
import { resolveCreateFoundationClassification } from "@/lib/creationIdentity/createFoundationRouting";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation/orchestrator";
import { DISCOVERY_QUESTIONS } from "./discoveryRegistry";

beforeEach(() => {
  resetWorkRecognitionSessionForTests();
  resetEntranceUnderstandingForTests();
  clearRuntimeCreationRecordsForTests();
  localStorage.clear();
});

describe("detectWorkRecognitionShape — the founder's three shapes", () => {
  it("'I need to know how to X' recognizes develop, not a factual question", () => {
    const match = detectWorkRecognitionShape(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    expect(match?.verb).toBe("develop");
    expect(match?.acknowledgment).toMatch(/repeatable process/i);
  });

  it("'I need help organizing X' recognizes build", () => {
    const match = detectWorkRecognitionShape(
      "I need help organizing my client files.",
    );
    expect(match?.verb).toBe("build");
  });

  it("'I need a better way to X' recognizes improve", () => {
    const match = detectWorkRecognitionShape(
      "I need a better way to keep track of client follow-ups.",
    );
    expect(match?.verb).toBe("improve");
  });

  it("ongoing struggle framing recognizes improve", () => {
    expect(
      detectWorkRecognitionShape("I'm struggling to keep my inbox organized.")
        ?.verb,
    ).toBe("improve");
    expect(
      detectWorkRecognitionShape("My filing system is a mess.")?.verb,
    ).toBe("improve");
  });
});

describe("explicit develop/build/improve verbs (recognized nowhere else today)", () => {
  it("'I want to build a strategy for organizing my filing system' recognizes build", () => {
    const match = detectWorkRecognitionShape(
      "I want to build a strategy for organizing my filing system.",
    );
    expect(match?.verb).toBe("build");
  });

  it("explicit develop and improve verbs are recognized too", () => {
    expect(
      detectWorkRecognitionShape("I want to develop a better onboarding flow")
        ?.verb,
    ).toBe("develop");
    expect(
      detectWorkRecognitionShape("help me improve my client experience")
        ?.verb,
    ).toBe("improve");
  });
});

describe("Phase B — create/plan verbs (Work Recognition Acceptance Tests)", () => {
  // @see docs/create-experience/WORK_RECOGNITION_ACCEPTANCE_TESTS.md
  it('"I want to create a workshop." is recognized as work intent, not a factual/casual message', () => {
    const match = detectWorkRecognitionShape("I want to create a workshop.");
    expect(match?.verb).toBe("create");
    expect(match?.acknowledgment).toMatch(/love to help you create/i);
  });

  it('"I want to create a workshop." begins the understanding journey and never asks a murky/uncertainty question', () => {
    const result = resolveWorkRecognitionNewRecognition(
      "I want to create a workshop.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.message).not.toMatch(/murky/i);
    expect(result.message).not.toMatch(/what feels like the hardest part/i);
    expect(result.session.topic).toBeTruthy();
  });

  it('"I need to plan a two-day ADHD business retreat." is recognized as planning work and begins the journey', () => {
    const match = detectWorkRecognitionShape(
      "I need to plan a two-day ADHD business retreat.",
    );
    expect(match?.verb).toBe("plan");

    const result = resolveWorkRecognitionNewRecognition(
      "I need to plan a two-day ADHD business retreat.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.message).not.toMatch(/murky/i);
    expect(result.session.topic).toBeTruthy();
  });

  it('the create/plan verbs stay confined to their existing lead-in phrasing — no runaway matches', () => {
    // A bare noun use of "plan"/"create" must not be swept in — same
    // discipline as the pre-existing develop/build/improve verbs.
    expect(detectWorkRecognitionShape("That plan didn't work out.")).toBeNull();
    expect(detectWorkRecognitionShape("The creation myth is interesting.")).toBeNull();
  });

  it('known gap (not fixed by this seam): "I want to create a newsletter." — the module itself recognizes it, but the live chat pipeline never reaches this module for it', () => {
    // detectWorkRecognitionShape is a pure function and correctly recognizes
    // the shape in isolation...
    expect(
      detectWorkRecognitionShape("I want to create a newsletter.")?.verb,
    ).toBe("create");
    // ...but in the actual chat pipeline (lib/frictionlessActionLayer.ts),
    // newsletter/SOP/proposal/checklist requests are claimed several steps
    // EARLIER by the Create Foundation direct-routing gate
    // (isSimpleCreateRequest → resolveCreateFoundationClassification
    // .routeDirectlyToCreateFoundation, frictionlessActionLayer.ts:4269-4281)
    // and never reach resolveWorkRecognitionNewRecognition's late
    // fallthrough at all. That gate currently steps aside to a "Create
    // Foundation" hand-off that no UI code completes for a bare chat
    // message, so the newsletter case is a distinct, larger-blast-radius
    // gap — tracked in WORK_RECOGNITION_ACCEPTANCE_TESTS.md, not fixed
    // here. See that doc before touching the Create Foundation gate: it is
    // shared by Create continuity, CREATE_FAST_PATH, and frictionless, per
    // lib/creationIdentity/createFoundationRouting.ts's own header comment.
  });
});

describe("Phase B — preserving the uncertainty/clear-intent distinction", () => {
  it('"I\'m stuck trying to figure out my workshop." is never recognized as new work — support/clarification stays owned elsewhere (Friction First)', () => {
    expect(
      detectWorkRecognitionShape(
        "I'm stuck trying to figure out my workshop.",
      ),
    ).toBeNull();
    expect(
      resolveWorkRecognitionNewRecognition(
        "I'm stuck trying to figure out my workshop.",
      ),
    ).toBeNull();
  });
});

describe("factual questions are never recognized as work", () => {
  it("'What is Loom?' — pure definitional, excluded before any shape check", () => {
    expect(detectWorkRecognitionShape("What is Loom?")).toBeNull();
  });

  it("other factual openers are excluded", () => {
    expect(detectWorkRecognitionShape("Who is the CEO of Loom?")).toBeNull();
    expect(detectWorkRecognitionShape("How old is Loom the company?")).toBeNull();
    expect(
      detectWorkRecognitionShape("When was YouTube founded?"),
    ).toBeNull();
  });

  it("casual conversation and empty text are excluded", () => {
    expect(detectWorkRecognitionShape("How are you today?")).toBeNull();
    expect(detectWorkRecognitionShape("")).toBeNull();
    expect(detectWorkRecognitionShape("   ")).toBeNull();
  });
});

describe("new recognition (late fallthrough) — recognition without opening a workspace", () => {
  it("turn 1: recognizes work, asks the first question, saves a session", () => {
    const result = resolveWorkRecognitionNewRecognition(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.message).toMatch(/repeatable process/i);
    expect(result.message).not.toMatch(/step 1|step 2|step 3/i);
    expect(result.session.topic).toBeTruthy();
  });

  it("never a generic instructional list for the Loom example (AT-1)", () => {
    const result = resolveWorkRecognitionNewRecognition(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    // A single, warm recognition + one question — not a numbered how-to list.
    expect(result.message.split("\n\n").length).toBeLessThanOrEqual(2);
  });

  it("unrecognized text returns null — current behavior continues unchanged", () => {
    expect(resolveWorkRecognitionNewRecognition("What is Loom?")).toBeNull();
    expect(
      resolveWorkRecognitionNewRecognition("How are you today?"),
    ).toBeNull();
  });

  it("completion never opens a workspace — no side effect beyond the closing message", () => {
    let step = resolveWorkRecognitionNewRecognition(
      "I need help organizing my client files.",
    );
    if (step?.kind !== "question") throw new Error("expected a question");
    let lastMessage = step.message;

    // Walk to completion by answering every remaining question.
    for (let i = 0; i < 6 && step?.kind === "question"; i++) {
      const next = resolveWorkRecognitionResumption(
        "A clear folder structure everyone follows",
        lastMessage,
      );
      if (!next) throw new Error("expected the conversation to continue");
      step = next;
      if (step.kind === "question") lastMessage = step.message;
    }

    expect(step?.kind).toBe("understood");
    if (step?.kind !== "understood") return;
    expect(step.message).toContain("When you're ready");
    // No runtime creation record was ever created — recognition only, no
    // workspace side effect (Step 2 is explicitly deferred).
    expect(localStorage.getItem("spark.runtimeCreationRecords.v1")).toBeNull();
  });
});

describe("resumption (early priority) — an active journey retains ownership (AT-5.7)", () => {
  it("turn 2 resumes the SAME conversation via the saved session + marker", () => {
    const first = resolveWorkRecognitionNewRecognition(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");
    expect(isWorkRecognitionMessage(first.message)).toBe(true);

    const second = resolveWorkRecognitionResumption(
      "So my assistant can do it without asking me every time",
      first.message,
    );
    expect(second?.kind).toBe("question");
    if (second?.kind !== "question") return;
    // Progressed to the next question — never the same one repeated (Rule 5).
    expect(second.message).not.toBe(first.message);
  });

  it("Founder Test 1 — active newsletter journey + a reply mentioning research continues the journey, never redirects", () => {
    // "I need help organizing" is one of this module's own recognized
    // shapes (build) — standing in for the founder's illustrative "I need
    // help writing a newsletter" opener, which is a plain create-shaped
    // request handled by the existing, separate "create" goal path (out of
    // this module's scope; see AT-6.4/Step 2). What's under test here is
    // resumption priority, not which opener starts the journey.
    const first = resolveWorkRecognitionNewRecognition(
      "I need help organizing my newsletter content.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");

    // Before the fix, this reply matched isResearchIntent's literal
    // "research" pattern and would have been hijacked by goal
    // classification long before this module ever saw it.
    const second = resolveWorkRecognitionResumption(
      "No but need help with some research.",
      first.message,
    );
    expect(second).not.toBeNull();
    expect(second?.kind === "question" || second?.kind === "understood").toBe(
      true,
    );
  });

  it("Founder Test 2 — a standalone research question is untouched when no journey is active", () => {
    // No active session at all — must be a no-op, letting existing
    // research routing (isResearchIntent, etc.) handle it exactly as
    // before this fix.
    expect(
      resolveWorkRecognitionResumption("What are current newsletter trends?"),
    ).toBeNull();
    // Nor does it get mistakenly recognized as brand-new work — it's a
    // factual/trend question, not a work-shaped request.
    expect(
      detectWorkRecognitionShape("What are current newsletter trends?"),
    ).toBeNull();
  });

  it("Founder Test 2b — a stored session doesn't leak into an unrelated reply", () => {
    // A journey is active, but this particular assistant turn was NOT one
    // of the journey's own questions — the reply must not be swallowed.
    resolveWorkRecognitionNewRecognition(
      "I need help organizing my newsletter content.",
    );
    expect(
      resolveWorkRecognitionResumption(
        "What are current newsletter trends?",
        "Here's a quick summary of your day so far.",
      ),
    ).toBeNull();
  });

  it("Founder Test 3 — a casual past-tense mention of research is never recognized as work", () => {
    expect(
      detectWorkRecognitionShape("I was researching something yesterday"),
    ).toBeNull();
    expect(
      resolveWorkRecognitionNewRecognition(
        "I was researching something yesterday",
      ),
    ).toBeNull();
  });

  it("explicit redirect wins over an active journey — the member's own request for a different direction is honored", () => {
    const first = resolveWorkRecognitionNewRecognition(
      "I need help organizing my newsletter content.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");

    // An explicit navigation signal — the founder's own carve-out ("unless
    // they explicitly request a different direction").
    expect(
      resolveWorkRecognitionResumption(
        "Actually, take me to the Boardroom",
        first.message,
      ),
    ).toBeNull();
  });

  it("a message unrelated to any in-flight session, with no session stored, still requires its own shape match", () => {
    expect(resolveWorkRecognitionResumption("What is Loom?")).toBeNull();
  });

  it("clearWorkRecognitionSession ends an in-flight conversation cleanly", () => {
    const first = resolveWorkRecognitionNewRecognition(
      "I need a better way to keep track of client follow-ups.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");
    clearWorkRecognitionSession();
    expect(
      resolveWorkRecognitionResumption("a reminder every Friday", first.message),
    ).toBeNull();
  });
});

describe("marker regex tracks the live question prompts (never hand-copied)", () => {
  it("recognizes every current create_general prompt as a work-recognition message", () => {
    for (const q of DISCOVERY_QUESTIONS.create_general) {
      expect(isWorkRecognitionMessage(q.prompt)).toBe(true);
    }
  });

  it("does not misfire on an unrelated assistant reply", () => {
    expect(
      isWorkRecognitionMessage("Here's a summary of your day so far."),
    ).toBe(false);
  });
});

describe("Phase C-1 — Create Foundation convergence (resolveCreateFoundationRecognition)", () => {
  // @see docs/create-experience/CREATE_FOUNDATION_PHASE_C_PLAN.md
  // @see docs/create-experience/WORK_RECOGNITION_ACCEPTANCE_TESTS.md case 2

  it("the founder's original case: \"I want to create a newsletter.\" is recognized and begins the understanding conversation, never a murky question", () => {
    const result = resolveCreateFoundationRecognition(
      "I want to create a newsletter.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.session.catalogTypeLabel).toBe("Newsletter");
    expect(result.message).not.toMatch(/murky/i);
  });

  it("full label coverage: every already-catalog-pickable Create Foundation label reaches the typed conversation via chat text", () => {
    const cases: Array<[string, string]> = [
      ["I want to create a newsletter.", "Newsletter"],
      ["I want to create a sop for onboarding.", "Sop"],
      ["I want to create a proposal.", "Proposal"],
      // "Lead magnet" isn't one of deriveCreationIdentity's recognized
      // artifact nouns, so classificationType collapses to the generic
      // "Document" fallback — verified via resolveCreateFoundationClassification
      // directly, not assumed. Still routes correctly (never a silent
      // no-op), just under a broader label than the specific request.
      ["I want to create a lead magnet.", "Document"],
      ["I want to create an offer.", "Document"],
    ];
    for (const [text, expectedLabel] of cases) {
      resetWorkRecognitionSessionForTests();
      resetEntranceUnderstandingForTests();
      const result = resolveCreateFoundationRecognition(text);
      expect(result?.kind, `expected a question for "${text}"`).toBe(
        "question",
      );
      if (result?.kind !== "question") continue;
      // The exact label may collapse to a broader classification (e.g.
      // "Sop" case-shape, "lead magnet" -> guide, "offer" -> document) — see
      // CREATE_FOUNDATION_CONVERGENCE_REVIEW.md's classifier duplication
      // finding. What matters here is that it's consistent and never a
      // silent no-op, never a murky question.
      expect(result.session.catalogTypeLabel, text).toBe(expectedLabel);
      expect(result.message).not.toMatch(/murky/i);
    }
  });

  it("the landing-page precedence fix: \"I want to create a landing page.\" no longer routes into Universal Creation's discovery interview", () => {
    expect(
      shouldEnterUniversalCreation("I want to create a landing page."),
    ).toBe(false);
    const classification = resolveCreateFoundationClassification(
      "I want to create a landing page.",
    );
    expect(classification.routeDirectlyToCreateFoundation).toBe(true);
    expect(classification.classificationType).toBe("Landing Page");
    const result = resolveCreateFoundationRecognition(
      "I want to create a landing page.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.session.catalogTypeLabel).toBe("Landing Page");
  });

  it("a genuine 'website copy' request is unaffected by the landing-page fix — still Universal Creation's own discovery", () => {
    expect(
      resolveCreateFoundationClassification("I want website copy.")
        .routeDirectlyToCreateFoundation,
    ).toBe(false);
  });

  it("doorway convergence: the same creation request reaches the same reasoning journey from chat text and from a catalog pick", () => {
    // Chat entry point.
    const chatResult = resolveCreateFoundationRecognition(
      "I want to create a newsletter.",
    );
    expect(chatResult?.kind).toBe("question");
    if (chatResult?.kind !== "question") return;

    resetEntranceUnderstandingForTests();

    // Dropdown/catalog entry point — the exact function
    // CreateEstateEntrancePanel.tsx's requestCatalogConfirm already calls.
    const catalogStep = startEntranceUnderstandingForCatalogType(
      "Newsletter",
      null,
    );
    expect(catalogStep.kind).toBe("question");
    if (catalogStep.kind !== "question") return;

    // Same topic, same catalog type, same first question — one journey,
    // not two independent copies that happen to look similar.
    expect(chatResult.session.topic).toBe(catalogStep.session.topic);
    expect(chatResult.session.catalogTypeLabel).toBe(
      catalogStep.session.catalogTypeLabel,
    );
    expect(chatResult.message).toContain(catalogStep.question.prompt);
  });

  it("the 6 PRE_WORKSPACE_DISCOVERY_UC_TYPES are unaffected — still route through Universal Creation's own interview", () => {
    for (const text of [
      // Email's own detectPatterns require write/draft/compose/send/craft —
      // not "create" — verified directly; this is the phrasing that
      // actually stays on the UC-discovery path.
      "I need to write an email to a client.",
      "I want to create a sales funnel.",
      "I want to create a presentation.",
      "I want to create a business plan.",
      "I want to create a social post.",
    ]) {
      expect(
        resolveCreateFoundationClassification(text)
          .routeDirectlyToCreateFoundation,
        text,
      ).toBe(false);
      expect(resolveCreateFoundationRecognition(text), text).toBeNull();
    }
  });

  it("previous work recognition wins: an active Work Recognition session is not hijacked by a Create Foundation-classified message", () => {
    const first = resolveWorkRecognitionNewRecognition(
      "I want to build a strategy for organizing my filing system.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");

    // A Create-Foundation-shaped reply arrives mid-journey — resumption
    // (the early priority check) must claim it, not a fresh recognition.
    const second = resolveWorkRecognitionResumption(
      "I want to create a newsletter about it instead.",
      first.message,
    );
    expect(second).not.toBeNull();
    expect(second?.kind === "question" || second?.kind === "understood").toBe(
      true,
    );
  });

  it("empty text and non-creation text return null, never a false positive", () => {
    expect(resolveCreateFoundationRecognition("")).toBeNull();
    expect(resolveCreateFoundationRecognition("How are you today?")).toBeNull();
    expect(resolveCreateFoundationRecognition("What is Loom?")).toBeNull();
  });
});

describe("Phase C-2 — confirmed understanding becomes a work object (transition map)", () => {
  // @see docs/create-experience/CREATE_FOUNDATION_TRANSITION_MAP.md
  // @see docs/create-experience/CREATE_FOUNDATION_PHASE_C_PLAN.md

  /** Walk a typed Create Foundation conversation to its ready-to-open confirm. */
  function walkToReadyLine(openingText: string): {
    lastMessage: string;
  } {
    let step = resolveCreateFoundationRecognition(openingText);
    if (step?.kind !== "question") throw new Error("expected a question");
    let lastMessage = step.message;
    for (let i = 0; i < 8 && step?.kind === "question"; i++) {
      const next = resolveWorkRecognitionResumption(
        "A clear, simple answer for this step.",
        lastMessage,
      );
      if (!next) throw new Error("expected the conversation to continue");
      step = next;
      lastMessage = step.message;
    }
    if (step?.kind !== "understood") {
      throw new Error("expected the conversation to reach confirm");
    }
    return { lastMessage };
  }

  it("reaching the confirm step alone does NOT open a workspace — an explicit 'yes' is still required (130 One Creation Rule)", () => {
    const { lastMessage } = walkToReadyLine(
      "I want to create a newsletter.",
    );
    expect(lastMessage).toMatch(/say the word/i);
    // No workspace open payload yet — confirm-only, matching
    // entranceUnderstanding.ts's own "cannot open Work" header comment.
    expect(consumeEntranceUnderstandingHandoff()).toBeNull();
  });

  it("an explicit 'yes' after the ready-line opens the workspace: correct artifactType + initialPrompt, Working Memory armed", () => {
    const { lastMessage } = walkToReadyLine(
      "I want to create a newsletter.",
    );
    const opened = resolveWorkRecognitionResumption("yes", lastMessage);
    expect(opened?.kind).toBe("understood");
    if (opened?.kind !== "understood") return;
    expect(opened.openWorkspace).toEqual({
      artifactType: "Newsletter",
      initialPrompt: "I want to create a newsletter.",
    });
    expect(opened.message).toMatch(/opening your newsletter now/i);

    // Working Memory: the SAME one-shot handoff CreateEstateEntrancePanel.tsx's
    // own confirm click arms is now armed for consumption by
    // startFreshCreateFromEstate — proving the answers gathered in chat are
    // not lost, exactly like the catalog path.
    const handoff = consumeEntranceUnderstandingHandoff();
    expect(handoff).not.toBeNull();
    expect(Object.keys(handoff?.answers ?? {}).length).toBeGreaterThan(0);
    // One-shot — a second read is empty, matching the catalog path's own
    // "consuming clears" contract.
    expect(consumeEntranceUnderstandingHandoff()).toBeNull();
  });

  it("a non-affirmative reply to the ready-line does not open the workspace, and does not discard the session", () => {
    const { lastMessage } = walkToReadyLine("I want to create a proposal.");
    const notYet = resolveWorkRecognitionResumption(
      "Actually wait, what should I include?",
      lastMessage,
    );
    expect(notYet).toBeNull();
    expect(consumeEntranceUnderstandingHandoff()).toBeNull();
    // The session survived — a genuine "yes" afterward still works.
    const opened = resolveWorkRecognitionResumption("yes", lastMessage);
    expect(opened?.kind).toBe("understood");
    if (opened?.kind !== "understood") return;
    expect(opened.openWorkspace?.artifactType).toBe("Proposal");
  });

  it("the untyped Work Recognition path (develop/build/improve) still NEVER opens a workspace — Phase 1's boundary is unchanged", () => {
    let step = resolveWorkRecognitionNewRecognition(
      "I need help organizing my client files.",
    );
    if (step?.kind !== "question") throw new Error("expected a question");
    let lastMessage = step.message;
    for (let i = 0; i < 8 && step?.kind === "question"; i++) {
      const next = resolveWorkRecognitionResumption(
        "A clear folder structure everyone follows",
        lastMessage,
      );
      if (!next) throw new Error("expected the conversation to continue");
      step = next;
      if (step.kind === "question") lastMessage = step.message;
    }
    expect(step?.kind).toBe("understood");
    if (step?.kind !== "understood") return;
    expect(step.message).not.toMatch(/say the word/i);
    expect(step.message).toContain("When you're ready");
    expect(step.openWorkspace).toBeUndefined();
    // Nothing was armed — this path structurally cannot open Work.
    expect(consumeEntranceUnderstandingHandoff()).toBeNull();
  });

  it("doorway convergence still holds after the confirm-to-open change: chat and catalog produce the same artifactType", () => {
    const { lastMessage } = walkToReadyLine(
      "I want to create a checklist for onboarding.",
    );
    const opened = resolveWorkRecognitionResumption("yes please", lastMessage);
    expect(opened?.kind).toBe("understood");
    if (opened?.kind !== "understood") return;
    // "Checklist" — the same catalog label a dropdown pick of "Checklist"
    // would carry into startFreshCreateFromEstate's artifactType.
    expect(opened.openWorkspace?.artifactType).toBe("Checklist");
  });
});

describe("Phase T-1 first slice — resolveWorkRecognitionFirstRefusal (golden conversation tests)", () => {
  // @see docs/create-experience/WORK_INTENT_TARGET_ARCHITECTURE.md §6
  // @see docs/create-experience/WORK_INTENT_OWNERSHIP_AUDIT.md
  //
  // These test the DECISION this function produces for the founder's own
  // five worked examples — traced against the CURRENT pipeline before
  // writing these assertions (not assumed), matching what
  // resolveCreateFoundationClassification/detectWorkRecognitionShape
  // actually classify each message as today.

  it("Test 1 — process creation: recognizes work, no blocking question, no Strategy routing", () => {
    const result = resolveWorkRecognitionFirstRefusal(
      "I want to develop a process for new clients.",
      null,
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    // Warm acknowledgment + one question — never "what's blocking you" /
    // "what's getting in your way" / murky-style support-mode language.
    expect(result.message).not.toMatch(/blocking|getting in (?:your|the) way|murky/i);
    expect(result.message).not.toMatch(/strategy/i);
    expect(result.message).toMatch(/love to help you create/i);
  });

  it("Test 2 — workshop: recognizes workshop creation, asks toward purpose/outcome, never generic advice", () => {
    const result = resolveWorkRecognitionFirstRefusal(
      "I want to create a one-hour workshop about the ADHD ecosystem.",
      null,
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.message).toMatch(/what would you like this to accomplish/i);
    expect(result.message).not.toMatch(/blocking|getting in (?:your|the) way|murky/i);
    expect(result.session.topic).toBeTruthy();
  });

  it("Test 3 — event/birthday party: recognizes planning request, never activates Strategy/Momentum", () => {
    const result = resolveWorkRecognitionFirstRefusal(
      "I want to plan a birthday party for a staff member.",
      null,
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.message).not.toMatch(/strategy|momentum|business plan/i);
    expect(result.message).not.toMatch(/blocking|getting in (?:your|the) way/i);
  });

  it("Test 4 — support mode: stuck/overwhelm language is never claimed, stays available for Friction First", () => {
    const result = resolveWorkRecognitionFirstRefusal(
      "I'm stuck trying to figure out my workshop.",
      null,
    );
    // Null is the correct, intended outcome — Work Recognition must never
    // force a creation workflow onto a genuine support-mode message. The
    // caller (CompanionPageClient.tsx) falls through unchanged to Friction
    // First, exactly as it already does today.
    expect(result).toBeNull();
  });

  it("Test 5 — resume: never hijacks an existing-work resume request", () => {
    const result = resolveWorkRecognitionFirstRefusal("Continue my newsletter.", null);
    // Null — no create/plan/develop/build/improve verb in "continue my X",
    // so this falls through unchanged to the existing registry-driven
    // resume detection (lib/activeWorkspaceRegistry), which creates
    // nothing new and resumes the named work instead.
    expect(result).toBeNull();
  });

  it("Build Mode vs Support Mode — the same underlying distinction, stated directly", () => {
    // Build Mode: recognized, no blocking question.
    for (const text of [
      "I want to create a newsletter.",
      "I want to develop a better onboarding flow.",
      "I want to plan a retreat.",
    ]) {
      const result = resolveWorkRecognitionFirstRefusal(text, null);
      expect(result, text).not.toBeNull();
      if (result?.kind === "question") {
        expect(result.message, text).not.toMatch(/what is getting in your way/i);
      }
    }
    // Support Mode: never claimed here — stays available for the system
    // that actually owns emotional/stuck turns (Friction First).
    for (const text of [
      "I'm stuck.",
      "I'm overwhelmed.",
      "I don't know where to start.",
    ]) {
      expect(resolveWorkRecognitionFirstRefusal(text, null), text).toBeNull();
    }
  });

  it("the feature flag defaults OFF", () => {
    delete process.env.NEXT_PUBLIC_WORK_RECOGNITION_FIRST_REFUSAL;
    expect(isWorkRecognitionFirstRefusalEnabled()).toBe(false);
  });

  it("the feature flag turns on only with the explicit '1' value", () => {
    process.env.NEXT_PUBLIC_WORK_RECOGNITION_FIRST_REFUSAL = "1";
    expect(isWorkRecognitionFirstRefusalEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_WORK_RECOGNITION_FIRST_REFUSAL = "true";
    expect(isWorkRecognitionFirstRefusalEnabled()).toBe(false);
    delete process.env.NEXT_PUBLIC_WORK_RECOGNITION_FIRST_REFUSAL;
  });
});
