/**
 * Commitment Recognition Gate — unit tests (Slice 0).
 *
 * Exercises `resolveCommitmentGate` in complete isolation — nothing here
 * touches storage, routing, or Universal Creation. Scenarios are drawn
 * directly from docs/estate/COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §3
 * and §10 (the Recognition Acceptance Tests), plus the six categories
 * requested for this slice: clear commitment, exploration, mixed
 * commitment + outcome doubt, overwhelmed commitment, multiple ideas,
 * and ambiguous "let's build it".
 */

import { describe, expect, it } from "vitest";
import { resolveCommitmentGate } from "./resolveCommitmentGate";
import type { WorkIdentityTransitionEvent } from "./types";

describe("resolveCommitmentGate — clear commitment", () => {
  it("an unhedged volitional statement about one named thing commits", () => {
    const result = resolveCommitmentGate({
      userText: "I want to create a workshop.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("commit");
    expect(result.reason).toBe("unhedged_commitment");
  });

  it("asking for help is still commitment, not lower-commitment (§4.2)", () => {
    const result = resolveCommitmentGate({
      userText: "I need help planning a workshop.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("commit");
    expect(result.reason).toBe("help_seeking_commitment");
  });
});

describe("resolveCommitmentGate — exploration", () => {
  it("decision-level hedging (might/someday) stays exploration", () => {
    const result = resolveCommitmentGate({
      userText: "I might create a workshop someday.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("decision_hedge");
  });

  it("naming an idea does not create work — no volitional language present", () => {
    const result = resolveCommitmentGate({
      userText: "I have an idea for a workshop.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("naming_without_volition");
  });

  it("genuine confusion stays exploration even with a work-object noun present", () => {
    const result = resolveCommitmentGate({
      userText: "I'm not sure what I even need help with, but maybe a workshop?",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("genuine_confusion");
  });
});

describe("resolveCommitmentGate — mixed commitment + outcome doubt (§6)", () => {
  it("outcome-level doubt (will anyone attend) does not cancel an otherwise-clear commitment", () => {
    const result = resolveCommitmentGate({
      userText: "I want to create a workshop, but I don't know if anyone would attend.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("commit");
    expect(result.reason).toBe("outcome_doubt_with_commitment");
  });

  it("preserved rule: outcome uncertainty does not cancel commitment", () => {
    const result = resolveCommitmentGate({
      userText: "I want to build a course, but I'm worried nobody would buy it.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("commit");
  });

  it("preserved rule: decision uncertainty (a hedge on the decision itself) keeps exploration", () => {
    const result = resolveCommitmentGate({
      userText: "I might build a course, but I haven't decided.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("decision_hedge");
  });
});

describe("resolveCommitmentGate — overwhelmed commitment (Support Gate PAUSE overrides language)", () => {
  it("a PAUSE tier forces exploration regardless of otherwise-clear commitment language", () => {
    const result = resolveCommitmentGate({
      userText: "I want to create a workshop, but I don't know if anyone would attend.",
      supportGateTier: "pause",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("support_gate_pause");
  });

  it("PAUSE overrides even the plainest possible commitment statement", () => {
    const result = resolveCommitmentGate({
      userText: "I want to create a workshop.",
      supportGateTier: "pause",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("support_gate_pause");
  });

  it("SOFTEN, unlike PAUSE, does not block commitment on its own", () => {
    const result = resolveCommitmentGate({
      userText: "I want to create a workshop.",
      supportGateTier: "soften",
    });
    expect(result.outcome).toBe("commit");
  });
});

describe("resolveCommitmentGate — multiple ideas", () => {
  it("naming several ideas with no selection keeps all of them as exploration", () => {
    const result = resolveCommitmentGate({
      userText: "I have ideas for a workshop, a newsletter, and a course.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("unselected_multiple_possibilities");
  });

  it("this function returns exactly one outcome for a multi-idea message — it cannot, by its own shape, mint multiple work identities from one turn", () => {
    const result = resolveCommitmentGate({
      userText: "I have ideas for a workshop, a newsletter, and a course.",
      supportGateTier: "proceed",
    });
    expect(result).not.toHaveProperty("outcomes");
    expect(typeof result.outcome).toBe("string");
  });

  it("selecting exactly one previously-named possibility commits only that one — founder choice creates commitment", () => {
    const result = resolveCommitmentGate({
      userText:
        "I have ideas for a retreat, newsletter, and course. Let's start with the retreat.",
      supportGateTier: "proceed",
      activePossibilities: [{ name: "retreat" }, { name: "newsletter" }, { name: "course" }],
    });
    expect(result.outcome).toBe("commit");
    expect(result.reason).toBe("named_selection");
    expect(result.matchedPossibility?.name).toBe("retreat");
  });

  it("a bare list with no selection phrase never commits, even with possibilities already on record", () => {
    const result = resolveCommitmentGate({
      userText: "I have ideas for a retreat, newsletter, and course.",
      supportGateTier: "proceed",
      activePossibilities: [{ name: "retreat" }, { name: "newsletter" }, { name: "course" }],
    });
    expect(result.outcome).not.toBe("commit");
  });
});

describe("resolveCommitmentGate — ambiguous \"let's build it\"", () => {
  it("a pronoun referring to one, unambiguous possibility resolves to commitment", () => {
    const result = resolveCommitmentGate({
      userText: "I've thought about it. Let's build it.",
      supportGateTier: "proceed",
      activePossibilities: [{ name: "workshop", kind: "workshop" }],
    });
    expect(result.outcome).toBe("commit");
    expect(result.reason).toBe("explicit_transition_phrase");
    expect(result.matchedPossibility?.name).toBe("workshop");
  });

  it("a pronoun with two or more open possibilities and no just-named referent asks, never guesses", () => {
    const result = resolveCommitmentGate({
      userText: "Let's build it.",
      supportGateTier: "proceed",
      activePossibilities: [
        { name: "workshop", kind: "workshop" },
        { name: "newsletter", kind: "newsletter" },
      ],
    });
    expect(result.outcome).toBe("clarify");
    expect(result.reason).toBe("ambiguous_referent");
    expect(result.candidatePossibilities).toHaveLength(2);
    // Preserved rule: ambiguous references do not create guessed workIds —
    // no possibility is ever silently chosen on the founder's behalf.
    expect(result.matchedPossibility).toBeUndefined();
  });
});

describe("resolveCommitmentGate — re-entry after a clarify question (§4.5, §9)", () => {
  it("an unhedged 'ready' answer commits", () => {
    const result = resolveCommitmentGate({
      userText: "Ready to start.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("commit");
  });

  it("an explicit deferral answer stays exploration", () => {
    const result = resolveCommitmentGate({
      userText: "No, still just thinking.",
      supportGateTier: "proceed",
    });
    expect(result.outcome).toBe("explore");
    expect(result.reason).toBe("explicit_deferral");
  });
});

describe("resolveCommitmentGate — purity and no side effects", () => {
  it("calling it repeatedly with the same input produces the same result (no hidden state)", () => {
    const input = {
      userText: "I want to create a workshop.",
      supportGateTier: "proceed" as const,
    };
    const first = resolveCommitmentGate(input);
    const second = resolveCommitmentGate(input);
    expect(first).toEqual(second);
  });

  it("never returns anything resembling a minted WorkId — outcome and reason are the whole result", () => {
    const result = resolveCommitmentGate({
      userText: "I want to create a workshop.",
      supportGateTier: "proceed",
    });
    expect(result).not.toHaveProperty("workId");
  });
});

describe("WorkIdentityTransitionEvent — type is usable, nothing constructs it in Slice 0", () => {
  it("each of the five verbs can be represented as data, without any system executing them", () => {
    const events: WorkIdentityTransitionEvent[] = [
      { verb: "create", workId: "w1", kind: "workshop" },
      { verb: "attach", workId: "w1", target: "session_artifact" },
      { verb: "pause", workId: "w1", reason: "founder changed direction" },
      { verb: "resume", workId: "w1" },
      { verb: "close", workId: "w1", via: "completion" },
    ];
    expect(events.map((e) => e.verb)).toEqual(["create", "attach", "pause", "resume", "close"]);
  });
});
