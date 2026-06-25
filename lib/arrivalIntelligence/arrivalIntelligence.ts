/**
 * Arrival Intelligence™ — orchestrates the Companion Home before render.
 *
 * Answers (without hard-coding forever):
 * 1. Who is arriving?
 * 2. What state are they arriving in?
 * 3. What matters most today?
 * 4. What is the smallest thing to make today easier?
 */

import { getCompanionAuthIntelligence } from "@/lib/companionAuthIntelligence";
import { getPrefs } from "@/lib/companionStore";
import {
  resolveCompanionContinue,
  type CompanionContinueOption,
  type CompanionContinueResolution,
} from "@/lib/companionLedContinue";
import { getHomeVisitCount } from "@/lib/homeWelcome";
import {
  isPhase1OnboardingActive,
  FIRST_CONVERSATION_QUESTION,
  FIRST_CONVERSATION_INPUT_CUE,
  FIRST_CONVERSATION_WELCOME,
  QUIET_PRESENCE_OPENING,
} from "@/lib/phase1Onboarding";
import {
  homeChromeForState,
  resolveCompanionHomeState,
  type CompanionHomeState,
  type HomeChromeConfig,
} from "./homeState";
import {
  hoursSinceLastArrival,
  recordArrival,
  timeOfDayBucket,
} from "./livingIntelligenceGraph";
import { refreshNarrativeContextOnArrival, type NarrativeContext } from "./narrativeContext";
import type {
  ArrivalConversationalTone,
  ArrivalGreetingStrategy,
  ArrivalSuggestedAction,
  ArrivalUiEmphasis,
  ArrivalVisitorKind,
} from "./arrivalTypes";

export type {
  ArrivalConversationalTone,
  ArrivalGreetingStrategy,
  ArrivalSuggestedAction,
  ArrivalUiEmphasis,
  ArrivalVisitorKind,
} from "./arrivalTypes";

export type {
  CompanionHomeState,
  HomeChromeConfig,
  HomeNavVisibility,
} from "./homeState";

export { homeChromeForState, homeStateDataAttr, resolveCompanionHomeState } from "./homeState";

export type ArrivalIntelligence = {
  /** Three-state home — single source of truth for Home render. */
  homeState: CompanionHomeState;
  chrome: HomeChromeConfig;
  visitorKind: ArrivalVisitorKind;
  greetingStrategy: ArrivalGreetingStrategy;
  /** Primary companion line — presence or contextual opening. */
  openingMessage: string;
  /** FIRST_VISIT only — warm introduction before the question. */
  welcomeLine: string | null;
  /** Optional invite beneath the opening — question or gentle prompt. */
  inviteQuestion: string | null;
  headline: string | null;
  uiEmphasis: ArrivalUiEmphasis;
  chatPlaceholder: string;
  conversationalTone: ArrivalConversationalTone;
  continue: CompanionContinueResolution;
  narrativeContext: NarrativeContext;
  suggestedAction: ArrivalSuggestedAction;
  contextualButtonLabel: string | null;
  showContinueList: boolean;
  returnIntervalHours: number | null;
  returnIntervalDays: number | null;
  isFirstMeeting: boolean;
  sessionVisitIndex: number;
};

function daysFromHours(hours: number | null): number | null {
  if (hours == null) return null;
  return hours / 24;
}

function resolveVisitorKind(
  onboardingActive: boolean,
  visitIndex: number,
  returnDays: number | null,
  hasChatted: boolean,
): ArrivalVisitorKind {
  if (onboardingActive) {
    return visitIndex <= 1 && !hasChatted ? "first_onboarding" : "onboarding_return";
  }
  if (returnDays != null && returnDays >= 14) return "long_absence";
  return "returning";
}

function resolveGreetingStrategy(
  homeState: CompanionHomeState,
  visitorKind: ArrivalVisitorKind,
  continueMode: CompanionContinueResolution["mode"],
): ArrivalGreetingStrategy {
  if (homeState === "FIRST_VISIT") return "warm_introduction";
  if (visitorKind === "long_absence") return "gentle_return";
  if (homeState === "RETURNING_ACTIVE") return "quiet_continuation";
  return "open_presence";
}

function firstName(): string | null {
  const name = getPrefs().name?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? null;
}

