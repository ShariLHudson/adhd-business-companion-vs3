"use client";

import { useMemo, useState } from "react";
import {
  approveSelectedStrategyCandidates,
  cancelStrategyHandoff,
  resolveDestinationReturnActions,
  updateStrategyCandidate,
  type CreationWorkspaceStrategyCandidate,
  type CreationWorkspaceStrategyHandoff,
} from "@/lib/creationWorkspace";

type Props = {
  handoff: CreationWorkspaceStrategyHandoff;
  onApproved: (approvedIds: string[]) => void;
  onCancel: () => void;
  onReturnToCreationWorkspace?: (workspaceId: string) => void;
};

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white shadow-md hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";

function CandidateList({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: CreationWorkspaceStrategyCandidate[];
  onToggle: (id: string, selected: boolean) => void;
}) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl border border-[#d4cdc3] bg-white/70 p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((c) => (
          <li key={c.id} className="rounded-xl border border-[#e6dfd5] bg-[#fbf8f3] p-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={c.selected}
                onChange={(e) => onToggle(c.id, e.target.checked)}
              />
              <span>
                <span className="block font-medium">{c.title}</span>
                {c.body ? (
                  <span className="mt-1 block text-sm text-[#4b463f]">{c.body}</span>
                ) : null}
                {c.approved ? (
                  <span className="mt-1 block text-xs font-semibold text-[#1e4f4f]">
                    Approved
                  </span>
                ) : (
                  <span className="mt-1 block text-xs text-[#6b6358]">
                    Candidate — not part of the plan until approved
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StrategyCandidateReviewPanel({
  handoff: initial,
  onApproved,
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

  function toggle(id: string, selected: boolean) {
    setHandoff(updateStrategyCandidate(handoff, id, { selected }));
  }

  function approve() {
    setError(null);
    const result = approveSelectedStrategyCandidates(handoff);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setHandoff(result.handoff);
    onApproved(result.approvedIds);
  }

  return (
    <section
      className="relative flex h-full min-h-0 w-full flex-col overflow-auto bg-[linear-gradient(160deg,#f7f1e8_0%,#efe6d8_45%,#e7ddd0_100%)] px-4 py-5 text-[#2f2a24] sm:px-6"
      data-testid="strategy-candidate-review"
      aria-label="Strategic proposal review"
    >
      <header className="mb-4 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#6b6358]">
          Strategic Proposal
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {handoff.strategicQuestion}
        </h1>
        <p className="mt-2 text-base text-[#4b463f]">
          Objective: {handoff.objective}
        </p>
        <p className="mt-2 text-sm text-[#6b6358]">
          These are candidates only. Nothing becomes approved strategy until you
          confirm.
        </p>
      </header>

      <div className="flex max-w-3xl flex-col gap-3">
        <CandidateList title="Evidence" items={handoff.evidence} onToggle={toggle} />
        <CandidateList
          title="Assumptions"
          items={handoff.assumptions}
          onToggle={toggle}
        />
        <CandidateList title="Options" items={handoff.options} onToggle={toggle} />
        <CandidateList
          title="Tradeoffs"
          items={handoff.tradeoffs}
          onToggle={toggle}
        />
        <CandidateList title="Risks" items={handoff.risks} onToggle={toggle} />
        <CandidateList
          title="Decision criteria"
          items={handoff.decisionCriteria}
          onToggle={toggle}
        />
        <CandidateList
          title="Proposed priorities"
          items={handoff.proposedPriorities}
          onToggle={toggle}
        />
        <CandidateList
          title="Possible initiatives"
          items={handoff.possibleInitiatives}
          onToggle={toggle}
        />
        <CandidateList
          title="Possible measures"
          items={handoff.possibleMeasures}
          onToggle={toggle}
        />
        <CandidateList
          title="Unresolved questions"
          items={handoff.unresolvedQuestions}
          onToggle={toggle}
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className={BTN_PRIMARY} onClick={approve}>
            Approve Selected Candidates
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              cancelStrategyHandoff(handoff);
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
