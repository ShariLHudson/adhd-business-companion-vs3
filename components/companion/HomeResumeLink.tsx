"use client";

import { useMemo, useState } from "react";
import {
  dismissHomeResumeForSession,
  findLatestHomeResumeItem,
  isHomeResumeDismissedForSession,
  type HomeResumeItem,
} from "@/lib/homeResumeItem";

export function HomeResumeLink({
  onResume,
  refreshKey = 0,
}: {
  onResume: (item: HomeResumeItem) => void;
  /** Bump when workspace or activity state changes. */
  refreshKey?: string | number;
}) {
  const item = useMemo(
    () => findLatestHomeResumeItem(),
    [refreshKey],
  );
  const [dismissedId, setDismissedId] = useState<string | null>(() =>
    item && isHomeResumeDismissedForSession(item.id) ? item.id : null,
  );

  if (!item || dismissedId === item.id) return null;

  function handleNotNow() {
    dismissHomeResumeForSession(item!.id);
    setDismissedId(item!.id);
  }

  return (
    <div className="mt-2.5 text-center">
      <div
        className="mx-auto inline-block max-w-md rounded-2xl bg-[#f5f1ea]/80 px-3.5 py-2.5 text-left"
        role="region"
        aria-label="Resume where you left off"
      >
        <p className="text-sm font-medium leading-snug text-[#5c554c]">
          <span aria-hidden="true">🔄 </span>
          Resume Where You Left Off
        </p>
        <p className="mt-1 text-sm leading-snug text-[#1f1c19]">
          <span className="font-semibold">{item.title}</span>
          <span className="text-[#6b635a]">
            {" "}
            · Next: {item.nextStep}
          </span>
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <button
            type="button"
            onClick={() => onResume(item)}
            className="rounded-full bg-[#1e4f4f]/12 px-3.5 py-1 text-xs font-semibold text-[#1e4f4f] transition-colors hover:bg-[#1e4f4f]/18"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={handleNotNow}
            className="rounded-full px-3.5 py-1 text-xs font-semibold text-[#6b635a] transition-colors hover:bg-[#1e4f4f]/06 hover:text-[#4a433c]"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