function buildReturningActiveOpening(input: {
  visitorKind: ArrivalVisitorKind;
  continue: CompanionContinueResolution;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  returnDays: number | null;
}): string {
  const name = firstName();

  if (input.visitorKind === "long_absence") {
    return name
      ? `${name}, good to see you. We can take today at your pace.`
      : "Good to see you. We can take today at your pace.";
  }

  if (input.continue.mode === "choose") {
    return "A few threads are still open. Pick one when it feels right — or just talk.";
  }

  if (input.continue.mode === "single") {
    if (input.continue.option.kind === "conversation") {
      const topic = input.continue.option.title;
      return name
        ? `${name}, we were talking about ${topic}.`
        : `We were talking about ${topic}.`;
    }
    return name
      ? `${name}, ready when you are.`
      : "Ready when you are.";
  }

  if (input.returnDays != null && input.returnDays >= 2) {
    return name
      ? `Welcome back, ${name}.`
      : "Welcome back.";
  }

  switch (input.timeOfDay) {
    case "morning":
      return name ? `Morning, ${name}.` : "Good morning.";
    case "evening":
    case "night":
      return name ? `Hi, ${name}.` : "Hi.";
    default:
      return name ? `Hi, ${name}.` : "Hi.";
  }
}

function buildReturningActiveInvite(input: {
  continue: CompanionContinueResolution;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  returnDays: number | null;
}): string | null {
  if (input.continue.mode === "single") {
    if (input.continue.option.kind === "conversation") {
      return "Want to pick up where we left off?";
    }
    return "Want to keep going?";
  }

  if (input.continue.mode === "choose") {
    return "What feels most alive to continue?";
  }

  if (input.returnDays != null && input.returnDays >= 2) {
    return "What's present for you today?";
  }

  switch (input.timeOfDay) {
    case "morning":
      return "What feels most doable today?";
    case "evening":
    case "night":
      return "How's today treating you?";
    default:
      return "What's on your mind?";
  }
}

function buildQuietPresenceOpening(_input: {
  visitorKind: ArrivalVisitorKind;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
}): string {
  return QUIET_PRESENCE_OPENING;
}

function buildQuietPresenceInvite(_input: {
  visitorKind: ArrivalVisitorKind;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
}): string | null {
  return FIRST_CONVERSATION_QUESTION;
}

function buildOpeningAndInvite(input: {
  homeState: CompanionHomeState;
  visitorKind: ArrivalVisitorKind;
  continue: CompanionContinueResolution;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  returnDays: number | null;
}): { openingMessage: string; welcomeLine: string | null; inviteQuestion: string | null } {
  if (input.homeState === "FIRST_VISIT") {
    return {
      openingMessage: "",
      welcomeLine: FIRST_CONVERSATION_WELCOME,
      inviteQuestion: FIRST_CONVERSATION_QUESTION,
    };
  }

  if (input.homeState === "RETURNING_ACTIVE") {
    return {
      openingMessage: buildReturningActiveOpening(input),
      welcomeLine: null,
      inviteQuestion: buildReturningActiveInvite(input),
    };
  }

  return {
    openingMessage: buildQuietPresenceOpening(input),
    welcomeLine: null,
    inviteQuestion: buildQuietPresenceInvite(input),
  };
}

function buildHeadline(_homeState: CompanionHomeState): string | null {
  return null;
}

function buildChatPlaceholder(input: {
  homeState: CompanionHomeState;
  visitorKind: ArrivalVisitorKind;
  continue: CompanionContinueResolution;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
}): string {
  if (input.homeState === "FIRST_VISIT" || input.homeState === "QUIET_PRESENCE") {
    return FIRST_CONVERSATION_INPUT_CUE;
  }

  if (input.continue.mode === "single") {
    const title = input.continue.option.title;
    return `Want to keep going on ${title} — or talk about something else?`;
  }

  if (input.continue.mode === "choose") {
    return "Pick something to continue — or start fresh here…";
  }

  if (input.visitorKind === "long_absence") {
    return "What's present for you today?";
  }

  if (input.timeOfDay === "morning") {
    return "What would make today feel lighter?";
  }

  return "What's on your mind?";
}

function resolveUiEmphasis(
  homeState: CompanionHomeState,
  continueRes: CompanionContinueResolution,
): ArrivalUiEmphasis {
  if (homeState === "FIRST_VISIT" || homeState === "QUIET_PRESENCE") {
    return "onboarding_chat";
  }
  if (continueRes.mode === "choose") return "continue_choose";
  if (continueRes.mode === "single") return "subtle_continue";
  return "conversation_first";
}

function resolveSuggestedAction(
  homeState: CompanionHomeState,
  continueRes: CompanionContinueResolution,
): ArrivalSuggestedAction {
  if (homeState === "FIRST_VISIT" || homeState === "QUIET_PRESENCE") {
    return "focus_chat";
  }
  if (continueRes.mode === "choose") return "continue_choose";
  if (continueRes.mode === "single") return "continue_single";
  return "focus_chat";
}

