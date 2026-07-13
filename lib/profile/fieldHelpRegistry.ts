/**
 * Universal Field Help Registry — platform standard for Guided Assistance.
 * Business Estate + People I Help. No automatic routing or saving.
 */

import { getChamberMemberById } from "@/lib/chamber/chamberMemberRegistry";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { GuidanceHelpMode } from "@/lib/profile/guidedFieldTypes";

export type FieldHelpSurface = "business-estate" | "people-i-help";

export type FieldHelpAction =
  | "explain_this"
  | "show_examples"
  | "help_me_choose"
  | "help_me_develop"
  | "research_with_shari"
  | "ask_an_expert";

export type FieldHelpRegistryEntry = {
  fieldPath: string;
  surface: FieldHelpSurface;
  /** Plain question / label for help packets */
  question: string;
  availableActions: readonly FieldHelpAction[];
  defaultHelpAction: FieldHelpAction;
  /** Spoken when member chooses "I'm not sure" — always a continuation */
  imNotSureOpener: string;
  /** Chamber member invited into conversation only after explicit acceptance */
  chamberExpertId?: ChamberMemberId;
  /** Prefer Boardroom perspective (still invitation-only; never auto-open) */
  boardroomAppropriate?: boolean;
  /** Cartography may help later — never auto-open */
  cartographyAppropriate?: boolean;
};

export type ExpertInviteState = {
  fieldPath: string;
  expertId: ChamberMemberId;
  expertDisplayName: string;
  specialty: string;
  activationOpener: string;
  invitedAt: string;
  /** Member accepted "Would you like another perspective?" */
  accepted: boolean;
};

const EXPERT_SESSION_KEY = "companion-guided-expert-invite-v1";
const EXPERT_PROMPT_KEY = "companion-guided-expert-prompt-v1";

/** Explicit contract: help never auto-saves or auto-navigates. */
export const GUIDED_ASSISTANCE_MAY_AUTO_SAVE = false as const;
export const GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE = false as const;
export const GUIDED_ASSISTANCE_MAY_AUTO_OPEN_CHAMBER = false as const;
export const GUIDED_ASSISTANCE_MAY_AUTO_OPEN_BOARDROOM = false as const;

function entry(
  partial: FieldHelpRegistryEntry,
): FieldHelpRegistryEntry {
  return partial;
}

/**
 * Canonical help routing — do not hardcode experts inside field UIs.
 */
