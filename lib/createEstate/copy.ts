/**
 * My Work → Create — estate entrance copy (116–118, 149–151, 180, 056).
 */

export const CREATE_ESTATE_WINDOW_TITLE = "Create";

export const CREATE_ESTATE_EXPLANATION =
  "Tell Shari what you want to create, and she will help you shape it one step at a time.";

export const CREATE_VS_PROJECTS_CUE =
  "Create makes an output. Projects organize ongoing work. You do not need a Project for every creation.";

export const CREATE_ESTATE_HOW_DO_I = [
  "Use Create when you want to make something — an email, checklist, presentation, client resource, marketing plan, event, or other supported work.",
  "Start by telling Shari what you want to create in plain language. Spark Estate opens or resumes the right Creation Workspace — you never choose where the work belongs.",
  "Continue Where You Left Off shows active Creation Workspaces. Older document drafts stay available under progressive disclosure.",
  "Browse for inspiration is optional — categories help you explore types, not required navigation.",
  "Create is different from Projects: Create makes an output; Projects organize ongoing work. For finding and applying strategies, use Strategy Library under Get Advice — it is not part of Create.",
].join("\n\n");

/** Optional browse — not the primary path (056). */
export const CREATE_ESTATE_PICKER_HEADING = "Browse for inspiration";

/** Active Creation Workspaces (056 / 127) — unified Active Work resume. */
export const CREATE_ESTATE_CONTINUE_HEADING = "Continue Working";

/** Spec 127 — confirmation CTA labels. */
export const CREATE_ESTATE_CONFIRM_YES = "Yes, let's begin";
export const CREATE_ESTATE_CONFIRM_OTHER = "Choose something else";

/** Advanced / Customize — delayed structure browsing (no Start Method). */
export const CREATE_ESTATE_ADVANCED_HEADING = "Customize";
export const CREATE_ESTATE_ADVANCED_HINT =
  "Optional — browse a recommended structure if you already know the shape you want. Shari usually chooses this for you.";

/**
 * When active work exists — explicit choice between resume and force-new.
 * Does not replace resume-by-default for ambiguous Begin / Create entry.
 */
export const CREATE_ESTATE_START_NEW_LABEL = "Start Something New";

export function createEstateContinueCurrentLabel(title: string): string {
  const t = title.trim() || "your current work";
  return `Continue “${t}”`;
}

export const CREATE_ESTATE_ACTIVE_CHOICE_HEADING = "What would you like to do?";

export const CREATE_ESTATE_DRAFTS_HEADING = "Older document drafts";

export const CREATE_ESTATE_COMPOSER_PLACEHOLDER =
  "I want to create…";

export const CREATE_ESTATE_BEGIN_LABEL = "Begin";

export const CREATE_ESTATE_CONTINUE_EMPTY =
  "When you start something, Spark will keep it here for you. Just tell Shari what you want to create above.";
