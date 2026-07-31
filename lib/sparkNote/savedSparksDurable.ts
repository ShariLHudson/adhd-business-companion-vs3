/**
 * Durable "Save This Spark" service (Slice 1).
 *
 * Bridges the Spark Card UI to the verified durable-record foundation
 * (companion_member_records, domain "saved_spark"). localStorage is only an
 * optimistic/offline cache; the durable record is the source of truth. A
 * "Saved to your collection" claim is returned ONLY after a verified durable
 * write (receipt.ok && receipt.durable). On failure, the local cache is
 * retained and a calm, retryable message is surfaced instead.
 *
 * Today's Spark selection and card presentation are untouched by this module.
 */

import { isSavedSparkDurableEnabled } from "@/lib/durableRecords/flags";
import {
  listSavedSparkDurable,
  softDeleteSavedSparkDurable,
  upsertSavedSparkDurable,
  type SavedSparkPayload,
} from "@/lib/durableRecords/domains/savedSpark";
import { DURABLE_ERROR } from "@/lib/durableRecords/types";
import {
  ensureSparkFavoriteLocal,
  getFavoriteSparkIds,
  getSparkFavoriteSavedAtMap,
  removeSparkFavoriteLocal,
} from "./persistence";
import {
  buildMySparkSavedItem,
  resolveMySparksCollection,
  type MySparkSavedItem,
} from "./mySparksCollection";
import type { SparkNoteCategory, SparkNoteDailyCard } from "./types";

export const SAVED_SPARK_SAVED_COPY = "Saved to your collection";
export const SAVED_SPARK_REMOVED_COPY = "Removed from your collection";

/**
 * The truthful outcome of a save/unsave. `confirmed` is the single gate the UI
 * uses: for a save it means the interface may show "Saved to your collection";
 * for a remove it means the item is gone. `durable` records whether the outcome
 * was verified against Supabase (false only on the offline/kill-switch path).
 */
export type SavedSparkClaim = {
  confirmed: boolean;
  durable: boolean;
  message: string;
  retryable: boolean;
};

type SparkSaveInput = Pick<
  SparkNoteDailyCard,
  "id" | "title" | "category" | "categoryLabel"
>;

function toPayload(card: SparkSaveInput, savedAtIso: string): SavedSparkPayload {
  return {
    sparkId: card.id,
    savedAtIso,
    title: card.title,
    category: card.category,
    categoryLabel: card.categoryLabel,
  };
}

/**
 * Save a Spark. Always updates the optimistic local cache; when durable is
 * enabled, only a verified durable write yields a "saved" claim.
 */
export async function saveSparkDurable(
  card: SparkSaveInput,
): Promise<SavedSparkClaim> {
  const savedAtIso = new Date().toISOString();
  // Optimistic/offline cache — never the success signal.
  ensureSparkFavoriteLocal(card.id, savedAtIso);

  if (!isSavedSparkDurableEnabled()) {
    return {
      confirmed: true,
      durable: false,
      message: SAVED_SPARK_SAVED_COPY,
      retryable: false,
    };
  }

  const receipt = await upsertSavedSparkDurable(toPayload(card, savedAtIso));
  if (receipt.ok && receipt.durable) {
    return {
      confirmed: true,
      durable: true,
      message: SAVED_SPARK_SAVED_COPY,
      retryable: false,
    };
  }
  // Durable write failed — keep the local cache, tell the truth.
  return {
    confirmed: false,
    durable: false,
    message: receipt.message,
    retryable: receipt.retryable,
  };
}

/** Remove a saved Spark. Clears the local cache only after a verified unsave. */
export async function removeSparkDurable(
  sparkId: string,
): Promise<SavedSparkClaim> {
  if (!isSavedSparkDurableEnabled()) {
    removeSparkFavoriteLocal(sparkId);
    return {
      confirmed: true,
      durable: false,
      message: SAVED_SPARK_REMOVED_COPY,
      retryable: false,
    };
  }

  const receipt = await softDeleteSavedSparkDurable(sparkId);
  const alreadyGone =
    !receipt.ok && receipt.errorCode === DURABLE_ERROR.NOT_FOUND;
  if ((receipt.ok && receipt.durable) || alreadyGone) {
    removeSparkFavoriteLocal(sparkId);
    return {
      confirmed: true,
      durable: true,
      message: SAVED_SPARK_REMOVED_COPY,
      retryable: false,
    };
  }
  // Unsave failed — keep the item; surface a calm, retryable message.
  return {
    confirmed: false,
    durable: false,
    message: receipt.message,
    retryable: receipt.retryable,
  };
}

function snapshotToItem(payload: SavedSparkPayload): MySparkSavedItem | null {
  if (!payload.title || !payload.categoryLabel) return null;
  return {
    id: payload.sparkId,
    category: payload.category as SparkNoteCategory,
    categoryLabel: payload.categoryLabel,
    title: payload.title,
    shortTitle: payload.title,
    teaser: "",
    savedAtIso: payload.savedAtIso,
  };
}

export type MySparksCollectionLoad = {
  items: MySparkSavedItem[];
  source: "durable" | "local";
};

/**
 * Durable-first collection load. Lists the member's durable saved Sparks,
 * hydrates each from the live catalog (snapshot fallback), then merges any
 * local-only ids (offline/pending saves). Falls back entirely to the local
 * cache when durable is disabled or unavailable.
 */
export async function loadMySparksCollection(): Promise<MySparksCollectionLoad> {
  if (!isSavedSparkDurableEnabled()) {
    return { items: resolveMySparksCollection(), source: "local" };
  }

  try {
    const durable = await listSavedSparkDurable();
    const byId = new Map<string, MySparkSavedItem>();
    for (const payload of durable) {
      const item =
        buildMySparkSavedItem(payload.sparkId, payload.savedAtIso) ??
        snapshotToItem(payload);
      if (item) byId.set(payload.sparkId, item);
    }

    // Merge local-only ids not yet (or not) durable so nothing the member saved
    // on this device disappears from view.
    const savedAt = getSparkFavoriteSavedAtMap();
    for (const id of getFavoriteSparkIds()) {
      if (byId.has(id)) continue;
      const item = buildMySparkSavedItem(id, savedAt[id] ?? null);
      if (item) byId.set(id, item);
    }

    return { items: [...byId.values()], source: "durable" };
  } catch {
    return { items: resolveMySparksCollection(), source: "local" };
  }
}
