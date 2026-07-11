import { describe, expect, it } from "vitest";
import {
  buildCanonContextBlockForChat,
  getCanonLiveRooms,
  retrieveCanonContext,
  tryCanonLocalReply,
} from "@/lib/canonContext";

describe("canonContext", () => {
  it('answers "What is Spark Estate?" from canon', () => {
    const reply = tryCanonLocalReply("What is Spark Estate?");
    expect(reply).toContain("fictional");
    expect(reply).toContain("Companion Intelligence");
    expect(reply).toContain("Iowa");
  });

  it('answers "Who is Kinsey?" from canon', () => {
    const reply = tryCanonLocalReply("Who is Kinsey?");
    expect(reply).toContain("Kinsey");
    expect(reply).toContain("Lhasa Poo");
    expect(reply).toContain("real dog");
  });

  it('answers "Who is Shari?" from canon', () => {
    const reply = tryCanonLocalReply("Who is Shari?");
    expect(reply).toContain("Shari Hudson");
    expect(reply).toContain("Visual Spark Studios");
    expect(reply).toContain("Spark Estate");
  });

  it('answers "What rooms are in the estate?" from approved Live rooms', () => {
    const reply = tryCanonLocalReply("What rooms are in the estate?");
    expect(reply).toContain("Greenhouse");
    expect(reply).toContain("Sunroom");
    expect(getCanonLiveRooms().length).toBeGreaterThan(0);
  });

  it('answers "What is the dog\'s name in the picture?" from canon', () => {
    const question = "What is the dog's name in the picture?";
    const reply = tryCanonLocalReply(question);
    expect(reply).toContain("Kinsey");
    expect(reply?.toLowerCase()).not.toContain("the pet");
  });

  it('answers "Is Spark Estate a real place?" from canon', () => {
    const reply = tryCanonLocalReply("Is Spark Estate a real place?");
    expect(reply).toContain("fictional");
    expect(reply?.toLowerCase()).toContain("not an actual physical location");
  });

  it('answers "Where is Spark Estate located?" from canon', () => {
    const reply = tryCanonLocalReply("Where is Spark Estate located?");
    expect(reply).toContain("Iowa");
    expect(reply).toContain("story world");
  });

  it('answers "Who created Spark Estate?" from canon', () => {
    const reply = tryCanonLocalReply("Who created Spark Estate?");
    expect(reply).toContain("Shari Hudson");
    expect(reply).toContain("Visual Spark Studios");
  });

  it("injects CANON_CONTEXT before LLM assembly", () => {
    const block = buildCanonContextBlockForChat({
      userText: "Who is Kinsey?",
    });
    expect(block).toContain("CANON_CONTEXT");
    expect(block).toContain("Kinsey");
    expect(block).toContain("matchedTopics");
  });

  it("retrieves kinsey and estate topics for mixed questions", () => {
    const result = retrieveCanonContext({
      userText: "Tell me about Kinsey at Spark Estate",
    });
    expect(result.topics).toContain("kinsey");
    expect(result.topics).toContain("estate");
  });

  it("includes fiction-vs-reality guidance in retrieved estate payload", () => {
    const result = retrieveCanonContext({
      userText: "What is Spark Estate?",
    });
    expect(result.payload.estate.facts.fictionVsReality.length).toBeGreaterThan(0);
    expect(result.payload.estate.facts.purpose).toContain("meaningful lives");
  });
});
