"use client";

import { useMemo } from "react";
import {
  buildCreateInspiration,
  type CreateInspirationItem,
} from "@/lib/startupFriction";

export function CreateInspirationLayer({
  onPick,
  onOpenSavedWork,
}: {
  onPick: (item: CreateInspirationItem) => void;
  onOpenSavedWork?: (savedWorkId: string) => void;
}) {
  const items = useMemo(() => buildCreateInspiration(), []);

  if (!items.length) return null;

  const recent = items.filter((i) => i.kind === "recent" || i.kind === "draft");
  const suggestions = items.filter((i) => i.kind === "suggestion");

  function handleClick(item: CreateInspirationItem) {
    if (item.savedWorkId && onOpenSavedWork) {
      onOpenSavedWork(item.savedWorkId);
      return;
    }
    onPick(item);
  }

  return (
    <div className="mb-4" data-testid="create-inspiration-layer">
      {recent.length > 0 ? (
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Recent
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {recent.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleClick(item)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#e4ddd2] bg-[#faf7f2] px-3 py-2 text-left text-sm hover:border-[#1e4f4f]/30"
                >
                  <span className="font-medium text-[#1f1c19]">
                    {item.kind === "draft" ? "✏️ " : ""}
                    {item.title}
                  </span>
                  <span className="text-xs text-[#6b635a]">
                    {item.artifactType}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Suggestions
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleClick(item)}
                  className="rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f8f8]"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
