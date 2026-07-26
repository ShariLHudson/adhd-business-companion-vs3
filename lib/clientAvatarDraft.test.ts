/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { getAvatars, saveAvatar } from "@/lib/companionStore";

/**
 * Contextual Workspace partial-save / draft-resume behavior at the store level.
 * The builder mints an id on first save so a one-question draft survives, then
 * merges by id on later saves, and records draftStepKey so re-entry resumes
 * exactly where the member left off.
 */
describe("client avatar draft persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mints an id and persists a partial draft on first save", () => {
    const list = saveAvatar({
      who: "Overwhelmed solo founders",
      draftStepKey: "who",
    });
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBeTruthy();
    expect(list[0]!.who).toBe("Overwhelmed solo founders");
    expect(list[0]!.draftStepKey).toBe("who");
    // Survives a reload (reads back from storage).
    expect(getAvatars()[0]!.who).toBe("Overwhelmed solo founders");
  });

  it("merges by id and preserves earlier answers on a later save", () => {
    const first = saveAvatar({ who: "Coaches", draftStepKey: "who" });
    const id = first[0]!.id;

    const second = saveAvatar({
      id,
      painPoints: "Too many tabs open",
      draftStepKey: "painPoints",
    });

    expect(second).toHaveLength(1);
    expect(second[0]!.id).toBe(id);
    expect(second[0]!.who).toBe("Coaches"); // earlier answer preserved
    expect(second[0]!.painPoints).toBe("Too many tabs open");
    expect(second[0]!.draftStepKey).toBe("painPoints"); // resume pointer advanced
  });

  it("resumes from the recorded draft step", () => {
    const saved = saveAvatar({
      who: "Freelancers",
      goals: "Steady income",
      draftStepKey: "goals",
    });
    const reloaded = getAvatars().find((a) => a.id === saved[0]!.id);
    expect(reloaded?.draftStepKey).toBe("goals");
  });
});
