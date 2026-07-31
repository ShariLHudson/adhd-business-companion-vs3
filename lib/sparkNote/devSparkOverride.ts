/**
 * TEMPORARY PREVIEW-ONLY SPARK OVERRIDE — REMOVE AFTER ACCEPTANCE.
 *
 * Forces the daily-gift full card to open a single catalog Spark by id so the
 * canonical card-shell can be seen with a clearly different, topic-matched Spark
 * in the actual Vercel Preview. It ONLY swaps the card handed to the
 * presentational component at render time — it never touches the saved daily
 * pin, catalog data, selection, or persistence.
 *
 * Scope guard: active on Preview and local only. It is a hard no-op when
 * NEXT_PUBLIC_VERCEL_ENV === "production", and this file lives on the Preview
 * branch only (it is never merged to production). Set OVERRIDE_ID to null or
 * delete this file + its caller to restore normal pinned-daily behavior.
 */
import { findCatalogCardById } from "./evaluateDailySparkNote";
import type { SparkNoteDailyCard } from "./types";

/** Catalog Spark id to force in Preview; null = disabled. */
const OVERRIDE_ID: string | null = "SPARK-INV-002";

function overrideActive(): boolean {
  if (!OVERRIDE_ID) return false;
  // Off in the unit-test runner so the normal-pin assertions stay green.
  if (process.env.NODE_ENV === "test") return false;
  // Never in production — Preview and local development only.
  return process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
}

export function applySparkTestOverride(
  card: SparkNoteDailyCard,
): SparkNoteDailyCard {
  if (!overrideActive() || !OVERRIDE_ID) return card;
  return findCatalogCardById(OVERRIDE_ID) ?? card;
}
