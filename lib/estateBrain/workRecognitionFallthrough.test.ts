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
  isWorkRecognitionMessage,
  resetWorkRecognitionSessionForTests,
  resolveWorkRecognitionNewRecognition,
  resolveWorkRecognitionResumption,
} from "./workRecognitionFallthrough";
import { resetEntranceUnderstandingForTests } from "@/lib/createEstate/entranceUnderstanding";
import { clearRuntimeCreationRecordsForTests } from "@/lib/currentFocus/creationRecord";
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
