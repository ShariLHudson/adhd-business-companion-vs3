/**
 * Conversation Gold Standards™ (Spec 116).
 * Catalog of 25–50 complete reference conversations.
 *
 * @see docs/SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_TESTS_FRAMEWORK.md (Spec 119 — adversarial QA)
 * @see docs/conversation-gold-standards/
 */

export type SparkConversationGoldStandardStatus =
  | "complete"
  | "in_progress"
  | "planned";

export type SparkConversationGoldStandardId =
  | "marketing_app"
  | "overwhelmed"
  | "have_an_idea"
  | "dont_know_what_to_do"
  | "should_create_course"
  | "help_me_think"
  | "huge_win"
  | "brain_break"
  | "pricing_decision"
  | "client_email_dread"
  | "returning_after_absence"
  | "print_this"
  | "research_request"
  | "gallery_milestone"
  | "journal_processing"
  | "avoiding_something"
  | "write_workshop"
  | "launch_week"
  | "brand_voice"
  | "stuck_on_naming"
  | "competitor_anxiety"
  | "first_hire"
  | "podcast_pitch"
  | "newsletter_restart"
  | "burnout"
  | "celebrate_quietly"
  | "permission_to_pause"
  | "multi_project_chaos";

export const SPARK_CONVERSATION_GOLD_STANDARD_TARGET_COUNT = 50 as const;

