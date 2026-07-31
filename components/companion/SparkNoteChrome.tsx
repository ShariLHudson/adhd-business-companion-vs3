"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import {
  isHomeTeaserDismissedToday,
  recordSparkNoteCompleted,
  recordSparkNoteViewed,
} from "@/lib/sparkNote/persistence";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { SparkNoteAnchor } from "./SparkNoteAnchor";

type Props = {
  visible: boolean;
  /** Welcome Home only — the teaser appears on the home surface. */
  isWelcomeHome?: boolean;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /** Opens My Personal Library in Today's Spark arrival mode. */
  onOpenTodaysSpark?: () => void;
};

/**
 * Welcome Home Today's Spark teaser (bottom-right). Appears once per local
 * calendar day; the first successful click opens My Personal Library in Today's
 * Spark arrival mode and dismisses the teaser for the rest of the day. It
 * returns the next day. Today's Spark remains reachable inside My Personal
 * Library after the teaser is gone. This never changes the pinned daily Spark.
 */
export function SparkNoteChrome({
  visible,
  isWelcomeHome = false,
  firstName,
  birthday,
  personalDates,
  memberSinceIso,
  region,
  onOpenTodaysSpark,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { card } = useMemo(
    () =>
      resolveDailySparkCard({
        firstName,
        birthday,
        personalDates,
        memberSinceIso,
        region,
      }),
    [firstName, birthday, personalDates, memberSinceIso, region],
  );

  function handleOpen() {
    if (card) {
      recordSparkNoteViewed(card.id);
      recordSparkNoteCompleted(card.id);
    }
    // Navigate to Personal Library (daily-arrival). The teaser is marked opened
    // for the day ONLY once the room actually opens (PersonalLibraryRoom arrival),
    // not here — so a failed navigation never loses the day's teaser.
    onOpenTodaysSpark?.();
  }

  // Dismissal is read at render time (not cached) so returning to Welcome Home
  // after the room dismissed it keeps the teaser hidden for the rest of the day.
  if (
    !mounted ||
    !visible ||
    !isWelcomeHome ||
    !card ||
    isHomeTeaserDismissedToday()
  ) {
    return null;
  }

  return createPortal(
    <SparkNoteAnchor card={card} onExpand={handleOpen} />,
    document.body,
  );
}
