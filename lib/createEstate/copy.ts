/**
 * My Work → Create — estate entrance copy (116–118, 149–151, 180, 056, 127, 129, 133).
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
  "Continue Working shows active Creation Workspaces. Older drafts stay under Explore Ideas → Continue Something.",
  "Explore Ideas is optional — one place to continue, search, browse categories, or see recommendations. Most people just tell Shari above.",
  "Create is different from Projects: Create makes an output; Projects organize ongoing work. For finding and applying strategies, use Strategy Library under Guidance — it is not part of Create.",
].join("\n\n");

/** Spec 133 — one optional discovery surface (replaces More Ways to Start). */
export const CREATE_ESTATE_EXPLORE_IDEAS_HEADING = "Explore Ideas";

export const CREATE_ESTATE_EXPLORE_IDEAS_HINT =
  "Optional — continue something, search for inspiration, or browse categories. Most people just tell Shari above.";

/** @deprecated Spec 133 — use CREATE_ESTATE_EXPLORE_IDEAS_HEADING. */
export const CREATE_ESTATE_MORE_WAYS_HEADING = CREATE_ESTATE_EXPLORE_IDEAS_HEADING;

/** @deprecated Spec 133 — use CREATE_ESTATE_EXPLORE_IDEAS_HINT. */
export const CREATE_ESTATE_MORE_WAYS_HINT = CREATE_ESTATE_EXPLORE_IDEAS_HINT;

export const CREATE_ESTATE_CONTINUE_SOMETHING_HEADING = "Continue Something";

export const CREATE_ESTATE_RECENT_WORK_HEADING = "Recent Work";

export const CREATE_ESTATE_RECENT_WORK_EMPTY =
  "Nothing recent yet. When you create or continue work, it will show up here.";

export const CREATE_ESTATE_INSPIRATION_HEADING = "I Need Inspiration";

export const CREATE_ESTATE_INSPIRATION_HINT =
  "One search. Templates, frameworks, ideas, and examples appear together.";

export const CREATE_ESTATE_CATEGORIES_HEADING = "Show Me Categories";

export const CREATE_ESTATE_RECOMMENDED_HEADING = "Recommended For Me";

export const CREATE_ESTATE_RECOMMENDED_EMPTY =
  "Tell Shari what you’d like to create above — recommendations grow as we learn what you’re building.";

export const CREATE_ESTATE_IDEA_PREVIEW_CREATE = "Create";
export const CREATE_ESTATE_IDEA_PREVIEW_BACK = "Back";

/** @deprecated Spec 133 — framework tabs removed from discovery. */
export const CREATE_ESTATE_GUIDED_FRAMEWORKS_HEADING = "Guided Frameworks";

/** @deprecated Spec 133 — framework tabs removed from discovery. */
export const CREATE_ESTATE_GUIDED_FRAMEWORKS_HINT =
  "Browse a recommended structure if you already know the shape you want. Shari usually chooses this for you.";

/** @deprecated Spec 133 — Browse Ideas merged into Explore Ideas search/categories. */
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

/** Previous Work / drafts inside Explore Ideas → Continue Something. */
export const CREATE_ESTATE_PREVIOUS_WORK_HEADING = "Previous Work";

/** @deprecated Spec 133 — explained as 👤 Personal source chip. */
export const CREATE_ESTATE_PERSONAL_TEMPLATES_HEADING = "Personal Templates";
/** @deprecated Spec 133 — explained as 🏢 Company source chip. */
export const CREATE_ESTATE_COMPANY_TEMPLATES_HEADING = "Company Templates";

export const CREATE_ESTATE_DRAFTS_HEADING = "Older document drafts";

export const CREATE_ESTATE_COMPOSER_PLACEHOLDER =
  "I want to create…";

export const CREATE_ESTATE_BEGIN_LABEL = "Begin";

/**
 * Spec 131 Rule 11 — Continue Working is omitted when empty (not shown with this copy).
 * Kept for how-do-I / migration references only.
 */
export const CREATE_ESTATE_CONTINUE_EMPTY =
  "Nothing in progress yet. Tell Shari what you want to create above — Begin will confirm the type, then your work will live here so you can continue anytime.";

/** Spec 130 / 131 / 133 — Previous Work empty state teaches instead of blank. */
export const CREATE_ESTATE_PREVIOUS_WORK_EMPTY =
  "No older drafts here yet. When you save a document draft, it will appear here so you can reopen, rename, or clear it. Most people start with Start Something New above — or search Explore Ideas for inspiration.";

export const CREATE_ESTATE_UNDO_CREATE_LABEL = "Undo create";
