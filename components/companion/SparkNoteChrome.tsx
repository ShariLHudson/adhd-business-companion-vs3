"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import { resolvePinnedDailySparkCard } from "@/lib/sparkNote/evaluateDailySparkNote";
import {
  dismissHomeTeaserToday,
  isHomeTeaserDismissedToday,
} from "@/lib/sparkNote/persistence";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { SparkNoteAnchor } from "./SparkNoteAnchor";
import { TodaysSparkGiftRoom } from "./TodaysSparkGiftRoom";
import { TodaysSparkCardShell } from "./TodaysSparkCardShell";

type Props = {
  visible: boolean;
  /** Accepted for compatibility; the teaser is Estate-wide. */
  isWelcomeHome?: boolean;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /** Accepted for compatibility; not used (teaser opens the gift room). */
  onOpenTodaysSpark?: () => void;
};

/**
 * Today's Spark flow:
 *   small Estate-wide teaser  →  gift room (daily-arrival)  →  full Spark Card.
 *
 * The full card is the exact pinned daily Spark (resolvePinnedDailySparkCard
 * returns the day's stored pick — no swap/regeneration) rendered by
 * TodaysSparkCardShell in the approved card-shell style (correct image, complete
 * content, durable Save This Spark). Closing the card returns to the gift room.
 * The small teaser stays visible until the full card has opened successfully,
 * then is dismissed for the day.
 */
export function SparkNoteChrome({
  visible,
  firstName,
  birthday,
  personalDates,
  memberSinceIso,
  region,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [giftRoomOpen, setGiftRoomOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTeaserDismissed(isHomeTeaserDismissedToday());
  }, []);

  // Dismiss the small teaser ONLY after the full Spark Card has opened.
  useEffect(() => {
    if (cardOpen) {
      dismissHomeTeaserToday();
      setTeaserDismissed(true);
    }
  }, [cardOpen]);

  const card = useMemo(() => {
    const inputs = {
      firstName,
      birthday,
      personalDates,
      memberSinceIso,
      region,
    };
    // Use the EXACT pinned daily Spark (canonical by-id resolver). Only
    // establish today's pin on first load; never swap to a different/fallback
    // Spark at gift-click time.
    return resolvePinnedDailySparkCard(inputs) ?? resolveDailySparkCard(inputs).card;
  }, [firstName, birthday, personalDates, memberSinceIso, region]);

  if (!mounted) return null;
  const showTeaser = visible && Boolean(card) && !teaserDismissed;

  return createPortal(
    <>
      {showTeaser ? (
        <SparkNoteAnchor card={card} onExpand={() => setGiftRoomOpen(true)} />
      ) : null}
      {giftRoomOpen ? (
        <TodaysSparkGiftRoom
          onClose={() => setGiftRoomOpen(false)}
          onGiftClick={() => setCardOpen(true)}
        />
      ) : null}
      {cardOpen && card ? (
        // Full pinned daily Spark Card in the approved card-shell style: correct
        // image + complete content + durable Save. Close returns to the gift room.
        <TodaysSparkCardShell card={card} onClose={() => setCardOpen(false)} />
      ) : null}
    </>,
    document.body,
  );
}
