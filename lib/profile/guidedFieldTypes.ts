/**
 * Guided Business Profile — Slice 1 field guidance model.
 * Guidance metadata lives in code. Profile values stay plain strings.
 */

import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";

export type GuidanceHelpMode =
  | "explain_this"
  | "show_examples"
  | "help_me_choose"
  | "help_me_develop"
  | "research_with_shari";

export type AnswerConfidence =
  | "very_confident"
  | "mostly_confident"
  | "still_figuring_it_out"
  | "not_sure_yet";

export type GuidedFieldChoice = {
  id: string;
  label: string;
  description: string;
};

export type GuidedFieldExample = {
  id: string;
  businessType: string;
  example: string;
  /** One sentence explaining why the example works */
  whyItWorks: string;
};

export type GuidedFieldDefinition = {
  sectionId: BusinessEstateSectionId;
  fieldKey: string;
  question: string;
  definition: string;
  whyItMatters: string;
  howThisHelpsShari: string;
  /** Optional mission-vs-vision clarification */
  distinctionNote?: string;
  inputType:
    | "text"
    | "textarea"
    | "single_select"
    | "multi_select"
    | "chips_plus_custom";
  choices?: GuidedFieldChoice[];
  examples?: GuidedFieldExample[];
  guidedQuestions?: string[];
  allowCustom?: boolean;
  allowImNotSure?: boolean;
  enableExplainThis?: boolean;
  enableShowExamples?: boolean;
  enableHelpMeChoose?: boolean;
  enableHelpMeDevelop?: boolean;
  enableResearchWithShari?: boolean;
  relatedFieldPaths?: string[];
  saveRequiresApproval: boolean;
};

/** @deprecated Alias — prefer GuidedFieldDefinition */
export type GuidedFieldDef = GuidedFieldDefinition;

export type BusinessEstateFieldHelpContext = {
  sectionId: string;
  fieldKey: string;
  helpMode: GuidanceHelpMode;
  currentValue?: string;
  approvedBusinessContext: Record<string, string>;
  primaryPeopleIHelpContext?: {
    id?: string;
    name?: string;
    summary?: string;
  };
  confidence?: AnswerConfidence;
  guidedQuestions?: string[];
  question?: string;
  definition?: string;
};

/** Legacy shape used by chat prompt formatting */
export type GuidedFieldHelpRequest = BusinessEstateFieldHelpContext & {
  fieldPath: string;
  relatedFieldValues: Record<string, string>;
};

export const GUIDED_FIELD_HELP_EVENT = "companion-business-estate-field-help";

/** Member-facing opener when Help Me Answer / Research This opens chat. */
export function guidedFieldHelpMemberOpener(
  helpMode: GuidanceHelpMode,
): string {
  if (helpMode === "research_with_shari") {
    return "Research this for me — look for outside perspective that could help me answer, without changing my draft.";
  }
  return "Help me answer this question based on what you already know about my business.";
}

/** Short assistant line before Shari’s reply — does not replace the draft. */
export function guidedFieldHelpAssistantWelcome(
  helpMode: GuidanceHelpMode,
  question?: string,
): string {
  const topic = question?.trim() || "this question";
  if (helpMode === "research_with_shari") {
    return `I'll research ${topic} with you. Your draft stays as it is until you choose what to keep.`;
  }
  return `Let's work through ${topic} together. Your draft stays right where it is — nothing is saved until you decide.`;
}

export const ANSWER_CONFIDENCE_OPTIONS: readonly {
  id: AnswerConfidence;
  label: string;
}[] = [
  { id: "very_confident", label: "Very confident" },
  { id: "mostly_confident", label: "Mostly confident" },
  { id: "still_figuring_it_out", label: "Still figuring it out" },
  { id: "not_sure_yet", label: "Not sure yet" },
] as const;

export const BUSINESS_STAGE_CHOICES: readonly GuidedFieldChoice[] = [
  {
    id: "idea",
    label: "Idea",
    description: "Exploring an idea but not operating yet.",
  },
  {
    id: "preparing_to_launch",
    label: "Preparing to Launch",
    description:
      "Building your offer, systems, audience, or launch plan.",
  },
  {
    id: "newly_launched",
    label: "Newly Launched",
    description:
      "Recently opened and beginning to gain customers or clients.",
  },
  {
    id: "growing",
    label: "Growing",
    description:
      "You have customers and are working toward more consistent sales, delivery, or visibility.",
  },
  {
    id: "established",
    label: "Established",
    description:
      "Your business operates consistently and you are refining, improving, or expanding it.",
  },
  {
    id: "scaling",
    label: "Scaling",
    description:
      "You are increasing capacity through systems, team members, automation, locations, or new markets.",
  },
  {
    id: "reinventing",
    label: "Reinventing",
    description:
      "You are changing your direction, audience, offers, business model, or brand.",
  },
  {
    id: "paused",
    label: "Paused",
    description:
      "You are temporarily stepping back while preserving the possibility of returning.",
  },
  {
    id: "im_not_sure",
    label: "I'm Not Sure",
    description: "Let Shari help you find the closest fit.",
  },
] as const;

