import { describe, expect, it } from "vitest";
import { pickJournalGazeboReturnNote } from "./returnGreetings";

describe("pickJournalGazeboReturnNote", () => {
  it("returns a greeting, question, and Shari signature", () => {
    const note = pickJournalGazeboReturnNote();
    expect(note.greeting.length).toBeGreaterThan(4);
    expect(note.question.length).toBeGreaterThan(8);
    expect(note.sign).toContain("Shari");
  });

  it("rotates to a different question when excluded", () => {
    const first = pickJournalGazeboReturnNote();
    let different = false;
    for (let i = 0; i < 12; i += 1) {
      const next = pickJournalGazeboReturnNote(first.question);
      if (next.question !== first.question) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });
});
