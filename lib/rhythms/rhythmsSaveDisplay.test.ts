/**
 * @vitest-environment jsdom
 *
 * Save → list → group display contract for the Rhythms room.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  setPlanDayOwnerUserId,
  getPlanDayOwnerUserId,
} from "@/lib/planMyDay/planDayOwner";
import { pauseRhythm } from "./actions";
import {
  createMemberRhythm,
  listMemberRhythms,
  getMemberRhythm,
} from "./store";
import {
  EMPTY_RHYTHM_FORM,
  groupRhythmsByCadence,
  rhythmPayloadFromForm,
  rhythmSaveSuccessMessage,
  RHYTHM_SAVE_FAILURE_MESSAGE,
} from "./rhythmForm";

describe("Rhythms save and display", () => {
  beforeEach(() => {
    localStorage.clear();
    setPlanDayOwnerUserId(null);
  });

  it("saves a Daily rhythm and lists it under Daily immediately", () => {
    const created = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Morning planning",
        cadence: "daily",
      }),
    );
    expect(getMemberRhythm(created.id)?.title).toBe("Morning planning");
    const daily = groupRhythmsByCadence(listMemberRhythms()).find(
      (g) => g.id === "daily",
    )!;
    expect(daily.items.map((r) => r.title)).toContain("Morning planning");
    expect(rhythmSaveSuccessMessage("daily")).toBe("Saved under Daily Rhythms.");
  });

  it("places Weekly under Weekly", () => {
    createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Friday finances",
        cadence: "weekly",
        weekdays: ["friday"],
      }),
    );
    const weekly = groupRhythmsByCadence(listMemberRhythms()).find(
      (g) => g.id === "weekly",
    )!;
    expect(weekly.items.map((r) => r.title)).toContain("Friday finances");
    expect(rhythmSaveSuccessMessage("weekly")).toBe(
      "Saved under Weekly Rhythms.",
    );
  });

  it("maps Monthly, Quarterly, Yearly, and Custom to the correct groups", () => {
    const specs = [
      { title: "Content review", cadence: "monthly" as const },
      { title: "Business review", cadence: "quarterly" as const },
      {
        title: "Yearly retreat",
        cadence: "yearly" as const,
        yearlyMonth: 12,
        yearlyDay: 15,
      },
      {
        title: "Biweekly check-in",
        cadence: "custom" as const,
        customNote: "Every 2 weeks",
      },
    ];
    for (const spec of specs) {
      createMemberRhythm(
        rhythmPayloadFromForm({ ...EMPTY_RHYTHM_FORM, ...spec }),
      );
    }
    const groups = groupRhythmsByCadence(listMemberRhythms());
    expect(groups.find((g) => g.id === "monthly")!.items[0]?.title).toBe(
      "Content review",
    );
    expect(groups.find((g) => g.id === "quarterly")!.items[0]?.title).toBe(
      "Business review",
    );
    expect(groups.find((g) => g.id === "yearly")!.items[0]?.title).toBe(
      "Yearly retreat",
    );
    expect(groups.find((g) => g.id === "custom")!.items[0]?.title).toBe(
      "Biweekly check-in",
    );
  });

  it("uses the same owner ID on create and read", () => {
    setPlanDayOwnerUserId("member-abc");
    const created = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Owned rhythm",
        cadence: "daily",
      }),
    );
    expect(created.ownerUserId).toBe("member-abc");
    expect(getPlanDayOwnerUserId()).toBe("member-abc");
    expect(localStorage.getItem("companion-rhythms-v1:member-abc")).toBeTruthy();
    expect(
      listMemberRhythms().find((r) => r.id === created.id)?.ownerUserId,
    ).toBe("member-abc");
  });

  it("keeps a rhythm after reload from storage", () => {
    const created = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Survives refresh",
        cadence: "weekly",
        weekdays: ["monday"],
      }),
    );
    const raw = localStorage.getItem("companion-rhythms-v1");
    expect(raw).toBeTruthy();
    // Simulate reload: clear in-memory owner and re-read
    setPlanDayOwnerUserId(null);
    const again = listMemberRhythms();
    expect(again.find((r) => r.id === created.id)?.title).toBe(
      "Survives refresh",
    );
  });

  it("shows a future-start rhythm in its group", () => {
    const nextYear = new Date().getFullYear() + 1;
    const created = createMemberRhythm({
      title: "Future yearly",
      cadence: "yearly",
      schedule: {
        cadence: "yearly",
        startDate: `${nextYear}-06-15`,
      },
      source: "user",
    });
    expect(created.nextDueAt).toBeTruthy();
    const yearly = groupRhythmsByCadence(listMemberRhythms()).find(
      (g) => g.id === "yearly",
    )!;
    expect(yearly.items.map((r) => r.id)).toContain(created.id);
  });

  it("keeps paused rhythms visible with paused status", () => {
    const created = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Paused visible",
        cadence: "daily",
      }),
    );
    pauseRhythm(created.id);
    const listed = listMemberRhythms().find((r) => r.id === created.id);
    expect(listed?.status).toBe("paused");
    const daily = groupRhythmsByCadence(listMemberRhythms()).find(
      (g) => g.id === "daily",
    )!;
    expect(daily.items.find((r) => r.id === created.id)?.status).toBe("paused");
  });

  it("does not treat a failed persist as success", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() =>
      createMemberRhythm(
        rhythmPayloadFromForm({
          ...EMPTY_RHYTHM_FORM,
          title: "Should fail",
          cadence: "daily",
        }),
      ),
    ).toThrow("RHYTHM_PERSIST_FAILED");
    expect(RHYTHM_SAVE_FAILURE_MESSAGE).toContain("couldn’t save");
    setItem.mockRestore();
    expect(listMemberRhythms().map((r) => r.title)).not.toContain("Should fail");
  });

  it("does not clear form values conceptually when save fails (payload preserved)", () => {
    const form = {
      ...EMPTY_RHYTHM_FORM,
      title: "Keep my draft",
      cadence: "monthly" as const,
      dayOfMonth: 12,
    };
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => createMemberRhythm(rhythmPayloadFromForm(form))).toThrow();
    setItem.mockRestore();
    // Form object in the UI is only cleared after confirmed save — values remain.
    expect(form.title).toBe("Keep my draft");
    expect(form.cadence).toBe("monthly");
    expect(form.dayOfMonth).toBe(12);
  });

  it("creates exactly one rhythm per successful submission", () => {
    createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Once only",
        cadence: "daily",
      }),
    );
    const matches = listMemberRhythms().filter((r) => r.title === "Once only");
    expect(matches).toHaveLength(1);
  });

  it("heals owner-scoped reads when data was saved unscoped", () => {
    setPlanDayOwnerUserId(null);
    const created = createMemberRhythm(
      rhythmPayloadFromForm({
        ...EMPTY_RHYTHM_FORM,
        title: "Unscoped first",
        cadence: "daily",
      }),
    );
    expect(localStorage.getItem("companion-rhythms-v1")).toBeTruthy();

    setPlanDayOwnerUserId("member-heal");
    localStorage.setItem("companion-rhythms-v1:member-heal", "[]");

    const listed = listMemberRhythms();
    expect(listed.find((r) => r.id === created.id)?.title).toBe("Unscoped first");
  });
});