export const CORE_VALUE_SUGGESTIONS: readonly GuidedFieldChoice[] = [
  { id: "integrity", label: "Integrity", description: "Say what you mean and follow through." },
  { id: "compassion", label: "Compassion", description: "Meet people with care." },
  { id: "faith", label: "Faith", description: "Stay rooted in what you believe." },
  { id: "service", label: "Service", description: "Put helpfulness at the center." },
  { id: "simplicity", label: "Simplicity", description: "Keep what matters; release clutter." },
  { id: "creativity", label: "Creativity", description: "Find fresh, useful ways to help." },
  { id: "excellence", label: "Excellence", description: "Do careful work you can stand behind." },
  { id: "education", label: "Education", description: "Help people learn and grow." },
  { id: "family", label: "Family", description: "Honor family in how you build." },
  { id: "community", label: "Community", description: "Strengthen belonging among people." },
  { id: "innovation", label: "Innovation", description: "Improve how things are done." },
  { id: "freedom", label: "Freedom", description: "Protect space to choose and create." },
  { id: "reliability", label: "Reliability", description: "Be someone others can count on." },
  { id: "inclusion", label: "Inclusion", description: "Make room for more people to belong." },
  { id: "quality", label: "Quality", description: "Care about the craft of the work." },
  { id: "courage", label: "Courage", description: "Do the hard honest thing when it matters." },
  { id: "respect", label: "Respect", description: "Treat people with dignity." },
  { id: "sustainability", label: "Sustainability", description: "Build in ways that can last." },
  {
    id: "personal_connection",
    label: "Personal Connection",
    description: "Keep relationships human and close.",
  },
  { id: "transparency", label: "Transparency", description: "Be clear about what is true." },
] as const;

/** ——— Slice 2 choice sets ——— */

export const INSPIRATION_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "personal_experience", label: "Personal experience", description: "Something you lived through." },
  { id: "solving_a_problem", label: "Solving a problem", description: "A gap you kept seeing." },
  { id: "family", label: "Family", description: "Family needs or hopes." },
  { id: "faith", label: "Faith", description: "Belief that shaped the work." },
  { id: "opportunity", label: "Opportunity", description: "A door that opened." },
  { id: "passion", label: "Passion", description: "Work you love doing." },
  { id: "career_change", label: "Career change", description: "A new chapter after other work." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still putting words to it." },
] as const;

export const CONTINUE_HELPER_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "helping_people", label: "Helping people", description: "The difference for others keeps you going." },
  { id: "faith", label: "Faith", description: "Belief steadies you." },
  { id: "family", label: "Family", description: "People you love." },
  { id: "freedom", label: "Freedom", description: "Space to choose your path." },
  { id: "creativity", label: "Creativity", description: "Making something of your own." },
  { id: "financial_security", label: "Financial security", description: "Stability for you and yours." },
  { id: "purpose", label: "Purpose", description: "Meaning bigger than the tasks." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still noticing what helps." },
] as const;

export const RETURN_DIFFICULTY_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "overwhelm", label: "Overwhelm", description: "Too much waiting at once." },
  { id: "fear", label: "Fear", description: "Worry about starting again." },
  { id: "too_many_choices", label: "Too many choices", description: "Not knowing which door to open." },
  { id: "not_remembering", label: "Not remembering where I left off", description: "Lost the thread." },
  { id: "perfectionism", label: "Perfectionism", description: "Hard to begin unless it feels right." },
  { id: "low_energy", label: "Low energy", description: "The tank feels empty." },
  { id: "avoidance", label: "Avoidance", description: "Putting it off feels safer." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still learning the pattern." },
] as const;

export const RESTART_ACTION_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "review_last_session", label: "Review my last session", description: "See where you paused." },
  { id: "clear_my_mind", label: "Clear My Mind", description: "Empty the clutter first." },
  { id: "one_tiny_task", label: "One tiny task", description: "The smallest possible step." },
  { id: "todays_priorities", label: "Look at today's priorities", description: "One clear focus for today." },
  { id: "read_notes", label: "Read my notes", description: "Reconnect through what you wrote." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still discovering what helps." },
] as const;

export const RETURN_TONE_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "gentle", label: "Gentle", description: "Soft and low pressure." },
  { id: "encouraging", label: "Encouraging", description: "Warm belief without hype." },
  { id: "practical", label: "Practical", description: "Clear and useful." },
  { id: "direct", label: "Direct", description: "Straight to the point." },
  { id: "cheerful", label: "Cheerful", description: "Light and uplifting." },
  { id: "calm", label: "Calm", description: "Steady and quiet." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still deciding." },
] as const;

