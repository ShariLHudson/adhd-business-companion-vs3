import { beforeEach, describe, expect, it } from "vitest";
import "@/lib/universalWorkEngine";
import { ensureEventPlanWorkTypeRegistered } from "@/lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType";
import { clearSectionIdeasSessionsForTests } from "@/lib/universalWorkEngine/sectionRuntime/sectionIdeas";
import {
  generateSectionIdeas,
  ideasGuidanceForFocus,
} from "./sectionIdeas";
import type { CanonicalCurrentFocus } from "./types";

function focus(
  partial: Partial<CanonicalCurrentFocus> &
    Pick<CanonicalCurrentFocus, "sectionId" | "title">,
): CanonicalCurrentFocus {
  return {
    focusId: `section:${partial.sectionId}`,
    creationId: "ws-ideas-1",
    title: partial.title,
    purpose: partial.title,
    prompt: partial.title,
    responseType: "multiline",
    knownContext: [],
    availableGuidance: ["Give me ideas"],
    completionCriteria: "Continue",
    nextTransition: null,
    contextVersion: 1,
    sectionId: partial.sectionId,
    introductoryGuidance: null,
    savedContent: partial.savedContent ?? "",
  };
}

describe("sectionIdeas", () => {
  beforeEach(() => {
    clearSectionIdeasSessionsForTests();
    ensureEventPlanWorkTypeRegistered();
  });

  it("returns concrete workshop ideas without claiming to overwrite the answer", () => {
    const result = generateSectionIdeas(
      { ...focus({ sectionId: "purpose", title: "Purpose" }), workTypeId: "event_plan" },
      "My existing purpose",
    );
    expect(result.ok).toBe(true);
    expect(result.ideas.length).toBeGreaterThanOrEqual(2);
    expect(result.intro.toLowerCase()).toContain("deepen");
    expect(result.intro.toLowerCase()).toMatch(/nothing is applied|choose/);
  });

  it("covers attendee_experience and event_type", () => {
    const attendee = generateSectionIdeas({
      ...focus({ sectionId: "attendee_experience", title: "Attendee Experience" }),
      workTypeId: "event_plan",
    });
    expect(attendee.ok).toBe(true);
    expect(attendee.ideas.join(" ").toLowerCase()).toMatch(/welcom|spacious|takeaway/);

    const eventType = generateSectionIdeas({
      ...focus({ sectionId: "event_type", title: "Event Type" }),
      workTypeId: "event_plan",
    });
    expect(eventType.ok).toBe(true);
    expect(eventType.ideas.join(" ").toLowerCase()).toMatch(/workshop|virtual|hybrid/);
  });

  it("legacy guidance string includes numbered ideas", () => {
    const guidance = ideasGuidanceForFocus({
      ...focus({ sectionId: "agenda", title: "Agenda" }),
      workTypeId: "event_plan",
    });
    expect(guidance).toMatch(/1\./);
    expect(guidance.toLowerCase()).toContain("welcome");
  });
});
