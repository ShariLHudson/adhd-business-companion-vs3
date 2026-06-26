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
import {
  minutesSinceLivingRoomDeparture,
  resolveLivingTimeline,
} from "@/lib/livingLifeEngine";
import { resolveHomesteadTime, type HomesteadTime } from "@/lib/homesteadTime";
import { refreshNarrativeContextOnArrival, type NarrativeContext } from "./narrativeContext";
import { getRecognitionStore } from "@/lib/recognition/recognitionStore";
import { getLastActivity } from "@/lib/companionStore";
import { resolveEffectiveHospitalityProfile } from "@/lib/companionHospitalityProfile";
import {
  evaluateWelcomePresenceIntelligence,
  type WelcomePresenceIntelligence,
} from "@/lib/welcomePresenceIntelligence";
import {
  composeLivingCompanionRoom,
  evaluateCompanionEnvironmentIntelligence,
  defaultRoomPermissionContext,
  type LivingCompanionRoom,
} from "@/lib/companionEnvironmentIntelligence";
import { resolveWelcomeAtmosphere } from "@/lib/welcomeLivingRoom";
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

export { homeChromeForState, homeStateDataAttr, isWelcomeSceneLayout, resolveCompanionHomeState } from "./homeState";

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
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  homesteadTime: HomesteadTime;
  /** Welcome Presence Intelligence™ — first conversation of the day. */
  welcomePresence: WelcomePresenceIntelligence | null;
  /** Living Companion Room™ — four-layer welcome environment. */
  livingRoom: LivingCompanionRoom | null;
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
      return "Want to keep talking about that?";
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
      return "How's the morning feeling?";
    case "evening":
    case "night":
      return "How's today treating you?";
    default:
      return "What's on your heart?";
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

function isBirthdayToday(
  birthday: { month: number; day: number } | null | undefined,
  now: Date,
): boolean {
  if (!birthday) return false;
  return (
    birthday.month === now.getMonth() + 1 && birthday.day === now.getDate()
  );
}

function buildCompanionEnvironmentInput(input: {
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  sessionVisitIndex: number;
  isFirstMeeting: boolean;
  now: Date;
  returnIntervalHours: number | null;
  recordLivingHistory: boolean;
  homesteadTime: HomesteadTime;
}) {
  const recognition = getRecognitionStore();
  const atmosphere = resolveWelcomeAtmosphere({
    timeOfDay: input.timeOfDay,
    now: input.now,
  });
  const hospitality = resolveEffectiveHospitalityProfile({
    source: "memory",
    recognition,
    todayContext: {
      now: input.now,
      recoveryGentle: false,
      lowEnergy: false,
    },
  });
  const { todayContext, profile: hospitalityProfile } = hospitality;
  const timeline = resolveLivingTimeline({
    now: input.now,
    hoursSinceLastVisit: input.returnIntervalHours,
  });
  return {
    now: input.now,
    timeOfDay: input.timeOfDay,
    season: atmosphere.season,
    sessionVisitIndex: input.sessionVisitIndex,
    isFirstMeeting: input.isFirstMeeting,
    birthdayToday: todayContext.birthdayToday ?? false,
    celebrationActive: false,
    recoveryGentle: false,
    lowEnergy: false,
    vacationDaysAway: todayContext.vacationDaysAway ?? null,
    projectRecentlyCompleted: todayContext.projectRecentlyCompleted ?? false,
    businessFocus: false,
    gentleDay: false,
    hospitalityProfile,
    permissions: defaultRoomPermissionContext({
      birthdayToday: todayContext.birthdayToday,
      vacationDaysAway: todayContext.vacationDaysAway,
    }),
    livingLifeContext: {
      visitKind: timeline.visitKind,
      hoursSinceLastVisit: input.returnIntervalHours,
      minutesAwayFromLivingRoom: minutesSinceLivingRoomDeparture(input.now),
      recordToHistory: input.recordLivingHistory,
    },
    homesteadTime: input.homesteadTime,
  } as const;
}

