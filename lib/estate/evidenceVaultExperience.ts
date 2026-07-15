/**
 * Evidence Vault — member-facing experience copy and ceremonial flows.
 */

export const EVIDENCE_VAULT_ROOM_NAME = "Evidence Vault" as const;

/** Exterior entrance — quiet; doors are the focus, not a text panel. */
export const EVIDENCE_VAULT_EXTERIOR_WELCOME =
  "Your Evidence Vault." as const;

export const EVIDENCE_VAULT_WHAT_IT_IS =
  "The Evidence Vault helps you collect proof of your progress, strengths, results, and accomplishments." as const;

export const EVIDENCE_VAULT_WHY_LOCKED =
  "The Vault opens after you complete six short discovery questions — so nothing here feels rushed or accidental." as const;

export const EVIDENCE_VAULT_KEY_INVITATION =
  `${EVIDENCE_VAULT_WHAT_IT_IS} ${EVIDENCE_VAULT_WHY_LOCKED}` as const;

export const EVIDENCE_VAULT_BEGIN_DISCOVERY_LABEL =
  "Begin Evidence Discovery" as const;

export const EVIDENCE_VAULT_LEARN_WHY_LABEL = "Learn Why This Helps" as const;

export const EVIDENCE_VAULT_LEARN_WHY_BODY =
  "ADHD brains often forget the evidence of their own growth. The Vault keeps those moments findable — wins, lessons, and proof you can return to when doubt gets loud." as const;

export const EVIDENCE_VAULT_DOOR_ACTION_LABEL =
  "Begin Evidence Discovery" as const;

export const EVIDENCE_VAULT_KEY_ACTION_LABEL =
  "Begin Evidence Discovery" as const;

export const EVIDENCE_VAULT_LOCKED_INDICATOR = "Locked" as const;

/** Primary home actions after entering the vault. */
export const EVIDENCE_VAULT_FIRST_ENTRY_CHOICES = [
  { id: "add-evidence", label: "Create Evidence" },
  { id: "shari-remember", label: "Surprise Me" },
  { id: "look-inside", label: "Browse Evidence" },
] as const;

export type EvidenceVaultFirstEntryChoiceId =
  (typeof EVIDENCE_VAULT_FIRST_ENTRY_CHOICES)[number]["id"];

export const EVIDENCE_VAULT_JOURNAL_LABEL = "My Evidence Journal" as const;

/** Guided discovery — one question at a time; member may skip any. */
export const EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS = [
  "What happened?",
  "What did you learn?",
  "What problem did you solve?",
  "Who did you help?",
  "What did you create?",
  "What evidence shows your growth?",
] as const;

/** Guided discovery — one textarea per question (Evidence Vault journal). */
export const EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS = [
  { question: EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS[0], fieldId: "situation" },
  { question: EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS[1], fieldId: "lessonsLearned" },
  { question: EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS[2], fieldId: "problem" },
  { question: EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS[3], fieldId: "whoBenefited" },
  { question: EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS[4], fieldId: "whatIDid" },
  { question: EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS[5], fieldId: "whyItMattered" },
] as const;

/** Welcome when member explicitly enters the vault. */
export const EVIDENCE_VAULT_ENTRY_WELCOME = [
  "Welcome back to your Evidence Vault.",
  "Every experience has something to teach us.",
  "What discovery would you like to preserve today?",
].join("\n\n");

export const EVIDENCE_VAULT_DISCOVERY_PROMPT =
  "What would you like to preserve today?" as const;

export const EVIDENCE_VAULT_CEREMONIAL_SAVE =
  "Today's discovery has been preserved." as const;

/** Post-save choices — only actions wired in the vault room flow. */
export const EVIDENCE_VAULT_POST_SAVE_NAV = [
  { id: "view", label: "View Discovery" },
  { id: "another", label: "Add Another Discovery" },
  { id: "estate", label: "Return to Estate" },
] as const;

/** Spark invitation from regular chat — permission first. */
export const EVIDENCE_VAULT_CHAT_PRESERVE_OFFER =
  "This sounds like a discovery worth preserving in your Evidence Vault." as const;

/** Encouragement / self-doubt — ask before opening; never auto-open. */
export { EVIDENCE_VAULT_CHAT_OPEN_OFFER } from "./evidenceVaultHome";

export const EVIDENCE_VAULT_CHAT_DECLINE_ACK =
  "No problem. We can preserve it later if you change your mind." as const;

export const EVIDENCE_VAULT_CHAT_PREFILL_ACK =
  "Would you like to add anything else before we preserve it?" as const;

export const EVIDENCE_VAULT_HALL_CANDIDATE_SHORT_PROMPT =
  "This discovery may become an important milestone someday. Would you like to mark it as a possible Hall of Accomplishments exhibit?" as const;

export const EVIDENCE_VAULT_GENTLE_FOLLOW_UPS = [
  "Would you like to remember why this felt important?",
  "Would you like to add who benefited?",
  "Would you like to attach anything?",
] as const;

export const EVIDENCE_VAULT_HALL_CANDIDATE_PROMPT =
  "This discovery may become an important milestone someday. Would you like Spark to remember that as a possible Hall of Accomplishment candidate?" as const;

export type EvidenceVaultExportFormat =
  | "print"
  | "pdf"
  | "word"
  | "markdown"
  | "plain";

export const EVIDENCE_VAULT_EXPORT_LABELS: Record<
  EvidenceVaultExportFormat,
  string
> = {
  print: "Print",
  pdf: "Save PDF",
  word: "Export Word",
  markdown: "Export Markdown",
  plain: "Export Plain Text",
};

/** User-facing phrases to avoid in vault context — use preserve/discovery language instead. */
export const EVIDENCE_VAULT_DISCOURAGED_PHRASES = [
  /\brecord\b/i,
  /\bnote\b/i,
  /\bsave note\b/i,
  /\bwrite note\b/i,
] as const;
