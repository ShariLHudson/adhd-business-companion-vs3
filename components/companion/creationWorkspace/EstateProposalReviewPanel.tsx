"use client";

import { useMemo, useState } from "react";
import {
  applyApprovedEstateProposals,
  cancelEstateHandoff,
  resolveDestinationReturnActions,
  setEstateProposalApproval,
  type CreationWorkspaceEstateHandoff,
} from "@/lib/creationWorkspace";

type Props = {
  handoff: CreationWorkspaceEstateHandoff;
  onApplied: (fieldIds: string[]) => void;
  onCancel: () => void;
  onReturnToCreationWorkspace?: (workspaceId: string) => void;
};

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white shadow-md hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";

export function EstateProposalReviewPanel({
  handoff: initial,
  onApplied,
  onCancel,
  onReturnToCreationWorkspace,
}: Props) {
  const [handoff, setHandoff] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const returns = useMemo(
    () =>
      resolveDestinationReturnActions({
        returnContext: handoff.returnContext,
        researchCollectionIds: handoff.researchCollectionIds,
      }),
    [handoff],
  );

  function apply() {
    setError(null);
    const result = applyApprovedEstateProposals(handoff);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onApplied(result.applied.map((p) => p.id));
  }

  return (
    <section
      className="relative flex h-full min-h-0 w-full flex-col overflow-auto bg-[linear-gradient(160deg,#f7f1e8_0%,#efe6d8_45%,#e7ddd0_100%)] px-4 py-5 text-[#2f2a24] sm:px-6"
      data-testid="estate-proposal-review"
      aria-label="Business Estate proposal review"
    >
      <header className="mb-4 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#6b6358]">
          Business Estate Proposals
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Review proposed truth
        </h1>
        <p className="mt-2 text-sm text-[#6b6358]">
          Field-level approval is required. Nothing authoritative changes without
          your say-so.
        </p>
      </header>

      <div className="flex max-w-3xl flex-col gap-3">
        {handoff.proposals.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-[#d4cdc3] bg-white/70 p-4 shadow-sm"
          >
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={p.approved}
                onChange={(e) =>
                  setHandoff(
                    setEstateProposalApproval(handoff, p.id, e.target.checked),
                  )
                }
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium uppercase tracking-wide text-[#6b6358]">
                  {p.proposalType.replace(/_/g, " ")} · {p.destinationField}
                </span>
                <span className="mt-2 block text-sm">
                  <span className="font-semibold">Current:</span>{" "}
                  {p.currentValue?.trim() || "—"}
                </span>
                <span className="mt-1 block whitespace-pre-wrap text-sm">
                  <span className="font-semibold">Proposed:</span> {p.proposedValue}
                </span>
                {p.sourceEvidence.length > 0 && (
                  <span className="mt-2 block text-xs text-[#6b6358]">
                    Evidence: {p.sourceEvidence.join("; ")}
                  </span>
                )}
              </span>
            </label>
          </article>
        ))}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className={BTN_PRIMARY} onClick={apply}>
            Apply Approved Fields
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              cancelEstateHandoff(handoff);
              onCancel();
            }}
          >
            Cancel
          </button>
          {returns.map((action) => (
            <button
              key={action.id}
              type="button"
              className={BTN_SECONDARY}
              onClick={() => {
                if (
                  action.id === "return_to_creation_workspace" &&
                  action.workspaceId
                ) {
                  onReturnToCreationWorkspace?.(action.workspaceId);
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
