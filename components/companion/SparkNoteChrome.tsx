"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { evaluateDailySparkNote } from "@/lib/sparkNote/evaluateDailySparkNote";
import { recordSparkNoteCompleted, recordSparkNoteViewed } from "@/lib/sparkNote/persistence";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { SparkNoteAnchor } from "./SparkNoteAnchor";
import { SparkNoteExpanded } from "./SparkNoteExpanded";
import { SparkNoteMyCollection } from "./SparkNoteMyCollection";

type Props = {
  visible: boolean;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
};

type SparkView = "collapsed" | "expanded" | "collection";

/**
 * Portaled Spark Note™ chrome — collapsed card (bottom right) + expanded story.
 * Fixed to the viewport; separate from Estate navigation and chat routing.
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
  const [view, setView] = useState<SparkView>("collapsed");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (view === "collapsed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setView(view === "collection" ? "expanded" : "collapsed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  const { card } = useMemo(
    () =>
      evaluateDailySparkNote({
        firstName,
        birthday,
        personalDates,
        memberSinceIso,
        region,
      }),
    [firstName, birthday, personalDates, memberSinceIso, region],
  );

  function handleExpand() {
    if (card) {
      recordSparkNoteViewed(card.id);
      recordSparkNoteCompleted(card.id);
    }
    setView("expanded");
  }

  if (!mounted || !visible || !card) return null;

  return createPortal(
    <>
      {view === "collapsed" ? (
        <SparkNoteAnchor card={card} onExpand={handleExpand} />
      ) : null}
      {view === "expanded" ? (
        <SparkNoteExpanded
          card={card}
          onClose={() => setView("collapsed")}
          onOpenCollection={() => setView("collection")}
        />
      ) : null}
      {view === "collection" ? (
        <SparkNoteMyCollection
          onBack={() => setView("expanded")}
          onClose={() => setView("collapsed")}
        />
      ) : null}
    </>,
    document.body,
  );
}