function contextualButtonLabel(
  continueRes: CompanionContinueResolution,
): string | null {
  if (continueRes.mode === "single") {
    switch (continueRes.option.kind) {
      case "conversation":
        return "Continue";
      case "project":
      case "document":
      case "visual-thinking":
      case "plan-my-day":
      case "research":
        return "Pick up where we left off";
      default:
        return "Continue";
    }
  }
  return null;
}

function resolveTone(
  homeState: CompanionHomeState,
  visitorKind: ArrivalVisitorKind,
  timeOfDay: ReturnType<typeof timeOfDayBucket>,
): ArrivalConversationalTone {
  if (homeState === "FIRST_VISIT") return "warm";
  if (homeState === "QUIET_PRESENCE") return "quiet";
  if (visitorKind === "long_absence") return "calm";
  if (timeOfDay === "morning") return "encouraging";
  if (timeOfDay === "evening" || timeOfDay === "night") return "quiet";
  return "calm";
}

export type EvaluateArrivalOptions = {
  now?: Date;
  /** When true, writes to Living Intelligence Graph. Default false — call once per arrival. */
  record?: boolean;
};

/**
 * Evaluate arrival context — Home consumes this object, not ad-hoc logic.
 */
export function evaluateArrivalIntelligence(
  options: EvaluateArrivalOptions = {},
): ArrivalIntelligence {
  const now = options.now ?? new Date();
  const visitIndex = getHomeVisitCount();
  const onboardingActive = isPhase1OnboardingActive();
  const hasChatted = getPrefs().hasChatted;
  const returnIntervalHours = hoursSinceLastArrival(now);
  const returnIntervalDays = daysFromHours(returnIntervalHours);
  const auth = getCompanionAuthIntelligence();
  const absenceDays = auth.returnAfterAbsenceDays ?? returnIntervalDays;

  const effectiveReturnDays =
    absenceDays != null && absenceDays > (returnIntervalDays ?? 0)
      ? absenceDays
      : returnIntervalDays;

  const continueRes = resolveCompanionContinue({ onboardingActive });
  const visitorKind = resolveVisitorKind(
    onboardingActive,
    visitIndex,
    effectiveReturnDays,
    hasChatted,
  );
  const homeState = resolveCompanionHomeState({ visitorKind, continue: continueRes });
  const chrome = homeChromeForState(homeState);
  const greetingStrategy = resolveGreetingStrategy(
    homeState,
    visitorKind,
    continueRes.mode,
  );
  const timeOfDay = timeOfDayBucket(now);
  const narrativeContext = refreshNarrativeContextOnArrival(now);
  const copy = buildOpeningAndInvite({
    homeState,
    visitorKind,
    continue: continueRes,
    timeOfDay,
    returnDays: effectiveReturnDays,
  });

  const intelligence: ArrivalIntelligence = {
    homeState,
    chrome,
    visitorKind,
    greetingStrategy,
    openingMessage: copy.openingMessage,
    welcomeLine: copy.welcomeLine,
    inviteQuestion: copy.inviteQuestion,
    headline: buildHeadline(homeState),
    uiEmphasis: resolveUiEmphasis(homeState, continueRes),
    chatPlaceholder: buildChatPlaceholder({
      homeState,
      visitorKind,
      continue: continueRes,
      timeOfDay,
    }),
    conversationalTone: resolveTone(homeState, visitorKind, timeOfDay),
    continue: continueRes,
    narrativeContext,
    suggestedAction: resolveSuggestedAction(homeState, continueRes),
    contextualButtonLabel:
      homeState === "RETURNING_ACTIVE"
        ? contextualButtonLabel(continueRes)
        : null,
    showContinueList:
      homeState === "RETURNING_ACTIVE" && continueRes.mode === "choose",
    returnIntervalHours,
    returnIntervalDays: effectiveReturnDays,
    isFirstMeeting: homeState === "FIRST_VISIT",
    sessionVisitIndex: visitIndex,
  };

  if (options.record === true && typeof window !== "undefined") {
    recordArrival({
      visitorKind,
      greetingStrategy,
      continue: continueRes,
      sessionVisitIndex: visitIndex,
      now,
    });
  }

  return intelligence;
}

export function arrivalContinueOptions(
  intelligence: ArrivalIntelligence,
): CompanionContinueOption[] {
  if (intelligence.continue.mode === "choose") {
    return intelligence.continue.options;
  }
  return [];
}
