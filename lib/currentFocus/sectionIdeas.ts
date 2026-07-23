/**
 * Current Focus adapter for UWE section ideas.
 * Domain catalogs live on Work Type packages; this layer only maps focus shape.
 */

import {
  expandSectionIdea as expandUweSectionIdea,
  generateSectionIdeas as generateUweSectionIdeas,
  ideasGuidanceFromSectionIdeas,
  markSectionIdeaAppended as markUweSectionIdeaAppended,
  type SectionIdeaExpansionResult,
  type SectionIdeasGenerateOptions,
  type SectionIdeasResult,
  type SectionIdeasSessionState,
  type SectionIdeaSuggestion,
} from "@/lib/universalWorkEngine/sectionRuntime/sectionIdeas";
import type { CanonicalCurrentFocus } from "./types";

export type {
  SectionIdeaExpansionResult,
  SectionIdeasGenerateOptions,
  SectionIdeasResult,
  SectionIdeasSessionState,
  SectionIdeaSuggestion,
};

export { markUweSectionIdeaAppended as markSectionIdeaAppended };

function toFocusInput(
  focus: CanonicalCurrentFocus & { workTypeId?: string | null },
) {
  return {
    sectionId: focus.sectionId,
    title: focus.title,
    workTypeId: focus.workTypeId ?? null,
    assetTypeId: focus.assetTypeId,
    savedContent: focus.savedContent,
    creationId: focus.creationId,
  };
}

export function generateSectionIdeas(
  focus: CanonicalCurrentFocus & { workTypeId?: string | null },
  existingAnswerOrOptions: string | SectionIdeasGenerateOptions = "",
): SectionIdeasResult {
  if (typeof existingAnswerOrOptions === "string") {
    return generateUweSectionIdeas(toFocusInput(focus), {
      existingAnswer: existingAnswerOrOptions,
      mode: "initial",
    });
  }
  return generateUweSectionIdeas(toFocusInput(focus), existingAnswerOrOptions);
}

export function expandSectionIdea(
  focus: CanonicalCurrentFocus & { workTypeId?: string | null },
  idea: SectionIdeaSuggestion | string,
): SectionIdeaExpansionResult {
  return expandUweSectionIdea(toFocusInput(focus), idea);
}

/** Plain guidance string for legacy callers (does not replace the answer). */
export function ideasGuidanceForFocus(
  focus: CanonicalCurrentFocus & { workTypeId?: string | null },
): string {
  return ideasGuidanceFromSectionIdeas(toFocusInput(focus));
}