function buildWelcomePresenceInput(input: {
  homeState: CompanionHomeState;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  sessionVisitIndex: number;
  returnIntervalHours: number | null;
  returnIntervalDays: number | null;
  isFirstMeeting: boolean;
  now: Date;
}) {
  const recognition = getRecognitionStore();
  const birthdayToday = isBirthdayToday(recognition.birthday, input.now);
  const hospitality = resolveEffectiveHospitalityProfile({
    source: "memory",
    recognition,
    todayContext: { now: input.now },
  });
  const lastActivity = getLastActivity();
  const atmosphere = resolveWelcomeAtmosphere({
    timeOfDay: input.timeOfDay,
    now: input.now,
  });
  return {
    homeState:
      input.homeState === "FIRST_VISIT" ? "FIRST_VISIT" : "QUIET_PRESENCE",
    timeOfDay: input.timeOfDay,
    season: atmosphere.season,
    isWeekend: [0, 6].includes(input.now.getDay()),
    sessionVisitIndex: input.sessionVisitIndex,
    returnIntervalHours: input.returnIntervalHours,
    returnIntervalDays: input.returnIntervalDays,
    isFirstMeeting: input.isFirstMeeting,
    firstName: firstName(),
    birthdayToday,
    celebrationActive: false,
    recoveryGentle: false,
    lowEnergy: false,
    vacationDaysAway: hospitality.todayContext.vacationDaysAway ?? null,
    projectRecentlyCompleted:
      hospitality.todayContext.projectRecentlyCompleted ?? false,
    previousTopic: lastActivity?.title ?? null,
    now: input.now,
  } as const;
}

function buildOpeningAndInvite(input: {
  homeState: CompanionHomeState;
  visitorKind: ArrivalVisitorKind;
  continue: CompanionContinueResolution;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  returnDays: number | null;
  welcomePresence: WelcomePresenceIntelligence | null;
}): { openingMessage: string; welcomeLine: string | null; inviteQuestion: string | null } {
  if (
    (input.homeState === "FIRST_VISIT" || input.homeState === "QUIET_PRESENCE") &&
    input.welcomePresence
  ) {
    return {
      openingMessage: input.welcomePresence.greeting,
      welcomeLine:
        input.homeState === "FIRST_VISIT"
          ? input.welcomePresence.greeting
          : null,
      inviteQuestion: input.welcomePresence.invite,
    };
  }

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
  welcomePresence: WelcomePresenceIntelligence | null;
}): string {
  if (
    (input.homeState === "FIRST_VISIT" || input.homeState === "QUIET_PRESENCE") &&
    input.welcomePresence
  ) {
    return input.welcomePresence.chatPlaceholder;
  }

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
  const homesteadTime = resolveHomesteadTime({ now, placeId: "living-room" });
  const timeOfDay = homesteadTime.legacyTimeOfDay;
  const narrativeContext = refreshNarrativeContextOnArrival(now);
  const isFirstMeeting = homeState === "FIRST_VISIT";
  const welcomePresenceInput =
    homeState === "FIRST_VISIT" ||
    homeState === "QUIET_PRESENCE" ||
    homeState === "RETURNING_ACTIVE"
      ? buildWelcomePresenceInput({
          homeState:
            homeState === "RETURNING_ACTIVE" ? "QUIET_PRESENCE" : homeState,
          timeOfDay,
          sessionVisitIndex: visitIndex,
          returnIntervalHours,
          returnIntervalDays: effectiveReturnDays,
          isFirstMeeting,
          now,
        })
      : null;
  const environmentInput =
    welcomePresenceInput != null
      ? buildCompanionEnvironmentInput({
          timeOfDay,
          sessionVisitIndex: visitIndex,
          isFirstMeeting,
          now,
          returnIntervalHours,
          recordLivingHistory: options.record === true,
          homesteadTime,
        })
      : null;
  const welcomePresence = welcomePresenceInput
    ? evaluateWelcomePresenceIntelligence(welcomePresenceInput)
    : null;
  const livingRoom =
    welcomePresence && environmentInput
      ? composeLivingCompanionRoom({
          environment: evaluateCompanionEnvironmentIntelligence(environmentInput),
          conversation: welcomePresence,
        })
      : null;
  const copy = buildOpeningAndInvite({
    homeState,
    visitorKind,
    continue: continueRes,
    timeOfDay,
    returnDays: effectiveReturnDays,
    welcomePresence,
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
      welcomePresence,
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
    isFirstMeeting,
    sessionVisitIndex: visitIndex,
    timeOfDay,
    homesteadTime,
    welcomePresence,
    livingRoom,
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
