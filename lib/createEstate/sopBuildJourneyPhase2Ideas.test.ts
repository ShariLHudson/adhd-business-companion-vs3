/**
 * SOP Build Journey — Phase 2b (conversation content: ideas).
 *
 * Proves SOP gets section-specific ideas for its new sections instead of the
 * generic fallback — via the existing shared, Build-Type-agnostic catalog,
 * no UWE package.
 *
 * @see docs/create-experience/SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md
 */

import { describe, expect, it } from "vitest";
import {
  generateSectionIdeas,
  clearSectionIdeasCatalogsForTests,
  clearSectionIdeasSessionsForTests,
} from "@/lib/universalWorkEngine/sectionRuntime/sectionIdeas";
import { ideasGuidanceForFocus } from "@/lib/currentFocus/submitCurrentFocusResponse";
import type { CanonicalCurrentFocus } from "@/lib/currentFocus/types";

const NEW_SOP_SECTION_IDS = [
  "intended-user",
  "before-you-begin",
  "completion-check",
  "troubleshooting",
] as const;

describe("SOP gets section-specific ideas, not the generic fallback — no UWE package", () => {
  it("returns SOP-shaped ideas for the four new sections, distinct from the generic pool", () => {
    clearSectionIdeasCatalogsForTests();
    clearSectionIdeasSessionsForTests();
    const genericPhrases = [
      "A rough phrase is enough",
      "Name one concrete detail",
      "Borrow language you’d say out loud",
      "Write the messy version first",
      "Start with what you refuse to complicate",
      "Capture the feeling you want",
    ];

    for (const sectionId of NEW_SOP_SECTION_IDS) {
      const focus: CanonicalCurrentFocus & { workTypeId?: string | null } = {
        focusId: `section:${sectionId}`,
        creationId: "sop-ideas-test",
        title: sectionId,
        purpose: "",
        prompt: "",
        responseType: "multiline",
        knownContext: [],
        availableGuidance: [],
        completionCriteria: "",
        nextTransition: null,
        contextVersion: 1,
        sectionId,
        workTypeId: null,
      };
      const result = generateSectionIdeas(focus);
      expect(result.ideas.length).toBeGreaterThan(0);
      const isGeneric = result.ideas.every((idea) =>
        genericPhrases.some((g) => idea.includes(g)),
      );
      expect(isGeneric).toBe(false);
    }
  });

  it("ideasGuidanceForFocus has non-generic fallback text for the new sections", () => {
    for (const sectionId of NEW_SOP_SECTION_IDS) {
      const focus: CanonicalCurrentFocus = {
        focusId: `section:${sectionId}`,
        creationId: "sop-ideas-test",
        title: sectionId,
        purpose: "",
        prompt: "",
        responseType: "multiline",
        knownContext: [],
        availableGuidance: [],
        completionCriteria: "",
        nextTransition: null,
        contextVersion: 1,
        sectionId,
      };
      const guidance = ideasGuidanceForFocus(focus);
      expect(guidance).not.toBe(
        "There's no perfect answer — a rough phrase is enough to keep us moving.",
      );
    }
  });
});
