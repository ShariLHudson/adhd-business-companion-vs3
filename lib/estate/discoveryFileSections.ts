/**
 * Evidence Vault — Discovery File optional sections.
 * @see EVIDENCE_VAULT_DISCOVERY_FILE.md
 */

export type DiscoverySectionId =
  | "problem"
  | "whoBenefited"
  | "whyApproach"
  | "whatIDid"
  | "lessonsLearned"
  | "whyItMattered"
  | "noteOrLink";

export type DiscoverySectionDef = {
  id: DiscoverySectionId;
  /** Capture field id in the evidence-vault registry. */
  fieldId: string;
  title: string;
  placeholder: string;
  suggestionMessage: string;
  suggestWhen: RegExp;
};

/** Optional paper sections — every one may be skipped. */
export const DISCOVERY_FILE_OPTIONAL_SECTIONS: readonly DiscoverySectionDef[] = [
  {
    id: "problem",
    fieldId: "problem",
    title: "Problem Solved",
    placeholder: "What was the challenge — and how did you meet it?",
    suggestionMessage:
      "This sounds like an important problem you solved.\nAdd this?",
    suggestWhen:
      /\b(solved|fixed|resolved|figured out|worked through|overcame)\b/i,
  },
  {
    id: "whoBenefited",
    fieldId: "whoBenefited",
    title: "People Helped",
    placeholder: "Who felt the difference?",
    suggestionMessage:
      "You mentioned helping someone today.\nAdd this?",
    suggestWhen:
      /\b(helped|assisted|supported|guided|encouraged)\b.{0,40}\b(client|team|family|friend|someone|them|her|him|colleague|customer)\b/i,
  },
  {
    id: "whyApproach",
    fieldId: "whyApproach",
    title: "What Improved",
    placeholder: "What is better now?",
    suggestionMessage:
      "Something seems to have improved here.\nAdd this?",
    suggestWhen:
      /\b(improved|better|stronger|clearer|smoother|easier|more effective)\b/i,
  },
  {
    id: "whatIDid",
    fieldId: "whatIDid",
    title: "Progress Made",
    placeholder: "What moved forward?",
    suggestionMessage: "This sounds like meaningful progress.\nAdd this?",
    suggestWhen:
      /\b(progress|moved forward|advanced|completed|finished|shipped|launched|delivered)\b/i,
  },
  {
    id: "lessonsLearned",
    fieldId: "lessonsLearned",
    title: "Lesson Learned",
    placeholder: "What did this teach you?",
    suggestionMessage:
      "Would you like to preserve the lesson you discovered?\nAdd this?",
    suggestWhen:
      /\b(learned|realized|discovered|understood|insight|lesson|now I know)\b/i,
  },
  {
    id: "whyItMattered",
    fieldId: "whyItMattered",
    title: "Why It Matters",
    placeholder: "Why will you want to remember this?",
    suggestionMessage:
      "This moment seems to carry weight.\nAdd this?",
    suggestWhen:
      /\b(mattered|important|significant|meaningful|proud|grateful|breakthrough)\b/i,
  },
  {
    id: "noteOrLink",
    fieldId: "noteOrLink",
    title: "Supporting Evidence",
    placeholder: "Link, reference, or short note…",
    suggestionMessage:
      "Would you like to attach supporting evidence?\nAdd this?",
    suggestWhen:
      /\b(screenshot|photo|email|document|pdf|link|attachment|recording)\b/i,
  },
] as const;

export const DISCOVERY_FILE_OPENING_PROMPT =
  "What would you like to preserve today?" as const;

export const DISCOVERY_FILE_LEFT_PAGE_TITLE = "Today's Discovery" as const;

export const DISCOVERY_FILE_SAVE_LABEL =
  "Preserve Today's Discovery" as const;

export const DISCOVERY_FILE_SAVED_MESSAGE =
  "Today's discovery has been preserved." as const;