export const FIELD_HELP_REGISTRY: readonly FieldHelpRegistryEntry[] = [
  // ——— Business Estate Identity (Slice 1) ———
  entry({
    fieldPath: "identity.businessStage",
    surface: "business-estate",
    question: "Where is your business right now?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "research_with_shari",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener:
      "No problem. I'll ask a few simple questions and we'll figure it out together.",
    chamberExpertId: "strategy",
  }),
  entry({
    fieldPath: "identity.mission",
    surface: "business-estate",
    question: "What is your business here to do?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "Let's discover your mission together.",
    chamberExpertId: "strategy",
  }),
  entry({
    fieldPath: "identity.vision",
    surface: "business-estate",
    question: "What future would you like your business to help create?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "Let's explore the future you hope to help create.",
    chamberExpertId: "innovations",
  }),
  entry({
    fieldPath: "identity.coreValues",
    surface: "business-estate",
    question: "What values guide this business?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener:
      "That's okay. We'll notice what matters most in how you want to work with people.",
    chamberExpertId: "leadership",
  }),
  // ——— Motivation (Slice 2) ———
  entry({
    fieldPath: "identity.whyBusinessMatters",
    surface: "business-estate",
    question: "Why does this business matter to you?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener:
      "We'll find the meaning together — one gentle question at a time.",
  }),
  entry({
    fieldPath: "identity.whatInspiredYou",
    surface: "business-estate",
    question: "What inspired you to begin?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "help_me_develop",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "Let's look at a few common sparks and see what fits.",
  }),
  entry({
    fieldPath: "identity.hopedImpact",
    surface: "business-estate",
    question: "What impact do you hope to make?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll name the change that would make you proud.",
    chamberExpertId: "horizons",
  }),
  entry({
    fieldPath: "identity.whatHelpsYouContinue",
    surface: "business-estate",
    question: "What helps you continue when business becomes difficult?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "help_me_develop",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll notice what steadies you when work gets hard.",
    chamberExpertId: "wellness",
  }),
  // ——— Working Style / Return / Decision ———
  entry({
    fieldPath: "work-style.decisionStyle",
    surface: "business-estate",
    question: "How do you usually like to make decisions?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener:
      "There is no right answer — we'll explore what usually helps you decide.",
    boardroomAppropriate: true,
    cartographyAppropriate: true,
    chamberExpertId: "strategy",
  }),
  entry({
    fieldPath: "work-style.overwhelmTriggers",
    surface: "business-estate",
    question: "What usually makes returning difficult?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "help_me_develop",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener:
      "That's common. We'll name the friction gently so restarting feels safer.",
    chamberExpertId: "wellness",
  }),
  entry({
    fieldPath: "work-style.restartHelpers",
    surface: "business-estate",
    question: "What is the smallest action that usually helps you restart?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_choose",
      "help_me_develop",
    ],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll find one tiny restart that feels possible.",
  }),
  entry({
    fieldPath: "work-style.returnSupportTone",
    surface: "business-estate",
    question: "What support tone feels best when you return?",
    availableActions: ["explain_this", "show_examples", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll try a few tones and you can pick what feels kind.",
  }),
  entry({
    fieldPath: "work-style.shariShouldAvoid",
    surface: "business-estate",
    question: "What should Shari avoid?",
    availableActions: ["explain_this", "show_examples", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll notice what doesn't help — no judgment.",
  }),
  entry({
    fieldPath: "work-style.returnOfferPreferences",
    surface: "business-estate",
    question: "When you return, what should Shari offer first?",
    availableActions: ["explain_this", "show_examples", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "You can pick more than one — or we'll explore options together.",
  }),
  entry({
    fieldPath: "work-style.preferredTimeOfDay",
    surface: "business-estate",
    question: "When do you usually work best?",
    availableActions: ["explain_this", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll notice when focus comes more easily for you.",
  }),
  entry({
    fieldPath: "work-style.preferredSessionLength",
    surface: "business-estate",
    question: "What session length usually helps?",
    availableActions: ["explain_this", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll find a length that feels sustainable.",
  }),
  entry({
    fieldPath: "work-style.soundPreference",
    surface: "business-estate",
    question: "What work environment helps you?",
    availableActions: ["explain_this", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll try a few environments and you can choose.",
  }),
  entry({
    fieldPath: "work-style.structurePreference",
    surface: "business-estate",
    question: "How much structure do you prefer?",
    availableActions: ["explain_this", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll find the amount of structure that reduces friction.",
  }),
  entry({
    fieldPath: "work-style.thinkingOrderPreference",
    surface: "business-estate",
    question: "Big picture or details first?",
    availableActions: ["explain_this", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "Either is fine — we'll notice what usually helps you start.",
  }),
  entry({
    fieldPath: "work-style.collaborationPreference",
    surface: "business-estate",
    question: "Alone, collaboratively, or mixed?",
    availableActions: ["explain_this", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We'll find the balance that feels supportive, not intrusive.",
  }),
  entry({
    fieldPath: "brand.tone",
    surface: "business-estate",
    question: "How should your business sound?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "I'll help you find a style that feels natural.",
    chamberExpertId: "content",
  }),
  entry({
    fieldPath: "offers.mainOffer",
    surface: "business-estate",
    question: "What is your main offer?",
    availableActions: [
      "explain_this",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll clarify what you most want to offer — one step at a time.",
    chamberExpertId: "sales",
  }),
  entry({
    fieldPath: "tools.otherSystems",
    surface: "business-estate",
    question: "What systems does your business use?",
    availableActions: ["explain_this", "help_me_develop", "ask_an_expert"],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll map what's already in place without pressure.",
    chamberExpertId: "systems",
  }),

  // ——— People I Help ———
  entry({
    fieldPath: "people-i-help.who",
    surface: "people-i-help",
    question: "Who do you help most often?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "Let's explore who you most enjoy helping.",
    chamberExpertId: "marketing",
  }),
  entry({
    fieldPath: "people-i-help.name",
    surface: "people-i-help",
    question: "What do you call this person?",
    availableActions: ["explain_this", "show_examples", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We can pick a simple working name for now — you can change it anytime.",
  }),
  entry({
    fieldPath: "people-i-help.painPoints",
    surface: "people-i-help",
    question: "What are they struggling with most?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll name the struggles you hear most often.",
    chamberExpertId: "client-relationships",
  }),
  entry({
    fieldPath: "people-i-help.goals",
    surface: "people-i-help",
    question: "What are they trying to achieve?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll clarify what success looks like for them.",
    chamberExpertId: "marketing",
  }),
  entry({
    fieldPath: "people-i-help.currentBehavior",
    surface: "people-i-help",
    question: "What slows them down or holds them back?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll notice patterns without judging them — or you.",
    chamberExpertId: "client-relationships",
  }),
  entry({
    fieldPath: "people-i-help.solution",
    surface: "people-i-help",
    question: "How do you uniquely help?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll put words to what makes your help different.",
    chamberExpertId: "sales",
  }),
  entry({
    fieldPath: "people-i-help.motivations",
    surface: "people-i-help",
    question: "What motivates them?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll explore what usually moves them to act.",
    chamberExpertId: "marketing",
  }),
  entry({
    fieldPath: "people-i-help.objections",
    surface: "people-i-help",
    question: "What objections do they raise?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll list the hesitations you hear most.",
    chamberExpertId: "sales",
  }),
  entry({
    fieldPath: "people-i-help.triggers",
    surface: "people-i-help",
    question: "What buying or decision triggers matter?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "research_with_shari",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll notice what helps them decide — gently.",
    chamberExpertId: "sales",
  }),
  entry({
    fieldPath: "people-i-help.contentPrefs",
    surface: "people-i-help",
    question: "How do they like to learn or consume content?",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll find formats that feel natural for them.",
    chamberExpertId: "content",
  }),
  entry({
    fieldPath: "people-i-help.behaviorTraits",
    surface: "people-i-help",
    question: "How do they tend to show up?",
    availableActions: ["explain_this", "show_examples", "help_me_choose"],
    defaultHelpAction: "help_me_choose",
    imNotSureOpener: "We can pick a few traits that feel familiar — not labels that box them in.",
    chamberExpertId: "client-relationships",
  }),
  entry({
    fieldPath: "people-i-help.tagline",
    surface: "people-i-help",
    question: "One-line identity for this person",
    availableActions: [
      "explain_this",
      "show_examples",
      "help_me_develop",
      "ask_an_expert",
    ],
    defaultHelpAction: "help_me_develop",
    imNotSureOpener: "We'll craft a short line that captures who they are.",
    chamberExpertId: "content",
  }),
];

const BY_PATH = new Map(
  FIELD_HELP_REGISTRY.map((e) => [e.fieldPath, e] as const),
);

export function getFieldHelpEntry(
  fieldPath: string,
): FieldHelpRegistryEntry | undefined {
  return BY_PATH.get(fieldPath);
}

export function listFieldHelpEntries(
  surface?: FieldHelpSurface,
): FieldHelpRegistryEntry[] {
  if (!surface) return [...FIELD_HELP_REGISTRY];
  return FIELD_HELP_REGISTRY.filter((e) => e.surface === surface);
}

/** Every registry entry with I'm-not-sure support must have a non-empty opener. */
export function assertNoImNotSureDeadEnds(): {
  ok: boolean;
  missing: string[];
} {
  const missing = FIELD_HELP_REGISTRY.filter(
    (e) => !e.imNotSureOpener.trim(),
  ).map((e) => e.fieldPath);
  return { ok: missing.length === 0, missing };
}

export function helpActionToMode(action: FieldHelpAction): GuidanceHelpMode {
  switch (action) {
    case "explain_this":
      return "explain_this";
    case "show_examples":
      return "show_examples";
    case "help_me_choose":
      return "help_me_choose";
    case "help_me_develop":
      return "help_me_develop";
    case "research_with_shari":
      return "research_with_shari";
    case "ask_an_expert":
      return "help_me_develop";
    default:
      return "explain_this";
  }
}

export function resolveExpertInvite(
  fieldPath: string,
): ExpertInviteState | null {
  const entry = getFieldHelpEntry(fieldPath);
  if (!entry?.chamberExpertId) return null;
  const member = getChamberMemberById(entry.chamberExpertId);
  if (!member) return null;
  return {
    fieldPath,
    expertId: member.id,
    expertDisplayName: member.displayName,
    specialty: member.specialty,
    activationOpener: member.activationOpener,
    invitedAt: new Date().toISOString(),
    accepted: false,
  };
}

export function acceptExpertInvite(fieldPath: string): ExpertInviteState | null {
  const invite = resolveExpertInvite(fieldPath);
  if (!invite) return null;
  const accepted: ExpertInviteState = { ...invite, accepted: true };
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(EXPERT_SESSION_KEY, JSON.stringify(accepted));
    } catch {
      /* ignore */
    }
  }
  return accepted;
}

export function readActiveExpertInvite(): ExpertInviteState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EXPERT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExpertInviteState;
  } catch {
    return null;
  }
}

export function clearExpertInvite(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(EXPERT_SESSION_KEY);
    sessionStorage.removeItem(EXPERT_PROMPT_KEY);
  } catch {
    /* ignore */
  }
}

export function formatExpertJoinedBanner(invite: ExpertInviteState): string {
  return `${invite.expertDisplayName} has joined the conversation.`;
}

/** Session-only prompt fragment for companion chat — never persists profile data. */
export function writeExpertSessionPrompt(
  invite: ExpertInviteState,
  currentValue = "",
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      EXPERT_PROMPT_KEY,
      [
        `EXPERT JOINED (in-conversation only — do not navigate away)`,
        `${invite.expertDisplayName} (${invite.specialty})`,
        invite.activationOpener,
        `Field: ${invite.fieldPath}`,
        `Current value: ${currentValue.trim() || "(empty)"}`,
        "Do NOT save profile answers. Do NOT open Chamber or Boardroom UI.",
        `Contract: autoSave=${GUIDED_ASSISTANCE_MAY_AUTO_SAVE} autoNavigate=${GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE} autoChamber=${GUIDED_ASSISTANCE_MAY_AUTO_OPEN_CHAMBER}`,
      ].join("\n"),
    );
  } catch {
    /* ignore */
  }
}

export function readExpertSessionPrompt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(EXPERT_PROMPT_KEY);
  } catch {
    return null;
  }
}

export function clearExpertSessionPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(EXPERT_PROMPT_KEY);
  } catch {
    /* ignore */
  }
}
