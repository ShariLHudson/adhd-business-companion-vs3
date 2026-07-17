import { describe, expect, it } from "vitest";
import {
  classifyTechFutureTopic,
  resolveTechFutureChapters,
  techFutureHintForChat,
} from "./resolveTechFutureOffer";

describe("technologyFutureIntelligence — thin retrieval", () => {
  it("Should I switch CRMs? → CRM chapter, not a dump", () => {
    const text = "Should I switch CRMs?";
    expect(classifyTechFutureTopic(text)).toBe("crm");
    const chapters = resolveTechFutureChapters(text, { max: 1 });
    expect(chapters).toHaveLength(1);
    expect(chapters[0]!.id).toBe("TF-007");
    const hint = techFutureHintForChat(text);
    expect(hint).toMatch(/TF-007/);
    expect(hint).toMatch(/thin/);
    expect(hint).not.toMatch(/#{1,3} /);
    expect(hint?.length ?? 0).toBeLessThan(800);
  });

  it("prefers deeper AI chapter over TF-004 when AI time-saving", () => {
    const chapters = resolveTechFutureChapters(
      "Will AI save me time in my business?",
      { max: 1 },
    );
    expect(chapters[0]!.id).toMatch(/^TF-AI-/);
  });

  it("automation readiness maps to TF-AUTO", () => {
    const chapters = resolveTechFutureChapters(
      "Is this automation ready to build?",
      { max: 1 },
    );
    expect(chapters[0]!.id).toBe("TF-AUTO-001");
  });

  it("ordinary overwhelm does not inject technology chapters", () => {
    expect(techFutureHintForChat("I'm overwhelmed today.")).toBeNull();
    expect(techFutureHintForChat("I need to fold my laundry")).toBeNull();
  });

  it("shiny-object language maps to TF-001", () => {
    const chapters = resolveTechFutureChapters(
      "Should I try another shiny new AI tool?",
      { max: 1 },
    );
    expect(chapters[0]!.id).toBe("TF-001");
  });
});
