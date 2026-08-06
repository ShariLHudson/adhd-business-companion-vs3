/**
 * Universal Work Recognition — Step 1 (2026-08-06). The additive fallthrough
 * seam.
 *
 * @vitest-environment jsdom
 * @see docs/create-experience/UNIVERSAL_WORK_RECOGNITION_ARCHITECTURE_ANALYSIS.md
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearWorkRecognitionSession,
  detectWorkRecognitionShape,
  isWorkRecognitionMessage,
  resetWorkRecognitionSessionForTests,
  resolveWorkRecognitionFallthrough,
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
  it("Test 1 — 'I need to know how to X' recognizes develop, not a factual question", () => {
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

describe("Test 2 — explicit develop/build/improve verbs (recognized nowhere else today)", () => {
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

describe("the seam — recognition without opening a workspace", () => {
  it("turn 1: recognizes work, asks the first question, saves a session", () => {
    const result = resolveWorkRecognitionFallthrough(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    expect(result.message).toMatch(/repeatable process/i);
    expect(result.message).not.toMatch(/step 1|step 2|step 3/i);
    expect(result.session.topic).toBeTruthy();
  });

  it("never a generic instructional list for the Loom example (AT-1)", () => {
    const result = resolveWorkRecognitionFallthrough(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    expect(result?.kind).toBe("question");
    if (result?.kind !== "question") return;
    // A single, warm recognition + one question — not a numbered how-to list.
    expect(result.message.split("\n\n").length).toBeLessThanOrEqual(2);
  });

  it("unrecognized text returns null — current behavior continues unchanged", () => {
    expect(
      resolveWorkRecognitionFallthrough("What is Loom?"),
    ).toBeNull();
    expect(resolveWorkRecognitionFallthrough("How are you today?")).toBeNull();
  });

  it("turn 2 resumes the SAME conversation via the saved session + marker", () => {
    const first = resolveWorkRecognitionFallthrough(
      "I need to know how to record a Loom video and upload it to YouTube.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");
    expect(isWorkRecognitionMessage(first.message)).toBe(true);

    const second = resolveWorkRecognitionFallthrough(
      "So my assistant can do it without asking me every time",
      first.message,
    );
    expect(second?.kind).toBe("question");
    if (second?.kind !== "question") return;
    // Progressed to the next question — never the same one repeated (Rule 5).
    expect(second.message).not.toBe(first.message);
  });

  it("a message unrelated to the in-flight session, sent while one is stored, still requires its own shape match", () => {
    const first = resolveWorkRecognitionFallthrough(
      "I need help organizing my client files.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");
    // lastAssistantText NOT passed — this simulates a fresh turn where the
    // caller (frictionlessActionLayer) didn't consider it a continuation.
    expect(resolveWorkRecognitionFallthrough("What is Loom?")).toBeNull();
  });

  it("completion never opens a workspace — no side effect beyond the closing message", () => {
    let step = resolveWorkRecognitionFallthrough(
      "I need help organizing my client files.",
    );
    if (step?.kind !== "question") throw new Error("expected a question");
    let lastMessage = step.message;

    // Walk to completion by answering every remaining question.
    for (let i = 0; i < 6 && step?.kind === "question"; i++) {
      const next = resolveWorkRecognitionFallthrough(
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

  it("clearWorkRecognitionSession ends an in-flight conversation cleanly", () => {
    const first = resolveWorkRecognitionFallthrough(
      "I need a better way to keep track of client follow-ups.",
    );
    if (first?.kind !== "question") throw new Error("expected a question");
    clearWorkRecognitionSession();
    // With the session cleared, the same reply text (which matches no
    // shape on its own) is correctly treated as unrecognized, not a
    // continuation of the cleared session.
    expect(
      resolveWorkRecognitionFallthrough("a reminder every Friday", first.message),
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
