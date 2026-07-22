/**
 * Board Director profile accordion — interaction spec sections.
 * Content is always resolved from BoardDirectorDefinition (registry).
 */

import type { BoardDirectorDefinition } from "@/lib/board/types";

export const BOARD_DIRECTOR_ACCORDION_SECTION_IDS = [
  "how-i-think",
  "what-i-protect",
  "questions-ill-ask",
  "when-youll-want-me",
  "decision-i-helped-guide",
  "how-i-work-with-founders",
  "youll-enjoy-working-with-me",
] as const;

/** Shown first on profile overview — reduce default cognitive load. */
export const BOARD_DIRECTOR_PRIMARY_ACCORDION_SECTION_IDS = [
  "how-i-think",
  "what-i-protect",
  "when-youll-want-me",
] as const;

/** Deeper material behind “More About This Director”. */
export const BOARD_DIRECTOR_MORE_ACCORDION_SECTION_IDS = [
  "questions-ill-ask",
  "decision-i-helped-guide",
  "how-i-work-with-founders",
  "youll-enjoy-working-with-me",
] as const;

export type BoardDirectorAccordionSectionId =
  (typeof BOARD_DIRECTOR_ACCORDION_SECTION_IDS)[number];

export type BoardDirectorAccordionSection = {
  id: BoardDirectorAccordionSectionId;
  title: string;
  /** One short sentence shown on the collapsed row */
  preview: string;
  /** Plain text or bullet lines for the panel body */
  bodyLines: string[];
};

const TITLES: Record<BoardDirectorAccordionSectionId, string> = {
  "how-i-think": "How I Think",
  "what-i-protect": "What I Protect",
  "questions-ill-ask": "Questions I'll Ask",
  "when-youll-want-me": "When You'll Want Me",
  "decision-i-helped-guide": "A Decision I Helped Guide",
  "how-i-work-with-founders": "How I Work With Founders",
  "youll-enjoy-working-with-me": "You'll Enjoy Working With Me If",
};

function sectionFromId(
  director: BoardDirectorDefinition,
  id: BoardDirectorAccordionSectionId,
): BoardDirectorAccordionSection {
  const bodyLines = sectionBodyLines(director, id);
  return {
    id,
    title: TITLES[id],
    preview: sectionPreview(director, id, bodyLines),
    bodyLines,
  };
}

/**
 * Build accordion sections for any Director from registry fields.
 * Single implementation — never special-case a Director by name.
 */
export function getDirectorAccordionSections(
  director: BoardDirectorDefinition,
): BoardDirectorAccordionSection[] {
  return BOARD_DIRECTOR_ACCORDION_SECTION_IDS.map((id) =>
    sectionFromId(director, id),
  );
}

/** Three overview sections shown before “More About This Director”. */
export function getDirectorPrimaryAccordionSections(
  director: BoardDirectorDefinition,
): BoardDirectorAccordionSection[] {
  return BOARD_DIRECTOR_PRIMARY_ACCORDION_SECTION_IDS.map((id) =>
    sectionFromId(director, id),
  );
}

/** Deeper sections — only after the member opens More. */
export function getDirectorMoreAccordionSections(
  director: BoardDirectorDefinition,
): BoardDirectorAccordionSection[] {
  return BOARD_DIRECTOR_MORE_ACCORDION_SECTION_IDS.map((id) =>
    sectionFromId(director, id),
  );
}

function sectionPreview(
  director: BoardDirectorDefinition,
  id: BoardDirectorAccordionSectionId,
  bodyLines: string[],
): string {
  switch (id) {
    case "how-i-think":
      return director.decisionLens.slice(0, 2).join(" · ");
    case "what-i-protect":
      return bodyLines[0] ?? "What I guard in every decision.";
    case "questions-ill-ask":
      return "The questions I bring to the table.";
    case "when-youll-want-me":
      return "When my seat at the table helps most.";
    case "decision-i-helped-guide":
      return "An example of the work I do.";
    case "how-i-work-with-founders":
      return "How I show up beside you.";
    case "youll-enjoy-working-with-me":
      return "Whether our styles fit.";
    default:
      return bodyLines[0] ?? "";
  }
}

function sectionBodyLines(
  director: BoardDirectorDefinition,
  id: BoardDirectorAccordionSectionId,
): string[] {
  switch (id) {
    case "how-i-think":
      return director.decisionLens.map((line) => capitalize(line));
    case "what-i-protect":
      return (director.whatIProtect?.length
        ? director.whatIProtect
        : director.watchesFor
      ).map((line) => capitalize(line));
    case "questions-ill-ask":
      return [...director.questionsAsked];
    case "when-youll-want-me":
      return [director.whenYoullWantMe];
    case "decision-i-helped-guide":
      return [director.exampleDecision];
    case "how-i-work-with-founders":
      return [director.howIWorkWithFounders];
    case "youll-enjoy-working-with-me":
      return [director.youllEnjoyWorkingWithMeIf];
    default:
      return [];
  }
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Exclusive accordion: open one id, or close if same id toggled. */
export function toggleDirectorAccordion(
  currentOpenId: BoardDirectorAccordionSectionId | null,
  nextId: BoardDirectorAccordionSectionId,
): BoardDirectorAccordionSectionId | null {
  return currentOpenId === nextId ? null : nextId;
}
