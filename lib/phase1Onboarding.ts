/**
 * Phase 1 Onboarding — First Conversation Experience™
 *
 * Relationship-building through conversation — not a profile form.
 * Understand → deliver value → memory seed → begin helping.
 */

import type { ChatTurn } from "./companionIntelligence";
import { saveBusinessProfile } from "./companionStore";
import { recordDiscoveryAnswer, completeFirstVisit } from "./companionDiscovery";

export type Phase1OnboardingPhase =
  | "opening"
  | "business"
  | "challenge"
  | "outcome"
  | "first_value"
  | "memory_seed"
  | "complete";

export type Phase1FirstValueResource =
  | "clear_my_mind"
  | "decision_compass"
  | "create"
  | "plan_my_day"
  | "conversation";

export type Phase1RelationshipProfile = {
  winDefinition?: string;
  businessType?: string;
  audience?: string;
  businessStage?: string;
  primaryChallenge?: string;
  emotionalState?: string;
  urgency?: string;
  immediateGoal?: string;
  desiredOutcome?: string;
  successDefinition?: string;
};

export type Phase1OnboardingState = {
  complete: boolean;
  phase: Phase1OnboardingPhase;
  profile: Phase1RelationshipProfile;
  memorySeedConfirmed: boolean;
  assistantQuestionsAsked: number;
  startedAt: string;
  updatedAt: string;
};

export type Phase1OnboardingEvaluation = {
  active: boolean;
  phase: Phase1OnboardingPhase;
  profile: Phase1RelationshipProfile;
  nextFocus: string;
  shouldOfferFirstValue: boolean;
  firstValueResource: Phase1FirstValueResource | null;
  firstValueReason: string | null;
  readyForMemorySeed: boolean;
  memorySeedSummary: string | null;
  trustReflection: string | null;
  complete: boolean;
  rationale: string[];
};

const STORAGE_KEY = "companion-phase1-onboarding-v1";

/** Warm welcome — same emotional home for every visit. */
export const FIRST_CONVERSATION_WELCOME = "I'm here for you.";

/** Shared home invite — first visit and quiet presence. */
export const FIRST_CONVERSATION_QUESTION = "What's on your mind today?";

/** Quiet presence opening — established relationship, no pressure. */
export const QUIET_PRESENCE_OPENING = "I'm here for you.";

/** Soft cue in the input — presence, not a second question. */
export const FIRST_CONVERSATION_INPUT_CUE = "I'm listening…";

/** @deprecated Use FIRST_CONVERSATION_WELCOME + FIRST_CONVERSATION_QUESTION on home. */
export const PHASE1_OPENING_MESSAGE = `${FIRST_CONVERSATION_WELCOME}\n\n${FIRST_CONVERSATION_QUESTION}`;

/** Empty — the question lives on the home card; cursor is already waiting. */
export const PHASE1_INPUT_PLACEHOLDER = "";

const MAX_ONBOARDING_QUESTIONS = 4;

const CHALLENGE_SIGNALS: { re: RegExp; label: string }[] = [
  { re: /\b(?:too many ideas|idea explosion)\b/i, label: "Too many ideas" },
  { re: /\boverwhelm/i, label: "Overwhelm" },
  { re: /\b(?:visibility|being seen|marketing)\b/i, label: "Visibility" },
  { re: /\b(?:sales|selling|revenue|clients?)\b/i, label: "Sales" },
  { re: /\bconsisten/i, label: "Consistency" },
  { re: /\bfocus\b/i, label: "Focus" },
  { re: /\b(?:follow[- ]?through|finishing)\b/i, label: "Follow-through" },
  { re: /\btime management\b/i, label: "Time management" },
];

const BUSINESS_TYPE_RE =
  /\b(?:coach(?:ing)?|consultant|author|speaker|course|membership|agency|service|creative|entrepreneur|freelanc)\b/i;

const AUDIENCE_RE =
  /\b(?:help|serve|work with|for)\s+([^.?!]{8,80})/i;

const STAGE_RE =
  /\b(?:just starting|early stage|growing|established|scaling|side hustle|full[- ]time)\b/i;

function readState(): Phase1OnboardingState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Phase1OnboardingState;
    return {
      ...defaultState(),
      ...parsed,
      profile: { ...defaultState().profile, ...parsed.profile },
    };
  } catch {
    return defaultState();
  }
}

function writeState(state: Phase1OnboardingState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("companion-phase1-onboarding-updated"));
  } catch {
    /* noop */
  }
}

