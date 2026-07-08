import { getDayState } from "@/lib/companionStore";
import { isDayStateFromToday } from "@/lib/dayReality";
import {
  MOMENTUM_BUILDER_CATALOG,
  momentumBuildersForCategory,
} from "./catalog";
import type {
  MomentumBuilderCategoryId,
  MomentumBuilderItem,
  MomentumBuilderRecommendation,
} from "./types";

const DEFAULT_CATEGORY_ORDER: MomentumBuilderCategoryId[] = [
  "refocus",
  "calm-nervous-system",
  "reset-energy",
];

function pickFirst(
  categoryId: MomentumBuilderCategoryId,
  used: Set<string>,
): MomentumBuilderItem | null {
  const item = momentumBuildersForCategory(categoryId).find((row) => !used.has(row.id));
  if (!item) return null;
  used.add(item.id);
  return item;
}

function addRecommendation(
  out: MomentumBuilderRecommendation[],
  item: MomentumBuilderItem | null,
  reason: string,
  used: Set<string>,
) {
  if (!item || used.has(item.id)) return;
  used.add(item.id);
  out.push({ item, reason });
}

/** Up to three builders tuned from Today's Reality — never another questionnaire. */
export function recommendMomentumBuilders(
  count = 3,
): MomentumBuilderRecommendation[] {
  const day = getDayState();
  const out: MomentumBuilderRecommendation[] = [];
  const used = new Set<string>();

  if (!day || !isDayStateFromToday(day)) {
    for (const categoryId of DEFAULT_CATEGORY_ORDER) {
      if (out.length >= count) break;
      const item = pickFirst(categoryId, used);
      if (item) {
        out.push({
          item,
          reason: "A gentle place to start when you have not checked in yet today.",
        });
      }
    }
    return out.slice(0, count);
  }

  const needs = day.needs.map((n) => n.toLowerCase());
  const energy = day.energyLevel ?? "doing-okay";
  const motivation = day.motivationLevel ?? "get-it-done";
  const lowEnergy =
    energy === "running-on-fumes" || energy === "need-recharge";
  const lowMotivation =
    motivation === "need-push" ||
    motivation === "dragging" ||
    motivation === "not-happening";

  if (lowEnergy) {
    addRecommendation(
      out,
      pickFirst("reset-energy", used),
      "Your Today's Reality check-in suggests your energy is running low.",
      used,
    );
  }

  if (
    day.overwhelm === "high" ||
    needs.some((n) => /overwhelm|anxious|stress|calm|rest|reset/.test(n))
  ) {
    addRecommendation(
      out,
      pickFirst("calm-nervous-system", used),
      "A softer reset may help before you push harder.",
      used,
    );
  }

  if (
    lowMotivation ||
    needs.some((n) => /start|stuck|procrastinat|momentum|focus/.test(n))
  ) {
    addRecommendation(
      out,
      pickFirst("refocus", used),
      "A tiny re-entry step can loosen the stuck feeling.",
      used,
    );
  }

  if (needs.some((n) => /idea|creative|flat|bored/.test(n))) {
    addRecommendation(
      out,
      pickFirst("wake-brain", used),
      "A little spark might wake your brain without forcing productivity.",
      used,
    );
  }

  if (out.length < count) {
    for (const item of MOMENTUM_BUILDER_CATALOG) {
      if (out.length >= count) break;
      if (used.has(item.id)) continue;
      used.add(item.id);
      out.push({
        item,
        reason: "Something supportive — tell me which one sounds right.",
      });
    }
  }

  return out.slice(0, count);
}
