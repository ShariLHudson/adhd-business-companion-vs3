import { beforeEach, describe, expect, it } from "vitest";
import {
  shouldContinueActiveCreateSession,
  shouldExitActiveCreateSession,
} from "./createSessionExit";
import {
  clearActiveCreateSession,
  loadPendingCreateDocumentType,
  rememberPendingCreateDocumentType,
} from "@/lib/universalCreation/orchestrator";

describe("createSessionGate", () => {
  beforeEach(() => {
    clearActiveCreateSession();
  });

  it("continues discovery answers that mention stress or conflict", () => {
    rememberPendingCreateDocumentType("email");
    const last = "What would a good response look like?";
    const answer =
      "i don't want to be mean as i don't like conflict but she is wasting my time";
    expect(shouldExitActiveCreateSession(answer, last)).toBe(false);
    expect(shouldContinueActiveCreateSession(answer, last)).toBe(true);
  });

  it("continues somatic language when answering a create discovery question", () => {
    rememberPendingCreateDocumentType("sop");
    expect(
      shouldExitActiveCreateSession(
        "i can't seem to relax or catch my breath",
        "Will one person use this, or will multiple people need to follow it?",
      ),
    ).toBe(false);
    expect(
      shouldContinueActiveCreateSession(
        "i can't seem to relax or catch my breath",
        "Will one person use this, or will multiple people need to follow it?",
      ),
    ).toBe(true);
  });

  it("exits on ADHD knowledge question during create", () => {
    rememberPendingCreateDocumentType("sop");
    expect(
      shouldExitActiveCreateSession(
        "what are some symptoms of adhd",
        "What process are we documenting today?",
      ),
    ).toBe(true);
  });

  it("continues short discovery answers in create context", () => {
    rememberPendingCreateDocumentType("sop");
    const last =
      "Is this SOP for your own business, or for a client?";
    expect(shouldExitActiveCreateSession("business", last)).toBe(false);
    expect(shouldContinueActiveCreateSession("business", last)).toBe(true);
  });

  it("clearActiveCreateSession removes pending document type", () => {
    rememberPendingCreateDocumentType("sop");
    clearActiveCreateSession();
    expect(loadPendingCreateDocumentType()).toBeNull();
  });
});
