/**
 * Mistake Recovery Engine & Trust Repair — learn from errors, not just success.
 *
 * Detects misunderstandings, repairs trust, and adapts future recommendations.
 * Privacy: patterns only — never blame or shame the user.
 */

import { recordCorrectionCandidate } from "./adhdEntrepreneurSituationAtlas";
import {
  recordInterventionLifecycle,
  getUserInterventionEffectiveness,
  type InterventionLearningId,
} from "./companionInterventionLearning";

export type MistakeSignalKind =
  | "explicit_correction"
  | "soft_correction"
  | "behavioral_correction"
  | "frustration"
  | "trust_damage";

export type MisunderstandingType =
  | "wrong_problem"
  | "wrong_timing"
  | "wrong_intervention"
  | "wrong_intensity"
  | "wrong_confidence"
  | "wrong_routing"
  | "unknown";

export type UserHelpPreference =
  | "conversation_first"
  | "workspace_first"
  | "decision_support"
  | "minimal_guidance"
  | "conversation_only";

export type MistakeRecord = {
  id: string;
  signalKind: MistakeSignalKind;
  misunderstanding: MisunderstandingType;
  interventionId?: string;
  userTextSnippet: string;
  trustImpact: number;
  recordedAt: string;
  repaired: boolean;
};

export type TrustRepairProfile = {
  trustGains: number;
  trustLosses: number;
  trustRepairs: number;
  avgRecoverySpeedMs: number | null;
  relationshipResilience: number;
  recentRepairsSuccessful: number;
  recentRepairsFailed: number;
  lastMistakeAt: string | null;
  humilityMode: boolean;
};

export type RecoveryOutcome = {
  id: string;
  mistakeId: string;
  repairAttempted: boolean;
  conversationContinued: boolean;
  outcomeAchieved: boolean;
  recordedAt: string;
};

export type MistakeTurnAnalysis = {
  detected: boolean;
  signalKind: MistakeSignalKind;
  misunderstanding: MisunderstandingType;
  trustImpact: number;
  needsRepair: boolean;
  repairPhrases: string[];
};

export type MistakeRecoveryDashboardSlice = {
  topMisunderstandingTypes: { type: MisunderstandingType; count: number }[];
  mostCommonCorrections: { signal: MistakeSignalKind; count: number }[];
  failedInterventions: {
    id: string;
    recommended: number;
    dismissed: number;
    misread: number;
    completed: number;
    suppress: boolean;
  }[];
  recoveredConversations: number;
  trustRepairSuccessRate: number;
  recoveryEffectivenessScore: number;
};

const MISTAKES_KEY = "companion-mistake-records-v1";
const TRUST_REPAIR_KEY = "companion-trust-repair-v1";
const PREFERENCES_KEY = "companion-user-help-preferences-v1";
const RECOVERY_KEY = "companion-recovery-outcomes-v1";
const LAST_INTERVENTION_KEY = "companion-mistake-last-intervention-v1";
const DISMISSAL_TRACK_KEY = "companion-behavioral-dismissals-v1";
const MAX_MISTAKES = 300;
const MAX_RECOVERY = 200;

const EXPLICIT_CORRECTION_RE =
  /\b(no\.?|nope|that's not (it|right|what i meant)|that is not (it|right|what i meant)|you(?:'re| are) (missing the point|wrong)|you don't understand|not what i meant|you misunderstood|wrong approach)\b/i;

