/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { pickJournalGazeboReturnNote } from "./returnGreetings";

describe("pickJournalGazeboReturnNote", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns desk note body and Shari signature", () => {
    const note = pickJournalGazeboReturnNote();
    expect(note.body.length).toBeGreaterThan(8);
    expect(note.greeting).toBe(note.body);
    expect(note.sign).toContain("Shari");
  });

  it("rotates to a different note when excluded", () => {
    const first = pickJournalGazeboReturnNote();
    let different = false;
    for (let i = 0; i < 12; i += 1) {
      const next = pickJournalGazeboReturnNote(first.body);
      if (next.body !== first.body) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it("changes content across visits via last-note memory", () => {
    const first = pickJournalGazeboReturnNote();
    let different = false;
    for (let i = 0; i < 16; i += 1) {
      const next = pickJournalGazeboReturnNote();
      if (next.body !== first.body) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });
});
