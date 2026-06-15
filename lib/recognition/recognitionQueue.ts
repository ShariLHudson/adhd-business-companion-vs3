/**
 * Recognition Queue — collects today's events and picks at most one to show.
 *
 * Priority (highest wins):
 * 1. Birthday
 * 2. Personal anniversary
 * 3. App / membership anniversary
 * 4. Business milestone
 * 5. Companion (conversation) milestone
 * 6. Vacation countdown / custom reminders
 *
 * Never stacks multiple major recognitions on one day.
 */

import { dayKey, getRecognitionStore, isRecognitionDismissed } from "./recognitionStore";
import {
  labelForBusinessMilestone,
  milestoneReachedToday,
} from "./recognitionSync";
import type {
  ConversationMilestoneKey,
  MembershipMilestoneKey,
  PersonalDate,
  RecognitionContext,
  RecognitionEvent,
  RecognitionEventType,
} from "./types";

const DAY_MS = 86_400_000;

/** Priority tiers — higher number wins. */
export const RECOGNITION_PRIORITY = {
  birthday: 100,
  anniversary: 95,
  membership_anniversary: 90,
  business_milestone: 70,
  conversation_milestone: 65,
  project_milestone: 68,
  vacation_countdown: 50,
  custom_event: 45,
} as const satisfies Record<RecognitionEventType, number>;

const MEMBERSHIP_TIERS: {
  key: MembershipMilestoneKey;
  minDays: number;
  label: string;
}[] = [
  { key: "membership_30d", minDays: 30, label: "30 days" },
  { key: "membership_90d", minDays: 90, label: "90 days" },
  { key: "membership_6mo", minDays: 182, label: "6 months" },
  { key: "membership_1y", minDays: 365, label: "1 year" },
  { key: "membership_2y", minDays: 730, label: "2 years" },
  { key: "membership_3y_plus", minDays: 1095, label: "3 years" },
];

const CONVERSATION_MILESTONES: {
  key: ConversationMilestoneKey;
  count: number;
  label: string;
}[] = [
  { key: "first_conversation", count: 1, label: "your first conversation here" },
  { key: "conversation_25", count: 25, label: "25 conversations together" },
  { key: "conversation_50", count: 50, label: "50 conversations together" },
  { key: "conversation_100", count: 100, label: "100 conversations together" },
];

function sameMonthDay(month: number, day: number, now: Date): boolean {
  return now.getMonth() + 1 === month && now.getDate() === day;
}

function membershipDays(
  memberSinceIso: string | null | undefined,
  now: Date,
): number {
  if (!memberSinceIso) return 0;
  const start = new Date(memberSinceIso);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.floor((now.getTime() - start.getTime()) / DAY_MS);
}

function isMembershipAnniversaryToday(
  memberSinceIso: string | null | undefined,
  now: Date,
): MembershipMilestoneKey | null {
  if (!memberSinceIso) return null;
  const start = new Date(memberSinceIso);
  if (Number.isNaN(start.getTime())) return null;
  if (start.getFullYear() >= now.getFullYear()) return null;
  if (
    start.getMonth() !== now.getMonth() ||
    start.getDate() !== now.getDate()
  ) {
    return null;
  }
  const days = membershipDays(memberSinceIso, now);
  let matched: MembershipMilestoneKey | null = null;
  for (const tier of MEMBERSHIP_TIERS) {
    if (days >= tier.minDays) matched = tier.key;
  }
  return matched;
}

