import { describe, expect, it } from "vitest";
import {
  FOCUS_CLARITY_TOOLS,
  HELP_ME_RIGHT_NOW_MENU,
  focusToolDifferentiationHintForChat,
} from "./focusToolDefinitions";

describe("focusToolDefinitions", () => {
  it("keeps Clear My Mind, Parking Lot, and Safe For Today distinct", () => {
    expect(FOCUS_CLARITY_TOOLS["clear-my-mind"].tagline).toMatch(
      /out of my head/i,
    );
    expect(FOCUS_CLARITY_TOOLS["brain-parking-lot"].tagline).toMatch(
      /for later/i,
    );
    expect(FOCUS_CLARITY_TOOLS["safe-for-today"].tagline).toMatch(
      /not doing this today/i,
    );
    expect(FOCUS_CLARITY_TOOLS["clear-my-mind"].question).not.toBe(
      FOCUS_CLARITY_TOOLS["brain-parking-lot"].question,
    );
  });

  it("lists the Help Me Right Now relief menu in product order", () => {
    expect(HELP_ME_RIGHT_NOW_MENU.map((t) => t.title)).toEqual([
      "Adapt My Day",
      "Brain Parking Lot",
      "Clear My Mind",
      "Safe For Today",
      "Focus Session",
      "ADHD Decision Compass",
    ]);
    expect(HELP_ME_RIGHT_NOW_MENU.map((t) => t.emoji)).toEqual([
      "⚡",
      "📌",
      "🧠",
      "🛡",
      "🎯",
      "🧭",
    ]);
  });

  it("hint tells Shari not to conflate parking lot with Clear My Mind", () => {
    const hint = focusToolDifferentiationHintForChat();
    expect(hint).toMatch(/Brain Parking Lot/);
    expect(hint).toMatch(/Clear My Mind/);
    expect(hint).toMatch(/Never tell someone to use Clear My Mind when they only need to park/i);
  });
});
