"use client";

import { useMemo, useState } from "react";
import {
  proposeKnownContextReuse,
  type KnownContextReuseDecision,
} from "@/lib/universalBlueprintInterface";

type Props = {
  blueprintId: string;
  knownContext: Readonly<Record<string, string>>;
  inferredKeys?: readonly string[];
  onConfirm: (decision: KnownContextReuseDecision) => void;
  onSkipAll: () => void;
  onBack?: () => void;
};

/**
 * Review known information before it is applied to new Work.
 */
export function KnownContextReuseReview({
  blueprintId,
  knownContext,
  inferredKeys = [],
  onConfirm,
  onSkipAll,
  onBack,
}: Props) {
  const proposals = useMemo(
    () =>
      proposeKnownContextReuse({
        blueprintId,
        knownContext,
        inferredKeys,
      }),
    [blueprintId, knownContext, inferredKeys],
  );

  const [approved, setApproved] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const p of proposals) {
      init[p.key] = !p.confidential;
    }
    return init;
  });
  const [edited, setEdited] = useState<Record<string, string>>({});

  if (proposals.length === 0) {
    return (
      <section className="ubi-root" data-testid="ubi-known-context-empty">
        <h2 className="text-xl">Ready to begin</h2>
        <p className="ubi-muted mt-2">
          Nothing from your known context needs review for this Blueprint.
        </p>
        <button
          type="button"
          className="ubi-primary mt-4"
          data-testid="ubi-known-context-continue-empty"
          onClick={onSkipAll}
        >
          Begin
        </button>
      </section>
    );
  }

  return (
    <section
      className="ubi-root"
      data-testid="ubi-known-context-review"
      aria-labelledby="ubi-reuse-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="ubi-reuse-heading" className="text-xl">
            Reuse what we already know?
          </h2>
          <p className="ubi-muted mt-1">
            Approve, edit, or decline each item. Nothing is applied without your
            say-so.
          </p>
        </div>
        {onBack ? (
          <button type="button" className="ubi-secondary" onClick={onBack}>
            Back
          </button>
        ) : null}
      </div>

      <ul className="ubi-list mt-4">
        {proposals.map((p) => (
          <li key={p.key} className="ubi-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{p.label}</p>
                {p.inferred ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7f72]">
                    Inferred — please confirm
                  </p>
                ) : null}
                {p.confidential ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8b3a2b]">
                    Sensitive — only if you approve
                  </p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(approved[p.key])}
                  data-testid={`ubi-reuse-approve-${p.key}`}
                  onChange={(e) =>
                    setApproved((prev) => ({
                      ...prev,
                      [p.key]: e.target.checked,
                    }))
                  }
                />
                Use this
              </label>
            </div>
            <label className="mt-2 block">
              <span className="sr-only">Edit {p.label}</span>
              <input
                className="ubi-field"
                value={edited[p.key] ?? p.value}
                data-testid={`ubi-reuse-edit-${p.key}`}
                onChange={(e) =>
                  setEdited((prev) => ({ ...prev, [p.key]: e.target.value }))
                }
              />
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="ubi-primary"
          data-testid="ubi-reuse-confirm"
          onClick={() => {
            const approvedKeys = proposals
              .filter((p) => approved[p.key])
              .map((p) => p.key);
            const declinedKeys = proposals
              .filter((p) => !approved[p.key])
              .map((p) => p.key);
            onConfirm({
              approvedKeys,
              declinedKeys,
              editedValues: edited,
            });
          }}
        >
          Use selected
        </button>
        <button
          type="button"
          className="ubi-secondary"
          data-testid="ubi-reuse-decline-all"
          onClick={onSkipAll}
        >
          Start without reuse
        </button>
      </div>
    </section>
  );
}