function defaultState(): Phase1OnboardingState {
  const now = new Date().toISOString();
  return {
    complete: false,
    phase: "opening",
    profile: {},
    memorySeedConfirmed: false,
    assistantQuestionsAsked: 0,
    startedAt: now,
    updatedAt: now,
  };
}

export function getPhase1OnboardingState(): Phase1OnboardingState {
  return readState();
}

export function isPhase1OnboardingActive(): boolean {
  return !readState().complete;
}

export function isPhase1OnboardingComplete(): boolean {
  return readState().complete;
}

/** Phase 1 blocks workspace routing, coach auto-start, and feature routing until complete. */
export function shouldDeferWorkspaceRoutingForPhase1(): boolean {
  return isPhase1OnboardingActive();
}

/** Block auto workspace opens during Phase 1 — not explicit sidebar or panel clicks. */
export function shouldBlockWorkspaceOpenForPhase1(options?: {
  userInitiated?: boolean;
}): boolean {
  return shouldDeferWorkspaceRoutingForPhase1() && !options?.userInitiated;
}

export function shouldSuppressWorkspaceCoachForPhase1(): boolean {
  return isPhase1OnboardingActive();
}

export function patchPhase1OnboardingState(
  patch: Partial<Phase1OnboardingState> & {
    profile?: Partial<Phase1RelationshipProfile>;
  },
): Phase1OnboardingState {
  const cur = readState();
  const next: Phase1OnboardingState = {
    ...cur,
    ...patch,
    profile: { ...cur.profile, ...patch.profile },
    updatedAt: new Date().toISOString(),
  };
  writeState(next);
  return next;
}

export function completePhase1Onboarding(): Phase1OnboardingState {
  return patchPhase1OnboardingState({
    complete: true,
    phase: "complete",
    memorySeedConfirmed: true,
  });
}

export function resetPhase1OnboardingForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function countAssistantQuestions(messages: ChatTurn[]): number {
  return messages.filter(
    (m) => m.role === "assistant" && /\?\s*$/.test(m.content.trim()),
  ).length;
}

function inferChallenge(text: string): string | undefined {
  for (const { re, label } of CHALLENGE_SIGNALS) {
    if (re.test(text)) return label;
  }
  if (text.trim().length >= 12) return text.trim().slice(0, 120);
  return undefined;
}

function inferEmotionalState(text: string): string | undefined {
  if (/\boverwhelm/i.test(text)) return "overwhelmed";
  if (/\b(?:anxious|worried|stressed)\b/i.test(text)) return "anxious";
  if (/\bstuck\b/i.test(text)) return "stuck";
  if (/\bfrustrat/i.test(text)) return "frustrated";
  if (/\buncertain|not sure\b/i.test(text)) return "uncertain";
  return undefined;
}

function buildProfileFromThread(
  messages: ChatTurn[],
  userText: string,
): Phase1RelationshipProfile {
  const profile: Phase1RelationshipProfile = {};
  const users = [...messages.filter((m) => m.role === "user").map((m) => m.content)];
  if (userText.trim() && !users.includes(userText.trim())) {
    users.push(userText.trim());
  }

  if (users[0]) {
    profile.winDefinition = users[0].slice(0, 200);
  }
  if (users[1]) {
    const t = users[1];
    if (BUSINESS_TYPE_RE.test(t)) profile.businessType = t.slice(0, 120);
    else profile.businessType = t.slice(0, 120);
    const audienceMatch = t.match(AUDIENCE_RE);
    if (audienceMatch?.[1]) profile.audience = audienceMatch[1].trim().slice(0, 120);
    if (STAGE_RE.test(t)) profile.businessStage = t.match(STAGE_RE)?.[0];
  }
  if (users[2]) {
    const challenge = inferChallenge(users[2]);
    if (challenge) profile.primaryChallenge = challenge;
    const emotion = inferEmotionalState(users[2]);
    if (emotion) profile.emotionalState = emotion;
    if (/\b(?:urgent|asap|this week|right now)\b/i.test(users[2])) {
      profile.urgency = "high";
    }
  }
  if (users[3]) {
    profile.immediateGoal = users[3].slice(0, 120);
    profile.desiredOutcome = users[3].slice(0, 160);
    profile.successDefinition = users[3].slice(0, 160);
  }

  return profile;
}

function businessContextReady(profile: Phase1RelationshipProfile): boolean {
  return Boolean(profile.businessType || profile.audience);
}

function challengeReady(profile: Phase1RelationshipProfile): boolean {
  return Boolean(profile.primaryChallenge);
}

