"use client";

import { useMemo, useState } from "react";
import {
  listCompatiblePreviousWork,
  type PreviousWorkBrowserItem,
} from "@/lib/universalBlueprintInterface";

type Props = {
  workTypeId: string;
  onConfirm: (input: {
    source: PreviousWorkBrowserItem;
    approvedSectionIds: string[];
  }) => void;
  onBack?: () => void;
};

/**
 * Selective reuse from compatible previous Work — original unchanged.
 */
export function BuildFromPreviousWorkPanel({
  workTypeId,
  onConfirm,
  onBack,
}: Props) {
  const items = useMemo(
    () => listCompatiblePreviousWork(workTypeId),
    [workTypeId],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.workId === selectedId) ?? null;
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  return (
    <section
      className="ubi-root"
      data-testid="ubi-build-from-previous"
      aria-labelledby="ubi-previous-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="ubi-previous-heading" className="text-xl">
            Build From Previous Work
          </h2>
          <p className="ubi-muted mt-1">
            Choose what to reuse. Dates, private notes, and completed-only
            details stay out unless you include them.
          </p>
        </div>
        {onBack ? (
          <button type="button" className="ubi-secondary" onClick={onBack}>
            Back
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="ubi-muted mt-4" data-testid="ubi-previous-empty">
          No compatible previous work yet. Start from a Blueprint, or from
          scratch.
        </p>
      ) : (
        <ul className="ubi-list mt-4">
          {items.map((item) => (
            <li key={item.workId}>
              <button
                type="button"
                className="ubi-list-item"
                aria-selected={selectedId === item.workId}
                data-testid={`ubi-previous-${item.workId}`}
                onClick={() => {
                  setSelectedId(item.workId);
                  const next: Record<string, boolean> = {};
                  for (const id of item.reusableSectionIds) next[id] = true;
                  setApproved(next);
                }}
              >
                <span className="block font-semibold">{item.title}</span>
                <span className="ubi-muted mt-1 block">
                  From {item.blueprintTitle}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <div className="ubi-panel mt-4" data-testid="ubi-previous-sections">
          <p className="font-semibold">Sections to reuse</p>
          <p className="ubi-muted mt-1">
            Source work stays unchanged. Provenance is kept on the new Work.
          </p>
          <ul className="mt-3 space-y-2">
            {selected.reusableSectionIds.map((id, index) => (
              <li key={id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(approved[id])}
                    data-testid={`ubi-previous-section-${id}`}
                    onChange={(e) =>
                      setApproved((prev) => ({
                        ...prev,
                        [id]: e.target.checked,
                      }))
                    }
                  />
                  {selected.reusableSectionTitles[index] ?? id}
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="ubi-primary mt-4"
            data-testid="ubi-previous-confirm"
            onClick={() =>
              onConfirm({
                source: selected,
                approvedSectionIds: selected.reusableSectionIds.filter(
                  (id) => approved[id],
                ),
              })
            }
          >
            Create new Work from selection
          </button>
        </div>
      ) : null}
    </section>
  );
}
