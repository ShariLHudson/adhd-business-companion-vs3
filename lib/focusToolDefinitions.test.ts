import { describe, expect, it } from "vitest";
import {
  FOCUS_CLARITY_TOOLS,
  HELP_ME_RIGHT_NOW_MENU,
  focusToolDifferentiationHintForChat,
} from "./focusToolDefinitions";

describe("focusToolDefinitions", () => {
  it("keeps Clear My Mind, Park It, and Safe For Today distinct", () => {
    expect(FOCUS_CLARITY_TOOLS["clear-my-mind"].tagline).toMatch(
      /everything competing/i,
    );
    expect(FOCUS_CLARITY_TOOLS["brain-parking-lot"].title).toBe("Park It");
    expect(FOCUS_CLARITY_TOOLS["brain-parking-lot"].tagline).toMatch(
      /one thing for later/i,
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
      "Today's Reality",
      "Park It",
      "Clear My Mind",
      "Safe For Today",
      "Focus Session",
      "ADHD Decision Compass",
    ]);
    expect(HELP_ME_RIGHT_NOW_MENU.map((t) => t.objectId)).toEqual([
      "todays-reality",
      "parking-lot",
      "clear-my-mind",
      "safe-for-today",
      "focus-timer",
      "decision-compass",
    ]);
  });

  it("hint tells Shari not to conflate parking lot with Clear My Mind", () => {
    const hint = focusToolDifferentiationHintForChat();
    expect(hint).toMatch(/Park It/);
    expect(hint).toMatch(/Clear My Mind/);
    expect(hint).toMatch(
      /Never tell someone to use Clear My Mind when they only need to park/i,
    );
  });
});
