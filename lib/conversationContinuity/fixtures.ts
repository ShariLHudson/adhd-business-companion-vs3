/**
 * Reported continuity regressions A–G — fixtures for the shared ownership suite.
 * Slice 1 pins contracts; later slices wire handleSend and expand assertions.
 */

export type ContinuityRegressionCaseId =
  | "A_newsletter_purpose"
  | "B_email_approval_restart"
  | "C_section_write_above"
  | "D_chamber_specialist_reset"
  | "E_board_intake_restart"
  | "F_stored_projects"
  | "G_direct_navigation";

export type ContinuityRegressionCase = {
  id: ContinuityRegressionCaseId;
  title: string;
  userTurns: string[];
  expectedOwnerKind:
    | "guided_workflow"
    | "artifact"
    | "chamber_specialist"
    | "board_intake"
    | "navigation"
    | "general_chat";
  /** What must NOT happen */
  mustNot: string[];
  /** What should happen */
  must: string[];
};

export const CONTINUITY_REGRESSION_CASES: ContinuityRegressionCase[] = [
  {
    id: "A_newsletter_purpose",
    title: "Newsletter purpose stays newsletter content",
    userTurns: [
      "I need to write a newsletter.",
      "To introduce my ADHD app to new users and explain how it all works.",
    ],
    expectedOwnerKind: "guided_workflow",
    mustNot: [
      "abandon newsletter",
      "explain the app as product help",
      "generic recovery",
    ],
    must: ["store purpose", "ask next newsletter question"],
  },
  {
    id: "B_email_approval_restart",
    title: "Approved email restores final actions",
    userTurns: ["No changes. I like it.", "Let's write the email."],
    expectedOwnerKind: "artifact",
    mustNot: ["restart email intake", "first discovery question"],
    must: ["Copy / Draft / Send / Edit actions"],
  },
  {
    id: "C_section_write_above",
    title: "Referential section write executes",
    userTurns: ["Help me write out the details for the above."],
    expectedOwnerKind: "artifact",
    mustNot: ["What's the first piece you want to figure out"],
    must: ["draft the referenced section"],
  },
  {
    id: "D_chamber_specialist_reset",
    title: "Chamber follow-up keeps specialist",
    userTurns: ["What analytics software do you suggest?"],
    expectedOwnerKind: "chamber_specialist",
    mustNot: ["reintroduce specialist", "Opening voice reference every turn"],
    must: ["continue same specialist", "preserve topic"],
  },
  {
    id: "E_board_intake_restart",
    title: "Board concerns advances to review",
    userTurns: ["concerns answer"],
    expectedOwnerKind: "board_intake",
    mustNot: ["return to decision step"],
    must: ["advance to review"],
  },
  {
    id: "F_stored_projects",
    title: "Show current projects opens stored view",
    userTurns: ["I need to see all my current projects."],
    expectedOwnerKind: "navigation",
    mustNot: ["ask user to list projects manually"],
    must: ["open Current Projects", "load saved project data"],
  },
  {
    id: "G_direct_navigation",
    title: "Direct room requests open destinations",
    userTurns: ["Open Rhythms.", "Show my reminders."],
    expectedOwnerKind: "navigation",
    mustNot: ["treat as generic conversation only"],
    must: ["open intended destination"],
  },
];