export const SHARI_AVOID_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "too_many_suggestions", label: "Too many suggestions", description: "More options than you can hold." },
  { id: "long_explanations", label: "Long explanations", description: "Walls of words." },
  { id: "pressure", label: "Pressure", description: "Urgency that feels heavy." },
  { id: "deadlines", label: "Deadlines", description: "Countdown language." },
  { id: "too_much_talking", label: "Too much talking", description: "More chatter than help." },
  { id: "repeating_myself", label: "Repeating myself", description: "Asking what you already shared." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still noticing what doesn't help." },
] as const;

export const RETURN_OFFER_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "summary", label: "Summary", description: "A short overview of where things left off." },
  { id: "tiny_next_step", label: "One small next step", description: "One gentle action to begin." },
  { id: "clear_my_mind", label: "Clear My Mind", description: "Space to empty mental clutter first." },
  { id: "review_projects", label: "Review Projects", description: "Look at projects when that helps." },
  { id: "quiet_support", label: "Quiet support", description: "Presence without a to-do list." },
  { id: "ask_what_i_need", label: "Ask me what I need", description: "Let you choose the doorway." },
] as const;

export const DECISION_STYLE_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "talk_it_through", label: "Talk it through", description: "Think out loud with a calm companion." },
  { id: "visual_map", label: "Visual map", description: "See how pieces connect — Visual Thinking Studio may help later." },
  { id: "pros_and_cons", label: "Pros and cons", description: "Lay options side by side — Boardroom may help later." },
  { id: "research_first", label: "Research first", description: "Gather information before choosing." },
  { id: "multiple_perspectives", label: "Hear multiple perspectives", description: "Several viewpoints — Chamber may help later." },
  { id: "break_into_steps", label: "Break into steps", description: "Decide one small piece at a time." },
  { id: "sleep_on_it", label: "Sleep on it", description: "Give it time before deciding." },
  { id: "follow_intuition", label: "Follow intuition", description: "Trust what feels right after listening." },
  { id: "im_not_sure", label: "I'm not sure", description: "Still learning what helps you decide." },
] as const;

export const WORK_TIME_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "early_morning", label: "Early morning", description: "Before the day fills up." },
  { id: "morning", label: "Morning", description: "Morning focus works well." },
  { id: "afternoon", label: "Afternoon", description: "Afternoons are stronger." },
  { id: "evening", label: "Evening", description: "Evening focus comes easier." },
  { id: "late_night", label: "Late night", description: "Quiet hours after dark." },
  { id: "varies", label: "Varies", description: "It changes day to day." },
] as const;

export const WORK_SESSION_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "15", label: "15 minutes", description: "Very short bursts." },
  { id: "30", label: "30 minutes", description: "A small focused stretch." },
  { id: "45", label: "45 minutes", description: "A moderate session." },
  { id: "60", label: "60 minutes", description: "A longer focus block." },
  { id: "flexible", label: "Flexible", description: "Length depends on the day." },
] as const;

export const WORK_ENVIRONMENT_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "quiet", label: "Quiet", description: "Silence helps you think." },
  { id: "background_music", label: "Background music", description: "Music supports focus." },
  { id: "nature_sounds", label: "Nature sounds", description: "Soft nature sound helps." },
  { id: "conversation_nearby", label: "Conversation nearby", description: "Life nearby is fine." },
  { id: "doesnt_matter", label: "Doesn't matter", description: "Sound is flexible." },
] as const;

export const WORK_STRUCTURE_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "highly_structured", label: "Highly structured", description: "Clear plans reduce friction." },
  { id: "moderate", label: "Moderate structure", description: "Some plan, some room." },
  { id: "flexible", label: "Flexible", description: "Adapt as you go." },
  { id: "changes_daily", label: "Changes daily", description: "Needs shift with the day." },
] as const;

export const WORK_THINKING_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "big_picture", label: "Big picture first", description: "Start wide, then details." },
  { id: "details", label: "Details first", description: "Start specific, then widen." },
  { id: "depends", label: "Depends", description: "It depends on the work." },
] as const;

export const WORK_COLLAB_CHOICES: readonly GuidedFieldChoice[] = [
  { id: "alone", label: "Alone", description: "You prefer working through things yourself." },
  { id: "collaboratively", label: "Collaboratively", description: "Thinking together helps." },
  { id: "mixed", label: "Mixed", description: "Sometimes alone, sometimes together." },
] as const;

/** Session-only confidence — not persisted in profile storage. */
const CONFIDENCE_SESSION_KEY = "companion-guided-field-confidence-v1";

export function readSessionConfidence(
  fieldPath: string,
): AnswerConfidence | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CONFIDENCE_SESSION_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, AnswerConfidence>;
    return map[fieldPath];
  } catch {
    return undefined;
  }
}

export function writeSessionConfidence(
  fieldPath: string,
  confidence: AnswerConfidence | "",
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(CONFIDENCE_SESSION_KEY);
    const map = raw
      ? (JSON.parse(raw) as Record<string, AnswerConfidence>)
      : {};
    if (!confidence) delete map[fieldPath];
    else map[fieldPath] = confidence;
    sessionStorage.setItem(CONFIDENCE_SESSION_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
