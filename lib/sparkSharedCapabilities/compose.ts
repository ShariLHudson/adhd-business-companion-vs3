/**
 * Capability Composition Engine — Estate 138.
 * Compose primary + supports; never expose GPTs.
 */

import { getSharedCapability } from "./catalog";
import { detectCapabilitySignals, topCapabilityId } from "./detect";
import type {
  CapabilityAdapterHint,
  CapabilityCompositionRecipe,
  CapabilityCompositionRecipeId,
  ComposeSharedCapabilitiesInput,
  SharedCapabilityComposition,
  SharedCapabilityId,
} from "./types";

export const COMPOSITION_RECIPES: readonly CapabilityCompositionRecipe[] = [
  {
    id: "decide_and_plan",
    primary: "decision_making",
    supports: ["planning"],
    when: "Stuck between options and needs next steps",
  },
  {
    id: "unstuck",
    primary: "problem_solving",
    supports: ["reflection", "planning"],
    when: "Overwhelm / stuck language",
  },
  {
    id: "create_with_intent",
    primary: "content_creation",
    supports: ["brainstorming", "strategy"],
    when: "Drafting with unclear angle",
  },
  {
    id: "learn_and_apply",
    primary: "learning",
    supports: ["research", "planning"],
    when: "Wants to understand then act",
  },
  {
    id: "notice_and_honor",
    primary: "celebration",
    supports: ["reflection"],
    when: "Win / milestone language",
  },
  {
    id: "sort_the_pile",
    primary: "organization",
    supports: ["planning", "reflection"],
    when: "Brain dump / too much",
  },
] as const;

const ADAPTER_FOR: Partial<Record<SharedCapabilityId, CapabilityAdapterHint>> = {
  decision_making: "decision_compass",
  planning: "plan_my_day",
  content_creation: "create_workspace",
  organization: "clear_my_mind",
  celebration: "celebration_garden",
  reflection: "journal",
  research: null,
  learning: null,
  brainstorming: "create_workspace",
  strategy: null,
  problem_solving: null,
  communication: "create_workspace",
};

function recipeForPrimary(
  primary: SharedCapabilityId,
  supportCandidates: SharedCapabilityId[],
): {
  recipeId: CapabilityCompositionRecipeId | null;
  supports: SharedCapabilityId[];
} {
  const recipe = COMPOSITION_RECIPES.find((r) => r.primary === primary);
  if (!recipe) {
    const cap = getSharedCapability(primary);
    const supports = supportCandidates
      .filter((id) => id !== primary && cap.composableWith.includes(id))
      .slice(0, 2);
    return { recipeId: null, supports };
  }

  const fromRecipe = recipe.supports.filter(
    (id) => supportCandidates.includes(id) || supportCandidates.length === 0,
  );
  const supports =
    fromRecipe.length > 0
      ? [...fromRecipe]
      : recipe.supports.slice(0, 2).map((id) => id);

  // Prefer recipe supports that are composable
  const cap = getSharedCapability(primary);
  const filtered = supports.filter((id) => cap.composableWith.includes(id));
  return {
    recipeId: recipe.id,
    supports: filtered.length > 0 ? filtered : supports,
  };
}

function collectForbidden(
  primary: SharedCapabilityId,
  supports: SharedCapabilityId[],
): string[] {
  const ids = [primary, ...supports];
  const set = new Set<string>();
  for (const id of ids) {
    for (const name of getSharedCapability(id).neverExposeAs) {
      set.add(name);
    }
  }
  set.add("GPT");
  set.add("custom GPT");
  return [...set];
}

function buildPromptHint(
  primary: SharedCapabilityId,
  supports: SharedCapabilityId[],
  reason: string,
): string {
  const p = getSharedCapability(primary);
  const supportNames = supports
    .map((id) => getSharedCapability(id).officialName)
    .join(", ");
  return [
    `Shared Capability composition (hidden behind companion):`,
    `Primary: ${p.officialName} — ${p.coreQuestion}`,
    supportNames ? `Support: ${supportNames}` : null,
    `Reason: ${reason}`,
    `Speak as one Spark companion. Never name GPTs or capability products.`,
    `Member-facing tone: ${p.companionLine}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Compose capabilities for a turn. Returns null when no skill should activate.
 */
export function composeSharedCapabilities(
  input: ComposeSharedCapabilitiesInput,
): SharedCapabilityComposition | null {
  const text = input.userText.trim();
  if (!text && !input.memberOverride) return null;

  // Recognition preserve flow — do not push Create/content composition
  if (input.activeRecognitionFlowKind === "preserve_discovery") {
    const celebrationSignal = detectCapabilitySignals(text).find(
      (s) => s.id === "celebration" || s.id === "reflection",
    );
    if (celebrationSignal?.id === "celebration") {
      return buildComposition(
        "celebration",
        ["reflection"],
        "recognition_preserve_context",
        null,
      );
    }
    return buildComposition(
      "reflection",
      [],
      "recognition_preserve_first",
      null,
      "evidence_vault",
    );
  }

  if (input.memberOverride) {
    const { recipeId, supports } = recipeForPrimary(input.memberOverride, []);
    return buildComposition(
      input.memberOverride,
      supports,
      "member_override",
      recipeId,
    );
  }

  const signals = detectCapabilitySignals(text, input.visualRoom);
  const primary = topCapabilityId(signals);
  if (!primary) return null;

  const supportCandidates = signals
    .slice(1)
    .filter((s) => s.score >= 1)
    .map((s) => s.id);

  const { recipeId, supports } = recipeForPrimary(primary, supportCandidates);

  // Celebration in festive room → celebration_room adapter
  let adapterOverride: CapabilityAdapterHint | undefined;
  if (
    primary === "celebration" &&
    (input.visualRoom === "celebration-room" ||
      input.visualRoom === "celebration-hall")
  ) {
    adapterOverride = "celebration_room";
  }
  if (
    primary === "celebration" &&
    (input.visualRoom === "evidence-vault" ||
      input.activeRecognitionFlowKind === "preserve_discovery")
  ) {
    adapterOverride = "evidence_vault";
  }

  return buildComposition(
    primary,
    supports,
    recipeId
      ? `recipe:${recipeId}`
      : `signals:${signals
          .slice(0, 3)
          .map((s) => s.id)
          .join("+")}`,
    recipeId,
    adapterOverride,
  );
}

function buildComposition(
  primary: SharedCapabilityId,
  supports: SharedCapabilityId[],
  reason: string,
  recipeId: CapabilityCompositionRecipeId | null,
  adapterOverride?: CapabilityAdapterHint,
): SharedCapabilityComposition {
  const p = getSharedCapability(primary);
  const optionalAdapter =
    adapterOverride !== undefined
      ? adapterOverride
      : (ADAPTER_FOR[primary] ?? null);

  return {
    primaryId: primary,
    supportIds: supports,
    recipeId,
    reason,
    companionPromptHint: buildPromptHint(primary, supports, reason),
    companionOfferLine: p.companionLine,
    forbiddenExposures: collectForbidden(primary, supports),
    optionalAdapter,
    hiddenBehindCompanion: true,
  };
}

export function getCompositionRecipe(
  id: CapabilityCompositionRecipeId,
): CapabilityCompositionRecipe | undefined {
  return COMPOSITION_RECIPES.find((r) => r.id === id);
}
