/**
 * Spark Alpha™ — action permission boundaries.
 * Prepare freely. Act only with permission.
 *
 * @see docs/SPARK_ALPHA_FRAMEWORK.md
 */

export const SPARK_ALPHA_ACTIONS_REQUIRING_PERMISSION = [
  "creating_documents",
  "exporting_pdf_email_post",
  "saving_final_versions_beyond_autosave",
  "publishing_or_sharing",
  "switching_environments_automatically",
  "generating_final_outputs",
  "sending_messages_or_emails",
  "moving_content_to_business_brain_as_final",
] as const;

export const SPARK_ALPHA_ACTIONS_ALLOWED_SILENTLY = [
  "autosaving",
  "memory_update_proposals",
  "linking_ideas",
  "retrieving_context",
  "preparing_drafts_internally",
  "organizing_business_brain_structure",
  "preloading_research",
  "suggesting_next_steps_not_executing",
] as const;

export type SparkAlphaActionRequiringPermission =
  (typeof SPARK_ALPHA_ACTIONS_REQUIRING_PERMISSION)[number];

export type SparkAlphaActionAllowedSilently =
  (typeof SPARK_ALPHA_ACTIONS_ALLOWED_SILENTLY)[number];

export function requiresMemberPermission(
  action: SparkAlphaActionRequiringPermission | SparkAlphaActionAllowedSilently,
): boolean {
  return (SPARK_ALPHA_ACTIONS_REQUIRING_PERMISSION as readonly string[]).includes(
    action,
  );
}
