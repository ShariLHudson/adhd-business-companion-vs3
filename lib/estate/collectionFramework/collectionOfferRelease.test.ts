/**
 * Pre-Phase 3 — Collection save-offer ownership release regressions.
 * Decline / Not now / explicit task must release control without echo or re-arm.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCollectionPrefill,
  evaluateCollectionSaveOffer,
} from "./collectionOfferIntelligence";
import {
  createCollectionPendingOffer,
  resolveCollectionOfferReply,
} from "./collectionOfferFlow";
import {
  clearCollectionPendingOffer,
  loadCollectionPendingOffer,
  saveCollectionPendingOffer,
} from "./collectionPendingOffer";
import {
  clearAllCollectionPrefills,
  peekCollectionPrefill,
  setCollectionPrefill,
} from "./collectionPrefillStore";
import {
  clearCollectionOfferOwnership,
  hasPendingCollectionOwnership,
  isExplicitCreateOrRevisionRequest,
  shouldReArmCollectionConfirmation,
  shouldReleasePendingCollectionOwnership,
} from "./collectionOfferRelease";
import {
  clearWinSavePending,
  createWinSavePending,
  loadWinSavePending,
  resolveWinSaveReply,
  saveWinSavePending,
} from "@/lib/estate/winSavePending";
import {
  IDEA_VALIDATION_PLAYBOOK_TEXT,
  maySurfaceJourneyRecommendation,
  sanitizeCompanionFacingJourneyAdvice,
} from "@/lib/ecosystem/journey/founderJourneyEngine";
import { getFounderRecommendations } from "@/lib/ecosystem/recommendations/founderRecommendationEngine";
import { sampleJourneySamples } from "@/lib/ecosystem/journey/sampleJourneyData";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

describe("collection offer release — Pre-Phase 3 certification repair", () => {
  beforeEach(() => {
    const storage = memoryStorage();
    vi.stubGlobal("sessionStorage", storage);
    vi.stubGlobal("window", { sessionStorage: storage });
    clearCollectionPendingOffer();
    clearWinSavePending();
    clearAllCollectionPrefills();
  });

  it("Test 1 — decline releases the conversation (no confirmation re-arm)", () => {
    const source =
      "I handled a difficult client call today and figured out how to solve the billing issue without losing them.";
    const offer = evaluateCollectionSaveOffer({
      userText: source,
      currentTurn: 3,
    });
    expect(offer).not.toBeNull();
    const pending = createCollectionPendingOffer({
      roomId: offer!.roomId,
      sourceUserText: source,
      offerLine: offer!.offerLine,
      prefill: offer!.prefill,
      offeredAtTurn: 3,
    });
    saveCollectionPendingOffer(pending);

    const reply = resolveCollectionOfferReply("No", pending);
    expect(reply.handled).toBe(true);
    if (!reply.handled) return;
    expect(reply.kind).toBe("decline");
    expect(shouldReArmCollectionConfirmation(reply)).toBe(false);
    expect(loadCollectionPendingOffer()).toBeNull();
    expect(hasPendingCollectionOwnership()).toBe(false);

    // Next unrelated question must not see a pending offer.
    const next = resolveCollectionOfferReply(
      "What time is the board meeting?",
      loadCollectionPendingOffer(),
    );
    expect(next.handled).toBe(false);
  });

  it("Test 2 — Not now (4) releases Hall / win-save ownership", () => {
    const seed =
      "I finally finished the certification I've been working toward for two years.";
    const pending = createWinSavePending({ seedText: seed, offeredAtTurn: 4 });
    saveWinSavePending(pending);
    expect(hasPendingCollectionOwnership()).toBe(true);

    const reply = resolveWinSaveReply("4", pending);
    expect(reply.handled).toBe(true);
    if (!reply.handled) return;
    expect(reply.destination).toBe("not-now");
    expect(loadWinSavePending()).toBeNull();
    expect(hasPendingCollectionOwnership()).toBe(false);

    // Revision request must not be treated as a save-menu reply.
    const after = resolveWinSaveReply(
      "Add free delivery to the email.",
      loadWinSavePending(),
    );
    expect(after.handled).toBe(false);
    expect(
      isExplicitCreateOrRevisionRequest("Add free delivery to the email."),
    ).toBe(true);
  });

  it("Test 3 — explicit task overrides a pending offer", () => {
    const pending = createCollectionPendingOffer({
      roomId: "evidence-vault",
      sourceUserText: "Solved a tough client billing snag today.",
      offerLine: "Would you like to preserve this in your Evidence Vault?",
      prefill: buildCollectionPrefill(
        "evidence-vault",
        "Solved a tough client billing snag today.",
      ),
      offeredAtTurn: 5,
    });
    saveCollectionPendingOffer(pending);

    const release = shouldReleasePendingCollectionOwnership(
      "Add free delivery to the email.",
    );
    expect(release.release).toBe(true);
    expect(release.reason).toBe("explicit_create_or_revision");

    clearCollectionOfferOwnership({ currentTurn: 6 });
    expect(loadCollectionPendingOffer()).toBeNull();
    expect(hasPendingCollectionOwnership()).toBe(false);

    // Pending offer no longer owns the turn.
    const menuReply = resolveCollectionOfferReply(
      "Add free delivery to the email.",
      loadCollectionPendingOffer(),
    );
    expect(menuReply.handled).toBe(false);
  });

  it("Test 4 — no old-message echo after decline", () => {
    const distinctive =
      "UNIQUE_ECHO_MARKER_alpha_7f3c: I drafted a long marketing email about seasonal discounts and free delivery for loyal customers.";
    const pending = createCollectionPendingOffer({
      roomId: "journal",
      sourceUserText: distinctive,
      offerLine: "Would you like to save it in your Journal?",
      prefill: buildCollectionPrefill("journal", distinctive),
      offeredAtTurn: 2,
    });
    setCollectionPrefill({
      roomId: "journal",
      values: pending.prefill,
      sourceText: distinctive,
      savedAt: new Date().toISOString(),
    });
    saveCollectionPendingOffer(pending);

    const decline = resolveCollectionOfferReply("no", pending);
    expect(decline.handled).toBe(true);
    clearCollectionOfferOwnership({ currentTurn: 3 });

    expect(loadCollectionPendingOffer()).toBeNull();
    expect(peekCollectionPrefill("journal")).toBeNull();

    // Later turns must not see frozen source as live conversation context.
    const laterTurns = [
      "Can you tighten the subject line?",
      "Make it warmer.",
      "What about a P.S.?",
    ];
    for (const turn of laterTurns) {
      expect(turn.includes("UNIQUE_ECHO_MARKER")).toBe(false);
      const release = shouldReleasePendingCollectionOwnership(turn);
      expect(release.release).toBe(false);
      expect(hasPendingCollectionOwnership()).toBe(false);
    }
  });

  it("Test 5 — accepted save uses only the qualifying source", () => {
    const source =
      "I handled a difficult client call today and figured out how to solve the billing issue without losing them.";
    const pending = createCollectionPendingOffer({
      roomId: "evidence-vault",
      sourceUserText: source,
      offerLine: "Would you like to preserve this in your Evidence Vault?",
      prefill: buildCollectionPrefill("evidence-vault", source),
      offeredAtTurn: 7,
    });
    saveCollectionPendingOffer(pending);

    // Prefill must not be consumed before acceptance.
    expect(peekCollectionPrefill("evidence-vault")).toBeNull();

    const accept = resolveCollectionOfferReply("yes", pending);
    expect(accept.handled).toBe(true);
    if (!accept.handled) return;
    expect(accept.kind).toBe("open");
    expect(accept.openRoomId).toBe("evidence-vault");
    expect(accept.sourceText).toBe(source);
    expect(JSON.stringify(accept.prefill)).toMatch(/billing|client/i);
    expect(JSON.stringify(accept.prefill)).not.toMatch(/Add free delivery/);
    expect(loadCollectionPendingOffer()).toBeNull();
  });

  it("Test 6 — founder recommendation stays scoped", () => {
    expect(
      maySurfaceJourneyRecommendation(
        { text: IDEA_VALIDATION_PLAYBOOK_TEXT },
        "companion_chat",
      ),
    ).toBe(false);
    expect(
      maySurfaceJourneyRecommendation(
        { text: IDEA_VALIDATION_PLAYBOOK_TEXT },
        "create_workflow",
      ),
    ).toBe(false);
    expect(
      maySurfaceJourneyRecommendation(
        { text: IDEA_VALIDATION_PLAYBOOK_TEXT },
        "founder_journey",
        { currentStage: "idea" },
      ),
    ).toBe(true);

    const idea = sampleJourneySamples().find((s) => s.stage === "idea")!;
    const companionRecs = getFounderRecommendations(idea.events, idea.founderId, {
      profile: idea.profile,
      surface: "companion_chat",
    });
    expect(JSON.stringify(companionRecs).toLowerCase()).not.toMatch(
      /5 real conversations/,
    );

    const journeyRecs = getFounderRecommendations(idea.events, idea.founderId, {
      profile: idea.profile,
      surface: "founder_journey",
    });
    expect(JSON.stringify(journeyRecs).toLowerCase()).toMatch(
      /5 real conversations/,
    );

    const leaked =
      "Draft this email. Validate the idea with 5 real conversations before building anything.";
    expect(sanitizeCompanionFacingJourneyAdvice(leaked)).not.toMatch(
      /5 real conversations/i,
    );
  });

  it("Topic Jump certification — email revision overrides pending save prompt", () => {
    // Failed certification scenario: Collection/Hall prompt pending, then
    // "Add free delivery to the email." must complete without hijack.
    const pending = createCollectionPendingOffer({
      roomId: "evidence-vault",
      sourceUserText:
        "I finally got the client to renew after a tough conversation.",
      offerLine: "Would you like to preserve this in your Evidence Vault?",
      prefill: buildCollectionPrefill(
        "evidence-vault",
        "I finally got the client to renew after a tough conversation.",
      ),
      offeredAtTurn: 8,
    });
    saveCollectionPendingOffer(pending);
    const winPending = createWinSavePending({
      seedText: "I finally got the client to renew after a tough conversation.",
      offeredAtTurn: 8,
    });
    saveWinSavePending(winPending);

    const revision = "Add free delivery to the email.";
    const release = shouldReleasePendingCollectionOwnership(revision);
    expect(release.release).toBe(true);
    expect(
      ["explicit_create_or_revision", "task_change", "turn_recovery"].includes(
        release.reason,
      ),
    ).toBe(true);

    clearCollectionOfferOwnership({ currentTurn: 9 });
    expect(loadCollectionPendingOffer()).toBeNull();
    expect(loadWinSavePending()).toBeNull();
    expect(resolveCollectionOfferReply(revision, null).handled).toBe(false);
    expect(resolveWinSaveReply(revision, null).handled).toBe(false);
    expect(isExplicitCreateOrRevisionRequest(revision)).toBe(true);
  });

  it("Test 7 — confirmation cleanup on every exit path", () => {
    const exits: Array<{ text: string; via: "decline" | "release" }> = [
      { text: "No", via: "decline" },
      { text: "Not now", via: "decline" },
      { text: "cancel this", via: "release" },
      { text: "Add free delivery to the email.", via: "release" },
      {
        text: "Actually I meant rewrite the newsletter instead",
        via: "release",
      },
      { text: "never mind, stop that", via: "release" },
    ];

    for (const exit of exits) {
      clearCollectionPendingOffer();
      clearWinSavePending();
      clearAllCollectionPrefills();

      const pending = createCollectionPendingOffer({
        roomId: "celebration-hall",
        sourceUserText: "Launched my first paid offer today.",
        offerLine: "Hall of Accomplishments?",
        prefill: buildCollectionPrefill(
          "celebration-hall",
          "Launched my first paid offer today.",
        ),
        offeredAtTurn: 1,
      });
      saveCollectionPendingOffer(pending);
      setCollectionPrefill({
        roomId: "celebration-hall",
        values: pending.prefill,
        sourceText: pending.sourceUserText,
        savedAt: new Date().toISOString(),
      });

      if (exit.via === "decline") {
        const declineReply = resolveCollectionOfferReply(exit.text, pending);
        expect(declineReply.handled).toBe(true);
        if (declineReply.handled) {
          expect(declineReply.kind).toBe("decline");
          expect(shouldReArmCollectionConfirmation(declineReply)).toBe(false);
        }
        clearCollectionOfferOwnership({ currentTurn: 2 });
      } else {
        const release = shouldReleasePendingCollectionOwnership(exit.text);
        expect(release.release).toBe(true);
        clearCollectionOfferOwnership({ currentTurn: 2 });
      }

      expect(loadCollectionPendingOffer()).toBeNull();
      expect(loadWinSavePending()).toBeNull();
      expect(peekCollectionPrefill("celebration-hall")).toBeNull();
      expect(hasPendingCollectionOwnership()).toBe(false);
    }
  });
});