const FRUSTRATION_RE =
  /\b(frustrated|annoyed|stop suggesting|you keep|wrong again|this isn't helping|not helpful|useless|give up on|quit suggesting)\b/i;

const RESTATE_PROBLEM_RE =
  /\b(what i (really |actually )?meant|let me (re)?explain|the (real |actual )?problem is|i'?m (actually |really )?(trying to|dealing with|asking about))\b/i;

const REPAIR_PHRASES = [
  "I may have misunderstood.",
  "Help me understand what's missing.",
  "I think I focused on the wrong thing.",
  "Let's correct course.",
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function detectExplicitCorrection(text: string): boolean {
  return EXPLICIT_CORRECTION_RE.test(text.trim());
}

export function detectFrustrationSignal(text: string): boolean {
  return FRUSTRATION_RE.test(text.trim());
}

export function detectSoftCorrection(
  text: string,
  lastAssistantText: string,
): boolean {
  const t = text.trim();
  if (!t || !lastAssistantText.trim()) return false;
  if (RESTATE_PROBLEM_RE.test(t)) return true;
  if (
    /\?$/.test(t) &&
    /\b(how|what|why|should i)\b/i.test(t) &&
    /\b(how|what|why|should)\b/i.test(lastAssistantText)
  ) {
    return true;
  }
  return false;
}

export function classifyMisunderstanding(input: {
  signalKind: MistakeSignalKind;
  userText: string;
  lastAssistantText?: string;
  hadRecentOffer?: boolean;
  offerDismissed?: boolean;
  interventionId?: string;
}): MisunderstandingType {
  const text = `${input.userText} ${input.lastAssistantText ?? ""}`.toLowerCase();

  if (input.signalKind === "behavioral_correction") {
    if (input.offerDismissed) return "wrong_intervention";
    return "wrong_timing";
  }

  if (/\b(too much|overwhelming|slow down|too many steps)\b/i.test(input.userText)) {
    return "wrong_intensity";
  }
  if (/\b(not enough|need more|too vague|be specific)\b/i.test(input.userText)) {
    return "wrong_intensity";
  }
  if (/\b(too (sure|certain)|you assumed|don't assume)\b/i.test(input.userText)) {
    return "wrong_confidence";
  }
  if (/\b(wrong tool|not that|different tool|don't want (that|this) tool)\b/i.test(text)) {
    return "wrong_intervention";
  }
  if (/\b(not yet|too early|not ready|let's talk first)\b/i.test(input.userText)) {
    return "wrong_timing";
  }
  if (/\b(wrong (thing|problem)|symptom|missing the point|not the issue)\b/i.test(text)) {
    return "wrong_problem";
  }
  if (input.hadRecentOffer && detectExplicitCorrection(input.userText)) {
    return input.interventionId ? "wrong_intervention" : "wrong_routing";
  }

  return "unknown";
}

export function getMistakeRecords(): MistakeRecord[] {
  return readJson<MistakeRecord[]>(MISTAKES_KEY, []);
}

export function getRecoveryOutcomes(): RecoveryOutcome[] {
  return readJson<RecoveryOutcome[]>(RECOVERY_KEY, []);
}

export function getUserHelpPreferences(): Partial<Record<UserHelpPreference, number>> {
  return readJson<Partial<Record<UserHelpPreference, number>>>(PREFERENCES_KEY, {});
}

export function storeLastInterventionForMistake(id: string): void {
  writeJson(LAST_INTERVENTION_KEY, { id, at: new Date().toISOString() });
}

export function getLastInterventionForMistake(): string | null {
  const ctx = readJson<{ id: string; at: string } | null>(LAST_INTERVENTION_KEY, null);
  return ctx?.id ?? null;
}

export function recordMistake(input: {
  signalKind: MistakeSignalKind;
  misunderstanding: MisunderstandingType;
  userText: string;
  interventionId?: string;
  trustImpact?: number;
}): MistakeRecord {
  const record: MistakeRecord = {
    id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    signalKind: input.signalKind,
    misunderstanding: input.misunderstanding,
    interventionId: input.interventionId,
    userTextSnippet: input.userText.trim().slice(0, 160),
    trustImpact: input.trustImpact ?? trustImpactForSignal(input.signalKind),
    recordedAt: new Date().toISOString(),
    repaired: false,
  };

  const list = getMistakeRecords();
  list.unshift(record);
  writeJson(MISTAKES_KEY, list.slice(0, MAX_MISTAKES));

  const trust = readJson<TrustRepairProfile>(TRUST_REPAIR_KEY, emptyTrustProfile());
  trust.trustLosses += 1;
  trust.lastMistakeAt = record.recordedAt;
  trust.humilityMode = trust.trustLosses > trust.trustGains || record.trustImpact >= 6;
  trust.relationshipResilience = computeResilience(trust);
  writeJson(TRUST_REPAIR_KEY, trust);

  if (input.interventionId) {
    recordInterventionLifecycle({
      interventionId: input.interventionId,
      stage: "misread",
    });
  }

  learnUserPreferenceFromMistake(input);

  if (input.signalKind === "explicit_correction" || input.signalKind === "soft_correction") {
    recordCorrectionCandidate(input.userText, input.interventionId);
  }

  return record;
}

function trustImpactForSignal(kind: MistakeSignalKind): number {
  switch (kind) {
    case "explicit_correction":
      return 7;
    case "frustration":
    case "trust_damage":
      return 8;
    case "soft_correction":
      return 5;
    case "behavioral_correction":
      return 4;
    default:
      return 5;
  }
}

function emptyTrustProfile(): TrustRepairProfile {
  return {
    trustGains: 0,
    trustLosses: 0,
    trustRepairs: 0,
    avgRecoverySpeedMs: null,
    relationshipResilience: 70,
    recentRepairsSuccessful: 0,
    recentRepairsFailed: 0,
    lastMistakeAt: null,
    humilityMode: false,
  };
}

function computeResilience(trust: TrustRepairProfile): number {
  const repairs = trust.trustRepairs || 1;
  const successRate =
    trust.recentRepairsSuccessful + trust.recentRepairsFailed > 0
      ? trust.recentRepairsSuccessful /
        (trust.recentRepairsSuccessful + trust.recentRepairsFailed)
      : 0.6;
  const lossPenalty = Math.min(40, trust.trustLosses * 3);
  const repairBonus = Math.min(25, repairs * 2);
  return Math.min(100, Math.max(0, Math.round(70 - lossPenalty + repairBonus + successRate * 15)));
}

export function recordBehavioralMistakeSignal(input: {
  interventionId: string;
  kind: "dismissed" | "abandoned" | "repeated_dismissal" | "never_used";
}): void {
  storeLastInterventionForMistake(input.interventionId);

  recordInterventionLifecycle({
    interventionId: input.interventionId,
    stage: input.kind === "never_used" ? "rejected" : "dismissed",
  });

  const dismissMap = readJson<Record<string, number>>(DISMISSAL_TRACK_KEY, {});
  dismissMap[input.interventionId] = (dismissMap[input.interventionId] ?? 0) + 1;
  writeJson(DISMISSAL_TRACK_KEY, dismissMap);
  const dismissCount = dismissMap[input.interventionId] ?? 0;

  if (dismissCount >= 3 || input.kind === "repeated_dismissal") {
    recordMistake({
      signalKind: "behavioral_correction",
      misunderstanding: input.kind === "abandoned" ? "wrong_timing" : "wrong_intervention",
      userText: `[behavioral:${input.kind}]`,
      interventionId: input.interventionId,
      trustImpact: 5,
    });
  }
}

export function recordTrustRepair(input?: {
  mistakeId?: string;
  successful?: boolean;
  recoverySpeedMs?: number;
}): void {
  const trust = readJson<TrustRepairProfile>(TRUST_REPAIR_KEY, emptyTrustProfile());
  trust.trustRepairs += 1;
  if (input?.successful) {
    trust.trustGains += 1;
    trust.recentRepairsSuccessful += 1;
  } else if (input?.successful === false) {
    trust.recentRepairsFailed += 1;
  }
  if (input?.recoverySpeedMs != null) {
    const prev = trust.avgRecoverySpeedMs;
    trust.avgRecoverySpeedMs = prev
      ? Math.round((prev + input.recoverySpeedMs) / 2)
      : input.recoverySpeedMs;
  }
  trust.humilityMode = trust.trustLosses > trust.trustGains;
  trust.relationshipResilience = computeResilience(trust);
  writeJson(TRUST_REPAIR_KEY, trust);

  if (input?.mistakeId) {
    const mistakes = getMistakeRecords().map((m) =>
      m.id === input.mistakeId ? { ...m, repaired: true } : m,
    );
    writeJson(MISTAKES_KEY, mistakes);
  }
}

export function recordRecoveryOutcome(input: {
  mistakeId: string;
  repairAttempted: boolean;
  conversationContinued: boolean;
  outcomeAchieved: boolean;
}): RecoveryOutcome {
  const outcome: RecoveryOutcome = {
    id: `recovery-${Date.now()}`,
    mistakeId: input.mistakeId,
    repairAttempted: input.repairAttempted,
    conversationContinued: input.conversationContinued,
    outcomeAchieved: input.outcomeAchieved,
    recordedAt: new Date().toISOString(),
  };
  const list = getRecoveryOutcomes();
  list.unshift(outcome);
  writeJson(RECOVERY_KEY, list.slice(0, MAX_RECOVERY));

  if (input.repairAttempted) {
    recordTrustRepair({
      mistakeId: input.mistakeId,
      successful: input.conversationContinued || input.outcomeAchieved,
    });
  }
  if (input.outcomeAchieved) {
    const trust = readJson<TrustRepairProfile>(TRUST_REPAIR_KEY, emptyTrustProfile());
    trust.trustGains += 1;
    writeJson(TRUST_REPAIR_KEY, trust);
  }

  return outcome;
}

function learnUserPreferenceFromMistake(input: {
  signalKind: MistakeSignalKind;
  misunderstanding: MisunderstandingType;
  userText: string;
}): void {
  const prefs = { ...getUserHelpPreferences() };
  const text = input.userText.toLowerCase();

  if (
    input.misunderstanding === "wrong_timing" ||
    /\b(talk first|just talk|conversation|keep talking)\b/i.test(text)
  ) {
    prefs.conversation_first = (prefs.conversation_first ?? 0) + 1;
  }
  if (input.misunderstanding === "wrong_intervention" && /\b(tool|workspace)\b/i.test(text)) {
    prefs.conversation_only = (prefs.conversation_only ?? 0) + 1;
  }
  if (/\b(decide|decision|choose between)\b/i.test(text)) {
    prefs.decision_support = (prefs.decision_support ?? 0) + 1;
  }
  if (input.misunderstanding === "wrong_intensity" && /\b(too much|minimal)\b/i.test(text)) {
    prefs.minimal_guidance = (prefs.minimal_guidance ?? 0) + 1;
  }
  if (input.signalKind === "behavioral_correction") {
    const lastId = getLastInterventionForMistake();
    if (lastId === "conversation_coaching") {
      prefs.workspace_first = (prefs.workspace_first ?? 0) + 1;
    }
  }

  writeJson(PREFERENCES_KEY, prefs);
}

export function analyzeTurnForMistakes(input: {
  userText: string;
  lastAssistantText?: string;
  lastInterventionId?: string;
  hadRecentOffer?: boolean;
}): MistakeTurnAnalysis | null {
  const text = input.userText.trim();
  if (!text) return null;

  let signalKind: MistakeSignalKind | null = null;
  if (detectExplicitCorrection(text)) {
    signalKind = "explicit_correction";
  } else if (detectFrustrationSignal(text)) {
    signalKind = FRUSTRATION_RE.test(text) ? "frustration" : "trust_damage";
  } else if (detectSoftCorrection(text, input.lastAssistantText ?? "")) {
    signalKind = "soft_correction";
  } else if (input.hadRecentOffer && text.length > 12 && !/^(yes|yeah|sure|ok|okay)\b/i.test(text)) {
    signalKind = "soft_correction";
  }

  if (!signalKind) return null;

  const misunderstanding = classifyMisunderstanding({
    signalKind,
    userText: text,
    lastAssistantText: input.lastAssistantText,
    hadRecentOffer: input.hadRecentOffer,
    interventionId: input.lastInterventionId,
  });

  const trustImpact = trustImpactForSignal(signalKind);

  return {
    detected: true,
    signalKind,
    misunderstanding,
    trustImpact,
    needsRepair: trustImpact >= 5,
    repairPhrases: REPAIR_PHRASES,
  };
}

export function processMistakeSignalsFromUserTurn(input: {
  userText: string;
  lastAssistantText?: string;
  hadRecentOffer?: boolean;
  lastInterventionId?: string;
}): MistakeRecord | null {
  const analysis = analyzeTurnForMistakes(input);
  if (!analysis?.detected) return null;

  return recordMistake({
    signalKind: analysis.signalKind,
    misunderstanding: analysis.misunderstanding,
    userText: input.userText,
    interventionId: input.lastInterventionId ?? getLastInterventionForMistake() ?? undefined,
    trustImpact: analysis.trustImpact,
  });
}

export function buildTrustRepairProfile(): TrustRepairProfile {
  return readJson<TrustRepairProfile>(TRUST_REPAIR_KEY, emptyTrustProfile());
}

export function detectRepeatedFailure(interventionId: string): {
  failed: boolean;
  recommended: number;
  dismissed: number;
  completed: number;
  misread: number;
} {
  const entry = getUserInterventionEffectiveness().find((e) => e.id === interventionId);
  if (!entry) {
    return { failed: false, recommended: 0, dismissed: 0, completed: 0, misread: 0 };
  }
  const { recommended, dismissed, completed, misread } = {
    recommended: entry.counts.recommended,
    dismissed: entry.counts.dismissed,
    completed: entry.counts.completed,
    misread: entry.counts.misread ?? 0,
  };
  const failed =
    recommended >= 5 &&
    dismissed >= Math.ceil(recommended * 0.7) &&
    completed === 0;
  return { failed, recommended, dismissed, completed, misread };
}

export function shouldSuppressIntervention(interventionId: string): boolean {
  return detectRepeatedFailure(interventionId).failed;
}

export function getMistakePenaltyForIntervention(
  interventionId: string,
  baseWeight: number,
): number {
  if (shouldSuppressIntervention(interventionId)) {
    return Math.max(5, Math.round(baseWeight * 0.25));
  }
  const failure = detectRepeatedFailure(interventionId);
  if (failure.recommended >= 3) {
    const dismissRate = failure.dismissed / failure.recommended;
    const misreadRate = failure.misread / failure.recommended;
    const penalty = (dismissRate * 0.4 + misreadRate * 0.5) * baseWeight;
    return Math.max(0, Math.round(baseWeight - penalty));
  }
  const recent = getMistakeRecords().filter(
    (m) => m.interventionId === interventionId,
  ).length;
  if (recent >= 2) {
    return Math.max(0, Math.round(baseWeight * 0.75));
  }
  return baseWeight;
}

export function computeRecoveryEffectivenessScore(): number {
  const outcomes = getRecoveryOutcomes();
  if (!outcomes.length) return 0;
  const recent = outcomes.slice(0, 30);
  const successes = recent.filter(
    (o) => o.conversationContinued || o.outcomeAchieved,
  ).length;
  return Math.round((successes / recent.length) * 100);
}

export function getMistakeRecoveryDashboardSlice(): MistakeRecoveryDashboardSlice {
  const mistakes = getMistakeRecords();
  const outcomes = getRecoveryOutcomes();

  const misunderstandingCounts = new Map<MisunderstandingType, number>();
  const signalCounts = new Map<MistakeSignalKind, number>();
  for (const m of mistakes) {
    misunderstandingCounts.set(
      m.misunderstanding,
      (misunderstandingCounts.get(m.misunderstanding) ?? 0) + 1,
    );
    signalCounts.set(m.signalKind, (signalCounts.get(m.signalKind) ?? 0) + 1);
  }

  const topMisunderstandingTypes = [...misunderstandingCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const mostCommonCorrections = [...signalCounts.entries()]
    .map(([signal, count]) => ({ signal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const failedInterventions = getUserInterventionEffectiveness()
    .filter(
      (e) =>
        e.counts.recommended >= 3 &&
        (e.counts.dismissed >= 2 || (e.counts.misread ?? 0) >= 1) &&
        e.counts.completed === 0,
    )
    .slice(0, 8)
    .map((e) => ({
      id: String(e.id),
      recommended: e.counts.recommended,
      dismissed: e.counts.dismissed,
      misread: e.counts.misread ?? 0,
      completed: e.counts.completed,
      suppress: shouldSuppressIntervention(String(e.id)),
    }));

  const repairs = buildTrustRepairProfile();
  const repairTotal = repairs.recentRepairsSuccessful + repairs.recentRepairsFailed;
  const trustRepairSuccessRate = repairTotal
    ? Math.round((repairs.recentRepairsSuccessful / repairTotal) * 100)
    : 0;

  return {
    topMisunderstandingTypes,
    mostCommonCorrections,
    failedInterventions,
    recoveredConversations: outcomes.filter((o) => o.conversationContinued).length,
    trustRepairSuccessRate,
    recoveryEffectivenessScore: computeRecoveryEffectivenessScore(),
  };
}

export function mistakeRecoveryHintForChat(): string | null {
  const profile = buildTrustRepairProfile();
  const prefs = getUserHelpPreferences();
  const mistakes = getMistakeRecords().slice(0, 5);
  const suppressed = getUserInterventionEffectiveness()
    .filter((e) => shouldSuppressIntervention(String(e.id)))
    .map((e) => e.label);

  if (!mistakes.length && !profile.humilityMode && suppressed.length === 0) {
    return null;
  }

  const prefLine = Object.entries(prefs)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 2)
    .map(([k, v]) => `${k.replace(/_/g, " ")} (${v})`)
    .join(", ");

  const parts = [
    "MISTAKE RECOVERY (Sprint 10 — invisible):",
    "Companion Humility Model: high confidence ≠ certainty. Patterns ≠ facts. Hypotheses require validation.",
    "When the user corrects you: acknowledge uncertainty, re-center on them, reinvestigate briefly. NEVER argue, defend, blame, or double down.",
    'Allowed: "I may have misunderstood." "Help me understand what\'s missing." "Let\'s correct course."',
  ];

  if (profile.humilityMode || profile.trustLosses > profile.trustGains) {
    parts.push(
      "Trust is recovering — stay curious, smaller scope, one gentle suggestion max.",
    );
  }

  if (suppressed.length) {
    parts.push(
      `Do NOT push these failing interventions: ${suppressed.join(", ")}.`,
    );
  }

  if (prefLine) {
    parts.push(`Learned help preference signals: ${prefLine}.`);
  }

  const topMis = mistakes[0]?.misunderstanding;
  if (topMis && topMis !== "unknown") {
    parts.push(`Recent misunderstanding pattern: ${topMis.replace(/_/g, " ")}.`);
  }

  return parts.join("\n");
}

export function resetMistakeRecoveryForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MISTAKES_KEY);
  localStorage.removeItem(TRUST_REPAIR_KEY);
  localStorage.removeItem(PREFERENCES_KEY);
  localStorage.removeItem(RECOVERY_KEY);
  localStorage.removeItem(LAST_INTERVENTION_KEY);
  localStorage.removeItem(DISMISSAL_TRACK_KEY);
}
