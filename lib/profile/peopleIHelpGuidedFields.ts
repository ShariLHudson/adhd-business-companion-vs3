/**
 * People I Help — guided field metadata (examples + definitions).
 * Help routing lives in fieldHelpRegistry; this holds member-facing copy.
 */

export type PeopleIHelpGuidedField = {
  fieldKey: string;
  fieldPath: string;
  question: string;
  definition: string;
  whyItMatters: string;
  howThisHelpsShari: string;
  examples: { businessType: string; example: string; whyItWorks: string }[];
};

export const PEOPLE_I_HELP_GUIDED_FIELDS: readonly PeopleIHelpGuidedField[] = [
  {
    fieldKey: "who",
    fieldPath: "people-i-help.who",
    question: "Who do you help most often?",
    definition:
      "A plain description of the person you most enjoy helping — not a market report.",
    whyItMatters:
      "Clear audience language makes marketing, offers, and conversations easier.",
    howThisHelpsShari:
      "I can write and plan with a real person in mind instead of a vague audience.",
    examples: [
      {
        businessType: "Coach",
        example: "Overwhelmed founders who want steadier days without shame.",
        whyItWorks: "Specific, human, and easy to picture.",
      },
    ],
  },
  {
    fieldKey: "name",
    fieldPath: "people-i-help.name",
    question: "What do you call this person?",
    definition: "A working name that makes them feel real.",
    whyItMatters: "A name keeps the profile personal and memorable.",
    howThisHelpsShari: "I can refer to them naturally in conversation.",
    examples: [
      {
        businessType: "Service business",
        example: "Busy Maya",
        whyItWorks: "Short and memorable.",
      },
    ],
  },
  {
    fieldKey: "painPoints",
    fieldPath: "people-i-help.painPoints",
    question: "What are they struggling with most?",
    definition: "The friction they feel before they find you.",
    whyItMatters: "Helps you speak to real needs instead of assumed ones.",
    howThisHelpsShari: "I can mirror their struggles with care in your messaging.",
    examples: [
      {
        businessType: "Consultant",
        example: "Too many unfinished projects and no clear next step.",
        whyItWorks: "Concrete struggle, not jargon.",
      },
    ],
  },
  {
    fieldKey: "goals",
    fieldPath: "people-i-help.goals",
    question: "What are they trying to achieve?",
    definition: "What success looks like from their point of view.",
    whyItMatters: "Keeps offers aimed at outcomes they actually want.",
    howThisHelpsShari: "I can connect your help to their hoped-for future.",
    examples: [
      {
        businessType: "Educator",
        example: "Earn consistently from skills they already care about.",
        whyItWorks: "Outcome-focused and plain.",
      },
    ],
  },
  {
    fieldKey: "currentBehavior",
    fieldPath: "people-i-help.currentBehavior",
    question: "What slows them down or holds them back?",
    definition: "Habits or obstacles that delay progress.",
    whyItMatters: "Shows where your support removes friction.",
    howThisHelpsShari: "I can name blockers without shaming language.",
    examples: [
      {
        businessType: "ADHD-friendly coach",
        example: "Starts strong, then loses the thread when life gets noisy.",
        whyItWorks: "Recognizable and compassionate.",
      },
    ],
  },
  {
    fieldKey: "solution",
    fieldPath: "people-i-help.solution",
    question: "How do you uniquely help?",
    definition: "Your edge — what you do that fits them especially well.",
    whyItMatters: "Clarifies why someone would choose you.",
    howThisHelpsShari: "I can highlight your difference without hard selling.",
    examples: [
      {
        businessType: "Maker",
        example: "Calm, step-by-step guidance that respects limited energy.",
        whyItWorks: "Specific help style, not a feature list.",
      },
    ],
  },
  {
    fieldKey: "motivations",
    fieldPath: "people-i-help.motivations",
    question: "What motivates them?",
    definition: "What usually moves them toward a decision or change.",
    whyItMatters: "Shapes tone and timing in your communication.",
    howThisHelpsShari: "I can match encouragement to what actually moves them.",
    examples: [
      {
        businessType: "Membership",
        example: "Belonging and not having to figure everything out alone.",
        whyItWorks: "Emotional driver, not a demographic.",
      },
    ],
  },
  {
    fieldKey: "objections",
    fieldPath: "people-i-help.objections",
    question: "What objections do they raise?",
    definition: "Common hesitations before they say yes.",
    whyItMatters: "Lets you answer honestly without pressure.",
    howThisHelpsShari: "I can prepare gentle responses to real concerns.",
    examples: [
      {
        businessType: "Course creator",
        example: "I don't have time / I've tried before and stalled.",
        whyItWorks: "Real objections people actually say.",
      },
    ],
  },
  {
    fieldKey: "triggers",
    fieldPath: "people-i-help.triggers",
    question: "What buying or decision triggers matter?",
    definition: "Moments or signals that help them decide.",
    whyItMatters: "Supports timing without manipulation.",
    howThisHelpsShari: "I can suggest when a soft invitation may fit.",
    examples: [
      {
        businessType: "Local service",
        example: "A referral from someone they trust, or a sudden need at home.",
        whyItWorks: "Practical and ethical.",
      },
    ],
  },
  {
    fieldKey: "contentPrefs",
    fieldPath: "people-i-help.contentPrefs",
    question: "How do they like to learn or consume content?",
    definition: "Formats and styles that feel easy for them.",
    whyItMatters: "Reduces wasted content that never lands.",
    howThisHelpsShari: "I can suggest formats that match how they learn.",
    examples: [
      {
        businessType: "Online educator",
        example: "Short videos and simple checklists — not long PDFs.",
        whyItWorks: "Clear preference, easy to act on.",
      },
    ],
  },
  {
    fieldKey: "behaviorTraits",
    fieldPath: "people-i-help.behaviorTraits",
    question: "How do they tend to show up?",
    definition:
      "A few recognizable patterns — not labels that box someone in forever.",
    whyItMatters: "Helps tone and pacing feel familiar to them.",
    howThisHelpsShari: "I can match energy without stereotyping.",
    examples: [
      {
        businessType: "Service business",
        example: "Thoughtful · Overwhelmed · Ready for clarity",
        whyItWorks: "Human traits, not clinical categories.",
      },
    ],
  },
  {
    fieldKey: "tagline",
    fieldPath: "people-i-help.tagline",
    question: "One-line identity for this person",
    definition: "A short line that captures who they are.",
    whyItMatters: "Makes the profile easy to recognize at a glance.",
    howThisHelpsShari: "I can keep them vivid in conversation.",
    examples: [
      {
        businessType: "Coach",
        example: "The founder who wants calm progress without shame.",
        whyItWorks: "Identity + hope in one line.",
      },
    ],
  },
];

const BY_KEY = new Map(
  PEOPLE_I_HELP_GUIDED_FIELDS.map((f) => [f.fieldKey, f] as const),
);

export function getPeopleIHelpGuidedField(
  fieldKey: string,
): PeopleIHelpGuidedField | undefined {
  return BY_KEY.get(fieldKey);
}
