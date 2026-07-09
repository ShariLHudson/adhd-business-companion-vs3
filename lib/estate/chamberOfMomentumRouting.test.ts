import { describe, expect, it } from "vitest";

import {
  CHAMBER_ENTRY_PROMPT,
  CHAMBER_WELCOME_SUBTITLE,
  CHAMBER_WELCOME_TITLE,
  chamberMomentumIntentSection,
  chamberUnsureOptionSection,
  classifyChamberMomentumIntent,
  isChamberUnsurePhrase,
} from "./chamberOfMomentumRouting";

describe("chamberOfMomentumRouting", () => {
  it("maps entry intents to internal momentum shells", () => {
    expect(chamberMomentumIntentSection("learn")).toBe("momentum-institute");
    expect(chamberMomentumIntentSection("build")).toBe("momentum-builder");
    expect(chamberMomentumIntentSection("execute")).toBe("chamber-project-entry");
    expect(chamberMomentumIntentSection("plan")).toBe("momentum-builder");
    expect(chamberMomentumIntentSection("idea")).toBe("evidence-bank");
  });

  it("maps unsure fallbacks to gentle first steps", () => {
    expect(chamberUnsureOptionSection("clear-my-mind")).toBe("brain-dump");
    expect(chamberUnsureOptionSection("quick-capture")).toBe("brain-dump");
    expect(chamberUnsureOptionSection("small-first-step")).toBe(
      "momentum-builder",
    );
  });

  it('routes "I am overwhelmed" through Chamber to Builder', () => {
    expect(classifyChamberMomentumIntent("I am overwhelmed")).toBe("build");
    expect(chamberMomentumIntentSection("build")).toBe("momentum-builder");
  });

  it('routes "Teach me marketing" through Chamber to Institute', () => {
    expect(classifyChamberMomentumIntent("Teach me marketing")).toBe("learn");
    expect(chamberMomentumIntentSection("learn")).toBe("momentum-institute");
  });

  it('routes "Help me finish my website" through Chamber to Projects', () => {
    expect(classifyChamberMomentumIntent("Help me finish my website")).toBe(
      "execute",
    );
    expect(chamberMomentumIntentSection("execute")).toBe("chamber-project-entry");
  });

  it("recognizes unsure phrases for gentle fallback", () => {
    expect(isChamberUnsurePhrase("I don't know.")).toBe(true);
    expect(isChamberUnsurePhrase("I want to learn")).toBe(false);
  });

  it("uses the Phase 3 welcome and entry copy", () => {
    expect(CHAMBER_WELCOME_TITLE).toContain("Chamber of Momentum");
    expect(CHAMBER_WELCOME_SUBTITLE).toContain("move forward");
    expect(CHAMBER_ENTRY_PROMPT).toContain("move forward");
  });
});
