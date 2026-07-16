/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeRhythmOccurrence,
  pauseRhythm,
  resumeRhythm,
  skipRhythmOccurrence,
} from "./actions";
import {
  createMemberRhythm,
  deleteMemberRhythm,
  listMemberRhythms,
  updateMemberRhythm,
} from "./store";
import {
  EMPTY_RHYTHM_FORM,
  groupRhythmsByCadence,
  parseCustomIntervalDays,
  rhythmPayloadFromForm,
} from "./rhythmForm";

describe("Rhythms room form + store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates daily, weekly, monthly, quarterly, yearly, and custom rhythms in correct groups", () => {
    const specs = [
      { ...EMPTY_RHYTHM_FORM, title: "Morning planning", cadence: "daily" as const },
      {
        ...EMPTY_RHYTHM_FORM,
        title: "Friday finances",
        cadence: "weekly" as const,
        weekdays: ["friday" as const],
      },
      {
        ...EMPTY_RHYTHM_FORM,
        title: "Content review",
        cadence: "monthly" as const,
        dayOfMonth: 15,
      },
      {
        ...EMPTY_RHYTHM_FORM,
        title: "Business review",
        cadence: "quarterly" as const,
        quarterlyStartMonth: 1,
      },
      {
        ...EMPTY_RHYTHM_FORM,
        title: "Yearly retreat",
        cadence: "yearly" as const,
        yearlyMonth: 12,
        yearlyDay: 15,
      },
      {
        ...EMPTY_RHYTHM_FORM,
        title: "Biweekly check-in",
        cadence: "custom" as const,
        customNote: "Every 2 weeks",
      },
    ];

    for (const form of specs) {
      createMemberRhythm(rhythmPayloadFromForm(form));
    }

    const groups = groupRhythmsByCadence(listMemberRhythms());
    expect(groups.find((g) => g.id === "daily")!.items.map((r) => r.title)).toContain(
      "Morning planning",
    );
    expect(groups.find((g) => g.id === "weekly")!.items.map((r) => r.title)).toContain(
      "Friday finances",
    );
    expect(groups.find((g) => g.id === "monthly")!.items.map((r) => r.title)).toContain(
      "Content review",
    );
    expect(groups.find((g) => g.id === "quarterly")!.items.map((r) => r.title)).toContain(
      "Business review",
    );
    expect(groups.find((g) => g.id === "yearly")!.items.map((r) => r.title)).toContain(
      "Yearly retreat",
    );
    expect(groups.find((g) => g.id === "custom")!.items.map((r) => r.title)).toContain(
      "Biweekly check-in",
    );
  });

  it("edits, pauses, resumes, skips, completes, and deletes without losing other rhythms", () => {
    const keep = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Keep me",
        cadence: "weekly",
        weekdays: ["monday"],
      }),
    );
    const target = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Target",
        cadence: "daily",
      }),
    );

    updateMemberRhythm(target.id, { title: "Target edited" });
    expect(listMemberRhythms().find((r) => r.id === target.id)?.title).toBe(
      "Target edited",
    );

    pauseRhythm(target.id);
    expect(listMemberRhythms().find((r) => r.id === target.id)?.status).toBe(
      "paused",
    );
    resumeRhythm(target.id);
    expect(listMemberRhythms().find((r) => r.id === target.id)?.status).toBe(
      "active",
    );

    skipRhythmOccurrence(target.id);
    completeRhythmOccurrence(target.id);

    deleteMemberRhythm(target.id);
    const remaining = listMemberRhythms();
    expect(remaining.find((r) => r.id === target.id)).toBeUndefined();
    expect(remaining.find((r) => r.id === keep.id)?.title).toBe("Keep me");
  });

  it("parses plain custom interval wording", () => {
    expect(parseCustomIntervalDays("Every 2 weeks")).toBe(14);
    expect(parseCustomIntervalDays("Every 3 months")).toBe(90);
    expect(parseCustomIntervalDays("First Monday of each month")).toBeUndefined();
  });

  it("throws when an edit cannot persist and keeps the prior rhythm", () => {
    const created = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Keep original",
        cadence: "daily",
      }),
    );
    const proto = Object.getPrototypeOf(localStorage);
    const originalSet = proto.setItem as (key: string, value: string) => void;
    const setItem = vi
      .spyOn(proto, "setItem")
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (String(value).includes("Should not stick")) {
          throw new Error("quota");
        }
        return originalSet.call(this, key, value);
      });
    expect(() =>
      updateMemberRhythm(created.id, { title: "Should not stick" }),
    ).toThrow("RHYTHM_PERSIST_FAILED");
    setItem.mockRestore();
    expect(listMemberRhythms().find((r) => r.id === created.id)?.title).toBe(
      "Keep original",
    );
  });

  it("reuses companion-rhythms-v1 storage key", () => {
    createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Stored",
        cadence: "daily",
      }),
    );
    expect(localStorage.getItem("companion-rhythms-v1")).toBeTruthy();
    expect(localStorage.getItem("companion-rhythms-v2")).toBeNull();
  });
});
