import { describe, expect, it } from "vitest";
import {
  buildClientAvatarWorkspaceOffer,
  detectClientAvatarExploration,
  isClientAvatarOfferAcceptance,
} from "./clientAvatarOffer";
import { detectUniversalCapabilityRequest } from "./universalAccess/detectUniversalCapabilityRequest";
import {
  getKnowledgeItem,
  getLiveKnowledgeItems,
  searchKnowledgeItems,
} from "./estateKnowledgeBase/loader";
import { buildAnswerFirstFailSafeReply } from "./shariAnswerFirst/failSafeReply";

describe("Client Avatar routing repair", () => {
  // A — exploratory language resolves to the client-avatars offer.
  it("A — exploratory phrases resolve to the client-avatars offer", () => {
    for (const phrase of [
      "I need help figuring out who my ideal customer is",
      "who do I help?",
      "who should I serve?",
      "help me define my target audience",
      "I need to create a customer persona",
      "can you help me build my client avatar?",
    ]) {
      expect(detectClientAvatarExploration(phrase)).toBe(true);
    }
    expect(buildClientAvatarWorkspaceOffer().section).toBe("client-avatars");
  });

  // B — existing vocabulary regression.
  it("B — ideal client / buyer persona / target audience still resolve", () => {
    expect(detectClientAvatarExploration("let's work on my ideal client")).toBe(
      true,
    );
    expect(detectClientAvatarExploration("what's a buyer persona")).toBe(true);
    expect(detectClientAvatarExploration("my target audience")).toBe(true);
  });

  // C — negative controls: bare words must not trigger.
  it("C — unrelated uses of customer/help/people/audience do not trigger", () => {
    for (const phrase of [
      "the customer was really happy today",
      "I need help with my taxes",
      "a lot of people showed up",
      "the audience laughed at the joke",
      "can you help me write an email",
    ]) {
      expect(detectClientAvatarExploration(phrase)).toBe(false);
    }
  });

  // D — JSON Knowledge Base.
  it("D — client-avatars exists as a Live feature and resolves for new vocab", () => {
    const item = getKnowledgeItem("features", "client-avatars");
    expect(item).not.toBeNull();
    expect(item!.status).toBe("Live");
    expect(item!.route).toBe("/companion?section=client-avatars");
    expect(
      getLiveKnowledgeItems("features").some((i) => i.id === "client-avatars"),
    ).toBe(true);
    for (const q of ["ideal customer", "who do i help", "target audience"]) {
      expect(
        searchKnowledgeItems(q).some((i) => i.id === "client-avatars"),
      ).toBe(true);
    }
  });

  // E — behavioral routing: the full phrase produces a client-avatars offer,
  // not category:none / strategy-only.
  it("E — the full ideal-customer phrase produces a client-avatars offer", () => {
    const phrase =
      "I need help figuring out who my ideal customer is for Spark Estate.";
    expect(detectClientAvatarExploration(phrase)).toBe(true);
    expect(buildClientAvatarWorkspaceOffer().section).toBe("client-avatars");
    // And it must NOT be treated as an explicit immediate-open command.
    expect(detectUniversalCapabilityRequest(phrase)).toBeNull();
  });

  // F — ownership acceptance: natural replies accept the offer.
  it("F — natural acceptance replies accept the Client Avatar offer", () => {
    for (const reply of [
      "yes",
      "go",
      "take me there",
      "let's do it",
      "that sounds good",
      "sure",
      "okay",
    ]) {
      expect(isClientAvatarOfferAcceptance(reply)).toBe(true);
    }
    // A genuine decline / unrelated reply is not acceptance.
    expect(isClientAvatarOfferAcceptance("no thanks")).toBe(false);
    expect(isClientAvatarOfferAcceptance("what does that mean?")).toBe(false);
  });

  // Explicit navigation commands DO immediate-open via the capability recognizer.
  it("explicit navigation commands immediate-open client-avatars", () => {
    for (const cmd of [
      "open the Client Avatar Builder",
      "take me to People I Help",
      "go to my client avatars",
      "start the Client Avatar Builder",
    ]) {
      expect(detectUniversalCapabilityRequest(cmd)?.section).toBe(
        "client-avatars",
      );
    }
  });

  // Soft/build phrasing must NOT immediate-open (goes to the offer instead).
  it("soft/build avatar phrasing does not immediate-open", () => {
    for (const phrase of [
      "can you help me build my client avatar?",
      "I need help figuring out who my ideal customer is",
      "who do I help?",
    ]) {
      expect(detectUniversalCapabilityRequest(phrase)).toBeNull();
    }
  });

  // C / D — the Client Avatar phrases are claimed by the deterministic detector,
  // so the turn is intercepted before the generic "practical way to approach…"
  // answer-first failsafe (the responder that was overwriting the reply) can run.
  it("C — the manual overwrite phrases are claimed by the deterministic detector", () => {
    for (const phrase of [
      "I need help figuring out who my ideal customer is for Spark Estate.",
      "Who do I help?",
    ]) {
      expect(detectClientAvatarExploration(phrase)).toBe(true);
    }
  });

  // G — genuine task-planning still flows to the generic productivity responder
  // (the detector must NOT claim it), and that responder still produces the
  // "practical way to approach…" reply for those turns.
  it("G — unrelated task-planning still uses the generic productivity responder", () => {
    for (const phrase of [
      "how do I run a vendor booth",
      "help me plan a product launch",
      "what's a good way to organize my week",
    ]) {
      expect(detectClientAvatarExploration(phrase)).toBe(false);
    }
    // The generic failsafe remains available for a genuine how-to task.
    const generic = buildAnswerFirstFailSafeReply("how do I run a vendor booth");
    expect(generic).not.toBeNull();
  });
});
