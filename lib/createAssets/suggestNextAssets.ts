/**
 * 047 — Dynamic asset suggestions
 * Never dump the full ecosystem. Max 3 next logical assets.
 */

import { getCreateAssetById } from "./assetRegistry";
import { getCreationEcosystemById } from "./ecosystems";
import type {
  AssetSuggestion,
  AssetSuggestionResult,
  CreationEcosystemRecord,
  EcosystemAssetRef,
} from "./types";

const MAX_SUGGESTIONS = 3;

function isUnlocked(
  completed: ReadonlySet<string>,
  signals: readonly string[],
): boolean {
  if (!signals.length) return false;
  // ecosystem_started alone means "available from the start" — still gated by other logic
  return signals.some((s) => completed.has(s));
}

function dependenciesMet(
  dependencyAssetIds: readonly string[],
  record: CreationEcosystemRecord,
): boolean {
  if (!dependencyAssetIds.length) return true;
  const present = new Set(
    record.instances
      .filter((i) => i.status !== "skipped")
      .map((i) => i.assetId),
  );
  return dependencyAssetIds.every((id) => present.has(id));
}

function scoreRef(
  ref: EcosystemAssetRef,
  newSignals: readonly string[],
): number {
  if (!newSignals.length) return 0;
  return ref.suggestAfterSignals.filter((s) => newSignals.includes(s)).length;
}

/**
 * Suggest the next logical assets after planning progress.
 * Prefers assets unlocked by this turn's signals; never more than max.
 */
export function suggestNextAssets(input: {
  ecosystemRecord: CreationEcosystemRecord;
  /** Fresh signals from this turn (e.g. venue just confirmed) */
  newSignals?: readonly string[];
  max?: number;
}): AssetSuggestionResult {
  const eco = getCreationEcosystemById(input.ecosystemRecord.ecosystemId);
  if (!eco) {
    return { suggestions: [], offerLine: null };
  }

  const completed = new Set([
    ...input.ecosystemRecord.completedSignals,
    ...(input.newSignals ?? []),
  ]);
  const existing = new Set(
    input.ecosystemRecord.instances.map((i) => i.assetId),
  );
  const newSignals = input.newSignals ?? [];
  const max = input.max ?? MAX_SUGGESTIONS;

  type Ranked = {
    ref: EcosystemAssetRef;
    order: number;
    score: number;
  };

  const candidates: Ranked[] = [];

  eco.assets.forEach((ref, order) => {
    if (existing.has(ref.assetId)) return;
    if (
      ref.assetId === eco.primaryAssetId &&
      completed.has("ecosystem_started")
    ) {
      return;
    }
    if (!isUnlocked(completed, ref.suggestAfterSignals)) return;

    const def = getCreateAssetById(ref.assetId);
    if (!def) return;
    if (!dependenciesMet(def.dependencyAssetIds, input.ecosystemRecord)) {
      return;
    }

    candidates.push({
      ref,
      order,
      score: scoreRef(ref, newSignals),
    });
  });

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.order - b.order;
  });

  const suggestions: AssetSuggestion[] = [];
  for (const c of candidates.slice(0, max)) {
    const def = getCreateAssetById(c.ref.assetId);
    if (!def) continue;
    suggestions.push({
      assetId: def.id,
      name: def.name,
      purpose: def.purpose,
      contextLabel: c.ref.contextLabel ?? def.name,
      primaryChamberMemberId: def.primaryChamberMemberId,
      canGenerate: def.editable,
    });
  }

  return {
    suggestions,
    offerLine: buildOfferLine(suggestions, newSignals),
  };
}

function buildOfferLine(
  suggestions: AssetSuggestion[],
  newSignals?: readonly string[],
): string | null {
  if (!suggestions.length) return null;
  const names = suggestions.map((s) => s.contextLabel);
  const trigger = newSignals?.includes("venue")
    ? "You've selected the venue."
    : newSignals?.includes("speakers")
      ? "Since you're inviting speakers,"
      : newSignals?.includes("registration")
        ? "Now that registration is taking shape,"
        : "Based on where this creation is now,";

  if (newSignals?.includes("speakers")) {
    return (
      `${trigger} you'll probably want a ${names[0]}. ` +
      (names.length > 1
        ? `I can also prepare ${names.slice(1).join(" or ")}. `
        : "") +
      "Would you like me to create that for you?"
    );
  }

  const bullet = names.map((n) => `• ${n}`).join("\n");
  return (
    `${trigger}\n\n` +
    `The next things most organizers usually create are:\n${bullet}\n\n` +
    `Would you like me to build one?`
  );
}

/** Map Event Record section fills → ecosystem signals */
export function signalsFromEventSections(input: {
  outcomes?: string;
  audience?: string;
  purpose?: string;
  dates?: string;
  venue?: string;
  budget?: string;
  format?: string;
  filledSectionIds?: readonly string[];
}): string[] {
  const signals: string[] = ["ecosystem_started"];
  if (input.outcomes?.trim()) signals.push("outcomes");
  if (input.audience?.trim()) signals.push("audience");
  if (input.purpose?.trim()) signals.push("purpose");
  if (input.dates?.trim()) signals.push("dates");
  if (input.venue?.trim()) signals.push("venue");
  if (input.budget?.trim()) signals.push("budget");
  if (input.format && input.format !== "unspecified") signals.push("format");
  for (const id of input.filledSectionIds ?? []) {
    signals.push(id);
  }
  return [...new Set(signals)];
}
