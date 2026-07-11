import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertNeverAutoInduct,
  canInductIntoHall,
  canTransitionLifecycle,
} from "./lifecycle";
import {
  applyMemberRoomOverride,
  buildPreserveFirstDecision,
  celebrationRoomForTone,
  evaluateRecognitionRouting,
  shouldBlockCreateRouting,
} from "./routing";
import {
  canClaimAlreadyHere,
  clearRecognitionFlow,
  getRecognitionRoomState,
  resetRecognitionRoomStateForTests,
  setRequestedDestination,
  setVisualRoom,
  startRecognitionFlow,
} from "./roomState";
import {
  createRecognitionRecord,
  inductHallExhibit,
  listHallExhibits,
  markHallCandidate,
  removeHallExhibit,
  resetRecognitionStoreForTests,
  searchRecognitionRecords,
} from "./store";
import { detectRecognitionTriggers } from "./triggers";
import { coldStartForRoom } from "./coldStart";

describe("sparkRecognitionEngine lifecycle", () => {
  it("allows preserve from captured", () => {
    expect(canTransitionLifecycle("captured", "preserved")).toBe(true);
  });

  it("never auto-inducts without confirmation", () => {
    expect(
      canInductIntoHall({
        current: "hall_candidate",
        userConfirmedHall: false,
      }),
    ).toBe(false);
    expect(() =>
      assertNeverAutoInduct("hall_exhibit", false),
    ).toThrow(/explicit member confirmation/i);
  });

  it("allows induction when member confirms", () => {
    expect(
      canInductIntoHall({
        current: "hall_candidate",
        userConfirmedHall: true,
      }),
    ).toBe(true);
  });
});

describe("sparkRecognitionEngine room state", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    resetRecognitionRoomStateForTests();
    resetRecognitionStoreForTests();
  });

  it("refuses already-here when visual room mismatches", () => {
    setVisualRoom("gardens");
    expect(canClaimAlreadyHere("evidence-vault")).toBe(false);
    expect(canClaimAlreadyHere("gardens")).toBe(true);
  });

  it("treats Bank/Wins aliases as already-here for Vault/Garden", () => {
    setVisualRoom("evidence-vault");
    expect(canClaimAlreadyHere("evidence-bank")).toBe(true);
    setVisualRoom("gardens");
    expect(canClaimAlreadyHere("wins-this-week")).toBe(true);
    expect(canClaimAlreadyHere("celebration-garden")).toBe(true);
  });

  it("tracks requested destination and active flow", () => {
    setRequestedDestination("evidence-vault");
    startRecognitionFlow({
      kind: "preserve_discovery",
      path: "fast",
    });
    const state = getRecognitionRoomState();
    expect(state.requestedDestination).toBe("evidence-vault");
    expect(state.activeRecognitionFlow?.kind).toBe("preserve_discovery");
    clearRecognitionFlow();
    expect(getRecognitionRoomState().activeRecognitionFlow).toBeNull();
  });
});

describe("sparkRecognitionEngine recognition IDs", () => {
  it("maps Bank/Wins/Hall collection aliases to canonical places", async () => {
    const {
      toCanonicalRecognitionRoomId,
      recognitionRoomsEquivalent,
    } = await import("./recognitionIds");
    expect(toCanonicalRecognitionRoomId("evidence-bank")).toBe("evidence-vault");
    expect(toCanonicalRecognitionRoomId("wins-this-week")).toBe("gardens");
    expect(toCanonicalRecognitionRoomId("celebration-hall")).toBe(
      "celebration-room",
    );
    expect(toCanonicalRecognitionRoomId("hall-of-accomplishments")).toBe(
      "portfolio",
    );
    expect(
      recognitionRoomsEquivalent("portfolio", "growth-portfolio"),
    ).toBe(true);
    expect(
      recognitionRoomsEquivalent("portfolio", "gallery-of-firsts"),
    ).toBe(false);
    expect(recognitionRoomsEquivalent("evidence-bank", "evidence-vault")).toBe(
      true,
    );
  });
});

describe("sparkRecognitionEngine routing", () => {
  it("defaults to preserve-first", () => {
    const decision = buildPreserveFirstDecision();
    expect(decision.suggestedRoomId).toBe("evidence-vault");
    expect(decision.preserveFirst).toBe(true);
    expect(decision.options).toContain("preserve_it");
  });

  it("routes festive tone to celebration room", () => {
    expect(celebrationRoomForTone("joyful")).toBe("celebration-room");
    expect(celebrationRoomForTone("grateful")).toBe("gardens");
  });

  it("honors member override immediately", () => {
    const decision = applyMemberRoomOverride("gardens");
    expect(decision.suggestedRoomId).toBe("gardens");
    expect(decision.reason).toBe("member_override");
  });

  it("blocks Create when preserve triggers fire", () => {
    const trigger = detectRecognitionTriggers(
      "I figured out how to help my VA create Loom videos.",
    );
    expect(trigger.matched).toBe(true);
    expect(trigger.suggestsPreserve).toBe(true);
    expect(
      shouldBlockCreateRouting({
        trigger,
        visualRoom: null,
      }),
    ).toBe(true);
  });

  it("evaluates celebration language toward celebration choice", () => {
    const trigger = detectRecognitionTriggers("I launched my app!");
    const decision = evaluateRecognitionRouting({ trigger, tone: "joyful" });
    expect(decision.options).toContain("quiet_moment");
    expect(decision.options).toContain("joyful_celebration");
  });
});

describe("sparkRecognitionEngine store", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    resetRecognitionStoreForTests();
  });

  it("creates and searches recognition records", () => {
    createRecognitionRecord({
      recordType: "discovery",
      title: "Loom training for VA",
      body: "Figured out a Loom workflow",
      tags: ["operations"],
    });
    const hits = searchRecognitionRecords("loom");
    expect(hits).toHaveLength(1);
    expect(hits[0].lifecycleStatus).toBe("captured");
  });

  it("inducts Hall exhibit as separate record and can remove without deleting source", () => {
    const source = createRecognitionRecord({
      recordType: "discovery",
      title: "First client",
      body: "Closed first client",
    });
    markHallCandidate(source.id);
    const exhibit = inductHallExhibit({
      sourceRecordId: source.id,
      title: "First Client",
      userConfirmedHall: true,
    });
    expect(listHallExhibits()).toHaveLength(1);
    expect(exhibit.relatedEvidenceIds).toContain(source.id);

    removeHallExhibit(exhibit.id);
    expect(listHallExhibits()).toHaveLength(0);
    const stillThere = searchRecognitionRecords("First client");
    expect(stillThere).toHaveLength(1);
  });

  it("refuses Hall induction without confirmation", () => {
    const source = createRecognitionRecord({
      recordType: "discovery",
      title: "Milestone",
    });
    expect(() =>
      inductHallExhibit({
        sourceRecordId: source.id,
        title: "Milestone",
        userConfirmedHall: false,
      }),
    ).toThrow(/explicit member confirmation/i);
  });
});

describe("sparkRecognitionEngine cold start", () => {
  it("returns inviting copy for empty Hall", () => {
    const copy = coldStartForRoom("portfolio");
    expect(copy.body).toMatch(/Nothing has to be added today/i);
  });
});
