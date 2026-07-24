/**
 * Guided Business Profile — Slice 2 registry entries.
 * Motivation · Return Plan · Decision Style · Work Preferences
 * Does not modify Slice 1 definitions.
 */

import {
  CONTINUE_HELPER_CHOICES,
  DECISION_STYLE_CHOICES,
  INSPIRATION_CHOICES,
  RESTART_ACTION_CHOICES,
  RETURN_DIFFICULTY_CHOICES,
  RETURN_OFFER_CHOICES,
  RETURN_TONE_CHOICES,
  SHARI_AVOID_CHOICES,
  WORK_COLLAB_CHOICES,
  WORK_ENVIRONMENT_CHOICES,
  WORK_SESSION_CHOICES,
  WORK_STRUCTURE_CHOICES,
  WORK_THINKING_CHOICES,
  WORK_TIME_CHOICES,
  type GuidedFieldDefinition,
} from "@/lib/profile/guidedFieldTypes";

function def(
  partial: Omit<GuidedFieldDefinition, "saveRequiresApproval">,
): GuidedFieldDefinition {
  return { ...partial, saveRequiresApproval: true };
}

export const SLICE2_GUIDED_FIELDS: GuidedFieldDefinition[] = [
  def({
    sectionId: "identity",
    fieldKey: "whyBusinessMatters",
    question: "Why does this business matter to you?",
    definition:
      "This is the emotional reason the work matters — not marketing copy. It helps Shari understand what gives your work meaning.",
    whyItMatters:
      "When work gets hard, remembering why it matters can steady you without pressure or pep talks.",
    howThisHelpsShari:
      "I'll remember what keeps you moving during difficult periods.",
    inputType: "textarea",
    examples: [
      {
        id: "mot-why-coach",
        businessType: "Coach",
        example:
          "It matters because I know how lonely building alone can feel, and I want people to have a steadier companion.",
        whyItWorks: "Personal and specific — not a slogan.",
      },
      {
        id: "mot-why-maker",
        businessType: "Handmade business",
        example:
          "It matters because making with my hands helps my family and keeps creativity alive in our home.",
        whyItWorks: "Names meaning without corporate language.",
      },
    ],
    guidedQuestions: [
      "What would be missing if this business did not exist?",
      "Who does this work serve in a way that feels personal?",
      "What part of this work feels most like you?",
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: [
      "identity.mission",
      "identity.whatInspiredYou",
      "identity.hopedImpact",
    ],
  }),
  def({
    sectionId: "identity",
    fieldKey: "whatInspiredYou",
    question: "What inspired you to begin?",
    definition: "The spark, story, or need that started this — in your own words.",
    whyItMatters:
      "Remembering the beginning can reconnect you when progress feels slow.",
    howThisHelpsShari:
      "I can honor your origin story when encouragement or clarity would help.",
    inputType: "chips_plus_custom",
    choices: [...INSPIRATION_CHOICES],
    examples: [
      {
        id: "mot-insp-service",
        businessType: "Local service",
        example: "Personal experience, Solving a problem",
        whyItWorks: "Simple labels that still leave room for your story.",
      },
    ],
    allowCustom: true,
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["identity.whyBusinessMatters", "identity.businessStory"],
  }),
  def({
    sectionId: "identity",
    fieldKey: "hopedImpact",
    question: "What impact do you hope to make?",
    definition:
      "Think beyond products or services. What change would make you proud?",
    whyItMatters:
      "Impact keeps daily work connected to the difference you care about.",
    howThisHelpsShari:
      "I can connect plans and wording to the change you hope people feel.",
    inputType: "textarea",
    examples: [
      {
        id: "mot-impact-edu",
        businessType: "Course creator",
        example:
          "I hope people leave less confused and more able to earn from skills they already care about.",
        whyItWorks: "Names a human change, not a vanity metric.",
      },
      {
        id: "mot-impact-community",
        businessType: "Membership",
        example:
          "I hope members feel less alone and more able to keep going in hard seasons.",
        whyItWorks: "Impact is felt, not inflated.",
      },
    ],
    guidedQuestions: [
      "What would be different for the people you serve?",
      "What would make you quietly proud a year from now?",
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["identity.vision", "identity.mission"],
  }),
  def({
    sectionId: "identity",
    fieldKey: "whatHelpsYouContinue",
    question: "What helps you continue when business becomes difficult?",
    definition:
      "Supports, reasons, or reminders that help you keep going when it is hard.",
    whyItMatters:
      "Knowing what steadies you helps Shari encourage without empty cheerleading.",
    howThisHelpsShari:
      "I'll remember what keeps you moving during difficult periods.",
    inputType: "chips_plus_custom",
    choices: [...CONTINUE_HELPER_CHOICES],
    examples: [
      {
        id: "mot-continue-faith",
        businessType: "Faith-rooted practice",
        example: "Faith, Purpose, Helping people",
        whyItWorks: "Names real anchors without performance pressure.",
      },
    ],
    allowCustom: true,
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["identity.whyBusinessMatters", "work-style.restartHelpers"],
  }),

  // ——— Return Plan (reuse overwhelmTriggers + restartHelpers) ———
  def({
    sectionId: "work-style",
    fieldKey: "overwhelmTriggers",
    question: "What usually makes returning difficult?",
    definition:
      "What tends to get in the way when you've been away — not a performance review.",
    whyItMatters:
      "Naming the friction helps Shari welcome you back without adding more weight.",
    howThisHelpsShari:
      "I'll know how to help you restart without creating more overwhelm.",
    inputType: "chips_plus_custom",
    choices: [...RETURN_DIFFICULTY_CHOICES],
    examples: [
      {
        id: "ret-diff-adhd",
        businessType: "ADHD founder",
        example: "Overwhelm, Not remembering where I left off, Too many choices",
        whyItWorks: "Honest and useful — no shame language.",
      },
    ],
    allowCustom: true,
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["work-style.restartHelpers", "work-style.returnOfferPreferences"],
  }),
  def({
    sectionId: "work-style",
    fieldKey: "restartHelpers",
    question: "What is the smallest action that usually helps you restart?",
    definition: "One gentle action that helps you begin again after time away.",
    whyItMatters:
      "A tiny restart is easier to trust than a long catch-up list.",
    howThisHelpsShari:
      "I'll know how to help you restart without creating more overwhelm.",
    inputType: "chips_plus_custom",
    choices: [...RESTART_ACTION_CHOICES],
    examples: [
      {
        id: "ret-restart-tiny",
        businessType: "Consultant",
        example: "One tiny task, Clear My Mind",
        whyItWorks: "Small enough to begin on a low-energy day.",
      },
    ],
    allowCustom: true,
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["work-style.overwhelmTriggers", "work-style.returnOfferPreferences"],
  }),
  def({
    sectionId: "work-style",
    fieldKey: "returnSupportTone",
    question: "What support tone feels best when you return?",
    definition: "How Shari should sound when you've been away.",
    whyItMatters: "Tone can restore dignity — or accidentally add pressure.",
    howThisHelpsShari:
      "I'll match the tone that helps you re-enter without feeling pushed.",
    inputType: "single_select",
    choices: [...RETURN_TONE_CHOICES],
    examples: [
      {
        id: "ret-tone-calm",
        businessType: "Creative studio",
        example: "Calm",
        whyItWorks: "One clear preference beats a long style guide.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["work-style.shariSupportStyle", "work-style.shariShouldAvoid"],
  }),
  def({
    sectionId: "work-style",
    fieldKey: "shariShouldAvoid",
    question: "What should Shari avoid?",
    definition: "Words, tones, or habits that do not help you.",
    whyItMatters: "Protects trust when you're already stretched.",
    howThisHelpsShari:
      "I'll know what to leave out so returning feels safer.",
    inputType: "chips_plus_custom",
    choices: [...SHARI_AVOID_CHOICES],
    examples: [
      {
        id: "ret-avoid",
        businessType: "Service business",
        example: "Pressure, Too many suggestions, Repeating myself",
        whyItWorks: "Clear boundaries without long rules.",
      },
    ],
    allowCustom: true,
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["work-style.returnSupportTone"],
  }),
  def({
    sectionId: "work-style",
    fieldKey: "returnOfferPreferences",
    question: "When you return after time away, what should Shari offer first?",
    definition:
      "Choose how Shari may greet you after time away. You can pick more than one.",
    whyItMatters: "Gives you control over re-entry without automatic lectures.",
    howThisHelpsShari:
      "I'll know how to help you restart without creating more overwhelm.",
    inputType: "multi_select",
    choices: [...RETURN_OFFER_CHOICES],
    examples: [
      {
        id: "ret-offer",
        businessType: "Online educator",
        example: "One small next step, Quiet support",
        whyItWorks: "Combines a tiny door with permission to go slow.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["work-style.restartHelpers", "work-style.overwhelmTriggers"],
  }),

  // ——— Decision Style ———
  def({
    sectionId: "work-style",
    fieldKey: "decisionStyle",
    question: "How do you usually like to make decisions?",
    definition:
      "There is no right answer. People often use more than one style. This teaches Shari how you naturally think through choices.",
    whyItMatters:
      "Matching support to how you decide reduces friction and second-guessing.",
    howThisHelpsShari:
      "I'll know when Visual Thinking Studio, the Chamber, or the Boardroom may be helpful — as guidance only, never automatic routing.",
    distinctionNote:
      "Visual map may later suggest Visual Thinking Studio · Multiple perspectives may suggest Chamber · Pros and cons may suggest Boardroom · Break into steps may simplify planning. You always choose.",
    inputType: "multi_select",
    choices: [...DECISION_STYLE_CHOICES],
    examples: [
      {
        id: "dec-mix",
        businessType: "Founder",
        example: "Talk it through, Break into steps, Sleep on it",
        whyItWorks: "Multiple styles are normal and welcome.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["direction.openDecisions"],
  }),

  // ——— Work Preferences ———
  def({
    sectionId: "work-style",
    fieldKey: "preferredTimeOfDay",
    question: "When do you usually work best?",
    definition: "The time of day when focus tends to come more easily.",
    whyItMatters: "Timing suggestions to your rhythm reduces wasted effort.",
    howThisHelpsShari:
      "I'll adapt suggestions to fit how you naturally work.",
    inputType: "single_select",
    choices: [...WORK_TIME_CHOICES],
    examples: [
      {
        id: "wp-time",
        businessType: "Writer",
        example: "Early morning",
        whyItWorks: "One clear preference Shari can honor.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    relatedFieldPaths: ["work-style.bestFocusTimes"],
  }),
  def({
    sectionId: "work-style",
    fieldKey: "preferredSessionLength",
    question: "What session length usually helps?",
    definition: "How long a stretch of work feels sustainable for you.",
    whyItMatters: "Matching session size to energy reduces overwhelm.",
    howThisHelpsShari:
      "I'll adapt suggestions to fit how you naturally work.",
    inputType: "single_select",
    choices: [...WORK_SESSION_CHOICES],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
  }),
  def({
    sectionId: "work-style",
    fieldKey: "soundPreference",
    question: "What work environment helps you?",
    definition: "Quiet, sound, music, or flexible — whatever supports focus.",
    whyItMatters: "Avoids interrupting you with the wrong atmosphere.",
    howThisHelpsShari:
      "I'll adapt suggestions to fit how you naturally work.",
    inputType: "single_select",
    choices: [...WORK_ENVIRONMENT_CHOICES],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
  }),
  def({
    sectionId: "work-style",
    fieldKey: "structurePreference",
    question: "How much structure do you prefer?",
    definition: "How much planned structure helps versus room to adapt.",
    whyItMatters: "Shapes how plans are offered without boxing you in.",
    howThisHelpsShari:
      "I'll adapt suggestions to fit how you naturally work.",
    inputType: "single_select",
    choices: [...WORK_STRUCTURE_CHOICES],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    relatedFieldPaths: ["work-style.planningPreferences"],
  }),
  def({
    sectionId: "work-style",
    fieldKey: "thinkingOrderPreference",
    question: "Big picture or details first?",
    definition: "Whether you like to start wide or start specific.",
    whyItMatters: "Helps conversations open in a way that fits your thinking.",
    howThisHelpsShari:
      "I'll adapt suggestions to fit how you naturally work.",
    inputType: "single_select",
    choices: [...WORK_THINKING_CHOICES],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
  }),
  def({
    sectionId: "work-style",
    fieldKey: "collaborationPreference",
    question: "Alone, collaboratively, or mixed?",
    definition: "How much thinking-with-Shari vs working alone feels right.",
    whyItMatters: "Keeps companionship helpful instead of intrusive.",
    howThisHelpsShari:
      "I'll adapt suggestions to fit how you naturally work.",
    inputType: "single_select",
    choices: [...WORK_COLLAB_CHOICES],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    relatedFieldPaths: ["work-style.communicationPreferences"],
  }),
];