function outcomeReady(profile: Phase1RelationshipProfile): boolean {
  return Boolean(profile.immediateGoal || profile.desiredOutcome);
}

function resolvePhase(
  profile: Phase1RelationshipProfile,
  userTurnCount: number,
): Phase1OnboardingPhase {
  if (!profile.winDefinition && userTurnCount === 0) return "opening";
  if (!profile.winDefinition && userTurnCount >= 1) {
    return "business";
  }
  if (!businessContextReady(profile)) return "business";
  if (!challengeReady(profile)) return "challenge";
  if (!outcomeReady(profile)) return "outcome";
  return "first_value";
}

export function firstValueResourceForProfile(
  profile: Phase1RelationshipProfile,
): { resource: Phase1FirstValueResource; reason: string } {
  const challenge = profile.primaryChallenge?.toLowerCase() ?? "";
  const win = profile.winDefinition?.toLowerCase() ?? "";
  const combined = `${challenge} ${win}`;

  if (/\b(?:decid|stuck between|which|where to focus|can't decide)\b/i.test(combined)) {
    return {
      resource: "decision_compass",
      reason: "A structured decision fits when direction feels unclear.",
    };
  }
  if (/\boverwhelm|too many ideas|crowded head\b/i.test(combined)) {
    return {
      resource: "clear_my_mind",
      reason: "Mental clutter is the blocker — Clear My Mind externalizes the pile.",
    };
  }
  if (/\b(?:write|create|content|post|email|draft)\b/i.test(combined)) {
    return {
      resource: "create",
      reason: "They want to make something — Create beside chat is the path.",
    };
  }
  if (/\b(?:plan|today|priorit|schedule|time management|consisten)\b/i.test(combined)) {
    return {
      resource: "plan_my_day",
      reason: "Priorities and rhythm — Plan My Day shapes today without pressure.",
    };
  }
  return {
    resource: "conversation",
    reason: "Stay in conversation until the best workspace is clear.",
  };
}

const RESOURCE_LABELS: Record<Phase1FirstValueResource, string> = {
  clear_my_mind: "Clear My Mind",
  decision_compass: "Decision Compass",
  create: "Create",
  plan_my_day: "Plan My Day",
  conversation: "conversation",
};

export function buildTrustReflection(profile: Phase1RelationshipProfile): string | null {
  const parts: string[] = [];
  if (profile.primaryChallenge) {
    parts.push(`juggling ${profile.primaryChallenge.toLowerCase()}`);
  } else if (profile.winDefinition) {
    parts.push(`working toward ${profile.winDefinition.toLowerCase()}`);
  }
  if (profile.immediateGoal) {
    parts.push(`wanting progress on ${profile.immediateGoal.toLowerCase()}`);
  }
  if (!parts.length) return null;
  return `It sounds like you're ${parts.join(" and ")}.`;
}

export function buildMemorySeedSummary(profile: Phase1RelationshipProfile): string {
  const bullets: string[] = [];
  if (profile.businessType) {
    bullets.push(`You run a ${profile.businessType.replace(/\.$/, "")}.`);
  }
  if (profile.audience) {
    bullets.push(`You help ${profile.audience.replace(/\.$/, "")}.`);
  }
  if (profile.primaryChallenge) {
    bullets.push(`${profile.primaryChallenge} is your biggest challenge right now.`);
  }
  if (profile.desiredOutcome || profile.immediateGoal) {
    bullets.push(
      `Your goal is ${(profile.desiredOutcome ?? profile.immediateGoal)!.replace(/\.$/, "")}.`,
    );
  }
  if (profile.winDefinition && bullets.length < 4) {
    bullets.push(`A win for you looks like: ${profile.winDefinition.replace(/\.$/, "")}.`);
  }
  if (!bullets.length) {
    return "Here's what I'm hearing so far — you want support without more overwhelm.";
  }
  return `Here's what I'm hearing so far:\n${bullets.map((b) => `• ${b}`).join("\n")}\n\nDid I get that right?`;
}

function nextFocusForPhase(phase: Phase1OnboardingPhase): string {
  switch (phase) {
    case "opening":
      return "Learn what a win looks like for them.";
    case "business":
      return "One question about business and who they help — not a form.";
    case "challenge":
      return "What's the biggest thing in their way right now?";
    case "outcome":
      return "One meaningful progress goal for this week.";
    case "first_value":
      return "Deliver first value — offer the right workspace with permission.";
    case "memory_seed":
      return "Summarize what you learned and confirm before closing onboarding.";
    case "complete":
      return "Onboarding complete — help with their chosen next step.";
  }
}

export function evaluatePhase1Onboarding(input: {
  messages: ChatTurn[];
  userText: string;
  lastAssistantText?: string;
  state?: Phase1OnboardingState;
}): Phase1OnboardingEvaluation {
  const state = input.state ?? readState();
  const rationale: string[] = [];

  if (state.complete) {
    return {
      active: false,
      phase: "complete",
      profile: state.profile,
      nextFocus: nextFocusForPhase("complete"),
      shouldOfferFirstValue: false,
      firstValueResource: null,
      firstValueReason: null,
      readyForMemorySeed: false,
      memorySeedSummary: null,
      trustReflection: null,
      complete: true,
      rationale: ["Phase 1 onboarding already complete."],
    };
  }

  const userTurnCount = input.messages.filter((m) => m.role === "user").length;
  const assistantQuestions = countAssistantQuestions(input.messages);
  const profile = {
    ...state.profile,
    ...buildProfileFromThread(input.messages, input.userText),
  };

  let phase = resolvePhase(profile, userTurnCount);

  if (
    phase === "first_value" &&
    assistantQuestions >= 2 &&
    businessContextReady(profile) &&
    challengeReady(profile)
  ) {
    phase = "memory_seed";
    rationale.push("Enough context gathered — move to memory seed.");
  }

  const shouldOfferFirstValue =
    phase === "first_value" &&
    businessContextReady(profile) &&
    challengeReady(profile) &&
    assistantQuestions >= 1 &&
    assistantQuestions <= MAX_ONBOARDING_QUESTIONS;

  const firstValue = shouldOfferFirstValue
    ? firstValueResourceForProfile(profile)
    : null;

  const readyForMemorySeed =
    phase === "memory_seed" ||
    (shouldOfferFirstValue && assistantQuestions >= MAX_ONBOARDING_QUESTIONS - 1);

  const memorySeedSummary = readyForMemorySeed
    ? buildMemorySeedSummary(profile)
    : null;

  const trustReflection = buildTrustReflection(profile);

  const memoryConfirmed =
    state.memorySeedConfirmed ||
    (/\b(?:yes|yep|right|correct|that's right|sounds right|you got it)\b/i.test(
      input.userText.trim(),
    ) &&
      /\b(?:hearing|get that right|did i)\b/i.test(input.lastAssistantText ?? ""));

  let complete = false;
  if (
    memoryConfirmed &&
    (readyForMemorySeed ||
      /\b(?:hearing|get that right|did i)\b/i.test(input.lastAssistantText ?? ""))
  ) {
    phase = "complete";
    complete = true;
    rationale.push("Memory seed confirmed — onboarding complete.");
  }

  return {
    active: !complete,
    phase,
    profile,
    nextFocus: nextFocusForPhase(phase),
    shouldOfferFirstValue,
    firstValueResource: firstValue?.resource ?? null,
    firstValueReason: firstValue?.reason ?? null,
    readyForMemorySeed,
    memorySeedSummary,
    trustReflection,
    complete,
    rationale,
  };
}

export function applyPhase1OnboardingTurn(
  input: {
    messages: ChatTurn[];
    userText: string;
    lastAssistantText?: string;
  },
): Phase1OnboardingEvaluation {
  const evaluation = evaluatePhase1Onboarding(input);
  if (!isPhase1OnboardingActive() && !evaluation.complete) {
    return evaluation;
  }

  const cur = readState();
  const nextPhase = evaluation.complete ? "complete" : evaluation.phase;

  patchPhase1OnboardingState({
    phase: nextPhase,
    profile: evaluation.profile,
    memorySeedConfirmed: evaluation.complete || cur.memorySeedConfirmed,
    assistantQuestionsAsked: countAssistantQuestions(input.messages),
    complete: evaluation.complete,
  });

  if (evaluation.complete) {
    persistRelationshipProfile(evaluation.profile);
  }

  return evaluation;
}

function persistRelationshipProfile(profile: Phase1RelationshipProfile) {
  if (profile.businessType) {
    saveBusinessProfile({ role: profile.businessType });
  }
  if (profile.audience) {
    saveBusinessProfile({ idealClient: profile.audience });
  }
  if (profile.immediateGoal || profile.desiredOutcome) {
    const goal = profile.immediateGoal ?? profile.desiredOutcome!;
    saveBusinessProfile({ goals: [goal] });
  }
  if (profile.winDefinition) {
    recordDiscoveryAnswer("why-here", profile.winDefinition);
  }
  if (profile.businessType) {
    recordDiscoveryAnswer("describes-you", profile.businessType);
  }
  if (profile.primaryChallenge) {
    recordDiscoveryAnswer("business-challenge", profile.primaryChallenge);
  }
  if (profile.immediateGoal) {
    recordDiscoveryAnswer("growth-goal", profile.immediateGoal);
  }
  completeFirstVisit();
}

export function phase1RelationshipProfileForChat(): string | undefined {
  const state = readState();
  if (!state.complete && Object.keys(state.profile).length === 0) return undefined;
  const p = state.profile;
  const parts: string[] = [];
  if (p.winDefinition) parts.push(`Win definition: ${p.winDefinition}`);
  if (p.businessType) parts.push(`Business: ${p.businessType}`);
  if (p.audience) parts.push(`Audience: ${p.audience}`);
  if (p.primaryChallenge) parts.push(`Challenge: ${p.primaryChallenge}`);
  if (p.immediateGoal) parts.push(`Goal: ${p.immediateGoal}`);
  if (!parts.length) return undefined;
  return `PHASE 1 RELATIONSHIP PROFILE: ${parts.join(" | ")}`;
}

export function phase1OnboardingHintForChat(
  evaluation: Phase1OnboardingEvaluation,
): string | null {
  if (!evaluation.active) return null;

  const parts = [
    "PHASE 1 ONBOARDING — FIRST CONVERSATION (HIGHEST PRIORITY — mandatory):",
    "This OVERRIDES workspace panels, 'Other' workspace coach, discovery chips, and all feature routing until onboarding completes.",
    "Goal: build trust, understand their world, deliver value quickly — NOT complete a profile.",
    "One conversational question at a time. Do NOT interrogate. Do NOT stack questions.",
    "NEVER say you are beside a workspace or 'Other'. NEVER use workspace coach openers.",
    `Current focus: ${evaluation.nextFocus}`,
    `Phase: ${evaluation.phase.replace(/_/g, " ")}.`,
    "FORBIDDEN: onboarding form tone, bullet questionnaires, 'fill out your profile'.",
    "REQUIRED: reflect understanding before offering solutions.",
  ];

  if (evaluation.trustReflection) {
    parts.push(`TRUST SIGNAL — reflect first: "${evaluation.trustReflection}"`);
  }

  if (evaluation.phase === "opening") {
    parts.push(
      "If no prior assistant message, open with the Phase 1 welcome (Shari intro + what would make this app a win).",
    );
  }

  if (evaluation.phase === "business") {
    parts.push(
      "Ask ONE question: tell me about your business — what do you do and who do you help?",
    );
  }

  if (evaluation.phase === "challenge") {
    parts.push(
      "Ask ONE question: what's the biggest thing getting in your way right now?",
      "Examples only if needed: too many ideas, overwhelm, visibility, sales, consistency, focus, follow-through, time.",
    );
  }

  if (evaluation.phase === "outcome") {
    parts.push(
      "Ask ONE question: if we made meaningful progress on one thing this week, what would you want it to be?",
    );
  }

  if (evaluation.shouldOfferFirstValue && evaluation.firstValueResource) {
    const label = RESOURCE_LABELS[evaluation.firstValueResource];
    parts.push(
      "FIRST VALUE RULE: Enough context — help now, do not gather more.",
      `Offer ${label} with permission first. ${evaluation.firstValueReason ?? ""}`,
      "Explain why it fits before asking to open.",
    );
  }

  if (evaluation.readyForMemorySeed && evaluation.memorySeedSummary) {
    parts.push(
      "MEMORY SEED: Summarize what you learned, then ask 'Did I get that right?'",
      `Use this structure:\n${evaluation.memorySeedSummary}`,
    );
  }

  if (evaluation.complete) {
    parts.push(
      "ONBOARDING COMPLETE: End with — Great. I have enough to start helping. We'll keep learning over time.",
      "Then: 'What would you like to work on first?' OR recommend the best starting workspace based on what they shared.",
    );
  }

  return parts.join("\n");
}

export function phase1CompletionMessage(
  resource: Phase1FirstValueResource | null,
): string {
  const base =
    "Great — I have enough to start helping. We'll continue learning how you work over time, so you don't have to answer a hundred questions today.";
  if (!resource || resource === "conversation") {
    return `${base}\n\nWhat would you like to work on first?`;
  }
  const label = RESOURCE_LABELS[resource];
  return `${base}\n\nBased on what you've shared, I think the best place to start is **${label}**. Would you like to do that now?`;
}
