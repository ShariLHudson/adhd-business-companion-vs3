/**
 * My Work → Create — estate entrance copy (116–118, 149–151, 180, 056, 127, 129).
 */

/** Spec 127 governing principle — one primary next step on every Create screen. */
export const CREATE_ONE_FOCUS_PRINCIPLE =
  "One question. One focus. Everything else can wait.";

export const CREATE_ESTATE_WINDOW_TITLE = "Create";

export const CREATE_ESTATE_EXPLANATION =
  "Tell Shari what you want to create, and she will help you shape it one step at a time.";

/** How-do-I / progressive disclosure only — not repeated on the entrance. */
export const CREATE_VS_PROJECTS_CUE =
  "Create makes an output. Projects organize ongoing work. You do not need a Project for every creation.";

export const CREATE_ESTATE_HOW_DO_I = [
  "Use Create when you want to make something — an email, checklist, presentation, client resource, marketing plan, event, or other supported work.",
  "Start by telling Shari what you want to create in plain language. Spark Estate opens or resumes the right Creation Workspace — you never choose where the work belongs.",
  "Continue Working shows active Creation Workspaces. Older drafts stay under More Ways to Start.",
  "More Ways to Start is optional — Guided Frameworks and Browse Ideas help you explore types, not required navigation.",
  "Create is different from Projects: Create makes an output; Projects organize ongoing work. For finding and applying strategies, use Strategy Library under Guidance — it is not part of Create.",
].join("\n\n");

/** Spec 129 — single optional start surface (was Customize + Browse). */
export const CREATE_ESTATE_MORE_WAYS_HEADING = "More Ways to Start (Optional)";

export const CREATE_ESTATE_MORE_WAYS_HINT =
  "Optional tools if you already know how you want to begin. Most people just tell Shari above.";

/** Subsection inside More Ways — guided structures. */
export const CREATE_ESTATE_GUIDED_FRAMEWORKS_HEADING = "Guided Frameworks";

export const CREATE_ESTATE_GUIDED_FRAMEWORKS_HINT =
  "Browse a recommended structure if you already know the shape you want. Shari usually chooses this for you.";

/** Subsection inside More Ways — catalog browse. */
export const CREATE_ESTATE_PICKER_HEADING = "Browse Ideas";

/** @deprecated Spec 129 — Customize merged into More Ways; kept for string migration. */
export const CREATE_ESTATE_ADVANCED_HEADING = CREATE_ESTATE_GUIDED_FRAMEWORKS_HEADING;

/** @deprecated Spec 129 — use CREATE_ESTATE_GUIDED_FRAMEWORKS_HINT. */
export const CREATE_ESTATE_ADVANCED_HINT = CREATE_ESTATE_GUIDED_FRAMEWORKS_HINT;

/** Active Creation Workspaces (056 / 127 / 129) — unified resume. */
export const CREATE_ESTATE_CONTINUE_HEADING = "Continue Working";

/**
 * Spec 127 / 130 — confirmation CTA labels.
 * Primary label is dynamic via createConfirmPrimaryLabel (Create Blog Post).
 */
export const CREATE_ESTATE_CONFIRM_YES = "Yes, let's begin";
export const CREATE_ESTATE_CONFIRM_OTHER = "Choose something else";
export const CREATE_ESTATE_CONFIRM_CANCEL = "Cancel";

/** Spec 130 — Manage My Work (Continue Working cleanup). */
export const CREATE_ESTATE_MANAGE_WORK_LABEL = "Manage My Work";
export const CREATE_ESTATE_MANAGE_WORK_DONE = "Done managing";
export const CREATE_ESTATE_MANAGE_ARCHIVE = "Archive";
export const CREATE_ESTATE_MANAGE_TRASH = "Move to Trash";
export const CREATE_ESTATE_MANAGE_RESTORE = "Restore";
export const CREATE_ESTATE_MANAGE_DELETE = "Delete permanently";
export const CREATE_ESTATE_MANAGE_RECOVERABLE_HEADING = "Archived & Trash";
export const CREATE_ESTATE_MANAGE_SELECT_HINT =
  "Select work to archive, move to Trash, restore, or delete permanently.";

/**
 * When active work exists — force-new under Start Something New.
 * Does not replace the single Continue Working resume path.
 */
export const CREATE_ESTATE_START_NEW_LABEL = "Start Something New";

export const CREATE_ESTATE_START_NEW_HEADING = "Start Something New";

/** Previous Work / drafts inside More Ways. */
export const CREATE_ESTATE_PREVIOUS_WORK_HEADING = "Previous Work";

/** Personal / Company template affordances (member language). */
export const CREATE_ESTATE_PERSONAL_TEMPLATES_HEADING = "Personal Templates";
export const CREATE_ESTATE_COMPANY_TEMPLATES_HEADING = "Company Templates";

export const CREATE_ESTATE_DRAFTS_HEADING = "Older document drafts";

export const CREATE_ESTATE_COMPOSER_PLACEHOLDER =
  "I want to create…";

export const CREATE_ESTATE_BEGIN_LABEL = "Begin";

export const CREATE_ESTATE_CONTINUE_EMPTY =
  "Nothing in progress yet. Tell Shari what you want to create above — Begin will confirm the type, then your work will live here so you can continue anytime.";

/** Spec 130 — Previous Work empty state teaches instead of blank. */
export const CREATE_ESTATE_PREVIOUS_WORK_EMPTY =
  "No older drafts here yet. When you save a document draft, it will appear here so you can reopen, rename, or clear it. Most people start with Start Something New above.";

export const CREATE_ESTATE_UNDO_CREATE_LABEL = "Undo create";
