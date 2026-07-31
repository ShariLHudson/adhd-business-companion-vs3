"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { SparkNoteAnchor } from "./SparkNoteAnchor";

type Props = {
  visible: boolean;
  /** Accepted for compatibility; not used this slice (teaser is Estate-wide). */
  isWelcomeHome?: boolean;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /** Accepted for compatibility; intentionally NOT invoked this slice. */
  onOpenTodaysSpark?: () => void;
};

/**
 * Today's Spark teaser — size/placement correction slice.
 *
 * Renders ONE small (~88px) bottom-right teaser across Estate screens. For this
 * slice it is deliberately never dismissed (so size/placement can be retested)
 * and clicking is a no-op test log — it does NOT route to the old Spark Card,
 * Personal Library, or the gift room. Routing/dismissal return in a later slice.
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Anchor the teaser above the chat composer (bottom-center layer), not the
  // raw viewport bottom, so it never overlaps the chat input / mic / Send.
  // Publishes --spark-teaser-bottom = (distance from viewport bottom to the
  // composer's top) + gap, and re-measures when the composer resizes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const GAP = 20; // ~16-24px clear gap above the composer
    const CHAT_SELECTOR = '[data-companion-chat-layer="true"]';
    let raf = 0;
    let tries = 0;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;

    function measure() {
      const chat = document.querySelector<HTMLElement>(CHAT_SELECTOR);
      // Fallback: a small safe gap from the viewport bottom.
      let bottomPx = 24;
      if (chat) {
        const rect = chat.getBoundingClientRect();
        if (rect.height > 0) {
          bottomPx = Math.max(24, window.innerHeight - rect.top + GAP);
        }
      }
      document.documentElement.style.setProperty(
        "--spark-teaser-bottom",
        `${bottomPx}px`,
      );
    }

    function attach() {
      measure(); // always set the variable immediately (measured or fallback)
      const chat = document.querySelector(CHAT_SELECTOR);
      if (chat) {
        ro?.observe(chat);
      } else if (tries++ < 40) {
        raf = requestAnimationFrame(attach); // wait for the composer to mount
      }
    }

    attach();
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      document.documentElement.style.removeProperty("--spark-teaser-bottom");
    };
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
    // Teaser correction slice: verify size/placement only. Routing is
    // intentionally disabled here — do NOT open the Spark Card, Personal
    // Library, or gift room. (Wired in a later slice.)
    if (typeof console !== "undefined") {
      console.debug("[todays-spark-teaser] clicked — routing disabled this slice");
    }
  }

  // Estate-wide; never dismissed this slice so the size/placement can be retested.
  if (!mounted || !visible || !card) return null;

  return createPortal(
    <SparkNoteAnchor card={card} onExpand={handleOpen} />,
    document.body,
  );
}
