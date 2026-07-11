import { describe, expect, it } from "vitest";
import { resolveEstateConcierge } from "./estateConcierge";

describe("estateConcierge Universal Access (#183)", () => {
  it("does not require a different room before launching", () => {
    const decision = resolveEstateConcierge({
      userText: "help me clear my mind",
      currentRoomId: "welcome-home",
    });
    expect(decision).not.toBeNull();
    if (!decision) return;
    if (decision.kind === "single" || decision.kind === "stay_in_chat") {
      expect(decision.line.toLowerCase()).not.toMatch(
        /you (?:can'?t|must|need to) (?:go|leave|switch)/i,
      );
      expect(decision.line.toLowerCase()).not.toMatch(/fits best here/i);
    }
  });
});
