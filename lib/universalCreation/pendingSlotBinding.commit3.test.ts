/**
 * D3 Commit 3 — authoritative pending-slot routing in advanceUniversalCreation.
 *
 * The pending question owns the reply: it is written to the pending slot FIRST,
 * harvest runs supplement-only afterward (never the pending slot), and the
 * critical-gap engine decides only what happens next — never where the reply went.
 *
 * Scope: routing/binding only. No draft-composition, subject, or draft-timing
 * changes beyond the natural consequence of correct binding.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  advanceUniversalCreation,
  clearUniversalCreationSession,
  formatUniversalCreationTurnReply,
  startUniversalCreationTurn,
} from "./orchestrator";
import type { UniversalCreationSession } from "./types";

/** A fresh discovery session that has just asked the recipient question. */
function askedRecipient(): UniversalCreationSession {
  const start = startUniversalCreationTurn("Help me write an email.", 1)!;
  expect(start.kind).toBe("question");
  expect(start.question).toMatch(/receiving this email/i);
  expect(start.session.questionIndex).toBe(0); // email-recipient
  return start.session;
}

describe("advanceUniversalCreation — authoritative pending-slot binding", () => {
  beforeEach(() => clearUniversalCreationSession());

  it("asked recipient + 'My accountant' binds only to recipient, asks purpose next", () => {
    const result = advanceUniversalCreation(askedRecipient(), "My accountant.")!;
    expect(result.session.answers["email-recipient"]).toBe("My accountant.");
    // Reply did not leak into purpose.
    expect("email-purpose" in result.session.answers).toBe(false);
    expect(result.kind).toBe("question");
    if (result.kind === "question") {
      expect(result.question).toMatch(/accomplish/i);
    }
  });

  it("asked recipient + multi-intent reply keeps recipient ownership, supplements safely", () => {
    const reply =
      "The whole team, and honestly I just need them to know I'm overwhelmed.";
    const result = advanceUniversalCreation(askedRecipient(), reply)!;
    // Recipient owns the literal reply — NOT overwritten by harvest's "the team".
    expect(result.session.answers["email-recipient"]).toBe(reply);
    expect(result.session.answers["email-recipient"]).not.toBe("the team");
    // Genuinely volunteered purpose is supplemented into another slot.
    expect(Boolean(result.session.answers["email-purpose"])).toBe(true);
  });

  it("asked purpose + 'To update the client...' binds to purpose, invents no recipient", () => {
    const base = askedRecipient();
    const askedPurpose: UniversalCreationSession = { ...base, questionIndex: 2 }; // email-purpose
    const reply = "To update the client on the project timeline.";
    const result = advanceUniversalCreation(askedPurpose, reply)!;
    expect(result.session.answers["email-purpose"]).toBe(reply);
    // "client" must not fabricate or displace the recipient.
    expect("email-recipient" in result.session.answers).toBe(false);
    expect(result.kind).toBe("question");
    if (result.kind === "question") {
      expect(result.question).toMatch(/receiving this email/i);
    }
  });

  it("ambiguous 'I'm not sure' stays in clarification behavior (no binding)", () => {
    const result = advanceUniversalCreation(askedRecipient(), "I'm not sure")!;
    expect(result.kind).toBe("uncertainty");
    expect("email-recipient" in result.session.answers).toBe(false);
  });

  it("a mismatched answer is not silently rerouted to another gap slot", () => {
    // The D3 repro: a purpose-shaped reply to the recipient question.
    const reply = "To update the client on the project timeline.";
    const result = advanceUniversalCreation(askedRecipient(), reply)!;
    // It stays in the pending (recipient) slot — never rerouted to purpose,
    // never fabricated as "Client".
    expect(result.session.answers["email-recipient"]).toBe(reply);
    expect("email-purpose" in result.session.answers).toBe(false);
    expect(result.session.answers["email-recipient"]).not.toBe("Client");
  });

  it("harvest never overwrites the authoritative pending answer", () => {
    // "the whole crew" would harvest recipient = "the group"; the literal answer wins.
    const result = advanceUniversalCreation(askedRecipient(), "the whole crew")!;
    expect(result.session.answers["email-recipient"]).toBe("the whole crew");
    expect(result.session.answers["email-recipient"]).not.toBe("the group");
  });

  it("non-email flow still binds the pending answer and advances", () => {
    const start = startUniversalCreationTurn("Write an SOP", 1)!;
    expect(start.kind).toBe("question");
    const result = advanceUniversalCreation(start.session, "For my team")!;
    expect(result.session.answers["sop-audience-type"]).toBe("For my team");
    expect(result.kind).toBe("question");
  });
});

describe("advanceUniversalCreation — Create ownership preserved (S4.2 scenarios)", () => {
  beforeEach(() => clearUniversalCreationSession());

  it("scenario 2 ('To update the client...') stays Create-owned, no failsafe", () => {
    const result = advanceUniversalCreation(
      askedRecipient(),
      "To update the client on the project timeline.",
    );
    expect(result).not.toBeNull();
    expect(["question", "draft", "ready"]).toContain(result!.kind);
    expect(formatUniversalCreationTurnReply(result!)).not.toMatch(
      /practical way to approach/i,
    );
  });

  it("scenario 5 ('They need to know.') stays Create-owned, no failsafe", () => {
    const result = advanceUniversalCreation(askedRecipient(), "They need to know.");
    expect(result).not.toBeNull();
    expect(["question", "draft", "ready"]).toContain(result!.kind);
    expect(formatUniversalCreationTurnReply(result!)).not.toMatch(
      /practical way to approach/i,
    );
  });
});

describe("advanceUniversalCreation — compatibility fallback (legacy/malformed)", () => {
  beforeEach(() => clearUniversalCreationSession());

  it("out-of-range questionIndex falls back without throwing", () => {
    const base = startUniversalCreationTurn("Help me write an email.", 1)!.session;
    const outOfRange: UniversalCreationSession = { ...base, questionIndex: 99 };
    const result = advanceUniversalCreation(outOfRange, "the team");
    expect(result).not.toBeNull();
  });

  it("questionIndex pointing at an already-answered slot falls back", () => {
    const base = startUniversalCreationTurn("Help me write an email.", 1)!.session;
    const answered: UniversalCreationSession = {
      ...base,
      answers: { "email-recipient": "My accountant" },
      questionIndex: 0, // points at an answered slot -> no valid pending question
    };
    const result = advanceUniversalCreation(answered, "To update the client on timeline");
    expect(result).not.toBeNull();
  });
});
