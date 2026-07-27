import { describe, expect, it } from "vitest";
import {
  collectResearchRecordsFromSharedMessages,
  mapResearchFindingKind,
  researchRecordToSharedFinding,
  researchTurnToSharedMessage,
  researchTurnsToSharedMessages,
  sharedFindingToResearchRecord,
  sharedMessagesToConversationTurns,
} from "./findingAdapter";
import { findingMayShowCitation, makeFinding } from "@/lib/research/types";
import { addFindingsToCollection, createResearchCollection } from "./collection";
import { createResearchSession } from "./session";
import type {
  ResearchConversationTurn,
  ResearchFindingRecord,
} from "@/lib/researchLibrary/types";

function record(
  overrides: Partial<ResearchFindingRecord> = {},
): ResearchFindingRecord {
  return {
    id: "f1",
    title: "Advisory vs governing board",
    content: "Advisors typically guide; no formal fiduciary duty.",
    kind: "fact",
    sourceTitle: "Spark Estate stable knowledge",
    sourceType: "stable_knowledge",
    publisher: "Spark Estate",
    retrievalDate: "2026-07-27",
    publicationDate: null,
    confidence: "medium",
    freshness: "stable",
    verificationStatus: "partially_verified",
    important: false,
    ...overrides,
  };
}

describe("findingAdapter — existing records → built_in_guidance", () => {
  it("maps a stable-knowledge record to built_in_guidance with no citation metadata", () => {
    const shared = researchRecordToSharedFinding(record());
    expect(shared.id).toBe("f1");
    expect(shared.title).toBe("Advisory vs governing board");
    expect(shared.content).toContain("Advisors typically guide");
    expect(shared.kind).toBe("fact");
    expect(shared.evidenceBasis).toBe("built_in_guidance");
    // No citation metadata survives the adapter.
    expect(shared.sources).toEqual([]);
    expect(shared.confidence).toBeUndefined();
    expect(shared.freshness).toBeUndefined();
    expect(shared.verificationStatus).toBeUndefined();
    expect(findingMayShowCitation(shared)).toBe(false);
  });

  it("cannot be tricked into a citation, even by a record claiming a real source", () => {
    const smuggled = record({
      sourceType: "public",
      sourceTitle: "Reuters: Board governance 2026",
      publisher: "Reuters",
      publicationDate: "2026-06-01",
      confidence: "high",
      verificationStatus: "verified",
    });
    const shared = researchRecordToSharedFinding(smuggled);
    expect(shared.evidenceBasis).toBe("built_in_guidance");
    expect(shared.sources).toEqual([]);
    expect(findingMayShowCitation(shared)).toBe(false);
  });

  it("does not mutate the input record (pure; nothing rewritten)", () => {
    const input = record();
    const snapshot = JSON.parse(JSON.stringify(input));
    researchRecordToSharedFinding(input);
    expect(input).toEqual(snapshot);
  });

  it("keeps known kinds and falls back safely for unknown ones", () => {
    expect(mapResearchFindingKind("recommendation")).toBe("recommendation");
    expect(mapResearchFindingKind("risk")).toBe("risk");
    expect(mapResearchFindingKind("mystery" as ResearchFindingRecord["kind"])).toBe(
      "theme",
    );
  });
});

describe("findingAdapter — conversation turns → shared messages", () => {
  const turn = (
    o: Partial<ResearchConversationTurn> & { id: string; role: "user" | "assistant"; content: string },
  ): ResearchConversationTurn => ({ createdAt: "2026-07-27T00:00:00Z", ...o });

  it("maps a user turn with no findings", () => {
    const m = researchTurnToSharedMessage(turn({ id: "u1", role: "user", content: "advisory boards?" }));
    expect(m).toEqual({ id: "u1", role: "user", content: "advisory boards?" });
    expect(m.findings).toBeUndefined();
  });

  it("attaches a turn's findings as built_in_guidance shared findings", () => {
    const findings = [record({ id: "f1" }), record({ id: "f2", title: "Common value areas" })];
    const byId = new Map(findings.map((f) => [f.id, f] as const));
    const m = researchTurnToSharedMessage(
      turn({ id: "a1", role: "assistant", content: "Here's a start.", findingIdsAdded: ["f1", "f2"] }),
      byId,
    );
    expect(m.findings).toHaveLength(2);
    expect(m.findings!.every((f) => f.evidenceBasis === "built_in_guidance")).toBe(true);
    expect(m.findings!.some(findingMayShowCitation)).toBe(false);
  });

  it("maps a full transcript, linking findings by id", () => {
    const findings = [record({ id: "f1" })];
    const msgs = researchTurnsToSharedMessages(
      [
        turn({ id: "u1", role: "user", content: "q" }),
        turn({ id: "a1", role: "assistant", content: "a", findingIdsAdded: ["f1"] }),
      ],
      findings,
    );
    expect(msgs.map((m) => m.role)).toEqual(["user", "assistant"]);
    expect(msgs[1]!.findings).toHaveLength(1);
  });
});

describe("findingAdapter — write shared results back into existing records", () => {
  const guidance = makeFinding({
    id: "g1",
    title: "Typical structure",
    content: "Start with 3–5 advisors.",
    kind: "example",
    evidenceBasis: "built_in_guidance",
  });

  it("drops the hidden seed and records findingIdsAdded", () => {
    const turns = sharedMessagesToConversationTurns(
      [
        { id: "u0", role: "user", content: "seed", hidden: true },
        { id: "a1", role: "assistant", content: "Here's a start.", findings: [guidance] },
        { id: "u1", role: "user", content: "follow-up" },
      ],
      "2026-07-27T00:00:00Z",
    );
    expect(turns.map((t) => t.id)).toEqual(["a1", "u1"]); // hidden seed dropped
    expect(turns[0]!.findingIdsAdded).toEqual(["g1"]);
    expect(turns[1]!.findingIdsAdded).toBeUndefined();
  });

  it("stores findings with NO source metadata, so the collection has no synthetic sources", () => {
    const records = collectResearchRecordsFromSharedMessages([
      { id: "a1", role: "assistant", content: "…", findings: [guidance] },
    ]);
    expect(records).toHaveLength(1);
    expect(records[0]!.sourceTitle).toBe("");
    expect(records[0]!.sourceType).toBe("stable_knowledge");

    const session = createResearchSession({ text: "advisory board" });
    const collection = addFindingsToCollection(
      createResearchCollection(session),
      records,
    );
    // The aggregate "Sources" the collection view reads is empty — nothing synthetic.
    expect(collection.sourceReferences).toEqual([]);
    expect(collection.findings).toHaveLength(1);
  });

  it("a stored shared finding round-trips back to built_in_guidance (no citation)", () => {
    const record = sharedFindingToResearchRecord(guidance);
    const backToShared = researchRecordToSharedFinding(record);
    expect(backToShared.evidenceBasis).toBe("built_in_guidance");
    expect(findingMayShowCitation(backToShared)).toBe(false);
  });
});
