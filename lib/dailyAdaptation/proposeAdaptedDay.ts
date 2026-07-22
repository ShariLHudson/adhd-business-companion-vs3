import type { PlanDayItem } from "@/lib/planMyDay/types";
import {
  detectFocusWork,
  detectQuickTask,
  estimateTaskMinutes,
} from "@/lib/planMyDay/completePlanWorkflow";
import {
  guidanceForPosture,
  recoveryBreakMinutesForPosture,
  resolveAdaptationPosture,
} from "./adaptationGuidance";
import type {
  AdaptedDayProposal,
  AdaptedPlanItem,
  DailyAdaptationCheckIn,
} from "./types";

function adaptableItems(items: PlanDayItem[]): PlanDayItem[] {
  return items.filter(
    (item) =>
      Boolean(item.title?.trim()) &&
      !item.done &&
      item.column !== "done",
  );
}

function easeScore(item: PlanDayItem): number {
  const minutes =
    item.durationMinutes && item.durationMinutes > 0
      ? item.durationMinutes
      : estimateTaskMinutes(item.title);
  const quick = detectQuickTask(item.title) ? 0 : 1;
  const deepFocus =
    detectFocusWork(item.title) && !detectQuickTask(item.title) ? 1 : 0;
  const priorityBoost =
    item.priority === "high" ? 0 : item.priority === "low" ? 2 : 1;
  return minutes + quick * 20 + deepFocus * 40 + priorityBoost * 5;
}

function sortForPosture(
  items: PlanDayItem[],
  posture: ReturnType<typeof resolveAdaptationPosture>,
): PlanDayItem[] {
  const lowCapacity =
    posture === "low-energy-low-motivation" ||
    posture === "low-energy-high-motivation" ||
    posture === "high-energy-low-motivation";

  return [...items].sort((a, b) => {
    if (lowCapacity) {
      const ease = easeScore(a) - easeScore(b);
      if (ease !== 0) return ease;
    }
    const priorityWeight = (item: PlanDayItem): number => {
      if (item.priority === "high") return 3;
      if (item.priority === "medium") return 2;
      if (item.priority === "low") return 1;
      return 2;
    };
    return priorityWeight(b) - priorityWeight(a);
  });
}

/**
 * Propose a reshaped day from the existing plan + today's check-in.
 * Does not mutate storage — caller applies when the member accepts.
 */
export function proposeAdaptedDay(
  checkIn: DailyAdaptationCheckIn,
  planItems: PlanDayItem[],
): AdaptedDayProposal {
  const posture = resolveAdaptationPosture(
    checkIn.energyLevel,
    checkIn.motivationLevel,
  );
  const guidance = guidanceForPosture(posture);
  const recoveryBreakMinutes = recoveryBreakMinutesForPosture(posture);
  const focus = sortForPosture(adaptableItems(planItems), posture);

  const adapted: AdaptedPlanItem[] = [];

  if (focus.length === 0) {
    return {
      guidance,
      posture,
      items: [],
      recoveryBreakMinutes,
      startWithTitle: null,
    };
  }

  const start = focus[0]!;
  adapted.push({
    itemId: start.id,
    title: start.title,
    bucket: "start-with-this",
    note:
      posture === "high-energy-low-motivation"
        ? "Easiest meaningful entry point"
        : posture === "low-energy-low-motivation"
          ? "One small starting step"
          : "Begin here",
  });

  const rest = focus.slice(1);

  if (posture === "low-energy-low-motivation") {
    if (rest[0]) {
      adapted.push({
        itemId: rest[0].id,
        title: rest[0].title,
        bucket: "keep-today",
        note: "Protect this one important item",
      });
    }
    for (const item of rest.slice(1)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "move-later",
      });
    }
  } else if (posture === "low-energy-high-motivation") {
    if (rest[0]) {
      adapted.push({
        itemId: rest[0].id,
        title: rest[0].title,
        bucket: "make-smaller",
        note: "Short work periods",
      });
    }
    for (const item of rest.slice(1, 3)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "keep-today",
      });
    }
    for (const item of rest.slice(3)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "move-later",
      });
    }
  } else if (posture === "high-energy-low-motivation") {
    if (rest[0]) {
      adapted.push({
        itemId: rest[0].id,
        title: rest[0].title,
        bucket: "keep-today",
        note: "Useful alternative if the first step stalls",
      });
    }
    for (const item of rest.slice(1, 2)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "make-smaller",
      });
    }
    for (const item of rest.slice(2)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "move-later",
      });
    }
  } else if (posture === "high-energy-high-motivation") {
    for (const item of rest.slice(0, 3)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "keep-today",
      });
    }
    for (const item of rest.slice(3)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "move-later",
        note: "Protect capacity — don't fill every open space",
      });
    }
  } else {
    for (const item of rest.slice(0, 3)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "keep-today",
      });
    }
    for (const item of rest.slice(3)) {
      adapted.push({
        itemId: item.id,
        title: item.title,
        bucket: "move-later",
      });
    }
  }

  adapted.push({
    itemId: `recovery-break-${checkIn.date}`,
    title: `${recoveryBreakMinutes}-minute recovery break`,
    bucket: "add-a-break",
  });

  return {
    guidance,
    posture,
    items: adapted,
    recoveryBreakMinutes,
    startWithTitle: start.title,
  };
}
