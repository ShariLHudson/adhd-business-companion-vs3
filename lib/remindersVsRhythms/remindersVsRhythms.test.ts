/**
 * Reminders vs Rhythms — guidance, Help Me Choose, entrance routing, persistence.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  REMINDERS_RHYTHMS_ENTRANCE,
  REMINDERS_RHYTHMS_ENTRANCE_ACTION_ID,
  REMINDERS_RHYTHMS_ENTRANCE_SECTION,
  buildConversationTypeConfirm,
  classifyReminderOrRhythm,
  clearReminderFormDraft,
  loadReminderFormDraft,
  resolveHelpMeChooseClarify,
  resolveHelpMeChoosePrimary,
  saveReminderFormDraft,
  partitionRhythmsForLists,
} from "./index";
import type { MemberRhythm } from "@/lib/rhythms/types";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

beforeEach(() => {
  localStorage.clear();
});

describe("routing contract for Welcome Home My Day", () => {
  it("exports a stable shared entrance section and action id", () => {
    expect(REMINDERS_RHYTHMS_ENTRANCE_SECTION).toBe("reminders-rhythms");
    expect(REMINDERS_RHYTHMS_ENTRANCE_ACTION_ID).toBe(
      "openRemindersRhythmsCore",
    );
    expect(REMINDERS_RHYTHMS_ENTRANCE.label).toBe("Reminders / Rhythms");
  });

  it("CompanionPageClient wires openRemindersRhythmsCore and shared window panel", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function openRemindersRhythmsCore(");
    expect(client).toContain(
      'openStandaloneFocusSectionCore("reminders-rhythms")',
    );
    expect(client).toContain("RemindersRhythmsEntrancePanel");
    expect(client).toContain('activeSection === "reminders-rhythms"');
    expect(client).toContain("initialChild={remindersRhythmsSharedChild}");
  });

  it("shared window exposes Reminder and Rhythm choices plus one How Do I", () => {
    const panel = read(
      "components/companion/RemindersRhythmsEntrancePanel.tsx",
    );
    expect(panel).toContain("entrance-reminder-card");
    expect(panel).toContain("entrance-rhythm-card");
    expect(panel).toContain("reminders-rhythms-shared-how-do-i");
    expect(panel).toContain("reminders-rhythms-difference-cue");
    expect(panel).toContain('data-shared-window="true"');
  });
});

describe("Help Me Choose classifier", () => {
  it("routes specific time to reminder and flexible repeated to rhythm", () => {
    expect(classifyReminderOrRhythm("Call Mary tomorrow at 2pm")).toBe(
      "reminder",
    );
    expect(
      classifyReminderOrRhythm("Every Friday review finances in the afternoon"),
    ).toBe("rhythm");
    expect(classifyReminderOrRhythm("remember to follow up")).toBe(
      "ambiguous",
    );
  });

  it("primary choice confirms before create", () => {
    const specific = resolveHelpMeChoosePrimary("specific_time");
    expect(specific.phase).toBe("confirm");
    if (specific.phase === "confirm") {
      expect(specific.recommendation).toBe("reminder");
    }
    const regular = resolveHelpMeChoosePrimary("flexible_repeated");
    expect(regular.phase).toBe("confirm");
    if (regular.phase === "confirm") {
      expect(regular.recommendation).toBe("rhythm");
    }
    expect(resolveHelpMeChoosePrimary("not_sure").phase).toBe("clarify");
  });

  it("clarify once/at time → reminder; regularly → rhythm", () => {
    expect(resolveHelpMeChooseClarify("once").phase).toBe("confirm");
    expect(resolveHelpMeChooseClarify("at_a_time").phase).toBe("confirm");
    const once = resolveHelpMeChooseClarify("once");
    if (once.phase === "confirm") expect(once.recommendation).toBe("reminder");
    const reg = resolveHelpMeChooseClarify("regularly");
    if (reg.phase === "confirm") expect(reg.recommendation).toBe("rhythm");
    expect(resolveHelpMeChooseClarify("still_unsure").phase).toBe("unsure");
  });

  it("conversation confirm explains type", () => {
    const text = buildConversationTypeConfirm({
      kind: "rhythm",
      title: "Friday finance",
    });
    expect(text).toMatch(/Rhythm/i);
    expect(text).toMatch(/Shall I create it/);
  });
});

describe("draft persistence", () => {
  it("persists reminder form draft across load", () => {
    saveReminderFormDraft({
      title: "Call accountant",
      date: "2026-07-20",
      time: "14:00",
      repeat: "none",
      notes: "",
      customRepeatNote: "",
    });
    expect(loadReminderFormDraft().title).toBe("Call accountant");
    clearReminderFormDraft();
    expect(loadReminderFormDraft().title).toBe("");
  });
});

describe("rhythm list partitions", () => {
  it("splits today / active / paused without merging reminder data", () => {
    const now = new Date();
    const todayIso = now.toISOString();
    const rhythms = [
      {
        id: "1",
        title: "Today one",
        cadence: "daily",
        status: "active",
        nextDueAt: todayIso,
      },
      {
        id: "2",
        title: "Later",
        cadence: "weekly",
        status: "active",
        nextDueAt: "2099-01-01T12:00:00.000Z",
      },
      {
        id: "3",
        title: "Paused",
        cadence: "daily",
        status: "paused",
      },
    ] as MemberRhythm[];
    const parts = partitionRhythmsForLists(rhythms);
    expect(parts.today.map((r) => r.id)).toContain("1");
    expect(parts.active.map((r) => r.id)).toContain("2");
    expect(parts.paused.map((r) => r.id)).toEqual(["3"]);
  });
});
