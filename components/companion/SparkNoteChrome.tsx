"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import {
  dismissHomeTeaserToday,
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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(isHomeTeaserDismissedToday());
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
    dismissHomeTeaserToday();
    setDismissed(true);
    onOpenTodaysSpark?.();
  }

  if (!mounted || !visible || !isWelcomeHome || dismissed || !card) return null;

  return createPortal(
    <SparkNoteAnchor card={card} onExpand={handleOpen} />,
    document.body,
  );
}