export const SPARK_CONVERSATION_GOLD_STANDARD_CATALOG: readonly {
  id: SparkConversationGoldStandardId;
  number: number;
  opening: string;
  file: string;
  status: SparkConversationGoldStandardStatus;
  primaryModes: string[];
}[] = [
  {
    id: "marketing_app",
    number: 1,
    opening: "Help me market my app.",
    file: "gs-01-marketing-app.md",
    status: "complete",
    primaryModes: ["clarify", "explore", "create"],
  },
  {
    id: "overwhelmed",
    number: 2,
    opening: "I'm overwhelmed.",
    file: "gs-02-overwhelmed.md",
    status: "complete",
    primaryModes: ["support", "coach"],
  },
  {
    id: "have_an_idea",
    number: 3,
    opening: "I have an idea.",
    file: "gs-03-have-an-idea.md",
    status: "complete",
    primaryModes: ["explore", "coach"],
  },
  {
    id: "dont_know_what_to_do",
    number: 4,
    opening: "I don't know what to do.",
    file: "gs-04-dont-know-what-to-do.md",
    status: "planned",
    primaryModes: ["support", "clarify"],
  },
  {
    id: "should_create_course",
    number: 5,
    opening: "Should I create a course?",
    file: "gs-05-should-i-create-a-course.md",
    status: "planned",
    primaryModes: ["decide", "explore"],
  },
  {
    id: "help_me_think",
    number: 6,
    opening: "Help me think.",
    file: "gs-06-help-me-think.md",
    status: "complete",
    primaryModes: ["coach"],
  },
  {
    id: "huge_win",
    number: 7,
    opening: "I just had a huge win.",
    file: "gs-07-huge-win.md",
    status: "complete",
    primaryModes: ["support", "celebrate"],
  },
  {
    id: "brain_break",
    number: 8,
    opening: "I need a brain break.",
    file: "gs-08-brain-break.md",
    status: "complete",
    primaryModes: ["support", "restoration"],
  },
  {
    id: "pricing_decision",
    number: 9,
    opening: "I can't decide what to charge.",
    file: "gs-09-pricing-decision.md",
    status: "planned",
    primaryModes: ["decide"],
  },
  {
    id: "client_email_dread",
    number: 10,
    opening: "I keep putting off an email to a client.",
    file: "gs-10-client-email-dread.md",
    status: "planned",
    primaryModes: ["coach", "support"],
  },
  {
    id: "returning_after_absence",
    number: 11,
    opening: "I'm back. It's been a while.",
    file: "gs-11-returning-after-absence.md",
    status: "planned",
    primaryModes: ["support", "orient"],
  },
  {
    id: "print_this",
    number: 12,
    opening: "Can you print this for me?",
    file: "gs-12-print-this.md",
    status: "planned",
    primaryModes: ["answer", "navigate"],
  },
  {
    id: "research_request",
    number: 13,
    opening: "Can you research competitors for me?",
    file: "gs-13-research-request.md",
    status: "planned",
    primaryModes: ["research", "clarify"],
  },
  {
    id: "gallery_milestone",
    number: 14,
    opening: "I finally launched.",
    file: "gs-14-gallery-milestone.md",
    status: "planned",
    primaryModes: ["celebrate", "permission"],
  },
  {
    id: "journal_processing",
    number: 15,
    opening: "Something happened today and I need to get it out.",
    file: "gs-15-journal-processing.md",
    status: "planned",
    primaryModes: ["coach", "support"],
  },
  {
    id: "avoiding_something",
    number: 16,
    opening: "I'm avoiding something.",
    file: "gs-16-avoiding-something.md",
    status: "planned",
    primaryModes: ["support", "coach"],
  },
  {
    id: "write_workshop",
    number: 17,
    opening: "I need to write a workshop.",
    file: "gs-17-write-workshop.md",
    status: "planned",
    primaryModes: ["explore", "create"],
  },
  {
    id: "launch_week",
    number: 18,
    opening: "Launch week is chaos.",
    file: "gs-18-launch-week.md",
    status: "planned",
    primaryModes: ["support", "prioritize"],
  },
  {
    id: "brand_voice",
    number: 19,
    opening: "I don't sound like myself in my marketing.",
    file: "gs-19-brand-voice.md",
    status: "planned",
    primaryModes: ["explore", "teach"],
  },
  {
    id: "stuck_on_naming",
    number: 20,
    opening: "I can't name this thing.",
    file: "gs-20-stuck-on-naming.md",
    status: "planned",
    primaryModes: ["explore", "brainstorm"],
  },
  {
    id: "competitor_anxiety",
    number: 21,
    opening: "Everyone else seems ahead of me.",
    file: "gs-21-competitor-anxiety.md",
    status: "planned",
    primaryModes: ["support", "coach"],
  },
  {
    id: "first_hire",
    number: 22,
    opening: "I think I need to hire someone.",
    file: "gs-22-first-hire.md",
    status: "planned",
    primaryModes: ["decide", "explore"],
  },
  {
    id: "podcast_pitch",
    number: 23,
    opening: "I want to pitch myself for a podcast.",
    file: "gs-23-podcast-pitch.md",
    status: "planned",
    primaryModes: ["explore", "create"],
  },
  {
    id: "newsletter_restart",
    number: 24,
    opening: "I want to start my newsletter again.",
    file: "gs-24-newsletter-restart.md",
    status: "planned",
    primaryModes: ["explore", "coach"],
  },
  {
    id: "burnout",
    number: 25,
    opening: "I think I'm burning out.",
    file: "gs-25-burnout.md",
    status: "planned",
    primaryModes: ["support", "restoration"],
  },
  {
    id: "celebrate_quietly",
    number: 26,
    opening: "Something small went right today.",
    file: "gs-26-celebrate-quietly.md",
    status: "planned",
    primaryModes: ["support", "celebrate"],
  },
  {
    id: "permission_to_pause",
    number: 27,
    opening: "I should keep working but I don't want to.",
    file: "gs-27-permission-to-pause.md",
    status: "planned",
    primaryModes: ["support", "coach"],
  },
  {
    id: "multi_project_chaos",
    number: 28,
    opening: "I have too many projects open.",
    file: "gs-28-multi-project-chaos.md",
    status: "planned",
    primaryModes: ["support", "decide"],
  },
] as const;

/** Required elements in every complete gold standard file */
export const SPARK_CONVERSATION_GOLD_STANDARD_REQUIRED_ELEMENTS = [
  "Shari responses",
  "internal reasoning",
  "hidden work",
  "permissions",
  "suggestions",
  "completion",
  "anti-patterns avoided",
] as const;
