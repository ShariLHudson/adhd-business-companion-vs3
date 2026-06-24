"use client";

import type { MyWorkHubItem } from "@/lib/myWorkHub";
import { buildVisualThinkingByCategory } from "@/lib/myWorkHub";

export function VisualThinkingMyWorkBrowse({
  onOpenMap,
  onBack,
}: {
  onOpenMap: (mapId: string, preferGenerated: boolean) => void;
  onBack?: () => void;
}) {
  const categories = buildVisualThinkingByCategory();

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="visual-thinking-saved-browse">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#1f1c19]">Visual Thinking™</h2>
          <p className="mt-1 text-sm text-[#6b635a]">
            Intentionally saved and archived maps — pinned favorites appear at the top of Saved™.
          </p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-sm font-semibold text-[#2f261f]"
          >
            ← Back
          </button>
        ) : null}
      </div>

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#e7dfd4] bg-[#faf7f2] px-4 py-8 text-center text-sm text-[#6b635a]">
          Nothing saved here yet. Use Save on a map when the insight is worth keeping.
        </p>
      ) : (
        <div className="space-y-6 overflow-y-auto">
          {categories.map((category) => (
            <section key={category.label}>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1e4f4f]">
                {category.label}
              </h3>
              <ul className="space-y-2">
                {category.items.map((item: MyWorkHubItem) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMap(
                          item.openTarget.kind === "visual-focus"
                            ? item.openTarget.mapId
                            : item.id.replace(/^visual-focus:/, ""),
                          item.openTarget.kind === "visual-focus"
                            ? Boolean(item.openTarget.preferGenerated)
                            : true,
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left hover:bg-[#faf7f2]"
                    >
                      <span>
                        <span className="block font-semibold text-[#1f1c19]">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#6b635a]">
                          {item.relativeDate ?? item.date}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-[#1e4f4f]">Open →</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
