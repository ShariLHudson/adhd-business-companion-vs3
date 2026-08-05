import { describe, expect, it, beforeEach, vi } from "vitest";
import { evaluateRecognitionMoment } from "./recognitionEngine";
import {
  activeMessages,
  MESSAGE_SLOT_CAPACITY,
  pickRotatingMessage,
  RECOGNITION_MESSAGE_LIBRARY,
} from "./messageLibrary";
import {
  buildRecognitionQueue,
  pickTodaysRecognition,
  RECOGNITION_PRIORITY,
} from "./recognitionQueue";

describe("message library", () => {
  it("reserves MESSAGE_SLOT_CAPACITY slots per category", () => {
    for (const pool of Object.values(RECOGNITION_MESSAGE_LIBRARY)) {
      expect(pool).toHaveLength(MESSAGE_SLOT_CAPACITY);
    }
  });

  it("skips empty reserved slots when picking", () => {
    expect(activeMessages("birthday").length).toBe(3);
    const msg = pickRotatingMessage("birthday", "birthday:2026", {
      name: "Sam",
    });
    expect(msg.length).toBeGreaterThan(10);
    expect(msg.toLowerCase()).toMatch(/birthday|sam|friend/);
  });
});

describe("recognition queue", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("orders birthday above personal anniversary and membership", () => {
    const now = new Date("2026-06-12T12:00:00");
    const queue = buildRecognitionQueue({
      now,
      birthday: { month: 6, day: 12 },
      memberSinceIso: "2025-06-12T10:00:00.000Z",
      personalDates: [
        {
          id: "a1",
          label: "Wedding",
          month: 6,
          day: 12,
          kind: "anniversary",
        },
      ],
    });
    expect(queue[0]?.type).toBe("birthday");
    expect(queue[0]?.priority).toBe(RECOGNITION_PRIORITY.birthday);
  });

  it("returns at most one pick for today", () => {
    const now = new Date("2026-06-12T12:00:00");
    const queue = buildRecognitionQueue({
      now,
      birthday: { month: 6, day: 12 },
    });
    const pick = pickTodaysRecognition(queue, now);
    expect(pick?.type).toBe("birthday");
  });

  it("includes conversation milestones at 25 and 50", () => {
    const now = new Date("2026-06-12T12:00:00");
    localStorage.setItem(
      "companion-recognition-v1",
      JSON.stringify({
        conversationStarts: 25,
        lastConversationStartAt: now.toISOString(),
      }),
    );
    const queue = buildRecognitionQueue({ now });
    expect(queue.some((e) => e.milestoneKey === "conversation_25")).toBe(true);
  });
});

describe("evaluateRecognitionMoment", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("returns null when celebrations are off", () => {
    const moment = evaluateRecognitionMoment({
      celebrationMode: "off",
      now: new Date("2026-06-12T12:00:00"),
      birthday: { month: 6, day: 12 },
      userName: "Alex",
    });
    expect(moment).toBeNull();
  });

  it("celebrates birthday with message and shari state", () => {
    const moment = evaluateRecognitionMoment({
      celebrationMode: "simple",
      now: new Date("2026-06-12T12:00:00"),
      birthday: { month: 6, day: 12 },
      userName: "Alex",
    });
    expect(moment?.type).toBe("birthday");
    expect(moment?.plannedEffect).toBeNull();
    expect(moment?.message).toMatch(/Alex|birthday/i);
    expect(moment?.shariState).toBe("birthday");
  });

  it("Full mode plans a real visual effect — Settings Fix 6", () => {
    const moment = evaluateRecognitionMoment({
      celebrationMode: "full",
      now: new Date("2026-06-12T12:00:00"),
      birthday: { month: 6, day: 12 },
      userName: "Alex",
    });
    expect(moment?.plannedEffect).toBe("birthday_cake");
  });

  it("Full and Simple produce visibly different results for the same event — the fixed bug", () => {
    const base = {
      now: new Date("2026-06-12T12:00:00"),
      birthday: { month: 6, day: 12 },
      userName: "Alex",
    };
    const full = evaluateRecognitionMoment({ ...base, celebrationMode: "full" });
    const simple = evaluateRecognitionMoment({
      ...base,
      celebrationMode: "simple",
    });
    expect(full?.plannedEffect).not.toBeNull();
    expect(simple?.plannedEffect).toBeNull();
    // The message itself is identical on purpose — only the visual differs.
    expect(full?.message).toBe(simple?.message);
    expect(full?.title).toBe(simple?.title);
  });

  it("Off produces no moment at all — no celebration, visual or otherwise", () => {
    const moment = evaluateRecognitionMoment({
      celebrationMode: "off",
      now: new Date("2026-06-12T12:00:00"),
      birthday: { month: 6, day: 12 },
      userName: "Alex",
    });
    expect(moment).toBeNull();
  });

  it("plans a distinct effect per event type in Full mode", () => {
    const now = new Date("2026-06-12T12:00:00");
    const membership = evaluateRecognitionMoment({
      celebrationMode: "full",
      now,
      memberSinceIso: "2025-06-12T10:00:00.000Z",
      userName: "Alex",
    });
    expect(membership?.type).toBe("membership_anniversary");
    expect(membership?.plannedEffect).toBe("confetti");

    localStorage.setItem(
      "companion-recognition-v1",
      JSON.stringify({
        conversationStarts: 25,
        lastConversationStartAt: now.toISOString(),
      }),
    );
    const conversation = evaluateRecognitionMoment({
      celebrationMode: "full",
      now,
      userName: "Alex",
    });
    expect(conversation?.type).toBe("conversation_milestone");
    expect(conversation?.plannedEffect).toBe("celebration_banner");
  });

  it("prioritizes birthday over membership anniversary", () => {
    const moment = evaluateRecognitionMoment({
      now: new Date("2026-06-12T12:00:00"),
      birthday: { month: 6, day: 12 },
      memberSinceIso: "2025-06-12T10:00:00.000Z",
      userName: "Alex",
      celebrationMode: "full",
    });
    expect(moment?.type).toBe("birthday");
  });
});