function daysUntil(isoDate: string, now: Date): number {
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** Collect all recognition events eligible for today, sorted by priority. */
export function buildRecognitionQueue(
  ctx: RecognitionContext = {},
): RecognitionEvent[] {
  const now = ctx.now ?? new Date();
  const name = ctx.userName?.trim() || "friend";
  const out: RecognitionEvent[] = [];
  const birthday = ctx.birthday ?? getRecognitionStore().birthday;

  // 1. Birthday
  if (birthday && sameMonthDay(birthday.month, birthday.day, now)) {
    out.push({
      id: `birthday:${dayKey(now)}`,
      type: "birthday",
      milestoneKey: "birthday",
      priority: RECOGNITION_PRIORITY.birthday,
      shariState: "birthday",
      plannedEffect: "birthday_cake",
      messageCategory: "birthday",
      messageVars: { name },
    });
  }

  // Personal dates: anniversaries, customs, vacations
  for (const pd of ctx.personalDates ?? getRecognitionStore().personalDates) {
    if (pd.kind === "vacation" && pd.targetDate) {
      const days = daysUntil(pd.targetDate, now);
      if (days >= 0 && days <= 7) {
        out.push({
          id: `vacation:${pd.id}:${dayKey(now)}`,
          type: "vacation_countdown",
          milestoneKey: `vacation_${pd.id}`,
          priority: RECOGNITION_PRIORITY.vacation_countdown,
          shariState: "celebration",
          plannedEffect: "balloons",
          messageCategory: "vacation_countdown",
          messageVars: { label: pd.label, days: String(days) },
        });
      }
      continue;
    }

    if (!sameMonthDay(pd.month, pd.day, now)) continue;

    if (pd.kind === "anniversary") {
      out.push({
        id: `anniversary:${pd.id}:${dayKey(now)}`,
        type: "anniversary",
        milestoneKey: `personal_${pd.id}`,
        priority: RECOGNITION_PRIORITY.anniversary,
        shariState: "celebration",
        plannedEffect: "celebration_banner",
        messageCategory: "anniversary",
        messageVars: { name, label: pd.label },
      });
    } else if (pd.kind === "custom") {
      out.push({
        id: `custom:${pd.id}:${dayKey(now)}`,
        type: "custom_event",
        milestoneKey: `custom_${pd.id}`,
        priority: RECOGNITION_PRIORITY.custom_event,
        shariState: "celebration",
        plannedEffect: null,
        messageCategory: "custom_event",
        messageVars: { name, label: pd.label },
      });
    }
  }

  // 3. App / membership anniversary
  const memberKey = isMembershipAnniversaryToday(ctx.memberSinceIso, now);
  if (memberKey) {
    const tier = MEMBERSHIP_TIERS.find((t) => t.key === memberKey);
    out.push({
      id: `membership:${memberKey}:${now.getFullYear()}`,
      type: "membership_anniversary",
      milestoneKey: memberKey,
      priority: RECOGNITION_PRIORITY.membership_anniversary,
      shariState: "app_anniversary",
      plannedEffect: "confetti",
      messageCategory: "membership_anniversary",
      messageVars: {
        name,
        duration: tier?.label ?? "another year",
      },
    });
  }

  // 4. Business milestones (first reached today)
  const milestones =
    ctx.businessMilestones ?? getRecognitionStore().businessMilestones;
  for (const [key, at] of Object.entries(milestones)) {
    if (!milestoneReachedToday(at, now)) continue;
    const label = labelForBusinessMilestone(key);
    const isProject =
      key === "first_project" || key === "first_project_completed";
    out.push({
      id: `business:${key}:${dayKey(now)}`,
      type: isProject ? "project_milestone" : "business_milestone",
      milestoneKey: key,
      priority: isProject
        ? RECOGNITION_PRIORITY.project_milestone
        : RECOGNITION_PRIORITY.business_milestone,
      shariState: "celebration",
      plannedEffect: "confetti",
      messageCategory: "celebration",
      messageVars: { name, milestone: label },
    });
  }

  // 5. Companion conversation milestones
  const store = getRecognitionStore();
  const convStarts = store.conversationStarts;
  const convAt =
    convStarts === 1
      ? store.firstConversationAt
      : store.lastConversationStartAt;

  for (const cm of CONVERSATION_MILESTONES) {
    if (convStarts !== cm.count) continue;
    if (!milestoneReachedToday(convAt ?? undefined, now)) continue;
    out.push({
      id: `conversation:${cm.key}:${dayKey(now)}`,
      type: "conversation_milestone",
      milestoneKey: cm.key,
      priority: RECOGNITION_PRIORITY.conversation_milestone,
      shariState: "celebration",
      plannedEffect: cm.count >= 50 ? "celebration_banner" : null,
      messageCategory: "milestone",
      messageVars: { name, milestone: cm.label },
    });
    break;
  }

  return out.sort((a, b) => b.priority - a.priority);
}

/** Pick at most one event for today — highest priority not yet dismissed. */
export function pickTodaysRecognition(
  queue: RecognitionEvent[],
  now?: Date,
): RecognitionEvent | null {
  return queue.find((e) => !isRecognitionDismissed(e.id, now)) ?? null;
}
