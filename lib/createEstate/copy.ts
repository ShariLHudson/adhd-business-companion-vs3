/**
 * My Work → Create — estate entrance copy (116–118).
 */

export const CREATE_ESTATE_WINDOW_TITLE = "Create";

export const CREATE_ESTATE_EXPLANATION =
  "Make something new with Shari—from a quick email or checklist to a strategy, presentation, client resource, or larger project.";

export const CREATE_VS_PROJECTS_CUE =
  "Create makes an output. Projects organize ongoing work. You do not need a Project for every creation.";

export const CREATE_ESTATE_HOW_DO_I = [
  "Use Create when you want to make something — an email, checklist, presentation, strategy, client resource, or other supported work.",
  "Start with what I need lets you say it in your own words. Browse shows supported creation types without overwhelming you. Continue opens only valid saved creations.",
  "Create is different from Projects: Create makes an output; Projects organize ongoing work. Strategy Library stays under Get Advice for browsing and applying strategies.",
  "Saved creations stay available until you resume them on purpose — opening Create fresh does not reopen an old draft automatically.",
].join("\n\n");

export const CREATE_ESTATE_START_CHOICES = [
  {
    id: "start" as const,
    label: "Start with what I need",
    description:
      "Tell Shari what you want to make in your own words — she will route you to the right kind of creation.",
  },
  {
    id: "browse" as const,
    label: "Browse things I can create",
    description:
      "See supported creation types and choose one when you already know the shape.",
  },
  {
    id: "continue" as const,
    label: "Continue a saved creation",
    description:
      "Resume a draft you saved on purpose — only when you choose to continue.",
  },
] as const;

export type CreateEstateStartChoiceId =
  (typeof CREATE_ESTATE_START_CHOICES)[number]["id"];
